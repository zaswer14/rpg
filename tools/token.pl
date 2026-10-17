#!/usr/bin/perl
# Theo dõi token từng việc trong một phiên Claude Code: mỗi lời nhắn của người dùng là một việc,
# gom mọi lượt gọi API sau nó (kể cả subagent) tới lời nhắn kế tiếp.
#
#   perl tools/token.pl              phiên mới nhất của repo: ghi log, in tóm tắt
#   perl tools/token.pl ID|FILE      phiên khác (đầu ID là đủ, hoặc đường dẫn .jsonl)
#   perl tools/token.pl --all        dựng lại log mọi phiên còn transcript
#   perl tools/token.pl --hook       hook Stop (.claude/settings.json): đọc transcript_path từ stdin, chỉ ghi file
#   perl tools/token.pl --ctx        hook UserPromptSubmit: context vượt 400k (đổi bằng TOKEN_CTX_NGUONG) thì nhắc mở chat mới
#
# Kết quả: logs/token/<ngày>_<id8>.md (tiến trình từng việc), logs/token/TONG.md (mọi việc mọi phiên).
# Chỉ dùng module có sẵn của perl (máy không có node / python).
use strict;
use warnings;
use utf8;
use JSON::PP;
use Cwd qw(abs_path);
use File::Basename qw(dirname basename);
use File::Path qw(make_path);
use Time::Local qw(timegm);
use POSIX qw(strftime);

binmode STDOUT, ':encoding(UTF-8)';

my $TZ = 7 * 3600;                         # giờ Việt Nam, kể cả khi chạy trên cloud (UTC)
# Hệ số giá so với 1 token đầu vào thường (Opus / Sonnet): ghi cache 5 phút 1,25; 1 giờ 2; đọc cache 0,1; đầu ra 5.
my %W = (in => 1, cw5 => 1.25, cw1h => 2, cr => 0.1, out => 5);

my $ROOT = dirname(dirname(abs_path(__FILE__)));
my $OUT  = "$ROOT/logs/token";

my $arg = shift // '';
my $hook = $arg eq '--hook';

if ($hook) {
  # Hook không được làm hỏng phiên: lỗi gì cũng nuốt, luôn thoát 0.
  eval {
    my $in = decode_json(do { local $/; <STDIN> } // '{}');
    my $p = $in->{transcript_path} or die "thiếu transcript_path\n";
    run(win2unix($p), 1);
  };
  exit 0;
}

if ($arg eq '--ctx') {
  # Hook UserPromptSubmit: context vượt ngưỡng (400k, rồi mỗi 150k) thì in lời nhắc, Claude nhận nó cùng lời nhắn.
  eval {
    my $in = decode_json(do { local $/; <STDIN> } // '{}');
    my $p = $in->{transcript_path} or die "thiếu transcript_path\n";
    my $ctx = last_ctx(win2unix($p)) or die "chưa có lượt nào\n";
    my ($base, $step) = ($ENV{TOKEN_CTX_NGUONG} || 400_000, 150_000);
    return if $ctx < $base;
    my $level = $base + $step * int(($ctx - $base) / $step);
    my $tmp = ($ENV{TEMP} // $ENV{TMPDIR} // '/tmp') =~ tr{\\}{/}r;
    my $mark = "$tmp/claude_ctx_" . ($in->{session_id} // 'x');
    my $last = 0;
    if (open my $fh, '<', $mark) { $last = <$fh> // 0; close $fh }
    return if $last >= $level;
    if (open my $fh, '>', $mark) { print $fh $level; close $fh }
    printf "[tools/token.pl] Context đoạn chat này đang ~%dk token (ngưỡng %dk): mỗi lượt từ giờ đều phải đọc lại chừng ấy. "
         . "Trước khi trả lời, nói ngắn với người dùng và đề nghị chuyển sang chat mới: đồng ý thì ghi file bàn giao theo skill ban-giao "
         . "(ban_giao/<việc>.md, viết từ những gì đã có, không đọc lại file) rồi bảo họ mở chat mới và nói \"làm tiếp\". "
         . "Người dùng muốn làm tiếp ở đây thì cứ làm.\n", $ctx / 1000, $base / 1000;
  };
  exit 0;
}

my $dir = proj_dir();
if ($arg eq '--all') {
  run($_, 1) for sort glob("$dir/*.jsonl");
  print "Đã dựng lại log ", scalar(() = glob("$dir/*.jsonl")), " phiên vào logs/token/.\n";
  exit 0;
}
my $file;
if ($arg && -f $arg) { $file = $arg }
elsif ($arg) { ($file) = glob("$dir/$arg*.jsonl"); die "Không thấy phiên $arg trong $dir\n" unless $file }
else {
  my @f = sort { (stat $b)[9] <=> (stat $a)[9] } glob("$dir/*.jsonl");
  $file = $f[0] or die "Không có transcript trong $dir\n";
}
run($file, 0);

# ---------------------------------------------------------------- đọc transcript

sub win2unix { my $p = shift; $p =~ s{\\}{/}g; $p =~ s{^([A-Za-z]):/}{'/' . lc($1) . '/'}e if $^O eq 'msys'; $p }

sub proj_dir {
  my $w = $ROOT;
  $w =~ s{^/([a-z])/}{uc($1) . ':/'}e;     # /e/BraveStar/rpg → E:/BraveStar/rpg (Git Bash)
  (my $slug = $w) =~ s/[^A-Za-z0-9]/-/g;
  my $home = $ENV{HOME} // $ENV{USERPROFILE};
  "$home/.claude/projects/$slug";
}

sub ts {                                    # ISO UTC → giây
  my $s = shift // return 0;
  my ($Y, $M, $D, $h, $m, $sec) = $s =~ /^(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)/ or return 0;
  timegm($sec, $m, $h, $D, $M - 1, $Y);
}
sub hhmm { $_[0] ? strftime('%H:%M', gmtime($_[0] + $TZ)) : '' }
sub ngay { $_[0] ? strftime('%Y-%m-%d', gmtime($_[0] + $TZ)) : '' }

sub read_jsonl {
  my ($f, $cb) = @_;
  open my $fh, '<:raw', $f or return;
  while (my $line = <$fh>) {
    # chỉ giải JSON dòng cần: lời nhắn, trả lời, tiêu đề (bỏ kết quả công cụ, đính kèm: phần lớn dung lượng)
    next unless $line =~ /"type":"(?:assistant|custom-title|summary)"/
             || ($line =~ /"type":"user"/ && $line !~ /"tool_use_id"/);
    my $j = eval { decode_json($line) } or next;
    $cb->($j);
  }
  close $fh;
}

sub last_ctx {                              # context của lượt gọi gần nhất ở luồng chính
  my $f = shift;
  open my $fh, '<:raw', $f or return;
  my $last;
  while (my $line = <$fh>) { $last = $line if $line =~ /"type":"assistant"/ && $line =~ /"usage"/ && $line !~ /"isSidechain":true/ }
  close $fh;
  my $j = eval { decode_json($last // '') } or return;
  my $t = usage_of($j->{message}{usage});
  $t->{in} + $t->{cr} + $t->{cw5} + $t->{cw1h} + $t->{out};
}

sub prompt_text {                           # lời nhắn thật của người dùng, hoặc undef
  my $j = shift;
  return if $j->{isMeta} || $j->{isSidechain};
  my $c = $j->{message}{content};
  my $t;
  if (!ref $c) { $t = $c }
  else {
    return if grep { ($_->{type} // '') eq 'tool_result' } @$c;
    $t = join ' ', map { $_->{text} // '' } grep { ($_->{type} // '') eq 'text' } @$c;
    $t = '[ảnh]' if $t eq '' && grep { ($_->{type} // '') eq 'image' } @$c;
  }
  return unless defined $t && $t =~ /\S/;
  if ($t =~ m{<command-name>(.*?)</command-name>}s) {
    my $cmd = $1;
    my ($a) = $t =~ m{<command-args>(.*?)</command-args>}s;
    return $cmd . (defined $a && $a ne '' ? " $a" : '');
  }
  return if $t =~ /^\s*<(local-command|task-notification|system-reminder|bash-|user-prompt-submit|command-message)/;
  return if $t =~ /^\[Request interrupted/;
  $t;
}

sub brief {                                 # một công cụ được gọi → mô tả ngắn
  my ($n, $i) = @_;
  $i ||= {};
  (my $name = $n) =~ s/^mcp__.*__//;
  my $d = $i->{description} // $i->{file_path} // $i->{pattern} // $i->{skill} // $i->{url}
       // $i->{query} // $i->{action} // $i->{command} // $i->{prompt} // '';
  $d = $i->{text} if $name eq "javascript_tool" && defined $i->{text};
  $d = basename($d =~ tr{\\}{/}r) if defined $i->{file_path} && !defined $i->{description};
  $d =~ s/\s+/ /g;
  $d = substr($d, 0, 70) . '…' if length $d > 71;
  $d eq '' ? $name : "$name: $d";
}

sub usage_of {
  my $u = shift || {};
  my $cc = $u->{cache_creation} || {};
  my $cw  = $u->{cache_creation_input_tokens} // 0;
  my $cw1 = $cc->{ephemeral_1h_input_tokens} // 0;
  my %t = (in => $u->{input_tokens} // 0, cr => $u->{cache_read_input_tokens} // 0,
           out => $u->{output_tokens} // 0, cw1h => $cw1, cw5 => $cw - $cw1);
  \%t;
}
sub quydoi { my $t = shift; my $s = 0; $s += ($t->{$_} // 0) * $W{$_} for keys %W; $s }
sub add_to { my ($a, $b) = @_; $a->{$_} += $b->{$_} // 0 for keys %W }

sub parse {
  my $file = shift;
  my (@tasks, %step, $title, $sid);
  my $cur;
  my $new_task = sub {
    my ($text, $t) = @_;
    $cur = { text => $text, start => $t, end => $t, steps => [], tok => {}, tools => {}, calls => 0, models => {} };
    push @tasks, $cur;
  };
  my $on_asst = sub {
    my ($j, $agent) = @_;
    my $m = $j->{message} or return;
    my $id = $m->{id} // $j->{uuid};
    my $t = ts($j->{timestamp});
    $new_task->('(đầu phiên)', $t) unless $cur;
    my $s = $step{$id};
    unless ($s) {
      # subagent ghi file riêng: gán vào việc đang chạy lúc đó
      my $task = $cur;
      if ($agent) { for (@tasks) { $task = $_ if $_->{start} <= $t } }
      $s = $step{$id} = { t => $t, agent => $agent, did => [], task => $task };
      push @{ $task->{steps} }, $s;
    }
    $s->{model} = $m->{model} if $m->{model} && $m->{model} !~ /^<synthetic>/;
    $s->{tok} = usage_of($m->{usage}) if $m->{usage};   # bản ghi sau cùng của message là đủ nhất
    for my $b (@{ $m->{content} || [] }) {
      my $ty = $b->{type} // '';
      if ($ty eq 'tool_use') { push @{ $s->{did} }, brief($b->{name}, $b->{input}); $s->{task}{tools}{ $b->{name} }++ }
      elsif ($ty eq 'text' && !$s->{said} && ($b->{text} // '') =~ /\S/) {
        (my $x = $b->{text}) =~ s/\s+/ /g;
        $s->{said} = length $x > 90 ? substr($x, 0, 90) . '…' : $x;
      }
    }
  };
  read_jsonl($file, sub {
    my $j = shift;
    my $ty = $j->{type} // '';
    $sid //= $j->{sessionId};
    if ($ty eq 'custom-title' || $ty eq 'summary') { $title = $j->{customTitle} // $j->{summary} // $title }
    elsif ($ty eq 'user') { my $p = prompt_text($j); $new_task->($p, ts($j->{timestamp})) if defined $p }
    elsif ($ty eq 'assistant') { $on_asst->($j, $j->{isSidechain} ? 1 : 0) }
  });
  (my $sdir = $file) =~ s/\.jsonl$//;
  for my $af (sort glob("$sdir/subagents/*.jsonl")) {
    my $aid = basename($af, '.jsonl');      # mỗi subagent một file; gọi tiếp bằng SendMessage thì ghi tiếp vào file đó
    read_jsonl($af, sub { my $j = shift; $on_asst->($j, $aid) if ($j->{type} // '') eq 'assistant' });
  }
  for my $k (@tasks) {
    @{ $k->{steps} } = sort { $a->{t} <=> $b->{t} } @{ $k->{steps} };
    for my $s (@{ $k->{steps} }) {
      add_to($k->{tok}, $s->{tok} || {});
      $k->{calls}++;
      $k->{models}{ $s->{model} }++ if $s->{model};
      $k->{end} = $s->{t} if $s->{t} > $k->{end};
    }
  }
  $sid //= basename($file, '.jsonl');
  @tasks = grep { $_->{calls} } @tasks;
  return { sid => $sid, title => $title, tasks => \@tasks };
}

# ---------------------------------------------------------------- ghi kết quả

sub fmt {                                   # 1234567 → 1.234.567
  my $n = sprintf '%.0f', shift // 0;
  1 while $n =~ s/^(\d+)(\d{3})/$1.$2/;
  $n;
}
sub kfmt { my $n = shift // 0; $n >= 1000 ? sprintf('%.0fk', $n / 1000) : $n }
sub cell { my $s = shift // ''; $s =~ s/\s+/ /g; $s =~ s/\|/\\|/g; $s }
sub short { my ($s, $n) = @_; $s = cell($s); length $s > $n ? substr($s, 0, $n - 1) . '…' : $s }
sub dur { my $s = shift; $s < 60 ? "${s}s" : $s < 3600 ? int($s / 60) . 'p' : sprintf('%dg%02dp', $s / 3600, ($s % 3600) / 60) }
sub tools_line {
  my $h = shift;
  join ', ', map { my $n = $_; $n =~ s/^mcp__.*?__//; "$n ×$h->{$_}" } sort { $h->{$b} <=> $h->{$a} || $a cmp $b } keys %$h;
}

sub run {
  my ($file, $quiet) = @_;
  my $r = parse($file);
  my @T = @{ $r->{tasks} };
  return unless @T;
  make_path($OUT);
  my (%all, $calls);
  for (@T) { add_to(\%all, $_->{tok}); $calls += $_->{calls} }
  my $tot = quydoi(\%all) || 1;
  my $id8 = substr($r->{sid}, 0, 8);
  my $name = ngay($T[0]{start}) . "_$id8.md";
  my $title = $r->{title} // short($T[0]{text}, 60);
  my %models; for my $k (@T) { $models{$_} += $k->{models}{$_} for keys %{ $k->{models} } }

  # Context mỗi lượt = toàn bộ token gửi lên (vào + đọc cache + ghi cache). Phần tăng tới lượt sau
  # (kết quả công cụ, lời trả lời, lời nhắn mới, nhắc của hệ thống) tính cho bước gây ra nó; bị nén thì bỏ qua.
  my @main = grep { !$_->{agent} && $_->{tok} } map { @{ $_->{steps} } } @T;
  $_->{ctx} = $_->{tok}{in} + $_->{tok}{cr} + $_->{tok}{cw5} + $_->{tok}{cw1h} for @main;
  my (%grow, %growN);
  for my $x (0 .. $#main - 1) {
    my $g = $main[$x + 1]{ctx} - $main[$x]{ctx};
    next if $g <= 0;
    $main[$x]{grow} = $g;
    my @n = map { (split /:/)[0] } @{ $main[$x]{did} };
    @n = ('(chỉ trả lời / lời nhắn mới)') unless @n;
    for (@n) { $grow{$_} += $g / @n; $growN{$_}++ }
  }
  for my $k (@T) {
    my @c = map { $_->{ctx} } grep { defined $_->{ctx} } @{ $k->{steps} };
    ($k->{c0}, $k->{c1}) = @c ? ($c[0], $c[-1]) : (0, 0);
  }
  my ($cmax) = sort { $b <=> $a } map { $_->{ctx} } @main;
  my @gtop = (sort { $b->{grow} <=> $a->{grow} } grep { $_->{grow} } @main)[0 .. 9];
  @gtop = grep { defined } @gtop;
  my @gtools = (sort { $grow{$b} <=> $grow{$a} } keys %grow)[0 .. 11];
  @gtools = grep { defined } @gtools;

  my @md;
  push @md, "# Token: " . cell($title), '';
  push @md, "Phiên `$r->{sid}` · " . ngay($T[0]{start}) . ' ' . hhmm($T[0]{start}) . '–' . hhmm($T[-1]{end})
          . ' · ' . join(', ', sort keys %models) . ' · ' . scalar(@T) . ' việc · ' . fmt($tot) . ' quy đổi'
          . ' · context mở đầu ' . fmt($main[0]{ctx}) . ', cao nhất ' . fmt($cmax), '';
  push @md, '*Quy đổi* = token tính theo giá một token đầu vào thường: vào ×1, ghi cache ×1,25 (5 phút) hoặc ×2 (1 giờ), '
          . 'đọc cache ×0,1, ra ×5. Dùng nó để so việc nào tốn hơn; số thô của *đọc cache* luôn to nhất mà rẻ nhất. '
          . '*Context* = số token Claude phải đọc lại ở mỗi lượt (cả đoạn chat tới đó); nó càng lớn thì mỗi lượt càng đắt và càng gần giới hạn.', '';
  push @md, '| # | Giờ | Việc | Lượt | Context | Vào | Ghi cache | Đọc cache | Ra | Quy đổi | % |', '|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|';
  my $i = 0;
  for my $k (@T) {
    $i++;
    my $q = quydoi($k->{tok});
    push @md, sprintf '| %d | %s | %s | %d | %s → %s | %s | %s | %s | %s | %s | %.0f%% |', $i, hhmm($k->{start}), short($k->{text}, 70),
      $k->{calls}, kfmt($k->{c0}), kfmt($k->{c1}), fmt($k->{tok}{in}), fmt($k->{tok}{cw5} + $k->{tok}{cw1h}), fmt($k->{tok}{cr}), fmt($k->{tok}{out}), fmt($q), 100 * $q / $tot;
  }
  push @md, sprintf '| | | **Cộng** | %d | | %s | %s | %s | %s | %s | 100%% |', $calls,
    fmt($all{in}), fmt($all{cw5} + $all{cw1h}), fmt($all{cr}), fmt($all{out}), fmt($tot);

  if (@gtools) {
    push @md, '', '## Context phình vì đâu', '',
      'Phần context tăng sau mỗi bước (kết quả công cụ trả về, lời trả lời, lời nhắn kế tiếp), cộng theo công cụ của bước đó.', '',
      '| Công cụ | Lần | Thêm vào context | Trung bình / lần |', '|---|---:|---:|---:|';
    push @md, sprintf '| %s | %d | %s | %s |', cell($_), $growN{$_}, fmt($grow{$_}), fmt($grow{$_} / $growN{$_}) for @gtools;
    push @md, '', 'Mười bước làm phình nhiều nhất:', '', '| Giờ | Làm gì | Thêm |', '|---|---|---:|';
    push @md, sprintf '| %s | %s | %s |', strftime('%H:%M:%S', gmtime($_->{t} + $TZ)), short(join('; ', @{ $_->{did} }) || '(trả lời)', 140), fmt($_->{grow}) for @gtop;
  }

  $i = 0;
  for my $k (@T) {
    $i++;
    my $q = quydoi($k->{tok});
    push @md, '', "## $i. " . short($k->{text}, 80), '';
    (my $full = $k->{text}) =~ s/\s+/ /g;
    push @md, '> ' . (length $full > 400 ? substr($full, 0, 400) . '…' : $full), '' if length $full > 80;
    push @md, hhmm($k->{start}) . '–' . hhmm($k->{end}) . ' (' . dur($k->{end} - $k->{start}) . ") · $k->{calls} lượt gọi · "
            . fmt($q) . ' quy đổi (' . sprintf('%.0f', 100 * $q / $tot) . '% phiên) · ra ' . fmt($k->{tok}{out}) . ' token', '';
    push @md, 'Công cụ: ' . tools_line($k->{tools}), '' if %{ $k->{tools} };
    push @md, '| Bước | Giờ | Làm gì | Context | Phình thêm | Ra | Quy đổi |', '|---:|---|---|---:|---:|---:|---:|';
    my $n = 0;
    for my $s (@{ $k->{steps} }) {
      $n++;
      my $t = $s->{tok} || {};
      my $what = join '; ', @{ $s->{did} };
      $what = $what ? ($s->{said} ? "„$s->{said}“ → $what" : $what) : ($s->{said} ? "„$s->{said}“" : '(nghĩ)');
      $what = '[subagent] ' . $what if $s->{agent};
      push @md, sprintf '| %d | %s | %s | %s | %s | %s | %s |', $n, strftime('%H:%M:%S', gmtime($s->{t} + $TZ)), short($what, 160),
        defined $s->{ctx} ? kfmt($s->{ctx}) : '', $s->{grow} ? '+' . fmt($s->{grow}) : '', fmt($t->{out}), fmt(quydoi($t));
    }
  }
  write_file("$OUT/$name", join("\n", @md) . "\n");
  tong($r, \@T);

  return if $quiet;
  printf "%s  (%s)\n%d việc · %s quy đổi · ra %s token · log: logs/token/%s\n\n", $title, $r->{sid}, scalar @T, fmt($tot), fmt($all{out}), $name;
  $i = 0;
  for my $k (@T) {
    $i++;
    my $q = quydoi($k->{tok});
    printf "%2d. %s  %-60s %4d lượt %12s  %3.0f%%  context %s → %s\n", $i, hhmm($k->{start}), short($k->{text}, 60), $k->{calls}, fmt($q), 100 * $q / $tot,
      kfmt($k->{c0}), kfmt($k->{c1});
  }
  return unless @gtools;
  printf "\nContext: mở đầu %s, cao nhất %s. Phình nhiều nhất vì:\n", fmt($main[0]{ctx}), fmt($cmax);
  printf "  %-28s %4d lần  +%s\n", $_, $growN{$_}, fmt($grow{$_}) for @gtools[0 .. ($#gtools < 5 ? $#gtools : 5)];
  print "Bước làm phình nhiều nhất:\n";
  printf "  %s  +%-8s %s\n", hhmm($_->{t}), fmt($_->{grow}), short(join('; ', @{ $_->{did} }) || '(trả lời)', 100) for @gtop[0 .. ($#gtop < 5 ? $#gtop : 5)];
  # Subagent: context riêng, chỉ kết luận về luồng chính. Lượt gọi cách nhau > 1 giờ là cache đã hết, phải ghi lại cả context.
  my %ag;
  for my $s (grep { $_->{agent} && $_->{tok} } map { @{ $_->{steps} } } @T) {
    my $a = $ag{ $s->{agent} } ||= { n => 0, q => 0, max => 0, cold => 0, last => 0 };
    my $c = $s->{tok}{in} + $s->{tok}{cr} + $s->{tok}{cw5} + $s->{tok}{cw1h};
    $a->{cold}++ if $a->{last} && $s->{t} - $a->{last} > 3600;
    $a->{n}++; $a->{q} += quydoi($s->{tok}); $a->{max} = $c if $c > $a->{max}; $a->{last} = $s->{t};
  }
  if (%ag) {
    my ($n, $q, $cold) = (0, 0, 0);
    for (values %ag) { $n += $_->{n}; $q += $_->{q}; $cold += $_->{cold} }
    printf "\nSubagent: %d con, %d lượt, %s quy đổi (%.0f%% phiên)%s\n", scalar keys %ag, $n, fmt($q), 100 * $q / $tot,
      $cold ? ", $cold lần gọi lại sau > 1 giờ (cache đã hết)" : '';
    printf "  %-24s %3d lượt  context tới %s  %s quy đổi\n", substr($_, 0, 24), $ag{$_}{n}, kfmt($ag{$_}{max}), fmt($ag{$_}{q})
      for sort { $ag{$b}{q} <=> $ag{$a}{q} } keys %ag;
  }
  my $now = $main[-1]{ctx} + ($main[-1]{tok}{out} // 0);
  printf "\nContext hiện tại ~%s / 1.000.000 (%.0f%%)%s\n", fmt($now), $now / 10000,
    $now >= 400_000 ? ' → đã quá ngưỡng 400k, nên mở chat mới' : '';
}

sub write_file {
  my ($f, $s) = @_;
  open my $fh, '>:encoding(UTF-8)', "$f.tmp" or die "$f: $!";
  print $fh $s;
  close $fh;
  rename "$f.tmp", $f;
}

sub tong {                                  # logs/token/tong.tsv (dữ liệu) + TONG.md (bảng mọi phiên)
  my ($r, $T) = @_;
  my $tsv = "$OUT/tong.tsv";
  my @rows;
  if (open my $fh, '<:encoding(UTF-8)', $tsv) {
    <$fh>;
    while (<$fh>) { chomp; my @c = split /\t/; push @rows, \@c if @c >= 10 && $c[0] ne $r->{sid} }
  }
  my $i = 0;
  for my $k (@$T) {
    $i++;
    my $t = $k->{tok};
    push @rows, [$r->{sid}, cell($r->{title} // ''), $i, $k->{start}, short($k->{text}, 90), $k->{calls},
                 $t->{in}, $t->{cw5} + $t->{cw1h}, $t->{cr}, $t->{out}, sprintf('%.0f', quydoi($t))];
  }
  @rows = sort { $b->[3] <=> $a->[3] } @rows;
  write_file($tsv, join('', "phien\ttieu_de\tviec\tbat_dau\tnoi_dung\tluot\tvao\tghi_cache\tdoc_cache\tra\tquy_doi\n",
                        map { join("\t", @$_) . "\n" } @rows));

  my (%ngay, %phien);
  for (@rows) { my $d = ngay($_->[3]); $ngay{$d}{q} += $_->[10]; $ngay{$d}{n}++; $ngay{$d}{out} += $_->[9]; $phien{$_->[0]} = $d }
  my @md = ('# Token theo việc', '', 'Mỗi dòng là một lời nhắn của người dùng và mọi lượt gọi Claude sau nó. Chi tiết từng bước ở file '
          . '`<ngày>_<phiên>.md` cùng thư mục. *Quy đổi*: xem giải thích đầu mỗi file phiên. Ghi tự động bởi hook Stop (`tools/token.pl`).', '',
          '## Theo ngày', '', '| Ngày | Phiên | Việc | Ra | Quy đổi |', '|---|---:|---:|---:|---:|');
  for my $d (sort { $b cmp $a } keys %ngay) {
    my $np = grep { $phien{$_} eq $d } keys %phien;
    push @md, "| $d | $np | $ngay{$d}{n} | " . fmt($ngay{$d}{out}) . ' | ' . fmt($ngay{$d}{q}) . ' |';
  }
  push @md, '', '## Mọi việc (mới nhất trước)', '', '| Ngày giờ | Phiên | Việc | Lượt | Ra | Quy đổi |', '|---|---|---|---:|---:|---:|';
  for (@rows) {
    my $f = ngay($_->[3]) . '_' . substr($_->[0], 0, 8) . '.md';
    push @md, sprintf '| %s %s | [%s](%s) | %s | %d | %s | %s |', ngay($_->[3]), hhmm($_->[3]), short($_->[1] || substr($_->[0], 0, 8), 40), $f,
      $_->[4], $_->[5], fmt($_->[9]), fmt($_->[10]);
  }
  write_file("$OUT/TONG.md", join("\n", @md) . "\n");
}

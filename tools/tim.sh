#!/usr/bin/env bash
# Tra nhanh mã Vạn Kiếp thay vì mở từng file:
#   bash tools/tim.sh G.teachList        định nghĩa gốc, các lớp bọc / ghi đè (theo thứ tự nạp), chỗ dùng theo file
#   bash tools/tim.sh S.flags.ring       tên khác: chỗ ghi, chỗ đọc
#   bash tools/tim.sh -k "danh vọng"     file nào lo việc đó (bảng Bản đồ mã nguồn, vankiep/TIEN_DO.md mục 2) + tên G.* khớp
# Ra file:dòng để Read offset / limit; xem cả hàm quanh đó bằng bash tools/muc_luc.sh FILE.
# Chỉ thấy cách viết thẳng tên (S.flags.x); viết gián tiếp (F.x với F = S.flags, S.flags['x']) thì phải grep thêm.
exec perl -x "$0" "$@"
#!perl
use strict;
use warnings;
use utf8;
use Encode qw(decode);
use Cwd qw(abs_path);
use File::Basename qw(dirname);

binmode STDOUT, ':encoding(UTF-8)';
chdir dirname(dirname(abs_path($0))) . '/vankiep' or die "không thấy vankiep/\n";
@ARGV or do { print "bash tools/tim.sh TÊN  |  bash tools/tim.sh -k TỪ KHÓA\n"; exit 1 };
@ARGV = map { decode('UTF-8', $_) } @ARGV;

sub lines_of {
  my $f = shift;
  open my $fh, '<:encoding(UTF-8)', $f or return ();
  my @l = <$fh>;
  s/\r?\n\z// for @l;
  @l;
}
sub cut { my ($s, $n) = @_; $s =~ s/^\s+//; length $s > $n ? substr($s, 0, $n - 1) . '…' : $s }

# Thứ tự nạp của game (index.html): file nạp sau mà gán lại tên là bọc / ghi đè.
my @order = map { /src="((?:js|data)\/[^"]+)"/g } lines_of('index.html');
my %in = map { $_ => 1 } @order;
my @files = (@order, grep { !$in{$_} } sort(glob('js/*.js'), glob('data/*.js'), glob('*.html')));

if ($ARGV[0] eq '-k') {
  shift;
  my $q = join ' ', @ARGV;
  my ($on, $hit) = (0, 0);
  for (lines_of('TIEN_DO.md')) {
    if (/^## 2\./) { $on = 1; next }
    last if $on && /^## /;
    next unless $on && /^\| / && /\Q$q\E/i;
    my (undef, $file, $role) = split /\s*\|\s*/, $_, 3;
    $file =~ tr/`*//d;
    my @snip;
    while ($role =~ /\Q$q\E/gi && @snip < 2) {
      my $p = $-[0] > 60 ? $-[0] - 60 : 0;
      push @snip, '…' . substr($role, $p, 140) . '…';
    }
    @snip = (substr($role, 0, 140) . '…') unless @snip;   # khớp ở tên file
    print "$file: @snip\n";
    $hit++;
  }
  print "(bảng Bản đồ mã nguồn không có \"$q\")\n" unless $hit;
  # Tên G.* có chứa từ khóa (từ khóa tiếng Anh / tên viết tắt), kèm chỗ gán đầu tiên.
  (my $k = $q) =~ s/\s+//g;
  my (%seen, @names);
  for my $f (@files) {
    my $n = 0;
    for (lines_of($f)) {
      $n++;
      while (/(?<![\w\$.])(G\.[\w\$]*\Q$k\E[\w\$]*)\s*=(?!=)/gi) { push @names, "$1  $f:$n" unless $seen{$1}++ }
    }
  }
  if (@names) { print "Tên khớp trong mã:\n"; print "  $_\n" for @names[0 .. ($#names < 19 ? $#names : 19)]; print "  … còn ", @names - 20, " tên\n" if @names > 20 }
  exit 0;
}

my $name = shift;
my $nre = qr/(?<![\w\$.])\Q$name\E(?![\w\$])/;
my $fn = $name =~ /^G\.|\.prototype\./;      # hàm / hằng dùng chung: gán đầu = định nghĩa, gán sau = bọc / ghi đè
my (@asg, %use, %useN);
my $cap = qr/=\s*\Q$name\E\s*[;,]/;           # const base = G.x;  (giữ hàm cũ để bọc)
for my $f (@files) {
  my ($n, $capAt) = (0, -9);
  for my $l (lines_of($f)) {
    $n++;
    next unless $l =~ $nre;
    next if $l =~ /^\s*(\/\/|\*)/;
    if ($l =~ /$nre\s*(?:[-+*\/|&]?=(?![=>])|\+\+|--)/) {
      my $pos = $-[0];
      my $wrap = $l =~ $cap || $n - $capAt <= 3;
      push @asg, [$f, $n, substr($l, $pos > 30 ? $pos - 30 : 0), $wrap];
    } elsif ($fn && $l =~ $cap) {
      $capAt = $n;
    } else {
      $useN{$f}++;
      push @{ $use{$f} }, $n if @{ $use{$f} || [] } < 6;
    }
  }
}
print "$name\n";
my $i = 0;
for my $a (@asg) {
  last if ++$i > 15 && print "  … còn ", @asg - 15, " chỗ gán\n";
  my $lab = !$fn ? 'ghi' : $i == 1 ? 'định nghĩa' : $a->[3] ? 'bọc' : 'ghi đè';
  printf "  %-10s %-22s %s\n", $lab, "$a->[0]:$a->[1]", cut($a->[2], 100);
}
print "  (không thấy chỗ gán: có thể định nghĩa trong object, hoặc ở shared/)\n" unless @asg;
my @u = sort { $useN{$b} <=> $useN{$a} || $a cmp $b } keys %useN;
if (@u) {
  print "  ", ($fn ? 'dùng' : 'đọc'), ":\n";
  printf "    %-18s ×%-3d %s\n", $_, $useN{$_}, join(', ', @{ $use{$_} }) . ($useN{$_} > 6 ? ', …' : '') for @u;
}

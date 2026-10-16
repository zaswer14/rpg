#!/usr/bin/env bash
# Trang duyệt nhanh (review/) có theo kịp dữ liệu không. Chạy TRƯỚC KHI COMMIT (CLAUDE.md mục "Trang duyệt nhanh").
#   bash tools/duyet.sh              đầy đủ: sinh lại dữ liệu từng trang (trình duyệt headless) so với bản đã đăng
#                                    + file nội dung đã đổi mà chưa trang nào hiện
#   bash tools/duyet.sh nhanh        chỉ phần git, không cần trình duyệt (sync.sh gọi lúc đầu phiên)
#   bash tools/duyet.sh dung TRANG   dựng trang để đăng: review/out/TRANG.html (TRANG = tree | nation | content | bestiary)
#   bash tools/duyet.sh ghi TRANG    sau khi đã đăng lại TRANG lên claude.ai: ghi dấu dữ liệu vào review/published.txt
# Mốc so: lần cuối review/published.txt được commit. Danh sách trang, URL, phạm vi: review/README.md.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
PUB=review/published.txt
PAGES="tree nation content bestiary"

# File mỗi trang hiện ra (đổi thì trang có thể phải đăng lại).
cover() { case $1 in
  tree)     echo "shared/schools.js shared/trunk.js shared/aspects.js shared/faiths.js shared/compose.js shared/catalog.js shared/races/ shared/archetypes/ review/tree-" ;;
  nation)   echo "vankiep/data/nations.js shared/names/names.js shared/terrain/ecology.js review/nation-" ;;
  content)  echo "vankiep/js/realmev.js vankiep/js/org.js vankiep/js/edu.js vankiep/js/noble.js vankiep/js/talent.js vankiep/js/cult.js vankiep/js/status.js vankiep/js/econ.js vankiep/js/inst.js vankiep/js/fate.js vankiep/js/race.js vankiep/js/tree.js vankiep/js/state.js shared/skills.js vankiep/data/world.js vankiep/data/nations.js vankiep/data/skills.js vankiep/data/jobtree.js shared/compose.js review/content-" ;;
  bestiary) echo "shared/bestiary/ shared/terrain/ shared/names/ review/bestiary-" ;;
esac; }
# File chứa nội dung đáng duyệt (dữ liệu và bảng nội dung trong mã).
# Cả vankiep/js/: file hệ thống mới tự bị báo cho tới khi có tab trên trang Duyệt Nội Dung (CLAUDE.md: mỗi hệ thống mới thêm vào trang đó).
CONTENT="shared/ vankiep/data/ vankiep/js/"
# Mã máy (không phải nội dung để duyệt): lõi, bản đồ, thế giới, giao diện, vòng đời.
NOT_CONTENT="shared/docs/ shared/tools/ shared/catalog.html shared/README.md vankiep/js/core.js vankiep/js/map.js vankiep/js/realm.js vankiep/js/ui.js vankiep/js/life.js vankiep/js/systems.js vankiep/js/dynamic.js vankiep/js/travel.js"

under() { local f=$1 q; shift; for q in "$@"; do case $f in "$q"*) return 0 ;; esac; done; return 1; }

browser() {
  for b in "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" "/c/Program Files/Microsoft/Edge/Application/msedge.exe" \
           "/c/Program Files/Google/Chrome/Application/chrome.exe" "$(command -v chromium 2>/dev/null)" \
           "$(command -v chromium-browser 2>/dev/null)" "$(command -v google-chrome 2>/dev/null)"; do
    [ -n "$b" ] && [ -x "$b" ] && { echo "$b"; return 0; }
  done; return 1
}
root_url() { local d; d=$(pwd -W 2>/dev/null || pwd); echo "file:///${d#/}"; }
# JSON dữ liệu của một trang (khối pre#out của review/TRANG-data.html, bỏ mã hóa HTML).
data_of() {
  # Windows: gọi Edge thẳng từ Git Bash thì mất stdout (16/10/2026), nên đi qua PowerShell với UTF-8.
  if command -v powershell.exe >/dev/null 2>&1 && command -v cygpath >/dev/null 2>&1; then
    powershell.exe -NoProfile -Command "[Console]::OutputEncoding=[Text.Encoding]::UTF8; & '$(cygpath -w "$BR")' --headless --disable-gpu --allow-file-access-from-files --dump-dom '$(root_url)/review/$1-data.html' 2>\$null"
  else
    "$BR" --headless --disable-gpu --allow-file-access-from-files --dump-dom "$(root_url)/review/$1-data.html" 2>/dev/null
  fi | sed -n 's/.*<pre id="out">\(.*\)<\/pre>.*/\1/p' | sed 's/&lt;/</g;s/&gt;/>/g;s/&quot;/"/g;s/&amp;/\&/g'
}
pub_field() { tr -d '\r' < "$PUB" | awk -F'\t' -v p="$1" -v n="$2" '$1 == p { print $n }'; }

mode=${1:-full}; page=${2:-}
case $mode in
  dung|ghi)
    case " $PAGES " in *" $page "*) ;; *) echo "Trang: $PAGES"; exit 1 ;; esac
    BR=$(browser) || { echo "Không có trình duyệt headless (Edge / Chrome / Chromium)."; exit 1; }
    json=$(data_of "$page"); [ -n "$json" ] || { echo "review/$page-data.html không ra dữ liệu (lỗi script?)."; exit 1; }
    if [ "$mode" = dung ]; then
      mkdir -p review/out; printf '%s' "$json" > review/out/$page.json
      J=review/out/$page.json perl -0pe 'BEGIN { local $/; open my $fh, "<", $ENV{J} or die; $d = <$fh>; } s#/\*DATA\*/null#$d#' \
        "review/$page-review.src.html" > "review/out/$page.html"
      echo "Đã dựng review/out/$page.html ($(wc -c < "review/out/$page.html") byte). Đăng lên URL: $(pub_field "$page" 5)"
      echo "Đăng xong thì: bash tools/duyet.sh ghi $page"
    else
      h=$(printf '%s' "$json" | sha256sum | cut -c1-16)
      awk -F'\t' -v OFS='\t' -v p="$page" -v h="$h" -v d="$(date +%F)" '$1 == p { $2 = h; $3 = d } { print }' "$PUB" > "$PUB.tmp" && mv "$PUB.tmp" "$PUB"
      echo "Đã ghi $page = $h ($(date +%F)) vào $PUB. Commit file này cùng thay đổi dữ liệu."
    fi
    exit 0 ;;
  full|nhanh) ;;
  *) sed -n '2,8p' "$0"; exit 1 ;;
esac

# File đã đổi từ mốc (commit sau mốc + thay đổi chưa commit + file mới chưa add).
base=$(git log -1 --format=%H -- "$PUB"); [ -n "$base" ] || base=HEAD
changed=$( { git diff --name-only "$base" -- ; git ls-files --others --exclude-standard; } | sort -u)
stale=""
for p in $PAGES; do
  for f in $changed; do under "$f" $(cover "$p") && { stale="$stale $p"; break; }; done
done
# Nội dung đổi mà không trang nào hiện. $1 = các trang sẽ hiện thay đổi (mặc định: mọi trang có file đổi).
uncovered_of() {
  local out="" f p hit
  for f in $changed; do
    under "$f" $CONTENT || continue; under "$f" $NOT_CONTENT && continue
    hit=0; for p in $1; do under "$f" $(cover "$p") && hit=1; done
    [ $hit = 0 ] && out="$out $f"
  done; echo "$out"
}
uncovered=$(uncovered_of "$stale")

if [ "$mode" = nhanh ]; then
  [ -z "$stale$uncovered" ] && exit 0
  echo "Trang duyệt: dữ liệu đổi từ lần đăng (${base:0:7})."
  [ -n "$stale" ] && echo "  có thể phải dựng lại:$stale (bash tools/duyet.sh để chắc)"
  [ -n "$uncovered" ] && echo "  chưa trang nào hiện:$uncovered"
  exit 0
fi

echo "== Trang duyệt nhanh (mốc ${base:0:7}) =="
if BR=$(browser); then
  lech=""
  for p in $PAGES; do
    json=$(data_of "$p")
    if [ -z "$json" ]; then echo "  $p: LỖI, review/$p-data.html không ra dữ liệu"; lech="$lech $p"; continue; fi
    h=$(printf '%s' "$json" | sha256sum | cut -c1-16)
    if [ "$h" = "$(pub_field "$p" 2)" ]; then echo "  $p: khớp bản đã đăng ($(pub_field "$p" 3))"
    else echo "  $p: LỆCH bản đã đăng → bash tools/duyet.sh dung $p, đăng lại $(pub_field "$p" 5), rồi ghi $p"; lech="$lech $p"; fi
  done
  # File của trang đổi mà dữ liệu trang không đổi: phần đổi không hiện trên trang nào.
  uncovered=$(uncovered_of "$lech")
else
  echo "  (không có trình duyệt headless: chỉ kiểm theo file)"
  [ -n "$stale" ] && echo "  file của trang đã đổi:$stale"
fi
if [ -n "$uncovered" ]; then
  echo "  Nội dung đổi mà chưa trang nào hiện (thêm tab duyệt? hỏi người dùng, ghi vào review/README.md):"
  for f in $uncovered; do echo "    $f"; done
else
  echo "  Không có nội dung mới nằm ngoài các trang duyệt."
fi

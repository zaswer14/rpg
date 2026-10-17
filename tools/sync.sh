#!/usr/bin/env bash
# Đồng bộ gọn với GitHub: một lệnh, vài dòng kết quả (thay cho chuỗi fetch / status / log / branch).
#   bash tools/sync.sh        fetch + tóm tắt (đầu phiên)
#   bash tools/sync.sh pull   fetch + tóm tắt + kéo về (chỉ fast-forward, không tự rebase)
#   bash tools/sync.sh push   đẩy nhánh hiện tại lên GitHub (cuối phiên, sau khi người dùng đồng ý)
# Remote: `github` nếu có (máy tính), không thì `origin` (bản clone trên cloud). Không bao giờ đụng `origin` công ty.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
R=github; git remote get-url github >/dev/null 2>&1 || R=origin
B=main; RB="$R/$B"
cur=$(git symbolic-ref --short -q HEAD || echo "(detached)")
mode=${1:-status}

if [ "$mode" = push ]; then
  n=$(git rev-list --count "$R/$cur..HEAD" 2>/dev/null || echo "?")
  [ -n "$(git status --porcelain)" ] && echo "Lưu ý: còn thay đổi chưa commit (không được đẩy)."
  bash tools/duyet.sh nhanh 2>/dev/null | sed 's/^/Lưu ý: /'
  if out=$(git push -q "$R" HEAD 2>&1); then echo "Đã đẩy $cur lên $R ($n commit)."
  else echo "Đẩy lỗi:"; echo "$out" | tail -5; exit 1; fi
  exit 0
fi

if ! out=$(git fetch -q --prune "$R" 2>&1); then echo "Fetch $R lỗi:"; echo "$out" | tail -3; exit 1; fi
read -r behind ahead < <(git rev-list --left-right --count "$RB...HEAD")
dirty=$(git status --porcelain)
echo "== $cur ↔ $RB: thiếu $behind, dư $ahead commit =="

if [ "$behind" -gt 0 ]; then
  echo "Mới trên $RB:"; git log --oneline --no-decorate -12 "HEAD..$RB" | sed 's/^/  /'
  files=$(git diff --name-only "HEAD...$RB"); nf=$(printf '%s\n' "$files" | grep -c .)
  echo "File đổi ($nf):"; printf '%s\n' "$files" | head -12 | sed 's/^/  /'
  [ "$nf" -gt 12 ] && echo "  … và $((nf - 12)) file nữa"
fi
[ "$ahead" -gt 0 ] && { echo "Chưa đẩy:"; git log --oneline --no-decorate -8 "$RB..HEAD" | sed 's/^/  /'; }
if [ -n "$dirty" ]; then
  echo "Chưa commit ($(printf '%s\n' "$dirty" | wc -l | tr -d ' ') file):"; printf '%s\n' "$dirty" | head -8 | sed 's/^/  /'
fi

# Nhánh khác trên remote chưa gộp vào main (phiên cloud đẩy lên claude/...).
for b in $(git branch -r --no-merged "$RB" --format='%(refname:short)' | grep "^$R/" | grep -v "/HEAD$"); do
  echo "Nhánh chưa gộp: $b (+$(git rev-list --count "$RB..$b")) $(git log -1 --format='%cr: %s' "$b")"
done

# Trạng thái Vạn Kiếp: đoạn mở đầu của TIEN_DO.md, lấy bản mới nhất (remote nếu đang thiếu commit).
src=HEAD; [ "$behind" -gt 0 ] && src=$RB
git show "$src:vankiep/TIEN_DO.md" 2>/dev/null | tr -d '\r' | awk 'NR>1 && /^## /{exit} NR>1 && NF' | sed 's/^/» /'

# Bàn giao đang mở (skill ban-giao): chat trước ghi lại để chat này khỏi đọc lại file.
{ ls ban_giao/*.md 2>/dev/null; git ls-tree --name-only "$src" ban_giao/ 2>/dev/null; } | grep '\.md$' | sort -u | while read -r f; do
  t=$( { cat "$f" 2>/dev/null || git show "$src:$f" 2>/dev/null; } | tr -d '\r' | sed -n 's/^# *//p' | head -1)
  echo "» Bàn giao đang mở: $f ($t) → đọc nó trước khi làm tiếp (skill ban-giao)"
done

# Trang duyệt nhanh: nội dung đổi từ lần đăng (chỉ theo git, không mở trình duyệt).
bash tools/duyet.sh nhanh 2>/dev/null | sed 's/^/» /'

if [ "$mode" = pull ]; then
  [ "$behind" -eq 0 ] && { echo "Đã mới nhất."; exit 0; }
  if out=$(git merge --ff-only -q "$RB" 2>&1); then
    echo "Đã kéo $behind commit: $(git diff --shortstat ORIG_HEAD HEAD)"
  else
    echo "Không fast-forward được:"; echo "$out" | tail -4
    [ "$ahead" -gt 0 ] && echo "Hai phía lệch nhau: hỏi người dùng rồi mới \`git pull --rebase $R $B\`."
    exit 1
  fi
elif [ "$behind" -gt 0 ]; then echo "→ bash tools/sync.sh pull"
elif [ "$ahead" -gt 0 ]; then echo "→ hỏi người dùng rồi bash tools/sync.sh push"
fi

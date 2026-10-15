#!/usr/bin/env bash
# Mục lục theo dòng, để đọc đúng đoạn cần (Read offset/limit) thay vì cả file.
#   bash tools/muc_luc.sh                  các file lớn trong kho (dòng, KB): đừng đọc cả những file này
#   bash tools/muc_luc.sh FILE             .md: tiêu đề #..### · .js/.html: hàm G.x = / function / <h2>
#   bash tools/muc_luc.sh FILE MẪU         chỉ mục có chứa MẪU (không phân biệt hoa thường)
# Mỗi dòng: L<đầu>-<cuối> (<số dòng>) <mục>. Đọc: Read offset=<đầu> limit=<số dòng>.
# Với .md, đoạn của một tiêu đề kéo tới trước tiêu đề cùng cấp hoặc cấp cao hơn kế tiếp (gồm cả mục con).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

if [ $# -eq 0 ]; then
  git ls-files '*.md' '*.js' '*.html' '*.json' | while read -r f; do
    n=$(grep -c '' "$f"); k=$(( $(wc -c < "$f") / 1024 ))
    [ "$k" -ge 15 ] && printf '%5d dòng %4dK  %s\n' "$n" "$k" "$f"
  done | sort -k3 -rn
  exit 0
fi

f=$1; pat=${2:-}
[ -f "$f" ] || { echo "Không có file: $f"; exit 1; }
case "$f" in *.md) kind=md ;; *) kind=code ;; esac

tr -d '\r' < "$f" | awk -v kind="$kind" '
  kind == "md" && /^```/ { fence = !fence; next }
  fence { next }
  kind == "md" && /^#{1,3} / { n++; ln[n] = NR; lv[n] = index($0, " ") - 1; tx[n] = $0; next }
  kind == "code" && (/^ {0,4}G\.[A-Za-z_$][A-Za-z0-9_$.]* *=[^=]/ || /^ {0,4}(async )?function [A-Za-z_$]/ ||
                     /^ {0,4}(const|let|var) [A-Z_][A-Z0-9_]* *= *[\[{]/ || /<h[12][ >]/) {
    n++; ln[n] = NR; lv[n] = 1; t = $0; sub(/^ +/, "", t)
    if (length(t) > 100) t = substr(t, 1, 100) "…"
    tx[n] = t
  }
  END {
    for (i = 1; i <= n; i++) {
      e = NR
      for (j = i + 1; j <= n; j++) if (lv[j] <= lv[i]) { e = ln[j] - 1; break }
      printf "L%d-%d (%d) %s\n", ln[i], e, e - ln[i] + 1, tx[i]
    }
  }' | if [ -n "$pat" ]; then grep -i -- "$pat"; else cat; fi

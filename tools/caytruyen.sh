#!/usr/bin/env bash
# Dựng bản đăng claude.ai của trang Cây Cốt Truyện (vankiep/caytruyen.html, docs/17 mục 5).
# Trang chạy thật bộ mô phỏng trong trình duyệt nên đăng kèm mã game làm file phụ, giữ đường dẫn shared/…, vankiep/js/…, vankiep/data/….
# Ra: review/out/caytruyen.html (trang, bỏ khung html/head/body vì claude.ai tự bọc) và review/out/caytruyen.files (danh sách file phụ).
# Đăng: công cụ Artifact, file_path = review/out/caytruyen.html, files = mỗi dòng của caytruyen.files ánh xạ chính nó, url ở review/README.md mục 1.
set -e
cd "$(dirname "$0")/.."
mkdir -p review/out
sed -e '1s#^<!doctype html><html lang="vi"><head>.*$##' -e 's#^</head><body>$##' -e 's#^</body></html>$##' \
    -e 's#<script src="\.\./#<script src="#' vankiep/caytruyen.html > review/out/caytruyen.html
grep -o '<script src="[^"]*"' review/out/caytruyen.html | sed 's/<script src="//;s/"$//' > review/out/caytruyen.files
n=$(wc -l < review/out/caytruyen.files); for f in $(cat review/out/caytruyen.files); do [ -f "$f" ] || { echo "Thiếu $f"; exit 1; }; done
echo "Đã dựng review/out/caytruyen.html ($(wc -c < review/out/caytruyen.html) byte) + $n file phụ ($(cat review/out/caytruyen.files | xargs du -cb | tail -1 | cut -f1) byte)."

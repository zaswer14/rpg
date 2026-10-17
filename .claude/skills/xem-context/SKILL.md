---
name: xem-context
description: Báo cáo đoạn chat hiện tại dùng context và token thế nào - context đang bao nhiêu so với giới hạn 1 triệu, mỗi việc (mỗi lời nhắn) tốn bao nhiêu, context phình vì công cụ / bước nào, so với các phiên trước, và nên làm gì (mở chat mới, giao subagent, đọc ít hơn). Dùng khi người dùng hỏi về token, context, chi phí, "tốn bao nhiêu", "sao context đầy", "theo dõi context", "xem context", hoặc gõ /xem-context.
---

# Xem context

Dữ liệu lấy từ transcript của phiên qua `tools/token.pl` (perl, chỉ module có sẵn). Hook `Stop` đã ghi log sau mỗi lượt vào `logs/token/`; skill này đọc tóm tắt và giải thích cho người dùng.

## Khái niệm cần nói đúng

- **Context** = số token gửi lên ở một lượt gọi (vào + đọc cache + ghi cache): toàn bộ đoạn chat tới đó. Mỗi lượt đều đọc lại hết, nên context lớn thì mọi lượt sau đều đắt và chat gần giới hạn 1 triệu.
- **Mở đầu ~64k** là của Claude Code (lời dặn hệ thống, mô tả công cụ, skill) cộng ~5k của kho (`CLAUDE.md`, memory, `sync.sh`). Phần kho kiểm soát được rất nhỏ.
- **Phình** = context tăng sau một bước: kết quả công cụ trả về, lời trả lời, file vừa viết, lời nhắn kế tiếp. Tính cho công cụ của bước đó.
- **Quy đổi** = token tính theo giá 1 token vào thường: đọc cache ×0,1, ghi cache ×1,25 / ×2, ra ×5. Để so việc nào tốn hơn, không phải hóa đơn.

## Làm

1. Chạy `perl tools/token.pl` (phiên mới nhất là phiên này; người dùng nêu phiên khác thì thêm đầu ID). Kết quả có: từng việc với lượt gọi, quy đổi, context đầu → cuối; công cụ làm phình nhiều nhất; các bước làm phình nhiều nhất; context hiện tại.
2. Cần so với phiên trước: `sed -n '1,14p' logs/token/TONG.md` (bảng theo ngày). Muốn biết context cao nhất của các phiên khác thì `grep -o 'cao nhất [0-9.]*' logs/token/2*.md` (tên file là `<ngày>_<id8>`).
3. Cần chi tiết một việc: file `logs/token/<ngày>_<id8>.md` rất dài, đừng đọc cả; `grep -n '^## ' FILE` để lấy số dòng rồi Read đúng đoạn.

Không chạy `--all`, không in cả file log: chính việc xem context cũng làm context phình.

## Báo cáo (ngắn, tiếng Việt)

1. **Context hiện tại**: X k / 1 triệu (%), mở đầu bao nhiêu, đã qua ngưỡng 400k chưa.
2. **Từng việc**: bảng gọn (việc, lượt, context đầu → cuối, % quy đổi). Chỉ ra việc nào đắt bất thường, nhất là việc nhỏ làm ở context lớn (vd "commit push" ở 500k).
3. **Phình vì đâu**: 2–3 công cụ đầu và 2–3 bước cụ thể, nói bằng lời (vd "đọc cả `story.js` qua Bash: +40k").
4. **So với trước** (nếu có số): phiên này phình nhanh hay chậm hơn các phiên gần đây.
5. **Nên làm**, chọn cái đúng với số liệu, đừng liệt kê đủ cả:
   - ≥ 400k, hoặc việc tiếp theo không cần những gì đã đọc: đề nghị mở chat mới, đưa khối tóm tắt để dán (việc đang làm, tới đâu, file đã sửa, commit chưa, việc còn lại, quyết định đã chốt).
   - Bash / Read chiếm phần lớn vì đọc nhiều file để tìm hiểu: lần sau giao subagent `Explore`, chỉ nhận kết luận (CLAUDE.md mục Đọc tiết kiệm).
   - `javascript_tool` / chạy thử in nhiều: cho trả tóm tắt, số đếm.
   - Write lớn: file viết ra cũng nằm lại; tách việc viết file lớn sang chat riêng nếu sau đó còn nhiều việc khác.

Người dùng muốn xem bằng trang (biểu đồ) thì dựng từ `logs/token/tong.tsv` và file phiên; mặc định trả lời bằng chữ.

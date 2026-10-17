---
name: ban-giao
description: Bàn giao giữa các đoạn chat để chat mới khỏi đọc lại file. Ghi `ban_giao/<việc>.md` (mục tiêu, tiến độ, file và vị trí, hiểu biết về mã, quyết định đã chốt, bước tiếp) khi hook báo context vượt ngưỡng, hoặc khi người dùng nói "bàn giao", "chuyển chat", "sắp hết context", "mở chat mới", "dừng ở đây mai làm tiếp". Nhận bàn giao khi chat mới thấy dòng "Bàn giao đang mở" trong kết quả sync.sh, hoặc người dùng nói "làm tiếp" một việc đang dở.
---

# Bàn giao giữa các chat

Chat mới không có gì của chat cũ: phần đã hiểu về mã (hàm nào ở đâu, dữ liệu ra sao, đã chốt gì) mất theo context, nên phải dò lại hàng chục file. File bàn giao giữ phần đó, ~3–5k token, được commit để máy tính và điện thoại (cloud) dùng chung. `tools/sync.sh` đầu phiên in mọi bàn giao đang mở.

## Ghi bàn giao

1. Tên file `ban_giao/<viec-khong-dau>.md` theo việc (vd `vankiep-danh-vong.md`). Việc đã có file thì sửa file đó, đừng tạo file thứ hai.
2. Viết từ những gì đã có trong chat. **Không Read lại file để viết bàn giao**; cần số dòng chính xác thì `grep -n` tên hàm hoặc `bash tools/muc_luc.sh FILE mẫu`.
3. Ghi điều chat mới không tự suy ra nhanh được; đừng chép mã, đừng kể lại cả quá trình. Giữ dưới ~150 dòng. Khuôn:

```markdown
# <Tên việc>

Cập nhật: <YYYY-MM-DD HH:MM> · commit gần nhất: <hash> <chưa commit gì / còn thay đổi chưa commit: file…>

## Mục tiêu
Người dùng muốn gì, xong là thế nào. Trích nguyên lời họ nếu chi tiết quan trọng.

## Đã xong
- … (commit nào, đã đăng trang nào)

## Việc tiếp theo
1. Bước cụ thể: sửa gì ở `file:dòng`, vì sao.
2. …

## File và vị trí
- `vankiep/js/fame.js:120-180`: vai trò; hàm chính, ai gọi nó.
- …

## Hiểu biết về mã (để khỏi đọc lại)
- Cấu trúc dữ liệu, tên trường, quy ước đặt tên.
- Chỗ dễ sai; đã thử gì mà không được, vì sao.
- Cách chạy / kiểm: lệnh, trang, seed, kết quả mong đợi.

## Quyết định đã chốt với người dùng
- … (chat mới không hỏi lại những điều này)

## Còn mở
- Câu hỏi chưa có trả lời, việc người dùng hoãn.
```

4. Hỏi người dùng có commit + push không: cần nếu làm tiếp trên máy khác (điện thoại). Commit thì theo CLAUDE.md (chạy `bash tools/duyet.sh` trước).
5. Báo ngắn: đã ghi file nào; mở chat mới và nói "làm tiếp" (nhiều bàn giao thì kèm tên việc).

## Nhận bàn giao (chat mới)

1. Đọc cả file bàn giao (nó ngắn). Nhiều file mà người dùng không nói việc nào: hỏi.
2. Tin phần *File và vị trí*, *Hiểu biết về mã*: không dò lại hệ thống, không đọc `TIEN_DO.md` / tài liệu thiết kế trừ khi bước tiếp cần. Chỉ Read đúng `offset` / `limit` đoạn sắp sửa; số dòng lệch vì file đã đổi thì `grep -n` tên hàm.
3. So commit ghi trong file với commit hiện tại (dòng đầu kết quả `sync.sh`); khác thì `git log --oneline <hash>..HEAD --stat | head -30` để biết gì đã đổi sau khi bàn giao.
4. Làm tiếp từ *Việc tiếp theo*. Không hỏi lại *Quyết định đã chốt*.
5. Xong cả việc: xóa file bàn giao trong commit hoàn tất (`git rm` nếu đã commit); việc Vạn Kiếp thì cập nhật `vankiep/TIEN_DO.md` như thường. Chưa xong mà lại phải chuyển chat: sửa chính file đó (bước Ghi).

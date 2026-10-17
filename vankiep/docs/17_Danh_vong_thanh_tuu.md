# Vạn Kiếp: danh vọng, thành tựu, lịch sử lựa chọn, biên bản lúc chết

Người dùng yêu cầu ngày 17/10/2026:

- Thêm hệ thống danh vọng, thành tựu.
- Lúc chết thống kê toàn bộ cuộc đời.
- Lúc chọn trong một quyết định, lịch sử phải ghi đã chọn gì và tác động ra sao.
- Chạy thử, đưa lên trang duyệt, rồi vẽ cây cốt truyện của một mẫu thử để duyệt.

Mã:

- `js/fame.js`, nạp sau `saga.js` (cuối cùng trước `ui.js`): bọc sự kiện, quyết định, trận săn, hệ con đã có.
- `js/life.js`: quyết định nào cũng ghi dòng "Tiêu đề: lựa chọn." (trước đây quyết định không trả câu nào thì không ghi gì).
- `js/ui.js`, `index.html`, `style.css`: ô Danh vọng, thẻ Thành tựu, biên bản lúc chết, dòng tác động trong nhật ký.
- `sim.html`: bảng "Danh vọng", "Thành tựu", "Lịch sử lựa chọn".
- Trang duyệt: tab **Danh vọng, thành tựu** trên Duyệt Nội Dung; trang mới **Cây Cốt Truyện Vạn Kiếp** (`review/lifetree-*`).

## 1. Chỗ yếu trước bước này

- `S.fame` là một số 0–100, hơn trăm chỗ trong mã cộng trừ, không biết từ đâu tới, không bao giờ giảm (docs/12 mục 6 đã ghi). Khoảng một phần tư đời trưởng thành chạm 100 nên số này không còn phân biệt được ai nổi tiếng.
- Danh vọng không có mặt tốt xấu: kẻ cướp đoạt bảo nổi tiếng giống người cứu làng.
- Bảng chết có 13 ô, không nói được đời đã đi qua những chuyện gì.
- Quyết định mà hàm `apply` không trả câu nào thì không để lại dòng nhật ký; có trả thì chỉ là câu kể, không nói chỉ số, tiền, mạch đã đổi gì.

## 2. Danh vọng

Vẫn là `S.fame` 0–100 (giữ mọi ngưỡng có sẵn: tước, hạng Hiệp Hội, thách đấu ngai, lập thị trấn, danh phận), thêm:

- **Nguồn.** Mỗi lần đổi được quy cho việc đang chạy: trận săn, sự kiện, quyết định, hệ con cuối năm (tước, chức, học…), thành tựu, phai. Việc tăng từ 2 trở lên vào danh sách "làm nên tên tuổi" (12 việc lớn nhất). Lưu ở `S.fameS.src`, `S.fameS.top`.
- **Nén.** Phần tăng khi đã trên 20 bị nhân 1 − (mức − 20) / 65, thấp nhất 0,1 (`G.FAME.soft`, `softK`, `softMin`).
- **Phai.** Danh vọng bền = điểm từ thành tựu + 30% mức cao nhất từng có. Phần trên đó phai 3% mỗi năm; tuổi già × 1,6, Bộ Xương × 0,7. Tước, chức vẫn giữ sàn như cũ.
- **Tầm** (`G.FAME_SCOPE`): vô danh (0), có tiếng trong làng (10), nổi tiếng cả tỉnh (25), lừng danh cả nước (50), vang danh khắp đại lục (70). Lên tầm mới có dòng nhật ký gọi tên làng, tỉnh, nước.
- **Thanh danh** `S.rep` −100…100: tiếng tốt hay xấu. Cộng trừ theo việc làm (`G.REP_DEEDS`: cứu người, hộ tống, báo quan +; tiền án, giết người đoạt bảo, phản bội, bị bắt luyện cấm thuật −), theo dấu hệ quả (dấu tốt +6, dấu xấu −8), theo danh vọng mất vì việc mình làm (× 1,5). Danh phận bóng tối từ 2 giữ thanh danh dưới −15 mỗi bậc. Phai 2% mỗi năm về 0. Tác dụng: Quan hệ mỗi năm + thanh danh × 0,01; trọng số sự kiện mai mối, giúp đỡ, thăm hỏi, treo thưởng tăng theo thanh danh, bị lườm, bị cướp tăng khi tiếng xấu (`G.REP_W`).
- **Danh hiệu**: thành tựu bậc cao nhất có danh hiệu (Kẻ Hạ ‹chúa vùng›, Nhà Vô Địch, Người Mở Đất, Phú Gia, Lữ Khách…) hoặc hiệu người đời đặt cho người cai trị lúc băng hà (`S.flags.epithet`).

Thẻ nhân vật: ô Danh vọng ghi "47 · lừng danh cả nước · được quý · "Người Mở Đất"", di chuột xem nguồn và việc làm nên tên tuổi. Thẻ Các kiếp trước thêm danh vọng cao nhất, danh hiệu, số thành tựu.

## 3. Thành tựu

`G.ACH`: 66 thành tựu, 13 nhóm (sinh tồn, chiến đấu, tu luyện, học vấn, địa vị, của cải, gia đình, đường đời, hành trình, kỳ ngộ, bóng tối, danh vọng, Bộ Xương), 4 bậc (Đồng, Bạc, Vàng, Huyền thoại; cộng danh vọng bền 0, 1, 2, 4). Điều kiện đọc trạng thái có sẵn (cờ đếm, Tier, mạch đã khép, chương đời); thêm ba cờ đếm từ trận săn: `upWin` (thắng quái cao hơn một Tier), `alphaWin`, `lordWin`.

Kiểm ba lúc: trước và sau mỗi quyết định (thành tựu đã đủ điều kiện từ trước được mở trước khi chụp trạng thái, để không tính nhầm cho lựa chọn), cuối năm, lúc chết ("Không phụ đời mình" chỉ xét lúc chết). Mở thì có dòng nhật ký ★.

Thẻ **Thành tựu** ở cột giữa: kiếp này theo bậc, rồi bộ sưu tập qua mọi kiếp (`vankiep.ach.v1` trong trình duyệt: số kiếp đã đạt, ai đạt đầu tiên; chưa đạt thì mờ).

## 4. Lịch sử lựa chọn

Bọc `Sim.prototype.choose` ngoài cùng. Chụp trạng thái trước và sau, so ra tác động:

- chỉ số (Sinh lực, Tâm trạng, Quan hệ, Hiểu biết), danh vọng, thanh danh, Tín tâm, trang bị, level, Tier, tiền;
- nghề, sinh kế, tầng lớp, vùng, nơi ở, nước, đạo, chí hướng, đường đời;
- ba kỹ năng đổi nhiều nhất;
- bạn đời, con, đồng đội, thú nuôi, thầy, đệ tử, học viện, dược tề, về hưu;
- dấu hệ quả thêm, hết; mạch mở, khép (kèm câu kết); vai trò nhận, rời; tình trạng mắc, khỏi; truy nã; thiên phú; thành tựu; chết.

Nhật ký: dòng "Tiêu đề: lựa chọn. Kết quả." như trước, rồi một dòng `fx` "→ Tác động: Tiền +30 bạc · Danh vọng +4 · Dấu: Được tin cậy." với dòng phụ "Không chọn: …". Chọn không nhận, ở lại thì ghi "Giữ nguyên như cũ"; không đổi gì ngay thì ghi hệ quả đến sau. `S.choices` giữ 400 lựa chọn gần nhất (`{ id, title, label, alts, y, ph, arc, out, fx }`) cho biên bản và cây cốt truyện.

## 5. Biên bản lúc chết, cây cốt truyện

`G.lifeStats(S, X)` trả các khối: Danh vọng, Thành tựu, Lựa chọn, Đường đời và mạch truyện, Chiến đấu, Tu luyện, Của cải và địa vị, Gia đình và người quen, Hành trình. Bảng chết hiện các khối này dưới 13 ô cũ (hai khối đầu mở sẵn). Đỉnh tiền, tầng lớp, level ghi ở `S.peak`.

`G.storyTree(S, X)` gom nhật ký theo nhãn mạch (`e.arc`), quyết định, chương đời, kết mạch, dấu, thành tựu, danh vọng theo năm (`S.fameS.hist`). Trang **Cây Cốt Truyện Vạn Kiếp** vẽ: trục ngang là tuổi; hàng trên là chương đời (xanh làm được, đỏ chưa) và đường danh vọng, thanh danh; thân đời có chấm sự kiện ngoài mạch, sao thành tựu, hình thoi quyết định; dưới là làn mạch chính, mạch phụ, mạch ngắn (rẽ ra từ thân ở năm mở, nút sự kiện, quyết định trong mạch, kết, dấu để lại), làn người quen và làn sự kiện do dấu kéo tới. Bấm mục nào cũng ra câu chữ và khối ✓ / ✎ / ✕ (db `reviews`, id `lt_<seed>_<mục>`).

Trang chạy thật bộ mô phỏng (`vankiep/caytruyen.html`, người dùng yêu cầu thêm 17/10/2026): nút **Nhân vật khác** sinh một đời mới ngay trong trình duyệt (~0,2–1,5 giây một đời); chọn giống loài (Bộ Xương thì chết non rồi trỗi dậy ngay, như chế độ kiểm duyệt), vùng sinh, xuất thân, cách chọn quyết định (Tự sống theo tính cách, hoặc bốc ngẫu nhiên bằng xúc xắc của chính đời đó để xem nhánh khác), seed, thế giới; đời tung trúng trỗi dậy thì có nút xem tiếp kiếp Bộ Xương. Cùng mã mẫu (`seed~giống loài~vùng~xuất thân~r~thế giới`) thì ra cùng một đời; mã mẫu nằm trên `#` của liên kết, trong danh sách Đã xem, và trong mỗi đánh dấu. Bản claude.ai dựng bằng `bash tools/caytruyen.sh` (trang + 53 file mã game làm file phụ). Xuất thân và vùng sinh mâu thuẫn (nhà quý tộc ở vùng khác) thì xuất thân thắng; trước đây chế độ kiểm duyệt chết lỗi ở chỗ này (`js/life.js` newLife).

## 6. Kết quả đo

1000 đời, thế giới `can-bang`, 17/10/2026, 137 giây (cùng máy, 150 đời: bản trước 25,9 giây, bản này 24,2 giây):

- Luật Tier giữ (không trận nào quá Tier + 1); trỗi dậy 20,1%; chết vì quái 9,8%.
- Tầm cao nhất (đời trưởng thành): vô danh 25,6%, trong làng 28,1%, cả tỉnh 19,1%, cả nước 20,1%, đại lục 7,2%. Lúc chết đại lục còn 1,3%. Trước khi nén, phai: ~27% đời trưởng thành ở 70 trở lên lúc chết.
- Nguồn trung bình mỗi đời: săn quái +20,5, quyết định +17,7, sự kiện +7,4, thành tựu +3,4, chức tước học vấn +3,1, phai −26,7.
- Thanh danh: tiếng thơm 5,6%, được quý 41,2%, bình thường 51,0%, tai tiếng 1,9%, khét tiếng 0,3%. Có danh hiệu 21,2%.
- Thành tựu: 11,3 mỗi đời đầu. Huyền thoại: Thủ Hộ Giả 0,8%, Đại quý tộc 1,3%, Lên ngôi 3,0%, Ngộ đạo 0,2%, Huyền Thoại Giả 0,1%. Chưa ai đạt: Hạ chúa vùng, Vô địch tỉ thí (sự kiện hiếm).
- Quyết định: 50,5 mỗi đời; 66,6% có tác động thấy ngay, 29,0% là chọn giữ nguyên, 4,4% hệ quả đến sau.
- Nhận đệ tử 14,0% (docs/12 ghi 10,7%; bản trước trong cùng phép đo ~13,7%, không do danh vọng phai).

## 7. Còn để lại

- **Lên ngôi** 3% vẫn ở bậc Huyền thoại (thách đấu ngai của bộ lạc, hãn quốc dễ hơn tưởng); cân lại nếu muốn hiếm hơn.
- "Lấy yếu thắng mạnh" 52%, "Hạ đầu đàn" 40%, "Bác học" 25%, "Trọn một đường đời" 59% là thành tựu phổ biến; giữ ở bậc thấp.
- Thanh danh chưa đổi giá, chưa đổi lời người quen nói; NPC chưa nhớ ai tiếng xấu.
- Trong game chưa có nút mở cây cốt truyện của đời vừa chết (trang `caytruyen.html` chỉ chạy đời mới).
- Sự kiện thường (không phải quyết định) chưa có dòng tác động.
- Bản lưu cũ chưa có `S.fameS`: được tạo ở lần đổi danh vọng đầu, nguồn trước đó không biết.

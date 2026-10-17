# Vạn Kiếp: đường đời, mạch chính, mạch ngắn, dấu hệ quả

Người dùng yêu cầu ngày 17/10/2026:

- Sự kiện chỉ đổi chỉ số là chính; lựa chọn chưa dẫn tới đâu.
- Mỗi sự kiện phải đổi mạch truyện của nhân vật, hoặc đi theo mạch đang chạy.
- Cần phần duyệt mạch truyện, chia mạch chính, mạch phụ, mạch ngắn.
- Mạch nào nhân vật đi qua cũng để lại ảnh hưởng, không có sự kiện đơn độc.

Sau khi hỏi lại, người dùng chốt:

- Khoảng **80%** sự kiện thuộc mạch.
- Mạch chính **tự nổi lên rồi chốt bằng một quyết định**.
- Làm **theo đợt**; đây là đợt 1.

Mã:

- `js/saga.js`, nạp sau `culture.js`, dùng `G.storyApi` của `story.js`.
- `js/story.js`: tầng mạch, giới hạn theo tầng, chỗ móc `G.storyLinkHook`, `G.storyApi`.
- `js/ui.js`: dòng Đường đời, chip dấu.
- Trang duyệt riêng **Duyệt Mạch Truyện** (`review/story-*`).
- Bảng "Đường đời: mạch chính", "Dấu hệ quả" trong `sim.html`.

## 1. Chỗ yếu trước bước này

Đo 60 đời, thế giới `can-bang`, trước khi có `saga.js`:

- 47% sự kiện thuộc mạch.
- **63/95 quyết định** không dẫn tới sự kiện nào sau đó: chọn nghề, di cư, vào hội, nhận nhiệm vụ, bí cảnh, nhẫn cổ, cấm thuật…
- **217/329 sự kiện** chỉ đổi chỉ số.
- Sự kiện đơn độc rơi nhiều nhất: lễ hội, cướp đường, thuế, đau lưng tuổi già, được mùa, lệnh treo thưởng, quái vào làng, con cái.
- "Mạch chính" chỉ là mạch người quen mở đầu tiên.
- Kết của mạch chỉ ghi vào nhật ký và đoạn tưởng nhớ lúc chết, không đổi gì về sau.

## 2. Ba tầng mạch (đã thay bằng mục 10: một khuôn cho mọi mạch, "phụ" là vai trò)

| Tầng | Là gì | Cùng lúc tối đa | Mã |
|---|---|---|---|
| Mạch chính | 5 hồi và một nhịp lặp; một đời đi qua một hay nhiều mạch nối nhau (mục 9) | 1 | `G.SAGA` (`saga.js`) |
| Mạch phụ | mạch người quen: Đối thủ, Ơn cứu mạng, Mối thù, Báo thù, Tình xưa, Thầy trò, Mộng ước, Ruột thịt, Bạn thân, Kẻ săn, Đứa bé tặng hoa | `arcMax` 3 | `story.js` |
| Mạch ngắn | một hai hồi, mọc từ quyết định thường; cùng tầng với các mạch cũ ngắn: Người mang ơn, Nợ cờ bạc, Bí mật, Người mất tích, Lời bà đồng | `shortMax` 3 | `G.SAGA_SHORT` (`saga.js`) |

`G.ARCS[k].tier` ghi tầng (mặc định `side`). `G.arcOpen` giới hạn số mạch theo từng tầng. Mạch chính cả đời đứng làm "mạch chính của chương": câu hỏi chương, kéo trọng số × `mainK`. Chưa có mạch chính thì vẫn dùng mạch phụ mở đầu tiên như cũ.

## 3. Mạch chính

### 3.1 Tám mạch đầu (năm mạch thêm ở mục 9.2)

| Mạch | Lời gọi | Hướng quỹ đạo · chủ đề · chí hướng | Chọn đường (hồi 2) | Cao trào (hồi 4) | Kết → dấu |
|---|---|---|---|---|---|
| Món nợ máu | đòi món nợ máu năm xưa | Võ, Ám · raid, war | luyện một mình / tụ toán thợ săn (thêm người quen) / thuê mạo hiểm giả | vào tổ đánh / đốt tổ / tha lứa con | win, burn → Đã trả nợ máu; spare → Đã buông; fail → Mối thù chưa trả |
| Thoát nghèo | đưa cả nhà ra khỏi nghèo | Thương, Nghề · tax, hardship, gamble · Làm giàu | buôn chuyến / khai hoang / học nghề | dồn vốn / giữ nhịp, chia họ hàng / làm với kẻ buôn lậu | rich → Nhà đã khá (tầng lớp +1); steady → Người giữ lời; ruined → Trắng tay làm lại; crooked → Của phi nghĩa |
| Đỉnh cao võ đạo | vươn tới bậc chưa ai trong làng đạt | Võ, Pháp · tourney, learn, teach · Tu luyện võ đạo | tìm thầy / đi tỉ thí / tự luyện | thách cao thủ số một / dạy lại / luyện cấm pháp (khí huyết loạn) | top → Cao thủ có tiếng; honor → Được tin cậy; broken → Nỗi cay đắng |
| Tác phẩm đời người | làm ra tác phẩm mang tên mình | Nghề, Trí · learn, teach · Học vấn | theo lối thầy / lối mới / đi tìm vật liệu hiếm | dồn vào một tác phẩm (trang bị +2) / làm theo đơn nhà quyền thế / dạy lại | work → Thợ có dấu riêng (tiền mỗi năm); school → Chân truyền; fail → Nỗi cay đắng |
| Người đứng đầu | gánh việc chung cho làng, cho tộc | Quyền, Gia · tax, war · Quyền thế | lo việc nhỏ / kết thân nhà giàu / dựa vào sức | để dân bầu / giành lấy / nhường người trẻ | chosen → Người đứng đầu; rule → Kẻ tiếm quyền; step → Được tin cậy |
| Con đường đức tin | đi tới cùng đạo mình theo (cần có đạo) | Đạo · faith · Tu hành | hành hương / vào đền / tự tìm lời giải | che chở tín đồ / đi giảng / bỏ đạo | saint, teacher → Người mộ đạo (Đức tin +2 mỗi năm); left → Kẻ bỏ đạo |
| Chân trời | đi tới nơi xa nhất từng nghe kể | Du · treasure, companion · Phiêu lưu | theo bản đồ / lên tàu / theo đoàn buôn | vượt đất chết / dừng ở nơi đẹp nhất / quay về | beyond, home → Người từng đi xa; settle → Đã quen đất mới; lost → Nỗi cay đắng |
| Tên nhà | gây dựng lại tên nhà | Gia, Quyền · romance, memory · Gia đình | tìm bằng chứng huyết thống / tự làm nên tên / liên hôn | đòi danh phận trước họ tộc / lập dòng mới / buông | claimed → Tên nhà được nhận; founded → Người mở dòng mới; let → Đã buông |

### 3.2 Năm hồi

| Hồi | Loại | Khi nào |
|---|---|---|
| Mở đầu | sự kiện | ngay sau khi chọn |
| Chọn đường | quyết định | từ thiếu niên, ≥ 2 lượt sau mở đầu |
| Thử thách | sự kiện thành / bại | trưởng thành, ≥ 3 lượt sau |
| Cao trào | quyết định | từ trung niên (`G.phaseOf` adult2) |
| Kết | sự kiện | tuổi già, hoặc ≥ 12 lượt sau cao trào |

Ngoài ra có **nhịp** (`*_beat`): sự kiện lặp ở các hồi chưa kết, trọng số 0,45, cách nhau ≥ 3 lượt; mỗi nhịp góp 1 tiến độ.

Xác suất thành ở thử thách, cao trào:

- Cộng **0,05 × tiến độ**, tối đa +0,3.
- Cộng thêm theo lối đã chọn ở hồi 2 (ví dụ tụ toán thợ săn +0,1).
- Thử thách thành thì cao trào dễ hơn.
- Cao trào có đánh tay đôi thì tính thêm theo sức nhân vật.

Không có trận thật nào, nên luật "không trận nào quá Tier + 1" không bị đụng tới.

### 3.3 Gieo mạch, chọn đường đời

**Gieo** (`S.saga.seed`): bảng `G.SAGA_SEED` có 59 sự kiện. Mỗi sự kiện cộng điểm cho một hay vài mạch chính, và câu đầu của sự kiện được giữ lại làm "lý do". Có thêm vài nguồn gieo đặc biệt:

| Nguồn | Mạch | Điểm |
|---|---|---|
| Quái vào làng làm chết người thân; cha không về | Món nợ máu | +3 |
| Lễ thử thiên phú ra căn cốt từ Lam trở lên | Đỉnh cao võ đạo | +3 |
| Dấu hiệu chí hướng | mạch hợp chí hướng | +1 |
| Lúc sinh: nhà nghèo | Thoát nghèo | +1,5 |
| Lúc sinh: con ngoài giá thú | Tên nhà | +3 |
| Lúc sinh: mồ côi | Tên nhà | +2 |
| Lúc sinh: nhà sùng đạo | Con đường đức tin | +1,2 |

Quyết định cũng gieo: chí hướng +2, bái sư +1,5 Đỉnh cao võ đạo, ra tranh ghế trưởng +1,5 Người đứng đầu, đi học +0,8 Tác phẩm đời người, chọn nghề +1 cho mạch hợp nghề.

**Quyết định Đường đời** (`sg_road`, ưu tiên 6):

- Mở khi tới 75% tuổi trưởng thành, hoặc đầu tuổi trưởng thành.
- Đưa ra 3 mạch điểm cao nhất, kèm lý do ("Vì: …"), và lựa chọn "Chưa định, sống theo ngày". Chọn chưa định thì sau 8 lượt hỏi lại một lần.
- Điểm của mỗi mạch là tổng của:
  - điểm gieo;
  - 3 × phần quỹ đạo theo hướng của mạch;
  - 2 nếu hợp chí hướng;
  - phần theo tính cách: hòa đồng → Người đứng đầu, gan dạ → Võ đạo, Chân trời, mộ đạo → Đức tin.
- Món nợ máu, Tên nhà chỉ hiện khi đã có chuyện gieo. Con đường đức tin cần đang có đạo.
- Chế độ tự động chọn mạch điểm cao nhất (dưới 1 điểm thì chưa định).
- Chọn Món nợ máu khi đang có mạch phụ Báo thù: mạch Báo thù khép lại (kết `merged`) và mạch chính mang theo người thân, loài quái, khu săn của nó.

### 3.4 Đi theo mạch

Sau khi chọn, một sự kiện "đi theo" mạch chính khi có một trong các điều sau:

- có trong bảng gieo với điểm ≥ 0,5 cho mạch đã chọn;
- là một trong 32 sự kiện đời thường hay gặp (`G.SAGA_UNIVERSAL`: được mùa, lễ hội, thuế, cướp, con cái, gặp bạn cũ, đau lưng, luật…), đi theo mọi mạch;
- có chủ đề hoặc hướng quỹ đạo hợp mạch;
- là sự kiện của đạo, khi đi Con đường đức tin.

Sự kiện đi theo mạch:

- trọng số × (1 + 0,6 × điểm);
- góp 0,5 × điểm tiến độ;
- mang nhãn "Tên mạch · đường đời";
- 45% có thêm một câu nối của mạch ("Tối ấy bạn lại nghĩ tới cái hũ tiền dưới gầm giường.").

Mạch chính đã khép vẫn còn **dư âm**: sự kiện hợp mạch mang nhãn "dư âm", không thêm câu nối.

**Sự kiện ngoài mạch**: khi đã có mạch chính, sự kiện lặp không thuộc mạch nào bị hạ trọng số:

- loại này là sự kiện không phải nút mạch, không móc người quen, không trong bảng gieo, không phải của tộc, của đạo;
- trọng số × 0,45 (`loneK`);
- đời thường của tộc (`*_days`) × 0,7 (`daysK`).

## 4. Dấu hệ quả (`S.marks`, `G.MARKS`)

32 dấu. Mỗi dấu có những trường sau:

- Trọng số: đổi trọng số một số sự kiện về sau. Ví dụ Có kẻ thù ngoài kia làm cướp đường × 1,5, chạm mặt kẻ thù × 1,8; Tiếng xấu làm người để ý × 0,6.
- Câu nhắc chuyện cũ: nối vào sự kiện đó khi nó xảy ra ("Trong toán cướp có một gương mặt bạn nhận ra: người của kẻ thù cũ.").
- Tác dụng mỗi năm: Quan hệ, Tâm trạng, tiền của thợ có dấu riêng, Đức tin của người mộ đạo.
- Tác dụng lúc nhận: Nhà đã khá tăng tầng lớp; Trắng tay làm lại mất 70% tiền; Chân truyền thêm 5 vào kỹ năng chính.
- Thời hạn: phai sau một số lượt, hoặc giữ cả đời.

Sự kiện xảy ra vì một dấu (dấu có trọng số cho nó) mang nhãn "Hệ quả · tên dấu" và tính là thuộc mạch. Dấu hiện thành chip trên thẻ nhân vật; di chuột xem từ đâu, còn bao lâu.

**Mọi mạch có kết đều để lại dấu**:

- Mạch chính: bảng ở mục 3.1.
- Mạch ngắn: mục 5.
- Mạch phụ của `story.js`:

| Mạch | Kết → dấu |
|---|---|
| Đối thủ | thắng → Đã vượt đối thủ; làm lành → Có bạn cũ; thua → Nỗi cay đắng |
| Ơn cứu mạng | trả được → Người giữ lời; từ chối → Tiếng xấu |
| Mối thù | thắng → Tay dính máu; pháp luật → Người giữ lời; tha → Đã buông; thua → Có kẻ thù ngoài kia |
| Báo thù | báo được → Đã trả nợ máu; buông → Đã buông; không báo được → Mối thù chưa trả |
| Tình xưa | để ngủ yên → Đã buông |
| Thầy trò | chân truyền → Chân truyền |
| Mộng ước | ngang hàng → Cao thủ có tiếng; được chỉ một thế → Chân truyền |
| Ruột thịt | cưu mang → Tình ruột thịt; cắt đứt → Đã cắt đứt |
| Bạn thân | gặp lại → Có bạn cũ |
| Kẻ săn | hạ kiếm → Đã buông; hạ được → Tay dính máu |
| Đứa bé tặng hoa | che chở → Được tin cậy; thành người nhà → Có bạn cũ |
| Người mang ơn | trả ơn → Được tin cậy |
| Nợ cờ bạc | trả → Người giữ lời; dính chủ nợ → Của phi nghĩa; bị đánh → Có kẻ thù ngoài kia; trốn → Tiếng xấu |
| Bí mật | vạch mặt → Có kẻ thù ngoài kia; được che chở → Mang ơn; tống tiền thắng → Của phi nghĩa; thua → Có kẻ thù ngoài kia; không ai tin → Tiếng xấu |

## 5. Mạch ngắn mới

| Mạch | Mọc từ | Hồi | Kết → dấu |
|---|---|---|---|
| Người thuê quay lại | nhận nhiệm vụ (45%) | sự kiện: việc lớn hơn / được tiến cử / bị quỵt | more, praise → Được tin cậy; stiff → Có kẻ thù ngoài kia |
| Phe trong hội | vào hội (50%) | quyết định: theo hội trưởng / theo phe trẻ / đứng ngoài | old, young_win → Được tin cậy; young_lose → Có kẻ thù ngoài kia |
| Lứa thú con | đi săn thưởng (35%) | quyết định: giết / nuôi một con / bán | kill → Tay dính máu; raise → Bạn của loài thú; sell → Của phi nghĩa |
| Đồng đội trong đoàn | vào đoàn lính đánh thuê (50%) | sự kiện: đồng đội đỡ đòn chết / được giao chỉ huy / đồng đội cuỗm phần | saved → Nợ máu đồng đội; rank → Được tin cậy; thief → Có kẻ thù ngoài kia |
| Lời hứa lúc tranh cử | ra tranh ghế trưởng (60%) | quyết định: giữ lời đào giếng / để sau | keep → Người giữ lời; break → Tiếng xấu |
| Đất mới | di cư (50%) | sự kiện: hàng xóm đầu tiên (thêm người quen) / bị nhìn như người lạ | home → Đã quen đất mới; cold → Người mới tới |
| Lai lịch món đồ | mua trang bị (25%) | quyết định: trả lại / trả thêm tiền / đuổi đi | return → Người giữ lời; keep → Tiếng xấu |
| Những người đầu tiên | lập làng, thị trấn | sự kiện: nhà đầu tiên tới ở (thêm người quen) | root → Người lập làng |
| Ơn thầy thuốc | mời thầy thuốc, cầu nguyện (50%) | quyết định: đi hái thuốc ở khu săn / từ chối | repaid → Được tin cậy; refused → Tiếng xấu |
| Bạn cùng lớp | đi học (60%) | sự kiện: mở mạch phụ Bạn thân hoặc Đối thủ | (mạch phụ đi tiếp) |
| Kẻ trốn giấy phép | trốn giấy phép pháp sư (60%) | sự kiện: bị bắt (thêm tiền án) / thoát | caught → Tiếng xấu |

## 6. Giao diện, trang duyệt

- Thẻ nhân vật: dòng **Đường đời**, ví dụ "Thoát nghèo · thử thách · tiến độ 7", "Thoát nghèo · đã khép", "Chưa định · đang nghiêng về Chân trời". Dấu hệ quả hiện thành chip ở dòng tình trạng.
- Nhật ký: nhãn "Tên mạch · đường đời", "Tên mạch · dư âm", "Hệ quả · tên dấu".
- Trang **Duyệt Mạch Truyện** (`review/story-data.html`, `review/story-review.src.html`, `bash tools/duyet.sh dung story`). Sáu tab:
  - Luật: 5 thẻ.
  - Mạch chính: 8 mạch, mỗi mạch một thẻ mạch (lời gọi, câu hỏi chương, hướng, câu nối, nguồn gieo, sơ đồ hồi, kết → tóm tắt → dấu) và 6 thẻ hồi.
  - Mạch phụ, Mạch ngắn: thẻ mạch và thẻ từng nút (câu chữ, lựa chọn, tác dụng trích từ mã).
  - Dấu hệ quả: 32 dấu (trọng số, câu nhắc, tác dụng, mạch nào để lại).
  - Gieo mạch, đi theo: 59 sự kiện gieo.
- Id duyệt dạng `<kind>__<id>`, kind `rule` / `arc` / `node` / `mark` / `seed`.

## 7. Kết quả đo

Đo nhanh trong console (60 đời, đời đầu, 17/10/2026):

| | Trước | Sau |
|---|---|---|
| Sự kiện thuộc mạch | 47% | 81% (thơ ấu 74%, thiếu niên 75%, trưởng thành 86%, già 82%) |
| Quyết định thuộc mạch | 28% | 39% |
| Đời có mạch chính | | 55/60 tới tuổi chọn đều chọn |

Mạch chính được chọn (80 đời, sau khi cân điểm):

| Mạch | Đời |
|---|---|
| Đỉnh cao võ đạo | 16 |
| Con đường đức tin | 13 |
| Thoát nghèo | 12 |
| Tác phẩm đời người | 11 |
| Chân trời | 11 |
| Tên nhà | 6 |
| Người đứng đầu | 5 (đo trên 55 đời) |
| Món nợ máu | 2 (cần có người thân chết) |

Bảng 1000 đời: mục 7.1.

### 7.1 Cân bằng 1000 đời

`sim.html`, 1000 đời + 224 kiếp Bộ Xương, thế giới `can-bang`, 17/10/2026 (210 giây, khung trình duyệt ẩn).

| | Bản trước (`docs/15` mục 4.1) | Bản này | Mục tiêu |
|---|---|---|---|
| Sự kiện thuộc mạch (mọi đời, mọi kiếp) | 46,6% | 79,3% | ~80% |
| … đời trưởng thành | 47,0% | 83,0% | |
| … kiếp Bộ Xương | ~45% | 44,9% (chưa có mạch chính) | |
| Đời trưởng thành theo phần thuộc mạch: 40–60 / 60–80 / ≥ 80% | | 0,7 / 41,5 / 57,8% | |
| Quyết định thuộc mạch | 28% | 41,4% | |
| Mạch khép mỗi đời | 7,6 | 11,7 | |
| Trận quá Tier + 1 | 0 | 0 | 0 |
| Trỗi dậy | 19,8% | 22,4% | ~20% |
| Tử trận trước quái | 10,1% | 10,5% | ~10% |
| Tháp Tier 0–5 | 57,9 / 28,1 / 10,1 / 3,2 / 0,6 / 0,1 | 55,9 / 28,3 / 12,2 / 2,9 / 0,6 / … | 60 / 27 / 10 / 2,5 / 0,5 / 0,05 |

Mạch chính được chọn (chế độ tự động; không đời nào chọn "chưa định"):

| Mạch | Đời | Kết (đã khép) |
|---|---|---|
| Đỉnh cao võ đạo | 195 | top 96, broken 26, honor 20 |
| Tác phẩm đời người | 181 | work 87, school 60, fail 9 |
| Thoát nghèo | 141 | steady 82, rich 31, crooked 6, ruined 1 |
| Chân trời | 120 | beyond 48, lost 13, home 1, settle 1 |
| Con đường đức tin | 113 | teacher 53, saint 48 |
| Tên nhà | 98 | let 78, founded 6, claimed 4 |
| Người đứng đầu | 41 | step 28, chosen 6 |
| Món nợ máu | 10 | burn 4, win 3, spare 2 |

Mỗi đời có trung bình 21,7 sự kiện đi theo mạch chính, 5,7 sự kiện gieo, 2,4 sự kiện xảy ra vì một dấu. Dấu nhận nhiều nhất (mỗi 1000 đời): Được tin cậy 848, Có bạn cũ 658, Đã buông 445, Có kẻ thù ngoài kia 444, Người giữ lời 399. Mạch ngắn mở nhiều nhất: Người thuê quay lại 1266, Đồng đội trong đoàn 465, Lứa thú con 445, Bạn cùng lớp 405, Đất mới 361, Ơn thầy thuốc 364.

Sau lần đo này đã chỉnh hai chỗ mà chưa đo lại 1000 đời: chế độ tự động ở cao trào Tên nhà (gan từ 0,4 thì đòi danh phận, hòa đồng dưới 0,55 thì lập dòng mới; trước đó "buông" chiếm 78/88) và tỉ lệ được bầu ở Người đứng đầu (nền 0,4 → 0,5). Trỗi dậy 22,4% và tháp Tier 2 nhích lên (12,2%) nằm trong độ nhiễu của một lần đo, nhưng nên xem lại ở đợt 2 (mạch chính cộng kỹ năng ở vài hồi). Chưa chạy Thử thế giới động, Thử 100 thế giới (bước này không đổi phần thế giới).

## 8. Còn để lại (đợt sau)

- Quyết định thuộc mạch mới 39%: còn chừng 40 quyết định chưa có mạch ngắn (bí cảnh, nhẫn cổ, cấm thuật, đấu giá, dược tề, lên nghề, triều chính, lập nước…).
- Câu nối của mạch chính mỗi mạch có 3 câu, dễ lặp; câu nhắc của dấu mới có cho vài sự kiện.
- Bộ Xương chưa có mạch chính (trỗi dậy là một `S` mới, `S.saga` bắt đầu lại; các nút mạch chính chỉ cho người sống).
- Đổi mạch (mục 9): Thoát nghèo hay làm mạch thứ hai vì điểm gieo cộng dồn; Tham vọng hiếm ở Tự sống; câu nối, nhịp của năm mạch mới mới có 3 câu mỗi loại; chưa có câu chuyển ý riêng cho từng cặp mạch (rẽ từ Báo thù sang Giữ làng…).
- Mạch chính chưa đổi thứ khác ngoài chỉ số, tiền, tầng lớp, danh vọng, dấu: Người đứng đầu chưa thành trưởng khu thật, Chân trời chưa thật sự đổi vùng.
- Mạch chính, mạch ngắn chưa đổi giọng theo giống loài.
- Chưa nối xuyên kiếp (`docs/13` mục 5).

## 9. Đổi mạch chính, năm mạch mới (người dùng yêu cầu 17/10/2026)

Người dùng: một nhân vật không chỉ có một mạch chính; mạch chính đổi theo sự kiện, lựa chọn (ví dụ không chọn báo thù mà chọn hướng khác); thêm mạch truyện.

### 9.1 Đổi mạch chính

- **Vẫn gieo sau khi chọn**: sự kiện (kể cả sự kiện đang đi theo mạch), quyết định, dấu mới vẫn cộng điểm cho các mạch *khác* (`G.storyLinkHook`, `MARK_SEED`, `DEC_SEED`). Dấu gieo: Tay dính máu, Của phi nghĩa → Chuộc lỗi; Kẻ tiếm quyền → Tham vọng; Mối thù chưa trả, Nợ máu đồng đội → Món nợ máu… Lựa chọn gieo: nhận lời Hắc Giáo, học cấm thuật, cướp đường → Tham vọng / Chuộc lỗi; vào bí cảnh, đeo nhẫn cổ, đào mộ kiếp trước → Bí mật cổ xưa; nhận lời cầu hôn → Một mối tình.
- **Ba lối đổi**:
  1. Hồi **chọn lối** của mọi mạch chính có thêm lựa chọn "Thôi, rẽ sang …" khi một mạch khác đang gọi mạnh (điểm ≥ 3). Ví dụ Đỉnh cao võ đạo: "Thôi, rẽ sang: Món nợ máu".
  2. Quyết định **Ngã rẽ** (`sg_turn`): đang đi một mạch (chưa tới hồi kết) mà một lần gieo ≥ 2,5 cho mạch khác, hoặc mạch đó lớn thêm ≥ 6 kể từ lúc chọn (`G.SAGA_TURN`). Lựa chọn: đi tiếp (tiến độ +1) / rẽ sang mạch vừa gọi / rẽ sang mạch điểm cao kế tiếp. Tự sống gặp chuyện lớn thì rẽ theo tính cách (`AFF`: gan thì báo thù, mộ đạo hay hòa đồng thì chuộc lỗi, gan mà ít đạo thì Tham vọng…), chuyện nhỏ cộng dồn thì so điểm với "giữ đường" (2 + tiến độ + hồi đã qua).
  3. **Đường đời mới** (cùng `sg_turn`): mạch chính đã khép (hay phai) mà còn ở tuổi trưởng thành: ba mạch chưa đi điểm cao nhất (điểm trừ nửa điểm gieo có từ lần chọn trước, để chuyện gần đây nặng hơn chuyện thơ ấu) hoặc "Sống nốt đời theo ngày".
- Mạch bỏ dở khép với kết `turned` ("bỏ dở giữa chừng, rẽ sang …"), không để dấu. Tối đa 3 lần đổi một đời, cách nhau ≥ 6 lượt. `S.saga.past` ghi các mạch đã đi; `G.sagaText` thêm "(trước: …)".
- **Kết gieo mạch sau** (`G.SAGA_CHAIN`): tha lứa quái con → Giữ làng +2, Đức tin +1; giàu bằng của phi nghĩa → Chuộc lỗi +3; tiếm quyền → Tham vọng +3; bỏ đạo → Bí mật cổ xưa; dừng ở đất mới → Một mối tình… (bảng đủ trên trang Duyệt Mạch Truyện, thẻ luật Ngã rẽ).
- Thành tựu mới: **Ngã rẽ** (đồng: bỏ dở một đường để rẽ sang đường khác), **Hai đời trong một đời** (vàng: khép hai mạch chính với kết làm được). Biên bản lúc chết thêm dòng "Các đường đã đi".

### 9.2 Năm mạch mới

| Mạch | Lời gọi | Hướng · chủ đề · chí hướng | Chọn lối (hồi 2) | Cao trào (hồi 4) | Kết → dấu |
|---|---|---|---|---|---|
| Giữ làng | đứng chắn cho làng | Võ, Gia, Quyền · raid, war, robbery | lập đội dân canh (thêm người quen) / tự luyện thành bức tường / xin lãnh chúa gửi lính | đứng ở cổng đánh tới sáng / rút vào sau rào / dẫn làng lên núi | held, wall → Người giữ làng; saved → Được tin cậy; fell → Nỗi cay đắng |
| Một mối tình | giữ lấy một người (cần có chuyện gieo) | Gia, Du · romance · Gia đình | làm nhà người ấy nể / rủ bỏ đi / kiên nhẫn chờ | ở lại / đi, hẹn ngày về / buông tay | wed, wait → Một mối tình trọn; let → Đã buông; lost → Nỗi cay đắng |
| Bí mật cổ xưa | tìm bí mật thế giới đã quên | Trí, Pháp, Du · treasure, ring, grave, learn · Học vấn | sách cũ / đào phế tích / hỏi người chết (đường tối) | gọi tên, mở cửa / chép gửi học viện / niêm phong | found → Người biết bí mật; shared → Được tin cậy; sealed → Đã buông; curse → Nỗi cay đắng + lời nguyền |
| Chuộc lỗi | trả lại cho đời những gì đã lấy (cần có chuyện gieo) | Đạo, Gia · faith | làm việc thiện / tìm người mình đã làm hại / vào đền sám hối | tự đứng ra nhận / đem của cải trả lại / giấu tiếp | redeemed, confessed → Đã chuộc lỗi; punished → Người giữ lời; hidden → Nỗi cay đắng |
| Tham vọng | leo lên trên đầu mọi người (cần có chuyện gieo) | Ám, Quyền · dark · Quyền thế | gom tiền mua người / gieo sợ hãi / bám kẻ quyền thế | lật đổ / ép nhường ghế / dừng lại | throne → Kẻ đứng trên đầu người; back → Đã buông; fall → Trắng tay làm lại |

Dấu mới: Người giữ làng, Một mối tình trọn, Người biết bí mật, Đã chuộc lỗi, Kẻ đứng trên đầu người. Gieo từ sự kiện có sẵn: quái vào làng, chiến tranh, cướp đường → Giữ làng; tình đầu, người dạm hỏi → Một mối tình; bản đồ, món đồ lạ, học chữ → Bí mật cổ xưa.

### 9.3 Đo (17/10/2026, 500 đời Tự sống, thế giới `can-bang`, khung trình duyệt ẩn)

| | |
|---|---|
| Số mạch chính một đời: 0 / 1 / 2 / 3 / 4 | 9,2 / 29,8 / 56,2 / 4,4 / 0,4% |
| Đời bỏ dở một mạch để rẽ giữa chừng (Tự sống) | ~6% |
| Đời có quyết định Ngã rẽ (đi tiếp hay rẽ) | ~9% |
| Đường đời mới sau khi mạch khép | ~55% đời |
| Mạch được chọn đầu tiên | Võ đạo 93, Tác phẩm 78, Thoát nghèo 72, Chân trời 65, Tên nhà 52, Đức tin 50, Đứng đầu 20, Bí mật 13, Giữ làng 7 |

200 đời chọn ngẫu nhiên: 67 lần chọn "rẽ sang" ở hồi chọn lối, 117 quyết định Ngã rẽ / Đường đời mới, 78 mạch bỏ dở; đủ 13 mạch đều chạy, không lỗi. Mạch thứ hai hay rơi vào Thoát nghèo (điểm gieo từ thuế, được mùa cộng dồn cả đời) và Một mối tình; Tham vọng hiếm khi Tự sống chọn (cần lựa chọn tối), chủ yếu do người chơi chọn.

## 10. Mạch nào cũng đầy đủ, "phụ" chỉ là vai trò, nhiều kết (người dùng yêu cầu 17/10/2026)

Lời người dùng: "bổ sung thêm tính mở rộng của mạch truyện, ko còn mạch nào là mạch phụ cả, mạch phụ là khi nó giao với 1 phần cuộc đời của nhân vật và nhân vật ko theo mạch đó, còn lại mỗi mạch đều có hoàn chỉnh. Và 1 mạch truyện có thể có nhiều kết". Người dùng chốt thêm: **nâng hết** (cả 11 mạch ngắn cũ), **kết theo cả đường đi**, Cây Cốt Truyện **một làn chung theo năm**. Mục này thay mục 2 (ba tầng mạch) và mục 5 (mạch ngắn một hai hồi).

### 10.1 Một khuôn cho mọi mạch

`full(k, def)` (`js/saga.js` mục 2) dựng mọi mạch: 13 mạch chính (`saga()` gọi `full` với `tier: 'main'`) và 27 mạch ở `js/arcs.js` (16 mạch người quen, 11 mạch đời thường). Mạch nào cũng có:

| Hồi | Nút | Ghi chú |
|---|---|---|
| Mở đầu | sự kiện `k_open` | sau sự kiện mở mạch (story.js mục 3, 4; patchDec của mạch đời thường) |
| Chọn lối | quyết định `k_knot` | ghi `a.d.path`; lối `away` = đứng ngoài (mục 10.2) |
| Thử thách | sự kiện `k_trial` | thành / bại → `a.d.ok`; xác suất cộng tiến độ |
| Cao trào | quyết định `k_climax` | kết của cao trào → `a.d.end`; mạch chạy nền thì là sự kiện `k_drift` (không hỏi) |
| Kết | sự kiện `k_after` | `def.end(S, X, a, p, o)` chọn kết cuối theo cả đường đi |
| Nhịp | sự kiện `k_beat` | chỉ khi nhân vật theo mạch; góp tiến độ |

`def.acts[hồi] = { st, wait, w, c, when, prio, dead }` chỉnh tuổi, khoảng chờ, trọng số từng hồi. Mạch không phải mạch chính đi chừng 10–25 lượt (khoảng chờ `W` trong `arcs.js`), nút trọng số gốc 4.

### 10.2 Phụ là vai trò

Không còn tầng mạch. Ở hồi chọn lối, phần lớn mạch có lối **đứng ngoài** (`away`: thôi đua, từ chối, để chuyện cũ ngủ yên, quên chuyện đó đi…). Chọn nó thì mạch không biến mất mà **chạy nền** (`a.d.bg` = lượt đứng ngoài): nút thưa hơn (× 0,5), không có nhịp, cao trào là chuyện của người trong mạch hay của thế giới (`def.climax.bg`, không hỏi), và có kết riêng (đối thủ thành danh hay sa cơ, người thương lấy người khác hay ở vậy, thầy truyền nghề cho người khác…). Mạch chính (đường đời) giữ cách đổi mạch của mục 9.

Chỗ mạch: một mạch chính + tối đa `G.STORY.arcMax` = 5 mạch khác đang mở (bỏ `shortMax`). Lời bà đồng vẫn không chiếm chỗ.

### 10.3 Nhiều kết, theo cả đường đi

Mỗi mạch người quen, mạch đời thường có 5–9 kết; kết cuối do `def.end` ghép lối đã chọn, thử thách thành / bại, lựa chọn ở cao trào (ví dụ Đối thủ: thắng mà thử thách thành → vượt hẳn; thắng sau khi thua cả thời trẻ → lội ngược; thắng bằng mánh → thắng mà mang tiếng; làm lành sau khi đã kết giao từ trước → anh em kết nghĩa; đứng ngoài → nhìn đối thủ thành danh hoặc đỡ người ấy dậy lúc sa cơ). Kết nào cũng có câu tóm tắt (đoạn tưởng nhớ lúc chết) và dấu hệ quả. Bốn dấu mới: Điều còn tiếc, Anh em kết nghĩa, Có người che chở, Biết nghề thuốc.

13 mạch chính thêm 14 kết chỉ mở ra khi đi đúng lối (bảng `PATH_END`, `saga.js`): Món nợ máu cùng toán thợ săn → lập phường săn giữ làng; Thoát nghèo bằng nghề → mở xưởng; Võ đạo tự luyện → tự mình lên đỉnh; Tác phẩm theo lối mới → lối làm mang tên mình; Người đứng đầu dựa vào sức → được bầu vì sợ, lo việc nhỏ cho làng → không ngồi ghế mà làng vẫn tìm tới; Đức tin tự tìm lời giải → bỏ đạo cũ mà thấy đủ; Chân trời theo đoàn buôn → người nối hai miền; Tên nhà nhờ liên hôn; Giữ làng bằng đội dân canh → thành lệ làng; Một mối tình bỏ trốn cùng nhau; Bí mật cổ xưa qua sách → học giả; Chuộc lỗi tìm người bị hại → được chính người ấy tha; Tham vọng bám kẻ quyền thế → làm con rối.

Người trong mạch chết: trước cao trào thì mạch dở dang (`gone`, dòng nhật ký riêng của mạch); đã qua cao trào thì mạch khép bằng kết đã định (`G.ARCS[k].endOf`). Người đang ở giữa một mạch chết ngẫu nhiên ít hơn (× 0,6, `G.castYear`).

### 10.4 Giao diện

- Cây Cốt Truyện: mọi mạch chung một làn xếp theo năm; màu riêng cho đường đời; **nét đậm** là đoạn nhân vật theo mạch, **nét mảnh** từ lúc đứng ngoài (mạch chạy nền); khung chi tiết ghi "từ … tuổi đứng ngoài, mạch chạy nền (vai phụ)". `G.storyTree` thêm `bg`, `path`.
- Duyệt Mạch Truyện: hai tab Đường đời (13) và Mạch truyện (27); thẻ mạch ghi có lối đứng ngoài không, luật chọn kết theo đường đi, nút `k_drift`.

### 10.5 Đo (17/10/2026, 400 đời Tự sống, thế giới `can-bang`, khung trình duyệt ẩn)

| | Mục 7.1 | Bản này |
|---|---|---|
| Sự kiện thuộc mạch | 79,3% | 88,3% |
| … kiếp Bộ Xương | 44,9% | 50,3% |
| Quyết định thuộc mạch | 41,4% | 54,6% |
| Quyết định mỗi đời | | 53,6 |
| Mạch khép mỗi đời (trừ dở dang, phai) | 11,7 | 8,9 (mạch dài 5 hồi) |
| Mạch không phải mạch chính: chạy nền / dở dang / phai | | 19 / 14 / 3% |
| Trỗi dậy | 22,4% | 19,0% |
| Tử trận trước quái | 10,5% | 12,5% (hơi cao: thêm trận săn ở Báo thù, hộ tống ở Ơn cứu mạng) |

200 đời (nửa Tự sống, nửa chọn ngẫu nhiên): không lỗi, không đời nào kẹt; đủ 27 mạch chạy; 9 trong 14 kết mới của mạch chính xuất hiện (Thoát nghèo bằng nghề, Võ đạo tự luyện, Tác phẩm lối mới, Người đứng đầu không ngồi ghế, Bí mật cổ xưa, Chuộc lỗi được tha, Tên nhà liên hôn, Bỏ trốn cùng nhau, Đội dân canh).

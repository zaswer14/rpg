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

## 2. Ba tầng mạch

| Tầng | Là gì | Cùng lúc tối đa | Mã |
|---|---|---|---|
| Mạch chính | một mạch cả đời: 5 hồi và một nhịp lặp | 1 | `G.SAGA` (`saga.js`) |
| Mạch phụ | mạch người quen: Đối thủ, Ơn cứu mạng, Mối thù, Báo thù, Tình xưa, Thầy trò, Mộng ước, Ruột thịt, Bạn thân, Kẻ săn, Đứa bé tặng hoa | `arcMax` 3 | `story.js` |
| Mạch ngắn | một hai hồi, mọc từ quyết định thường; cùng tầng với các mạch cũ ngắn: Người mang ơn, Nợ cờ bạc, Bí mật, Người mất tích, Lời bà đồng | `shortMax` 3 | `G.SAGA_SHORT` (`saga.js`) |

`G.ARCS[k].tier` ghi tầng (mặc định `side`). `G.arcOpen` giới hạn số mạch theo từng tầng. Mạch chính cả đời đứng làm "mạch chính của chương": câu hỏi chương, kéo trọng số × `mainK`. Chưa có mạch chính thì vẫn dùng mạch phụ mở đầu tiên như cũ.

## 3. Mạch chính

### 3.1 Tám mạch

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
- Mạch chính chưa đổi thứ khác ngoài chỉ số, tiền, tầng lớp, danh vọng, dấu: Người đứng đầu chưa thành trưởng khu thật, Chân trời chưa thật sự đổi vùng.
- Mạch chính, mạch ngắn chưa đổi giọng theo giống loài.
- Chưa nối xuyên kiếp (`docs/13` mục 5).

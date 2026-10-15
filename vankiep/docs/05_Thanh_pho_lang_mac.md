# Thành phố, làng mạc: mạng khu dân cư của mỗi quốc gia

**Ngày:** 15/10/2026 · **Trạng thái:** đã code phần dựng thế giới (bước 2, `vankiep/js/realm.js`); công trình, vai trò chưa tác động lên đời, lớn lên / suy tàn chưa chạy. · **Thuộc:** `docs/03_Thiet_ke_ban_do_Varen_V2.md` (thay phần chọn chỗ khu dân cư ở mục 3.1 và cách chia tỉnh ở mục 5.1), `docs/04_Mau_quoc_gia.md` (mẫu quốc gia). · **Tên:** `vankiep/shared/names/names.js`.

Thiết kế 03 cho mỗi thế giới khoảng 30 khu dân cư, mỗi cái là một tỉnh. Như vậy một nước chỉ có 4–6 chấm trên bản đồ, và mọi người đều sinh ra ở "thành". File này thêm một mạng khu dân cư phân cấp cho mỗi nước: một kinh đô, vài thành phố, nhiều thị trấn, rất nhiều làng và thôn, cùng các điểm có vai trò riêng (cảng, mỏ, đồn, tu viện). Nơi sinh quyết định cuộc đời giống cách 1in8b phân biệt thành thị và nông thôn: con nhà làng khó đi học, ít thầy thuốc, nhưng ít dịch hơn dân thành phố.

## 1. Tham khảo

| Nguồn | Ý chính | Dùng vào |
|---|---|---|
| **Lý thuyết điểm trung tâm** (Christaller, 1933) | Khu dân cư xếp bậc; mỗi bậc phục vụ một vùng quanh nó; bậc càng cao càng ít và cách nhau càng xa | Bậc khu dân cư, khoảng cách tối thiểu theo bậc, công trình theo bậc |
| **Luật thứ hạng – quy mô** (Zipf) | Thành phố lớn thứ n có dân ≈ 1/n thành phố lớn nhất | Kiểm tra phân bố dân |
| **Medieval Demographics Made Easy** (S. John Ross) | Thôn 20–80 người, làng 100–1.000, thị trấn 1.000–8.000, thành phố 8.000–12.000+; 90–95% dân sống ở nông thôn; mỗi dịch vụ cần một số dân tối thiểu | Cỡ dân từng bậc, tỉ lệ thành thị, ngưỡng có công trình |
| **Azgaar's Fantasy Map Generator** | Dân = nông thôn (theo ô) + đô thị (theo thành); thủ đô, cảng; khu dân cư đặt theo điểm phù hợp | Dân nông thôn theo sức chứa ô; vai trò cảng |
| **Mount & Blade** | Thành phố có lâu đài và các làng gắn vào; làng sản xuất cho thành | Tỉnh = thành phố / thị trấn + các làng vệ tinh |
| **Battle Brothers** | Làng → thị trấn → thành phố; điểm phụ (trại gỗ, mỏ, xưởng) gắn vào và quyết định hàng bán | Vai trò sản xuất của làng, công trình quyết định nghề |
| **Dwarf Fortress** | Mỗi nền văn minh có kiểu khu dân cư riêng (pháo đài người lùn, thành cây tiên tộc, trại goblin) | Phong cách khu dân cư theo chủng tộc |
| **1 in 8 Billion** | Cờ thành thị / nông thôn đổi xác suất đi học, thu nhập, tai nạn, bệnh | Ảnh hưởng của nơi sinh lên đời |

## 2. Bậc khu dân cư

| Bậc | `tier` | Dân (người) | Trên bản đồ | Khoảng cách tối thiểu tới khu cùng bậc trở lên |
|---|---|---|---|---|
| **Kinh đô** | `capital` | 12.000–40.000 | ô vuông vàng to, có cờ, luôn có tên | 220px |
| **Thành phố** | `city` | 5.000–12.000 | ô vuông to, luôn có tên | 120px |
| **Thị trấn** | `town` | 1.000–5.000 | ô vuông vừa, tên khi rê chuột | 70px |
| **Làng** | `village` | 150–1.000 | ô vuông nhỏ | 35px |
| **Thôn** | `hamlet` | 20–150 | chấm | 18px |

Dân ở bảng trên là **dân đô thị** (sống trong khu dân cư). Phần lớn dân sống rải trên đồng ruộng, rừng, đồi quanh làng: đó là **dân nông thôn**, tính theo ô (mục 5).

**Vai trò** gắn thêm vào một khu dân cư bất kỳ bậc nào (một khu có thể có nhiều vai trò):

| Vai trò | Điều kiện | Ghi chú |
|---|---|---|
| `port` cảng | giáp biển hoặc hồ lớn | có tàu (03 mục 7.3); làng cảng chỉ có thuyền chài |
| `fort` đồn | giáp tầng lõi / vùng chết, đèo, hoặc biên nước thù | dân ít, lính nhiều; tuần tra × 1,4 |
| `mine` mỏ | trong 3 ô có đồi / núi, biome có quặng (`crystal_cave`, `ash_peak`, `forge_ruins`, `frost_tundra`, `storm_spire`) | sinh kế thợ mỏ |
| `lumber` trại gỗ | trong 2 ô có rừng / rừng rậm, nước không có `no_logging` | sinh kế tiều phu |
| `fishing` làng chài | giáp biển, hồ hoặc sông lớn | sinh kế ngư dân |
| `farm` làng ruộng | mặc định của làng / thôn trên đồng trống, đồi | sinh kế nông dân, chăn nuôi |
| `temple` đền / tu viện | nước thần quyền, hội dòng; hoặc ngẫu nhiên ở chỗ xa | sinh kế tu sĩ; Devotion |
| `market` chợ biên | thị trấn gần biên hai nước không thù nhau | thương nhân, buôn lậu |
| `ruin` phế tích | khu dân cư đã sụp (03 mục 3.1) | không có dân; sự kiện, hang ổ |

## 3. Số lượng theo nước

Theo cỡ mẫu quốc gia (`size` ở 04):

| Cỡ | Kinh đô | Thành phố | Thị trấn | Làng | Thôn | Tổng | Tỉnh |
|---|---|---|---|---|---|---|---|
| S (2–3 tỉnh) | 1 | 0–1 | 1–2 | 4–6 | 4–8 | ~12 | 2–3 |
| M (4–5 tỉnh) | 1 | 1–2 | 2–3 | 7–10 | 8–12 | ~24 | 4–5 |
| L (6–8 tỉnh) | 1 | 2–3 | 3–5 | 11–16 | 12–18 | ~38 | 6–8 |

Một thế giới 6 nước khoảng 140 khu dân cư có dân, cộng 10–20 khu ở đất vô chủ (làng, thôn, đồn của dân bản địa biome, và phế tích).

**Tỉnh** = mỗi kinh đô, thành phố, thị trấn là một thủ phủ; làng và thôn gắn vào thủ phủ gần nhất theo chi phí đi. Cách này cho 4–5 tỉnh mỗi nước cỡ M, khớp con số ~30 tỉnh của 03.

## 4. Phong cách theo chủng tộc

Mẫu quốc gia quyết định khu dân cư trông thế nào và đặt ở đâu.

| Chủng tộc | Ưa đặt ở | Tỉ lệ đô thị | Bậc nổi bật | Công trình đặc trưng | Riêng |
|---|---|---|---|---|---|
| Nhân Loại | đồng có sông, ven biển | 15% | nhiều làng ruộng, thành phố có tường đá | Đấu trường (kinh đô), Học viện | |
| Tiên Tộc | rừng, rừng cổ thụ | 25% | ít khu, thành trên cây | Cây Mẹ (đền `wild`) | không có làng `mine`; trại gỗ chỉ khi không có `no_logging` |
| Người Lùn | rìa núi, đồi, hang tinh thể | 35% | sảnh trong núi, nhiều làng mỏ | Sảnh Rune, lò lớn | **được đặt trên ô núi** (pháo đài khoét vào núi) |
| Orc | thảo nguyên, sa mạc, đồi | 10% | trại, ít thị trấn | Hố đấu | tường chỉ là hàng rào cọc; Hãn quốc dời kinh đô |
| Người Thú | rừng thưa, thảo nguyên | 10% | ổ, trại, nhiều thôn | Cột totem | |
| Yêu Tinh | trảng mộng, rừng | 20% | vòng nấm, rất nhỏ | Vòng Nấm Lớn | không có tường; dân ít mà sống lâu |
| Hải Tộc | bờ biển, vịnh, đảo | 30% | mọi khu đều ven nước | Bến tàu lớn | **mọi khu dân cư phải là cảng**; M5 có làng dưới nước (ô biển ven bờ) |
| Long Nhân | đồi cao, núi tro, đỉnh bão | 30% | ít khu, khu nào cũng to | Đài lửa | không có thôn |
| Cơ Nhân | phế xưởng, đồi, đồng | 85% | xưởng, trạm | Lò Đúc Mẹ | không ăn: không có làng `farm`, thay bằng `mine` và trạm nạp |
| Bộ Xương | đồi mộ, vực, sa mạc | 70% | thành mộ, nghĩa trang | Lăng chính | không ăn: không có làng `farm`; thôn là nghĩa trang |

Chính thể chỉnh thêm:

| Chính thể | Chỉnh |
|---|---|
| `merchant` | thêm 1 thị trấn; thị trấn ven biển thành cảng; chợ biên × 2 |
| `tribal`, `horde` | không có thành phố (thay bằng thị trấn); thêm thôn |
| `theocracy`, `order` | mỗi tỉnh một `temple`; thêm 1–2 tu viện ở chỗ xa |
| `military` | mọi thị trấn biên có `fort`; thêm 1 đồn |
| `magocracy` | kinh đô có Tháp Pháp Sư (công trình riêng) |
| `confederacy` | kinh đô chỉ là thị trấn lớn; thêm làng |
| `collective`, `necrocracy` | theo dòng Cơ Nhân / Bộ Xương ở bảng trên |

## 5. Dân nông thôn

Mỗi ô đất có **sức chứa** (người / ô):

| Đặc trưng | Sức chứa |
|---|---|
| đồng trống | 100 (có sông 150) |
| đồi | 50 |
| rừng | 30 |
| rừng rậm, đầm | 15 |
| núi | 5 (Người Lùn: 40) |
| hồ | 0 |

Nhân hệ số biome (đồng lúa 1,3; thảo nguyên, rừng 1,0; băng nguyên .4; sa mạc .3; vực .1), ven biển × 1,2, vùng chết × 0. Chủng tộc không ăn (Cơ Nhân, Bộ Xương) không có dân nông thôn.

Dân nông thôn của mỗi ô thuộc về **làng hoặc thôn gần nhất** (theo chi phí đi, trong 40px); xa hơn thì là dân rải rác của tỉnh. Mỗi nước chỉ nhận dân nông thôn trên đất mình, rồi nhân để tỉ lệ đô thị khớp bảng mục 4. Toàn đại lục khoảng 2–4 triệu người.

## 6. Công trình

Công trình quyết định khu dân cư cho người ở đó làm gì, học gì, chữa bệnh ở đâu. Bậc càng cao càng đủ.

| Công trình | Làng | Thị trấn | Thành phố | Kinh đô | Tác dụng |
|---|---|---|---|---|---|
| Đền / miếu (quốc giáo) | miếu 60% | đền | đền lớn | thánh đường | sinh kế tu sĩ; Devotion; quỹ cứu đói |
| Thầy thuốc | thầy lang 40% | thầy thuốc | nhà thương | nhà thương lớn | tử vong trẻ em × 1,15 / 1,0 / .9 / .85 / .8 (không có / lang / thuốc / thương / thương lớn); khỏi bệnh nhanh hơn |
| Trường | | trường làng 50% | trường | học viện | focus Học chữ × .6 / .8 / 1,0 / 1,2; sinh kế học giả cần học viện hoặc trường |
| Lò rèn | 50% | có | có | có | sinh kế thợ rèn; trang bị mua được tối đa bậc 1 / 2 / 3 / 4 |
| Chợ | phiên | chợ | chợ lớn | chợ lớn | sinh kế thương nhân (cần chợ); giá hàng |
| Doanh trại | | đồn | có | có | sinh kế lính canh; nghĩa vụ; chống thú triều |
| Hội Mạo Hiểm | | 50% | có | có | lệnh treo thưởng; mạo hiểm giả thu nhập đủ (không có hội: × .6) |
| Tường | | rào cọc | tường đá | tường đá đôi | thú triều, chiến tranh làm mất `hp` × 1 / .7 / .5 / .35 |
| Đấu trường, thư viện, tháp pháp sư, xưởng đúc, lăng | | | theo chủng tộc / chính thể | theo chủng tộc / chính thể | công trình đặc trưng ở mục 4 |

Công trình đi theo bậc lúc tạo. Khu dân cư lên bậc thì có thêm; xuống bậc thì mất dần (mỗi năm 20% mất một cái không còn đủ dân).

## 7. Ảnh hưởng lên đời

| Chỗ | Hiện tại | Sau khi có mạng khu dân cư |
|---|---|---|
| Sinh | bốc vùng → bốc khu dân cư theo `pop` | bốc tỉnh theo tổng dân → bốc **đô thị / nông thôn** theo tỉ lệ → đô thị: bốc khu dân cư theo dân; nông thôn: bốc làng / thôn theo dân nông thôn của nó |
| Cờ `S.urban` | không có | đúng khi ở thị trấn trở lên; đổi khi chuyển nhà |
| Tầng lớp | theo độ giàu vùng | nông thôn: lệch về Nông hộ; kinh đô: thêm Quý tộc, Thương gia |
| Sinh kế | cờ `town:true` (khác `village`) | đọc công trình và vai trò: thợ rèn cần lò rèn, thương nhân cần chợ, học giả cần trường, tu sĩ cần đền, lính canh cần doanh trại, thợ mỏ cần `mine`, ngư dân `fishing` hoặc `port`, tiều phu `lumber`, thủy thủ `port` thị trấn trở lên, kẻ trộm thị trấn trở lên |
| Bệnh | dịch theo vùng | dịch × 1,4 ở thành phố, kinh đô; × .7 ở thôn. Tử vong trẻ em theo thầy thuốc |
| Học | focus Học chữ như nhau | nhân theo trường |
| Thú triều | đánh "làng" chung chung | đánh khu dân cư cụ thể gần tầng ven quá đông; tường giảm thiệt hại; thôn bị xóa nhanh nhất |
| Quyết định mới | | **Lên thành** (đổi nông thôn → đô thị, cần tiền, mất quan hệ làng), **Về quê**, **Học nghề ở thành** (rời nhà lúc thiếu niên) |
| Sự kiện mới | `tn_tourney_watch` ở kinh đô | chợ phiên, hội làng, mất mùa, sói vào làng (thôn), hỏa hoạn thành phố, bạo loạn bánh mì, lễ đăng quang (kinh đô), đội tuyển lính về làng, thầy lang làng, học bổng lên học viện |

## 8. Đặt khu dân cư (thay bước chọn chỗ ở 03 mục 3.1)

Chạy sau khi có địa hình (bước 1), trước độ hoang:

1. **Điểm phù hợp mỗi ô**: như 03 (sông +3, biển +2, hồ +1, đồng / đồi +1, đầm −3, rừng rậm −2, loại núi và hồ) × hệ số biome; cộng điểm ưa thích của chủng tộc (bảng mục 4).
2. **Kinh đô** các nước theo mẫu (04 mục 6 bước 3).
3. **Lãnh thổ ban đầu**: Dijkstra từ mỗi kinh đô theo chi phí đi (biome không ưa × 1,5) tới khi đủ diện tích theo cỡ (S 6%, M 10%, L 15% diện tích đất). Ô hai nước cùng muốn thuộc về nước tới trước. Đất còn lại là vô chủ.
4. **Trong lãnh thổ mỗi nước**, đặt theo thứ tự bậc: thành phố → thị trấn → làng → thôn. Mỗi bậc bốc Poisson-disc trên các ô có điểm cao nhất, giữ khoảng cách ở mục 2, cho tới đủ số ở mục 3. Nước có bờ biển: ít nhất một thị trấn là cảng.
5. **Vai trò**: gắn theo điều kiện ở mục 2 (mỏ, gỗ, chài, ruộng, đồn, chợ biên).
6. **Đất vô chủ**: 10–20 làng, thôn, đồn của chủng tộc bản địa biome; 3–6 phế tích.
7. **Tỉnh**: mỗi kinh đô / thành phố / thị trấn là thủ phủ; làng và thôn gắn vào thủ phủ gần nhất theo chi phí đi.
8. **Dân**: dân đô thị bốc theo bậc (luật thứ hạng – quy mô trong mỗi nước: thành phố thứ n ≈ kinh đô / (n + 1)); dân nông thôn theo mục 5.
9. **Công trình** theo bậc (mục 6), cộng công trình đặc trưng của chủng tộc và chính thể.
10. **Tên** theo mục 10.
11. **Đường** (03 mục 3.2) đi theo bậc: kinh đô – thành phố – thị trấn bằng đường cái; làng tới thị trấn gần nhất bằng đường mòn; thôn tới làng gần nhất bằng lối nhỏ (vẽ mảnh, không thành nguồn văn minh riêng).

Độ hoang (03 mục 3.3) giờ có nhiều nguồn hơn. Bán kính `R_s` theo bậc: kinh đô 120, thành phố 100, thị trấn 80, làng 50, thôn 25, đồn 70.

## 9. Lớn lên, suy tàn

Mỗi năm, mỗi khu dân cư:

- **Dân** × (1 + .01 × (giàu − .4) + .01 × (ổn định nước − .5)) − thiệt hại (dịch, thú triều, chiến tranh). Dân đô thị còn nhận người từ làng quanh nó (đô thị hóa) theo `ambition` của nước.
- **Lên bậc** khi dân vượt mức trên của bậc 10 năm liền; **xuống bậc** khi dưới mức dưới 10 năm liền. Thôn lên làng, làng lên thị trấn (thành thủ phủ tỉnh mới, tách tỉnh), thị trấn lên thành phố.
- `hp` và trạng thái `thriving / dwindling / ruined` như 03 mục 3.1. Thôn và làng sụp dễ hơn, thành phố gần như không sụp (trừ chiến tranh mất thủ đô).
- Làng mới (03 mục 3.1, 5.5) mọc ở chỗ trống có điểm phù hợp cao trong tầng sâu.

Mục tiêu sau 300 năm: tổng số khu dân cư dao động ±15%, mỗi thế kỷ 1–3 làng lên thị trấn, 0–1 thị trấn lên thành phố.

## 10. Tên

Mỗi khu dân cư: `kind[chủng tộc][bậc hoặc vai trò]` + gốc tên. Gốc tên lấy từ `settlement.root` của chủng tộc; hết thì ghép `settlement.part.a` + `settlement.part.b` (12 × 12 = 144 tổ hợp mỗi chủng tộc). Vai trò rõ nét thì dùng chữ của vai trò thay cho bậc: làng mỏ của Người Lùn là "Mỏ Đá Lửa", làng chài Nhân Loại là "Xóm Chài Bờ Lau". Bảng chữ ở `names.js`.

## 11. Giao diện

- Chế độ xem Chính trị (03 mục 9): mọi khu dân cư theo ký hiệu bậc; màu viền theo nước.
- Chế độ Địa hình, Vùng: kinh đô và thành phố có tên; thị trấn, làng hiện ký hiệu; thôn là chấm.
- Rê chuột lên một khu dân cư: tên, bậc, dân, nước, chủng tộc chính, công trình (biểu tượng nhỏ), vai trò.
- Bảng nhân vật: dòng "Nơi ở" ghi rõ "Làng Cối Xay (làng, 420 người), tỉnh Bến Nô" hoặc "vùng quê quanh Làng Cối Xay".

## 12. Kiểm tra

`validateWorld` / `sim.html` thêm:

| Kiểm tra | Mục tiêu |
|---|---|
| Khu dân cư trên hồ, biển; trên núi mà không phải Người Lùn | lỗi |
| Khu dân cư không nối được bằng đường tới thủ phủ tỉnh | lỗi |
| Nước Hải Tộc có khu không phải cảng | lỗi |
| Tỉ lệ đô thị toàn đại lục | 12–25% |
| Dân kinh đô / dân thành phố lớn thứ hai | 1,5–3 |
| Số khu dân cư mỗi nước so với bảng mục 3 | trong khoảng |
| Đời sinh ở nông thôn | 70–85% |
| Tuổi thọ, tử vong trẻ em: nông thôn so với kinh đô | kinh đô sống thọ hơn nông thôn 3–8 năm nhưng chết vì dịch nhiều hơn |

## 13. Thứ tự làm

Mạng khu dân cư cần lãnh thổ quốc gia, lãnh thổ cần kinh đô, kinh đô cần mẫu quốc gia. Vì vậy bước 2 và 4 cũ của 03 gộp lại thành một bước, làm trước độ hoang:

| Bước mới | Việc |
|---|---|
| 2 | Nạp `names.js`; dữ liệu 50 mẫu (`data/nations.js`); kinh đô, lãnh thổ, mạng khu dân cư phân cấp, vai trò, công trình, dân, tỉnh, tên; quốc gia **tĩnh**; chế độ xem Chính trị; màn tạo thế giới. Sinh ra ở thành thị / nông thôn |
| 3 | Bảng 4 tầng theo biome; độ hoang từ mạng khu dân cư; encounter đọc theo ô |
| 4 | Sinh kế theo công trình; luật, thuế, thái độ chủng tộc vào đời |
| 5 trở đi | như 03 (đường, biển, quốc gia động, hang ổ, lập làng / nước, sự kiện) |

## 14. Kết quả bước 2 (15/10/2026)

Đo bằng `sim.html` (thế giới `can-bang`, 1000 đời; nút Thử nhiều thế giới, 100 thế giới):

| Số đo | Kết quả | Mục tiêu |
|---|---|---|
| Lỗi dữ liệu thế giới (khu trên nước, trên núi, Hải Tộc không ven nước) | 0 / 100 thế giới | 0 |
| Số nước | 5: 14%, 6: 59%, 7: 27% | 5–7 |
| Khu dân cư / thế giới | ~145 | ~140 |
| Tỉnh / thế giới | ~34 | ~30 |
| Tỉ lệ đô thị | ~17% | 12–25% |
| Đất vô chủ | ~24% | 15–25% |
| Mẫu quốc gia ra ít nhất một lần | 50 / 50 | tất cả |
| Đời sinh ở nông thôn | ~77% | 70–85% |
| Trận vượt Tier + 1 | 0 | 0 |

Khác với thiết kế ở trên:

- Diện tích mục tiêu của mỗi nước không phải tỉ lệ cố định (S 6%, M 10%, L 15%) mà chia ~86% đất theo tỉ trọng S : M : L = 1 : 1,7 : 2,4, để đất vô chủ không phụ thuộc số nước bốc ra.
- Dân rải rác ngoài vùng quê của làng (xa hơn chi phí 14) được chia cho làng / thôn cùng tỉnh, để ai cũng có một khu dân cư làm nơi sinh.
- 100 thế giới cho 40 cảnh báo "đất chật, thiếu vài làng / thôn / thị trấn" ở nước bị kẹp giữa nước khác; chưa xử lý.

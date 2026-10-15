# Cấu trúc lại bản đồ Vạn Kiếp: quốc gia, vùng nguy hiểm, biển, rừng rậm

**Ngày:** 15/10/2026 · **Trạng thái:** đã chọn phương án (15/10/2026), chưa sửa code. Thiết kế chi tiết: `research/03_Thiet_ke_ban_do_Varen_V2.md`.

**Đã chọn:** A2 hai lớp · B2 quốc gia động · D2 vùng biển có tầng · đợt đầu làm cả C2 độ hoang theo văn minh, C3 hang ổ, E2 lớp đặc trưng (rừng rậm, đầm, núi, sông), F1 đường xá và hành trình. Tức là gói **Vừa** ở mục 4. · **Liên quan:** `LifeSim_RPG/` (README mục 2), `research/01_Life_Sim_1in8b.md`.

## 1. Bản đồ hiện tại làm được gì, thiếu gì

`js/map.js` dựng raster 250 × 175 ô (mỗi ô 4px trên khung 1000 × 700) từ 16 tâm vùng trong `data/world.js`: Voronoi có trọng số theo bán kính, bẻ cong bằng noise, ô nào xa mọi tâm quá ngưỡng bờ thì thành biển. Mỗi vùng là **một biome**, có chỉ số kiểu 1in8b (giàu, Gini, nguy hiểm, ma lực, chủng tộc, giáo phái) và đúng **3 khu** ven / sâu / lõi, chia theo phân vị khoảng cách tới khu dân cư chính (45% / 35% / 20%).

Những thứ đang là "chỉ số" chứ chưa có hình trên bản đồ:

| Thứ | Hiện tại | Hạn chế |
|---|---|---|
| Quốc gia | Không có. Vùng vừa là đơn vị sinh thái vừa là đơn vị kinh tế | Không có luật, thuế, quốc giáo, biên giới; vùng nào cũng giống một nước nhỏ |
| Chiến tranh | `rs.war` của hai vùng kề có thành/đồn, giảm 0,25/năm | Không ai thắng thua, bản đồ không đổi |
| Vùng nguy hiểm | `danger` cố định theo vùng + 3 khu cố định tỉ lệ | Văn minh không lan, hoang dã không lấn; mọi vùng đều có đúng 3 tầng |
| Biển | Nền trống + 2 tuyến biển (`SEA_ROUTES`) | Không có quái biển ngoài khơi, không có hải trình, ngư dân chỉ xét `region.coastal` |
| Rừng rậm, đầm, núi, sông | Chỉ có nếu cả vùng là biome đó | Một vùng không thể vừa có đồng vừa có rừng; chưa có biome rừng rậm nhiệt đới |
| Đi lại | Nhảy sang vùng kề, gặp quái ở khu ven vùng đích | Không có quãng đường, địa hình không ảnh hưởng gì |

Những thứ phải giữ khi cấu trúc lại:

- Luật phân cấp Tier (`validateWorld`, `encounterTable`, `zonesFor`): khu nào cũng có dải `[lo, hi]`, `hi − lo ≤ 2`, nhân vật Tier t chỉ gặp loài ≤ t + 1.
- Bản đồ suy hoàn toàn từ dữ liệu + seed, không lưu raster vào save.
- Không sửa `library/`. Biome và loài mới vào `data/ecology.js`.
- `sim.html` chạy 1000 đời vẫn phải sạch lỗi dữ liệu và giữ 0 trận vượt Tier + 1.

## 2. Các game đã tham khảo

| Game / công cụ | Cách tổ chức bản đồ | Lấy được gì cho Vạn Kiếp |
|---|---|---|
| **1 in 8 Billion** | Không có địa lý. Nước là bản ghi phẳng ~40 trường, mọi xác suất suy từ đó | Quốc gia nên là bản ghi chỉ số (thuế, luật, tuổi thọ, chiến tranh), không cần hình học phức tạp mới có tác dụng |
| **Azgaar's Fantasy Map Generator** | Heightmap → nhiệt độ (vĩ độ + độ cao) và lượng mưa (gió, bóng mưa) → ma trận biome. Thành phố đặt theo độ phù hợp; nước lan từ thủ đô theo chi phí (biome, độ cao, sông); tỉnh chia nhỏ nước; đường nối thành phố | Tách **lớp tự nhiên** (biome) khỏi **lớp hành chính** (nước, tỉnh). Nước lan theo chi phí địa hình cho biên giới trông tự nhiên |
| **Red Blob Games, Polygon map generation** | Đa giác Voronoi, độ cao theo khoảng cách tới bờ, sông chảy xuống dốc, độ ẩm từ sông hồ, biome tra bảng Whittaker (độ cao × độ ẩm) | Cách sinh rừng rậm, đầm, sông từ hai trường số; hợp với raster sẵn có |
| **Dwarf Fortress** | Mỗi vùng có hai trục "hoang dã" (savagery) và "thiện/ác"; loài sinh ra theo hai trục đó. Các nền văn minh mở rộng và đánh nhau qua vài trăm năm lịch sử sinh trước khi chơi | Trục độ hoang thay cho 3 khu cứng; lịch sử chạy trước để mỗi thế giới có quá khứ riêng |
| **Crusader Kings III** | Thái ấp → hạt → công quốc → vương quốc → đế quốc; ranh "theo luật" khác ranh "thực tế". Địa hình (rừng, rừng rậm, đồi, núi, đầm, sa mạc) đổi lợi thế phòng thủ, tốc độ phát triển, giới hạn tiếp tế | Quốc gia là cụm tỉnh, chiến tranh chuyển từng tỉnh. Địa hình là hệ số nhân, không cần cơ chế riêng |
| **Battle Brothers** | Bản đồ sinh ngẫu nhiên; nhà quý tộc và thành bang giữ các thị trấn. Trại địch mọc ở nơi xa thành và đường; càng ngày, càng xa văn minh càng mạnh. Địa hình đổi tốc độ đi, tầm nhìn, thế cao | Độ nguy hiểm theo **khoảng cách tới văn minh**; hang ổ là điểm cụ thể dọn được và mọc lại |
| **Mount & Blade II: Bannerlord** | Phe sở hữu thành, lâu đài; làng gắn với thành. Hang cướp sinh trong vùng hoang. Rừng làm chậm hành quân | Tỉnh = khu dân cư chính + vùng phụ; mất thành là mất tỉnh |
| **Kenshi** | Mỗi vùng có phe kiểm soát và mức nguy hiểm; giết thủ lĩnh phe thì vùng đổi trạng thái | Thế giới đổi theo hành động của người chơi; hợp với chuỗi kiếp Bộ Xương quay lại quê cũ |
| **RimWorld** | Ô thế giới có biome (nhiệt độ, mưa, độ cao), độ dốc, đường, sông. Thời gian đi của đoàn lữ hành phụ thuộc địa hình và đường | Đường xá giảm chi phí và nguy hiểm khi đi |
| **Sunless Sea** | Biển chia ô theo chủ đề; càng xa cảng nhà càng nguy hiểm; mỗi chuyến tốn nhiên liệu, lương thực, tinh thần | Biển là vùng chơi có tầng nguy hiểm riêng, không phải nền trống |
| **Civilization** | Địa hình nền + đặc trưng chồng lên (rừng, rừng rậm, đầm, bãi bồi) + sông | Lớp đặc trưng chồng lên biome, một vùng có nhiều kiểu đất |

## 3. Các phương án

Mỗi nhóm chọn một (trừ nhóm F chọn nhiều). Cỡ việc: **nhỏ** (sửa vài hàm, không đổi dữ liệu vùng), **vừa** (thêm lớp dữ liệu + sửa `map.js`, `systems.js`), **lớn** (viết lại `map.js` và dữ liệu `world.js`).

### A. Khung bản đồ

| | Phương án | Cách làm | Được | Mất | Cỡ |
|---|---|---|---|---|---|
| A1 | **Giữ 16 vùng, thêm lớp phủ** | Quốc gia = danh sách vùng. Biển, rừng rậm thành vùng mới cùng kiểu cũ | Ít đụng code, save cũ gần như dùng lại được | Vùng vẫn là một biome; biên giới nước trùng biên giới sinh thái, trông giả | nhỏ |
| A2 | **Hai lớp: tự nhiên và hành chính** *(đề xuất)* | Lớp tự nhiên: độ cao + nhiệt + ẩm → biome từng ô (bảng Whittaker ánh xạ vào 16 biome sẵn có + biome mới). Lớp hành chính: tỉnh = Voronoi quanh khu dân cư lớn, quốc gia = cụm tỉnh lan từ thủ đô theo chi phí địa hình | Một tỉnh có thể có đồng ở gần làng, rừng rậm ở sau núi. Biên giới theo sông, núi như thật | Viết lại `buildMap`; chỉ số kinh tế chuyển từ vùng sang tỉnh; bảng loài chuyển từ vùng sang biome × độ hoang | lớn |
| A3 | **Đồ thị địa điểm** | Bỏ raster làm cơ sở; mỗi địa điểm là một nút, cạnh mang địa hình và quãng đường. Raster chỉ còn để vẽ | Rẻ, dễ cân bằng, giống 1in8b | Mất bản đồ sinh động hiện có; rừng, biển chỉ còn là nhãn | vừa |

### B. Quốc gia

| | Phương án | Cách làm | Cỡ |
|---|---|---|---|
| B1 | **Quốc gia tĩnh** | 5–7 nước cố định, mỗi nước một bản ghi kiểu 1in8b (xem bảng trường bên dưới). Chiến tranh vẫn chỉ là chỉ số, biên giới không đổi | nhỏ |
| B2 | **Quốc gia động** *(đề xuất)* | Như B1, thêm: chiến tranh có bên thắng, chuyển 1–2 tỉnh; tỉnh nổi loạn khi ổn định thấp và có thể tách thành nước mới; nước không còn tỉnh thì diệt. Mỗi năm hệ `world` chạy một bước. Kiếp sau, nhất là kiếp Bộ Xương hay Tiên Tộc sống vài trăm năm, thấy bản đồ đã khác | vừa |
| B3 | **Động + lịch sử sinh trước** | Như B2, nhưng trước kiếp đầu chạy 300–500 năm lịch sử headless (kiểu Dwarf Fortress), ghi biên niên sử: nước nào lập, diệt, trận nào, chúa vùng nào bị hạ. Sự kiện trong đời có thể nhắc lại sử | lớn |

Trường của một quốc gia (dùng chung cho cả ba phương án):

| Trường | Ví dụ | Tác dụng lên đời nhân vật |
|---|---|---|
| `gov` chính thể | quân chủ, hội đồng thương nhân, bộ lạc, thần quyền, vô chủ | Đường thăng tiến (tước, hội, thủ lĩnh), ai được làm quan |
| `tax` | 0,05–0,35 | Trừ vào thu nhập `G.incomeAt` |
| `faith` quốc giáo | `light`, `forge`, `wild`… (giáo phái thư viện) | Devotion lên nhanh hơn; ngoại đạo bị kỳ thị |
| `laws` | cấm hắc thuật, săn Bộ Xương, nghĩa vụ quân sự, cấm ngoại tộc cư trú, treo thưởng quái | Bộ Xương ở nước `light` bị truy lùng; Tiên Tộc chỉ cho ngoại tộc ở một mùa (đã có trong lore Ngân Diệp) |
| `races` thái độ | ưu ái / bình thường / kỳ thị theo chủng tộc | Hệ số thu nhập, nguy cơ bị cướp, sự kiện |
| `army`, `stability` | sức quân, ổn định | Xác suất chiến tranh, thắng thua, nổi loạn |
| `patrol` | 0–1 | Tỉa quái ở khu ven mạnh hay yếu; nước giàu, ổn định thì vùng an toàn rộng hơn |

Phác thảo nước cho Varen, chỉ để hình dung, tên chưa chốt: Vương quốc Aurel (Kim Hà, Rêu Thầm, Tro Tàn, quốc giáo Quang Minh), Rừng quốc Lá Bạc (Ngân Diệp, Mộng Ảo, cấm ngoại tộc ở lâu), Thị quốc Hải Đăng (Sương Mù, Hải Xà, hội đồng thương nhân), Lò Đồng (Thạch Lâm, Băng Nguyên, quốc giáo Lò Rèn), Hãn quốc Gió Hú (Gió Hú, Hồng Sa, bộ lạc). Lôi Vân, Hỏa Diệm, Xưởng Đúc, Lục Chướng, Hắc Uyên để vô chủ hoặc thành nước nhỏ.

### C. Vùng nguy hiểm

| | Phương án | Cách làm | Cỡ |
|---|---|---|---|
| C1 | **Giữ 3 khu cố định** | Như hiện tại, chỉ đổi tỉ lệ theo quốc gia (`patrol` cao thì khu ven to hơn) | nhỏ |
| C2 | **Độ hoang theo khoảng cách văn minh** *(đề xuất)* | Mỗi ô có độ hoang = khoảng cách tới khu dân cư / đường gần nhất, chia theo cỡ khu dân cư và `patrol` của nước. Khu ven / sâu / lõi (có thể thêm "vùng chết" T4–5) là các ngưỡng độ hoang. Làng bị thú triều xóa hoặc chiến tranh làm đồn bỏ hoang thì hoang dã lấn vào; làng mới lập thì văn minh lan ra. Dải Tier của mỗi tầng vẫn cố định nên luật phân cấp giữ nguyên | vừa |
| C3 | **Hang ổ / hầm ngục** | Điểm trên bản đồ, mọc ở ô hoang khi mật độ khu lõi cao (thay một phần cơ chế thú triều). Có Tier riêng, có thủ lĩnh, dọn được để giảm mật độ cả vùng, bỏ lâu thì mọc lại. Gắn với lệnh treo thưởng đã có | vừa |
| C4 | **Vết loang** | Một số nguồn (Vực Hắc Uyên, Phế Xưởng Đúc, Đồi Mộ) lan dần ra ô bên cạnh, đổi bảng loài sang loài của nguồn và hạ giàu, tăng `magic`. Quốc gia đẩy lùi bằng quân hoặc tu sĩ | vừa |

C2, C3, C4 dùng chung được.

### D. Biển cả

| | Phương án | Cách làm | Cỡ |
|---|---|---|---|
| D1 | **Nền + thêm tuyến biển** | Như hiện tại, thêm tuyến và một sự kiện "bão trên tàu" | nhỏ |
| D2 | **Vùng biển có tầng** *(đề xuất)* | Chia biển thành vài vùng biển có tên (vịnh, eo, đại dương) theo lưu vực; mỗi vùng biển có 3 tầng theo khoảng cách tới bờ (`shore` đã tính sẵn, mở rộng quá 8 ô): ven bờ T0–1, khơi T1–3, biển sâu T3–5. Quái biển theo tầng (đã có Thủy Thi, Cá Mập Rạn, Hải Xà, Kraken Non, Nữ Yêu Biển). Ngư dân, thủy thủ làm việc ở vùng biển gần nhất. Đi biển là hải trình qua các tầng, có bão theo mùa và cướp biển | vừa |
| D3 | **D2 + hải quân và thương lộ** | Quốc gia ven biển có hạm đội; thương lộ biển làm giàu cảng; cướp biển là một phe không đất; Hải Tộc có làng dưới nước, sinh ra ngoài khơi | lớn |

### E. Rừng rậm, đầm, núi, sông

| | Phương án | Cách làm | Cỡ |
|---|---|---|---|
| E1 | **Thêm vùng biome mới** | Thêm 1–2 vùng kiểu cũ: "Rừng Rậm Nhiệt Đới" ở phía nam nóng ẩm, có thể thêm "Rặng Núi" làm tường ngăn giữa các nước. Cần biome + loài mới trong `data/ecology.js` | nhỏ |
| E2 | **Lớp đặc trưng chồng lên** *(đề xuất)* | Mỗi ô có thêm một đặc trưng: rừng, rừng rậm, đầm, đồi, núi, sông, hồ (sinh từ độ cao + độ ẩm). Đặc trưng nhân hệ số: tốc độ đi, quái phục kích dễ hơn (Stealth của nhân vật có giá trị), bảng loài cộng thêm (rừng rậm thêm loài phục kích, đầm thêm loài độc), sinh kế mới (tiều phu, lái đò), nguyên nhân chết mới (lạc rừng, sốt rừng, lũ) | vừa |
| E3 | **Biome sinh hoàn toàn từ khí hậu** | Đi kèm A2: không đặt biome bằng tay; nhiệt theo vĩ độ + độ cao, ẩm theo gió và bóng mưa. Rừng rậm tự xuất hiện ở nam ẩm, sa mạc sau núi chắn gió. Seed khác ra thế giới khác | lớn |

### F. Lớp thêm cho đợt đầu (chọn nhiều)

| | Lớp | Ghi chú |
|---|---|---|
| F1 | **Đường xá + đi lại có quãng đường** | Đường nối khu dân cư (A* trên raster, chi phí theo địa hình). Lên đường mất thời gian trong năm, gặp quái theo từng đoạn đi qua; đi trên đường an toàn hơn. Qua biên giới có trạm, có thể bị thu thuế hoặc bắt |
| F2 | **Sinh kế và sự kiện theo quốc gia** | Lính nghĩa vụ, quan lại, thu thuế, buôn lậu qua biên giới, bị truy nã ở một nước nhưng an toàn ở nước khác |
| F3 | **Chọn kích thước thế giới** | Giữ khung 1000 × 700 hoặc mở 1600 × 1100 (~28 tỉnh, 6–8 nước). Raster lớn hơn vẫn dựng nhanh vì vòng lặp chỉ O(ô × tâm) |
| F4 | **Bản đồ đổi theo seed thế giới** | Hiện seed bản đồ cố định `'varen'`. Cho seed thế giới riêng thì mỗi lượt chơi mới có đại lục khác; cần A2 + E3 để có ý nghĩa |

## 4. Gói gợi ý

| Gói | Chọn | Kết quả | Rủi ro |
|---|---|---|---|
| **Nhẹ** | A1 + B1 + C1 + D1 + E1 | Có quốc gia và luật, thêm rừng rậm; bản đồ gần như cũ | Thấp. Nhưng sau này muốn lên A2 phải làm lại |
| **Vừa** *(đề xuất)* | A2 + B2 + C2 + C3 + D2 + E2, F1 | Đại lục có nước thật, biên giới đổi qua các kiếp, hoang dã co giãn, biển chơi được, rừng rậm có tác dụng | Viết lại `map.js` và cách khai vùng trong `world.js`; phải cân lại bằng `sim.html` |
| **Đầy đủ** | Gói vừa + B3 + C4 + D3 + E3, F4 | Thế giới sinh theo seed với lịch sử riêng | Lớn, khó cân bằng; nên làm sau khi gói vừa ổn |

## 5. Ảnh hưởng tới code (cho gói vừa)

| File | Thay đổi |
|---|---|
| `data/world.js` | `G.REGIONS` tách thành `G.NATIONS` (bản ghi quốc gia), `G.PROVINCES` (khu dân cư lớn + chỉ số kinh tế), bảng loài theo biome × tầng hoang. `validateWorld` kiểm thêm: tầng nào của biome nào cũng có loài cho mọi Tier vào được |
| `data/ecology.js` | Biome rừng rậm nhiệt đới, vùng biển; loài cho đặc trưng mới |
| `js/map.js` | Trường độ cao / nhiệt / ẩm → biome + đặc trưng; tỉnh, quốc gia, độ hoang, vùng biển, đường; `adj` theo tỉnh và theo hải trình |
| `js/systems.js` | `worldYear`: chiến tranh có kết quả, chuyển tỉnh, nổi loạn, văn minh lan / co, hang ổ mọc |
| `js/life.js` | Thu nhập trừ thuế; `encounterTable` lấy loài từ ô (biome + tầng hoang + đặc trưng) thay vì khu cố định |
| `js/events.js` | `moveTo` thành hành trình; sự kiện luật, biên giới, biển |
| Save | Cần đổi phiên bản save; save cũ không dùng được |

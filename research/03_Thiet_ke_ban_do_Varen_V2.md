# Bản đồ Varen V2: thiết kế chi tiết

**Ngày:** 15/10/2026 · **Trạng thái:** thiết kế, chưa code. · **Phương án đã chọn:** `research/02_Ban_do_quoc_gia_dia_hinh.md` (A2 hai lớp, B2 quốc gia động, C2 độ hoang theo văn minh, C3 hang ổ, D2 vùng biển có tầng, E2 lớp đặc trưng, F1 đường xá và hành trình). · **Đi kèm:** `research/04_Mau_quoc_gia.md` (50 mẫu quốc gia, luật, đặc trưng riêng, cách tạo), `research/05_Thanh_pho_lang_mac.md` (mạng khu dân cư mỗi nước), `LifeSim_RPG/data/names.js` (kho tên riêng).

**Đã chốt thêm (15/10/2026):** khung 1200 × 900; quốc gia sinh ngẫu nhiên từ mẫu theo chủng tộc + đặc trưng riêng; mọi tên riêng bốc từ `names.js`; người chơi lập được làng và lập được nước; có tầng thứ tư "Vùng chết".

Tài liệu này mô tả bản đồ mới đủ chi tiết để code theo: dữ liệu khai gì, công thức nào, luật kiểm tra nào, người chơi thấy gì. Số liệu là giá trị khởi điểm, sẽ chỉnh bằng `sim.html`.

## 0. Ba luật không đổi

1. **Luật phân cấp Tier giữ nguyên.** Mọi chỗ sinh quái (ô đất, ô biển, hang ổ, di tích) đều thuộc một *tầng* có dải `[lo, hi]`, `hi − lo ≤ 2`. Nhân vật Tier t chỉ gặp loài ≤ t + 1 (Liều mạng: t + 2). Hành trình cũng không được lách luật này (mục 6.3).
2. **Thế giới suy từ dữ liệu + seed thế giới**, không lưu raster. Cùng seed thì ra cùng biome, sông, khu dân cư, quốc gia, tên. Save lưu seed và *những gì đã đổi* từ lúc tạo: chủ của tỉnh, làng mất / làng mới, nước mới, hang ổ, sử biên niên.
3. **Không sửa `library/`.** Biome, loài, đặc trưng mới vào `data/`.

## 1. Năm lớp của bản đồ

```
Lớp 1  ĐỊA HÌNH     độ cao, độ ẩm, nhiệt          (noise + seed, cố định)
Lớp 2  SINH THÁI    biome mỗi ô + sông + đặc trưng  (cố định)
Lớp 3  VĂN MINH     khu dân cư, đường, độ hoang      (đổi theo năm)
Lớp 4  HÀNH CHÍNH   tỉnh, quốc gia                   (đổi theo năm)
Lớp 5  BIỂN         vùng biển, tầng biển, hải trình  (cố định, cảng đổi theo lớp 3)
```

Lớp 1–2 dựng một lần lúc nạp trang. Lớp 3–4 dựng lại khi thế giới đổi (làng mất, tỉnh đổi chủ), không phải mỗi khung hình.

### 1.1. Khung

Biển hiện chỉ là một viền mỏng (mép khung chìm trong 36px), không đủ chỗ cho tầng biển sâu. **Khung mở từ 1000 × 700 lên 1200 × 900** (đã chốt), dời toàn bộ tọa độ đại lục +100 / +100. Đại lục giữ nguyên hình và vị trí tương đối, quanh nó có ~25 ô biển mỗi phía. Raster 300 × 225 ô (67.500 ô, mỗi ô 4px), vẫn dựng dưới 100ms.

## 2. Lớp 1–2: địa hình và sinh thái

### 2.1. Biome

Biome vẫn đặt bằng tay qua **điểm neo** như 16 tâm vùng hiện tại (Voronoi có trọng số, bẻ cong bằng noise). Khác biệt: điểm neo bây giờ *chỉ quyết định biome*, không còn là đơn vị kinh tế hay chính trị. Một tỉnh có thể trùm qua hai biome; một biome lớn có thể chia cho ba tỉnh.

Chỉ số sinh thái chuyển từ `G.REGIONS` sang `G.BIOME_STATS` (mỗi biome một dòng): `wealthBase`, `danger`, `magic`, `cold` / `hot`, bảng chủng tộc và giáo phái *bản địa* (dùng khi khu dân cư mới lập). Giá trị lấy thẳng từ vùng tương ứng hiện có, vì hiện mỗi vùng đúng một biome.

### 2.2. Ba trường số

Đã làm ở bước 1 (`js/map.js`). Độ lệch theo biome khai trong `G.TERRAIN` (`data/world.js`) và được làm mượt qua biên vùng (hai lượt box blur bán kính 6 ô), nên không có vách dựng đứng ở ranh hai biome. Độ cao và độ ẩm được **chuẩn hóa thành phân vị trên đất** (0 = thấp / khô nhất, 1 = cao / ẩm nhất), nên ngưỡng ở 2.4 đọc thẳng ra tỉ lệ diện tích.

| Trường | Công thức | Dùng cho |
|---|---|---|
| `elev` độ cao 0–1 | .55 × noise 4 tầng + .3 × độ sâu vào lục địa (smoothstep) + lệch biome (`storm_spire` +.3, `ash_peak` +.2, `crystal_cave` +.2, `venom_marsh` −.2, `golden_plains` −.1, `serpent_bay` −.1 …), rồi chuẩn hóa | núi, đồi, sông, chi phí đi |
| `moist` độ ẩm 0–1 | noise riêng + .3 × gần biển (trong 14 ô) + lệch biome (`venom_marsh` +.35, ba biome rừng +.25, `red_desert` −.45, `wind_steppe` / `ash_peak` −.2) − .12 × elev, chuẩn hóa; sau khi có sông cộng thêm tới +.12 trong 2 ô quanh sông, hồ | rừng, rừng rậm, đầm |
| `temp` nhiệt 0–1 | .12 + .85 × vĩ độ (bắc lạnh, nam nóng) − .35 × elev + lệch biome (`frost_tundra` −.3, `storm_spire` −.15, `ash_peak` / `red_desert` +.3 …) | rừng rậm, tuyết trên núi |

### 2.3. Sông

Kiểu Red Blob Games, làm bằng **priority-flood**: bắt đầu từ mọi ô đất giáp biển, lần lượt mở ô thấp nhất. Mỗi ô nhận một ô hạ lưu (`recv`) và một độ cao đã lấp (`filled` ≥ độ cao thật, tăng dần về thượng nguồn), nên từ ô nào cũng có đường chảy ra biển. Khóa ưu tiên cộng một chút noise mượt (`meander`), nhờ vậy trên lòng chảo đã lấp sông uốn theo noise thay vì chạy thẳng.

Mỗi ô đất góp `.15 + moist²` nước, dồn theo `recv` từ cao xuống thấp (`flow`). Ô có `flow ≥ 28` là sông; hệ sông (tính theo cửa sông) ít hơn 25 ô thì bỏ. `flow` càng lớn sông vẽ càng to. **Hồ** là chỗ trũng bị lấp sâu ≥ .02 có sông chảy qua, rộng 4–160 ô, không đè lên khu dân cư và không nằm trong biome cấm hồ.

Sông nằm *trên* ô (ô có cờ `river`), không chiếm ô riêng, nên ô sông vẫn có biome và đặc trưng của nó.

Varen hiện ra 19 hệ sông (3,3% ô đất có sông) và 31 hồ (2,3% đất).

### 2.4. Đặc trưng

Mỗi ô đất có đúng một đặc trưng (cộng thêm cờ `river` nếu có sông). Biome nào cấm đặc trưng nào thì xem `no` trong `G.TERRAIN`.

| Đặc trưng | Điều kiện (xét theo thứ tự) | Varen |
|---|---|---|
| `lake` hồ | sinh ra ở bước 2.3 | 2,3% |
| `mountain` núi | elev > .90; trong 2 ô quanh khu dân cư thì hạ thành đồi | 9,7% |
| `marsh` đầm | moist > .86 và elev < .32 | 8,4% |
| `jungle` rừng rậm | moist > .62 và temp > .64 | 5,1% |
| `forest` rừng | moist > .52 (ba biome rừng: moist > .30) | 29,1% |
| `hills` đồi | elev > .72 | 11,5% |
| `open` trống | còn lại | 33,8% |

Ngưỡng nằm trong `G.MAP_TH` (`js/map.js`); `G.map.stats` in tỉ lệ mỗi lần dựng.

Trên Varen, rừng rậm mọc ở dải nam ẩm (quanh Đầm Lục Chướng, Đồi Mộ Tro Tàn, Trảng Mộng Ảo); núi gom thành dãy ở Băng Nguyên, Núi Thạch Lâm, Đỉnh Lôi Vân, Núi Hỏa Diệm.

Tác dụng của đặc trưng:

| | Chi phí đi | Cộng độ hoang | Quái (nhân trọng số loài đã đủ điều kiện) | Sinh kế | Nguyên nhân chết thêm |
|---|---|---|---|---|---|
| `open` | 1 | 0 | | | |
| `hills` | 2 | +.10 | kiểu `charger` ×1,3 | thợ mỏ (biome có mỏ) | |
| `forest` | 2 | +.15 | `ambusher` ×1,4, họ `beast` / `plant` ×1,2 | **tiều phu** (mới) | lạc rừng |
| `jungle` | 3,5 | +.30 | `ambusher` ×1,8, họ `insect` / `plant` ×1,5, `flyer` ×0,7 | tiều phu, thợ săn +thu nhập | lạc rừng, sốt rừng |
| `marsh` | 4 | +.25 | họ `ooze` / `plant` ×1,5, `rooted` ×1,3 | | sốt đầm lầy (đang có) |
| `mountain` | 8 (chỉ đi qua đèo, xem 6.1) | +.35 | `flyer` ×1,5, họ `dragon` / `avian` ×1,3 | thợ mỏ | lở đá, tuyết lở (nếu `cold`) |
| `lake` | không đi được | | (ven hồ: họ `ooze` ×1,2) | ngư dân | đuối nước |
| cờ `river` | +6 khi vượt nếu không có cầu / bến | −.05 | | ngư dân, **lái đò** (mới) | đuối nước, lũ |

Đặc trưng **chỉ nhân trọng số** loài đã có trong bảng của tầng. Không thêm loài ngoài dải Tier, nên không phá luật phân cấp. Trong trận, ô có `ambush` cao thì quái phục kích được đánh trước một lượt nếu Stealth của nhân vật thấp hơn ngưỡng: mastery Stealth có thêm giá trị khi đi rừng.

## 3. Lớp 3: văn minh và độ hoang

### 3.1. Khu dân cư

Khu dân cư không đặt tay nữa: mỗi thế giới tự chọn chỗ, đặt tên và gán cho quốc gia. 21 khu dân cư có tên trong `world.js` hiện tại bỏ đi; tên của chúng đã chuyển vào `names.js` nên vẫn có thể xuất hiện lại.

Mỗi nước có một **mạng khu dân cư phân cấp**: kinh đô, thành phố, thị trấn, làng, thôn, cộng vai trò (cảng, đồn, mỏ, trại gỗ, làng chài, đền, chợ biên); khoảng 140 khu có dân mỗi thế giới. Bậc, số lượng theo cỡ nước, phong cách theo chủng tộc, dân nông thôn, công trình, cách đặt, lớn lên / suy tàn và tên: xem **`research/05_Thanh_pho_lang_mac.md`**.

Mỗi khu dân cư có trạng thái động:

| Trường | Ý nghĩa |
|---|---|
| `kind` | capital / town / fort / village (fort: dân ít, tuần tra mạnh) |
| `pop` | dân, như hiện tại |
| `hp` 0–1 | sức sống. Giảm vì thú triều (−.15 mỗi năm khi tầng ven quá đông), chiến tranh ở tiền tuyến (−.1), dịch (−.1). Hồi +.05 / năm khi yên |
| `state` | `thriving` (hp > .6) / `dwindling` (.15–.6) / `ruined` (< .15) |
| `founded` | năm lập (khu dân cư mới) |
| `founder` | người lập, nếu do người chơi lập (mục 5.5) |

Khu dân cư `ruined` thành **phế tích**: vẫn hiện trên bản đồ, không còn tỏa văn minh, dân chuyển sang khu gần nhất cùng tỉnh. Phế tích là chỗ có sự kiện riêng và có thể thành hang ổ (mục 4). Thủ đô sụp thì quốc gia dời đô sang khu đông dân nhất, ổn định −.3.

### 3.2. Đường xá

Dựng sau khu dân cư, bằng A* trên lưới chi phí ở bảng 2.4:

1. Nối mọi thủ đô và town với nhau theo cây khung nhỏ nhất, cộng thêm cạnh giữa hai khu dân cư cùng quốc gia nếu đường hiện có dài hơn 1,5 lần đường thẳng. Loại **đường cái**.
2. Nối mỗi village và fort tới khu dân cư gần nhất đã có đường. Loại **đường mòn**.
3. A* đi trên ô đã là đường thì chi phí × 0,3, nên các tuyến tự gộp thành trục chính thay vì chạy song song.
4. Đường cắt sông ở đâu thì đặt **cầu** (đường cái) hoặc **bến đò** (đường mòn) ở đó.
5. Không đi qua ô `mountain` trừ **đèo**: ô núi có elev thấp nhất trên dãy giữa hai phía. Mỗi dãy núi tối đa 1–2 đèo.

Chi phí đi trên đường: đường cái 0,5, đường mòn 0,8, bất kể đặc trưng bên dưới. Đường đi qua làng bị bỏ hoang trên 20 năm thì xuống cấp từ đường cái thành đường mòn, rồi mất.

### 3.3. Độ hoang

Mỗi ô đất có **độ hoang** `w ≥ 0`. Đây là chỗ thay cho chia 3 khu cố định 45 / 35 / 20%.

```
w(ô) = min qua mọi nguồn s ( chiPhíĐi(ô, s) / R_s )  +  biome.wild  +  đặcTrưng.wild
```

- `chiPhíĐi` là khoảng cách Dijkstra trên lưới chi phí 2.4. Núi và rừng rậm vì vậy "xa" văn minh hơn đồng bằng dù gần bằng thước đo.
- Nguồn `s` là khu dân cư không phải phế tích, bán kính `R_s` = theo bậc (kinh đô 120, thành phố 100, thị trấn 80, làng 50, thôn 25; vai trò đồn 70) × `patrol` của quốc gia chủ × (state `dwindling` thì × 0,6).
- Ô đường cũng là nguồn, `R` = 30 × `patrol`. Đường là hành lang an toàn.
- `biome.wild`: `golden_plains` 0, `wind_steppe` .1, `moss_forest` / `elder_wood` / `mist_coast` .2, `fae_glade` / `grave_hills` .3, `crystal_cave` / `red_desert` / `forge_ruins` / `venom_marsh` .4, `frost_tundra` / `serpent_bay` / `ash_peak` .5, `storm_spire` .7, `abyss_rift` .8. Không biome nào quá .8, để sát khu dân cư vẫn còn một vành tầng ven.
- Vô chủ (không quốc gia) thì `patrol` = 0,6.

Cách tính: chạy Dijkstra riêng cho từng nguồn, dừng khi `d / R > 3,5`. 27 khu dân cư × 67.500 ô vẫn dưới 1 triệu bước. Kết quả cache theo nguồn, chỉ chạy lại nguồn nào đổi trạng thái hoặc đổi chủ.

### 3.4. Tầng

| Tầng | Độ hoang | Thay cho |
|---|---|---|
| **Ven** | w < 1,0 | khu ven |
| **Sâu** | 1,0 – 2,0 | khu sâu |
| **Lõi** | 2,0 – 3,0 | khu lõi |
| **Vùng chết** | ≥ 3,0 | mới |

Bảng loài và dải Tier của tầng **khai theo biome**, không theo vùng. Vì hiện mỗi vùng đúng một biome, 48 bảng khu đang có chuyển nguyên sang 16 biome × 3 tầng đầu: ví dụ `golden_plains` = Ruộng Ven Đô T0 / Đồi Cỏ Hoang T0–1 / Gò Bò Rừng T1–2. Tên khu cũ thành tên tầng của biome đó.

Tầng thứ tư dùng loài có sẵn, dải Tier bằng hoặc cao hơn lõi một bậc:

| Biome | Lõi hiện có | Vùng chết (tên nháp) | Loài |
|---|---|---|---|
| `golden_plains` | T1–2 | Đồng Cháy, T2–3 | stone_bison, iron_bear, armored_rhino, moon_wolf |
| `moss_forest` | T2–3 | Rừng Không Tiếng, T3–4 | rot_treant, shadow_panther, brood_mother, gloom_basilisk |
| `fae_glade` | T2–3 | Ác Mộng Không Tỉnh, T3–4 | thorn_unicorn, nightmare_stag, blood_succubus |
| `mist_coast` | T2–3 | Mũi Tàu Đắm, T3–4 | siren, sea_serpent, kraken_spawn |
| `serpent_bay` | T3–4 | Mắt Bão, T4–5 | kraken_spawn (**thiếu loài T5 biển**) |
| `elder_wood` | T2–3 | Rễ Cội, T3–4 | nightmare_stag, moon_wolf, rot_treant, gloom_basilisk |
| `frost_tundra` | T3–4 | Bão Trắng Vĩnh Cửu, T4–5 | rime_wyvern, storm_elemental, thunderbird |
| `crystal_cave` | T3–4 | Lõi Tinh Thể, T4–5 | abyss_ooze, ancient_sentinel, magma_titan |
| `storm_spire` | T4–5 | Ngai Sét, T4–5 | storm_elemental, rime_wyvern, thunderbird |
| `ash_peak` | T3–5 | Lò Tim Núi, T4–5 | manticore, magma_titan, horned_fiend |
| `wind_steppe` | T2–3 | Bão Bụi, T3–4 | armored_rhino, gale_griffin, manticore |
| `forge_ruins` | T3–4 | Lò Chưa Tắt, T4–5 | ancient_sentinel, storm_elemental, magma_titan |
| `red_desert` | T3–4 | Cát Nuốt Vua, T4–5 | sand_djinn, manticore (**thiếu loài T5 sa mạc**) |
| `venom_marsh` | T3–4 | Mắt Độc, T4–5 | gloom_basilisk, abyss_ooze, blood_succubus (**thiếu loài T5**) |
| `grave_hills` | T3–5 | Mộ Vạn Người, T4–5 | bone_dragon, abyss_ooze |
| `abyss_rift` | T4–5 | Đáy Thật, T5 | horned_fiend |

Bốn ô in đậm là chỗ cần thêm loài mới (biển T5, sa mạc T5, đầm T5, thêm một họ cho Đồi Mộ và Đáy Thật để không chỉ có 1–2 họ quái). Tầng nào thiếu loài thì vẫn qua được kiểm tra (luật chỉ đòi có loài ≤ t + 1), chỉ bị cảnh báo ít họ.

Vùng chết chỉ có ở nơi xa văn minh thật sự: giữa vùng hoang, sau dãy núi, nơi làng vừa sụp. Văn minh lan ra thì vùng chết co lại thành lõi.

Ô có w cao nhất (5% trên cùng) của biome có chúa vùng là **ổ chúa**, nằm trong vùng chết nếu biome có tầng này: Cổ Long, Leviathan, Chúa Quỷ Hắc Uyên vẫn chỉ ra qua sự kiện từ cấp 40, nhưng giờ có chỗ cụ thể trên bản đồ.

**Văn minh lan, hoang dã lấn.** Làng thành phế tích thì vòng ven quanh nó biến mất, ô xung quanh lên sâu hoặc lõi, loài tầng cao hơn đi sát tới làng bên cạnh. Nước mạnh tăng `patrol` thì vòng ven to ra. Bản đồ nguy hiểm vì vậy là kết quả của chính trị, không phải hằng số.

### 3.5. Mật độ quái theo tỉnh × tầng

`world.zonePop` hiện tính theo khu của vùng. Chuyển sang **tỉnh × tầng** (khóa `tinh:ven`, `tinh:sau`, `tinh:loi`, `tinh:chet`), vẫn chạy đúng chu trình cũ: sinh sôi logistic, NPC tỉa (giờ tỉa theo `patrol` của nước thay vì độ giàu vùng; NPC không vào vùng chết), tràn từ vùng chết ra lõi ra sâu ra ven, ven quá 1,25 thì thú triều đánh khu dân cư của tỉnh (giảm `hp`). Hang ổ cộng thêm mật độ (mục 4).

### 3.6. Kết quả bước 3 (15/10/2026)

Đã làm: tầng 4 cho cả 16 vùng (loài theo bảng ở 3.4; chúa vùng chuyển xuống vùng chết), độ hoang từng ô tính từ mạng khu dân cư của thế giới (`js/realm.js`), khu săn chỉ gồm tầng có ô trong vùng, trận đánh xảy ra ở một ô và địa hình ô nhân trọng số loài (`G.FEATURE_SPAWN`), chế độ xem Nguy hiểm.

Khác với thiết kế ở trên:

- Bảng loài vẫn khai theo **vùng** (mỗi vùng thêm khu thứ tư), chưa tách sang biome. Vì mỗi vùng đúng một biome nên kết quả như nhau; tách khi có vùng thứ hai cùng biome.
- Mật độ quái (`zonePop`) vẫn theo **vùng × tầng**, chưa theo tỉnh × tầng như 3.5. Đổi khi làm quốc gia động (bước 7), lúc tỉnh có ý nghĩa cho thú triều. (Đã đổi ở bước 7, xem 5.7.)
- Chưa có đường nên nguồn văn minh chỉ là khu dân cư; đường thêm vào ở bước 5.

Đo bằng `sim.html` (thế giới `can-bang`): diện tích đất ven 20%, sâu 38%, lõi 18%, vùng chết 21% (cách chia cũ: 45 / 35 / 20, không có vùng chết). 1000 đời: 47.490 trận, 0 trận vượt Tier + 1, 9,9% chết vì quái (trước bước 3: ~10%). 100 thế giới: 0 lỗi, ~0,33 giây mỗi thế giới. Cảnh báo dữ liệu: `hai_xa_3` và `hac_uyen_3` chỉ có một họ quái (thiếu loài T5 biển, thêm họ cho Đáy Thật).

## 4. Hang ổ và di tích

### 4.1. Hang ổ

Một điểm trên bản đồ, nằm ở ô tầng sâu hoặc lõi.

| Trường | |
|---|---|
| `family` | họ quái chủ, chọn theo loài trọng số cao nhất của tầng: `beast` hang thú, `insect` tổ côn trùng, `undead` hầm mộ, `fiend` cổng quỷ, `construct` xưởng hoang, `dragon` tổ rồng, `spirit` / `plant` / `ooze` / `elemental` / `avian` / `magical_beast` có tên riêng |
| `tier` | `hi` của tầng chứa nó. Loài trong hang chỉ lấy trong bảng của tầng đó, nên vẫn qua luật Tier |
| `level` 1–3 | ổ (3 trận) / hang (5 trận) / sào huyệt (7 trận, trận cuối là thủ lĩnh `alpha`) |
| `name` | ghép từ họ + địa danh: "Hang Sói Đồi Lốc", "Tổ Nhện Rễ Già", "Hầm Mộ Gò Vô Danh" |

Vòng đời mỗi năm:

- **Mọc:** mỗi tỉnh × tầng (sâu, lõi, vùng chết) có mật độ > 1,4 thì 12% mọc một hang level 1. Tối đa 3 hang mỗi tỉnh.
- **Lớn:** 15% / năm lên level nếu mật độ tầng > 1,2.
- **Tràn:** hang level 3 cộng +.3 vào mật độ tầng ven của tỉnh mỗi năm. Đây là nguồn chính của thú triều.
- **Dọn:** quyết định "Đi dọn hang" (cần focus Săn quái hoặc Phiêu lưu). Đánh lần lượt các trận; thua một trận thì rút về (không chết ngay trừ khi thua nặng như trận thường). Dọn xong: mật độ tầng −0,4 × level, rương báu theo level, danh tiếng, tiền treo thưởng nếu có lệnh.
- **Mọc lại:** hang đã dọn để lại "hang trống" 8–15 năm, sau đó có thể bị họ khác chiếm.

Phế tích của khu dân cư bị bỏ thì 40% thành hang ổ họ `undead` hoặc họ của loài đã đánh sập nó.

### 4.2. Di tích cố định

**Di tích** là hang ổ không bao giờ mất, có 3 tầng ứng với 3 dải Tier, mỗi lần chỉ vào được tầng mà Tier cho phép. Mỗi thế giới đặt 5–7 di tích, mỗi cái ở ô lõi hoặc vùng chết của một biome trong bảng dưới, tên bốc từ `names.ruin` (năm tên khu cũ Vương Lăng, Vua Chôn Vùi, Lõi Xưởng, Lòng Núi, Hang Hát nằm sẵn trong danh sách). Đặc trưng riêng "Kho báu thất lạc" của quốc gia thêm một di tích nữa trong lãnh thổ nước đó.

| Kiểu di tích theo biome | Tầng 1 / 2 / 3 |
|---|---|
| Đồi Mộ | T2–3 / T3–4 / T4–5 (Cốt Long ở đáy) |
| Hồng Sa | T2 / T3 / T3–4 |
| Phế Xưởng | T2–3 / T3 / T3–4 |
| Hang Tinh Thể | T1–2 / T2–3 / T3–4 |
| Bờ Sương | T1–2 / T2–3 / T3 |
| Rừng Rêu, Rừng Cổ Thụ | T1 / T1–2 / T2–3 |
| Băng Nguyên | T2 / T2–3 / T3–4 |

### 4.3. Kết quả bước 8 (15/10/2026)

Đã làm (`LifeSim_RPG/js/dynamic.js` mục hang ổ, `js/realm.js` mục 13, `data/world.js` `G.DUNGEON_TIERS`, quyết định `lair` và `dungeon` ở `js/events.js`): hang ổ theo 4.1, di tích theo 4.2, ổ chúa theo cuối 3.4, ký hiệu và chú thích trên chế độ xem Nguy hiểm, sử biên niên, save trong `S.world.dyn` theo mục 11.

- Hang ổ nằm trong `W.dyn.lairs` (`{ id, cell, b, fam, lv, name, born, empty }`). Tên ghép tiền tố theo họ (`names.lair.prefix`) với tên tầng, tên tỉnh hoặc tên khu dân cư gần nhất, bỏ tổ hợp lặp chữ: "Hầm Mộ Gò Vô Danh", "Tổ Rồng Đáy Thật", "Mắt Lõi Tinh Thể".
- Dọn hang: quyết định khi focus Săn quái / Phiêu lưu, hang ở vùng đang ở, tầng của hang mở với sức mình; đưa tối đa 2 hang (lớn trước, gần trước) kèm đe dọa ước tính. Đánh 3 / 5 / 7 trận ở đúng ô của hang (`G.assault`), trận cuối của sào huyệt là loài Tier cao nhất bảng cho phép, bậc alpha. Thua một trận thì rút (rủi ro chết như trận thường). Dọn xong: mật độ tầng −0,4 × level, bạc 25 × (1 + Tier)² × level, mỗi level 60% một rương (`G.treasure`), danh tiếng; sào huyệt ở tỉnh có chủ thì quan tỉnh thưởng thêm nửa số bạc (thay cho "tiền treo thưởng nếu có lệnh").
- Di tích tĩnh, đặt từ seed bằng RNG riêng (`sites:<seed>`) nên phần còn lại của thế giới không đổi. Tầng dọn xong lưu năm trong `W.dyn.dg`, có quái lại sau 25 năm. Xuống tầng sâu nhất chưa dọn mà Tier cho phép (lo ≤ Tier + 1, Liều mạng + 2), 4 trận, trận cuối là thủ lĩnh; bạc 40 × (1 + Tier)² × số tầng, mỗi tầng một rương.
- Ổ chúa chỉ là vị trí trên bản đồ (chúa vùng vẫn ra qua sự kiện từ cấp 40 như cũ).

Khác với thiết kế ở 4.1, 4.2, 3.5:

- **Thú triều đến từ sào huyệt.** Tầng sâu không tràn mật độ ra tầng ven nữa (`G.DYN.spill = [0, .1, .1]`; vùng chết → lõi → sâu giữ như cũ). Với chuỗi tràn cũ, tầng ven vượt 1,25 ở 31–46% số năm-tỉnh dù có hay không có hang, nên hang không đổi được gì (việc treo từ bước 7). Giờ thú triều chỉ còn ở ~7% số năm-tỉnh, gần như toàn bộ do sào huyệt (+0,3 / năm vào tầng ven). Để số khu sụp vẫn trong 1–3 / 100 năm, xác suất thú triều đánh khu dân cư tăng từ `.05` lên `.15` × cường độ.
- **Tỉ lệ mọc, lớn, dọn** đo lại cho ra 8–15 hang: mọc `.006` / năm (thiết kế `.12`; mật độ trên 1,4 gần như thường trực ở tầng sâu, nên `.12` ra ~57 hang, gần hết là sào huyệt), lớn `.04` / năm (thiết kế `.15`). Thêm **đoàn mạo hiểm NPC** dọn hang mỗi năm với xác suất `.25 × tuần tra × (sâu 1, lõi .8, vùng chết .6) / (1 + .5 × (level − 1))`; không có nó hang không bao giờ mất.
- Thế giới mới có sẵn 10–14 hang (level 1 : 2 : 3 = 5 : 3 : 2), và mật độ khởi đầu của tầng sâu, lõi, vùng chết là 1,1–1,5 (tầng ven giữ .85–1,2). Không có hai thứ này, 60 năm đầu chỉ có ~6 hang.
- Hang theo tầng của ô: ô thành tầng ven (văn minh lan tới) thì hang mất; ô đổi sang tầng sâu khác thì hang đổi theo. Hang trống hết hạn thì bị chiếm lại (có thể họ khác, tên mới) nếu tầng còn đông hơn 1,2, không thì lấp hẳn.
- Phế tích thành hang (40%): ở tầng của ô sau khi tính lại độ hoang (ít nhất là tầng sâu); họ quái là họ đông nhất tầng ven của vùng (khu sụp vì thú triều) hoặc `undead`, nếu tầng chứa hang không có loài họ đó thì lấy họ đông nhất của tầng.
- Tầng di tích lấy loài từ mọi khu của vùng trong dải Tier của bảng 4.2, rồi **co dải theo loài có thật**: Đồi Mộ tầng 1 thành T3 (vùng không có loài T2), Rừng Rêu tầng 1 vẫn T1. Biome không có trong bảng (di tích của Kho báu thất lạc) dùng khu sâu, lõi, vùng chết làm 3 tầng. `validateWorld` kiểm tầng di tích như khu; còn 2 cảnh báo một họ quái: Phế Xưởng tầng giữa (T3 chỉ có Bọ Ngựa Cơ Khí), Hồng Sa tầng giữa (T3 chỉ có Giun Cát Khổng Lồ).
- Chủng tộc sống lâu: mật độ quái cập nhật mỗi lượt còn hang chạy mỗi năm, nên đời Tiên Tộc, Người Lùn thấy ít hang hơn (thử 60 đời: 5,6–6,9 so với 7,7 ở Nhân Loại).

Đo bằng `sim.html` (thế giới `can-bang`):

| Số đo | Mục tiêu | Kết quả |
|---|---|---|
| Hang ổ đang có | 8–15 toàn đại lục | 13,7 trung bình (50 thế giới × 300 năm), cuối kỳ ~3 sào huyệt; 7,2 trong đời người (thế giới mới, ~60 năm đầu) |
| Trận vượt Tier + 1 (kể cả trong hang, di tích) | 0 | 0 / 48.021 trận (706 trận trong hang, di tích) |
| Năm-tỉnh có thú triều | (bước 7 ghi 38% là quá cao) | 7,5% (1000 đời); 6,7% (300 năm × 50) |
| Khu dân cư sụp / lập mới / 100 năm | 1–3 / 1–3 | 2,6 / 2,2 (1000 đời); 1,8 / 2,1 (300 năm × 50) |
| Nước còn sống sau 300 năm | trung vị 5–7, không dưới 3 | trung vị 6, ít nhất 4, nhiều nhất 9 |
| Tỉnh đổi chủ / 100 năm | 3–8 | 5,2 (1000 đời); 6,5 (300 năm × 50) |

1000 đời: trỗi dậy 20,3%; chết vì quái 9,6% (bản bước 7: 10,7%); quái tấn công làng 2,1%; 7,5% đời từng vào hang (126 lần, 81 lần dọn sạch), 4,3% đời từng vào di tích (89 lần, 62 tầng dọn sạch), 1 đời chết trong hang. Đời dài hơn ~7% vì thú triều ít đi; chi phí mỗi năm thế giới không đổi (~1,1 ms), nên 1000 đời chạy lâu hơn tương ứng. 100 thế giới (chỉ dựng): 0 lỗi, 40 cảnh báo "đất chật" như trước, mỗi thế giới 5–7 di tích, dựng nhanh như bản bước 7.

## 5. Lớp 4: tỉnh và quốc gia

### 5.1. Tỉnh

**Mỗi kinh đô, thành phố, thị trấn là thủ phủ của một tỉnh** (~30 tỉnh); làng và thôn thuộc tỉnh của thủ phủ gần nhất theo chi phí đi (`research/05` mục 3). Tỉnh mang tên khu dân cư thủ phủ. Đất chia bằng Dijkstra nhiều nguồn trên lưới chi phí, nguồn càng lớn càng "rẻ" (chi phí chia cho 1 + pop / 10). Biên tỉnh vì vậy chạy theo sông, núi, rìa rừng rậm. Ô xa mọi thủ phủ quá chi phí 260 là **đất hoang vô chủ**, thường là vùng chết (giữa sa mạc, đáy vực, đỉnh núi). Làng mới lập trong đất hoang thì tách thành tỉnh mới.

Chỉ số tỉnh, theo kiểu 1in8b, suy ra chứ không khai tay:

| Chỉ số | Công thức |
|---|---|
| `pop` | tổng `pop` khu dân cư trong tỉnh |
| `wealth` | trung bình `wealthBase` của biome theo diện tích, + .08 nếu có sông, + .05 × số đường cái đi qua (tối đa .15), + .1 nếu là cảng, × (1 − .5 × chiến tranh), × (.7 + .3 × ổn định nước) |
| `gini` | biome, + .05 nếu là thủ đô |
| `races`, `faiths` | bảng của khu dân cư; quốc giáo của nước chủ được +25% trọng số sau mỗi 30 năm thuộc nước đó (đồng hóa dần) |
| `coastal` | có ô đất giáp biển trong vòng 3 ô từ thủ phủ |

Nơi sinh: bốc **tỉnh** theo `pop`, rồi bốc khu dân cư trong tỉnh. Mọi chỗ trong `life.js` đang đọc `G.REGION[S.loc]` đổi thành đọc tỉnh.

### 5.2. Quốc gia

Bản ghi quốc gia:

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `id`, `nameVi`, `color` | | màu dùng cho chế độ xem Chính trị |
| `template` | id mẫu | một trong 50 mẫu ở `research/04` |
| `gov` | 14 chính thể | quyết định đường thăng tiến và tước người cai trị (`research/04` mục 2) |
| `capital` | id khu dân cư | |
| `faith` | id giáo phái thư viện | quốc giáo, bốc từ trọng số của mẫu |
| `tax` | 0–0,35 | trừ vào thu nhập |
| `laws` | mảng cờ | 22 luật ở `research/04` mục 3 |
| `races` | `{ race: 'fav' / 'wary' }` | thiếu = bình thường |
| `army`, `patrol` | 0,6–1,4 | sức quân; độ phủ tuần tra |
| `stability` | 0–1 | đổi theo năm |
| `ambition` | 0–1 | ham bành trướng |
| `trait` | id | đặc tính của mẫu, luôn có |
| `quirks` | 1–2 id | đặc trưng riêng bốc lúc tạo (`research/04` mục 5) |
| `ruler` | `{ name, title, born, epithet }` | người cai trị NPC; `null` với `collective` |
| `relations` | `{ nationId: −3…+3 }` | quan hệ ban đầu, đổi theo chiến tranh và hôn nhân |

Quốc gia **không khai tay**. Lúc tạo thế giới, máy bốc 5–7 mẫu trong 50 mẫu (10 chủng tộc × 5), đặt thủ đô, lan lãnh thổ, cộng nhiễu chỉ số và bốc đặc trưng riêng. Toàn bộ quy trình ở `research/04` mục 6.

Thái độ chủng tộc: `fav` thu nhập × 1,1; `wary` thu nhập × 0,85, nguyên nhân `bandit` × 1,5, thêm sự kiện bị xua đuổi.

### 5.3. Quốc gia động

Chạy trong hệ con `world` mỗi năm, sau phần quái:

**Sức mạnh** `P = Σ_tỉnh pop × (.5 + wealth) × army × (.5 + stability)`.

**Ổn định** trôi về .6, mỗi năm: −.08 mỗi cuộc chiến đang đánh, −.05 nếu có tỉnh dịch, −.04 mỗi khu dân cư `dwindling`, −.1 × (tax − .15) / .1, +.02 mỗi năm hòa bình (tối đa +.1).

**Tuyên chiến.** Mỗi cặp nước giáp nhau (chung biên tỉnh, hoặc hai cảng có hải trình) không trong thời hưu chiến: xác suất mỗi năm `.015 × ambition_a × kẹp(P_a / P_b, .5, 2) × (khác quốc giáo ? 1,5 : 1)`. Một nước đánh tối đa 2 cuộc cùng lúc.

**Diễn biến** mỗi năm: `điểm_a += .35 × (P_a − P_b) / (P_a + P_b) + N(0; .25) + thưởng người chơi`. Điểm > .3 thì bên thắng thế chiếm một tỉnh biên của bên kia. Hết khi |điểm| ≥ 1, hoặc đánh 6 năm, hoặc hai bên ổn định < .2. Bên thắng giữ tối đa 2 tỉnh đã chiếm, hưu chiến 15 năm. Tỉnh tiền tuyến có `war` = 1 (như `rs.war` hiện tại), tỉnh khác của hai nước `war` = .4.

*Thưởng người chơi:* nếu nhân vật nhập ngũ và có Tier ≥ 3, mỗi năm chiến +.05 × (Tier − 2). Một anh hùng xoay được cục diện, nhưng không quyết định một mình.

**Nổi loạn.** Tỉnh có ổn định nước < .4: xác suất `.02 × (1 − ổn định) × (chủng tộc đa số là wary hoặc đạo đa số khác quốc giáo ? 2 : .5)`. Thành công 50%: 70% tỉnh lập nước mới (chọn mẫu theo chủng tộc đa số của tỉnh, chính thể hợp với nước 1 tỉnh, tên bốc từ `names.js`), 30% xin theo nước giáp nhau cùng đạo.

**Sáp nhập hòa bình.** Tỉnh vô chủ giáp một nước có ổn định > .6: 2% / năm nhập vào.

**Diệt vong.** Nước không còn tỉnh thì mất, ghi vào sử.

**Lan can:** luôn có 3–9 nước. Dưới 3 thì tắt tuyên chiến; trên 9 thì tắt nổi loạn.

**Sử biên niên** `world.history`: mỗi lần lập nước, diệt nước, đổi chủ tỉnh, khu dân cư sụp hoặc mới lập, chúa vùng bị hạ, ghi một dòng `{ year, kind, text }`. Giao diện có thẻ "Biên niên sử". Sự kiện trong đời đọc sử để nhắc lại ("Ông nội bạn từng chết trong trận Đèo Lôi Vân năm 1182").

### 5.4. Người chơi và quốc gia

Đường thăng tiến theo chính thể ở `research/04` mục 2 (14 chính thể). Đặc tính của mẫu có thể đổi đường đó, ví dụ Vương Quốc Sư Tử cho ai thắng vua trong quyết đấu lên làm vua.

Quyết định mới: nhập ngũ, đào ngũ, di cư sang nước khác (có lý do: luật, thuế, chiến tranh), vượt biên lén khi biên giới đóng, xin ân xá khi bị truy nã.

Bộ Xương: luật của nước nơi trỗi dậy quyết định kiếp đó dễ hay khó (`hunt_undead` hay `undead_citizen`). Thêm sự kiện "quê cũ đổi chủ" khi Bộ Xương quay lại tỉnh có mộ mình mà tỉnh đã thuộc nước khác.

### 5.5. Lập làng, lập nước

**Lập làng.** Quyết định "Lập làng", mở khi:

| Điều kiện | Giá trị |
|---|---|
| Giai đoạn | trưởng thành |
| Tiền | 200 × (1 + w) bạc, w là độ hoang ô định lập (đặc tính Đất lành của mẫu H5 giảm 50%) |
| Danh tiếng | ≥ 20 |
| Ô hợp lệ | w từ 1,0 tới 2,5 (tầng sâu hoặc lõi); không núi, hồ, đầm; cách khu dân cư gần nhất ≥ 60px |
| Trong lãnh thổ một nước | phải xin phép: phí bằng 1 năm thuế; nước có `no_outsiders` chỉ cho chủng tộc `fav` |
| Trong đất hoang | không cần phép, nhưng làng thành tỉnh vô chủ và không có tuần tra của ai |

Làng mới: kiểu village, `hp` .4, `pop` 1, tên do người chơi chọn trong 3 tên bốc từ `names.js` (theo chủng tộc người chơi). Người chơi là **trưởng làng**:

- Mỗi năm focus "Làm ăn" hoặc "Gia đình" ở làng thì `hp` +.05, `pop` +.1 × (giàu tỉnh). Thu nhập cộng thêm 10% thu nhập của dân làng.
- Sự kiện riêng: người tới xin ở (chọn nhận ai), quái đánh làng (người chơi phải đánh), xây tường gỗ (tốn tiền, thú triều nhẹ hơn), mở đường nối khu dân cư gần nhất (tốn tiền, thành đường mòn).
- Làng tỏa văn minh như mọi khu dân cư: vòng ven mọc quanh nó, hoang dã lùi lại.
- `pop` ≥ 3 thì lên town.
- Người chơi chết thì làng còn lại, có người kế (con nếu có, không thì dân bầu), ghi vào sử. Kiếp sau có thể sinh ra ở chính làng đó.

**Lập nước.** Quyết định "Lập nước", mở khi:

| Điều kiện | Giá trị |
|---|---|
| Danh tiếng | ≥ 60 |
| Lãnh thổ | là trưởng của ít nhất 2 khu dân cư, một cái là town; tất cả vô chủ (lập trong đất hoang, hoặc sáp nhập làng vô chủ bằng sự kiện), hoặc vừa dẫn một cuộc nổi loạn thành công |
| Tiền | 1000 bạc |

Khi lập: người chơi chọn một trong 5 mẫu của chủng tộc mình (Bộ Xương chọn mẫu Bộ Xương, nên một kiếp Bộ Xương có thể dựng Vương Triều Xương), hoặc chỉ chọn chính thể + quốc giáo. Tên nước: chọn trong 3 tên bốc từ `names.js`. Chỉ số khởi đầu lấy theo mẫu nhưng ổn định .5, tham vọng do người chơi đặt. Nước mới không có đặc trưng riêng; đặc trưng "Nước mới lập" áp tự động.

Người chơi là người cai trị:

- Focus mới **Trị quốc**: ổn định +, tuần tra +, hạnh phúc −.
- Mỗi năm một quyết định triều chính: chỉnh thuế, bật / tắt một luật, tuyên chiến, cầu hòa, gả con lấy liên minh.
- Đường thăng tiến của người chơi dừng ở đây; phần còn lại của đời là giữ nước.
- Người chơi chết: kế vị theo chính thể (con, hội đồng, thách đấu). Nước tiếp tục sống như nước NPC, sử ghi người lập nước kèm biệt hiệu bốc từ `names.epithet` theo việc đã làm.

Mục tiêu cân bằng: lập làng ở ~10% đời người trưởng thành, lập nước dưới 2% đời.

### 5.6. Kết quả bước 4 (15/10/2026)

Đã làm (`LifeSim_RPG/js/state.js`): công trình của khu quyết định nghề, tử vong trẻ em, dịch, việc học (`research/05` mục 6–7); thuế và thái độ chủng tộc vào thu nhập; 21 trong 22 luật có tác dụng (thuế cảng chờ bước đi biển); 8 sự kiện và 1 quyết định mới (lệnh nghĩa vụ); thêm nghề tiều phu.

Khác với thiết kế:

- Ở lại trái lệnh trục xuất ngoại tộc không tính tiền án mà bị **áp giải** sang vùng kề ngoài lãnh thổ. Bản đầu tính tiền án làm 8,4% đời bị treo cổ ở thế giới có nước Người Lùn cấm ngoại tộc.
- Bị bắt lần thứ ba mới treo cổ, và chỉ ở nước không có luật khổ sai.
- Tự sống: người ở vùng quê luôn được đưa một nghề đất và nghiêng về nghề đất; dân quê di cư thì sống ở vùng quê của làng nơi mới. Không có hai chỉnh này thì công trình mới ở làng (lò rèn, chợ) kéo tỉ lệ nông dân xuống 3%.

Đo bằng `sim.html` (thế giới `can-bang`, 1000 đời): 45.057 trận, 0 trận vượt Tier + 1, trỗi dậy 20,0%, chết vì quái 10,3%; nông dân 25%, mạo hiểm giả 26%, thợ săn 9%, ngư dân 7%. Bốn thế giới có luật nghĩa vụ / cấm tử thuật / giấy phép / đẳng cấp / phường hội (250 đời mỗi thế giới): đi lính 0–30% đời, trốn lính ≤ 4%, từng bị bắt ≤ 2%, treo cổ ≤ 0,4%, bị lệnh trục xuất ~21% ở thế giới có nước cấm ngoại tộc.

### 5.7. Kết quả bước 7 (15/10/2026)

Đã làm (`LifeSim_RPG/js/dynamic.js`, phần độ hoang ở `js/realm.js`): quốc gia động theo 5.3, khu dân cư sa sút / sụp / lập mới theo 3.1, độ hoang động theo 3.3, mật độ quái theo tỉnh × tầng theo 3.5, sử biên niên, save theo mục 11.

- Thế giới tĩnh vẫn dựng từ seed. Phần đổi nằm trong `S.world.dyn` (chủ tỉnh, hp khu dân cư, khu và nước mới lập, chiến tranh, hưu chiến, đường xuống cấp, sử biên niên). `G.bindWorld` đưa `G.realm` về đúng trạng thái của một thế giới: cùng thế giới thì không làm gì; thế giới chưa đổi gì thì chép lại bản gốc đã lưu; còn lại thì trả về bản gốc rồi áp phần đổi. Gắn lại một thế giới đã chạy 250 năm ra đúng từng ô như lúc cập nhật dần.
- Độ hoang: mỗi nguồn (khu dân cư, nhóm ô đường của một tỉnh) có vết loang riêng, cache theo (ô, bán kính). Đổi một nguồn chỉ tính lại những ô mà nguồn đó đang là nguồn gần nhất; bán kính tăng thì chỉ cần trộn min. Kết quả giống hệt tính lại toàn bộ (kiểm sau 300 năm × 3 thế giới), và lúc dựng giống hệt bản bước 6 (0 ô khác ở 3 seed).
- Kiếp mới sinh vào thế giới của kiếp trước (cùng seed thế giới), bắt đầu từ năm sau năm kiếp trước mất. Save đổi sang `vankiep.save.v4`.
- Giao diện: chế độ Chính trị tô sọc đỏ tỉnh tiền tuyến, nhãn theo lãnh thổ mới, cờ kinh đô theo kinh đô hiện tại, khu sa sút vẽ nhạt, phế tích ghi năm bỏ hoang; bảng quốc gia ghi kinh đô, năm lập, chiến tranh đang đánh, hưu chiến; thẻ Biên niên sử dưới nhật ký.

Khác với thiết kế ở 5.3 và 3.1:

- **Tuyên chiến** `.002 × tham vọng × kẹp(P_a / P_b, .5, 2) × (khác đạo 1,5) × (1 − .15 × quan hệ) × (chư hầu .2)` thay vì `.015 × …`. Với .015 có ~20 cuộc chiến / 100 năm, ~15 tỉnh đổi chủ / 100 năm và nước rã ra rất nhanh. Thêm hệ số **đòi lại đất** × 15 khi nước kia vừa tách ra từ tỉnh nổi loạn của mình: không có nó, nước nổi loạn một tỉnh sống dai và số nước dồn lên trần 9.
- **Nổi loạn** `.01 × (1 − ổn định) × (2 hoặc .5)` thay vì `.02 × …`.
- **Thú triều không trừ hp mỗi năm.** Tầng ven vượt 1,25 ở ~38% số năm-tỉnh (mật độ tràn từ vùng chết gần như thường trực, kể cả ở tỉnh ít nguy hiểm), nên trừ −.15 mỗi năm làm 160 khu sụp trong 300 năm. Giờ mỗi năm khu bị thú triều đánh với xác suất `cường độ thú triều × .05` (−.25 hp), bị cướp phá ở tiền tuyến với xác suất .3 (−.2), dịch nặng −.08; hp mất nhân hệ số theo bậc (kinh đô .2, thành phố .35, thị trấn .5, làng .8, thôn 1); năm yên hồi +.05. Sa sút khi hp < .5, hết sa sút khi > .8 (có khoảng trễ để không bật tắt liên tục).
- **Khu mới**: mỗi năm 4% một nước đang yên (ổn định > .45, không đánh nhau, bốc theo số tỉnh) hồi sinh một phế tích trong lãnh thổ (đã bỏ hoang ≥ 15 năm, 50%) hoặc lập làng ven sông ở ô đồng / đồi / rừng, tầng ven hoặc sâu, cách mọi khu ≥ 35px. Làng mới hp .4, chưa có đường.
- Tỉnh tiền tuyến: tỉnh của bên này kề tỉnh của bên kia trên đất (`provAdj`) hoặc có cảng tàu buôn nối được tới cảng bên kia trong 420px (`provSea`). Thắng thế (điểm > .3) thì mỗi năm 50% chiếm một tỉnh tiền tuyến (kinh đô chỉ khi hết tỉnh khác), điểm lùi .2.
- Người cai trị già đi theo năm; chết với xác suất tăng dần sau 60% tuổi thọ chủng tộc; kế vị làm ổn định −.06 (tranh ngôi 20%: −.18).
- Nước mới lập từ nổi loạn: mẫu cùng chủng tộc đa số của tỉnh (ưu tiên nước nhỏ, ít khi là đế chế), quốc giáo theo đạo đa số của tỉnh nếu mẫu có, ổn định .5, tham vọng + .2, đặc trưng Nước mới lập, quan hệ −3 với nước cũ, tuần tra làm tròn .05 (ít tổ hợp vết loang).
- Đất vô chủ ngoài mọi tỉnh có mật độ quái riêng theo vùng × tầng (khóa `r<vùng>:<tầng>`), NPC tỉa ở mức .35.
- Đồng niên vẫn chạy trên bản sao thế giới lúc sinh, không ảnh hưởng thế giới của nhân vật.
- Chưa làm: quốc giáo đồng hóa dần tỉnh chiếm được (5.1), lập nước / lập làng của người chơi (bước 9), sự kiện nhắc lại sử trong đời ("ông nội chết trong trận…").

Đo bằng `sim.html` (thế giới `can-bang`):

| Số đo | Mục tiêu | Kết quả |
|---|---|---|
| Nước còn sống sau 300 năm (50 thế giới động) | trung vị 5–7, không dưới 3 | trung vị 7, ít nhất 4, nhiều nhất 9 |
| Tỉnh đổi chủ / 100 năm | 3–8 | 6,7 (300 năm × 50); 5,2 (1000 đời) |
| Khu dân cư sụp / 100 năm | 1–3 | 2,2; 1,2 |
| Khu dân cư lập mới, dựng lại / 100 năm | 1–3 | 1,9; 2,1 |
| Chiến tranh / 100 năm | | 5,8; 4,5 |
| Nước mới lập / diệt vong / 100 năm | | 2,3 / 2,4 |

1000 đời: 43.538 trận, 0 trận vượt Tier + 1; trỗi dậy 18,5%; chết vì quái 10,7%; nông dân 27%, mạo hiểm giả 24%; tuổi thọ theo chủng tộc như bản bước 6. Chết trận tăng từ 0,6% lên 1,9% số cái chết (chiến tranh giờ kéo dài theo tỉnh, tỉnh tiền tuyến war = 1, tỉnh khác của hai nước .4); 4,2% lính nghĩa vụ chết trận; 9,7% đời thấy quê đổi chủ. 1000 đời chạy 55 giây (bản bước 6: 24 giây); một thế giới động 300 năm ~0,16 giây. 100 thế giới (chỉ dựng): 0 lỗi, 40 cảnh báo "đất chật" như trước, ~0,55 giây mỗi thế giới.

### 5.8. Kết quả bước 9 (15/10/2026)

Đã làm (`LifeSim_RPG/js/org.js`, phần dùng chung tách ra từ `js/dynamic.js`): lập làng theo 5.5, lập nước theo 5.5, focus Quản lý (thay cho "Trị quốc"), cộng thêm theo yêu cầu của người dùng: **lập thẳng thị trấn**, **nâng làng → thị trấn → thành phố**, **hội** (phường nghề, Hiệp Hội Mạo Hiểm, đoàn lính đánh thuê), **làm quan**, **được bầu trưởng khu**. Không hướng nào bắt buộc: mỗi chức đều đến dưới dạng quyết định (nhận hay không), và bảng nhân vật có khối **Vai trò** với nút rời hội / từ chức / thoái vị.

| Hướng | Không tham gia | Thành viên | Quản lý | Lập mới |
|---|---|---|---|---|
| Khu dân cư | (ai cũng là cư dân) | cư dân | trưởng thôn / trưởng làng / thị trưởng / thành chủ, được bầu khi danh vọng ≥ 15 / 22 / 38 / 55 (kinh đô không có) | lập làng; lập thẳng thị trấn; nâng làng lên thị trấn, thị trấn lên thành phố |
| Quốc gia | dân | dân | Quan tỉnh (Hiểu biết ≥ 55 và tầng lớp ≥ 3, hoặc Hiểu biết ≥ 70, hoặc danh vọng ≥ 40) → Đại thần | lập nước ở tỉnh vô chủ; dấy binh |
| Hội | không vào | thành viên | quản sự (hội đề cử sau ≥ 4 năm) → hội trưởng (được bầu khi hội trưởng NPC nhường) | lập hội, lập đoàn |

**Hội** (`W.dyn.orgs`: `{ id, kind, name, seat, founded, leader, members, rep }`), đặt sẵn khi thế giới bắt đầu ở thị trấn trở lên theo bậc, sống mỗi năm (số người trôi theo dân khu, hội trưởng NPC thay người, khu sụp thì dời hoặc giải tán):

| Loại | Ai vào | Lợi |
|---|---|---|
| Phường Thợ, Phường Buôn, Hội Nông Tang, Hội Học Giả, Hội Bóng Đêm | đúng sinh kế (thợ mỏ / tiều phu / thợ rèn; thương nhân / thủy thủ / ngư dân; nông dân / chăn nuôi; học giả / thầy thuốc / tu sĩ; kẻ trộm) | thu nhập +6–25% theo hạng và uy tín hội; miễn phí vào nghề khi nước có luật Độc quyền phường hội; hội phí hằng năm |
| Hiệp Hội Mạo Hiểm (một hội toàn đại lục, chi nhánh ở khu có Hội Mạo Hiểm) | mọi nghề, Cấp ≥ 3; mạo hiểm giả tự ghi tên | bảng nhiệm vụ mỗi năm (dọn hang có thưởng thêm, hộ tống đoàn buôn, nhận lệnh săn thủ lĩnh, tìm đồ); hạng Đồng → Huyền Thoại theo danh vọng; hạng Vàng ở khu có chi nhánh thì được mời làm trưởng chi nhánh |
| Đoàn lính đánh thuê / dong binh (tên từ `names.mercenary`) | Cấp ≥ 10, tuổi trưởng thành | hợp đồng với một bên của cuộc chiến gần tỉnh nhà (tiền, danh vọng, đẩy điểm chiến tranh theo hạng và cỡ đoàn, có thể tử trận), không có chiến tranh thì hộ tống |

**Lập làng**: danh vọng ≥ 20, tiền 200 × (1 + độ hoang) cộng phí xin phép (bằng một năm thuế của mình) nếu đất có chủ; nước có luật `no_outsiders` chỉ cho chủng tộc được ưu ái. Chọn trong 2 chỗ trong 160px quanh chỗ đang ở: ô đồng / đồi / rừng của một tỉnh, độ hoang 1,0–2,5, cách khu dân cư ≥ 60px, phế tích ≥ 30px, hang ổ ≥ 25px, ưu tiên ven sông. Làng mới mang tên bốc từ `names.js`, `founder` và `head` là người chơi, nhà dời về đó.

**Lập thẳng thị trấn**: danh vọng ≥ 45, 2.500 bạc, **nhân lực** ≥ 300 người (thành viên các hội mình làm hội trưởng + một phần tư dân khu mình làm trưởng; số này dời theo). Độ hoang ≤ 1,6. Thị trấn có sẵn đền, thầy thuốc, lò rèn, chợ, rào.

**Trưởng khu**: mỗi năm khu lớn theo focus Quản lý (và một phần Làm ăn, Gia đình), sức sống hồi; lương theo dân khu; người tới xin ở; quái (hang ổ trong 70px hoặc thú triều) đánh khu thì người chơi đánh. Làng dựng được rào gỗ (thú triều và quái phá ít hơn một nửa; mọi thị trấn trở lên vốn có rào). Làng 900 người + 800 bạc lên thị trấn; thị trấn 5.000 người + 3.000 bạc + danh vọng 50 lên thành phố; tên đổi chữ chỉ bậc ("Làng Benno" → "Bến Benno" → "Thành Benno"), thêm công trình, vòng văn minh to theo bậc mới.

**Lập nước**: làm trưởng thị trấn trở lên ở tỉnh vô chủ có ≥ 2 khu dân cư, danh vọng ≥ 60, 1.000 bạc; chọn 1 trong 3 mẫu của chủng tộc mình; khu của mình là kinh đô. **Dấy binh**: quan tỉnh hoặc trưởng thị trấn trở lên ở tỉnh không phải tỉnh kinh đô của nước có ổn định < .45, danh vọng ≥ 50, 500 bạc; thành công với xác suất .1 + danh vọng / 300 + (.45 − ổn định) × 1,2 (+.08 nếu là quan), kẹp .05–.8; thất bại thì bị truy nã, 35% bị xử tử. **Người cai trị**: focus Quản lý tăng ổn định, giảm hạnh phúc; thu thuế theo dân; mỗi năm quyết định Triều chính (giảm / tăng thuế 3%, tuyên chiến với nước láng giềng, cầu hòa). Thuế chỉnh lưu ở `D.nat[k].tax`.

**Kế vị** (`G.onDeath` gọi từ `die`): trưởng khu, người cai trị, hội trưởng chết thì con đã trưởng thành nối (không có thì dân bầu / `makeRuler`), sử biên niên ghi người lập kèm biệt hiệu (`names.epithet`). Kiếp sau cùng thế giới có thể sinh ra ở chính làng đó.

Khác với thiết kế ở 5.5:

- **Chỉ lập làng trong tỉnh** (có chủ hoặc vô chủ). Đất hoang ngoài mọi tỉnh (~13% đất liền ở `can-bang`) chưa lập được, vì phải dựng tỉnh mới lúc đang chơi (`provOf`, `_provCells`, kề tỉnh, khóa mật độ quái). Để sau.
- Lập nước không đòi "trưởng của ≥ 2 khu": chỉ cần làm trưởng khu lớn nhất (thị trấn trở lên) của tỉnh vô chủ có ≥ 2 khu dân cư. Chỉ chọn mẫu, không chọn riêng chính thể + quốc giáo; tên nước bốc tự động.
- Chưa làm: mở đường từ làng (5.5), gả con lấy liên minh, bật / tắt luật trong triều chính, nước của người chơi sau khi chết vẫn ghi "người lập" trong bảng quốc gia.
- Lựa chọn tự động (chế độ Tự sống, `sim.html`) theo tính cách cố định của nhân vật, không bốc lại mỗi lần được hỏi; nếu bốc mỗi lần thì nhiều năm cộng dồn thành 20–35% đời.
- Rào (`walls`) nay giảm một nửa thiệt hại thú triều cho mọi khu có rào, kể cả thị trấn, thành phố dựng sẵn.

Đo bằng `sim.html` (thế giới `can-bang`, 1000 đời, 852 đời tới tuổi trưởng thành):

| Số đo | Mục tiêu | Kết quả (% đời trưởng thành) |
|---|---|---|
| Lập làng | ~10% | 10,1% |
| Lập nước (tỉnh vô chủ + dấy binh thành công) | < 2% | 0,5% (0 + 4 đời); dấy binh thất bại 0,2% |
| Lập thẳng thị trấn / nâng làng lên thị trấn / lên thành phố | | 0,4% / 0,2% / 0 |
| Được bầu trưởng khu | | 4,7% |
| Ra làm quan / lên Đại thần | | 10,6% / 5,3% |
| Hiệp Hội Mạo Hiểm / nhận nhiệm vụ / trưởng chi nhánh | | 36,3% / 35,4% / 2,2% |
| Phường nghề / đoàn lính đánh thuê / đánh thuê trong chiến tranh | | 24,7% / 14,3% / 2,7% |
| Quản sự / hội trưởng / lập hội | | 13,0% / 12,0% / 3,6% |
| Trận vượt Tier + 1 | 0 | 0 / 47.711 trận |

Trỗi dậy 21,2%; chết vì quái 10,2%; khu dân cư sụp / lập 2,4 / 2,3 mỗi 100 năm; hang ổ 7,1. Thế giới động 50 × 300 năm (không có người chơi) vẫn như bước 8: nước còn sống trung vị 6 (4–8), tỉnh đổi chủ 6,4, khu sụp 1,9 / lập 2,1 mỗi 100 năm. 100 thế giới (chỉ dựng): 0 lỗi, 40 cảnh báo "đất chật" như trước. 100 thế giới (chỉ dựng): 0 lỗi, 40 cảnh báo "đất chật" như trước.

### 5.9. Học viện, sư đồ, quý tộc (15/10/2026, người dùng yêu cầu thêm sau bước 9)

Đã làm (`LifeSim_RPG/js/edu.js`, `js/noble.js`). Cả ba đều tự chọn: mỗi bước đến dưới dạng quyết định, chế độ Tự sống chọn theo tính cách.

**Học viện** ba cấp (`G.EDU`), học ở trường của khu dân cư (công trình `school`: Trường làng ở thị trấn, Trường ở thành phố, Học viện ở kinh đô). Không có trường ở khu nhà thì học ở khu có trường trong tỉnh, không nữa thì ở kinh đô của nước; học xa nhà thì học phí × 1,5.

| Cấp | Tuổi | Điều kiện | Nơi | Số năm | Học phí / năm |
|---|---|---|---|---|---|
| Sơ cấp | thơ ấu (≥ 35% tuổi trưởng thành) | | thị trấn trở lên | 4 | .25 × trung vị |
| Trung cấp | thiếu niên | xong sơ cấp, Hiểu biết ≥ 25, thi đầu vào | thành phố, kinh đô | 3 | .8 × trung vị |
| Cao cấp | thiếu niên hoặc mới trưởng thành | xong trung cấp, Hiểu biết ≥ 45, thi đầu vào; chọn ngành (Võ bị, Pháp thuật, Y dược, Văn chính, Cơ khí) | Học viện ở kinh đô | 3 | 2 × trung vị |

- **Ai trả**: gia đình (cha mẹ còn sống) có ngân sách học mỗi năm theo tầng lớp, .05 / .3 / 1 / 3 / 9 × trung vị từ Cùng khổ tới Quý tộc, nên nhà Thương gia, Quý tộc cho con học tới cao cấp còn nhà Thợ thuyền chỉ lo được sơ cấp. Không đủ thì tự trả bằng tiền mình, không nữa thì **học bổng** (ít suất: Hiểu biết vượt ngưỡng 0 / 10 / 20 / 25, chăm học, bốc một lần cho mỗi cấp với xác suất .6 / .45 / .4). Hết tiền giữa chừng hoặc trường mất thì bỏ dở.
- **Thi đầu vào**: .3 + (Hiểu biết − ngưỡng) / 50 + chăm học × .3 (+.1 nhà giàu có thầy kèm), kẹp .05–.95.
- Mỗi năm đi học: Hiểu biết + 2,5 / 3,5 / 4,5 × (.5 + thời gian focus Học chữ), kinh nghiệm; ngành ở cao cấp rèn kỹ năng của ngành. Học ít hơn 25% thời gian thì năm đó chỉ tính nửa năm.
- **Tác dụng**: nghề trí óc (học giả, thầy thuốc, tu sĩ, thương nhân) thu nhập + 8% mỗi cấp, nghề khác + 2%; trung cấp kèm Hiểu biết ≥ 45, hoặc cao cấp, đủ điều kiện ra làm quan; tốt nghiệp cao cấp thì lên Đại thần sau 4 năm thay vì 6.

**Sư đồ**:

- *Làm đệ tử* (thiếu niên hoặc mới trưởng thành, mỗi đời một lần được nhận): **thợ lành nghề** dạy một sinh kế làm được ở nơi mình ở (4 năm; lễ nhập môn .3 × trung vị, không có tiền thì làm không công), mỗi năm rèn mạnh các kỹ năng của nghề, đang làm nghề đó thì thu nhập tăng dần; **cao thủ** Tier 3–5 để ý người có năng khiếu (một kỹ năng ≥ 15 hoặc cấp ≥ 8), phải thắng một trận thử tay (qua luật Tier như mọi trận), theo thầy 5 năm, rèn cả trường phái và kinh nghiệm. Xuất sư được quà (đồ nghề; hoặc tuyệt kỹ + 8 một kỹ năng và danh vọng). Thầy có thể mất giữa chừng.
- *Nhận đệ tử* (thay quyết định "Học trò" cũ chỉ dành cho tuổi già): trưởng thành trở lên, kỹ năng chủ đạo ≥ 60, tối đa 2 đệ tử đang học; mỗi năm có lễ, danh vọng, quan hệ; đệ tử học 5 năm rồi xuất sư, 15% thành danh (sử biên niên ghi), 5% bỏ đi mang theo bí kíp.

**Quý tộc** năm bậc (`G.NOBLE_VI`): Nam tước, Tử tước, Bá tước, Hầu tước, Công tước. Chỉ nước có chính thể quân chủ, đế chế, triều đình Yêu Tinh, tử quyền mới ban tước (ở `can-bang` là 2 / 7 nước). Mỗi nước ban tước có sẵn 16 nhà quý tộc NPC (1 Công, 2 Hầu, 3 Bá, 4 Tử, 6 Nam), hiện ở bảng quốc gia cùng người chơi.

- *Sinh ra*: tầng lớp Quý tộc ở nước ban tước thì 60% là con một nhà có tước (Nam : Tử : Bá : Hầu = 4 : 3 : 2 : 1), một nửa là người thừa kế: cha (không có cha thì mẹ) mất thì kế tước.
- *Công trạng* với nước đang sống (`S.merit`): đi lính +1 mỗi năm, Quan tỉnh +1,5, Đại thần +3, trưởng khu +.5 (thị trấn trở lên +1), dọn hang +2, tầng di tích +1, lập làng +4, lập thị trấn +8, nâng làng +6, nâng thành phố +12, đánh thuê cho nước +3, hạ chúa vùng +30. Đủ 25 / 45 / 70 / 100 / 140 công trạng và 20 / 30 / 40 / 55 / 75 danh vọng thì được sắc phong lên bậc kế tiếp (nhận hoặc từ chối).
- *Mua tước*: góp 40 × trung vị vào quốc khố được Nam tước, 100 × được Tử tước.
- *Tác dụng*: bổng lộc mỗi năm 1 / 2 / 3,5 / 6 / 10 × trung vị; từ Bá tước có **thái ấp** (làng hoặc thị trấn của nước gần nhà, Hầu và Công có thể là thành phố; thu thuế ở đó, bản đồ ghi "thái ấp của …"); tầng lớp lên Thương gia (Nam, Tử) hoặc Quý tộc (Bá trở lên); Tử tước trở lên đủ điều kiện làm quan, Bá tước lên Đại thần dễ hơn. Sống ở nước khác thì bổng lộc tạm dừng.
- *Mất tước*: nước mất hoặc đổi sang chính thể không ban tước; dấy binh chống nước ban tước (thành hay bại đều mất); tự từ bỏ (nút trong khối Vai trò). Chết thì con trưởng thành kế tước và thái ấp, không có con thì tước về triều đình.

Đo bằng `sim.html` (1000 đời, % mọi đời):

| Số đo | Kết quả |
|---|---|
| Vào / tốt nghiệp sơ cấp | 54,4% / 53,3% |
| Vào / tốt nghiệp trung cấp | 18,6% / 17,8% |
| Vào / tốt nghiệp cao cấp | 10,5% / 8,6% |
| Học bổng / bỏ dở / trượt thi trung cấp, cao cấp | 18,8% / 1,7% / 1,2%, 1,0% |
| Tốt nghiệp sơ / trung / cao cấp theo tầng lớp lúc sinh | Cùng khổ 37 / 5 / 0%; Nông hộ 29 / 7 / 1%; Thợ thuyền 87 / 14 / 3%; Thương gia 84 / 68 / 48%; Quý tộc 91 / 74 / 56% |
| Học việc thợ lành nghề / đệ tử cao thủ / xuất sư / nhận đệ tử | 27,2% / 15,1% / 37,1% / 13,6% |
| Sinh trong nhà quý tộc / kế tước / phong vì công trạng / mua tước | 1,0% / 0,5% / 4,1% / 1,9% |
| Tước cao nhất từng có | Nam 41, Tử 14, Bá 2, Hầu 6, Công 1 đời |

Trận vượt Tier + 1: 0 / 48.440. Trỗi dậy 20,4%, chết vì quái 10,5%, lập làng 10,0%, ra làm quan 12,4% (bước 9: 10,6%; thêm đường vào bằng học vấn và tước).

Còn để ý: nhà Cùng khổ đi học sơ cấp nhiều hơn nhà Nông hộ (37% so với 29%) vì học bổng sơ cấp xét theo Hiểu biết và tính chăm, không xét nghèo; Hầu tước (6) nhiều hơn Bá tước (2), chưa xem kỹ vì sao (nhà Hầu tước lúc sinh, hoặc người leo liền nhiều bậc khi công trạng dồn sẵn). Chưa làm: người chơi làm vua phong tước cho người khác, hôn nhân giữa các nhà quý tộc, ngành học mở nghề mới.

## 6. Đường đi và hành trình

### 6.1. Lưới chi phí

Chi phí mỗi ô = chi phí đặc trưng (bảng 2.4), ghi đè bởi đường (0,5 / 0,8). Vượt sông: +6, trừ ô cầu hoặc bến đò. Núi: không đi được trừ đèo. Hồ và biển: không đi được bằng đường bộ.

### 6.2. Lên đường

`G.moveTo` hiện nhảy thẳng sang vùng kề. Thay bằng **hành trình tới một khu dân cư** bất kỳ trên cùng lục địa (đảo thì phải đi biển, mục 7):

1. A* trên lưới chi phí, có ràng buộc ở 6.3.
2. Độ dài theo chi phí → số ngày: 1 đơn vị chi phí = 0,25 ngày. Hai thủ đô cách nhau 400px theo đường cái ~ 10 ngày; băng ngang đại lục ~ 40 ngày.
3. Ngày đi trừ vào thời gian focus của năm (focus "Đi đường" tạm thời).
4. Chia đường thành đoạn 10 ô. Mỗi đoạn xét gặp quái: `p = .08 × mậtĐộ(tỉnh, tầng của ô) × (trên đường ? .3 : 1) × ambush đặc trưng`. Trận dùng bảng loài của tầng và biome tại ô đó.
5. Ngoài quái: sự kiện đường (cướp đường, lạc rừng, lũ, gặp đoàn buôn, ngủ nhờ đồn).
6. Vẽ đường đi lên bản đồ (đã có `o.path`).

### 6.3. Hành trình không lách luật Tier

A* coi ô có tầng bị khóa với nhân vật (`lo > t + 1`, Liều mạng thì `t + 2`) là **không đi được**. Không tìm được đường thì có ba lựa chọn:

- **Thuê hộ tống** (tốn bạc theo quãng đường): trận trên đường do đoàn hộ tống gánh, nhân vật chỉ gặp sự kiện. Hộ tống có thể bỏ chạy khi gặp loài quá mạnh.
- **Đi biển** nếu có cảng.
- **Bật Liều mạng.**

Nhờ vậy nhân vật Tier 0 sinh ở thủ đô một nước trên đồng bằng đi được tới thủ đô nước bên cạnh theo đường cái, nhưng không tự mò được tới cái đồn giữa Vực Hắc Uyên.

### 6.4. Biên giới

Đường cắt biên quốc gia thì có **trạm**:

| Tình huống | Kết quả |
|---|---|
| Bình thường | thu phí = thuế nước đến × 5 bạc |
| Đang bị truy nã ở nước đến | bị bắt, trừ khi Stealth đủ cao hoặc hối lộ |
| Hai nước đang đánh nhau | biên đóng: phải vượt biên lén qua ô hoang (không đi đường) |
| Nước đến có `hunt_undead`, nhân vật là Bộ Xương | bị chặn; vượt lén thì gặp sự kiện Thánh Kỵ Sĩ |
| Nước đến có `no_outsiders` | cho qua, đếm ngày ở lại |

### 6.5. Kết quả bước 5 (15/10/2026)

Đã làm: mạng đường (đường cái theo cây khung nhỏ nhất giữa kinh đô / thành phố / thị trấn, đường mòn cho làng và đồn, lối nhỏ cho thôn), cầu, đèo, đường làm nguồn văn minh cho độ hoang, hành trình (`LifeSim_RPG/js/travel.js`), trạm biên giới, thuê hộ tống, đi thuyền ra đảo theo tuyến biển cũ; bảng vùng xem trước chuyến đi và đi được tới mọi vùng.

Khác với thiết kế ở trên:

- Đường cái không thêm cạnh phụ "đường hiện có dài hơn 1,5 lần đường thẳng"; cây khung + đường mòn đã đủ nối mọi khu.
- Núi không cấm hẳn: đường và người đi qua ô núi với chi phí 8, nên đèo là chỗ đường cắt qua núi chứ không chọn ô thấp nhất của dãy.
- Lội sông không cầu +6 khi đi; khi dựng đường chỉ +1,5 (để đường vẫn bắc cầu ở chỗ cần).
- Phí trạm = thuế của nước đến × 40 bạc (thiết kế ghi × 5, quá nhỏ). Đường xuống cấp khi làng bỏ hoang để bước quốc gia động.
- Ngày đi chưa trừ vào thời gian focus của năm; thay bằng tiền ăn ở 0,3 bạc / ngày.

Đo bằng `sim.html` (thế giới `can-bang`): 692 ô đường cái, 488 ô đường mòn, 166 ô lối nhỏ, 56 ô cầu, 15 ô đèo; tầng ven tăng từ 20% lên 27% diện tích nhờ đường. 1000 đời: 42.591 trận, 0 trận vượt Tier + 1, 70% đời có đi xa (~1.580 chuyến), chết dọc đường 0,1% số đời (mục tiêu < 8% số cái chết), 5 lần thuê hộ tống. 100 thế giới: 0 lỗi, ~0,45 giây mỗi thế giới.

Lỗi gặp khi làm: phép loang độ hoang từ đường trộn nhiều bán kính (mỗi nước một tuần tra) trong một hàng đợi làm nhãn bị sửa lại gần như vô tận ở vài thế giới (treo); đã tách mỗi nhóm bán kính một lần loang.

## 7. Lớp 5: biển

### 7.1. Vùng biển

Bảy vùng biển, đặt bằng điểm neo như biome đất, Voronoi chỉ trên ô biển. Bảng dưới là **kiểu** vùng biển (gắn với biome đất giáp bờ); tên thật mỗi thế giới bốc từ `names.geo.sea`.

| Kiểu vùng biển | Vị trí | Thời tiết | Ven bờ / Khơi / Sâu / Vực biển |
|---|---|---|---|
| Biển sương | tây, trước Bờ Sương | sương mù (tầm nhìn thấp, dễ bị phục kích) | T0–1 / T1–2 / T2–3 / T3–4 |
| Biển đảo rắn | tây nam, quanh quần đảo | bão mùa hè | T1–2 / T2–3 / T3–4 / T4–5 (Leviathan) |
| Biển băng | bắc | băng trôi (mùa đông không qua được) | T1 / T1–3 / T3–4 / T4 |
| Biển sấm | đông bắc, dưới Đỉnh Bão | bão sét quanh năm | T1–2 / T2–3 / T3–4 / T4–5 |
| Biển tro | đông, trước Núi Tro | nước nóng, khói núi lửa | T1 / T2–3 / T3–4 / T4 |
| Biển đỏ | đông nam, trước Hồng Sa | lặng, nắng gắt | T0–1 / T1–3 / T3–4 / T4 |
| Vịnh vực | nam, trước Vực Hắc Uyên | nước đen, không trăng | T2–3 / T3–4 / T4–5 / T5 |

Tầng biển theo **độ hoang biển** `w = d_bờ / 5 − (trong 8 ô quanh cảng ? .6 : 0)`: ven bờ < 1, khơi 1–2,5, sâu 2,5–4, vực biển ≥ 4. Cùng lược đồ tầng với đất, nên `validateWorld` kiểm cùng một cách. Vực biển T5 của vịnh vực và T5 của biển đảo rắn đang thiếu loài (xem 7.2).

### 7.2. Loài biển

Có sẵn: Cua Đá T0, Thủy Thi T1, Cá Mập Rạn T2, Thủy Linh Triều T2, Hải Xà T3, Nữ Yêu Biển T3, Kraken Non T4, Leviathan T5 (chúa). Thiếu loài cho T0–1 ngoài khơi, cho biển băng, biển tro và cho vực biển T5. Loài nháp cần thêm vào `data/ecology.js` (tên loài là tên cố định của bestiary, không bốc từ `names.js`):

| Nháp | Tier | Họ | Kiểu | Vùng |
|---|---|---|---|---|
| Sứa Đèn | 0 | ooze | flyer (trôi) | mọi vùng, ven bờ |
| Cá Chình Điện | 1 | beast | ambusher | biển sấm, biển sương |
| Hải Cẩu Nanh | 1 | beast | chaser | biển băng |
| Rùa Lưng Đá | 2 | beast | pacer | biển đỏ, biển tro |
| Mực Khổng Lồ | 3 | magical_beast | rooted | khơi, sâu |
| Hải Long Băng | 4 | dragon | spitter | biển băng: sâu, vực |
| Cá Voi Xương | 5 | undead | charger | vực biển: vịnh vực, biển đảo rắn |

### 7.3. Tàu và hải trình

Cảng = khu dân cư `coastal`. Hải trình giữa hai cảng bằng A* trên ô biển; chi phí ô biển 0,6 (đi biển nhanh hơn đi bộ), nhưng mỗi loại tàu chỉ vào được một số tầng:

| Tàu | Tầng vào được | Giá vé | Có ở |
|---|---|---|---|
| Thuyền chài | ven bờ | rẻ | mọi cảng |
| Tàu buôn | ven bờ, khơi | vừa | town, capital ven biển |
| Tàu viễn dương | ven bờ, khơi, sâu | đắt | thủ đô ven biển; mọi cảng của nước có đặc tính Tàu lá (E4) hoặc đặc trưng Cảng lớn |
| Không tàu nào | vực biển | | chỉ tới bằng sự kiện (đắm tàu trôi dạt, chúa biển kéo xuống) |

Mỗi đoạn hải trình xét quái theo tầng biển (vẫn qua luật Tier, A* tránh tầng bị khóa như đường bộ), cộng sự kiện biển: bão (theo mùa và vùng biển, có thể đắm tàu → dạt vào bờ gần nhất), cướp biển (xác suất tăng theo độ hoang biển và giảm gần cảng nước mạnh), cảng cấm cập vì dịch.

`G.SEA_ROUTES` cố định bỏ đi; hải trình tự sinh. Đảo chỉ tới được bằng tàu.

Sinh kế: ngư dân làm ở tầng ven bờ gần nhất (rủi ro theo tầng đó), thủy thủ ở tầng khơi trên hải trình của cảng nhà. Ngư dân ở biển đảo rắn vì vậy nguy hiểm hơn ngư dân biển đỏ.

### 7.4. Kết quả bước 6 (15/10/2026)

Đã làm: 7 vùng biển (`G.SEAS` trong `LifeSim_RPG/data/world.js`, Voronoi trên ô biển trong `js/map.js`), 4 tầng biển theo độ hoang biển (`js/realm.js` mục 11), 8 loài biển mới trong `data/ecology.js` (7 loài nháp ở 7.2, Cá Chình Điện đổi id thành `thunder_eel`, thêm Tàu Ma T4 họ U Linh để vực biển nào cũng có hai họ quái), bến và ba loại tàu, hải trình A* (`js/travel.js`), chuyến đi qua biển, bão, đắm tàu, cướp biển, cảng cấm cập vì dịch, thuế cảng, nghề biển theo tầng, chế độ xem Biển, tooltip ô biển, tầng biển trong chế độ Nguy hiểm. `G.SEA_ROUTES` đã bỏ.

Bảng loài của từng tầng biển:

| Vùng biển | Ven bờ | Khơi | Sâu | Vực biển |
|---|---|---|---|---|
| Biển sương | T0–1: Cua Đá, Sứa Đèn, Cá Chình Điện, Thủy Thi | T1–2: Cá Chình Điện, Thủy Thi, Thủy Linh Triều, Cá Mập Rạn | T2–3: Thủy Linh Triều, Cá Mập Rạn, Nữ Yêu Biển, Mực Khổng Lồ | T3–4: Nữ Yêu Biển, Hải Xà, Mực Khổng Lồ, Tàu Ma |
| Biển đảo rắn | T1–2: Thủy Thi, Cá Mập Rạn, Thủy Linh Triều | T2–3: Cá Mập Rạn, Hải Xà, Nữ Yêu Biển | T3–4: Hải Xà, Mực Khổng Lồ, Kraken Non | T4–5: Kraken Non, Cá Voi Xương, Tàu Ma |
| Biển băng | T1: Hải Cẩu Nanh, Thủy Thi | T1–3: Hải Cẩu Nanh, Băng Hồn, Mực Khổng Lồ | T3–4: Mực Khổng Lồ, Hải Xà, Hải Long Băng | T4: Hải Long Băng, Kraken Non |
| Biển sấm | T1–2: Cá Chình Điện, Thủy Thi, Thủy Linh Triều | T2–3: Thủy Linh Triều, Cá Mập Rạn, Hải Xà | T3–4: Hải Xà, Mực Khổng Lồ, Lôi Linh, Kraken Non | T4–5: Lôi Linh, Kraken Non, Lôi Điểu, Cá Voi Xương |
| Biển tro | T1: Thủy Thi, Đốm Lửa Ma | T2–3: Rùa Lưng Đá, Nhầy Dung Nham, Cá Mập Rạn, Hải Xà | T3–4: Hải Xà, Mực Khổng Lồ, Kraken Non | T4: Kraken Non, Tàu Ma |
| Biển đỏ | T0–1: Cua Đá, Sứa Đèn, Thủy Thi | T1–3: Thủy Thi, Rùa Lưng Đá, Cá Mập Rạn, Mực Khổng Lồ | T3–4: Mực Khổng Lồ, Hải Xà, Kraken Non | T4: Kraken Non, Tàu Ma |
| Vịnh vực | T2–3: Cá Mập Rạn, Thủy Linh Triều, Nữ Yêu Biển | T3–4: Nữ Yêu Biển, Hải Xà, Mực Khổng Lồ, Kraken Non | T4–5: Kraken Non, Tàu Ma, Cá Voi Xương | T5: Cá Voi Xương, Ma Tướng Hỏa Giác |

Khác với thiết kế ở trên:

- **Quần Đảo Hải Xà dính đất liền từ bước 1** (đất của Trảng Mộng và Đồi Mộ lan tới đảo). Giờ đất của vùng khác lùi ra ngoài 1,32 bán kính đảo, để lại eo biển ~7 ô. Bản đồ đất vì thế đổi nhẹ (phân vị độ cao, độ ẩm tính trên toàn bộ đất), và thế giới `can-bang` ra bộ nước khác (7 nước, 163 khu dân cư thay vì 6 nước, 116 khu); số đo bước 1–5 ở trên là của bản đồ cũ. Đảo kề (cho quyết định rời quê, áp giải) các vùng có bờ cách bờ đảo ≤ 30 ô.
- **Bến** = khu dân cư bất kỳ có ô biển trong 2 ô (thiết kế: khu `coastal`). Thuyền chài ở mọi bến; tàu buôn ở khu có vai trò cảng (thị trấn trở lên, thiết kế: town, capital); tàu viễn dương như thiết kế. Đảo không có khu nào sát bờ thì khu gần biển nhất dựng cầu tàu; bến lớn nhất của đảo có ít nhất tàu buôn.
- **Vũng biển kín**: lục địa có vài vũng biển không thông ra khơi (từ bước 1, như hồ nước mặn). Bến ở đó có tàu nhưng không có hải trình; chỉ ghép cặp bến chung vùng nước theo tầng tàu (thành phần liên thông của ô biển tầng ≤ tầng của tàu).
- Chuyến đi xét đường biển khi đường bộ từ 8 ngày, hoặc khi đích ở khối đất khác (khi đó không tìm đường bộ). Hải trình cộng 1 ngày chờ tàu. Vé: thuyền chài 1, tàu buôn 2, tàu viễn dương 4 bạc mỗi ngày biển; thiếu bạc thì làm công trên tàu. Tầng biển bị khóa: trả thêm phí hộ tống như đường bộ, lính trên tàu đánh thay, 6% mỗi khúc tàu quay về.
- Quái trên tàu: mỗi 10 ô xét .025 × mật độ × phục kích của vùng biển (sương mù 1,4, vịnh vực 1,3), tối đa 3 trận. Bão, cướp biển: một lần mỗi chuyến tại một ô ngẫu nhiên của hải trình, xác suất × min(2, ngày / 6). Bão thành đắm tàu 25% (thuyền chài), 12% (tàu buôn), 6% (tàu viễn dương); đắm thì chết 10–30% (theo Body; Cơ Nhân 50%, Bộ Xương không chết) hoặc dạt vào bờ gần nhất, mất nửa túi bạc. Cướp biển .03 + .1 mỗi nước có luật cướp phá và có bến trên vùng biển đó (Liên Minh Cướp Biển .2), tàu viễn dương × .5. Chưa có mùa: "bão mùa hè", "băng trôi mùa đông" thành xác suất bão cả năm và hệ số chậm 1,3.
- Mật độ quái biển theo vùng biển × tầng (`zonePop` có thêm 28 khóa); không có thú triều từ biển.
- Thuế cảng: tàu cập bến nộp thuế × 30 bạc; dân thành thị ở cảng của nước có luật × 1,1 thu nhập.
- Nghề biển: ngư dân, thủy thủ chỉ làm trên biển khi sống ở bến (làng chài ven sông, hồ giữ như cũ). Rủi ro tai nạn × (1 + .25 × Tier thấp nhất của tầng), đuối nước / đắm tàu × (1 + .3 × Tier đó), mỗi năm ~10% gặp một con quái của tầng (qua luật Tier). Thủy thủ chết vì đắm tàu thay cho đuối nước.
- Ngưỡng tầng biển theo thiết kế (1 / 2,5 / 4) cho diện tích biển: ven bờ 16%, khơi 22%, sâu 17%, vực biển 44%.

Lỗi gặp khi làm: A* lưu chi phí đã đi trong `Float32Array`; chi phí biển 0,6 × 1,414 bị làm tròn lên khi lưu nên `nd < g[j]` đúng mãi, ô bị đẩy lại hàng đợi không dứt và trang treo. Đổi sang `Float64Array`.

Đo bằng `sim.html` (thế giới `can-bang`, 1000 đời): 46.093 trận, 0 trận vượt Tier + 1, trỗi dậy 20,6%, chết vì quái 11,3%; 69% đời có đi xa, 2,2% đời có đi tàu (28 chuyến, 3 trận trên biển, 5 lần gặp bão, 1 lần đắm tàu, không ai chết trên biển); ngư dân 4,3% số đời. 200 chuyến tàu thử ra đảo (nhân vật cấp 1–30, chuyến trung bình 42 ngày kể cả đường bộ): 0,55 trận mỗi chuyến, bão 15%, đắm tàu 3%, chết 1%. 100 thế giới: 0 lỗi, 78 thế giới có người trên đảo, mỗi thế giới ~18 bến thuyền chài, ~9 bến tàu buôn, ~1,6 bến tàu viễn dương; ~0,5 giây mỗi thế giới (phần biển ~0,1 giây; máy chạy song song phiên khác nên số giờ chỉ để tham khảo).

## 8. Ảnh hưởng tới mô hình đời

| Chỗ | Thay đổi |
|---|---|
| Sinh | bốc tỉnh theo `pop` → khu dân cư → ô; chủng tộc và đạo theo tỉnh (đã pha quốc giáo) |
| Thu nhập | `G.incomeAt(tỉnh, pct) × (1 − tax) × thái độ chủng tộc` |
| Săn quái | `zonesFor` trả các tầng có trong tỉnh đang ở (tỉnh không có ô lõi thì không có tầng lõi). Điểm săn chọn ô thuộc tầng đó gần khu dân cư nhất; bảng loài lấy theo biome của ô, nhân đặc trưng của ô |
| Nguyên nhân chết mới | lạc rừng, sốt rừng, lũ, lở đá, tuyết lở, đắm tàu, bị hành quyết (luật). Trọng số nhân theo đặc trưng của tỉnh (tỉ lệ ô) như cách `biome` đang nhân |
| Sinh kế mới | tiều phu (rừng, rừng rậm), lái đò (tỉnh có sông) |
| Focus | thêm "Đi đường" (chỉ bật khi đang có hành trình) |
| Đồng niên | sống ở tỉnh; chết vì chiến tranh khi tỉnh của họ là tiền tuyến |

Sự kiện mới, khoảng 30:

| Nhóm | Sự kiện |
|---|---|
| Quốc gia | thuế tăng; gọi lính nghĩa vụ; phong tước; quê đổi chủ; nổi loạn trong tỉnh; vua băng hà, tranh ngôi; hòa ước; lệnh truy nã; ân xá; lễ quốc giáo; bị kiểm kê (Cơ Nhân); trục xuất ngoại tộc |
| Đường | trạm thu phí; biên giới đóng; cướp đường; lạc trong rừng rậm; sông lũ; cầu sập; gặp đoàn buôn; ngủ nhờ đồn |
| Biển | bão; cướp biển; quái nổi cạnh tàu; đắm tàu dạt đảo; cảng cấm cập |
| Hoang dã | làng bên bị bỏ; hang ổ mới gần làng; thú triều từ hang; tìm thấy phế tích; làng mới lập ven sông |
| Bộ Xương | quê cũ đổi chủ; nước theo đạo `dark` mời về; nước có `undead_citizen` mở cửa |
| Làng của mình | người tới xin ở; quái đánh làng; xây tường; mở đường; làng lên town; làng bên xin sáp nhập |
| Nước của mình | sứ thần nước khác; con muốn kế vị; quan lại tham nhũng; nổi loạn đòi tách |

Ngoài ra mỗi đặc tính mẫu và đặc trưng riêng ở `research/04` kéo theo 1–2 sự kiện của nó (tòa dị giáo, lời tiên tri, ngủ quên bảy năm, đấu trường…). Đó là phần lớn nội dung sự kiện của bản đồ mới, ước chừng 80–100 sự kiện.

## 9. Giao diện bản đồ

Bốn chế độ xem, nút chuyển ở góc bản đồ:

| Chế độ | Hiện |
|---|---|
| **Địa hình** | màu biome, bóng độ cao, sông, hồ, ký hiệu rừng / rừng rậm / đầm / núi, đường, cầu |
| **Chính trị** | màu quốc gia, biên tỉnh mảnh, biên nước đậm, thủ đô, tỉnh đang chiến tranh có sọc |
| **Nguy hiểm** | tô theo tầng *so với nhân vật*: xanh (an toàn), vàng (vừa sức), đỏ (Liều mạng), xám (khóa). Hang ổ, di tích, ổ chúa |
| **Biển** | vùng biển, tầng biển, hải trình từ cảng gần nhất, thời tiết đang có |

Bấm một ô: tỉnh, nước, biome, đặc trưng, tầng (Tier), mật độ quái, đường tới đó mất bao lâu. Bấm một nước (chế độ Chính trị): chính thể, người cai trị, quốc giáo, thuế, luật, thái độ chủng tộc, đặc tính mẫu, đặc trưng riêng, quan hệ với các nước khác. Giữ mộ các kiếp trước và đường đời như hiện tại. Thêm thẻ **Biên niên sử**.

Màn tạo thế giới (trước kiếp đầu, hoặc khi chọn "Thế giới mới"): ô nhập seed, nút bốc lại, xem trước bản đồ Chính trị và danh sách nước. Người chơi tạo thế giới tới khi thấy hợp thì bắt đầu đời.

## 10. Kiểm tra dữ liệu và cân bằng

`validateWorld` mới lỗi khi:

- Tầng nào của biome / vùng biển nào có dải rộng quá 2, sâu hơn mà Tier thấp hơn, hoặc có Tier nhân vật vào được mà không có loài để gặp (luật cũ, áp cho 16 biome + 7 vùng biển + 7 kiểu di tích).
- Khu dân cư nằm trên biển, hồ, núi.
- Hai khu dân cư cùng lục địa không nối được bằng đường.
- Đảo có khu dân cư mà không có cảng; cảng không tới được cảng nào khác.
- Quốc gia có thủ đô không thuộc nước mình; tỉnh thuộc nước không tồn tại.
- Mọi ô biển không thuộc vùng biển nào.
- Mẫu quốc gia: chủng tộc, giáo phái, luật, đặc tính, biome không tồn tại; `needs` không thể thỏa trên bản đồ Varen (mẫu đó không bao giờ được bốc thì cảnh báo).
- `names.js`: mỗi chủng tộc thiếu một danh sách cần dùng; danh sách nào ít hơn số lần cần bốc trong một thế giới (ví dụ ít hơn 12 gốc tên khu dân cư) thì cảnh báo.

Ngoài 1000 đời, `sim.html` chạy thêm **200 thế giới** (chỉ tạo, chưa sống) để xem phân bố: mẫu nào hay được bốc, mẫu nào không bao giờ ra, số nước, cỡ nước, tỉ lệ đất vô chủ.

`sim.html` thêm số đo (1000 đời, mỗi đời chạy kèm thế giới):

| Số đo | Mục tiêu khởi điểm |
|---|---|
| Trận vượt Tier + 1 (kể cả trên đường, trên biển, trong hang) | 0 |
| Số nước còn sống sau 300 năm | trung vị 5–7, không đời nào < 3 |
| Tỉnh đổi chủ / 100 năm | 3–8 |
| Khu dân cư sụp / lập mới / 100 năm | 1–3 / 1–3 |
| Hang ổ đang có | 8–15 toàn đại lục |
| Chết trên đường / tổng số chết | < 8% |
| Tỉ lệ đời Tier 0 tới được thủ đô nước khác | > 70% |
| Đời lập làng / lập nước | ~10% / < 2% đời người trưởng thành |
| Mẫu quốc gia xuất hiện trong 200 thế giới | mẫu nào cũng ≥ 1 lần; không mẫu nào > 40% |

## 11. Save

Đổi phiên bản save (save cũ báo không tương thích, mộ cũ bỏ). Lưu: **seed thế giới**, chủ tỉnh, trạng thái khu dân cư (hp, state, khu mới lập kèm tọa độ và tên), quốc gia mới lập và chỉ số động của mọi nước, chiến tranh và hưu chiến, hang ổ, `zonePop` theo tỉnh × tầng, sử biên niên (giữ 300 dòng cuối). Lớp 1–2, vùng biển, khu dân cư ban đầu, quốc gia ban đầu và tên đều dựng lại từ seed; đường và độ hoang dựng lại từ khu dân cư. Làng và nước người chơi lập lưu đầy đủ (tên, mẫu, chỉ số). Một save giữ được nhiều thế giới; mộ gắn với thế giới của nó.

## 12. Thứ tự làm (khi bắt đầu code)

Mỗi bước để game chạy được và `sim.html` sạch lỗi trước khi sang bước sau.

| Bước | Việc | Người chơi thấy |
|---|---|---|
| 1 ✓ | Mở khung 1200 × 900; lớp địa hình, sông, hồ, đặc trưng; chế độ xem Địa hình (15/10/2026) | bản đồ có sông, rừng, núi; chưa đổi luật chơi |
| 2 ✓ | Nạp `names.js`; 50 mẫu quốc gia vào `data/nations.js`; seed thế giới; kinh đô, lãnh thổ, mạng khu dân cư phân cấp, vai trò, công trình, dân, tỉnh, tên (`research/05`); quốc gia tĩnh; chế độ xem Chính trị, màn tạo thế giới | mỗi thế giới một bộ nước, thành phố, làng; sinh ra ở thành thị hoặc nông thôn |
| 3 ✓ | Bảng 4 tầng theo biome (thêm vùng chết); độ hoang tĩnh từ mạng khu dân cư; encounter đọc theo ô (15/10/2026, xem mục 3.6) | vùng an toàn bám quanh làng; chế độ xem Nguy hiểm |
| 4 ✓ | Sinh kế theo công trình; thuế, luật, thái độ chủng tộc vào đời (15/10/2026, xem mục 5.6) | sinh ra ở một nước có luật |
| 5 ✓ | Đường, cầu, đèo, hành trình, trạm biên giới, hộ tống (15/10/2026, xem mục 6.5) | đi lại có quãng đường |
| 6 ✓ | Vùng biển 4 tầng, loài biển mới, tàu, hải trình (15/10/2026, xem mục 7.4) | đi biển |
| 7 ✓ | Quốc gia động, khu dân cư sụp / lập, độ hoang động, sử biên niên (15/10/2026, xem mục 5.7) | thế giới đổi qua các kiếp |
| 8 ✓ | Hang ổ, di tích, ổ chúa (15/10/2026, xem mục 4.3) | dọn hang, thú triều có nguồn |
| 9 ✓ | Lập làng, lập thị trấn, lập nước, hội, làm quan, focus Quản lý (15/10/2026, xem mục 5.8); thêm học viện, sư đồ, quý tộc (mục 5.9) | người chơi để lại dấu trên bản đồ |
| 10 | Sự kiện cho luật, đặc tính, đặc trưng riêng; quyết định; đường thăng tiến theo chính thể | |

## 13. Còn phải chốt

- Duyệt 50 mẫu quốc gia và ~30 đặc trưng riêng ở `research/04` (đổi số, bỏ mẫu, thêm mẫu).
- Duyệt `names.js` (~1.200 tên): bỏ tên không hợp, thêm tên.
- Biome có giữ cố định theo bố cục Varen không, hay sau này cũng bốc theo seed (phương án E3 + F4 ở `research/02`).
- Loài biển đã vào game (mục 7.4); Mắt Bão có thêm Cá Voi Xương, Đáy Thật có thêm Cốt Long. Còn thiếu loài T5 cho vùng chết sa mạc và đầm (hiện dùng loài T4–5 sẵn có).
- Vũng biển kín trong lục địa (mục 7.4): giữ là biển, hay đổi thành hồ ở bước địa hình.
- Lập nước: người chơi có được chọn mẫu nước của chủng tộc khác không (hiện chỉ mẫu của chủng tộc mình).

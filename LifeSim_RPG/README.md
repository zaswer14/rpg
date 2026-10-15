# Vạn Kiếp — mô phỏng một đời ở đại lục Varen

**Ngày:** 14/10/2026 · **Trạng thái:** bản chơi được đầu tiên. · **Nguồn ý tưởng:** `research/01_Life_Sim_1in8b.md`.

Người chơi bấm một nút và được sinh ra ở đâu đó trên đại lục Varen: khu dân cư (trong một thế giới có quốc gia, thành phố, làng mạc sinh theo seed), thành thị hay nông thôn, chủng tộc, giới, tầng lớp, giáo phái đều bốc theo trọng số. Đời chạy theo thời gian thực, mỗi năm vài giây, xen sự kiện, quyết định và các lượt săn quái, cho tới khi nhân vật chết. Lúc chết tung d100: **từ 20 trở xuống (20%) thì trỗi dậy thành Bộ Xương**, mang theo **kỹ năng chủ đạo** (mastery cao nhất) của kiếp đó; mọi thứ khác về số 0. Bộ Xương chết lại cũng tung 20% như vậy, nên có thể nối nhiều kiếp.

## 1. Chạy

Trang nạp `../library/*.js` nên cần một server tĩnh (mở file trực tiếp thì trình duyệt chặn script).

```bash
powershell -ExecutionPolicy Bypass -File LifeSim_RPG/tools/serve.ps1
```

Rồi mở `http://localhost:8765/LifeSim_RPG/`. Trong Claude desktop: cấu hình `vankiep` trong `.claude/launch.json`.

- `index.html` — game. `?seed=abc` để chơi lại đúng một đời, `?world=abc` để mở đúng một thế giới.
- `sim.html` — chạy N đời headless (mặc định 1000) và in phân phối: chênh Tier khi gặp quái, tỉ lệ trỗi dậy, nguyên nhân chết, tuổi thọ theo chủng tộc/sinh kế, Tier cuối đời. Dùng trước khi chỉnh số. Ô "Thế giới" chọn thế giới cho các đời; nút **Thử nhiều thế giới** dựng N thế giới (mặc định 100) và in phân bố mẫu quốc gia, số nước, khu dân cư, tỉ lệ đô thị, đất vô chủ, lỗi.

Điều khiển: tạm dừng (Space), tốc độ ½×–8×, **Tự sống** (nhân vật tự chọn focus và tự quyết theo tính cách), **Kiếp mới**. Bấm một vùng trên bản đồ để xem khu, loài quái, tình trạng (dịch, chiến tranh, thú triều) và lên đường nếu vùng đó giáp chỗ đang ở. Tiến trình tự lưu vào bộ nhớ trình duyệt; mộ các kiếp trước hiện trên bản đồ.

## 2. Bản đồ: đại lục, vùng, khu

Không dùng bản đồ thế giới thật. Đại lục Varen có **16 vùng**, mỗi vùng là một kiểu địa hình (6 vùng săn của thư viện + 10 kiểu mới trong `data/ecology.js`). Bản đồ là raster 300 × 225 ô (khung 1200 × 900, đại lục ở giữa, quanh là biển) dựng từ tâm và bán kính vùng (Voronoi có trọng số, bẻ cong bằng noise), suy hoàn toàn từ dữ liệu nên không cần lưu.

**Địa hình** (bước 1 của `research/03_Thiet_ke_ban_do_Varen_V2.md`): mỗi ô có độ cao, độ ẩm, nhiệt (noise + độ lệch theo biome trong `G.TERRAIN`), sông và hồ (priority-flood, dồn nước theo độ ẩm) và một đặc trưng trong `G.FEATURES`: đồng trống, đồi, rừng, rừng rậm, đầm, núi, hồ. Nút **Vùng / Địa hình** trên bản đồ đổi chế độ xem; tooltip ghi đặc trưng ô. Đặc trưng chưa ảnh hưởng luật chơi (đi lại, quái, sinh kế vào ở các bước sau).

**Quốc gia và khu dân cư** (bước 2; `research/04_Mau_quoc_gia.md`, `research/05_Thanh_pho_lang_mac.md`, `js/realm.js`): không có nước hay làng khai tay. Mỗi **thế giới** (seed riêng, khác seed của đời) bốc 5–7 mẫu trong 50 mẫu quốc gia (`data/nations.js`, 10 chủng tộc × 5), đặt kinh đô theo chỗ hợp với mẫu, lan lãnh thổ theo chi phí đi (~75% đất có chủ), rồi dựng mạng khu dân cư phân cấp: kinh đô, thành phố, thị trấn, làng, thôn, cộng vai trò (cảng, đồn, mỏ, trại gỗ, làng chài, làng ruộng, đền, chợ biên) và phế tích ở đất vô chủ. Tỉnh = kinh đô / thành phố / thị trấn + vùng quanh nó. Dân đô thị theo bậc; dân nông thôn theo sức chứa từng ô, gom về làng gần nhất, co giãn theo tỉ lệ đô thị của chủng tộc. Mỗi nước có tên, người cai trị, quốc giáo, thuế, luật, thái độ chủng tộc, đặc tính của mẫu và 1–2 đặc trưng riêng; mọi tên lấy từ `data/names.js`. Một thế giới ~140 khu dân cư, ~35 tỉnh, dựng trong ~0,2 giây.

Nhân vật sinh ra ở một khu dân cư cụ thể, **trong khu** (thành thị) hoặc **vùng quê quanh khu** (nông thôn, ~75% số đời), chủng tộc và đạo theo khu đó. Luật, thuế, công trình chưa tác động lên đời (bước 4).

Nút **Vùng / Địa hình / Chính trị / Nguy hiểm** đổi chế độ xem. Chính trị: màu nước, biên nước đậm, biên tỉnh mảnh, đất vô chủ gạch chéo; bấm vào một nước để xem bảng quốc gia. Rê chuột lên khu dân cư: bậc, vai trò, dân, công trình. Nút **Thế giới mới** tạo đại lục khác; `?world=abc` mở đúng một thế giới.

Mỗi vùng có **4 khu = 4 tầng nguy hiểm**: ven → sâu → lõi → vùng chết, mỗi khu một dải Tier và bảng loài riêng (`data/world.js`). Ô nào thuộc tầng nào do **độ hoang** quyết định (bước 3, `js/realm.js`): khoảng cách đi bộ từ ô tới khu dân cư gần nhất chia cho bán kính của khu (kinh đô 120px, thành phố 100, thị trấn 80, làng 50, thôn 25, đồn ít nhất 70; nhân tuần tra của nước, vô chủ × 0,6), cộng độ hoang biome (`G.TERRAIN.wild`) và địa hình (`G.FEATURES.wild`). Ngưỡng ven < 1 ≤ sâu < 2 ≤ lõi < 3 ≤ vùng chết. Rừng rậm, núi "xa" văn minh hơn đồng bằng; vùng không có làng nào gần là lõi hoặc vùng chết. Một vùng có thể thiếu tầng (vùng hoang không có tầng ven); khu săn chỉ hiện tầng có ô. Trận đánh xảy ra ở một ô cụ thể của khu, và địa hình ô đó nhân trọng số loài đã có (`G.FEATURE_SPAWN`: rừng rậm nhiều quái phục kích và côn trùng, núi nhiều quái bay và rồng…). Chế độ xem **Nguy hiểm** tô từng ô theo sức nhân vật: an toàn, vừa sức, nguy hiểm (Liều mạng), khóa.

### Luật phân cấp (tránh cấp thấp gặp cấp cao)

| Luật | Ở đâu |
|---|---|
| Mọi loài trong khu có Tier nằm trong dải `[lo, hi]` của khu; `hi − lo ≤ 2`; khu sâu không thấp hơn khu ngoài | `validateWorld` (lỗi khi nạp) |
| Nhân vật Tier `t` (= cấp / 10) chỉ gặp loài Tier ≤ `t + 1` | `encounterTable` — mọi trận đều qua đây |
| Khu có `lo > t + 1` bị khóa | `zonesFor` |
| **Liều mạng** (tick tay): mở thêm một bậc, gặp tới `t + 2` | công tắc trên giao diện |
| Khu gợi ý = khu sâu nhất mà đe dọa trung bình thấp hơn sức mình ~0,3 Tier | `recommendedZone` |
| Đi đường sang vùng mới: gặp quái ở tầng gần làng nhất của vùng đó, vẫn qua luật trên | `G.moveTo` |
| Địa hình ô chỉ nhân trọng số loài đã có trong khu, không thêm loài | `encounterTable` |

Kết quả 1000 đời headless (seed `can-bang`, thế giới `can-bang`, 4 tầng): 47.490 trận, chênh Tier từ −5 tới +1, **không trận nào vượt +1**.

### Quái hoạt động theo khu

Mỗi khu có **mật độ** (`world.zonePop`, 0,3–2,2), cập nhật mỗi năm trong hệ con `world`:
sinh sôi kiểu logistic (vùng nguy hiểm sinh nhanh hơn) → bị thợ săn NPC tỉa (vùng giàu tỉa nhiều hơn) → mùa sinh sản ngẫu nhiên → khu sâu hơn quá đông thì đẩy mật độ ra khu ngoài nó (vùng chết → lõi → sâu → ven; thợ săn NPC không vào vùng chết) (chỉ đẩy mật độ, **không đẩy loài**, nên dải Tier vẫn giữ) → khu ven vượt 1,25 thì thành **thú triều** (`raid`), tăng nguy cơ chết của dân trong vùng và bắn sự kiện quái tràn vào làng. Người chơi hạ quái thì mật độ khu đó giảm. Ba vùng có **chúa vùng** (Leviathan, Cổ Long, Chúa Quỷ Hắc Uyên) ngủ ở vùng chết của vùng, chỉ xuất hiện qua sự kiện khi nhân vật từ cấp 40.

## 3. Mô hình đời (theo 1in8b)

| Ý tưởng của 1in8b | Ở Vạn Kiếp |
|---|---|
| Mỗi nước vài chục con số, mọi xác suất suy ra bằng công thức | Mỗi vùng khai giàu, Gini, nguy hiểm, ma lực, dân số, tỉ lệ chủng tộc/giáo phái |
| Bảng sống Gompertz, tìm nhị phân B để khớp tuổi thọ | `G.lifeTable`: theo chủng tộc × giới × độ giàu vùng, tính theo **lượt** (`ypt` năm/lượt: Tiên Tộc 5, Người Lùn 3…) để đời nào cũng 50–60 lượt |
| Thu nhập = phân vị `pct`, log-normal, σ từ Gini | `G.incomeAt(vùng, pct)`; đổi vùng thì cùng `pct` ra số bạc khác |
| `odds()` chỉnh xác suất không vượt 0..1 | `G.odds` |
| `1 − (1−q)^m`, `m` kẹp 0,25–9, giảm khác biệt khi già | `deathProb()` |
| Nguyên nhân chết: bảng nền × hệ số vùng × cá nhân | `G.CAUSES` + `pickCause()` (dịch, rét, nóng, đầm lầy, chiến tranh, thú triều, nghề nguy hiểm…) |
| Focus tính theo thời gian thực trong năm | `G.FOCUS`; đổi focus giữa năm có tác dụng ngay với các nhịp săn |
| Chỉ số trôi về mục tiêu 25%/năm | `G.driftStats` |
| Sự kiện = dữ liệu + điều kiện + trọng số + `run`; chống lặp | `G.EVENTS` (67 sự kiện) |
| Quyết định = `build` + `apply`, sinh từ trạng thái | `G.DECISIONS` (15 quyết định) |
| Dòng "dữ kiện thật" kèm sự kiện | Dòng **Sổ tay lữ khách**: luật họ quái lấy thẳng từ `library/bestiary/rules.js` |
| 4 đứa trẻ sinh cùng giây chạy headless | 4 **đồng niên**; báo khi họ mất (và nếu họ trỗi dậy) |
| RNG có seed, mọi chỗ gọi qua một hàm | Mỗi `Sim` một RNG riêng; trạng thái RNG lưu cùng save |
| Hook tách giao diện | `hook.log / decision / year / death / hunt` |
| Quét NaN cuối năm | có trong `endYear` |

Thứ **không** bắt chước: ~50 hàm `xxxYear()` gọi cứng. Ở đây mỗi hệ con khai báo trong `G.SYSTEMS` với thứ tự và điều kiện của mình (`world → family → health → undead → career → place → peers`).

## 4. Phát triển nhân vật

- **Cấp và Tier sức mạnh.** XP từ săn, luyện tập, làm việc. Tier = cấp / 10 (tối đa T5, cấp 60).
- **Nghề chiến đấu** lấy từ thư viện: `JobLibrary.compose()` với cả 10 chủng tộc và 6 giáo phái (183 nghề). Bắt đầu ở nghề gốc của chủng tộc (Nông Dân, Kẻ Lang Thang…), chuyển nghề khi đủ mastery `req` (+15 nếu trường phái ngoại lai), đủ cấp (T1:3, T2:12, T3:24, T4:36, T5:48) và Devotion nếu là ngọn tín ngưỡng. Thử thách có thể trượt.
- **Mastery** (26 cái, theo 8 trường phái): bản địa học nhanh ×1,15, ngoại lai ×0,8, bị cấm không học được.
- **Sinh kế** (nông dân, thợ mỏ, mạo hiểm giả…) quyết định thu nhập và rủi ro; tách khỏi nghề chiến đấu.
- **Sức mạnh** quy đổi ra Tier: `0,35 + cấp/10 + Tier nghề × 0,12 + mastery tốt nhất/220 + trang bị × 0,05 − hao máu`, trừ khi già. Thắng thua mỗi trận theo logistic của chênh lệch với đe dọa (Tier loài + tinh anh/thủ lĩnh + cỡ + bầy + biến tố).

## 5. Bộ Xương

- Kết quả trỗi dậy được tung ngay lúc chết bằng RNG của đời đó (cùng seed thì cùng kết quả); màn chết hiển thị d100 khớp kết quả.
- Kiếp Bộ Xương: chủng tộc `skeleton` của thư viện (quyền trường phái, ngọn riêng Kỵ Sĩ Kinh Hoàng…), sinh ở khu ven của vùng vừa chết, cấp 1, không gia đình, không tầng lớp. Kỹ năng chủ đạo giữ nguyên giá trị, vẫn luyện được dù trường phái đó bị chủng tộc cấm, và hướng đi đầu tiên theo trường phái của kỹ năng đó.
- Sự kiện riêng: dân bỏ chạy, Thánh Kỵ Sĩ truy lùng, tiếng gọi dưới mộ, mảnh ký ức kiếp trước, tìm thấy bia mộ của chính mình, Hắc Giáo mời vào đạo. Chết vì hồn phai, bị thanh tẩy, hoặc trong trận.
- Số liệu 1000 đời (seed `can-bang`): 20,7% trỗi dậy; Bộ Xương sống trung bình ~24 lượt (~47 năm) sau khi dậy.

## 6. Cấu trúc

```
LifeSim_RPG/
  index.html, style.css     giao diện
  sim.html                  cân bằng headless
  data/ecology.js           10 kiểu địa hình + 36 loài quái mới (cùng lược đồ bestiary, qua bộ kiểm tra của thư viện)
  data/world.js             chủng tộc (tuổi thọ, ypt), tầng lớp, sinh kế, 16 vùng × 4 khu (tầng), địa hình và độ hoang theo biome, đặc trưng ô, quái theo địa hình, nguyên nhân chết, validateWorld
  data/nations.js           50 mẫu quốc gia, chính thể, luật, đặc trưng riêng, phong cách khu dân cư theo chủng tộc, công trình
  data/names.js             kho tên riêng (người, nước, khu dân cư, địa danh, hang ổ, di tích…)
  js/core.js                RNG có seed, odds, Φ/Φ⁻¹, noise
  js/map.js                 dựng và vẽ bản đồ raster: vùng, khu, độ cao, độ ẩm, nhiệt, sông, hồ, đặc trưng, khu dân cư; bốn chế độ xem
  js/realm.js               tạo thế giới: quốc gia, lãnh thổ, mạng khu dân cư, tỉnh, dân, tên, độ hoang và tầng nguy hiểm từng ô
  js/life.js                Sim: newLife, rise, planYear, tick, endYear, chết, săn quái có phân cấp
  js/systems.js             hệ con cuối năm, autoFocus, rương báu
  js/events.js              sự kiện + quyết định
  js/ui.js                  giao diện (chỉ nghe hook)
  tools/serve.ps1           server tĩnh PowerShell
```

Không sửa file nào trong `library/`. Loài thư viện được thả vào vùng mới chỉ được gắn thêm habitat trong bộ nhớ lúc chạy (`G.init`).

## 7. Mở rộng

- **Thêm vùng:** một dòng trong `G.REGIONS` (tâm, bán kính, điểm neo, chỉ số, 4 khu) và một dòng trong `G.TERRAIN`. Mở `sim.html` tới khi mục Kiểm tra dữ liệu không còn lỗi.
- **Thêm mẫu quốc gia:** một dòng `T(...)` trong `G.NATION_TEMPLATES` (`data/nations.js`); thêm tên vào `data/names.js`. Bấm **Thử nhiều thế giới** để xem mẫu có ra không và có lỗi không.
- **Thêm loài:** `data/ecology.js` (hoặc `library/bestiary/species.js` nếu muốn dùng chung), rồi đưa vào `spawns` của một khu có dải Tier chứa nó.
- **Thêm sự kiện:** một object trong `G.EVENTS`; không phải sửa vòng lặp. `undead: true` cho sự kiện chỉ Bộ Xương gặp, `'any'` cho cả hai.
- **Thêm quyết định:** một mục trong `G.DECISIONS` với `when` (đọc trạng thái hoặc cờ hàng đợi do sự kiện bật), `build`, `apply`, `auto`.
- **Đổi tỉ lệ trỗi dậy:** `G.REINCARNATE_P` trong `js/life.js`.

## 8. Còn thiếu

- Chưa có bản dịch; mọi văn bản viết thẳng tiếng Việt.
- Con cái chỉ là danh sách tên/tuổi; chưa chơi tiếp đời con.
- Nghề ẩn (`hidden`) của thư viện chưa mở được trong game.
- Gate skill (2 skill R5) của thư viện chưa dùng; chuyển nghề chỉ xét mastery, cấp, Devotion.

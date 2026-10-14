# Vạn Kiếp — mô phỏng một đời ở đại lục Varen

**Ngày:** 14/10/2026 · **Trạng thái:** bản chơi được đầu tiên. · **Nguồn ý tưởng:** `research/01_Life_Sim_1in8b.md`.

Người chơi bấm một nút và được sinh ra ở đâu đó trên đại lục Varen: vùng, khu dân cư, chủng tộc, giới, tầng lớp, giáo phái đều bốc theo trọng số của vùng. Đời chạy theo thời gian thực, mỗi năm vài giây, xen sự kiện, quyết định và các lượt săn quái, cho tới khi nhân vật chết. Lúc chết tung d100: **từ 20 trở xuống (20%) thì trỗi dậy thành Bộ Xương**, mang theo **kỹ năng chủ đạo** (mastery cao nhất) của kiếp đó; mọi thứ khác về số 0. Bộ Xương chết lại cũng tung 20% như vậy, nên có thể nối nhiều kiếp.

## 1. Chạy

Trang nạp `../library/*.js` nên cần một server tĩnh (mở file trực tiếp thì trình duyệt chặn script).

```bash
powershell -ExecutionPolicy Bypass -File LifeSim_RPG/tools/serve.ps1
```

Rồi mở `http://localhost:8765/LifeSim_RPG/`. Trong Claude desktop: cấu hình `vankiep` trong `.claude/launch.json`.

- `index.html` — game. `?seed=abc` để chơi lại đúng một đời.
- `sim.html` — chạy N đời headless (mặc định 1000) và in phân phối: chênh Tier khi gặp quái, tỉ lệ trỗi dậy, nguyên nhân chết, tuổi thọ theo chủng tộc/sinh kế, Tier cuối đời. Dùng trước khi chỉnh số.

Điều khiển: tạm dừng (Space), tốc độ ½×–8×, **Tự sống** (nhân vật tự chọn focus và tự quyết theo tính cách), **Kiếp mới**. Bấm một vùng trên bản đồ để xem khu, loài quái, tình trạng (dịch, chiến tranh, thú triều) và lên đường nếu vùng đó giáp chỗ đang ở. Tiến trình tự lưu vào bộ nhớ trình duyệt; mộ các kiếp trước hiện trên bản đồ.

## 2. Bản đồ: đại lục, vùng, khu

Không dùng bản đồ thế giới thật. Đại lục Varen có **16 vùng**, mỗi vùng là một kiểu địa hình (6 vùng săn của thư viện + 10 kiểu mới trong `data/ecology.js`). Bản đồ là raster 250 × 175 ô dựng từ tâm và bán kính vùng (Voronoi có trọng số, bẻ cong bằng noise), suy hoàn toàn từ dữ liệu nên không cần lưu.

Mỗi vùng chia **3 khu**: ven → sâu → lõi. Khu ven ôm khu dân cư và phía lòng đại lục; khu lõi nằm ở rìa ngoài, xa văn minh. Mỗi khu có dải Tier và bảng loài riêng (`data/world.js`). Vùng trung tâm (Đồng Kim Hà, T0–2) an toàn; càng ra rìa càng nguy hiểm (Đỉnh Lôi Vân T2–5, Vực Hắc Uyên T3–5).

### Luật phân cấp (tránh cấp thấp gặp cấp cao)

| Luật | Ở đâu |
|---|---|
| Mọi loài trong khu có Tier nằm trong dải `[lo, hi]` của khu; `hi − lo ≤ 2`; khu sâu không thấp hơn khu ngoài | `validateWorld` (lỗi khi nạp) |
| Nhân vật Tier `t` (= cấp / 10) chỉ gặp loài Tier ≤ `t + 1` | `encounterTable` — mọi trận đều qua đây |
| Khu có `lo > t + 1` bị khóa | `zonesFor` |
| **Liều mạng** (tick tay): mở thêm một bậc, gặp tới `t + 2` | công tắc trên giao diện |
| Khu gợi ý = khu sâu nhất mà đe dọa trung bình thấp hơn sức mình ~0,3 Tier | `recommendedZone` |
| Đi đường sang vùng mới: gặp quái ở khu ven của vùng đó, vẫn qua luật trên | `G.moveTo` |

Kết quả 1000 đời headless (seed `can-bang`): khoảng 50.000 trận, chênh Tier từ −5 tới +1, **không trận nào vượt +1**.

### Quái hoạt động theo khu

Mỗi khu có **mật độ** (`world.zonePop`, 0,3–2,2), cập nhật mỗi năm trong hệ con `world`:
sinh sôi kiểu logistic (vùng nguy hiểm sinh nhanh hơn) → bị thợ săn NPC tỉa (vùng giàu tỉa nhiều hơn) → mùa sinh sản ngẫu nhiên → khu lõi quá đông thì đẩy mật độ ra khu sâu, khu sâu đẩy ra khu ven (chỉ đẩy mật độ, **không đẩy loài**, nên dải Tier vẫn giữ) → khu ven vượt 1,25 thì thành **thú triều** (`raid`), tăng nguy cơ chết của dân trong vùng và bắn sự kiện quái tràn vào làng. Người chơi hạ quái thì mật độ khu đó giảm. Ba vùng có **chúa vùng** (Leviathan, Cổ Long, Chúa Quỷ Hắc Uyên) chỉ xuất hiện qua sự kiện khi nhân vật từ cấp 40.

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
  data/world.js             chủng tộc (tuổi thọ, ypt, tên), tầng lớp, sinh kế, 16 vùng × 3 khu, nguyên nhân chết, validateWorld
  js/core.js                RNG có seed, odds, Φ/Φ⁻¹, noise
  js/map.js                 dựng và vẽ bản đồ raster
  js/life.js                Sim: newLife, rise, planYear, tick, endYear, chết, săn quái có phân cấp
  js/systems.js             hệ con cuối năm, autoFocus, rương báu
  js/events.js              sự kiện + quyết định
  js/ui.js                  giao diện (chỉ nghe hook)
  tools/serve.ps1           server tĩnh PowerShell
```

Không sửa file nào trong `library/`. Loài thư viện được thả vào vùng mới chỉ được gắn thêm habitat trong bộ nhớ lúc chạy (`G.init`).

## 7. Mở rộng

- **Thêm vùng:** một dòng trong `G.REGIONS` (tâm, bán kính, chỉ số, khu dân cư, 3 khu). Mở `sim.html` tới khi mục Kiểm tra dữ liệu không còn lỗi (khu dân cư phải nằm trong đất của vùng).
- **Thêm loài:** `data/ecology.js` (hoặc `library/bestiary/species.js` nếu muốn dùng chung), rồi đưa vào `spawns` của một khu có dải Tier chứa nó.
- **Thêm sự kiện:** một object trong `G.EVENTS`; không phải sửa vòng lặp. `undead: true` cho sự kiện chỉ Bộ Xương gặp, `'any'` cho cả hai.
- **Thêm quyết định:** một mục trong `G.DECISIONS` với `when` (đọc trạng thái hoặc cờ hàng đợi do sự kiện bật), `build`, `apply`, `auto`.
- **Đổi tỉ lệ trỗi dậy:** `G.REINCARNATE_P` trong `js/life.js`.

## 8. Còn thiếu

- Chưa có bản dịch; mọi văn bản viết thẳng tiếng Việt.
- Con cái chỉ là danh sách tên/tuổi; chưa chơi tiếp đời con.
- Nghề ẩn (`hidden`) của thư viện chưa mở được trong game.
- Gate skill (2 skill R5) của thư viện chưa dùng; chuyển nghề chỉ xét mastery, cấp, Devotion.

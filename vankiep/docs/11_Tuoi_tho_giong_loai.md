# Vạn Kiếp: tuổi thọ giống loài, tập tục, nhận thức

Người dùng yêu cầu ngày 16/10/2026: chuẩn hóa tuổi thọ theo các dòng truyện, game RPG; giống loài trường thọ phải có cơ chế nerf (duy trì một hoạt động theo thói quen của giống loài, làm giảm thời gian tu luyện); hiệu suất tu luyện theo nhận thức, trẻ con tu luyện chậm, mà "trẻ con" tính theo giống loài (ấu niên của loài trường thọ dài hơn). Mã: `data/world.js` (`G.RACES`), `js/race.js`. Tab "Giống loài: tuổi thọ, tập tục" trên trang Duyệt Nội Dung.

## 1. Tra cứu

| Giống loài | Nguồn | Trưởng thành | Thọ |
|---|---|---|---|
| Người | D&D 5e, Pathfinder | 15–18 | dưới 100 |
| Tiên (elf) | D&D 5e (sách luật 2014) | ~100 | ~750 |
| | Pathfinder | 110 | 350 + 4d% (tới 750) |
| | Frieren | | hơn 1000 (Frieren đã sống hơn nghìn năm) |
| Người Lùn | D&D 5e (sách luật 2014) | ~50 | ~350 |
| | Pathfinder | 40 | 250 + 2d% (tới 450) |
| | Frieren | | dài hơn người nhiều, ngắn hơn tiên |
| Bán Orc, Orc | D&D 5e | ~14 | hiếm khi quá 75 |
| | Pathfinder | 14 | 60 + 2d10 |
| Long Nhân (dragonborn) | D&D 5e | 15 | ~80 |
| Người cá | Andersen, *Nàng tiên cá* | | ~300 năm rồi tan thành bọt biển |
| | Triton, D&D 5e | 15 | tới 200 |
| Cơ Nhân (warforged) | D&D 5e Eberron | đúc ra đã lớn | chưa rõ, không thấy hao mòn theo tuổi |
| Yêu Tinh (fae) | văn hóa dân gian châu Âu | | sống rất lâu hoặc bất tử; 5e không có số chắc |
| Người Thú | light novel (Mushoku Tensei, Tensura) | | gần như người |

Số D&D 5e cho Tiên, Người Lùn nhớ từ sách luật 2014 (lần tra này không mở được bản SRD); số Pathfinder, Long Nhân, Bán Orc, Triton, Andersen có nguồn ở cuối.

Rút ra: các dòng RPG chia ba nhóm. **Sống ngắn** (Orc, Người Thú, Người: 50–100 năm, trưởng thành 14–16); **sống dài** (Người Lùn, Hải Tộc: 200–450, trưởng thành 20–50); **rất dài** (Tiên: 750 trở lên, trưởng thành ~100). Long Nhân trong D&D sống ngắn, nhưng Long Nhân ở Varen mang máu rồng kiểu truyện châu Á nên xếp vào nhóm dài. Yêu Tinh, Cơ Nhân không có chuẩn chung; chọn số giữa.

## 2. Số chốt (`G.RACES`)

`le` là tuổi thọ kỳ vọng lúc sinh (đã tính chết yểu, bệnh, tai nạn), thấp hơn tuổi thọ tối đa trong bảng tra cứu, như người 62 so với "dưới 100". `ypt` (năm mỗi lượt) chỉnh để mỗi đời vẫn chừng 45–67 lượt.

| Giống loài | Trưởng thành (cũ → mới) | `le` (cũ → mới) | `ypt` (cũ → mới) |
|---|---|---|---|
| Người | 16 | 62 | 1 |
| Orc | 13 → 14 | 48 → 45 | 1 |
| Người Thú | 14 | 55 | 1 |
| Hải Tộc | 20 | 110 → 200 | 2 → 3 |
| Yêu Tinh | 24 → 30 | 160 → 250 | 3 → 4 |
| Người Lùn | 30 → 45 | 180 → 240 | 3 → 4 |
| Long Nhân | 40 → 50 | 240 → 300 | 4 → 5 |
| Tiên Tộc | 60 → 100 | 300 → 480 | 5 → 8 |
| Cơ Nhân | 4 | 120 | 2 |
| Bộ Xương | | 80 (từ khi trỗi dậy) | 2 |

Tuổi thọ theo Tier giữ như docs/09 (× 1 / 1,12 / 1,24 / 1,36 / 2 / 3).

## 3. Rèn theo năm, tập tục

**Chỗ lệch cũ.** Điểm rèn tính theo lượt. Một lượt của Tiên Tộc là 5 năm, nên mỗi năm Tiên Tộc rèn bằng 1/5 người, cả đời ngang người (level trung bình theo giống loài gần bằng nhau). Không có lý do trong truyện cho việc đó.

**Mới.** Điểm rèn tính theo năm: mỗi lượt nhân `ypt`. Nếu chỉ vậy, Tiên Tộc rèn gấp 8 lần người mỗi lượt. Nerf bằng hai thứ:

- **Tập tục** (`G.CUSTOMS`): giống loài trường thọ phải dành phần lớn thời gian cho một tập tục, và chính tập tục nuôi tuổi thọ của tộc.
- **Nhịp sống** (`pace`): loài sống lâu sống chậm, một năm rèn được ít hơn một năm của người.

Điểm rèn mỗi lượt so với người = `ypt × pace × (1 − phần thời gian cho tập tục)`.

| Giống loài | Tập tục | Phần thời gian | Nhịp | Giữ: rèn × | Bỏ: còn | Bỏ: rèn × | Bỏ: tuổi thọ × |
|---|---|---|---|---|---|---|---|
| Tiên Tộc | Mộng Rừng: thiền dưới cây mẹ, chung giấc mơ với tộc | 60% | 0,38 | 1,22 | 15% | 2,58 | 0,6 |
| Người Lùn | Phục dịch thị tộc: giữ lò, đứng cổng, khắc sử | 40% | 0,5 | 1,2 | 10% | 1,8 | 0,75 |
| Long Nhân | Ngủ đông | 50% | 0,48 | 1,2 | 12% | 2,11 | 0,65 |
| Yêu Tinh | Hội đình theo mùa, giữ giao kèo với đất | 50% | 0,6 | 1,2 | 12% | 2,11 | 0,65 |
| Hải Tộc | Hát triều, theo đàn di cư | 35% | 0,57 | 1,11 | 10% | 1,54 | 0,8 |
| Cơ Nhân | Bảo dưỡng lõi | 20% | 0,7 | 1,12 | 5% | 1,33 | 0,8 |
| Người, Orc, Người Thú, Bộ Xương | không | | | 1 | | | |

Giữ tập tục: cả đời rèn chừng 1,1–1,2 lần người, đúng hình ảnh "tiên, lùn, rồng là cao thủ lâu năm" mà không lấn át. Bỏ tập tục (quyết định `cv_custom`): mỗi lượt rèn nhanh hơn chừng gấp đôi, nhưng tuổi thọ × 0,6–0,8, mỗi lượt Tâm trạng −2, Quan hệ −2, mỗi lượt 8% bị tộc ruồng bỏ (Quan hệ −10). Tính cả đời, bỏ tập tục chỉ hơn giữ chừng 1,1–1,3 lần mà mất nhiều thứ. Quyết định hỏi lúc vừa trưởng thành, sau đó cách 10 lượt nếu đã bỏ, theo chí hướng Sức mạnh, hoặc đứng ở max level lâu. Chế độ tự động bỏ khi chí hướng Sức mạnh mà gan, ít sùng đạo, hoặc rất cô độc mà rất gan.

## 4. Nhận thức

Hiệu suất rèn nhân `G.mindF`: độ chín = (tuổi / tuổi trưởng thành − 0,25) / 0,75, thấp nhất 0,05, cao nhất 1; nhân thêm 0,85 + 0,3 × Hiểu biết / 100. Tuổi trưởng thành theo giống loài, nên ấu niên dài thì rèn chậm lâu hơn: người 7 tuổi 0,23, 10 tuổi 0,48, 13 tuổi 0,73; Tiên Tộc 32 tuổi 0,09, 56 tuổi 0,41, 88 tuổi 0,85; Người Lùn 28 tuổi 0,5. Bộ Xương mang trí nhớ kiếp trước nên chỉ xét Hiểu biết.

## 5. Kết quả đo (16/10/2026)

1000 đời, hai seed (`can-bang`, `kiem-tra`):

| Đo | Trước (bước F) | Sau | Mục tiêu |
|---|---|---|---|
| Tháp Tier 0–5 | 60,9 / 26,0 / 9,2 / 3,2 / 0,5 / 0,2; 57,6 / 29,4 / 10,4 / 2,6 / 0 / 0 | 59,7 / 25,9 / 10,1 / 3,5 / 0,7 / 0,1; 57,5 / 28,3 / 10,3 / 3,0 / 0,8 / 0,1 | 60 / 27 / 10 / 2,5 / 0,5 / 0,05 |
| Trận vượt Tier + 1 | 0 | 0 | 0 |
| Trỗi dậy | 21,1% / 19,8% | 21,0% / 18,8% | ~20% |
| Chết vì quái | 10,7% / 11,9% | 11,2% / 11,0% | ~10% |
| 1000 đời chạy | 76–78 giây | 87–93 giây | |

Theo giống loài (đời trưởng thành, Tier ≥ 2): người 15%, Người Thú 15%, Orc 6–13%, Người Lùn 16–27%, Tiên Tộc 15–19%, Long Nhân 17–24%, Yêu Tinh 0–19% (36–59 đời), Hải Tộc, Cơ Nhân ít đời nên dao động mạnh. Bỏ tập tục 5–15% đời của giống loài trường thọ, phần lớn trong số đó bị tộc ruồng bỏ. Tuổi chết trung bình: Tiên Tộc 295–405, Người Lùn 215–234, Long Nhân 205–292.

Chạy chậm hơn chừng 12%: Tiên Tộc một lượt 8 năm nên thế giới chạy 8 năm mỗi lượt.

Để lại:

- Chết vì quái còn trên mục tiêu một chút (11%).
- Mấy giống loài ít dân (Hải Tộc, Cơ Nhân, Long Nhân) mỗi seed chỉ 7–27 đời: chưa nói được gì chắc về cân bằng riêng của họ.
- Tập tục mới chỉ đổi điểm rèn, tuổi thọ, Tâm trạng, Quan hệ; chưa có sự kiện riêng của từng tập tục (giấc mơ chung của Tiên Tộc, hội đình của Yêu Tinh…).
- NPC (vua, bạn đời) dùng `le` mới khi bốc tuổi; bản lưu cũ của nhân vật Tiên Tộc, Người Lùn… đổi `ypt` giữa đời nên tuổi nhảy (S.age là số lượt).

## Nguồn

- Pathfinder, bảng tuổi: https://legacy.aonprd.com/advancedRaceGuide/ageHeightWeight.html, https://roll20.net/compendium/pathfinder/Rules:Vital%20Statistics
- D&D, tuổi bắt đầu phiêu lưu theo giống loài: https://www.enworld.org/threads/d-d-races-starting-adventuring-age.656041/
- Frieren, Người Lùn: https://frieren.fandom.com/wiki/Eisen; tuổi thọ tiên: https://www.siliconera.com/the-frieren-manga-helps-us-understand-an-elfs-lifespan/
- Andersen, *Nàng tiên cá*: https://en.wikipedia.org/wiki/The_Little_Mermaid
- Triton 5e (15 / 200): https://www.worldanvil.com/block/1397288
- Warforged: https://blog.dealerrater.com/art/dd-5e-warforged.html

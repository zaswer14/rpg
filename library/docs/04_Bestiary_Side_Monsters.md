# Bestiary — Hệ thống quái phụ trên map

**Ngày:** 14/10/2026 · **Dữ liệu:** `../bestiary/` (rules.js, species.js, biomes.js, bestiary.js) · **Runtime:** `Skeleton_Codex_V12_Balance/game-v10.js` mục "V13 QUÁI PHỤ" · **Trang xem:** `index.html` mục 15 · Sổ tay quái phụ.

Quái phụ là quái sống trên map, khác với đối thủ chính của màn (grunt/scout/caster/brute/boss). Chúng không chặn cổng cuối màn: người chơi có thể né. Nhưng chúng đứng chắn đường, gây trạng thái, rơi hồi máu/mana, và mỗi con hạ được cộng Chiến tích khi thắng màn.

## 1. Tra cứu: các game khác chia quái thế nào

| Nguồn | Cách chia | Lấy gì cho dự án |
|---|---|---|
| Monster Hunter | Theo "họ" giả sinh học: Fanged Beast (thú bốn chân nhảy vồ), Fanged Wyvern (dáng chó, không bay, nhanh), Brute Wyvern (hai chân, chậm), Bird Wyvern (theo bầy hoặc biết bay), Elder Dragon (cổ long, đứng ngoài hệ sinh thái, hiếm). | Họ quái quyết định dáng và bộ đòn. Cổ Long không vào bảng sinh ngẫu nhiên mà là chúa vùng. Rồng tách thành tích long (drake, không cánh), phi long (wyvern, cánh là tay) và rồng thật. |
| Ragnarok Online | Mỗi quái có 3 thuộc tính độc lập: chủng (Brute, Dragon, Insect, Plant, Undead, Demon, Formless…), cỡ (Small/Medium/Large) và nguyên tố. Vũ khí chịu phạt theo cỡ. | Tách **họ**, **cỡ**, **khí chất** thành ba trường độc lập. Cỡ quyết định chỉ số nền và độ bị đẩy lùi. |
| Dragon Quest | Họ quái: Slime, Beast, Dragon, Plant/Nature, Material (gồm Elemental và Machine), Undead, Demon. Họ Dragon gồm cả rắn, khủng long, rùa. | Có họ Nhầy (slime) riêng; Nguyên Tố Linh và Cơ Giới là hai họ. |
| D&D 5e | Creature type: Beast là động vật thật; Monstrosity là chỗ chứa mọi quái lai, quái do phép tạo ra (owlbear, manticore, chimera); thêm Dragon, Ooze, Plant, Undead, Fiend, Construct, Elemental. | Ranh giới **Quái Thú** (thú thật) và **Ma Thú** (thú mang phép). Manticore, basilisk thuộc Ma Thú. |
| Truyện huyền huyễn/tu tiên | Yêu thú chia bậc (hạ/trung/cao, hoặc đánh số cấp), bậc tương ứng cảnh giới người tu luyện; yêu thú có nội đan/ma hạch là vật phẩm quý. | Tier quái dùng **chung thang 0–5 với Tier nghề**. Ma Thú có **ma hạch**: luật riêng khi sắp chết và rơi hạch hồi mana. |
| Dead Cells | Mỗi biome có bể quái riêng, quái thường scale theo cấp biome. Tinh anh to hơn, có thẻ tên và hào quang, máu/công/tốc cao hơn, kháng khống chế; quái và bẫy có thể mang biến tố (affix). | Bảng sinh quái theo **vùng**; cấp **Tinh anh/Thủ lĩnh** có hào quang, thẻ tên và **biến tố**. |
| Hollow Knight · mẫu kẻ địch platformer kinh điển | Quái mới chỉ khác quái cũ một điều nhỏ; biến thể có loại chỉ khác số, có loại thêm một hành vi. Ngoại hình báo trước kiểu và hướng đòn. Mẫu di chuyển cổ điển: pacer (đi qua lại, quay đầu ở mép), follower (đuổi), floater (bay sóng), roamer (đổi hướng ngẫu nhiên). | Tám **kiểu di chuyển**, mỗi kiểu một telegraph đọc được. Mỗi họ thêm đúng **một luật**. Mỗi loài có **marker** nhận diện. |

Nguồn đã đọc (tóm tắt qua tìm kiếm, ngày 14/10/2026): [Monster Hunter Wiki · Fanged Wyvern](https://monsterhunterwiki.org/wiki/Fanged_Wyvern), [Brute Wyvern](https://monsterhunterwiki.org/wiki/Brute_Wyvern), [Monsters by Classification](https://monsterhunterwiki.org/wiki/Category:Monsters_by_Classification), [Gamer Guides · MH Generations bestiary classes](https://www.gamerguides.com/monster-hunter-generations/the-bestiary/overview/bestiary-classes); [iRO Wiki · Race](https://irowiki.org/wiki/Race), [Element](https://irowiki.org/wiki/Element), [Size](https://irowiki.org/classic/Size); [Dragon Quest Wiki · Dragon family](https://dragon-quest.org/wiki/Dragon_family), [Pro Game Guides · DQM The Dark Prince families](https://progameguides.com/dragon-quest-monsters/all-monster-families-in-dragon-quest-monsters-the-dark-prince/); [Roll20 · Monsters by Creature Type](https://roll20.net/compendium/dnd5e/Rules:Monsters%20by%20Creature%20Type), [Black Citadel · Monstrosities 5e](https://blackcitadelrpg.com/monstrosities-5e/); [Wuxiaworld · The Great Ruler ch. 25](https://www.wuxiaworld.com/novel/the-great-ruler/tgr-chapter-25); [Dead Cells Wiki · Elite](https://deadcells.wiki.gg/wiki/Elite), [Enemies](https://deadcells.wiki.gg/wiki/Enemies), [My Nintendo News · bestiary update 2020](https://mynintendonews.com/2020/05/27/huge-bestiary-update-for-dead-cells-goes-live-today/); [Game Developer · Build a Bad Guy Workshop](https://www.gamedeveloper.com/design/build-a-bad-guy-workshop-designing-enemies-for-retro-games), [Thread phân tích kẻ địch Hollow Knight](https://threadreaderapp.com/thread/1368351708678516745.html), [GameDev.net · Basic enemy design](https://gamedev.net/forums/topic/667381-basic-enemy-design).

## 2. Mô hình

```
loài (species) = họ (family) + kiểu (behavior) + cỡ (size) + khí chất (aspect, dùng chung aspects.js) + Tier 0–5
khi sinh ra    = loài + cấp (normal / elite / alpha) + 0–2 biến tố (affix) + số con trong ổ (group)
```

- **Họ** mang một luật gameplay mà mọi loài trong họ đều có. Runtime đọc `family`, không đọc tên loài, nên thêm loài mới không cần viết code.
- **Kiểu** quyết định AI di chuyển và đòn đánh. Mỗi kiểu có một telegraph riêng.
- **Cỡ** quyết định chỉ số nền, hitbox và độ bị đẩy. Rồng và thảo yêu không bị đẩy ở mọi cỡ.
- **Khí chất** lấy từ `aspects.js` (chung với khuôn nghề) và quyết định trạng thái đòn gây ra: Hỏa → Đốt, Độc → Độc, Huyết/Hoang Dã → Chảy máu, Băng/Thủy Triều → Lạnh, Lôi → Giật, Hắc Ám/Tử Linh/Hồn Hỏa/Vực Sâu → Nguyền, Tự Nhiên → Trói.
- **Tier** dùng chung thang với nghề. Vùng chỉ sinh loài Tier ≤ Tier nhân vật + 1; loài cao hơn Tier nhân vật hiếm hơn (trọng số ×0,4). Loài thấp hơn vẫn xuất hiện nhưng được nâng lên Tier nhân vật − 1 về chỉ số, nên không thành bao cát.

## 3. Mười hai họ

| Họ | Luật | Vì sao |
|---|---|---|
| Quái Thú | **Bầy đàn**: còn đồng loại trong 220px thì +25% tốc và sát thương | Thú thật không có phép; sức mạnh nằm ở bầy. Dạy người chơi tách bầy. |
| Ma Thú | **Ma hạch**: dưới 40% máu, hạch bùng một lần (đạn hai phía + tăng tốc); chết rơi ma hạch hồi 18 mana | Ranh giới với Quái Thú: thú mang phép. Đòn cuối luôn có pha nguy hiểm. |
| Long Tộc | **Vảy rồng**: giáp +2, không bị đẩy/hất; đánh sau lưng hoặc lúc đang hít hơi ×1,35; xen kẽ đòn phun báo trước 0,7s | Thưởng cho vòng ra sau và cho việc đọc đòn phun. |
| Trùng Tộc | **Đàn đông**: sinh theo nhóm; con không có khí chất vẫn có 25% gây Độc | Áp lực số lượng, mỗi con yếu. |
| Nhầy | **Phân tách**: cỡ M trở lên chết thì tách 2 con nhỏ hơn; vật lý ×0,7, phép ×1,3 | Slime là họ dạy người chơi đổi cách đánh. |
| Thảo Yêu | **Bám rễ**: không đi, không bị đẩy; 3s không trúng thì hồi 3%/s; Đốt ×2 | Bẫy địa hình sống; buộc dồn sát thương hoặc dùng lửa. |
| Bất Tử | **Gượng dậy**: lần chết đầu sống lại 40% máu sau 1,5s, trừ khi đòn kết liễu là phép hoặc gây Đốt | Nhân vật là skeleton nhưng hoang hồn không nhận đồng loại. Phép/lửa có giá trị. |
| Nguyên Tố Linh | **Thân nguyên tố**: miễn trạng thái cùng khí chất, vật lý ×0,75, chạm thân dính trạng thái | Không đứng trong thân nó được. |
| Cơ Giới | **Giáp khối**: giáp +3, không bị choáng cho tới khi bị Phá giáp; không đuổi quá 300px khỏi ổ | Kỹ năng Phá giáp có đất dụng võ. |
| Yêu Ma | **Khế ước máu**: đòn trúng gây Nguyền và hút 30% sát thương | Đánh lâu bất lợi; Nguyền giảm 50% hồi máu nhặt được. |
| U Linh | **Hư thể**: bay xuyên địa hình, vật lý chỉ 50% | Nghề phép và Ánh Sáng mạnh ở vùng nhiều hồn. |
| Phi Cầm | **Bổ nhào**: bay ngoài tầm cận chiến; trúng đòn lúc đang lao thì rơi choáng 0,8s | Cửa sổ phản đòn rõ ràng cho nghề cận chiến. |

## 4. Tám kiểu di chuyển

| Kiểu | Hành vi | Telegraph |
|---|---|---|
| Tuần tra (pacer) | Đi qua lại trong ổ ±80px, quay đầu ở mép bệ, chỉ rời ổ tối đa 170px | khựng 0,4s |
| Truy đuổi (chaser) | Thấy trong 360px thì đuổi, nhảy qua hố nhỏ; xa ổ quá 600px thì về | hạ thấp người |
| Húc lao (charger) | Cào chân 0,6s rồi lao thẳng 0,55s; tới mép bệ thì dừng và tự choáng 0,35s | cào chân, vệt cam dài trên sàn |
| Vồ (leaper) | Giữ cự ly 70–210px, thu mình 0,45s rồi nhảy vòng cung | thu mình |
| Bay lượn (flyer) | Bay sóng sin trên đầu, tới gần thì khựng 0,5s rồi bổ nhào chéo | khựng trên không |
| Phun xa (spitter) | Giữ 120–300px, phun đạn nhắm vào mục tiêu; bay được nếu là U Linh | phồng họng |
| Phục kích (ambusher) | Ẩn dưới sàn (chỉ lộ đôi mắt, không thể bị đánh) tới khi mục tiêu vào 110px, trồi lên đánh, sau đó thành truy đuổi | đôi mắt trên sàn |
| Bám chỗ (rooted) | Không đi; đớp/quất trong 110px, hoặc bắn đạn cong nếu có khí chất | lá co lại |

## 5. Cấp quái và biến tố

| Cấp | Máu | Sát thương | Cỡ hình | Biến tố | Chiến tích nền |
|---|---|---|---|---|---|
| Thường | ×1 | ×1 | ×1 | 0 | 3 |
| Tinh anh | ×1,8 | ×1,2 | ×1,15 | 1 | 10 |
| Thủ lĩnh | ×2,6 | ×1,3 | ×1,3 | 2 | 18 |
| Chúa | ×6 | ×1,6 | ×1,6 | 2 | dành cho sự kiện/boss vùng, không sinh ngẫu nhiên |

Tỉ lệ tinh anh = `eliteChance` của vùng + 2% mỗi Tier nhân vật (+15% ở màn Tinh anh, +10% ở màn Boss). Tinh anh và thủ lĩnh đi một mình hoặc với nửa bầy: ổ không vừa đông vừa mạnh. Chiến tích nền nhân thêm 25% mỗi Tier loài.

Biến tố: Cuồng Nộ (dưới 50% máu nhanh ×1,4), Giáp Đá (+4 giáp tới khi bị Phá giáp), Hút Máu (hồi 40% sát thương gây ra), Nổ Xác (nổ 90px sau 0,8s khi chết), Hàn Khí (đòn gây Lạnh), Tái Sinh (2%/s khi 2s không trúng đòn), Gọi Bầy (dưới 60% máu gọi 2 con cùng loài cỡ nhỏ hơn), Hộ Phép (+6 kháng phép). Tinh anh hiện thẻ tên `★ Tên · Biến tố` và khung hào quang màu theo cấp.

## 6. Vùng săn

| Vùng | Tier gợi ý | Tính cách | Loài trọng số cao |
|---|---|---|---|
| Đồi Mộ | 0–5 | Map thử nghiệm hiện tại; hoang hồn và thú ăn xác | Chuột Mộ, Quạ Xác, Ngạ Quỷ Hoang; Cốt Long hiếm |
| Rừng Rêu | 0–3 | Học đọc telegraph cơ bản | Sói Xám, Slime Rêu, Heo Rừng Nanh Kiếm; Thụ Nhân Mục hiếm |
| Đầm Độc | 1–4 | Mọi thứ gây Độc; lửa và Ánh Sáng có lợi | Nấm Bào Tử, Dây Leo Bẫy; Xà Quái Hóa Đá hiếm |
| Hang Tinh Thể | 0–4 | Phục kích, tinh linh, cơ giới | Dơi Hang, Bọ Hung Xương, Thạch Tinh Linh |
| Núi Tro | 1–5 | Long tộc non, yêu ma, ma thú lửa | Hỏa Hồ, Tiểu Yêu, Hỏa Tích Long |
| Đỉnh Bão | 2–5 | Quái bay và sét; Cổ Long là chúa vùng | Phi Long, Lôi Dương, Sư Thứu Gió; Lôi Điểu hiếm |

Bảng sinh quái suy từ `species[].habitat`; vùng chỉ khai báo trọng số khác mặc định (10). Danh sách đầy đủ 43 loài xem trực tiếp trên trang codex mục 15 (lọc theo họ, vùng, Tier).

## 7. Runtime (Skeleton Codex)

- Chọn **Vùng săn** và bật/tắt **Quái phụ** ở thanh chọn màn. Mỗi màn rải 2–3 ổ (đơn đấu 2, nhóm/tinh anh 3, các màn khác 2) trên 5 vị trí cố định x = 430/1180/1640/2040/2390. Nền map đổi màu theo vùng.
- Quái phụ nằm chung `game.enemies` với cờ `side`, nên skill, đạn, bẫy và thuộc hạ đánh được chúng. Cổng cuối màn chỉ chờ đối thủ chính.
- Trạng thái mới trên người chơi: Đốt 3/s, Độc 2/s, Chảy máu 2/s (3/s khi đang chạy), Lạnh chậm 35%, Trói 1s không chạy/nhảy, Giật khựng 0,25s, Nguyền giảm 50% máu hồi từ vật phẩm. Ô màu trên đầu nhân vật và dòng chỉ số cho biết đang dính gì. Lưu ý: đạn của caster/boss cũ vốn gắn Nguyền chỉ để trang trí; nay Nguyền có tác dụng thật lên vật phẩm hồi máu.
- Rơi đồ: Ma Thú luôn rơi ma hạch (mana); tinh anh/thủ lĩnh luôn rơi máu 20; quái thường 25% rơi máu 10.
- Thưởng: mỗi con hạ ghi vào `game.hunt`; khi **thắng** màn, `onVictory` cộng tổng Chiến tích săn, mỗi con tối đa 40, tổng tối đa 50% thưởng gốc của màn. Thua hoặc thoát trận không nhận gì, đúng luật cũ "chỉ một giao dịch thưởng khi thắng thật". Save có thêm `progress.bestiary` (số đã hạ theo loài, tách tinh anh/thủ lĩnh); save cũ đọc bình thường.
- Công cụ QA trong console: `SkeletonGame.spawnMonster('dire_wolf','elite',600)`; `SkeletonGame.debug().side` liệt kê quái phụ còn sống và trạng thái AI.

## 8. Thêm loài mới

1. Thêm một dòng vào `bestiary/species.js`: chọn họ, kiểu, cỡ, khí chất, Tier, `habitat`. Hệ số `hp/dmg/speed` trong (0, 3].
2. Viết `attack` (một câu) và `marker` (chi tiết nhận diện cho art, không trùng loài khác).
3. Mở `tools/export.html` hoặc trang codex mục 15: phải không còn dòng `BESTIARY`/LỖI DỮ LIỆU.
4. Loài chỉ dành cho sự kiện: `spawn:false` và khai báo `lord` ở vùng.

Thêm **họ** hoặc **kiểu** mới thì phải viết luật runtime trong `game-v10.js` (`sideTakenMult`, `updateSide`, `sideChoose`, `sideIntent`). Đây là chỗ duy nhất cần code.

## 9. Chưa làm

- Art: quái đang vẽ bằng hình khối theo họ (thân, đầu, chân, cánh) và màu khí chất. Marker trong dữ liệu là brief cho art.
- Chúa vùng (Cổ Long) và cơ chế đổi thời tiết chưa có runtime; chỉ gọi được bằng `spawnMonster`.
- Vật phẩm rơi (da, nanh, vảy…) mới là dữ liệu thiết kế; runtime chỉ có hồi máu/mana và Chiến tích.
- Nhiều map: vùng săn hiện chỉ đổi bảng quái và màu nền trên cùng một bố cục map.
- Cân bằng: chỉ số là mẫu thử. Kiểm thử headless đã chạy cả 43 loài (sinh, AI, chết, phân tách, gượng dậy, trạng thái, thưởng) không lỗi, chưa có playtest tay về cảm giác.

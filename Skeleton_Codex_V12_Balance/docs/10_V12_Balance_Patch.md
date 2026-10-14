# Skeleton Codex V12 — Bản vá cân bằng

**Ngày:** 13/10/2026 · **Nền:** V11 Bilingual Progression · **Phạm vi:** dữ liệu skill, gate chuyển nghề, pool gacha, công thức scale, mastery, vũ khí. Không đổi ID nghề/skill cũ, không đổi key save (`skeleton-codex-skill-v10-playable`); rank và skill đã học giữ nguyên.

Mọi con số vẫn là điểm xuất phát để chạy thử, chưa phải cân bằng cuối.

## 1. Vì sao cần vá

Rà toàn bộ V11 bằng script (35 nghề, 36 cạnh, 104 skill, 13 tuyến tới terminal) cho ra các lỗi sau:

| Mã | Vấn đề ở V11 | Số liệu |
|---|---|---|
| A1 | Cạnh không có skill gate mới | Death Whisper, Bone Architect: 0 skill mới; 9 cạnh khác chỉ 1 |
| A2 | Gate T3–T4 dùng skill trắng T0 | bone_dash là gate của 3 nghề T3–T4 |
| A3 | Gacha quay ra skill không bao giờ dùng được | 35–51% pool ở T3–T5 là exclusive nhánh khác |
| A4 | Độ hiếm trùng Tier | T1 = 24/24 lục, T2 = 22/22 lam |
| B1 | T3–T5 gần như không có active mới | T3: 2, T4: 0, T5: 1 |
| C1 | Thưởng stat lệch | DEX 11, WIL 9 trên tổng 131; skill cung cho +STR |
| C2 | Farm trắng lợi gấp 3 lần đỏ | 0,125 so với 0,039 stat/điểm |
| D1 | Mọi skill damage scale theo INT | kể cả Cracked Slash, Dread Cleaver |
| D2 | Mastery suy từ regex tên skill | Soul tăng khi tên có `soul|wraith|shade` |
| D3 | Nghề nào cũng cầm mọi vũ khí | Necromancer vác rìu được |

## 2. Những gì V12 thay đổi

### 2.1. 43 skill mới (104 → 147)

30 skill đầu là Restricted theo domain (2–4 nghề dùng chung). Sau khi chốt thêm (V12.1): 6 exclusive cho các nghề còn thiếu và 3 signature Restricted T3 cho martial thuần.

| Tier | Skill | Domain | Vai trò |
|---|---|---|---|
| 1 | Snare Arrow · Tên Bẫy Dây | ranged | control |
| 1 | Cutpurse Toss · Ném Đồ Cướp | shadow | attack/utility |
| 1 | Spirit Ward · Kết Giới Linh | death | defense/support |
| 1 | Axe Hook · Móc Rìu | combat, shadow | control/attack |
| 2 | Steady Draw · Kéo Cung Vững (passive) | ranged | support |
| 2 | Corpse Lantern · Đèn Lồng Tử Thi | death | support/control |
| 2 | Soul Thread · Sợi Hồn | death | healing/support |
| 2 | Soul Tithe · Thuế Hồn | shadow | attack/support (hybrid) |
| 2 | Veil Sense · Giác Quan Màn Che (passive) | shadow | support |
| 3 | Phalanx Thrust · Đâm Thương Phalanx | combat | attack/control |
| 3 | Iron Charge · Xung Phong Thiết Giáp | combat | attack/mobility |
| 3 | Piercing Bolt · Tên Xuyên Thấu | ranged | attack |
| 3 | Hunter's Net · Lưới Thợ Săn | ranged, craft | control |
| 3 | Soul Rend · Xé Hồn | shadow | attack (hybrid) |
| 3 | Smoke Veil · Màn Khói Xương | shadow | support/mobility |
| 3 | Bone Spike Field · Bãi Gai Xương | death | attack/control |
| 3 | Soul Siphon · Hút Hồn | death | support/healing |
| 3 | Arc Welder · Hàn Hồ Quang | craft | attack/support (sét) |
| 3 | Fortify Module · Mô-đun Gia Cố | craft | defense/support |
| 3 | Marksman Breath · Hơi Thở Xạ Thủ (passive) | ranged | support |
| 3 | Grave Attunement · Cộng Hưởng Mộ Phần (passive) | death | support |
| 4 | Warlord Stride · Bước Chiến Chúa | combat | attack/defense/mobility |
| 4 | Skyfall Arrow · Mưa Tên Thiên Giáng | ranged | attack/control |
| 4 | Shadow Execution · Xử Quyết Bóng Tối | shadow | attack (execute) |
| 4 | Necrotic Wave · Sóng Hoại Tử | death | attack/control |
| 4 | Siege Turret · Pháo Công Thành | craft | summon/attack |
| 4 | Unyielding Bones · Xương Bất Khuất (passive) | universal | defense |
| 4 | Arcane Reservoir · Bể Linh Lực (passive) | universal | support |
| 5 | Sovereign Bulwark · Thành Lũy Chúa Tể | combat | defense/control |
| 5 | Oblivion Pulse · Xung Hư Vô | death | attack/support |
| 2 | Long Draw · Kéo Dài Dây (exclusive Bone Marksman) | — | attack |
| 2 | Tomb Pilfer · Vét Mộ (exclusive Grave Bandit) | — | attack/utility |
| 3 | Shield Wall · Tường Khiên (exclusive Bone Phalanx) | — | defense/control |
| 3 | Hunt Call · Hiệu Lệnh Săn (exclusive Wild Hunt Captain) | — | summon/support |
| 3 | Harvest Step · Bước Gặt Hồn (exclusive Soul Assassin) | — | mobility/attack |
| 3 | Overclock · Quá Tải (exclusive Bone Tinkerer Prime) | — | support/summon |
| 3 | Bone Tempest · Bão Xương (signature) | combat | attack/control |
| 3 | Hundred Barbs · Trăm Gai (signature) | ranged | attack/control |
| 3 | Veil Massacre · Tàn Sát Trong Màn (signature) | shadow | attack/mobility |
| 1 | Raise Skeleton · Dựng Xương Lính | death | summon (melee) |
| 2 | Bone Archer · Cung Thủ Xương | death | summon (ranged) |
| 3 | Bone Knight · Kỵ Sĩ Xương | death | summon (melee, chặn đòn) |
| 4 | Soul Wraith · Oán Linh | death | summon (hound) |

Phân bố active/passive/signature sau vá: T3 16/4/12, T4 5/3/6, T5 3/1/2. Mọi nghề từ T1 trở lên đều có ít nhất một exclusive.

**Số trong mô tả bậc** của 39 skill mới là số mẫu, đánh dấu † (ví dụ "Chậm 0,8s → 1,1s†"), lấy theo thang của skill cũ cùng nhóm; chỉnh sau playtest.

**Exclusive cấp qua Trial:** thắng Trial của nghề đích nhận toàn bộ skill exclusive của nghề đó ở Rank 1 (trùng thì cộng điểm). Exclusive vẫn nằm trong pool gacha đã lọc, nhưng không còn là thứ phải "quay cho ra".

### 2.2. Gate chuyển nghề

Hai luật mới, có validator trong `skill-system.js` (trang sẽ báo lỗi nếu vi phạm):

1. Gate của nghề Tier n chỉ dùng skill Tier n−1 (nhận qua huấn luyện, nâng bằng điểm trước khi chuyển).
2. Skill gate không được trùng với gate của bất kỳ nghề tiền nhiệm nào trên mọi tuyến dẫn tới nghề đó.

| Nghề đích | Gate V11 | Gate V12 |
|---|---|---|
| Bone Raider | rough_three_cut + cracked_axe | rough_three_cut + **axe_hook** |
| Grave Hunter | aimed_shot + scavenger_eye | aimed_shot + **snare_arrow** |
| Grave Bandit | shadow_slip + junk_snare | shadow_slip + **cutpurse_toss** |
| Soul Medium | grave_chant + field_mend | grave_chant + **spirit_ward** |
| Grave Marauder | cracked_axe + bone_dash | **armor_rend + leaping_strike** |
| Phantom Sniper | volley + aimed_shot | volley + **steady_draw** |
| Soul Assassin | phantom_step + bone_dash | phantom_step + **soul_tithe** |
| Shade Stalker | phantom_step + quiet_tread | phantom_step + **veil_sense** |
| Soul Weaver | field_mend + water_veil | **corpse_lantern + soul_thread** |
| Legion Marshal | guardian_pulse + shield_oath | **phalanx_thrust + iron_charge** |
| Eternal Huntsman | ghostline_shot + aimed_shot | ghostline_shot + **piercing_bolt** |
| Death Whisper | phantom_step + bone_dash | **soul_rend + smoke_veil** |
| Lich King | legion_call + summon_guard | legion_call + **bone_spike_field** |
| Bone Architect | deploy_sentry + pocket_turret | **fortify_module + arc_welder** |
| Abyss Sovereign | reaper_verdict + dread_cleaver | reaper_verdict + **warlord_stride** |
| Death Sovereign | grave_dominion + legion_call | grave_dominion + **necrotic_wave** |

20 cạnh còn lại giữ nguyên. Kết quả: 36/36 cạnh đều có đúng 2 skill mới so với toàn bộ tuyến trước đó.

Save cũ: skill gate V11 đã nhận vẫn ở trong kho. Huấn luyện chỉ tính là "đã nhận" khi đã thắng **và** đang sở hữu đủ cặp gate hiện hành, nên save đã nhận cặp V11 được đấu huấn luyện lại một lần để lấy cặp V12 (`trainingCleared()`).

### 2.3. Pool gacha theo nhánh (A3)

`poolSkills()` chỉ giữ skill mà nghề hiện tại **hoặc một nghề hậu duệ còn đến được** có thể dùng: exclusive của nhánh khác, Restricted ngoài domain tuyến, Lineage không thuộc lịch sử đều bị loại. Tỷ lệ độ hiếm vẫn chuẩn hóa lại theo pool sau lọc như V9.

### 2.4. Độ hiếm không còn trùng Tier (A4)

| Tier | Trắng | Lục | Lam | Tím | Vàng | Đỏ |
|---|---|---|---|---|---|---|
| 0 | 14 | 13 | 6 | 1 | 0 | 0 |
| 1 | 7 | 19 | 2 | 0 | 0 | 0 |
| 2 | 0 | 0 | 25 | 4 | 0 | 0 |
| 3 | 0 | 0 | 8 | 12 | 12 | 0 |
| 4 | 0 | 0 | 0 | 6 | 2 | 6 |
| 5 | 0 | 0 | 0 | 0 | 4 | 2 |

Sáu kỹ thuật nhập môn T1 (sword_cleave, shield_tap, aimed_shot, knife_feint, soul_spark, scrap_mine) hạ xuống trắng; leaping_strike, armor_rend, volley lên tím. Nếu save cũ đã nâng các skill này, điểm đã chi không hoàn lại (chênh lệch nhỏ, 5 điểm mỗi skill).

### 2.5. Thưởng chỉ số (C1, C2, C3)

- Cung, ném, dao: DEX hoặc AGI. Soul, tử thuật: chia INT/WIL. Ý chí: WIL.
- Thang theo độ hiếm: trắng/lục/lam 1 · tím 2 · vàng 2 (signature +1 ở R3) · đỏ 4 (R3 +1, R4 +1, R5 +2).
- rising_chip và cracked_axe bỏ thưởng R3 (từ 3 xuống 2 stat).

Tổng thưởng nếu max cả 147 skill: STR 34 · DEX 40 · VIT 38 · INT 32 · WIL 37 · AGI 29 (V11: 34/11/27/29/9/21). Stat mỗi điểm: trắng 0,125 · lam 0,074 · tím 0,088 · vàng 0,063 · đỏ 0,047 (V11 đỏ: 0,039). Farm trắng vẫn lợi hơn một chút về stat thô, nhưng Level và cơ chế rank của skill cao là phần thưởng chính; chênh lệch còn lại là chủ ý.

### 2.6. Kinh tế gacha (E)

- Giá một lượt theo Tier nghề thật: 60 / 80 / 100 / 120 / 140 / 160.
- Điểm trùng vàng 22 → 15, đỏ 45 → 30 (ở T4 phần lớn lượt vàng/đỏ là trùng).

Mô phỏng 400 lượt trên tuyến Fighter → Guard → Dread Knight → Death Knight → Abyss Sovereign, với pool đã lọc:

| Mốc | Lượt quay (median) | Chiến tích | V11 (chiến tích) |
|---|---|---|---|
| Bone Fighter | 18 | 1 080 | 1 080 |
| Bone Guard | 15 | 1 200 | 900 |
| Dread Knight | 19 | 1 900 | 960 |
| Death Knight | 26 | 3 120 | 1 560 |
| Abyss Sovereign | 42 | 5 880 | 1 740 |
| Tổng | 121 | 13 180 | 6 240 |

Tiến trình dài gấp đôi và dốc dần về cuối thay vì phẳng. Ở T4–T5 người chơi đánh boss (260 + 120 lần đầu) nên số trận thực tế thấp hơn cột "wins @120".

### 2.7. Runtime chiến đấu

- **Scale sát thương (D1):** martial với kiếm/rìu/thương/khiên → STR; cung/dao/ném → DEX; tay không → trung bình STR/DEX; magic → INT; hybrid → trung bình vật lý/INT; tech → trung bình DEX/INT. Hệ số giữ `+0,8 damage mỗi điểm` cho skill và `+2,5% mỗi điểm` cho đòn thường. Đòn thường cung/pháp khí cũng dùng công thức này thay vì `+0,5 × DEX`.
- **Mastery (D2):** suy từ `weapons / method / element / cost / tags`; skill có trường `masteryGain:['Sword','Shield']` thì dùng đúng danh sách đó (giá trị đầu +2, các giá trị sau +1). Không còn regex theo tên. Soul tăng khi skill tốn Soul, hệ dark, hoặc tag Soul/Spirit; Necromancy chỉ tăng với phép dark / domain death / tốn Soul, phép nguyên tố không còn tích Necromancy.
- **Vũ khí theo domain (D3):** origin: mọi loại trừ cung · combat: kiếm+khiên, kiếm, rìu, thương+khiên · ranged: cung, dao · shadow: dao, rìu, kiếm · death: pháp khí, dao · craft: dụng cụ, kiếm+khiên. Dropdown vũ khí tự vô hiệu lựa chọn không hợp lệ.

### 2.8. Hệ thuộc hạ (V12.2)

Trước V12.2 mọi summon là một trụ đứng yên bắn đạn, sống 7 + 2×rank giây, cap cứng 4 cho mọi nghề. Nhánh tử thuật chỉ có một skill gọi lính thật (Summon Bone Guard).

**Bốn kiểu hành vi** (`summonType` trên SkillDefinition; skill cũ gán qua `SUMMON_OVERRIDES`):

| Kiểu | Hành vi | Skill |
|---|---|---|
| turret | Đứng yên, bắn mục tiêu trong tầm; bị địch đánh được | Pocket Turret, Deploy Sentry, Siege Turret (đạn xuyên 1), Citadel Protocol (2 trụ) |
| ranged | Đi theo chủ, đứng cách địch, bắn; lùi khi bị áp sát <70px | Bone Archer (tên gây Chill) |
| melee | Lao vào địch trong 460px, không có địch thì đi theo chủ; nhảy qua hố | Raise Skeleton (R5 gọi 2), Summon Bone Guard, Bone Knight (chặn đòn, gây khựng), Legion Call (3 lính) |
| hound | Nhanh, bay qua hố, ưu tiên mục tiêu bị Curse (×1,5 sát thương), địch không nhắm | Hunt Call (R3+ gọi 2), Soul Wraith |

**Quân cấp thấp hơn chủ, máu mỏng:** cấp đơn vị = tier skill − 1. `HP = (base + 8×cấp + 4×rank) × 2 nếu Bone Knight × 0,7 nếu gọi nhiều con × 0,8 nếu từ signature`; base: turret 22, ranged 16, melee 20, hound 14. So với grunt 52 HP (×1,66 ở Tier 3 = 86): lính T1 R5 ≈ 28 HP, kỵ sĩ T3 R5 ≈ 72 HP. `Sát thương = base 4–5 + 1,5×cấp + rank + 0,15×(INT−5)`. Thuộc hạ chết khi hết máu hoặc hết thời gian (turret 12 + 2×rank giây, còn lại 9 + 2×rank).

**Địch nhắm mục tiêu gần nhất** trong số người chơi và thuộc hạ (trừ hound); đạn địch cũng trúng thuộc hạ. Kỵ sĩ xương nhận 70% sát thương khi chặn.

**Cap theo nghề thật** (`JOB_SUMMON_CAP`, mặc định 2): Necromancer 3 · Grand Necromancer 4 · Lich King 4 · Death Sovereign 5 · Soul Weaver 3 · Bone Engineer 3 · Tinkerer Prime 3 · Bone Architect 4 · Wild Hunt Captain 3. Vượt cap thì thuộc hạ cũ nhất tan.

**Lệnh và buff:** Grave Dominion tạo vùng 300 + 40×rank px trong 6 + rank giây, thuộc hạ trong vùng ×1,3 sát thương, hồi 30% máu, buff ×1,5 trong 6 + rank giây. Death Symphony: mọi thuộc hạ hợp kích ngay (×2 + 0,4×rank sát thương lên địch gần nhất) rồi buff. Overclock: trụ bắn nhanh gấp đôi trong 5 + 0,5×rank giây, mất 6% máu/s.

### 2.9. Tệp thay đổi

| Tệp | Thay đổi |
|---|---|
| `skill-system.js` | 43 skill mới, trường `summonType/summonCount`, `JOB_SUMMON_CAP`, cấp exclusive khi thắng Trial, huấn luyện lại khi gate đổi, trường `masteryGain`, bảng rarity V12, `REWARD_BY_SKILL` mở rộng, `defaultReward` theo độ hiếm, gate mới + validator, `usableOnBranch()` lọc pool, `gachaCost()`, `DOMAIN_WEAPONS`, API `getAllSkills/getGachaCost/getPoolSkillIds/weaponAllowed` |
| `v11-design-data.js` | tên Việt + 4 dòng mô tả bậc (có số mẫu †) cho 43 skill mới |
| `game-v10.js` | `scalingStat()`, `weaponStat()`, `masteryGainFor()`, khóa option vũ khí; hệ thuộc hạ: `spawnSummons()`, `updateAllies()`, `enemyTarget()`, `damageAlly()`, vẽ 4 kiểu + thanh máu |
| `index.html` | tiêu đề, liên kết tài liệu |
| `docs/10_V12_EXPORT_CANONICAL.json` | xuất lại từ trang (147 skill) |

Docs 01–09 giữ nguyên làm lịch sử.

## 3. Kiểm thử đã chạy

- `node --check` cho ba tệp JS.
- Chromium headless nạp `index.html`: không có pageerror/console error; 147 skill, 35 nghề, 36 cạnh; validator gate chạy qua.
- Script rà lại JSON xuất: 13 tuyến đều có 2 skill mới ở mọi cạnh; không có tham chiếu nghề/skill sai; mọi skill có thưởng R5.
- Mô phỏng kinh tế Monte Carlo như mục 2.6.

Test Trial: thắng Trial Abyss Sovereign cấp Abyss Judgment R1 rồi chuyển nghề thành công.

Chưa playtest tay cảm giác đánh của 39 skill mới; chúng đi qua dispatcher chung V10 theo roles/tags như 104 skill cũ.

## 4. Đã chốt (13/10/2026)

- 6 nghề thiếu exclusive: thêm, cấp qua Trial.
- Signature cho martial thuần: 3 signature Restricted T3 (combat / ranged / shadow).
- Farm skill trắng lấy stat: giữ như V12, quyết sau playtest; phương án dự phòng là Level chỉ đếm skill `tier ≥ tier nghề − 1`.
- Số đo của skill mới: điền số mẫu ngay, đánh dấu †, chỉnh sau playtest.
- Thuộc hạ: làm cả 3 (4 skill death, 4 kiểu hành vi, cap theo nghề); quân gọi ra cấp thấp hơn chủ, máu mỏng.

## 6. V12.3 — Sửa cây nghề theo `docs/13` (14/10/2026)

Áp dụng mục 2 của `docs/13_Job_Tree_Review.md`. Không đổi ID nghề/skill cũ, không đổi key save.

| Thay đổi | Chi tiết |
|---|---|
| Nghề mới **Siege Gunner / Pháo Thủ Công Thành** | T3, craft, grade A, terminal, từ Bone Engineer. Gate `heavy_bolt` + `blast_charge` (T2 restricted craft, mới). Exclusive `breach_cannon` (T3, tím) cấp khi thắng Trial. Mastery: Engineering ≥ 45, Throwing ≥ 25. Cap thuộc hạ 2. Nhánh Craft nay có điểm rẽ ở T2: hỗ trợ (Artificer → Architect) hoặc sát thương (Siege Gunner). |
| Cạnh mới **Grave Bandit → Shade Stalker** | Grave Bandit lên grade **B**. Gate Shade Stalker đổi từ `phantom_step` (exclusive của Grave Assassin, không cấp được cho Bandit) sang `shadow_climb` (T2 restricted shadow, mới) + `veil_sense`. Cạnh Assassin → Stalker vẫn dùng cặp này; validator "gate mới so với mọi tiền nhiệm" qua cả hai lối. |
| Đổi tên hiển thị, giữ ID | `Bone Tinkerer Prime` → hiển thị **Bone Artificer / Nghệ Nhân Xương**; `Lich King` → **Lich / Vu Yêu**; summon `bone_archer` → **Skeletal Archer / Xạ Thủ Hài Cốt** (tránh trùng tên nghề Skeleton Archer / Cung Thủ Xương). Cơ chế: `SkeletonV11Data.jobsEn` + `jobEn(id)`; `labelJob` và bảng V11 dùng tên hiển thị, mọi chỗ khác vẫn dùng ID. |
| Số liệu | 36 nghề · 38 cạnh · 151 skill (4 mới: 3 lam T2, 1 tím T3). 12 nghề terminal. |
| Tệp | `index.html` (mảng `J`, `JOB_DETAILS`, tiêu đề), `skill-system.js` (4 skill, rarity, reward, cap, gate), `v11-design-data.js` (tên, `jobsEn`, mô tả bậc, mục tiêu Trial), `v11-page.js` (tên hiển thị), `docs/02` mục 16 (luật màu nhánh), `docs/12`, `docs/13`. |

Kiểm thử: trang nạp không lỗi console, validator gate qua; mô phỏng bằng save: Bone Engineer thắng Trial Siege Gunner → nhận Breach Cannon R1 → chuyển nghề thành công, pool gacha của Siege Gunner có `heavy_bolt`/`blast_charge`/`breach_cannon`; Grave Bandit thắng Trial Shade Stalker → nhận Shade Echo → chuyển nghề thành công. `docs/10_V12_EXPORT_CANONICAL.json` **chưa xuất lại** (vẫn 147 skill / 35 nghề); xuất lại từ trang khi cần dữ liệu cho QA.

## 5. Còn mở

- Playtest tay 43 skill mới và các số †, cộng 4 skill V12.3 (`heavy_bolt`, `blast_charge`, `breach_cannon`, `shadow_climb`) đang chạy qua dispatcher chung theo roles/tags. Test headless: Grand Necromancer gọi 2 lính + cung thủ, hạ được scout, lính mất máu khi bị đánh.
- Dispatcher V10 chưa có hành vi riêng cho Execute (Shadow Execution), Loot (Tomb Pilfer), Overclock; hiện chạy theo nhóm chung (attack / utility / support).

# Skeleton Codex — Tối ưu thứ tự làm nghề và tái cấu trúc cây cho nhiều chủng tộc

**Ngày:** 14/10/2026 · **Trạng thái:** **đã áp dụng ở lớp thư viện** `../../shared/` (thân chung 34 nghề, 10 chủng tộc, `compose()`, mục 14 trên trang codex). Runtime chiến đấu vẫn chạy cây V12.3 (36 nghề, 38 cạnh) qua ID cũ; map ID ở `shared/races/skeleton.js → legacyIds`. Các quyết định ở mục 5 đã chọn: nâng Tier terminal (có), gộp Bone Raider vào Duelist (có), Bone Acolyte → Adept (có, tên hiển thị skeleton giữ nguyên), chủng tộc thứ hai: human. · **Đi kèm:** `docs/13` mục 6 (backlog 19 nghề), `docs/11` (chi phí art), `docs/12` (marker).

## 0. Bài toán thật sự

Hiện có 36 nghề skeleton, chưa portrait nào duyệt, và kế hoạch thêm human, elf, người thú, hải tộc. Nếu mỗi chủng tộc có cây riêng 36 nghề thì 5 chủng tộc = 180 nghề × ~90 frame overlay (`docs/11` mục 6.3) = không làm nổi. Vì vậy câu hỏi "làm nghề nào trước" phải trả lời bằng câu hỏi khác: **nghề nào được thiết kế một lần rồi dùng cho mọi chủng tộc?**

Kết luận ngắn:
1. Tách cây thành **thân chung** (nghề mọi chủng tộc đều có, cùng ID, cùng skill, chỉ vẽ lại gear theo thân) và **ngọn riêng** (nghề độc quyền chủng tộc, nơi đặt toàn bộ "chất" của chủng tộc đó).
2. Làm theo **lát dọc** (một tuyến từ T0 tới terminal) trước khi mở rộng ngang, để kiểm chứng tiến trình + art + Rank trong một lần.
3. Ưu tiên art cho nghề **thân chung** vì mỗi nghề đó phục vụ 5 chủng tộc; nghề ngọn riêng của skeleton (Lich, Death Knight…) làm sau dù chúng là nghề "ngầu" nhất.

---

## 1. Mô hình Thân chung – Ngọn riêng

```
Tier 0   Origin riêng từng chủng tộc  (Wanderer / Peasant / Wayfarer / Cub / Drifter…)
Tier 1   6 nghề nhập môn CHUNG        (Fighter, Archer, Rogue, Adept, Tinkerer, Brawler)
Tier 2   12 nghề chuyên môn CHUNG     (2 lối ra mỗi nghề T1)
Tier 3   8 nghề cao cấp CHUNG  +  ngọn riêng bắt đầu (1–2 nghề/chủng tộc)
Tier 4   phần lớn là NGỌN RIÊNG       (2–3 nghề/chủng tộc)
Tier 5   toàn bộ là NGỌN RIÊNG        (1–2 nghề/chủng tộc, Mythic)
```

| Lớp | ID & skill | Art | Ai dùng |
|---|---|---|---|
| Thân chung (≈27 nghề) | một bộ duy nhất | thiết kế marker/silhouette **một lần** (`docs/12`), vẽ lại overlay theo từng thân chủng tộc | mọi chủng tộc, trừ nghề bị chủng tộc đó **cấm** |
| Ngọn riêng (5–8 nghề/chủng tộc) | riêng, tiền tố theo chủng tộc | vẽ riêng, được phép đổi vật liệu thân (Body Evolution) | một chủng tộc |

**Chủng tộc = Origin T0 + thân sprite + bảng trường phái (native / foreign / forbidden) + ngọn riêng + Body Evolution.** Không phải một cây mới.

### 1.1. Tám trường phái (domain) cố định cho mọi chủng tộc

Thay 6 domain hiện tại (origin, combat, ranged, shadow, death, craft) bằng 8, vì các chủng tộc sau sẽ cần Magic/Beast/Martial mà skeleton đang bỏ trống:

| Trường phái | Mastery (đã có trong `docs/01` mục 6) | Nghề T1 chung |
|---|---|---|
| Combat | Sword / Axe / Spear / Shield | Fighter |
| Ranged | Throwing / Bow / Crossbow / Firearm | Archer |
| Shadow | Stealth / Dagger / Trap | Rogue |
| Arcane | Fire / Frost / Lightning / Arcane | Adept (chọn trường phái ở T2) |
| Death | Necromancy / Soul / Curse | Adept |
| Craft | Engineering / Alchemy / Construct | Tinkerer |
| Beast | Riding / Taming | (vào từ Archer→Hunter hoặc Fighter→Raider ở T2) |
| Martial | Unarmed / Body / Spirit | Brawler (T1 mới, `docs/13` 6.3) |

Mỗi chủng tộc gán cho từng trường phái một trong ba trạng thái:
- **native**: vào từ T1, gate bình thường, có ngọn riêng.
- **foreign**: vào được nhưng gate cao hơn (Mastery +15) và không có ngọn riêng ở T4–T5.
- **forbidden**: không vào bằng đường thường; chỉ qua nghề ẩn (ví dụ human học Death qua "Heretic").

Đây là cách tạo khác biệt chủng tộc **mà không thêm nghề**: cùng một Necromancer, skeleton vào từ T1 còn elf phải đi vòng.

### 1.2. Thân chung đề xuất (27 nghề, phần lớn đã có)

| T1 | T2 (2 lối ra) | T3 chung |
|---|---|---|
| Fighter | Guard · Duelist | Phalanx (từ Guard) · Blademaster¹ (từ Duelist) |
| Archer | Marksman · Hunter | Sniper² (từ Marksman) · Beast Rider (từ Hunter, `docs/13` 6.2) |
| Rogue | Assassin · Bandit | Stalker (từ cả hai) |
| Adept | Necromancer (Death) · Elementalist (Arcane, `docs/13` 6.1) · Medium (Spirit)³ | Grand Necromancer · Warlock/Caller (nguyên tố) |
| Tinkerer | Engineer · Alchemist (`docs/13` 6.4) | Artificer · Siege Gunner |
| Brawler | Shaper · Monk⁴ | Colossus |

¹ Bone Duelist → Sword Wraith hiện là terminal T3 skeleton; trong mô hình mới "Blademaster" là T3 chung, còn **Sword Wraith thành ngọn riêng T4 của skeleton** (kiếm hồn chỉ có nghĩa với undead).
² Phantom Sniper → đổi thành "Sniper" chung; chất "u linh" chuyển sang ngọn riêng skeleton.
³ Adept có 3 lối ra là ngoại lệ duy nhất, vì Arcane/Death/Spirit là ba trường phái khác hẳn nhau.
⁴ Monk là lối Martial-Spirit cho human/elf; skeleton có thể bị **forbidden** Monk (không có hơi thở) để tạo khác biệt.

Tổng: 6 + 13 + 8 = 27 nghề chung (Raider và Bone Phalanx dạng hiện tại gộp vào Guard/Duelist hoặc trở thành ngọn riêng, xem 1.4).

### 1.3. Ngọn riêng của skeleton (chuyển từ cây hiện tại)

Những nghề sau chỉ có nghĩa khi nhân vật là undead, nên trở thành ngọn riêng, giữ nguyên ID và skill:

| Ngọn riêng skeleton | Tier | Mọc từ nghề chung | Lý do riêng |
|---|---|---|---|
| Dread Knight → Death Knight → Abyss Sovereign | 3 → 4 → 5 | Guard | lai Combat–Death, lửa hồn |
| Sword Wraith | 4 (nâng từ 3) | Blademaster | kiếm hồn, chân mờ |
| Phantom Sniper → Eternal Huntsman | 4 → 5 (nâng) | Sniper | tên hồn |
| Soul Assassin → Death Whisper | 4 → 5 (nâng) | Assassin/Stalker | trích hồn |
| Lich → Death Sovereign | 4 → 5 | Grand Necromancer | bình phách |
| Soul Weaver | 4 (nâng) | Medium | dệt hồn |
| Headless Horseman | 4 | Beast Rider | sọ cầm tay |
| Mummy Lord, Ossomancer, nghề ẩn Body Evolution | 3–5 | theo `docs/13` 6.4–6.5 | — |

Nâng Tier một số terminal (Sword Wraith 3→4, Soul Weaver 3→4) là **chủ ý**: ngọn riêng nằm trên T3 chung, nên mọi chủng tộc đều có ít nhất 3 Tier chung trước khi tách.

### 1.4. Những nghề hiện tại cần quyết

| Nghề V12.3 | Đề xuất |
|---|---|
| Bone Raider / Grave Marauder | gộp Raider vào Fighter→Guard/Duelist (rìu là bộ vũ khí, không cần nghề riêng); Marauder thành ngọn riêng T3 từ Bandit, hoặc bỏ |
| Bone Phalanx / Legion Marshal | Phalanx là T3 chung; Marshal thành ngọn riêng skeleton T4 ("quân đoàn xương") hoặc T4 chung nếu human cũng cần chỉ huy |
| Wild Hunt Captain | ngọn riêng skeleton T4 từ Beast Rider (Cuộc Săn Hoang là undead) |
| Shade Stalker | T3 chung "Stalker" (đã có 2 lối vào, hợp vai trò chung) |
| Bone Tinkerer Prime / Bone Architect | Artificer T3 chung; Architect T4 chung (human/dwarf-kiểu đều cần) |
| Siege Gunner | T3 chung |
| Grave Bandit / Grave Hunter / Soul Medium | T2 chung, bỏ tiền tố "Grave/Bone/Soul" trong tên chung; chủng tộc gắn tiền tố khi hiển thị (`jobsEn` theo chủng tộc) |

**Đặt tên:** nghề chung dùng tên trần (Fighter, Guard, Necromancer); mỗi chủng tộc có bảng tiền tố hiển thị (skeleton: Bone/Grave; human: không; elf: Sylvan; người thú: Fang; hải tộc: Tide). Cơ chế `jobsEn` của V12.3 mở rộng thành `jobsEn[race][id]`. ID không đổi.

---

## 2. Thứ tự sản xuất (art + playtest)

Nguyên tắc: **lát dọc trước, lan ngang sau; nghề chung trước, ngọn riêng sau; mỗi đợt phải chơi được từ T0 tới đích của đợt.**

| Đợt | Nghề | Số | Mục đích | Ghi chú art |
|---|---|---|---|---|
| 0 (đang làm, `docs/11`) | Wanderer + Fighter, Archer, Rogue, Adept, Tinkerer | 6 | chứng minh overlay dùng chung thân | đổi Bone Acolyte → Adept ngay bây giờ, trước khi vẽ, để portrait không mang chất Death |
| 1 · Lát dọc | Guard → Phalanx → **Dread Knight → Death Knight** | 4 | một tuyến tới ngọn riêng T4: kiểm chứng Rank I–V, Trial, gate, lửa hồn | tuyến Combat rẻ nhất (không companion, không projectile phức tạp) |
| 2 · Lan ngang T2 | Duelist, Marksman, Hunter, Assassin, Bandit, Necromancer, Elementalist, Medium, Engineer, Alchemist | 10 | đủ 12 T2 chung; mở gacha pool thật | Elementalist mở màu cam/băng, Alchemist dùng lại anim throw |
| 3 · Brawler | Brawler → Shaper → Colossus | 3 | nhánh không vũ khí, độc nhất skeleton nhưng Brawler/Monk là chung | cần bộ đòn thường `unarmed` |
| 4 · T3 chung | Blademaster, Sniper, Stalker, Grand Necromancer, Warlock, Artificer, Siege Gunner, Beast Rider | 8 | hoàn tất thân chung 27 | Beast Rider đắt nhất (anim thú cưỡi) |
| 5 · Ngọn riêng skeleton | Lich, Death Sovereign, Sword Wraith, Phantom Sniper, Soul Assassin, Death Whisper, Soul Weaver, Abyss Sovereign, Headless Horseman | 9 | chất skeleton | có thể bỏ 2–3 nghề nếu credit cạn; Abyss Sovereign xem lại chủ đề (`docs/13` 3.3) |
| 6 · Chủng tộc thứ hai | Origin + thân + vẽ lại overlay 6 T1 + 2 ngọn riêng | ~8 nghề nhưng ~30 sheet | kiểm chứng mô hình dùng chung | chọn human (thân gần skeleton nhất) |

Sau đợt 2 là mốc **"game hoàn chỉnh nhỏ"**: 1 Origin + 6 T1 + 12 T2 + 1 tuyến T3–T4 = 20 nghề chơi được, đủ để playtest kinh tế gacha và Mastery. Mọi nghề sau đó là mở rộng, không phải điều kiện ra mắt.

### 2.1. Vì sao không làm Lich / Death Sovereign sớm dù là nghề hấp dẫn nhất
Chúng là ngọn riêng: mỗi frame chỉ phục vụ skeleton. Necromancer T2 và Grand Necromancer T3 thì phục vụ cả elf/hải tộc (foreign) lẫn human (hidden). Art cho Necromancer được dùng lại 4–5 lần; art cho Lich dùng 1 lần. Lich xứng đáng đẹp nhất, nên làm **cuối**, khi pipeline đã ổn định và credit còn lại biết rõ.

### 2.2. Vì sao làm Elementalist ở đợt 2 chứ không phải backlog
Vì 20 skill nguyên tố và hệ affinity đã nằm trong runtime (`docs/13` 6.1); mọi chủng tộc sau đều cần Arcane (elf native, hải tộc native-Water). Đó là nghề chung có tỷ lệ dùng lại cao nhất trong toàn bộ backlog.

---

## 3. Phác thảo lớp chủng tộc (để kiểm tra mô hình, chưa thiết kế)

| Chủng tộc | Origin T0 | Native | Foreign | Forbidden | Ngọn riêng (ví dụ) | Body Evolution |
|---|---|---|---|---|---|---|
| Skeleton | Wanderer | Combat, Shadow, Death, Craft | Arcane, Ranged, Beast | Martial-Spirit (Monk) | Lich, Death Knight, Sword Wraith, Headless Horseman | Crystal / Dragonbone / Mechanical |
| Human | Peasant | Combat, Ranged, Craft, Martial | Arcane, Beast | Death (chỉ qua Heretic ẩn) | Paladin, Inquisitor, Warlord, Grandmaster | Blessed / Scarred |
| Elf | Wayfarer | Ranged, Arcane, Shadow | Combat, Beast | Craft-Engineering | Ranger Lord, Spellblade, Moon Oracle | Ancient / Wild |
| Người thú | Cub | Beast, Martial, Combat | Ranged, Shadow | Arcane | Alpha, Totem Shaman, Pack Lord | Primal |
| Hải tộc | Drifter | Arcane-Water, Ranged (harpoon), Beast (sea) | Combat, Craft | Death-Necromancy | Tidecaller, Harpoon Master, Abyss Priest | Coral / Deep |

Ghi chú: "Abyss" hiện là T5 của skeleton; nếu hải tộc có Abyss Priest thì đổi tên Abyss Sovereign của skeleton để tránh hai nghề cùng từ khóa (một lý do nữa cho `docs/13` 3.3).

---

## 4. Thay đổi dữ liệu khi áp dụng (chưa làm)

1. `JobDefinition` thêm `shared: true|false`, `race: null|'skeleton'`, `school` (8 trường phái) thay `domain`; `DOMAIN_WEAPONS` theo school.
2. Bảng `RACE_SCHOOLS[race] = {native:[], foreign:[], forbidden:[]}`; `jobGate` cộng Mastery +15 cho foreign, chặn forbidden.
3. Đổi tên ID: `Bone Acolyte` → `Adept`, bỏ tiền tố Bone/Grave/Soul ở nghề chung; cần bảng map ID cũ → mới trong loader để save V10–V12 đọc được (giống `trainingCleared()` đã làm cho gate V11).
4. `jobsEn[race][id]` cho tiền tố hiển thị theo chủng tộc; `nameVi` tương tự.
5. Pipeline `docs/11`: thêm quy ước `art/sprite/body/<race>/`, và luật **mọi chủng tộc humanoid dùng chung ô 64×64, origin feet-center, hitbox 30×48**, để gear overlay vẽ lại được theo cùng tọa độ tay/vai. Chủng tộc có thân khác (hải tộc đuôi cá?) phải quyết sớm vì phá luật này.

## 5. Việc cần quyết trước khi làm bất cứ gì

- Có chấp nhận nâng Tier một số terminal hiện tại (Sword Wraith, Soul Weaver 3→4) không?
- Bone Raider: gộp hay giữ?
- Đổi `Bone Acolyte` → `Adept` trước đợt art 0 hay giữ nguyên và chấp nhận portrait Acolyte mang chất Death?
- Chủng tộc thứ hai là human (rẻ, giống thân) hay hải tộc (khác thân, kiểm chứng rủi ro pipeline sớm)?

# Skeleton Codex — Đánh giá cây nghề V12 (35 nghề, 36 cạnh)

**Ngày:** 14/10/2026 · **Phạm vi:** cấu trúc đồ thị, tên nghề, phân bố Power/Terminal, và các chỗ cây nghề làm khó việc thiết kế ngoại hình (`docs/12`). Không đụng số liệu skill.

Kết luận ngắn: **cây dùng được, không cần làm lại.** Có 4 chỗ nên sửa trước khi vẽ art (vì đổi tên/thêm nghề sau khi đã có portrait là tốn nhất), và 5 chỗ có thể để sau playtest.

> **Trạng thái 14/10/2026:** toàn bộ mục 2 (và bảng mục 5) **đã áp dụng** trong V12.3; xem `docs/10` mục 6. Cây hiện tại: 36 nghề, 38 cạnh, 151 skill. Mục 3 chưa đụng, chờ playtest. Số liệu ở mục 1 bên dưới là **trước** khi sửa, giữ làm căn cứ.

---

## 1. Số liệu hiện trạng

| Nhánh (domain) | Số nghề | Số cạnh | Điểm rẽ sau T1 | Tier cao nhất | Terminal | Grade thấp nhất ở terminal |
|---|---:|---:|---:|---:|---|---|
| combat | 11 | 11 | T1→3 hướng, T2 Guard→2 | 5 | Sword Wraith T3 (S), Legion Marshal T4 (A), Abyss Sovereign T5 (S) | A |
| ranged | 6 | 6 | T1→2 hướng | 4 | Wild Hunt Captain T3 (**B**), Eternal Huntsman T4 (A) | B |
| shadow | 7 | 8 | T1→2, T2 Assassin→2 | 4 | Grave Marauder T3 (A), Shade Stalker T3 (**B**), Death Whisper T4 (S) | B |
| death | 7 | 8 | T1→2, T2 Necro→2 | 5 | Soul Weaver T3 (**B**), Death Sovereign T5 (S) | B |
| craft | 5 | 4 | **không có** | 4 | Bone Architect T4 (**B**) | B |

(Wanderer tính riêng. Grave Marauder xếp domain shadow theo dữ liệu `index.html` dù tiền nhiệm chính là Bone Raider thuộc combat.)

---

## 2. Nên sửa trước khi vẽ art

### 2.1. Nhánh Craft là đường thẳng 4 Tier không có lựa chọn
Tinkerer → Engineer → Tinkerer Prime → Architect: mỗi nghề đúng 1 lối ra, grade C/B/C/B. Người chọn Tinkerer ở T1 không đưa ra quyết định nào nữa cho đến khi kết thúc, và kết thúc ở T4 grade B. Đây là nhánh duy nhất như vậy; nó biến "chọn Tinkerer" thành lựa chọn kém hấp dẫn ngay từ T1.

**Đề xuất (1 nghề mới, 1 cạnh mới):** thêm một terminal T3 tấn công từ Bone Engineer, ví dụ **Siege Gunner / Pháo Thủ Công Thành** (grade A, nỏ máy hạng nặng + mìn, chơi như glass cannon), để Engineer rẽ 2 hướng: hỗ trợ (Prime → Architect) hoặc sát thương (Siege Gunner, terminal). Về art, nghề này cho nhánh Craft một silhouette "vũ khí to hơn người" mà hiện nhánh không có. Gate cần 2 skill T2 craft mới (theo luật V12), có thể tái dùng `siege_turret` làm exclusive cấp qua Trial.

### 2.2. Grave Bandit là nghề cụt mềm
Grade C, lối ra duy nhất là Grave Marauder (terminal T3). Bone Raider (grade A) cũng chỉ đi tới đúng Marauder. Nghĩa là Bandit là phiên bản yếu hơn của Raider với cùng đích đến; không ai chọn Bandit trừ vì ngoại hình.

**Đề xuất:** một trong hai:
- (a) Nâng Grave Bandit lên B và cho Bandit thêm lối ra thứ hai là **Shade Stalker** (T3, hiện chỉ từ Assassin). Hợp lý về gameplay (Bandit = utility/trinh sát) và về art (`docs/12` đã thiết kế Stalker không cần chi tiết lineage từ Assassin). Cần thêm cặp gate riêng cho cạnh Bandit→Stalker theo luật "2 skill mới".
- (b) Giữ cây, nhưng tách Marauder thành 2 phiên bản skill-set theo tiền nhiệm. Tốn hơn, không khuyến nghị.

### 2.3. Ba tên nghề gây rắc rối
| Hiện tại | Vấn đề | Đề xuất |
|---|---|---|
| **Bone Tinkerer Prime** (T3) | Tên T3 là "bản Prime" của tên T1; đọc như nâng cấp chứ không phải nghề mới, trái với chính nguyên tắc "nghề con phải đổi silhouette" | **Bone Artificer / Nghệ Nhân Xương** |
| **Lich King** (T4) → **Death Sovereign** (T5) | "King" đã là đỉnh trong văn hóa chung; đặt King dưới Sovereign làm T4 nghe như đích đến, T5 thành thừa | T4 → **Lich / Vu Yêu**; T5 giữ Death Sovereign, hoặc T5 → **Lich King** nếu muốn tên quen thuộc ở đích |
| **Skeleton Archer** (T1) vs summon **Bone Archer** (`bone_archer`, V12.2) | Nghề là nghề duy nhất mang tiền tố "Skeleton"; thuộc hạ lại mang tên "Bone Archer" nên hai cái tên gần giống nhau chỉ cùng một thứ ở hai chỗ | Đổi summon thành **Skeletal Archer / Cung Thủ Xương Gọi** hoặc **Bone Bowman**; giữ ID `bone_archer` để không hỏng save |

Đổi tên hiển thị không ảnh hưởng ID/save (ID nghề đang là tên tiếng Anh; nếu đổi tên Anh của nghề thì cần map ID cũ → mới trong loader, nên ưu tiên chỉ đổi `nameVi` và thêm trường `displayEn`).

### 2.4. Quá nhiều nghề "ma" phân tán khắp nhánh
Sword Wraith, Phantom Sniper, Shade Stalker, Soul Assassin, Death Whisper, Soul Medium, Soul Weaver, cộng summon Soul Wraith. Bảy nghề ở bốn nhánh khác nhau đều có thể bị vẽ thành "xương phát sáng xanh có sương". Đây là rủi ro lớn nhất cho việc phân biệt ngoại hình.

**Đề xuất:** không đổi tên; thay vào đó khóa luật màu nhấn theo nhánh (đã làm ở `docs/12` mục 1: Death = xanh tử linh, Shadow = tím/teal, Ranged = cyan ma, Combat lai = lửa hồn xanh lạnh, Wraith = trắng mờ + đỏ). Ghi luật này vào `docs/02` như quy tắc bắt buộc, không chỉ là gợi ý.

---

## 3. Có thể để sau playtest

### 3.1. Terminal grade B
Bốn terminal có grade B: Wild Hunt Captain (T3), Shade Stalker (T3), Soul Weaver (T3), Bone Architect (T4). `docs/01` mục 8 nói terminal "có thể mạnh sớm, bù lại hẹp vai trò"; grade B không bù được việc mất 1–2 Tier. Người chơi tới Grave Assassin sẽ luôn chọn Soul Assassin (A, còn lên T4 S) thay vì Shade Stalker (B, hết). **Đề xuất:** terminal tối thiểu grade A; nếu muốn giữ B thì cho terminal một đặc quyền ngoài combat (cap thuộc hạ cao hơn, pool gacha rộng hơn, hoặc mở skill Lineage riêng).

### 3.2. Chỉ Combat và Death có Tier 5
Ranged, Shadow, Craft dừng ở T4. Chấp nhận được nếu là chủ ý ("Mythic hiếm"), nhưng cần ghi rõ trong `docs/01` để không bị hiểu là thiếu. Nếu sau này muốn thêm, ứng viên tự nhiên: Death Whisper → T5 (nhánh Shadow đang có S ở T4 mà cụt) hơn là Ranged.

### 3.3. Hai tuyến hiệp sĩ đen ba Tier liên tiếp
Dread Knight (T3) → Death Knight (T4) → Abyss Sovereign (T5): ba nghề giáp nặng đen liền nhau là chỗ dễ rơi vào "rank cao thêm giáp" nhất. `docs/12` xử lý bằng: bỏ khiên → khiên hồn → đổi màu nhấn và phóng pauldron. Nếu khi vẽ vẫn không tách được, cân nhắc đổi chủ đề Abyss Sovereign sang thứ không phải "plate to hơn" (ví dụ kỵ sĩ cưỡi xương thú, dùng lại domain Beast đã có trong `docs/01` mục 6 nhưng chưa nghề nào dùng).

### 3.4. Domain Beast và Martial có trong Mastery nhưng không nghề nào dùng
`docs/01` mục 6 liệt kê Riding/Taming và Unarmed/Body/Spirit; `index.html` không có nghề domain beast/martial, `DOMAIN_WEAPONS` cũng không có. Hoặc xóa khỏi tài liệu để tránh hứa hão, hoặc dùng cho đề xuất 3.3 / mở rộng sau.

### 3.5. Trường `role` trùng lặp
"Hunter" ×3, "Support" ×3, "Sniper" ×2, "Summoner" ×2, "Tank" ×2 (Bone Guard và Death Knight S-grade cùng "Tank"). Trường này hiện chỉ dùng để hiển thị và lọc, nhưng nếu art/UI dùng nó làm icon vai trò thì cần tách (ví dụ Death Knight → "Juggernaut", Bone Tinkerer Prime → "Enhancer", Wild Hunt Captain → "Beastmaster").

---

## 4. Những gì đang đúng, không nên đụng

- Luật mỗi cạnh T n→n+1, một chiều, terminal chặn: rõ và đã có validator.
- Hội tụ Grave Marauder và Soul Weaver: tốt cho cả gameplay lẫn art (hai lối vào, một ngoại hình).
- Bone Fighter 3 lối ra ở T1→T2 là điểm rẽ giàu nhất; Guard tiếp tục rẽ 2 ở T2→T3: nhánh Combat là xương sống, hợp lý khi đợt art 1 bắt đầu từ Fighter.
- Gate V12 "2 skill mới mỗi cạnh" áp dụng được cho mọi đề xuất thêm cạnh ở trên mà không cần luật mới.

---

## 5. Tóm tắt việc cần làm nếu chấp nhận mục 2

| # | Việc | Tệp | Ảnh hưởng save |
|---|---|---|---|
| 1 | Thêm nghề Siege Gunner (T3, craft, terminal, từ Bone Engineer) + 2 skill gate T2 | `index.html` (mảng `J`), `skill-system.js`, `v11-design-data.js` | Không |
| 2 | Thêm cạnh Grave Bandit → Shade Stalker, nâng Bandit lên B, thêm cặp gate | như trên | Không |
| 3 | Đổi tên hiển thị: Bone Tinkerer Prime → Bone Artificer; Lich King → Lich; summon Bone Archer → Skeletal Archer | `v11-design-data.js` (nameVi), thêm `displayEn` | Không nếu giữ ID |
| 4 | Ghi luật màu nhấn theo nhánh vào `docs/02` | `docs/02` | — |
| 5 | Cập nhật `docs/12` cho nghề mới (1 mục) | `docs/12` | — |

Thứ tự: 3 → 4 → 1 → 2 → 5. Việc 3 và 4 làm được ngay, không cần playtest.

---

## 6. Backlog nghề — nguyên liệu đã có trong docs nhưng chưa nghề nào dùng (14/10/2026)

Rà `docs/01`–`08`, `skill-system.js` và hai ảnh tham chiếu (`assets/class-examples.webp`, `assets/source-cards.webp`). Mỗi mục ghi: nguyên liệu đang có, vị trí đề xuất trên cây, **marker** (phải không trùng bảng mục 2 của `docs/12`) và màu nhấn theo luật `docs/02` mục 16. Tất cả là đề xuất; thứ tự ưu tiên ở cuối.

### 6.1. Nhánh Nguyên tố (Elemental) — ưu tiên 1
**Nguyên liệu có sẵn:** ~20 skill lửa/nước/băng/sét/gió/đất/tự nhiên/sáng/tối với `attunement` (flame_arc, frost_guard, ice_lance, earth_wall, conductive_surge…), 2 signature (Tidal Sanctuary, Storm Waltz), domain `elemental`/`arcane` đã khai báo ở Ice Lance "dành cho nghề nguyên tố về sau", runtime đã tích `affinity` theo trận (`syncAffinity`). Mastery Magic (Fire/Frost/Lightning/Arcane) có trong `docs/01` mục 6. `docs/02` mục 7 đã định nghĩa Elemental Variant (Frost, Flame). **Hiện không nghề nào thuộc domain này nên toàn bộ hệ affinity không có tác dụng.**

| Nghề | Tier | Từ | Ra | Marker | Màu nhấn |
|---|---|---|---|---|---|
| Ember Acolyte / Tập Sự Tro Tàn | 2 | Bone Acolyte | Cinder Warlock | lư hương xích treo tay + sọ ám khói | cam than `#E06A2A` ở lư và hốc mắt |
| Cinder Warlock / Thuật Sĩ Than Hồng | 3 | Ember Acolyte | terminal hoặc T4 sau | xương sườn nứt phát sáng như than, áo choàng cháy mép | cam than; nền áo đen tro |
| Rime Caller / Kẻ Gọi Sương | 2 | Bone Acolyte | Frost Ossuary | băng mọc trên một vai + gậy nhũ băng | trắng băng `#CFEFF5`, không glow |
| Frost Ossuary / Hầm Xương Băng | 3 | Rime Caller | terminal | thân phủ vảy băng, hơi lạnh tỏa chân | trắng băng + lam nhạt |

Bone Acolyte sẽ có 4 lối ra (Necromancer, Soul Medium, Ember, Rime). Gate dùng skill nguyên tố T1 (flame_arc, frost_guard…) đang bị bỏ không; cần thêm `DOMAIN_WEAPONS.elemental=['focus']`. Về art, nhánh Death hiện toàn đen + xanh; nhánh nguyên tố mở ra đỏ cam và trắng băng, rất dễ tách ở 64 px.

### 6.2. Nhánh Beast — ưu tiên 2
**Nguyên liệu có sẵn:** ảnh class-examples có **Rider / Kỵ binh** cưỡi ngựa xương; source cards có **Headless Horseman** và **Undead Beastmaster**; mastery Riding/Taming trong `docs/01`; dòng Beast trong bảng silhouette `docs/02` mục 5. Pipeline `docs/11` đã có cơ chế companion sprite (chó săn của Wild Hunt Captain).

| Nghề | Tier | Từ | Ra | Marker | Màu nhấn |
|---|---|---|---|---|---|
| Bone Rider / Kỵ Binh Xương | 3 | Grave Hunter | Headless Horseman | **thú cưỡi** ngựa xương (sprite riêng, 96×64), thương kỵ binh | nâu da yên + xương |
| Headless Horseman / Kỵ Sĩ Không Đầu | 4 | Bone Rider | terminal | **sọ cầm trên tay**, cổ trống; ngựa xương lửa lạnh | lửa hồn xanh lạnh `#7FB8FF` chỉ ở ngựa |

Grave Hunter sẽ có 2 lối ra (Wild Hunt Captain, Bone Rider), giải quyết luôn mục 3.1 (Hunter là nhánh yếu). Kỵ binh cũng là lối thoát cho mục 3.3: Abyss Sovereign không cần làm "plate to hơn" nếu nhánh Beast đã có kỵ sĩ; có thể đổi Abyss Sovereign sang chủ đề khác. Rủi ro: thú cưỡi đổi hitbox và anim (idle/run/jump thay bằng bộ của ngựa) — là nghề tốn art nhất trong backlog.

### 6.3. Nhánh Martial / thân xương — ưu tiên 3, độc nhất cho skeleton
**Nguyên liệu có sẵn:** mastery Unarmed/Body/Spirit (`docs/01`), dòng Martial trong `docs/02` mục 5 ("xương lộ rõ, ít giáp, wraps, gauntlets"), skill Loose Bone (ném xương vụn) T0, anim `revive` "bones reassemble" trong `docs/11`. `method: martial` và tay không đã có trong công thức scale (`scalingStat`: tay không = trung bình STR/DEX).

| Nghề | Tier | Từ | Ra | Marker | Màu nhấn |
|---|---|---|---|---|---|
| Bone Brawler / Võ Sĩ Xương | 1 | Wanderer | Ossomancer | **không vũ khí**, quấn vải cẳng tay, khớp vai lộ to | không có |
| Ossomancer / Bone Shaper / Kẻ Nắn Xương | 2 | Bone Brawler | Relic Colossus | **tháo tay làm chùy**, gai xương mọc từ vai; ném sọ rồi dịch chuyển tới sọ | không có; xương hơi ngả vàng |
| Relic Colossus / Cự Cốt | 3 | Ossomancer | terminal | xương to gấp rưỡi ở cẳng tay và vai (chỉ nghề này được phá luật tỷ lệ) | — |

Đây là nhánh duy nhất không cần overlay vũ khí; marker là **thay đổi chính bộ xương**. Cần nhánh T1 mới từ Wanderer (6 lối ra) và bộ đòn thường `unarmed` trong `WEAPON_SETS`. Tham chiếu: Skul: The Hero Slayer (ném đầu rồi dịch chuyển).

### 6.4. Curse và Alchemy — hai mastery con bị bỏ trống
**Nguyên liệu có sẵn:** Death liệt kê Necromancy/Soul/**Curse**, Craft liệt kê Engineering/**Alchemy**/Construct (`docs/01` mục 6); status `curse` đã có trong runtime; source cards có **Mummy**, **Skeleton Mummy**, **Skeleton Scientist** (bình thuốc xanh), **Skeletal Shaman**.

| Nghề | Tier | Từ | Ra | Marker | Màu nhấn |
|---|---|---|---|---|---|
| Bandaged Hexer / Kẻ Nguyền Băng Vải | 3 | Soul Medium | Mummy Lord | **băng vải quấn** toàn thân, lủng lẳng, bùa ghim trên băng | vàng lanh cũ `#C9B27A`, không glow |
| Mummy Lord / Chúa Mộ Vải | 4 | Bandaged Hexer | terminal | quan tài đeo lưng mở nắp, băng vải bay thành roi | vàng lanh + xanh tử linh ở mắt |
| Bone Alchemist / Luyện Kim Sư Xương | 2 | Bone Tinkerer | Plague Doctor (T3, terminal) | **đai lọ thủy tinh** quanh hông, kính một mắt phóng đại | lục độc `#8FD14F` chỉ trong lọ |
| Plague Doctor / Bác Sĩ Dịch Hạch | 3 | Bone Alchemist | terminal | **mặt nạ mỏ chim** + áo khoác da dài | lục độc ở khói |

Hexer cho Soul Medium lối ra thứ hai (hiện chỉ → Soul Weaver). Alchemist cho Tinkerer lối ra thứ hai ở T1→T2 và cho Craft một nhánh không phải máy móc; đòn ném lọ dùng lại anim `throw`/`throw_aim` đã có.

### 6.5. Nghề ẩn theo Body Evolution
`docs/01` mục 8 ghi "job hidden có tiền nhiệm độc nhất"; `docs/02` mục 7 định nghĩa Crystal Bone, Dragonbone, Mechanical Bone nhưng không gắn gameplay. Vì pipeline dùng chung một thân xương trần, chỗ hợp lý nhất để **đổi vật liệu xương** là vài nghề ẩn cuối nhánh, mở bằng vật phẩm hoặc điều kiện ẩn thay vì Trial:

| Nghề ẩn | Từ | Vật liệu xương | Marker |
|---|---|---|---|
| Dragonbone Warlord | Grave Marauder hoặc Abyss Sovereign | Dragonbone | sừng xương mọc từ sọ, vảy xương trên vai |
| Crystal Lich | Lich | Crystal Bone | sọ trong suốt thấy bình phách qua thủy tinh |
| Clockwork Skeleton | Bone Architect | Mechanical Bone | khớp bánh răng, một bên sọ là kim loại |

Mỗi nghề ẩn cần sheet thân riêng (không overlay được), nên chỉ nên làm 1 cái đầu tiên để đo chi phí.

### 6.6. Hybrid giữa nhánh chưa khai thác
Hiện có 2 điểm hội tụ (Grave Marauder, Soul Weaver) và 1 lai Combat–Death (Dread Knight). Các cặp còn trống, mỗi cặp một gợi ý:
- Engineer + Necromancer → **Golemancer** (construct có hồn, summon kiểu `turret` biết đi).
- Skeleton Archer + Bone Acolyte → **Soul Archer** (tên linh hồn; skill thuộc hạ `bone_archer` đã có sẵn làm nguyên mẫu).
- Bone Rogue + Bone Tinkerer → **Saboteur** (bẫy + đánh lén; một phần đã nằm ở Grave Bandit).

### 6.7. Thứ tự đề xuất
1. **Elemental** (6.1): tận dụng 20 skill và hệ affinity đang không dùng; rẻ về code, mở hai màu mới cho art.
2. **Beast** (6.2): đã có art mẫu, sửa luôn nhánh Hunter yếu và vấn đề Abyss Sovereign; đắt về anim.
3. **Martial** (6.3): độc nhất cho skeleton, không cần overlay vũ khí nhưng cần bộ đòn thường mới.
4. Curse/Alchemy (6.4), nghề ẩn (6.5), hybrid (6.6): sau playtest.

Mọi nghề mới phải qua đúng luật V12: gate 2 skill Tier n−1 mới so với mọi tiền nhiệm, Mastery, Trial, exclusive cấp qua Trial, và marker không trùng bảng mục 2 của `docs/12`.

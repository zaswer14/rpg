# Skeleton Tier 0 — Skills, Stats & Tier 1 Gates (V8)

> **Tài liệu cập nhật V8.** Thay thế đặc tả cộng 3 điểm chỉ số thủ công và sử dụng cung ở Tier 0 trong V7. Đọc thêm `06_Skill_Ranks_Level_And_Tier_Gates.md` để biết luật rank, Level, thưởng và lưu game.

## Nhân vật gốc

- Tier 0 có một nghề: **Skeleton Wanderer**. Không tạo thêm nghề Tier 0 cho từng loại vũ khí.
- Nền sáu chỉ số STR/DEX/VIT/INT/WIL/AGI đều là **5** trong demo Skeleton; chủng tộc tương lai có thể có `baseStats` khác.
- **Không cộng stat theo Level; không có 3 điểm tự chọn**. Stat tăng từ thưởng rank của skill, vật phẩm và những nguồn riêng biệt khác được thiết kế sau.
- Skill đạt bậc 5 tăng **Level +1** và thưởng vĩnh viễn tùy skill; một số chiêu mạnh thưởng ít từ bậc 3. Thưởng còn hiệu lực khi skill không lắp.
- Mở Loadout: **1 Active + 1 Passive** ở Tier 0. Đòn thường, Jump, Dodge là hành động nền.

## Năm nhánh Tier 1 và bộ chiêu cơ bản

| Nhánh | Skill Tier 0 phải rank 5 | Combo nhập môn | Trọng tâm stat reward |
|---|---|---|---|
| Bone Fighter | Cracked Slash + Brace | Normal Sword → Cracked Slash → Guard | STR +1, VIT +1 |
| Skeleton Archer | **Stone Throw + Aimed Stone** | Ném cơ bản → di chuyển → ném ngắm kỹ | DEX +3 tổng (Aimed Stone thưởng từ rank 3) |
| Bone Rogue | Needle Stab + Bone Dash | Normal Dagger → Needle Stab → lướt | DEX +1, AGI +1 |
| Bone Acolyte | Worn Focus Pulse + Shade Mote | Normal Cast → phép sơ cấp; cần đổi skill do chỉ có 1 slot | INT +1, WIL +1 |
| Bone Tinkerer | Junk Snare + Scavenger Eye | Đặt bẫy → dụ quái / thu thập | INT +1, DEX +1 |

Hai skill bắt buộc phải đạt 5/5 **không đồng nghĩa cùng được equip** ở T0. Chuyển nghề còn yêu cầu đủ Mastery và Trial. Người chơi có thể luyện chéo các nhánh trước khi quyết định.

## Bộ chiêu Tier 0

- **Kỹ thuật tấn công gần:** Cracked Slash, Rising Chip (kiếm); Needle Stab (dao găm); Cracked Axe Slam (rìu); Spear Jab (thương); Shield Nudge (khiên).
- **Kỹ thuật xa thuần vật lý:** Stone Throw (ném một hòn đá), Aimed Stone (ngắm và ném đá chính xác); Loose Bone Toss là ném mảnh xương thay thế. **T0 không cần trang bị cung, không bắn tên.**
- **Cơ động & phòng thủ:** Bone Dash, Bone Leap, Brace, Quick Recovery, Bone Dive, Balanced Frame, Light Bones, Ragged Persistence, First Footfall.
- **Tiện ích / chế tạo:** Scavenger Eye, Quiet Tread, Junk Snare, Wanderer Improvisation (độc quyền nghề Wanderer).
- **Hồi phục:** Field Mend.
- **Pháp nhập môn:** Worn Focus Pulse (phép trung tính), Flicker Ember (Lửa), Water Drop / Water Veil (Nước), Frost Fleck (Băng), Static Snap (Sét), Wind Puff (Gió), Pebble Knock (Đất phép), Pale Glimmer (Ánh sáng), Shade Mote (Bóng tối), Sprout Grasp (Tự nhiên).

**Lưu ý hai skill liên quan đá:** `Stone Throw` và `Aimed Stone` là ném đá vật lý trung tính, không phải phép hệ Đất. `Pebble Knock` vẫn là phép thuật hệ Đất tạo đạn đá. Các nhóm `SkillRole`, `DamageMethod` và `ElementId` không bị trộn lẫn.

## Chỉ số và công thức thử

- `Level = COUNT(rank(skill) == 5)` — không cộng stat vì Level tăng.
- `CoreStats = RaceBaseStats + Σ RankReward(skill) + EquipmentBonus + OtherPermanentSources`.
- Demo: `HP = 60 + 8 × VIT`; `Stamina = 60 + 4 × VIT + 3 × AGI`; `Mana = 25 + 5 × WIL + 2 × INT`; `Physical Power = 10 + 1.5 × STR`; `Magic Power = 8 + 1.6 × INT`.
- Element Affinity ban đầu bằng 0; 9 hệ Lửa, Nước, Băng, Sét, Gió, Đất, Ánh sáng, Bóng tối, Tự nhiên có phép nhập môn. Neutral không phải một hệ phép bắt buộc phải chuyên.
- Kỹ năng có thể học không giới hạn bằng số slot Loadout; rank tối đa luôn 5.

## Phần chưa khóa cân bằng

Bộ thưởng chỉ số đang để ví dụ dễ kiểm thử; cách kiếm điểm luyện bậc chưa được định nghĩa. Phần ném đá không thay thế các kỹ thuật cung/nỏ ở **Tier 1+**. Mastery Tier 1 Skeleton Archer đã dùng Throwing 10; Bow Mastery chỉ áp dụng từ Tier 1 trở đi; xem tài liệu 06.

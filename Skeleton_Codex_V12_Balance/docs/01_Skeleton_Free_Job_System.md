# SKELETON — TIERED JOB EVOLUTION SYSTEM
**Specification V4 | 2026-10-12 | Mô hình mới theo yêu cầu**

## 0. Những điểm đã thống nhất
- **Quy tắc được chốt:** không thể quay lại Job trước, chuyển nghề là vĩnh viễn. Terminal là điểm dừng chuyển nghề thật sự.
- Game thiết kế cho **2D side-scrolling action platformer**, có combo và nhịp đòn khác nhau theo nghề.
- Skeleton bắt đầu với **Tier 0**, sau đó chuyển nghề qua các Tier cao hơn.
- Một nghề có thể có **nhiều nhánh chuyển nghề**, **đúng một nhánh**, hoặc **không có chuyển nghề nào** (Terminal / đường cụt).
- **Nghề cùng Tier có thể có độ mạnh khác nhau.** Tier không phải thang sức mạnh tuyệt đối.
- Mastery, kỹ năng, thử thách là điều kiện thăng nghề; không thể bỏ qua cạnh tiền nhiệm chỉ vì đủ Mastery.
- Vẫn tách Job / cơ thể / nguyên tố / trang bị / trait. Định hướng mỹ thuật đồ rách nát → hoàn chỉnh giữ nguyên.

## 1. Cấu trúc nhân vật
```text
SkeletonUnit
├─ CharacterLevel, Attributes, MasteryProgress, LearnedSkills
├─ CurrentJobId
├─ UnlockedJobIds
├─ JobHistory (theo các cạnh chuyển nghề)
├─ CompletedTrials, Achievements, Resources
├─ BodyEvolution, ElementalVariant, Traits
└─ Equipment, EquipmentVisualStage
```

## 2. Từ Tier 0 tới Tier 5 (đề xuất)
| Tier | Tên | Mục đích |
|---|---|---|
| 0 | Origin | Skeleton chưa có nghề, có nhiều hướng lựa chọn |
| 1 | Common | Nghề nhập môn như Fighter, Archer, Acolyte |
| 2 | Specialist | Nghề rõ vai trò, bắt đầu độc đạo hoặc phân nhánh |
| 3 | Advanced | Xuất hiện nghề mạnh, nghề lai và terminal sớm |
| 4 | Ascendant | Nghề ưu tú, có thể terminal hoặc lên tiếp |
| 5 | Mythic | Rất hiếm, đa số terminal |

**Đã chốt:** có Tier 0 và các Tier cao hơn. **Chưa chốt:** chính xác tổng số Tier, tên Tier và giới hạn sức mạnh.

## 3. Job evolution là directed graph
Mỗi `JobDefinition` có `id, tier, role, powerGrade, rarity, prerequisites, unlockRequirements, trial, nextJobs`.

**Các kiểu đường:**
- Branching: `nextJobs` có nhiều hơn một phần tử.
- Linear: `nextJobs` đúng một phần tử.
- Terminal: `nextJobs` rỗng. Nhân vật không thể thăng tiếp theo nhánh đó.
- Converging: nhiều nghề tiền nhiệm cùng mở khóa một nghề (ví dụ Grave Marauder có thể đến từ Bone Raider hoặc Grave Bandit).

**Ví dụ:**
```text
Skeleton Wanderer (Tier 0)
├─ Bone Fighter (Tier 1)
│  ├─ Bone Guard (Tier 2)
│  │  ├─ Bone Phalanx (Tier 3) → Legion Marshal (Tier 4) [TERMINAL]
│  │  └─ Dread Knight (Tier 3) → Death Knight (Tier 4) → Abyss Sovereign (Tier 5) [TERMINAL]
│  ├─ Bone Duelist (Tier 2) → Sword Wraith (Tier 3) [TERMINAL]
│  └─ Bone Raider (Tier 2) → Grave Marauder (Tier 3) [TERMINAL]
├─ Skeleton Archer (Tier 1)
│  ├─ Bone Marksman (Tier 2) → Phantom Sniper (Tier 3) → Eternal Huntsman (Tier 4) [TERMINAL]
│  └─ Grave Hunter (Tier 2) → Wild Hunt Captain (Tier 3) [TERMINAL]
├─ Bone Rogue (Tier 1)
│  ├─ Grave Assassin (Tier 2) → Soul Assassin (Tier 3) → Death Whisper (Tier 4) [TERMINAL]
│  │                             └─ Shade Stalker (Tier 3) [TERMINAL]  (nhánh từ Grave Assassin)
│  └─ Grave Bandit (Tier 2) → Grave Marauder (Tier 3) [TERMINAL]
├─ Bone Acolyte (Tier 1)
│  ├─ Necromancer (Tier 2) → Grand Necromancer (Tier 3) → Lich King (Tier 4) → Death Sovereign (Tier 5) [TERMINAL]
│  │                       └─ Soul Weaver (Tier 3) [TERMINAL] (nhánh từ Necromancer)
│  └─ Soul Medium (Tier 2) → Soul Weaver (Tier 3) [TERMINAL]
└─ Bone Tinkerer (Tier 1) → Bone Engineer (Tier 2) → Bone Tinkerer Prime (Tier 3) → Bone Architect (Tier 4) [TERMINAL]
```

## 4. Tier, Power, Rarity và visual là 4 trục khác nhau
- **Tier:** vị trí/độ sâu thăng nghề, không phải sát thương.
- **Power Grade (D/C/B/A/S):** đánh giá sức mạnh/tầm ảnh hưởng trong cùng Tier, có phụ thuộc hoàn cảnh.
- **Rarity:** độ khó để mở khóa, không đảm bảo mạnh tuyệt đối.
- **Equipment Visual Stage I–V:** mức hoàn thiện trang bị, không gắn cứng với Tier.

**So sánh cùng Tier 3 (đề xuất):**
| Job | Power | Vai trò | Hướng phát triển |
|---|---|---|---|
| Bone Phalanx | B | Formation tank | Chỉ tới Legion Marshal |
| Grave Marauder | A | Solo raider | Terminal |
| Sword Wraith | S | Duelist cực mạnh, yếu trước khống chế diện rộng | Terminal |
| Bone Tinkerer Prime | C | Công trình hỗ trợ | Chỉ tới Bone Architect |

Một terminal ở Tier 3 có thể rất mạnh về niche, đổi lại mất cơ hội thăng lên nghề khác trong chính nhánh đó. **Không nhất thiết mọi Tier 5 đều thắng mọi Tier 3.**

## 5. Quy tắc chuyển nghề
1. Kiểm tra Job hiện tại có liên kết trực tiếp tới Job mục tiêu không.
2. Kiểm tra Tier hợp lệ (mặc định Tier mục tiêu cao hơn một; ngoại lệ phải định nghĩa riêng).
3. Kiểm tra Mastery, Attribute, kỹ năng, trial, vật phẩm, trạng thái cơ thể và điều kiện bối cảnh.
4. Chi trả tài nguyên, mở khóa Job, ghi vào JobHistory.
5. Giữ Mastery đã học; trang bị và kỹ năng bị ràng buộc theo nghề đang kích hoạt.

**Đã chốt:** chuyển nghề là lựa chọn vĩnh viễn. Không quay lại nghề đã mở, không reset về nghề cũ. Terminal chặn toàn bộ chuyển nghề tiếp theo.

## 6. Mastery & build
Các nhóm: Combat (Sword/Axe/Spear/Shield); Ranged (Bow/Crossbow/Firearm); Stealth (Stealth/Dagger/Trap); Magic (Fire/Frost/Lightning/Arcane); Death (Necromancy/Soul/Curse); Beast (Riding/Taming); Craft (Engineering/Alchemy/Construct); Martial (Unarmed/Body/Spirit).

Giá trị Mastery 0–100, giới hạn 1 Main + 1 Sub, 4 Active + 3 Passive + 1 Ultimate chỉ là đề xuất. Mastery không tự tạo Job.

## 7. Data-driven Unity specification
```csharp
public enum JobPathType { Branch, Linear, Terminal }
public enum JobPowerGrade { D, C, B, A, S }

// Dữ liệu minh họa, chưa phải code production.
[System.Serializable]
public class JobDefinitionData {
    public string jobId;
    public int tier;
    public JobPowerGrade powerGrade;
    public string[] prerequisiteJobIds;
    public string[] nextJobIds;
    public string[] masteryRequirementIds;
    public string[] requiredTrialIds;
}
```
`prerequisiteJobIds` nên biểu diễn **OR** cho nhiều lối vào, còn trong mỗi lối vào có thể có các yêu cầu AND riêng. Khi cần route phụ phức tạp, thay chuỗi ID bằng `JobUnlockRoute[]`. Kiểm tra tính hợp lệ của graph: ID không trùng, liên kết hai chiều khớp, không vòng lặp ngoài chủ đích, Tier không nhảy trái quy tắc.

## 8. Sức mạnh và cân bằng
- Terminal có thể mạnh sớm, nhưng hẹp vai trò và không có upgrade job khác trực tiếp.
- Nghề Power cao cần đánh đổi: yêu cầu mở khóa cao, hạn chế trang bị, phụ thuộc đội hình hoặc điểm yếu chiến thuật.
- Tránh dùng Power Grade làm chỉ số cộng sức mạnh tuyến tính; phải gắn với bối cảnh chiến đấu.
- Để phát triển phong phú, cho phép các nhánh hội tụ, các nhánh có độ dài khác nhau và job hidden có tiền nhiệm độc nhất.

## 9. Trạng thái tài liệu
**Đã chốt:** Tier 0, chuyển nghề theo Tier, đường phân nhánh/độc đạo/terminal, Power khác nhau cùng Tier. **Đề xuất:** số Tier, tất cả tên nghề, các cạnh, điều kiện, grade và số kỹ năng chi tiết; cần duyệt và balance sau. Quy tắc không quay lại nghề đã chốt.

Xem `index.html` để trải nghiệm đồ thị và simulator tương tác. Xem `02_Skeleton_Character_Art_Style_Guide.md` để tạo art nhất quán.


## V4 — Combat system cho 2D platformer (đã đề xuất)
### Chuyển nghề một chiều
- Chỉ được tiến từ `CurrentJobId` sang một trong `nextJobs` hợp lệ, sau khi đáp ứng Mastery, Trial, item, điều kiện đặc biệt.
- Khi chọn chuyển nghề: xác nhận cảnh báo, ghi `JobHistory`, thay `CurrentJobId`; nghề cũ không thể kích hoạt lại. Không có reset hay chuyển ngang nhánh.
- Job `terminal` không có `nextJobs` và chấm dứt lộ trình chuyển nghề; vẫn tăng Level, Mastery, Skill và nâng trang bị.

### Sáu primary attributes
- STR: cường độ đòn vật lý và phá giáp; DEX: chính xác, kỹ thuật nhanh; VIT: máu/poise; INT: phép/summon/kỹ thuật; WIL: năng lượng/kháng khống chế; AGI: cơ động/air control.
- Derived combat stats: MaxHP, Armor, MagicResist, PhysicalPower, MagicPower, CritChance, Poise, ArmorBreak, StatusPower, MaxStamina, MaxMana/Soul, MoveSpeed, JumpHeight, DashDistance, AttackStartup, AttackRecovery, CooldownRate.
- Số mẫu thử: `HP = BaseHP + 8 * VIT`, `PhysicalPower = WeaponPower + 1.5 * STR`, `MagicPower = FocusPower + 1.6 * INT`; chưa cân bằng.

### Attack cadence không đồng bộ
- Mỗi Job có `NormalAttackDefinition` riêng với `Startup/Active/Recovery`, hitbox, hitstop, stagger, cancel windows, aerial attacks.
- Đòn nặng: khoảng 0.75–1.15s/chu kỳ; kiếm/dao nhanh: khoảng 0.25–0.5s; cung, phép và công cụ dùng draw/cast/deploy riêng. Chỉ là target prototype.
- Không để DEX/AttackSpeed nhân đồng đều lên mọi động tác.

### Skill kit khuyến nghị
- 1 Normal Attack (chuỗi thường 2–4 hit).
- 3 Active Skills.
- 1 Signature/Ultimate.
- 1 Dodge/Mobility; Jump là thao tác platformer chung.
- 2 Passive Slots.
- Tổng cộng 6 hành động combat truy cập nhanh, không kể Jump/Move/Interact và passives.
- Tier 0 nhận normal/dodge và utility; T1 mở kỹ năng đầu; T2 đủ active; T3 mở Signature; T4–T5 ưu tiên biến đổi cơ chế, không tăng mãi số nút.

### Combo
- Dùng state-machine + input buffer + cancel windows + hit-confirm + resource cost.
- Combo ví dụ: Sword Wraith: Normal1 → Normal2 → Dash Slash → Air Launch → Air Normal → Finisher.
- Death Knight: Heavy Slash → Timed Guard Counter → Soul Uppercut → Falling Slash.
- Phantom Sniper: Mark → Charged Arrow → Backstep → Piercing Shot.
- Necromancer: Summon → Soul Bolt → Bind → Command Strike.
- Bone Architect: Wall → Turret → Lure → Trap.
- Boss cần kháng launch, chống khóa liên tục, có combo scaling và stagger thresholds.

### Mô tả từng nghề
Tài liệu web có mô tả gameplay riêng cho toàn bộ Job mẫu trong Job Codex, kèm vai trò, Tier, Grade, tiền nhiệm, tiếp nối và Trial. Đây là mô tả định hướng gameplay cần prototype trước khi cân bằng.

## Phụ lục: mô tả nghề (34 nghề mẫu)

- **Wanderer:** Bộ xương vừa thức tỉnh, cầm vũ khí nhặt được. Đòn vung đơn giản, chưa có thế mạnh; đây là điểm rẽ quyết định toàn bộ đường nghề.
- **Bone Fighter:** Chiến binh xương dùng kiếm thô; đòn ba nhịp cân bằng, dễ học và có thể chọn thủ, đấu kiếm hoặc cướp phá.
- **Skeleton Archer:** Cung thủ cơ bản, cần kéo dây và quản lý khoảng cách. Bắn trên không được nhưng giảm độ chính xác.
- **Bone Rogue:** Đột kích nhanh với dao ngắn; tiếp cận bằng lướt thấp, dễ nối đòn nhưng ít poise.
- **Bone Acolyte:** Tập sự tử thuật dùng đạn linh hồn chậm, có hỗ trợ yếu và bắt đầu học điều khiển tử linh.
- **Bone Tinkerer:** Thợ xương đặt bẫy nhỏ và sửa công cụ; đòn đánh bằng cờ-lê chậm, sát thương thấp nhưng có utility.
- **Bone Guard:** Lính khiên chuyên phòng thủ; đòn thường chậm và ngắn nhưng có block/counter, hạn chế bị đẩy lùi.
- **Bone Duelist:** Kiếm sĩ thiên đánh đơn mục tiêu; nhát chém nhanh, có bước tiến, thưởng sát thương khi phản đòn chính xác.
- **Bone Raider:** Chiến binh rìu thiên tấn công lao tới; vung rộng, recovery lâu, đổi sự an toàn lấy phá giáp.
- **Bone Marksman:** Xạ thủ chuyên kéo cung chính xác; bắn chậm hơn Archer nhưng tên mạnh, áp lực điểm yếu tốt.
- **Grave Hunter:** Thợ săn đặt bẫy và đánh dấu mục tiêu, thích hợp đi cảnh nhiều địa hình và truy đuổi quái nhanh.
- **Grave Assassin:** Sát thủ dùng dao đôi và dịch chuyển ngắn; đánh nhanh, mạnh khi từ phía sau, yếu trước giáp dày.
- **Grave Bandit:** Kẻ cướp hầm mộ lấy chiến lợi phẩm, ném vật dụng và tấn công từ góc thấp; thiên về utility.
- **Necromancer:** Triệu hồi lính xương hỗ trợ; đòn thường phép yếu, mạnh nhờ sắp xếp vị trí và gây áp lực từ xa.
- **Soul Medium:** Thầy đồng linh hồn dựng kết giới hỗ trợ, hồi Soul Energy và làm suy yếu quái trước mặt.
- **Bone Engineer:** Kỹ sư triển khai tháp bắn thô, đánh bằng công cụ; cần thời gian chuẩn bị trước khi giao chiến.
- **Bone Phalanx:** Lính thương khiên giỏi giữ tuyến, combo đâm chậm nhưng tầm xa; có thể dựng thế đứng bất động.
- **Dread Knight:** Kỵ sĩ hắc ám vung kiếm nặng và áp sát; đánh chậm, poise cao, dùng tử thuật duy trì áp lực.
- **Sword Wraith:** Kiếm hồn vô cùng nhanh, chuyên solo và phản đòn; Terminal Tier 3: mạnh sớm nhưng không tiến nghề nữa.
- **Grave Marauder:** Kẻ cướp phá hầm mộ dùng rìu, đòn rộng và dồn sát thương mạnh; Terminal Tier 3, phòng thủ yếu.
- **Phantom Sniper:** Bắn tỉa linh thể, nạp lâu nhưng đường đạn xuyên mục tiêu; yêu cầu đặt vị trí tốt.
- **Wild Hunt Captain:** Thủ lĩnh săn dùng bẫy, hiệu lệnh thú và đòn bắn hỗ trợ; Terminal Tier 3, mạnh về chiến thuật.
- **Soul Assassin:** Dao găm trích linh hồn từ combo trúng đích; càng nối chuỗi chuẩn càng áp lực, dễ bị ngắt khi hụt.
- **Shade Stalker:** Bóng ma săn đuổi bằng né, leo và tàng hình ngắn; Terminal Tier 3, giá trị cơ động cao hơn DPS.
- **Grand Necromancer:** Triệu hồi đội hình lớn hơn và hoán đổi vị trí với thuộc hạ, phù hợp kiểm soát màn chơi.
- **Soul Weaver:** Dệt kết giới và liên kết hồi phục; Terminal Tier 3, hỗ trợ đa mục tiêu nhưng solo yếu.
- **Bone Tinkerer Prime:** Kỹ thuật viên chuyên cường hóa thiết bị; giảm thời gian triển khai, kết hợp trap và turret.
- **Legion Marshal:** Chỉ huy đội hình khiên thương, giữ tuyến cực tốt; Terminal Tier 4, kém linh hoạt khi không có đồng minh.
- **Death Knight:** Kỵ sĩ tử linh hạng nặng; nhát kiếm uy lực, phản đòn bằng giáp linh hồn và chuỗi chém kết liễu.
- **Eternal Huntsman:** Thợ săn huyền thoại tạo dấu ấn xuyên màn; Terminal Tier 4, cực mạnh khi biết trước địa hình.
- **Death Whisper:** Sát thủ cấp cao dùng combo chớp nhoáng, thoát thân sau đòn cuối; Terminal Tier 4, chống chịu thấp.
- **Lich King:** Thống lĩnh tử linh, biến xác định vị trí summon thành bài toán chiến thuật, bản thân di chuyển chậm.
- **Bone Architect:** Xây tường xương, đặt trụ và cỗ máy hỗ trợ; Terminal Tier 4, hiệu quả cao khi chuẩn bị chiến trường.
- **Abyss Sovereign:** Chiến binh vực sâu, giáp cực mạnh, chém chậm nhưng áp đảo vùng gần bằng sóng xung kích.
- **Death Sovereign:** Chúa tể tử thuật điều khiển nhiều thực thể, tạo vùng chiến đấu và tung tuyệt kỹ linh hồn.

## PHỤ LỤC V5 — Skill Library & Loadout (2026-10-13)

Skill **không bị giới hạn số lượng theo từng Job hoặc Tier**. Một Tier có thể chứa nhiều skill và mỗi Job có thể học bất kỳ số lượng skill nào đủ điều kiện. Tách `GlobalSkillCodex`, `AvailableSkills`, `LearnedSkills`, `UsableSkills` và `EquippedLoadout`.

Skill có `Universal`, `Restricted`, `JobExclusive`, `Lineage` (đề xuất). Job Exclusive không tự động giữ quyền sử dụng khi chuyển nghề, nhưng skill đã học không mất; Lineage có thể theo tuyến tiến hóa đã thật sự đi qua. Duy trì đề xuất loadout 3 Active + 1 Signature + 2 Passive, ngoài ra Normal Attack, Jump/Dodge là hành động nền; **đây chỉ là số slot lắp, không phải tổng số skill học được**. Xem tài liệu chi tiết `03_Skill_Library_And_Loadout_System.md` và demo trong `index.html`.

Các con số mô hình skill trong mục 6 và V4 Combat ở trên là các đề xuất lịch sử; **V5 bổ sung nguyên tắc không giới hạn tổng skill** và mô hình trang bị skill mới khi xuất hiện mâu thuẫn.

# SKELETON CODEX — SKILL LIBRARY & LOADOUT SYSTEM
**Specification V5 · 2026-10-13 · 2D action platformer**

## 0. Quy tắc cốt lõi

**Quy tắc theo yêu cầu (được bổ sung vào V4):**

1. **Mỗi Tier có thể có nhiều skill** thuộc nhiều nhóm và nhiều nghề khác nhau; Tier không tương đương một danh sách skill cố định.
2. **Một Job không bị giới hạn tổng số skill có thể học.** Hệ thống liên tục mở rộng Skill Codex; một nhân vật học số lượng lớn skill phù hợp theo quá trình chơi.
3. Skill có ít nhất 4 cơ chế quyền sử dụng: **Universal**, **Restricted**, **Job Exclusive** và **Lineage** (kiểu kế thừa theo nhánh; là đề xuất mở rộng).
4. **Giới hạn số lượng skill trang bị (Equip/Loadout)** khác với tổng số skill trong game, skill đủ điều kiện học, hoặc đã học.
5. Chuyển nghề **vĩnh viễn, không quay lại nghề cũ**. LearnedSkills không bị xóa khi chuyển nghề, nhưng có thể bị khóa sử dụng do không còn đúng điều kiện Job/Weapon/Mastery; chỉ những kỹ thuật được cho phép kế thừa mới dùng ở nghề hậu duệ.
6. Giữ nhịp combat platformer: Skill có startup/active/recovery, cancel windows, hitbox, aerial usage, resource cost, cooldown và combo tags; **không ép mọi nghề đánh nhanh như nhau**.

## 1. Bốn tập skill cần tách biệt

```text
Global Skill Codex               — Toàn bộ định nghĩa skill trong game
     ↓ kiểm tra minTier, nghề, mastery, weapon, unlock source
Character Available Skill Pool    — Skill đang đủ điều kiện để mở/học
     ↓ học từ nguồn hợp lệ, chi trả hoặc đạt trial
Character Learned Skills         — Skill đã sở hữu vĩnh viễn theo nhân vật
     ↓ kiểm tra điều kiện SỬ DỤNG ở thời điểm lắp
Equipped Skill Loadout            — Bộ skill hiện được gán vào những slot ít ỏi
```

`Available` không nhất thiết đã `Learned`. `Learned` không nhất thiết `Usable` trong Job hiện tại. `Usable` không nhất thiết đang `Equipped`. Trong UI cần hiển thị từng trạng thái và nguyên nhân bị khóa.

**Hai tầng điều kiện tách biệt:** `CanLearn(skill, character)` và `CanEquip(skill, character)`. Có thể cho phép học bí kíp chưa đủ điều kiện sử dụng, nếu đó là thiết kế của drop/quest; mặc định V5 yêu cầu điều kiện học hợp lệ. Ngay cả skill đã lắp cũng cần `CanActivate` trước mỗi lần dùng (trạng thái combat, mana/stamina, cooldown, air/ground, stunned v.v.).

## 2. Quyền truy cập theo nghề

| Access Mode | Kiểm tra nghề | Ví dụ |
|---|---|---|
| **Universal** | Không kiểm tra JobId; vẫn có thể yêu cầu tier, vũ khí, Mastery | Bone Dash, Bone Leap, Balanced Frame |
| **Restricted** | `allowedJobIds`, `allowedDomains`, `allowedMastery` hoặc nhiều điều kiện cụ thể | Shield Tap, Aimed Shot, Soul Bind |
| **Job Exclusive** | `CurrentJobId == exclusiveJobId`, **không tự kế thừa** | Shield Oath (Bone Guard), Phantom Blade (Sword Wraith) |
| **Lineage** *(đề xuất)* | CurrentJob là nghề gốc hoặc nghề hậu duệ; **JobHistory phải thật sự đi qua tuyến** | Guardian Pulse (nhánh Bone Guard) |

Không dùng mô hình "mỗi Job có một danh sách 4 skill cố định". Job có thể *cấp* một số skill lúc chuyển nghề, nhưng học thêm phải mở rộng được. `JobSkillOfferList` chỉ là các kỹ năng khuyến nghị / bán / thưởng, **không phải giới hạn học**.

**Lưu ý chuyển nghề:** Bone Guard (T2) có thể học Shield Oath; khi thành Dread Knight (T3), kỹ năng vẫn có trong LearnedSkills nhưng không dùng được vì nó là Exclusive. Guardian Pulse là Lineage thì vẫn lắp được nếu đã thật sự đi qua Bone Guard. Không được cho nghề bất kỳ "đổi về Bone Guard" để dùng skill.

## 3. Tier của skill và Tier của nghề

- `skill.requiredTier` là **Tier tối thiểu**, không phải Tier chỉ được sử dụng đúng một lần.
- Tier hiện tại của nhân vật do `CurrentJob.Tier` quyết định trong bản đề xuất. Skill Tier thấp vẫn dùng được ở Tier cao nếu điều kiện khác thỏa.
- Một Tier có thể mở **nhiều skill khác loại**, bao gồm nhiều skill cùng một lĩnh vực hoặc cùng một Job.
- Tier cao không phải lúc nào cũng có DPS cao hơn; utility cơ động Tier 0 có thể giữ giá trị tới Tier 5.
- Skill Tier mới nên tạo ra **cơ chế/chiến thuật mới**, không chỉ cộng thêm hệ số damage.

### Nguồn học (đề xuất)

`jobReward`, `masteryMilestone`, `skillTrainer`, `worldDrop`, `quest`, `bossTrial`, `secretRoom`, `crafting`, `event`. Nguồn học và điều kiện học là **hai trường độc lập**: tìm được sách chưa có nghĩa đã đủ điều kiện dùng.

## 4. Skill loadout và hành động nền

### Slot lắp đề xuất (không phải giới hạn tổng skill)

| Hành động | Số slot | Ghi chú |
|---|---:|---|
| **Active** | 3 | Phần lớn kỹ năng có cooldown, chi phí, combo/cancel |
| **Signature / Ultimate** | 1 | Thường từ Tier 3; không phải nghề nào cũng cùng nhịp |
| **Passive** | 2 | Buff/biến thể cơ chế; có thể cho unlock slot theo tiến trình |
| **Normal Attack** | 1 action mặc định | Định nghĩa từ Job/Weapon AttackSet, không chiếm skill slot |
| **Jump, Dodge, Interact** | Hành động nền | Không chiếm skill slot; skill cơ động nâng cao có thể chiếm Active |

Mục tiêu là **6 slot skill (3+1+2)**; trong đó **4 nút Active/Signature** là các nút skill chiến đấu, còn 2 Passive không cần nút. Do Normal, Dodge là thao tác riêng, tổng số action chiến đấu nhanh thường là 1 Normal + 1 Dodge + 3 Active + 1 Signature = 6 (không tính Jump). Tier 0 có thể chưa mở Signature và một số slot tùy progression; **tổng số skill học được không bị chặn**.

Gợi ý unlock hotbar (cần duyệt): T0 có 1 Active + 1 Passive, T1 có 2 Active + 1 Passive, T2 có đủ 3 Active + 2 Passive, T3 có Signature. Tuy nhiên để test V5 web hiện cho sẵn khung 3+1+2 và chỉ khóa skill Signature bằng Tier. Khi triển khai game, thêm `UnlockedSlotCount` để UI mở dần.

**Loadout preset:** nhân vật có thể lưu 2–3 bộ lắp cho địa hình/boss/solo khác nhau; số preset không ảnh hưởng số slot có thể hoạt động đồng thời. Đổi loadout chỉ ở hub/checkpoint hoặc ngoài combat (đề xuất) để tránh exploit đổi skill né hồi chiêu.

## 5. Ví dụ: hai Bone Guard Tier 2 có build khác nhau

Cả hai nhân vật có cùng `CurrentJob = Bone Guard`, `Tier = 2`, và có thể đã học hàng chục skill khác nhau.

| Slot | Build A: Thủ / counter | Build B: Cơ động / solo |
|---|---|---|
| Active 1 | Shield Oath [Exclusive] | Bone Dash [Universal] |
| Active 2 | Guard Counter [Restricted] | Sword Cleave [Restricted] |
| Active 3 | Brace [Universal] | Guard Counter [Restricted] |
| Passive 1 | Iron Memory [Restricted] | Balanced Frame [Universal] |
| Passive 2 | Guardian Pulse [Lineage] | Light Bones [Universal] |
| Signature | Chưa mở Tier 3 | Chưa mở Tier 3 |

Combo thử nghiệm: **Build A** `Brace → Guard Counter → Shield Oath` (defensive timing). **Build B** `Normal 1 → Normal 2 → Sword Cleave → Bone Dash` (pressure/mobility). Quy tắc cancel phải định nghĩa tại từng animation và từng skill, không suy ra chỉ từ tags.

## 6. Skill data cấu trúc Unity (thiết kế, chưa phải code production)

```csharp
public enum SkillKind { Active, Signature, Passive }
public enum SkillAccess { Universal, Restricted, JobExclusive, Lineage }

// Định nghĩa tham khảo ScriptableObject. Requirements có thể AND/OR lồng nhau.
public class SkillDefinitionData
{
    public string skillId;
    public int requiredTier;
    public SkillKind kind;
    public SkillAccess access;
    public string[] allowedJobIds;
    public string[] allowedJobDomains;
    public string exclusiveJobId;
    public string lineageOriginJobId;
    public string[] allowedWeaponTags;
    public string masteryId;
    public int requiredMastery;
    public string[] unlockSources;
    public string[] comboTags;
    public float cooldownSeconds;
    public float staminaCost;
    public float soulCost;
    // AttackTimeline, HitboxDefinition, CancelWindows, AnimationKey... tách data riêng.
}

public class CharacterSkillProgress
{
    public HashSet<string> learnedSkillIds;
    public string currentJobId;
    public List<string> jobHistory; // path thật, không chỉ tập nghề từng tồn tại
    public Dictionary<string, string> equippedSlots; // slotId -> skillId
    public string[] presetIds;
}
```

**Bất biến cần kiểm tra:**

1. Không có ID trùng hoặc skill tham chiếu Job không tồn tại.
2. `JobExclusive` có đúng một `exclusiveJobId`; `Lineage` luôn kiểm tra `JobHistory` thực tế, nhất là ở nghề có nhiều Job tiền nhiệm hội tụ.
3. Một skill không được lắp 2 slot (trừ khi có tính năng trang bị trùng chuyên biệt được thiết kế sau).
4. Skill Active không lắp vào slot Passive/Signature; số lượng slot kiểm tra từ `LoadoutCapacity`, không từ size của library.
5. Trang bị hoặc chuyển nghề khiến skill không hợp lệ: skill **vẫn Learned** nhưng **tự tháo** hoặc vô hiệu trong loadout; UI giải thích vì sao.
6. Kiểm tra quyền sử dụng ở tầng server/save/load và runtime, không chỉ dựa UI disable.
7. Cooldown đã kích hoạt phải được xử lý nhất quán khi thay preset; không thể reset miễn phí bằng tháo/lắp.
8. Kỹ năng Exclusive Tier thấp không tự biến thành kỹ năng kế thừa. Nên có cơ chế upgrade/evolution rõ ràng nếu muốn duy trì phong cách cũ ở Job sau.

## 7. Combo trong platformer

Một skill có `tags` như `Starter`, `Linker`, `Launcher`, `Air`, `Finisher`, `Counter`, `Movement`, `Setup`. Tags dùng để tìm synergy, **không được tự mặc định mọi cặp tag có thể cancel**. Runtime phải kiểm tra:

```text
InputBuffer → CharacterCombatState → CanActivateSkill
  → FrameTimeline (Startup / Active / Recovery)
  → HitConfirm / ResourceCost / Cooldown
  → CancelWindow rules → NextAction or Finish
```

Kỹ năng đã học nhưng **không lắp** không xuất hiện trong chuỗi combo thực tế, trừ trường hợp là kỹ năng bị động hoặc là đòn của Normal AttackSet. Ngoại lệ là hệ thống skill trigger tự động, nếu được định nghĩa rõ sau này.

## 8. Dung lượng kho skill và khả năng mở rộng

Số skill trong `SkillLibrary` không cần giới hạn logic. Với prototype nên thử nhiều hơn 6 slot đáng kể để người chơi có lựa chọn; **demo V5 gồm hàng chục skill minh họa ở Tier 0–5**, không phải danh sách cố định hay cam kết số lượng sản phẩm cuối.

Nên ưu tiên tạo skill theo module hành vi thay vì mỗi skill một class mới: `DashSkillAction`, `MeleeHitSkillAction`, `ProjectileSkillAction`, `SummonSkillAction`, `TrapSkillAction`, `BuffSkillAction` + `SkillModifier[]`. Combo/animation/VFX/hitbox bind từ data. Tách cấp dữ liệu khỏi combat engine và visual để sau này thêm skill không sửa mã nguồn lớn.

## 9. Trạng thái quyết định

**Được yêu cầu:** nhiều skill mỗi Tier; kỹ năng có điều kiện nghề/không nghề/độc quyền; tổng số kỹ năng học được không giới hạn cứng theo nghề; tổng học được tách khỏi số slot lắp. **Đã thống nhất từ V4:** chuyển nghề vĩnh viễn; Terminal thật sự là điểm dừng; Job, Tier và Power khác nhau; combat action platformer, combo không đồng tốc.

**Đề xuất chưa chốt:** chính xác 3 Active + 1 Signature + 2 Passive, tên skill, học miễn phí hay cần item/chi phí, mở slot theo Tier, Lineage policy, giới hạn loadout preset, số lượng kỹ năng cuối cùng và mọi con số combat. V5 web dùng mẫu để thử logic, không mặc định các con số này đã khóa thiết kế.

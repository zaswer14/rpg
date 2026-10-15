# Skeleton Codex V6 — Skill Roles, Elements & Status Effects

> **Trạng thái:** đề xuất có mô phỏng UI, chưa phải cân bằng hoặc code gameplay. Bổ sung cho V5, không thay thế Job Access / Tier / Mastery / Learned / Loadout.

## 1. Mô hình độc lập nhiều chiều

Mỗi Skill có các trường **độc lập**:

| Trường | Ý nghĩa | Ví dụ |
|---|---|---|
| `kind` | Slot trang bị | Active / Signature / Passive |
| `access` | Quyền nghề | Universal / Restricted / Job Exclusive / Lineage |
| `requiredTier` | Tier tối thiểu | Tier 1 vẫn dùng được ở Tier 4 |
| `roles[]` | **Skill làm gì?** vai trò chính ở index 0, có thể có vai trò phụ | Defense + Control |
| `method` | **Thi triển bằng gì?** | Martial / Magic / Hybrid / Tech / Innate |
| `elements[]` | Nguyên tố gắn với skill (kể cả buff/heal không damage) | [Ice] hoặc [Wind, Lightning] |
| `hits[]` | Những thành phần **gây sát thương** | {type: Physical, element: Neutral, share: 70} + {type: Magical, element: Fire, share: 30} |
| `statuses[]` | Hiệu ứng chủ động được khai báo | [Chill, Barrier] |
| `attunement?` | Điều kiện cộng hưởng **tùy chọn**, không tự động áp cho mọi skill | `{element: Fire, level: 20}` |
| `weapon`, `mastery`, `job` | Điều kiện trang bị/học từ V5 | kiếm, Sword 20, v.v. |

**Không gộp khái niệm:** Vật lý/Phép không phải một nguyên tố; Hồi phục/Phòng thủ không phải damage type; một skill hệ Lửa có thể là vật lý, phép, hybrid hay không damage; hệ Trung tính cũng có phép.

### Vai trò chính + phụ (8 nhóm)

- **Attack:** gây damage trực tiếp; physical/magic/hybrid trong hit parts.
- **Healing:** hồi HP / HoT; không tính việc hồi tư thế hoặc sửa công trình là hồi HP.
- **Defense:** guard, barrier, poise, giảm damage/knockback.
- **Mobility:** dash, blink, né bổ trợ, di chuyển trên không.
- **Control:** bind, slow, stagger, root, taunt, zone block.
- **Support:** buff, resource recovery, cleanse, đánh dấu mục tiêu, aura.
- **Summon:** triệu hồi pet/minion/trụ; không đương nhiên cùng element với chủ.
- **Utility:** tương tác môi trường, thăm dò, mở đường/bẫy phi chiến đấu.

Một skill có `roles=[Defense,Control]` vẫn **chỉ dùng 1 slot** thuộc `kind`; vai trò không quyết định slot. `method` có Martial / Magic / Hybrid / Tech / Innate; `damageType` phải được lưu trên từng `DamagePart` chứ không suy từ `method`.

## 2. Thuộc tính mở rộng cho những chủng tộc/nghề về sau

| Element ID | Tên | Thiên hướng (không bắt buộc) | Status gợi ý |
|---|---|---|---|
| `neutral` | Trung tính | không có thuộc tính nguyên tố, cả vật lý lẫn phép đều có thể | — |
| `fire` | Lửa | sát thương liên tục, áp lực theo vùng | Burn |
| `water` | Nước | hỗ trợ, hồi phục, dẫn hiệu ứng | Wet, Regen |
| `ice` | Băng | chậm, bảo vệ, sát thương dồn | Chill, Freeze có ngưỡng |
| `lightning` | Sét | nổ ngắn, stun có giới hạn | Shock |
| `wind` | Gió | di chuyển, push/pull, điều khiển projectile | Gust |
| `earth` | Đất | giáp, chướng ngại, ổn định | Fortify |
| `light` | Ánh sáng | barrier, cleanse, bảo hộ | Cleanse |
| `dark` | Bóng tối | nguyền rủa, hút tài nguyên có giới hạn | Curse |
| `nature` | Tự nhiên | cây, root, hồi phục dần | Root, Regen |

**Chưa đưa Poison thành Element ID** trong bản gốc V6: Poison là **trạng thái** (có thể được nhiều nguyên tố hoặc cơ chế đặt lên), để tránh tăng số loại kháng không cần thiết. Có thể thêm `poison` hay `arcane` làm nguyên tố mới sau bằng data registry, không sửa mọi skill đang có. Tương tự, **Death/Necromancy** là `Job Domain / Magic School` hoặc cách thi triển, không phải thuộc tính mặc định; **Soul** là tài nguyên, có thể dùng cho chiêu Dark hoặc Neutral.

`elementId` dùng **stable string ID**, hiệu ứng/VFX màu lấy từ bảng registry; không hardcode số nguyên hoặc dựa trên màu sprite. Có thể có `elements[]` nhiều giá trị; khi tính sát thương, mỗi hit part phải có `elementId` cụ thể và trọng số được chuẩn hóa. Phép hồi phục Water không cần có damage part.

## 3. Năng lực nhân vật, quái và kháng

Một thực thể (không riêng Skeleton) có:

```
CoreStats: STR, DEX, VIT, INT, WIL, AGI
CombatStats: PhysicalPower, MagicPower, Armor, MagicResist, ...
ElementProfile:
  affinities: Map<ElementId, Level 0..100>  // tinh thông / cộng hưởng theo hệ
  resistances: Map<ElementId, ResistValue>   // phòng vệ từng hệ
  statusResists: Map<StatusId, ResistValue>  // chống Burn, Freeze, Shock...
  traits: [Undead, Aquatic, Stoneborn, ...] // tùy chỉnh phản ứng, không trói theo Job
```

- **Cộng hưởng** là tiến triển/lựa chọn của nhân vật, không tự cấp khả năng dùng tất cả phép hệ đó. Skill học/lắp vẫn kiểm tra Access, Tier, Mastery, Item/Weapon và `attunement` **nếu skill yêu cầu**.
- **Kháng nguyên tố** khác kháng sát thương và khác **kháng/miễn nhiễm trạng thái**: boss có thể chịu Magic Lightning nhưng miễn nhiễm Shock. Không dùng hệ khắc chế cứng toàn bộ kiểu Fire thắng Nature, Water thắng Fire ở mọi hoàn cảnh.
- V6 web chỉ cho chọn **một cộng hưởng mẫu tại một thời điểm** để thử điều kiện. Runtime sau này dùng map nhiều hệ và các điều kiện AND/OR linh hoạt; thay cộng hưởng trên panel **không phải tính năng đổi hệ tùy ý trong gameplay**.
- Điều kiện race (`allowedRaceTags`) và biome (`worldTags`) chỉ thêm khi sản phẩm thật sự cần; giữ nguyên hệ Job progression một chiều, không ép Skeleton có tất cả nguyên tố.

### Damage pipeline đề xuất, chưa khóa hệ số

1. Attack timeline xác nhận hit; phát `DamagePart[]` với `Physical/Magical` và `ElementId` độc lập.
2. Scaling qua Weapon/STR/DEX hoặc INT/WIL **của từng part**; chọn Armor cho Physical, MagicResist cho Magical.
3. Áp `ElementResist[elementId]` **khi element != Neutral**; dùng cơ chế cộng/trừ hợp lý, cap hợp lý để tránh miễn nhiễm tuyệt đối không chủ đích.
4. Xử lý status buildup, boss status resistance, thời gian hồi nội bộ và reaction; các hiệu ứng Heal, Guard, Buff xử lý bằng effect components riêng, **không chui vào damage**.
5. Số liệu hiển thị chia phần để dễ debug: `Physical Neutral`, `Magical Fire`, `ShieldAbsorb`, `StatusBuildup`, v.v.

**Ví dụ:** Flame Arc có 2 part (70% Physical Neutral + 30% Magical Fire trong **mẫu test**, không phải tỷ lệ cố định): Armor tác động lên phần đầu, MagicResist + FireResist ảnh hưởng phần hai; Burn là effect có xác suất/ngưỡng riêng, không tự suy ra từ Fire. Frost Guard là Defense + Control hệ Ice **không trực tiếp gây damage** mặc dù có thể apply Chill khi barrier vỡ.

## 4. Tương tác nguyên tố / status (đề xuất)

| Điều kiện hợp lệ | Kết quả đề xuất | Giới hạn cần có |
|---|---|---|
| Wet + Lightning hit | Conductive → dễ Shock / lan mục tiêu gần | Không chaining vô hạn, cooldown mỗi mục tiêu |
| Wet + Ice hit | Tăng Chill; đủ ngưỡng có thể Freeze | Boss giảm tích lũy, miễn nhiễm Freeze không đồng nghĩa miễn damage Ice |
| Burn + Water hit | Giảm hoặc dập Burn, có thể tạo Steam | Không gây bùng nổ damage tự do từ spam |
| Curse + Light cleanse | Giải bớt Curse | Bậc/buildup và kháng thanh tẩy riêng |

**Không có bảng 'mạnh/yếu hệ' cứng trong V6.** Có thể thêm quy luật quái/biome theo data sau. Từng hiệu ứng có `statusId`, stacking rule, duration, tick cadence, internal cooldown, max targets, boss coefficient, reaction flags. Status không đồng nghĩa Element: kỹ năng Neutral có thể gây Stagger; Water có thể không gây Wet.

## 5. Các ví dụ đáng kiểm thử

| Skill | Tier | Access | Role | Method | Element | Ghi chú |
|---|---:|---|---|---|---|---|
| Bone Dash | 0 | Universal | Mobility | Martial | Neutral | không damage, giữ từ V5 |
| Shield Oath | 2 | Job Exclusive | Defense | Martial | Neutral | chỉ Bone Guard |
| Field Mend | 0 | Universal | Healing | Martial | Neutral | HP heal, không phải Quick Recovery |
| Flicker Ember | 0 | Universal | Attack | Magic | Fire | Burn là trạng thái riêng |
| Flame Arc | 1 | Universal + sword + affinity | Attack | Hybrid | Neutral + Fire | damage tách 2 part |
| Water Mend | 1 | Universal + affinity | Healing | Magic | Water | Regen, không damage |
| Frost Guard | 1 | Universal + affinity | Defense + Control | Magic | Ice | Barrier, Chill |
| Conductive Surge | 2 | Universal + affinity | Attack + Control | Magic | Lightning | tương tác Wet |
| Earth Wall | 2 | Universal + affinity | Defense + Utility | Magic | Earth | thay đổi địa hình combat |
| Tidal Sanctuary | 3 | Universal + affinity | Healing + Support | Magic | Water | Signature hồi HP |
| Storm Waltz | 3 | Universal + affinity | Attack + Mobility | Magic | Wind + Lightning | 2 parts của cùng phép |
| Ice Lance | 2 | Restricted future domain | Attack + Control | Magic | Ice | chủ ý bị khóa trên tree Skeleton hiện tại |

## 6. Dữ liệu Unity (mô hình minh họa, chưa phải runtime)

```csharp
public enum SkillRole { Attack, Healing, Defense, Mobility, Control, Support, Summon, Utility }
public enum SkillMethod { Martial, Magic, Hybrid, Tech, Innate }
public enum DamageType { Physical, Magical }
public enum SkillKind { Active, Signature, Passive } // giữ V5

[System.Serializable]
public struct DamagePartData {
    public DamageType damageType;
    public string elementId;  // registry, ví dụ "fire", "neutral"
    public float share;       // công thức chuẩn hóa hoặc scaling theo part
}
[System.Serializable]
public struct ElementAttunementRequirement {
    public string elementId;
    public int minimumLevel;
}
public class SkillDefinitionData {
    public string skillId;
    public SkillKind kind;
    public SkillRole primaryRole;
    public SkillRole[] secondaryRoles;
    public SkillMethod method;
    public string[] elementIds;
    public DamagePartData[] hits;
    public string[] statusIds;
    public ElementAttunementRequirement[] optionalRequirements;
    // Giữ access/job/domain/tier/mastery/weapon/cost/cooldown/animation V5.
}
```

`StatusEffectDefinition` và `ElementDefinition` là registry data riêng, không sinh ra một class runtime trên mỗi nguyên tố. Cần `EffectAction[]` hoặc behavior modules (`Damage`, `Heal`, `Barrier`, `ApplyStatus`, `Summon`, `Dash`, `CreateTerrain`) để phối skill không chồng class.

**Validator bắt buộc:** ID duy nhất; primary role có giá trị; mọi element/status đều tồn tại; share mỗi hit pattern hợp lệ (100% nếu UI dùng tỷ lệ); skill không damage thì không có hits; healing không bị giảm bởi Armor/MagicResist; status không tự kích hoạt vì element; các yêu cầu affinity hợp lệ; skill có nhiều role chỉ chiếm đúng loại slot đã khai báo; Learned giữ lại khi đổi job/weapon/affinity; combat không đổi Job một chiều.

## 7. Tính năng web V6 & phần chưa chốt

Bản web cho lọc skill theo `kind`, access, Tier, role, method, element; xem combo, phân tách damage part, statuses và yêu cầu attunement; xem Atlas và reactions; thay affinity demo và kiểm tra skill tự tháo khỏi loadout khi không còn hợp lệ, **không quên skill**. Kho demo giữ nguyên 63 skill V5 và thêm 18 skill nguyên tố => **81 skill**, cho các job tương lai.

**Chưa khóa:** hệ số damage/element resistance; bảng phản ứng cuối cùng; cách tăng affinity; nhiều affinity đồng thời, thuật toán AI/boss, status duration, DPS, soft/hard immunity, mở slot, yêu cầu Mana ở các nghề hiện tại. Điều kiện element không được vô tình khóa hàng loạt skill cũ.

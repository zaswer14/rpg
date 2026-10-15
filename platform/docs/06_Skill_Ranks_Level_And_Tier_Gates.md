# Skeleton Codex V8 — Skill Rank, Character Level & Job Tier Gates

**Trạng thái:** Thiết kế cập nhật ngày 13/10/2026. Thay thế hoàn toàn cơ chế cộng 3 điểm thuộc tính của bản V7. Phần chỉ số/cân bằng vẫn là tham số mô phỏng, không phải production Unity.

## 1. Luật bắt buộc

1. Không có XP/Level dẫn đến cộng điểm chỉ số tự động. Không có nút cộng STR/DEX/VIT/INT/WIL/AGI theo Level.
2. Mỗi skill có **5 bậc**. Chưa học = rank 0; học lần đầu = rank 1; max = rank 5. Việc tăng rank mô phỏng bằng nút; điều kiện tốn tài nguyên hoặc cách tích kinh nghiệm kỹ năng sẽ thiết kế sau.
3. Khi max rank 5, skill **luôn có phần thưởng chỉ số vĩnh viễn**. Một số skill mạnh có thưởng **nhỏ bổ sung tại rank 2–4** (V8 minh họa ở rank 3).
4. **Character Level = số skill đã đạt rank 5**, không cộng bất kỳ chỉ số nào từ phép tính Level. Ví dụ học 18 skill, max 5 skill → Level 5.
5. Reward nhận tại mỗi mốc là **cộng dồn**: skill mạnh +1 STR rank 3, sau đó +1 STR và +1 DEX rank 5 → tổng +2 STR, +1 DEX. Không trả thưởng lại nhiều lần do lắp/tháo skill.
6. Reward không phụ thuộc skill đang lắp. Thay vũ khí/chuyển nghề khiến skill không thể lắp vẫn **giữ rank và thưởng đã đạt**. Không cho phép nâng rank skill khi nhân vật không đáp ứng điều kiện luyện hiện tại.
7. Mỗi đường chuyển nghề là một cạnh hợp lệ trong Job Graph; để chuyển sang đích, phải max toàn bộ **RequiredMaxSkills** của nghề đích, đạt Mastery và hoàn thành Trial/Item (nếu có). Không thể hồi nghề cũ sau khi chuyển.
8. Tier và Level độc lập. Có thể tăng Level bằng cách max thêm skill Tier thấp, kể cả đang ở Tier cao hoặc nghề Terminal. Không cần max mọi skill để vượt Tier.
9. Tổng skill sở hữu không giới hạn bởi Loadout. Slot Tier 0: 1 Active + 1 Passive, Tier 1: 2 + 1, Tier 2: 3 + 2, Tier 3+: 3 Active + 1 Signature + 2 Passive.
10. Các hệ chỉ số nguyên tố, kháng trạng thái, loại sát thương và quyền truy cập Universal / Restricted / Exclusive / Lineage vẫn tách biệt.

## 2. Các đường chuyển Tier 0 → Tier 1

| Nghề đích | Skill bắt buộc **rank 5** | Chủ đề kỹ năng | Trạng thái Mastery/Trial |
|---|---|---|---|
| **Bone Fighter** | `cracked_slash` + `brace` | Đánh gần, giữ thế | Sword 10 + Weapon initiation |
| **Skeleton Archer** | `stone_throw` + `aimed_stone` | Ném đá và ngắm tầm xa | Throwing 10 + Target challenge |
| **Bone Rogue** | `needle_stab` + `bone_dash` | Đâm nhanh, né/lướt | Dagger 10 + Shadow trial |
| **Bone Acolyte** | `focus_pulse` + `shade_mote` | Phép trung tính và tử thuật | Necromancy 10 + Soul initiation |
| **Bone Tinkerer** | `junk_snare` + `scavenger_eye` | Bẫy và tìm kiếm vật liệu | Engineering 10 + First construction |

**Lưu ý nhánh Archer:** Tier 0 học **ném đá bằng tay**, không phải bắn tên. Từ Tier 1 mới học cách dùng cung và các skill bắn cung (`Aimed Shot`, `Split Arrow`…). Mastery nhập nghề đã đổi thành **Throwing 10** để tương thích với ném đá Tier 0. Skill cung và `Bow Mastery` bắt đầu từ Tier 1; slider Bow vẫn được giữ cho những nghề bắn cung về sau.

**Không ép người chơi học một nhánh duy nhất:** Có thể luyện nhiều kỹ năng Tier 0 để mở nhiều nghề; chỉ khi thật sự chuyển nghề mới khóa các đường còn lại. Mỗi nhánh yêu cầu 2 max skill → tối thiểu Level 2 **nếu chưa max skill nào khác**, nhưng đây là hệ quả của kỹ năng bắt buộc, không phải `RequiredLevel` riêng.


## 2.1. Bảng RequiredMaxSkills mẫu cho Tier cao hơn

Các bộ dưới đây cũng được gắn vào **job-gate simulator V8** để mọi đường đi Tier 1→5 đều cần ít nhất một số skill rank 5. Đây là bộ **mẫu tạm**, sẽ kiểm tra tính đạt được trên từng đường nghề trước khi chốt.

| Nghề đích | Bắt buộc max rank 5 |
|---|---|
| Bone Guard | Rough Three-Cut; Shield Tap |
| Bone Duelist | Rough Three-Cut; Sword Cleave |
| Bone Raider | Rough Three-Cut; Cracked Axe Slam |
| Bone Marksman | Aimed Shot; Split Arrow |
| Grave Hunter | Aimed Shot; Scavenger Eye |
| Grave Assassin | Shadow Slip; Knife Feint |
| Grave Bandit | Shadow Slip; Junk Snare |
| Necromancer | Grave Chant; Soul Spark |
| Soul Medium | Grave Chant; Field Mend |
| Bone Engineer | Pocket Turret; Scrap Mine |
| Bone Phalanx | Shield Oath; Iron Memory |
| Dread Knight | Shield Oath; Guard Counter |
| Sword Wraith | Viper Riposte; Perfect Timing |
| Grave Marauder | Cracked Axe Slam; Bone Dash |
| Phantom Sniper | Arrow Volley; Aimed Shot |
| Wild Hunt Captain | Hunter Mark; Ankle Trap |
| Soul Assassin | Phantom Step; Bone Dash |
| Shade Stalker | Phantom Step; Quiet Tread |
| Grand Necromancer | Summon Bone Guard; Soul Bind |
| Soul Weaver | Field Mend; Water Veil |
| Bone Tinkerer Prime | Deploy Sentry; Field Repair |
| Legion Marshal | Guardian Pulse; Shield Oath |
| Death Knight | Dread Cleaver; Wraith Rush |
| Eternal Huntsman | Ghostline Shot; Aimed Shot |
| Death Whisper | Phantom Step; Bone Dash |
| Lich King | Legion Call; Summon Bone Guard |
| Bone Architect | Deploy Sentry; Pocket Turret |
| Abyss Sovereign | Reaper Verdict; Dread Cleaver |
| Death Sovereign | Grave Dominion; Legion Call |

**Lưu ý cân bằng:** Những nghề có nhiều tiền nhiệm như Grave Marauder/Soul Weaver cần xác minh bộ skill bắt buộc trên *mọi* đường hợp lệ, tránh trường hợp bị khóa do không học kịp một skill ở Tier thấp. Mẫu này chưa thay thế Trial, vật phẩm hay điều kiện truyện.

## 3. Ví dụ thưởng chỉ số Tier 0 (minh họa để cân bằng)

| Skill | Rank 3 | Rank 5 | Cộng dồn ở max |
|---|---|---|---|
| Cracked Slash | — | STR +1 | STR +1 |
| Brace | — | VIT +1 | VIT +1 |
| Stone Throw | — | DEX +1 | DEX +1 |
| **Aimed Stone** (skill mạnh) | DEX +1 | DEX +1 | DEX +2 |
| Needle Stab | — | DEX +1 | DEX +1 |
| Bone Dash | — | AGI +1 | AGI +1 |
| Worn Focus Pulse | — | INT +1 | INT +1 |
| Shade Mote | — | WIL +1 | WIL +1 |
| Junk Snare | — | INT +1 | INT +1 |
| Scavenger Eye | — | DEX +1 | DEX +1 |
| **Rising Chip** (skill mạnh) | STR +1 | STR +1, DEX +1 | STR +2, DEX +1 |
| **Cracked Axe Slam** (skill mạnh) | STR +1 | STR +1, VIT +1 | STR +2, VIT +1 |
| **Frost Fleck** (skill mạnh) | INT +1 | INT +1 | INT +2 |

Những skill Tier 0 còn lại đều có phần thưởng Rank 5 riêng trong file `skill-system.js` (bản web hiển thị trực tiếp mỗi thẻ). Đối với skill Tier 1+ chưa cân bằng chi tiết, V8 đang dùng thưởng mặc định dựa theo vai trò/nguồn sức mạnh để **mọi skill đều tuân thủ luật rank 5 thưởng chỉ số**. Đây là placeholder có đánh dấu trong code, cần bảng dữ liệu author riêng trước khi triển khai gameplay.

## 4. Công thức dữ liệu đề xuất

```text
SkillDefinition:
  id, tier, kind, access, role[], method, element[], ...
  maxRank = 5
  rewardsByRank = { 3: {STR:1}, 5: {STR:1,DEX:1} }

CharacterProgress:
  currentJobId, jobHistory[]
  learnedSkillRankById : Map<SkillId, 1..5>
  unlockedSkillIds : Set<SkillId>
  characterLevel : derived COUNT(skill rank == 5)
  earnedStats : derived SUM(skill rewards where rewardRank <= ownedRank)
  totalStats = raceBaseStats + skillEarnedStats + itemStats + buffs

JobEvolutionEdge:
  fromJob, toJob
  requiredMaxSkillIds[]
  requiredMastery{}, requiredTrial, requiredItem
  available = edgeExists AND allRequiredSkillsRank5
              AND masterySatisfied AND trialSatisfied AND itemSatisfied
```

**Không lưu Level hoặc tổng thưởng chỉ số như nguồn sự thật độc lập**, nhằm tránh lệch khi lưu game, nâng skill, thay job hoặc load save. Nếu cache vì tối ưu runtime thì invalidate theo phiên bản skill rank và bảng reward. Reward tính từ skill sở hữu *một lần* mỗi mốc, không cộng lại khi equip.

## 5. Giao diện & trạng thái V8

- Thẻ skill có thanh 5 bậc, phần thưởng theo mốc, nút **Học · Bậc 1**, **Luyện bậc N → N+1** và **Lắp vào slot** độc lập.
- Bảng Tier 0 không còn cho bấm +/− chỉ số hoặc preset +3 điểm; đọc chỉ số nền 5 và cộng thưởng skill đã luyện.
- `Level = số skill max` ở Metrics và bảng Tier 0; bảng chuyển nghề xem skill nào còn thiếu `x/5`, Mastery và Trial.
- `Stone Throw` + `Aimed Stone` thay hoàn toàn skill Tier 0 `Splinter Shot`; các skill bắn tên có thể tồn tại **từ Tier 1 trở lên**.
- Web đang dùng **một kho skill, rank và Level dùng chung qua các preview nghề**; chỉ loadout/vũ khí của từng nghề được giả lập riêng, không có thao tác thực sự xác nhận chuyển nghề.
- Web demo tăng rank không trừ tài nguyên. Không có Unity combat runtime.

## 6. Điểm chờ chốt

- Cách tích tiến độ rank (thành thạo theo lần dùng, sách kỹ năng, nguyên liệu, huấn luyện, kết hợp hoặc giới hạn ngày).
- Skill nào có thưởng tại rank 2, 3 hay 4 và thang sức mạnh bậc 1–5; tránh người chơi farm skill rẻ để lấy chỉ số vô hạn. Có thể giới hạn nguồn skill/chi phí để cân bằng thay vì hard-cap tổng skill.
- Rà các job Tier 2+ xem bộ skill bắt buộc có thể đạt được trên từng tuyến tiền nhiệm hay không, sau đó cân bằng ngưỡng Mastery/Trial cho các đường khác nhau.
- Đặt tiêu chuẩn reward Race Origin, gear và trait độc lập với skill earned stats.

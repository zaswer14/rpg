# Skeleton Codex V9 — Vòng lặp khiêu chiến, gacha skill & 6 độ hiếm

**Phiên bản:** V9 · 13/10/2026 · Game action platformer 2D, thiết kế và mô phỏng web offline.

**Tài liệu có hiệu lực mới nhất cho Skill Rarity / Gacha / Upgrade Economy.** Các tài liệu V8 trở về trước được giữ để tham khảo hệ nghề, chỉ số, nguyên tố, art; khi mâu thuẫn về cách **nhận và nâng skill**, V9 có ưu tiên. Đây là game nhận tiền tệ hoàn toàn qua chơi, **không liên quan nạp tiền thật**.

## 1. Core loop

```text
Khiêu chiến đi cảnh (đấu 1v1 / nhóm / tinh anh / boss)
  ↓ thắng
Chiến tích (tiền tệ trong game)
  ↓ gacha skill theo nhóm và Tier hiện có
Skill mới → học bậc 1              Skill trùng → điểm thông thạo
           ╲                        ╱
             Nâng các skill đã học lên bậc 2–5
                      ↓
           Skill bậc 5: chỉ số + Level +1
                      ↓
      Đủ skill bắt buộc bậc 5 + Mastery + Trial
                      ↓
             Chuyển nghề một chiều
```

- **Skill Codex** là toàn bộ skill có thể tồn tại. **Learned** là số skill sở hữu, không giới hạn. **Loadout** chỉ cho lắp số skill hạn chế theo Tier (Tier 0 = 1 Active + 1 Passive).
- **Level = số skill rank 5**, không tự cộng chỉ số khi tăng Level. Thưởng chỉ số do từng skill và các mốc Rank quy định, được giữ vĩnh viễn kể cả khi tháo skill/chuyển nghề.
- Skill bậc 5 tiếp tục có thể xuất hiện trong gacha; bản sao chuyển thành điểm, không vô dụng.
- Các skill có tính đặc thù nghề vẫn có thể nằm trong kho đã học ngay cả khi chưa thể trang bị: `access`, `job`, `weapon`, `mastery`, `attunement` là điều kiện **sử dụng**, không phải độ hiếm.

## 2. Các chiều dữ liệu phải tách biệt

| Trục | Ví dụ | Ý nghĩa |
|---|---|---|
| `jobTier` | 0–5 | Độ sâu của nghề, phạm vi hệ thống mở |
| `skillMinTier` | 0–5 | Tier tối thiểu để skill xuất hiện / sử dụng |
| `skillRarity` | trắng, lục, lam, tím, vàng, đỏ | Độ hiếm và chiều sâu thiết kế skill |
| `skillRank` | 0–5 | Tiến độ sở hữu / nâng skill; 0 chưa học |
| `role`, `method` | Tấn công, phép, hồi phục, phòng thủ... | Vai trò và nguồn lực |
| `element` | Lửa, Nước, Băng... | Thuộc tính của skill |
| `access` | Universal, Restricted, Exclusive, Lineage | Quyền sử dụng theo nghề |

**Không suy ra màu từ Tier trong luật sản phẩm.** Website V9 đã gán rõ tất cả 34 skill Tier 0; với skill Tier cao, màu đang là **mặc định đề xuất** theo Tier/kind để hoàn thiện sau. Skill Trắng Tier cao hoặc Vàng Tier 0 đều có thể thiết kế trong tương lai nếu cân bằng phù hợp.

## 3. Sáu độ hiếm

| Màu | Tên đề xuất | Vai trò thiết kế | Tỷ lệ nền gợi ý* | Hệ số giá nâng | Điểm khi trùng |
|---|---|---|---:|---:|---:|
| Trắng | Phổ thông | Kỹ thuật nhập môn, điều khiển nền | 55% | ×1 | 2 |
| Lục | Cải tiến | Nhiều biến thể/nhịp combo hơn | 25% | ×1,5 | 3 |
| Lam | Hiếm | Phản công, ghép hiệu ứng, đổi tư thế | 12% | ×2 | 5 |
| Tím | Sử thi | Cơ chế riêng, giới hạn/cửa sổ khó | 5% | ×3 | 10 |
| Vàng | Huyền thoại | Cơ chế chiến đấu đặc sắc, build chuyên môn | 2,5% | ×5 | 22 |
| Đỏ | Thần thoại | Kỹ năng tạo khoảnh khắc đặc biệt, đánh đổi lớn | 0,5% | ×8 | 45 |

\* *Tỷ lệ nền là gợi ý cân bằng, không phải tỷ lệ gacha cố định hoặc hệ thống có tiền thật.*

### Nguyên tắc kiểm soát power creep

- Skill màu cao **không nhất thiết gây nhiều DPS hơn**. Chúng mang lựa chọn nhịp chiến đấu, combo, điều kiện vị trí, phạm vi, tác dụng phụ, năng lượng và độ khó dùng khác biệt.
- Không buff đồng đều chỉ số theo độ hiếm. Phần thưởng **từng skill author riêng** và cấp tại các mốc Rank. Có thể có reward nhỏ ở rank 3 (ví dụ một số skill xanh/lam/màu cao); tất cả skill có reward ở rank 5.
- Không dùng màu Vàng/Đỏ làm điều kiện bắt buộc để chuyển **Tier 0 → Tier 1**.
- Độ hiếm của skill không liên quan Power Grade của nghề hoặc mức hoàn thiện trang bị Art Rank I–V.

## 4. Nâng skill — chi phí và điểm

Mỗi skill có 5 bậc (Rank 1 khi nhận lần đầu). Chi phí từ bậc **1→2 / 2→3 / 3→4 / 4→5** lần lượt là `1 / 2 / 2 / 3` điểm gốc nhân hệ số màu; làm tròn lên từng mốc.

| Màu | Rank 1→2 | 2→3 | 3→4 | 4→5 | Tổng |
|---|---:|---:|---:|---:|---:|
| Trắng | 1 | 2 | 2 | 3 | 8 |
| Lục | 2 | 3 | 3 | 5 | 13 |
| Lam | 2 | 4 | 4 | 6 | 16 |
| Tím | 3 | 6 | 6 | 9 | 24 |
| Vàng | 5 | 10 | 10 | 15 | 40 |
| Đỏ | 8 | 16 | 16 | 24 | 64 |

- Điểm thông thạo là **tiền tệ chung**, không khoá theo skill đã quay trùng. Nếu người chơi quay trùng skill lục, có thể dùng điểm đó nâng skill trắng khác.
- V9 tách việc **sở hữu/nâng rank** và **lắp/sử dụng skill**: skill đã có có thể nâng bằng điểm ngay cả khi đổi vũ khí để xem build khác. Khi chưa đủ điều kiện sử dụng, không thể lắp vào Loadout.
- Số dư, lịch sử đạt skill, rank và bonus lưu localStorage của website offline. File lưu của V8 được đọc vào V9 một lần nếu trình duyệt vẫn cùng origin; xuất/nhập file save chưa triển khai.

## 5. Gacha và bảo hiểm

**Mô phỏng giá một lượt quay: 60 Chiến tích.**

1. Người chơi chọn nhóm ưu tiên: toàn bộ, cận chiến/khiên, tầm xa/ném đá, dao găm/cơ động, phép thuật/nguyên tố, hoặc bẫy/cơ khí.
2. Chỉ các skill nằm trong **pool có Tier tối thiểu ≤ Tier được phép** mới tham gia. Website cho đổi Tier pool 0–5 để kiểm tra; game thật sẽ khóa theo Tier nghề thực tế.
3. Loại bỏ màu không có skill trong pool, **chuẩn hóa lại** xác suất các màu còn lại. Trang web hiển thị tỷ lệ **sau lọc**, không đánh tráo tỷ lệ nền 55/25/12/5/2,5/0,5.
4. Chọn màu theo xác suất rồi chọn ngẫu nhiên đều trong số các skill ở màu đó, pool đó. Các skill chưa học và đã học cùng nằm trong pool.
5. **Bảo hiểm có điều kiện:** nếu 9 lần liên tiếp không ra Lam+, lần thứ 10 bảo đảm Lam+ nếu pool có; nếu 29 lần không ra Tím+, lần thứ 30 bảo đảm Tím+ nếu pool có. Nếu pool không có màu đảm bảo, dùng màu tối thiểu tốt nhất sẵn có và tiếp tục lưu bộ đếm màu cao.
6. Trùng sẽ hoàn điểm thông thạo như bảng màu; **không xóa** rank 5 và không tăng Level khi quay trùng.

**Lưu ý sản phẩm:** Đây là phiên bản thiết kế chưa chốt tỷ lệ. Nên minh bạch tỷ lệ ở màn quay, kiểm thử số lượt trung bình để đạt Tier, giữ phần thưởng đảm bảo; không biến việc quay thành nguồn gây bế tắc/chặn tiến trình.

## 6. Khiêu chiến — phần thưởng mô phỏng

| Loại khiêu chiến | Thưởng mỗi lần thắng | Thưởng lần thắng đầu |
|---|---:|---:|
| Một đối thủ (1v1) | 70 | +30 |
| Nhóm đối thủ | 120 | +60 |
| Tinh anh | 190 | +90 |

- Đây là tham số website mô phỏng **phần thưởng sau thắng**, chưa có combat playable hoặc AI kẻ địch tương ứng.
- Bản sản phẩm nên cân bằng thêm thời gian mỗi trận, mức độ rủi ro, phần thưởng trong ngày, trial và boss; tránh khuyến khích farm mãi màn dễ nhất.

## 7. Bảo đảm mở Tier 1

Một thử thách nhập môn mở cả cặp skill bắt buộc cho nghề đích (một lần cho mỗi hướng). Người chơi vẫn cần **dùng điểm để nâng cả hai lên Rank 5** rồi hoàn thành Mastery + Trial nghề.

| Hướng Tier 1 | Thử thách bảo đảm | Skill được nhận rank 1 |
|---|---|---|
| Bone Fighter | Sân tập kiếm & khiên | Cracked Slash · Brace |
| Skeleton Archer | Bãi tập ném đá | Stone Throw · Aimed Stone |
| Bone Rogue | Lối đi bóng tối | Needle Stab · Bone Dash |
| Bone Acolyte | Tàn tích pháp thuật | Worn Focus Pulse · Shade Mote |
| Bone Tinkerer | Bẫy trong hang | Junk Snare · Scavenger Eye |

**Tier 0 không bắn cung:** Ném đá bằng tay (Stone Throw, Aimed Stone). Cung và skill bắn cung bắt đầu từ Tier 1. Các thử thách được bấm *nhận thưởng mô phỏng*, chưa có màn chơi thực.

## 8. Ví dụ rarity Tier 0

- **Trắng:** Cracked Slash, Brace, Stone Throw, Needle Stab, Worn Focus Pulse, Junk Snare, Bone Dash, Scavenger Eye, Shade Mote.
- **Lục:** Aimed Stone, Field Mend, Bone Dive, Static Snap, Flicker Ember.
- **Lam:** Rising Chip, Cracked Axe Slam, Frost Fleck, Pale Glimmer, Water Veil, First Footfall.
- **Tím:** Wanderer Improvisation (độc quyền Wanderer).
- **Vàng/Đỏ:** chưa có ở Tier 0 trong kho mẫu V9. Có ở Tier cao, nhưng không bị ràng buộc cứng với Tier bởi định nghĩa dữ liệu.

## 9. Triển khai Unity sau này

### Dữ liệu

```csharp
// Design sketch; NOT production Unity component.
enum SkillRarity { White, Green, Blue, Purple, Gold, Red }
struct SkillDefinition {
  string Id;
  int RequiredTier;
  SkillRarity Rarity;
  int MaxRank; // 5
  // Role[], Method, Element[], AccessRule, WeaponRequirement,
  // RankFeatures, RankStatBonuses, RankCosts ...
}
struct CharacterSkillProgress {
  Dictionary<string,int> LearnedRank;
  int Trophies;
  int MasteryPoints;
  int PullsSinceBlue;
  int PullsSincePurple;
  HashSet<string> ClaimedStarterChallenges;
}
```

### Backend-safe rules

- Kiểm tra giao dịch nguyên tử khi tiêu chiến tích, roll, grant duplicate points và nâng rank; tính thưởng chỉ số từ rank đã lưu (không lưu tổng bonus riêng dễ cộng lặp).
- Quay theo pool đã phiên bản hóa; tỷ lệ và lịch sử bảo hiểm nên được lưu để debug và QA tái hiện.
- Bắt buộc validate rằng mọi Job Gate có đường nhận Guaranteed theo hướng nghề; riêng các Tier cao hơn cần tiếp tục author và kiểm tra điều kiện trên **mọi** cạnh tiền nhiệm.
- Tier cao xem trước trên web không đồng nghĩa đã unlock. Việc chuyển nghề thật vẫn cần trạng thái `currentJobId` và Trial; trang web V9 hiện chưa thực thi chuyển nghề.

## 10. Chưa chốt

- Hệ số điểm, tỷ lệ, pity, giá quay thực tế sau playtest; có hay không tính thêm cơ chế bảo hiểm khi ra skill chưa học.
- Phần thưởng lần đầu cấp qua quest, nâng nội dung boss nghề, điều kiện gặp đối thủ trong màn đi cảnh.
- Tính tiến triển nguyên tố/affinity qua thử thách và level design platformer.
- Dữ liệu rank 2/3/4 nên thay đổi chức năng đòn đánh thế nào (combo, cancel window, recovery, projectile behavior), thay vì chỉ mô tả tăng damage.

**Nguồn triển khai mô phỏng web:** `skill-system.js` (rarity, pool, reward, points, pity, challenges), `skill-system.css` (thẻ màu/UX), `index.html` (layout), `tier0-design.js` (chỉ số từ bậc skill). Tất cả chạy offline, không phụ thuộc CDN.

# Race Catalog — 10 chủng tộc trong thư viện

Dữ liệu chuẩn nằm trong `../races/<id>.js`; tài liệu này là bản đọc nhanh để chọn chủng tộc cho một game và thấy chúng khác nhau ở đâu. Mỗi chủng tộc có: origin T0, thân sprite, trường phái native / foreign / forbidden, ngọn riêng, body evolution, màu nhấn, "silhouette hook" (một câu để nghệ sĩ biết cả chủng tộc trông khác ở đâu ngay cả khi mặc cùng gear).

## Bảng tổng

| Chủng tộc | Thân (rig) | Native | Foreign | Forbidden | Ngọn riêng | Ẩn | Chi phí art |
|---|---|---|---|---|---|---|---|
| Skeleton · Bộ Xương (chủ lực) | humanoid64 | Combat, Shadow, Death, Craft | Arcane, Ranged, Beast, Martial-Body | Monk/Mystic (không thở) | 17 | 3 | nền (đã có pipeline) |
| Human · Nhân Loại | humanoid64 | Combat, Ranged, Craft, Martial | Arcane, Beast, Shadow | Death (ẩn: Heretic) | 6 | 1 | thấp nhất: overlay dùng lại ~1:1 |
| Elf · Tiên Tộc | humanoid64 (cao, tai) | Ranged, Arcane, Shadow | Combat, Beast, Death-Soul | Craft-Engineering | 7 | 0 | thấp |
| Dwarf · Người Lùn | humanoid64-short | Combat, Craft, Ranged (nỏ) | Martial, Shadow, Death-Spirit | **Arcane**, Beast | 6 | 0 | cao: vẽ lại overlay |
| Beastfolk · Người Thú | humanoid64 (đầu thú, đuôi) | Beast, Martial, Combat | Ranged, Shadow, Death-Soul | Arcane, Craft | 6 | 0 | trung bình: head overlay cần khe tai |
| Merfolk · Hải Tộc | humanoid64 trên cạn; mer-tail dưới nước | Arcane-Water, Ranged (lao), Beast | Combat, Craft, Shadow | Death (ẩn: Abyss Priest), Martial | 5 | 1 | cao nhất nếu làm biến thể nước |
| Orc | humanoid64-broad | Combat, Beast, Martial | Shadow, Craft, Death-Spirit, Ranged | Arcane | 6 | 0 | trung bình-cao |
| Dragonkin · Long Nhân | humanoid64 (đuôi); winged = rig riêng | Arcane-Fire, Combat | Ranged, Martial, Craft, Beast | Shadow, Death | 6 | 0 | trung bình; cánh đắt |
| Fae · Yêu Tinh | humanoid64 (nhỏ, cánh mờ) | Arcane, Shadow, Beast | Ranged, Death-Soul, Martial | Combat nặng, Craft | 7 | 0 | thấp-trung bình |
| Construct · Cơ Nhân | humanoid64 (khung kim loại) | Craft, Combat, Martial-Body | Arcane, Ranged | Death, Beast, Shadow | 6 | 0 | thấp: giống skeleton nhất |

Số ngọn riêng trong bảng là của bản 14/10/2026 buổi sáng. Cùng ngày: mỗi chủng tộc thêm 2 ngọn T5 (human: Thần Xạ, Huyền Thoại Sống; elf: Trưởng Lão Rừng Già, Nhật Thực Kiếm; dwarf: Sơn Vương, Rune Chúa; beastfolk: Đại Thú Linh, Đỉnh Thú; merfolk: Kình Vương, Chúa Chìm ◆; orc: Hóa Thân Huyết Thần, Kẻ Phá Thế Giới; dragonkin: Long Vương, Phượng Hoàng Tái Sinh; fae: Mộng Vương, Gai Vương; construct: Khung Titan, Kỳ Dị Điểm; skeleton: Kỵ Sĩ Sám Hối T4 + Thánh Cốt T5 theo Quang Minh). Paladin / Crusader Lord / Inquisitor (human), Ancestor Speaker (dwarf), Abyss Priest (merfolk) chuyển thành **ngọn tín ngưỡng** mở cho mọi chủng tộc (`faiths.js`, `03_Faiths.md`); nhờ đó mọi chủng tộc có thêm 23 nghề qua giáo phái, trong đó 7 nghề T5. Số hiện tại xem `../catalog.html` hoặc trang duyệt cây.

## Nguyên tắc khi chọn chủng tộc cho một game

1. **Mỗi game chọn 2–4 chủng tộc**, không hơn: mỗi chủng tộc thêm là một bộ thân + vẽ lại overlay cho mọi nghề chung nó vào được.
2. **Chọn theo thân trước, theo lore sau.** Human và Construct rẻ vì dùng lại overlay của skeleton; Dwarf, Orc, Merfolk đắt vì rig khác.
3. **Tránh hai chủng tộc cùng native một trường phái mà không có forbidden khác nhau**, nếu không chúng chơi giống nhau. Ví dụ Orc và Beastfolk cùng Beast + Martial + Combat; chỉ chọn một trong hai cho một game.
4. **Kiểm tra trùng từ khóa tên** giữa ngọn riêng của các chủng tộc đã chọn (ví dụ "Abyss" ở skeleton và merfolk).
5. Chạy `compose({races:[...]})` và nhìn `summary`: mỗi chủng tộc nên có 28–40 nghề vào được, Tier cao nhất 5, và ít nhất 3 trường phái native.

## Thiên hướng chủng tộc (14/10/2026)

Mỗi chủng tộc có một **sở trường** (`leaning` trong `races/<id>.js`) và một **nhánh sở trường** riêng sâu 3 bậc (T3 → T4 → T5) đặt theo đúng thiên hướng đó; trường phái chủng tộc không có thì bù bằng nhánh này thay vì mở foreign. Nguyên tắc: *thiếu một trường phái thì sâu hơn ở trường phái khác.*

| Chủng tộc | Thiếu | Bù bằng nhánh sở trường | Ý |
|---|---|---|---|
| Người Lùn | **Arcane cấm hẳn** (không dùng phép; Runesmith là khắc, cần Spirit chứ không cần Arcane) | Linh Môi → **Kẻ Nói Với Đá → Bảo Thạch Tiên Tri → Hồn Núi** (Death-Spirit, foreign) | vu sư là pháp sư duy nhất của người lùn; totem là đá nhặt từ màn chơi |
| Nhân Loại | không thiếu, nhưng không có sở trường bẩm sinh | Kiếm Sĩ / Sơn Tặc → **Lính Đánh Thuê → Thủ Lĩnh Tự Do → Kẻ Tạo Vua** | sức mạnh bằng người, tiền và lời hứa |
| Tiên Tộc | Craft-Engineering | Tập Sự → **Kẻ Dệt Khúc → Người Giữ Khúc Cổ → Ca Giả Thế Giới** | phép đi qua bài hát và trí nhớ |
| Người Thú | Arcane, Craft | Kẻ Nắn Thân → **Hóa Hình → Người Hóa Thú → Thú Thần** | thân thể là phép duy nhất |
| Hải Tộc | Martial, Death | Pháp Sư Nguyên Tố → **Nhân Ngư Ca → Hải Mẫu → Bão Nhân Ngư** (hội tụ với Triệu Triều) | phép đi qua giọng hát |
| Orc | Arcane | Cuồng Chiến → **Huyết Chiến Tướng → Chiến Thần Nhập Thế** | lên đỉnh bằng rage, không bằng kỹ thuật |
| Long Nhân | Shadow, Death | Thợ Săn → **Kẻ Nuôi Long Câu → Kỵ Sĩ Lưng Long → Bạo Chúa Trời** | Beast ngoại lai nhưng long câu là máu mủ; kỵ thú bay duy nhất |
| Yêu Tinh | Combat nặng, Craft | Sơn Tặc / Sát Thủ → **Tiểu Quỷ Trêu → Kẻ Lừa Phỉnh → Vương Tử Dối Trá** | thắng bằng việc địch không biết đâu là thật |
| Cơ Nhân | Death, Beast, Shadow | Kẻ Nắn Thân → **Kẻ Lắp Ráp → Tâm Trí Bầy → Siêu Trí** | thuộc hạ là bản sao của chính mình |
| Bộ Xương | Martial-Spirit | đã sâu nhất (Death, Combat lai Death, nắn xương); không thêm | chủng tộc chủ lực |

## Mô tả từng chủng tộc

### Skeleton · Bộ Xương
Xương khô thức tỉnh trong hầm mộ. Origin **Wanderer**. Native Combat/Shadow/Death/Craft; Arcane và Ranged là foreign (Archer hiển thị "Skeleton Archer" nhưng gate +15). Không thở nên Monk/Mystic bị cấm riêng, dù nhánh Body (Shaper → Colossus → Ossomancer) mở. 17 ngọn riêng gồm toàn bộ nghề "hồn" của V12.3 (Dread/Death Knight, Abyss Sovereign, Sword Wraith, Phantom Sniper, Eternal Huntsman, Wild Hunt Captain, Headless Horseman, Grave Marauder, Soul Assassin, Death Whisper, Lich, Death Sovereign, Soul Weaver, Bandaged Hexer, Mummy Lord, Ossomancer) và 3 nghề ẩn theo Body Evolution. Silhouette hook: xương lộ qua mọi bộ giáp, không bao giờ che kín sọ.

### Human · Nhân Loại
Không có gì bẩm sinh nên học được gần hết. Origin **Peasant**. Native Combat/Ranged/Craft/Martial; Death bị cấm, chỉ mở qua nghề ẩn **Heretic** (T2 từ Adept) rồi đi Necromancer như foreign. Ngọn: Paladin → Crusader Lord, Inquisitor (từ Stalker), Musketeer (từ Sniper; dùng mastery Firearm chưa ai dùng), Warlord (T5 từ Marshal), Grandmaster (từ Mystic). Body evolution Blessed / Scarred. Nên là chủng tộc thứ hai: thân gần skeleton nhất.

### Elf · Tiên Tộc
Sống lâu, ghét máy móc. Origin **Wayfarer**. Native Ranged/Arcane/Shadow; cấm Engineering (engineer, artificer, siege_gunner, architect) nhưng Alchemist vẫn mở. Ngọn: Ranger Lord (cưỡi hươu), Windrunner, Spellblade (Combat foreign nhưng có ngọn vì lai Arcane), Archmage → Starweaver, Moon Oracle, Thorn Warden (terminal T3). Body evolution Ancient / Wild. Hook: mọi đường đều cong một hướng, không góc vuông.

### Dwarf · Người Lùn
Origin **Delver**. Native Combat/Craft/Ranged (nỏ thay cung: cùng skill, khác overlay); **cấm Arcane** (không dùng phép) và Beast; Death chỉ nhánh Spirit (Necromancer cấm). Ngọn: Stone Sentinel, Ironbreaker, Runesmith (rune là khắc, cần Spirit), Forge King (T5), Gunner Captain, Ale Sage, Mountain King, Runelord, và nhánh Thạch Vu: Stonespeaker → Gem Oracle → Mountain Soul. Thân thấp 8 px, vai rộng: **overlay phải vẽ lại**, nên tốn.

### Beastfolk · Người Thú
Origin **Cub**. Native Beast/Martial/Combat; cấm Arcane và Craft; Death chỉ Soul (Totem Shaman). Ngọn: Moon Howler, Fang Rider, Primal Berserker, Alpha → Pack Lord, Totem Shaman. Đầu thú là thân, đuôi là lớp cape; mọi mũ trùm cần biến thể có khe tai. Evolution Feral chạy bốn chân = anim riêng.

### Merfolk · Hải Tộc
Origin **Drifter**. Native Arcane-Water (Fire cấm), Ranged bằng lao, Beast biển; cấm Death (ẩn: Abyss Priest từ Warlock) và Martial. Ngọn: Coral Sentinel, Harpoon Master, Tidecaller → Storm Siren, Leviathan Rider. **Quyết sớm có làm biến thể dưới nước (đuôi) không**, vì nó nhân đôi anim nền. Từ "Abyss" trùng với Abyss Sovereign của skeleton.

### Orc
Origin **Grunt**. Native Combat/Beast/Martial; cấm Arcane; Death chỉ Spirit/Curse (Blood Shaman). Ngọn: Berserker, Iron Hide, Wolf Rider, Siege Breaker (Craft foreign lai Combat), Blood Shaman, Warchief (T5). Vai rộng 6 px: overlay head/torso vẽ lại, weapon dùng lại. Trùng vai trò với Beastfolk: không chọn cả hai cho một game.

### Dragonkin · Long Nhân
Origin **Hatchling**. Native Arcane-Fire (Frost cấm) và Combat; cấm Shadow và Death. Ngọn: Flame Warden, Dragon Knight, Wyrm Caller → Elder Wyrm (cần evolution Winged, rig riêng), Scale Lord, Ember Sage. Hook: đuôi luôn thấy, sừng cong về sau, vũ khí răng cưa.

### Fae · Yêu Tinh
Origin **Sprite**. Native Arcane/Shadow/Beast; cấm Combat nặng (guard/phalanx/marshal) và Craft; Duelist/Blademaster mở như foreign. Ngọn: Trickster, Dreamweaver, Glamour Blade, Briar Warden, Court Mage → Archfae. Evolution theo đình Hạ / Đông đổi toàn bộ palette.

### Construct · Cơ Nhân
Origin **Unit**. Native Craft/Combat/Martial-Body; cấm Death, Beast, Shadow; không thở, không máu nên Monk và Alchemist cấm. Ngọn: War Frame, Siege Engine, Overseer → Core Sovereign, Juggernaut, Rune Frame. Khung kim loại gần skeleton nhất về cấu trúc: overlay dùng lại tốt, rẻ.

## Ý tưởng chưa đưa vào thư viện
Goblin (Craft + Shadow, thân nhỏ), Vampire/Dhampir (Death-Soul + Shadow, không có Origin "yếu"), Insectoid (Martial-Body + Craft, nhiều tay = phá rig), Giant (rig riêng hoàn toàn), Angelic/Fallen (Arcane-Light + Combat). Thêm khi một game cần, theo mục 4 của `../README.md`.

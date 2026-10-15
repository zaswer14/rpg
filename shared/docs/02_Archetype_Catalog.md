# Archetype Catalog — Khuôn nghề chung, dạng riêng theo chủng tộc và giáo phái

**Ngày:** 14/10/2026 · **Trạng thái:** thư viện thiết kế. **Chưa gắn vào game nào**; game chọn khuôn và dạng sau (mục 4). Dữ liệu: `../archetypes/*.js`, `../aspects.js`, `../faiths.js`; kiểm tra và tra cứu: `../catalog.js`; trang xem: `../catalog.html`. Hệ giáo phái: `03_Faiths.md`.

## 1. Ý tưởng

Một nghề như **Kỵ Sĩ** là thứ mọi chủng tộc đều hiểu, nhưng không ai nên chơi nó giống nhau: skeleton theo Hắc Giáo là Kỵ Sĩ Tử Vong cưỡi ngựa xương tự ráp lại, human theo Quang Minh là Kỵ Sĩ Ánh Sáng, human theo Hắc Giáo là Hắc Kỵ Sĩ, human không đạo là Kỵ Sĩ thường, người thú cưỡi lợn rừng chiến húc thay vì cầm thương, hải tộc cưỡi cua khổng lồ xung phong đi ngang.

Thư viện tách ba lớp:

| Lớp | Là gì | Dùng chung hay riêng |
|---|---|---|
| **Khuôn nghề** (archetype) | vai trò + giấc mơ chung: Kỵ Sĩ, Sát Thủ, Triệu Hồi Sư… | **chung**: rig và bộ anim, nhóm vũ khí, 3 cơ chế lõi (`core.kit`), mastery |
| **Dạng** (variant) | cách một chủng tộc và/hoặc một giáo phái sống trong khuôn đó | **riêng**: khí chất, một luật riêng (`twist`), ngoại hình nhận diện (`marker`), thú cưỡi/đồng hành, tên |
| **Đặt vào cây** (placement) | dạng nào vào game nào, ở Tier nào, gate gì | quyết theo từng game (mục 2, 4) |

Một dạng thuộc về **một chủng tộc** (`race:'skeleton'`), **một giáo phái cho mọi chủng tộc** (`race:'*', faith:'light'`), hoặc **cả hai** (`race:'skeleton', faith:'light'`). Khi nhân vật vào khuôn, dạng được chọn theo thứ tự: **chủng tộc + giáo phái › giáo phái › chủng tộc › dạng chung** (`catalog().resolve(arch, race, faith)`). Giáo phái mạnh hơn chủng tộc vì một tín ngưỡng đủ lớn để có dạng riêng thì biến đổi bất kỳ ai; chủng tộc muốn giữ chất riêng dưới tín ngưỡng đó thì khai dạng chủng tộc + giáo phái (skeleton + Quang Minh = Kỵ Sĩ Sám Hối thay vì Kỵ Sĩ Ánh Sáng).

**Khí chất** (`aspects.js`, 23 loại) là trục khác biệt thứ nhất giữa hai dạng cùng khuôn: màu nhấn, trạng thái gây lên địch, một luật gợi ý. Mỗi giáo phái gắn với một khí chất.

**Luật riêng** (`twist`) là trục thứ hai và quan trọng hơn: mỗi dạng phải đổi **một luật**, không chỉ đổi số.

## 2. Hai cách đặt một khuôn vào game (quyết sau, có thể trộn)

**A. Một ô, nhiều dạng.** Khuôn trở thành **một nghề chung** trong cây: một ID ô, một vị trí, một bộ gate, một Trial. Khi nhân vật chuyển vào ô đó, họ nhận dạng theo chủng tộc và giáo phái của mình (`resolve`). Chủng tộc có hai dạng loại trừ nhau (`excludes`) thì chọn một khi chuyển nghề. Không có dạng nào khớp thì dùng **dạng chung** (`generic`).
- Skill: 3 cơ chế lõi là skill chung có tham số khí chất; mỗi dạng thêm 1 skill riêng mang `twist`.
- Art: bộ anim vẽ một lần; mỗi dạng chỉ vẽ overlay (và thú cưỡi nếu có).

**B. Ngọn.** Dạng được đặt như một nghề riêng có gate và Trial: ngọn chủng tộc (`races/<race>.js → crowns`) hoặc ngọn tín ngưỡng (`faiths.js → crowns`, mọi chủng tộc theo giáo phái đó). Toàn bộ 115 ngọn hiện có là dạng đã đặt theo cách B; trường `crown` của dạng trỏ về chúng.

## 3. Quy tắc khi thêm dạng

1. **Một dạng = (chủng tộc và/hoặc giáo phái) + một khí chất + một luật riêng + một marker.** `race:'*'` bắt buộc có `faith`. Thiếu thì `catalog()` báo lỗi.
2. **Marker không trùng** trong toàn thư viện; đọc được ở 64 px.
3. **Quyền trường phái** (`races/*.js → schools`): dạng chủng tộc nằm trong trường phái bị cấm phải có `hidden` + `unlock`, `exception`, hoặc `faith` (tín ngưỡng là cánh cửa).
4. **Tên tiếng Anh không trùng**.
5. **Dạng loại trừ** khai báo hai chiều bằng `excludes`.
6. `tier` và `from` là gợi ý cho cách B; cách A dùng Tier của ô. Nếu dạng trỏ `crown`, tier và faith phải khớp ngọn.
7. Dạng chỉ là tên/ngoại hình của một nghề thân chung dùng `skinOf`.
8. Mỗi khuôn nên có ≥ 3 chủng tộc/tín ngưỡng có dạng riêng.
9. Ngọn tín ngưỡng chỉ mọc từ nghề thân chung hoặc ngọn cùng giáo phái; ngoại lệ duy nhất là nghề ẩn `unlock:'apostasy:…'` (bỏ đạo).

## 4. Chọn cho một game

1. Chọn 2–4 chủng tộc (`01_Race_Catalog.md`) và các giáo phái có trong game (`compose({ races, faiths })`; mặc định là cả 6).
2. Mở `catalog.html`, lọc theo chủng tộc / giáo phái, xem ma trận: hàng nào có dạng ở mọi chủng tộc đã chọn là ứng viên cách A. Cột cuối là dạng theo tín ngưỡng.
3. Cân chi phí hệ thống mới mà khuôn kéo theo (bảng dưới).
4. Với mỗi khuôn: cách A hay B; Tier của ô; cặp gate theo luật V12.
5. Ghi lựa chọn vào `games/<game>.js` (đề xuất trường `archetypes: { knight: { mode:'A', tier:4, from:['phalanx'] } }`, chưa có code đọc).

| Hệ mới cần làm | Khuôn / giáo phái kéo theo | Ghi chú |
|---|---|---|
| Devotion + blessing + giá giao kèo | mọi giáo phái | một hệ chung; Sanity (Vực Giáo) và cải tạo thân (Lò Rèn) là mở rộng |
| Rig cưỡi `mounted` (96×64) | Kỵ Sĩ, Kỵ Thú, Kỵ Sĩ Ánh Sáng / Hắc Kỵ Sĩ | đắt nhất; làm một lần |
| Bộ đòn `unarmed` | Võ Tăng, Cự Thể, Kẻ Hóa Thân | đã nằm trong backlog Brawler |
| Sheet hóa thân | Kẻ Hóa Thân, Tu Sĩ Rừng | mỗi dạng thú một sheet |
| Cơ chế nhịp (beat) | Nhạc Sư, Vũ Kiếm | dùng chung |
| Vũ khí mới: `lance`, `scythe`, `firearm`, `cannon`, `instrument`, `throwing`, `crossbow` | Kỵ Sĩ, Kẻ Gặt Hồn, Xạ Thủ Hỏa Khí, Pháo Thủ, Nhạc Sư, Lao Thủ, Xạ Thủ Tỉa | chưa có trong `schools.js → weapons` |
| Rig riêng cỡ lớn | Khung Titan, Kình Vương, Hóa Thân Tổ Linh, Đại Thú Linh | thân gấp đôi: sheet riêng, cân nhắc kỹ |
| Thân biến thể trong một chủng tộc | vài dạng của người thú | có `note`; phá rig |

## 5. Danh mục (sinh tự động)

Phần dưới đây sinh từ dữ liệu bằng `JobLibrary.catalogMarkdown()`. Không sửa tay: sửa `archetypes/*.js` rồi xuất lại (nút **Xuất Markdown** trên `catalog.html`, hoặc headless: `msedge --headless --dump-dom file:///…/shared/tools/export.html`, lấy khối `pre#md`; khối `pre#check` rỗng nghĩa là dữ liệu sạch).

<!-- BEGIN GENERATED -->

Số liệu: **34 khuôn nghề · 298 dạng** (156 dạng mới, 139/139 ngọn đã gắn khuôn trong đó 23 ngọn tín ngưỡng, 9 dạng ẩn, 8 dạng ngoại lệ trường phái; 6 giáo phái, 31 dạng gắn tín ngưỡng).

### Ma trận khuôn × chủng tộc

| Khuôn | Bộ Xương | Nhân Loại | Tiên Tộc | Người Lùn | Người Thú | Hải Tộc | Orc | Long Nhân | Yêu Tinh | Cơ Nhân | Theo tín ngưỡng (mọi chủng tộc) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Thủ Vệ** <br>Sentinel | Tường Hài Cốt | Thành Lũy | Vệ Vỏ Cây | Thạch Vệ<br>Phá Thiết | Lưng Mai | San Hô Vệ | Nanh Sắt | Hỏa Vệ | ✕ | Chiến Khung | Hắc Vệ ☾ |
| **Kỵ Sĩ** <br>Knight | Kỵ Sĩ Tử Vong ☾<br>Kỵ Sĩ Sám Hối ☀<br>Kỵ Sĩ Không Đầu | · | Kỵ Sĩ Ngân Giác | Kỵ Sĩ Hơi Nước | Kỵ Sĩ Nanh Ngà | Kỵ Sĩ Cua | · | Kỵ Sĩ Lưng Long<br>Bạo Chúa Trời | Kỵ Sĩ Thiêu Thân | Kỵ Sĩ Khung Máy | Kỵ Sĩ Ánh Sáng ☀<br>Hắc Kỵ Sĩ ☾ |
| **Kẻ Giữ Thề** <br>Oathbound | Kỵ Sĩ Kinh Hoàng ☾<br>Chúa Tể Vực Sâu ◉<br>Thánh Cốt ☀ | · | Kẻ Thề Trăng | Kẻ Thề Tổ Tiên | Kẻ Thề Bầy | Kẻ Thề Triều | Kẻ Thề Máu | Kẻ Thề Tro | Kỵ Sĩ Khế Ước | Kỵ Sĩ Chỉ Thị | Thánh Kỵ Sĩ ☀<br>Kẻ Phá Thề ☾ ◆<br>Thánh Sống ☀<br>Hắc Chúa ☾ |
| **Cuồng Chiến** <br>Berserker | Cốt Cuồng<br>Long Cốt Chiến Chúa ◆ | Kẻ Tự Hành | · | Kẻ Tìm Mệnh | Cuồng Thú | Cuồng Triều | Cuồng Chiến<br>Huyết Chiến Tướng<br>Chiến Thần Nhập Thế | Long Nộ | · | Khung Quá Tải | · |
| **Kiếm Hào** <br>Blademaster | Kiếm Hồn | Kiếm Thánh<br>Lính Đánh Thuê | · | · | Lãng Khách Vuốt | Kiếm Khách Triều | · | Kiếm Khách Nanh Rồng | · | Kiếm Hiệu Chuẩn | · |
| **Thương Kỵ Nhảy** <br>Dragoon | Kẻ Xiên | Thương Thủ Trời | · | · | Thương Thủ Chân Lò Xo | Thợ Lặn Đinh Ba | · | Long Kỵ Sĩ<br>Long Vương | ✕ | Thương Pít-tông | · |
| **Thống Soái** <br>Warlord | Thống Soái Quân Đoàn | Chiến Chúa<br>Thủ Lĩnh Tự Do<br>Kẻ Tạo Vua | · | Sơn Vương<br>Lãnh Chúa Hầm | Bầy Chúa | Đô Đốc Triều | Chiến Tù Trưởng | · | ✕ | · | Thập Tự Chúa ☀ |
| **Xạ Thủ Tỉa** <br>Sniper | Xạ Thủ U Linh | · | Phong Hành Giả | Nỏ Thủ Râu Dài | Mắt Ưng | · | · | Xạ Thủ Than | Kim Gai | Đơn Vị Quang Học | · |
| **Kiểm Lâm** <br>Warden | Thợ Săn Vĩnh Hằng | Biệt Kích Rừng | Gai Vệ | Tuần Hầm | Kẻ Đánh Hơi | Kẻ Quăng Lưới | · | · | Kẻ Giữ Vòng Nấm | · | · |
| **Xạ Thủ Hỏa Khí** <br>Gunslinger | Súng Thủ Mộ Phần | Hỏa Mai Thủ<br>Thần Xạ | · | Lôi Súng Thủ | · | Xạ Thủ Nước Mặn | Súng Nổ | · | · | Pháo Tay | · |
| **Lao Thủ** <br>Harpooner | Kẻ Ném Sườn | Lao Binh | Vòng Đao Sĩ | · | Kẻ Quăng Thòng Lọng | Lao Sư | Kẻ Ném Rìu | · | · | · | · |
| **Sát Thủ** <br>Assassin | Sát Thủ Đoạt Hồn<br>Lời Thì Thầm Tử Vong | Hắc Diện | Dạ Kiếm | · | Vuốt Câm | Dòng Ngầm | · | ✕ | Nụ Hôn Gai | ✕ | Thập Tự Bóng ☾ |
| **Kẻ Lừa Phỉnh** <br>Trickster | Xương Giả Chết | Kẻ Bịp | Bóng Gương | · | Hồ Ly | Ảo Thủy | · | · | Tiểu Quỷ Trêu<br>Kẻ Lừa Phỉnh<br>Vương Tử Dối Trá | · | · |
| **Thợ Săn Phù Thủy** <br>Witch Hunter | Thủ Mộ | · | Kẻ Trộm Phép | Kẻ Phá Rune | · | · | Phá Pháp | · | · | Đơn Vị Vô Hiệu | Phán Quan ☀<br>Trừ Tà Sư ☀ |
| **Kẻ Cướp Phá** <br>Raider | Kẻ Tàn Phá Lăng Mộ | Cướp Đường | · | Kẻ Phá Kho | Đạo Chích Gấu Mèo | Hải Tặc | Kẻ Vơ Vét | · | Kẻ Đánh Tráo | · | · |
| **Kẻ Rình Rập** <br>Stalker | Kẻ Rình Rập Bóng Tối | · | Lá Ẩn | Kẻ Đào Sâu | Kẻ Giăng Tơ | Kẻ Rình Rạn | · | ✕ | Ma Trơi | ✕ | · |
| **Đại Pháp Sư** <br>Archmage | Hầm Xương Băng<br>Vu Yêu Pha Lê ◆ | Thời Pháp Sư | Đại Pháp Sư<br>Kẻ Dệt Sao | ✕ | ✕ | Triệu Triều<br>Bão Nhân Ngư | ✕ | Pháp Sư Than Hồng | Đình Pháp Sư<br>Đại Yêu | Khung Rune<br>Kỳ Dị Điểm | · |
| **Pháp Kiếm** <br>Spellblade | Kiếm Nguyền | Chiến Pháp Sư | Pháp Kiếm<br>Nhật Thực Kiếm | · | · | Thủy Kiếm | · | Hỏa Kiếm | Ảo Kiếm | Kiếm Hồ Quang | · |
| **Triệu Hồi Sư** <br>Summoner | Vu Yêu<br>Chúa Tể Tử Vong | Thuật Sĩ Khế Ước | Kẻ Gọi Rừng | · | · | Kẻ Gọi Thủy Quái | · | Triệu Long | Chúa Bầy Tiên | Kẻ Lắp Ráp<br>Tâm Trí Bầy<br>Siêu Trí | · |
| **Nhạc Sư** <br>Bard | Kẻ Gõ Sườn | Hát Rong | Kẻ Dệt Khúc<br>Người Giữ Khúc Cổ<br>Ca Giả Thế Giới | Trống Trận | Kẻ Hú Ca | Nhân Ngư Ca<br>Hải Mẫu | Trống Sọ | · | Kẻ Thổi Sáo Dụ | · | · |
| **Vu Sư** <br>Shaman | Kẻ Gieo Xương | · | Kẻ Nói Với Hoang Dã | Kẻ Nói Với Đá<br>Bảo Thạch Tiên Tri<br>Hồn Núi | Pháp Sư Totem<br>Đại Thú Linh | Chúa Chìm ◉ ◆ | Huyết Vu<br>Hóa Thân Huyết Thần | · | · | ✕ | Kẻ Nói Với Tổ Tiên ⌂<br>Hóa Thân Tổ Linh ⌂<br>Tư Tế Vực Sâu ◉ ◆<br>Tiên Tri Chết Chìm ◉ |
| **Kẻ Nguyền** <br>Hexer | Kẻ Nguyền Băng Vải<br>Chúa Mộ Vải | Dị Giáo Đồ ◆<br>Phù Thủy | Phù Thủy Gai | · | · | Phù Thủy Biển ◆ | Thầy Bùa | ✕ | Bà Phù Thủy Đông | ✕ | Tiên Tri Hắc Ám ☾<br>Giáo Chủ Dị Giáo ☾ |
| **Kẻ Gặt Hồn** <br>Reaper | Tử Thần | · | Kẻ Gặt Mùa Thu | · | Bọ Ngựa | · | Kẻ Thu Hoạch Xương | · | · | · | · |
| **Tư Tế** <br>Mender | Kẻ Dệt Linh Hồn | · | Nguyệt Tiên Tri | Tư Tế Lò Sưởi | Người Giữ Hang | Nữ Tư Tế Triều | · | Tư Tế Phượng Hoàng | Kẻ Dệt Mộng<br>Mộng Vương | Đơn Vị Sửa Chữa | Mục Sư ☀<br>Hồng Y ☀<br>Tư Tế Thống Khổ ☾ |
| **Pháo Thủ** <br>Artillerist | Cối Hài Cốt | Pháo Binh Cối | · | Pháo Trưởng | · | Pháo San Hô | Phá Thành<br>Kẻ Phá Thế Giới | Pháo Thủ Long Hỏa | · | Cỗ Máy Công Thành | · |
| **Thầy Cự Nhân** <br>Golemancer | Kẻ Ráp Cự Cốt<br>Xương Đồng Hồ ◆ | Phi Công Cơ Giáp | · | Thợ Rèn Cự Nhân | ✕ | · | Trùm Sắt Vụn | · | · | Giám Sát Viên<br>Lõi Chúa | · |
| **Luyện Kim Sư** <br>Alchemist | Thợ Ướp Xác | Kẻ Chuyển Hóa | Luyện Sương | Tửu Sư | ✕ | Luyện Kim Nước Mặn | · | Luyện Lưu Huỳnh | ✕ | · | · |
| **Thợ Rune** <br>Runesmith | Thợ Khắc Xương | Thợ Phù Phép | Kẻ Hát Ký Tự | Thợ Rune<br>Rune Chúa<br>Lò Rèn Vương | ✕ | · | · | Thợ Rèn Vảy | · | Thợ Khắc Lõi | Tư Tế Lò Rèn ⚙<br>Thiết Tiên Tri ⚙<br>Cỗ Máy Đức Tin ⚙ |
| **Thuần Thú Sư** <br>Beastmaster | Đội Trưởng Cuộc Săn | Người Nuôi Ưng | · | · | Hú Nguyệt | Kẻ Gọi Cá Mập | Kẻ Thuần Thú Dữ | Kẻ Nuôi Long Câu | Kẻ Nuôi Ong | · | · |
| **Kỵ Thú** <br>Beast Rider | · | Kỵ Sư Tử Đầu Ưng | Chúa Tể Kiểm Lâm<br>Trưởng Lão Rừng Già | ✕ | Kỵ Nha<br>Đỉnh Thú | Kỵ Hải Thú<br>Kình Vương | Kỵ Sói | · | Gai Vệ Yêu<br>Gai Vương | ✕ | · |
| **Kẻ Hóa Thân** <br>Shapeshifter | Kẻ Nắn Xương | Người Sói Nguyền ◆ | · | · | Hóa Hình<br>Người Hóa Thú<br>Thú Thần | Hải Cẩu Tinh | · | Cổ Long | Yêu Biến Hình | Khung Tái Cấu Hình | Tu Sĩ Rừng ❦<br>Đại Tu Sĩ Rừng ❦ |
| **Võ Tăng** <br>Monk | · | Đại Tông Sư<br>Huyền Thoại Sống | Phong Bộ | Tửu Quyền | Hổ Quyền | ✕ | · | Phượng Hoàng Tái Sinh<br>Hỏa Hiền | · | · | · |
| **Cự Thể** <br>Colossus | Cự Cốt | · | · | Thạch Thể | Thủ Lĩnh Bầy | · | Thiết Bì | Lân Chúa | · | Cự Cơ<br>Khung Titan | · |
| **Vũ Kiếm** <br>Bladedancer | Vũ Điệu Tử Thần | Vũ Đao | Kiếm Ca | · | · | Vũ Triều | · | Vũ Hỏa | Vũ Công Hội Hè | · | · |

✕ = chủng tộc cấm trường phái của khuôn · · = vào được nhưng chưa có dạng riêng (dùng dạng chung) · ◆ = dạng ẩn · ☀ Thánh Giáo Quang Minh · ☾ Hắc Giáo · ❦ Cổ Thần Hoang Dã · ⌂ Tổ Linh Đạo · ◉ Vực Giáo · ⚙ Giáo Hội Lò Rèn

### Chiến đấu (Combat)

#### Thủ Vệ / Sentinel — `sentinel` · T3–4

Bức tường sống giữa đồng đội và kẻ thù; thắng bằng việc không lùi.

- **Lõi chung:** Giơ khiên giữ nút: chặn sát thương phía trước, không bị đẩy lùi · Khiêu khích: kéo địch gần về mình · Phản đòn khi chặn đúng nhịp
- **Dùng chung:** Bộ anim block/counter của Guard; khiên là overlay riêng từng dạng. Vũ khí: swordshield, spearshield. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Thủ Vệ / Sentinel — khiên tháp cao tới cằm.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Tường Hài Cốt** / Ossuary Wall | 3 | Tử Linh | Mỗi địch chết gần đó ghép thêm một mảnh xương vào khiên (giáp tích lũy); khiên đầy thì vỡ thành mảnh bắn ra phía trước. | khiên ghép từ xương sườn, sọ ở tâm |  |
| Nhân Loại | **Thành Lũy** / Bastion | 3 | Thép | Cắm khiên xuống đất thành vật cản thật: đồng minh nấp sau, đứng lên được như platform; nhặt lại mới đánh tiếp. | khiên tháp có chân chống + huy hiệu phe |  |
| Tiên Tộc | **Vệ Vỏ Cây** / Bark Guardian | 3 | Tự Nhiên | Khiên gỗ sống vỡ thì mọc lại sau vài giây; giữ chặn hồi máu chậm cho đồng minh đứng sau lưng. | khiên vỏ cây còn lá non ở mép |  |
| Người Lùn | **Thạch Vệ** / Stone Sentinel | 3 | Thạch | Giơ khiên thì không bị đẩy lùi chút nào, nhưng cũng không nhảy được. | khiên tháp đá nguyên khối + mũ đá | ngọn có sẵn `stone_sentinel` |
| Người Lùn | **Phá Thiết** / Ironbreaker | 4 | Thép | Mỗi lần chặn thành công tích Phá Thiết; đòn rìu kế tiếp phá giáp theo số tầng. | hai rìu ngắn + mũ mặt nạ sắt | ngọn có sẵn `ironbreaker` |
| Người Thú | **Lưng Mai** / Shellback | 3 | Thạch | Không cầm khiên: thu mình vào mai (bất động, gần như miễn sát thương) rồi lăn tông về một hướng. | mai rùa trên lưng thay khiên | Dạng thân rùa của người thú: cần biến thể thân, không chỉ overlay. |
| Hải Tộc | **San Hô Vệ** / Coral Sentinel | 3 | Thủy Triều | Chặn đòn tích Thủy trong khiên vỏ sò; xả thành sóng đẩy lùi cả hàng địch. | khiên vỏ sò khổng lồ + san hô trên vai | ngọn có sẵn `coral_sentinel` |
| Orc | **Nanh Sắt** / Iron Tusk | 3 | Hoang Dã | Khiên có nanh: chặn xong lao khiên húc thẳng, đẩy địch vào tường gây choáng. | khiên tròn đóng hai nanh lợn rừng |  |
| Long Nhân | **Hỏa Vệ** / Flame Warden | 3 | Hỏa | Chặn thành công thì phun một luồng lửa ngắn ra trước. | khiên tròn có lò lửa ở tâm | ngọn có sẵn `flame_warden` |
| Cơ Nhân | **Chiến Khung** / War Frame | 4 | Cơ Khí | Khiên gắn liền cẳng tay, không bao giờ hạ; chế độ Neo biến thân thành vật cản bất động. | khiên liền tay + bánh xích ở chân | ngọn có sẵn `war_frame` |
| Mọi chủng tộc · ☾ Hắc Giáo | **Hắc Vệ** / Blackguard | 3 | Hắc Ám | Chặn đòn thì hút máu kẻ đánh; khiêu khích tốn 3% máu nhưng kéo cả hàng địch. | khiên đen có mặt trăng khuyết + xích quấn tay | ngọn có sẵn `blackguard` |

#### Kỵ Sĩ / Knight — `knight` · T3–5

Giáp nặng trên lưng chiến thú; xung phong mở trận, xuống ngựa vẫn đánh được.

- **Lõi chung:** Xung phong: lao theo đường thẳng, sát thương tăng theo quãng đường · Lên/xuống thú cưỡi: hai bộ đòn (cưỡi và đi bộ) · Quét thương từ lưng thú
- **Dùng chung:** Một bộ anim cưỡi chung (idle/gallop/rear/jump/charge, khung 96×64); mỗi dạng chỉ vẽ lại sprite thú cưỡi và người. Vũ khí: lance, swordshield. Rig: `mounted`.
- **Dạng chung (không có dạng riêng):** Kỵ Sĩ / Knight — chiến mã có giáp + cờ đuôi thương.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương · ☾ Hắc Giáo | **Kỵ Sĩ Tử Vong** / Death Knight | 4 | Tử Linh | Ngựa không chết hẳn: hết máu thì tan thành đống xương rồi tự ráp lại sau 6s (trong lúc đó kỵ sĩ đi bộ). Xung phong để lại vệt lửa hồn. | mũ mặt sọ + ngựa xương có giáp mảnh | ngọn có sẵn `death_knight`; cưỡi: ngựa xương lửa hồn; Dạng skeleton + Hắc Giáo. Crown V12.3 hiện đi bộ; chọn dạng này nghĩa là thêm ngựa xương (rig mounted). |
| Bộ Xương · ☀ Thánh Giáo Quang Minh | **Kỵ Sĩ Sám Hối** / Penitent Knight | 4 | Ánh Sáng | Undead thề với Ánh Sáng: hào quang thiêu chính mình 1% máu/3s; mỗi undead bị hạ hồi lại toàn bộ phần đã mất. Xung phong để lại vệt sáng thiêu undead. | xương phủ vải thánh trắng ố + ngựa xương quấn băng | ngọn có sẵn `penitent_knight`; cưỡi: ngựa xương quấn băng thánh |
| Bộ Xương | **Kỵ Sĩ Không Đầu** / Headless Horseman | 5 | Hồn Hỏa | Ném chính sọ mình như bom lửa hồn rồi gọi về; khi sọ rời thân, ngựa tự lao về điểm sọ rơi. | sọ cầm trên tay, cổ trống | ngọn có sẵn `headless_horseman`; cưỡi: ngựa xương lửa lạnh |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Kỵ Sĩ Ánh Sáng** / Radiant Knight | 4 | Ánh Sáng | Xung phong để lại vệt sáng hồi máu đồng minh đi qua; đòn đầu tiên sau xung phong gây Chói. Mọi chủng tộc theo Quang Minh (trừ skeleton: có dạng Sám Hối riêng). | thương có cờ mặt trời + khăn trắng trên mũ | ngọn có sẵn `radiant_knight`; loại trừ: dark_knight; cưỡi: ngựa trắng giáp vàng |
| Mọi chủng tộc · ☾ Hắc Giáo | **Hắc Kỵ Sĩ** / Dark Knight | 4 | Hắc Ám | Mỗi lần xung phong tự trả 5% máu; hút máu theo sát thương; máu càng thấp đòn càng nặng. Mọi chủng tộc theo Hắc Giáo (trừ skeleton: Kỵ Sĩ Tử Vong). | mũ sừng gãy + áo choàng rách đỏ sẫm | ngọn có sẵn `dark_knight`; loại trừ: radiant_knight; cưỡi: ngựa đen mắt đỏ |
| Tiên Tộc | **Kỵ Sĩ Ngân Giác** / Silverhorn Knight | 4 | Nguyệt | Xung phong xuyên qua địch không dừng, nửa đường cuối tàng hình; mạnh hơn trong vùng tối. | thú cưỡi một sừng bạc + thương mảnh | cưỡi: nai một sừng bạc |
| Người Thú | **Kỵ Sĩ Nanh Ngà** / Tusk Knight | 4 | Hoang Dã | Không có thương: thú cưỡi húc là đòn chính. Xung phong không dừng được giữa chừng nhưng xuyên giáp. | nanh thú bọc sắt + yên da lông | cưỡi: lợn rừng chiến / tê giác |
| Người Lùn | **Kỵ Sĩ Hơi Nước** / Steam Knight | 4 | Cơ Khí | Xung phong tốn Nhiệt; quá nhiệt thì máy đứng 2s nhưng xả hơi gây bỏng quanh. | lợn máy phun hơi + mũ kính | ngoại lệ: Beast bị cấm với dwarf: thú cưỡi là cỗ máy, dùng Engineering thay Riding.; cưỡi: lợn máy đồng thau |
| Hải Tộc | **Kỵ Sĩ Cua** / Crab Knight | 4 | Thủy Triều | Xung phong đi ngang hai chiều không cần quay đầu; càng cua kẹp giữ mục tiêu; thu càng thì vỏ chặn từ mọi phía. | cua lớn + đinh ba | cưỡi: cua khổng lồ |
| Long Nhân | **Kỵ Sĩ Lưng Long** / Drakeback Knight | 4 | Hỏa | Cưỡi chính con long câu đã nuôi từ T3; thú phun lửa theo hướng xung phong; xuống thú thì nó đánh độc lập như thuộc hạ. | long câu vảy đỏ đủ lớn để cưỡi + giáp vảy | ngọn có sẵn `drakeback_knight`; cưỡi: long câu không cánh đã tự nuôi |
| Long Nhân | **Bạo Chúa Trời** / Sky Tyrant | 5 | Hỏa | Kỵ thú duy nhất bay thật: lượn trên màn rồi bổ nhào; thú trúng đòn nhiều thì rơi, đi bộ tới khi hồi. | long câu có cánh + thương dài, kỵ sĩ không mũ | ngọn có sẵn `sky_tyrant`; cưỡi: long câu có cánh (rig bay riêng) |
| Yêu Tinh | **Kỵ Sĩ Thiêu Thân** / Moth Knight | 4 | Mị Ảo | Xung phong trên không (bay ngắn), rắc phấn gây Mê trên đường bay. | bướm đêm cánh mắt cú + thương mảnh như kim | ngoại lệ: Combat nặng bị cấm với fae: đây là kỵ nhẹ, không giáp, dùng Riding + Arcane.; cưỡi: bướm đêm khổng lồ |
| Cơ Nhân | **Kỵ Sĩ Khung Máy** / Chassis Knight | 4 | Cơ Khí | Không xuống thú được (thân liền khung); bù lại không bao giờ bị hất ngã, xung phong hồi nhanh. | thân người máy gắn liền khung bốn chân (nhân mã cơ khí) | cưỡi: nửa dưới là khung bốn chân |

#### Kẻ Giữ Thề / Oathbound — `oathbound` · T3–5

Chiến binh mượn sức mạnh từ một lời thề với thế lực lớn hơn mình; giữ thề thì mạnh, phá thề thì mất.

- **Lõi chung:** Lời Thề: tài nguyên tích khi giữ điều kiện thề, mất khi vi phạm · Phán Quyết: xả toàn bộ Lời Thề vào một nhát · Hào quang nhỏ quanh thân
- **Dùng chung:** Anim của Guard/Duelist; dạng khác nhau ở điều kiện thề, màu và hào quang. Vũ khí: sword, swordshield. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kẻ Giữ Thề / Oathbound — dải băng lời thề quấn tay cầm vũ khí.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương · ☾ Hắc Giáo | **Kỵ Sĩ Kinh Hoàng** / Dread Knight | 3 | Tử Linh | Thề với cái chết (ký kết Hắc Giáo): tích Thề khi đứng gần địch đang bị Curse. Vứt khiên, đại kiếm. | mũ kín không mào + xích, không khiên | ngọn có sẵn `dread_knight` |
| Bộ Xương · ◉ Vực Giáo | **Chúa Tể Vực Sâu** / Abyss Sovereign | 5 | Vực Sâu | Đổi đạo từ Hắc Giáo sang Vực Giáo: mỗi đòn kéo địch về phía mình; Phán Quyết là sóng xung kích trọng lực. | pauldron khổng lồ + khe nứt đỏ | ngọn có sẵn `abyss_sovereign`; Trùng từ khóa "Abyss" với Abyss Priest (Vực Giáo). |
| Bộ Xương · ☀ Thánh Giáo Quang Minh | **Thánh Cốt** / Ossuary Saint | 5 | Ánh Sáng | Xương được thánh hóa: Thề tích khi chịu đòn thay đồng minh; chết lần nữa thì tan thành ánh sáng hồi sinh mọi đồng minh với 50% máu. | xương trắng tinh phát sáng từ trong + không giáp, không vũ khí | ngọn có sẵn `ossuary_saint` |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Thánh Kỵ Sĩ** / Paladin | 3 | Ánh Sáng | Thề bảo hộ: tích Thề khi chặn đòn thay đồng minh; Phán Quyết hồi máu vùng. Cửa vào nhánh chiến của Quang Minh cho mọi chủng tộc. | khiên mặt trời + áo choàng trắng vai | ngọn có sẵn `paladin` |
| Mọi chủng tộc · ☾ Hắc Giáo | **Kẻ Phá Thề** / Oathbreaker | 4 | Hắc Ám | Lời Thề âm: tích khi đồng minh gục hoặc khi tự bỏ chặn; Phán Quyết hút máu mọi địch quanh. | khiên mặt trời bị cào nát + ánh sáng tím | ngọn có sẵn `oathbreaker`; ẩn (apostasy:light→dark); Dạng ẩn: chỉ Thánh Kỵ Sĩ bỏ đạo sang Hắc Giáo mới mở. Mọi chủng tộc. |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Thánh Sống** / Living Saint | 5 | Ánh Sáng | Thề không hề vơi: Thề tích từ cả đồng minh (họ chặn/hồi cũng tính cho mình). Chết một lần thì hồi sinh với hào quang thiêu mọi thứ 5s. | hào quang thật sau đầu + không mũ, không khiên | ngọn có sẵn `living_saint` |
| Mọi chủng tộc · ☾ Hắc Giáo | **Hắc Chúa** / Fell Sovereign | 5 | Hắc Ám | Trả toàn bộ Devotion để bất tử 8s; trong lúc đó mọi sát thương nhận được trở thành nợ, trả bằng máu sau khi hết. | vương miện gai đen mọc từ da + áo choàng bằng bóng | ngọn có sẵn `fell_sovereign` |
| Tiên Tộc | **Kẻ Thề Trăng** / Moonsworn | 3 | Nguyệt | Sức mạnh theo pha trăng: trận chia 3 pha (đầy–khuyết–mới), mỗi pha một bộ đòn khác. | trăng lưỡi liềm khắc trên giáp ngực |  |
| Người Lùn | **Kẻ Thề Tổ Tiên** / Ancestor-Sworn | 3 | Tổ Linh | Lần đầu xuống dưới 10% máu, hồn tổ tiên hiện ra đánh cùng 5s (một lần mỗi trận). | tượng tổ tiên nhỏ đeo ngực + râu tết chỉ vàng |  |
| Người Thú | **Kẻ Thề Bầy** / Packsworn | 3 | Hoang Dã | Thề với bầy: Thề tăng theo số đồng minh/thuộc hạ ở gần; đứng một mình thì mất dần. | vòng cổ răng của cả bầy |  |
| Orc | **Kẻ Thề Máu** / Bloodsworn | 3 | Huyết | Trả máu để nạp Thề tức thì; Phán Quyết hồi lại phần máu đã trả nếu kết liễu. | vết cắt sơn đỏ ngang lòng bàn tay + dao nghi lễ |  |
| Hải Tộc | **Kẻ Thề Triều** / Tidesworn | 3 | Thủy Triều | Thề lên xuống theo thủy triều (chu kỳ 20s): triều lên thì thủ mạnh, triều xuống thì công mạnh. | vạch đo triều khắc dọc khiên |  |
| Long Nhân | **Kẻ Thề Tro** / Ashsworn | 3 | Hỏa | Thề không lùi: mỗi bước lùi mất Thề; Phán Quyết là cột lửa tại chỗ đứng. | tro phủ vảy, mắt than hồng |  |
| Yêu Tinh | **Kỵ Sĩ Khế Ước** / Pact Knight | 4 | Mị Ảo | Ký khế với một kẻ địch: nếu kẻ đó đánh ai khác ngoài mình thì nhận sát thương phạt. | cuộn khế ước bay quanh + kiếm mỏng | ngoại lệ: Combat foreign qua nhánh kiếm mỏng (duelist). |
| Cơ Nhân | **Kỵ Sĩ Chỉ Thị** / Directive Knight | 3 | Phù Văn | Lời thề là dòng lệnh khắc trong lõi: chọn một chỉ thị đầu trận (Bảo vệ / Tiêu diệt / Sống sót), mỗi chỉ thị một điều kiện tích Thề. | dòng chữ rune chạy quanh lõi ngực |  |

#### Cuồng Chiến / Berserker — `berserker` · T3–5

Bỏ phòng thủ để đổi lấy cơn điên; máu càng ít càng nguy hiểm.

- **Lõi chung:** Cuồng Nộ: thanh rage tích khi gây/nhận sát thương · Trạng thái Điên: không bị khựng, đánh nhanh hơn, không chặn được · Lao bổ từ trên cao
- **Dùng chung:** Anim rìu của Raider/Duelist; dạng Điên là palette + hiệu ứng, không phải sheet mới (trừ ghi chú). Vũ khí: axe, sword. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Cuồng Chiến / Berserker — không giáp ngực, hai vũ khí.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Cốt Cuồng** / Bone Reaver | 3 | Tử Linh | Khi Điên, xương rơi rụng: mỗi đòn trúng bắn mảnh xương ra quanh. Chết trong lúc Điên thì tự ráp lại một lần với 20% máu. | xương sườn gãy lởm chởm + rìu cắm mảnh xương |  |
| Bộ Xương | **Long Cốt Chiến Chúa** / Dragonbone Warlord | 5 | Hỏa | Body Evolution Dragonbone: Điên mở hơi thở rồng xương và không giới hạn thời gian khi đang kết liễu liên tục. | sừng xương từ sọ + vảy xương vai | ngọn có sẵn `dragonbone_warlord`; ẩn (item:dragon_heart) |
| Nhân Loại | **Kẻ Tự Hành** / Flagellant | 3 | Ánh Sáng | Tự quất roi để tích rage (mất máu); đòn khi Điên mang sát thương thánh, hồi máu đồng minh gần một phần. | roi gai + áo vải bố rách, đầu cạo |  |
| Người Lùn | **Kẻ Tìm Mệnh** / Doomseeker | 3 | Tổ Linh | Tìm cái chết vinh quang: sát thương tăng theo máu tối đa của mục tiêu (rất mạnh với boss); không hồi máu được khi Điên. | tóc dựng nhuộm cam + không giáp + rìu lớn |  |
| Người Thú | **Cuồng Thú** / Primal Berserker | 3 | Hoang Dã | Điên là nửa hóa thú: chạy bốn chân, vồ thay chém. | hai rìu + sơn máu trên mặt | ngọn có sẵn `primal_berserker`; Chạy bốn chân là anim riêng. |
| Orc | **Cuồng Chiến** / Berserker | 3 | Huyết | Rage tích nhanh nhất game; Điên kéo dài thêm mỗi lần kết liễu. | không giáp + hai rìu + sơn chiến | ngọn có sẵn `berserker` |
| Orc | **Huyết Chiến Tướng** / Blood Champion | 4 | Huyết | Rage không giảm khi hết Điên; mỗi kết liễu trong lúc Điên treo một xương lên giáp (+giáp tích lũy tới hết trận). | xương địch đóng vào giáp vai + rìu có dây xích | ngọn có sẵn `blood_champion` |
| Orc | **Chiến Thần Nhập Thế** / War Incarnate | 5 | Huyết | Dưới 1 máu không chết trong lúc Điên; Điên vô hạn chừng nào còn kết liễu mỗi 4s. | thân đỏ rực như than + hai rìu to bằng cửa + không bao giờ đứng thẳng | ngọn có sẵn `war_incarnate` |
| Hải Tộc | **Cuồng Triều** / Bloodtide Reaver | 3 | Huyết | Ngửi máu như cá mập: Điên mạnh gấp đôi lên địch dưới 50% máu, tự lao tới mục tiêu yếu nhất. | răng cá mập + hai dao móc |  |
| Long Nhân | **Long Nộ** / Wyrmrage | 3 | Hỏa | Điên làm vảy nóng đỏ: thở lửa xen giữa combo, nhưng tự đốt máu mỗi giây. | vảy nứt phát sáng đỏ + rìu răng cưa |  |
| Cơ Nhân | **Khung Quá Tải** / Overdrive Frame | 3 | Cơ Khí | Rage là nhiệt; Điên là tháo giới hạn an toàn. Hết Điên thì tắt máy, choáng 1,5s. | van xả hơi đỏ trên lưng + khớp phát sáng |  |

#### Kiếm Hào / Blademaster — `blademaster` · T3–5

Một người, một kiếm, không thừa động tác.

- **Lõi chung:** Đỡ đòn đúng nhịp (parry) mở phản công · Chuỗi chém có hủy đòn (cancel) vào né · Rút kiếm chém: nạp rồi chém một nhát cực nhanh
- **Dùng chung:** Anim kiếm của Duelist; khác nhau ở kiếm và luật parry. Vũ khí: sword. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kiếm Hào / Blademaster — một kiếm, không khiên.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kiếm Hồn** / Sword Wraith | 4 | Hồn Hỏa | Nửa dưới mờ: lướt xuyên địch trong lúc chém; parry trúng thì nhát kế tiếp xuyên giáp. | khăn quàng dài bay + nửa dưới mờ | ngọn có sẵn `sword_wraith` |
| Nhân Loại | **Kiếm Thánh** / Sword Saint | 4 | Khí | Cửa sổ parry rộng nhất game, parry không tốn gì và hồi stamina; đổi lại không có đòn diện rộng. | kiếm thẳng dài + băng trán, không giáp |  |
| Nhân Loại | **Lính Đánh Thuê** / Sellsword | 3 | Thép | Dùng mọi vũ khí cận chiến (đổi bộ đòn thường giữa trận); nhận hợp đồng đầu trận (giết X / sống Y giây) lấy vàng đổi buff ngay. | giáp chắp vá nhiều phe + túi tiền to ở hông | ngọn có sẵn `sellsword` |
| Người Thú | **Lãng Khách Vuốt** / Claw Ronin | 4 | Hoang Dã | Kiếm cong tay phải, vuốt tay trái: sau mỗi parry được một đòn vuốt miễn phí không tính vào combo. | nón rộng vành + đuôi mèo |  |
| Long Nhân | **Kiếm Khách Nanh Rồng** / Fang Duelist | 4 | Hỏa | Kiếm răng cưa nung đỏ: đòn chém để lại Bỏng cộng dồn; rút kiếm chém kích nổ khi đủ 5 tầng. | kiếm răng cưa đỏ rực |  |
| Hải Tộc | **Kiếm Khách Triều** / Tide Fencer | 4 | Thủy Triều | Kiếm liễu đâm nhanh; mỗi đâm trúng đẩy nhẹ để giữ đúng khoảng cách tối ưu. | kiếm liễu bằng xương cá + áo vảy bạc |  |
| Cơ Nhân | **Kiếm Hiệu Chuẩn** / Calibrated Blade | 4 | Cơ Khí | Ghi lại combo địch: bị trúng cùng một đòn 3 lần thì tự động parry đòn đó cho tới hết trận. | một mắt ống kính đỏ + kiếm lưỡi thẳng tuyệt đối |  |

#### Thương Kỵ Nhảy / Dragoon — `lancer` · T3–5

Cây thương và bầu trời: nhảy thật cao, cắm thẳng xuống.

- **Lõi chung:** Nhảy cao rồi lao cắm xuống (dive), sát thương theo độ cao · Đâm xa · Chống thương bật nhảy (vault) qua địch/hố
- **Dùng chung:** Anim thương của Phalanx + bộ jump/dive chung. Rất hợp platformer. Vũ khí: spearshield, lance. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Thương Kỵ Nhảy / Dragoon — thương dài hơn người + giáp chân nặng.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Xiên** / Impaler | 3 | Tử Linh | Thương xiên địch và mang theo; địch bị xiên trở thành vật ném ở đòn kế tiếp. | thương dài có ngạnh + sọ cắm đầu thương |  |
| Nhân Loại | **Thương Thủ Trời** / Sky Lancer | 3 | Phong | Nhảy cao gấp đôi, lơ lửng 0,5s để chọn điểm rơi. | mũ cánh chim + thương cờ dài |  |
| Người Thú | **Thương Thủ Chân Lò Xo** / Springheel Lancer | 3 | Hoang Dã | Nhảy kép, chạm tường bật nhảy; dive không cần độ cao tối thiểu. | tai thỏ/linh dương + chân sau dài | Thân thỏ/linh dương: biến thể đầu và chân. |
| Hải Tộc | **Thợ Lặn Đinh Ba** / Trident Diver | 3 | Thủy Triều | Dive tạo vũng nước; đứng trong vũng thì nhảy cao hơn và chạy nhanh hơn. | đinh ba + vây lưng dựng |  |
| Long Nhân | **Long Kỵ Sĩ** / Dragon Knight | 4 | Hỏa | Dive để lại vòng lửa; thương dài bốc lửa ở đầu. | thương dài có lửa + giáp vảy đỏ | ngọn có sẵn `dragon_knight` |
| Long Nhân | **Long Vương** / Dragon Lord | 5 | Hỏa | Dive để lại cột lửa đứng 4s; hai rồng con bay theo (thuộc hạ hound) lao vào điểm dive. | vương miện sừng + thương là xương sống rồng + áo choàng vảy vàng | ngọn có sẵn `dragon_lord` |
| Cơ Nhân | **Thương Pít-tông** / Piston Lancer | 3 | Cơ Khí | Thương bắn ra như pít-tông (tầm đột ngột gấp đôi); nhảy bằng chân lò xo nạp lực. | thương có xi-lanh + chân lò xo |  |

#### Thống Soái / Warlord — `warlord` · T4–5

Thắng trận bằng người khác: cờ, tiếng hô, đội hình.

- **Lõi chung:** Cắm cờ: vùng buff đồng minh/thuộc hạ · Hiệu lệnh: buff tức thì (tấn công / giữ / rút) · Gọi viện binh: lính tạm có thời hạn
- **Dùng chung:** Anim của Marshal; cờ là overlay lớn sau lưng, mỗi dạng một cờ. Vũ khí: spearshield, sword. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Thống Soái / Marshal — mào ngang + cờ hiệu.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Thống Soái Quân Đoàn** / Legion Marshal | 4 | Tử Linh | Địch chết trong vùng cờ dựng lại thành lính xương tạm, tính vào cap thuộc hạ. | cờ rách gắn sọ + mào ngang | là nghề chung `marshal` |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Thập Tự Chúa** / Crusader Lord | 4 | Ánh Sáng | Cờ thánh: đồng minh trong vùng hồi máu khi gây sát thương. Mọi chủng tộc theo Quang Minh. | cờ thập tự cắm lưng + mũ vương miện hở mặt | ngọn có sẵn `crusader_lord` |
| Người Lùn | **Sơn Vương** / Mountain King | 5 | Thạch | Cờ là chính mình: đứng yên 2s thì hóa đá một phần (miễn khống chế, phản sát thương) và thành vùng buff; thét làm sập trần. | vương miện đá + rìu hai lưỡi to bằng người + áo choàng da gấu | ngọn có sẵn `mountain_king` |
| Nhân Loại | **Chiến Chúa** / Warlord | 5 | Thép | Ba hiệu lệnh đổi tức thì không hồi chiêu chung; viện binh là đội hình 3 lính khiên. | cờ lớn sau lưng + giáp vàng | ngọn có sẵn `warlord` |
| Nhân Loại | **Thủ Lĩnh Tự Do** / Free Captain | 4 | Thép | Cờ trắng có túi tiền: viện binh là lính đánh thuê trả bằng vàng (chọn melee/ranged lúc gọi); không trả thì bỏ đi. | mũ sĩ quan không huy hiệu + cờ trắng có túi tiền | ngọn có sẵn `free_captain` |
| Nhân Loại | **Kẻ Tạo Vua** / Kingmaker | 5 | Thép | Mua chuộc: trả vàng biến một địch thường thành thuộc hạ vĩnh viễn trong trận; boss mua được 5s ngừng đánh. | áo choàng vua mặc hờ, vương miện cầm tay chứ không đội | ngọn có sẵn `kingmaker` |
| Người Lùn | **Lãnh Chúa Hầm** / Thane | 4 | Tổ Linh | Cờ là bia đá khắc tên tổ tiên: cắm xuống thành vật cản thật kèm vùng buff. | bia đá đeo lưng + mũ có cánh sắt |  |
| Người Thú | **Bầy Chúa** / Pack Lord | 5 | Hoang Dã | Không cờ: tiếng hú là hiệu lệnh, 3 thú đi theo nhận buff gấp đôi. | áo choàng da thủ lĩnh cũ + 3 thú đi theo | ngọn có sẵn `pack_lord` |
| Orc | **Chiến Tù Trưởng** / Warchief | 5 | Huyết | Hiệu lệnh tăng rage cho cả đội thay vì sát thương phẳng. | cờ xương lớn + mũ sừng thú | ngọn có sẵn `warchief` |
| Hải Tộc | **Đô Đốc Triều** / Tide Admiral | 4 | Thủy Triều | Cờ là mỏ neo cắm xuống tạo vũng nước; viện binh trồi lên từ vũng. | mỏ neo vác vai + mũ đô đốc san hô |  |

### Tầm xa (Ranged)

#### Xạ Thủ Tỉa / Sniper — `sniper` · T3–5

Một phát, đúng chỗ, từ rất xa.

- **Lõi chung:** Ngắm: giữ nút tăng sát thương và độ xuyên · Đánh dấu điểm yếu · Lùi nhảy tạo khoảng cách
- **Dùng chung:** Anim kéo cung/quỳ ngắm của Marksman; vũ khí là overlay riêng. Vũ khí: bow, crossbow. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Xạ Thủ / Sniper — quỳ ngắm, một mắt bịt.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Xạ Thủ U Linh** / Phantom Sniper | 4 | Hồn Hỏa | Tên hồn xuyên vật cản và xuyên mọi mục tiêu trên đường bay. | một hốc mắt bịt vải + tên đuôi ma | ngọn có sẵn `phantom_sniper` |
| Tiên Tộc | **Phong Hành Giả** / Windrunner | 4 | Phong | Bắn được khi đang chạy/nhảy mà không mất độ chính xác; tên bay cong theo gió. | cung dài cong như lưỡi liềm + khăn bay ngang | ngọn có sẵn `windrunner` |
| Người Lùn | **Nỏ Thủ Râu Dài** / Longbeard Arbalist | 4 | Thép | Nỏ nặng có chân chống: đứng yên thì phát bắn xuyên 3 mục tiêu; không bắn được khi di chuyển. | nỏ lớn có chân chống + râu tết qua vai |  |
| Người Thú | **Mắt Ưng** / Hawkeye | 4 | Phong | Bắn khi đang lượn (giữ nhảy để lượn); từ trên cao thì mọi phát đều chí mạng lên mục tiêu dưới thấp. | cánh tay có lông vũ + mỏ chim | Dạng thân chim của người thú. |
| Yêu Tinh | **Kim Gai** / Thorn Needle | 4 | Độc | Ống thổi kim độc không tiếng động: trúng không làm địch phát hiện; độc cộng dồn thay vì một phát lớn. | ống thổi bằng cọng sậy + bao kim |  |
| Long Nhân | **Xạ Thủ Than** / Cinder Marksman | 4 | Hỏa | Tên nung: chỗ tên rơi cháy thành vùng lửa nhỏ, chặn đường địch. | ống tên phát sáng than hồng |  |
| Cơ Nhân | **Đơn Vị Quang Học** / Optic Unit | 4 | Cơ Khí | Mắt ống kính tự khóa mục tiêu sau 1,5s không cần giữ nút; bị đánh trúng thì mất khóa. | đầu là một ống kính lớn xoay được |  |

#### Kiểm Lâm / Warden — `warden` · T3–5

Thợ săn biến chiến trường thành bãi săn của mình.

- **Lõi chung:** Đặt bẫy (tối đa N cái cùng lúc) · Đánh dấu con mồi xuyên màn · Đọc địa hình: thưởng khi ở trên cao hoặc sau vật cản
- **Dùng chung:** Anim của Hunter; bẫy là prop riêng mỗi dạng. Vũ khí: bow, dagger. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kiểm Lâm / Warden — áo choàng ngụy trang + túi bẫy.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Thợ Săn Vĩnh Hằng** / Eternal Huntsman | 5 | Hồn Hỏa | Dấu ấn con mồi tồn tại qua màn; mục tiêu đã đánh dấu không thể tàng hình. | mũ rộng vành + áo choàng da ghép | ngọn có sẵn `eternal_huntsman` |
| Nhân Loại | **Biệt Kích Rừng** / Ranger | 3 | Thép | Bẫy kẹp sắt + pháo hiệu soi sáng vùng tối, làm lộ địch tàng hình. | áo choàng lá + tù và nhỏ |  |
| Tiên Tộc | **Gai Vệ** / Thorn Warden | 3 | Tự Nhiên | Bẫy là rễ mọc từ sàn giữ chân; gai mọc từ cánh tay làm đòn cận chiến. | gai mọc từ cánh tay + bẫy rễ | ngọn có sẵn `thorn_warden` |
| Người Lùn | **Tuần Hầm** / Tunnel Warden | 3 | Thạch | Bẫy là sập trần: kích hoạt làm đá rơi; mạnh nhất trong màn hầm có trần thấp. | đèn mũ + cuộn dây mìn |  |
| Người Thú | **Kẻ Đánh Hơi** / Scent Tracker | 3 | Hoang Dã | Không đặt bẫy: đánh dấu bằng mùi, thấy mục tiêu qua tường; đòn đầu vào mục tiêu đã đánh hơi luôn chí mạng. | mũi to + túi thảo dược quanh cổ |  |
| Hải Tộc | **Kẻ Quăng Lưới** / Netcaster | 3 | Thủy Triều | Bẫy di động: quăng lưới giữ địch rồi kéo về; lưới rơi trên sàn thành bẫy dính. | lưới cuộn vai + phao bằng sọ cá |  |
| Yêu Tinh | **Kẻ Giữ Vòng Nấm** / Ring Keeper | 3 | Mị Ảo | Bẫy là vòng nấm: địch bước vào bị dịch chuyển tới vòng khác hoặc nhảy múa (Mê) 2s. | vòng nấm phát sáng quanh chân + mũ nấm |  |

#### Xạ Thủ Hỏa Khí / Gunslinger — `gunslinger` · T3–5

Thuốc súng thay dây cung: tiếng nổ to, nạp đạn chậm.

- **Lõi chung:** Băng đạn và nạp đạn (quản lý số phát) · Bắn từ hông khi chạy · Phát đặc biệt theo dạng (xuyên / chùm / nổ)
- **Dùng chung:** Một bộ anim súng (aim/fire/reload) cho mọi dạng; Firearm là mastery con chưa nghề nào dùng. Vũ khí: firearm. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Xạ Thủ Hỏa Khí / Gunslinger — súng ngắn bên hông + đai đạn.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Súng Thủ Mộ Phần** / Grave Pistoleer | 3 | Hồn Hỏa | Đạn là răng/xương nhồi lửa hồn: nhặt mảnh xương từ địch chết thì nạp đạn tức thì. | hai súng lục cổ + đai đạn bằng răng |  |
| Nhân Loại | **Hỏa Mai Thủ** / Musketeer | 4 | Thép | Một phát lớn rồi nạp lâu; lưỡi lê cho cận chiến trong lúc nạp. | súng hỏa mai dài + mũ lông vũ | ngọn có sẵn `musketeer` |
| Nhân Loại | **Thần Xạ** / Deadeye | 5 | Thép | Một viên: đứng yên 3s rồi bắn xuyên toàn bộ màn theo đường thẳng; băng đạn chỉ 1 viên, nạp 6s. | súng trường dài hơn người + áo khoác dài không tay | ngọn có sẵn `deadeye` |
| Người Lùn | **Lôi Súng Thủ** / Thunderer | 3 | Lôi | Súng mồi lửa nổ cực to: mỗi phát làm khựng mọi địch ở gần (kể cả phía sau). | súng nòng loe + nút bịt tai |  |
| Orc | **Súng Nổ** / Boomstick | 3 | Hỏa | Súng chùm tự chế, sát thương gấp đôi nhưng có tỉ lệ nổ nòng tự gây sát thương. | súng chùm buộc dây thép + khói đen |  |
| Hải Tộc | **Xạ Thủ Nước Mặn** / Brine Gunner | 3 | Thủy Triều | Súng nước áp lực: đẩy lùi, làm Ướt (đòn sét lên mục tiêu Ướt gấp đôi). Nạp đạn bằng vũng nước. | súng vỏ ốc có bình nước sau lưng |  |
| Cơ Nhân | **Pháo Tay** / Arm Cannon | 3 | Cơ Khí | Tay biến thành nòng: không nạp đạn, thay bằng nhiệt; quá nhiệt thì tay không dùng được 3s. | cẳng tay phải là nòng pháo |  |

#### Lao Thủ / Harpooner — `harpooner` · T3–4

Vũ khí ném có đường về: kéo địch tới mình hoặc kéo mình tới địch.

- **Lõi chung:** Ném vũ khí có dây: kéo địch về hoặc kéo mình tới · Thu hồi vũ khí (bắt được thì thưởng) · Ném chùm
- **Dùng chung:** Anim throw/throw_aim đã có trong pipeline; dây là hiệu ứng chung. Vũ khí: throwing. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Lao Thủ / Harpooner — lao có dây cuộn hông.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Ném Sườn** / Rib Hurler | 3 | Tử Linh | Ném chính xương sườn mình như boomerang: mỗi cây đang bay giảm giáp nhưng tăng sát thương; thu về thì hồi giáp. | lồng ngực thiếu vài xương sườn |  |
| Nhân Loại | **Lao Binh** / Javelineer | 3 | Thép | Lao nặng cắm vào tường/đất thành bậc nhảy tạm (platform) cho cả đội. | bó lao sau lưng + khiên tròn nhỏ |  |
| Tiên Tộc | **Vòng Đao Sĩ** / Chakram Dancer | 3 | Nguyệt | Chakram nảy giữa tối đa 4 mục tiêu rồi quay về; bắt đúng nhịp thì ném lại ngay. | hai vòng đao bạc đeo hông |  |
| Người Thú | **Kẻ Quăng Thòng Lọng** / Bola Runner | 3 | Hoang Dã | Thòng lọng trói chân: chạy vòng quanh mục tiêu bị trói thì quật ngã. | bola đá quấn quanh người |  |
| Hải Tộc | **Lao Sư** / Harpoon Master | 4 | Thủy Triều | Lao có tời: kéo địch nặng về hoặc tự kéo mình qua hố. | lao có dây tời + cuộn dây hông | ngọn có sẵn `harpoon_master` |
| Orc | **Kẻ Ném Rìu** / Axe Hurler | 3 | Huyết | Rìu xoáy bay ra rồi quay về; bắt được rìu khi quay về thì đòn sau mạnh gấp đôi. | bốn rìu nhỏ trên đai chéo ngực |  |

### Bóng tối (Shadow)

#### Sát Thủ / Assassin — `assassin` · T3–5

Không ai thấy tới, không ai thấy đi.

- **Lõi chung:** Tàng hình ngắn · Đâm lưng: nhân sát thương khi đánh từ phía sau · Thoát: dịch chuyển sau đòn kết liễu
- **Dùng chung:** Anim song đao của Assassin; dạng khác nhau ở cách tiếp cận và kết liễu. Vũ khí: dagger. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Sát Thủ / Assassin — song đao + khăn bịt mặt.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Sát Thủ Đoạt Hồn** / Soul Assassin | 4 | Hồn Hỏa | Combo trúng đích trích hồn: càng nối chuỗi chuẩn càng mạnh, hụt một nhát thì mất chuỗi. | nửa mặt nạ xương + lọ hồn treo đai | ngọn có sẵn `soul_assassin` |
| Bộ Xương | **Lời Thì Thầm Tử Vong** / Death Whisper | 5 | Tử Linh | Combo chớp nhoáng kết bằng xử quyết; thoát thân miễn phí sau mỗi kết liễu. | mặt nạ xương trơn, tối giản tuyệt đối | ngọn có sẵn `death_whisper` |
| Nhân Loại | **Hắc Diện** / Blackmask | 3 | Độc | Bôi độc lên dao: độc cộng dồn; kết liễu mục tiêu trúng độc làm độc lan sang địch gần. | mặt nạ đen trơn + lọ độc ở cổ tay |  |
| Tiên Tộc | **Dạ Kiếm** / Nightblade | 3 | Nguyệt | Đứng trong vùng tối là tàng hình thật, không cần skill; bước ra ánh sáng thì mất. | áo choàng màu đêm có viền bạc + dao cong |  |
| Người Thú | **Vuốt Câm** / Silent Claw | 3 | Hoang Dã | Không đâm lưng: vồ từ trên cao (pounce) xuống mục tiêu, sát thương theo độ cao rơi. | thân báo đen + vuốt dài |  |
| Hải Tộc | **Dòng Ngầm** / Undertow | 3 | Vực Sâu | Lặn vào vũng nước/bóng tối như nước, trồi lên dưới chân địch và kéo xuống (khống chế). | da tối có đốm phát quang + dao móc |  |
| Yêu Tinh | **Nụ Hôn Gai** / Thornkiss | 3 | Mị Ảo | Hôn gây Mê; mục tiêu đang Mê nhận gấp ba sát thương đâm lưng. | môi tím + kim cài tóc làm vũ khí |  |
| Mọi chủng tộc · ☾ Hắc Giáo | **Thập Tự Bóng** / Shadow Cross | 4 | Hắc Ám | Hợp đồng: ký lên một mục tiêu (đánh dấu, tốn 5% máu); mục tiêu đã ký nhận gấp đôi sát thương, mọi mục tiêu khác chỉ 70%. Mọi chủng tộc theo Hắc Giáo. | hai dao chéo khắc trăng + mặt nạ nửa | ngọn có sẵn `shadow_cross` |

#### Kẻ Lừa Phỉnh / Trickster — `trickster` · T3–5

Thắng bằng việc làm kẻ địch đánh nhầm chỗ.

- **Lõi chung:** Mồi nhử/phân thân hút sự chú ý của AI · Hoán đổi vị trí với mồi nhử · Đòn giả (feint): phạt địch phản ứng sai
- **Dùng chung:** Phân thân dùng lại sprite của chính nhân vật (đổi alpha/palette): gần như không tốn art. Vũ khí: dagger, sword. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kẻ Lừa Phỉnh / Trickster — mặt nạ cười.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Xương Giả Chết** / Bone Mimic | 3 | Tử Linh | Giả chết: sụp thành đống xương (miễn sát thương, địch mất mục tiêu) rồi ráp lại phía sau lưng kẻ gần nhất. | khớp buộc chỉ đỏ lỏng lẻo + mặt nạ cười cắm trên sọ |  |
| Nhân Loại | **Kẻ Bịp** / Charlatan | 3 | Độc | Mồi nhử là hình nộm rơm, bị đánh vỡ thì nổ bột cay (mù + ho). | mũ chóp cao + vali đầy mánh |  |
| Tiên Tộc | **Bóng Gương** / Mirrorshade | 3 | Nguyệt | Dựng gương: đạn và phép bắn vào gương bị phản lại; hoán đổi chỗ với gương. | gương tròn bạc đeo lưng |  |
| Người Thú | **Hồ Ly** / Fox Spirit | 4 | Mị Ảo | Mỗi đuôi là một phân thân (tối đa 3 rồi 9 ở bậc cao); phân thân bị đánh vỡ thì mất đuôi cho tới hết trận. | nhiều đuôi cáo xòe quạt |  |
| Hải Tộc | **Ảo Thủy** / Mirage | 3 | Thủy Triều | Gọi sương biển: trong sương có ba bóng giống hệt, đòn từ bóng thật mới gây sát thương. | sương mù quấn chân + vảy óng ánh |  |
| Yêu Tinh | **Tiểu Quỷ Trêu** / Puck | 3 | Mị Ảo | Đánh tráo: đổi vị trí hai địch, đổi vũ khí địch thành đồ chơi 3s, đổi chỗ với đồng minh đang nguy. | mũ chuông + đuôi áo hai màu + luôn cười | ngọn có sẵn `puck` |
| Yêu Tinh | **Kẻ Lừa Phỉnh** / Trickster | 4 | Mị Ảo | Luôn có hai ảo ảnh của chính mình; mọi đòn feint đều tạo thêm một ảo ảnh. | mặt nạ cười + hai ảo ảnh | ngọn có sẵn `trickster` |
| Yêu Tinh | **Vương Tử Dối Trá** / Prince of Lies | 5 | Mị Ảo | Đảo thật giả: ảo ảnh gây sát thương thật, bản thân không bị đánh trúng cho tới khi ảo ảnh cuối vỡ. | mặt nạ không có mặt sau, vương miện là bóng đổ + 4 ảo ảnh | ngọn có sẵn `prince_of_lies` |

#### Thợ Săn Phù Thủy / Witch Hunter — `witch_hunter` · T3–4

Kẻ sinh ra để giết người dùng phép.

- **Lõi chung:** Đánh dấu caster: tăng sát thương lên kẻ đang thi triển/triệu hồi · Cắt phép (interrupt) · Kháng phép bản thân
- **Dùng chung:** Anim của Stalker + một phát nỏ tay. Vũ khí: sword, crossbow. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Thợ Săn Phù Thủy / Witch Hunter — mũ rộng vành + nỏ tay.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Thủ Mộ** / Grave Warden | 3 | Tử Linh | Săn chính đồng loại: đánh trúng undead/thuộc hạ dưới 30% máu thì "trả về yên nghỉ" (giết ngay). | đèn lồng mộ + chùm chìa khóa lớn |  |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Phán Quan** / Inquisitor | 4 | Ánh Sáng | Xích bạc trói caster; mục tiêu bị trói không thi triển được. Mọi chủng tộc theo Quang Minh. | mũ rộng vành + xích bạc + sách | ngọn có sẵn `inquisitor` |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Trừ Tà Sư** / Exorcist | 3 | Ánh Sáng | Săn undead và curse thay vì caster: chuông bạc làm undead/thuộc hạ địch khựng; giam hồn địch bị hạ để chặn hồi sinh. | chuông bạc + sách kinh xích tay | ngọn có sẵn `exorcist`; Ngọn Quang Minh thuộc trường phái Death nhìn từ phía Ánh Sáng. |
| Tiên Tộc | **Kẻ Trộm Phép** / Spellthief | 3 | Huyền | Cắt phép thành công thì được dùng lại đúng phép vừa cắt một lần. | găng tay khắc vòng phép + túi đựng tia sáng |  |
| Người Lùn | **Kẻ Phá Rune** / Runebreaker | 3 | Phù Văn | Đập vỡ vùng phép/bẫy phép trên sàn và hấp thụ thành giáp. | búa nhỏ đầu tù + găng sắt có rune gạch chéo |  |
| Orc | **Phá Pháp** / Mage Breaker | 3 | Huyết | Ghét phép tận xương: miễn khống chế phép khi đang tích rage; đòn đầu tiên lên caster gây choáng. | gậy sắt + bùa caster treo làm chiến lợi phẩm |  |
| Cơ Nhân | **Đơn Vị Vô Hiệu** / Null Unit | 3 | Cơ Khí | Bật trường triệt phép quanh mình: không ai thi triển được trong vùng, kể cả đồng minh. | ăng-ten vòng trên đầu + lõi tối màu |  |

#### Kẻ Cướp Phá / Raider — `raider` · T3–4

Đánh nhanh, lấy đồ, chạy trước khi ai kịp phản ứng.

- **Lõi chung:** Cướp: đòn trúng có thể rơi tài nguyên hoặc cướp buff của địch · Đánh rồi chạy: tăng tốc sau mỗi đòn trúng · Ném đồ cướp được
- **Dùng chung:** Anim của Bandit; túi đồ cướp là overlay lớn dần theo trận. Vũ khí: dagger, axe. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kẻ Cướp Phá / Raider — túi chiến lợi phẩm + rìu ngắn.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Tàn Phá Lăng Mộ** / Grave Marauder | 3 | Tử Linh | Đòn rìu rộng, dồn sát thương; phòng thủ yếu. | vương miện cướp được đội lệch + đai chiến lợi phẩm | ngọn có sẵn `grave_marauder` |
| Nhân Loại | **Cướp Đường** / Highwayman | 3 | Thép | Súng lục một phát + kiếm; tiền cướp được ném ra thành sát thương ("ném vàng"). | khăn che nửa mặt + áo khoác dài + súng lục |  |
| Người Lùn | **Kẻ Phá Kho** / Vault Breaker | 3 | Thạch | Phá rương/cửa/vật cản cực nhanh; ném thuốc nổ nhỏ làm sập nền. | xà beng + dây thuốc nổ quấn ngực |  |
| Người Thú | **Đạo Chích Gấu Mèo** / Trash Bandit | 3 | Hoang Dã | Nhặt mọi thứ trên sàn (xác, đá, đạn rơi) làm đạn ném, mỗi loại một hiệu ứng. | mặt nạ lông gấu mèo + túi rác phồng | Thân gấu mèo. |
| Hải Tộc | **Hải Tặc** / Corsair | 3 | Thủy Triều | Móc câu đu dây qua hố (grapple swing); cướp buff của địch bị móc. | mũ ba góc san hô + móc câu thay tay |  |
| Orc | **Kẻ Vơ Vét** / Plunderer | 3 | Huyết | Túi cướp càng đầy càng chậm nhưng càng cứng; đổ túi ra thành một làn đồ vật quét sàn. | bao tải khổng lồ trên lưng |  |
| Yêu Tinh | **Kẻ Đánh Tráo** / Changeling | 3 | Mị Ảo | Bị đánh trúng thì sao chép đòn thường của kẻ đánh, dùng thay đòn của mình cho tới lần sao chép sau. | mặt không rõ nét, đổi theo kẻ vừa đánh |  |

#### Kẻ Rình Rập / Stalker — `stalker` · T3–4

Đôi mắt của cả đội; ở chỗ không ai nghĩ có người.

- **Lõi chung:** Leo tường và trần · Tàng hình khi đứng yên · Trinh sát: thấy địch qua tường, đánh dấu cho đồng đội
- **Dùng chung:** Anim climb/cling của Stalker (cần làm một lần cho mọi dạng). Vũ khí: dagger. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kẻ Rình Rập / Stalker — mũ trùm không mặt + móng leo.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Rình Rập Bóng Tối** / Shade Stalker | 3 | Hồn Hỏa | Tàng hình ngắn sau mỗi lần né; giá trị cơ động cao hơn sát thương. | mũ trùm không mặt, hốc mắt sáng mờ | là nghề chung `stalker` |
| Tiên Tộc | **Lá Ẩn** / Shadowleaf | 3 | Tự Nhiên | Đứng trong cỏ/bụi là vô hình hoàn toàn; có thể trồng bụi cây tạm. | áo choàng lá sống phủ kín |  |
| Người Lùn | **Kẻ Đào Sâu** / Deep Delver | 3 | Thạch | Đào xuyên sàn: di chuyển dưới đất rồi trồi lên hất tung địch phía trên. | găng đào có vuốt + kính bảo hộ |  |
| Người Thú | **Kẻ Giăng Tơ** / Webstalker | 3 | Độc | Giăng tơ làm đường leo tạm và bẫy dính; treo ngược trên trần để đánh xuống. | thêm một cặp tay nhện + tơ trắng | Thân nhện: phá rig (thêm tay); cân nhắc kỹ. |
| Hải Tộc | **Kẻ Rình Rạn** / Reef Lurker | 3 | Thủy Triều | Đổi màu như bạch tuộc: đứng sát tường thì vô hình; phun mực che tầm nhìn. | da đổi màu + xúc tu thay tóc |  |
| Yêu Tinh | **Ma Trơi** / Will-o-Wisp | 3 | Mị Ảo | Hóa đốm sáng để di chuyển (không đánh được và không bị đánh); dụ AI địch đi lạc theo mình. | đèn lồng ma trơi thay đầu khi hóa |  |

### Huyền thuật (Arcane)

#### Đại Pháp Sư / Archmage — `archmage` · T3–5

Pháp sư thuần túy: không giáp, không vũ khí, chỉ có phép và khoảng cách.

- **Lõi chung:** Kết hợp: hai phép liên tiếp tạo phép thứ ba · Kênh phép: giữ nút để tăng sức · Lá chắn mana
- **Dùng chung:** Anim cast/channel của Elementalist; khí chất đổi hiệu ứng và màu, dùng lại 20 skill nguyên tố có sẵn. Vũ khí: focus. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Đại Pháp Sư / Archmage — mũ nhọn + gậy hai nhánh.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Hầm Xương Băng** / Frost Ossuary | 3 | Băng | Băng mọc trên xương thành giáp; phép băng để lại gai băng trên sàn làm địa hình. | thân phủ vảy băng + hơi lạnh tỏa chân | Từ docs/13 mục 6.1. |
| Bộ Xương | **Vu Yêu Pha Lê** / Crystal Lich | 5 | Huyền | Body Evolution Crystal: phép phản xạ qua các tinh thể đặt sẵn trên sàn. | sọ trong suốt thấy bình phách | ngọn có sẵn `crystal_lich`; ẩn (item:crystal_phylactery) |
| Nhân Loại | **Thời Pháp Sư** / Chronomancer | 4 | Huyền | Tua lại 3s: trả vị trí và máu của bản thân về 3 giây trước; làm chậm thời gian quanh một điểm. | đồng hồ cát lơ lửng sau vai |  |
| Tiên Tộc | **Đại Pháp Sư** / Archmage | 4 | Huyền | Kết hợp bốn nguyên tố: mọi cặp đều có phép thứ ba riêng. | mũ nhọn cao + gậy hai nhánh | ngọn có sẵn `archmage` |
| Tiên Tộc | **Kẻ Dệt Sao** / Starweaver | 5 | Nguyệt | Chòm sao quay quanh người làm đạn tự động; nối sao thành hình để tung tuyệt kỹ. | chòm sao quay quanh người, không gậy | ngọn có sẵn `starweaver` |
| Hải Tộc | **Triệu Triều** / Tidecaller | 4 | Thủy Triều | Dâng nước làm ngập một phần màn: vùng ngập là sân nhà (nhanh hơn, phép mạnh hơn). | nước xoáy quanh chân + gậy san hô | ngọn có sẵn `tidecaller` |
| Hải Tộc | **Bão Nhân Ngư** / Storm Siren | 5 | Lôi | Sét dẫn qua nước: mọi vũng nước trở thành vùng sét. | tóc thành sóng + sét trong nước | ngọn có sẵn `storm_siren` |
| Long Nhân | **Pháp Sư Than Hồng** / Cinder Magus | 4 | Hỏa | Mọi phép để lại than; tự giẫm qua than thì hồi mana, địch giẫm thì bỏng. | áo bào cháy mép + vảy hở lửa |  |
| Yêu Tinh | **Đình Pháp Sư** / Court Mage | 4 | Mị Ảo | Theo đình Hạ (hoa, hồi phục) hoặc Đông (băng, khống chế), chọn khi chuyển nghề. | áo bào màu đình + gậy hoa/băng | ngọn có sẵn `court_mage` |
| Yêu Tinh | **Đại Yêu** / Archfae | 5 | Mị Ảo | Ra luật cho trận đấu: mỗi 20s đặt một "luật đình" mới áp lên mọi sinh vật. | vương miện hoa/băng + cánh lớn hơn | ngọn có sẵn `archfae` |
| Cơ Nhân | **Khung Rune** / Rune Frame | 4 | Phù Văn | Rune khắc kín thân là kho phép; bắn từ lòng bàn tay, không gậy. | rune khắc kín thân | ngọn có sẵn `rune_frame` |
| Cơ Nhân | **Kỳ Dị Điểm** / Singularity | 5 | Huyền | Mở điểm trọng lực tại lõi: kéo mọi đạn và địch về mình trong 4s rồi nổ; khi đang mở không di chuyển được. | lõi là một điểm đen hút ánh sáng + thân nổi cách sàn | ngọn có sẵn `singularity` |

#### Pháp Kiếm / Spellblade — `spellblade` · T3–5

Kiếm và phép là một động tác.

- **Lõi chung:** Phù phép vũ khí: đổi khí chất của đòn thường · Chém phép: nhát kiếm bắn sóng phép · Parry hút phép thành mana
- **Dùng chung:** Anim kiếm của Duelist + một anim cast tay trái. Vũ khí: sword, focus. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Pháp Kiếm / Spellblade — kiếm phát sáng sống lưỡi.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kiếm Nguyền** / Hexblade | 4 | Hắc Ám | Kiếm khắc lời nguyền: mỗi nhát tích Curse, đủ 5 tầng thì nổ. | kiếm đen khắc chữ phát sáng tím |  |
| Nhân Loại | **Chiến Pháp Sư** / Battlemage | 4 | Lôi | Kiếm dẫn sét: nhát chém nối sét sang tối đa 3 địch gần. | giáp nửa người + găng đồng dẫn sét |  |
| Tiên Tộc | **Pháp Kiếm** / Spellblade | 4 | Huyền | Tay trái cầm orb: đổi khí chất của kiếm giữa combo không ngắt chuỗi. | kiếm cong sáng sống lưỡi + orb tay trái | ngọn có sẵn `spellblade` |
| Tiên Tộc | **Nhật Thực Kiếm** / Eclipse Blade | 5 | Nguyệt | Hai kiếm: Sáng (chậm, sát thương lớn) và Tối (nhanh, hút máu), đổi không ngắt combo; nhật thực = cầm cả hai 5s, mỗi nhát mang cả hai hiệu ứng. | hai kiếm một sáng một tối xoay quanh người khi không cầm | ngọn có sẵn `eclipse_blade` |
| Long Nhân | **Hỏa Kiếm** / Flameblade | 4 | Hỏa | Hơi thở lửa là một nhịp trong combo kiếm; kiếm bốc lửa khi combo dài. | kiếm lưỡi lửa + khói từ mũi |  |
| Hải Tộc | **Thủy Kiếm** / Tideblade | 4 | Thủy Triều | Lưỡi kiếm bằng nước: kéo dài/thu ngắn giữa combo để đổi tầm đánh. | chuôi kiếm vỏ ốc, lưỡi là dòng nước |  |
| Yêu Tinh | **Ảo Kiếm** / Glamour Blade | 4 | Mị Ảo | Kiếm vô hình: địch không đọc được tầm đánh; chỉ thấy vệt sau nhát chém. | kiếm vô hình (chỉ thấy vệt) + găng ren | ngọn có sẵn `glamour_blade` |
| Cơ Nhân | **Kiếm Hồ Quang** / Arc Saber | 4 | Lôi | Lưỡi hồ quang: sát thương cao nhưng quá nhiệt; tắt lưỡi để hồi nhiệt bằng đòn đấm. | chuôi kim loại, lưỡi là tia hồ quang |  |

#### Triệu Hồi Sư / Summoner — `summoner` · T3–5

Bản thân yếu, đạo quân mạnh.

- **Lõi chung:** Gọi thuộc hạ (cap theo nghề) · Ra lệnh: tập trung / rút về · Hiến tế thuộc hạ: nổ hoặc hồi máu
- **Dùng chung:** Hệ thuộc hạ V12.2 (turret / ranged / melee / hound) dùng chung; mỗi dạng chỉ đổi sprite thuộc hạ và một luật riêng. Vũ khí: focus. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Triệu Hồi Sư / Summoner — vòng triệu hồi dưới chân.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Vu Yêu** / Lich | 4 | Tử Linh | Biến vị trí xác thành bài toán: dựng lính ngay tại xác địch; bản thân chậm. | vương miện liền sọ + bình phách trong lồng ngực | ngọn có sẵn `lich` |
| Bộ Xương | **Chúa Tể Tử Vong** / Death Sovereign | 5 | Tử Linh | Vùng chiến đấu của riêng mình: thuộc hạ trong vùng không hết thời gian. | vầng sọ + áo bào bằng hồn | ngọn có sẵn `death_sovereign` |
| Nhân Loại | **Thuật Sĩ Khế Ước** / Conjurer | 4 | Huyền | Vẽ vòng triệu hồi trên sàn: thực thể gọi ra rất mạnh nhưng chỉ tồn tại trong vòng. | phấn vẽ vòng + sách khế ước xích tay |  |
| Tiên Tộc | **Kẻ Gọi Rừng** / Grove Caller | 4 | Tự Nhiên | Gọi người cây chậm và chắc; ra lệnh mọc rễ biến người cây thành tường đứng yên. | hạt giống phát sáng đeo cổ + gậy cành sống |  |
| Hải Tộc | **Kẻ Gọi Thủy Quái** / Kraken Caller | 4 | Vực Sâu | Xúc tu trồi từ vũng nước (thuộc hạ kiểu turret) quấn và kéo địch về vũng. | tù và vỏ ốc xoắn + xúc tu quấn tay |  |
| Long Nhân | **Triệu Long** / Wyrm Caller | 4 | Hỏa | Một rồng con bay cạnh, lớn dần theo trận (mỗi kết liễu thêm một bậc). | rồng con bay cạnh + gậy sừng | ngọn có sẵn `wyrm_caller` |
| Yêu Tinh | **Chúa Bầy Tiên** / Swarm Queen | 4 | Mị Ảo | Bầy tiên tí hon: nhiều con, máu cực thấp, chết thì hồi lại sau 3s. | đám đốm sáng bay quanh + vương miện nhỏ |  |
| Cơ Nhân | **Kẻ Lắp Ráp** / Assembler | 3 | Cơ Khí | Tháo bộ phận của mình lắp thành bản sao nhỏ (melee, máu lấy từ máu chủ); thu hồi thì máu trả lại. | tay thứ ba gập sau lưng + hộp linh kiện ở ngực | ngọn có sẵn `assembler`; ngoại lệ: Vào từ Martial-Body (Shaper), không qua Arcane: thuộc hạ là bản sao lắp từ bộ phận của mình. |
| Cơ Nhân | **Tâm Trí Bầy** / Hive Mind | 4 | Cơ Khí | Bản sao dùng chung lưới: một con thấy thì tất cả thấy; lệnh đồng bộ làm mọi bản sao ra đòn đúng lúc chủ ra đòn. | ba đầu nhỏ trên vai nhấp nháy cùng nhịp | ngọn có sẵn `hive_mind` |
| Cơ Nhân | **Siêu Trí** / Overmind | 5 | Cơ Khí | Chủ bất động, điều khiển trực tiếp một bản sao (đổi thân); thân chính chết mới thua. | thân chính đứng yên bất động, vầng bản sao xoay quanh như hào quang | ngọn có sẵn `overmind` |

#### Nhạc Sư / Bard — `bard` · T3–5

Âm nhạc là vũ khí và là mệnh lệnh.

- **Lõi chung:** Giai điệu: buff vùng, đổi bài thay đổi hiệu ứng · Nhịp: bấm đúng nhịp tăng hiệu lực · Âm phá: sóng âm đẩy lùi
- **Dùng chung:** Một bộ anim "chơi nhạc" chung; nhạc cụ là prop riêng từng dạng. Cần cơ chế nhịp (beat) trong runtime. Vũ khí: instrument. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Nhạc Sư / Bard — nhạc cụ đeo chéo lưng.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Gõ Sườn** / Bone Piper | 3 | Tử Linh | Chơi nhạc trên chính xương sườn mình như mộc cầm; giai điệu đánh thức xác chết thành thuộc hạ tạm. | dùi gõ trên lồng ngực + sáo xương |  |
| Nhân Loại | **Hát Rong** / Troubadour | 3 | Ánh Sáng | Ba bài: Dũng Khí (sát thương), Hồi Sức (máu), Hành Quân (tốc); đổi bài không hồi chiêu. | đàn lute + mũ lông chim |  |
| Tiên Tộc | **Kẻ Dệt Khúc** / Songweaver | 3 | Nguyệt | Mỗi câu hát để lại một nốt lơ lửng; đồng minh chạm nốt nhận buff, địch chạm nốt bị Mê ngắn. | đàn hạc nhỏ + nốt nhạc bạc bay quanh | ngọn có sẵn `songweaver` |
| Tiên Tộc | **Người Giữ Khúc Cổ** / Lorekeeper | 4 | Nguyệt | Hát lại một skill vừa thấy (của đồng minh hoặc địch) một lần; khúc cổ buff theo đúng khuôn nghề của từng đồng minh. | cuộn khúc cổ bay quanh như dải lụa + mắt bạc | ngọn có sẵn `lorekeeper` |
| Tiên Tộc | **Ca Giả Thế Giới** / Worldsinger | 5 | Huyền | Hát đổi màn chơi: một đoạn nhạc trọn vẹn mọc platform/cầu, đoạn khác làm địa hình dưới chân địch sụp. | không nhạc cụ, miệng phát sáng, cây cối nghiêng theo nhịp | ngọn có sẵn `worldsinger` |
| Người Lùn | **Trống Trận** / War Drummer | 3 | Thạch | Trống làm rung đất: đánh đúng nhịp thì mọi địch đứng trên sàn bị khựng. | trống lớn đeo bụng + dùi búa |  |
| Người Thú | **Kẻ Hú Ca** / Howl Chanter | 3 | Hoang Dã | Tiếng hú làm địch sợ (giảm sát thương); đồng minh hú theo thì hiệu ứng cộng dồn. | vòng cổ chuông xương + đầu ngửa hú |  |
| Hải Tộc | **Nhân Ngư Ca** / Siren | 3 | Thủy Triều | Tiếng hát kéo địch lại gần (lure) rồi sóng âm hất lên; địch trúng hai câu liên tiếp bị Mê. | tù và ốc xoắn lớn + vây tai xòe khi hát | ngọn có sẵn `siren` |
| Hải Tộc | **Hải Mẫu** / Tide Matriarch | 4 | Thủy Triều | Hợp xướng: đồng minh đứng trong vũng nước hát theo, mỗi người thêm một tầng buff; bài ru làm boss chậm. | vương miện ngọc trai + đàn bằng xương cá voi | ngọn có sẵn `tide_matriarch` |
| Orc | **Trống Sọ** / Skull Drummer | 3 | Huyết | Trống trận bọc da: mỗi nhịp tăng rage cho mọi đồng minh trong vùng. | trống sọ thú treo hông + dùi xương |  |
| Yêu Tinh | **Kẻ Thổi Sáo Dụ** / Pied Piper | 3 | Mị Ảo | Sáo dụ: địch trúng nhạc đi theo mình (khiêu khích di động), dẫn chúng vào bẫy hoặc xuống hố. | sáo dài + áo hai màu sặc sỡ |  |

### Tử thuật (Death)

#### Vu Sư / Shaman — `shaman` · T3–5

Người nói chuyện với linh hồn: tổ tiên, thú, biển sâu.

- **Lõi chung:** Cắm totem (tối đa 2–3, mỗi cái một vùng hiệu ứng) · Gọi linh hồn nhập thân ngắn · Liên kết: chia sát thương giữa các mục tiêu nối
- **Dùng chung:** Anim của Medium; totem là prop đặt xuống, mỗi dạng một sprite. Vũ khí: focus, totem. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Vu Sư / Shaman — trượng treo bùa + mặt nạ.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Gieo Xương** / Bone Oracle | 3 | Tử Linh | Gieo xương bói: mỗi lần gieo ra một trong ba quẻ (buff / hồi / nguyền), quẻ sau không trùng quẻ trước. | túi xương bói + sọ nhỏ treo trượng |  |
| Người Lùn | **Kẻ Nói Với Đá** / Stonespeaker | 3 | Thạch | Totem là mảnh đá nhặt từ chính màn chơi (mỗi loại nền một hiệu ứng); nghe đá: thấy địch đứng cùng mặt sàn qua tường. Pháp sư duy nhất của người lùn. | tai áp vào đá, đá nhỏ lơ lửng quanh đầu + trượng là cuốc chim | ngọn có sẵn `stonespeaker` |
| Người Lùn | **Bảo Thạch Tiên Tri** / Gem Oracle | 4 | Thạch | Totem ngọc lớn dần theo thời gian (ba bậc); khi vỡ bắn mảnh ngọc thành đạn cho đồng minh. | tinh thể mọc trên râu và vai + một mắt là ngọc | ngọn có sẵn `gem_oracle` |
| Người Lùn | **Hồn Núi** / Mountain Soul | 5 | Thạch | Gọi hồn núi: cả màn rung, nền mọc cột đá làm vật cản/platform; đứng yên thì không thể bị đẩy, giết hay khống chế 6s. | nửa thân hóa đá núi, rêu và tinh thể mọc trên người + không trượng | ngọn có sẵn `mountain_soul` |
| Tiên Tộc | **Kẻ Nói Với Hoang Dã** / Wildspeaker | 3 | Tự Nhiên | Totem là cây non mọc lên, lớn dần theo thời gian; cây lớn che đạn. | tóc kết dây leo + gậy cành có tổ chim |  |
| Mọi chủng tộc · ⌂ Tổ Linh Đạo | **Kẻ Nói Với Tổ Tiên** / Ancestor Speaker | 4 | Tổ Linh | Totem là bia đá: mỗi bia gọi một hồn tổ tiên (thợ rèn buff giáp, chiến binh đánh, thợ mỏ đào). Mọi chủng tộc theo Tổ Linh Đạo; với dwarf đây là lối duy nhất vào Death. | bia đá nhỏ đeo lưng + tóc/râu tết chỉ vàng | ngọn có sẵn `ancestor_speaker` |
| Mọi chủng tộc · ⌂ Tổ Linh Đạo | **Hóa Thân Tổ Linh** / Ancestor Avatar | 5 | Tổ Linh | Nhập thân tổ tiên lớn: thân to gấp đôi 10s, mọi đòn là đòn của tổ tiên; mỗi bia đã cắm kéo dài thêm 2s. | thân mờ nửa trên là một tổ tiên khổng lồ chồng lên | ngọn có sẵn `ancestor_avatar` |
| Người Thú | **Pháp Sư Totem** / Totem Shaman | 4 | Tổ Linh | Cột totem đeo lưng có thể cắm xuống; gọi hồn thú tổ nhập thân. | cột totem đeo lưng + mặt nạ gỗ | ngọn có sẵn `totem_shaman` |
| Người Thú | **Đại Thú Linh** / Great Spirit | 5 | Tổ Linh | Nhập thân thú tổ: thân to gấp đôi 10s, thuộc hạ thú quanh được hồi đầy; totem đã cắm biến thành thú tổ nhỏ đánh cùng. | thân mờ nửa trên là thú tổ khổng lồ (sói/gấu) chồng lên | ngọn có sẵn `great_spirit` |
| Orc | **Huyết Vu** / Blood Shaman | 4 | Huyết | Totem chạy bằng máu: trả máu để cắm, totem hồi máu đồng minh gấp đôi phần đã trả. | mặt nạ sọ thú + trượng xương + tay đỏ máu | ngọn có sẵn `blood_shaman` |
| Orc | **Hóa Thân Huyết Thần** / Blood Avatar | 5 | Huyết | Máu càng thấp totem càng mạnh; dưới 10% máu mọi totem nổ thành mưa máu hồi đồng minh, hại địch. | toàn thân đỏ như lột da + sừng máu đông | ngọn có sẵn `blood_avatar` |
| Mọi chủng tộc · ◉ Vực Giáo | **Tư Tế Vực Sâu** / Abyss Priest | 4 | Vực Sâu | Totem là đèn cá vực sâu: kéo địch về ánh đèn, đồng minh trong vùng thấy mọi thứ tàng hình. Nghề ẩn của Vực Giáo, mọi chủng tộc nghe được "giọng". | đèn cá vực sâu treo trước mặt + áo bào tối | ngọn có sẵn `abyss_priest`; ẩn (event:deep_voice) |
| Mọi chủng tộc · ◉ Vực Giáo | **Tiên Tri Chết Chìm** / Drowned Prophet | 5 | Vực Sâu | Mở "miệng vực" trên sàn: hố tạm nuốt địch 3s, đồng minh nhảy qua được; totem trong vùng vực không hết thời gian. | nửa thân dưới tan thành nước đen + nhiều mắt | ngọn có sẵn `drowned_prophet` |
| Hải Tộc · ◉ Vực Giáo | **Chúa Chìm** / Drowned God | 5 | Vực Sâu | Lối riêng merfolk: thứ đang ngủ dưới đáy thức dậy làm thuộc hạ (một con, máu dày, chỉ trồi lên từ vũng nước). | thân khổng lồ mờ dưới nước phía sau + vương miện san hô chết | ngọn có sẵn `drowned_god`; ẩn (event:deep_voice) |

#### Kẻ Nguyền / Hexer — `hexer` · T2–5

Không giết ngay: làm kẻ thù chết dần.

- **Lõi chung:** Ếm: debuff cộng dồn · Lan nguyền: mục tiêu chết thì nguyền nhảy sang địch gần · Vật tế: sát thương lên vật tế = sát thương lên mục tiêu
- **Dùng chung:** Dùng status curse đã có trong runtime; vật tế là prop. Vũ khí: focus, dagger. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kẻ Nguyền / Hexer — bùa ghim trên áo + búp bê vải.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Nguyền Băng Vải** / Bandaged Hexer | 4 | Hắc Ám | Băng vải là vật tế: quấn băng lên địch, giật băng thì kích nguyền. | băng vải quấn toàn thân + bùa ghim | ngọn có sẵn `bandaged_hexer` |
| Bộ Xương | **Chúa Mộ Vải** / Mummy Lord | 5 | Hắc Ám | Quan tài sau lưng mở ra nhốt một địch; băng vải bay thành roi. | quan tài đeo lưng mở nắp | ngọn có sẵn `mummy_lord` |
| Nhân Loại | **Dị Giáo Đồ** / Heretic | 2 | Hắc Ám | Cửa vào Death của human không qua Hắc Giáo: sách cấm đốt dần máu để ếm. | mặt nạ đóng dấu + sách khóa xích | ngọn có sẵn `heretic`; ẩn (event:forbidden_tome) |
| Mọi chủng tộc · ☾ Hắc Giáo | **Tiên Tri Hắc Ám** / Dread Prophet | 4 | Hắc Ám | Chuyển chứ không chữa: lấy vết thương của đồng minh đặt lên địch bị nguyền (giá: 2% máu mình mỗi lần). Mọi chủng tộc theo Hắc Giáo. | mắt bịt vải đen + nhiều tay bùa đen bay quanh | ngọn có sẵn `dread_prophet` |
| Mọi chủng tộc · ☾ Hắc Giáo | **Giáo Chủ Dị Giáo** / Heresiarch | 5 | Hắc Ám | Kết liễu địch bị Curse biến nó thành tín đồ bóng (thuộc hạ) 15s; tín đồ chết lan nguyền sang địch gần. | mũ mitre đen ngược + đám tín đồ bóng đi theo | ngọn có sẵn `heresiarch` |
| Nhân Loại | **Phù Thủy** / Witch | 3 | Hắc Ám | Búp bê vải: nhặt "tóc" (rơi từ địch bị đánh) gắn vào búp bê rồi châm kim từ xa. | mũ chóp méo + búp bê vải treo hông |  |
| Tiên Tộc | **Phù Thủy Gai** / Thorn Witch | 3 | Tự Nhiên | Gai mọc trong người mục tiêu: địch bị nguyền mất máu mỗi bước di chuyển. | vương miện gai + tay áo rách thành rễ |  |
| Orc | **Thầy Bùa** / Hex Doctor | 3 | Huyết | Búp bê voodoo bằng xương thú; châm kim vào búp bê làm địch khựng theo nhịp. | mũ lông vũ + túi búp bê xương |  |
| Hải Tộc | **Phù Thủy Biển** / Sea Witch | 4 | Vực Sâu | Giao kèo: lấy một chỉ số của địch đổi cho mình trong 10s (tốc, giáp hoặc sát thương). | vỏ ốc giọng nói treo cổ + xúc tu thay chân áo | ẩn (event:deep_voice) |
| Yêu Tinh | **Bà Phù Thủy Đông** / Winter Hag | 4 | Băng | Nguyền băng: địch bị nguyền đứng yên càng lâu càng đóng băng; di chuyển thì giải băng nhưng mất máu. | tóc bạc thành băng + cánh rách |  |

#### Kẻ Gặt Hồn / Reaper — `reaper` · T3–5

Lưỡi hái đến cho mọi thứ sống, đúng lúc.

- **Lõi chung:** Lưỡi hái quét rộng (vũ khí mới: scythe) · Gặt: kết liễu dưới ngưỡng máu, hồi tài nguyên · Hình thái hồn: miễn sát thương ngắn
- **Dùng chung:** Cần bộ đòn thường scythe mới (một lần cho mọi dạng). Vũ khí: scythe. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kẻ Gặt Hồn / Reaper — lưỡi hái dài hơn người.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Tử Thần** / Grim Reaper | 4 | Tử Linh | Mỗi địch chết để lại hồn; gặt hồn hồi máu và kéo dài tầm lưỡi hái trong trận. | áo choàng đen trùm kín + lưỡi hái |  |
| Tiên Tộc | **Kẻ Gặt Mùa Thu** / Autumn Reaper | 4 | Tự Nhiên | Lưỡi hái lá vàng: mỗi kết liễu làm hoa mọc tại chỗ, hồi máu đồng minh bước qua. | lưỡi hái lá vàng + áo choàng lá rụng |  |
| Orc | **Kẻ Thu Hoạch Xương** / Bone Harvester | 4 | Huyết | Gặt máu thay hồn: kết liễu đầy thanh rage ngay lập tức. | lưỡi hái thô bằng hàm thú + xương treo cán |  |
| Người Thú | **Bọ Ngựa** / Mantis Reaper | 4 | Hoang Dã | Hai cẳng tay là lưỡi hái: không có vũ khí, chém kép, kết liễu bằng kẹp. | cẳng tay lưỡi hái + mắt kép | Thân côn trùng: biến thể tay. |

#### Tư Tế / Mender — `mender` · T3–5

Giữ cho cả đội còn đứng.

- **Lõi chung:** Hồi máu (kênh hoặc vùng) · Lá chắn hấp thụ · Hồi sinh (một lần mỗi trận)
- **Dùng chung:** Anim của Medium/Oracle; nguồn hồi máu khác nhau theo khí chất. Vũ khí: focus. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Tư Tế / Mender — áo bào sáng + chén thánh/bình.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Dệt Linh Hồn** / Soul Weaver | 4 | Hồn Hỏa | Sợi hồn nối đồng minh: sát thương nhận chia đều qua sợi, hồi máu cũng lan qua sợi. | sợi hồn từ đầu ngón tay + con thoi | ngọn có sẵn `soul_weaver` |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Mục Sư** / Cleric | 3 | Ánh Sáng | Cầu nguyện kênh: đứng yên càng lâu hồi càng mạnh; khiên thánh chặn một đòn. Mọi chủng tộc theo Quang Minh. | chén thánh + áo bào thêu mặt trời |  |
| Mọi chủng tộc · ☀ Thánh Giáo Quang Minh | **Hồng Y** / Cardinal | 4 | Ánh Sáng | Thánh hóa vùng: trong vùng đồng minh không chết (giữ 1 máu) 4s, undead không vào được; hồi sinh không giới hạn nhưng mỗi lần tốn 30 Devotion. | mũ hồng y + trượng mặt trời | ngọn có sẵn `cardinal` |
| Mọi chủng tộc · ☾ Hắc Giáo | **Tư Tế Thống Khổ** / Pain Priest | 4 | Hắc Ám | Không chữa: chuyển vết thương của đồng minh sang chính mình rồi xả ra địch bằng một đòn nổ máu. Hắc Giáo không có kẻ chữa lành. | áo bào khâu bằng vết thương + roi tự quất |  |
| Tiên Tộc | **Nguyệt Tiên Tri** / Moon Oracle | 4 | Nguyệt | Hồi theo pha trăng: trăng đầy hồi vùng, trăng mới thì lá chắn. | trăng lưỡi liềm sau đầu + bịt mắt bạc | ngọn có sẵn `moon_oracle` |
| Người Lùn | **Tư Tế Lò Sưởi** / Hearth Priest | 3 | Hỏa | Đặt lò sưởi: đứng gần hồi máu và sưởi giáp, rời xa thì mất. | lò sưởi nhỏ đeo lưng + gậy cời lửa |  |
| Người Thú | **Người Giữ Hang** / Den Keeper | 3 | Tự Nhiên | Dựng hang tạm: đồng minh nấp vào hồi máu và không bị nhắm tới. | áo choàng lông lớn + túi lá thuốc |  |
| Hải Tộc | **Nữ Tư Tế Triều** / Tide Priestess | 3 | Thủy Triều | Hồi bằng sóng: sóng đi qua hồi đồng minh và đẩy lùi địch trên đường. | vương miện ngọc trai + gậy sóng |  |
| Long Nhân | **Tư Tế Phượng Hoàng** / Phoenix Priest | 4 | Hỏa | Hồi sinh trong lửa: đồng minh gục đầu tiên trong vùng được hồi sinh với 30% máu. | lông phượng hoàng cài sừng + áo đỏ vàng |  |
| Yêu Tinh | **Kẻ Dệt Mộng** / Dreamweaver | 4 | Mị Ảo | Ru ngủ cả bạn lẫn thù: đồng minh ngủ hồi nhanh, địch ngủ không hành động. | bụi mộng bay quanh + mắt nhắm | ngọn có sẵn `dreamweaver` |
| Yêu Tinh | **Mộng Vương** / Dream King | 5 | Mị Ảo | Kéo cả màn vào giấc mơ 8s: địch ngủ, đồng minh hồi, mọi thứ chạy nửa tốc; đánh thức địch nào thì địch đó nhận sát thương dồn. | mắt nhắm vĩnh viễn + vương miện sao + áo bào bằng sương | ngọn có sẵn `dream_king` |
| Cơ Nhân | **Đơn Vị Sửa Chữa** / Repair Unit | 3 | Cơ Khí | Sửa chứ không chữa: hồi gấp đôi cho construct/trụ, một nửa cho sinh vật sống. | tay hàn + cuộn dây thay băng gạc |  |

### Chế tác (Craft)

#### Pháo Thủ / Artillerist — `artillerist` · T3–5

Vũ khí to hơn người, bắn qua tường.

- **Lõi chung:** Vác pháo / đặt pháo cố định · Đạn vòng cung (qua vật cản) · Nạp đạn đặc biệt theo dạng
- **Dùng chung:** Anim vác pháo của Siege Gunner; nòng là overlay riêng. Vũ khí: cannon. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Pháo Thủ Công Thành / Siege Gunner — pháo vác vai nằm ngang.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Cối Hài Cốt** / Ossuary Mortar | 3 | Tử Linh | Đạn là sọ: sọ rơi xuống thành lính xương tạm (tính vào cap). | cối xương đeo lưng + sọ xếp thành đạn |  |
| Nhân Loại | **Pháo Binh Cối** / Bombardier | 3 | Hỏa | Súng cối: chỉ bắn vòng cung qua tường, không bắn thẳng; đạn nổ chậm có hẹn giờ. | nòng cối ngắn + mũ sắt rộng vành |  |
| Người Lùn | **Pháo Trưởng** / Gunner Captain | 4 | Hỏa | Pháo hai nòng bắn luân phiên; ra lệnh cho trụ của đồng minh bắn cùng. | pháo hai nòng + mũ sĩ quan | ngọn có sẵn `gunner_captain` |
| Orc | **Phá Thành** / Siege Breaker | 4 | Huyết | Không pháo: chùy phá thành khổng lồ + thuốc nổ ném; phá vật cản một đòn. | chùy phá thành khổng lồ + thuốc nổ | ngọn có sẵn `siege_breaker` |
| Orc | **Kẻ Phá Thế Giới** / World Breaker | 5 | Hỏa | Đòn nặng phá cả nền màn (tạo hố tạm 6s); tự chịu 10% sát thương nổ; mỗi hố là một bẫy cho địch. | chùy khổng lồ có máy nổ gắn trong + lưng cõng thùng thuốc nổ | ngọn có sẵn `world_breaker` |
| Long Nhân | **Pháo Thủ Long Hỏa** / Dragonfire Gunner | 4 | Hỏa | Nạp đạn bằng hơi thở của chính mình: trả máu để nạp phát cực mạnh. | nòng pháo hình đầu rồng |  |
| Hải Tộc | **Pháo San Hô** / Coral Cannon | 4 | Thủy Triều | Pháo nước: đạn nổ thành vũng nước lớn và đẩy lùi mạnh. | nòng san hô sống + bình nước lưng |  |
| Cơ Nhân | **Cỗ Máy Công Thành** / Siege Engine | 4 | Cơ Khí | Pháo gắn thẳng vào vai, không cầm: bắn khi đang di chuyển. | pháo gắn vai, hai tay trống | ngọn có sẵn `siege_engine` |

#### Thầy Cự Nhân / Golemancer — `golemancer` · T3–5

Một cỗ máy/cự nhân to lớn làm thay mọi việc nặng.

- **Lõi chung:** Dựng cự nhân (một thuộc hạ lớn, máu dày) · Nhập vào lái cự nhân (đổi bộ đòn tạm thời) · Sửa / thay module cho cự nhân
- **Dùng chung:** Cự nhân dùng chung khung anim 96×96 (đi, đấm, đập đất); mỗi dạng vẽ lại vật liệu. Vũ khí: tool. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Thầy Cự Nhân / Golemancer — điều khiển cầm tay + cự nhân đi theo.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Ráp Cự Cốt** / Bone Golem Maker | 4 | Tử Linh | Ráp cự nhân từ xương địch chết: mỗi kết liễu làm cự nhân to thêm một bậc. | cự nhân ghép từ nhiều bộ xương | Ý tưởng Golemancer lai Engineer + Necromancer trong docs/13 mục 6.6. |
| Bộ Xương | **Xương Đồng Hồ** / Clockwork Skeleton | 5 | Cơ Khí | Body Evolution Mechanical: chính thân mình là cỗ máy; module gắn thẳng vào khớp. | khớp bánh răng + một bên sọ kim loại | ngọn có sẵn `clockwork_skeleton`; ẩn (item:brass_core) |
| Nhân Loại | **Phi Công Cơ Giáp** / Mech Pilot | 4 | Cơ Khí | Bước vào bộ giáp máy 15s: đổi hẳn sang bộ đòn mech; ra khỏi giáp thì giáp làm vật cản. | mũ phi công + cơ giáp đứng sau lưng |  |
| Người Lùn | **Thợ Rèn Cự Nhân** / Ironwright | 4 | Thạch | Cự nhân đá chậm, cực chịu đòn; ngồi trong ngực cự nhân để lái. | cự nhân đá có buồng lái ở ngực |  |
| Orc | **Trùm Sắt Vụn** / Scrap Boss | 4 | Cơ Khí | Cự nhân ghép sắt vụn: bị đánh thì rơi mảnh, chủ nhặt mảnh làm đạn ném. | cự nhân sắt vụn có răng nanh sơn |  |
| Cơ Nhân | **Giám Sát Viên** / Overseer | 4 | Cơ Khí | Không một cự nhân mà ba drone nhỏ bay quanh, đổi vai trò (bắn / chắn / sửa). | 3 drone nhỏ bay quanh + mắt đơn to | ngọn có sẵn `overseer` |
| Cơ Nhân | **Lõi Chúa** / Core Sovereign | 5 | Cơ Khí | Lõi mở ra chiếm cả ngực: điều khiển mọi cỗ máy trong màn, kể cả của địch. | lõi chiếm cả ngực + thân bay | ngọn có sẵn `core_sovereign` |

#### Luyện Kim Sư / Alchemist — `alchemist` · T3–4

Mọi vấn đề đều giải được bằng đúng lọ thuốc.

- **Lõi chung:** Ném lọ: vùng hiệu ứng · Trộn: hai lọ liên tiếp tạo hiệu ứng thứ ba · Tự uống thuốc: buff hoặc hồi
- **Dùng chung:** Anim throw đã có; lọ là prop, khói/vùng là hiệu ứng theo khí chất. Vũ khí: throwing, tool. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Bác Sĩ Dịch Hạch / Plague Doctor — mặt nạ mỏ chim + đai lọ.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Thợ Ướp Xác** / Embalmer | 3 | Tử Linh | Thuốc ướp: ướp đồng minh (giảm sát thương nhận nhưng không hồi được) hoặc ướp địch (chậm dần thành xác khô). | tạp dề vải ướp + móc dài và lọ hũ |  |
| Nhân Loại | **Kẻ Chuyển Hóa** / Transmuter | 3 | Huyền | Đổi vật chất: biến đạn địch thành vàng rơi xuống (chặn), biến sàn thành bùn. | găng giả kim có vòng tròn khắc + đá đỏ |  |
| Tiên Tộc | **Luyện Sương** / Dew Alchemist | 3 | Tự Nhiên | Thuốc từ sương và hoa: lọ hồi máu ném cho đồng minh, lọ gây ngủ cho địch. | lọ giọt sương treo quanh áo + hoa cài tai |  |
| Người Lùn | **Tửu Sư** / Ale Sage | 4 | Hỏa | Rượu là thuốc: buff đồng minh; phun rượu qua lửa thành đòn lửa. | thùng bia trên lưng + cốc | ngọn có sẵn `ale_sage` |
| Hải Tộc | **Luyện Kim Nước Mặn** / Brine Alchemist | 3 | Thủy Triều | Lọ muối làm địch khô (giảm hồi máu); lọ nước biển làm Ướt. | tinh thể muối mọc trên vai + lọ xanh lục |  |
| Long Nhân | **Luyện Lưu Huỳnh** / Sulfur Alchemist | 3 | Hỏa | Mọi lọ đều nổ; trộn hai lọ thì nổ dây chuyền theo đường thẳng. | khói vàng lưu huỳnh + kính chắn lửa |  |

#### Thợ Rune / Runesmith — `runesmith` · T3–5

Sức mạnh nằm trong dấu khắc, không nằm trong cánh tay.

- **Lõi chung:** Khắc rune lên vũ khí đồng minh hoặc lên sàn · Kích nổ / kích hoạt rune đã khắc · Rèn tại chỗ: đặt đe làm trạm buff
- **Dùng chung:** Anim búa của Engineer; rune là hiệu ứng theo màu khí chất. Vũ khí: tool, hammer. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Thợ Rune / Runesmith — búa rèn + rune sáng trên giáp đồng minh.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Thợ Khắc Xương** / Bone Carver | 3 | Tử Linh | Khắc rune lên xương mình và xương thuộc hạ; thuộc hạ có rune nổ khi chết. | dao khắc + xương phủ chữ khắc |  |
| Nhân Loại | **Thợ Phù Phép** / Enchanter | 3 | Huyền | Phù phép trang bị đồng minh: chọn một trong ba hiệu ứng cho vũ khí cả đội. | áo khoác thợ + găng phát sáng |  |
| Tiên Tộc | **Kẻ Hát Ký Tự** / Glyph Singer | 3 | Nguyệt | Hát ra ký tự lơ lửng; ký tự chạm đồng minh thì thành rune trên vũ khí. | ký tự bạc bay quanh miệng | ngoại lệ: Craft-Engineering bị cấm với elf: rune bằng giọng hát, đi qua Arcane. |
| Người Lùn | **Thợ Rune** / Runesmith | 4 | Phù Văn | Rune trên giáp đồng minh tồn tại cả trận; đe di động là trạm buff. | búa rèn + rune sáng trên giáp đồng minh | ngọn có sẵn `runesmith` |
| Người Lùn | **Rune Chúa** / Runelord | 5 | Phù Văn | Khắc rune lên chính màn chơi: nền có rune là vùng buff vĩnh viễn trong trận; tối đa 3 rune nền, kích nổ cả ba cùng lúc. | rune sáng khắc kín râu và giáp + đe bay lơ lửng | ngọn có sẵn `runelord` |
| Mọi chủng tộc · ⚙ Giáo Hội Lò Rèn | **Tư Tế Lò Rèn** / Forge Priest | 3 | Cơ Khí | Sửa đồng minh như sửa máy (hồi theo nhịp búa, không theo thời gian); bu-lông khắc lên giáp = rune giáp. Mọi chủng tộc theo Giáo Hội Lò Rèn. | tay máy + búa nghi lễ + áo choàng da thuộc | ngọn có sẵn `forge_priest` |
| Mọi chủng tộc · ⚙ Giáo Hội Lò Rèn | **Thiết Tiên Tri** / Iron Oracle | 4 | Cơ Khí | Mắt máy dự đoán: hiện hitbox đòn địch trước 0,5s cho cả đội; rune khắc lên địch làm đòn của nó chậm hơn. | mắt ống kính + ngực mở thấy bánh răng | ngọn có sẵn `iron_oracle` |
| Mọi chủng tộc · ⚙ Giáo Hội Lò Rèn | **Cỗ Máy Đức Tin** / Engine of Faith | 5 | Cơ Khí | Hoàn tất cải tạo (Body Evolution Mechanical cho mọi chủng tộc): không còn máu, chỉ có Nhiệt; rune trên thân tự kích khi quá nhiệt. | thân gần như toàn máy, chỉ còn mặt là thịt/xương | ngọn có sẵn `engine_of_faith` |
| Người Lùn | **Lò Rèn Vương** / Forge King | 5 | Hỏa | Lò rèn sau lưng: rèn vũ khí tạm cho đồng minh ngay trong trận. | vương miện đe + lò rèn di động sau lưng | ngọn có sẵn `forge_king` |
| Long Nhân | **Thợ Rèn Vảy** / Scale-smith | 3 | Hỏa | Rèn vảy rụng của chính mình thành giáp tặng đồng minh (mình mất giáp tương ứng). | mảng vảy bong trên tay + kìm rèn |  |
| Cơ Nhân | **Thợ Khắc Lõi** / Inscriber | 3 | Phù Văn | Khắc rune lên chính thân: mỗi rune là một module chủ động, thay được giữa trận. | tay khắc laser + bảng rune trên ngực |  |

### Dã thú (Beast)

#### Thuần Thú Sư / Beastmaster — `beastmaster` · T3–5

Một người và con thú của mình, đánh như một.

- **Lõi chung:** Bạn đồng hành cố định (một con thú có anim riêng) · Lệnh: tấn công mục tiêu / quay về · Hợp kích: chủ và thú cùng ra đòn
- **Dùng chung:** Bạn đồng hành dùng kiểu thuộc hạ hound (V12.2); mỗi dạng một sprite thú. Vũ khí: bow, spearshield. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Thuần Thú Sư / Beastmaster — thú đi cạnh + roi/còi.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Đội Trưởng Cuộc Săn** / Wild Hunt Captain | 4 | Hồn Hỏa | Bầy chó săn ma ưu tiên mục tiêu bị đánh dấu; tù và gọi cả bầy lao một hướng. | gạc hươu trên sọ + tù và + chó săn ma | ngọn có sẵn `wild_hunt_captain`; đồng hành: chó săn ma |
| Nhân Loại | **Người Nuôi Ưng** / Falconer | 3 | Phong | Chim ưng đánh mục tiêu trên cao và cào mắt (giảm chính xác của địch). | găng da dày + chim ưng đậu tay | đồng hành: chim ưng |
| Người Thú | **Hú Nguyệt** / Moon Howler | 3 | Nguyệt | Hai sói nhỏ; hú để chúng vào trạng thái săn đêm (nhanh hơn, cắn gây chảy máu). | trăng vẽ trên ngực + 2 sói nhỏ | ngọn có sẵn `moon_howler`; đồng hành: hai sói nhỏ |
| Orc | **Kẻ Thuần Thú Dữ** / Beast Tamer | 3 | Hoang Dã | Gấu chiến xích cổ: quất roi để gấu điên (mạnh hơn nhưng có thể đánh nhầm). | roi xích + gấu chiến đeo rọ mõm | đồng hành: gấu chiến |
| Hải Tộc | **Kẻ Gọi Cá Mập** / Shark Caller | 3 | Thủy Triều | Cá mập chỉ bơi trong vũng nước; tạo vũng ở đâu cá mập lao tới đó. | răng cá mập đeo cổ + vây lưng cá mập lượn quanh | đồng hành: cá mập |
| Yêu Tinh | **Kẻ Nuôi Ong** / Beekeeper | 3 | Tự Nhiên | Bầy ong là một đám mây: tách đôi để đánh hai mục tiêu, gộp lại để chích nặng. | tổ ong treo hông + mũ lưới | đồng hành: bầy ong |
| Long Nhân | **Kẻ Nuôi Long Câu** / Drake Handler | 3 | Hỏa | Long câu (hound phun lửa) lớn dần theo trận: mỗi 3 kết liễu thêm một bậc kích thước và tầm phun. | long câu con bám vai + găng da cháy xém | ngọn có sẵn `drake_handler`; ngoại lệ: Beast ngoại lai với dragonkin, nhưng long câu là máu mủ: dùng Taming + Fire.; đồng hành: long câu con |

#### Kỵ Thú / Beast Rider — `rider` · T3–5

Thú cưỡi là nửa sức chiến đấu: nhanh, linh hoạt, thú tự ra đòn.

- **Lõi chung:** Cưỡi: thú là một phần thân, tốc chạy cao · Thú tấn công (cắn/húc) theo lệnh · Nhảy khỏi thú đánh từ trên xuống
- **Dùng chung:** Dùng chung rig mounted với Kỵ Sĩ; khác Kỵ Sĩ ở chỗ thú là người ra đòn chính, không giáp nặng. Vũ khí: spearshield, bow. Rig: `mounted`.
- **Dạng chung (không có dạng riêng):** Kỵ Thú / Beast Rider — thú cưỡi + giáo ngắn.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Nhân Loại | **Kỵ Sư Tử Đầu Ưng** / Griffin Rider | 4 | Phong | Kỵ thú duy nhất bay được ngắn: lướt qua hố và đánh từ trên không. | sư tử đầu ưng + mũ cánh | cưỡi: sư tử đầu ưng |
| Tiên Tộc | **Chúa Tể Kiểm Lâm** / Ranger Lord | 4 | Tự Nhiên | Bắn cung trên lưng hươu không giảm tốc; hươu nhảy kép. | cưỡi hươu trắng + mũ lá | ngọn có sẵn `ranger_lord`; cưỡi: hươu trắng |
| Người Thú | **Kỵ Nha** / Fang Rider | 4 | Hoang Dã | Người và thú cùng vồ: hợp kích không hồi chiêu khi trúng cùng một mục tiêu. | cưỡi gấu/sói lớn + giáo xương | ngọn có sẵn `fang_rider`; cưỡi: gấu/sói lớn |
| Hải Tộc | **Kỵ Hải Thú** / Leviathan Rider | 4 | Thủy Triều | Thú cưỡi lặn được qua vũng nước để trồi lên ở vũng khác. | cưỡi cá mập/hải mã + yên san hô | ngọn có sẵn `leviathan_rider`; cưỡi: cá mập / hải mã |
| Orc | **Kỵ Sói** / Wolf Rider | 4 | Hoang Dã | Tập kích đêm: đánh trúng rồi rút về rất nhanh, sói cắn kéo địch ngã. | cưỡi sói chiến + lao ngắn | ngọn có sẵn `wolf_rider`; cưỡi: sói chiến |
| Yêu Tinh | **Gai Vệ Yêu** / Briar Warden | 4 | Tự Nhiên | Hươu gai để lại rễ dưới chân khi chạy, địch giẫm phải bị giữ. | cưỡi hươu gai + rễ bò dưới chân | ngọn có sẵn `briar_warden`; cưỡi: hươu gai |
| Tiên Tộc | **Trưởng Lão Rừng Già** / Forest Elder | 5 | Tự Nhiên | Thú cưỡi là một cây di động: dừng lại thì bén rễ thành vật cản và điểm hồi máu; bắn từ trên cây. | cưỡi nai cổ thụ + tóc bạc dài chấm đất | ngọn có sẵn `forest_elder`; cưỡi: nai cổ thụ có cây mọc trên lưng |
| Người Thú | **Đỉnh Thú** / Apex | 5 | Hoang Dã | Người và thú là một: hợp kích không hồi chiêu; thú chết thì người hóa thú (dạng Feral) tới hết trận. | cưỡi thú đeo xương chiến lợi phẩm + không giáp | ngọn có sẵn `apex`; cưỡi: thú to gấp rưỡi mang xương của thú đã săn |
| Hải Tộc | **Kình Vương** / Whale Lord | 5 | Thủy Triều | Thú cưỡi to nhất game, đi xuyên địch; thổi nước tạo vùng ngập di động theo mình. | cưỡi cá voi + lao xương cá voi | ngọn có sẵn `whale_lord`; cưỡi: cá voi nhỏ (rig riêng, rộng gấp đôi) |
| Yêu Tinh | **Gai Vương** / Thorn King | 5 | Tự Nhiên | Rễ gai mọc theo mỗi bước thú thành mê cung tạm; địch bị giữ trong rễ mất máu theo thời gian. | cưỡi hươu gai khổng lồ + rễ phủ kín chân | ngọn có sẵn `thorn_king`; cưỡi: hươu gai khổng lồ có vương miện gai |

#### Kẻ Hóa Thân / Shapeshifter — `shapeshifter` · T3–5

Không đổi vũ khí: đổi cả cơ thể.

- **Lõi chung:** Hóa thân: đổi bộ đòn và chỉ số trong thời hạn · Đòn chuyển dạng: biến đổi gây sát thương quanh · Dạng lai giữa hai hình
- **Dùng chung:** Đắt nhất về art: mỗi dạng thú là một sheet riêng. Dùng chung khung luật hóa thân và thanh thời gian. Vũ khí: unarmed. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Kẻ Hóa Thân / Shapeshifter — nửa người nửa thú khi chuyển dạng.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Kẻ Nắn Xương** / Ossomancer | 4 | Tử Linh | Không thành thú: nắn lại chính bộ xương (tay thành chùy, gai mọc vai); ném sọ rồi dịch chuyển tới sọ. | tháo tay làm chùy + gai xương vai | ngọn có sẵn `ossomancer` |
| Nhân Loại | **Người Sói Nguyền** / Lycanthrope | 4 | Huyết | Bị nguyền: tự hóa sói không kiểm soát khi máu dưới 30%; trong dạng sói hồi máu theo đòn cắn. | vết cắn ở cổ + mắt vàng | ẩn (event:wolf_bite) |
| Mọi chủng tộc · ❦ Cổ Thần Hoang Dã | **Tu Sĩ Rừng** / Druid | 4 | Tự Nhiên | Hai dạng: gấu (chịu đòn) và cú (bay ngắn, trinh sát); đổi dạng không hồi chiêu chung. Mọi chủng tộc theo Cổ Thần Hoang Dã. | áo choàng lông + gạc trên mũ trùm | ngọn có sẵn `druid` |
| Mọi chủng tộc · ❦ Cổ Thần Hoang Dã | **Đại Tu Sĩ Rừng** / Archdruid | 5 | Tự Nhiên | Dạng thứ ba: cây cổ thụ đứng yên bất tử 6s, hồi đồng minh và đổi nền quanh gốc thành rừng (địa hình có lợi cho tín đồ). | thân nửa cây, tóc rễ + không mặt | ngọn có sẵn `archdruid` |
| Người Thú | **Hóa Hình** / Wildshape | 3 | Hoang Dã | Đổi một bộ phận: tay vuốt (chém), chân thú (nhảy xa), hàm (cắn hút máu); mỗi bộ phận một luật, đổi tốn khí. | nửa mặt là thú, một tay vuốt một tay người | ngọn có sẵn `wildshape` |
| Người Thú | **Người Hóa Thú** / Werebeast | 4 | Nguyệt | Dạng thú hoàn toàn khi trăng đầy (theo chu kỳ trận); các pha khác là dạng lai. | lông dựng + vuốt dài, mắt phát sáng | ngọn có sẵn `werebeast` |
| Người Thú | **Thú Thần** / Beast God | 5 | Hoang Dã | Dạng thú vĩnh viễn (không về dạng người); bù lại mọi thú trong màn, kể cả của địch, coi là bầy. | thân thú khổng lồ đi hai chân (rig riêng) + sọ thú làm mũ | ngọn có sẵn `beast_god` |
| Hải Tộc | **Hải Cẩu Tinh** / Selkie | 4 | Thủy Triều | Khoác da hải cẩu: dạng hải cẩu trượt trên sàn cực nhanh và húc; bỏ da thì thành người đánh lao. | áo khoác da hải cẩu |  |
| Long Nhân | **Cổ Long** / Elder Wyrm | 5 | Hỏa | Trở về tổ tiên: dạng rồng có cánh, không vũ khí; cần Body Evolution Winged. | cánh + sừng lớn (rig riêng) | ngọn có sẵn `elder_wyrm` |
| Yêu Tinh | **Yêu Biến Hình** / Púca | 4 | Mị Ảo | Sao chép hình dạng của địch thường vừa hạ (lấy đòn thường và tốc độ của nó). | hình dạng không cố định, mắt vàng giữ nguyên |  |
| Cơ Nhân | **Khung Tái Cấu Hình** / Reconfig Frame | 4 | Cơ Khí | Đổi giữa dạng xe (chạy nhanh, húc) và dạng chiến (đứng, đấm); chuyển dạng là một đòn hất. | bánh xe gập sau lưng | ngoại lệ: Beast bị cấm với construct: đổi dạng bằng Engineering, không phải sinh học. |

### Võ thuật (Martial)

#### Võ Tăng / Monk — `monk` · T3–5

Thân thể là vũ khí đã mài giũa bằng kỷ luật.

- **Lõi chung:** Khí: tài nguyên tích qua combo · Liên hoàn: combo tay không dài · Tĩnh tâm: đứng yên hồi khí và máu
- **Dùng chung:** Bộ đòn thường unarmed (chưa có, cần làm một lần). Vũ khí: unarmed. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Huyền Tu / Mystic — không giáp, chuỗi hạt.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Nhân Loại | **Đại Tông Sư** / Grandmaster | 4 | Khí | Trăm đòn: combo không giới hạn độ dài, mỗi 10 nhịp mở một đòn kết mới. | không giáp, râu dài, một chuỗi hạt | ngọn có sẵn `grandmaster` |
| Nhân Loại | **Huyền Thoại Sống** / Living Legend | 5 | Khí | Khí phóng ra: đòn thường tay không có tầm như vũ khí; tĩnh tâm giữa combo không mất chuỗi. | áo vải trắng không một vết + tóc bạc buộc cao | ngọn có sẵn `living_legend` |
| Long Nhân | **Phượng Hoàng Tái Sinh** / Phoenix Ascendant | 5 | Hỏa | Chết thì hóa tro rồi bùng lại một lần mỗi trận với đầy khí; combo kết là vòng lửa lan ra. | lửa thay tóc + cánh lửa mờ (hiệu ứng, không rig cánh) | ngọn có sẵn `phoenix_ascendant` |
| Tiên Tộc | **Phong Bộ** / Wind Walker | 4 | Phong | Bước trên không vài bước; mọi đòn chân, không đòn tay. | chân trần + dải lụa bay quanh hông | ngoại lệ: races/elf.js chưa khai báo Martial: chọn dạng này thì thêm martial vào foreign của elf. |
| Người Lùn | **Tửu Quyền** / Brewmaster | 4 | Hỏa | Say quyền: uống để vào trạng thái say, né ngẫu nhiên có kiểm soát; phun rượu qua lửa. | bầu rượu đeo hông + bụng to |  |
| Người Thú | **Hổ Quyền** / Tiger Monk | 4 | Hoang Dã | Hổ quyền: đòn vuốt tích khí nhanh gấp đôi nhưng tĩnh tâm hồi chậm. | vằn hổ + đai võ đen |  |
| Long Nhân | **Hỏa Hiền** / Ember Sage | 4 | Hỏa | Tĩnh tâm trên lửa: đứng yên thì tạo vòng lửa quanh mình, hồi khí từ lửa. | ngồi thiền trên lửa, không giáp | ngọn có sẵn `ember_sage` |

#### Cự Thể / Colossus — `colossus` · T3–5

To hơn, cứng hơn, không thể đẩy lùi.

- **Lõi chung:** Thân là vũ khí: đòn tay to, chậm, rộng · Giáp theo nhịp (super armor trong lúc ra đòn) · Đập đất: sóng chấn động
- **Dùng chung:** Nghề duy nhất được phá tỷ lệ thân (cẳng tay/vai to gấp rưỡi): một sheet thân riêng cho mỗi chủng tộc. Vũ khí: unarmed. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Cự Thể / Colossus — cẳng tay và vai to gấp rưỡi.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Cự Cốt** / Relic Colossus | 3 | Tử Linh | Xương to gấp rưỡi ở cẳng tay và vai; nhặt xương địch chết để vá giáp. | cẳng tay xương khổng lồ | là nghề chung `colossus` |
| Người Lùn | **Thạch Thể** / Stoneflesh | 4 | Thạch | Bị đánh thì da hóa đá từng mảng: càng trúng nhiều càng cứng và càng chậm; đập đất xả hết đá. | da hóa đá từng mảng |  |
| Người Thú | **Thủ Lĩnh Bầy** / Alpha | 4 | Hoang Dã | Gầm thách đấu: kẻ địch mạnh nhất buộc phải đấu tay đôi trong vòng. | bờm dựng + sẹo chéo mặt + vuốt kim loại | ngọn có sẵn `alpha` |
| Orc | **Thiết Bì** / Iron Hide | 4 | Thép | Đinh sắt đóng vào da: đánh tay không vào người nó bị phản sát thương. | da đóng đinh sắt + xích quấn thân | ngọn có sẵn `iron_hide` |
| Long Nhân | **Lân Chúa** / Scale Lord | 4 | Hỏa | Vảy dày như giáp; vuốt lửa để lại Bỏng. | vảy dày như giáp + vuốt lửa | ngọn có sẵn `scale_lord` |
| Cơ Nhân | **Cự Cơ** / Juggernaut | 4 | Cơ Khí | Nắm đấm piston nạp lực: giữ nút để nạp, thả để đấm xuyên vật cản. | nắm đấm piston to gấp đôi | ngọn có sẵn `juggernaut` |
| Cơ Nhân | **Khung Titan** / Titan Frame | 5 | Cơ Khí | Rig riêng, thân gấp đôi: không nhảy, đi qua đâu phá vật cản ở đó; chế độ Neo hút mọi đạn về mình. | thân to gấp đôi + nắm đấm là cả cẳng tay | ngọn có sẵn `titan_frame` |

#### Vũ Kiếm / Bladedancer — `dancer` · T3–4

Chiến đấu như múa: nhịp càng đều, đòn càng nhanh.

- **Lõi chung:** Nhịp vũ: combo đúng nhịp tăng dần tốc độ · Bước né trong combo không ngắt chuỗi · Màn kết: đòn kết mạnh theo số nhịp đã giữ
- **Dùng chung:** Dùng chung cơ chế beat với Nhạc Sư; anim múa là một bộ chung. Vũ khí: sword, dagger. Rig: `humanoid64`.
- **Dạng chung (không có dạng riêng):** Vũ Kiếm / Bladedancer — song kiếm + dải lụa.

| Ai | Dạng | T | Khí chất | Khác biệt | Ngoại hình | Ghi chú |
|---|---|---|---|---|---|---|
| Bộ Xương | **Vũ Điệu Tử Thần** / Danse Macabre | 4 | Tử Linh | Múa làm xác chết và undead quanh mình múa theo: chúng đánh vào địch theo nhịp của mình. | khăn đỏ quấn sọ + chuông nhỏ ở khớp |  |
| Nhân Loại | **Vũ Đao** / Sword Dancer | 3 | Thép | Song đao: combo không giới hạn nếu không bị trúng đòn; bị trúng thì mất hết nhịp. | song đao cong + khăn lụa đỏ |  |
| Tiên Tộc | **Kiếm Ca** / Bladesinger | 4 | Nguyệt | Vừa múa vừa hát: mỗi câu hát trọn vẹn tăng sát thương cả combo. | kiếm mảnh + áo dài xẻ tà |  |
| Hải Tộc | **Vũ Triều** / Tide Dancer | 3 | Thủy Triều | Múa trong vũng nước tạo sóng theo nhịp; sóng đẩy địch ra khỏi vòng múa. | dải vây dài như lụa |  |
| Long Nhân | **Vũ Hỏa** / Fire Dancer | 3 | Hỏa | Mỗi vòng xoay để lại một vòng lửa; đứng trong vòng lửa của mình thì tăng nhịp. | hai roi lửa + đuôi quét lửa |  |
| Yêu Tinh | **Vũ Công Hội Hè** / Revel Dancer | 3 | Mị Ảo | Múa làm địch xung quanh múa theo (Mê) và đánh lẫn nhau. | vòng hoa trên đầu + cánh rắc phấn |  |
<!-- END GENERATED -->

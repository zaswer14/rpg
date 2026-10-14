# Skeleton Codex — Thiết kế ngoại hình 36 nghề

**Ngày:** 14/10/2026 · **Nền:** V12.3 (36 nghề, 38 cạnh; Siege Gunner và cạnh Grave Bandit → Shade Stalker đã thêm theo `docs/13`) · **Đi kèm:** `02_Skeleton_Character_Art_Style_Guide.md` (style, palette, prompt), `11_Art_Pipeline_ChatGPT_PixelLab.md` (paper-doll overlay 64×64), `13_Job_Tree_Review.md` (đánh giá cây nghề).

Tài liệu này trả lời một câu hỏi: **đứng cạnh nhau ở 64 px, 35 nghề có phân biệt được không, và phân biệt bằng cái gì.** Nó không nói về Rank. Rank I→V chỉ thay đổi *tình trạng* của cùng một bộ đồ (rách → vá → lành → tinh → di vật, theo mục 14 của `docs/02`); nó không được dùng để tạo ra khác biệt giữa nghề này với nghề kia.

---

## 0. Nguyên tắc (rút từ tham khảo)

Nguồn tham khảo: bài về shape language trong character design (blackout test, "silhouette trước, màu sau, chi tiết cuối"), cách Valve phân tầng đọc hình trong Team Fortress 2 (màu = phe, silhouette = class, chi tiết = thứ ba), phỏng vấn Diablo IV (mỗi class khác nhau cả về *dáng người*: Necromancer gầy gò, Druid bụng bự, Barbarian vai rộng), Ragnarok Online (Hunter nhận ra nhờ chim ưng đi kèm, Assassin nhờ song đao), Dark Souls / Elden Ring (Prisoner = mặt nạ sắt + vải rách, Deprived = không có gì, Confessor = mũ trùm + giáp), và trang phục lịch sử theo vai trò (hoplite = khiên tròn lớn + mũ mào; pikeman = mũ "pot" + tassets + áo da; landsknecht = quần áo rạch nhiều màu; thợ săn trung cổ = len mộc, màu xỉn, đồ bền).

Từ đó, sáu luật bắt buộc cho mọi nghề trong game này:

1. **Ba tầng đọc hình, theo thứ tự.** Tầng 1: silhouette (tô đen toàn bộ vẫn nhận ra nghề). Tầng 2: mảng màu chủ đạo + 1 màu nhấn. Tầng 3: chi tiết. Nếu tầng 1 thất bại thì tầng 3 không cứu được.
2. **Mỗi nghề có đúng một Marker.** Marker là vật/hình khối gắn với nghề đó và **không nghề nào khác được dùng** (xem bảng mục 2). Marker phải tồn tại từ Rank I, dù ở trạng thái rách/gãy.
3. **Rank không tạo nghề.** Không được phân biệt cha/con bằng "thêm giáp, thêm glow". Nghề con phải đổi silhouette hoặc đổi marker. Nếu bản Rank V của nghề cha trông giống Rank I của nghề con, thiết kế sai.
4. **Dòng dõi giữ một chi tiết, không giữ bộ đồ.** Nghề con kế thừa đúng 1 chi tiết lineage từ cha (dải lụa đỏ, kính goggles, hộ thủ...) để người chơi thấy "đây là con đường mình đã đi", còn lại thay mới.
5. **Dáng đứng là một phần thiết kế.** Cùng một thân xương 64×64, nhưng idle của Duelist là thế thủ kiếm nghiêng người, Bandit khom lưng ôm bao, Death Whisper đứng thẳng bất động. Dáng là thứ rẻ nhất để tạo khác biệt trong paper-doll.
6. **Màu nhấn thuộc nhánh, không thuộc Tier.** Xanh tử linh (`#5DDF96`) chỉ dùng cho nhánh Death. Nhánh Shadow dùng tím/teal, Combat lai tử thuật dùng lửa hồn xanh lạnh (`#7FB8FF`), Ranged dùng cyan ma nhạt. Nếu mọi nghề cao cấp đều phát sáng xanh lá thì ở 64 px chúng là một.

**Blackout test bắt buộc:** trước khi duyệt portrait, tô đen toàn bộ nhân vật và đặt 35 bóng đen cạnh nhau. Nghề nào không nhận ra → sửa silhouette, không sửa màu.

---

## 1. Bảng màu theo nhánh

| Nhánh | Màu chủ đạo (vải/giáp) | Màu nhấn | Nhấn thứ cấp theo tuyến | Không dùng |
|---|---|---|---|---|
| Origin | xương trần `#C6B58A`, vải rách `#5A4A3C` | không có | — | mọi màu phép |
| Combat · Guard→Phalanx→Marshal | thép `#99A4A7`, đồng `#B08D57` | lam hải quân `#2E4A6B` | — | glow |
| Combat · Guard→Dread→Death→Abyss | sắt đen `#3A3D42` | lửa hồn xanh lạnh `#7FB8FF` | Abyss: đỏ vực sâu `#8E1B2C` | xanh tử linh |
| Combat · Duelist→Wraith | thép sáng `#C9D1D4` | đỏ thẫm `#A62B3A` | Wraith: trắng mờ `#E8EEF0` | — |
| Combat · Raider→Marauder | lông thú gỉ `#8C5A2E`, sắt thô | vàng cướp được `#D9A441` | — | — |
| Ranged · Marksman→Sniper→Huntsman | thông đậm `#1F3A2A` | cyan ma `#8FD8D2` (từ T3) | Huntsman: vàng nhạt `#D8C98A` | xanh tử linh |
| Ranged · Hunter→Wild Hunt | nâu hung `#7A5230`, da lông | xương chiến lợi phẩm `#F0E3B8` | hound: cyan ma | — |
| Shadow · Assassin→Soul→Whisper | chàm đen `#1C1F33` | tím `#926ACC` | Soul Assassin thêm 1 chấm xanh ở lọ | xanh tử linh trên thân |
| Shadow · Assassin→Stalker | đen `#101214` | teal `#2F8F8A` mép áo | — | — |
| Shadow · Bandit→Marauder | bố gai `#8A7A5C`, vá loang | vàng cướp được `#D9A441` | — | — |
| Death · Necro→Grand→Lich→Sovereign | đen `#15121A`, viền xương | xanh tử linh `#5DDF96` | Sovereign thêm vàng cổ `#C8A64B` | — |
| Death · Medium→Weaver | lanh xám lam `#A9B4BF` | cyan mềm `#9FE0F0` | — | tím |
| Craft | đồng thau `#B8862B`, bạt `#C9B58F` | gỉ xanh `#5E9C8A` | Architect: lam bản vẽ `#3F6FA8` | glow phép |
| Craft · Siege Gunner | đen thuốc súng `#2B2724`, đồng thau | cam tia lửa `#E07A2F` chỉ ở nòng/kíp | — | glow phép, gỉ xanh |

---

## 2. Bảng Marker (kiểm tra trùng)

| Nghề | Marker duy nhất | Khối silhouette | Dáng idle |
|---|---|---|---|
| Wanderer | *không có* (trạng thái số 0) | que thẳng gầy | lom khom, đầu nghiêng |
| Bone Fighter | mũ sắt vành rộng (kettle hat) + áo bông chần | chữ nhật đứng | kiếm gác vai |
| Skeleton Archer | ống tên đeo **hông** + bao tay cung | que + cung cong | cung hạ thấp |
| Bone Rogue | mũ trùm ngắn + áo choàng ngang eo | tam giác thấp | khom người tới trước |
| Bone Acolyte | áo thụng dây thừng + pháp khí nứt cầm hai tay | chữ A | ôm pháp khí trước ngực |
| Bone Tinkerer | goggles đẩy lên trán + ba lô cồng kềnh | cục u lệch | quỳ một gối soi đồ |
| Bone Guard | khiên tháp rộng hơn thân + mũ sống mũi | chữ nhật ngang | khiên chắn trước |
| Bone Duelist | dải lụa đỏ + **một** pauldron bên tay kiếm | que nghiêng + lưỡi dài | thế thủ kiếm nghiêng |
| Bone Raider | áo khoác lông vai + rìu râu hai tay | hình thang vai rộng | rìu gác vai, chúi tới |
| Bone Marksman | trường cung **cao hơn người** + ống tên lưng xòe | đường dọc rất cao | đứng nghiêng, kéo dây |
| Grave Hunter | mũ trùm sọ sói + bẫy kẹp đeo thắt lưng | thấp, lổn nhổn | quỳ, tay đặt lên bẫy |
| Grave Assassin | khăn bịt kín mặt + song đao cong | mảnh, đối xứng | thấp, hai dao chéo |
| Grave Bandit | bao chiến lợi phẩm trên lưng + khăn bandana | lệch một bên | khom, tay giữ bao |
| Necromancer | mũ trùm nhọn + gậy đầu lâu | chữ A + que dọc | gậy cắm đất, tay kia giơ |
| Soul Medium | **bịt mắt** + đèn lồng hồn trên cán ngắn | tay áo rộng xòe | đèn giơ cao, đầu nghiêng nghe |
| Bone Engineer | cẳng tay máy piston + trụ canh gấp trên lưng | hộp vuông | đứng cạnh thùng trụ |
| Bone Phalanx | mũ mào dọc + khiên tròn lớn | tròn + que xiên | shield-wall, thương trên vai |
| Dread Knight | mũ kín không mào + xích quấn tay, **không khiên** | rộng + áo choàng rách | đại kiếm cắm đất, hai tay tựa chuôi |
| Sword Wraith | khăn quàng dài bay + nửa dưới mờ dần | que rất mảnh | iai, kiếm trong vỏ |
| Grave Marauder | vương miện cướp được đội lệch + đai chiến lợi phẩm | to, bất đối xứng | chân gác lên rương |
| Phantom Sniper | **một** hốc mắt bịt vải + tên đuôi ma | cao, quỳ | quỳ ngắm |
| Wild Hunt Captain | **gạc hươu** trên sọ + tù và + chó săn ma | gạc rộng trên đầu | tù và kề miệng |
| Soul Assassin | nửa mặt nạ xương + lọ hồn treo đai | mảnh, lọ lủng lẳng | một dao kề tai nghe |
| Shade Stalker | mũ trùm **không có mặt** + móng leo | áo choàng dài quét đất | bám tường, áo bay |
| Grand Necromancer | vòng xương trên sọ + cổ áo dựng cao + sọ bay | rộng vai nhờ cổ áo | sọ bay lơ lửng cạnh |
| Soul Weaver | sợi hồn từ **đầu ngón tay** + con thoi dệt | tua sợi rủ | tay dang, sợi căng |
| Bone Tinkerer Prime (Bone Artificer) | ba lô có **hai cánh tay máy** + kính nhiều thấu kính | thêm "tay" sau lưng | tay máy đang làm việc |
| Siege Gunner | pháo vác vai **nằm ngang, dài hơn người** + bịt tai da | đường ngang thấp | quỳ, pháo chống chân xuống đất |
| Legion Marshal | mào **ngang** + cờ hiệu | cờ dọc + mào ngang | cờ cắm, khiên tựa |
| Death Knight | mũ mặt sọ + khiên hồn trong suốt | khối plate đầy | đứng chỉ huy |
| Eternal Huntsman | mũ rộng vành + áo choàng da ghép nhiều loài | vành mũ + cung lớn | tên cắm đất quanh chân |
| Death Whisper | mặt nạ xương **trơn không nét** + tối giản tuyệt đối | que thẳng, không phụ kiện | đứng thẳng, tay buông |
| Lich King (Lich) | vương miện liền sọ + **bình phách sáng trong lồng ngực** | cao + lơ lửng | lơ lửng, gậy ngang |
| Bone Architect | cuộn bản vẽ + construct xương đi theo | ngang rộng (có construct) | mở bản vẽ |
| Abyss Sovereign | pauldron khổng lồ + khe nứt đỏ trên giáp | rộng nhất game | đại kiếm chống, áo choàng dài |
| Death Sovereign | **vầng sọ** sau đầu + áo bào bằng hồn | hào quang tròn | lơ lửng, 5 sọ quay |

Kiểm tra: 36 marker, không cái nào dùng chung. Hai chỗ dễ nhầm đã tách chủ ý: gạc hươu (Wild Hunt Captain) ≠ mũ sọ sói (Grave Hunter); bịt mắt hai bên (Soul Medium) ≠ bịt một mắt (Phantom Sniper); mũ trùm nhọn (Necromancer) ≠ mũ trùm không mặt (Shade Stalker) ≠ mũ trùm ngắn (Rogue).

---

## 3. Thiết kế từng nghề

Cấu trúc mỗi mục: **Khái niệm** (tham chiếu 1 dòng) · **Silhouette** · **Đầu** · **Thân** · **Vũ khí / tay phụ** · **Marker** · **Màu** · **Dáng** · **Khác với nghề liên quan** · **Lớp overlay** (theo pipeline paper-doll: `head / torso / cape / weapon / offhand / prop`) · **Prompt** (dòng tiếng Anh ghép vào master prompt `docs/02` mục 8).

Mọi nghề dùng chung thân xương trần 64×64, cùng tỷ lệ sọ. Không nghề nào được phóng to người. "Nửa dưới mờ dần" của Sword Wraith là overlay alpha trên ống chân, không xóa chân.

### Tier 0

#### Wanderer · Kẻ Lang Thang
- **Khái niệm:** Deprived của Dark Souls. Không có gì để nhận diện, và đó là nhận diện.
- **Silhouette:** que gầy, thẳng, không phụ kiện.
- **Đầu:** sọ trần, hốc mắt tối, không glow.
- **Thân:** một mảnh vải rách quấn hông, một dây da chéo ngực không đeo gì.
- **Vũ khí:** que gỗ gãy hoặc lưỡi gỉ không chuôi, cầm một tay.
- **Marker:** không có. Người chơi phải *muốn* thoát khỏi trạng thái này.
- **Màu:** xương + vải nâu xám. Tuyệt đối không màu nhấn.
- **Dáng:** lom khom, vai xuôi, đầu hơi nghiêng như vừa tỉnh.
- **Khác với:** mọi nghề T1 đều thêm đúng 1 khối lên bóng này.
- **Overlay:** `torso` (vải hông), `weapon`.
- **Prompt:** `bare ivory skeleton, single torn loincloth, one empty leather strap, holding a broken wooden stick, slouched posture`.

### Tier 1

#### Bone Fighter · Chiến Binh Xương
- **Khái niệm:** lính levy / man-at-arms cấp thấp. Không phải hiệp sĩ.
- **Silhouette:** chữ nhật đứng, vành mũ tròn làm đỉnh phẳng rộng.
- **Đầu:** kettle hat (mũ sắt vành rộng kiểu chapel de fer), mặt để hở.
- **Thân:** gambeson chần bông có đường khâu ngang, đai da đơn, ống chân quấn vải.
- **Vũ khí:** arming sword thẳng, một tay. **Không khiên** (khiên là của Guard).
- **Marker:** kettle hat + gambeson.
- **Màu:** thép + vải bông mộc chưa nhuộm.
- **Dáng:** kiếm gác vai, chân rộng vừa.
- **Khác với:** Wanderer thêm mũ + áo; Guard sẽ *thêm khiên và đổi mũ*; Duelist *bỏ mũ*; Raider *bỏ áo bông lấy lông*.
- **Overlay:** `head`, `torso`, `weapon`.
- **Prompt:** `wide-brimmed kettle helmet, quilted padded gambeson with horizontal stitching, single leather belt, plain arming sword resting on shoulder, no shield`.

#### Skeleton Archer · Cung Thủ Xương
- **Khái niệm:** yeoman archer. Đồ bền, không màu mè.
- **Silhouette:** que mảnh + một cung cong ở bên; **ống tên ở hông** tạo bướu thấp (khác hẳn ống tên lưng của Marksman).
- **Đầu:** mũ da hình bát ôm sọ, không mũ trùm.
- **Thân:** jerkin da không tay, bao tay cung (bracer) ở cẳng tay trái rõ, dây đeo ống tên ngang hông.
- **Vũ khí:** cung ngắn. Mũi tên nhô ra khỏi ống hông.
- **Marker:** ống tên hông + bracer.
- **Màu:** rêu + nâu da.
- **Dáng:** cung hạ thấp, một mũi tên lắp lỏng.
- **Khác với:** Rogue có mũ trùm, Archer không. Marksman sẽ đổi sang trường cung + ống tên lưng.
- **Overlay:** `head`, `torso` (gồm ống hông), `weapon`.
- **Prompt:** `leather skullcap, sleeveless leather jerkin, leather bracer on left forearm, arrow quiver worn at the hip, shortbow held low`.

#### Bone Rogue · Đạo Tặc Xương
- **Khái niệm:** cutpurse / footpad. Chưa phải sát thủ.
- **Silhouette:** tam giác thấp, áo choàng ngắn ngang eo xòe ra phía sau.
- **Đầu:** mũ trùm ngắn (cowl) che đỉnh sọ, mặt để hở.
- **Thân:** áo choàng ngắn tối màu, quấn da ngực, quấn gối.
- **Vũ khí:** một dao găm cầm ngược, dao thứ hai trong vỏ ở đùi.
- **Marker:** mũ trùm ngắn + áo choàng ngang eo.
- **Màu:** chàm/teal tối + da.
- **Dáng:** khom thấp, trọng tâm dồn chân trước.
- **Khác với:** Assassin sẽ *bịt mặt và bỏ áo choàng*; Bandit *bỏ mũ trùm lấy bandana + bao*.
- **Overlay:** `head`, `cape` (ngắn), `torso`, `weapon`.
- **Prompt:** `short dark cowl hood, waist-length tattered cloak, leather chest wrap, single dagger in reverse grip, low crouching stance`.

#### Bone Acolyte · Tập Sự Tử Thuật
- **Khái niệm:** novice của một giáo phái. Chưa được trùm mũ.
- **Silhouette:** chữ A, chân khuất trong vạt áo.
- **Đầu:** sọ trần (mũ trùm là đặc quyền của Necromancer).
- **Thân:** áo thụng xám tro sờn đến mắt cá, thắt dây thừng, cổ áo lệch.
- **Vũ khí:** pháp khí nứt (tượng xương nhỏ gắn trên que ngắn) **cầm bằng hai tay** trước ngực.
- **Marker:** áo thụng dây thừng + pháp khí hai tay.
- **Màu:** xám tro; chỉ một chấm xanh tử linh rất nhỏ ở pháp khí.
- **Dáng:** ôm pháp khí, hơi cúi.
- **Khác với:** Necromancer thêm mũ trùm nhọn và gậy dài; Medium thêm bịt mắt và đèn.
- **Overlay:** `torso` (áo dài), `weapon`.
- **Prompt:** `bare skull, frayed ash-grey floor-length robe with rope belt, cracked bone idol focus held in both hands at chest height, hunched`.

#### Bone Tinkerer · Thợ Chế Tác Xương
- **Khái niệm:** tinker bãi phế liệu.
- **Silhouette:** cục u lệch do ba lô to, một bên vai cao.
- **Đầu:** goggles đẩy lên trán, mũ da có che tai.
- **Thân:** tạp dề phủ xương sườn trần, đai dụng cụ, một bên bao tay quá khổ.
- **Vũ khí:** cờ-lê lớn.
- **Marker:** goggles trên trán + ba lô.
- **Màu:** đồng thau + bạt.
- **Dáng:** quỳ một gối, cúi soi vật dưới đất.
- **Khác với:** Engineer sẽ *kéo goggles xuống mắt và thêm cánh tay máy*.
- **Overlay:** `head`, `torso` (tạp dề + ba lô), `weapon`.
- **Prompt:** `goggles pushed up on forehead, leather cap with ear flaps, work apron over exposed ribs, bulky lopsided backpack, oversized glove on one hand, large wrench`.

### Tier 2

#### Bone Guard · Vệ Binh Xương
- **Khái niệm:** lính gác thành / sergeant.
- **Silhouette:** chữ nhật **ngang**: khiên tháp rộng hơn thân.
- **Đầu:** mũ sống mũi (nasal spangenhelm). Đổi hẳn khỏi kettle hat.
- **Thân:** giáp lưới trên gambeson, surcoat lam hải quân có vạch chéo, ống chân sắt.
- **Vũ khí:** kiếm ngắn + **khiên tháp** cao từ vai tới gối.
- **Marker:** khiên tháp + mũ sống mũi.
- **Màu:** thép + lam hải quân.
- **Dáng:** khiên dựng phía trước, chân cắm.
- **Khác với:** Fighter không khiên; Phalanx sẽ đổi khiên tháp → khiên tròn và thêm mào.
- **Overlay:** `head`, `torso`, `weapon`, `offhand` (khiên).
- **Prompt:** `nasal helm, mail hauberk under navy surcoat with diagonal stripe, steel greaves, short sword, tall rectangular tower shield wider than the body held forward`.

#### Bone Duelist · Kiếm Sĩ Xương
- **Khái niệm:** kiếm sĩ đấu tay đôi thời Phục Hưng.
- **Silhouette:** que nghiêng, lưỡi kiếm dài chĩa ra tạo đường chéo.
- **Đầu:** **bỏ mũ**, quấn khăn đầu mỏng.
- **Thân:** doublet bó, **một** pauldron bên tay kiếm, bên kia trống (bất đối xứng chủ ý), dải lụa đỏ chéo ngực.
- **Vũ khí:** kiếm thẳng dài mảnh (estoc). Tay phụ giấu sau lưng.
- **Marker:** dải lụa đỏ + một pauldron.
- **Màu:** thép sáng + đỏ thẫm.
- **Dáng:** thế thủ nghiêng người, chân sau duỗi.
- **Khác với:** Fighter đứng vuông; Duelist nghiêng. Sword Wraith sẽ giữ dải đỏ, làm rách doublet, thêm khăn quàng và mờ chân.
- **Overlay:** `head`, `torso`, `weapon`.
- **Prompt:** `no helmet, thin head wrap, fitted doublet, single pauldron on sword arm only, crimson sash across chest, long slender straight sword in fencing guard, off hand behind back`.

#### Bone Raider · Chiến Binh Cướp Phá
- **Khái niệm:** chiến binh cướp bóc kiểu Bắc Âu. Không sừng.
- **Silhouette:** hình thang vai rộng nhờ lông, rìu to tạo khối ở vai.
- **Đầu:** mũ lông có hàm thú gắn trán.
- **Thân:** áo khoác lông vai trên xương sườn trần (không giáp ngực), cẳng tay quấn dây.
- **Vũ khí:** rìu râu (bearded axe) cầm hai tay.
- **Marker:** áo lông vai + rìu râu.
- **Màu:** lông gỉ + sắt thô.
- **Dáng:** rìu gác vai, thân chúi tới trước.
- **Khác với:** Fighter có áo bông; Raider ngực trần + lông. Marauder sẽ thêm chiến lợi phẩm và vương miện lệch.
- **Overlay:** `head`, `torso` (lông vai), `weapon`.
- **Prompt:** `fur cap with animal jawbone on the brow, heavy fur mantle over bare ribcage, no chest armor, rope-wrapped forearms, two-handed bearded axe over shoulder, forward-leaning wide stance`.

#### Bone Marksman · Thiện Xạ Xương
- **Khái niệm:** longbowman / xạ thủ. Lạnh, kỷ luật.
- **Silhouette:** **đường dọc cao hơn nhân vật** (trường cung), ống tên lưng xòe như quạt.
- **Đầu:** mũ da bó có **một lông chim dài** cắm ngang, một hốc mắt tối hơn (đang ngắm).
- **Thân:** áo khoác dài xẻ tà màu thông đậm, ống tên sau lưng nhiều tên.
- **Vũ khí:** trường cung gần bằng chiều cao người.
- **Marker:** trường cung + ống tên lưng xòe.
- **Màu:** thông đậm + đen.
- **Dáng:** đứng nghiêng hoàn toàn, đang kéo dây.
- **Khác với:** Archer cung ngắn, ống hông, mũ bát. Sniper sẽ bịt một mắt và quỳ.
- **Overlay:** `head`, `torso` (gồm ống lưng), `weapon`.
- **Prompt:** `tight leather cap with one long feather, long dark pine coat split for the legs, back quiver with fanned arrows, longbow as tall as the character, side-on drawing pose`.

#### Grave Hunter · Thợ Săn Mộ
- **Khái niệm:** trapper / forester. Đồ bền, màu xỉn, đầy đồ nghề.
- **Silhouette:** thấp, lổn nhổn do da thú và bẫy treo.
- **Đầu:** mũ trùm làm từ **sọ sói** đội lên sọ.
- **Thân:** da thú ghép, băng đạn bằng xương nhỏ chéo ngực, dây thừng cuộn, **bẫy kẹp** treo thắt lưng.
- **Vũ khí:** cung ngắn cong (recurve) + tù và nhỏ (chưa thổi, chỉ treo).
- **Marker:** sọ sói + bẫy kẹp.
- **Màu:** nâu hung + xương.
- **Dáng:** quỳ, một tay đặt lên bẫy.
- **Khác với:** Marksman cao và gọn; Hunter thấp và lổn nhổn. Wild Hunt Captain sẽ thay sọ sói bằng gạc hươu và thêm chó.
- **Overlay:** `head`, `torso`, `weapon`, `prop` (bẫy, có thể gắn trong torso).
- **Prompt:** `wolf-skull hood worn over the skull, patched animal pelts, bandolier of small bone trinkets, coiled rope, iron bear trap hanging from belt, short recurve bow, kneeling`.

#### Grave Assassin · Sát Thủ Mộ
- **Khái niệm:** sát thủ cổ điển.
- **Silhouette:** mảnh, **đối xứng** (song đao), không áo choàng.
- **Đầu:** mũ trùm bó + **khăn bịt kín mặt**, chỉ hở hốc mắt tím.
- **Thân:** quấn vải bó, dây da chéo, không áo choàng (áo choàng là của Rogue).
- **Vũ khí:** hai dao cong, mỗi tay một.
- **Marker:** bịt mặt + song đao.
- **Màu:** chàm đen + tím hốc mắt.
- **Dáng:** thấp, hai dao chéo trước ngực.
- **Khác với:** Rogue hở mặt, một dao, có áo choàng. Soul Assassin thêm nửa mặt nạ xương + lọ. Shade Stalker bỏ dao, thêm áo choàng dài.
- **Overlay:** `head`, `torso`, `weapon`, `offhand` (dao 2).
- **Prompt:** `tight hood with full face wrap showing only violet eye sockets, tight dark cloth wraps, strapped leather, no cloak, one curved dagger in each hand crossed low`.

#### Grave Bandit · Đạo Tặc Hầm Mộ
- **Khái niệm:** highwayman / kẻ đào mộ.
- **Silhouette:** **lệch một bên** do bao chiến lợi phẩm trên lưng.
- **Đầu:** bandana buộc sọ + băng vải che một hốc mắt kiểu bịt vết thương (không phải bịt mắt nghi lễ của Medium).
- **Thân:** gi-lê bố gai vá loang, hai chiếc ủng khác nhau, nhiều túi, một sợi dây chuyền vàng ăn cắp.
- **Vũ khí:** rìu nhỏ (hatchet) + dao; bao tải căng.
- **Marker:** bao tải + bandana.
- **Màu:** bố gai bẩn + chấm vàng cướp.
- **Dáng:** khom, một tay giữ quai bao.
- **Khác với:** Rogue gọn và tối; Bandit bẩn, lệch, lắm đồ. Marauder sẽ thay bao bằng rương và vương miện.
- **Overlay:** `head`, `torso` (gồm bao), `weapon`.
- **Prompt:** `bandana tied over skull, dirty patched burlap vest, mismatched boots, many pouches, stolen gold chain, large loot sack slung over one shoulder, hatchet and knife`.

#### Necromancer · Pháp Sư Tử Linh
- **Khái niệm:** necromancer kinh điển. Đây là lần đầu nhánh Death được trùm mũ.
- **Silhouette:** chữ A + que dọc (gậy), **đỉnh mũ nhọn** nhô cao.
- **Đầu:** mũ trùm nhọn sâu, mặt chìm trong bóng, hai chấm mắt xanh.
- **Thân:** áo bào đen nhiều lớp viền trắng xương, chuỗi hạt sọ nhỏ.
- **Vũ khí:** gậy xương cao hơn người, đầu gậy là một sọ.
- **Marker:** mũ trùm nhọn + gậy sọ.
- **Màu:** đen + xanh tử linh.
- **Dáng:** gậy cắm đất, tay kia giơ một đốm xanh.
- **Khác với:** Acolyte sọ trần, pháp khí ngắn. Grand Necromancer sẽ hất mũ ra sau.
- **Overlay:** `head`, `torso`, `weapon`, `prop` (đốm phép, VFX).
- **Prompt:** `deep peaked hood shadowing the face with two green eye points, layered black robe with bone-white trim, skull bead necklace, tall bone staff topped with a skull planted in the ground`.

#### Soul Medium · Linh Môi
- **Khái niệm:** đồng cốt / shaman mù.
- **Silhouette:** tay áo rộng xòe hai bên, đèn lồng tạo khối tròn sáng một bên.
- **Đầu:** **vải bịt cả hai mắt**, vài lá bùa giấy treo rủ từ vành.
- **Thân:** lanh xám lam nhiều lớp, tay áo dài quá tay, chuông nhỏ ở đai.
- **Vũ khí:** đèn lồng hồn trên cán ngắn.
- **Marker:** bịt mắt + đèn lồng.
- **Màu:** xám lam nhạt + cyan mềm (không phải xanh tử linh).
- **Dáng:** đèn giơ cao, đầu nghiêng như lắng nghe.
- **Khác với:** Necromancer đen và nhọn; Medium nhạt và mềm. Weaver sẽ giữ bịt mắt, thêm sợi.
- **Overlay:** `head`, `torso`, `weapon` (đèn).
- **Prompt:** `cloth blindfold over both eye sockets, hanging paper talismans, pale grey-blue layered linen with oversized sleeves, small bells on belt, soul lantern on a short pole held high, head tilted`.

#### Bone Engineer · Kỹ Sư Xương
- **Khái niệm:** kỹ sư công thành.
- **Silhouette:** hộp vuông: giá đỡ ngực, trụ gấp sau lưng, cẳng tay máy to.
- **Đầu:** **goggles kéo xuống che mắt** + đèn đồng trên trán.
- **Thân:** tạp dề da đóng tấm kim loại, **một cẳng tay bằng máy** (piston).
- **Vũ khí:** búa-cờ-lê nặng; trụ canh gấp đeo lưng.
- **Marker:** cẳng tay máy + trụ gấp trên lưng.
- **Màu:** đồng thau + da đen dầu.
- **Dáng:** đứng, thùng trụ đặt cạnh chân.
- **Khác với:** Tinkerer goggles trên trán, ba lô mềm; Engineer goggles xuống mắt, lưng cứng. Prime sẽ thêm hai tay máy ở ba lô.
- **Overlay:** `head`, `torso` (gồm tay máy, trụ gấp), `weapon`.
- **Prompt:** `goggles worn down over the eye sockets, brass headlamp, riveted leather apron with metal plates, one mechanical piston forearm, folded sentry turret strapped to the back, heavy wrench-hammer`.

### Tier 3

#### Bone Phalanx · Vệ Quân Khiên Thương
- **Khái niệm:** hoplite Hy Lạp. Khiên tròn là thứ quan trọng nhất của hoplite, mũ mào là thứ nhận ra từ xa.
- **Silhouette:** vòng tròn lớn + que xiên (thương), mào dọc trên đầu.
- **Đầu:** mũ kiểu Corinth che mặt với **mào dọc** (lông ngựa).
- **Thân:** giáp ngực đúc màu đồng, diềm da (pteruges), ống chân đồng.
- **Vũ khí:** thương dài + **khiên tròn** (hoplon) che từ cằm tới đùi.
- **Marker:** mào dọc + khiên tròn.
- **Màu:** đồng + lam hải quân.
- **Dáng:** shield-wall, thương cầm trên vai chĩa xuống.
- **Khác với:** Guard khiên tháp vuông, mũ sống mũi. Marshal sẽ xoay mào thành ngang và thêm cờ.
- **Overlay:** `head`, `torso`, `weapon`, `offhand` (khiên tròn).
- **Prompt:** `corinthian-style helmet with tall vertical horsehair crest, bronze muscle cuirass with leather pteruges strips, bronze greaves, long spear held overhand, large round hoplon shield`.

#### Dread Knight · Kỵ Sĩ Kinh Hoàng
- **Khái niệm:** hiệp sĩ sa ngã, black knight. Đã **vứt khiên**.
- **Silhouette:** rộng vai, áo choàng rách bay, đại kiếm dọc giữa.
- **Đầu:** mũ kín (great helm) khe mắt hẹp, **không mào**, ánh lửa hồn xanh lạnh lọt qua khe.
- **Thân:** plate sắt đen ghép lệch (một bên pauldron bị nguyền), **xích** quấn cẳng tay, áo choàng rách.
- **Vũ khí:** đại kiếm hai tay. **Không khiên.**
- **Marker:** mũ kín + xích + không khiên.
- **Màu:** sắt đen + lửa hồn xanh lạnh `#7FB8FF`. Không dùng xanh tử linh dù có mastery Necromancy.
- **Dáng:** đại kiếm cắm đất, hai tay tựa chuôi.
- **Khác với:** Guard có khiên; Dread Knight từ bỏ khiên là tuyên ngôn. Death Knight sẽ lấy lại khiên nhưng là khiên hồn.
- **Overlay:** `head`, `torso`, `cape`, `weapon`.
- **Prompt:** `closed great helm with narrow slit glowing cold blue, blackened mismatched plate armor, chains wrapped around one forearm, tattered cape, two-handed greatsword point-down with both hands on the pommel, no shield`.

#### Sword Wraith · Kiếm Hồn
- **Khái niệm:** kiếm sĩ ma. Terminal, nên được phép phá luật "chân chạm đất" một phần.
- **Silhouette:** que **rất mảnh**, khăn quàng dài bay ngược chiều, ống chân mờ dần.
- **Đầu:** sọ trần, hàm buộc vải, khăn quàng dài quấn cổ bay ra sau.
- **Thân:** doublet của Duelist nay rách, mép áo bán trong suốt; **dải lụa đỏ còn nguyên** (lineage).
- **Vũ khí:** một trường kiếm hơi trong suốt, cầm thế iai (trong vỏ, tay trên chuôi).
- **Marker:** khăn quàng dài + nửa dưới mờ.
- **Màu:** trắng mờ + đỏ thẫm. Không xanh.
- **Dáng:** iai, nghiêng 3/4, bất động.
- **Khác với:** Duelist đặc, có pauldron; Wraith bỏ pauldron, mờ chân. Death Whisper cũng mảnh nhưng đen đặc và không bay gì cả.
- **Overlay:** `head`, `torso`, `cape` (khăn), `weapon`, alpha mask ống chân.
- **Prompt:** `bare skull with cloth-bound jaw, long tattered scarf streaming behind, torn translucent-edged duelist doublet, crimson sash intact, single long faintly translucent sword in sheathed iai stance, lower legs fading to mist`.

#### Grave Marauder · Kẻ Tàn Phá Lăng Mộ
- **Khái niệm:** warlord cướp mộ. Hội tụ từ Raider (lông) và Bandit (chiến lợi phẩm): lấy cả hai.
- **Silhouette:** to, **bất đối xứng**: một pauldron quý tộc cướp được, một bên trần.
- **Đầu:** **vương miện cướp được đội lệch** trên mũ lông.
- **Thân:** lông vai + mảnh giáp lẫn lộn từ nhiều mộ, đai treo chiến lợi phẩm (nhẫn, mặt dây, răng).
- **Vũ khí:** đại rìu + rìu nhỏ cài hông; rương nhỏ dưới chân.
- **Marker:** vương miện lệch + đai chiến lợi phẩm.
- **Màu:** gỉ + vàng cướp.
- **Dáng:** chân gác lên rương.
- **Khác với:** Raider sạch chiến lợi phẩm; Bandit không giáp. Marauder có cả hai, cộng vương miện.
- **Overlay:** `head`, `torso`, `weapon`, `prop` (rương).
- **Prompt:** `looted crown worn crooked over a fur cap, fur mantle with one ornate stolen noble pauldron and the other shoulder bare, belt hung with grave trophies, great axe, one foot on a small chest`.

#### Phantom Sniper · Xạ Thủ U Linh
- **Khái niệm:** xạ thủ ma. Lần đầu nhánh Ranged có màu phép, và là cyan ma, không phải xanh tử linh.
- **Silhouette:** cao, **quỳ**, trường cung chĩa chéo.
- **Đầu:** mũ trùm hạ xuống, **một hốc mắt bịt vải** (mắt ngắm), hốc kia sáng cyan.
- **Thân:** áo khoác dài, đường may phát sáng cyan mờ, tên có đuôi ma.
- **Vũ khí:** trường cung dây là sợi hồn.
- **Marker:** bịt một mắt + tên đuôi ma.
- **Màu:** thông đậm + cyan ma `#8FD8D2`.
- **Dáng:** quỳ ngắm.
- **Khác với:** Marksman đứng, hai mắt; Sniper quỳ, một mắt. Huntsman sẽ đứng dậy và đội mũ vành.
- **Overlay:** `head`, `torso`, `weapon`, VFX dây cung.
- **Prompt:** `hood down, one eye socket bound with cloth and the other glowing pale cyan, long coat with faintly glowing seams, longbow with a ghostly string, kneeling aiming pose, arrows with spectral fletching`.

#### Wild Hunt Captain · Đội Trưởng Cuộc Săn
- **Khái niệm:** thủ lĩnh Cuộc Săn Hoang (Wild Hunt). Theo Ragnarok, thợ săn được nhận ra nhờ *con vật đi kèm*.
- **Silhouette:** **gạc hươu** rộng trên đầu, chó săn ma bên cạnh.
- **Đầu:** sọ gắn gạc hươu thật (không phải mũ).
- **Thân:** da thú nhiều lớp, tù và lớn trên dây chéo, trophies.
- **Vũ khí:** cung cong + tù và; **chó săn** (sprite riêng, màu cyan ma).
- **Marker:** gạc + chó.
- **Màu:** nâu hung + xương; chó cyan.
- **Dáng:** tù và kề miệng.
- **Khác với:** Hunter sọ sói, không chó. Huntsman mũ vành, không gạc.
- **Overlay:** `head` (gạc), `torso`, `weapon`, `prop` (tù và), companion sprite.
- **Prompt:** `stag antlers growing from the skull, layered pelts, large hunting horn on a strap raised to the jaw, recurve bow, a small spectral pale-cyan hound at the character's side`.

#### Soul Assassin · Sát Thủ Đoạt Hồn
- **Khái niệm:** sát thủ thu hồn.
- **Silhouette:** như Assassin nhưng có **lọ nhỏ lủng lẳng** ở đai tạo chấm sáng.
- **Đầu:** khăn bịt mặt + **nửa mặt nạ xương** chạm khắc che hàm trên.
- **Thân:** quấn vải bó, 3–4 lọ hồn treo đai (chấm sáng xanh nhạt, chấm duy nhất được phép).
- **Vũ khí:** song đao, một lưỡi ám xanh.
- **Marker:** nửa mặt nạ + lọ hồn.
- **Màu:** chàm + tím; lọ xanh nhạt.
- **Dáng:** một dao kề tai như đang nghe.
- **Khác với:** Assassin không mặt nạ, không lọ. Death Whisper bỏ hết lọ, mặt nạ thành trơn.
- **Overlay:** `head`, `torso` (lọ), `weapon`, `offhand`.
- **Prompt:** `face wrap with a carved bone half-mask over the upper jaw, tight wraps, three small glowing soul vials hanging from the belt, twin curved daggers with one blade faintly green-tinged, one dagger held beside the skull`.

#### Shade Stalker · Kẻ Rình Rập Bóng Tối
- **Khái niệm:** trinh sát bóng. Không vũ khí nhìn thấy.
- **Silhouette:** **áo choàng dài quét đất**, đuôi áo tua rua như bóng, không thấy dao.
- **Đầu:** mũ trùm sâu **không có mặt**: bên trong đen hoàn toàn, không cả mắt.
- **Thân:** áo choàng dài phủ gần hết, tay lộ ra có **móng leo** sắt.
- **Vũ khí:** dao giấu trong áo. Thứ duy nhất nhìn thấy là móng.
- **Marker:** mũ trùm không mặt + móng leo.
- **Màu:** gần đen + mép teal.
- **Dáng:** bám tường/bệ, áo bay.
- **Khác với:** Rogue mũ ngắn hở mặt; Assassin bịt mặt có mắt; Stalker không mặt. Necromancer mũ nhọn có mắt xanh. Stalker có hai lối vào (Assassin hoặc Bandit, V12.3) nên **không** kế thừa chi tiết lineage nào; marker tự đứng một mình.
- **Overlay:** `head`, `cape` (dài), `torso`, `weapon` (móng).
- **Prompt:** `deep hood with pure black void inside and no eyes, floor-length tattered cloak trailing like shadow with teal edge, iron climbing claws on both hands, no visible blades, clinging to a wall ledge`.

#### Grand Necromancer · Đại Pháp Sư Tử Linh
- **Khái niệm:** đại pháp sư. Mũ hất ra sau để lộ sọ có vòng xương.
- **Silhouette:** vai rộng nhờ **cổ áo dựng cao**, một sọ bay lơ lửng bên cạnh.
- **Đầu:** mũ trùm hất ra sau, sọ đeo **vòng xương** (bone circlet).
- **Thân:** áo bào + lớp giáp xương sườn phủ ngực, nhiều chuỗi sọ, cổ áo dựng.
- **Vũ khí:** gậy ba sọ; **một sọ bay** quanh (sprite riêng).
- **Marker:** vòng xương + cổ áo cao + sọ bay.
- **Màu:** đen + xanh tử linh + viền xương.
- **Dáng:** gậy ngang, sọ bay lơ lửng.
- **Khác với:** Necromancer mũ trùm kín mặt; Grand hở sọ. Lich King sẽ đổi vòng thành vương miện và mở lồng ngực.
- **Overlay:** `head`, `torso` (cổ áo), `weapon`, companion sprite (sọ).
- **Prompt:** `hood thrown back revealing a skull wearing a bone circlet, high stiff collar, robe with a ribcage-plate overlay, multiple skull necklaces, three-skull staff held horizontally, one floating skull hovering beside`.

#### Soul Weaver · Kẻ Dệt Linh Hồn
- **Khái niệm:** người dệt / múa rối bằng sợi hồn.
- **Silhouette:** **tua sợi rủ** từ hai tay dang ra, nối tới 2–3 đèn nhỏ.
- **Đầu:** bịt mắt (lineage từ Medium; nếu đến từ Necromancer vẫn đeo, đó là nghi lễ của nghề), sợi hồn rủ như tóc.
- **Thân:** lanh nhạt nhiều lớp, **con thoi dệt** cài đai.
- **Vũ khí:** con thoi (focus); sợi sáng từ đầu ngón tay.
- **Marker:** sợi từ ngón tay + con thoi.
- **Màu:** trắng xanh nhạt + cyan mềm.
- **Dáng:** hai tay dang, sợi căng.
- **Khác với:** Medium một đèn cầm tay; Weaver nhiều đèn treo trên sợi.
- **Overlay:** `head`, `torso`, `weapon`, VFX sợi.
- **Prompt:** `cloth blindfold, pale layered linen, a weaving shuttle at the belt, thin glowing soul threads running from the fingertips of both outstretched hands to two small hanging lanterns`.

#### Bone Tinkerer Prime (hiển thị: Bone Artificer) · Nghệ Nhân Xương
- **Khái niệm:** thợ máy bậc thầy. (ID giữ `Bone Tinkerer Prime`; tên hiển thị đã đổi trong V12.3.)
- **Silhouette:** thêm **hai cánh tay máy** mọc từ ba lô, cao hơn vai. Phải thấy rõ chúng mọc từ *ba lô*, không phải từ thân.
- **Đầu:** kính **nhiều thấu kính** lật xếp.
- **Thân:** dây đai đồng thau, **cả hai** cẳng tay bằng máy.
- **Vũ khí:** gậy đa năng (multi-tool).
- **Marker:** tay máy ba lô + kính nhiều thấu kính.
- **Màu:** đồng thau + gỉ xanh.
- **Dáng:** tay máy đang vặn gì đó trên không.
- **Khác với:** Engineer một tay máy, trụ gấp; Prime hai tay thật là máy + hai tay phụ. Architect bỏ hết máy trên người.
- **Overlay:** `head`, `torso` (ba lô + tay máy là một overlay sau lưng), `weapon`.
- **Prompt:** `stacked multi-lens goggles, brass harness, both forearms mechanical, a backpack with two articulated mechanical arms rising above the shoulders clearly attached to the pack and not the body, multi-tool staff`.

#### Siege Gunner · Pháo Thủ Công Thành
- **Khái niệm:** pháo thủ / xạ thủ hỏa mai công thành. Nhánh Craft lần đầu có nghề mà *vũ khí nằm trên vai* thay vì công trình đặt dưới đất.
- **Silhouette:** **đường ngang thấp**: pháo vác vai dài hơn người, chống chân xuống đất khi idle. Mọi nghề khác có trục dọc; Gunner là nghề duy nhất có trục ngang.
- **Đầu:** mũ sắt tròn thấp, **bịt tai da** hai bên (không goggles, để tách khỏi Tinkerer/Engineer), một hốc mắt nheo tối.
- **Thân:** tạp dề da cháy sém, đai ống thuốc nổ ngang ngực, bao tay dày, ống chân quấn da.
- **Vũ khí:** pháo phá thành vác vai (nòng đồng thau, báng gỗ, chân chống gập); tay phụ cầm một khối nổ phế liệu.
- **Marker:** pháo chống chân + bịt tai.
- **Màu:** đen thuốc súng + đồng thau; cam tia lửa chỉ ở miệng nòng và kíp.
- **Dáng:** quỳ một gối, pháo chống chân, tay giữ kíp. Nghề thấp nhất nhánh Craft.
- **Khác với:** Engineer có trụ trên lưng (thứ bắn tách khỏi người); Gunner mang thứ bắn trên vai. Marksman trục dọc (cung cao); Gunner trục ngang. Bone Raider cũng "vũ khí to" nhưng dọc và đứng.
- **Overlay:** `head`, `torso`, `weapon` (lớp lớn riêng, có thể vượt ô 64 px theo chiều ngang khi bắn → cần kiểm tra ô sprite), `offhand`.
- **Prompt:** `low round iron helmet with leather ear protectors, scorched leather apron, bandolier of powder tubes across the chest, thick gloves, a shoulder-fired breach cannon longer than the character resting on a folding bipod, one scrap blast charge in the off hand, kneeling on one knee`.

### Tier 4

#### Legion Marshal · Thống Soái Quân Đoàn
- **Khái niệm:** centurion. Mào **ngang** là dấu sĩ quan.
- **Silhouette:** mào ngang + cờ hiệu dọc cao.
- **Đầu:** mũ có mào ngang (transverse plume).
- **Thân:** giáp ngực chạm khắc, áo choàng vắt một vai, ống chân.
- **Vũ khí:** thương-cờ hiệu (banner) + khiên tròn khắc huy hiệu quân đoàn.
- **Marker:** mào ngang + cờ.
- **Màu:** đồng + lam hải quân + cờ.
- **Dáng:** cờ cắm đất, khiên tựa chân.
- **Khác với:** Phalanx mào dọc, không cờ.
- **Overlay:** `head`, `torso`, `cape`, `weapon` (cờ), `offhand`.
- **Prompt:** `helmet with a transverse sideways crest, engraved cuirass, cloak over one shoulder, spear bearing a legion banner planted in the ground, round shield with legion emblem resting against the leg`.

#### Death Knight · Kỵ Sĩ Tử Vong
- **Khái niệm:** death knight D&D: paladin sa ngã, giáp đầy đủ, lấy lại khiên dưới dạng hồn.
- **Silhouette:** khối plate đầy, cao, **khiên hồn trong suốt** trên cẳng tay.
- **Đầu:** mũ mặt sọ (visor hình sọ), hai mắt lửa hồn xanh lạnh.
- **Thân:** full plate đen hoa văn trắng xương, nửa áo choàng.
- **Vũ khí:** đại kiếm khắc rune + **khiên hồn** (overlay bán trong suốt, không phải khiên vật lý).
- **Marker:** khiên hồn + mặt sọ.
- **Màu:** sắt đen + lửa hồn `#7FB8FF`.
- **Dáng:** đứng thẳng chỉ huy, kiếm chống đất.
- **Khác với:** Dread Knight lệch, xích, không khiên; Death Knight đồng bộ, khiên hồn. Abyss Sovereign sẽ đổi màu nhấn sang đỏ và phóng pauldron.
- **Overlay:** `head`, `torso`, `cape`, `weapon`, `offhand` (khiên alpha).
- **Prompt:** `skull-shaped visor helm with cold blue eye fire, complete black plate with bone-white filigree, half cape, runed greatsword, a translucent spectral kite shield on the left forearm`.

#### Eternal Huntsman · Thợ Săn Vĩnh Hằng
- **Khái niệm:** thợ săn huyền thoại; áo choàng ghép da những con mồi huyền thoại.
- **Silhouette:** **mũ rộng vành** + đại cung + tên cắm đất quanh chân.
- **Đầu:** mũ thợ săn rộng vành, một lông ma dài.
- **Thân:** áo choàng ghép da nhiều loài (vằn, vảy, lông) nhận ra từng mảng; dấu săn phát sáng trên cẳng tay.
- **Vũ khí:** đại cung khung xương.
- **Marker:** mũ vành + áo choàng da ghép.
- **Màu:** thông + cyan ma + vàng nhạt.
- **Dáng:** đứng, 4–5 mũi tên cắm sẵn dưới đất.
- **Khác với:** Sniper quỳ, trùm; Huntsman đứng, mũ vành. Wild Hunt Captain gạc + chó; Huntsman không gạc, không chó.
- **Overlay:** `head`, `cape`, `torso`, `weapon`, `prop` (tên cắm).
- **Prompt:** `broad-brimmed hunter's hat with one long ghostly feather, patchwork cloak of legendary beast hides in visibly different textures, glowing hunt marks on the forearm, great bone-framed longbow, arrows planted in the ground around the feet`.

#### Death Whisper · Lời Thì Thầm Tử Vong
- **Khái niệm:** sát thủ tối thượng = **tối giản tuyệt đối**. Nghề cao cấp nhưng ít chi tiết nhất game; đó là cách nó khác biệt.
- **Silhouette:** que thẳng, **không** áo choàng, không lọ, không dây đai lộ.
- **Đầu:** mặt nạ xương **trơn, không nét**, không hốc mắt.
- **Thân:** vải bó đen mờ liền mạch, một dải ruy băng đen dài duy nhất.
- **Vũ khí:** hai lưỡi mảnh như kim, gần như không thấy.
- **Marker:** mặt nạ trơn + tối giản.
- **Màu:** đen mờ + **một** đường tím.
- **Dáng:** **đứng thẳng, tay buông**. Mọi rogue khác khom; Whisper đứng im là thứ gây sợ.
- **Khác với:** Soul Assassin đầy lọ và mặt nạ chạm khắc; Whisper rỗng. Sword Wraith cũng mảnh nhưng trắng và bay; Whisper đen và tĩnh.
- **Overlay:** `head`, `torso`, `weapon`, `offhand`.
- **Prompt:** `smooth featureless bone mask with no eye holes, seamless matte black body wrap, one long black ribbon, two needle-thin blades barely visible, standing perfectly upright with arms relaxed, no cloak, no accessories`.

#### Lich King (hiển thị: Lich) · Vu Yêu
- **Khái niệm:** lich kinh điển: vương miện + bình phách (phylactery). (ID giữ `Lich King`; tên hiển thị đã đổi trong V12.3.)
- **Silhouette:** vương miện cao + áo bào + **lơ lửng** cách đất vài px.
- **Đầu:** vương miện sắt-xương **liền với sọ**.
- **Thân:** áo bào mở ngực, **lồng ngực lộ, bên trong là bình phách phát sáng** (marker không nghề nào có).
- **Vũ khí:** gậy; bình phách trong ngực.
- **Marker:** vương miện liền sọ + bình phách trong ngực.
- **Màu:** đen tím + xanh tử linh.
- **Dáng:** lơ lửng, gậy ngang, áo bào không chạm đất.
- **Khác với:** Grand Necromancer vòng xương + đứng; Lich vương miện + bay + ngực mở.
- **Overlay:** `head`, `torso` (ngực mở + bình), `weapon`, offset Y lơ lửng.
- **Prompt:** `iron-and-bone crown fused to the skull, open ornate robe exposing the ribcage with a glowing phylactery jar inside the chest cavity, staff held horizontally, hovering a few pixels above the ground`.

#### Bone Architect · Kiến Trúc Sư Xương
- **Khái niệm:** kiến trúc sư / thợ cả. **Bỏ hết máy trên người**, thay bằng bản vẽ và công trình đi theo.
- **Silhouette:** ngang rộng do construct xương đi cạnh; cuộn bản vẽ dài.
- **Đầu:** mũ trùm thợ cả + một kính đơn (monocle), không còn goggles.
- **Thân:** áo khoác dài làm việc, cuộn bản vẽ sau lưng, compa vẽ ở đai.
- **Vũ khí:** gậy thợ nề có dây dọi; **construct xương** nhỏ đi theo (sprite riêng).
- **Marker:** bản vẽ + construct.
- **Màu:** đồng thau + lam bản vẽ `#3F6FA8`.
- **Dáng:** mở cuộn bản vẽ.
- **Khác với:** toàn nhánh Craft đeo goggles; Architect là nghề đầu tiên bỏ goggles. Prime có tay máy; Architect có người máy.
- **Overlay:** `head`, `torso`, `weapon`, companion sprite.
- **Prompt:** `master mason's hood with a single monocle, long work coat, rolled blueprints on the back, drafting compass at the belt, mason's staff with a plumb line, a small articulated bone construct walking beside`.

### Tier 5

#### Abyss Sovereign · Chúa Tể Vực Sâu
- **Khái niệm:** bạo chúa vực sâu. Nhánh Combat kết thúc bằng **đổi màu nhấn** (xanh lạnh → đỏ vực) và **silhouette rộng nhất game**.
- **Silhouette:** pauldron khổng lồ, vương miện gai, áo choàng dài; rộng hơn mọi nghề.
- **Đầu:** mũ-vương-miện có hàm vực sâu.
- **Thân:** plate hợp nhất với đá đen, **khe nứt đỏ** chạy trên giáp như dung nham tắt.
- **Vũ khí:** đại kiếm khổng lồ chống đất.
- **Marker:** pauldron khổng lồ + khe nứt đỏ.
- **Màu:** obsidian + đỏ vực `#8E1B2C`. Không xanh.
- **Dáng:** kiếm chống, áo choàng dài quét đất.
- **Khác với:** Death Knight gọn, xanh lạnh; Abyss rộng, đỏ. Phải giữ cùng chiều cao sọ.
- **Overlay:** `head`, `torso` (pauldron là overlay riêng nếu cần), `cape`, `weapon`.
- **Prompt:** `spiked crown-helm with an abyssal maw motif, enormous obsidian pauldrons, plate fused with black stone and glowing deep red fissures, floor-length cape, colossal greatsword planted, widest silhouette of the set, same skull size`.

#### Death Sovereign · Chúa Tể Tử Vong
- **Khái niệm:** thần chết. Nhánh Death kết thúc bằng **hào quang** và **áo bào bằng hồn**.
- **Silhouette:** **vầng sọ** tròn sau đầu, áo bào xòe như khói, 5 sọ quay quanh.
- **Đầu:** vương miện nhiều sọ liền sọ, vầng hào quang xương phía sau.
- **Thân:** lồng ngực mở, hồn xoáy bên trong; áo bào là hồn tụ thành vải.
- **Vũ khí:** gậy-lưỡi hái; 5 sọ quay (sprite riêng).
- **Marker:** vầng sọ + áo bào hồn.
- **Màu:** đen + xanh tử linh + vàng cổ `#C8A64B`.
- **Dáng:** lơ lửng, sọ quay.
- **Khác với:** Lich King một bình phách, vương miện đơn; Sovereign vầng sọ + 5 sọ. Grand Necromancer có 1 sọ bay.
- **Overlay:** `head`, `torso`, `cape` (hồn), `weapon`, companion sprites.
- **Prompt:** `crown of fused skulls with a ring-shaped bone halo behind the head, open ribcage with swirling souls, mantle formed from spectral souls, scythe-staff, five skulls orbiting, hovering`.

---

## 4. Kiểm tra theo cặp dễ nhầm

| Cặp | Vì sao dễ nhầm | Khác nhau ở tầng 1 (silhouette) | Tầng 2 (màu) |
|---|---|---|---|
| Fighter / Guard | cùng thép | Guard có khiên rộng hơn thân | lam surcoat |
| Guard / Phalanx | cùng khiên | vuông ↔ tròn, mào | thép ↔ đồng |
| Phalanx / Marshal | cùng hoplite | mào dọc ↔ ngang + cờ | — |
| Dread / Death Knight | cùng plate đen | không khiên ↔ khiên hồn; lệch ↔ đồng bộ | — |
| Death Knight / Abyss | cùng plate | pauldron thường ↔ khổng lồ | xanh lạnh ↔ đỏ |
| Duelist / Wraith | cùng dải đỏ | đặc ↔ mờ chân + khăn bay | thép ↔ trắng mờ |
| Archer / Marksman | cùng cung | cung ngắn + ống hông ↔ trường cung + ống lưng | rêu ↔ thông đậm |
| Marksman / Sniper | cùng trường cung | đứng ↔ quỳ | không glow ↔ cyan |
| Hunter / Wild Hunt | cùng da thú | sọ sói ↔ gạc + chó | — |
| Wild Hunt / Huntsman | cùng "thợ săn" | gạc ↔ mũ vành | nâu ↔ thông |
| Rogue / Assassin | cùng dao | áo choàng ngắn + hở mặt ↔ không áo + bịt mặt | — |
| Assassin / Soul Assassin | cùng bịt mặt | thêm lọ + nửa mặt nạ | chấm xanh ở lọ |
| Soul Assassin / Whisper | cùng mặt nạ | đầy đồ ↔ trống; khom ↔ đứng | tím nhiều ↔ 1 đường tím |
| Assassin / Stalker | cùng tối | có dao, có mắt ↔ không dao, không mặt, áo dài | tím ↔ teal |
| Bandit / Marauder | cùng chiến lợi phẩm | bao ↔ rương + vương miện | — |
| Raider / Marauder | cùng lông + rìu | không trophies ↔ đai trophies + vương miện | — |
| Acolyte / Necromancer | cùng áo thụng | sọ trần + pháp khí ngắn ↔ mũ nhọn + gậy cao | xám ↔ đen |
| Necromancer / Grand | cùng đen | mũ kín ↔ sọ hở + cổ áo + sọ bay | — |
| Grand / Lich King | cùng sọ hở | vòng ↔ vương miện; đứng ↔ bay; ngực kín ↔ mở | — |
| Lich / Death Sovereign | cùng bay | 1 bình ↔ vầng sọ + 5 sọ | thêm vàng |
| Medium / Weaver | cùng bịt mắt | 1 đèn cầm ↔ sợi + nhiều đèn treo | — |
| Medium / Necromancer | cùng nhánh | nhạt mềm ↔ đen nhọn | cyan ↔ xanh tử linh |
| Tinkerer / Engineer | cùng goggles | trên trán + ba lô mềm ↔ xuống mắt + lưng cứng + tay máy | — |
| Engineer / Prime | cùng tay máy | 1 tay ↔ 2 tay + 2 tay ba lô | — |
| Prime / Architect | cùng craft | máy trên người ↔ không goggles + construct | đồng ↔ lam bản vẽ |
| Engineer / Siege Gunner | cùng craft T2→T3 | trụ sau lưng + đứng ↔ pháo trên vai + quỳ, trục ngang | gỉ xanh ↔ cam tia lửa |
| Siege Gunner / Marksman | cùng "vũ khí dài" | ngang ↔ dọc; quỳ ↔ đứng | đen đồng ↔ thông đậm |
| Necromancer / Shade Stalker | cùng mũ trùm | nhọn có mắt + gậy ↔ không mặt + áo quét đất | xanh ↔ teal |
| Sniper / Medium | cùng bịt mắt | 1 mắt + cung ↔ 2 mắt + đèn | — |

---

## 5. Cách dùng với pipeline `docs/11`

1. Giai đoạn A (portrait ChatGPT): ghép dòng **Prompt** của nghề vào `EQUIPMENT:` và `POSE:` của master prompt `docs/02` mục 8. Giữ nguyên phần ART DIRECTION.
2. Cổng duyệt A thêm 2 mục: (a) marker của nghề có mặt và không trùng nghề khác; (b) blackout test đạt khi đặt cạnh **nghề cha** và **nghề anh em** cùng Tier.
3. Giai đoạn E (overlay): dòng **Overlay** cho biết nghề cần những lớp nào. Nghề có `companion sprite` (Wild Hunt Captain, Grand Necromancer, Bone Architect, Death Sovereign) cần thêm 1 sheet nhỏ 32×32 hoặc 48×48 riêng, không ghép vào gear.
4. Hai trường hợp phá luật thân chung, cần test kỹ: Sword Wraith (alpha ống chân) và Lich King / Death Sovereign (offset Y lơ lửng). Nếu PixelLab không giữ được, bỏ hiệu ứng, giữ marker còn lại.
5. Rank I→V của một nghề: lấy đúng bộ đồ ở mục 3, áp bảng mục 14 của `docs/02`. Marker ở Rank I là phiên bản gãy/rách của cùng vật (ví dụ Rank I Bone Guard: khiên tháp nứt mất góc, vẫn rộng hơn thân).

---

## 6. Trạng thái

Toàn bộ mục 3 là **đề xuất thiết kế**, chưa có portrait nào được duyệt. Thứ đã chốt: 6 luật ở mục 0, bảng màu nhánh mục 1 (đã ghi thành luật bắt buộc ở `docs/02` mục 16), bảng marker mục 2 (không trùng). Nghề mới Siege Gunner và tên hiển thị Bone Artificer / Lich đã có trong dữ liệu game (V12.3). Khi vẽ thật, ưu tiên sửa chi tiết cho đúng luật hơn là giữ nguyên mô tả chữ.

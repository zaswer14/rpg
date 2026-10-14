> **Update V3 (2026-10-12):** Chia rõ `Job Tier` (đường chuyển nghề, Tier 0+) với `Equipment Visual Stage` (cấp độ hoàn thiện trang bị I–V). Không ép nghề Tier 1 phải có visual I hoặc nghề Tier 4 phải full giáp. Khả năng trưởng thành và giá trị hình ảnh do nghề + trang bị + cơ thể quyết định. Trong cùng Job Tier, Power Grade và độ hiếm khác nhau; artwork có thể phản ánh độ hiếm nhưng vẫn giữ silhouette/giới hạn pixel-art thống nhất.

# SKELETON — CHARACTER ART STYLE GUIDE
**Prompt bible / production art guideline | Version 1.0 | 2026-10-12**

## 0. Tài liệu nguồn và mục tiêu
**Nguồn tham chiếu:** hai screenshot game có lưới thẻ Skeleton do người dùng cung cấp trong hội thoại 2026-10-12. Các hình upscale / phục dựng AI trong hội thoại giúp nhìn rõ tinh thần nhưng **KHÔNG phải bản gốc chính xác**: AI có thể đổi chỉ số, chữ, phụ kiện, dáng và chi tiết.

**Mục tiêu:** khi yêu cầu ChatGPT tạo Skeleton mới, output có cảm giác thuộc **cùng một bộ game** về pixel density, tỷ lệ nhân vật, cách đánh sáng, màu, viền và UI card; không cần copy y hệt nhân vật cũ. Art là fantasy undead pixel art sắc nét, đọc hình tốt ở kích thước card nhỏ.

**Mức chốt:** phong cách pixel fantasy, card fantasy xanh olive, dark dungeon/forest, skeleton dáng chibi vừa phải là định hướng từ ảnh. Những kích thước và bảng màu bên dưới là **quy chuẩn đề xuất để kiểm thử**, chưa đo từ asset gốc.

## 1. Style DNA (bắt buộc)
- **Genre:** dark fantasy, dungeon RPG, undead army, game-friendly, hơi đáng yêu/hoạt hình nhưng vẫn u tối; **không horror gore**.
- **Rendering:** handcrafted-looking **crisp 2D pixel art**; cụm pixel có chủ đích, không mịn kiểu tranh số; clean dark outline và selective internal outlines.
- **Character readability:** toàn thân, dáng hành động rõ, 3/4 front hoặc nghiêng nhẹ; vũ khí/silhouette nhận ra ngay trong hình nhỏ.
- **Proportions:** game sprite compact, đầu xương hơi to để đọc mặt, tay chân ngắn vừa, thân chắc; không siêu thực cao gầy, không đầu to thái quá kiểu emoji.
- **Materials:** bone ivory/beige, chipped steel gray, old leather brown, cloth muted, magic accents saturated vừa phải.
- **Lighting:** directional soft cool/neutral key, highlight rõ trên xương/kim loại, shadow xanh lam-xanh lá; phép thuật có glow cục bộ, không phủ cả tranh.
- **Background portrait:** crypt/dungeon stone arch, ruin/forest, catacomb, tomb hoặc fantasy laboratory; dark low contrast để nhân vật nổi bật.
- **Game UI:** thẻ khung olive green/burnished bronze, tiêu đề pixel trắng ngà viền tối, chân card thống kê attack/shield/mobility/HP bằng icon nhỏ sắc nét.

## 2. Palette hướng dẫn (không bắt buộc từng pixel)
| Công dụng | Hex đề xuất | Ghi chú |
|---|---|---|
| Outline gần đen | `#181B1B` | Viền chính, tránh đen tuyệt đối tràn lan |
| Bone highlight | `#F0E3B8` | Xương vùng bắt sáng |
| Bone mid | `#C6B58A` | Tone chủ đạo xương |
| Bone shade | `#766C58` | Chỗ khuất |
| Olive frame dark | `#303923` | Viền sâu khung card |
| Olive frame main | `#596543` | Thân khung |
| Olive light | `#A0AB7C` | Highlights cạnh/ô stat |
| Dungeon deep blue | `#122633` | Background tối |
| Dungeon green stone | `#315D58` | Tường/ruins |
| Leather brown | `#75523A` | Strap, boot, quiver |
| Steel | `#99A4A7` | Vũ khí/giáp |
| Necromancy green | `#5DDF96` | Điểm nhấn phép xanh |
| Shadow violet | `#926ACC` | Necromancer / curse magic |
| Health red | `#DB343B` | UI heart, không phải màu nền chủ đạo |

**Khống chế độ bão hòa:** môi trường và giáp có palette muted; 1–2 điểm accent sáng (magic/vũ khí/eye glow). Không dùng quá nhiều màu neon trên mỗi nhân vật.

## 3. Canvas, pixel grid và bố cục (baseline để thử nghiệm)
### A. Portrait art, CHƯA có UI
- **Canvas native đề xuất:** `128×160 px`, 4:5; upscale nearest-neighbor **4× hoặc 8×** khi cần preview (512×640 hoặc 1024×1280).
- **Safe margins:** cách cạnh trái/phải tối thiểu ~6–10 native pixels với vũ khí thường; các vũ khí dài có thể cần variant composition.
- **Character occupancy:** nhân vật + vũ khí chiếm ~70–85% chiều cao phần portrait; bàn chân đặt gần đường ground chung; đầu không chạm top border.
- **Camera:** full-body orthographic 2D game sprite appearance; 3/4 facing right là góc mặc định; giữ consistency giữa các Job.
- **Pixel shape:** clusters có cạnh rõ; không blur, không anti-aliased pixel edges khi dựng final; dither hạn chế.

### B. Full character card
- **Đề xuất canvas native:** `160×256 px`, 5:8, miễn tất cả card cùng size. Đây là kích thước **thiết kế mới**, không phải độ phân giải suy ra từ screenshot.
- Header (tên) ~14–18% chiều cao; art area ~60–64%; stat panel ~22–26%. Chỉnh theo text dài và portrait.
- Card frame 4–8 pixel native; viền ngoài gần đen, olive fill, mảng light tan-green cho stats.
- Header: left-aligned name; right side reserved for skull/class/rank badges; tránh text đè icon.
- Bottom stats: 2×2 (attack, defense, mobility, health) với icon đồng bộ pixel grid.
- **Không cho AI bịa chỉ số hoặc chữ khi dùng trong game:** tốt nhất **tạo portrait-only**, còn frame/text/icons/stats dựng bằng template UI trong Unity/2D editor. AI render text chỉ dùng concept preview.

### C. Character standalone cho game/rig
- Nếu mục đích animation/lắp trang bị: xuất riêng nhân vật trên **transparent background**, chuẩn body pivot và các lớp (head, torso, upper/lower arms, upper/lower legs, weapon, cape, VFX).
- Không suy luận rằng AI image duy nhất đã sẵn dùng Spine. Ảnh nguyên khối chỉ là concept; rigging cần layer assets và pivot đã kiểm chứng.
- Khuyến nghị thống nhất origin ở chân giữa `feet-center`, directional convention, limb/attachment consistency.

## 4. Proportion & silhouette checklist
- Skull chiếm khoảng 17–23% chiều cao nhân vật **không tính vũ khí**, tùy class; mắt đen rõ và tương phản; có thể có eye glow nhẹ.
- Torso và pelvis có khối rõ; cánh tay gắn vai tự nhiên, không nối vào cổ/nhân đôi tay.
- Bàn tay **ôm đúng cán** vũ khí; cổ tay nằm đúng chỗ, không cho kiếm xuyên qua bàn tay.
- Hai chân có chân đỡ và chân động; nếu đứng, weight distribution hợp lý.
- Archetypes có silhouette riêng: Knight rộng vai + shield; Archer cung + quiver; Mage robe + staff + spell orb; Assassin hood + dual blades; Engineer goggles/tool + construct; Rider có mount rõ.
- Dáng tay/vũ khí phù hợp công năng, không tạo nhiều thanh kiếm/tay thừa.

## 5. Khác biệt Job bằng ngôn ngữ hình ảnh
| Domain | Silhouette | Key props / accents | Tránh |
|---|---|---|---|
| Combat | giáp/shoulder/weapon lớn | shield, sword, spear; steel | quá nhiều phép glow |
| Ranged | thân gọn, cung/nỏ dài | quiver, crossbow | cung đâm xuyên thân |
| Stealth | hood, áo choàng ngắn, dáng thấp | daggers, leather, violet/teal | giáp quá cồng kềnh |
| Magic | robe rộng, staff/orb | color-specific spell VFX | tay thừa do spell |
| Death Arts | bone talisman, skull motif | ghost green, soul rings | thay cả art thành neon |
| Beast | mount/beast companion | reins, lance, saddle | sai số chân thú cưỡi |
| Craft | tool satchel, armor tạp | glass, mechanical bones, copper | vật thể vô định dạng |
| Martial | xương lộ rõ, ít giáp | wraps, gauntlets, combat stance | pose không tự nhiên |

**Với nghề lai:** lấy silhouette chính từ Main Job + 1–2 chi tiết rõ của Sub Job. Ví dụ Death Knight = plate armored skeleton + soul magic shield, không biến thành một mage mặc áo choàng 100%.

## 6. Job Rank visual language (không thay size nhân vật vô tội vạ)
- **Rank I:** gear đơn giản, 1 weapon, ít trang sức/VFX.
- **Rank II:** trang bị hoàn chỉnh hơn, dấu hiệu nghề đặc trưng (hood, quiver, lab coat...).
- **Rank III:** chi tiết chất liệu và rune/ability signature, VFX tiết chế.
- **Rank IV:** silhouette uy lực, ornament nhận diện, 1 magic signature rõ, không rối.
- **Rank V:** biểu tượng độc quyền như crown, spectral mantle, weapon relic, aura; vẫn đọc được ở size card nhỏ.
- Tăng Rank theo **thiết kế**, không chỉ phóng to người/vũ khí hoặc làm nhân vật neon toàn thân.

## 7. Evolution / elemental overlay
1. **Base Anatomy:** giữ skeleton skull, ribcage, pelvis, limb joints chung trên phần lớn humanoid Job.
2. **Body Evolution:** thay vật liệu: Normal Bone (ivory), Armored Bone (reinforced), Crystal Bone (crystal facets), Dragonbone (bone horns/plates), Mechanical Bone (metal joints).
3. **Elemental Variant:** overlay / local VFX: Frost = icy edges, Flame = ember/heat, Shadow = wisps, Soul = green ectoplasm.
4. **Job Equipment:** layer giáp/áo/vũ khí theo Job.
5. **Rank details:** ornaments/insignia cuối cùng.

Công thức visual: **Skeleton body → Job gear → Body material → Elemental VFX → Rank ornament**. Không vẽ lại toàn bộ từ đầu nếu có thể reuse parts.

## 8. MASTER PROMPT — tạo portrait mới cùng style
Sao chép prompt tiếng Anh dưới đây; thay `[PLACEHOLDERS]`. Khi tạo ảnh trong một hội thoại mới, **đính kèm ít nhất 2–3 portrait tham chiếu của bộ gốc**; prompt đơn lẻ không thể bảo đảm phong cách chính xác tuyệt đối.

```text
Create ONE original fantasy skeleton RPG unit portrait for a coherent collectible-character game art set.
CHARACTER: [JOB NAME]. ROLE: [COMBAT ROLE]. RANK: [I–V].
BODY EVOLUTION: [NORMAL / ARMORED / CRYSTAL / DRAGONBONE / ...].
ELEMENTAL VARIANT: [NONE / FROST / FLAME / SHADOW / ...].
EQUIPMENT: [EXACT WEAPON, ARMOR, CAPE, PROPS].
POSE: [EXACT ACTION]. Facing three-quarter right, full body, feet visible, believable anatomy and hand grip.
ART DIRECTION: crisp, handcrafted-looking retro 2D pixel art; dark fantasy dungeon RPG;
compact game-character proportions with slightly oversized readable skull; clean dark outlines;
intentional pixel clusters, limited color palette, muted bone-ivory/olive/steel/leather materials;
soft cool-neutral directional lighting, restrained saturated magic accents;
detailed but subdued ancient stone crypt/ruin backdrop; strong silhouette readable at thumbnail size.
CONSISTENCY: Match the attached reference portraits' pixel density, character scale,
outline thickness, bone shading, perspective, framing and background complexity.
COMPOSITION: portrait-only artwork, no game UI, no card frame, no labels, no text, no numbers,
no watermarks; centered full body, safe margins for weapon, common ground line.
ANATOMY: exactly two arms and two legs for humanoid skeletons, correct shoulder and wrist alignment,
physically coherent weapon grip; no extra hands, skulls or duplicate weapons unless explicitly specified.
OUTPUT: high-resolution sharp PNG preview that preserves the pixel-art aesthetic, vertical 4:5.
```

### Negative prompt
```text
photorealistic, realistic human skin, smooth digital painting, anime cel-shading,
vector flat art, 3D render, blurry, soft airbrush, watercolor, over-detailed texture noise,
extra arms, extra legs, duplicate hands, misaligned joints, floating weapon,
clipped sword, cropped feet, extreme chibi, elongated limbs, neon everywhere,
illegible text, UI panels, logo, watermark, inappropriate gore
```

## 9. Prompt mẫu cụ thể (dùng nguyên văn)
### A. Rank II — Bone Knight
```text
Use the attached reference portraits as the authoritative style reference.
Create one full-body Bone Knight skeleton portrait, Rank II: sturdy ivory-bone skeleton,
old gray steel pauldrons and chest armor, brown leather belt, medium rectangular wood-and-metal shield
in left hand, broad steel sword gripped in right hand. Defensive three-quarter stance facing right.
Compact fantasy 2D pixel art, readable skull and silhouette, restrained olive/blue dungeon color palette,
crisp pixel outlines, cool-neutral directional lighting, dark stone crypt background.
No UI card, no text, no extra arms, all limbs and equipment anatomically consistent. Vertical 4:5.
```
### B. Rank III — Soul Assassin
```text
Use the attached reference portraits as the authoritative style reference.
Create one full-body Soul Assassin skeleton portrait, Rank III: narrow hooded skeletal rogue,
layered faded dark-blue fabric, leather belt, one curved dagger held correctly in each hand,
subtle green spectral wisps wrapping around the blades (not covering the body).
Low agile three-quarter combat stance facing right; clear compact proportions and clean silhouette.
Handcrafted crisp 2D dark-fantasy pixel art, controlled olive/teal palette, muted dungeon arch background,
consistent outline weight and pixel density. No UI, no text, no extra limbs. Vertical 4:5.
```
### C. Rank V — Bone Architect
```text
Use the attached reference portraits as the authoritative style reference.
Create one full-body Bone Architect skeleton portrait, Rank V: elder skeleton engineer with
bone-and-bronze tool harness, one articulated skeletal construct beside the character,
engraved runic engineering staff held in one hand, small blue-green runes and mechanical bone joints.
Clearly separate the character's own two arms from the construct's limbs.
Powerful but compact silhouette, three-quarter view facing right, coherent stance and hand grip.
Crisp handcrafted fantasy pixel art matching reference cards, muted olive and stone colors,
controlled turquoise light accents, low-contrast ruined workshop background.
Portrait-only, no UI, no text or numbers, feet and tools visible, vertical 4:5.
```

## 10. MASTER PROMPT — tạo thẻ hoàn chỉnh (chỉ dùng mockup)
```text
Using the attached original card reference and approved character portrait,
create one fantasy RPG collectible unit CARD in exactly the same art direction:
olive green beveled pixel border, dark olive title strip, large inner portrait area,
light sage green 2x2 bottom stat panel with sword/shield/boot/heart icons.
Name: [NAME]. Rank indicator: [RANK]. Stats (concept only): [ATK] / [DEF] / [MOVE] / [HP].
Crisp limited-palette pixel art, dark outline, consistent card proportions, no photo elements.
Do not redesign the approved character.
```
**Cảnh báo:** AI có thể tạo sai tên, icon và số. Khi dùng asset production, build template frame + typography + số liệu bằng engine hoặc tool chỉnh ảnh, giữ portrait-only làm source.

## 11. Quy trình sản xuất khuyến nghị
1. **Art anchor:** Chọn 3 ảnh tham chiếu gốc *đã duyệt*: Warrior, Necromancer, Skeleton Archer (đại diện armor, magic, ranged). Giữ không đổi trong mỗi lô.
2. **Spec card:** Ghi Job, Rank, Evolution, Variant, weapon, pose, background, dominant palette, silhouette signifiers.
3. **Generate portrait-only:** 1–3 biến thể để review, chọn 1 chuẩn; không cho AI tự thêm UI/stats.
4. **Review 100% và thumbnail:** xem ở native target size và upscale nearest-neighbor, so skull ratio, outline, saturation, readability.
5. **Approve source:** chỉ khi 100% checklist đạt mới gọi là `approved`; ghi version/reference image.
6. **Compose card:** lắp portrait vào cùng một frame/pixel font/icon template, lấy stats từ game data.
7. **Optional rig:** nếu cần animation, tạo yêu cầu layered asset riêng và kiểm tra pivot/bộ phận, không giả vờ một PNG đã rig được.

## 12. QA checklist bắt buộc
- [ ] Nhìn thumbnail có nhận ra Job không?
- [ ] Nhân vật full body, chân/vũ khí không bị cắt?
- [ ] Skull scale và chiều dài chân/tay đồng đều trong set?
- [ ] Đúng số tay/chân, đúng khớp vai/cổ tay và cách cầm vũ khí?
- [ ] Có 1 nguồn sáng chính, palette không quá rực?
- [ ] Hiệu ứng phép đúng vị trí (staff orb/blade tip), không che nhận diện?
- [ ] Pixel grid rõ, không biến thành soft illustration khi upscale?
- [ ] Background tối và thấp tương phản hơn nhân vật?
- [ ] Không có UI/text/numbers trong portrait-only?
- [ ] Khác biệt visual giữa Rank, Job, Evolution và Variant đúng spec?
- [ ] Không reuse sai character silhouette khi đổi class?
- [ ] Đã so trực tiếp với 2–3 art anchors và chụp bảng so sánh chưa?

## 13. Asset naming / metadata cho art pipeline
```text
skel_[job_id]_[rank]_[evolution]_[variant]_[view]_[version].png
skel_bone_knight_r2_normal_none_3qR_v001.png
skel_soul_assassin_r3_crystal_shadow_3qR_v002.png
```
Đề xuất đi kèm metadata:
```json
{
  "raceId": "skeleton",
  "jobId": "bone_knight",
  "jobRank": 2,
  "bodyEvolution": "normal",
  "variant": "none",
  "facing": "three_quarter_right",
  "sourceReferenceSet": "skeleton_reference_v1",
  "status": "concept_pending_review",
  "nativeArtCanvas": [128,160],
  "uiGeneratedSeparately": true
}
```

## 14. Khi mở cuộc trò chuyện mới
Gửi kèm tài liệu này, 2–3 hình tham chiếu gốc/đã duyệt, mô tả nhân vật theo mẫu:
```text
Hãy làm art theo Skeleton Character Art Style Guide v1.0 đính kèm.
Job: [...]. Rank: [...]. Evolution: [...]. Variant: [...].
Weapon: [...]. Pose: [...]. Background: [...].
Output: portrait-only PNG, 4:5, full-body, không có UI và chữ.
So trực tiếp với ảnh tham chiếu đã duyệt; ưu tiên đồng nhất style hơn thêm chi tiết.
Đánh giá theo QA checklist và chỉ đánh dấu approved nếu thực sự đạt.
```

## 15. Việc cần chốt để đạt độ nhất quán production
- Chọn **3 ảnh anchor cuối cùng** (ảnh gốc sắc nét hoặc bản vẽ lại được duyệt).
- Chốt pixel canvas native và tỷ lệ khung card sau khi xem asset xuất thực tế.
- Chốt bộ skeleton base body + camera/facing convention cho cả set.
- Chốt 1 chuẩn texture filtering (`Point/Nearest`) cho Unity, không để filtering làm nhòe pixel art.
- Phân biệt 2 đầu ra: **portrait/card concept** và **layered animation-ready asset**. Chúng không thay thế nhau.

**Kết luận:** Tài liệu này cung cấp *style language + prompt + workflow + QA*, không bảo đảm AI tái tạo chính xác pixel của screenshot độ phân giải thấp. Để đạt cùng một style có thể dùng lâu dài, cần khóa bộ art anchor và duyệt thử vài nhân vật đại diện trước khi sản xuất số lượng lớn.

## 14. CẬP NHẬT ART RANK PROGRESSION — V2 (2026-10-12)
**ĐÃ CHỐT VỀ HƯỚNG:** tiến hóa hình ảnh phải thể hiện *hành trình sửa chữa và hoàn thiện trang bị*, không chỉ thêm giáp, màu và hào quang. Vũ khí/khiên cũng biến đổi cùng nhịp. Đây là quy tắc visual, **không ép** mọi Job dùng kiếm và khiên.

| Rank | Giáp/áo | Vũ khí | Khiên / off-hand | Đọc silhouette |
|---|---|---|---|---|
| I — Salvaged | Thiếu nhiều vị trí, dây da thô, vải rách, từng món nhặt lẻ | Sứt mẻ, mòn, cán quấn tạm; vẫn dùng được | Khiên nhỏ, nứt/gãy mép, vật liệu ghép | Skeleton lộ rõ, thiếu thốn nhưng chiến đấu được |
| II — Patched | Vá và thay từng món; mũ/giáp vai có thể chỉ có một bên, chất liệu chưa đồng nhất | Được sửa lưỡi hoặc thay cán, vết nứt còn nhận biết | Vá bằng đinh/tấm kim loại; viền chưa đồng bộ | Hơi lệch, tạp, đang phát triển |
| III — Functional | Bộ giáp cơ bản đầy đủ ở vị trí cần thiết, chất liệu nhất quán hơn, vẫn xước cũ | Lưỡi lành, chuôi chắc; chưa quá trang trí | Đúng chức năng, khung chắn chắc, vài dấu sử dụng | Chuyên nghiệp, gọn, ít hiệu ứng |
| IV — Elite | Giáp hoàn chỉnh, tùy biến theo nghề, chế tác tinh xảo, biểu tượng riêng | Vũ khí rèn chuyên dụng, 1 điểm nhấn kỹ năng | Khiên đồng bộ set, khắc dấu hiệu nghề, có thể có hiệu ứng nhẹ | Nhận diện class cao cấp ngay ở kích thước nhỏ |
| V — Legendary | Set huyền thoại hoàn thiện, hoa văn/cấu trúc độc quyền nhưng không che hết skeleton | Vũ khí di vật, hình dáng riêng; hiệu ứng có chủ đích | Khiên/off-hand huyền thoại, liên kết visual cùng vũ khí | Độc nhất và áp đảo, vẫn giữ silhouette gốc |

**Quy tắc nhất quán:** Cùng một nhân vật: giữ skull/body, chiều cao, hướng nhìn, vị trí mặt đất, tay cầm kiếm/khiên nhất quán. Không tăng chiều cao đơn thuần theo Rank. Không biến Rank II thành full-plate mới tinh. Không làm Rank V chỉ khác vì glow neon. Với Archer/Mage/Rogue/Engineer: thay trục Sword/Shield tương ứng bằng Bow/Quiver, Staff/Focus, Dagger/Off-hand, Tool/Construct.

**Prompt bổ sung bắt buộc khi tạo tiến hóa:**
```text
Render the SAME skeleton character across Rank I to V using the SAME skull, bone proportions, 3/4 camera angle, ground line and pixel density. Show a coherent equipment restoration arc: Rank I scavenged incomplete broken gear, Rank II mismatched patched but still incomplete, Rank III reliable complete functional gear with wear, Rank IV refined class-specific elite crafted gear, Rank V unique legendary relic equipment. Progress armor AND weapon AND shield/offhand together. Do not make Rank II polished full armor. Keep dark fantasy pixel art, sharp clusters, restrained effects. No UI or labels on standalone sprites.
```

**Sản xuất:** Ảnh tham chiếu v2 chỉ là concept. Muốn sprite để đưa vào game phải xuất lại từng Rank thành file riêng, kiểm tra pixel grid, pivot, weapon grip và alpha edges.

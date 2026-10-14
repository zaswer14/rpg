# Skeleton Codex — Quy trình sản xuất art bằng ChatGPT + Claude Code + PixelLab

**Ngày:** 13/10/2026 · **Nền:** V12.2 (147 skill, 35 nghề) · **Mô hình anim:** frame animation, paper-doll overlay (thân xương trần + vũ khí + gear), không rig.
**Tài liệu đi kèm:** `docs/02_Skeleton_Character_Art_Style_Guide.md` (style, palette, master prompt), `Skeleton_Codex_Frame_Animation_List.xlsx` (danh sách frame), `Skeleton_Codex_Art_Checklist.xlsx` (checklist theo skill).

Mỗi giai đoạn có **cổng duyệt**: chưa qua cổng thì không sang giai đoạn sau. Người duyệt tick vào checklist; asset bị từ chối ghi lý do vào cột Ghi chú của file xlsx.

---

## 0. Phạm vi đợt 1

Chỉ làm đủ để chạy demo **Tier 0 → Tier 1** với 6 nghề (Wanderer, Bone Fighter, Skeleton Archer, Bone Rogue, Bone Acolyte, Bone Tinkerer):

| Hạng mục | Số lượng đợt 1 |
|---|---|
| Portrait (ChatGPT) | 6 + 1 ảnh thân xương trần làm tham chiếu sprite |
| Sprite thân trần (PixelLab) | 1 nhân vật, 23 anim nền = 93 frame |
| Bộ đòn thường | 3: sword, dagger, focus (bow/focus dùng lại bow_draw/cast_quick) + throw/throw_aim/kneel |
| Overlay gear | 6 nghề |
| Quái | grunt + scout (recolor) |
| VFX nền | hit spark, slash arc, dust, guard flash, đá ném, mảnh xương, đạn phép trung tính + bóng tối |
| Icon | 62 skill T0–T1, 6 khung rarity |
| Tileset | 1 biome hầm mộ |

Xong đợt 1 mới quyết định cách làm overlay cho 29 nghề còn lại (xem mục 6.3).

---

## 1. Công cụ và cài đặt

### 1.1. ChatGPT (portrait, concept, icon)
- Dùng model có tạo ảnh. Mỗi hội thoại mới **đính kèm 2–3 portrait tham chiếu** của bộ gốc, nếu không sẽ lệch style.
- Dùng master prompt ở mục 8 của `docs/02`, thay `[PLACEHOLDERS]`. Không cho ChatGPT vẽ UI, chữ, số.

### 1.2. Claude Code + PixelLab MCP (sprite, anim, overlay)
Cài server MCP (gói npm `pixellab-mcp`, cần secret từ pixellab.ai):

```bash
npm install -g pixellab-mcp
claude mcp add pixellab -- npx pixellab-mcp --secret=<PIXELLAB_SECRET>
```

Hoặc thêm vào `.mcp.json` của repo:

```json
{ "mcpServers": { "pixellab": { "command": "npx", "args": ["pixellab-mcp", "--secret=<PIXELLAB_SECRET>"] } } }
```

Tool có sẵn qua MCP (theo trang npm của gói): `generate_image_pixflux` (text → pixel art), `generate_image_bitforge` (theo ảnh style tham chiếu), `rotate`, `inpaint` (sửa vùng theo mask), `estimate_skeleton`, `animate_with_skeleton`, `animate_with_text` (1–20 frame, có `view: "side"`), `get_balance`. Kích thước khuyến nghị 32/64/128/256. Animation của PixelLab giới hạn 128 px, đủ cho ô sprite 64×64 của mình.

Trước khi chạy đợt lớn: `get_balance`, ước tính credit (model mới ~40 credit/lượt theo nguồn so sánh), đặt ngưỡng dừng.

### 1.3. Aseprite (dọn tay, ghép sheet)
Không bắt buộc nhưng nên có. Claude Code viết script Python (Pillow) để ghép sheet, trừ ảnh lấy overlay, kiểm tra kích thước; Aseprite dùng cho sửa frame lệch.

### 1.4. Unity
Import sheet PNG + JSON (tên frame, duration, hitbox) do script sinh. Pixel Per Unit cố định, filter Point, compression None.

---

## 2. Cấu trúc thư mục và đặt tên

```
art/
  ref/                 ảnh tham chiếu style (screenshot gốc, portrait đã duyệt)
  portrait/<job_id>.png                128×160, portrait-only, nền hầm mộ
  sprite/
    body/<anim>_<frame:02>.png         thân xương trần, 64×64, nền trong suốt
    weapon/<weapon>/<anim>_<frame>.png vũ khí liền tay (anim tấn công) hoặc overlay vũ khí (anim core)
    gear/<job_id>/<anim>_<frame>.png   overlay gear, cùng lưới với body
    sig/<skill_id>/<frame>.png         signature, vẽ liền gear
  enemy/<kind>/<anim>_<frame>.png
  summon/<unit>/<anim>_<frame>.png
  vfx/<id>/<frame>.png
  icon/skill/<skill_id>.png  64×64
  sheet/                PNG + JSON đã ghép, Unity đọc từ đây
  review/<YYYY-MM-DD>/  ảnh contact sheet để duyệt
```

Quy tắc: `job_id`, `skill_id`, `anim` lấy **đúng ID trong `skill-system.js`** (ví dụ `bone_fighter`, `cracked_slash`, `idle`). Frame đánh số từ 00. Mọi sprite dùng **origin feet-center**: chân đặt ở y = 60/64, tâm ngang x = 32. Không đổi kích thước ô giữa các anim.

---

## 3. Giai đoạn A — Portrait bằng ChatGPT

### 3.1. Làm gì
1. Tạo trước **1 portrait thân xương trần** (Wanderer, không gear, cầm gậy gỗ): đây là tham chiếu cho sprite ở giai đoạn B. Chọn kỹ, vì mọi sprite sau đều khớp với nó.
2. Tạo 6 portrait nghề đợt 1 theo bảng silhouette mục 5 của `docs/02` (Fighter: pauldron + kiếm thô; Archer: quiver + cung ngắn; Rogue: hood + dao đôi; Acolyte: robe rách + pháp khí nứt; Tinkerer: goggles + túi đồ + cờ-lê).
3. Mỗi nghề tạo 3–4 phương án, chọn 1, lưu `art/portrait/<job_id>.png` và thêm vào `art/ref/`.
4. Downscale về 128×160 nearest-neighbor, kiểm tra còn đọc được ở 64×80.

### 3.2. Prompt
Dùng nguyên master prompt `docs/02` mục 8 + negative prompt. Với portrait thân trần thêm: `no armor, no cloth, bare ivory skeleton, holding a broken wooden stick, neutral standing pose, feet visible, side-facing three-quarter right`.

### 3.3. Cổng duyệt A
- [ ] Đúng 2 tay 2 chân, tay ôm đúng cán vũ khí, không vũ khí thừa
- [ ] Đầu lâu chiếm 17–23% chiều cao, mắt đọc rõ ở thumbnail
- [ ] Hướng mặt 3/4 phải, chân chạm đường ground chung, không cắt chân
- [ ] Palette trong bảng mục 2 `docs/02`: xương ivory/beige, 1–2 accent, không neon toàn thân
- [ ] Không UI, chữ, số, watermark
- [ ] Silhouette nhận ra nghề khi thu về 64 px
- [ ] So cạnh 2 portrait tham chiếu gốc: cùng pixel density, cùng độ dày viền
- [ ] Portrait thân trần: pose đứng trung tính, không nghiêng, dùng được làm tham chiếu sprite

Từ chối nếu sai 1 trong 3 mục đầu. Mục còn lại có thể sửa tay.

---

## 4. Giai đoạn B — Sprite thân xương trần (PixelLab qua Claude Code)

### 4.1. Làm gì
Yêu cầu Claude Code (mở trong thư mục `art/`):

> Dùng PixelLab `generate_image_bitforge` với ảnh style `ref/portrait_bare.png`, tạo sprite thân xương trần 64×64, side view, đứng trung tính, feet-center, nền trong suốt. Tạo 4 phương án, lưu `sprite/body/base_v1..v4.png`, hiển thị cho tôi chọn.

Sau khi chọn: `estimate_skeleton` trên bản chọn → lưu `sprite/body/skeleton.json`. Skeleton này dùng cho mọi anim sau.

### 4.2. Cổng duyệt B
- [ ] Ô 64×64, chân ở hàng 60, tâm x = 32 (script `check_origin.py` tự kiểm)
- [ ] Hitbox thân xương nằm trong 30×48 (khớp runtime `w:30,h:48`)
- [ ] Palette ≤ 12 màu, không anti-alias (script đếm màu)
- [ ] Giống portrait thân trần về tỷ lệ đầu/thân
- [ ] `estimate_skeleton` ra đủ khớp: đầu, cổ, 2 vai, 2 khuỷu, 2 cổ tay, hông, 2 gối, 2 cổ chân

Đây là cổng quan trọng nhất: đổi thân sau giai đoạn này là làm lại tất cả.

---

## 5. Giai đoạn C — 23 anim nền

### 5.1. Làm gì
Với mỗi anim trong sheet `1 Body sheet` của file frame list, Claude Code gọi `animate_with_text` (reference = base đã duyệt, `view: "side"`, `direction: "east"`, số frame theo bảng) rồi lưu `sprite/body/<anim>_<nn>.png`. Anim cần timing chính xác (guard, land, death) dùng `animate_with_skeleton` với keyframe do Claude Code đặt từ `skeleton.json`.

Bảng mô tả đưa cho tool (tiếng Anh, ngắn):

| anim | frame | mô tả |
|---|---|---|
| idle | 6 | bare skeleton standing, slight breathing bob, eye glow flicker |
| run | 8 | running cycle, arms swinging, bones rattling |
| jump | 3 | crouch, launch, rising |
| fall | 2 | falling, arms up |
| land | 3 | landing, knees bend, recover |
| dodge | 4 | quick low dash forward |
| hurt | 2 | flinch backward |
| stun | 3 | dizzy sway |
| guard | 3 | raise arms into guard, hold, block impact |
| death | 6 | collapse, bones scatter |
| revive | 5 | bones reassemble, stand up |
| cast_quick | 3 | raise one hand, flash, lower |
| cast_channel | 5 | both hands raised, hold glowing, release |
| cast_summon | 4 | slam staff into ground |
| throw | 4 | overhand throw |
| throw_aim | 4 | wind up, aim, throw |
| kneel | 4 | kneel and place object |
| bow_draw | 4 | draw bow, release |
| bow_charge | 6 | draw bow and hold, trembling |
| bow_volley | 4 | aim upward, release |
| tool_swing | 3 | swing wrench |
| rally | 3 | raise arm, shout |
| sig_startup | 4 | power up stance, glow building |

Sau mỗi anim, Claude Code ghép contact sheet (`review/<date>/<anim>.png`, 1 hàng, phóng 4×) để duyệt.

### 5.2. Cổng duyệt C (từng anim)
- [ ] Mọi frame cùng ô 64×64, origin feet-center không trôi (script so tâm chân từng frame, lệch ≤ 1 px)
- [ ] Không mất/thừa xương giữa các frame, hai tay hai chân liên tục
- [ ] Palette giống base (script: không màu lạ)
- [ ] Chạy thử trong `index.html` bản test (Claude Code viết loader đọc sheet) thấy mượt ở 10–12 fps
- [ ] guard frame 2 giữ được vô hạn (loop 1 frame không giật); land frame 3 đủ rõ để làm landing recovery
- [ ] death: xương rơi xuống dưới đường ground không quá 4 px

Thực tế AI thường lỗi ở run (chân nhân đôi) và death. Dự kiến sửa tay 30–50% frame của 5–6 anim.

---

## 6. Giai đoạn D và E — Vũ khí, đòn thường, gear overlay

### 6.1. Vũ khí liền tay (anim tấn công)
Với mỗi bộ vũ khí đợt 1 (sword, dagger; focus dùng cast_quick):
1. `inpaint` vũ khí vào tay base (mask vùng tay) → `sprite/weapon/<w>/base.png`.
2. `animate_with_text` trên base-có-vũ-khí cho từng hit (bảng ở sheet `2 Đòn thường`), ví dụ sword: `horizontal slash`, `reverse slash`, `forward thrust`, 4 frame mỗi hit.
3. Overlay vũ khí cho 10 anim core: Claude Code chạy script `diff_overlay.py` (ảnh có vũ khí − ảnh base, giữ pixel khác) trên từng frame core đã inpaint, hoặc đơn giản hơn: cắt riêng sprite vũ khí + ghi tọa độ tay mỗi frame từ `skeleton.json`, đặt theo anchor. Cách thứ hai ít credit hơn, nên thử trước.

### 6.2. Gear overlay nghề
Với mỗi nghề đợt 1:
1. `inpaint` gear lên base ở frame idle_00 với mask vùng đầu/vai/thân, mô tả lấy từ portrait đã duyệt (`hood and short cape`, `steel pauldrons and chest plate`...). Dùng `generate_image_bitforge` với portrait nghề làm style nếu inpaint lệch màu.
2. Lặp cho các frame còn lại của 10 anim core + anim domain của nghề (Archer: bow_*, throw_*; Acolyte: cast_*; Tinkerer: kneel, tool_swing). Để giữ nhất quán, inpaint theo lô: cùng prompt, cùng seed nếu tool cho.
3. `diff_overlay.py` tách lớp gear → `sprite/gear/<job_id>/<anim>_<nn>.png`.
4. Script `compose.py` ghép body + weapon + gear để duyệt; đây cũng là thứ Unity sẽ làm ở runtime.

### 6.3. Quyết định sau đợt 1
So sánh 2 cách cho 29 nghề còn lại: (a) overlay như trên, trung bình ~90 frame inpaint/nghề; (b) gear chỉ hiện trong 10 anim core, ẩn khi ra đòn (giảm ~30%); (c) nghề cùng tuyến dùng palette swap + thêm 1–2 chi tiết. Chọn theo chất lượng inpaint thực tế và credit đã tiêu ở đợt 1.

### 6.4. Cổng duyệt D/E
- [ ] Vũ khí nằm đúng tay, không xuyên tay, cùng hướng ở mọi frame
- [ ] Hit frame `active` trùng với timing trong dữ liệu skill (`animation: 0.18/0.09/0.24s` → frame active là frame thứ mấy; Claude Code ghi vào JSON)
- [ ] Overlay gear: nền trong suốt, không chứa pixel thân xương (script: overlay ∧ body = ∅ ngoài vùng che)
- [ ] Ghép body + weapon + gear không hở khe, không lệch 1 px ở bất kỳ frame nào
- [ ] 6 nghề đứng cạnh nhau (contact sheet) phân biệt được bằng silhouette ở 64 px
- [ ] Bone Fighter đứng cạnh Wanderer: cùng thân, chỉ khác gear (chứng minh overlay dùng chung thân)

---

## 7. Giai đoạn F — Quái, thuộc hạ, VFX, icon, tileset

- **grunt**: làm như giai đoạn B–C nhưng ít anim hơn (idle 4, run 6, windup 2, attack 3, hurt 2, death 5). scout = palette swap + overlay dao. Thuộc hạ lính xương = sheet grunt thu về 48×48 + palette xanh hồn (`#5DDF96`).
- **VFX**: `generate_image_pixflux` cho từng hiệu ứng theo sheet `6 VFX` (`pixel art hit spark, 3 frames, transparent background`); phần lớn ra tốt vì không có anatomy. Đạn phép 10 hệ: 1 prompt, đổi màu theo bảng palette.
- **Icon skill**: ChatGPT theo lô 10–12 icon/ảnh (grid), cùng prompt nền tối, 1 vật thể/icon; Claude Code cắt grid, downscale 64×64, gắn khung rarity bằng script. Tên file = `skill_id`.
- **Tileset**: PixelLab pixflux `dungeon stone tileset 16px, olive-green stone` → Claude Code cắt 16×16, dựng tilemap test.

### Cổng duyệt F
- [ ] Quái đọc được là địch (palette xám/tím khác xương người chơi ivory)
- [ ] Thuộc hạ nhỏ hơn người chơi rõ rệt (48 so với 64) và có màu xanh hồn
- [ ] VFX nền trong suốt, không viền trắng, không ăn vào sprite nhân vật khi chồng
- [ ] Icon: 1 vật thể, đọc được ở 32 px, không chữ; 147 icon không trùng hình
- [ ] Tile ghép liền mạch 4 cạnh

---

## 8. Giai đoạn G — Ghép sheet, JSON, Unity

Claude Code viết và chạy:

| Script | Việc |
|---|---|
| `check_origin.py` | kiểm ô 64×64, tâm chân, lệch ≤ 1 px, palette ≤ N màu |
| `diff_overlay.py` | tách overlay từ cặp ảnh (có gear − base) |
| `compose.py` | ghép body + weapon + gear để duyệt |
| `pack_sheet.py` | ghép frame thành sheet PNG theo hàng = anim, sinh JSON `{anim, frames[], fps, active_frames[], origin}` |
| `validate_sheet.py` | đối chiếu JSON với `skill-system.js`: mọi anim family trong cột "Anim family" của checklist có sheet; mọi skill active T0–T1 có family tồn tại |
| `import_unity.cs` | editor script: cắt sheet theo JSON, đặt pivot, tạo AnimationClip, gắn event ở active frame |

### Cổng duyệt G
- [ ] `validate_sheet.py` không báo thiếu
- [ ] Unity: Point filter, PPU đồng nhất, pivot feet-center, không bleeding giữa ô (padding 2 px)
- [ ] Chạy thử Wanderer → Bone Fighter trong Unity hoặc bản web: idle/run/jump/dodge/attack/guard/hurt/death đều có frame, không hiển thị ô trống
- [ ] FPS anim: idle 8, run 12, attack 14–16, khớp cảm giác startup/active/recovery của V12

---

## 9. Quy tắc duyệt chung

1. Người duyệt nhìn **contact sheet phóng 4×** và **chạy thử trong game**, không duyệt trên ảnh đơn lẻ.
2. Ba lỗi bị từ chối ngay: sai số tay/chân, origin trôi, màu ngoài palette.
3. Asset qua cổng mới được đổi tên theo quy ước và đưa vào `sheet/`; asset chưa duyệt ở lại thư mục `review/`.
4. Mỗi lần sửa thân xương gốc (giai đoạn B) = reset toàn bộ cổng C trở đi.
5. Ghi credit PixelLab đã tiêu sau mỗi giai đoạn vào sheet Tổng quan để biết giá thật của 29 nghề còn lại.
6. Mọi số frame và fps trong tài liệu này là đề xuất; chỉnh sau khi chơi thử, ghi lại vào file frame list.

---

## 10. Lệnh mở đầu cho Claude Code (copy vào phiên làm việc)

> Đọc `docs/11_Art_Pipeline_ChatGPT_PixelLab.md` và `Skeleton_Codex_Frame_Animation_List.xlsx`. Tạo cấu trúc thư mục `art/` theo mục 2, viết 5 script ở mục 8 (Python, Pillow), rồi chạy `get_balance`. Bắt đầu giai đoạn B: tạo 4 phương án thân xương trần 64×64 từ `art/ref/portrait_bare.png` bằng `generate_image_bitforge`, ghép contact sheet 4× vào `art/review/`, dừng lại chờ tôi chọn. Không chạy giai đoạn C khi chưa có bản chọn.

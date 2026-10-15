# Vạn Kiếp: thiên phú và chí hướng

**Ngày:** 15/10/2026 · **Mã:** `js/talent.js` (cùng vài chỗ gắn ở `life.js`, `systems.js`, `events.js`, `state.js`, `ui.js`) · **Đo:** `sim.html`, ba bảng Căn cốt, Chí hướng, Thiên phú và đổi hướng.

Người dùng muốn hai thứ: nhân vật có **thiên phú** chia sáu bậc màu như đồ trong game (Trắng, Lục, Lam, Tím, Vàng, Đỏ), thiên phú ảnh hưởng **tốc độ tu luyện**; và người chơi **định hướng** được đời nhân vật, ví dụ sinh ra trong nhà nông mà vẫn đi mạo hiểm.

Trước bản này, "Tự sống" là tất cả hoặc không gì: bật thì nhân vật tự chọn mọi thứ theo bốn số tính cách cố định; tắt thì người chơi phải tự bấm từng focus, từng quyết định. Có nghề rồi thì không đổi được (quyết định `work` chỉ mở khi chưa có nghề), nên đời nông dân ở quê gần như khóa chặt.

## 1. Căn cốt

Mỗi người có đúng một căn cốt, bốc lúc sinh. Căn cốt là hệ số **tu luyện**: nhân vào mọi lần rèn kỹ năng (`gain`, cả luyện tập, săn quái, làm nghề, sự kiện) và mọi lần nhận kinh nghiệm (`addXp`).

| Bậc | Tên | Trọng số lúc sinh | Tu luyện |
|---|---|---|---|
| Trắng | Căn cốt bình thường | 46 | ×0,85 |
| Lục | Căn cốt khá | 27 | ×1 |
| Lam | Căn cốt tốt | 15 | ×1,15 |
| Tím | Căn cốt hiếm có | 8 | ×1,35 |
| Vàng | Căn cốt thiên tài | 3,4 | ×1,6 |
| Đỏ | Căn cốt trăm năm có một | 0,6 | ×2 |

Trung bình lúc sinh ≈ ×1,01, nên cân bằng cũ (luật Tier, tỉ lệ chết vì quái) không xê dịch nhiều.

**Bình cảnh** (quyết định `tal_break`): chạm cấp 10, 20, 30, 40, 50 thì mỗi mốc được thử một lần nâng căn cốt lên một bậc.

- Mua thuốc tẩy tủy: giá 1,5 × trung vị thu nhập vùng × (bậc + 1), thành công 62% ở Trắng, giảm 9 điểm mỗi bậc.
- Bế quan tự ngộ: không tốn bạc, thành công 30% − 5 điểm mỗi bậc + 10% × tính chăm; hỏng thì mất 8–18 Sinh lực, 25% bị thương.
- Thuận theo tự nhiên: bỏ qua mốc này.

Bộ Xương giữ căn cốt của kiếp trước ("theo hồn mà đi"), mất hết thiên phú.

## 2. Thiên phú

Lúc sinh có 0 / 1 / 2 / 3 thiên phú với trọng số 30 / 40 / 22 / 8. Mỗi thiên phú bốc bậc theo cùng bảng trọng số như căn cốt rồi bốc một thiên phú trong bậc đó (bậc hết chỗ thì lùi bậc). Thiên phú chỉ rèn trường phái mà chủng tộc bị cấm thì không ra (Cơ Nhân không nhận Linh căn Hỏa nếu cấm Huyền thuật).

40 thiên phú, mỗi bậc 6–8 cái, khai trong `G.TALENTS`. Hiệu ứng là các khóa chung, gộp vào `S.talFx` mỗi khi đổi:

| Khóa | Nghĩa | Chỗ dùng |
|---|---|---|
| `rate` | × tu luyện mọi thứ | `gain`, `addXp` |
| `school`, `m` | × tốc độ rèn một trường phái / một kỹ năng | `gain` |
| `pow` | + sức mạnh (Tier) | `power` |
| `life` | × nguy cơ chết mỗi năm | `deathProb` |
| `inc`, `loot` | × thu nhập, × chiến lợi phẩm | `G.incomeMult`, `fight` |
| `flee` | + cơ hội chạy thoát khi thua | `fight` |
| `dev`, `heal`, `learn` | × Devotion, × khỏi bệnh, × Hiểu biết khi Học chữ | `endYear`, `healthYear` |
| `tgt` | + mục tiêu Sinh lực / Tâm trạng / Quan hệ | `driftStats` |
| `trait` | + tính cách | `G.syncTraits` |
| `rise` | cơ hội trỗi dậy tối thiểu | `die` (Hồn bất diệt: 60%) |
| `start` | cộng một lần khi có | lúc sinh, lúc thức tỉnh |

Bậc Đỏ có hai thiên phú hai mặt: **Ma thần chuyển thế** (sức +0,4 Tier, tu luyện ×1,4, Quan hệ −15, Tâm trạng −6) và **Hồn bất diệt** (trỗi dậy 60%).

**Thức tỉnh** (quyết định `tal_awaken`, chọn 1 trong 3): mỗi lượt có 0,6% cơ hội, +1,5% nếu đêm sinh có sao chổi, +6% nếu Sinh lực dưới 22 (thập tử nhất sinh), cộng thêm theo thời gian Tu hành / Luyện tập. Ba thiên phú chào bốc bậc nghiêng lên (trọng số × e^(0,45 × bậc)). Tối đa 5 thiên phú.

Giao diện: khối **Căn cốt, thiên phú** trong bảng nhân vật, chip viền theo màu bậc, di chuột xem hiệu ứng; dòng **Tu luyện ×…** trong bảng chỉ số; bảng cuối đời ghi căn cốt, thiên phú, chí hướng.

## 3. Chí hướng

Tám chí hướng (`G.AIMS`): Thuận theo tự nhiên (mặc định), Phiêu lưu mạo hiểm, Tu luyện võ đạo, Học vấn, Làm giàu, Tu hành, Quyền thế, Gia đình êm ấm. Đặt bằng:

- ô **Chí hướng** dưới phần focus, đổi lúc nào cũng được, **không tắt Tự sống**;
- quyết định **Chí hướng** (`aim_pick`) ở tuổi thiếu niên, gợi ý 4 chí hướng hợp tính cách, thiên phú, xuất thân nhất. Đã tự đặt ở ô thì không hỏi nữa.

Chí hướng tác động bốn chỗ:

1. **Tính cách.** `S.traits = S.traitsBase + thiên phú + chí hướng` (ví dụ Phiêu lưu: gan +0,3; Gia đình: hòa đồng +0,25, gan −0,2). Mọi lựa chọn tự động sẵn có (hơn 25 hàm `auto` ở các file khác đọc `S.traits`) tự nghiêng theo mà không phải sửa từng cái.
2. **Focus khi Tự sống.** Cộng trọng số focus của chí hướng vào `G.autoFocus` (thơ ấu, tuổi già một nửa). Nông dân chí hướng Phiêu lưu dành khoảng nửa năm để săn, phiêu lưu, luyện tập.
3. **Nghề.** Quyết định Kiếm sống luôn có nghề của chí hướng nếu làm được ở chỗ đang ở; tự động thì 85% chọn nó. Chọn hướng lúc nhỏ (`path`) theo trường phái thiên phú rèn mạnh nhất, rồi theo chí hướng.
4. **Quyết định mới** (bên dưới).

## 4. Quyết định và sự kiện mới

| Id | Khi nào | Lựa chọn |
|---|---|---|
| `aim_pick` | thiếu niên, chưa đặt chí hướng | 4 chí hướng gợi ý, Chưa biết |
| `aim_defy` (Nối nghiệp nhà) | nhà Cùng khổ / Nông hộ ở quê, cha mẹ còn, chưa có nghề, chí hướng không phải Gia đình | Nghe lời (ở lại làm nghề đất), Vừa làm vừa tập (mỗi năm tự rèn theo chí hướng, −1 Sinh lực), Khăn gói ra đi (Quan hệ −10, nghề đầu tiên là nghề của chí hướng) |
| `aim_job` (Đổi nghề?) | trưởng thành, nghề đang làm lệch chí hướng; hoặc chí hướng tự nhiên mà Tâm trạng dưới 30; 3 năm một lần | tới 3 nghề, Giữ nghề cũ. Đổi thì năm đầu học việc, lương thấp |
| `aim_sign` → `aim_chance` | sự kiện gieo cờ (trọng số 1,5, 5 năm một lần), quyết định mở năm sau | mỗi chí hướng một cơ hội: đoàn mạo hiểm thiếu người (2 trận phiêu lưu, sức +0,3 Tier trong chuyến), cao nhân ẩn cư (một mùa luyện tập ròng, chỉ nhận một lần; về sau là lên thăm sư phụ), thư viện cũ, mối hàng góp vốn, hành hương, yến tiệc quyền quý (ghi công với nước), bà mối / sum họp |
| `tal_awaken` | cờ thức tỉnh | 3 thiên phú |
| `tal_break` | chạm cấp 10, 20, 30, 40, 50 | thuốc tẩy tủy, bế quan, bỏ qua |

Hệ con cuối năm `talent` (sau `career`): luyện riêng khi chọn Vừa làm vừa tập, gieo thức tỉnh.

## 5. Kết quả đo

1000 đời, thế giới `can-bang`, chế độ tự động. So với bản trước (commit `733fbe9`, cùng seed):

| | Trước | Sau |
|---|---|---|
| Trận vượt Tier + 1 | 0 | 0 (53 112 trận) |
| Trỗi dậy | 19,0% | 20,4% |
| Tử trận trước quái (mọi cái chết) | 9,9% | 11,5% |
| Tier sức mạnh cuối đời ≥ 3 | 12,9% | 15,8% |
| Tier 5 cuối đời | 4,7% | 8,3% |
| Nông dân / mạo hiểm giả / thợ săn | 261 / 248 / 86 | 184 / 216 / 169 |
| 40 đời headless | 5,6 giây | 4,8 giây |

Căn cốt lúc sinh ra đúng trọng số (Trắng 47,1%, Lục 28,6%, Lam 12,3%, Tím 8,4%, Vàng 2,8%, Đỏ 0,8%). Cấp trung bình theo căn cốt lúc sinh: Trắng 11,5, Lục 16,6, Lam 20,8, Tím 21, Vàng 20,5, Đỏ 23,8 (bậc cao ít đời nên dao động). Lúc chết, sau tẩy tủy: Trắng 386, Lục 262, Lam 151, Tím 110, Vàng 65, Đỏ 26. Trung bình 1,45 thiên phú mỗi đời lúc chết (lúc sinh ~1,1).

Chí hướng lúc chết: Thuận theo tự nhiên 30% (phần lớn là chết trước tuổi thiếu niên), Học vấn 12,5%, Võ đạo 12,4%, Phiêu lưu 11,8%, Gia đình 10,2%, Làm giàu 9%, Tu hành 8,7%, Quyền thế 5,1%. Chí hướng Phiêu lưu: 80,5% làm mạo hiểm giả, cấp trung bình 27,3; Võ đạo cấp 31,3; Gia đình cấp 7,3.

Đổi hướng: thức tỉnh ở 32,5% đời, tẩy tủy thành công ở 21,6%; nối nghiệp nhà: nghe lời 4%, vừa làm vừa tập 13,4%, bỏ đi 10,3% (mọi đời); đổi nghề ở 18,2% đời; cao nhân nhận dạy 11,1%; cơ hội theo chí hướng trung bình 5 lần mỗi đời có chí hướng.

Chỗ lệch: nhiều người đi săn hơn (thợ săn gần gấp đôi, nông dân giảm 30%) nên tử trận trước quái tăng 1,6 điểm, Tier 5 gần gấp đôi. Nằm trong mục tiêu ~10% chết vì quái của docs/03 nhưng ở mép trên. Muốn kéo về thì giảm trọng số focus `hunt` / `adventure` của chí hướng Phiêu lưu hoặc `train` của Võ đạo trong `G.AIMS`.

Lần chỉnh đầu (trọng số `aim_sign` 2,5, 3 năm; cao nhân nhận lặp lại; thức tỉnh nền 1%; tự động bỏ nhà đi khi gan > 0,62) cho cơ hội 7,6 lần mỗi đời, cao nhân dạy 476 lần trên 108 đời, bỏ nhà 14,4%, tử trận trước quái 12,1%, Tier 5 8,9%.

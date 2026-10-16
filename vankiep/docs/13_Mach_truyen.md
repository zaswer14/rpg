# Vạn Kiếp: mạch truyện, dàn nhân vật, chương đời

Người dùng yêu cầu ngày 16/10/2026: mạch truyện của nhân vật đang quá nhiều hướng ngẫu nhiên, rời rạc, thiếu liên kết; cần thêm sự kiện và cách nối để sự kiện có ý nghĩa hơn, vẫn giữ sự kiện ngẫu nhiên. Sau khi bàn, người dùng chốt:

- Khoảng **một nửa** sự kiện thuộc mạch, nửa còn lại ngẫu nhiên.
- Nhân vật phụ **sống đời riêng, giản lược** (lớn lên, lên Tier, lập gia đình, chuyển đi, chết).
- **Hồi cao trào là quyết định** (người chơi chọn, chế độ tự động chọn theo tính cách); các hồi khác tự chạy theo quỹ đạo, hoàn cảnh.
- **Chưa nối xuyên kiếp** (kẻ thù đời trước, con cháu người quen, Bộ Xương nhớ người cũ): để bước sau.

Mã: `js/story.js`, nạp **sau** `js/tree.js` (dùng `G.treeWrap` để nút mới đi qua cổng chung của cây sự kiện). Bảng đo ở `sim.html` (ba bảng "Mạch truyện: tổng quan", "Mạch truyện: mở, khép", "Chương đời"). Tab "Mạch truyện" trên trang Duyệt Nội Dung.

## 1. Chỗ yếu trước bước này

Cây sự kiện (`docs/12`) chặn được chuyện vô lý nhưng chưa tạo ra mạch:

- Mạch chỉ sâu hai nút: `ad_companion` rẽ sang `cp_save`, `cp_betray`… là hết.
- Người trong truyện dùng một lần: bạn đồng hành, người thương, đệ tử là một cờ có tên, hết mạch là mất. Đứa bắt nạt hồi nhỏ, người kéo bạn khỏi sông, tên cướp chặn đường không bao giờ quay lại.
- Sự kiện ngẫu nhiên không để lại gì: thua xúc xắc chỉ mất tiền, được cứu chỉ cộng vài điểm.
- Không quãng đời nào có câu hỏi lớn, nên nhật ký là chuỗi năm rời.

## 2. Thiết kế: bốn lớp

### 2.1 Dàn nhân vật (`S.cast`)

Tối đa 12 người (`G.STORY.castMax`). Mỗi người: tên (không trùng người đã có), giống loài, vai (`G.ROLE_VI`: bạn, đối thủ, kẻ thù, ân nhân, người mang ơn, thầy, học trò, người thương cũ, bạn đời, chủ nợ, người giữ bí mật, người trong mộng ước, ruột thịt), độ thân −100…100, nghề, Tier, nơi ở, chí tiến thủ `drive`, lần gặp, số lần gặp, tin chưa nghe.

Hệ con `cast` (trước `story`, trước `traj`): mỗi lượt, với mỗi người còn sống:

| Việc | Tỉ lệ (theo năm, chia theo tuổi thọ của loài: × 62 / tuổi thọ) |
|---|---|
| Trưởng thành thì có nghề theo vai | |
| Lên Tier, tối đa ⌊4,5 × drive³⌋ (người có Tier sẵn như thầy, Thánh Kỵ Sĩ giữ Tier đó) | 0,04 + 0,06 × drive; nghề đánh nhau × 1,3 |
| Lập gia đình | 0,07 |
| Chuyển vùng | 0,015 |
| Chết | 0,002 + 0,005 (nghề đánh nhau) + 2,4 × (tuổi / tuổi thọ − 0,55)² khi quá 55% đời |

Mỗi thay đổi thành một tin (`p.news`), nghe được ở lần gặp sau hoặc qua sự kiện "Tin người quen". Không gặp thì độ thân phai 3% mỗi năm. Tuổi lúc gặp kẹp trong 55% đời của loài (kẻ cướp không vừa xuất hiện đã chết già), người mới gặp năm nay không chết ngay năm đó. Người thân quen (|độ thân| ≥ 30) chết thì có một dòng nhật ký; người khác thành tin "đã mất". Dàn đầy thì bỏ người ít liên quan nhất (không ở trong mạch, đã mất, nhạt, lâu không gặp).

### 2.2 Mạch (`S.arcs`, `G.ARCS`)

Mạch đi qua các bước `open` → `knot` → `climax` → `after` → khép; một người trong dàn làm nhân vật chính (mạch Báo thù không có người, nhắm một loài quái). Nút của mạch ghi `story: { arc, at, wait, to }`:

- Nút đang mở có trọng số × 4 (`pull`), mạch chính × 1,5 nữa, quá `wait[1]` thì × 2; quá `wait[1]` + 2 (`late`) lượt mà không nút nào xảy ra thì mạch **phai**.
- Cùng lúc tối đa 3 mạch (`arcMax`), một mạch chính (mạch mở đầu tiên; khép thì mạch kế lên thay). Lời bà đồng là mạch `passive`, không chiếm chỗ.
- Người trong mạch chết trước thì mạch khép với dòng `gone` của mạch.
- Quyết định của mạch có ưu tiên 7, quyết định phải trả lời ngay (thư nhà, chuyện cũ, điều đã thấy, chủ nợ) ưu tiên 8 (mỗi năm chỉ mở hai quyết định).
- Kết của mạch ghi ở `S.arcDone` (`{ k, who, name, o, y, t0, t }`).

| Mạch | Mở từ | Các hồi | Kết |
|---|---|---|---|
| Đối thủ | `ch_bully` (đứa cầm đầu), `st_rival` (thiếu niên), `dt_rival` (đệ tử phản sư, vào thẳng bước Thắt) | `rv_kid` (thơ ấu, giữ ở bước Mở), `rv_school` / `rv_love` / `rv_rise` → quyết định `rv_duel` (đấu, mời rượu, bỏ đi) → `rv_end` | thắng, thua, làm lành, bỏ đi |
| Ơn cứu mạng | `ch_river` (người chăn dê), `cp_save` | quyết định `gr_ask` (cần tiền, bảo lãnh con, hộ tống qua khu có quái: một trận thật) → `gr_end` | trả được, từ chối |
| Người mang ơn | `st_rescue` (thương nhân, người sang, kẻ giắt dao; tối đa 2 lần một đời) | `fv_return`: trả đúng cái bạn đang cần (xóa án, cho qua đèo, làm mối, mối làm ăn, kiếm) | trả ơn |
| Mối thù | `ad_bandits` thua (40%), `cp_betray` | `fd_news` → quyết định `fd_face` (đòi bằng tay, báo quan, bỏ qua) → `fd_end` | thắng, pháp luật, quan xử ngược, tha (55% kẻ thù gửi trả tiền) |
| Báo thù | `ch_raid` (anh chị chết), `st_parent_lost` (cha không về) | `vg_oath` hoặc `vg_letgo` → quyết định `vg_hunt` (một trận thật với loài đó bản tinh anh, chỉ khi loài ≤ Tier + 1 và sức đủ; thua thì thử lại một lần) → `vg_end` | báo được, buông, không báo được |
| Tình xưa | `tn_love`, từ chối cầu hôn (`marriage`) | `lv_again` → nếu cả hai còn một mình: quyết định `lv_choice` (nối lại thành vợ chồng / để ngủ yên) | cưới, để ngủ yên, chuyện đã qua |
| Thầy trò | `mentor` (bái sư) | `ms_trial` → quyết định `ms_crisis` (thầy bị thách đấu / lâm bệnh) → `ms_end` | chân truyền, xa thầy |
| Nợ cờ bạc | `ad_dice` thua khi tiền dưới trung vị (50%) | quyết định `gb_collect` (trả, làm việc mờ ám, trốn) → `gb_end` | trả, dính vào chủ nợ, trốn, bị đánh |
| Bí mật | `st_witness` (danh phận ≥ 1; tối đa 2 lần một đời) | quyết định `sc_choice` (tố giác, tống tiền, im lặng) → `sc_end` | vạch mặt, không ai tin, được che chở, thích khách |
| Mộng ước | `ch_knight` (người đi đường ghé quán trọ) | `id_meet` | ngang hàng, được chỉ một thế, người đó sa sút |
| Ruột thịt | `st_kin` (thư nhà, mỗi anh chị một lần) | quyết định `kn_help` → `kn_end` | cưu mang, cắt đứt |
| Bạn thân | `st_friend` (thơ ấu), `tn_brawl`, `cp_part` (vào thẳng bước Sau) | `fr_part` → `fr_reunion` | gặp lại |
| Người mất tích | `ad_companion_lost` | `ls_return` (trọng số thấp; không về thì người đó chết hẳn) | trở về |
| Kẻ săn (Bộ Xương) | `sk_paladin` thắng | `hn_return` → quyết định `hn_end` (đấu tới cùng, nói chuyện, bỏ đi) → `hn_after` | hạ kiếm, hạ được, bị thanh tẩy dở, trốn |
| Đứa bé tặng hoa (Bộ Xương) | `sk_child` | `fl_grown` → `fl_end` (đứng chắn đám đuốc / dắt con lên đồi) | che chở, thành người nhà |
| Lời bà đồng | `ad_prophet` | `pr_year` (đúng năm tuổi bà nói) → `pr_after` | sống qua năm ấy |

Sức của người quen trong các trận tay đôi (không tới chết, trừ Thánh Kỵ Sĩ): `1,1 + 1,1 × Tier + k`, cùng thang với `X.power` (Phàm Nhân ~1,2, mỗi Tier thêm ~1,1); xác suất thắng `1 / (1 + e^(−3 × chênh))`, kẹp.

### 2.3 Mở mạch và người quen xuất hiện

Sự kiện vẫn bốc ngẫu nhiên như trước. Ba cách nối:

1. **Móc vào sự kiện có sẵn** (`patch`, `patchDec`; danh sách ở `G.STORY_HOOKS`): sau hàm gốc thì thêm tên người, thêm người vào dàn, mở mạch (bảng trên). Hai sự kiện ở `events.js` để lại cờ cho việc này: `ch_raid` (`S.flags.kinKilled`), `ch_knight` (`S.flags.idol`).
2. **Người quen xuất hiện trong sự kiện thường gặp** khi trong dàn có người hợp: lễ hội (nhảy với bạn, người thương), mất mùa (nhà người quen chia lúa), quái vào làng (người quen kéo nhà bạn xuống hầm), đau lưng tuổi già (người quen ghé thăm), muốn đi xa (thư của người quen ở vùng khác), lệnh treo thưởng (bạn cùng nghề rủ đi), thuế (người thu là người quen: thân thì bớt, thù thì thêm), gặp lại bạn thơ ấu (`ad_old_friend` dùng người bạn trong dàn), lữ khách bỏ chạy (Bộ Xương: lần hai quen mặt, lần ba thành mối buôn).
3. **Sự kiện mới**: sáu sự kiện mở mạch (`st_friend`, `st_rival`, `st_rescue`, `st_witness`, `st_kin`, `st_parent_lost`), bốn sự kiện người quen (`cm_news` tin tức, `cm_visit` ghé chơi, `cm_glare` chạm mặt kẻ thù, có khi bị tung tin xấu, `cm_help` tới giúp khi bạn ốm, hết tiền, buồn).

Sự kiện tính là **thuộc mạch** khi nó là nút của mạch, mở mạch, có người quen xuất hiện, hoặc là nhánh của cây sự kiện (`from`). Đếm ở `S.flags.stEv`, `stLink` (quyết định: `stDec`, `stDecLink`).

### 2.4 Chương đời (`S.chap`, `G.CHAPTERS`)

Quãng đời (`G.phaseOf`): Thiếu thời, Lập thân (40% đầu của quãng trưởng thành), Trung niên, Xế chiều; Bộ Xương: Thức giấc (3 lượt đầu), Giữa hai cõi, Lửa hồn lụi dần. Thơ ấu không có chương. Đầu quãng (hệ con `story`, cuối năm) chọn một câu hỏi theo trọng số:

| Câu hỏi | Khi nào nặng | Làm được khi |
|---|---|---|
| Tìm đường cho mình (thiếu thời) | luôn | có nghề, thầy, đi học, hoặc chí hướng |
| Thoát nghèo | tầng lớp ≤ 2, tiền dưới trung vị | tầng lớp lên hoặc tiền ≥ 3 × trung vị |
| Bước lên Tier kế tiếp | phần Võ, Pháp; chí hướng võ đạo | Tier tăng |
| Có tiếng nói giữa người đời | danh phận ≤ 1 | danh phận tăng |
| Dựng một mái nhà | thân xác, chưa có bạn đời; phần Gia, hòa đồng | có bạn đời |
| Học cho tới nơi | phần Trí, chăm học | Hiểu biết +15 hoặc lên cấp học |
| Tìm đạo | có đạo; phần Đạo, mộ đạo | đức tin ≥ 60 |
| Ngồi vào ghế quyền | danh phận ≥ 2, chưa có chức | có chức, tước, ngai, trưởng khu |
| Đi cho biết đó biết đây | phần Du, gan dạ | thêm 2 chuyến đi hoặc đổi vùng |
| Làm giàu | phần Thương | tiền ≥ 8 × trung vị |
| Câu hỏi của mạch chính ("Vượt qua Gorn", "Báo thù cho cha"…) | có mạch chính (trọng số 5) | mạch đó khép với kết "làm được" |
| Để lại gì cho đời / Khép lại chuyện cũ / Sống cho yên (xế chiều) | | có đệ tử, con còn sống, hồi ký / các mạch mở lúc đầu chương đã khép / Tâm trạng ≥ 55 |
| Nhớ lại mình là ai / Sống sót / Có chỗ đứng giữa người sống / Giữ lửa hồn (Bộ Xương) | | có ký ức hoặc thấy mộ / còn sống / danh phận ≥ 1 hoặc hắc đồ trung thành / Sinh lực ≥ 40 |

Sự kiện có nhãn `dir` hợp hướng của câu hỏi được cộng trọng số tới × 1,5 (`chapBoost`). Hết quãng thì ghi dòng "Khép chương …: đã làm được / chưa làm được", kèm các chuyện đã khép trong chương. Lúc chết khép chương đang mở ("còn dang dở") và ghi đoạn "Người ta nhớ về … qua mấy chuyện" ghép từ tối đa năm mạch đã khép.

## 3. Giao diện

- Nhật ký: dòng thuộc mạch có nhãn vàng "Tên mạch · Tên người" (`e.arc`; `life.js` `log` đọc `X._tag`); dòng chương in nghiêng màu vàng (`kind: 'chapter'`).
- Thẻ nhân vật: dòng **Chương** (quãng đời · câu hỏi), khối **Người quen** (`G.castRows`): tên tô xanh nếu thân, đỏ nếu thù, mờ nếu đã mất; vai, mạch đang mở; di chuột xem người đó là ai, giống loài, tuổi, nghề, Tier, nơi ở, độ thân, tin chưa nghe.

## 4. Kết quả đo

`sim.html`, 1000 đời + 184 kiếp Bộ Xương, thế giới `can-bang`, 16/10/2026.

| | Kết quả |
|---|---|
| Sự kiện đời người thuộc mạch (mọi đời, mọi kiếp) | 46,9% (mục tiêu ~50%) |
| … đời trưởng thành / kiếp Bộ Xương | 47,3% / 45,2% |
| Đời trưởng thành theo phần thuộc mạch: <20 / 20–40 / 40–60 / 60–80 / ≥80% | 0 / 10,3 / 87,9 / 1,7 / 0% |
| Quyết định thuộc mạch | 28,0% |
| Người trong dàn lúc chết / trong đó gặp từ 2 lần (đời đầu) | 9,5 / 8,0 |
| Mạch khép mỗi đời / mỗi kiếp Bộ Xương | 7,6 / 3,1 |
| Đời trưởng thành không khép mạch nào | 0,6% |
| Trỗi dậy / chết vì quái (đời đầu) | 18,4% / 10,4% (trước 20,6% / 10,4%) |
| Trận quá Tier + 1 | 0 |
| Tier cuối đời 0 / 1 / 2 / 3 / 4 / 5 (đời trưởng thành) | 58,6 / 28,7 / 9,3 / 2,8 / 0,2 / 0,3% (trước 58,8 / 27,3 / 10,4 / 3,0 / 0,5 / 0) |
| Nhận đệ tử / học việc thợ lành nghề | 13,2% / 36,1% |
| 1000 đời | 110–150 giây (máy đang làm việc khác; cây sự kiện đo ~140 giây) |

Mỗi 1000 đời (tính cả kiếp Bộ Xương): mạch mở / khép / người chết trước / phai:

| Mạch | Mở | Khép theo kết | Người chết trước | Phai |
|---|---|---|---|---|
| Đối thủ | 805 | làm lành 193, thua 183, bỏ đi 168, thắng 138 | 30 | 19 |
| Ơn cứu mạng | 694 | trả được 452, từ chối 47 | 144 | 2 |
| Người mang ơn | 1350 | trả ơn 1264 | 30 | 0 |
| Mối thù | 609 | tha 349, thua 79, pháp luật 56, thắng 38 | 23 | 1 |
| Báo thù | 278 | buông 181, báo được 70, không báo được 5 | | 1 |
| Tình xưa | 519 | để ngủ yên 281, chuyện đã qua 117, nối lại thành vợ chồng 54 | 10 | 27 |
| Thầy trò | 222 | chân truyền 179, xa thầy 20 | 12 | 1 |
| Nợ cờ bạc | 43 | dính vào chủ nợ 25, bị đánh 9, trốn 3, trả 3 | | 0 |
| Bí mật | 1253 | vạch mặt 471, được che chở 470, không ai tin 221, thích khách thắng 21, thua 8 | 10 | 0 |
| Mộng ước | 635 | sa sút 238, chỉ một thế 172 | 176 | 0 |
| Ruột thịt | 757 | cưu mang 435, cắt đứt 106 | 193 (anh chị mất) | 0 |
| Bạn thân | 1279 | gặp lại 989 | 147 | 19 |
| Người mất tích | 200 | trở về 158 | | 19 |
| Kẻ săn | 568 | trốn 335, hạ được 61, bị thanh tẩy dở 34, hạ kiếm 10 | 30 | 0 |
| Đứa bé tặng hoa | 162 | che chở 85, thành người nhà 50 | 2 | 7 |
| Lời bà đồng | 736 | sống qua năm ấy 442 (còn lại chết trước năm đó hoặc bà nói quá tuổi thọ) | | 0 |

Chương đời (làm được): câu hỏi của mạch chính 840 chương, 52%; Bước lên Tier kế tiếp 479, 21%; Thoát nghèo 409, 21%; Học cho tới nơi 300, 61%; Tìm đạo 275, 48%; Để lại gì cho đời 214, 94%; Dựng một mái nhà 149, 67%; Có tiếng nói giữa người đời 135, 27%; Đi cho biết đó biết đây 107, 28%; Ngồi vào ghế quyền 23, 13%.

Lần chỉnh trong lúc làm:

- Đo lần đầu: 38% sự kiện thuộc mạch; bí mật, người mang ơn mở 2–3 lần mỗi đời. Thêm người quen vào lễ hội, mất mùa, quái vào làng, đau lưng, muốn đi xa, lệnh treo thưởng, thuế, thêm sự kiện "bạn tới giúp"; giới hạn cứu người, bắt gặp bí mật hai lần một đời; thêm hai mạch cho Bộ Xương (trước đó kiếp Bộ Xương chỉ 25%).
- Trận phân định thắng 80%: sức đối thủ tính theo Tier thô trong khi sức người chơi trên thang khác. Đổi sang `1,1 + 1,1 × Tier` cho mọi người quen.
- Đối thủ phai 14% vì bị bắt nạt lúc 1–2 tuổi mà nút kế cần tuổi thiếu niên: thêm `rv_kid` (thơ ấu, giữ ở bước Mở, tính lại khoảng chờ).
- Đọc đời mẫu thấy: dấu phẩy đôi khi gọi tên kèm "là ai" trước dấu câu (đổi sang dạng ngoặc), người đã mất còn tin "lập gia đình", trùng tên trong dàn, kẻ cướp vừa gặp đã chết già (tuổi kẹp theo loài), thư nhà của cùng một người lặp ba lần (mỗi anh chị một lần). Đã sửa cả.

## 5. Còn để lại

- **Nối xuyên kiếp** (người dùng hoãn): kẻ thù, người thương đời trước gặp lại kiếp sau; Bộ Xương nhớ người quen của thân xác cũ; con cháu người quen. Dàn nhân vật hiện xóa khi trỗi dậy (`rise` tạo `S` mới).
- Chưa đưa người quen vào các hệ khác: đồng niên (`S.peers`), hội, quan chức, nhà quý tộc NPC chưa phải người trong dàn; người quen chưa có giáo phái, chưa đi theo chiến tranh, dịch bệnh của thế giới động.
- Quyết định thuộc mạch chỉ ~28% (nhiều quyết định thường như vào hội, nhận nhiệm vụ, di cư chưa móc người quen).
- Câu chữ mỗi nút có một tới năm biến thể; lặp lại nhiều đời có thể thấy quen. Thêm biến thể theo giống loài, vùng, nghề khi duyệt.
- Bản lưu cũ chưa có `S.cast`, `S.arcs`: dàn và mạch bắt đầu từ năm tải lại.
- Kẻ săn: chế độ tự động hay chọn trốn (335 / 440) vì Bộ Xương ít hòa đồng nên ít khi "nói chuyện"; người chơi tự chọn thì khác.
- Tình xưa còn 27 / 519 mạch phai ở bước lựa chọn (người kia lập gia đình giữa lúc gặp lại và lúc quyết định).
- Chưa chạy Thử thế giới động, Thử 100 thế giới: bước này không đổi phần thế giới.

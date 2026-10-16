# Vạn Kiếp: thiết kế lại hệ sức mạnh, lên cấp, chuyển nghề

**Ngày:** 16/10/2026 · **Trạng thái:** người dùng đã chốt (mục 11, hai vòng); đã làm vào mã 16/10/2026, kết quả mục 12. · **Thay cho:** `07` mục 4.1–4.2 (bước A) và **bỏ cảnh giới** của `07`. Phần còn lại của `07` (địa vị, nghề bốn vòng, tổ chức, sự kiện `cv_*`) giữ nguyên, đọc theo Tier (mục 7.3). · **Đọc kèm:** luật chung `../../shared/docs/00_Luat_chung.md` mục 1–2, luật kỹ năng và chỉ số của Skeleton Codex `../../platform/docs/06_Skill_Ranks_Level_And_Tier_Gates.md` (thưởng chỉ số từng kỹ năng: `REWARD_BY_SKILL` trong `../../platform/skill-system.js`).

Người dùng nói (16/10/2026): hệ sức mạnh, cách lên cấp, cách chuyển nghề còn thiếu logic và không nhất quán. Mục 1 là chỗ hỏng của bản bước A, mục 2 nguyên tắc, mục 3–7 thiết kế mới, mục 10 việc trong mã.

## 1. Chỗ thiếu logic của bản hiện tại

| # | Hiện trạng (`js/cult.js`, `js/life.js`) | Vì sao hỏng |
|---|---|---|
| 1 | **Hai thước đo chạy song song, không nối nhau.** 26 mastery 0–100 (`X.gain`) và điểm rèn kỹ năng (`X.addXp`). Mỗi hoạt động rót vào cả hai bằng hai công thức riêng; `trainYear`, `cultYear` phải tự đoán mastery nào nghề kế tiếp cần. | Người chơi không biết mình đang luyện cái gì. Một năm luyện kiếm vừa tăng "Sword" vừa tăng một kỹ năng vô danh không dính gì tới kiếm. |
| 2 | **Kỹ năng không thuộc nghề, không thuộc trường phái.** Kỹ năng chỉ có Tier; gate là "max 2 kỹ năng Tier n − 1 bất kỳ". | Nông dân cày ruộng cũng max được "kỹ năng Tier 0" rồi vào Pháp Sư. Gate riêng của từng nghề trong thư viện nghề mất nghĩa. |
| 3 | **Sức mạnh cộng ba lần cùng một thứ:** `.35 + G.lvPow` (≈ Tier) `+ Tier nghề × 0,12` `+ mastery / 220` + đồ + thiên phú. | Tier nghề bị đếm hai lần, mastery lần thứ ba. Kỹ năng không có tác dụng gì ngoài đếm cấp. |
| 4 | **Không có chỉ số nhân vật.** Kỹ năng max không cho gì, trái luật của Skeleton Codex (max bậc 5 luôn có thưởng chỉ số vĩnh viễn). | Không có gì để người chơi thấy mình mạnh lên vì sao. |
| 5 | **Chữ "cấp" có hai nghĩa:** cấp 0–22 (số kỹ năng max) và "Chiến sĩ cấp 1–9" (cảnh giới). | Nhật ký in "Cấp 8" rồi ngay sau là "Chiến sĩ cấp 3". |
| 6 | **Bậc lẻ của cảnh giới gần như trống** (dưới 1% dân, `07` mục 4.9). | Kỹ năng thừa tính ngay vào cấp sau khi chuyển nghề nên nhảy qua bậc lẻ. |
| 7 | **Số chỗ kỹ năng không khớp hạn mức:** chỗ 6 / 6 / 6 / 6 / 5 / 4 theo Tier, hạn mức 2 / 6 / 10 / 14 / 18 / 22. | Hai con số không suy ra từ nhau. |
| 8 | **Rèn nhanh dần theo cấp:** luyện tập cho `70 × (1 + 0,11 × cấp)` điểm, trong khi giá kỹ năng tăng theo Tier. | Hai núm triệt tiêu nhau, không có lý do trong truyện. |
| 9 | **Người dạy là danh sách điều kiện rời** (`G.teachCap`), không phân trường phái. | Học viện ngành Võ bị mở Tier 4 cho cả người đi Tử thuật. |
| 10 | **Thử thách chuyển nghề** chỉ xét `sức − Tier nghề đích`. | Không xét tay nghề (mastery) vượt yêu cầu bao nhiêu. |

Gốc chung: **kỹ năng không gắn vào nghề và không có tác dụng**, nên cấp, sức, chuyển nghề phải dựa vào những con số khác.

## 2. Nguyên tắc

1. **Một chuỗi nhân quả:** hoạt động → điểm rèn → kỹ năng của nghề → kéo theo mastery, cho chỉ số → level → Tier. Sức tính từ chỉ số và kỹ năng đang lắp, không đọc level.
2. **Kỹ năng thuộc nghề.** Mỗi nghề có danh sách kỹ năng; người chơi chọn 10 cái để nâng, và chọn gì thì quyết định đi được nghề nào.
3. **Mỗi lớp một việc:** mastery là tay nghề (mở nghề, kiếm sống); kỹ năng là tu luyện; chỉ số và kỹ năng đang lắp là sức đánh; level, Tier là thân phận và khu đi được.
4. **Theo luật thư viện nghề:** gate = đúng cặp kỹ năng riêng của nghề đích (`shared/trunk.js` trường `gate`). Bản trước của file này (2 kỹ năng bất kỳ) bỏ.
5. **Giữ** những gì người dùng chốt ở `07` mục 8 mà không bị thay: ai cũng tu được; tháp theo Tier `07` mục 6; thọ nguyên × (1 + 0,12 × Tier); không tông môn; tiền đồng / bạc / vàng.

## 3. Kỹ năng

### 3.1. Danh sách kỹ năng của nghề

Mỗi nghề (cả nghề gốc) có **12 kỹ năng**, cùng Tier với nghề:

- **Cặp gate của mọi nghề kế tiếp** trong thư viện nghề. Ví dụ Chiến Binh: `rough_three_cut`, `shield_tap` (vào Vệ Binh), `sword_cleave` (vào Kiếm Sĩ, chung `rough_three_cut`), cặp gate của các nhánh khác. Nghề đích có `gate: null` thì dùng kỹ năng tạm `<nghề đích>#g1`, `#g2`.
- Thêm kỹ năng tạm `<nghề>#1`, `#2`… cho đủ 12. Nghề cuối đường (không nghề kế) dùng kỹ năng tạm hết. Nghề có nhiều nghề kế tới mức cặp gate vượt 12 thì danh sách dài hơn 12, không cắt.

Tên tạm hiện là "Kỹ năng 3 của Kiếm Sĩ", "Gate 1 vào Kiếm Hào". Đặt tên tiếng Việt là bước F (`07` mục 7).

Mỗi kỹ năng có ba thẻ:

| Thẻ | Lấy từ | Dùng vào |
|---|---|---|
| **Mastery** | kỹ năng gate của nghề D: một mục trong `D.req` (tên kỹ năng chứa tên mastery thì lấy đúng mục đó: `shield_tap` → Shield); kỹ năng tạm: `req` của nghề, hoặc mastery của trường phái | rèn kỹ năng thì mastery đó tăng theo (mục 4.1) |
| **Chỉ số** | `REWARD_BY_SKILL` nếu có; không thì theo mastery (mục 6.1) | thưởng khi đạt bậc 5 |
| **Tier** | Tier của nghề | giá rèn, hiệu quả khi lắp |

Kỹ năng gate của nghề D gắn đúng mastery D đòi, nên **luyện cặp gate của D thì tự nâng tay nghề D cần**. Bỏ phần "đoán mastery còn thiếu" trong `trainYear`, `cultYear`.

### 3.2. Mười kỹ năng được nâng (người dùng chốt 16/10/2026)

- Học một kỹ năng là có **bậc 1**. Học bậc 1 rẻ (1/5 giá kỹ năng), học được hết 12.
- **Mỗi Tier chỉ 10 kỹ năng được nâng** lên bậc 2–5. Kỹ năng thành "được nâng" lúc người chơi nâng nó lên bậc 2 lần đầu; chọn rồi không đổi. Hết 10 chỗ thì các kỹ năng còn lại **dừng ở bậc 1**.
- 10 chỗ tính riêng cho từng Tier: kỹ năng Tier 1 không chiếm chỗ của Tier 2. Cả đời tối đa 60 kỹ năng được nâng.
- Kỹ năng bậc 1 không có thưởng chỉ số (thưởng ở bậc 3, bậc 5), nhưng vẫn **lắp** được (mục 6.2).

Chọn 10 kỹ năng là **chọn hướng đi**: danh sách 12 kỹ năng chứa cặp gate của 2–4 nghề kế tiếp, mà chỉ có 10 chỗ, nên muốn giữ mọi đường thì phải bỏ bớt kỹ năng khác.

### 3.3. Học được kỹ năng nào

Kỹ năng trong danh sách của nghề đang làm. Kỹ năng của nghề cũ giữ nguyên bậc khi chuyển nghề (đã max hết vì điều kiện chuyển nghề, mục 7.1). Kỹ năng Tier t cần người dạy Tier ≥ t cho trường phái đó; không có thì rèn × 0,4 (mục 5).

## 4. Level

### 4.1. Điểm rèn

Mọi nguồn (luyện tập, săn, phiêu lưu, làm nghề, học, luyện ngoài giờ, sự kiện) cho **điểm rèn**:

```
điểm rèn = gốc của hoạt động × căn cốt, thiên phú (G.cultRate) × ma lực nơi ở × tài nguyên × người dạy (1, hoặc 0,4 khi thiếu)
```

Dồn vào **kỹ năng đang rèn**, theo thứ tự tự động:

1. Kỹ năng đã được nâng mà chưa max.
2. Còn chỗ nâng: chọn kỹ năng mới để nâng (quyết định `cv_learn`, dưới đây).
3. Hết chỗ, mọi kỹ năng được nâng đã max: học bậc 1 các kỹ năng còn lại; sau đó điểm rèn chỉ còn tăng mastery (mục 7.4).

Quyết định **`cv_learn` Nâng kỹ năng mới**: mỗi lần mở một chỗ nâng, người chơi chọn trong các kỹ năng chưa được nâng của danh sách. Mỗi dòng ghi mastery, chỉ số thưởng, và **cảnh báo khi chọn nó làm mất đường vào một nghề** ("Còn 1 chỗ: chọn kỹ năng này thì không còn đủ chỗ cho cặp gate vào Vệ Binh"). Tự động: cặp gate của nghề kế tiếp theo hướng đi (`S.path`, chí hướng) trước, rồi cặp gate của nghề kế tiếp khác, rồi kỹ năng có thưởng chỉ số hợp trường phái.

Rèn kỹ năng gắn mastery m thì m tăng qua `X.gain` theo số điểm rèn đã dồn (`G.CULT.mPt` = 0,004 mastery mỗi điểm, tính theo giá gốc; giữ giảm dần `1 − m / 115` và quyền trường phái native / foreign). Tính theo điểm chứ không theo bậc, để kỹ năng Tier cao (đắt hơn) cũng đẩy tay nghề nhiều hơn.

Sinh kế không phải luyện võ (làm ruộng, buôn bán) vẫn cho mastery sinh kế như cũ (`G.WORKS.trains`) và ít điểm rèn. Mastery từ sinh kế là tay nghề kiếm sống, không tự mở nghề chiến đấu.

### 4.2. Level = số kỹ năng đã max

**Level = số kỹ năng được nâng đã đạt bậc 5. 10 level là 1 Tier** (người dùng chốt 16/10/2026):

| Nghề đang làm | Level | Max level của Tier |
|---|---|---|
| Tier 0 (nghề gốc) | 0–10 | 10 |
| Tier 1 | 10–20 | 20 |
| Tier 2 | 20–30 | 30 |
| Tier 3 | 30–40 | 40 |
| Tier 4 | 40–50 | 50 |
| Tier 5 | 50–60 | 60 |

Vì chuyển nghề đòi max level (mục 7.1), vào nghề Tier t thì level đúng bằng 10t. Không còn hạn mức riêng, kỹ năng thừa, bậc lẻ / chẵn: level chỉ tăng khi max một kỹ năng của nghề đang làm. Bỏ `G.SK_SLOTS`, `G.lvCap`.

### 4.3. Giá kỹ năng

Giá một kỹ năng (5 bậc) theo Tier; mỗi bậc 1/5 giá. **Bỏ hệ số `× (1 + 0,11 × cấp)`** trong luyện tập.

| Tier kỹ năng | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Giá chốt bằng sim (`G.SK_COST`) | 260 | 450 | 900 | 1 500 | 2 200 | 3 000 |
| Tổng điểm để vào Tier kế (10 kỹ năng) | 2 600 | 7 100 | 16 100 | 31 100 | 53 100 | (max level 60: 83 100) |
| Đề xuất ban đầu | 300 | 1 000 | 2 000 | 3 000 | 4 000 | 5 000 |

Đề xuất ban đầu giữ đường cong của bước A, nhưng bước A còn nhân điểm luyện tập theo cấp; bỏ hệ số đó thì lên quá chậm (1000 đời: Tier 0 cuối đời 59%), nên giá hạ khoảng một nửa (mục 12). Học bậc 1 hai kỹ năng không nâng thêm 2 × 1/5 giá.

## 5. Người dạy

- Vào nghề Tier t cần người dạy Tier ≥ t **dạy trường phái của nghề đó**.
- Đang ở nghề Tier T mà mất người dạy đủ Tier (rời học viện, sư phụ mất): vẫn rèn được, điểm rèn × 0,4 (tự mò).
- Tự học: tới Tier 1 mọi trường phái.

Thay `G.teachCap` bằng bảng dữ liệu `G.TEACHERS` (để duyệt được trên trang) và `G.teachOf(S, trường phái)`:

| Nguồn | Tier dạy tới | Trường phái | Điều kiện |
|---|---|---|---|
| Tự học | 1 | mọi | |
| Phường hội, đoàn lính đánh thuê, quân ngũ, Hiệp Hội từ hạng Bạc | 2 | mọi | là thành viên / từng đi lính |
| Học viện trung cấp | 2 | mọi | đang học hoặc đã tốt nghiệp |
| Học viện cao cấp | 3 | mọi | |
| Học viện cao cấp ngành Võ bị | 4 | Chiến đấu, Tầm xa, Võ thuật, Dã thú, Bóng tối | |
| Học viện cao cấp ngành Pháp thuật | 4 | Huyền thuật, Tử thuật, Chế tác | |
| Chức trong hội (quản sự, phó đoàn, hội trưởng) | 3 | theo loại hội: đoàn lính đánh thuê dạy Chiến đấu, Tầm xa, Võ thuật, Dã thú; Phường Thợ dạy Chế tác; Hội Học Giả dạy Huyền thuật, Tử thuật; Hội Bóng Đêm dạy Bóng tối | giữ chức từ quản sự trở lên (thêm 16/10/2026, mục 12.1) |
| Quan chức nhà nước | 3 | mọi (nhà nước mướn thầy) | làm Quan tỉnh hoặc Đại thần (thêm 16/10/2026, mục 12.1) |
| Sư phụ cao thủ Tier s | s | trường phái của sư phụ | là đệ tử, cả sau khi xuất sư |
| Nhà quý tộc (sinh ra hoặc có tước) / nhà từ Bá tước | 3 / 4 | mọi (nhà thuê thầy) | |
| Hoàng tộc | 5 | mọi | |
| Giáo hội | Devotion 40 / 75 / 95 → 2 / 3 / 4 | chỉ **nghề tín ngưỡng** của giáo phái mình | đang trong hàng tu sĩ |
| Kỳ ngộ (`cv_ring`, bước E) | 5 | trường phái của linh hồn trong nhẫn | |

Nguồn Tier 4–5 dạy theo trường phái; giáo hội dạy nghề tín ngưỡng chứ không dạy mọi nghề cho người làm Tu sĩ (người dùng chốt 16/10/2026). Sư phụ dạy tới đúng Tier của mình (bước A: Tier − 1): khi sư phụ chỉ dạy theo trường phái của mình, dạy tới Tier − 1 thì gần như mọi người Tier 2 đã max level kẹt vì thiếu người dạy Tier 3 (đo 16/10/2026: 11 / 12 người), Tier 3 trở lên chỉ còn 9% đời.

## 6. Sức mạnh

**Sức = chỉ số nhân vật + hiệu quả kỹ năng đang lắp + đồ + thiên phú + buff** (người dùng chốt 16/10/2026). Level, Tier nghề, mastery không cộng thẳng vào sức.

### 6.1. Chỉ số nhân vật

Sáu chỉ số như Skeleton Codex, để dùng lại thưởng chỉ số từng kỹ năng của nó:

| Chỉ số | Mã | Mastery thường cho chỉ số này |
|---|---|---|
| Lực | STR | Sword, Axe, Unarmed |
| Khéo | DEX | Bow, Crossbow, Firearm, Throwing, Dagger, Trap, Engineering |
| Nhanh | AGI | Stealth, Riding |
| Thể | VIT | Shield, Spear, Body |
| Pháp lực | INT | Fire, Frost, Lightning, Arcane, Alchemy, Construct |
| Tinh thần | WIL | Necromancy, Soul, Curse, Spirit, Taming |

- **Nền:** 5 mỗi chỉ số, chủng tộc lệch vài điểm (ví dụ người thú Lực +2, tiên tộc Pháp lực +2), ghi ở `G.RACES` của Vạn Kiếp.
- **Thưởng kỹ năng:** kỹ năng đạt bậc 5 cho thưởng vĩnh viễn, cộng dồn, không mất khi chuyển nghề hay tháo ra. Có trong `REWARD_BY_SKILL` thì dùng đúng số đó (thường +1, kỹ năng mạnh +2 hoặc thêm thưởng ở bậc 3); kỹ năng tạm: +1 chỉ số theo mastery.
- **Tác dụng khác** (đề xuất, làm sau): Thể giảm nguy cơ chết khi thua trận; Nhanh tăng cơ hội chạy thoát; Pháp lực, Tinh thần cộng vào thử thách nghề Huyền thuật, Tử thuật.

Mỗi trường phái có chỉ số chính và phụ (Chiến đấu: Lực, Thể; Tầm xa: Khéo, Nhanh; Bóng tối: Nhanh, Khéo; Huyền thuật: Pháp lực, Tinh thần; Tử thuật: Tinh thần, Pháp lực; Chế tác: Pháp lực, Khéo; Dã thú: Khéo, Thể; Võ thuật: Lực, Nhanh), theo nghề đang làm (nghề gốc: `S.path`).

```
điểm chỉ số = (2 × chính + phụ + Thể) / 4
sức chỉ số = (điểm chỉ số − 5) × 0,12
```

### 6.2. Lắp kỹ năng (người dùng chốt 16/10/2026)

Số chỗ lắp theo Tier nghề, như Skeleton Codex: nghề gốc 2, Tier 1 là 3, Tier 2 là 5, Tier 3 trở lên 6. Lắp được mọi kỹ năng đã học, của nghề nào cũng được, bậc 1 cũng được.

- **Mặc định tự lắp:** game lắp những kỹ năng có hiệu quả cao nhất, lắp lại mỗi khi có kỹ năng lên bậc, chuyển nghề, thêm chỗ lắp.
- **Người chơi sửa lúc nào cũng được:** bấm lắp / tháo trên thẻ kỹ năng. Sửa tay thì chuyển sang chế độ **tự chọn**: game không đổi lựa chọn của người chơi nữa, chỉ lấp chỗ trống mới mở (thêm chỗ khi lên Tier) bằng kỹ năng mạnh nhất chưa lắp. Nút **"Tự lắp lại"** quay về mặc định.
- Chế độ tự động (headless, sim, Tự sống) luôn tự lắp.

```
hiệu quả một kỹ năng = 0,1 × (Tier kỹ năng + 1) × bậc / 5
hiệu quả kỹ năng = tổng các kỹ năng đang lắp
```

Lý do để lắp khác mặc định có ở bước F, khi kỹ năng có tên và hiệu quả riêng (khắc họ quái, nguyên tố, hồi máu, chạy thoát…). Trước đó, sửa tay chủ yếu để thử.

### 6.3. Gộp

```
sức = 1,05 + sức chỉ số + hiệu quả kỹ năng
    + 0,05 × đồ (0–10) + thiên phú (G.tfx.pow)
    + buff: đồng đội gánh (S.flags.boost), dược tề (bước B)
    − thương tật, Sinh lực thấp, tuổi già, thiếu niên (như cũ)
```

Ước lượng ban đầu (nền 0,35): vừa vào Tier t thì sức ≈ t + 0,1 đến t + 0,6, ở max level ≈ t + 0,9 đến t + 1,6. Sim cho thấy người Tier thấp yếu quá (chết vì quái 16,8%), nên nền chốt 1,05 (mục 12, 12.1); số đo thật ở mục 12.1.

Bộ Xương mang mastery kiếp trước (`S.inherited`): trước cộng sức qua `mastery / 220`, giờ đổi thành rèn kỹ năng gắn mastery đó nhanh hơn (× 1,3).

## 7. Chuyển nghề, Tier

### 7.1. Điều kiện (người dùng chốt 16/10/2026)

Vào nghề kế tiếp D (Tier t + 1) khi đủ:

1. **Đạt max level của Tier hiện tại** (10t + 10): đã max cả 10 kỹ năng được nâng.
2. **Cặp gate của D nằm trong 10 kỹ năng được nâng** (nên đã max).
3. Mastery đạt `D.req` (chủng tộc ngoại lai +15).
4. Người dạy Tier ≥ t + 1 cho trường phái của D (mục 5).
5. Nghề tín ngưỡng: Devotion đạt ngưỡng của giáo phái (như cũ).

Đúng luật thư viện nghề (`shared/docs/00` mục 2): gate là cặp kỹ năng riêng của nghề đích. Thêm điều 1 (max level) là luật riêng của Vạn Kiếp.

### 7.2. Thử thách

Quyết định `promote` (giữ tên) liệt kê nghề đủ điều kiện, mỗi dòng ghi mastery, người dạy. Tỉ lệ qua:

```
p = 0,45 + 0,25 × (sức − Tier đích + 1) + (mastery chính − req) / 100 + Sinh lực / 400,  trong khoảng 0,15–0,95
```

"Mastery chính" là mục đầu của `D.req`. Trượt: mất 6 Sinh lực, 4 Tâm trạng, chờ một năm. Câu chữ lấy từ `D.trial`, dịch khi làm trang duyệt.

### 7.3. Tier (bỏ cảnh giới)

Người dùng chốt (16/10/2026) **bỏ cảnh giới** (Phàm nhân, Chiến sĩ cấp 1–9, Thánh Vực). Chỉ còn level 0–60 và Tier.

- **Tier của nhân vật = Tier nghề đang làm** (= ⌊level / 10⌋, trừ lúc vừa max level mà chưa chuyển). Dùng cho khu, quái (luật chung mục 1), thọ nguyên, địa vị.
- Hiện: "Kiếm Sĩ · Tier 2 · Level 27".
- Bỏ quyết định `cv_saint`, `S.flags.saint`, `G.rankOf`, `G.rankName`, `G.realmName`, `G.isCaster`. Level 60 là đỉnh.
- `07` mục 4.3 (địa vị) ghi theo cảnh giới: đọc "cấp r" thành Tier ⌈r / 2⌉. Ví dụ "quan tỉnh cần cấp 3" thành "cần Tier 2", "Công tước cấp 5" thành "Tier 3". Bước B viết lại thẳng theo Tier.

### 7.4. Bị kẹt

Max level mà trong 10 kỹ năng được nâng không có trọn cặp gate của nghề kế tiếp nào: **kẹt ở Tier đó**, không có cách gỡ (người dùng chốt). Thiếu mastery, thiếu người dạy, trượt thử thách thì chỉ là chờ, gỡ được.

Người kẹt vẫn có việc làm: học bậc 1 các kỹ năng còn lại để có thêm lựa chọn lắp; điểm rèn sau đó chỉ tăng mastery (tay nghề, thu nhập, thử thách nếu sau này gỡ được); đồ, thiên phú, buff vẫn tăng sức. Nghề cuối đường (Tier 5, hay nghề không còn nghề kế nào vào được) là kẹt tự nhiên.

Chế độ tự động luôn chọn cặp gate trước (mục 4.1) nên gần như không tự làm mình kẹt; người chơi chọn tay thì có thể. Nếu muốn có lối thoát hiếm (kỳ ngộ tẩy tủy, chọn lại một chỗ nâng), làm ở bước E.

### 7.5. Cách hiện cho người chơi

- Thẻ nhân vật: nghề, Tier, level (vd "Level 27 / 30"); sáu chỉ số; danh sách 12 kỹ năng của nghề (bậc, được nâng hay chỉ bậc 1, cặp gate của nghề nào, đang lắp hay không, nút lắp / tháo); chỗ nâng còn lại (vd "Nâng 7 / 10"); người dạy (nguồn, Tier, trường phái).
- Nhật ký: "Kỹ năng 2 của Kiếm Sĩ đạt bậc 5. Lực +1. Level 27." Chạm max level: "Level 30, đỉnh của Tier 2. Có thể thử vào Kiếm Hào." hoặc "… Không còn đường lên nghề Tier 3."

## 8. Một đời mẫu

Người, nghề gốc Nông Dân, Lục căn, tự học:

1. 12–17 tuổi: luyện ngoài giờ. Nông Dân có 12 kỹ năng Tier 0, trong đó cặp gate vào Chiến Binh (`cracked_slash`, `brace`), Cung Thủ, Đạo Tặc… Chọn nâng cặp gate Chiến Binh trước, rồi 8 kỹ năng khác (tự động giữ thêm cặp gate Cung Thủ). Max đủ 10: **Level 10**. Sword ~10. Thử Weapon initiation, vào Chiến Binh, Tier 1.
2. 18–30: 12 kỹ năng của Chiến Binh. Chọn nâng `rough_three_cut`, `sword_cleave` (gate Kiếm Sĩ), `shield_tap` (gate Vệ Binh) và 7 cái khác. Level lên dần 11 → 20. Sword 35, Shield thấp: chỉ Kiếm Sĩ mở.
3. Level 20 nhưng vào Kiếm Sĩ (Tier 2) cần người dạy Tier 2. Tự học thì chờ: học bậc 1 hai kỹ năng còn lại, điểm rèn chỉ tăng Sword. Gia nhập đoàn lính đánh thuê năm 31 tuổi → có người dạy → thử Duel trial, qua. Tier 2, Level 20.
4. Kiếm Sĩ: nâng 10 kỹ năng, Level 30. Muốn vào Kiếm Hào (Tier 3) cần học viện cao cấp, đệ tử cao thủ Tier 4, hoặc nhà quý tộc mướn thầy.

Nếu ở bước 2 người chơi chọn tay 10 kỹ năng mà bỏ `sword_cleave` lẫn `shield_tap`, Level 20 sẽ là đỉnh đời: kẹt ở Tier 1.

## 9. Cân bằng, đo

Như `TIEN_DO.md` mục 5: 1000 đời thế giới `can-bang`, thử thế giới động, 100 thế giới. Mục tiêu:

| Đo | Mục tiêu |
|---|---|
| Tháp Tier cuối đời (`07` mục 6) | Tier 0 ~35%, 1 ~30%, 2 ~18%, 3 ~10%, 4 ~5%, 5 ~2% |
| **Mới:** level trong mỗi Tier | không dồn hết ở max level (người chờ thầy, chờ thử thách ≤ 50% Tier đó) |
| **Mới:** sức khi vừa vào Tier t / ở max level | t + 0,1–0,6 / t + 0,9–1,6 |
| **Mới:** kẹt vĩnh viễn ở chế độ tự động | ≈ 0 ngoài nghề cuối đường |
| Trận vượt Tier + 1 | 0 |
| Trỗi dậy, chết vì quái | ~20%, ~10% |
| Mastery khi max level | ≈ `req` nghề kế tiếp theo hướng đi (± 5) |

Núm: `G.SK_COST`, hệ số 0,12 (chỉ số), 0,1 (hiệu quả), hệ số mastery theo điểm rèn, hệ số tự mò 0,4, `G.CULT.base`.

## 10. Việc trong mã

| File | Đổi |
|---|---|
| `js/cult.js` | `G.jobSkills(job)` (12 kỹ năng, thẻ mastery, chỉ số, Tier, kỹ năng gate của nghề nào; dựng một lần lúc `G.init` từ `gate`, `req` của thư viện và `REWARD_BY_SKILL`); `S.sk` dạng `{ id: bậc }`, `S.up` (kỹ năng được nâng theo Tier); `G.lvOf` = số kỹ năng được nâng đã max; `G.tierOf(S)` = Tier nghề; `G.statsOf(S)`, `G.loadout(S)` (đọc `S.equip`, `S.equipAuto`), `G.autoEquip(S)`, `G.skillPow(S)`; `G.TEACHERS`, `G.teachOf(S, school)`; `G.skTarget` / `G.skTrain` theo mục 4.1; quyết định `cv_learn`; `G.skMigrate` quy bản lưu bước A (dồn số kỹ năng max vào danh sách các nghề trong `S.jobHist`, ưu tiên cặp gate đã đi). Bỏ `G.SK_SLOTS`, `G.lvCap`, `G.lvPow`, `G.teachCap`, cảnh giới, `cv_saint`. |
| `js/life.js` | `power` theo mục 6.3; `trainYear`, `hunt`, `workYear` gọi `addXp` không nhân level, bỏ đoán mastery; `G.nextJobs` đọc điều kiện mục 7.1; `ctier` = Tier nghề. |
| `js/events.js` | `promote`: điều kiện, tỉ lệ mục 7.2. |
| `js/talent.js` | `tal_break` (bình cảnh căn cốt) mở ở mỗi lần lên Tier nghề. |
| `data/world.js` | `G.RACES[r].stat`, bảng mastery → chỉ số, trường phái → chỉ số chính / phụ. |
| `js/ui.js` | sáu chỉ số; thẻ kỹ năng có nút lắp / tháo, "Tự lắp lại"; "Nâng a / 10", "Level a / b", người dạy; bỏ chữ cảnh giới; bản lưu `S.v = 3`. |
| `sim.html` | bảng Tier (thay bảng Cảnh giới): phân bố level trong Tier, sức lúc vào Tier và ở max level, số đời kẹt, mastery lúc chuyển nghề; nạp `REWARD_BY_SKILL`. |
| `review/content-*.html` | tab **Sức mạnh**: danh sách kỹ năng theo nghề (gate của nghề nào), bảng người dạy, chỉ số, bảng Tier / level; quyết định `cv_learn`, `promote` (luật `CLAUDE.md`: hệ mới có tab trong cùng lần làm). |
| `shared/docs/00_Luat_chung.md` mục 2 | ghi Vạn Kiếp thêm điều kiện max level (10 kỹ năng được nâng mỗi Tier). |
| `docs/07`, `TIEN_DO.md`, `README.md` | bỏ cảnh giới, trỏ sang file này, ghi kết quả đo. |

`REWARD_BY_SKILL` đang nằm trong `platform/skill-system.js` (109K, kèm mã giao diện). Nên tách ra `shared/` (ví dụ `shared/skills.js`) để cả hai game đọc; việc này đụng Skeleton Codex nên kiểm lại `platform/index.html`.

Làm trước bước B của `07`, vì bước B (sàn thu nhập, chức quan, kế tước) đọc Tier.

## 11. Người dùng đã chốt (16/10/2026)

Vòng 1:

1. Mỗi nghề có danh sách kỹ năng đặc trưng; chuyển nghề khi đạt max level của Tier (cùng mastery, người dạy, thử thách).
2. **Sức** = chỉ số nhân vật + hiệu quả kỹ năng + đồ + thiên phú + buff.
3. **Mất người dạy:** rèn chậm × 0,4.
4. **Người dạy Tier 4–5 chia theo trường phái.**

Vòng 2 (thay phần cấp, gate của vòng 1):

5. **10 level là 1 Tier; mỗi kỹ năng max = 1 level.** Level 0–60.
6. **Mỗi Tier chỉ 10 kỹ năng được nâng**; kỹ năng khác chỉ học tới bậc 1.
7. **Chuyển nghề:** đạt max level của Tier và cặp gate của nghề đích nằm trong 10 kỹ năng được nâng (đã max); không có thì kẹt ở Tier đó.
8. **Lắp kỹ năng:** mặc định tự lắp kỹ năng mạnh nhất, người chơi sửa lúc nào cũng được.
9. **Bỏ cảnh giới** (Phàm nhân, cấp 1–9, Thánh Vực).

Còn mở (Claude đề xuất, chưa hỏi): danh sách 12 kỹ năng mỗi nghề (mục 3.1); sáu chỉ số theo Skeleton Codex và tên tiếng Việt (mục 6.1); kẹt vĩnh viễn không gỡ được hay có lối thoát hiếm ở bước E (mục 7.4); tách `REWARD_BY_SKILL` sang `shared/` (mục 10).

## 12. Kết quả làm vào mã (16/10/2026)

Làm theo mục 10: `js/cult.js` viết lại; `life.js` (`power`, `trainYear`, `G.nextJobs`, `ctier`), `events.js` (`promote`, `G.promoteP`), `talent.js` (bình cảnh theo Tier nghề), `data/world.js` (`stat` của chủng tộc), `ui.js` + `index.html` + `style.css` (sáu chỉ số, danh sách kỹ năng nghề, nút Lắp / Tháo / Tự lắp lại, "Level a / b"), `sim.html` (bảng Tier cuối đời thay bảng Cảnh giới); ngưỡng level cũ ở `edu.js`, `org.js`, `realmev.js`, `systems.js`, `noble.js`, `dynamic.js`, `travel.js` quy sang thang 0–60. Thưởng chỉ số tách sang `shared/skills.js`, Skeleton Codex đọc từ đó (đã mở `platform/index.html` kiểm: thưởng hiện đúng). Trang Duyệt Nội Dung có tab Sức mạnh.

Số chốt bằng sim: `G.SK_COST` = 220 / 450 / 900 / 1 500 / 2 200 / 3 000; sức nền 0,95 (thay 0,35 của mục 6.3: bỏ Tier nghề và mastery khỏi sức làm người Tier thấp yếu đi, chết vì quái lên 16,8%); `G.CULT.mPt` = 0,004; sư phụ dạy tới đúng Tier của mình (mục 5).

1000 đời, thế giới `can-bang`, chế độ tự động:

| Đo | Kết quả | Mục tiêu |
|---|---|---|
| Trận vượt Tier + 1 | 0 (64 887 trận) | 0 |
| Trỗi dậy | 20,6% | ~20% |
| Chết vì quái (mọi cái chết) | 11,8% | ~10% (bước A 10,1%) |
| Kẹt vĩnh viễn ở chế độ tự động | 0% | ≈ 0 |
| 1000 đời headless | 150 giây | (bước A ~103 giây) |

Tháp Tier cuối đời, 887 đời sống tới tuổi trưởng thành:

| Tier | Đời | Mục tiêu | Level TB | Ở max level | Sức lúc vào Tier | Sức ở max level | Mastery − req lúc max |
|---|---|---|---|---|---|---|---|
| 0 | 31,2% | 35% | 6,5 | 10% | 0,87 | 1,25 | +12 |
| 1 | 35,6% | 30% | 13,8 | 10% | 1,37 | 2,16 | +15 |
| 2 | 20,5% | 18% | 27,9 | 73% | 2,59 | 3,62 | +23 |
| 3 | 6,4% | 10% | 37,1 | 61% | 3,93 | 5,20 | +23 |
| 4 | 4,5% | 5% | 49,4 | 90% | 5,30 | 6,50 | +10 |
| 5 | 1,7% | 2% | 59,5 | 93% | 6,66 | 7,91 | |

Người dạy lúc chết (theo trường phái đang theo): tự học 50%, Tier 2 27%, Tier 3 11%, Tier 4 8%, Tier 5 4%.

Chỗ lệch:

- **Tier 3 thiếu, Tier 2 dư.** 73% người Tier 2 đã max level mà chưa lên được, gần như tất cả vì thiếu người dạy Tier 3 đúng trường phái. Núm: thêm nguồn dạy Tier 3 (sĩ quan quân đội, đoàn trưởng lính đánh thuê, Hiệp Hội hạng cao khi danh vọng phân biệt được người giỏi), hoặc học viện cao cấp nhận nhiều hơn.
- **Chết vì quái 11,8%**, trên mục tiêu một chút; mạo hiểm giả chết vì quái 42%. Nâng sức nền tiếp thì Tier cao càng mạnh hơn mục tiêu.
- **Sức ở Tier cao vượt mục tiêu** (vào Tier 5 ≈ 6,7). Không phá luật Tier vì quái vẫn bị chặn ở Tier + 1; nếu muốn sát hơn thì giảm `skillPow` theo Tier.
- **Mastery dư +10 đến +23** so với yêu cầu nghề kế tiếp lúc max level (mục tiêu ± 5): ngoài kỹ năng, săn quái và sinh kế cũng cho mastery. Không hại gì ngoài làm thử thách chuyển nghề dễ qua hơn.
- **Chậm hơn ~45%** (150 so với 103 giây): `G.statsOf` và `G.autoEquip` chạy lại mỗi trận. Nếu cần thì cache theo phiên bản `S.sk`.

### 12.1. Cân lại Tier 3 (16/10/2026, lần 2)

Thêm hai nguồn dạy Tier 3 (mục 5): **chức trong hội** từ quản sự trở lên, dạy theo loại hội; **quan chức nhà nước** (Quan tỉnh, Đại thần). Thử cả bậc thăng tiến `G.PROMO` từ bậc 2, rồi từ bậc 3: quá dễ đạt, chiếm 12 / 18 người lên Tier 3 (9 người chỉ nhờ nguồn này), Tier 3 vọt lên 14–16%, nên bỏ. Kèm theo: sức nền 0,95 → 1,05; giá kỹ năng Tier 0 220 → 260 (giữ Tier 0 gần 35%).

1000 đời, thế giới `can-bang`, chế độ tự động:

| Đo | Lần 1 (mục 12) | Lần 2 | Mục tiêu |
|---|---|---|---|
| Trận vượt Tier + 1 | 0 | 0 (72 796 trận) | 0 |
| Trỗi dậy | 20,6% | 19,5% | ~20% |
| Chết vì quái | 11,8% | 9,2% | ~10% |
| Kẹt vĩnh viễn | 0% | 0% | ≈ 0 |
| Tier 0 / 1 / 2 | 31,2 / 35,6 / 20,5% | 36,7 / 28,0 / 17,6% | 35 / 30 / 18% |
| Tier 3 / 4 / 5 | 6,4 / 4,5 / 1,7% | 11,4 / 4,7 / 1,6% | 10 / 5 / 2% |

Sức lúc vào Tier 1–5: 1,48 / 2,72 / 4,05 / 5,39 / 6,74; ở max level: 1,34 (Tier 0), 2,28, 3,73, 5,31, 6,59, 7,95. Mạo hiểm giả chết vì quái 32% (lần 1: 42%). Người Tier 2 đã max level mà chưa lên: 76% (vẫn chủ yếu vì người dạy; đó là chỗ nghẽn có chủ ý của Tier 3). Mastery dư so với yêu cầu vẫn +10 đến +23. 1000 đời mất 117–166 giây tùy lần (tab chạy nền thì chậm hơn).

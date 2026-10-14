# 1 in 8 Billion — cách một game mô phỏng cuộc đời bằng số liệu thật

**Ngày:** 14/10/2026 · **Nguồn:** https://1in8b.life/en/ (đọc mã client-side của trang, bản đang chạy ngày 14/10/2026) · **Trạng thái:** ghi chép nghiên cứu, chưa áp vào dự án.

Người chơi bấm một nút và được sinh ra thành một trong số những đứa trẻ đang chào đời trên thế giới. Nước sinh, giới tính, tôn giáo, gia cảnh đều bốc ngẫu nhiên theo đúng tỷ lệ ngoài đời. Sau đó cuộc đời chạy theo thời gian thực, mỗi năm vài chục giây, xen vài sự kiện và vài lựa chọn, cho tới khi nhân vật chết. Dữ liệu lấy từ 172 nước. Người chơi sinh ở Nigeria thì có nguy cơ chết vì sốt rét trước 5 tuổi đúng bằng một đứa trẻ Nigeria thật.

File này mô tả cách trang đó làm, không chép mã. Các đoạn mã bên dưới là giả mã viết lại để giải thích.

## 1. Cách đóng gói

- Toàn bộ game nằm trong **một file HTML khoảng 4 MB**, gồm một thẻ `<script>` inline dài chừng 23.600 dòng. Mã không minify, tên hàm đọc được (`newLife`, `lifeTable`, `deathProb`, `endYear`).
- Dữ liệu nhúng thẳng vào mã: mảng `COUNTRIES` (172 nước), bảng nguyên nhân tử vong theo vùng và tuổi, khoảng 500 sự kiện, vài trăm quyết định, danh sách nghề, tên người, thành phố.
- Văn bản gốc viết bằng tiếng Hàn trong template tag `` L`...` ``. Hàm `L` tra bảng dịch `I18N_T` (1,3 MB) để ra tiếng Anh, Nhật, Trung. Người viết chỉ soạn một ngôn ngữ trong logic, bản dịch tách riêng.
- Mô phỏng chạy hoàn toàn trên trình duyệt. Server chỉ phục vụ phần xã hội: đăng bài, trang tưởng niệm người đã "chết", reaction, analytics.

## 2. Mô hình tổng thể

Mọi thứ về một cuộc đời nằm trong một object trạng thái duy nhất `S`. Các hàm đọc và ghi thẳng vào `S`, không có class hay ECS.

```
newLife()          bốc nước, giới tính, gia đình, tầng lớp → tạo S
  └─ planYear()    xếp sự kiện + quyết định của năm vào hàng đợi
       └─ tick(dt) thời gian trôi; tới mốc nào thì bắn sự kiện mốc đó
            └─ endYear()  cập nhật chỉ số, chạy ~50 hàm xxxYear(), tung xúc xắc tử vong
                 ├─ chết → die() → màn kết thúc
                 └─ sống → S.age++ → planYear() lại
```

`S` chứa: tuổi, giới tính, nước sinh và nước đang ở, tầng lớp `q` (1–5), thành thị hay nông thôn, bốn chỉ số (`hl` sức khỏe, `h` hạnh phúc, `so` quan hệ, `sm` hiểu biết), tiền, nghề, phân vị thu nhập `pct`, trường học, gia đình (bố mẹ, anh chị em, vợ chồng, con), bệnh mạn tính `conds`, và một túi `flags` chứa hàng trăm cờ trạng thái lặt vặt.

## 3. Dữ liệu quốc gia

Mỗi nước là một bản ghi phẳng, khoảng 40 trường. Một số trường chính:

| Trường | Nghĩa | Dùng vào đâu |
|---|---|---|
| `b`, `pop` | số ca sinh mỗi năm, dân số | trọng số bốc nước sinh |
| `p` | vùng (ssa, sa, eap, lac, mena, eca, hi) | bảng nguyên nhân chết, hệ số theo vùng |
| `le`, `gap` | tuổi thọ trung bình, chênh lệch nữ − nam | dựng bảng sống |
| `u5`, `im` | tử vong dưới 5 tuổi, tử vong sơ sinh (‰) | bảng sống phần trẻ em, tỷ lệ tiêm chủng, bệnh trẻ em |
| `ppp`, `gi` | thu nhập bình quân (PPP), hệ số Gini | phân phối thu nhập |
| `tfr` | số con trung bình mỗi phụ nữ | số anh chị em, tuổi mẹ khi sinh |
| `rel` | tỷ lệ tôn giáo, dạng `"C60,M30,..."` | bốc tôn giáo |
| `hiv`, `mal`, `hom`, `road`, `war` | HIV, sốt rét, giết người, tai nạn giao thông, chiến tranh | trọng số nguyên nhân chết |
| `urb`, `agr`, `net`, `eys` | đô thị hóa, lao động nông nghiệp, internet, số năm đi học kỳ vọng | thành thị/nông thôn, nghề, học vấn |

Thiết kế ở đây đáng học: **dữ liệu thật chỉ là vài chục con số mỗi nước**. Mọi chi tiết khác (khả năng được đi học, bệnh nào hay gặp, nghề nào phổ biến) đều được suy ra từ mấy con số đó bằng công thức, không phải nhập tay cho từng nước.

## 4. Lúc sinh

`newLife()` bốc lần lượt, bước sau phụ thuộc bước trước:

1. **Nước sinh:** `wpick` (bốc theo trọng số) trên số ca sinh. Trong dữ liệu, Ấn Độ có khoảng 23,2 triệu ca mỗi năm, Nigeria 7,5 triệu, nên khả năng sinh ở Ấn Độ gấp ba Nigeria, đúng như thật.
2. **Giới tính:** theo tỷ lệ giới tính khi sinh của nước đó. Trung Quốc và Ấn Độ có hệ số riêng.
3. **Tôn giáo, dân tộc, đẳng cấp, hoàng gia.** Dân tộc và đẳng cấp ảnh hưởng tới tầng lớp `q`.
4. **Thành thị hay nông thôn:** tỷ lệ đô thị của nước, điều chỉnh theo `q` bằng odds ratio. Nhà khá giả dễ ở thành phố hơn, và ở nước nghèo hiệu ứng này mạnh hơn.
5. **Tên:** chọn theo cụm văn hóa của tôn giáo và dân tộc, không chỉ theo nước.
6. **Gia đình:** tuổi mẹ quanh tuổi kết hôn trung bình cộng nhiễu, tuổi bố = tuổi mẹ + khoảng cách tuổi vợ chồng của nước đó, số con trong nhà theo phân phối Poisson với trung bình `tfr`. Có xác suất bố vắng mặt theo vùng.
7. **Các "lá bài" hiếm:** khuyết tật bẩm sinh, nhiễm HIV từ mẹ, con nuôi, gia đình giàu bất thường.

Mẹo đáng chú ý: **odds ratio** được dùng ở khắp nơi để chỉnh một xác suất nền theo hoàn cảnh mà không bao giờ vượt quá 0 hoặc 1.

```
odds(p, or) = p·or / (1 − p + p·or)
# p = xác suất nền của nước, or = hệ số hoàn cảnh (>1 tăng, <1 giảm)
```

## 5. Bảng sống: biến tuổi thọ trung bình thành xác suất chết từng tuổi

Đây là phần thông minh nhất. Dữ liệu chỉ có tuổi thọ trung bình `le`, tử vong sơ sinh `im` và dưới 5 tuổi `u5`. Game cần xác suất chết `q[x]` cho từng tuổi 0–110.

- Tuổi 0 lấy thẳng từ `im`. Tuổi 1–4 chia phần còn lại của `u5` theo tỷ lệ cố định giảm dần.
- Tuổi 5–14 dùng một hằng số nhỏ theo nước.
- Từ 15 tuổi trở lên dùng **luật Gompertz**: nguy cơ chết tăng theo hàm mũ của tuổi, `μ(x) = A + B·e^(g·x)`. Trên 100 tuổi có trần riêng.
- Hệ số `B` chưa biết. Game **tìm nhị phân** `B` (50 vòng, trên thang log) sao cho tuổi thọ kỳ vọng tính từ bảng khớp đúng `le` của nước đó, tách riêng cho nam và nữ.

Kết quả lưu cache theo nước và giới tính. Từ bảng này, game còn nói được những câu như "trong số con trai sinh cùng năm ở nước bạn, khoảng X% vẫn còn sống" ở các mốc 1, 5, 15, 30, 50… tuổi.

## 6. Thu nhập: một con số percentile

Thu nhập trong nước được coi là **phân phối log-normal**. Độ phân tán σ suy ra từ Gini theo công thức chuẩn `σ = √2 · Φ⁻¹((G+1)/2)`. Một số vùng được cộng thêm Gini vì số liệu chính thức thường thấp hơn thực tế.

Nhân vật không lưu thu nhập tuyệt đối mà lưu **phân vị `pct`** (0–1) trong nước mình:

```
incomeAt(nước, pct) = trung_vị_nước · exp(σ·Φ⁻¹(pct) − σ²/2)
```

Thăng chức hay đổi nghề là dịch `pct`. Mỗi nghề có một khoảng `[lo, hi]` phân vị mà nó thường rơi vào (nông dân tự cung 0,03–0,32). Di cư sang nước khác thì cùng `pct` cho ra số tiền khác hẳn. Chỉ một con số mà mô tả được cả vị trí xã hội lẫn thu nhập. Hàm `Φ⁻¹` dùng xấp xỉ đa thức Acklam, `Φ` dùng xấp xỉ Abramowitz–Stegun.

## 7. Vòng một năm

### 7.1 Xếp lịch (`planYear`)

Đầu mỗi năm, game chọn 2–3 sự kiện và tối đa 2 quyết định, rồi rải chúng lên trục thời gian 0→1 của năm (ví dụ sự kiện ở 0,15 và 0,55, quyết định ở 0,35). Sinh nhật mốc được đặt ở đầu năm.

### 7.2 Thời gian trôi (`tick`)

Mỗi frame cộng thời gian vào `S.t`. Khi `S.t` vượt mốc của phần tử đầu hàng đợi thì bắn nó. Quyết định làm game dừng (`S.pending`) cho tới khi người chơi chọn. `S.t` chạm 1 thì gọi `endYear()`.

Độ dài một năm tính sao cho **cả đời chơi khoảng 60 phút**: `yearSec = 60 phút / max(tuổi_thọ_kỳ_vọng, 60)`, kẹp trong 12–120 giây.

### 7.3 Chốt năm (`endYear`)

1. **Focus:** trong năm, người chơi chọn mình đang dồn sức vào đâu (học, chơi, thể thao, đi làm, gia đình, cân bằng…). Game ghi số giây ở mỗi focus, cuối năm cộng hiệu ứng theo tỷ lệ thời gian. Ví dụ "đi làm" tăng thu nhập nhưng trừ sức khỏe và quan hệ.
2. **Chỉ số kéo về mục tiêu.** Mỗi chỉ số có một giá trị mục tiêu tính từ hoàn cảnh: sức khỏe theo tuổi, hút thuốc, bệnh, tầng lớp; hạnh phúc theo thu nhập tương đối, quan hệ, nợ. Chỉ số trôi dần về mục tiêu (khoảng 25% khoảng cách mỗi năm) thay vì nhảy thẳng. Nhờ vậy chỉ số có quán tính, một sự kiện xấu để lại vết vài năm.
3. **Khoảng 50 hàm `xxxYear()`** chạy nối tiếp: học hành, tài chính, gia đình, thú cưng, tôn giáo, bệnh tật, nghiện, pháp luật, di cư, xổ số, sự kiện hiếm… Mỗi hệ con tự quản lý cờ của mình trong `S.flags`, và sau mỗi nhóm có kiểm tra "đã chết chưa" để dừng sớm.
4. **Ghi lịch sử:** đẩy một dòng tóm tắt năm vào `S.years` (tuổi, bốn chỉ số, tài sản ròng, thu nhập, nơi ở). Dòng này dùng để vẽ biểu đồ cuộc đời ở cuối game.
5. **Tung xúc xắc tử vong** (mục 9).

## 8. Sự kiện và quyết định

### 8.1 Sự kiện: dữ liệu có kèm hàm

Mỗi sự kiện là một object:

```
{ id, a: [tuổi_min, tuổi_max], c: () => điều_kiện, w: trọng_số_hoặc_hàm,
  rep: có_lặp_không, gap: số_năm_tối_thiểu_giữa_hai_lần,
  run: () => { đổi_trạng_thái; return { t: văn_bản, k: 'bad'|'big'|..., f: dữ_kiện_thật } } }
```

Chọn sự kiện: lọc theo tuổi, điều kiện, khoảng cách lặp và bối cảnh (đang ở tù, đang du học, đang đi nghĩa vụ quân sự thì loại các sự kiện không hợp), rồi bốc theo trọng số. Sự kiện vừa xảy ra gần đây bị nhân trọng số 0,08, hoặc 0,5 nếu là loại được phép lặp.

Trọng số và kết quả đều lấy từ dữ liệu nước. Sự kiện "bệnh trẻ em" có xác suất tăng theo `u5` và giảm theo tầng lớp. Bệnh cụ thể bốc giữa tiêu chảy, viêm phổi, sốt rét (chỉ khi nước có sốt rét), sởi (chỉ khi chưa tiêm). Kết cục nhẹ hay nặng tùy gia cảnh.

**Mỗi sự kiện kèm một dòng dữ kiện thật** (`f`) có trích nguồn, kiểu "năm 2023, khoảng 14,5 triệu trẻ chưa được tiêm mũi nào (WHO·UNICEF)". Game kể chuyện và dạy số liệu cùng lúc.

### 8.2 Quyết định: build + apply

```
{ build: () => { title, body, fact, choices: [{ k, label, sub }] },
  apply: (k) => { đổi_trạng_thái; return văn_bản_kết_quả } }
```

`build` dựng nội dung theo hoàn cảnh hiện tại. Cùng một quyết định "đòi đi học", nhưng đứa trẻ khuyết tật vận động sẽ thấy câu chữ khác. `apply` thường tung xúc xắc thay vì cho kết quả chắc chắn: chọn "xin bố mẹ cho đi học" thành công với xác suất `0,25 + 0,1·q + quan_hệ/400`.

Quyết định không bốc ngẫu nhiên như sự kiện. `scheduledDecisions()` sinh chúng từ trạng thái: tới tuổi chọn ngành, vừa sinh con nên hỏi chuyện nghỉ thai sản, thất nghiệp lâu thì hỏi chuyện nghỉ hưu. Hệ con nào muốn hỏi người chơi thì bật một cờ hàng đợi (`kidUniQ`, `divQ`, `careQ`), năm sau nó thành quyết định.

## 9. Cái chết

### 9.1 Xác suất chết trong năm

```
q_nền = bảng_sống[nước_đang_ở][giới][tuổi]
m = 1
m *= hệ_số_sức_khỏe       # hl thấp hơn kỳ vọng theo tuổi thì tăng
m *= hệ_số_tầng_lớp       # trẻ em theo q của nhà, người lớn theo pct thu nhập
m *= hút_thuốc, HIV, bệnh mạn chưa chữa, nghiện rượu, ma túy, tù, chiến tranh, sống một mình…
nếu tuổi ≥ 85: m = m^(giảm dần)   # già rồi thì lối sống ít tạo khác biệt
xác_suất = 1 − (1 − q_nền)^clamp(m, 0.25, 9)
```

Hai điểm đáng học:

- **Hệ số tầng lớp được chuẩn hóa** sao cho trung bình năm tầng lớp bằng 1. Nhờ vậy tuổi thọ trung bình của cả nước vẫn khớp số liệu dù người nghèo chết sớm hơn người giàu.
- Dùng `1 − (1−q)^m` thay vì `q·m` để xác suất không bao giờ vượt 1, và `m` được kẹp trong khoảng 0,25–9.

### 9.2 Chết vì gì

Có một bảng nền: **vùng × nhóm tuổi → trọng số mỗi nguyên nhân** (khoảng 30 nguyên nhân: bệnh sơ sinh, viêm phổi, tiêu chảy, sốt rét, lao, tim, đột quỵ, ung thư, tai nạn giao thông, bị giết, chiến tranh, tự tử…). Trọng số được chỉnh ba lớp:

1. **Theo nước:** sốt rét nhân với chỉ số sốt rét của nước, bị giết nhân với tỷ lệ giết người so với mức tham chiếu của vùng. Đông Á được giảm bệnh tim, tăng ung thư.
2. **Theo giới:** nữ trẻ ít bị giết và ít tai nạn giao thông hơn.
3. **Theo cá nhân:** hút thuốc tăng ung thư, phổi tắc nghẽn mạn tính (COPD) và tim; tiểu đường tăng biến chứng thận; nghề có `risk` riêng (ngư dân ×3 đuối nước); đi xe máy ×1,6 tai nạn giao thông.

Một số nguyên nhân như ung thư không giết ngay. Chúng mở một giai đoạn "bệnh giai đoạn cuối" kéo dài vài năm, có lựa chọn điều trị. Màn kết thúc ghi rõ nguyên nhân chiếm bao nhiêu phần trăm số ca tử vong ở độ tuổi đó tại nước đó.

## 10. Các cơ chế phụ đáng học

- **RNG có seed.** Toàn bộ code gọi `rnd()` thay vì `Math.random()`. `setRng` thay được nguồn ngẫu nhiên bằng một bộ sinh có seed (hash chuỗi + mulberry32). Cùng seed thì ra cùng cuộc đời, dùng được cho chia sẻ, replay và test.
- **Những đứa trẻ sinh cùng giây.** Lúc bắt đầu, game sinh thêm 4 cuộc đời khác và **chạy headless tới chết** trong vài mili giây: tắt mọi hook giao diện, tua `tick` liên tục, tự chọn đáp án cho mọi quyết định bằng `autoChoice`. Trong khi người chơi sống, tới đúng tuổi mất của từng đứa, game báo rằng đứa trẻ sinh cùng giây ở nước nào đó đã qua đời, kèm nguyên nhân. Cũng chính cơ chế này là công cụ cân bằng: chạy hàng nghìn đời tự động rồi xem phân phối tuổi thọ, thu nhập, nguyên nhân chết.
- **Chế độ thời đại.** Có thể chọn sinh vào năm cũ (ví dụ 1960). Hàm `eraAt(nước, năm)` lấy bản ghi nước hiện tại rồi nội suy lại từng trường theo chuỗi số liệu lịch sử: tuổi thọ, `u5`, `tfr`, GDP, đô thị hóa, HIV, chiến tranh. Mọi công thức khác giữ nguyên. Thêm một chiều "năm" mà gần như không phải sửa logic.
- **Hook tách giao diện khỏi logic.** Logic chỉ gọi `HOOK.log / decision / year / death`. Giao diện gắn vào hook. Chạy headless thì thay hook bằng hàm rỗng.
- **Kiểm tra sức khỏe trạng thái.** Cuối mỗi năm có hàm quét các chỉ số, phát hiện `NaN` thì báo lỗi ngay thay vì để lan.

## 11. Áp vào dự án của mình

Những ý chuyển được sang một game RPG, không phụ thuộc đề tài:

| Ý tưởng | Ở 1in8b | Có thể dùng thế nào |
|---|---|---|
| Ít số liệu gốc, nhiều công thức suy ra | 40 trường mỗi nước sinh ra mọi xác suất | Mỗi vùng hay quốc gia trong game chỉ khai vài chỉ số (giàu nghèo, nguy hiểm, mức phép thuật); bảng sinh quái, giá đồ, sự kiện đều suy ra từ đó |
| Sự kiện = dữ liệu + điều kiện + trọng số + hàm `run` | khoảng 500 sự kiện trong một mảng | Hệ sự kiện ngẫu nhiên trên map hoặc ở thành trấn, thêm sự kiện không phải sửa vòng lặp chính |
| Trọng số giảm khi vừa xảy ra | ×0,08 nếu nằm trong `recent` | Chống lặp sự kiện, lặp drop, lặp hội thoại |
| Odds ratio để chỉnh xác suất | ở khắp nơi | Chỉnh tỷ lệ rơi đồ, tỷ lệ chí mạng theo bối cảnh mà không cần kẹp tay |
| Phân vị thay cho giá trị tuyệt đối | `pct` thu nhập | Xếp hạng danh vọng hoặc độ hiếm trong một vùng, đổi vùng thì giá trị tuyệt đối tự đổi |
| Chỉ số trôi về mục tiêu | `st += (target − st) · 0,25` | Chỉ số tâm trạng, danh tiếng, độ thân thiết có quán tính |
| Chạy headless để cân bằng | 4 đời tự động mỗi lần chơi | Mô phỏng hàng nghìn trận hoặc hàng nghìn lượt roll quái, in phân phối trước khi chỉnh số |
| RNG có seed, mọi chỗ gọi qua một hàm | `rnd()` + `setRng` | Replay, chia sẻ seed, test hồi quy cho cân bằng |

Thứ không nên bắt chước: `S.flags` chứa hàng trăm cờ đặt tên tắt (`kidUniQ`, `bizPt`, `ddHome`) và khoảng 50 hàm `xxxYear()` gọi theo thứ tự cố định. Ở quy mô 23.000 dòng, cách này đã khó theo dõi. Nếu làm hệ tương tự, nên cho mỗi hệ con khai báo trạng thái và thứ tự chạy của mình.

## 12. Lưu ý bản quyền

Mã, bảng dữ liệu đã xử lý và toàn bộ văn bản sự kiện là tác phẩm của tác giả trang 1in8b. Học cách làm thì được, **không chép mã, dữ liệu hay câu chữ** vào sản phẩm. Số liệu gốc (tuổi thọ, tử vong trẻ em, Gini, nguyên nhân tử vong) lấy được trực tiếp từ nguồn công khai: World Bank, WHO Global Health Estimates, UN World Population Prospects, UNDP HDR.

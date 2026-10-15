# Vạn Kiếp: tiến độ và việc tiếp theo

**Cập nhật:** 15/10/2026 · **Commit mới nhất của bản đồ V2:** `0891b93` (bước 7; bước 8 xong nhưng chưa commit) · **Đọc file này trước** khi được bảo "làm tiếp Vạn Kiếp".

Đang làm **bản đồ V2** theo `research/03_Thiet_ke_ban_do_Varen_V2.md` (thứ tự làm ở mục 12). Đã xong bước 1–8; **việc tiếp theo là bước 9: lập làng, lập nước**.

## 1. Đã xong

| Bước | Nội dung | Commit | Kết quả đo ghi ở |
|---|---|---|---|
| Thiết kế | research/02 (phương án đã chọn), 03 (thiết kế), 04 (50 mẫu quốc gia), 05 (thành phố, làng mạc), `data/names.js` | `58263c6` | |
| 1 | Khung 1200 × 900; độ cao, ẩm, nhiệt; sông, hồ; 7 đặc trưng ô; chế độ xem Địa hình | `c20548c` | 03 mục 2.2–2.4 |
| 2 | Quốc gia từ mẫu, kinh đô, lãnh thổ, mạng khu dân cư phân cấp, tỉnh, dân, tên; chế độ xem Chính trị; nút Thế giới mới | `c20548c` | 05 mục 14 |
| 3 | 4 tầng nguy hiểm (thêm vùng chết) theo độ hoang; trận theo ô + địa hình; chế độ xem Nguy hiểm | `7f5ec62` | 03 mục 3.6 |
| 4 | Công trình → nghề, sức khỏe, học; thuế, thái độ chủng tộc; 21/22 luật | `470d291` | 03 mục 5.6 |
| 5 | Đường, cầu, đèo; hành trình A*, trạm biên giới, hộ tống | `49666d9` | 03 mục 6.5 |
| 6 | 7 vùng biển × 4 tầng, 8 loài biển, bến và 3 loại tàu, hải trình A*, đi tàu (bão, đắm tàu, cướp biển, cách ly, thuế cảng), nghề biển theo tầng, đảo Hải Xà tách hẳn; chế độ xem Biển | `6f113ff` | 03 mục 7.4 |
| 7 | Thế giới động: chủ tỉnh, chiến tranh / hưu chiến, nổi loạn, nước mới lập / diệt vong, vua băng hà, dời đô; khu dân cư sa sút / sụp / lập mới, đường xuống cấp; độ hoang tính lại từng phần; mật độ quái theo tỉnh × tầng; sử biên niên; kiếp sau sống tiếp trong thế giới của kiếp trước; save v4 | `0891b93` | 03 mục 5.7 |
| 8 | Hang ổ (mọc, lớn, sào huyệt tràn ra tầng ven, NPC dọn, trống rồi bị chiếm lại, phế tích thành hang), di tích 3 tầng, ổ chúa; quyết định Dọn hang, Xuống di tích; ký hiệu và tooltip ở chế độ Nguy hiểm; thú triều giờ đến từ sào huyệt | (chưa commit) | 03 mục 4.3 |

Bước 6 đổi nhẹ bản đồ đất (eo biển quanh đảo) nên thế giới `can-bang` giờ ra 7 nước, 40 tỉnh, 163 khu dân cư; số đo bước 1–5 trong research là của bản đồ cũ.

Trang duyệt (claude.ai, lưu quyết định trong db, collection `reviews`):

- Duyệt Mẫu Quốc Gia: https://claude.ai/artifact/1FQFmmAroJsyVzVkgwp8W2; doc id `<kind>__<id>` (kind `tpl` / `quirk` / `law` / `gov`). **Đọc trước khi sửa `data/nations.js`.** Lúc ghi file này chưa có đánh dấu nào. Dựng lại: `tools/nation-data.html` (Edge headless `--dump-dom`) → thay `/*DATA*/null` trong `tools/nation-review.src.html`.
- Duyệt Cây Nghề (thư viện nghề): https://claude.ai/artifact/K36G3cQRbzHMALuN7q3SaK

## 2. Bản đồ mã nguồn

| File | Vai trò |
|---|---|
| `data/world.js` | chủng tộc, tầng lớp, sinh kế (`G.WORKS`: bld / role / town / land / guild / banLaw / seaBand), 16 vùng × 4 khu, `G.SEAS` (7 vùng biển × 4 tầng, thời tiết), `G.SEA_BAND_W`, `G.SHIPS`, `G.TERRAIN` (lệch độ cao / ẩm / nhiệt, `no`, `wild`), `G.FEATURES`, `G.FEATURE_SPAWN`, `G.BAND_W`, nguyên nhân chết (có `shipwreck`), `G.DUNGEON_TIERS` (dải Tier 3 tầng di tích theo biome), `validateWorld` (kiểm vùng đất, vùng biển, tầng di tích `G.DG`) |
| `data/ecology.js` | 10 biome + 44 loài thêm vào bestiary thư viện (8 loài biển cuối danh sách) |
| `data/nations.js` | `G.GOVS`, `G.LAWS`, `G.RACE_SETTLE`, `G.BUILDINGS`, `G.NATION_TEMPLATES` (50), `G.QUIRKS` |
| `data/names.js` | kho tên `G.NAMES` |
| `js/map.js` | `G.buildMap` (raster 300 × 225, ô 4px; eo biển quanh đảo; `map.sea`, `map.seaLabel`, `map.seaAt`, `map.cellsOf`), `G.minHeap`, `G.renderMapBase(map, mode, realm, opt)` (region / terrain / political / danger / sea), `G.renderRoads`, **`G.renderWarLayer`** (sọc tỉnh tiền tuyến), `G.drawMap` (`o.sites`: hang ổ, di tích, ổ chúa; bến, tên vùng biển, hải trình; khu sa sút vẽ nhạt, cờ theo kinh đô hiện tại) |
| `js/realm.js` | `G.buildRealm(map, seed)` → nước, khu dân cư (`s.bld`, `s.roles`; bến: `s.ship`, `s.seaCells`, `s.mass`, `s.comp`), tỉnh, đường (mỗi đoạn có `to` = khu nó nối tới), biển, **kề tỉnh `provAdj` (đất), `provSea` (cảng tàu buôn ≤ 420px)**; **độ hoang theo nguồn**: `G.wildOfSettlement`, `G.roadGroups`, `G.wildOfRoads` (vết loang cache theo ô + bán kính), `G.wildSet` (bật / thay / tắt một nguồn, chỉ tính lại ô nó đang làm min), `G.wildCommit` (ra wild, band, dựng lại `bandCells` của vùng có ô đổi tầng), `G.wildFull`; **di tích, ổ chúa** (`placeSites`, RNG riêng `sites:<seed>`): `R.dungeons` `{ id, name, cell, x, y, region, nation }`, `R.nests`; `G.useWorld(seed)`, `G.indexRealm`, `G.SET`, `G.settlementsIn`, `G.mainSettlement`, `G.zoneCells`, `G.seaZoneAt`, `G.seaOf`, `G.firstZone`, `G.homePos`, `G.nationAtPos`, `G.personName` |
| **`js/dynamic.js`** | thế giới động: `G.DYN` (hệ số cân bằng; `spill` chuỗi tràn mật độ, `lair*` hang ổ), `G.newDyn`, `G.makeWorld` (thế giới cho một đời), **`G.bindWorld(W)`** (đưa `G.realm` về trạng thái của W: nhanh khi cùng W hoặc W chưa đổi gì), `G.provOfS`, `G.local(S)` (dịch theo vùng, war / raid theo tỉnh), `G.areaKey(ô)`, `G.zoneKey(khu, tỉnh)`, `G.densityOf`, `G.monsterYear` (mật độ quái tỉnh × tầng, thú triều), `G.polityYear` (hp khu, ổn định, vua băng hà, chiến tranh, tuyên chiến, nổi loạn, sáp nhập, khu mới, đường xuống cấp), hệ con `nations` (sau `world`, ypt bước năm mỗi lượt; quê đổi chủ thì đổi `S.nation`), `G.runWorld(seed, năm)` (chạy thế giới không có đời người), `G.relabelNations` (nhãn nước, chỉ giao diện gọi); **hang ổ**: `lairYear` (cuối `G.polityYear`: đặt sẵn 10–14 hang, phế tích thành hang, lớn, tràn, NPC dọn, mọc), `G.clearLair`, `G.lairsNear`, `G.lairZone`, `G.lairKey`; **người chơi**: `G.assault` (đánh liền n trận ở một ô), `G.lairChoices`, `G.raidLair`, `G.dungeonChoice`, `G.raidDungeon`, `G.dungeonCleared` |
| `js/life.js` | `Sim`: newLife (gắn thế giới trước khi bốc nơi sinh; kiếp sau bắt đầu năm sau năm kiếp trước mất), endYear, deathProb / pickCause (đọc `G.local`), zonesFor, encounterTable (tham số `fam`: họ quái chủ ×4), rollEncounter (`opt.fam`, `opt.boss`), `G.init` dựng tầng di tích `G.DG` vào `G.ZONE`, hunt, fight (giảm mật độ ở `G.areaKey` của ô trận đánh), workYear; `newWorld` = `G.makeWorld` |
| `js/systems.js` | hệ con cuối năm: world (dịch theo vùng + `G.monsterYear`), family, health, undead, career, place, peers (+ `nations` từ dynamic.js, `law` từ state.js) |
| `js/events.js` | sự kiện, quyết định (work, migrate…), **`lair`** (dọn hang), **`dungeon`** (xuống di tích); `ad_tide` gọi tên sào huyệt của tỉnh; sự kiện thú triều / chiến tranh đọc `G.local` |
| `js/state.js` | `G.here`, `G.lawHere`, `G.attitude`, hệ số công trình, `G.incomeMult`, `G.workOK`, `G.workFee`, `G.seaWork`, `G.caught`, `G.deport`, `G.lawYear`, quyết định nghĩa vụ, 8 sự kiện luật |
| `js/travel.js` | A* chung (`g` phải là Float64), `G.findRoute` (bảng chi phí `realm._tc`, bị xóa khi đường / tầng đổi), `G.findSeaRoute` (cache `realm._sea`), `G.planTrip`, `G.tripText`, `G.moveTo`, `G.seaLinesFrom` |
| `js/ui.js` | giao diện; bản lưu **`vankiep.save.v4`** (S.v = 2), mộ `vankiep.graves.v3`, thế giới `vankiep.world.v1`; nền bản đồ khóa theo `realm.rev`; thẻ **Biên niên sử**; bảng quốc gia có kinh đô, chiến tranh, hưu chiến; chế độ Nguy hiểm: `sitesFor`, `siteTip` |
| `sim.html` | 1000 đời headless (chạy từng đợt 25 đời) + kiểm dữ liệu + tóm tắt thế giới + bảng Đi biển + **bảng Thế giới động** + **bảng Hang ổ và di tích**; nút Thử nhiều thế giới; **nút Thử thế giới động** (N thế giới × số năm, `G.runWorld`); `?noauto` chỉ nạp |

## 3. Bước 9: lập làng, lập nước (việc tiếp theo)

Thiết kế: `research/03` mục 5.5 (điều kiện lập làng, lập nước, trưởng làng, người cai trị, focus Trị quốc, mục tiêu ~10% / < 2% đời), 3.1 (`founder`), 11 (save làng và nước người chơi lập), mục 8 bảng sự kiện nhóm "Làng của mình", "Nước của mình". Kế hoạch đề xuất:

1. **Lập làng**: quyết định ở `js/events.js`, chọn ô trong tầng sâu hoặc lõi quanh chỗ đang ở (w 1,0–2,5, không núi / hồ / đầm, cách khu dân cư ≥ 60px); dùng lại `found()` của `js/dynamic.js` (tách phần tạo khu mới ra hàm nhận ô, tên, chủng tộc). Khu có `founder`; xin phép nước chủ (phí một năm thuế, luật `no_outsiders`), đất hoang thì thành tỉnh vô chủ (cần cách gắn khu vào tỉnh: hiện khu ngoài tỉnh có `province = −1`).
2. **Trưởng làng**: focus Làm ăn / Gia đình ở làng thì hp +.05, dân tăng; thu nhập +10% thu nhập dân làng; dân ≥ 3 lần ban đầu thì lên thị trấn. Sự kiện: người tới xin ở, quái đánh làng (hang ổ gần làng là nguồn tự nhiên), xây tường gỗ, mở đường (thêm đoạn đường vào `R.roads` và `D.rd`).
3. **Lập nước**: danh tiếng ≥ 60, là trưởng của ≥ 2 khu vô chủ (một là thị trấn) hoặc vừa dẫn nổi loạn; dùng lại `newNation()` (cho chọn mẫu của chủng tộc mình, tên từ 3 tên bốc). Focus **Trị quốc** (ổn định +, tuần tra +, hạnh phúc −); mỗi năm một quyết định triều chính (thuế, luật, tuyên chiến, cầu hòa).
4. **Sau khi chết**: làng / nước còn lại, kế vị, sử ghi người lập (biệt hiệu từ `names.epithet`); kiếp sau có thể sinh ở làng đó.
5. **Kiểm tra**: `sim.html` đếm đời lập làng / lập nước (mục tiêu ~10% / < 2% đời trưởng thành), 1000 đời 0 trận vượt Tier + 1, 50 thế giới × 300 năm vẫn trong mục tiêu; ghi `research/03` mục 5.8 mới, đánh ✓ bước 9; cập nhật `README.md` và file này.

Sau bước 9: bước 10 sự kiện cho luật, đặc tính mẫu, đặc trưng riêng; đường thăng tiến theo chính thể (bảng ở 03 mục 12).

## 4. Việc lẻ đang treo

- Người dùng từng nói muốn chỉnh bản đồ Địa hình nhưng chưa nói chỉnh gì (ngưỡng ở `G.MAP_TH` trong `js/map.js`, lệch biome ở `G.TERRAIN`).
- Trang Duyệt Mẫu Quốc Gia chưa có đánh dấu.
- **Vũng biển kín** trong lục địa (từ bước 1): bến ở đó không có hải trình. Giữ là biển hay đổi thành hồ.
- Ít người đi tàu (~1–2% đời). Nếu muốn biển quan trọng hơn thì hạ chi phí ô biển hoặc cho thương nhân, thủy thủ đi tàu khi di cư.
- Thiếu loài T5 cho vùng chết sa mạc và đầm (03 mục 13).
- ~40 cảnh báo "đất chật" trên 100 thế giới (nước bị kẹp không đặt đủ làng / thôn / thị trấn).
- Bảng loài khai theo vùng, chưa tách sang biome.
- **Bước 7 để lại**: chưa làm quốc giáo đồng hóa tỉnh chiếm được, sự kiện nhắc lại sử trong đời, đặc tính mẫu Quân đoàn (chiếm tỉnh nhanh gấp đôi) chưa tác dụng (bước 10). (Thú triều quá dày của bước 7 đã sửa ở bước 8: giờ ~7% năm-tỉnh, đến từ sào huyệt.)
- **Bước 8 để lại**: chủng tộc sống lâu thấy ít hang hơn (mật độ quái cập nhật mỗi lượt, hang chạy mỗi năm; nếu cần thì cho `G.monsterYear` chạy theo năm). Trong đời người (thế giới mới) trung bình ~7 hang, dưới mục tiêu 8–15 (thế giới chạy lâu thì 13,7). Tầng giữa của di tích Phế Xưởng và Hồng Sa chỉ có một họ quái. Ổ chúa mới là vị trí trên bản đồ; sự kiện chúa vùng chưa dùng tới nó. Chưa có sự kiện "tìm thấy phế tích", "hang ổ mới gần làng" dạng quyết định (mới chỉ là dòng nhật ký). 1000 đời chạy ~103 giây trên máy hôm nay; cùng máy, bộ thử 40 đời mất 4,0 giây ở bản bước 7, 5,1–6,3 giây ở bản này (đời dài hơn ~7% vì ít thú triều, chi phí mỗi năm thế giới như cũ ~1,1 ms).
- Còn chốt ở 03 mục 13 (duyệt tên, biome cố định hay theo seed, lập nước chọn mẫu chủng tộc khác).
- Remote `origin` (máy chủ công ty) chưa push từ bước 1; chỉ push lên `github` khi người dùng bảo.

## 5. Cách làm việc đã dùng

- **Mỗi bước**: code → mở `sim.html` (1000 đời, thế giới `can-bang`) → luật Tier phải là "không trận nào quá Tier + 1"; xem tỉ lệ trỗi dậy (~20%), chết vì quái (~10%), sinh kế, bảng luật / hành trình / đi biển / thế giới động → **Thử thế giới động** (50 × 300 năm) → thử 100 thế giới (0 lỗi) → ghi kết quả + chỗ khác thiết kế vào `research/03` → cập nhật `README.md` → hỏi người dùng trước khi commit; commit message tiếng Việt, kết bằng dòng Co-Authored-By; push lên `github` (`main` theo dõi `github/main`).
- **Chạy**: cấu hình `vankiep` trong `.claude/launch.json` (server tĩnh PowerShell cổng 8765); nếu phiên khác đang giữ cổng đó thì dùng `vankiep-2` (cổng 8766). Game `http://localhost:8765/LifeSim_RPG/index.html?world=<seed>`, sim `.../sim.html`, `.../sim.html?noauto` để thử từng phần trong console.
- **Chỉnh cân bằng thế giới động**: sửa `G.DYN` trong console (`Object.assign(LifeSim.DYN, {...})`) rồi `LifeSim.runWorld(seed, 300)` vài seed (đọc `W.dyn.n`), xong mới ghi vào file. So bản trước: `git archive HEAD LifeSim_RPG library | tar -x -C _head` rồi mở `http://localhost:8766/_head/LifeSim_RPG/sim.html` (xóa `_head` sau khi so).
- **Trình duyệt trong app**: lệnh JS chạy lâu hơn ~10 giây báo lỗi hoặc treo tab; tab chạy ngầm bị hãm bộ đếm giờ (để tab `sim.html` ở trước khi chạy dài). Thử nhiều thế giới thì gọi theo đợt. Ngay sau `location.reload()` lệnh JS kế tiếp hay báo `LifeSim is not defined` (trang chưa nạp xong): gọi lại là được. Lệnh bị ngắt giữa chừng có thể để bộ đệm A* bẩn: nạp lại trang trước khi đo tiếp. Ảnh chụp nhỏ thì tạm cho canvas `#map` phủ toàn trang bằng `style.cssText`.
- **Sửa file**: file trong thư mục làm việc dùng CRLF (git `core.autocrlf=true`, index LF), kể cả file vừa tạo sau khi lưu. perl `-0` với mẫu có `\n` **không khớp** trên file CRLF (dùng công cụ Edit, hoặc `\r?\n`); perl với chữ tiếng Việt thì không dùng `-CSD`; khi chèn bằng perl/heredoc cẩn thận `$(`… bị shell thay; Python, Node không có trên máy.
- **A\***: mảng chi phí đã đi phải là `Float64Array` (xem 03 mục 7.4). Vết loang độ hoang dùng `Float32Array` như bản gốc để kết quả lúc dựng không đổi.
- **Không sửa** `library/`. Văn bản tiếng Việt tự nhiên (skill viết tiếng Việt), không dùng gạch ngang dài trong văn xuôi.

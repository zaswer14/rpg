# Vạn Kiếp: mạch truyện nào cũng đầy đủ, "phụ" chỉ là vai trò, nhiều kết

Cập nhật: 2026-10-17 · commit gần nhất: da94078 (nhánh `claude/vankiep-doi-mach`, sẽ gộp vào `main` qua PR ngay sau khi ghi file này)

## Mục tiêu
Lời người dùng (17/10/2026): "bổ sung thêm tính mở rộng của mạch truyện, ko còn mạch nào là mạch phụ cả, mạch phụ là khi nó giao với 1 phần cuộc đời của nhân vật và nhân vật ko theo mạch đó, còn lại mỗi mạch đều có hoàn chỉnh. Và 1 mạch truyện có thể có nhiều kết".

Cách hiểu đã ghi lại cho người dùng (chưa được xác nhận, hỏi lại ngắn trước khi làm lớn):
1. Bỏ "mạch phụ" như một loại mạch. Mạch nào cũng đầy đủ các hồi (mở, chọn lối, thử thách, cao trào, kết), kể cả các mạch người quen của `story.js` (Đối thủ, Ơn cứu mạng, Mối thù, Báo thù, Tình xưa, Thầy trò, Mộng ước, Ruột thịt, Bạn thân, Kẻ săn, Đứa bé tặng hoa) và có thể cả các mạch ngắn.
2. "Phụ" là vai trò trong một đời: mạch chạm vào một quãng đời mà nhân vật không đi theo thì là phụ (chạy nền, ít nút, kết do người quen / thế giới quyết); nhân vật theo nó thì nó thành mạch chính (đổi mạch chính đã có sẵn: Ngã rẽ, rẽ ở hồi chọn lối).
3. Mỗi mạch nhiều kết, tùy các lựa chọn dọc đường (lối đã chọn ở hồi 2, thử thách thành / bại, tiến độ), không chỉ lựa chọn ở cao trào.

## Đã xong (phiên này)
- Trang Cây Cốt Truyện (`vankiep/caytruyen.html`): trùng sinh có seed (chọn trùng thì đời trùng), chơi lại từng quyết định, Mọi kết cục (thử mọi phương án ở mọi mốc từ ảnh chụp đầu năm), Lịch sử tổng. PR #1–#3 đã gộp.
- Đổi mạch chính + 5 mạch mới (`docs/16` mục 9): commit 61597d1 trên nhánh `claude/vankiep-doi-mach`. Đã đăng lại 3 trang: Cây Cốt Truyện (MUyMaYGsmE22koNLReHC29), Duyệt Mạch Truyện (GDCQtaV7DY2rdrjhBwAR36), Duyệt Nội Dung (VuihS4NqSLx296iVLSwZTY); `review/published.txt` đã ghi story, content.

## Việc tiếp theo
1. Hỏi người dùng xác nhận 3 điểm ở Mục tiêu (nhất là: mạch ngắn có phải nâng thành đầy đủ không; "phụ" có còn hiện thành làn riêng trên Cây Cốt Truyện không).
2. Thiết kế chung một khuôn mạch đầy đủ cho mọi tầng: dùng lại khuôn `saga(k, def)` trong `saga.js` (5 hồi + nhịp) nhưng thêm `who` (người quen) và kết theo đường: `def.ends` = danh sách kết, mỗi kết có điều kiện trên `a.d.path`, `a.d.ok`, tiến độ, lựa chọn cao trào → chọn kết ở hồi `after` thay vì một `a.d.end` duy nhất.
3. Viết lại các mạch người quen của `story.js` theo khuôn đó (mỗi mạch ≥ 3–4 kết, mỗi kết có dấu `G.ARCS[k].marks`), giữ nhãn mạch, câu chữ cũ còn dùng được.
4. Vai trò chính / phụ: mạch đang mở mà không phải `S.saga.k` thì là phụ: nút ít hơn, tự tiến theo đời người quen (`G.castGet`), kết tự rơi; mời nhân vật "theo mạch này" bằng Ngã rẽ (`sg_turn`) hoặc lựa chọn ở nút. Bỏ giới hạn tầng `TIER_MAX` theo loại mạch, thay bằng: 1 mạch chính + tối đa `arcMax` mạch nền.
5. Sửa `caytruyen.html` (làn mạch theo vai trò, không theo loại), trang Duyệt Mạch Truyện (`review/story-data.html`, `story-review.src.html`), `docs/13`, `docs/16`, `TIEN_DO.md`. Đo lại 500 đời (lệnh ở dưới) rồi so với `docs/16` mục 9.3.

## File và vị trí
- `vankiep/js/story.js`: mạch người quen. `G.STORY` dòng 24 (arcMax 3, shortMax 3); `G.ARCS` (định nghĩa các mạch, có `nameVi`, `quest`, `good`, `sum(o, p, rec)`, `gone`); tầng mạch dòng ~166–171 (`tierOf`, `TIER_MAX`); `G.arcOpen` 172, `G.arcEnd` 184, `G.arcStep` ~192; `dnode(id, D)` ~231 (bọc quyết định của nút: `D.story = { arc, at, wait, to }`, `apply` trả `{ t, o, to }`, `to: null` = không bước); `node(e)` tương tự cho sự kiện.
- `vankiep/js/saga.js`: `G.MARKS` mục 1 (dòng 41–); `saga(k, def)` mục 2 (dòng ~145: 5 nút `_open/_knot/_trial/_climax/_after` + `_beat`); 13 mạch chính `m_avenge, m_rise, m_power, m_craft, m_lead, m_faith, m_road, m_house, m_guard, m_love, m_lore, m_atone, m_shadow`; mục 3 dòng 601–: `sg()`, `G.SAGA_TURN` 604, `addSeed` (đặt `g.turn`), `SEED`, `MARK_SEED` 634, `CHAIN` (`G.SAGA_CHAIN`) 637, `G.sagaScore`, `TRAIT`, `openSaga` 690, `sg_road`, `alts`/`AFF`/`keepScore`, `switchMain` 742, `knotTurn` 753, `DEC.sg_turn` 755, `DEC_SEED` 800; mạch ngắn mục 4 (813–, `short(k, def)`); `G.storyLinkHook` 937 (đi theo mạch + gieo mạch khác); `G.sagaText`, `G.SAGA_TITLE` cuối file. Bọc `G.arcEnd` (dấu theo kết + CHAIN) ở mục 1.
- `vankiep/js/fame.js`: `G.storyTree` (~454, trả `arcs` có `tier`, `o`, `sum`, `y0`, `y1`; `choices` có `n`), thành tựu `road_turn`, `road_two`, `lifeStats` mục Đường đời.
- `vankiep/caytruyen.html`: `build()` (`mains` = mạch tier main xếp theo năm, `laneGroups` theo tier main/side/short), `drawTree()`, `endOf()` (Mọi kết cục gom theo chuỗi mạch chính).

## Hiểu biết về mã (để khỏi đọc lại)
- Trạng thái mạch: `S.arcs` (đang mở: `{ k, who, at, t, t0, main, d }`), `S.arcDone` (`{ k, who, name, o, y, t0, t, d, main }`), `S.saga = { seed, why, k, asked, t, past, turn, turns, base, last, settled }`. Mạch chính bỏ dở: kết `'turned'`, `d.to` = mạch rẽ sang.
- Nhãn nhật ký `e.arc` = `tagOf(a, p)`; "Tên mạch · đường đời" / "· dư âm" cho mạch chính; caytruyen gán dòng vào nhánh theo nhãn + năm.
- Mọi ngẫu nhiên qua `sim.rnd()`; đổi nội dung thì cùng seed ra đời khác (đánh dấu cũ trên Cây Cốt Truyện lệch câu chữ, người dùng đã biết).
- Kiểm nhanh (cloud có Chromium): `python3 -m http.server 8765` ở gốc kho; Playwright Node: `NODE_PATH=/usr/local/lib/node_modules_global node script.js`, `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`, mở `http://localhost:8765/vankiep/caytruyen.html#none-x`, trong `page.evaluate`: `G=window.LifeSim; G.init(); G.useWorld('can-bang'); new G.Sim({ seed, headless: true }); sim.newLife({ noPeers: true }); sim.S.auto = true; sim.runToDeath();` rồi đếm `S.arcDone`. Chọn ngẫu nhiên: `sim.autoDecide = false`, vòng `if (S.pending) sim.choose(...)`; `sim.tick(.05)`.
- `tools/duyet.sh` đầy đủ trên cloud: tạo `bin/chromium` gọi `/opt/pw-browsers/chromium --no-sandbox "$@"`, chạy với `PATH=<thư mục đó>:$PATH`.
- Đăng lại trang đã có: lần đầu bị từ chối vì chưa xem bản đang đăng; đối chiếu (diff các dòng ngắn, so khóa JSON dữ liệu), Read vài dòng file đã lưu, rồi đăng lại y nguyên là qua.
- `tools/muc_luc.sh` lỗi regex trên cloud; dùng `grep -n`.

## Quyết định đã chốt với người dùng
- Trùng sinh: chọn trùng phương án thì đời đi đúng hướng cũ (seed không đổi); ghi lịch sử mốc lựa chọn và ai chọn.
- Một nhân vật có thể đổi mạch chính theo sự kiện, lựa chọn; thêm 5 mạch chính (đã làm, đã gộp).
- Mỗi lần xong: gộp vào `main` qua PR (push thẳng `main` bị chặn) và đăng lại các trang LỆCH, sau khi hỏi người dùng.

## Còn mở
- Thoát nghèo hay làm mạch thứ hai (điểm gieo cộng dồn); Tham vọng hiếm ở Tự sống.
- `docs/16` mục 8: đợt 2 đường đời (móc ~40 quyết định đơn độc, Bộ Xương có mạch chính) vẫn hoãn.

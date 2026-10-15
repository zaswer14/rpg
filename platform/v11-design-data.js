/* Skeleton Codex V11 — authored bilingual naming and five-rank design for all 104 skills.
 * English id/name remain canonical. Rank perks are authored targets; group runtime remains a prototype.
 */
(()=>{
'use strict';
const jobs = {
  "Wanderer": "Kẻ Lang Thang",
  "Bone Fighter": "Chiến Binh Xương",
  "Skeleton Archer": "Cung Thủ Xương",
  "Bone Rogue": "Đạo Tặc Xương",
  "Bone Acolyte": "Tập Sự Tử Thuật",
  "Bone Tinkerer": "Thợ Chế Tác Xương",
  "Bone Guard": "Vệ Binh Xương",
  "Bone Duelist": "Kiếm Sĩ Xương",
  "Bone Raider": "Chiến Binh Cướp Phá",
  "Bone Marksman": "Thiện Xạ Xương",
  "Grave Hunter": "Thợ Săn Mộ",
  "Grave Assassin": "Sát Thủ Mộ",
  "Grave Bandit": "Đạo Tặc Hầm Mộ",
  "Necromancer": "Pháp Sư Tử Linh",
  "Soul Medium": "Linh Môi",
  "Bone Engineer": "Kỹ Sư Xương",
  "Bone Phalanx": "Vệ Quân Khiên Thương",
  "Dread Knight": "Kỵ Sĩ Kinh Hoàng",
  "Sword Wraith": "Kiếm Hồn",
  "Grave Marauder": "Kẻ Tàn Phá Lăng Mộ",
  "Phantom Sniper": "Xạ Thủ U Linh",
  "Wild Hunt Captain": "Đội Trưởng Cuộc Săn",
  "Soul Assassin": "Sát Thủ Đoạt Hồn",
  "Shade Stalker": "Kẻ Rình Rập Bóng Tối",
  "Grand Necromancer": "Đại Pháp Sư Tử Linh",
  "Soul Weaver": "Kẻ Dệt Linh Hồn",
  "Bone Tinkerer Prime": "Nghệ Nhân Xương",
  "Siege Gunner": "Pháo Thủ Công Thành",
  "Legion Marshal": "Thống Soái Quân Đoàn",
  "Death Knight": "Kỵ Sĩ Tử Vong",
  "Eternal Huntsman": "Thợ Săn Vĩnh Hằng",
  "Death Whisper": "Lời Thì Thầm Tử Vong",
  "Lich King": "Vu Yêu",
  "Bone Architect": "Kiến Trúc Sư Xương",
  "Abyss Sovereign": "Chúa Tể Vực Sâu",
  "Death Sovereign": "Chúa Tể Tử Vong"
};
// V12.3: tên tiếng Anh hiển thị khác ID (ID giữ nguyên để không hỏng save). Chỉ liệt kê nghề có đổi tên.
const jobsEn = {
  "Bone Tinkerer Prime": "Bone Artificer",
  "Lich King": "Lich"
};
const jobEn=id=>jobsEn[id]||id;
const skillDesign = {
 "bone_dash": {
  "vi": "Lướt Xương",
  "features": [
   "Giảm trễ sau khi lướt",
   "Né đúng nhịp tạo chống gián đoạn ngắn",
   "Cho phép nối đòn đánh khi lướt trúng",
   "Lướt xa hơn, giảm phạt khi hụt"
  ]
 },
 "bone_leap": {
  "vi": "Bật Nhảy Xương",
  "features": [
   "Cải thiện kiểm soát hướng khi bật",
   "Tăng độ cao khi bật trên không",
   "Bật xong có thể nối một đòn không trung",
   "Đáp đất nhanh hơn sau cú bật"
  ]
 },
 "loose_bone": {
  "vi": "Ném Xương Vụn",
  "features": [
   "Tăng tốc độ mảnh xương",
   "Trúng quái nhỏ gây khựng nhẹ",
   "Cho phép ném chéo khi đang nhảy",
   "Đạn vỡ tạo va chạm phụ tầm gần"
  ]
 },
 "brace": {
  "vi": "Thủ Thế",
  "features": [
   "Kéo dài khoảnh khắc giảm đẩy lùi",
   "Chống ngắt đòn tốt hơn khi đỡ đúng lúc",
   "Đỡ thành công mở phản kích ngắn",
   "Tạo một lớp chắn mỏng khi giữ thế chuẩn"
  ]
 },
 "quick_recover": {
  "vi": "Phục Hồi Nhanh",
  "features": [
   "Rút ngắn thời gian đứng dậy",
   "Hồi một ít thể lực sau cú tiếp đất nặng",
   "Cho phép né sau khi phục hồi tư thế",
   "Kháng đánh ngã thoáng chốc sau phục hồi"
  ]
 },
 "balanced_frame": {
  "vi": "Khung Xương Cân Bằng",
  "features": [
   "Giảm trễ tiếp đất",
   "Bớt mất đà khi đổi hướng",
   "Ổn định sau đòn trên không",
   "Cải thiện chống mất thăng bằng khi tiếp đất"
  ]
 },
 "scavenger_eye": {
  "vi": "Mắt Nhặt Nhạnh",
  "features": [
   "Mở rộng phạm vi phát hiện vật phẩm",
   "Đánh dấu lối phụ gần nhất",
   "Thêm tín hiệu cho vật phẩm hiếm",
   "Tăng tầm nhặt vật phẩm ở ngã rẽ"
  ]
 },
 "light_bones": {
  "vi": "Bộ Xương Nhẹ",
  "features": [
   "Tăng nhẹ điều khiển trên không",
   "Đổi hướng khi rơi ít bị trễ",
   "Giảm thời gian rơi cứng sau né không trung",
   "Cải thiện khả năng chỉnh quỹ đạo nhảy"
  ]
 },
 "cracked_slash": {
  "vi": "Chém Kiếm Sứt",
  "features": [
   "Rút ngắn hồi chiêu chém ngang",
   "Trúng đòn tạo áp lực lên thế thủ",
   "Cho phép cancel từ đòn thường thứ hai",
   "Đòn cuối mở một nhịp chém bồi ngắn"
  ]
 },
 "rising_chip": {
  "vi": "Chém Hất Mảnh",
  "features": [
   "Góc hất kiếm cao hơn",
   "Trúng quái nhỏ tăng độ hất",
   "Nối được đòn trên không ngay khi xác nhận trúng",
   "Chém bồi lên mục tiêu vừa bị hất"
  ]
 },
 "stone_throw": {
  "vi": "Ném Đá",
  "features": [
   "Đá bay nhanh hơn",
   "Ném trúng tạo khựng rất ngắn",
   "Cho phép vừa lùi vừa ném",
   "Ném liên tiếp có nhịp hồi ngắn hơn"
  ]
 },
 "aimed_stone": {
  "vi": "Ném Đá Ngắm",
  "features": [
   "Rút ngắn giữ ngắm",
   "Tăng độ ổn định đường bay",
   "Trúng điểm yếu gây khựng rõ hơn",
   "Đá ngắm xuyên qua vật cản mềm một lần"
  ]
 },
 "needle_stab": {
  "vi": "Đâm Kim",
  "features": [
   "Đâm thu tay nhanh hơn",
   "Đánh trúng sát người tăng áp lực combo",
   "Cho phép chuyển né ngay sau hit confirm",
   "Đâm bồi ngắn nếu nối đúng nhịp"
  ]
 },
 "cracked_axe": {
  "vi": "Bổ Rìu Nứt",
  "features": [
   "Giảm độ chậm trước khi bổ",
   "Tăng phá giáp khi trúng đòn nặng",
   "Vung rộng hơn ở nửa sau quỹ đạo",
   "Gây sóng chấn nhỏ sau cú bổ trúng đất"
  ]
 },
 "spear_jab": {
  "vi": "Đâm Thương",
  "features": [
   "Thu thương về nhanh hơn",
   "Giữ khoảng cách tốt hơn khi trúng",
   "Cho phép bước lùi sau đòn đâm",
   "Đâm nối tầm ngắn sau hit confirm"
  ]
 },
 "shield_nudge": {
  "vi": "Húc Khiên",
  "features": [
   "Đẩy lùi ổn định hơn",
   "Trúng đòn khiến mục tiêu khựng nhẹ",
   "Húc ngay sau đỡ mở nhịp phản đòn",
   "Tạo chống ngắt đòn thoáng chốc sau húc"
  ]
 },
 "focus_pulse": {
  "vi": "Xung Pháp Khí Cũ",
  "features": [
   "Phóng xung nhanh hơn",
   "Xung gây khựng lên mục tiêu nhỏ",
   "Tăng tầm xung trung tính",
   "Xung thứ hai yếu xuất hiện sau hit confirm"
  ]
 },
 "junk_snare": {
  "vi": "Bẫy Dây Vụn",
  "features": [
   "Bẫy tồn tại lâu hơn",
   "Bẫy giữ chân mục tiêu lâu hơn",
   "Đặt bẫy nhanh và xa hơn",
   "Đặt hai bẫy nhỏ theo hướng di chuyển"
  ]
 },
 "bone_dive": {
  "vi": "Lao Xương",
  "features": [
   "Bớt trễ sau khi chạm đất",
   "Lao trúng giảm tốc rơi tức thì",
   "Cho phép nối né khi xác nhận trúng",
   "Lao tạo vùng rung nhỏ khi tiếp đất"
  ]
 },
 "quiet_tread": {
  "vi": "Bước Chân Êm",
  "features": [
   "Thu hẹp tầm bị phát hiện khi đi chậm",
   "Giảm tiếng động sau tiếp đất",
   "Bắt đầu di chuyển từ yên lặng ít bị lộ",
   "Tăng khoảng thời gian ẩn dấu chân"
  ]
 },
 "ragged_persistence": {
  "vi": "Sự Bền Bỉ Rách Nát",
  "features": [
   "Giảm trễ sau đánh lùi",
   "Kháng mất thăng bằng ngắn sau bị đẩy",
   "Hồi một ít thể lực khi đứng vững",
   "Giảm thêm tác động đẩy lùi liên tiếp"
  ]
 },
 "wanderer_improvise": {
  "vi": "Ứng Biến Lang Thang",
  "features": [
   "Giảm khoảng hở khi đổi vũ khí",
   "Đòn ứng biến nhận dạng vũ khí đang cầm",
   "Nối được từ đòn thường thứ hai",
   "Đòn ứng biến thứ hai nếu trúng đúng nhịp"
  ]
 },
 "first_footfall": {
  "vi": "Bước Chân Đầu Tiên",
  "features": [
   "Rơi xuống ít mất điều khiển hơn",
   "Giảm trễ đổi hướng khi rơi",
   "Bước né sau đáp đất nhanh hơn",
   "Giữ đà ngang tốt hơn sau cú rơi dài"
  ]
 },
 "frost_fleck": {
  "vi": "Mảnh Băng Giá",
  "features": [
   "Đạn băng bay nhanh hơn",
   "Tích lũy Chill cao hơn",
   "Chạm đích tạo vệt lạnh ngắn",
   "Mảnh băng phụ lan Chill ở khoảng gần"
  ]
 },
 "static_snap": {
  "vi": "Tia Điện Tách",
  "features": [
   "Giảm thời gian xuất tia",
   "Mục tiêu Wet tích Shock tốt hơn",
   "Điện chạm thêm mục tiêu sát bên khi Wet",
   "Tăng nhịp gián đoạn khi điện trúng đích"
  ]
 },
 "wind_puff": {
  "vi": "Luồng Gió Nhỏ",
  "features": [
   "Đẩy mục tiêu xa hơn một chút",
   "Ngắt bước tiến của quái nhỏ",
   "Gió lan theo hình nón rộng hơn",
   "Giảm khả năng bị áp sát sau khi đẩy trúng"
  ]
 },
 "pebble_knock": {
  "vi": "Hất Đá Sỏi",
  "features": [
   "Đá phép bay nhanh hơn",
   "Tăng lực hất nhẹ khi trúng",
   "Đá nảy thấp một lần sau tiếp đất",
   "Tạo thêm mảnh đất nhỏ khi va chạm"
  ]
 },
 "pale_glimmer": {
  "vi": "Ánh Sáng Nhợt",
  "features": [
   "Lớp chắn tồn tại lâu hơn",
   "Giải một tầng Curse yếu ổn định hơn",
   "Tạo ánh che chắn lên đồng minh gần",
   "Chắn nhỏ được tái tạo nếu thanh tẩy thành công"
  ]
 },
 "shade_mote": {
  "vi": "Đốm Bóng Tối",
  "features": [
   "Đốm bay nhanh hơn",
   "Đốm theo mục tiêu trong góc nhỏ",
   "Gây giảm tốc nhẹ khi trúng",
   "Đốm tách một hạt nhỏ sau va chạm"
  ]
 },
 "sprout_grasp": {
  "vi": "Mầm Cây Níu Giữ",
  "features": [
   "Kéo dài rễ níu chân",
   "Giữ quái nhỏ chắc hơn",
   "Rễ lan sang mục tiêu sát cạnh",
   "Giảm thời gian đặt rễ khi đang đứng trên đất"
  ]
 },
 "water_veil": {
  "vi": "Màn Nước",
  "features": [
   "Kéo dài màn chắn nước",
   "Tạo trạng thái Wet lên mục tiêu chạm màn",
   "Cho phép di chuyển chậm khi duy trì màn",
   "Màn vỡ tạo xung đẩy nhỏ"
  ]
 },
 "forward_roll": {
  "vi": "Lăn Về Phía Trước",
  "features": [
   "Lăn xa hơn",
   "Né chuẩn tạo khoảng iframe tốt hơn",
   "Có thể lăn sau hit confirm",
   "Đòn thường đầu sau lăn vào nhanh hơn"
  ]
 },
 "air_step": {
  "vi": "Bước Trên Không",
  "features": [
   "Ổn định đà ngang khi bước",
   "Tăng khoảng dịch chuyển giữa không trung",
   "Có thể nối đòn chéo sau bước",
   "Giảm trễ khi đáp đất sau air step"
  ]
 },
 "last_stand": {
  "vi": "Trụ Vững Cuối Cùng",
  "features": [
   "Giảm sát thương khi còn ít máu",
   "Chống đánh ngã tốt hơn ở ngưỡng thấp",
   "Tăng thời gian duy trì phòng thủ",
   "Nhận lá chắn ngắn sau lần đứng vững"
  ]
 },
 "sword_cleave": {
  "vi": "Chém Kiếm Rộng",
  "features": [
   "Thu kiếm nhanh hơn",
   "Tăng lực ép lên nhiều mục tiêu",
   "Mở nhịp chém nối khi đánh trúng",
   "Tăng góc quét của đường kiếm"
  ]
 },
 "shield_tap": {
  "vi": "Gõ Khiên",
  "features": [
   "Húc khiên trúng dễ gây khựng",
   "Bổ sung thời gian giữ thế sau húc",
   "Đỡ đúng nhịp nối húc nhanh",
   "Phản đòn thêm lực đẩy về phía trước"
  ]
 },
 "aimed_shot": {
  "vi": "Phát Bắn Ngắm",
  "features": [
   "Rút ngắn thời gian kéo cung",
   "Bắn chính xác hơn khi đứng yên",
   "Trúng điểm yếu tăng khựng",
   "Tên bay ổn định hơn khi bắn xa"
  ]
 },
 "knife_feint": {
  "vi": "Dao Găm Nhử",
  "features": [
   "Nhử đòn ít tốn khoảng trống hơn",
   "Địch trượt đòn bị lộ khe phản kích",
   "Cho phép cancel sang lướt khi nhử thành công",
   "Đâm phản kích có thể nối nhát thứ hai"
  ]
 },
 "soul_spark": {
  "vi": "Tia Linh Hồn",
  "features": [
   "Giảm thời gian niệm sơ cấp",
   "Tăng tích lũy áp chế linh hồn",
   "Đạn linh hồn đổi góc nhẹ theo mục tiêu",
   "Đạn trúng tạo hạt linh hồn bồi"
  ]
 },
 "scrap_mine": {
  "vi": "Mìn Phế Liệu",
  "features": [
   "Mìn tồn tại lâu hơn",
   "Tăng bán kính kích hoạt",
   "Giảm thời gian triển khai",
   "Nổ tạo mảnh vụn nhỏ trong vùng gần"
  ]
 },
 "firm_grip": {
  "vi": "Cầm Nắm Vững",
  "features": [
   "Giảm hao thể lực khi đổi thế",
   "Giảm nguy cơ hụt đòn do đẩy lùi",
   "Chống gián đoạn khi cầm vũ khí nặng",
   "Tăng ổn định khi nối đòn thường"
  ]
 },
 "rough_three_cut": {
  "vi": "Tam Liên Chém Thô",
  "features": [
   "Nhịp chém thứ hai nhanh hơn",
   "Đòn thứ ba tăng ép thế thủ",
   "Có thể cancel từ nhịp cuối khi trúng",
   "Đòn thứ ba mở bước áp sát ngắn"
  ]
 },
 "split_arrow": {
  "vi": "Tên Tách Đôi",
  "features": [
   "Hai mũi tên phân tán hẹp hơn",
   "Trúng cùng mục tiêu tạo khựng nhẹ",
   "Tăng góc tùy chỉnh khi bắn",
   "Mũi tên phụ xuất hiện khi giữ ngắm đủ lâu"
  ]
 },
 "shadow_slip": {
  "vi": "Luồn Bóng",
  "features": [
   "Lướt có trễ hồi thấp hơn",
   "Qua lưng mục tiêu dễ hơn",
   "Cho phép nối đâm dao sau lướt trúng",
   "Giữ một khoảnh khắc mờ bóng sau lướt"
  ]
 },
 "grave_chant": {
  "vi": "Khúc Tụng Mộ",
  "features": [
   "Rút ngắn niệm chú",
   "Kéo dài hiệu lực hỗ trợ tử thuật",
   "Kích hoạt sau combo phép đơn",
   "Khúc tụng lan đến triệu hồi gần"
  ]
 },
 "pocket_turret": {
  "vi": "Tháp Bắn Bỏ Túi",
  "features": [
   "Tháp bắn nhanh hơn sau dựng",
   "Tăng thời gian tồn tại",
   "Triển khai nhanh và sát mép bệ",
   "Tháp bắn đạn đôi theo nhịp chậm"
  ]
 },
 "guard_counter": {
  "vi": "Phản Đòn Thế Thủ",
  "features": [
   "Cửa sổ nhận đòn rộng hơn chút",
   "Phản đòn có khựng mạnh hơn",
   "Nối chém nhanh ngay khi phản chuẩn",
   "Phản đòn tạo chắn phụ ngắn"
  ]
 },
 "leaping_strike": {
  "vi": "Đòn Nhảy Tấn Công",
  "features": [
   "Tăng khoảng bám mục tiêu khi lao",
   "Đánh trúng quái nhỏ hất lên",
   "Kết nối air normal sau đòn",
   "Rút ngắn trễ đáp đất nếu trúng"
  ]
 },
 "armor_rend": {
  "vi": "Xé Giáp",
  "features": [
   "Duy trì phá giáp lâu hơn",
   "Tăng mức suy yếu giáp",
   "Mở cancel sang đòn nặng khi trúng",
   "Đòn bồi tác động lên giáp vừa bị xé"
  ]
 },
 "volley": {
  "vi": "Mưa Tên",
  "features": [
   "Rút ngắn niệm trước loạt bắn",
   "Tăng diện phủ loạt tên",
   "Bổ sung một mũi tên ở góc phụ",
   "Trúng liên tiếp gia tăng khựng"
  ]
 },
 "ankle_trap": {
  "vi": "Bẫy Kẹp Chân",
  "features": [
   "Bẫy tồn tại lâu hơn",
   "Trói chân lâu hơn",
   "Mở rộng tầm kích hoạt",
   "Bẫy gây chậm sau khi thoát trói"
  ]
 },
 "soul_bind": {
  "vi": "Trói Hồn",
  "features": [
   "Kéo dài thời gian trói",
   "Làm yếu lực thoát khỏi trói",
   "Trói lan yếu sang mục tiêu kế bên",
   "Hồi một ít Soul khi trói thành công"
  ]
 },
 "turret_repair": {
  "vi": "Sửa Chữa Tại Chỗ",
  "features": [
   "Sửa tháp nhanh hơn",
   "Tăng lượng sửa chữa",
   "Sửa từ khoảng cách ngắn an toàn hơn",
   "Sửa tạo chắn ngắn cho tháp"
  ]
 },
 "iron_memory": {
  "vi": "Ký Ức Sắt Đá",
  "features": [
   "Tăng kháng đánh lùi",
   "Đỡ đòn liên tiếp ít mất thế",
   "Giảm thời gian hồi sau stagger",
   "Cho thêm poise khi giữ thế"
  ]
 },
 "perfect_timing": {
  "vi": "Đúng Khoảnh Khắc",
  "features": [
   "Mở rộng cửa sổ phản chuẩn",
   "Tăng lợi ích hit confirm",
   "Giảm phạt khi cancel hụt",
   "Nối phản đòn hoàn hảo dễ hơn"
  ]
 },
 "shield_oath": {
  "vi": "Lời Thề Khiên",
  "features": [
   "Thời gian giữ chắn dài hơn",
   "Bớt tổn hao chắn trước đòn mạnh",
   "Mở đường phản công sau thủ chuẩn",
   "Tạo chắn cho đồng minh sát bên"
  ]
 },
 "viper_riposte": {
  "vi": "Phản Kích Rắn Độc",
  "features": [
   "Bước vào đòn phản nhanh hơn",
   "Phản trúng cộng áp lực combo",
   "Cho phép lướt thoát sau phản chuẩn",
   "Thêm một nhát kết liễu ngắn"
  ]
 },
 "grave_splitter": {
  "vi": "Bổ Tách Mộ",
  "features": [
   "Rút ngắn thu rìu",
   "Phá giáp rõ hơn",
   "Bổ gây chấn động phạm vi hẹp",
   "Đòn cuối tạo vùng nứt tạm"
  ]
 },
 "hunter_mark": {
  "vi": "Dấu Ấn Thợ Săn",
  "features": [
   "Dấu ấn tồn tại lâu hơn",
   "Trúng mục tiêu đánh dấu gây khựng",
   "Có thể chuyển dấu ấn một lần",
   "Hiển thị mục tiêu yếu ở khoảng xa"
  ]
 },
 "phantom_step": {
  "vi": "Bước Chân U Linh",
  "features": [
   "Tăng tầm dịch chuyển",
   "Tạo iframe rất ngắn ở giữa bước",
   "Dịch chuyển nối đâm găm",
   "Bước chân lưu bóng giả ngắn"
  ]
 },
 "summon_guard": {
  "vi": "Triệu Hồi Vệ Binh Xương",
  "features": [
   "Vệ binh tồn tại lâu hơn",
   "Tăng khả năng cản đường",
   "Vệ binh đánh trả khi chắn thành công",
   "Cho phép ra lệnh giữ vị trí"
  ]
 },
 "soul_vessel": {
  "vi": "Bình Chứa Linh Hồn",
  "features": [
   "Tăng dung lượng hồi Soul",
   "Hồi Soul đều hơn sau đánh trúng",
   "Giảm hao khi triệu hồi liên tiếp",
   "Hoàn trả chút Soul khi summon hết thời gian"
  ]
 },
 "deploy_sentry": {
  "vi": "Triển Khai Tháp Canh",
  "features": [
   "Giảm thời gian dựng",
   "Tăng tầm phát hiện",
   "Cho phép đặt trên bệ cao",
   "Tháp canh chia mục tiêu hiệu quả hơn"
  ]
 },
 "guardian_pulse": {
  "vi": "Nhịp Hộ Vệ",
  "features": [
   "Tăng hiệu quả chắn nội tại",
   "Đỡ đòn lan chắn nhỏ quanh mình",
   "Hồi chắn nhanh hơn khi đứng vững",
   "Đồng minh gần được hưởng hiệu ứng nhỏ"
  ]
 },
 "soulburst": {
  "vi": "Bùng Nổ Linh Hồn",
  "features": [
   "Thu ngắn thời gian tụ lực",
   "Tăng phạm vi bùng nổ",
   "Tạo áp lực khống chế sau vụ nổ",
   "Bùng nổ thêm sóng xung kích yếu"
  ]
 },
 "aerial_specialist": {
  "vi": "Chuyên Gia Không Chiến",
  "features": [
   "Tăng kiểm soát khi bay",
   "Giảm phạt đánh thường trên không",
   "Lướt sau hit confirm dễ hơn",
   "Nối chuỗi không trung ổn định hơn"
  ]
 },
 "phantom_blade": {
  "vi": "Lưỡi Kiếm Ma",
  "features": [
   "Cắt nhanh hơn khi xuất kiếm",
   "Tăng áp lực lên mục tiêu trúng nhiều nhát",
   "Lưỡi kiếm đi qua một mục tiêu nhỏ",
   "Hiện thêm bóng kiếm kết thúc"
  ]
 },
 "dread_cleaver": {
  "vi": "Đại Kiếm Khiếp Sợ",
  "features": [
   "Vung nặng có chống ngắt tốt hơn",
   "Đòn trúng tạo áp lực lên giáp",
   "Tạo đường kiếm chấn động tầm gần",
   "Đòn kết thúc kích hoạt sóng chém nhỏ"
  ]
 },
 "ravager_whirl": {
  "vi": "Cuồng Phong Tàn Phá",
  "features": [
   "Xoay lâu hơn một nhịp",
   "Tăng ép giáp khi quét nhiều mục tiêu",
   "Có thể di chuyển chậm khi xoay",
   "Lần xoay cuối kéo nhẹ mục tiêu gần"
  ]
 },
 "ghostline_shot": {
  "vi": "Đường Đạn U Linh",
  "features": [
   "Rút ngắn giữ ngắm",
   "Tăng độ xuyên tuyến mục tiêu",
   "Bắn chính xác khi trên bệ cao",
   "Đạn xuyên trúng để lại dấu ấn ngắn"
  ]
 },
 "legion_call": {
  "vi": "Hiệu Triệu Quân Đoàn",
  "features": [
   "Lính triệu hồi ở lại lâu hơn",
   "Tăng số lượt hỗ trợ",
   "Gọi được hai nhóm từ hai phía",
   "Triệu hồi kết thúc bằng đồng loạt đánh"
  ]
 },
 "soul_lattice": {
  "vi": "Lưới Linh Hồn",
  "features": [
   "Liên kết chắn tồn tại lâu hơn",
   "Giảm sát thương cho mục tiêu liên kết",
   "Tăng phạm vi nối kết",
   "Lưới hấp thụ một đợt xung kích"
  ]
 },
 "shade_echo": {
  "vi": "Dư Ảnh Bóng Tối",
  "features": [
   "Bóng giả tồn tại lâu hơn",
   "Khiến địch phân vân chọn mục tiêu",
   "Cho phép trở lại bóng vừa đặt",
   "Bóng giả nổ thành làn sương mờ"
  ]
 },
 "duelist_focus": {
  "vi": "Tập Trung Đấu Kiếm",
  "features": [
   "Tăng hiệu quả phản đòn chuẩn",
   "Đòn trúng liên tiếp giữ nhịp tốt hơn",
   "Giảm phạt sau đòn hụt đơn mục tiêu",
   "Tăng áp lực lên mục tiêu đang khóa"
  ]
 },
 "wraith_rush": {
  "vi": "Xung Kích Oán Linh",
  "features": [
   "Lướt nhanh hơn",
   "Lướt xuyên một quái nhỏ",
   "Có thể nối chém khi đến cuối đường lướt",
   "Đường lướt để lại nhát kiếm bóng"
  ]
 },
 "battle_instinct": {
  "vi": "Bản Năng Chiến Đấu",
  "features": [
   "Nhanh nhận biết đòn nguy hiểm",
   "Giảm thời gian hồi sau né chuẩn",
   "Tăng lợi thế khi đối thủ vừa hụt",
   "Giữ trạng thái phản ứng trong combo dài"
  ]
 },
 "reaper_verdict": {
  "vi": "Phán Quyết Tử Thần",
  "features": [
   "Rút ngắn niệm trước kết liễu",
   "Tăng áp lực trên mục tiêu bị nguyền",
   "Chém xuyên vùng gần",
   "Đòn kết thúc tạo dấu phán quyết ngắn"
  ]
 },
 "grave_dominion": {
  "vi": "Lãnh Địa Tử Linh",
  "features": [
   "Mở rộng vùng điều khiển summon",
   "Tăng khả năng duy trì thuộc hạ",
   "Đổi vị trí triệu hồi linh hoạt hơn",
   "Thuộc hạ hợp kích mục tiêu đánh dấu"
  ]
 },
 "citadel_protocol": {
  "vi": "Quy Trình Pháo Đài",
  "features": [
   "Thiết bị dựng nhanh hơn",
   "Công trình bền hơn khi đứng cạnh",
   "Bẫy phối hợp tháp bắn",
   "Kích hoạt chế độ phòng thủ đồng bộ"
  ]
 },
 "legion_banner": {
  "vi": "Quân Kỳ Đoàn Quân",
  "features": [
   "Quân kỳ tồn tại lâu hơn",
   "Tăng chống gián đoạn gần cờ",
   "Tăng vùng ảnh hưởng hiệu lệnh",
   "Hiệu lệnh phản công khi bị bao vây"
  ]
 },
 "eternal_mark": {
  "vi": "Dấu Ấn Vĩnh Cửu",
  "features": [
   "Dấu ấn duy trì lâu hơn",
   "Tăng độ ổn định bắn theo dấu",
   "Chuyển dấu qua kẻ địch khi hạ mục tiêu",
   "Đòn trúng dấu tạo lần truy kích cuối"
  ]
 },
 "death_whisper": {
  "vi": "Khúc Cầu Hồn Im Lặng",
  "features": [
   "Combo cuối ra đòn nhanh hơn",
   "Đánh trúng tạo cửa sổ rút lui",
   "Thoát ra sau finisher gần như tức thì",
   "Gây bóng chém thứ hai lên mục tiêu trúng cuối"
  ]
 },
 "sovereign_step": {
  "vi": "Bước Chân Chúa Tể",
  "features": [
   "Lướt dịch chuyển xa hơn",
   "Bỏ qua cản trở nhỏ",
   "Tạo bóng đứng trước vị trí cũ",
   "Cho phép nối skill sau khi hoàn tất bước"
  ]
 },
 "abyss_judgment": {
  "vi": "Phán Quyết Vực Sâu",
  "features": [
   "Giảm trễ vung kiếm lớn",
   "Tăng phạm vi sóng kiếm",
   "Sóng kiếm đánh trúng cả tầng bệ thấp",
   "Làn sóng thứ hai yếu đuổi theo"
  ]
 },
 "death_symphony": {
  "vi": "Giao Hưởng Tử Vong",
  "features": [
   "Rút ngắn thời gian ra hiệu",
   "Tăng số lượt thuộc hạ đánh",
   "Hợp kích chuyển mục tiêu gần khi hạ gục",
   "Kết thúc bằng một đợt bộc phát linh lực"
  ]
 },
 "endless_will": {
  "vi": "Ý Chí Bất Tận",
  "features": [
   "Kháng ngắt sau tuyệt kỹ lâu hơn",
   "Hồi thể lực khi trụ vững",
   "Giảm phạt sau dùng Signature",
   "Tạo lá chắn ngắn khi kết thúc Ultimate"
  ]
 },
 "field_mend": {
  "vi": "Sơ Cứu Dã Chiến",
  "features": [
   "Tăng hồi phục ban đầu",
   "Giảm gián đoạn lúc sơ cứu",
   "Hồi thêm một đợt nhỏ sau khi thi triển",
   "Tạo chắn mỏng lên mục tiêu được cứu"
  ]
 },
 "flicker_ember": {
  "vi": "Tia Lửa Lập Lòe",
  "features": [
   "Tia lửa bay ổn định hơn",
   "Tăng tích lũy Burn",
   "Burn lan nhẹ sang mục tiêu sát bên",
   "Tia lửa để lại vệt cháy rất ngắn"
  ]
 },
 "water_drop": {
  "vi": "Giọt Nước",
  "features": [
   "Giọt nước bay nhanh hơn",
   "Mục tiêu trúng bị Wet lâu hơn",
   "Đẩy mục tiêu nhỏ ra xa hơn",
   "Giọt nước vỡ gây Wet trong vùng nhỏ"
  ]
 },
 "flame_arc": {
  "vi": "Cung Kiếm Lửa",
  "features": [
   "Giảm trễ vung kiếm kết hợp phép",
   "Tăng tích lũy Burn",
   "Quét lửa rộng thêm góc cuối",
   "Vệt lửa bám lại rất ngắn sau chém"
  ]
 },
 "water_mend": {
  "vi": "Thủy Trị",
  "features": [
   "Tăng lượng hồi phục theo thời gian",
   "Kéo dài hiệu ứng Regen",
   "Thi triển lên đồng minh ở xa hơn",
   "Kết thúc Regen hồi thêm một đợt nhỏ"
  ]
 },
 "frost_guard": {
  "vi": "Hộ Vệ Băng Giá",
  "features": [
   "Lá chắn tồn tại lâu hơn",
   "Chill mạnh hơn khi chắn vỡ",
   "Chắn được thêm một đòn nhẹ",
   "Phá chắn giải phóng vầng băng nhỏ"
  ]
 },
 "gust_step": {
  "vi": "Bước Gió",
  "features": [
   "Lướt nhanh hơn trên không",
   "Đổi hướng giữa chừng dễ hơn",
   "Nối được đòn không trung từ bước gió",
   "Bước gió thứ hai yếu theo hit confirm"
  ]
 },
 "stone_skin": {
  "vi": "Da Đá",
  "features": [
   "Gia tăng thời gian chống ngắt",
   "Tăng hiệu quả giảm đẩy lùi",
   "Chống một lần stagger nhẹ",
   "Khi hết da đá tạo lớp chắn phụ ngắn"
  ]
 },
 "thunder_jolt": {
  "vi": "Giật Sét",
  "features": [
   "Xung điện tới mục tiêu nhanh hơn",
   "Mục tiêu Wet nhận Shock mạnh hơn",
   "Điện nảy sang mục tiêu gần nếu Wet",
   "Trúng Shock mở cửa sổ nối phép ngắn"
  ]
 },
 "root_snare": {
  "vi": "Bẫy Rễ",
  "features": [
   "Rễ xuất hiện nhanh hơn",
   "Giữ chân lâu hơn",
   "Tăng vùng rễ ở mặt đất",
   "Rễ lan sang một mục tiêu sát cạnh"
  ]
 },
 "radiant_aegis": {
  "vi": "Thánh Thuẫn Quang",
  "features": [
   "Lớp chắn sáng kéo dài hơn",
   "Thanh tẩy Curse hiệu quả hơn",
   "Tạo chắn yếu cho đồng minh kề bên",
   "Thanh tẩy thành công hồi một lượng chắn nhỏ"
  ]
 },
 "umbra_bind": {
  "vi": "Trói Buộc U Ám",
  "features": [
   "Trói tối tác động nhanh hơn",
   "Giảm khả năng quái bứt khỏi vùng",
   "Gia tăng vùng áp chế tầm gần",
   "Curse kéo dài sau khi vùng trói kết thúc"
  ]
 },
 "ice_lance": {
  "vi": "Thương Băng",
  "features": [
   "Đạn băng bay nhanh hơn",
   "Tích lũy Chill mạnh hơn",
   "Xuyên một mục tiêu nhỏ",
   "Mũi băng tan tạo vùng lạnh rất ngắn"
  ]
 },
 "earth_wall": {
  "vi": "Tường Đất",
  "features": [
   "Tường tồn tại lâu hơn",
   "Tường chắn thêm một đợt đạn",
   "Cho phép đặt lệch cao độ trên bệ",
   "Tường vỡ hất nhẹ kẻ địch sát bên"
  ]
 },
 "conductive_surge": {
  "vi": "Sóng Dẫn Điện",
  "features": [
   "Xung điện lan xa hơn",
   "Kẻ địch Wet tích Shock mạnh",
   "Lan điện thêm một mục tiêu gần",
   "Sóng điện tạo khựng nối khi Wet"
  ]
 },
 "verdant_recovery": {
  "vi": "Hồi Phục Sinh Mộc",
  "features": [
   "Hồi phục sau tương tác Tự nhiên mạnh hơn",
   "Giảm hồi nội bộ của Regen",
   "Kéo dài hồi phục sau Root thành công",
   "Nhận một lớp chắn nhỏ khi hồi phục hoàn tất"
  ]
 },
 "tidal_sanctuary": {
  "vi": "Thánh Địa Thủy Triều",
  "features": [
   "Vùng chữa lành rộng hơn",
   "Tăng số lần hồi HP trong vùng",
   "Tạo Wet hỗ trợ tương tác cho kẻ địch đi vào",
   "Cuối hiệu lực hồi một đợt cho đồng minh còn trong vùng"
  ]
 },
 "storm_waltz": {
  "vi": "Vũ Khúc Bão Giông",
  "features": [
   "Đòn gió đầu nhanh hơn",
   "Sét phối hợp lên mục tiêu Wet",
   "Lốc rộng thêm và chuyển mục tiêu",
   "Kết thúc bằng sét lan yếu"
  ]
 }
};
// ===== V12: 39 skill mới. Số trong mô tả bậc là SỐ MẪU († = placeholder, chỉnh sau playtest), lấy theo thang skill cũ cùng nhóm. =====
Object.assign(skillDesign,{
 "snare_arrow":{vi:"Tên Bẫy Dây",features:["Chậm 0,8s → 1,1s†","Mục tiêu đang chạy: chậm +0,4s†","Bắn chéo xuống 45° từ bệ cao","Phát bắn ngắm kế tiếp lên mục tiêu bị trói +20% sát thương†"]},
 "cutpurse_toss":{vi:"Ném Đồ Cướp",features:["Startup 0,22s → 0,18s†, −3 thể lực","Khựng 0,2s → 0,35s†","Ném được khi đang lướt","Đồ ném rơi lại thành vật phẩm nhặt (35%)†"]},
 "spirit_ward":{vi:"Kết Giới Linh",features:["Hấp thụ 18 → 24 sát thương†","Hoàn 6 → 10 Soul khi vỡ†","Vỡ đẩy lùi 90px kẻ địch sát bên†","Bao phủ thuộc hạ trong 60px†"]},
 "axe_hook":{vi:"Móc Rìu",features:["Kéo 70 → 95px†","Kéo được quái brute (không kéo boss)","Kéo xong nối đòn bổ trong 0,4s†","Mất thăng bằng 0,3s → 0,5s†"]},
 "steady_draw":{vi:"Kéo Cung Vững",features:["Tán xạ −15% khi đứng yên†","Giữ ngắm −0,1s†","Phát đầu sau 0,5s đứng yên +12% sát thương†","Giữ hiệu lực khi bắn từ bệ cao"]},
 "corpse_lantern":{vi:"Đèn Lồng Tử Thi",features:["Tồn tại 6s → 8s†","Bán kính 120 → 160px†","Mỗi thuộc hạ trong vùng hồi 1 Soul/s cho chủ†","Kẻ địch chết trong vùng +3s đèn†"]},
 "soul_thread":{vi:"Sợi Hồn",features:["Sợi giữ tới 220px (R1: 160px)†","Đầu sợi dưới 40% HP hồi gấp 1,5×†","Nối được 2 thuộc hạ","Sợi đứt hồi tức thì 12 HP†"]},
 "soul_tithe":{vi:"Thuế Hồn",features:["Hoàn 4 → 6 Soul mỗi đòn trúng†","Sau Needle Stab startup −30%†","Mục tiêu bị nguyền hoàn gấp đôi","Đòn thứ 3 liên tiếp +40% phần bóng tối†"]},
 "veil_sense":{vi:"Giác Quan Màn Che",features:["Hiện hướng nhìn địch trong 150px†","Đòn lén đầu +25% sát thương†","Ẩn sau 1,2s đứng yên (R1: 2s)†","Đòn lén trúng: 0,3s iframe rút lui†"]},
 "phalanx_thrust":{vi:"Đâm Thương Phalanx",features:["Tầm 165 → 185px†","Giữ guard 0,2s trong lúc đâm†","Đẩy lùi quái nhỏ 70px†","Hai nhịp đâm khi đang giữ guard"]},
 "iron_charge":{vi:"Xung Phong Thiết Giáp",features:["Lao 180 → 230px†","Không bị ngắt đòn suốt quãng lao","Húc văng được brute","Kết thúc bằng nhát chém hất lên (launch)"]},
 "piercing_bolt":{vi:"Tên Xuyên Thấu",features:["Nạp 0,6s → 0,5s†","Xuyên 1 → 2 mục tiêu†","Mục tiêu thứ 2 nhận 120% sát thương†","Điểm yếu 3s: phát tiếp +15%†"]},
 "hunters_net":{vi:"Lưới Thợ Săn",features:["Rộng 140 → 180px†","Trói 1,0s → 1,4s†","Boss chậm 25% trong 2s†","Quăng từ bệ: lưới rơi thẳng xuống"]},
 "soul_rend":{vi:"Xé Hồn",features:["Startup −10%","Phần bóng tối ×1,5 lên mục tiêu bị nguyền†","Trúng cả 2 nhát hoàn 8 Soul†","Nguyền 2s sau đòn†"]},
 "smoke_veil":{vi:"Màn Khói Xương",features:["Khói 3s → 4s†","Địch mất dấu 1,5s → 2,2s†","Đòn lén trong khói +30%†","Thoát khói để lại bóng giả 1,5s†"]},
 "bone_spike_field":{vi:"Bãi Gai Xương",features:["Dải 160 → 220px†","Giữ chân 0,8s → 1,2s†","Gai trồi lần 2 sau 0,8s (60% sát thương)†","Thuộc hạ trong bãi +20% giáp†"]},
 "soul_siphon":{vi:"Hút Hồn",features:["Kênh 1,0s → 0,7s†","Mục tiêu bị nguyền: +50% Soul hút†","Kênh xong hồi 10 HP†","Hút tối đa 3 nguồn trong 140px†"]},
 "arc_welder":{vi:"Hàn Hồ Quang",features:["Tia 110 → 150px†","Sửa 15 → 25 độ bền/lần†","Shock lên mục tiêu Wet ×1,5†","Tia nhảy sang 1 mục tiêu trong 80px quanh công trình†"]},
 "fortify_module":{vi:"Mô-đun Gia Cố",features:["Hiệu lực 8s → 11s†","Độ bền công trình +40%†","Bản thân +20% giáp khi cách công trình <80px†","Công trình phản 30% sát thương đạn†"]},
 "marksman_breath":{vi:"Hơi Thở Xạ Thủ",features:["Nhịp đứng yên 0,8s → 0,6s†","Tên nhanh +15% sau nhịp thở†","Phát ngắm sau nhịp thở gây khựng 0,25s†","Giữ hiệu lực qua 1 lần né"]},
 "grave_attunement":{vi:"Cộng Hưởng Mộ Phần",features:["+0,5 Soul/s mỗi thuộc hạ (tối đa 3)†","Tính cả mục tiêu bị nguyền","Thuộc hạ chết hoàn 10 Soul†","Đủ 3 nguồn: +1 nhịp hồi 5 Soul/4s†"]},
 "warlord_stride":{vi:"Bước Chiến Chúa",features:["Xông 200 → 260px†","Mỗi đòn trúng +6 giáp hồn (tối đa 30)†","Kháng ngắt toàn bộ quãng xông","Kết thúc: đập đất đẩy lùi 120px†"]},
 "skyfall_arrow":{vi:"Mưa Tên Thiên Giáng",features:["Trễ 1,2s → 0,9s†","Vùng 180 → 240px†","Tên rơi khựng 0,2s quái nhỏ†","Đợt 2 sau 0,6s, 50% sát thương†"]},
 "shadow_execution":{vi:"Xử Quyết Bóng Tối",features:["Startup −12%","Ngưỡng xử quyết 25% → 35% HP (sát thương ×2,5)†","Hụt: phạt recovery 0,9s → 0,6s†","Thành công: +15 thể lực, ẩn 1s†"]},
 "necrotic_wave":{vi:"Sóng Hoại Tử",features:["Sóng đi 300 → 380px†","Nguyền 3s → 4,5s†","Sóng leo bệ cao ≤ 60px†","Mục tiêu đã nguyền bị đánh thêm 1 lần (50%)†"]},
 "siege_turret":{vi:"Pháo Công Thành",features:["Dựng 1,2s → 0,9s†","Đạn bỏ qua 50% giáp†","Tự sửa 2 độ bền/s khi không bị đánh†","Đạn nổ 60px khi chạm đất†"]},
 "unyielding_bones":{vi:"Xương Bất Khuất",features:["Giảm sát thương 10% → 15% khi HP < 50%†","Chống đẩy lùi +50%†","Ngưỡng 50% → 60% HP†","Kích hoạt: +20 thể lực (1 lần/trận)†"]},
 "arcane_reservoir":{vi:"Bể Linh Lực",features:["Mana/Soul tối đa +15 → +25†","Hồi +2/s sau 2s không dùng skill†","Skill đầu sau khi nghỉ −30% chi phí†","Hồi cả khi đang né"]},
 "sovereign_bulwark":{vi:"Thành Lũy Chúa Tể",features:["Tường 100 → 140px†","Phản 100% → 150% đòn đầu†","Chắn cả đạn phép","Tường vỡ: sóng đẩy lùi 150px†"]},
 "oblivion_pulse":{vi:"Xung Hư Vô",features:["Bán kính 150 → 200px†","Xóa 1 → 2 buff†","Thuộc hạ hợp kích sau 0,3s (R1: 0,8s)†","Mục tiêu bị nguyền 3s và chậm 30%†"]},
 "raise_skeleton":{vi:"Dựng Xương Lính",features:["Lính sống 10s → 13s†","Máu 20 → 26†","Lính đánh trúng gây khựng 0,15s†","Gọi 2 lính (mỗi con 70% máu)†"]},
 "bone_archer":{vi:"Xạ Thủ Hài Cốt",features:["Bắn mỗi 1,1s → 0,9s†","Tầm 320 → 380px†","Tên gây chậm 0,4s†","Lùi tự động khi địch áp sát <60px†"]},
 "bone_knight":{vi:"Kỵ Sĩ Xương",features:["Máu 45 → 58†","Chặn 30% sát thương bay về chủ khi đứng chắn†","Đòn gây khựng 0,3s†","Hết thời gian nổ thành lá chắn 10 cho chủ†"]},
 "soul_wraith":{vi:"Oán Linh",features:["Tốc 220 → 270px/s†","Mục tiêu bị nguyền nhận ×1,5 sát thương†","Bay qua được hố và bệ","Mục tiêu chết làm oán linh sống thêm 3s†"]},
 "long_draw":{vi:"Kéo Dài Dây",features:["Nạp 1,0s → 0,85s†","Bỏ qua 30% giáp†","Đứng yên ≥1s: +25% sát thương†","Xuyên 1 mục tiêu khi nạp đầy"]},
 "tomb_pilfer":{vi:"Vét Mộ",features:["Tỷ lệ rơi đồ 30% → 45%†","Rơi thêm 5 chiến tích (1 lần/mục tiêu)†","Trúng từ sau lưng rơi chắc chắn","Đồ hồi phục rơi ra mạnh hơn (+50%)†"]},
 "shield_wall":{vi:"Tường Khiên",features:["Tường 2s → 3s†","Chắn cả đạn phép","Đâm qua khe khiên mỗi 0,5s†","Tường hết hạn: đẩy lùi 100px†"]},
 "hunt_call":{vi:"Hiệu Lệnh Săn",features:["Chó săn 6s → 8s†","Ưu tiên mục tiêu có Hunter Mark (+30% sát thương)†","Gọi 2 chó","Chó cắn gây chậm 1s†"]},
 "harvest_step":{vi:"Bước Gặt Hồn",features:["Lướt 150 → 190px†","Gặt 8 → 12 Soul từ mục tiêu bị nguyền†","Vết cắt chảy 3 tick sát thương bóng tối†","Lướt qua 2 mục tiêu"]},
 // V12.3 — Siege Gunner (nhánh tấn công của Craft) và cạnh Grave Bandit → Shade Stalker
 "heavy_bolt":{vi:"Mũi Nỏ Nặng",features:["Nạp 0,6s → 0,45s†","Xuyên 30% giáp†","Trúng mục tiêu đang Root gây khựng 0,4s†","Mũi nỏ cắm lại trên đất, nhặt lại hoàn 50% Stamina†"]},
 "blast_charge":{vi:"Khối Nổ Phế Liệu",features:["Nổ 70 → 90px†","Kíp nổ 0,8s → 0,5s†","Mảnh văng gây thêm 1 hit nhỏ†","Đặt được tối đa 2 khối cùng lúc†"]},
 "breach_cannon":{vi:"Pháo Phá Thành",features:["Nạp 1,1s → 0,8s†","Đạn xuyên 2 mục tiêu†","Giật lùi tự thân ngắn hơn†","Đạn nổ 80px khi chạm tường/đất†"]},
 "shadow_climb":{vi:"Bám Bóng",features:["Bám tường lâu hơn 1s†","Thả người xuống tính là đánh lén†","Bật tường lần hai†","Bám xong ẩn thân 0,8s†"]},
 "overclock":{vi:"Quá Tải",features:["Hiệu lực 5s → 7s†","Thiết bị mất 10 → 6 độ bền/s khi quá tải†","Bẫy trong vùng nổ lại 1 lần†","Thiết bị hỏng vì quá tải nổ 80px†"]},
 "bone_tempest":{vi:"Bão Xương",features:["Xoay 6 → 8 nhát†","Bán kính 120 → 150px†","Kháng ngắt đòn khi xoay","Đập đất cuối đẩy lùi 160px, khựng 0,4s†"]},
 "hundred_barbs":{vi:"Trăm Gai",features:["Loạt 8 → 11 tên†","Xuyên mọi mục tiêu trên tuyến","Bãi gai tồn tại 4s, giữ chân 0,6s†","Tên cắm nổ khi hết hạn (40% sát thương)†"]},
 "veil_massacre":{vi:"Tàn Sát Trong Màn",features:["Đâm 5 → 7 nhát†","Iframe suốt chuỗi","Tối đa 3 → 4 mục tiêu†","Kết thúc sau lưng mục tiêu cuối, ẩn 1,5s†"]}
});
const curves={
 attack:[100,112,125,140,160], defense:[100,110,122,136,152],
 control:[100,108,118,130,145], mobility:[100,108,116,128,142],
 healing:[100,112,126,142,160], support:[100,110,120,135,150],
 summon:[100,112,128,148,170], utility:[100,110,120,132,145],
 passive:[100,112,126,142,160]
};
const cooldown=[100,96,92,88,84],startup=[100,95,90,85,80];
const trialObjectives={
 "Bone Fighter": "Đỡ một đợt tấn công bằng khiên và đánh bại chiến binh tập luyện",
 "Skeleton Archer": "Hạ xạ thủ tập luyện từ xa và vượt đoạn địa hình có bục cao",
 "Bone Rogue": "Vượt hành lang cơ động, đánh bại lính canh cơ động",
 "Bone Acolyte": "Hạ mục tiêu bằng phép và sống sót trước đợt quái tử linh",
 "Bone Tinkerer": "Dùng bẫy khống chế rồi đánh bại quái trên đường đến cổng",
 "Bone Guard": "Chống chịu đợt lính cận chiến và hạ người giữ khiên",
 "Bone Duelist": "Đấu một kiếm sĩ phản công có nhiều nhịp đánh",
 "Bone Raider": "Đánh bại giáp binh chậm và một mục tiêu cơ động",
 "Bone Marksman": "Hạ các mục tiêu phân bố trên nhiều độ cao bằng cung",
 "Grave Hunter": "Vượt màn có bẫy rồi đánh bại kẻ truy đuổi",
 "Grave Assassin": "Hạ lính cảnh giới và kiếm sĩ bảo vệ mục tiêu cuối",
 "Grave Bandit": "Vượt phục kích nhóm và thoát qua cổng sau khi hạ đối thủ",
 "Necromancer": "Chống chịu làn sóng quái với triệu hồi và phép hỗ trợ",
 "Soul Medium": "Trụ trước đợt pháp sư và khống chế rồi hoàn thành trận",
 "Bone Engineer": "Bảo vệ vị trí trước nhiều đối thủ sử dụng công cụ",
 "Bone Phalanx": "Giữ tuyến chống lại lính xung kích và giáp binh",
 "Dread Knight": "Đánh bại giáp binh và pháp sư trong cùng thử thách",
 "Sword Wraith": "Chiến thắng trận quyết đấu tốc độ trước kiếm sĩ tinh nhuệ",
 "Grave Marauder": "Quét sạch nhóm cận chiến gồm giáp binh và trinh sát",
 "Phantom Sniper": "Hạ nhóm mục tiêu tầm xa với vị trí bắn khó",
 "Wild Hunt Captain": "Đánh bại đội săn gồm trinh sát và cung thủ",
 "Soul Assassin": "Đánh bại sát thủ cơ động cùng pháp sư hỗ trợ",
 "Shade Stalker": "Vượt qua các đoạn địa hình nguy hiểm và hạ trinh sát",
 "Grand Necromancer": "Trụ trước nhiều đợt tấn công để hạ chỉ huy",
 "Soul Weaver": "Hoàn thành trận đấu dài trước hỗn hợp pháp sư và giáp binh",
 "Bone Tinkerer Prime": "Đánh bại nhóm quái công thành với thiết bị phòng ngự",
 "Siege Gunner": "Phá hàng giáp binh bằng hỏa lực nặng trước khi bị áp sát, rồi tới cổng",
 "Legion Marshal": "Thắng trận giữ tuyến trước một chỉ huy giáp nặng",
 "Death Knight": "Đánh bại tinh anh chống chịu và pháp sư tử linh",
 "Eternal Huntsman": "Hạ mục tiêu săn đặc biệt cùng các trinh sát hộ vệ",
 "Death Whisper": "Thắng trận sát thủ cuối gồm nhiều kẻ địch tốc độ cao",
 "Lich King": "Chiến thắng thủ lĩnh quái cùng đội quân hỗ trợ",
 "Bone Architect": "Giữ thành trước nhóm quái đa hướng và tinh anh",
 "Abyss Sovereign": "Hạ thủ lĩnh vực sâu trong trận thử thách cuối",
 "Death Sovereign": "Thắng thủ lĩnh tử linh và các hộ vệ triệu hồi"
};
function modelFor(s){
 const archetype=s.kind==='passive'?'passive':
  s.roles.includes('summon')?'summon':
  s.roles.includes('healing')?'healing':
  s.roles.includes('defense')?'defense':
  s.roles.includes('control')&&!s.roles.includes('attack')?'control':
  s.roles.includes('mobility')&&!s.roles.includes('attack')?'mobility':
  s.roles.includes('attack')?'attack':
  s.roles.includes('support')?'support':'utility';
 const authored=skillDesign[s.id];if(!authored)throw Error('V11 missing skill translation: '+s.id);
 return {nameVi:authored.vi,nameEn:s.name,archetype,ranks:curves[archetype].map((potency,i)=>({rank:i+1,potency,
   cooldown:s.kind==='passive'?null:cooldown[i],startup:s.kind==='passive'?null:startup[i],
   feature:i===0?s.desc:authored.features[i-1]}))};
}
const labelJob=id=>jobs[id]?`${jobs[id]} / ${jobEn(id)}`:id;
const labelSkill=id=>skillDesign[id]?`${skillDesign[id].vi} / ${id}`:id;
window.SkeletonV11Data={jobs,jobsEn,jobEn,skillDesign,trialObjectives,curves,cooldown,startup,modelFor,labelJob,labelSkill};
})();

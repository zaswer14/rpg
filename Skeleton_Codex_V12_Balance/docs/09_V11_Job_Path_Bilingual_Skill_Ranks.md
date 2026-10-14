# Skeleton Codex V11 — Hệ chuyển nghề hoàn chỉnh, Skill Rank 1–5 và tên Việt/English

**Nguồn nền:** Skeleton Codex V10 Playable và 104 SkillDefinition gốc; **ngày:** 13/10/2026. **Thiết kế:** hoàn tất danh sách nghề, nhánh, skill gate, Mastery, Trial và thông số rank mục tiêu. Chưa thực hiện art; chưa coi là cân bằng cuối.

## 1. Quy tắc bắt buộc và nguồn sự thật

1. **35 nghề**, Tier 0–5, **36 cạnh chuyển nghề**; Wanderer là Tier 0. Mọi cạnh đi từ Tier `n` lên `n+1`. Một số nghề **Terminal** dừng ở Tier 3/4/5, không thể quay lại hay chuyển ngang.
2. Chỉ chuyển nghề nếu `CurrentJob.to` có nghề đích; hoàn thành huấn luyện để nhận **2 skill gate Rank 1** (nếu chưa có), nâng **cả hai lên Rank 5**, đạt ngưỡng **Mastery** nghề đích, sau đó **thắng Trial** nghề đích. Chuyển nghề cần nhấn xác nhận và có tính một chiều.
3. **Không có điều kiện Level tối thiểu bổ sung** trong V10/V11: Level = số skill có Rank 5; không tự cộng stat khi tăng Level và không reset khi chuyển nghề. Tất cả stat vĩnh viễn đến từ `rankRewards` của từng skill (được tính lại từ rank đã lưu).
4. Mastery 0–100 được tích lũy qua chơi thật; không còn slider tăng giả. Với nghề có **nhiều tiền nhiệm**, cả hai cạnh đều dùng gate 2 skill + Mastery + Trial **của nghề đích** (ví dụ Grave Marauder hoặc Soul Weaver). Huấn luyện được thưởng một lần mỗi nghề đích.
5. 104 skill có ID và tên tiếng Anh không thay đổi để bảo toàn save. `nameVi` chỉ là khóa hiển thị; có thể tìm kiếm Việt/Anh. Rarity trắng/lục/lam/tím/vàng/đỏ và chi phí nâng giữ V10.
6. **Bậc 1–5 khác Tier và khác độ hiếm.** Chỉ số cộng được giữ vĩnh viễn kể cả khi không lắp skill. Skill ở Tier thấp vẫn có thể học và max sau khi lên Tier cao; quyền **sử dụng/lắp** tuân thủ nghề/vũ khí/attunement.

## 2. Chỉ số nhân vật và cách cộng từ 5 bậc

| Chỉ số | Nghĩa | Gốc | Cách tăng |
|---|---|---:|---|
| `STR` | Sức mạnh | 5 | Nhận reward ở các mốc rank của skill |
| `DEX` | Khéo léo | 5 | Nhận reward ở các mốc rank của skill |
| `VIT` | Thể chất | 5 | Nhận reward ở các mốc rank của skill |
| `INT` | Trí tuệ | 5 | Nhận reward ở các mốc rank của skill |
| `WIL` | Ý chí | 5 | Nhận reward ở các mốc rank của skill |
| `AGI` | Nhanh nhẹn | 5 | Nhận reward ở các mốc rank của skill |

Ví dụ `Rising Chip / Chém Hất Mảnh`: R1–2 **không** cộng stat; R3 nhận `+1 STR`; R4 vẫn tổng `+1 STR`; R5 nhận thêm `+1 STR, +1 DEX` → **tổng** `+2 STR, +1 DEX`. Tháo skill hoặc chuyển nghề không lấy lại điểm này. Hệ thống không cộng thưởng hai lần khi đọc save.

### Hệ số nâng hiệu lực đề xuất V11 (so với hiệu lực R1 = 100%)

| Nhóm chức năng | R1 | R2 | R3 | R4 | R5 |
|---|---:|---:|---:|---:|---:|
| Tấn công | 100% | 112% | 125% | 140% | 160% |
| Phòng thủ | 100% | 110% | 122% | 136% | 152% |
| Khống chế | 100% | 108% | 118% | 130% | 145% |
| Cơ động | 100% | 108% | 116% | 128% | 142% |
| Hồi phục | 100% | 112% | 126% | 142% | 160% |
| Hỗ trợ | 100% | 110% | 120% | 135% | 150% |
| Triệu hồi | 100% | 112% | 128% | 148% | 170% |
| Tiện ích | 100% | 110% | 120% | 132% | 145% |
| Nội tại | 100% | 112% | 126% | 142% | 160% |

Các hệ số ở trên là **mục tiêu authoring cho hiệu lực chính** (sát thương, lượng hồi phục, thời lượng khống chế, số lần hỗ trợ hoặc sức mạnh nội tại theo từng cơ chế); **không phải điểm STR/DEX/...** và không tự nhân mọi thuộc tính cùng lúc. Tác dụng đặc thù từng rank trình bày ở mục 5. Mỗi skill chỉ theo **một** nhánh hiệu lực chính, tránh nhân chồng vô hạn.

| Thông số Active / Signature | R1 | R2 | R3 | R4 | R5 |
|---|---:|---:|---:|---:|---:|
| Hồi chiêu so với CD gốc | 100% | 96% | 92% | 88% | 84% |
| Startup so với thời gian gốc | 100% | 95% | 90% | 85% | 80% |
| Điểm chỉ số vĩnh viễn | Theo reward của skill, **không** theo đường cong ở trên | Theo reward | Theo reward | Theo reward | Theo reward |

**Runtime hiện tại:** V11 đã nối hệ số direct damage, cooldown và startup từ bảng này vào game. Các nhóm hồi phục/đỡ/bẫy/triệu hồi/nội tại vẫn dùng bộ xử lý chung V10 (thực tế có nhiều công thức dựa trên rank). Những thay đổi hành vi độc lập ghi trong từng skill dưới đây là **thiết kế**, không khẳng định tất cả đã có runtime/animation riêng. Không dùng bảng mục tiêu để tuyên bố game đã cân bằng.

### Chi phí nâng (giữ nguyên V10)
| Độ hiếm | R1→2 | R2→3 | R3→4 | R4→5 | Tổng |
|---|---:|---:|---:|---:|---:|
| Trắng | 1 | 2 | 2 | 3 | 8 |
| Lục | 2 | 3 | 3 | 5 | 13 |
| Lam | 2 | 4 | 4 | 6 | 16 |
| Tím | 3 | 6 | 6 | 9 | 24 |
| Vàng | 5 | 10 | 10 | 15 | 40 |
| Đỏ | 8 | 16 | 16 | 24 | 64 |

## 3. Danh mục 35 nghề song ngữ theo Tier

### Tier 0
| Tên Việt / English | Power | Nghề tiền nhiệm | Hướng tiếp theo |
|---|---|---|---|
| Kẻ Lang Thang / Wanderer | C | Khởi đầu | Chiến Binh Xương / Bone Fighter, Cung Thủ Xương / Skeleton Archer, Đạo Tặc Xương / Bone Rogue, Tập Sự Tử Thuật / Bone Acolyte, Thợ Chế Tác Xương / Bone Tinkerer |

### Tier 1
| Tên Việt / English | Power | Nghề tiền nhiệm | Hướng tiếp theo |
|---|---|---|---|
| Chiến Binh Xương / Bone Fighter | B | Kẻ Lang Thang / Wanderer | Vệ Binh Xương / Bone Guard, Kiếm Sĩ Xương / Bone Duelist, Chiến Binh Cướp Phá / Bone Raider |
| Cung Thủ Xương / Skeleton Archer | B | Kẻ Lang Thang / Wanderer | Thiện Xạ Xương / Bone Marksman, Thợ Săn Mộ / Grave Hunter |
| Đạo Tặc Xương / Bone Rogue | A | Kẻ Lang Thang / Wanderer | Sát Thủ Mộ / Grave Assassin, Đạo Tặc Hầm Mộ / Grave Bandit |
| Tập Sự Tử Thuật / Bone Acolyte | C | Kẻ Lang Thang / Wanderer | Pháp Sư Tử Linh / Necromancer, Linh Môi / Soul Medium |
| Thợ Chế Tác Xương / Bone Tinkerer | C | Kẻ Lang Thang / Wanderer | Kỹ Sư Xương / Bone Engineer |

### Tier 2
| Tên Việt / English | Power | Nghề tiền nhiệm | Hướng tiếp theo |
|---|---|---|---|
| Vệ Binh Xương / Bone Guard | B | Chiến Binh Xương / Bone Fighter | Vệ Quân Khiên Thương / Bone Phalanx, Kỵ Sĩ Kinh Hoàng / Dread Knight |
| Kiếm Sĩ Xương / Bone Duelist | A | Chiến Binh Xương / Bone Fighter | Kiếm Hồn / Sword Wraith |
| Chiến Binh Cướp Phá / Bone Raider | A | Chiến Binh Xương / Bone Fighter | Kẻ Tàn Phá Lăng Mộ / Grave Marauder |
| Thiện Xạ Xương / Bone Marksman | A | Cung Thủ Xương / Skeleton Archer | Xạ Thủ U Linh / Phantom Sniper |
| Thợ Săn Mộ / Grave Hunter | B | Cung Thủ Xương / Skeleton Archer | Đội Trưởng Cuộc Săn / Wild Hunt Captain |
| Sát Thủ Mộ / Grave Assassin | A | Đạo Tặc Xương / Bone Rogue | Sát Thủ Đoạt Hồn / Soul Assassin, Kẻ Rình Rập Bóng Tối / Shade Stalker |
| Đạo Tặc Hầm Mộ / Grave Bandit | C | Đạo Tặc Xương / Bone Rogue | Kẻ Tàn Phá Lăng Mộ / Grave Marauder |
| Pháp Sư Tử Linh / Necromancer | A | Tập Sự Tử Thuật / Bone Acolyte | Đại Pháp Sư Tử Linh / Grand Necromancer, Kẻ Dệt Linh Hồn / Soul Weaver |
| Linh Môi / Soul Medium | B | Tập Sự Tử Thuật / Bone Acolyte | Kẻ Dệt Linh Hồn / Soul Weaver |
| Kỹ Sư Xương / Bone Engineer | B | Thợ Chế Tác Xương / Bone Tinkerer | Đại Thợ Chế Tác Xương / Bone Tinkerer Prime |

### Tier 3
| Tên Việt / English | Power | Nghề tiền nhiệm | Hướng tiếp theo |
|---|---|---|---|
| Vệ Quân Khiên Thương / Bone Phalanx | B | Vệ Binh Xương / Bone Guard | Thống Soái Quân Đoàn / Legion Marshal |
| Kỵ Sĩ Kinh Hoàng / Dread Knight | A | Vệ Binh Xương / Bone Guard | Kỵ Sĩ Tử Vong / Death Knight |
| Kiếm Hồn / Sword Wraith | S | Kiếm Sĩ Xương / Bone Duelist | **Terminal — không chuyển tiếp** |
| Kẻ Tàn Phá Lăng Mộ / Grave Marauder | A | Chiến Binh Cướp Phá / Bone Raider, Đạo Tặc Hầm Mộ / Grave Bandit | **Terminal — không chuyển tiếp** |
| Xạ Thủ U Linh / Phantom Sniper | A | Thiện Xạ Xương / Bone Marksman | Thợ Săn Vĩnh Hằng / Eternal Huntsman |
| Đội Trưởng Cuộc Săn / Wild Hunt Captain | B | Thợ Săn Mộ / Grave Hunter | **Terminal — không chuyển tiếp** |
| Sát Thủ Đoạt Hồn / Soul Assassin | A | Sát Thủ Mộ / Grave Assassin | Lời Thì Thầm Tử Vong / Death Whisper |
| Kẻ Rình Rập Bóng Tối / Shade Stalker | B | Sát Thủ Mộ / Grave Assassin | **Terminal — không chuyển tiếp** |
| Đại Pháp Sư Tử Linh / Grand Necromancer | A | Pháp Sư Tử Linh / Necromancer | Vua Vu Yêu / Lich King |
| Kẻ Dệt Linh Hồn / Soul Weaver | B | Pháp Sư Tử Linh / Necromancer, Linh Môi / Soul Medium | **Terminal — không chuyển tiếp** |
| Đại Thợ Chế Tác Xương / Bone Tinkerer Prime | C | Kỹ Sư Xương / Bone Engineer | Kiến Trúc Sư Xương / Bone Architect |

### Tier 4
| Tên Việt / English | Power | Nghề tiền nhiệm | Hướng tiếp theo |
|---|---|---|---|
| Thống Soái Quân Đoàn / Legion Marshal | A | Vệ Quân Khiên Thương / Bone Phalanx | **Terminal — không chuyển tiếp** |
| Kỵ Sĩ Tử Vong / Death Knight | S | Kỵ Sĩ Kinh Hoàng / Dread Knight | Chúa Tể Vực Sâu / Abyss Sovereign |
| Thợ Săn Vĩnh Hằng / Eternal Huntsman | A | Xạ Thủ U Linh / Phantom Sniper | **Terminal — không chuyển tiếp** |
| Lời Thì Thầm Tử Vong / Death Whisper | S | Sát Thủ Đoạt Hồn / Soul Assassin | **Terminal — không chuyển tiếp** |
| Vua Vu Yêu / Lich King | S | Đại Pháp Sư Tử Linh / Grand Necromancer | Chúa Tể Tử Vong / Death Sovereign |
| Kiến Trúc Sư Xương / Bone Architect | B | Đại Thợ Chế Tác Xương / Bone Tinkerer Prime | **Terminal — không chuyển tiếp** |

### Tier 5
| Tên Việt / English | Power | Nghề tiền nhiệm | Hướng tiếp theo |
|---|---|---|---|
| Chúa Tể Vực Sâu / Abyss Sovereign | S | Kỵ Sĩ Tử Vong / Death Knight | **Terminal — không chuyển tiếp** |
| Chúa Tể Tử Vong / Death Sovereign | S | Vua Vu Yêu / Lich King | **Terminal — không chuyển tiếp** |

## 4. Tất cả 36 đường chuyển nghề và điều kiện đầy đủ

Mỗi hàng sau bao gồm **chính xác các điều kiện dữ liệu V10**: cạnh tiền nhiệm, hai skill bắt buộc tối đa rank 5, Mastery tối thiểu và Trial. Mô tả Trial cụ thể là **đề xuất V11**; gameplay hiện yêu cầu thắng trận Trial chung, hạ hết địch và tới cổng.

### Chuyển lên Tier 1
| # | Từ → Đến (Việt / English) | Cặp skill cần R5 | Mastery | Trial V10 và mục tiêu đề xuất V11 |
|---:|---|---|---|---|
| 1 | **Kẻ Lang Thang / Wanderer** → **Chiến Binh Xương / Bone Fighter** | Chém Kiếm Sứt / Cracked Slash **R5**; Thủ Thế / Brace **R5** | Sword ≥ 10 | Weapon initiation — Đỡ một đợt tấn công bằng khiên và đánh bại chiến binh tập luyện |
| 2 | **Kẻ Lang Thang / Wanderer** → **Cung Thủ Xương / Skeleton Archer** | Ném Đá / Stone Throw **R5**; Ném Đá Ngắm / Aimed Stone **R5** | Throwing ≥ 10 | Target challenge — Hạ xạ thủ tập luyện từ xa và vượt đoạn địa hình có bục cao |
| 3 | **Kẻ Lang Thang / Wanderer** → **Đạo Tặc Xương / Bone Rogue** | Đâm Kim / Needle Stab **R5**; Lướt Xương / Bone Dash **R5** | Dagger ≥ 10 | Shadow trial — Vượt hành lang cơ động, đánh bại lính canh cơ động |
| 4 | **Kẻ Lang Thang / Wanderer** → **Tập Sự Tử Thuật / Bone Acolyte** | Xung Pháp Khí Cũ / Worn Focus Pulse **R5**; Đốm Bóng Tối / Shade Mote **R5** | Necromancy ≥ 10 | Soul initiation — Hạ mục tiêu bằng phép và sống sót trước đợt quái tử linh |
| 5 | **Kẻ Lang Thang / Wanderer** → **Thợ Chế Tác Xương / Bone Tinkerer** | Bẫy Dây Vụn / Junk Snare **R5**; Mắt Nhặt Nhạnh / Scavenger Eye **R5** | Engineering ≥ 10 | First construction — Dùng bẫy khống chế rồi đánh bại quái trên đường đến cổng |

### Chuyển lên Tier 2
| # | Từ → Đến (Việt / English) | Cặp skill cần R5 | Mastery | Trial V10 và mục tiêu đề xuất V11 |
|---:|---|---|---|---|
| 6 | **Chiến Binh Xương / Bone Fighter** → **Vệ Binh Xương / Bone Guard** | Tam Liên Chém Thô / Rough Three-Cut **R5**; Gõ Khiên / Shield Tap **R5** | Shield ≥ 30; Sword ≥ 20 | Shield trial — Chống chịu đợt lính cận chiến và hạ người giữ khiên |
| 7 | **Chiến Binh Xương / Bone Fighter** → **Kiếm Sĩ Xương / Bone Duelist** | Tam Liên Chém Thô / Rough Three-Cut **R5**; Chém Kiếm Rộng / Sword Cleave **R5** | Sword ≥ 35 | Duel trial — Đấu một kiếm sĩ phản công có nhiều nhịp đánh |
| 8 | **Chiến Binh Xương / Bone Fighter** → **Chiến Binh Cướp Phá / Bone Raider** | Tam Liên Chém Thô / Rough Three-Cut **R5**; Bổ Rìu Nứt / Cracked Axe Slam **R5** | Axe ≥ 30 | Raid trial — Đánh bại giáp binh chậm và một mục tiêu cơ động |
| 9 | **Cung Thủ Xương / Skeleton Archer** → **Thiện Xạ Xương / Bone Marksman** | Phát Bắn Ngắm / Aimed Shot **R5**; Tên Tách Đôi / Split Arrow **R5** | Bow ≥ 35 | Accuracy trial — Hạ các mục tiêu phân bố trên nhiều độ cao bằng cung |
| 10 | **Cung Thủ Xương / Skeleton Archer** → **Thợ Săn Mộ / Grave Hunter** | Phát Bắn Ngắm / Aimed Shot **R5**; Mắt Nhặt Nhạnh / Scavenger Eye **R5** | Bow ≥ 25; Stealth ≥ 15 | Tracking trial — Vượt màn có bẫy rồi đánh bại kẻ truy đuổi |
| 11 | **Đạo Tặc Xương / Bone Rogue** → **Sát Thủ Mộ / Grave Assassin** | Luồn Bóng / Shadow Slip **R5**; Dao Găm Nhử / Knife Feint **R5** | Dagger ≥ 30; Stealth ≥ 25 | Assassin trial — Hạ lính cảnh giới và kiếm sĩ bảo vệ mục tiêu cuối |
| 12 | **Đạo Tặc Xương / Bone Rogue** → **Đạo Tặc Hầm Mộ / Grave Bandit** | Luồn Bóng / Shadow Slip **R5**; Bẫy Dây Vụn / Junk Snare **R5** | Dagger ≥ 20; Axe ≥ 15 | Ambush trial — Vượt phục kích nhóm và thoát qua cổng sau khi hạ đối thủ |
| 13 | **Tập Sự Tử Thuật / Bone Acolyte** → **Pháp Sư Tử Linh / Necromancer** | Khúc Tụng Mộ / Grave Chant **R5**; Tia Linh Hồn / Soul Spark **R5** | Necromancy ≥ 35 | Summoning ritual — Chống chịu làn sóng quái với triệu hồi và phép hỗ trợ |
| 14 | **Tập Sự Tử Thuật / Bone Acolyte** → **Linh Môi / Soul Medium** | Khúc Tụng Mộ / Grave Chant **R5**; Sơ Cứu Dã Chiến / Field Mend **R5** | Soul ≥ 30 | Spirit trial — Trụ trước đợt pháp sư và khống chế rồi hoàn thành trận |
| 15 | **Thợ Chế Tác Xương / Bone Tinkerer** → **Kỹ Sư Xương / Bone Engineer** | Tháp Bắn Bỏ Túi / Pocket Turret **R5**; Mìn Phế Liệu / Scrap Mine **R5** | Engineering ≥ 35 | Forge trial — Bảo vệ vị trí trước nhiều đối thủ sử dụng công cụ |

### Chuyển lên Tier 3
| # | Từ → Đến (Việt / English) | Cặp skill cần R5 | Mastery | Trial V10 và mục tiêu đề xuất V11 |
|---:|---|---|---|---|
| 16 | **Vệ Binh Xương / Bone Guard** → **Vệ Quân Khiên Thương / Bone Phalanx** | Lời Thề Khiên / Shield Oath **R5**; Ký Ức Sắt Đá / Iron Memory **R5** | Shield ≥ 50; Spear ≥ 25 | Formation trial — Giữ tuyến chống lại lính xung kích và giáp binh |
| 17 | **Vệ Binh Xương / Bone Guard** → **Kỵ Sĩ Kinh Hoàng / Dread Knight** | Lời Thề Khiên / Shield Oath **R5**; Phản Đòn Thế Thủ / Guard Counter **R5** | Sword ≥ 50; Necromancy ≥ 25 | Dread oath — Đánh bại giáp binh và pháp sư trong cùng thử thách |
| 18 | **Kiếm Sĩ Xương / Bone Duelist** → **Kiếm Hồn / Sword Wraith** | Phản Kích Rắn Độc / Viper Riposte **R5**; Đúng Khoảnh Khắc / Perfect Timing **R5** | Sword ≥ 60; Soul ≥ 35 | Wraith trial — Chiến thắng trận quyết đấu tốc độ trước kiếm sĩ tinh nhuệ |
| 19 | **Chiến Binh Cướp Phá / Bone Raider** → **Kẻ Tàn Phá Lăng Mộ / Grave Marauder** | Bổ Rìu Nứt / Cracked Axe Slam **R5**; Lướt Xương / Bone Dash **R5** | Axe ≥ 45; Dagger ≥ 25 | Marauder trial — Quét sạch nhóm cận chiến gồm giáp binh và trinh sát |
| 20 | **Đạo Tặc Hầm Mộ / Grave Bandit** → **Kẻ Tàn Phá Lăng Mộ / Grave Marauder** | Bổ Rìu Nứt / Cracked Axe Slam **R5**; Lướt Xương / Bone Dash **R5** | Axe ≥ 45; Dagger ≥ 25 | Marauder trial — Quét sạch nhóm cận chiến gồm giáp binh và trinh sát |
| 21 | **Thiện Xạ Xương / Bone Marksman** → **Xạ Thủ U Linh / Phantom Sniper** | Mưa Tên / Arrow Volley **R5**; Phát Bắn Ngắm / Aimed Shot **R5** | Bow ≥ 60; Stealth ≥ 35 | Phantom sight — Hạ nhóm mục tiêu tầm xa với vị trí bắn khó |
| 22 | **Thợ Săn Mộ / Grave Hunter** → **Đội Trưởng Cuộc Săn / Wild Hunt Captain** | Dấu Ấn Thợ Săn / Hunter Mark **R5**; Bẫy Kẹp Chân / Ankle Trap **R5** | Bow ≥ 45; Stealth ≥ 35 | Hunt trial — Đánh bại đội săn gồm trinh sát và cung thủ |
| 23 | **Sát Thủ Mộ / Grave Assassin** → **Sát Thủ Đoạt Hồn / Soul Assassin** | Bước Chân U Linh / Phantom Step **R5**; Lướt Xương / Bone Dash **R5** | Dagger ≥ 50; Soul ≥ 40 | Soul trial — Đánh bại sát thủ cơ động cùng pháp sư hỗ trợ |
| 24 | **Sát Thủ Mộ / Grave Assassin** → **Kẻ Rình Rập Bóng Tối / Shade Stalker** | Bước Chân U Linh / Phantom Step **R5**; Bước Chân Êm / Quiet Tread **R5** | Stealth ≥ 55 | Shade trial — Vượt qua các đoạn địa hình nguy hiểm và hạ trinh sát |
| 25 | **Pháp Sư Tử Linh / Necromancer** → **Đại Pháp Sư Tử Linh / Grand Necromancer** | Triệu Hồi Vệ Binh Xương / Summon Bone Guard **R5**; Trói Hồn / Soul Bind **R5** | Necromancy ≥ 60; Soul ≥ 40 | Grand ritual — Trụ trước nhiều đợt tấn công để hạ chỉ huy |
| 26 | **Pháp Sư Tử Linh / Necromancer** → **Kẻ Dệt Linh Hồn / Soul Weaver** | Sơ Cứu Dã Chiến / Field Mend **R5**; Màn Nước / Water Veil **R5** | Soul ≥ 50 | Weaving trial — Hoàn thành trận đấu dài trước hỗn hợp pháp sư và giáp binh |
| 27 | **Linh Môi / Soul Medium** → **Kẻ Dệt Linh Hồn / Soul Weaver** | Sơ Cứu Dã Chiến / Field Mend **R5**; Màn Nước / Water Veil **R5** | Soul ≥ 50 | Weaving trial — Hoàn thành trận đấu dài trước hỗn hợp pháp sư và giáp binh |
| 28 | **Kỹ Sư Xương / Bone Engineer** → **Đại Thợ Chế Tác Xương / Bone Tinkerer Prime** | Triển Khai Tháp Canh / Deploy Sentry **R5**; Sửa Chữa Tại Chỗ / Field Repair **R5** | Engineering ≥ 50 | Machine trial — Đánh bại nhóm quái công thành với thiết bị phòng ngự |

### Chuyển lên Tier 4
| # | Từ → Đến (Việt / English) | Cặp skill cần R5 | Mastery | Trial V10 và mục tiêu đề xuất V11 |
|---:|---|---|---|---|
| 29 | **Vệ Quân Khiên Thương / Bone Phalanx** → **Thống Soái Quân Đoàn / Legion Marshal** | Nhịp Hộ Vệ / Guardian Pulse **R5**; Lời Thề Khiên / Shield Oath **R5** | Shield ≥ 70; Spear ≥ 55 | Legion trial — Thắng trận giữ tuyến trước một chỉ huy giáp nặng |
| 30 | **Kỵ Sĩ Kinh Hoàng / Dread Knight** → **Kỵ Sĩ Tử Vong / Death Knight** | Đại Kiếm Khiếp Sợ / Dread Cleaver **R5**; Xung Kích Oán Linh / Wraith Rush **R5** | Sword ≥ 70; Necromancy ≥ 60 | Death trial — Đánh bại tinh anh chống chịu và pháp sư tử linh |
| 31 | **Xạ Thủ U Linh / Phantom Sniper** → **Thợ Săn Vĩnh Hằng / Eternal Huntsman** | Đường Đạn U Linh / Ghostline Shot **R5**; Phát Bắn Ngắm / Aimed Shot **R5** | Bow ≥ 85 | Eternal hunt — Hạ mục tiêu săn đặc biệt cùng các trinh sát hộ vệ |
| 32 | **Sát Thủ Đoạt Hồn / Soul Assassin** → **Lời Thì Thầm Tử Vong / Death Whisper** | Bước Chân U Linh / Phantom Step **R5**; Lướt Xương / Bone Dash **R5** | Dagger ≥ 80; Soul ≥ 60 | Silent trial — Thắng trận sát thủ cuối gồm nhiều kẻ địch tốc độ cao |
| 33 | **Đại Pháp Sư Tử Linh / Grand Necromancer** → **Vua Vu Yêu / Lich King** | Hiệu Triệu Quân Đoàn / Legion Call **R5**; Triệu Hồi Vệ Binh Xương / Summon Bone Guard **R5** | Necromancy ≥ 85; Soul ≥ 70 | Crown trial — Chiến thắng thủ lĩnh quái cùng đội quân hỗ trợ |
| 34 | **Đại Thợ Chế Tác Xương / Bone Tinkerer Prime** → **Kiến Trúc Sư Xương / Bone Architect** | Triển Khai Tháp Canh / Deploy Sentry **R5**; Tháp Bắn Bỏ Túi / Pocket Turret **R5** | Engineering ≥ 80 | Citadel trial — Giữ thành trước nhóm quái đa hướng và tinh anh |

### Chuyển lên Tier 5
| # | Từ → Đến (Việt / English) | Cặp skill cần R5 | Mastery | Trial V10 và mục tiêu đề xuất V11 |
|---:|---|---|---|---|
| 35 | **Kỵ Sĩ Tử Vong / Death Knight** → **Chúa Tể Vực Sâu / Abyss Sovereign** | Phán Quyết Tử Thần / Reaper Verdict **R5**; Đại Kiếm Khiếp Sợ / Dread Cleaver **R5** | Sword ≥ 95; Necromancy ≥ 85 | Abyss trial — Hạ thủ lĩnh vực sâu trong trận thử thách cuối |
| 36 | **Vua Vu Yêu / Lich King** → **Chúa Tể Tử Vong / Death Sovereign** | Lãnh Địa Tử Linh / Grave Dominion **R5**; Hiệu Triệu Quân Đoàn / Legion Call **R5** | Necromancy ≥ 95; Soul ≥ 95 | Sovereign trial — Thắng thủ lĩnh tử linh và các hộ vệ triệu hồi |

**Lưu ý:** `Aimed Stone` và `Stone Throw` là **ném đá** Tier 0, không phải bắn cung. Các kỹ năng cung mở từ Tier 1. Với nghề Terminal, yêu cầu ở dòng **đi vào** vẫn áp dụng bình thường; không có dòng **đi ra**.

## 5. Toàn bộ 104 skill song ngữ: Rank 1→5 và điểm chỉ số vĩnh viễn

Mỗi skill được định nghĩa đầy đủ một tên Việt, một tên Anh, ID ổn định, màu hiếm, vai trò, hiệu ứng từng rank và reward stats. Cột “tổng stat R5” là **cộng dồn** các mốc nhận stat trước đó. Nếu skill không có reward tại R2/R3/R4 thì ghi **—**, không ngầm cộng điểm.

### Tier 0 — 34 skill
| Việt / English (`id`) | Phân loại | Thưởng R3 | Thưởng R5 (riêng mốc) | Tổng stat R5 |
|---|---|---|---|---|
| **Lướt Xương / Bone Dash** (`bone_dash`) | Chủ động, Trắng, mobility | — | +1 AGI | +1 AGI |
| **Bật Nhảy Xương / Bone Leap** (`bone_leap`) | Chủ động, Trắng, mobility | — | +1 AGI | +1 AGI |
| **Ném Xương Vụn / Loose Bone Toss** (`loose_bone`) | Chủ động, Trắng, attack | — | +1 DEX | +1 DEX |
| **Thủ Thế / Brace** (`brace`) | Chủ động, Trắng, defense | — | +1 VIT | +1 VIT |
| **Phục Hồi Nhanh / Quick Recovery** (`quick_recover`) | Chủ động, Trắng, mobility | — | +1 AGI | +1 AGI |
| **Khung Xương Cân Bằng / Balanced Frame** (`balanced_frame`) | Bị động, Trắng, passive | — | +1 VIT | +1 VIT |
| **Mắt Nhặt Nhạnh / Scavenger Eye** (`scavenger_eye`) | Bị động, Trắng, passive | — | +1 DEX | +1 DEX |
| **Bộ Xương Nhẹ / Light Bones** (`light_bones`) | Bị động, Trắng, passive | — | +1 AGI | +1 AGI |
| **Chém Kiếm Sứt / Cracked Slash** (`cracked_slash`) | Chủ động, Trắng, attack | — | +1 STR | +1 STR |
| **Chém Hất Mảnh / Rising Chip** (`rising_chip`) | Chủ động, Lam, attack | +1 STR | +1 STR, +1 DEX | +2 STR, +1 DEX |
| **Ném Đá / Stone Throw** (`stone_throw`) | Chủ động, Trắng, attack | — | +1 DEX | +1 DEX |
| **Ném Đá Ngắm / Aimed Stone** (`aimed_stone`) | Chủ động, Lục, attack | +1 DEX | +1 DEX | +2 DEX |
| **Đâm Kim / Needle Stab** (`needle_stab`) | Chủ động, Trắng, attack | — | +1 DEX | +1 DEX |
| **Bổ Rìu Nứt / Cracked Axe Slam** (`cracked_axe`) | Chủ động, Lam, attack | +1 STR | +1 STR, +1 VIT | +2 STR, +1 VIT |
| **Đâm Thương / Spear Jab** (`spear_jab`) | Chủ động, Lục, attack | — | +1 DEX | +1 DEX |
| **Húc Khiên / Shield Nudge** (`shield_nudge`) | Chủ động, Lục, defense | — | +1 VIT | +1 VIT |
| **Xung Pháp Khí Cũ / Worn Focus Pulse** (`focus_pulse`) | Chủ động, Trắng, attack | — | +1 INT | +1 INT |
| **Bẫy Dây Vụn / Junk Snare** (`junk_snare`) | Chủ động, Trắng, control | — | +1 INT | +1 INT |
| **Lao Xương / Bone Dive** (`bone_dive`) | Chủ động, Lục, attack | — | +1 AGI | +1 AGI |
| **Bước Chân Êm / Quiet Tread** (`quiet_tread`) | Bị động, Lục, passive | — | +1 AGI | +1 AGI |
| **Sự Bền Bỉ Rách Nát / Ragged Persistence** (`ragged_persistence`) | Bị động, Lục, passive | — | +1 VIT | +1 VIT |
| **Ứng Biến Lang Thang / Wanderer Improvisation** (`wanderer_improvise`) | Chủ động, Tím, attack | — | +1 STR | +1 STR |
| **Bước Chân Đầu Tiên / First Footfall** (`first_footfall`) | Bị động, Lam, passive | — | +1 AGI | +1 AGI |
| **Mảnh Băng Giá / Frost Fleck** (`frost_fleck`) | Chủ động, Lam, attack | +1 INT | +1 INT | +2 INT |
| **Tia Điện Tách / Static Snap** (`static_snap`) | Chủ động, Lục, attack | — | +1 INT | +1 INT |
| **Luồng Gió Nhỏ / Wind Puff** (`wind_puff`) | Chủ động, Lục, control | — | +1 AGI | +1 AGI |
| **Hất Đá Sỏi / Pebble Knock** (`pebble_knock`) | Chủ động, Lục, attack | — | +1 INT | +1 INT |
| **Ánh Sáng Nhợt / Pale Glimmer** (`pale_glimmer`) | Chủ động, Lam, defense | — | +1 WIL | +1 WIL |
| **Đốm Bóng Tối / Shade Mote** (`shade_mote`) | Chủ động, Trắng, attack | — | +1 WIL | +1 WIL |
| **Mầm Cây Níu Giữ / Sprout Grasp** (`sprout_grasp`) | Chủ động, Lục, control | — | +1 WIL | +1 WIL |
| **Màn Nước / Water Veil** (`water_veil`) | Chủ động, Lam, defense | — | +1 WIL | +1 WIL |
| **Sơ Cứu Dã Chiến / Field Mend** (`field_mend`) | Chủ động, Lục, healing | — | +1 VIT | +1 VIT |
| **Tia Lửa Lập Lòe / Flicker Ember** (`flicker_ember`) | Chủ động, Lục, attack | — | +1 INT | +1 INT |
| **Giọt Nước / Water Drop** (`water_drop`) | Chủ động, Lục, attack | — | +1 INT | +1 INT |

#### Tiến hóa cụ thể của từng skill Tier 0
**Lướt Xương / Bone Dash** — `bone_dash` · Chủ động · Trắng

- **R1 (100% hiệu lực): Lướt ngang ngắn, né đòn đúng thời điểm để nối chuỗi.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Giảm trễ sau khi lướt**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Né đúng nhịp tạo chống gián đoạn ngắn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Cho phép nối đòn đánh khi lướt trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Lướt xa hơn, giảm phạt khi hụt**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Bật Nhảy Xương / Bone Leap** — `bone_leap` · Chủ động · Trắng

- **R1 (100% hiệu lực): Bật nhảy bổ trợ để vượt địa hình hoặc tiếp cận.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Cải thiện kiểm soát hướng khi bật**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Tăng độ cao khi bật trên không**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Bật xong có thể nối một đòn không trung**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Đáp đất nhanh hơn sau cú bật**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Ném Xương Vụn / Loose Bone Toss** — `loose_bone` · Chủ động · Trắng

- **R1 (100% hiệu lực): Ném mảnh xương làm gián đoạn mục tiêu nhỏ.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng tốc độ mảnh xương**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Trúng quái nhỏ gây khựng nhẹ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Cho phép ném chéo khi đang nhảy**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đạn vỡ tạo va chạm phụ tầm gần**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Thủ Thế / Brace** — `brace` · Chủ động · Trắng

- **R1 (100% hiệu lực): Giữ thế trong khoảnh khắc để giảm đẩy lùi.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Kéo dài khoảnh khắc giảm đẩy lùi**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Chống ngắt đòn tốt hơn khi đỡ đúng lúc**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Đỡ thành công mở phản kích ngắn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Tạo một lớp chắn mỏng khi giữ thế chuẩn**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Phục Hồi Nhanh / Quick Recovery** — `quick_recover` · Chủ động · Trắng

- **R1 (100% hiệu lực): Hồi phục tư thế nhanh sau khi tiếp đất.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Rút ngắn thời gian đứng dậy**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Hồi một ít thể lực sau cú tiếp đất nặng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Cho phép né sau khi phục hồi tư thế**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Kháng đánh ngã thoáng chốc sau phục hồi**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Khung Xương Cân Bằng / Balanced Frame** — `balanced_frame` · Bị động · Trắng

- **R1 (100% hiệu lực): Giảm đôi chút thời gian mất thăng bằng khi đáp xuống.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm trễ tiếp đất**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Bớt mất đà khi đổi hướng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Ổn định sau đòn trên không**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Cải thiện chống mất thăng bằng khi tiếp đất**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Mắt Nhặt Nhạnh / Scavenger Eye** — `scavenger_eye` · Bị động · Trắng

- **R1 (100% hiệu lực): Phát hiện các vật phẩm thu thập ở lối rẽ gần.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Mở rộng phạm vi phát hiện vật phẩm**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Đánh dấu lối phụ gần nhất**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Thêm tín hiệu cho vật phẩm hiếm**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tăng tầm nhặt vật phẩm ở ngã rẽ**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Bộ Xương Nhẹ / Light Bones** — `light_bones` · Bị động · Trắng

- **R1 (100% hiệu lực): Tăng nhẹ khả năng điều khiển hướng khi đang trên không.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng nhẹ điều khiển trên không**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Đổi hướng khi rơi ít bị trễ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Giảm thời gian rơi cứng sau né không trung**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Cải thiện khả năng chỉnh quỹ đạo nhảy**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Chém Kiếm Sứt / Cracked Slash** — `cracked_slash` · Chủ động · Trắng

- **R1 (100% hiệu lực): Chém ngang kiếm sứt, nhanh vừa, đánh trúng trước mặt; nối sau Normal 1.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn hồi chiêu chém ngang**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Trúng đòn tạo áp lực lên thế thủ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Cho phép cancel từ đòn thường thứ hai**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đòn cuối mở một nhịp chém bồi ngắn**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Chém Hất Mảnh / Rising Chip** — `rising_chip` · Chủ động · Lam

- **R1 (100% hiệu lực): Vung kiếm từ thấp lên cao, hất kẻ địch nhỏ; hiệu quả lên boss giảm.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Góc hất kiếm cao hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Trúng quái nhỏ tăng độ hất**. Tổng thưởng chỉ số đang có: `+1 STR`.
- **R4 (140% hiệu lực): Nối được đòn trên không ngay khi xác nhận trúng**. Tổng thưởng chỉ số đang có: `+1 STR`.
- **R5 (160% hiệu lực): Chém bồi lên mục tiêu vừa bị hất**. Tổng thưởng chỉ số đang có: `+2 STR, +1 DEX`.

**Ném Đá / Stone Throw** — `stone_throw` · Chủ động · Trắng

- **R1 (100% hiệu lực): Nhặt và ném một hòn đá theo đường cong ngắn; kỹ thuật tầm xa đầu tiên, không dùng cung.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Đá bay nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Ném trúng tạo khựng rất ngắn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Cho phép vừa lùi vừa ném**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Ném liên tiếp có nhịp hồi ngắn hơn**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Ném Đá Ngắm / Aimed Stone** — `aimed_stone` · Chủ động · Lục

- **R1 (100% hiệu lực): Ngắm kỹ và ném đá tầm xa hơn, có thể hơi khựng mục tiêu nhỏ; nhịp chậm hơn Stone Throw.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn giữ ngắm**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng độ ổn định đường bay**. Tổng thưởng chỉ số đang có: `+1 DEX`.
- **R4 (140% hiệu lực): Trúng điểm yếu gây khựng rõ hơn**. Tổng thưởng chỉ số đang có: `+1 DEX`.
- **R5 (160% hiệu lực): Đá ngắm xuyên qua vật cản mềm một lần**. Tổng thưởng chỉ số đang có: `+2 DEX`.

**Đâm Kim / Needle Stab** — `needle_stab` · Chủ động · Trắng

- **R1 (100% hiệu lực): Đâm dao ngắn với startup nhanh, lợi khi kết thúc Normal đúng khoảng cách.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Đâm thu tay nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Đánh trúng sát người tăng áp lực combo**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Cho phép chuyển né ngay sau hit confirm**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đâm bồi ngắn nếu nối đúng nhịp**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Bổ Rìu Nứt / Cracked Axe Slam** — `cracked_axe` · Chủ động · Lam

- **R1 (100% hiệu lực): Bổ rìu nặng theo cung cao xuống thấp, gây mất thăng bằng nhưng dễ bị ngắt.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm độ chậm trước khi bổ**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng phá giáp khi trúng đòn nặng**. Tổng thưởng chỉ số đang có: `+1 STR`.
- **R4 (140% hiệu lực): Vung rộng hơn ở nửa sau quỹ đạo**. Tổng thưởng chỉ số đang có: `+1 STR`.
- **R5 (160% hiệu lực): Gây sóng chấn nhỏ sau cú bổ trúng đất**. Tổng thưởng chỉ số đang có: `+2 STR, +1 VIT`.

**Đâm Thương / Spear Jab** — `spear_jab` · Chủ động · Lục

- **R1 (100% hiệu lực): Đâm thẳng đầu thương ra xa, trúng một mục tiêu và giữ khoảng cách.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Thu thương về nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Giữ khoảng cách tốt hơn khi trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Cho phép bước lùi sau đòn đâm**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đâm nối tầm ngắn sau hit confirm**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Húc Khiên / Shield Nudge** — `shield_nudge` · Chủ động · Lục

- **R1 (100% hiệu lực): Đẩy khiên cự ly ngắn để giảm áp lực, gây ít sát thương và stagger nhẹ.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Đẩy lùi ổn định hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Trúng đòn khiến mục tiêu khựng nhẹ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Húc ngay sau đỡ mở nhịp phản đòn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Tạo chống ngắt đòn thoáng chốc sau húc**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Xung Pháp Khí Cũ / Worn Focus Pulse** — `focus_pulse` · Chủ động · Trắng

- **R1 (100% hiệu lực): Phóng xung phép trung tính từ pháp khí rạn nứt; phép không nhất thiết có nguyên tố.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Phóng xung nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Xung gây khựng lên mục tiêu nhỏ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Tăng tầm xung trung tính**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Xung thứ hai yếu xuất hiện sau hit confirm**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Bẫy Dây Vụn / Junk Snare** — `junk_snare` · Chủ động · Trắng

- **R1 (100% hiệu lực): Đặt bẫy dây vụn trên mặt đất gây chậm rất ngắn, không gây sát thương.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Bẫy tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Bẫy giữ chân mục tiêu lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Đặt bẫy nhanh và xa hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Đặt hai bẫy nhỏ theo hướng di chuyển**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Lao Xương / Bone Dive** — `bone_dive` · Chủ động · Lục

- **R1 (100% hiệu lực): Lao chéo xuống khi đang trên không; trúng địch nhỏ gây hitstop, tiếp đất có recovery.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Bớt trễ sau khi chạm đất**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Lao trúng giảm tốc rơi tức thì**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Cho phép nối né khi xác nhận trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Lao tạo vùng rung nhỏ khi tiếp đất**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Bước Chân Êm / Quiet Tread** — `quiet_tread` · Bị động · Lục

- **R1 (100% hiệu lực): Giảm nhẹ tiếng động lúc di chuyển chậm, thuận lợi khi tiếp cận quái cảnh giới.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Thu hẹp tầm bị phát hiện khi đi chậm**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Giảm tiếng động sau tiếp đất**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Bắt đầu di chuyển từ yên lặng ít bị lộ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tăng khoảng thời gian ẩn dấu chân**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Sự Bền Bỉ Rách Nát / Ragged Persistence** — `ragged_persistence` · Bị động · Lục

- **R1 (100% hiệu lực): Sau khi bị đánh lùi, giảm nhẹ thời gian phục hồi tư thế; có giới hạn hồi nội bộ.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm trễ sau đánh lùi**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Kháng mất thăng bằng ngắn sau bị đẩy**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Hồi một ít thể lực khi đứng vững**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Giảm thêm tác động đẩy lùi liên tiếp**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Ứng Biến Lang Thang / Wanderer Improvisation** — `wanderer_improvise` · Chủ động · Tím

- **R1 (100% hiệu lực): Đòn ứng biến bằng vũ khí đang cầm, nhịp vụng về nhưng linh hoạt; chỉ nghề Wanderer sử dụng.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm khoảng hở khi đổi vũ khí**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Đòn ứng biến nhận dạng vũ khí đang cầm**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Nối được từ đòn thường thứ hai**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đòn ứng biến thứ hai nếu trúng đúng nhịp**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Bước Chân Đầu Tiên / First Footfall** — `first_footfall` · Bị động · Lam

- **R1 (100% hiệu lực): Bài học di chuyển từ Wanderer: điều khiển hướng một chút trong lúc rơi; có thể kế thừa theo nhánh.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rơi xuống ít mất điều khiển hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Giảm trễ đổi hướng khi rơi**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Bước né sau đáp đất nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Giữ đà ngang tốt hơn sau cú rơi dài**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Mảnh Băng Giá / Frost Fleck** — `frost_fleck` · Chủ động · Lam

- **R1 (100% hiệu lực): Mảnh băng nhỏ tạo Chill nhẹ; không đóng băng tức thì.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Đạn băng bay nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tích lũy Chill cao hơn**. Tổng thưởng chỉ số đang có: `+1 INT`.
- **R4 (140% hiệu lực): Chạm đích tạo vệt lạnh ngắn**. Tổng thưởng chỉ số đang có: `+1 INT`.
- **R5 (160% hiệu lực): Mảnh băng phụ lan Chill ở khoảng gần**. Tổng thưởng chỉ số đang có: `+2 INT`.

**Tia Điện Tách / Static Snap** — `static_snap` · Chủ động · Lục

- **R1 (100% hiệu lực): Tia điện ngắn trước mặt; có thể tăng tích lũy Shock nếu mục tiêu đã Wet.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm thời gian xuất tia**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Mục tiêu Wet tích Shock tốt hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Điện chạm thêm mục tiêu sát bên khi Wet**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tăng nhịp gián đoạn khi điện trúng đích**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Luồng Gió Nhỏ / Wind Puff** — `wind_puff` · Chủ động · Lục

- **R1 (100% hiệu lực): Luồng gió nhỏ đẩy mục tiêu nhẹ lùi lại; không gây sát thương trực tiếp.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Đẩy mục tiêu xa hơn một chút**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Ngắt bước tiến của quái nhỏ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Gió lan theo hình nón rộng hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Giảm khả năng bị áp sát sau khi đẩy trúng**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Hất Đá Sỏi / Pebble Knock** — `pebble_knock` · Chủ động · Lục

- **R1 (100% hiệu lực): Hất một viên đá từ đất lên theo cung thấp, sát thương phép Đất nhỏ.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Đá phép bay nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng lực hất nhẹ khi trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Đá nảy thấp một lần sau tiếp đất**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tạo thêm mảnh đất nhỏ khi va chạm**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Ánh Sáng Nhợt / Pale Glimmer** — `pale_glimmer` · Chủ động · Lam

- **R1 (100% hiệu lực): Tạo tia sáng che chắn thoáng chốc và giảm một tầng Curse yếu; không hồi HP.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Lớp chắn tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Giải một tầng Curse yếu ổn định hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Tạo ánh che chắn lên đồng minh gần**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Chắn nhỏ được tái tạo nếu thanh tẩy thành công**. Tổng thưởng chỉ số đang có: `+1 WIL`.

**Đốm Bóng Tối / Shade Mote** — `shade_mote` · Chủ động · Trắng

- **R1 (100% hiệu lực): Đốm bóng tối bay chậm gây lượng sát thương phép nhỏ, chưa tạo lời nguyền mạnh.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Đốm bay nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Đốm theo mục tiêu trong góc nhỏ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Gây giảm tốc nhẹ khi trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đốm tách một hạt nhỏ sau va chạm**. Tổng thưởng chỉ số đang có: `+1 WIL`.

**Mầm Cây Níu Giữ / Sprout Grasp** — `sprout_grasp` · Chủ động · Lục

- **R1 (100% hiệu lực): Mầm cây vươn lên níu chân mục tiêu nhỏ trong thời gian ngắn; không gây damage.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Kéo dài rễ níu chân**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Giữ quái nhỏ chắc hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Rễ lan sang mục tiêu sát cạnh**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Giảm thời gian đặt rễ khi đang đứng trên đất**. Tổng thưởng chỉ số đang có: `+1 WIL`.

**Màn Nước / Water Veil** — `water_veil` · Chủ động · Lam

- **R1 (100% hiệu lực): Màng nước mỏng hấp thụ lượng sát thương nhỏ trong thoáng chốc, không tự hồi HP.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Kéo dài màn chắn nước**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Tạo trạng thái Wet lên mục tiêu chạm màn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Cho phép di chuyển chậm khi duy trì màn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Màn vỡ tạo xung đẩy nhỏ**. Tổng thưởng chỉ số đang có: `+1 WIL`.

**Sơ Cứu Dã Chiến / Field Mend** — `field_mend` · Chủ động · Lục

- **R1 (100% hiệu lực): Sơ cứu hoặc chỉnh lại kết cấu cơ thể, hồi một lượng HP nhỏ; không đồng nghĩa Quick Recovery.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng hồi phục ban đầu**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Giảm gián đoạn lúc sơ cứu**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Hồi thêm một đợt nhỏ sau khi thi triển**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tạo chắn mỏng lên mục tiêu được cứu**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Tia Lửa Lập Lòe / Flicker Ember** — `flicker_ember` · Chủ động · Lục

- **R1 (100% hiệu lực): Tia lửa nhỏ làm quen với kỹ thuật nguyên tố; có khả năng tạo Burn nhẹ.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tia lửa bay ổn định hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng tích lũy Burn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Burn lan nhẹ sang mục tiêu sát bên**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tia lửa để lại vệt cháy rất ngắn**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Giọt Nước / Water Drop** — `water_drop` · Chủ động · Lục

- **R1 (100% hiệu lực): Giọt nước đẩy mục tiêu nhẹ và tạo trạng thái Wet.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giọt nước bay nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Mục tiêu trúng bị Wet lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Đẩy mục tiêu nhỏ ra xa hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Giọt nước vỡ gây Wet trong vùng nhỏ**. Tổng thưởng chỉ số đang có: `+1 INT`.

### Tier 1 — 24 skill
| Việt / English (`id`) | Phân loại | Thưởng R3 | Thưởng R5 (riêng mốc) | Tổng stat R5 |
|---|---|---|---|---|
| **Lăn Về Phía Trước / Forward Roll** (`forward_roll`) | Chủ động, Lục, mobility | — | +1 AGI | +1 AGI |
| **Bước Trên Không / Air Step** (`air_step`) | Chủ động, Lục, mobility | — | +1 AGI | +1 AGI |
| **Trụ Vững Cuối Cùng / Last Stand** (`last_stand`) | Bị động, Lục, passive | — | +1 VIT | +1 VIT |
| **Chém Kiếm Rộng / Sword Cleave** (`sword_cleave`) | Chủ động, Lục, attack | — | +1 STR | +1 STR |
| **Gõ Khiên / Shield Tap** (`shield_tap`) | Chủ động, Lục, defense | — | +1 VIT | +1 VIT |
| **Phát Bắn Ngắm / Aimed Shot** (`aimed_shot`) | Chủ động, Lục, attack | — | +1 STR | +1 STR |
| **Dao Găm Nhử / Knife Feint** (`knife_feint`) | Chủ động, Lục, mobility | — | +1 AGI | +1 AGI |
| **Tia Linh Hồn / Soul Spark** (`soul_spark`) | Chủ động, Lục, attack | — | +1 INT | +1 INT |
| **Mìn Phế Liệu / Scrap Mine** (`scrap_mine`) | Chủ động, Lục, control | — | +1 DEX | +1 DEX |
| **Cầm Nắm Vững / Firm Grip** (`firm_grip`) | Bị động, Lục, passive | — | +1 STR | +1 STR |
| **Tam Liên Chém Thô / Rough Three-Cut** (`rough_three_cut`) | Chủ động, Lục, attack | — | +1 STR | +1 STR |
| **Tên Tách Đôi / Split Arrow** (`split_arrow`) | Chủ động, Lục, attack | — | +1 STR | +1 STR |
| **Luồn Bóng / Shadow Slip** (`shadow_slip`) | Chủ động, Lục, mobility | — | +1 AGI | +1 AGI |
| **Khúc Tụng Mộ / Grave Chant** (`grave_chant`) | Chủ động, Lục, support | — | +1 INT | +1 INT |
| **Tháp Bắn Bỏ Túi / Pocket Turret** (`pocket_turret`) | Chủ động, Lục, summon | — | +1 INT | +1 INT |
| **Cung Kiếm Lửa / Flame Arc** (`flame_arc`) | Chủ động, Lục, attack | — | +1 STR | +1 STR |
| **Thủy Trị / Water Mend** (`water_mend`) | Chủ động, Lục, healing | — | +1 VIT | +1 VIT |
| **Hộ Vệ Băng Giá / Frost Guard** (`frost_guard`) | Chủ động, Lục, defense | — | +1 VIT | +1 VIT |
| **Bước Gió / Gust Step** (`gust_step`) | Chủ động, Lục, mobility | — | +1 AGI | +1 AGI |
| **Da Đá / Stone Skin** (`stone_skin`) | Chủ động, Lục, defense | — | +1 VIT | +1 VIT |
| **Giật Sét / Thunder Jolt** (`thunder_jolt`) | Chủ động, Lục, attack | — | +1 INT | +1 INT |
| **Bẫy Rễ / Root Snare** (`root_snare`) | Chủ động, Lục, control | — | +1 INT | +1 INT |
| **Thánh Thuẫn Quang / Radiant Aegis** (`radiant_aegis`) | Chủ động, Lục, defense | — | +1 VIT | +1 VIT |
| **Trói Buộc U Ám / Umbra Bind** (`umbra_bind`) | Chủ động, Lục, control | — | +1 INT | +1 INT |

#### Tiến hóa cụ thể của từng skill Tier 1
**Lăn Về Phía Trước / Forward Roll** — `forward_roll` · Chủ động · Lục

- **R1 (100% hiệu lực): Lăn qua khe hẹp, có thể hủy một số recovery được phép.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Lăn xa hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Né chuẩn tạo khoảng iframe tốt hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Có thể lăn sau hit confirm**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Đòn thường đầu sau lăn vào nhanh hơn**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Bước Trên Không / Air Step** — `air_step` · Chủ động · Lục

- **R1 (100% hiệu lực): Đổi hướng một lần trên không, không tạo thêm cú nhảy.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Ổn định đà ngang khi bước**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Tăng khoảng dịch chuyển giữa không trung**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Có thể nối đòn chéo sau bước**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Giảm trễ khi đáp đất sau air step**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Trụ Vững Cuối Cùng / Last Stand** — `last_stand` · Bị động · Lục

- **R1 (100% hiệu lực): Cho một lượng poise nhỏ khi HP thấp, có thời gian hồi nội bộ.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm sát thương khi còn ít máu**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Chống đánh ngã tốt hơn ở ngưỡng thấp**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Tăng thời gian duy trì phòng thủ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Nhận lá chắn ngắn sau lần đứng vững**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Chém Kiếm Rộng / Sword Cleave** — `sword_cleave` · Chủ động · Lục

- **R1 (100% hiệu lực): Chém ngang kiểm soát không gian cận chiến.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Thu kiếm nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng lực ép lên nhiều mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Mở nhịp chém nối khi đánh trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tăng góc quét của đường kiếm**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Gõ Khiên / Shield Tap** — `shield_tap` · Chủ động · Lục

- **R1 (100% hiệu lực): Hất khiên ngắn có thể cắt đòn của kẻ địch yếu.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Húc khiên trúng dễ gây khựng**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Bổ sung thời gian giữ thế sau húc**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Đỡ đúng nhịp nối húc nhanh**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Phản đòn thêm lực đẩy về phía trước**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Phát Bắn Ngắm / Aimed Shot** — `aimed_shot` · Chủ động · Lục

- **R1 (100% hiệu lực): Gồng dây cung cho phát bắn mạnh hơn; giảm tốc độ di chuyển.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn thời gian kéo cung**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Bắn chính xác hơn khi đứng yên**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Trúng điểm yếu tăng khựng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tên bay ổn định hơn khi bắn xa**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Dao Găm Nhử / Knife Feint** — `knife_feint` · Chủ động · Lục

- **R1 (100% hiệu lực): Bước lùi lừa nhịp, mở cửa sổ phản kích khi đối thủ vung hụt.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Nhử đòn ít tốn khoảng trống hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Địch trượt đòn bị lộ khe phản kích**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Cho phép cancel sang lướt khi nhử thành công**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Đâm phản kích có thể nối nhát thứ hai**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Tia Linh Hồn / Soul Spark** — `soul_spark` · Chủ động · Lục

- **R1 (100% hiệu lực): Bắn đạn Soul nhỏ để duy trì combo từ xa.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm thời gian niệm sơ cấp**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng tích lũy áp chế linh hồn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Đạn linh hồn đổi góc nhẹ theo mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đạn trúng tạo hạt linh hồn bồi**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Mìn Phế Liệu / Scrap Mine** — `scrap_mine` · Chủ động · Lục

- **R1 (100% hiệu lực): Đặt bẫy chậm kích hoạt, mạnh ở vị trí hẹp.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Mìn tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Tăng bán kính kích hoạt**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Giảm thời gian triển khai**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Nổ tạo mảnh vụn nhỏ trong vùng gần**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Cầm Nắm Vững / Firm Grip** — `firm_grip` · Bị động · Lục

- **R1 (100% hiệu lực): Giảm mức hao Stamina của combo kiếm liên tiếp.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm hao thể lực khi đổi thế**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Giảm nguy cơ hụt đòn do đẩy lùi**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Chống gián đoạn khi cầm vũ khí nặng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tăng ổn định khi nối đòn thường**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Tam Liên Chém Thô / Rough Three-Cut** — `rough_three_cut` · Chủ động · Lục

- **R1 (100% hiệu lực): Ba đòn chém thô nhưng chắc, kỹ thuật riêng của Bone Fighter.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Nhịp chém thứ hai nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Đòn thứ ba tăng ép thế thủ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Có thể cancel từ nhịp cuối khi trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đòn thứ ba mở bước áp sát ngắn**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Tên Tách Đôi / Split Arrow** — `split_arrow` · Chủ động · Lục

- **R1 (100% hiệu lực): Hai mũi tên chia góc ở cự ly vừa.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Hai mũi tên phân tán hẹp hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Trúng cùng mục tiêu tạo khựng nhẹ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Tăng góc tùy chỉnh khi bắn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Mũi tên phụ xuất hiện khi giữ ngắm đủ lâu**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Luồn Bóng / Shadow Slip** — `shadow_slip` · Chủ động · Lục

- **R1 (100% hiệu lực): Lướt thấp vượt sau mục tiêu đang mở sơ hở.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Lướt có trễ hồi thấp hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Qua lưng mục tiêu dễ hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Cho phép nối đâm dao sau lướt trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Giữ một khoảnh khắc mờ bóng sau lướt**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Khúc Tụng Mộ / Grave Chant** — `grave_chant` · Chủ động · Lục

- **R1 (100% hiệu lực): Kênh phép ngắn để tạo thêm Soul sau đòn trúng.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Rút ngắn niệm chú**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (120% hiệu lực): Kéo dài hiệu lực hỗ trợ tử thuật**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (135% hiệu lực): Kích hoạt sau combo phép đơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (150% hiệu lực): Khúc tụng lan đến triệu hồi gần**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Tháp Bắn Bỏ Túi / Pocket Turret** — `pocket_turret` · Chủ động · Lục

- **R1 (100% hiệu lực): Triển khai trụ xương nhỏ, tồn tại trong thời gian ngắn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tháp bắn nhanh hơn sau dựng**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (128% hiệu lực): Tăng thời gian tồn tại**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (148% hiệu lực): Triển khai nhanh và sát mép bệ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (170% hiệu lực): Tháp bắn đạn đôi theo nhịp chậm**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Cung Kiếm Lửa / Flame Arc** — `flame_arc` · Chủ động · Lục

- **R1 (100% hiệu lực): Kiếm quét mang lửa: đòn vật lý kết hợp phần phụ sát thương lửa.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm trễ vung kiếm kết hợp phép**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng tích lũy Burn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Quét lửa rộng thêm góc cuối**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Vệt lửa bám lại rất ngắn sau chém**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Thủy Trị / Water Mend** — `water_mend` · Chủ động · Lục

- **R1 (100% hiệu lực): Dòng nước hồi HP mục tiêu theo thời gian; không gây sát thương.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng lượng hồi phục theo thời gian**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Kéo dài hiệu ứng Regen**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Thi triển lên đồng minh ở xa hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Kết thúc Regen hồi thêm một đợt nhỏ**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Hộ Vệ Băng Giá / Frost Guard** — `frost_guard` · Chủ động · Lục

- **R1 (100% hiệu lực): Tạo lớp lá chắn băng ngắn; khi vỡ có thể gây Chill gần đó.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Lá chắn tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Chill mạnh hơn khi chắn vỡ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Chắn được thêm một đòn nhẹ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Phá chắn giải phóng vầng băng nhỏ**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Bước Gió / Gust Step** — `gust_step` · Chủ động · Lục

- **R1 (100% hiệu lực): Lướt được tăng lực bằng gió, đổi vị trí để nối combo trên không.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Lướt nhanh hơn trên không**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Đổi hướng giữa chừng dễ hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Nối được đòn không trung từ bước gió**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Bước gió thứ hai yếu theo hit confirm**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Da Đá / Stone Skin** — `stone_skin` · Chủ động · Lục

- **R1 (100% hiệu lực): Gia cố da/giáp bằng đất, tăng chống ngắt đòn trong chốc lát.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Gia tăng thời gian chống ngắt**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Tăng hiệu quả giảm đẩy lùi**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Chống một lần stagger nhẹ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Khi hết da đá tạo lớp chắn phụ ngắn**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Giật Sét / Thunder Jolt** — `thunder_jolt` · Chủ động · Lục

- **R1 (100% hiệu lực): Phóng điện nhỏ; có tương tác riêng với mục tiêu Wet.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Xung điện tới mục tiêu nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Mục tiêu Wet nhận Shock mạnh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Điện nảy sang mục tiêu gần nếu Wet**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Trúng Shock mở cửa sổ nối phép ngắn**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Bẫy Rễ / Root Snare** — `root_snare` · Chủ động · Lục

- **R1 (100% hiệu lực): Dây leo trói chân mục tiêu chạm đất; không tự gây damage.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Rễ xuất hiện nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Giữ chân lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Tăng vùng rễ ở mặt đất**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Rễ lan sang một mục tiêu sát cạnh**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Thánh Thuẫn Quang / Radiant Aegis** — `radiant_aegis` · Chủ động · Lục

- **R1 (100% hiệu lực): Dựng lớp bảo hộ ánh sáng, có thể giải một hiệu ứng lời nguyền.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Lớp chắn sáng kéo dài hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Thanh tẩy Curse hiệu quả hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Tạo chắn yếu cho đồng minh kề bên**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Thanh tẩy thành công hồi một lượng chắn nhỏ**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Trói Buộc U Ám / Umbra Bind** — `umbra_bind` · Chủ động · Lục

- **R1 (100% hiệu lực): Ấn bóng tối giữ chân ngắn và giảm khả năng gây áp lực.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Trói tối tác động nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Giảm khả năng quái bứt khỏi vùng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Gia tăng vùng áp chế tầm gần**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Curse kéo dài sau khi vùng trói kết thúc**. Tổng thưởng chỉ số đang có: `+1 INT`.

### Tier 2 — 22 skill
| Việt / English (`id`) | Phân loại | Thưởng R3 | Thưởng R5 (riêng mốc) | Tổng stat R5 |
|---|---|---|---|---|
| **Phản Đòn Thế Thủ / Guard Counter** (`guard_counter`) | Chủ động, Lam, defense | — | +1 VIT | +1 VIT |
| **Đòn Nhảy Tấn Công / Leaping Strike** (`leaping_strike`) | Chủ động, Lam, attack | — | +1 STR | +1 STR |
| **Xé Giáp / Armor Rend** (`armor_rend`) | Chủ động, Lam, attack | — | +1 WIL | +1 WIL |
| **Mưa Tên / Arrow Volley** (`volley`) | Chủ động, Lam, attack | — | +1 STR | +1 STR |
| **Bẫy Kẹp Chân / Ankle Trap** (`ankle_trap`) | Chủ động, Lam, control | — | +1 DEX | +1 DEX |
| **Trói Hồn / Soul Bind** (`soul_bind`) | Chủ động, Lam, control | — | +1 INT | +1 INT |
| **Sửa Chữa Tại Chỗ / Field Repair** (`turret_repair`) | Chủ động, Lam, support | — | +1 DEX | +1 DEX |
| **Ký Ức Sắt Đá / Iron Memory** (`iron_memory`) | Bị động, Lam, passive | — | +1 VIT | +1 VIT |
| **Đúng Khoảnh Khắc / Perfect Timing** (`perfect_timing`) | Bị động, Lam, passive | — | +1 STR | +1 STR |
| **Lời Thề Khiên / Shield Oath** (`shield_oath`) | Chủ động, Lam, defense | — | +1 VIT | +1 VIT |
| **Phản Kích Rắn Độc / Viper Riposte** (`viper_riposte`) | Chủ động, Lam, attack | — | +1 STR | +1 STR |
| **Bổ Tách Mộ / Grave Splitter** (`grave_splitter`) | Chủ động, Lam, attack | — | +1 STR | +1 STR |
| **Dấu Ấn Thợ Săn / Hunter Mark** (`hunter_mark`) | Chủ động, Lam, control | — | +1 WIL | +1 WIL |
| **Bước Chân U Linh / Phantom Step** (`phantom_step`) | Chủ động, Lam, mobility | — | +1 AGI | +1 AGI |
| **Triệu Hồi Vệ Binh Xương / Summon Bone Guard** (`summon_guard`) | Chủ động, Lam, summon | — | +1 VIT | +1 VIT |
| **Bình Chứa Linh Hồn / Soul Vessel** (`soul_vessel`) | Bị động, Lam, passive | — | +1 INT | +1 INT |
| **Triển Khai Tháp Canh / Deploy Sentry** (`deploy_sentry`) | Chủ động, Lam, summon | — | +1 INT | +1 INT |
| **Nhịp Hộ Vệ / Guardian Pulse** (`guardian_pulse`) | Bị động, Lam, passive | — | +1 VIT | +1 VIT |
| **Thương Băng / Ice Lance** (`ice_lance`) | Chủ động, Lam, attack | — | +1 INT | +1 INT |
| **Tường Đất / Earth Wall** (`earth_wall`) | Chủ động, Lam, defense | — | +1 VIT | +1 VIT |
| **Sóng Dẫn Điện / Conductive Surge** (`conductive_surge`) | Chủ động, Lam, attack | — | +1 INT | +1 INT |
| **Hồi Phục Sinh Mộc / Verdant Recovery** (`verdant_recovery`) | Bị động, Lam, passive | — | +1 VIT | +1 VIT |

#### Tiến hóa cụ thể của từng skill Tier 2
**Phản Đòn Thế Thủ / Guard Counter** — `guard_counter` · Chủ động · Lam

- **R1 (100% hiệu lực): Phản đòn khi chặn đúng lúc; gây stagger cao.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Cửa sổ nhận đòn rộng hơn chút**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Phản đòn có khựng mạnh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Nối chém nhanh ngay khi phản chuẩn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Phản đòn tạo chắn phụ ngắn**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Đòn Nhảy Tấn Công / Leaping Strike** — `leaping_strike` · Chủ động · Lam

- **R1 (100% hiệu lực): Nhảy bổ xuống kẻ địch, tạo điểm kết thúc combo trên không.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng khoảng bám mục tiêu khi lao**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Đánh trúng quái nhỏ hất lên**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Kết nối air normal sau đòn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Rút ngắn trễ đáp đất nếu trúng**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Xé Giáp / Armor Rend** — `armor_rend` · Chủ động · Lam

- **R1 (100% hiệu lực): Chém nặng làm giảm giáp tạm thời.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Duy trì phá giáp lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng mức suy yếu giáp**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Mở cancel sang đòn nặng khi trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đòn bồi tác động lên giáp vừa bị xé**. Tổng thưởng chỉ số đang có: `+1 WIL`.

**Mưa Tên / Arrow Volley** — `volley` · Chủ động · Lam

- **R1 (100% hiệu lực): Bắn loạt mũi tên chế áp vùng phía trước.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn niệm trước loạt bắn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng diện phủ loạt tên**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Bổ sung một mũi tên ở góc phụ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Trúng liên tiếp gia tăng khựng**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Bẫy Kẹp Chân / Ankle Trap** — `ankle_trap` · Chủ động · Lam

- **R1 (100% hiệu lực): Bẫy làm chậm kẻ địch chạy qua.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Bẫy tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Trói chân lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Mở rộng tầm kích hoạt**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Bẫy gây chậm sau khi thoát trói**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Trói Hồn / Soul Bind** — `soul_bind` · Chủ động · Lam

- **R1 (100% hiệu lực): Giữ chân mục tiêu nhỏ để mở combo phối hợp.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Kéo dài thời gian trói**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Làm yếu lực thoát khỏi trói**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Trói lan yếu sang mục tiêu kế bên**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Hồi một ít Soul khi trói thành công**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Sửa Chữa Tại Chỗ / Field Repair** — `turret_repair` · Chủ động · Lam

- **R1 (100% hiệu lực): Sửa thiết bị hoặc công trình gần nhân vật.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Sửa tháp nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (120% hiệu lực): Tăng lượng sửa chữa**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (135% hiệu lực): Sửa từ khoảng cách ngắn an toàn hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (150% hiệu lực): Sửa tạo chắn ngắn cho tháp**. Tổng thưởng chỉ số đang có: `+1 DEX`.

**Ký Ức Sắt Đá / Iron Memory** — `iron_memory` · Bị động · Lam

- **R1 (100% hiệu lực): Tăng kháng knockback khi đang mang khiên.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng kháng đánh lùi**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Đỡ đòn liên tiếp ít mất thế**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Giảm thời gian hồi sau stagger**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Cho thêm poise khi giữ thế**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Đúng Khoảnh Khắc / Perfect Timing** — `perfect_timing` · Bị động · Lam

- **R1 (100% hiệu lực): Thưởng nhỏ khi cancel chính xác sau hit-confirm.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Mở rộng cửa sổ phản chuẩn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Tăng lợi ích hit confirm**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Giảm phạt khi cancel hụt**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Nối phản đòn hoàn hảo dễ hơn**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Lời Thề Khiên / Shield Oath** — `shield_oath` · Chủ động · Lam

- **R1 (100% hiệu lực): Thế phòng ngự độc quyền Bone Guard, phản lại đòn đầu trúng khiên.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Thời gian giữ chắn dài hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Bớt tổn hao chắn trước đòn mạnh**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Mở đường phản công sau thủ chuẩn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Tạo chắn cho đồng minh sát bên**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Phản Kích Rắn Độc / Viper Riposte** — `viper_riposte` · Chủ động · Lam

- **R1 (100% hiệu lực): Nhát kiếm phản đòn rất nhanh nhưng tầm ngắn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Bước vào đòn phản nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Phản trúng cộng áp lực combo**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Cho phép lướt thoát sau phản chuẩn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Thêm một nhát kết liễu ngắn**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Bổ Tách Mộ / Grave Splitter** — `grave_splitter` · Chủ động · Lam

- **R1 (100% hiệu lực): Nện rìu phá poise với startup lớn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn thu rìu**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Phá giáp rõ hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Bổ gây chấn động phạm vi hẹp**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đòn cuối tạo vùng nứt tạm**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Dấu Ấn Thợ Săn / Hunter Mark** — `hunter_mark` · Chủ động · Lam

- **R1 (100% hiệu lực): Đánh dấu mục tiêu để phát bắn tiếp theo gây áp lực điểm yếu.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Dấu ấn tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Trúng mục tiêu đánh dấu gây khựng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Có thể chuyển dấu ấn một lần**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Hiển thị mục tiêu yếu ở khoảng xa**. Tổng thưởng chỉ số đang có: `+1 WIL`.

**Bước Chân U Linh / Phantom Step** — `phantom_step` · Chủ động · Lam

- **R1 (100% hiệu lực): Lướt xuyên mục tiêu trong khoảng rất ngắn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Tăng tầm dịch chuyển**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Tạo iframe rất ngắn ở giữa bước**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Dịch chuyển nối đâm găm**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Bước chân lưu bóng giả ngắn**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Triệu Hồi Vệ Binh Xương / Summon Bone Guard** — `summon_guard` · Chủ động · Lam

- **R1 (100% hiệu lực): Triệu hồi một vệ binh yếu giữ vị trí và chặn đòn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Vệ binh tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (128% hiệu lực): Tăng khả năng cản đường**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (148% hiệu lực): Vệ binh đánh trả khi chắn thành công**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (170% hiệu lực): Cho phép ra lệnh giữ vị trí**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Bình Chứa Linh Hồn / Soul Vessel** — `soul_vessel` · Bị động · Lam

- **R1 (100% hiệu lực): Bone Medium: gia tăng Soul nhận từ kỹ năng hỗ trợ đúng nhịp.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng dung lượng hồi Soul**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Hồi Soul đều hơn sau đánh trúng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Giảm hao khi triệu hồi liên tiếp**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Hoàn trả chút Soul khi summon hết thời gian**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Triển Khai Tháp Canh / Deploy Sentry** — `deploy_sentry` · Chủ động · Lam

- **R1 (100% hiệu lực): Kỹ sư Bone Engineer đặt tháp bắn ổn định.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm thời gian dựng**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (128% hiệu lực): Tăng tầm phát hiện**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (148% hiệu lực): Cho phép đặt trên bệ cao**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (170% hiệu lực): Tháp canh chia mục tiêu hiệu quả hơn**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Nhịp Hộ Vệ / Guardian Pulse** — `guardian_pulse` · Bị động · Lam

- **R1 (100% hiệu lực): Thế thủ truyền lại trong tuyến Bone Guard: khi chịu đòn mạnh, nhận chút poise.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng hiệu quả chắn nội tại**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Đỡ đòn lan chắn nhỏ quanh mình**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Hồi chắn nhanh hơn khi đứng vững**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đồng minh gần được hưởng hiệu ứng nhỏ**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Thương Băng / Ice Lance** — `ice_lance` · Chủ động · Lam

- **R1 (100% hiệu lực): Pháp kỹ băng tinh luyện dành cho nghề nguyên tố về sau.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Đạn băng bay nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tích lũy Chill mạnh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Xuyên một mục tiêu nhỏ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Mũi băng tan tạo vùng lạnh rất ngắn**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Tường Đất / Earth Wall** — `earth_wall` · Chủ động · Lam

- **R1 (100% hiệu lực): Dựng bức tường đất cản đạn và thay đổi đường đi trong một khoảng ngắn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Tường tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Tường chắn thêm một đợt đạn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Cho phép đặt lệch cao độ trên bệ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Tường vỡ hất nhẹ kẻ địch sát bên**. Tổng thưởng chỉ số đang có: `+1 VIT`.

**Sóng Dẫn Điện / Conductive Surge** — `conductive_surge` · Chủ động · Lam

- **R1 (100% hiệu lực): Phóng xung điện theo đường ngắn; đạt hiệu quả khống chế khi mục tiêu đang Wet.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Xung điện lan xa hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Kẻ địch Wet tích Shock mạnh**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Lan điện thêm một mục tiêu gần**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Sóng điện tạo khựng nối khi Wet**. Tổng thưởng chỉ số đang có: `+1 INT`.

**Hồi Phục Sinh Mộc / Verdant Recovery** — `verdant_recovery` · Bị động · Lam

- **R1 (100% hiệu lực): Mở cơ chế hồi phục lượng nhỏ khi hoàn thành điều kiện tương tác Nature.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Hồi phục sau tương tác Tự nhiên mạnh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Giảm hồi nội bộ của Regen**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Kéo dài hồi phục sau Root thành công**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Nhận một lớp chắn nhỏ khi hồi phục hoàn tất**. Tổng thưởng chỉ số đang có: `+1 VIT`.

### Tier 3 — 13 skill
| Việt / English (`id`) | Phân loại | Thưởng R3 | Thưởng R5 (riêng mốc) | Tổng stat R5 |
|---|---|---|---|---|
| **Bùng Nổ Linh Hồn / Soulburst** (`soulburst`) | Tuyệt kỹ, Vàng, attack | — | +2 INT | +2 INT |
| **Chuyên Gia Không Chiến / Aerial Specialist** (`aerial_specialist`) | Bị động, Lam, passive | — | +1 AGI | +1 AGI |
| **Lưỡi Kiếm Ma / Phantom Blade** (`phantom_blade`) | Tuyệt kỹ, Vàng, attack | — | +2 AGI | +2 AGI |
| **Đại Kiếm Khiếp Sợ / Dread Cleaver** (`dread_cleaver`) | Tuyệt kỹ, Vàng, attack | — | +2 STR | +2 STR |
| **Cuồng Phong Tàn Phá / Ravager Whirl** (`ravager_whirl`) | Tuyệt kỹ, Vàng, attack | — | +2 STR | +2 STR |
| **Đường Đạn U Linh / Ghostline Shot** (`ghostline_shot`) | Tuyệt kỹ, Vàng, attack | — | +2 STR | +2 STR |
| **Hiệu Triệu Quân Đoàn / Legion Call** (`legion_call`) | Tuyệt kỹ, Vàng, summon | — | +2 INT | +2 INT |
| **Lưới Linh Hồn / Soul Lattice** (`soul_lattice`) | Tuyệt kỹ, Vàng, defense | — | +2 VIT | +2 VIT |
| **Dư Ảnh Bóng Tối / Shade Echo** (`shade_echo`) | Chủ động, Lam, mobility | — | +1 AGI | +1 AGI |
| **Tập Trung Đấu Kiếm / Duelist Focus** (`duelist_focus`) | Bị động, Lam, passive | — | +1 STR | +1 STR |
| **Xung Kích Oán Linh / Wraith Rush** (`wraith_rush`) | Chủ động, Lam, attack | — | +1 STR | +1 STR |
| **Thánh Địa Thủy Triều / Tidal Sanctuary** (`tidal_sanctuary`) | Tuyệt kỹ, Vàng, healing | — | +2 VIT | +2 VIT |
| **Vũ Khúc Bão Giông / Storm Waltz** (`storm_waltz`) | Tuyệt kỹ, Vàng, attack | — | +2 AGI | +2 AGI |

#### Tiến hóa cụ thể của từng skill Tier 3
**Bùng Nổ Linh Hồn / Soulburst** — `soulburst` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Giải phóng năng lượng tích lũy theo vòng bán kính nhỏ.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Thu ngắn thời gian tụ lực**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng phạm vi bùng nổ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Tạo áp lực khống chế sau vụ nổ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Bùng nổ thêm sóng xung kích yếu**. Tổng thưởng chỉ số đang có: `+2 INT`.

**Chuyên Gia Không Chiến / Aerial Specialist** — `aerial_specialist` · Bị động · Lam

- **R1 (100% hiệu lực): Giảm nhẹ landing recovery sau khi kết thúc combo trên không.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng kiểm soát khi bay**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Giảm phạt đánh thường trên không**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Lướt sau hit confirm dễ hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Nối chuỗi không trung ổn định hơn**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Lưỡi Kiếm Ma / Phantom Blade** — `phantom_blade` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Sword Wraith tung chuỗi kiếm ảnh bùng nổ trong cự ly ngắn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Cắt nhanh hơn khi xuất kiếm**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng áp lực lên mục tiêu trúng nhiều nhát**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Lưỡi kiếm đi qua một mục tiêu nhỏ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Hiện thêm bóng kiếm kết thúc**. Tổng thưởng chỉ số đang có: `+2 AGI`.

**Đại Kiếm Khiếp Sợ / Dread Cleaver** — `dread_cleaver` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Dread Knight dồn Soul vào một đường kiếm nặng phá tuyến.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Vung nặng có chống ngắt tốt hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Đòn trúng tạo áp lực lên giáp**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Tạo đường kiếm chấn động tầm gần**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đòn kết thúc kích hoạt sóng chém nhỏ**. Tổng thưởng chỉ số đang có: `+2 STR`.

**Cuồng Phong Tàn Phá / Ravager Whirl** — `ravager_whirl` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Grave Marauder xoay rìu dọn vùng, khó hủy recovery.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Xoay lâu hơn một nhịp**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng ép giáp khi quét nhiều mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Có thể di chuyển chậm khi xoay**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Lần xoay cuối kéo nhẹ mục tiêu gần**. Tổng thưởng chỉ số đang có: `+2 STR`.

**Đường Đạn U Linh / Ghostline Shot** — `ghostline_shot` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Phantom Sniper nạp lâu để bắn xuyên nhiều mục tiêu.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn giữ ngắm**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng độ xuyên tuyến mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Bắn chính xác khi trên bệ cao**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đạn xuyên trúng để lại dấu ấn ngắn**. Tổng thưởng chỉ số đang có: `+2 STR`.

**Hiệu Triệu Quân Đoàn / Legion Call** — `legion_call` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Grand Necromancer gọi đội hình lính xương phối hợp.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Lính triệu hồi ở lại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (128% hiệu lực): Tăng số lượt hỗ trợ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (148% hiệu lực): Gọi được hai nhóm từ hai phía**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (170% hiệu lực): Triệu hồi kết thúc bằng đồng loạt đánh**. Tổng thưởng chỉ số đang có: `+2 INT`.

**Lưới Linh Hồn / Soul Lattice** — `soul_lattice` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Soul Weaver tạo lưới kết giới hỗ trợ nhiều vị trí.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Liên kết chắn tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Giảm sát thương cho mục tiêu liên kết**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Tăng phạm vi nối kết**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Lưới hấp thụ một đợt xung kích**. Tổng thưởng chỉ số đang có: `+2 VIT`.

**Dư Ảnh Bóng Tối / Shade Echo** — `shade_echo` · Chủ động · Lam

- **R1 (100% hiệu lực): Shade Stalker tạo bóng mờ đánh lạc hướng kẻ địch.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Bóng giả tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Khiến địch phân vân chọn mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Cho phép trở lại bóng vừa đặt**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Bóng giả nổ thành làn sương mờ**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Tập Trung Đấu Kiếm / Duelist Focus** — `duelist_focus` · Bị động · Lam

- **R1 (100% hiệu lực): Cơ sở từ Bone Duelist, giữ sự tập trung cho chuỗi phản đòn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Tăng hiệu quả phản đòn chuẩn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Đòn trúng liên tiếp giữ nhịp tốt hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Giảm phạt sau đòn hụt đơn mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tăng áp lực lên mục tiêu đang khóa**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Xung Kích Oán Linh / Wraith Rush** — `wraith_rush` · Chủ động · Lam

- **R1 (100% hiệu lực): Đâm lướt nhanh, chỉ dùng với kiếm và kỹ năng Sword cao.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Lướt nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Lướt xuyên một quái nhỏ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Có thể nối chém khi đến cuối đường lướt**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Đường lướt để lại nhát kiếm bóng**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Thánh Địa Thủy Triều / Tidal Sanctuary** — `tidal_sanctuary` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Tạo vùng nước phục hồi cho đội, thay thế Ultimate gây damage.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Vùng chữa lành rộng hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Tăng số lần hồi HP trong vùng**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Tạo Wet hỗ trợ tương tác cho kẻ địch đi vào**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Cuối hiệu lực hồi một đợt cho đồng minh còn trong vùng**. Tổng thưởng chỉ số đang có: `+2 VIT`.

**Vũ Khúc Bão Giông / Storm Waltz** — `storm_waltz` · Tuyệt kỹ · Vàng

- **R1 (100% hiệu lực): Vũ điệu gió và điện: một Signature đa nguyên tố, có nhiều thành phần hit tách biệt.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Đòn gió đầu nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Sét phối hợp lên mục tiêu Wet**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Lốc rộng thêm và chuyển mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Kết thúc bằng sét lan yếu**. Tổng thưởng chỉ số đang có: `+2 AGI`.

### Tier 4 — 7 skill
| Việt / English (`id`) | Phân loại | Thưởng R3 | Thưởng R5 (riêng mốc) | Tổng stat R5 |
|---|---|---|---|---|
| **Bản Năng Chiến Đấu / Battle Instinct** (`battle_instinct`) | Bị động, Tím, passive | — | +1 STR | +1 STR |
| **Phán Quyết Tử Thần / Reaper Verdict** (`reaper_verdict`) | Tuyệt kỹ, Đỏ, attack | +1 STR | +2 STR | +3 STR |
| **Lãnh Địa Tử Linh / Grave Dominion** (`grave_dominion`) | Tuyệt kỹ, Đỏ, summon | +1 INT | +2 INT | +3 INT |
| **Quy Trình Pháo Đài / Citadel Protocol** (`citadel_protocol`) | Tuyệt kỹ, Đỏ, summon | — | +2 VIT | +2 VIT |
| **Quân Kỳ Đoàn Quân / Legion Banner** (`legion_banner`) | Tuyệt kỹ, Đỏ, defense | — | +2 VIT | +2 VIT |
| **Dấu Ấn Vĩnh Cửu / Eternal Mark** (`eternal_mark`) | Tuyệt kỹ, Đỏ, control | — | +2 WIL | +2 WIL |
| **Khúc Cầu Hồn Im Lặng / Silent Requiem** (`death_whisper`) | Tuyệt kỹ, Đỏ, attack | — | +2 STR | +2 STR |

#### Tiến hóa cụ thể của từng skill Tier 4
**Bản Năng Chiến Đấu / Battle Instinct** — `battle_instinct` · Bị động · Tím

- **R1 (100% hiệu lực): Tăng khả năng duy trì nhịp combo khi liên tiếp đánh trúng.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Nhanh nhận biết đòn nguy hiểm**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Giảm thời gian hồi sau né chuẩn**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Tăng lợi thế khi đối thủ vừa hụt**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Giữ trạng thái phản ứng trong combo dài**. Tổng thưởng chỉ số đang có: `+1 STR`.

**Phán Quyết Tử Thần / Reaper Verdict** — `reaper_verdict` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Death Knight dồn sát thương một đường kiếm kết liễu.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn niệm trước kết liễu**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng áp lực trên mục tiêu bị nguyền**. Tổng thưởng chỉ số đang có: `+1 STR`.
- **R4 (140% hiệu lực): Chém xuyên vùng gần**. Tổng thưởng chỉ số đang có: `+1 STR`.
- **R5 (160% hiệu lực): Đòn kết thúc tạo dấu phán quyết ngắn**. Tổng thưởng chỉ số đang có: `+3 STR`.

**Lãnh Địa Tử Linh / Grave Dominion** — `grave_dominion` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Lich King tạo khu vực tăng sức mạnh summon trong thời gian ngắn.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Mở rộng vùng điều khiển summon**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (128% hiệu lực): Tăng khả năng duy trì thuộc hạ**. Tổng thưởng chỉ số đang có: `+1 INT`.
- **R4 (148% hiệu lực): Đổi vị trí triệu hồi linh hoạt hơn**. Tổng thưởng chỉ số đang có: `+1 INT`.
- **R5 (170% hiệu lực): Thuộc hạ hợp kích mục tiêu đánh dấu**. Tổng thưởng chỉ số đang có: `+3 INT`.

**Quy Trình Pháo Đài / Citadel Protocol** — `citadel_protocol` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Bone Architect dựng bộ công trình phòng thủ theo trận địa.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Thiết bị dựng nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (128% hiệu lực): Công trình bền hơn khi đứng cạnh**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (148% hiệu lực): Bẫy phối hợp tháp bắn**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (170% hiệu lực): Kích hoạt chế độ phòng thủ đồng bộ**. Tổng thưởng chỉ số đang có: `+2 VIT`.

**Quân Kỳ Đoàn Quân / Legion Banner** — `legion_banner` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Legion Marshal cắm cờ tăng hiệu quả giữ tuyến.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (110% hiệu lực): Quân kỳ tồn tại lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (122% hiệu lực): Tăng chống gián đoạn gần cờ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (136% hiệu lực): Tăng vùng ảnh hưởng hiệu lệnh**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (152% hiệu lực): Hiệu lệnh phản công khi bị bao vây**. Tổng thưởng chỉ số đang có: `+2 VIT`.

**Dấu Ấn Vĩnh Cửu / Eternal Mark** — `eternal_mark` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Eternal Huntsman đặt dấu ấn dài hạn lên mục tiêu mạnh.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Dấu ấn duy trì lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (118% hiệu lực): Tăng độ ổn định bắn theo dấu**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (130% hiệu lực): Chuyển dấu qua kẻ địch khi hạ mục tiêu**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (145% hiệu lực): Đòn trúng dấu tạo lần truy kích cuối**. Tổng thưởng chỉ số đang có: `+2 WIL`.

**Khúc Cầu Hồn Im Lặng / Silent Requiem** — `death_whisper` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Death Whisper kết thúc combo dagger rồi nhanh chóng rút lui.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Combo cuối ra đòn nhanh hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Đánh trúng tạo cửa sổ rút lui**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (140% hiệu lực): Thoát ra sau finisher gần như tức thì**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Gây bóng chém thứ hai lên mục tiêu trúng cuối**. Tổng thưởng chỉ số đang có: `+2 STR`.

### Tier 5 — 4 skill
| Việt / English (`id`) | Phân loại | Thưởng R3 | Thưởng R5 (riêng mốc) | Tổng stat R5 |
|---|---|---|---|---|
| **Bước Chân Chúa Tể / Sovereign Step** (`sovereign_step`) | Chủ động, Vàng, mobility | — | +1 AGI | +1 AGI |
| **Phán Quyết Vực Sâu / Abyss Judgment** (`abyss_judgment`) | Tuyệt kỹ, Đỏ, attack | +1 WIL | +2 STR | +2 STR, +1 WIL |
| **Giao Hưởng Tử Vong / Death Symphony** (`death_symphony`) | Tuyệt kỹ, Đỏ, summon | +1 INT | +2 INT | +3 INT |
| **Ý Chí Bất Tận / Endless Will** (`endless_will`) | Bị động, Vàng, passive | — | +1 STR | +1 STR |

#### Tiến hóa cụ thể của từng skill Tier 5
**Bước Chân Chúa Tể / Sovereign Step** — `sovereign_step` · Chủ động · Vàng

- **R1 (100% hiệu lực): Bước chuyển vị trí với hiệu ứng trễ ngắn, cần tiêu hao nhiều năng lượng.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (108% hiệu lực): Lướt dịch chuyển xa hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (116% hiệu lực): Bỏ qua cản trở nhỏ**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (128% hiệu lực): Tạo bóng đứng trước vị trí cũ**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (142% hiệu lực): Cho phép nối skill sau khi hoàn tất bước**. Tổng thưởng chỉ số đang có: `+1 AGI`.

**Phán Quyết Vực Sâu / Abyss Judgment** — `abyss_judgment` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Abyss Sovereign tung sóng kiếm tạo sức ép trên diện rộng.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Giảm trễ vung kiếm lớn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (125% hiệu lực): Tăng phạm vi sóng kiếm**. Tổng thưởng chỉ số đang có: `+1 WIL`.
- **R4 (140% hiệu lực): Sóng kiếm đánh trúng cả tầng bệ thấp**. Tổng thưởng chỉ số đang có: `+1 WIL`.
- **R5 (160% hiệu lực): Làn sóng thứ hai yếu đuổi theo**. Tổng thưởng chỉ số đang có: `+2 STR, +1 WIL`.

**Giao Hưởng Tử Vong / Death Symphony** — `death_symphony` · Tuyệt kỹ · Đỏ

- **R1 (100% hiệu lực): Death Sovereign ra lệnh tử linh hợp kích toàn khu vực.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Rút ngắn thời gian ra hiệu**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (128% hiệu lực): Tăng số lượt thuộc hạ đánh**. Tổng thưởng chỉ số đang có: `+1 INT`.
- **R4 (148% hiệu lực): Hợp kích chuyển mục tiêu gần khi hạ gục**. Tổng thưởng chỉ số đang có: `+1 INT`.
- **R5 (170% hiệu lực): Kết thúc bằng một đợt bộc phát linh lực**. Tổng thưởng chỉ số đang có: `+3 INT`.

**Ý Chí Bất Tận / Endless Will** — `endless_will` · Bị động · Vàng

- **R1 (100% hiệu lực): Tăng kháng gián đoạn trong một khoảng ngắn sau Ultimate.**. Tổng thưởng chỉ số đang có: `—`.
- **R2 (112% hiệu lực): Kháng ngắt sau tuyệt kỹ lâu hơn**. Tổng thưởng chỉ số đang có: `—`.
- **R3 (126% hiệu lực): Hồi thể lực khi trụ vững**. Tổng thưởng chỉ số đang có: `—`.
- **R4 (142% hiệu lực): Giảm phạt sau dùng Signature**. Tổng thưởng chỉ số đang có: `—`.
- **R5 (160% hiệu lực): Tạo lá chắn ngắn khi kết thúc Ultimate**. Tổng thưởng chỉ số đang có: `+1 STR`.

## 6. Kiểm tra thiết kế và điều kiện tránh khóa tiến trình

- **Bao phủ:** 35 nghề / 36 cạnh / 104 skill; mỗi đích Tier 1–5 có đúng 2 skill gate được nhận qua thắng huấn luyện một lần rồi dùng điểm để nâng.
- **Cạnh nhiều đầu vào:** Grave Marauder nhận từ Bone Raider hoặc Grave Bandit; Soul Weaver nhận từ Necromancer hoặc Soul Medium; cùng dùng điều kiện nghề đích nên không phát sinh bảng gate sai theo tiền nhiệm.
- **Mastery bắt buộc:** Mastery yêu cầu tối đa 95/100, không khóa bằng Level, rarity Vàng/Đỏ hoặc gacha may rủi ở Tier 0.
- **Tên và save:** sử dụng ID tiếng Anh như `bone_dash`, `Stone Throw` vẫn là tên English; trường `nameVi` mới để hiển thị. V11 giữ khóa localStorage V10; không reset hoặc migrate tiến trình khi chỉ thay nhãn.
- **Phân biệt trạng thái:** “Có đặc tả V11” khác “đã có animation/hit logic hoàn chỉnh”. Các phần đặc thù R2–R5 chưa tạo module riêng đã được đánh dấu rõ ở chương 2.
- **Không art:** toàn bộ UI và gameplay tiếp tục dùng placeholder hình khối/debug, không yêu cầu sprite/rig.

## 7. File triển khai

- `v11-design-data.js` — bộ từ điển 35 tên nghề, 104 tên skill, 34 mục tiêu Trial và đường cong rank; dữ liệu tách khỏi ID/save.
- `v11-page.js` / `v11-design.css` — tra cứu 36 cạnh trong web, lọc Tier, tìm kiếm bằng Việt/Anh.
- `skill-system.js` — trả `nameVi`, `rankPlan`, hiển thị bảng 5 bậc + tổng stat và tìm kiếm song ngữ, giữ giao dịch nâng cấp và chuyển nghề V10.
- `game-v10.js` — vẫn dùng runtime V10; đã đọc hệ số R1–R5 để tính damage trực tiếp, cooldown và startup; các hiệu ứng riêng tiếp tục theo bộ nhóm.
- `docs/08_V10_Playable_Combat_Job_Progression.md` và docs V1–V9 được giữ nguyên để đối chiếu lịch sử. Khi mâu thuẫn về tên Việt và rank **design targets**, V11 ưu tiên; game runtime thực tế vẫn cần kiểm chứng bằng chơi.

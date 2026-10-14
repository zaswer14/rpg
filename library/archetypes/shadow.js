/* Khuôn nghề — trường phái SHADOW. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  assassin: {
    id:'assassin', school:'shadow', nameEn:'Assassin', nameVi:'Sát Thủ', tiers:[3,5], trunk:['assassin'],
    fantasy:'Không ai thấy tới, không ai thấy đi.',
    core:{ kit:['Tàng hình ngắn','Đâm lưng: nhân sát thương khi đánh từ phía sau','Thoát: dịch chuyển sau đòn kết liễu'],
      weapons:['dagger'], masteries:['Dagger','Stealth'], rig:'humanoid64', shared:'Anim song đao của Assassin; dạng khác nhau ở cách tiếp cận và kết liễu.' },
    generic:{ nameEn:'Assassin', nameVi:'Sát Thủ', marker:'song đao + khăn bịt mặt' },
    variants:[
      { id:'soul_assassin',  race:'skeleton',  aspect:'soul',    nameEn:'Soul Assassin',  nameVi:'Sát Thủ Đoạt Hồn', tier:4, from:['stalker','assassin'], crown:'soul_assassin', twist:'Combo trúng đích trích hồn: càng nối chuỗi chuẩn càng mạnh, hụt một nhát thì mất chuỗi.', marker:'nửa mặt nạ xương + lọ hồn treo đai' },
      { id:'death_whisper',  race:'skeleton',  aspect:'death',   nameEn:'Death Whisper',  nameVi:'Lời Thì Thầm Tử Vong', tier:5, from:['soul_assassin'], crown:'death_whisper', twist:'Combo chớp nhoáng kết bằng xử quyết; thoát thân miễn phí sau mỗi kết liễu.', marker:'mặt nạ xương trơn, tối giản tuyệt đối' },
      { id:'blackmask',      race:'human',     aspect:'venom',   nameEn:'Blackmask',      nameVi:'Hắc Diện',         tier:3, from:['assassin'], twist:'Bôi độc lên dao: độc cộng dồn; kết liễu mục tiêu trúng độc làm độc lan sang địch gần.', marker:'mặt nạ đen trơn + lọ độc ở cổ tay' },
      { id:'nightblade',     race:'elf',       aspect:'moon',    nameEn:'Nightblade',     nameVi:'Dạ Kiếm',          tier:3, from:['assassin'], twist:'Đứng trong vùng tối là tàng hình thật, không cần skill; bước ra ánh sáng thì mất.', marker:'áo choàng màu đêm có viền bạc + dao cong' },
      { id:'silent_claw',    race:'beastfolk', aspect:'feral',   nameEn:'Silent Claw',    nameVi:'Vuốt Câm',         tier:3, from:['assassin'], twist:'Không đâm lưng: vồ từ trên cao (pounce) xuống mục tiêu, sát thương theo độ cao rơi.', marker:'thân báo đen + vuốt dài' },
      { id:'undertow',       race:'merfolk',   aspect:'abyss',   nameEn:'Undertow',       nameVi:'Dòng Ngầm',        tier:3, from:['assassin'], twist:'Lặn vào vũng nước/bóng tối như nước, trồi lên dưới chân địch và kéo xuống (khống chế).', marker:'da tối có đốm phát quang + dao móc' },
      { id:'thornkiss',      race:'fae',       aspect:'glamour', nameEn:'Thornkiss',      nameVi:'Nụ Hôn Gai',       tier:3, from:['assassin'], twist:'Hôn gây Mê; mục tiêu đang Mê nhận gấp ba sát thương đâm lưng.', marker:'môi tím + kim cài tóc làm vũ khí' },
      { id:'shadow_cross',   race:'*', faith:'dark', aspect:'dark', nameEn:'Shadow Cross', nameVi:'Thập Tự Bóng', tier:4, from:['stalker'], crown:'shadow_cross', twist:'Hợp đồng: ký lên một mục tiêu (đánh dấu, tốn 5% máu); mục tiêu đã ký nhận gấp đôi sát thương, mọi mục tiêu khác chỉ 70%. Mọi chủng tộc theo Hắc Giáo.', marker:'hai dao chéo khắc trăng + mặt nạ nửa' }
    ]
  },

  trickster: {
    id:'trickster', school:'shadow', schoolAlt:['arcane'], nameEn:'Trickster', nameVi:'Kẻ Lừa Phỉnh', tiers:[3,5], trunk:['stalker','bandit'],
    fantasy:'Thắng bằng việc làm kẻ địch đánh nhầm chỗ.',
    core:{ kit:['Mồi nhử/phân thân hút sự chú ý của AI','Hoán đổi vị trí với mồi nhử','Đòn giả (feint): phạt địch phản ứng sai'],
      weapons:['dagger','sword'], masteries:['Stealth','Dagger'], rig:'humanoid64', shared:'Phân thân dùng lại sprite của chính nhân vật (đổi alpha/palette): gần như không tốn art.' },
    generic:{ nameEn:'Trickster', nameVi:'Kẻ Lừa Phỉnh', marker:'mặt nạ cười' },
    variants:[
      { id:'bone_mimic',  race:'skeleton',  aspect:'death',   nameEn:'Bone Mimic',  nameVi:'Xương Giả Chết',  tier:3, from:['stalker','bandit'], twist:'Giả chết: sụp thành đống xương (miễn sát thương, địch mất mục tiêu) rồi ráp lại phía sau lưng kẻ gần nhất.', marker:'khớp buộc chỉ đỏ lỏng lẻo + mặt nạ cười cắm trên sọ' },
      { id:'charlatan',   race:'human',     aspect:'venom',   nameEn:'Charlatan',   nameVi:'Kẻ Bịp',          tier:3, from:['bandit'], twist:'Mồi nhử là hình nộm rơm, bị đánh vỡ thì nổ bột cay (mù + ho).', marker:'mũ chóp cao + vali đầy mánh' },
      { id:'mirrorshade', race:'elf',       aspect:'moon',    nameEn:'Mirrorshade', nameVi:'Bóng Gương',      tier:3, from:['stalker'], twist:'Dựng gương: đạn và phép bắn vào gương bị phản lại; hoán đổi chỗ với gương.', marker:'gương tròn bạc đeo lưng' },
      { id:'fox_spirit',  race:'beastfolk', aspect:'glamour', nameEn:'Fox Spirit',  nameVi:'Hồ Ly',           tier:4, from:['stalker'], twist:'Mỗi đuôi là một phân thân (tối đa 3 rồi 9 ở bậc cao); phân thân bị đánh vỡ thì mất đuôi cho tới hết trận.', marker:'nhiều đuôi cáo xòe quạt' },
      { id:'mirage',      race:'merfolk',   aspect:'tide',    nameEn:'Mirage',      nameVi:'Ảo Thủy',         tier:3, from:['stalker'], twist:'Gọi sương biển: trong sương có ba bóng giống hệt, đòn từ bóng thật mới gây sát thương.', marker:'sương mù quấn chân + vảy óng ánh' },
      { id:'puck',        race:'fae',       aspect:'glamour', nameEn:'Puck',        nameVi:'Tiểu Quỷ Trêu',   tier:3, from:['bandit','assassin'], crown:'puck', twist:'Đánh tráo: đổi vị trí hai địch, đổi vũ khí địch thành đồ chơi 3s, đổi chỗ với đồng minh đang nguy.', marker:'mũ chuông + đuôi áo hai màu + luôn cười' },
      { id:'trickster',   race:'fae',       aspect:'glamour', nameEn:'Trickster',   nameVi:'Kẻ Lừa Phỉnh',    tier:4, from:['stalker','puck'], crown:'trickster', twist:'Luôn có hai ảo ảnh của chính mình; mọi đòn feint đều tạo thêm một ảo ảnh.', marker:'mặt nạ cười + hai ảo ảnh' },
      { id:'prince_of_lies', race:'fae',    aspect:'glamour', nameEn:'Prince of Lies', nameVi:'Vương Tử Dối Trá', tier:5, from:['trickster'], crown:'prince_of_lies', twist:'Đảo thật giả: ảo ảnh gây sát thương thật, bản thân không bị đánh trúng cho tới khi ảo ảnh cuối vỡ.', marker:'mặt nạ không có mặt sau, vương miện là bóng đổ + 4 ảo ảnh' }
    ]
  },

  witch_hunter: {
    id:'witch_hunter', school:'shadow', schoolAlt:['combat'], nameEn:'Witch Hunter', nameVi:'Thợ Săn Phù Thủy', tiers:[3,4], trunk:['stalker'],
    fantasy:'Kẻ sinh ra để giết người dùng phép.',
    core:{ kit:['Đánh dấu caster: tăng sát thương lên kẻ đang thi triển/triệu hồi','Cắt phép (interrupt)','Kháng phép bản thân'],
      weapons:['sword','crossbow'], masteries:['Stealth','Sword'], rig:'humanoid64', shared:'Anim của Stalker + một phát nỏ tay.' },
    generic:{ nameEn:'Witch Hunter', nameVi:'Thợ Săn Phù Thủy', marker:'mũ rộng vành + nỏ tay' },
    variants:[
      { id:'grave_warden', race:'skeleton',  aspect:'death',   nameEn:'Grave Warden', nameVi:'Thủ Mộ',           tier:3, from:['stalker'], twist:'Săn chính đồng loại: đánh trúng undead/thuộc hạ dưới 30% máu thì "trả về yên nghỉ" (giết ngay).', marker:'đèn lồng mộ + chùm chìa khóa lớn' },
      { id:'inquisitor',   race:'*', faith:'light', aspect:'light', nameEn:'Inquisitor', nameVi:'Phán Quan', tier:4, from:['stalker'], crown:'inquisitor', twist:'Xích bạc trói caster; mục tiêu bị trói không thi triển được. Mọi chủng tộc theo Quang Minh.', marker:'mũ rộng vành + xích bạc + sách' },
      { id:'exorcist',     race:'*', faith:'light', aspect:'light', nameEn:'Exorcist',   nameVi:'Trừ Tà Sư', tier:3, from:['medium'], crown:'exorcist', twist:'Săn undead và curse thay vì caster: chuông bạc làm undead/thuộc hạ địch khựng; giam hồn địch bị hạ để chặn hồi sinh.', marker:'chuông bạc + sách kinh xích tay', note:'Ngọn Quang Minh thuộc trường phái Death nhìn từ phía Ánh Sáng.' },
      { id:'spellthief',   race:'elf',       aspect:'arcane',  nameEn:'Spellthief',   nameVi:'Kẻ Trộm Phép',     tier:3, from:['stalker'], twist:'Cắt phép thành công thì được dùng lại đúng phép vừa cắt một lần.', marker:'găng tay khắc vòng phép + túi đựng tia sáng' },
      { id:'runebreaker',  race:'dwarf',     aspect:'rune',    nameEn:'Runebreaker',  nameVi:'Kẻ Phá Rune',      tier:3, from:['stalker'], twist:'Đập vỡ vùng phép/bẫy phép trên sàn và hấp thụ thành giáp.', marker:'búa nhỏ đầu tù + găng sắt có rune gạch chéo' },
      { id:'mage_breaker', race:'orc',       aspect:'blood',   nameEn:'Mage Breaker', nameVi:'Phá Pháp',         tier:3, from:['stalker'], twist:'Ghét phép tận xương: miễn khống chế phép khi đang tích rage; đòn đầu tiên lên caster gây choáng.', marker:'gậy sắt + bùa caster treo làm chiến lợi phẩm' },
      { id:'null_unit',    race:'construct', aspect:'machine', nameEn:'Null Unit',    nameVi:'Đơn Vị Vô Hiệu',   tier:3, from:['stalker'], twist:'Bật trường triệt phép quanh mình: không ai thi triển được trong vùng, kể cả đồng minh.', marker:'ăng-ten vòng trên đầu + lõi tối màu' }
    ]
  },

  raider: {
    id:'raider', school:'shadow', schoolAlt:['combat'], nameEn:'Raider', nameVi:'Kẻ Cướp Phá', tiers:[3,4], trunk:['bandit'],
    fantasy:'Đánh nhanh, lấy đồ, chạy trước khi ai kịp phản ứng.',
    core:{ kit:['Cướp: đòn trúng có thể rơi tài nguyên hoặc cướp buff của địch','Đánh rồi chạy: tăng tốc sau mỗi đòn trúng','Ném đồ cướp được'],
      weapons:['dagger','axe'], masteries:['Dagger','Axe'], rig:'humanoid64', shared:'Anim của Bandit; túi đồ cướp là overlay lớn dần theo trận.' },
    generic:{ nameEn:'Raider', nameVi:'Kẻ Cướp Phá', marker:'túi chiến lợi phẩm + rìu ngắn' },
    variants:[
      { id:'grave_marauder', race:'skeleton',  aspect:'death',   nameEn:'Grave Marauder', nameVi:'Kẻ Tàn Phá Lăng Mộ', tier:3, from:['bandit'], crown:'grave_marauder', twist:'Đòn rìu rộng, dồn sát thương; phòng thủ yếu.', marker:'vương miện cướp được đội lệch + đai chiến lợi phẩm' },
      { id:'highwayman',     race:'human',     aspect:'steel',   nameEn:'Highwayman',     nameVi:'Cướp Đường',       tier:3, from:['bandit'], twist:'Súng lục một phát + kiếm; tiền cướp được ném ra thành sát thương ("ném vàng").', marker:'khăn che nửa mặt + áo khoác dài + súng lục' },
      { id:'vault_breaker',  race:'dwarf',     aspect:'stone',   nameEn:'Vault Breaker',  nameVi:'Kẻ Phá Kho',       tier:3, from:['bandit'], twist:'Phá rương/cửa/vật cản cực nhanh; ném thuốc nổ nhỏ làm sập nền.', marker:'xà beng + dây thuốc nổ quấn ngực' },
      { id:'trash_bandit',   race:'beastfolk', aspect:'feral',   nameEn:'Trash Bandit',   nameVi:'Đạo Chích Gấu Mèo',tier:3, from:['bandit'], twist:'Nhặt mọi thứ trên sàn (xác, đá, đạn rơi) làm đạn ném, mỗi loại một hiệu ứng.', marker:'mặt nạ lông gấu mèo + túi rác phồng', note:'Thân gấu mèo.' },
      { id:'corsair',        race:'merfolk',   aspect:'tide',    nameEn:'Corsair',        nameVi:'Hải Tặc',          tier:3, from:['bandit'], twist:'Móc câu đu dây qua hố (grapple swing); cướp buff của địch bị móc.', marker:'mũ ba góc san hô + móc câu thay tay' },
      { id:'plunderer',      race:'orc',       aspect:'blood',   nameEn:'Plunderer',      nameVi:'Kẻ Vơ Vét',        tier:3, from:['bandit'], twist:'Túi cướp càng đầy càng chậm nhưng càng cứng; đổ túi ra thành một làn đồ vật quét sàn.', marker:'bao tải khổng lồ trên lưng' },
      { id:'changeling',     race:'fae',       aspect:'glamour', nameEn:'Changeling',     nameVi:'Kẻ Đánh Tráo',     tier:3, from:['bandit'], twist:'Bị đánh trúng thì sao chép đòn thường của kẻ đánh, dùng thay đòn của mình cho tới lần sao chép sau.', marker:'mặt không rõ nét, đổi theo kẻ vừa đánh' }
    ]
  },

  stalker: {
    id:'stalker', school:'shadow', nameEn:'Stalker', nameVi:'Kẻ Rình Rập', tiers:[3,4], trunk:['stalker'],
    fantasy:'Đôi mắt của cả đội; ở chỗ không ai nghĩ có người.',
    core:{ kit:['Leo tường và trần','Tàng hình khi đứng yên','Trinh sát: thấy địch qua tường, đánh dấu cho đồng đội'],
      weapons:['dagger'], masteries:['Stealth','Trap'], rig:'humanoid64', shared:'Anim climb/cling của Stalker (cần làm một lần cho mọi dạng).' },
    generic:{ nameEn:'Stalker', nameVi:'Kẻ Rình Rập', marker:'mũ trùm không mặt + móng leo' },
    variants:[
      { id:'shade_stalker', race:'skeleton',  aspect:'soul',    nameEn:'Shade Stalker', nameVi:'Kẻ Rình Rập Bóng Tối', tier:3, from:['assassin','bandit'], skinOf:'stalker', twist:'Tàng hình ngắn sau mỗi lần né; giá trị cơ động cao hơn sát thương.', marker:'mũ trùm không mặt, hốc mắt sáng mờ' },
      { id:'shadowleaf',    race:'elf',       aspect:'nature',  nameEn:'Shadowleaf',    nameVi:'Lá Ẩn',            tier:3, from:['stalker'], twist:'Đứng trong cỏ/bụi là vô hình hoàn toàn; có thể trồng bụi cây tạm.', marker:'áo choàng lá sống phủ kín' },
      { id:'deep_delver',   race:'dwarf',     aspect:'stone',   nameEn:'Deep Delver',   nameVi:'Kẻ Đào Sâu',       tier:3, from:['stalker'], twist:'Đào xuyên sàn: di chuyển dưới đất rồi trồi lên hất tung địch phía trên.', marker:'găng đào có vuốt + kính bảo hộ' },
      { id:'webstalker',    race:'beastfolk', aspect:'venom',   nameEn:'Webstalker',    nameVi:'Kẻ Giăng Tơ',      tier:3, from:['stalker'], twist:'Giăng tơ làm đường leo tạm và bẫy dính; treo ngược trên trần để đánh xuống.', marker:'thêm một cặp tay nhện + tơ trắng', note:'Thân nhện: phá rig (thêm tay); cân nhắc kỹ.' },
      { id:'reef_lurker',   race:'merfolk',   aspect:'tide',    nameEn:'Reef Lurker',   nameVi:'Kẻ Rình Rạn',      tier:3, from:['stalker'], twist:'Đổi màu như bạch tuộc: đứng sát tường thì vô hình; phun mực che tầm nhìn.', marker:'da đổi màu + xúc tu thay tóc' },
      { id:'will_o_wisp',   race:'fae',       aspect:'glamour', nameEn:'Will-o-Wisp',   nameVi:'Ma Trơi',          tier:3, from:['stalker'], twist:'Hóa đốm sáng để di chuyển (không đánh được và không bị đánh); dụ AI địch đi lạc theo mình.', marker:'đèn lồng ma trơi thay đầu khi hóa' }
    ]
  }
});

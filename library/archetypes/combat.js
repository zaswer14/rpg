/* Khuôn nghề — trường phái COMBAT. Quy ước dữ liệu: xem ../catalog.js (đầu file) và ../docs/02_Archetype_Catalog.md. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  sentinel: {
    id:'sentinel', school:'combat', nameEn:'Sentinel', nameVi:'Thủ Vệ', tiers:[3,4], trunk:['guard','phalanx'],
    fantasy:'Bức tường sống giữa đồng đội và kẻ thù; thắng bằng việc không lùi.',
    core:{ kit:['Giơ khiên giữ nút: chặn sát thương phía trước, không bị đẩy lùi','Khiêu khích: kéo địch gần về mình','Phản đòn khi chặn đúng nhịp'],
      weapons:['swordshield','spearshield'], masteries:['Shield','Spear'], rig:'humanoid64', shared:'Bộ anim block/counter của Guard; khiên là overlay riêng từng dạng.' },
    generic:{ nameEn:'Sentinel', nameVi:'Thủ Vệ', marker:'khiên tháp cao tới cằm' },
    variants:[
      { id:'ossuary_wall',   race:'skeleton',  aspect:'death',   nameEn:'Ossuary Wall',   nameVi:'Tường Hài Cốt',  tier:3, from:['guard'],   twist:'Mỗi địch chết gần đó ghép thêm một mảnh xương vào khiên (giáp tích lũy); khiên đầy thì vỡ thành mảnh bắn ra phía trước.', marker:'khiên ghép từ xương sườn, sọ ở tâm' },
      { id:'bastion',        race:'human',     aspect:'steel',   nameEn:'Bastion',        nameVi:'Thành Lũy',      tier:3, from:['guard'],   twist:'Cắm khiên xuống đất thành vật cản thật: đồng minh nấp sau, đứng lên được như platform; nhặt lại mới đánh tiếp.', marker:'khiên tháp có chân chống + huy hiệu phe' },
      { id:'bark_guardian',  race:'elf',       aspect:'nature',  nameEn:'Bark Guardian',  nameVi:'Vệ Vỏ Cây',      tier:3, from:['guard'],   twist:'Khiên gỗ sống vỡ thì mọc lại sau vài giây; giữ chặn hồi máu chậm cho đồng minh đứng sau lưng.', marker:'khiên vỏ cây còn lá non ở mép' },
      { id:'stone_sentinel', race:'dwarf',     aspect:'stone',   nameEn:'Stone Sentinel', nameVi:'Thạch Vệ',       tier:3, from:['guard'],   crown:'stone_sentinel', twist:'Giơ khiên thì không bị đẩy lùi chút nào, nhưng cũng không nhảy được.', marker:'khiên tháp đá nguyên khối + mũ đá' },
      { id:'ironbreaker',    race:'dwarf',     aspect:'steel',   nameEn:'Ironbreaker',    nameVi:'Phá Thiết',      tier:4, from:['phalanx','stone_sentinel'], crown:'ironbreaker', twist:'Mỗi lần chặn thành công tích Phá Thiết; đòn rìu kế tiếp phá giáp theo số tầng.', marker:'hai rìu ngắn + mũ mặt nạ sắt' },
      { id:'shellback',      race:'beastfolk', aspect:'stone',   nameEn:'Shellback',      nameVi:'Lưng Mai',       tier:3, from:['guard'],   twist:'Không cầm khiên: thu mình vào mai (bất động, gần như miễn sát thương) rồi lăn tông về một hướng.', marker:'mai rùa trên lưng thay khiên', note:'Dạng thân rùa của người thú: cần biến thể thân, không chỉ overlay.' },
      { id:'coral_sentinel', race:'merfolk',   aspect:'tide',    nameEn:'Coral Sentinel', nameVi:'San Hô Vệ',      tier:3, from:['guard'],   crown:'coral_sentinel', twist:'Chặn đòn tích Thủy trong khiên vỏ sò; xả thành sóng đẩy lùi cả hàng địch.', marker:'khiên vỏ sò khổng lồ + san hô trên vai' },
      { id:'iron_tusk',      race:'orc',       aspect:'feral',   nameEn:'Iron Tusk',      nameVi:'Nanh Sắt',       tier:3, from:['guard'],   twist:'Khiên có nanh: chặn xong lao khiên húc thẳng, đẩy địch vào tường gây choáng.', marker:'khiên tròn đóng hai nanh lợn rừng' },
      { id:'flame_warden',   race:'dragonkin', aspect:'fire',    nameEn:'Flame Warden',   nameVi:'Hỏa Vệ',         tier:3, from:['guard'],   crown:'flame_warden', twist:'Chặn thành công thì phun một luồng lửa ngắn ra trước.', marker:'khiên tròn có lò lửa ở tâm' },
      { id:'war_frame',      race:'construct', aspect:'machine', nameEn:'War Frame',      nameVi:'Chiến Khung',    tier:4, from:['phalanx'], crown:'war_frame', twist:'Khiên gắn liền cẳng tay, không bao giờ hạ; chế độ Neo biến thân thành vật cản bất động.', marker:'khiên liền tay + bánh xích ở chân' },
      { id:'blackguard',     race:'*', faith:'dark', aspect:'dark', nameEn:'Blackguard',   nameVi:'Hắc Vệ',         tier:3, from:['guard'],   crown:'blackguard', twist:'Chặn đòn thì hút máu kẻ đánh; khiêu khích tốn 3% máu nhưng kéo cả hàng địch.', marker:'khiên đen có mặt trăng khuyết + xích quấn tay' }
    ]
  },

  knight: {
    id:'knight', school:'combat', schoolAlt:['beast'], nameEn:'Knight', nameVi:'Kỵ Sĩ', tiers:[3,5], trunk:[],
    fantasy:'Giáp nặng trên lưng chiến thú; xung phong mở trận, xuống ngựa vẫn đánh được.',
    core:{ kit:['Xung phong: lao theo đường thẳng, sát thương tăng theo quãng đường','Lên/xuống thú cưỡi: hai bộ đòn (cưỡi và đi bộ)','Quét thương từ lưng thú'],
      weapons:['lance','swordshield'], masteries:['Spear','Riding','Shield'], rig:'mounted',
      shared:'Một bộ anim cưỡi chung (idle/gallop/rear/jump/charge, khung 96×64); mỗi dạng chỉ vẽ lại sprite thú cưỡi và người.' },
    generic:{ nameEn:'Knight', nameVi:'Kỵ Sĩ', marker:'chiến mã có giáp + cờ đuôi thương' },
    variants:[
      { id:'death_knight',      race:'skeleton', faith:'dark', aspect:'death', nameEn:'Death Knight', nameVi:'Kỵ Sĩ Tử Vong', tier:4, from:['dread_knight'], crown:'death_knight', mount:'ngựa xương lửa hồn',
        twist:'Ngựa không chết hẳn: hết máu thì tan thành đống xương rồi tự ráp lại sau 6s (trong lúc đó kỵ sĩ đi bộ). Xung phong để lại vệt lửa hồn.', marker:'mũ mặt sọ + ngựa xương có giáp mảnh', note:'Dạng skeleton + Hắc Giáo. Crown V12.3 hiện đi bộ; chọn dạng này nghĩa là thêm ngựa xương (rig mounted).' },
      { id:'penitent_knight',   race:'skeleton', faith:'light', aspect:'light', nameEn:'Penitent Knight', nameVi:'Kỵ Sĩ Sám Hối', tier:4, from:['paladin'], crown:'penitent_knight', mount:'ngựa xương quấn băng thánh',
        twist:'Undead thề với Ánh Sáng: hào quang thiêu chính mình 1% máu/3s; mỗi undead bị hạ hồi lại toàn bộ phần đã mất. Xung phong để lại vệt sáng thiêu undead.', marker:'xương phủ vải thánh trắng ố + ngựa xương quấn băng' },
      { id:'headless_horseman', race:'skeleton',  aspect:'soul',    nameEn:'Headless Horseman', nameVi:'Kỵ Sĩ Không Đầu',  tier:5, from:['death_knight','wild_hunt_captain'], crown:'headless_horseman', mount:'ngựa xương lửa lạnh',
        twist:'Ném chính sọ mình như bom lửa hồn rồi gọi về; khi sọ rời thân, ngựa tự lao về điểm sọ rơi.', marker:'sọ cầm trên tay, cổ trống' },
      { id:'radiant_knight',    race:'*', faith:'light', aspect:'light', nameEn:'Radiant Knight', nameVi:'Kỵ Sĩ Ánh Sáng', tier:4, from:['paladin'], crown:'radiant_knight', mount:'ngựa trắng giáp vàng', excludes:['dark_knight'],
        twist:'Xung phong để lại vệt sáng hồi máu đồng minh đi qua; đòn đầu tiên sau xung phong gây Chói. Mọi chủng tộc theo Quang Minh (trừ skeleton: có dạng Sám Hối riêng).', marker:'thương có cờ mặt trời + khăn trắng trên mũ' },
      { id:'dark_knight',       race:'*', faith:'dark', aspect:'dark', nameEn:'Dark Knight', nameVi:'Hắc Kỵ Sĩ', tier:4, from:['blackguard'], crown:'dark_knight', mount:'ngựa đen mắt đỏ', excludes:['radiant_knight'],
        twist:'Mỗi lần xung phong tự trả 5% máu; hút máu theo sát thương; máu càng thấp đòn càng nặng. Mọi chủng tộc theo Hắc Giáo (trừ skeleton: Kỵ Sĩ Tử Vong).', marker:'mũ sừng gãy + áo choàng rách đỏ sẫm' },
      { id:'silverhorn_knight', race:'elf',       aspect:'moon',    nameEn:'Silverhorn Knight', nameVi:'Kỵ Sĩ Ngân Giác',  tier:4, from:['ranger_lord','blademaster'], mount:'nai một sừng bạc',
        twist:'Xung phong xuyên qua địch không dừng, nửa đường cuối tàng hình; mạnh hơn trong vùng tối.', marker:'thú cưỡi một sừng bạc + thương mảnh' },
      { id:'tusk_knight',       race:'beastfolk', aspect:'feral',   nameEn:'Tusk Knight',       nameVi:'Kỵ Sĩ Nanh Ngà',   tier:4, from:['beast_rider','guard'], mount:'lợn rừng chiến / tê giác',
        twist:'Không có thương: thú cưỡi húc là đòn chính. Xung phong không dừng được giữa chừng nhưng xuyên giáp.', marker:'nanh thú bọc sắt + yên da lông' },
      { id:'steam_knight',      race:'dwarf',     aspect:'machine', nameEn:'Steam Knight',      nameVi:'Kỵ Sĩ Hơi Nước',   tier:4, from:['guard','engineer'], mount:'lợn máy đồng thau',
        exception:'Beast bị cấm với dwarf: thú cưỡi là cỗ máy, dùng Engineering thay Riding.',
        twist:'Xung phong tốn Nhiệt; quá nhiệt thì máy đứng 2s nhưng xả hơi gây bỏng quanh.', marker:'lợn máy phun hơi + mũ kính' },
      { id:'crab_knight',       race:'merfolk',   aspect:'tide',    nameEn:'Crab Knight',       nameVi:'Kỵ Sĩ Cua',        tier:4, from:['beast_rider','coral_sentinel'], mount:'cua khổng lồ',
        twist:'Xung phong đi ngang hai chiều không cần quay đầu; càng cua kẹp giữ mục tiêu; thu càng thì vỏ chặn từ mọi phía.', marker:'cua lớn + đinh ba' },
      { id:'drakeback_knight',  race:'dragonkin', aspect:'fire',    nameEn:'Drakeback Knight',  nameVi:'Kỵ Sĩ Lưng Long',  tier:4, from:['drake_handler'], crown:'drakeback_knight', mount:'long câu không cánh đã tự nuôi',
        twist:'Cưỡi chính con long câu đã nuôi từ T3; thú phun lửa theo hướng xung phong; xuống thú thì nó đánh độc lập như thuộc hạ.', marker:'long câu vảy đỏ đủ lớn để cưỡi + giáp vảy' },
      { id:'sky_tyrant',        race:'dragonkin', aspect:'fire',    nameEn:'Sky Tyrant',        nameVi:'Bạo Chúa Trời',    tier:5, from:['drakeback_knight'], crown:'sky_tyrant', mount:'long câu có cánh (rig bay riêng)',
        twist:'Kỵ thú duy nhất bay thật: lượn trên màn rồi bổ nhào; thú trúng đòn nhiều thì rơi, đi bộ tới khi hồi.', marker:'long câu có cánh + thương dài, kỵ sĩ không mũ' },
      { id:'moth_knight',       race:'fae',       aspect:'glamour', nameEn:'Moth Knight',       nameVi:'Kỵ Sĩ Thiêu Thân', tier:4, from:['duelist','beast_rider'], mount:'bướm đêm khổng lồ',
        exception:'Combat nặng bị cấm với fae: đây là kỵ nhẹ, không giáp, dùng Riding + Arcane.',
        twist:'Xung phong trên không (bay ngắn), rắc phấn gây Mê trên đường bay.', marker:'bướm đêm cánh mắt cú + thương mảnh như kim' },
      { id:'chassis_knight',    race:'construct', aspect:'machine', nameEn:'Chassis Knight',    nameVi:'Kỵ Sĩ Khung Máy',  tier:4, from:['phalanx','engineer'], mount:'nửa dưới là khung bốn chân',
        twist:'Không xuống thú được (thân liền khung); bù lại không bao giờ bị hất ngã, xung phong hồi nhanh.', marker:'thân người máy gắn liền khung bốn chân (nhân mã cơ khí)' }
    ]
  },

  oathbound: {
    id:'oathbound', school:'combat', schoolAlt:['death','arcane'], nameEn:'Oathbound', nameVi:'Kẻ Giữ Thề', tiers:[3,5], trunk:['guard'],
    fantasy:'Chiến binh mượn sức mạnh từ một lời thề với thế lực lớn hơn mình; giữ thề thì mạnh, phá thề thì mất.',
    core:{ kit:['Lời Thề: tài nguyên tích khi giữ điều kiện thề, mất khi vi phạm','Phán Quyết: xả toàn bộ Lời Thề vào một nhát','Hào quang nhỏ quanh thân'],
      weapons:['sword','swordshield'], masteries:['Sword','Shield'], rig:'humanoid64', shared:'Anim của Guard/Duelist; dạng khác nhau ở điều kiện thề, màu và hào quang.' },
    generic:{ nameEn:'Oathbound', nameVi:'Kẻ Giữ Thề', marker:'dải băng lời thề quấn tay cầm vũ khí' },
    variants:[
      { id:'dread_knight',    race:'skeleton', faith:'dark', aspect:'death', nameEn:'Dread Knight', nameVi:'Kỵ Sĩ Kinh Hoàng', tier:3, from:['guard'], crown:'dread_knight', twist:'Thề với cái chết (ký kết Hắc Giáo): tích Thề khi đứng gần địch đang bị Curse. Vứt khiên, đại kiếm.', marker:'mũ kín không mào + xích, không khiên' },
      { id:'abyss_sovereign', race:'skeleton', faith:'deep', aspect:'abyss', nameEn:'Abyss Sovereign', nameVi:'Chúa Tể Vực Sâu', tier:5, from:['death_knight'], crown:'abyss_sovereign', twist:'Đổi đạo từ Hắc Giáo sang Vực Giáo: mỗi đòn kéo địch về phía mình; Phán Quyết là sóng xung kích trọng lực.', marker:'pauldron khổng lồ + khe nứt đỏ', note:'Trùng từ khóa "Abyss" với Abyss Priest (Vực Giáo).' },
      { id:'ossuary_saint',   race:'skeleton', faith:'light', aspect:'light', nameEn:'Ossuary Saint', nameVi:'Thánh Cốt', tier:5, from:['penitent_knight'], crown:'ossuary_saint', twist:'Xương được thánh hóa: Thề tích khi chịu đòn thay đồng minh; chết lần nữa thì tan thành ánh sáng hồi sinh mọi đồng minh với 50% máu.', marker:'xương trắng tinh phát sáng từ trong + không giáp, không vũ khí' },
      { id:'paladin',         race:'*', faith:'light', aspect:'light', nameEn:'Paladin', nameVi:'Thánh Kỵ Sĩ', tier:3, from:['guard'], crown:'paladin', twist:'Thề bảo hộ: tích Thề khi chặn đòn thay đồng minh; Phán Quyết hồi máu vùng. Cửa vào nhánh chiến của Quang Minh cho mọi chủng tộc.', marker:'khiên mặt trời + áo choàng trắng vai' },
      { id:'oathbreaker',     race:'*', faith:'dark', aspect:'dark', nameEn:'Oathbreaker', nameVi:'Kẻ Phá Thề', tier:4, from:['paladin'], crown:'oathbreaker', hidden:true, unlock:'apostasy:light→dark',
        twist:'Lời Thề âm: tích khi đồng minh gục hoặc khi tự bỏ chặn; Phán Quyết hút máu mọi địch quanh.', marker:'khiên mặt trời bị cào nát + ánh sáng tím', note:'Dạng ẩn: chỉ Thánh Kỵ Sĩ bỏ đạo sang Hắc Giáo mới mở. Mọi chủng tộc.' },
      { id:'living_saint',    race:'*', faith:'light', aspect:'light', nameEn:'Living Saint', nameVi:'Thánh Sống', tier:5, from:['crusader_lord','cardinal'], crown:'living_saint', twist:'Thề không hề vơi: Thề tích từ cả đồng minh (họ chặn/hồi cũng tính cho mình). Chết một lần thì hồi sinh với hào quang thiêu mọi thứ 5s.', marker:'hào quang thật sau đầu + không mũ, không khiên' },
      { id:'fell_sovereign',  race:'*', faith:'dark', aspect:'dark', nameEn:'Fell Sovereign', nameVi:'Hắc Chúa', tier:5, from:['dark_knight','oathbreaker'], crown:'fell_sovereign', twist:'Trả toàn bộ Devotion để bất tử 8s; trong lúc đó mọi sát thương nhận được trở thành nợ, trả bằng máu sau khi hết.', marker:'vương miện gai đen mọc từ da + áo choàng bằng bóng' },
      { id:'moonsworn',       race:'elf',       aspect:'moon',     nameEn:'Moonsworn',       nameVi:'Kẻ Thề Trăng',     tier:3, from:['duelist','guard'], twist:'Sức mạnh theo pha trăng: trận chia 3 pha (đầy–khuyết–mới), mỗi pha một bộ đòn khác.', marker:'trăng lưỡi liềm khắc trên giáp ngực' },
      { id:'ancestor_sworn',  race:'dwarf',     aspect:'ancestor', nameEn:'Ancestor-Sworn',  nameVi:'Kẻ Thề Tổ Tiên',   tier:3, from:['guard'], twist:'Lần đầu xuống dưới 10% máu, hồn tổ tiên hiện ra đánh cùng 5s (một lần mỗi trận).', marker:'tượng tổ tiên nhỏ đeo ngực + râu tết chỉ vàng' },
      { id:'packsworn',       race:'beastfolk', aspect:'feral',    nameEn:'Packsworn',       nameVi:'Kẻ Thề Bầy',       tier:3, from:['guard','duelist'], twist:'Thề với bầy: Thề tăng theo số đồng minh/thuộc hạ ở gần; đứng một mình thì mất dần.', marker:'vòng cổ răng của cả bầy' },
      { id:'bloodsworn',      race:'orc',       aspect:'blood',    nameEn:'Bloodsworn',      nameVi:'Kẻ Thề Máu',       tier:3, from:['guard','duelist'], twist:'Trả máu để nạp Thề tức thì; Phán Quyết hồi lại phần máu đã trả nếu kết liễu.', marker:'vết cắt sơn đỏ ngang lòng bàn tay + dao nghi lễ' },
      { id:'tidesworn',       race:'merfolk',   aspect:'tide',     nameEn:'Tidesworn',       nameVi:'Kẻ Thề Triều',     tier:3, from:['guard'], twist:'Thề lên xuống theo thủy triều (chu kỳ 20s): triều lên thì thủ mạnh, triều xuống thì công mạnh.', marker:'vạch đo triều khắc dọc khiên' },
      { id:'ashsworn',        race:'dragonkin', aspect:'fire',     nameEn:'Ashsworn',        nameVi:'Kẻ Thề Tro',       tier:3, from:['guard'], twist:'Thề không lùi: mỗi bước lùi mất Thề; Phán Quyết là cột lửa tại chỗ đứng.', marker:'tro phủ vảy, mắt than hồng' },
      { id:'pact_knight',     race:'fae',       aspect:'glamour',  nameEn:'Pact Knight',     nameVi:'Kỵ Sĩ Khế Ước',    tier:4, from:['blademaster','duelist'], exception:'Combat foreign qua nhánh kiếm mỏng (duelist).',
        twist:'Ký khế với một kẻ địch: nếu kẻ đó đánh ai khác ngoài mình thì nhận sát thương phạt.', marker:'cuộn khế ước bay quanh + kiếm mỏng' },
      { id:'directive_knight',race:'construct', aspect:'rune',     nameEn:'Directive Knight',nameVi:'Kỵ Sĩ Chỉ Thị',    tier:3, from:['guard'], twist:'Lời thề là dòng lệnh khắc trong lõi: chọn một chỉ thị đầu trận (Bảo vệ / Tiêu diệt / Sống sót), mỗi chỉ thị một điều kiện tích Thề.', marker:'dòng chữ rune chạy quanh lõi ngực' }
    ]
  },

  berserker: {
    id:'berserker', school:'combat', schoolAlt:['martial'], nameEn:'Berserker', nameVi:'Cuồng Chiến', tiers:[3,5], trunk:['duelist'],
    fantasy:'Bỏ phòng thủ để đổi lấy cơn điên; máu càng ít càng nguy hiểm.',
    core:{ kit:['Cuồng Nộ: thanh rage tích khi gây/nhận sát thương','Trạng thái Điên: không bị khựng, đánh nhanh hơn, không chặn được','Lao bổ từ trên cao'],
      weapons:['axe','sword'], masteries:['Axe','Body'], rig:'humanoid64', shared:'Anim rìu của Raider/Duelist; dạng Điên là palette + hiệu ứng, không phải sheet mới (trừ ghi chú).' },
    generic:{ nameEn:'Berserker', nameVi:'Cuồng Chiến', marker:'không giáp ngực, hai vũ khí' },
    variants:[
      { id:'bone_reaver',        race:'skeleton',  aspect:'death',   nameEn:'Bone Reaver',        nameVi:'Cốt Cuồng',          tier:3, from:['duelist'], twist:'Khi Điên, xương rơi rụng: mỗi đòn trúng bắn mảnh xương ra quanh. Chết trong lúc Điên thì tự ráp lại một lần với 20% máu.', marker:'xương sườn gãy lởm chởm + rìu cắm mảnh xương' },
      { id:'dragonbone_warlord', race:'skeleton',  aspect:'fire',    nameEn:'Dragonbone Warlord', nameVi:'Long Cốt Chiến Chúa',tier:5, from:['death_knight','grave_marauder'], crown:'dragonbone_warlord', hidden:true, unlock:'item:dragon_heart', twist:'Body Evolution Dragonbone: Điên mở hơi thở rồng xương và không giới hạn thời gian khi đang kết liễu liên tục.', marker:'sừng xương từ sọ + vảy xương vai' },
      { id:'flagellant',         race:'human',     aspect:'light',   nameEn:'Flagellant',         nameVi:'Kẻ Tự Hành',         tier:3, from:['duelist'], twist:'Tự quất roi để tích rage (mất máu); đòn khi Điên mang sát thương thánh, hồi máu đồng minh gần một phần.', marker:'roi gai + áo vải bố rách, đầu cạo' },
      { id:'doomseeker',       race:'dwarf',     aspect:'ancestor',nameEn:'Doomseeker',         nameVi:'Kẻ Tìm Mệnh',        tier:3, from:['duelist'], twist:'Tìm cái chết vinh quang: sát thương tăng theo máu tối đa của mục tiêu (rất mạnh với boss); không hồi máu được khi Điên.', marker:'tóc dựng nhuộm cam + không giáp + rìu lớn' },
      { id:'primal_berserker',   race:'beastfolk', aspect:'feral',   nameEn:'Primal Berserker',   nameVi:'Cuồng Thú',          tier:3, from:['duelist'], crown:'primal_berserker', twist:'Điên là nửa hóa thú: chạy bốn chân, vồ thay chém.', marker:'hai rìu + sơn máu trên mặt', note:'Chạy bốn chân là anim riêng.' },
      { id:'berserker',          race:'orc',       aspect:'blood',   nameEn:'Berserker',          nameVi:'Cuồng Chiến',        tier:3, from:['duelist'], crown:'berserker', twist:'Rage tích nhanh nhất game; Điên kéo dài thêm mỗi lần kết liễu.', marker:'không giáp + hai rìu + sơn chiến' },
      { id:'blood_champion',     race:'orc',       aspect:'blood',   nameEn:'Blood Champion',     nameVi:'Huyết Chiến Tướng',  tier:4, from:['berserker'], crown:'blood_champion', twist:'Rage không giảm khi hết Điên; mỗi kết liễu trong lúc Điên treo một xương lên giáp (+giáp tích lũy tới hết trận).', marker:'xương địch đóng vào giáp vai + rìu có dây xích' },
      { id:'war_incarnate',      race:'orc',       aspect:'blood',   nameEn:'War Incarnate',      nameVi:'Chiến Thần Nhập Thế', tier:5, from:['blood_champion'], crown:'war_incarnate', twist:'Dưới 1 máu không chết trong lúc Điên; Điên vô hạn chừng nào còn kết liễu mỗi 4s.', marker:'thân đỏ rực như than + hai rìu to bằng cửa + không bao giờ đứng thẳng' },
      { id:'bloodtide_reaver',   race:'merfolk',   aspect:'blood',   nameEn:'Bloodtide Reaver',   nameVi:'Cuồng Triều',        tier:3, from:['duelist'], twist:'Ngửi máu như cá mập: Điên mạnh gấp đôi lên địch dưới 50% máu, tự lao tới mục tiêu yếu nhất.', marker:'răng cá mập + hai dao móc' },
      { id:'wyrmrage',           race:'dragonkin', aspect:'fire',    nameEn:'Wyrmrage',           nameVi:'Long Nộ',            tier:3, from:['duelist'], twist:'Điên làm vảy nóng đỏ: thở lửa xen giữa combo, nhưng tự đốt máu mỗi giây.', marker:'vảy nứt phát sáng đỏ + rìu răng cưa' },
      { id:'overdrive_frame',    race:'construct', aspect:'machine', nameEn:'Overdrive Frame',    nameVi:'Khung Quá Tải',      tier:3, from:['duelist'], twist:'Rage là nhiệt; Điên là tháo giới hạn an toàn. Hết Điên thì tắt máy, choáng 1,5s.', marker:'van xả hơi đỏ trên lưng + khớp phát sáng' }
    ]
  },

  blademaster: {
    id:'blademaster', school:'combat', nameEn:'Blademaster', nameVi:'Kiếm Hào', tiers:[3,5], trunk:['duelist','blademaster'],
    fantasy:'Một người, một kiếm, không thừa động tác.',
    core:{ kit:['Đỡ đòn đúng nhịp (parry) mở phản công','Chuỗi chém có hủy đòn (cancel) vào né','Rút kiếm chém: nạp rồi chém một nhát cực nhanh'],
      weapons:['sword'], masteries:['Sword'], rig:'humanoid64', shared:'Anim kiếm của Duelist; khác nhau ở kiếm và luật parry.' },
    generic:{ nameEn:'Blademaster', nameVi:'Kiếm Hào', marker:'một kiếm, không khiên' },
    variants:[
      { id:'sword_wraith',      race:'skeleton',  aspect:'soul',    nameEn:'Sword Wraith',      nameVi:'Kiếm Hồn',          tier:4, from:['blademaster'], crown:'sword_wraith', twist:'Nửa dưới mờ: lướt xuyên địch trong lúc chém; parry trúng thì nhát kế tiếp xuyên giáp.', marker:'khăn quàng dài bay + nửa dưới mờ' },
      { id:'sword_saint',       race:'human',     aspect:'breath',  nameEn:'Sword Saint',       nameVi:'Kiếm Thánh',        tier:4, from:['blademaster'], twist:'Cửa sổ parry rộng nhất game, parry không tốn gì và hồi stamina; đổi lại không có đòn diện rộng.', marker:'kiếm thẳng dài + băng trán, không giáp' },
      { id:'sellsword',         race:'human',     aspect:'steel',   nameEn:'Sellsword',         nameVi:'Lính Đánh Thuê',    tier:3, from:['duelist','bandit'], crown:'sellsword', twist:'Dùng mọi vũ khí cận chiến (đổi bộ đòn thường giữa trận); nhận hợp đồng đầu trận (giết X / sống Y giây) lấy vàng đổi buff ngay.', marker:'giáp chắp vá nhiều phe + túi tiền to ở hông' },
      { id:'claw_ronin',        race:'beastfolk', aspect:'feral',   nameEn:'Claw Ronin',        nameVi:'Lãng Khách Vuốt',   tier:4, from:['blademaster'], twist:'Kiếm cong tay phải, vuốt tay trái: sau mỗi parry được một đòn vuốt miễn phí không tính vào combo.', marker:'nón rộng vành + đuôi mèo' },
      { id:'fang_duelist',      race:'dragonkin', aspect:'fire',    nameEn:'Fang Duelist',      nameVi:'Kiếm Khách Nanh Rồng', tier:4, from:['blademaster'], twist:'Kiếm răng cưa nung đỏ: đòn chém để lại Bỏng cộng dồn; rút kiếm chém kích nổ khi đủ 5 tầng.', marker:'kiếm răng cưa đỏ rực' },
      { id:'tide_fencer',       race:'merfolk',   aspect:'tide',    nameEn:'Tide Fencer',       nameVi:'Kiếm Khách Triều',  tier:4, from:['blademaster'], twist:'Kiếm liễu đâm nhanh; mỗi đâm trúng đẩy nhẹ để giữ đúng khoảng cách tối ưu.', marker:'kiếm liễu bằng xương cá + áo vảy bạc' },
      { id:'calibrated_blade',  race:'construct', aspect:'machine', nameEn:'Calibrated Blade',  nameVi:'Kiếm Hiệu Chuẩn',   tier:4, from:['blademaster'], twist:'Ghi lại combo địch: bị trúng cùng một đòn 3 lần thì tự động parry đòn đó cho tới hết trận.', marker:'một mắt ống kính đỏ + kiếm lưỡi thẳng tuyệt đối' }
    ]
  },

  lancer: {
    id:'lancer', school:'combat', nameEn:'Dragoon', nameVi:'Thương Kỵ Nhảy', tiers:[3,5], trunk:['phalanx'],
    fantasy:'Cây thương và bầu trời: nhảy thật cao, cắm thẳng xuống.',
    core:{ kit:['Nhảy cao rồi lao cắm xuống (dive), sát thương theo độ cao','Đâm xa','Chống thương bật nhảy (vault) qua địch/hố'],
      weapons:['spearshield','lance'], masteries:['Spear'], rig:'humanoid64', shared:'Anim thương của Phalanx + bộ jump/dive chung. Rất hợp platformer.' },
    generic:{ nameEn:'Dragoon', nameVi:'Thương Kỵ Nhảy', marker:'thương dài hơn người + giáp chân nặng' },
    variants:[
      { id:'impaler',        race:'skeleton',  aspect:'death',   nameEn:'Impaler',        nameVi:'Kẻ Xiên',           tier:3, from:['phalanx'], twist:'Thương xiên địch và mang theo; địch bị xiên trở thành vật ném ở đòn kế tiếp.', marker:'thương dài có ngạnh + sọ cắm đầu thương' },
      { id:'sky_lancer',     race:'human',     aspect:'wind',    nameEn:'Sky Lancer',     nameVi:'Thương Thủ Trời',   tier:3, from:['phalanx'], twist:'Nhảy cao gấp đôi, lơ lửng 0,5s để chọn điểm rơi.', marker:'mũ cánh chim + thương cờ dài' },
      { id:'springheel_lancer', race:'beastfolk', aspect:'feral', nameEn:'Springheel Lancer', nameVi:'Thương Thủ Chân Lò Xo', tier:3, from:['phalanx'], twist:'Nhảy kép, chạm tường bật nhảy; dive không cần độ cao tối thiểu.', marker:'tai thỏ/linh dương + chân sau dài', note:'Thân thỏ/linh dương: biến thể đầu và chân.' },
      { id:'trident_diver',  race:'merfolk',   aspect:'tide',    nameEn:'Trident Diver',  nameVi:'Thợ Lặn Đinh Ba',   tier:3, from:['phalanx'], twist:'Dive tạo vũng nước; đứng trong vũng thì nhảy cao hơn và chạy nhanh hơn.', marker:'đinh ba + vây lưng dựng' },
      { id:'dragon_knight',  race:'dragonkin', aspect:'fire',    nameEn:'Dragon Knight',  nameVi:'Long Kỵ Sĩ',        tier:4, from:['phalanx'], crown:'dragon_knight', twist:'Dive để lại vòng lửa; thương dài bốc lửa ở đầu.', marker:'thương dài có lửa + giáp vảy đỏ' },
      { id:'dragon_lord',    race:'dragonkin', aspect:'fire',    nameEn:'Dragon Lord',    nameVi:'Long Vương',        tier:5, from:['dragon_knight'], crown:'dragon_lord', twist:'Dive để lại cột lửa đứng 4s; hai rồng con bay theo (thuộc hạ hound) lao vào điểm dive.', marker:'vương miện sừng + thương là xương sống rồng + áo choàng vảy vàng' },
      { id:'piston_lancer',  race:'construct', aspect:'machine', nameEn:'Piston Lancer',  nameVi:'Thương Pít-tông',   tier:3, from:['phalanx'], twist:'Thương bắn ra như pít-tông (tầm đột ngột gấp đôi); nhảy bằng chân lò xo nạp lực.', marker:'thương có xi-lanh + chân lò xo' }
    ]
  },

  warlord: {
    id:'warlord', school:'combat', nameEn:'Warlord', nameVi:'Thống Soái', tiers:[4,5], trunk:['marshal'],
    fantasy:'Thắng trận bằng người khác: cờ, tiếng hô, đội hình.',
    core:{ kit:['Cắm cờ: vùng buff đồng minh/thuộc hạ','Hiệu lệnh: buff tức thì (tấn công / giữ / rút)','Gọi viện binh: lính tạm có thời hạn'],
      weapons:['spearshield','sword'], masteries:['Shield','Spear'], rig:'humanoid64', shared:'Anim của Marshal; cờ là overlay lớn sau lưng, mỗi dạng một cờ.' },
    generic:{ nameEn:'Marshal', nameVi:'Thống Soái', marker:'mào ngang + cờ hiệu' },
    variants:[
      { id:'legion_marshal', race:'skeleton',  aspect:'death',    nameEn:'Legion Marshal', nameVi:'Thống Soái Quân Đoàn', tier:4, from:['phalanx'], skinOf:'marshal', twist:'Địch chết trong vùng cờ dựng lại thành lính xương tạm, tính vào cap thuộc hạ.', marker:'cờ rách gắn sọ + mào ngang' },
      { id:'crusader_lord',  race:'*', faith:'light', aspect:'light', nameEn:'Crusader Lord', nameVi:'Thập Tự Chúa', tier:4, from:['paladin'], crown:'crusader_lord', twist:'Cờ thánh: đồng minh trong vùng hồi máu khi gây sát thương. Mọi chủng tộc theo Quang Minh.', marker:'cờ thập tự cắm lưng + mũ vương miện hở mặt' },
      { id:'mountain_king',  race:'dwarf',     aspect:'stone',    nameEn:'Mountain King',  nameVi:'Sơn Vương',        tier:5, from:['ironbreaker'], crown:'mountain_king', twist:'Cờ là chính mình: đứng yên 2s thì hóa đá một phần (miễn khống chế, phản sát thương) và thành vùng buff; thét làm sập trần.', marker:'vương miện đá + rìu hai lưỡi to bằng người + áo choàng da gấu' },
      { id:'warlord',        race:'human',     aspect:'steel',    nameEn:'Warlord',        nameVi:'Chiến Chúa',       tier:5, from:['marshal'], crown:'warlord', twist:'Ba hiệu lệnh đổi tức thì không hồi chiêu chung; viện binh là đội hình 3 lính khiên.', marker:'cờ lớn sau lưng + giáp vàng' },
      { id:'free_captain',   race:'human',     aspect:'steel',    nameEn:'Free Captain',   nameVi:'Thủ Lĩnh Tự Do',   tier:4, from:['sellsword'], crown:'free_captain', twist:'Cờ trắng có túi tiền: viện binh là lính đánh thuê trả bằng vàng (chọn melee/ranged lúc gọi); không trả thì bỏ đi.', marker:'mũ sĩ quan không huy hiệu + cờ trắng có túi tiền' },
      { id:'kingmaker',      race:'human',     aspect:'steel',    nameEn:'Kingmaker',      nameVi:'Kẻ Tạo Vua',       tier:5, from:['free_captain'], crown:'kingmaker', twist:'Mua chuộc: trả vàng biến một địch thường thành thuộc hạ vĩnh viễn trong trận; boss mua được 5s ngừng đánh.', marker:'áo choàng vua mặc hờ, vương miện cầm tay chứ không đội' },
      { id:'thane',          race:'dwarf',     aspect:'ancestor', nameEn:'Thane',          nameVi:'Lãnh Chúa Hầm',    tier:4, from:['phalanx'], twist:'Cờ là bia đá khắc tên tổ tiên: cắm xuống thành vật cản thật kèm vùng buff.', marker:'bia đá đeo lưng + mũ có cánh sắt' },
      { id:'pack_lord',      race:'beastfolk', aspect:'feral',    nameEn:'Pack Lord',      nameVi:'Bầy Chúa',         tier:5, from:['alpha'], crown:'pack_lord', twist:'Không cờ: tiếng hú là hiệu lệnh, 3 thú đi theo nhận buff gấp đôi.', marker:'áo choàng da thủ lĩnh cũ + 3 thú đi theo' },
      { id:'warchief',       race:'orc',       aspect:'blood',    nameEn:'Warchief',       nameVi:'Chiến Tù Trưởng',  tier:5, from:['marshal'], crown:'warchief', twist:'Hiệu lệnh tăng rage cho cả đội thay vì sát thương phẳng.', marker:'cờ xương lớn + mũ sừng thú' },
      { id:'tide_admiral',   race:'merfolk',   aspect:'tide',     nameEn:'Tide Admiral',   nameVi:'Đô Đốc Triều',     tier:4, from:['phalanx'], twist:'Cờ là mỏ neo cắm xuống tạo vũng nước; viện binh trồi lên từ vũng.', marker:'mỏ neo vác vai + mũ đô đốc san hô' }
    ]
  }
});

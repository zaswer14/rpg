/* Khuôn nghề — trường phái MARTIAL. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  monk: {
    id:'monk', school:'martial', nameEn:'Monk', nameVi:'Võ Tăng', tiers:[3,5], trunk:['monk','mystic'],
    fantasy:'Thân thể là vũ khí đã mài giũa bằng kỷ luật.',
    core:{ kit:['Khí: tài nguyên tích qua combo','Liên hoàn: combo tay không dài','Tĩnh tâm: đứng yên hồi khí và máu'],
      weapons:['unarmed'], masteries:['Unarmed','Spirit'], rig:'humanoid64', shared:'Bộ đòn thường unarmed (chưa có, cần làm một lần).' },
    generic:{ nameEn:'Mystic', nameVi:'Huyền Tu', marker:'không giáp, chuỗi hạt' },
    variants:[
      { id:'grandmaster',  race:'human',     aspect:'breath', nameEn:'Grandmaster',  nameVi:'Đại Tông Sư',  tier:4, from:['mystic'], crown:'grandmaster', twist:'Trăm đòn: combo không giới hạn độ dài, mỗi 10 nhịp mở một đòn kết mới.', marker:'không giáp, râu dài, một chuỗi hạt' },
      { id:'living_legend', race:'human',    aspect:'breath', nameEn:'Living Legend', nameVi:'Huyền Thoại Sống', tier:5, from:['grandmaster'], crown:'living_legend', twist:'Khí phóng ra: đòn thường tay không có tầm như vũ khí; tĩnh tâm giữa combo không mất chuỗi.', marker:'áo vải trắng không một vết + tóc bạc buộc cao' },
      { id:'phoenix_ascendant', race:'dragonkin', aspect:'fire', nameEn:'Phoenix Ascendant', nameVi:'Phượng Hoàng Tái Sinh', tier:5, from:['ember_sage'], crown:'phoenix_ascendant', twist:'Chết thì hóa tro rồi bùng lại một lần mỗi trận với đầy khí; combo kết là vòng lửa lan ra.', marker:'lửa thay tóc + cánh lửa mờ (hiệu ứng, không rig cánh)' },
      { id:'wind_walker',  race:'elf',       aspect:'wind',   nameEn:'Wind Walker',  nameVi:'Phong Bộ',     tier:4, from:['mystic'], exception:'races/elf.js chưa khai báo Martial: chọn dạng này thì thêm martial vào foreign của elf.', twist:'Bước trên không vài bước; mọi đòn chân, không đòn tay.', marker:'chân trần + dải lụa bay quanh hông' },
      { id:'brewmaster',   race:'dwarf',     aspect:'fire',   nameEn:'Brewmaster',   nameVi:'Tửu Quyền',    tier:4, from:['mystic'], twist:'Say quyền: uống để vào trạng thái say, né ngẫu nhiên có kiểm soát; phun rượu qua lửa.', marker:'bầu rượu đeo hông + bụng to' },
      { id:'tiger_monk',   race:'beastfolk', aspect:'feral',  nameEn:'Tiger Monk',   nameVi:'Hổ Quyền',     tier:4, from:['mystic'], twist:'Hổ quyền: đòn vuốt tích khí nhanh gấp đôi nhưng tĩnh tâm hồi chậm.', marker:'vằn hổ + đai võ đen' },
      { id:'ember_sage',   race:'dragonkin', aspect:'fire',   nameEn:'Ember Sage',   nameVi:'Hỏa Hiền',     tier:4, from:['mystic'], crown:'ember_sage', twist:'Tĩnh tâm trên lửa: đứng yên thì tạo vòng lửa quanh mình, hồi khí từ lửa.', marker:'ngồi thiền trên lửa, không giáp' }
    ]
  },

  colossus: {
    id:'colossus', school:'martial', schoolAlt:['combat'], nameEn:'Colossus', nameVi:'Cự Thể', tiers:[3,5], trunk:['shaper','colossus'],
    fantasy:'To hơn, cứng hơn, không thể đẩy lùi.',
    core:{ kit:['Thân là vũ khí: đòn tay to, chậm, rộng','Giáp theo nhịp (super armor trong lúc ra đòn)','Đập đất: sóng chấn động'],
      weapons:['unarmed'], masteries:['Body','Unarmed'], rig:'humanoid64', shared:'Nghề duy nhất được phá tỷ lệ thân (cẳng tay/vai to gấp rưỡi): một sheet thân riêng cho mỗi chủng tộc.' },
    generic:{ nameEn:'Colossus', nameVi:'Cự Thể', marker:'cẳng tay và vai to gấp rưỡi' },
    variants:[
      { id:'relic_colossus', race:'skeleton',  aspect:'death',   nameEn:'Relic Colossus', nameVi:'Cự Cốt',     tier:3, from:['shaper'], skinOf:'colossus', twist:'Xương to gấp rưỡi ở cẳng tay và vai; nhặt xương địch chết để vá giáp.', marker:'cẳng tay xương khổng lồ' },
      { id:'stoneflesh',     race:'dwarf',     aspect:'stone',   nameEn:'Stoneflesh',     nameVi:'Thạch Thể',  tier:4, from:['colossus'], twist:'Bị đánh thì da hóa đá từng mảng: càng trúng nhiều càng cứng và càng chậm; đập đất xả hết đá.', marker:'da hóa đá từng mảng' },
      { id:'alpha',          race:'beastfolk', aspect:'feral',   nameEn:'Alpha',          nameVi:'Thủ Lĩnh Bầy', tier:4, from:['colossus'], crown:'alpha', twist:'Gầm thách đấu: kẻ địch mạnh nhất buộc phải đấu tay đôi trong vòng.', marker:'bờm dựng + sẹo chéo mặt + vuốt kim loại' },
      { id:'iron_hide',      race:'orc',       aspect:'steel',   nameEn:'Iron Hide',      nameVi:'Thiết Bì',   tier:4, from:['colossus'], crown:'iron_hide', twist:'Đinh sắt đóng vào da: đánh tay không vào người nó bị phản sát thương.', marker:'da đóng đinh sắt + xích quấn thân' },
      { id:'scale_lord',     race:'dragonkin', aspect:'fire',    nameEn:'Scale Lord',     nameVi:'Lân Chúa',   tier:4, from:['colossus'], crown:'scale_lord', twist:'Vảy dày như giáp; vuốt lửa để lại Bỏng.', marker:'vảy dày như giáp + vuốt lửa' },
      { id:'juggernaut',     race:'construct', aspect:'machine', nameEn:'Juggernaut',     nameVi:'Cự Cơ',      tier:4, from:['colossus'], crown:'juggernaut', twist:'Nắm đấm piston nạp lực: giữ nút để nạp, thả để đấm xuyên vật cản.', marker:'nắm đấm piston to gấp đôi' },
      { id:'titan_frame',    race:'construct', aspect:'machine', nameEn:'Titan Frame',    nameVi:'Khung Titan', tier:5, from:['juggernaut'], crown:'titan_frame', twist:'Rig riêng, thân gấp đôi: không nhảy, đi qua đâu phá vật cản ở đó; chế độ Neo hút mọi đạn về mình.', marker:'thân to gấp đôi + nắm đấm là cả cẳng tay' }
    ]
  },

  dancer: {
    id:'dancer', school:'martial', schoolAlt:['combat'], nameEn:'Bladedancer', nameVi:'Vũ Kiếm', tiers:[3,4], trunk:['duelist','monk'],
    fantasy:'Chiến đấu như múa: nhịp càng đều, đòn càng nhanh.',
    core:{ kit:['Nhịp vũ: combo đúng nhịp tăng dần tốc độ','Bước né trong combo không ngắt chuỗi','Màn kết: đòn kết mạnh theo số nhịp đã giữ'],
      weapons:['sword','dagger'], masteries:['Sword','Spirit'], rig:'humanoid64', shared:'Dùng chung cơ chế beat với Nhạc Sư; anim múa là một bộ chung.' },
    generic:{ nameEn:'Bladedancer', nameVi:'Vũ Kiếm', marker:'song kiếm + dải lụa' },
    variants:[
      { id:'danse_macabre', race:'skeleton',  aspect:'death',   nameEn:'Danse Macabre', nameVi:'Vũ Điệu Tử Thần', tier:4, from:['duelist'], twist:'Múa làm xác chết và undead quanh mình múa theo: chúng đánh vào địch theo nhịp của mình.', marker:'khăn đỏ quấn sọ + chuông nhỏ ở khớp' },
      { id:'sword_dancer',  race:'human',     aspect:'steel',   nameEn:'Sword Dancer',  nameVi:'Vũ Đao',          tier:3, from:['duelist'], twist:'Song đao: combo không giới hạn nếu không bị trúng đòn; bị trúng thì mất hết nhịp.', marker:'song đao cong + khăn lụa đỏ' },
      { id:'bladesinger',   race:'elf',       aspect:'moon',    nameEn:'Bladesinger',   nameVi:'Kiếm Ca',         tier:4, from:['duelist'], twist:'Vừa múa vừa hát: mỗi câu hát trọn vẹn tăng sát thương cả combo.', marker:'kiếm mảnh + áo dài xẻ tà' },
      { id:'tide_dancer',   race:'merfolk',   aspect:'tide',    nameEn:'Tide Dancer',   nameVi:'Vũ Triều',        tier:3, from:['duelist'], twist:'Múa trong vũng nước tạo sóng theo nhịp; sóng đẩy địch ra khỏi vòng múa.', marker:'dải vây dài như lụa' },
      { id:'fire_dancer',   race:'dragonkin', aspect:'fire',    nameEn:'Fire Dancer',   nameVi:'Vũ Hỏa',          tier:3, from:['duelist'], twist:'Mỗi vòng xoay để lại một vòng lửa; đứng trong vòng lửa của mình thì tăng nhịp.', marker:'hai roi lửa + đuôi quét lửa' },
      { id:'revel_dancer',  race:'fae',       aspect:'glamour', nameEn:'Revel Dancer',  nameVi:'Vũ Công Hội Hè',  tier:3, from:['duelist'], twist:'Múa làm địch xung quanh múa theo (Mê) và đánh lẫn nhau.', marker:'vòng hoa trên đầu + cánh rắc phấn' }
    ]
  }
});

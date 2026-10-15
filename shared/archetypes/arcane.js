/* Khuôn nghề — trường phái ARCANE. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  archmage: {
    id:'archmage', school:'arcane', nameEn:'Archmage', nameVi:'Đại Pháp Sư', tiers:[3,5], trunk:['warlock'],
    fantasy:'Pháp sư thuần túy: không giáp, không vũ khí, chỉ có phép và khoảng cách.',
    core:{ kit:['Kết hợp: hai phép liên tiếp tạo phép thứ ba','Kênh phép: giữ nút để tăng sức','Lá chắn mana'],
      weapons:['focus'], masteries:['Fire','Frost','Lightning','Arcane'], rig:'humanoid64', shared:'Anim cast/channel của Elementalist; khí chất đổi hiệu ứng và màu, dùng lại 20 skill nguyên tố có sẵn.' },
    generic:{ nameEn:'Archmage', nameVi:'Đại Pháp Sư', marker:'mũ nhọn + gậy hai nhánh' },
    variants:[
      { id:'frost_ossuary', race:'skeleton',  aspect:'frost',   nameEn:'Frost Ossuary', nameVi:'Hầm Xương Băng',  tier:3, from:['warlock'], twist:'Băng mọc trên xương thành giáp; phép băng để lại gai băng trên sàn làm địa hình.', marker:'thân phủ vảy băng + hơi lạnh tỏa chân', note:'Từ docs/13 mục 6.1.' },
      { id:'crystal_lich',  race:'skeleton',  aspect:'arcane',  nameEn:'Crystal Lich',  nameVi:'Vu Yêu Pha Lê',   tier:5, from:['lich'], crown:'crystal_lich', hidden:true, unlock:'item:crystal_phylactery', twist:'Body Evolution Crystal: phép phản xạ qua các tinh thể đặt sẵn trên sàn.', marker:'sọ trong suốt thấy bình phách' },
      { id:'chronomancer',  race:'human',     aspect:'arcane',  nameEn:'Chronomancer',  nameVi:'Thời Pháp Sư',    tier:4, from:['warlock'], twist:'Tua lại 3s: trả vị trí và máu của bản thân về 3 giây trước; làm chậm thời gian quanh một điểm.', marker:'đồng hồ cát lơ lửng sau vai' },
      { id:'archmage',      race:'elf',       aspect:'arcane',  nameEn:'Archmage',      nameVi:'Đại Pháp Sư',     tier:4, from:['warlock'], crown:'archmage', twist:'Kết hợp bốn nguyên tố: mọi cặp đều có phép thứ ba riêng.', marker:'mũ nhọn cao + gậy hai nhánh' },
      { id:'starweaver',    race:'elf',       aspect:'moon',    nameEn:'Starweaver',    nameVi:'Kẻ Dệt Sao',      tier:5, from:['archmage'], crown:'starweaver', twist:'Chòm sao quay quanh người làm đạn tự động; nối sao thành hình để tung tuyệt kỹ.', marker:'chòm sao quay quanh người, không gậy' },
      { id:'tidecaller',    race:'merfolk',   aspect:'tide',    nameEn:'Tidecaller',    nameVi:'Triệu Triều',     tier:4, from:['warlock'], crown:'tidecaller', twist:'Dâng nước làm ngập một phần màn: vùng ngập là sân nhà (nhanh hơn, phép mạnh hơn).', marker:'nước xoáy quanh chân + gậy san hô' },
      { id:'storm_siren',   race:'merfolk',   aspect:'storm',   nameEn:'Storm Siren',   nameVi:'Bão Nhân Ngư',    tier:5, from:['tidecaller'], crown:'storm_siren', twist:'Sét dẫn qua nước: mọi vũng nước trở thành vùng sét.', marker:'tóc thành sóng + sét trong nước' },
      { id:'cinder_magus',  race:'dragonkin', aspect:'fire',    nameEn:'Cinder Magus',  nameVi:'Pháp Sư Than Hồng', tier:4, from:['warlock'], twist:'Mọi phép để lại than; tự giẫm qua than thì hồi mana, địch giẫm thì bỏng.', marker:'áo bào cháy mép + vảy hở lửa' },
      { id:'court_mage',    race:'fae',       aspect:'glamour', nameEn:'Court Mage',    nameVi:'Đình Pháp Sư',    tier:4, from:['warlock'], crown:'court_mage', twist:'Theo đình Hạ (hoa, hồi phục) hoặc Đông (băng, khống chế), chọn khi chuyển nghề.', marker:'áo bào màu đình + gậy hoa/băng' },
      { id:'archfae',       race:'fae',       aspect:'glamour', nameEn:'Archfae',       nameVi:'Đại Yêu',         tier:5, from:['court_mage'], crown:'archfae', twist:'Ra luật cho trận đấu: mỗi 20s đặt một "luật đình" mới áp lên mọi sinh vật.', marker:'vương miện hoa/băng + cánh lớn hơn' },
      { id:'rune_frame',    race:'construct', aspect:'rune',    nameEn:'Rune Frame',    nameVi:'Khung Rune',      tier:4, from:['warlock'], crown:'rune_frame', twist:'Rune khắc kín thân là kho phép; bắn từ lòng bàn tay, không gậy.', marker:'rune khắc kín thân' },
      { id:'singularity',   race:'construct', aspect:'arcane',  nameEn:'Singularity',   nameVi:'Kỳ Dị Điểm',      tier:5, from:['rune_frame'], crown:'singularity', twist:'Mở điểm trọng lực tại lõi: kéo mọi đạn và địch về mình trong 4s rồi nổ; khi đang mở không di chuyển được.', marker:'lõi là một điểm đen hút ánh sáng + thân nổi cách sàn' }
    ]
  },

  spellblade: {
    id:'spellblade', school:'arcane', schoolAlt:['combat'], nameEn:'Spellblade', nameVi:'Pháp Kiếm', tiers:[3,5], trunk:['blademaster','duelist'],
    fantasy:'Kiếm và phép là một động tác.',
    core:{ kit:['Phù phép vũ khí: đổi khí chất của đòn thường','Chém phép: nhát kiếm bắn sóng phép','Parry hút phép thành mana'],
      weapons:['sword','focus'], masteries:['Sword','Arcane'], rig:'humanoid64', shared:'Anim kiếm của Duelist + một anim cast tay trái.' },
    generic:{ nameEn:'Spellblade', nameVi:'Pháp Kiếm', marker:'kiếm phát sáng sống lưỡi' },
    variants:[
      { id:'hexblade',       race:'skeleton',  aspect:'dark',    nameEn:'Hexblade',       nameVi:'Kiếm Nguyền',     tier:4, from:['blademaster'], twist:'Kiếm khắc lời nguyền: mỗi nhát tích Curse, đủ 5 tầng thì nổ.', marker:'kiếm đen khắc chữ phát sáng tím' },
      { id:'battlemage',     race:'human',     aspect:'storm',   nameEn:'Battlemage',     nameVi:'Chiến Pháp Sư',   tier:4, from:['blademaster'], twist:'Kiếm dẫn sét: nhát chém nối sét sang tối đa 3 địch gần.', marker:'giáp nửa người + găng đồng dẫn sét' },
      { id:'spellblade',     race:'elf',       aspect:'arcane',  nameEn:'Spellblade',     nameVi:'Pháp Kiếm',       tier:4, from:['blademaster'], crown:'spellblade', twist:'Tay trái cầm orb: đổi khí chất của kiếm giữa combo không ngắt chuỗi.', marker:'kiếm cong sáng sống lưỡi + orb tay trái' },
      { id:'eclipse_blade',  race:'elf',       aspect:'moon',    nameEn:'Eclipse Blade',  nameVi:'Nhật Thực Kiếm',  tier:5, from:['spellblade'], crown:'eclipse_blade', twist:'Hai kiếm: Sáng (chậm, sát thương lớn) và Tối (nhanh, hút máu), đổi không ngắt combo; nhật thực = cầm cả hai 5s, mỗi nhát mang cả hai hiệu ứng.', marker:'hai kiếm một sáng một tối xoay quanh người khi không cầm' },
      { id:'flameblade',     race:'dragonkin', aspect:'fire',    nameEn:'Flameblade',     nameVi:'Hỏa Kiếm',        tier:4, from:['blademaster'], twist:'Hơi thở lửa là một nhịp trong combo kiếm; kiếm bốc lửa khi combo dài.', marker:'kiếm lưỡi lửa + khói từ mũi' },
      { id:'tideblade',      race:'merfolk',   aspect:'tide',    nameEn:'Tideblade',      nameVi:'Thủy Kiếm',       tier:4, from:['blademaster'], twist:'Lưỡi kiếm bằng nước: kéo dài/thu ngắn giữa combo để đổi tầm đánh.', marker:'chuôi kiếm vỏ ốc, lưỡi là dòng nước' },
      { id:'glamour_blade',  race:'fae',       aspect:'glamour', nameEn:'Glamour Blade',  nameVi:'Ảo Kiếm',         tier:4, from:['blademaster'], crown:'glamour_blade', twist:'Kiếm vô hình: địch không đọc được tầm đánh; chỉ thấy vệt sau nhát chém.', marker:'kiếm vô hình (chỉ thấy vệt) + găng ren' },
      { id:'arc_saber',      race:'construct', aspect:'storm',   nameEn:'Arc Saber',      nameVi:'Kiếm Hồ Quang',   tier:4, from:['blademaster'], twist:'Lưỡi hồ quang: sát thương cao nhưng quá nhiệt; tắt lưỡi để hồi nhiệt bằng đòn đấm.', marker:'chuôi kim loại, lưỡi là tia hồ quang' }
    ]
  },

  summoner: {
    id:'summoner', school:'arcane', schoolAlt:['death','beast','craft'], nameEn:'Summoner', nameVi:'Triệu Hồi Sư', tiers:[3,5], trunk:['necromancer','grand_necromancer'],
    fantasy:'Bản thân yếu, đạo quân mạnh.',
    core:{ kit:['Gọi thuộc hạ (cap theo nghề)','Ra lệnh: tập trung / rút về','Hiến tế thuộc hạ: nổ hoặc hồi máu'],
      weapons:['focus'], masteries:['Necromancy','Arcane','Taming'], rig:'humanoid64',
      shared:'Hệ thuộc hạ V12.2 (turret / ranged / melee / hound) dùng chung; mỗi dạng chỉ đổi sprite thuộc hạ và một luật riêng.' },
    generic:{ nameEn:'Summoner', nameVi:'Triệu Hồi Sư', marker:'vòng triệu hồi dưới chân' },
    variants:[
      { id:'lich',           race:'skeleton',  aspect:'death',   nameEn:'Lich',           nameVi:'Vu Yêu',            tier:4, from:['grand_necromancer'], crown:'lich', twist:'Biến vị trí xác thành bài toán: dựng lính ngay tại xác địch; bản thân chậm.', marker:'vương miện liền sọ + bình phách trong lồng ngực' },
      { id:'death_sovereign',race:'skeleton',  aspect:'death',   nameEn:'Death Sovereign',nameVi:'Chúa Tể Tử Vong',   tier:5, from:['lich'], crown:'death_sovereign', twist:'Vùng chiến đấu của riêng mình: thuộc hạ trong vùng không hết thời gian.', marker:'vầng sọ + áo bào bằng hồn' },
      { id:'conjurer',       race:'human',     aspect:'arcane',  nameEn:'Conjurer',       nameVi:'Thuật Sĩ Khế Ước',  tier:4, from:['warlock'], twist:'Vẽ vòng triệu hồi trên sàn: thực thể gọi ra rất mạnh nhưng chỉ tồn tại trong vòng.', marker:'phấn vẽ vòng + sách khế ước xích tay' },
      { id:'grove_caller',   race:'elf',       aspect:'nature',  nameEn:'Grove Caller',   nameVi:'Kẻ Gọi Rừng',       tier:4, from:['oracle','warlock'], twist:'Gọi người cây chậm và chắc; ra lệnh mọc rễ biến người cây thành tường đứng yên.', marker:'hạt giống phát sáng đeo cổ + gậy cành sống' },
      { id:'kraken_caller',  race:'merfolk',   aspect:'abyss',   nameEn:'Kraken Caller',  nameVi:'Kẻ Gọi Thủy Quái',  tier:4, from:['warlock'], twist:'Xúc tu trồi từ vũng nước (thuộc hạ kiểu turret) quấn và kéo địch về vũng.', marker:'tù và vỏ ốc xoắn + xúc tu quấn tay' },
      { id:'wyrm_caller',    race:'dragonkin', aspect:'fire',    nameEn:'Wyrm Caller',    nameVi:'Triệu Long',        tier:4, from:['warlock'], crown:'wyrm_caller', twist:'Một rồng con bay cạnh, lớn dần theo trận (mỗi kết liễu thêm một bậc).', marker:'rồng con bay cạnh + gậy sừng' },
      { id:'swarm_queen',    race:'fae',       aspect:'glamour', nameEn:'Swarm Queen',    nameVi:'Chúa Bầy Tiên',     tier:4, from:['warlock'], twist:'Bầy tiên tí hon: nhiều con, máu cực thấp, chết thì hồi lại sau 3s.', marker:'đám đốm sáng bay quanh + vương miện nhỏ' },
      { id:'assembler',      race:'construct', aspect:'machine', nameEn:'Assembler',      nameVi:'Kẻ Lắp Ráp',        tier:3, from:['shaper'], crown:'assembler', exception:'Vào từ Martial-Body (Shaper), không qua Arcane: thuộc hạ là bản sao lắp từ bộ phận của mình.', twist:'Tháo bộ phận của mình lắp thành bản sao nhỏ (melee, máu lấy từ máu chủ); thu hồi thì máu trả lại.', marker:'tay thứ ba gập sau lưng + hộp linh kiện ở ngực' },
      { id:'hive_mind',      race:'construct', aspect:'machine', nameEn:'Hive Mind',      nameVi:'Tâm Trí Bầy',       tier:4, from:['assembler'], crown:'hive_mind', twist:'Bản sao dùng chung lưới: một con thấy thì tất cả thấy; lệnh đồng bộ làm mọi bản sao ra đòn đúng lúc chủ ra đòn.', marker:'ba đầu nhỏ trên vai nhấp nháy cùng nhịp' },
      { id:'overmind',       race:'construct', aspect:'machine', nameEn:'Overmind',       nameVi:'Siêu Trí',          tier:5, from:['hive_mind'], crown:'overmind', twist:'Chủ bất động, điều khiển trực tiếp một bản sao (đổi thân); thân chính chết mới thua.', marker:'thân chính đứng yên bất động, vầng bản sao xoay quanh như hào quang' }
    ]
  },

  bard: {
    id:'bard', school:'arcane', schoolAlt:['martial'], nameEn:'Bard', nameVi:'Nhạc Sư', tiers:[3,5], trunk:['medium','adept'],
    fantasy:'Âm nhạc là vũ khí và là mệnh lệnh.',
    core:{ kit:['Giai điệu: buff vùng, đổi bài thay đổi hiệu ứng','Nhịp: bấm đúng nhịp tăng hiệu lực','Âm phá: sóng âm đẩy lùi'],
      weapons:['instrument'], masteries:['Arcane','Spirit'], rig:'humanoid64', shared:'Một bộ anim "chơi nhạc" chung; nhạc cụ là prop riêng từng dạng. Cần cơ chế nhịp (beat) trong runtime.' },
    generic:{ nameEn:'Bard', nameVi:'Nhạc Sư', marker:'nhạc cụ đeo chéo lưng' },
    variants:[
      { id:'bone_piper',    race:'skeleton',  aspect:'death',   nameEn:'Bone Piper',    nameVi:'Kẻ Gõ Sườn',        tier:3, from:['necromancer','medium'], twist:'Chơi nhạc trên chính xương sườn mình như mộc cầm; giai điệu đánh thức xác chết thành thuộc hạ tạm.', marker:'dùi gõ trên lồng ngực + sáo xương' },
      { id:'troubadour',    race:'human',     aspect:'light',   nameEn:'Troubadour',    nameVi:'Hát Rong',          tier:3, from:['adept'], twist:'Ba bài: Dũng Khí (sát thương), Hồi Sức (máu), Hành Quân (tốc); đổi bài không hồi chiêu.', marker:'đàn lute + mũ lông chim' },
      { id:'songweaver',    race:'elf',       aspect:'moon',    nameEn:'Songweaver',    nameVi:'Kẻ Dệt Khúc',       tier:3, from:['elementalist'], crown:'songweaver', twist:'Mỗi câu hát để lại một nốt lơ lửng; đồng minh chạm nốt nhận buff, địch chạm nốt bị Mê ngắn.', marker:'đàn hạc nhỏ + nốt nhạc bạc bay quanh' },
      { id:'lorekeeper',    race:'elf',       aspect:'moon',    nameEn:'Lorekeeper',    nameVi:'Người Giữ Khúc Cổ', tier:4, from:['songweaver'], crown:'lorekeeper', twist:'Hát lại một skill vừa thấy (của đồng minh hoặc địch) một lần; khúc cổ buff theo đúng khuôn nghề của từng đồng minh.', marker:'cuộn khúc cổ bay quanh như dải lụa + mắt bạc' },
      { id:'worldsinger',   race:'elf',       aspect:'arcane',  nameEn:'Worldsinger',   nameVi:'Ca Giả Thế Giới',   tier:5, from:['lorekeeper'], crown:'worldsinger', twist:'Hát đổi màn chơi: một đoạn nhạc trọn vẹn mọc platform/cầu, đoạn khác làm địa hình dưới chân địch sụp.', marker:'không nhạc cụ, miệng phát sáng, cây cối nghiêng theo nhịp' },
      { id:'war_drummer',   race:'dwarf',     aspect:'stone',   nameEn:'War Drummer',   nameVi:'Trống Trận',        tier:3, from:['adept'], twist:'Trống làm rung đất: đánh đúng nhịp thì mọi địch đứng trên sàn bị khựng.', marker:'trống lớn đeo bụng + dùi búa' },
      { id:'howl_chanter',  race:'beastfolk', aspect:'feral',   nameEn:'Howl Chanter',  nameVi:'Kẻ Hú Ca',          tier:3, from:['medium'], twist:'Tiếng hú làm địch sợ (giảm sát thương); đồng minh hú theo thì hiệu ứng cộng dồn.', marker:'vòng cổ chuông xương + đầu ngửa hú' },
      { id:'siren',         race:'merfolk',   aspect:'tide',    nameEn:'Siren',         nameVi:'Nhân Ngư Ca',       tier:3, from:['elementalist'], crown:'siren', twist:'Tiếng hát kéo địch lại gần (lure) rồi sóng âm hất lên; địch trúng hai câu liên tiếp bị Mê.', marker:'tù và ốc xoắn lớn + vây tai xòe khi hát' },
      { id:'tide_matriarch',race:'merfolk',   aspect:'tide',    nameEn:'Tide Matriarch',nameVi:'Hải Mẫu',           tier:4, from:['siren'], crown:'tide_matriarch', twist:'Hợp xướng: đồng minh đứng trong vũng nước hát theo, mỗi người thêm một tầng buff; bài ru làm boss chậm.', marker:'vương miện ngọc trai + đàn bằng xương cá voi' },
      { id:'skull_drummer', race:'orc',       aspect:'blood',   nameEn:'Skull Drummer', nameVi:'Trống Sọ',          tier:3, from:['medium'], twist:'Trống trận bọc da: mỗi nhịp tăng rage cho mọi đồng minh trong vùng.', marker:'trống sọ thú treo hông + dùi xương' },
      { id:'pied_piper',    race:'fae',       aspect:'glamour', nameEn:'Pied Piper',    nameVi:'Kẻ Thổi Sáo Dụ',    tier:3, from:['adept'], twist:'Sáo dụ: địch trúng nhạc đi theo mình (khiêu khích di động), dẫn chúng vào bẫy hoặc xuống hố.', marker:'sáo dài + áo hai màu sặc sỡ' }
    ]
  }
});

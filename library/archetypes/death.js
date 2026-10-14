/* Khuôn nghề — trường phái DEATH (gồm cả nhánh Spirit/Soul). */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  shaman: {
    id:'shaman', school:'death', schoolAlt:['beast'], nameEn:'Shaman', nameVi:'Vu Sư', tiers:[3,5], trunk:['medium','oracle'],
    fantasy:'Người nói chuyện với linh hồn: tổ tiên, thú, biển sâu.',
    core:{ kit:['Cắm totem (tối đa 2–3, mỗi cái một vùng hiệu ứng)','Gọi linh hồn nhập thân ngắn','Liên kết: chia sát thương giữa các mục tiêu nối'],
      weapons:['focus','totem'], masteries:['Soul','Curse'], rig:'humanoid64', shared:'Anim của Medium; totem là prop đặt xuống, mỗi dạng một sprite.' },
    generic:{ nameEn:'Shaman', nameVi:'Vu Sư', marker:'trượng treo bùa + mặt nạ' },
    variants:[
      { id:'bone_oracle',      race:'skeleton',  aspect:'death',    nameEn:'Bone Oracle',      nameVi:'Kẻ Gieo Xương',     tier:3, from:['medium'], twist:'Gieo xương bói: mỗi lần gieo ra một trong ba quẻ (buff / hồi / nguyền), quẻ sau không trùng quẻ trước.', marker:'túi xương bói + sọ nhỏ treo trượng' },
      { id:'stonespeaker',     race:'dwarf',     aspect:'stone',    nameEn:'Stonespeaker',     nameVi:'Kẻ Nói Với Đá',     tier:3, from:['medium'], crown:'stonespeaker', twist:'Totem là mảnh đá nhặt từ chính màn chơi (mỗi loại nền một hiệu ứng); nghe đá: thấy địch đứng cùng mặt sàn qua tường. Pháp sư duy nhất của người lùn.', marker:'tai áp vào đá, đá nhỏ lơ lửng quanh đầu + trượng là cuốc chim' },
      { id:'gem_oracle',       race:'dwarf',     aspect:'stone',    nameEn:'Gem Oracle',       nameVi:'Bảo Thạch Tiên Tri', tier:4, from:['stonespeaker'], crown:'gem_oracle', twist:'Totem ngọc lớn dần theo thời gian (ba bậc); khi vỡ bắn mảnh ngọc thành đạn cho đồng minh.', marker:'tinh thể mọc trên râu và vai + một mắt là ngọc' },
      { id:'mountain_soul',    race:'dwarf',     aspect:'stone',    nameEn:'Mountain Soul',    nameVi:'Hồn Núi',           tier:5, from:['gem_oracle'], crown:'mountain_soul', twist:'Gọi hồn núi: cả màn rung, nền mọc cột đá làm vật cản/platform; đứng yên thì không thể bị đẩy, giết hay khống chế 6s.', marker:'nửa thân hóa đá núi, rêu và tinh thể mọc trên người + không trượng' },
      { id:'wildspeaker',      race:'elf',       aspect:'nature',   nameEn:'Wildspeaker',      nameVi:'Kẻ Nói Với Hoang Dã', tier:3, from:['oracle'], twist:'Totem là cây non mọc lên, lớn dần theo thời gian; cây lớn che đạn.', marker:'tóc kết dây leo + gậy cành có tổ chim' },
      { id:'ancestor_speaker', race:'*', faith:'ancestor', aspect:'ancestor', nameEn:'Ancestor Speaker', nameVi:'Kẻ Nói Với Tổ Tiên', tier:4, from:['oracle'], crown:'ancestor_speaker',
        twist:'Totem là bia đá: mỗi bia gọi một hồn tổ tiên (thợ rèn buff giáp, chiến binh đánh, thợ mỏ đào). Mọi chủng tộc theo Tổ Linh Đạo; với dwarf đây là lối duy nhất vào Death.', marker:'bia đá nhỏ đeo lưng + tóc/râu tết chỉ vàng' },
      { id:'ancestor_avatar',  race:'*', faith:'ancestor', aspect:'ancestor', nameEn:'Ancestor Avatar',  nameVi:'Hóa Thân Tổ Linh',   tier:5, from:['ancestor_speaker'], crown:'ancestor_avatar', twist:'Nhập thân tổ tiên lớn: thân to gấp đôi 10s, mọi đòn là đòn của tổ tiên; mỗi bia đã cắm kéo dài thêm 2s.', marker:'thân mờ nửa trên là một tổ tiên khổng lồ chồng lên' },
      { id:'totem_shaman',     race:'beastfolk', aspect:'ancestor', nameEn:'Totem Shaman',     nameVi:'Pháp Sư Totem',     tier:4, from:['oracle'], crown:'totem_shaman', twist:'Cột totem đeo lưng có thể cắm xuống; gọi hồn thú tổ nhập thân.', marker:'cột totem đeo lưng + mặt nạ gỗ' },
      { id:'great_spirit',     race:'beastfolk', aspect:'ancestor', nameEn:'Great Spirit',     nameVi:'Đại Thú Linh',      tier:5, from:['totem_shaman'], crown:'great_spirit', twist:'Nhập thân thú tổ: thân to gấp đôi 10s, thuộc hạ thú quanh được hồi đầy; totem đã cắm biến thành thú tổ nhỏ đánh cùng.', marker:'thân mờ nửa trên là thú tổ khổng lồ (sói/gấu) chồng lên' },
      { id:'blood_shaman',     race:'orc',       aspect:'blood',    nameEn:'Blood Shaman',     nameVi:'Huyết Vu',          tier:4, from:['oracle'], crown:'blood_shaman', twist:'Totem chạy bằng máu: trả máu để cắm, totem hồi máu đồng minh gấp đôi phần đã trả.', marker:'mặt nạ sọ thú + trượng xương + tay đỏ máu' },
      { id:'blood_avatar',     race:'orc',       aspect:'blood',    nameEn:'Blood Avatar',     nameVi:'Hóa Thân Huyết Thần', tier:5, from:['blood_shaman'], crown:'blood_avatar', twist:'Máu càng thấp totem càng mạnh; dưới 10% máu mọi totem nổ thành mưa máu hồi đồng minh, hại địch.', marker:'toàn thân đỏ như lột da + sừng máu đông' },
      { id:'abyss_priest',     race:'*', faith:'deep', aspect:'abyss', nameEn:'Abyss Priest', nameVi:'Tư Tế Vực Sâu', tier:4, from:['warlock','oracle'], crown:'abyss_priest', hidden:true, unlock:'event:deep_voice', twist:'Totem là đèn cá vực sâu: kéo địch về ánh đèn, đồng minh trong vùng thấy mọi thứ tàng hình. Nghề ẩn của Vực Giáo, mọi chủng tộc nghe được "giọng".', marker:'đèn cá vực sâu treo trước mặt + áo bào tối' },
      { id:'drowned_prophet',  race:'*', faith:'deep', aspect:'abyss', nameEn:'Drowned Prophet', nameVi:'Tiên Tri Chết Chìm', tier:5, from:['abyss_priest'], crown:'drowned_prophet', twist:'Mở "miệng vực" trên sàn: hố tạm nuốt địch 3s, đồng minh nhảy qua được; totem trong vùng vực không hết thời gian.', marker:'nửa thân dưới tan thành nước đen + nhiều mắt' },
      { id:'drowned_god',      race:'merfolk', faith:'deep', aspect:'abyss', nameEn:'Drowned God', nameVi:'Chúa Chìm', tier:5, from:['abyss_priest'], crown:'drowned_god', hidden:true, unlock:'event:deep_voice', twist:'Lối riêng merfolk: thứ đang ngủ dưới đáy thức dậy làm thuộc hạ (một con, máu dày, chỉ trồi lên từ vũng nước).', marker:'thân khổng lồ mờ dưới nước phía sau + vương miện san hô chết' }
    ]
  },

  hexer: {
    id:'hexer', school:'death', schoolAlt:['shadow'], nameEn:'Hexer', nameVi:'Kẻ Nguyền', tiers:[2,5], trunk:['medium'],
    fantasy:'Không giết ngay: làm kẻ thù chết dần.',
    core:{ kit:['Ếm: debuff cộng dồn','Lan nguyền: mục tiêu chết thì nguyền nhảy sang địch gần','Vật tế: sát thương lên vật tế = sát thương lên mục tiêu'],
      weapons:['focus','dagger'], masteries:['Curse','Soul'], rig:'humanoid64', shared:'Dùng status curse đã có trong runtime; vật tế là prop.' },
    generic:{ nameEn:'Hexer', nameVi:'Kẻ Nguyền', marker:'bùa ghim trên áo + búp bê vải' },
    variants:[
      { id:'bandaged_hexer', race:'skeleton',  aspect:'dark',    nameEn:'Bandaged Hexer', nameVi:'Kẻ Nguyền Băng Vải', tier:4, from:['oracle'], crown:'bandaged_hexer', twist:'Băng vải là vật tế: quấn băng lên địch, giật băng thì kích nguyền.', marker:'băng vải quấn toàn thân + bùa ghim' },
      { id:'mummy_lord',     race:'skeleton',  aspect:'dark',    nameEn:'Mummy Lord',     nameVi:'Chúa Mộ Vải',        tier:5, from:['bandaged_hexer'], crown:'mummy_lord', twist:'Quan tài sau lưng mở ra nhốt một địch; băng vải bay thành roi.', marker:'quan tài đeo lưng mở nắp' },
      { id:'heretic',        race:'human',     aspect:'dark',    nameEn:'Heretic',        nameVi:'Dị Giáo Đồ',         tier:2, from:['adept'], crown:'heretic', hidden:true, unlock:'event:forbidden_tome', twist:'Cửa vào Death của human không qua Hắc Giáo: sách cấm đốt dần máu để ếm.', marker:'mặt nạ đóng dấu + sách khóa xích' },
      { id:'dread_prophet',  race:'*', faith:'dark', aspect:'dark', nameEn:'Dread Prophet', nameVi:'Tiên Tri Hắc Ám', tier:4, from:['oracle'], crown:'dread_prophet', twist:'Chuyển chứ không chữa: lấy vết thương của đồng minh đặt lên địch bị nguyền (giá: 2% máu mình mỗi lần). Mọi chủng tộc theo Hắc Giáo.', marker:'mắt bịt vải đen + nhiều tay bùa đen bay quanh' },
      { id:'heresiarch',     race:'*', faith:'dark', aspect:'dark', nameEn:'Heresiarch',    nameVi:'Giáo Chủ Dị Giáo', tier:5, from:['dread_prophet'], crown:'heresiarch', twist:'Kết liễu địch bị Curse biến nó thành tín đồ bóng (thuộc hạ) 15s; tín đồ chết lan nguyền sang địch gần.', marker:'mũ mitre đen ngược + đám tín đồ bóng đi theo' },
      { id:'witch',          race:'human',     aspect:'dark',    nameEn:'Witch',          nameVi:'Phù Thủy',           tier:3, from:['heretic'], twist:'Búp bê vải: nhặt "tóc" (rơi từ địch bị đánh) gắn vào búp bê rồi châm kim từ xa.', marker:'mũ chóp méo + búp bê vải treo hông' },
      { id:'thorn_witch',    race:'elf',       aspect:'nature',  nameEn:'Thorn Witch',    nameVi:'Phù Thủy Gai',       tier:3, from:['medium'], twist:'Gai mọc trong người mục tiêu: địch bị nguyền mất máu mỗi bước di chuyển.', marker:'vương miện gai + tay áo rách thành rễ' },
      { id:'hex_doctor',     race:'orc',       aspect:'blood',   nameEn:'Hex Doctor',     nameVi:'Thầy Bùa',           tier:3, from:['medium'], twist:'Búp bê voodoo bằng xương thú; châm kim vào búp bê làm địch khựng theo nhịp.', marker:'mũ lông vũ + túi búp bê xương' },
      { id:'sea_witch',      race:'merfolk',   aspect:'abyss',   nameEn:'Sea Witch',      nameVi:'Phù Thủy Biển',      tier:4, from:['abyss_priest'], hidden:true, unlock:'event:deep_voice', twist:'Giao kèo: lấy một chỉ số của địch đổi cho mình trong 10s (tốc, giáp hoặc sát thương).', marker:'vỏ ốc giọng nói treo cổ + xúc tu thay chân áo' },
      { id:'winter_hag',     race:'fae',       aspect:'frost',   nameEn:'Winter Hag',     nameVi:'Bà Phù Thủy Đông',   tier:4, from:['oracle'], twist:'Nguyền băng: địch bị nguyền đứng yên càng lâu càng đóng băng; di chuyển thì giải băng nhưng mất máu.', marker:'tóc bạc thành băng + cánh rách' }
    ]
  },

  reaper: {
    id:'reaper', school:'death', schoolAlt:['combat'], nameEn:'Reaper', nameVi:'Kẻ Gặt Hồn', tiers:[3,5], trunk:['necromancer','medium'],
    fantasy:'Lưỡi hái đến cho mọi thứ sống, đúng lúc.',
    core:{ kit:['Lưỡi hái quét rộng (vũ khí mới: scythe)','Gặt: kết liễu dưới ngưỡng máu, hồi tài nguyên','Hình thái hồn: miễn sát thương ngắn'],
      weapons:['scythe'], masteries:['Soul','Necromancy'], rig:'humanoid64', shared:'Cần bộ đòn thường scythe mới (một lần cho mọi dạng).' },
    generic:{ nameEn:'Reaper', nameVi:'Kẻ Gặt Hồn', marker:'lưỡi hái dài hơn người' },
    variants:[
      { id:'grim_reaper',    race:'skeleton',  aspect:'death',  nameEn:'Grim Reaper',    nameVi:'Tử Thần',          tier:4, from:['necromancer','grand_necromancer'], twist:'Mỗi địch chết để lại hồn; gặt hồn hồi máu và kéo dài tầm lưỡi hái trong trận.', marker:'áo choàng đen trùm kín + lưỡi hái' },
      { id:'autumn_reaper',  race:'elf',       aspect:'nature', nameEn:'Autumn Reaper',  nameVi:'Kẻ Gặt Mùa Thu',   tier:4, from:['oracle'], twist:'Lưỡi hái lá vàng: mỗi kết liễu làm hoa mọc tại chỗ, hồi máu đồng minh bước qua.', marker:'lưỡi hái lá vàng + áo choàng lá rụng' },
      { id:'bone_harvester', race:'orc',       aspect:'blood',  nameEn:'Bone Harvester', nameVi:'Kẻ Thu Hoạch Xương', tier:4, from:['oracle'], twist:'Gặt máu thay hồn: kết liễu đầy thanh rage ngay lập tức.', marker:'lưỡi hái thô bằng hàm thú + xương treo cán' },
      { id:'mantis_reaper',  race:'beastfolk', aspect:'feral',  nameEn:'Mantis Reaper',  nameVi:'Bọ Ngựa',          tier:4, from:['oracle','duelist'], twist:'Hai cẳng tay là lưỡi hái: không có vũ khí, chém kép, kết liễu bằng kẹp.', marker:'cẳng tay lưỡi hái + mắt kép', note:'Thân côn trùng: biến thể tay.' }
    ]
  },

  mender: {
    id:'mender', school:'death', schoolAlt:['arcane'], nameEn:'Mender', nameVi:'Tư Tế', tiers:[3,5], trunk:['medium','oracle'],
    fantasy:'Giữ cho cả đội còn đứng.',
    core:{ kit:['Hồi máu (kênh hoặc vùng)','Lá chắn hấp thụ','Hồi sinh (một lần mỗi trận)'],
      weapons:['focus'], masteries:['Soul','Arcane'], rig:'humanoid64', shared:'Anim của Medium/Oracle; nguồn hồi máu khác nhau theo khí chất.' },
    generic:{ nameEn:'Mender', nameVi:'Tư Tế', marker:'áo bào sáng + chén thánh/bình' },
    variants:[
      { id:'soul_weaver',     race:'skeleton',  aspect:'soul',    nameEn:'Soul Weaver',     nameVi:'Kẻ Dệt Linh Hồn',   tier:4, from:['oracle'], crown:'soul_weaver', twist:'Sợi hồn nối đồng minh: sát thương nhận chia đều qua sợi, hồi máu cũng lan qua sợi.', marker:'sợi hồn từ đầu ngón tay + con thoi' },
      { id:'cleric',          race:'*', faith:'light', aspect:'light', nameEn:'Cleric', nameVi:'Mục Sư', tier:3, from:['adept','medium'], twist:'Cầu nguyện kênh: đứng yên càng lâu hồi càng mạnh; khiên thánh chặn một đòn. Mọi chủng tộc theo Quang Minh.', marker:'chén thánh + áo bào thêu mặt trời' },
      { id:'cardinal',        race:'*', faith:'light', aspect:'light', nameEn:'Cardinal', nameVi:'Hồng Y', tier:4, from:['oracle'], crown:'cardinal', twist:'Thánh hóa vùng: trong vùng đồng minh không chết (giữ 1 máu) 4s, undead không vào được; hồi sinh không giới hạn nhưng mỗi lần tốn 30 Devotion.', marker:'mũ hồng y + trượng mặt trời' },
      { id:'pain_priest',     race:'*', faith:'dark', aspect:'dark', nameEn:'Pain Priest', nameVi:'Tư Tế Thống Khổ', tier:4, from:['oracle'], twist:'Không chữa: chuyển vết thương của đồng minh sang chính mình rồi xả ra địch bằng một đòn nổ máu. Hắc Giáo không có kẻ chữa lành.', marker:'áo bào khâu bằng vết thương + roi tự quất' },
      { id:'moon_oracle',     race:'elf',       aspect:'moon',    nameEn:'Moon Oracle',     nameVi:'Nguyệt Tiên Tri',   tier:4, from:['oracle'], crown:'moon_oracle', twist:'Hồi theo pha trăng: trăng đầy hồi vùng, trăng mới thì lá chắn.', marker:'trăng lưỡi liềm sau đầu + bịt mắt bạc' },
      { id:'hearth_priest',   race:'dwarf',     aspect:'fire',    nameEn:'Hearth Priest',   nameVi:'Tư Tế Lò Sưởi',     tier:3, from:['adept'], twist:'Đặt lò sưởi: đứng gần hồi máu và sưởi giáp, rời xa thì mất.', marker:'lò sưởi nhỏ đeo lưng + gậy cời lửa' },
      { id:'den_keeper',      race:'beastfolk', aspect:'nature',  nameEn:'Den Keeper',      nameVi:'Người Giữ Hang',    tier:3, from:['medium'], twist:'Dựng hang tạm: đồng minh nấp vào hồi máu và không bị nhắm tới.', marker:'áo choàng lông lớn + túi lá thuốc' },
      { id:'tide_priestess',  race:'merfolk',   aspect:'tide',    nameEn:'Tide Priestess',  nameVi:'Nữ Tư Tế Triều',    tier:3, from:['adept'], twist:'Hồi bằng sóng: sóng đi qua hồi đồng minh và đẩy lùi địch trên đường.', marker:'vương miện ngọc trai + gậy sóng' },
      { id:'phoenix_priest',  race:'dragonkin', aspect:'fire',    nameEn:'Phoenix Priest',  nameVi:'Tư Tế Phượng Hoàng', tier:4, from:['adept'], twist:'Hồi sinh trong lửa: đồng minh gục đầu tiên trong vùng được hồi sinh với 30% máu.', marker:'lông phượng hoàng cài sừng + áo đỏ vàng' },
      { id:'dreamweaver',     race:'fae',       aspect:'glamour', nameEn:'Dreamweaver',     nameVi:'Kẻ Dệt Mộng',       tier:4, from:['oracle'], crown:'dreamweaver', twist:'Ru ngủ cả bạn lẫn thù: đồng minh ngủ hồi nhanh, địch ngủ không hành động.', marker:'bụi mộng bay quanh + mắt nhắm' },
      { id:'dream_king',      race:'fae',       aspect:'glamour', nameEn:'Dream King',      nameVi:'Mộng Vương',        tier:5, from:['dreamweaver'], crown:'dream_king', twist:'Kéo cả màn vào giấc mơ 8s: địch ngủ, đồng minh hồi, mọi thứ chạy nửa tốc; đánh thức địch nào thì địch đó nhận sát thương dồn.', marker:'mắt nhắm vĩnh viễn + vương miện sao + áo bào bằng sương' },
      { id:'repair_unit',     race:'construct', aspect:'machine', nameEn:'Repair Unit',     nameVi:'Đơn Vị Sửa Chữa',   tier:3, from:['adept','engineer'], twist:'Sửa chứ không chữa: hồi gấp đôi cho construct/trụ, một nửa cho sinh vật sống.', marker:'tay hàn + cuộn dây thay băng gạc' }
    ]
  }
});

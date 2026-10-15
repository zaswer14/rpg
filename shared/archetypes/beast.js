/* Khuôn nghề — trường phái BEAST. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  beastmaster: {
    id:'beastmaster', school:'beast', schoolAlt:['ranged'], nameEn:'Beastmaster', nameVi:'Thuần Thú Sư', tiers:[3,5], trunk:['hunter'],
    fantasy:'Một người và con thú của mình, đánh như một.',
    core:{ kit:['Bạn đồng hành cố định (một con thú có anim riêng)','Lệnh: tấn công mục tiêu / quay về','Hợp kích: chủ và thú cùng ra đòn'],
      weapons:['bow','spearshield'], masteries:['Taming','Bow'], rig:'humanoid64', shared:'Bạn đồng hành dùng kiểu thuộc hạ hound (V12.2); mỗi dạng một sprite thú.' },
    generic:{ nameEn:'Beastmaster', nameVi:'Thuần Thú Sư', marker:'thú đi cạnh + roi/còi' },
    variants:[
      { id:'wild_hunt_captain', race:'skeleton',  aspect:'soul',    nameEn:'Wild Hunt Captain', nameVi:'Đội Trưởng Cuộc Săn', tier:4, from:['beast_rider','hunter'], crown:'wild_hunt_captain', companion:'chó săn ma', twist:'Bầy chó săn ma ưu tiên mục tiêu bị đánh dấu; tù và gọi cả bầy lao một hướng.', marker:'gạc hươu trên sọ + tù và + chó săn ma' },
      { id:'falconer',          race:'human',     aspect:'wind',    nameEn:'Falconer',          nameVi:'Người Nuôi Ưng',     tier:3, from:['hunter'], companion:'chim ưng', twist:'Chim ưng đánh mục tiêu trên cao và cào mắt (giảm chính xác của địch).', marker:'găng da dày + chim ưng đậu tay' },
      { id:'moon_howler',       race:'beastfolk', aspect:'moon',    nameEn:'Moon Howler',       nameVi:'Hú Nguyệt',          tier:3, from:['hunter'], crown:'moon_howler', companion:'hai sói nhỏ', twist:'Hai sói nhỏ; hú để chúng vào trạng thái săn đêm (nhanh hơn, cắn gây chảy máu).', marker:'trăng vẽ trên ngực + 2 sói nhỏ' },
      { id:'beast_tamer',       race:'orc',       aspect:'feral',   nameEn:'Beast Tamer',       nameVi:'Kẻ Thuần Thú Dữ',    tier:3, from:['hunter'], companion:'gấu chiến', twist:'Gấu chiến xích cổ: quất roi để gấu điên (mạnh hơn nhưng có thể đánh nhầm).', marker:'roi xích + gấu chiến đeo rọ mõm' },
      { id:'shark_caller',      race:'merfolk',   aspect:'tide',    nameEn:'Shark Caller',      nameVi:'Kẻ Gọi Cá Mập',      tier:3, from:['hunter'], companion:'cá mập', twist:'Cá mập chỉ bơi trong vũng nước; tạo vũng ở đâu cá mập lao tới đó.', marker:'răng cá mập đeo cổ + vây lưng cá mập lượn quanh' },
      { id:'beekeeper',         race:'fae',       aspect:'nature',  nameEn:'Beekeeper',         nameVi:'Kẻ Nuôi Ong',        tier:3, from:['hunter'], companion:'bầy ong', twist:'Bầy ong là một đám mây: tách đôi để đánh hai mục tiêu, gộp lại để chích nặng.', marker:'tổ ong treo hông + mũ lưới' },
      { id:'drake_handler',     race:'dragonkin', aspect:'fire',    nameEn:'Drake Handler',     nameVi:'Kẻ Nuôi Long Câu',   tier:3, from:['hunter'], crown:'drake_handler', companion:'long câu con', exception:'Beast ngoại lai với dragonkin, nhưng long câu là máu mủ: dùng Taming + Fire.', twist:'Long câu (hound phun lửa) lớn dần theo trận: mỗi 3 kết liễu thêm một bậc kích thước và tầm phun.', marker:'long câu con bám vai + găng da cháy xém' }
    ]
  },

  rider: {
    id:'rider', school:'beast', nameEn:'Beast Rider', nameVi:'Kỵ Thú', tiers:[3,5], trunk:['beast_rider'],
    fantasy:'Thú cưỡi là nửa sức chiến đấu: nhanh, linh hoạt, thú tự ra đòn.',
    core:{ kit:['Cưỡi: thú là một phần thân, tốc chạy cao','Thú tấn công (cắn/húc) theo lệnh','Nhảy khỏi thú đánh từ trên xuống'],
      weapons:['spearshield','bow'], masteries:['Riding','Taming'], rig:'mounted', shared:'Dùng chung rig mounted với Kỵ Sĩ; khác Kỵ Sĩ ở chỗ thú là người ra đòn chính, không giáp nặng.' },
    generic:{ nameEn:'Beast Rider', nameVi:'Kỵ Thú', marker:'thú cưỡi + giáo ngắn' },
    variants:[
      { id:'griffin_rider',  race:'human',     aspect:'wind',    nameEn:'Griffin Rider',  nameVi:'Kỵ Sư Tử Đầu Ưng', tier:4, from:['beast_rider'], mount:'sư tử đầu ưng', twist:'Kỵ thú duy nhất bay được ngắn: lướt qua hố và đánh từ trên không.', marker:'sư tử đầu ưng + mũ cánh' },
      { id:'ranger_lord',    race:'elf',       aspect:'nature',  nameEn:'Ranger Lord',    nameVi:'Chúa Tể Kiểm Lâm', tier:4, from:['beast_rider'], crown:'ranger_lord', mount:'hươu trắng', twist:'Bắn cung trên lưng hươu không giảm tốc; hươu nhảy kép.', marker:'cưỡi hươu trắng + mũ lá' },
      { id:'fang_rider',     race:'beastfolk', aspect:'feral',   nameEn:'Fang Rider',     nameVi:'Kỵ Nha',           tier:4, from:['beast_rider'], crown:'fang_rider', mount:'gấu/sói lớn', twist:'Người và thú cùng vồ: hợp kích không hồi chiêu khi trúng cùng một mục tiêu.', marker:'cưỡi gấu/sói lớn + giáo xương' },
      { id:'leviathan_rider',race:'merfolk',   aspect:'tide',    nameEn:'Leviathan Rider',nameVi:'Kỵ Hải Thú',       tier:4, from:['beast_rider'], crown:'leviathan_rider', mount:'cá mập / hải mã', twist:'Thú cưỡi lặn được qua vũng nước để trồi lên ở vũng khác.', marker:'cưỡi cá mập/hải mã + yên san hô' },
      { id:'wolf_rider',     race:'orc',       aspect:'feral',   nameEn:'Wolf Rider',     nameVi:'Kỵ Sói',           tier:4, from:['beast_rider'], crown:'wolf_rider', mount:'sói chiến', twist:'Tập kích đêm: đánh trúng rồi rút về rất nhanh, sói cắn kéo địch ngã.', marker:'cưỡi sói chiến + lao ngắn' },
      { id:'briar_warden',   race:'fae',       aspect:'nature',  nameEn:'Briar Warden',   nameVi:'Gai Vệ Yêu',       tier:4, from:['beast_rider'], crown:'briar_warden', mount:'hươu gai', twist:'Hươu gai để lại rễ dưới chân khi chạy, địch giẫm phải bị giữ.', marker:'cưỡi hươu gai + rễ bò dưới chân' },
      { id:'forest_elder',   race:'elf',       aspect:'nature',  nameEn:'Forest Elder',   nameVi:'Trưởng Lão Rừng Già', tier:5, from:['ranger_lord'], crown:'forest_elder', mount:'nai cổ thụ có cây mọc trên lưng', twist:'Thú cưỡi là một cây di động: dừng lại thì bén rễ thành vật cản và điểm hồi máu; bắn từ trên cây.', marker:'cưỡi nai cổ thụ + tóc bạc dài chấm đất' },
      { id:'apex',           race:'beastfolk', aspect:'feral',   nameEn:'Apex',           nameVi:'Đỉnh Thú',         tier:5, from:['fang_rider'], crown:'apex', mount:'thú to gấp rưỡi mang xương của thú đã săn', twist:'Người và thú là một: hợp kích không hồi chiêu; thú chết thì người hóa thú (dạng Feral) tới hết trận.', marker:'cưỡi thú đeo xương chiến lợi phẩm + không giáp' },
      { id:'whale_lord',     race:'merfolk',   aspect:'tide',    nameEn:'Whale Lord',     nameVi:'Kình Vương',       tier:5, from:['leviathan_rider'], crown:'whale_lord', mount:'cá voi nhỏ (rig riêng, rộng gấp đôi)', twist:'Thú cưỡi to nhất game, đi xuyên địch; thổi nước tạo vùng ngập di động theo mình.', marker:'cưỡi cá voi + lao xương cá voi' },
      { id:'thorn_king',     race:'fae',       aspect:'nature',  nameEn:'Thorn King',     nameVi:'Gai Vương',        tier:5, from:['briar_warden'], crown:'thorn_king', mount:'hươu gai khổng lồ có vương miện gai', twist:'Rễ gai mọc theo mỗi bước thú thành mê cung tạm; địch bị giữ trong rễ mất máu theo thời gian.', marker:'cưỡi hươu gai khổng lồ + rễ phủ kín chân' }
    ]
  },

  shapeshifter: {
    id:'shapeshifter', school:'beast', schoolAlt:['martial'], nameEn:'Shapeshifter', nameVi:'Kẻ Hóa Thân', tiers:[3,5], trunk:['shaper','hunter'],
    fantasy:'Không đổi vũ khí: đổi cả cơ thể.',
    core:{ kit:['Hóa thân: đổi bộ đòn và chỉ số trong thời hạn','Đòn chuyển dạng: biến đổi gây sát thương quanh','Dạng lai giữa hai hình'],
      weapons:['unarmed'], masteries:['Body','Taming'], rig:'humanoid64', shared:'Đắt nhất về art: mỗi dạng thú là một sheet riêng. Dùng chung khung luật hóa thân và thanh thời gian.' },
    generic:{ nameEn:'Shapeshifter', nameVi:'Kẻ Hóa Thân', marker:'nửa người nửa thú khi chuyển dạng' },
    variants:[
      { id:'ossomancer',     race:'skeleton',  aspect:'death',   nameEn:'Ossomancer',     nameVi:'Kẻ Nắn Xương',      tier:4, from:['colossus','shaper'], crown:'ossomancer', twist:'Không thành thú: nắn lại chính bộ xương (tay thành chùy, gai mọc vai); ném sọ rồi dịch chuyển tới sọ.', marker:'tháo tay làm chùy + gai xương vai' },
      { id:'lycanthrope',    race:'human',     aspect:'blood',   nameEn:'Lycanthrope',    nameVi:'Người Sói Nguyền',  tier:4, from:['hunter','duelist'], hidden:true, unlock:'event:wolf_bite', twist:'Bị nguyền: tự hóa sói không kiểm soát khi máu dưới 30%; trong dạng sói hồi máu theo đòn cắn.', marker:'vết cắn ở cổ + mắt vàng' },
      { id:'druid',          race:'*', faith:'wild', aspect:'nature', nameEn:'Druid', nameVi:'Tu Sĩ Rừng', tier:4, from:['oracle','beast_rider'], crown:'druid', twist:'Hai dạng: gấu (chịu đòn) và cú (bay ngắn, trinh sát); đổi dạng không hồi chiêu chung. Mọi chủng tộc theo Cổ Thần Hoang Dã.', marker:'áo choàng lông + gạc trên mũ trùm' },
      { id:'archdruid',      race:'*', faith:'wild', aspect:'nature', nameEn:'Archdruid', nameVi:'Đại Tu Sĩ Rừng', tier:5, from:['druid'], crown:'archdruid', twist:'Dạng thứ ba: cây cổ thụ đứng yên bất tử 6s, hồi đồng minh và đổi nền quanh gốc thành rừng (địa hình có lợi cho tín đồ).', marker:'thân nửa cây, tóc rễ + không mặt' },
      { id:'wildshape',      race:'beastfolk', aspect:'feral',   nameEn:'Wildshape',      nameVi:'Hóa Hình',          tier:3, from:['shaper'], crown:'wildshape', twist:'Đổi một bộ phận: tay vuốt (chém), chân thú (nhảy xa), hàm (cắn hút máu); mỗi bộ phận một luật, đổi tốn khí.', marker:'nửa mặt là thú, một tay vuốt một tay người' },
      { id:'werebeast',      race:'beastfolk', aspect:'moon',    nameEn:'Werebeast',      nameVi:'Người Hóa Thú',     tier:4, from:['wildshape'], crown:'werebeast', twist:'Dạng thú hoàn toàn khi trăng đầy (theo chu kỳ trận); các pha khác là dạng lai.', marker:'lông dựng + vuốt dài, mắt phát sáng' },
      { id:'beast_god',      race:'beastfolk', aspect:'feral',   nameEn:'Beast God',      nameVi:'Thú Thần',          tier:5, from:['werebeast'], crown:'beast_god', twist:'Dạng thú vĩnh viễn (không về dạng người); bù lại mọi thú trong màn, kể cả của địch, coi là bầy.', marker:'thân thú khổng lồ đi hai chân (rig riêng) + sọ thú làm mũ' },
      { id:'selkie',         race:'merfolk',   aspect:'tide',    nameEn:'Selkie',         nameVi:'Hải Cẩu Tinh',      tier:4, from:['hunter'], twist:'Khoác da hải cẩu: dạng hải cẩu trượt trên sàn cực nhanh và húc; bỏ da thì thành người đánh lao.', marker:'áo khoác da hải cẩu' },
      { id:'elder_wyrm',     race:'dragonkin', aspect:'fire',    nameEn:'Elder Wyrm',     nameVi:'Cổ Long',           tier:5, from:['wyrm_caller'], crown:'elder_wyrm', twist:'Trở về tổ tiên: dạng rồng có cánh, không vũ khí; cần Body Evolution Winged.', marker:'cánh + sừng lớn (rig riêng)' },
      { id:'puca',           race:'fae',       aspect:'glamour', nameEn:'Púca',           nameVi:'Yêu Biến Hình',     tier:4, from:['hunter'], twist:'Sao chép hình dạng của địch thường vừa hạ (lấy đòn thường và tốc độ của nó).', marker:'hình dạng không cố định, mắt vàng giữ nguyên' },
      { id:'reconfig_frame', race:'construct', aspect:'machine', nameEn:'Reconfig Frame', nameVi:'Khung Tái Cấu Hình', tier:4, from:['shaper'], exception:'Beast bị cấm với construct: đổi dạng bằng Engineering, không phải sinh học.',
        twist:'Đổi giữa dạng xe (chạy nhanh, húc) và dạng chiến (đứng, đấm); chuyển dạng là một đòn hất.', marker:'bánh xe gập sau lưng' }
    ]
  }
});

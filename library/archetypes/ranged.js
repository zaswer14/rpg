/* Khuôn nghề — trường phái RANGED. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  sniper: {
    id:'sniper', school:'ranged', nameEn:'Sniper', nameVi:'Xạ Thủ Tỉa', tiers:[3,5], trunk:['marksman','sniper'],
    fantasy:'Một phát, đúng chỗ, từ rất xa.',
    core:{ kit:['Ngắm: giữ nút tăng sát thương và độ xuyên','Đánh dấu điểm yếu','Lùi nhảy tạo khoảng cách'],
      weapons:['bow','crossbow'], masteries:['Bow','Crossbow','Stealth'], rig:'humanoid64', shared:'Anim kéo cung/quỳ ngắm của Marksman; vũ khí là overlay riêng.' },
    generic:{ nameEn:'Sniper', nameVi:'Xạ Thủ', marker:'quỳ ngắm, một mắt bịt' },
    variants:[
      { id:'phantom_sniper',  race:'skeleton',  aspect:'soul',    nameEn:'Phantom Sniper',  nameVi:'Xạ Thủ U Linh',   tier:4, from:['sniper'], crown:'phantom_sniper', twist:'Tên hồn xuyên vật cản và xuyên mọi mục tiêu trên đường bay.', marker:'một hốc mắt bịt vải + tên đuôi ma' },
      { id:'windrunner',      race:'elf',       aspect:'wind',    nameEn:'Windrunner',      nameVi:'Phong Hành Giả',  tier:4, from:['sniper'], crown:'windrunner', twist:'Bắn được khi đang chạy/nhảy mà không mất độ chính xác; tên bay cong theo gió.', marker:'cung dài cong như lưỡi liềm + khăn bay ngang' },
      { id:'longbeard_arbalist', race:'dwarf',  aspect:'steel',   nameEn:'Longbeard Arbalist', nameVi:'Nỏ Thủ Râu Dài', tier:4, from:['sniper'], twist:'Nỏ nặng có chân chống: đứng yên thì phát bắn xuyên 3 mục tiêu; không bắn được khi di chuyển.', marker:'nỏ lớn có chân chống + râu tết qua vai' },
      { id:'hawkeye',         race:'beastfolk', aspect:'wind',    nameEn:'Hawkeye',         nameVi:'Mắt Ưng',         tier:4, from:['sniper'], twist:'Bắn khi đang lượn (giữ nhảy để lượn); từ trên cao thì mọi phát đều chí mạng lên mục tiêu dưới thấp.', marker:'cánh tay có lông vũ + mỏ chim', note:'Dạng thân chim của người thú.' },
      { id:'thorn_needle',    race:'fae',       aspect:'venom',   nameEn:'Thorn Needle',    nameVi:'Kim Gai',         tier:4, from:['sniper'], twist:'Ống thổi kim độc không tiếng động: trúng không làm địch phát hiện; độc cộng dồn thay vì một phát lớn.', marker:'ống thổi bằng cọng sậy + bao kim' },
      { id:'cinder_marksman', race:'dragonkin', aspect:'fire',    nameEn:'Cinder Marksman', nameVi:'Xạ Thủ Than',     tier:4, from:['sniper'], twist:'Tên nung: chỗ tên rơi cháy thành vùng lửa nhỏ, chặn đường địch.', marker:'ống tên phát sáng than hồng' },
      { id:'optic_unit',      race:'construct', aspect:'machine', nameEn:'Optic Unit',      nameVi:'Đơn Vị Quang Học',tier:4, from:['sniper'], twist:'Mắt ống kính tự khóa mục tiêu sau 1,5s không cần giữ nút; bị đánh trúng thì mất khóa.', marker:'đầu là một ống kính lớn xoay được' }
    ]
  },

  warden: {
    id:'warden', school:'ranged', schoolAlt:['beast'], nameEn:'Warden', nameVi:'Kiểm Lâm', tiers:[3,5], trunk:['hunter'],
    fantasy:'Thợ săn biến chiến trường thành bãi săn của mình.',
    core:{ kit:['Đặt bẫy (tối đa N cái cùng lúc)','Đánh dấu con mồi xuyên màn','Đọc địa hình: thưởng khi ở trên cao hoặc sau vật cản'],
      weapons:['bow','dagger'], masteries:['Bow','Trap','Stealth'], rig:'humanoid64', shared:'Anim của Hunter; bẫy là prop riêng mỗi dạng.' },
    generic:{ nameEn:'Warden', nameVi:'Kiểm Lâm', marker:'áo choàng ngụy trang + túi bẫy' },
    variants:[
      { id:'eternal_huntsman', race:'skeleton',  aspect:'soul',    nameEn:'Eternal Huntsman', nameVi:'Thợ Săn Vĩnh Hằng', tier:5, from:['phantom_sniper'], crown:'eternal_huntsman', twist:'Dấu ấn con mồi tồn tại qua màn; mục tiêu đã đánh dấu không thể tàng hình.', marker:'mũ rộng vành + áo choàng da ghép' },
      { id:'ranger',           race:'human',     aspect:'steel',   nameEn:'Ranger',           nameVi:'Biệt Kích Rừng',   tier:3, from:['hunter'], twist:'Bẫy kẹp sắt + pháo hiệu soi sáng vùng tối, làm lộ địch tàng hình.', marker:'áo choàng lá + tù và nhỏ' },
      { id:'thorn_warden',     race:'elf',       aspect:'nature',  nameEn:'Thorn Warden',     nameVi:'Gai Vệ',           tier:3, from:['hunter'], crown:'thorn_warden', twist:'Bẫy là rễ mọc từ sàn giữ chân; gai mọc từ cánh tay làm đòn cận chiến.', marker:'gai mọc từ cánh tay + bẫy rễ' },
      { id:'tunnel_warden',    race:'dwarf',     aspect:'stone',   nameEn:'Tunnel Warden',    nameVi:'Tuần Hầm',         tier:3, from:['hunter'], twist:'Bẫy là sập trần: kích hoạt làm đá rơi; mạnh nhất trong màn hầm có trần thấp.', marker:'đèn mũ + cuộn dây mìn' },
      { id:'scent_tracker',    race:'beastfolk', aspect:'feral',   nameEn:'Scent Tracker',    nameVi:'Kẻ Đánh Hơi',      tier:3, from:['hunter'], twist:'Không đặt bẫy: đánh dấu bằng mùi, thấy mục tiêu qua tường; đòn đầu vào mục tiêu đã đánh hơi luôn chí mạng.', marker:'mũi to + túi thảo dược quanh cổ' },
      { id:'netcaster',        race:'merfolk',   aspect:'tide',    nameEn:'Netcaster',        nameVi:'Kẻ Quăng Lưới',    tier:3, from:['hunter'], twist:'Bẫy di động: quăng lưới giữ địch rồi kéo về; lưới rơi trên sàn thành bẫy dính.', marker:'lưới cuộn vai + phao bằng sọ cá' },
      { id:'ring_keeper',      race:'fae',       aspect:'glamour', nameEn:'Ring Keeper',      nameVi:'Kẻ Giữ Vòng Nấm',  tier:3, from:['hunter'], twist:'Bẫy là vòng nấm: địch bước vào bị dịch chuyển tới vòng khác hoặc nhảy múa (Mê) 2s.', marker:'vòng nấm phát sáng quanh chân + mũ nấm' }
    ]
  },

  gunslinger: {
    id:'gunslinger', school:'ranged', schoolAlt:['craft'], nameEn:'Gunslinger', nameVi:'Xạ Thủ Hỏa Khí', tiers:[3,5], trunk:['marksman'],
    fantasy:'Thuốc súng thay dây cung: tiếng nổ to, nạp đạn chậm.',
    core:{ kit:['Băng đạn và nạp đạn (quản lý số phát)','Bắn từ hông khi chạy','Phát đặc biệt theo dạng (xuyên / chùm / nổ)'],
      weapons:['firearm'], masteries:['Firearm'], rig:'humanoid64', shared:'Một bộ anim súng (aim/fire/reload) cho mọi dạng; Firearm là mastery con chưa nghề nào dùng.' },
    generic:{ nameEn:'Gunslinger', nameVi:'Xạ Thủ Hỏa Khí', marker:'súng ngắn bên hông + đai đạn' },
    variants:[
      { id:'grave_pistoleer', race:'skeleton',  aspect:'soul',    nameEn:'Grave Pistoleer', nameVi:'Súng Thủ Mộ Phần',  tier:3, from:['marksman'], twist:'Đạn là răng/xương nhồi lửa hồn: nhặt mảnh xương từ địch chết thì nạp đạn tức thì.', marker:'hai súng lục cổ + đai đạn bằng răng' },
      { id:'musketeer',       race:'human',     aspect:'steel',   nameEn:'Musketeer',       nameVi:'Hỏa Mai Thủ',       tier:4, from:['sniper'], crown:'musketeer', twist:'Một phát lớn rồi nạp lâu; lưỡi lê cho cận chiến trong lúc nạp.', marker:'súng hỏa mai dài + mũ lông vũ' },
      { id:'deadeye',         race:'human',     aspect:'steel',   nameEn:'Deadeye',         nameVi:'Thần Xạ',           tier:5, from:['musketeer'], crown:'deadeye', twist:'Một viên: đứng yên 3s rồi bắn xuyên toàn bộ màn theo đường thẳng; băng đạn chỉ 1 viên, nạp 6s.', marker:'súng trường dài hơn người + áo khoác dài không tay' },
      { id:'thunderer',       race:'dwarf',     aspect:'storm',   nameEn:'Thunderer',       nameVi:'Lôi Súng Thủ',      tier:3, from:['marksman'], twist:'Súng mồi lửa nổ cực to: mỗi phát làm khựng mọi địch ở gần (kể cả phía sau).', marker:'súng nòng loe + nút bịt tai' },
      { id:'boomstick',       race:'orc',       aspect:'fire',    nameEn:'Boomstick',       nameVi:'Súng Nổ',           tier:3, from:['marksman'], twist:'Súng chùm tự chế, sát thương gấp đôi nhưng có tỉ lệ nổ nòng tự gây sát thương.', marker:'súng chùm buộc dây thép + khói đen' },
      { id:'brine_gunner',    race:'merfolk',   aspect:'tide',    nameEn:'Brine Gunner',    nameVi:'Xạ Thủ Nước Mặn',   tier:3, from:['marksman'], twist:'Súng nước áp lực: đẩy lùi, làm Ướt (đòn sét lên mục tiêu Ướt gấp đôi). Nạp đạn bằng vũng nước.', marker:'súng vỏ ốc có bình nước sau lưng' },
      { id:'arm_cannon',      race:'construct', aspect:'machine', nameEn:'Arm Cannon',      nameVi:'Pháo Tay',          tier:3, from:['marksman'], twist:'Tay biến thành nòng: không nạp đạn, thay bằng nhiệt; quá nhiệt thì tay không dùng được 3s.', marker:'cẳng tay phải là nòng pháo' }
    ]
  },

  harpooner: {
    id:'harpooner', school:'ranged', nameEn:'Harpooner', nameVi:'Lao Thủ', tiers:[3,4], trunk:['hunter','archer'],
    fantasy:'Vũ khí ném có đường về: kéo địch tới mình hoặc kéo mình tới địch.',
    core:{ kit:['Ném vũ khí có dây: kéo địch về hoặc kéo mình tới','Thu hồi vũ khí (bắt được thì thưởng)','Ném chùm'],
      weapons:['throwing'], masteries:['Throwing'], rig:'humanoid64', shared:'Anim throw/throw_aim đã có trong pipeline; dây là hiệu ứng chung.' },
    generic:{ nameEn:'Harpooner', nameVi:'Lao Thủ', marker:'lao có dây cuộn hông' },
    variants:[
      { id:'rib_hurler',      race:'skeleton',  aspect:'death',  nameEn:'Rib Hurler',      nameVi:'Kẻ Ném Sườn',     tier:3, from:['hunter'], twist:'Ném chính xương sườn mình như boomerang: mỗi cây đang bay giảm giáp nhưng tăng sát thương; thu về thì hồi giáp.', marker:'lồng ngực thiếu vài xương sườn' },
      { id:'javelineer',      race:'human',     aspect:'steel',  nameEn:'Javelineer',      nameVi:'Lao Binh',        tier:3, from:['hunter'], twist:'Lao nặng cắm vào tường/đất thành bậc nhảy tạm (platform) cho cả đội.', marker:'bó lao sau lưng + khiên tròn nhỏ' },
      { id:'chakram_dancer',  race:'elf',       aspect:'moon',   nameEn:'Chakram Dancer',  nameVi:'Vòng Đao Sĩ',     tier:3, from:['hunter'], twist:'Chakram nảy giữa tối đa 4 mục tiêu rồi quay về; bắt đúng nhịp thì ném lại ngay.', marker:'hai vòng đao bạc đeo hông' },
      { id:'bola_runner',     race:'beastfolk', aspect:'feral', nameEn:'Bola Runner',     nameVi:'Kẻ Quăng Thòng Lọng', tier:3, from:['hunter'], twist:'Thòng lọng trói chân: chạy vòng quanh mục tiêu bị trói thì quật ngã.', marker:'bola đá quấn quanh người' },
      { id:'harpoon_master',  race:'merfolk',   aspect:'tide',   nameEn:'Harpoon Master',  nameVi:'Lao Sư',          tier:4, from:['sniper'], crown:'harpoon_master', twist:'Lao có tời: kéo địch nặng về hoặc tự kéo mình qua hố.', marker:'lao có dây tời + cuộn dây hông' },
      { id:'axe_hurler',      race:'orc',       aspect:'blood',  nameEn:'Axe Hurler',      nameVi:'Kẻ Ném Rìu',      tier:3, from:['hunter'], twist:'Rìu xoáy bay ra rồi quay về; bắt được rìu khi quay về thì đòn sau mạnh gấp đôi.', marker:'bốn rìu nhỏ trên đai chéo ngực' }
    ]
  }
});

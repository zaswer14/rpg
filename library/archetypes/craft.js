/* Khuôn nghề — trường phái CRAFT. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.archetypes = window.JobLibrary.archetypes || {};
Object.assign(window.JobLibrary.archetypes, {

  artillerist: {
    id:'artillerist', school:'craft', schoolAlt:['ranged'], nameEn:'Artillerist', nameVi:'Pháo Thủ', tiers:[3,5], trunk:['siege_gunner'],
    fantasy:'Vũ khí to hơn người, bắn qua tường.',
    core:{ kit:['Vác pháo / đặt pháo cố định','Đạn vòng cung (qua vật cản)','Nạp đạn đặc biệt theo dạng'],
      weapons:['cannon'], masteries:['Engineering','Firearm','Throwing'], rig:'humanoid64', shared:'Anim vác pháo của Siege Gunner; nòng là overlay riêng.' },
    generic:{ nameEn:'Siege Gunner', nameVi:'Pháo Thủ Công Thành', marker:'pháo vác vai nằm ngang' },
    variants:[
      { id:'ossuary_mortar',   race:'skeleton',  aspect:'death',   nameEn:'Ossuary Mortar',   nameVi:'Cối Hài Cốt',        tier:3, from:['engineer'], twist:'Đạn là sọ: sọ rơi xuống thành lính xương tạm (tính vào cap).', marker:'cối xương đeo lưng + sọ xếp thành đạn' },
      { id:'bombardier',       race:'human',     aspect:'fire',    nameEn:'Bombardier',       nameVi:'Pháo Binh Cối',      tier:3, from:['engineer'], twist:'Súng cối: chỉ bắn vòng cung qua tường, không bắn thẳng; đạn nổ chậm có hẹn giờ.', marker:'nòng cối ngắn + mũ sắt rộng vành' },
      { id:'gunner_captain',   race:'dwarf',     aspect:'fire',    nameEn:'Gunner Captain',   nameVi:'Pháo Trưởng',        tier:4, from:['siege_gunner'], crown:'gunner_captain', twist:'Pháo hai nòng bắn luân phiên; ra lệnh cho trụ của đồng minh bắn cùng.', marker:'pháo hai nòng + mũ sĩ quan' },
      { id:'siege_breaker',    race:'orc',       aspect:'blood',   nameEn:'Siege Breaker',    nameVi:'Phá Thành',          tier:4, from:['siege_gunner'], crown:'siege_breaker', twist:'Không pháo: chùy phá thành khổng lồ + thuốc nổ ném; phá vật cản một đòn.', marker:'chùy phá thành khổng lồ + thuốc nổ' },
      { id:'world_breaker',    race:'orc',       aspect:'fire',    nameEn:'World Breaker',    nameVi:'Kẻ Phá Thế Giới',    tier:5, from:['siege_breaker'], crown:'world_breaker', twist:'Đòn nặng phá cả nền màn (tạo hố tạm 6s); tự chịu 10% sát thương nổ; mỗi hố là một bẫy cho địch.', marker:'chùy khổng lồ có máy nổ gắn trong + lưng cõng thùng thuốc nổ' },
      { id:'dragonfire_gunner',race:'dragonkin', aspect:'fire',    nameEn:'Dragonfire Gunner',nameVi:'Pháo Thủ Long Hỏa',  tier:4, from:['siege_gunner'], twist:'Nạp đạn bằng hơi thở của chính mình: trả máu để nạp phát cực mạnh.', marker:'nòng pháo hình đầu rồng' },
      { id:'coral_cannon',     race:'merfolk',   aspect:'tide',    nameEn:'Coral Cannon',     nameVi:'Pháo San Hô',        tier:4, from:['siege_gunner'], twist:'Pháo nước: đạn nổ thành vũng nước lớn và đẩy lùi mạnh.', marker:'nòng san hô sống + bình nước lưng' },
      { id:'siege_engine',     race:'construct', aspect:'machine', nameEn:'Siege Engine',     nameVi:'Cỗ Máy Công Thành',  tier:4, from:['siege_gunner'], crown:'siege_engine', twist:'Pháo gắn thẳng vào vai, không cầm: bắn khi đang di chuyển.', marker:'pháo gắn vai, hai tay trống' }
    ]
  },

  golemancer: {
    id:'golemancer', school:'craft', schoolAlt:['arcane'], nameEn:'Golemancer', nameVi:'Thầy Cự Nhân', tiers:[3,5], trunk:['artificer','architect'],
    fantasy:'Một cỗ máy/cự nhân to lớn làm thay mọi việc nặng.',
    core:{ kit:['Dựng cự nhân (một thuộc hạ lớn, máu dày)','Nhập vào lái cự nhân (đổi bộ đòn tạm thời)','Sửa / thay module cho cự nhân'],
      weapons:['tool'], masteries:['Construct','Engineering'], rig:'humanoid64', shared:'Cự nhân dùng chung khung anim 96×96 (đi, đấm, đập đất); mỗi dạng vẽ lại vật liệu.' },
    generic:{ nameEn:'Golemancer', nameVi:'Thầy Cự Nhân', marker:'điều khiển cầm tay + cự nhân đi theo' },
    variants:[
      { id:'bone_golem_maker',   race:'skeleton',  aspect:'death',   nameEn:'Bone Golem Maker',   nameVi:'Kẻ Ráp Cự Cốt',     tier:4, from:['artificer'], twist:'Ráp cự nhân từ xương địch chết: mỗi kết liễu làm cự nhân to thêm một bậc.', marker:'cự nhân ghép từ nhiều bộ xương', note:'Ý tưởng Golemancer lai Engineer + Necromancer trong docs/13 mục 6.6.' },
      { id:'clockwork_skeleton', race:'skeleton',  aspect:'machine', nameEn:'Clockwork Skeleton', nameVi:'Xương Đồng Hồ',     tier:5, from:['architect'], crown:'clockwork_skeleton', hidden:true, unlock:'item:brass_core', twist:'Body Evolution Mechanical: chính thân mình là cỗ máy; module gắn thẳng vào khớp.', marker:'khớp bánh răng + một bên sọ kim loại' },
      { id:'mech_pilot',         race:'human',     aspect:'machine', nameEn:'Mech Pilot',         nameVi:'Phi Công Cơ Giáp',  tier:4, from:['artificer'], twist:'Bước vào bộ giáp máy 15s: đổi hẳn sang bộ đòn mech; ra khỏi giáp thì giáp làm vật cản.', marker:'mũ phi công + cơ giáp đứng sau lưng' },
      { id:'ironwright',         race:'dwarf',     aspect:'stone',   nameEn:'Ironwright',         nameVi:'Thợ Rèn Cự Nhân',   tier:4, from:['artificer'], twist:'Cự nhân đá chậm, cực chịu đòn; ngồi trong ngực cự nhân để lái.', marker:'cự nhân đá có buồng lái ở ngực' },
      { id:'scrap_boss',         race:'orc',       aspect:'machine', nameEn:'Scrap Boss',         nameVi:'Trùm Sắt Vụn',      tier:4, from:['artificer'], twist:'Cự nhân ghép sắt vụn: bị đánh thì rơi mảnh, chủ nhặt mảnh làm đạn ném.', marker:'cự nhân sắt vụn có răng nanh sơn' },
      { id:'overseer',           race:'construct', aspect:'machine', nameEn:'Overseer',           nameVi:'Giám Sát Viên',     tier:4, from:['artificer'], crown:'overseer', twist:'Không một cự nhân mà ba drone nhỏ bay quanh, đổi vai trò (bắn / chắn / sửa).', marker:'3 drone nhỏ bay quanh + mắt đơn to' },
      { id:'core_sovereign',     race:'construct', aspect:'machine', nameEn:'Core Sovereign',     nameVi:'Lõi Chúa',          tier:5, from:['overseer'], crown:'core_sovereign', twist:'Lõi mở ra chiếm cả ngực: điều khiển mọi cỗ máy trong màn, kể cả của địch.', marker:'lõi chiếm cả ngực + thân bay' }
    ]
  },

  alchemist: {
    id:'alchemist', school:'craft', nameEn:'Alchemist', nameVi:'Luyện Kim Sư', tiers:[3,4], trunk:['alchemist','plague_doctor'],
    fantasy:'Mọi vấn đề đều giải được bằng đúng lọ thuốc.',
    core:{ kit:['Ném lọ: vùng hiệu ứng','Trộn: hai lọ liên tiếp tạo hiệu ứng thứ ba','Tự uống thuốc: buff hoặc hồi'],
      weapons:['throwing','tool'], masteries:['Alchemy','Throwing'], rig:'humanoid64', shared:'Anim throw đã có; lọ là prop, khói/vùng là hiệu ứng theo khí chất.' },
    generic:{ nameEn:'Plague Doctor', nameVi:'Bác Sĩ Dịch Hạch', marker:'mặt nạ mỏ chim + đai lọ' },
    variants:[
      { id:'embalmer',         race:'skeleton',  aspect:'death',  nameEn:'Embalmer',         nameVi:'Thợ Ướp Xác',      tier:3, from:['alchemist'], twist:'Thuốc ướp: ướp đồng minh (giảm sát thương nhận nhưng không hồi được) hoặc ướp địch (chậm dần thành xác khô).', marker:'tạp dề vải ướp + móc dài và lọ hũ' },
      { id:'transmuter',       race:'human',     aspect:'arcane', nameEn:'Transmuter',       nameVi:'Kẻ Chuyển Hóa',    tier:3, from:['alchemist'], twist:'Đổi vật chất: biến đạn địch thành vàng rơi xuống (chặn), biến sàn thành bùn.', marker:'găng giả kim có vòng tròn khắc + đá đỏ' },
      { id:'dew_alchemist',    race:'elf',       aspect:'nature', nameEn:'Dew Alchemist',    nameVi:'Luyện Sương',      tier:3, from:['alchemist'], twist:'Thuốc từ sương và hoa: lọ hồi máu ném cho đồng minh, lọ gây ngủ cho địch.', marker:'lọ giọt sương treo quanh áo + hoa cài tai' },
      { id:'ale_sage',         race:'dwarf',     aspect:'fire',   nameEn:'Ale Sage',         nameVi:'Tửu Sư',           tier:4, from:['plague_doctor'], crown:'ale_sage', twist:'Rượu là thuốc: buff đồng minh; phun rượu qua lửa thành đòn lửa.', marker:'thùng bia trên lưng + cốc' },
      { id:'brine_alchemist',  race:'merfolk',   aspect:'tide',   nameEn:'Brine Alchemist',  nameVi:'Luyện Kim Nước Mặn', tier:3, from:['alchemist'], twist:'Lọ muối làm địch khô (giảm hồi máu); lọ nước biển làm Ướt.', marker:'tinh thể muối mọc trên vai + lọ xanh lục' },
      { id:'sulfur_alchemist', race:'dragonkin', aspect:'fire',   nameEn:'Sulfur Alchemist', nameVi:'Luyện Lưu Huỳnh',  tier:3, from:['alchemist'], twist:'Mọi lọ đều nổ; trộn hai lọ thì nổ dây chuyền theo đường thẳng.', marker:'khói vàng lưu huỳnh + kính chắn lửa' }
    ]
  },

  runesmith: {
    id:'runesmith', school:'craft', schoolAlt:['arcane'], nameEn:'Runesmith', nameVi:'Thợ Rune', tiers:[3,5], trunk:['artificer'],
    fantasy:'Sức mạnh nằm trong dấu khắc, không nằm trong cánh tay.',
    core:{ kit:['Khắc rune lên vũ khí đồng minh hoặc lên sàn','Kích nổ / kích hoạt rune đã khắc','Rèn tại chỗ: đặt đe làm trạm buff'],
      weapons:['tool','hammer'], masteries:['Engineering','Arcane'], rig:'humanoid64', shared:'Anim búa của Engineer; rune là hiệu ứng theo màu khí chất.' },
    generic:{ nameEn:'Runesmith', nameVi:'Thợ Rune', marker:'búa rèn + rune sáng trên giáp đồng minh' },
    variants:[
      { id:'bone_carver',  race:'skeleton',  aspect:'death',  nameEn:'Bone Carver',  nameVi:'Thợ Khắc Xương',     tier:3, from:['artificer'], twist:'Khắc rune lên xương mình và xương thuộc hạ; thuộc hạ có rune nổ khi chết.', marker:'dao khắc + xương phủ chữ khắc' },
      { id:'enchanter',    race:'human',     aspect:'arcane', nameEn:'Enchanter',    nameVi:'Thợ Phù Phép',       tier:3, from:['artificer'], twist:'Phù phép trang bị đồng minh: chọn một trong ba hiệu ứng cho vũ khí cả đội.', marker:'áo khoác thợ + găng phát sáng' },
      { id:'glyph_singer', race:'elf',       aspect:'moon',   nameEn:'Glyph Singer', nameVi:'Kẻ Hát Ký Tự',       tier:3, from:['adept'], exception:'Craft-Engineering bị cấm với elf: rune bằng giọng hát, đi qua Arcane.', twist:'Hát ra ký tự lơ lửng; ký tự chạm đồng minh thì thành rune trên vũ khí.', marker:'ký tự bạc bay quanh miệng' },
      { id:'runesmith',    race:'dwarf',     aspect:'rune',   nameEn:'Runesmith',    nameVi:'Thợ Rune',           tier:4, from:['artificer'], crown:'runesmith', twist:'Rune trên giáp đồng minh tồn tại cả trận; đe di động là trạm buff.', marker:'búa rèn + rune sáng trên giáp đồng minh' },
      { id:'runelord',     race:'dwarf',     aspect:'rune',   nameEn:'Runelord',     nameVi:'Rune Chúa',          tier:5, from:['runesmith'], crown:'runelord', twist:'Khắc rune lên chính màn chơi: nền có rune là vùng buff vĩnh viễn trong trận; tối đa 3 rune nền, kích nổ cả ba cùng lúc.', marker:'rune sáng khắc kín râu và giáp + đe bay lơ lửng' },
      { id:'forge_priest',    race:'*', faith:'forge', aspect:'machine', nameEn:'Forge Priest',    nameVi:'Tư Tế Lò Rèn',   tier:3, from:['engineer','guard'], crown:'forge_priest', twist:'Sửa đồng minh như sửa máy (hồi theo nhịp búa, không theo thời gian); bu-lông khắc lên giáp = rune giáp. Mọi chủng tộc theo Giáo Hội Lò Rèn.', marker:'tay máy + búa nghi lễ + áo choàng da thuộc' },
      { id:'iron_oracle',     race:'*', faith:'forge', aspect:'machine', nameEn:'Iron Oracle',     nameVi:'Thiết Tiên Tri', tier:4, from:['forge_priest'], crown:'iron_oracle', twist:'Mắt máy dự đoán: hiện hitbox đòn địch trước 0,5s cho cả đội; rune khắc lên địch làm đòn của nó chậm hơn.', marker:'mắt ống kính + ngực mở thấy bánh răng' },
      { id:'engine_of_faith', race:'*', faith:'forge', aspect:'machine', nameEn:'Engine of Faith', nameVi:'Cỗ Máy Đức Tin', tier:5, from:['iron_oracle'], crown:'engine_of_faith', twist:'Hoàn tất cải tạo (Body Evolution Mechanical cho mọi chủng tộc): không còn máu, chỉ có Nhiệt; rune trên thân tự kích khi quá nhiệt.', marker:'thân gần như toàn máy, chỉ còn mặt là thịt/xương' },
      { id:'forge_king',   race:'dwarf',     aspect:'fire',   nameEn:'Forge King',   nameVi:'Lò Rèn Vương',       tier:5, from:['architect','runesmith'], crown:'forge_king', twist:'Lò rèn sau lưng: rèn vũ khí tạm cho đồng minh ngay trong trận.', marker:'vương miện đe + lò rèn di động sau lưng' },
      { id:'scale_smith',  race:'dragonkin', aspect:'fire',   nameEn:'Scale-smith',  nameVi:'Thợ Rèn Vảy',        tier:3, from:['artificer'], twist:'Rèn vảy rụng của chính mình thành giáp tặng đồng minh (mình mất giáp tương ứng).', marker:'mảng vảy bong trên tay + kìm rèn' },
      { id:'inscriber',    race:'construct', aspect:'rune',   nameEn:'Inscriber',    nameVi:'Thợ Khắc Lõi',       tier:3, from:['artificer'], twist:'Khắc rune lên chính thân: mỗi rune là một module chủ động, thay được giữa trận.', marker:'tay khắc laser + bảng rune trên ngực' }
    ]
  }
});

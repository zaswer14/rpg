/* Chủng tộc: SKELETON — chủng tộc chủ lực (flagship) của Skeleton Codex. Có nhiều ngọn riêng nhất vì là game đầu. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.skeleton = {
  id:'skeleton', nameEn:'Skeleton', nameVi:'Bộ Xương', flagship:true,
  lore:'Xương khô thức tỉnh trong hầm mộ, không nhớ mình là ai; mọi nghề là một cách tự ghép lại thân xác.',
  leaning:{ school:'death', note:'Sở trường Death (Lich → Death Sovereign) và Combat lai Death; Martial-Body là nhánh độc nhất (nắn chính bộ xương). Là chủng tộc chủ lực nên sâu nhất; không thêm nhánh sở trường mới ở đợt 14/10.' },
  origin:{ id:'wanderer', tier:0, nameEn:'Wanderer', nameVi:'Kẻ Lang Thang', legacy:'Wanderer', summary:'Xương trần, que gỗ gãy, không marker. Điểm số 0 của mọi đường nghề.' },
  body:{ rig:'humanoid64', notes:'Thân xương trần ivory, sọ 17–23% chiều cao. Không thở (ảnh hưởng Monk).',
    evolutions:[
      { id:'armored',    nameEn:'Armored Bone',    nameVi:'Xương Bọc Thép',  visual:'khớp gia cố kim loại' },
      { id:'crystal',    nameEn:'Crystal Bone',    nameVi:'Xương Pha Lê',    visual:'mặt cắt pha lê, nhìn xuyên' },
      { id:'dragonbone', nameEn:'Dragonbone',      nameVi:'Long Cốt',        visual:'sừng xương, tấm vảy xương' },
      { id:'mechanical', nameEn:'Mechanical Bone', nameVi:'Xương Cơ Khí',    visual:'khớp bánh răng, một bên sọ kim loại' }
    ] },
  schools:{ native:['combat','shadow','death','craft'], foreign:['arcane','ranged','beast','martial'], forbidden:[] },
  schoolNotes:{ martial:'Chỉ nhánh Body (Shaper/Colossus). Monk/Mystic bị cấm riêng: xương không thở.' },
  blockedJobs:['monk','mystic'],
  prefix:{ en:'Bone', viSuffix:'Xương' },
  displayNames:{ // tên hiển thị kế thừa V12.3 cho nghề chung khi chủng tộc là skeleton (ID chung không đổi)
    archer:{en:'Skeleton Archer',vi:'Cung Thủ Xương'}, hunter:{en:'Grave Hunter',vi:'Thợ Săn Mộ'}, assassin:{en:'Grave Assassin',vi:'Sát Thủ Mộ'},
    bandit:{en:'Grave Bandit',vi:'Đạo Tặc Hầm Mộ'}, necromancer:{en:'Necromancer',vi:'Pháp Sư Tử Linh'}, medium:{en:'Soul Medium',vi:'Linh Môi'},
    grand_necromancer:{en:'Grand Necromancer',vi:'Đại Pháp Sư Tử Linh'}, stalker:{en:'Shade Stalker',vi:'Kẻ Rình Rập Bóng Tối'},
    sniper:{en:'Bone Sniper',vi:'Xạ Thủ Xương'}, artificer:{en:'Bone Artificer',vi:'Nghệ Nhân Xương'}, siege_gunner:{en:'Siege Gunner',vi:'Pháo Thủ Công Thành'},
    marshal:{en:'Legion Marshal',vi:'Thống Soái Quân Đoàn'}, adept:{en:'Bone Acolyte',vi:'Tập Sự Tử Thuật'}
  },
  accent:{ death:'#5DDF96', soulfire:'#7FB8FF', shadow:'#926ACC' },
  silhouetteHook:'Xương lộ qua mọi bộ giáp; không bao giờ che kín sọ.',
  crowns:[
    // Combat lai Death
    { id:'dread_knight',    tier:3, from:['guard'],          school:'combat', faith:'dark', nameEn:'Dread Knight',    nameVi:'Kỵ Sĩ Kinh Hoàng',   role:'Knight',    gate:['shield_oath','guard_counter'],  req:{Sword:50,Necromancy:25}, trial:'Dread oath',    legacy:'Dread Knight',    marker:'mũ kín không mào + xích, KHÔNG khiên', summary:'Vứt khiên, đại kiếm, lửa hồn xanh lạnh. Lời thề với cái chết = ký kết Hắc Giáo (cần Devotion 30).' },
    { id:'death_knight',    tier:4, from:['dread_knight'],   school:'combat', faith:'dark', nameEn:'Death Knight',    nameVi:'Kỵ Sĩ Tử Vong',      role:'Juggernaut',gate:['dread_cleaver','wraith_rush'],  req:{Sword:70,Necromancy:60}, trial:'Death trial',   legacy:'Death Knight',    marker:'mũ mặt sọ + khiên hồn trong suốt', summary:'Full plate đen, khiên hồn. Dạng skeleton + Hắc Giáo của khuôn Kỵ Sĩ.' },
    { id:'abyss_sovereign', tier:5, from:['death_knight'],   school:'combat', faith:'deep', nameEn:'Abyss Sovereign', nameVi:'Chúa Tể Vực Sâu',    role:'Mythic',    gate:['reaper_verdict','warlord_stride'],req:{Sword:95,Necromancy:85}, trial:'Abyss trial', legacy:'Abyss Sovereign', marker:'pauldron khổng lồ + khe nứt đỏ', summary:'Silhouette rộng nhất game; màu nhấn đổi sang đỏ vực. Thuộc Vực Giáo (đổi đạo từ Hắc Giáo sang Vực Giáo ở T5). Cân nhắc đổi tên nếu hải tộc dùng từ Abyss.' },
    // Combat theo Quang Minh (undead sám hối)
    { id:'penitent_knight', tier:4, from:['paladin'],        school:'combat', faith:'light', nameEn:'Penitent Knight', nameVi:'Kỵ Sĩ Sám Hối',    role:'Knight',    gate:null, req:{Shield:60,Spirit:50}, trial:'Confession', legacy:null, marker:'xương phủ vải thánh trắng ố + ngựa xương quấn băng', summary:'Undead thề với Ánh Sáng. Hào quang thiêu chính mình chậm; mỗi undead bị hạ hồi lại phần đã mất.', todo:'Gate cần 2 skill T3 combat/light.' },
    { id:'ossuary_saint',   tier:5, from:['penitent_knight'],school:'combat', faith:'light', nameEn:'Ossuary Saint',   nameVi:'Thánh Cốt',          role:'Mythic',    gate:null, req:{Spirit:90,Shield:70}, trial:'Second death', legacy:null, marker:'xương trắng tinh phát sáng từ trong + không giáp, không vũ khí', summary:'Xương được thánh hóa: chết lần nữa thì tan thành ánh sáng hồi sinh mọi đồng minh.', todo:'Gate cần 2 skill T4 light.' },
    // Combat thuần
    { id:'sword_wraith',    tier:4, from:['blademaster'],    school:'combat', nameEn:'Sword Wraith',    nameVi:'Kiếm Hồn',           role:'Duelist',   gate:null, req:{Sword:75,Soul:40}, trial:'Wraith trial', legacy:'Sword Wraith', marker:'khăn quàng dài bay + nửa dưới mờ', summary:'Nâng từ T3 lên T4 (ngọn riêng nằm trên T3 chung).', todo:'Gate cần 2 skill T3 combat mới so với Blademaster.' },
    // Ranged
    { id:'phantom_sniper',  tier:4, from:['sniper'],         school:'ranged', nameEn:'Phantom Sniper',  nameVi:'Xạ Thủ U Linh',      role:'Sniper',    gate:null, req:{Bow:75,Stealth:45}, trial:'Phantom sight', legacy:'Phantom Sniper', marker:'một hốc mắt bịt vải + tên đuôi ma', summary:'Nâng lên T4.', todo:'Gate cần 2 skill T3 ranged.' },
    { id:'eternal_huntsman',tier:5, from:['phantom_sniper'], school:'ranged', nameEn:'Eternal Huntsman',nameVi:'Thợ Săn Vĩnh Hằng',  role:'Hunter',    gate:null, req:{Bow:95}, trial:'Eternal hunt', legacy:'Eternal Huntsman', marker:'mũ rộng vành + áo choàng da ghép', summary:'Nâng lên T5.', todo:'Gate cần 2 skill T4 ranged.' },
    // Beast
    { id:'wild_hunt_captain',tier:4,from:['beast_rider'],    school:'beast',  nameEn:'Wild Hunt Captain',nameVi:'Đội Trưởng Cuộc Săn',role:'Beastmaster',gate:null, req:{Bow:55,Taming:45}, trial:'Hunt trial', legacy:'Wild Hunt Captain', marker:'gạc hươu trên sọ + tù và + chó săn ma', summary:'Cuộc Săn Hoang là undead; cưỡi thú + bầy chó.', todo:'Gate cần 2 skill T3 beast.' },
    { id:'headless_horseman',tier:5,from:['wild_hunt_captain'],school:'beast',nameEn:'Headless Horseman',nameVi:'Kỵ Sĩ Không Đầu',   role:'Mythic',    gate:null, req:{Riding:90,Necromancy:60}, trial:'Headless ride', legacy:null, marker:'sọ cầm trên tay, cổ trống; ngựa xương lửa lạnh', summary:'Có trong source cards gốc.', todo:'Gate cần 2 skill T4 beast.' },
    // Shadow
    { id:'grave_marauder',  tier:3, from:['bandit'],         school:'shadow', nameEn:'Grave Marauder',  nameVi:'Kẻ Tàn Phá Lăng Mộ', role:'Raider',    gate:['armor_rend','leaping_strike'], req:{Axe:45,Dagger:25}, trial:'Marauder trial', legacy:'Grave Marauder', marker:'vương miện cướp được đội lệch + đai chiến lợi phẩm', summary:'Terminal T3. Lối từ Bone Raider bỏ vì Raider đã gộp vào Duelist.' },
    { id:'soul_assassin',   tier:4, from:['stalker'],        school:'shadow', nameEn:'Soul Assassin',   nameVi:'Sát Thủ Đoạt Hồn',   role:'Hybrid',    gate:null, req:{Dagger:65,Soul:50}, trial:'Soul trial', legacy:'Soul Assassin', marker:'nửa mặt nạ xương + lọ hồn treo đai', summary:'Nâng lên T4, mọc từ Stalker.', todo:'Gate cần 2 skill T3 shadow.' },
    { id:'death_whisper',   tier:5, from:['soul_assassin'],  school:'shadow', nameEn:'Death Whisper',   nameVi:'Lời Thì Thầm Tử Vong',role:'Assassin', gate:null, req:{Dagger:90,Soul:70}, trial:'Silent trial', legacy:'Death Whisper', marker:'mặt nạ xương trơn + tối giản tuyệt đối', summary:'Nâng lên T5.', todo:'Gate cần 2 skill T4 shadow.' },
    // Death
    { id:'lich',            tier:4, from:['grand_necromancer'],school:'death',nameEn:'Lich',            nameVi:'Vu Yêu',             role:'Commander', gate:['legion_call','bone_spike_field'], req:{Necromancy:85,Soul:70}, trial:'Crown trial', legacy:'Lich King', marker:'vương miện liền sọ + bình phách trong lồng ngực', summary:'' },
    { id:'death_sovereign', tier:5, from:['lich'],           school:'death',  nameEn:'Death Sovereign', nameVi:'Chúa Tể Tử Vong',    role:'Mythic',    gate:['grave_dominion','necrotic_wave'], req:{Necromancy:95,Soul:95}, trial:'Sovereign trial', legacy:'Death Sovereign', marker:'vầng sọ + áo bào bằng hồn', summary:'' },
    { id:'soul_weaver',     tier:4, from:['oracle'],         school:'death',  nameEn:'Soul Weaver',     nameVi:'Kẻ Dệt Linh Hồn',    role:'Support',   gate:null, req:{Soul:65}, trial:'Weaving trial', legacy:'Soul Weaver', marker:'sợi hồn từ đầu ngón tay + con thoi', summary:'Nâng lên T4, mọc từ Oracle (lối từ Necromancer bỏ).', todo:'Gate cần 2 skill T3 death.' },
    { id:'bandaged_hexer',  tier:4, from:['oracle'],         school:'death',  nameEn:'Bandaged Hexer',  nameVi:'Kẻ Nguyền Băng Vải', role:'Hexer',     gate:null, req:{Curse:60}, trial:'Hex trial', legacy:null, marker:'băng vải quấn toàn thân + bùa ghim', summary:'Mastery Curse; màu vàng lanh cũ, không glow.', todo:'Gate cần 2 skill T3 curse.' },
    { id:'mummy_lord',      tier:5, from:['bandaged_hexer'], school:'death',  nameEn:'Mummy Lord',      nameVi:'Chúa Mộ Vải',        role:'Mythic',    gate:null, req:{Curse:90,Soul:60}, trial:'Sarcophagus trial', legacy:null, marker:'quan tài đeo lưng mở nắp + băng vải thành roi', summary:'Có Mummy trong source cards.', todo:'Gate cần 2 skill T4 curse.' },
    // Martial-Body
    { id:'ossomancer',      tier:4, from:['colossus'],       school:'martial',nameEn:'Ossomancer',      nameVi:'Kẻ Nắn Xương',       role:'Shaper',    gate:null, req:{Body:70}, trial:'Bone trial', legacy:null, marker:'tháo tay làm chùy + ném sọ rồi dịch chuyển tới sọ', summary:'Chỉ skeleton làm được; không cần overlay vũ khí.', todo:'Gate cần 2 skill T3 Body.' },
    // Nghề ẩn theo Body Evolution
    { id:'dragonbone_warlord', tier:5, from:['death_knight'], school:'combat', hidden:true, unlock:'item:dragon_heart', nameEn:'Dragonbone Warlord', nameVi:'Long Cốt Chiến Chúa', role:'Mythic', gate:null, req:{}, trial:'—', legacy:null, bodyEvolution:'dragonbone', marker:'sừng xương từ sọ + vảy xương vai', summary:'Hidden; thân riêng.', todo:'Điều kiện mở bằng vật phẩm, chưa có hệ item.' },
    { id:'crystal_lich',       tier:5, from:['lich'],            school:'death',  hidden:true, unlock:'item:crystal_phylactery', nameEn:'Crystal Lich', nameVi:'Vu Yêu Pha Lê', role:'Mythic', gate:null, req:{}, trial:'—', legacy:null, bodyEvolution:'crystal', marker:'sọ trong suốt thấy bình phách', summary:'Hidden; nhánh thay thế Death Sovereign.' },
    { id:'clockwork_skeleton', tier:5, from:['architect'],       school:'craft',  hidden:true, unlock:'item:brass_core', nameEn:'Clockwork Skeleton', nameVi:'Xương Đồng Hồ', role:'Mythic', gate:null, req:{}, trial:'—', legacy:null, bodyEvolution:'mechanical', marker:'khớp bánh răng + một bên sọ kim loại', summary:'Hidden; ngọn T5 duy nhất của Craft.' }
  ],
  // Map ID nghề V12.3 (Skeleton Codex) → ID thư viện, để đọc save cũ.
  legacyIds:{
    'Wanderer':'wanderer','Bone Fighter':'fighter','Skeleton Archer':'archer','Bone Rogue':'rogue','Bone Acolyte':'adept','Bone Tinkerer':'tinkerer',
    'Bone Guard':'guard','Bone Duelist':'duelist','Bone Raider':'duelist','Bone Marksman':'marksman','Grave Hunter':'hunter','Grave Assassin':'assassin',
    'Grave Bandit':'bandit','Necromancer':'necromancer','Soul Medium':'medium','Bone Engineer':'engineer',
    'Bone Phalanx':'phalanx','Dread Knight':'dread_knight','Sword Wraith':'sword_wraith','Grave Marauder':'grave_marauder','Phantom Sniper':'phantom_sniper',
    'Wild Hunt Captain':'wild_hunt_captain','Soul Assassin':'soul_assassin','Shade Stalker':'stalker','Grand Necromancer':'grand_necromancer','Soul Weaver':'soul_weaver',
    'Bone Tinkerer Prime':'artificer','Siege Gunner':'siege_gunner','Legion Marshal':'marshal','Death Knight':'death_knight','Eternal Huntsman':'eternal_huntsman',
    'Death Whisper':'death_whisper','Lich King':'lich','Bone Architect':'architect','Abyss Sovereign':'abyss_sovereign','Death Sovereign':'death_sovereign'
  }
};

/* Chủng tộc: HUMAN — chủng tộc "chuẩn", thân gần skeleton nhất; nên là chủng tộc thứ hai để kiểm chứng mô hình dùng chung. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.human = {
  id:'human', nameEn:'Human', nameVi:'Nhân Loại',
  lore:'Không có gì bẩm sinh, nên học được gần như mọi thứ; sức mạnh đến từ tổ chức, đức tin và kỷ luật.',
  leaning:{ school:'combat', note:'Sở trường tổ chức: chỉ huy (Marshal → Warlord), tín ngưỡng (Quang Minh ưu ái), hỏa khí. Nhánh sở trường riêng: Lính Đánh Thuê → Thủ Lĩnh Tự Do → Kẻ Tạo Vua: sức mạnh bằng người, tiền và lời hứa, không cần thần hay phép.' },
  origin:{ id:'peasant', tier:0, nameEn:'Peasant', nameVi:'Nông Dân', summary:'Áo vải, liềm hoặc gậy, không giáp. Marker: không có.' },
  body:{ rig:'humanoid64', notes:'Thân chuẩn; mọi gear overlay của skeleton vẽ lại được gần như 1:1.',
    evolutions:[
      { id:'blessed', nameEn:'Blessed', nameVi:'Được Ban Phước', visual:'hào quang mờ sau đầu, da sáng' },
      { id:'scarred', nameEn:'Scarred', nameVi:'Chiến Tích',     visual:'sẹo lớn, một mắt mù, giáp sửa nhiều lần' }
    ] },
  schools:{ native:['combat','ranged','craft','martial'], foreign:['arcane','beast','shadow'], forbidden:['death'] },
  hiddenAccess:{ death:{ via:'heretic', note:'Chỉ vào Death qua nghề ẩn Heretic; sau đó Necromancer/Oracle mở như foreign.' } },
  prefix:{ en:'', viSuffix:'' },
  accent:{ faith:'#E8D48A', steel:'#99A4A7', crimson:'#A62B3A' },
  silhouetteHook:'Giáp che kín người, mũ có mặt; màu cờ/huy hiệu là nhận diện phe.',
  faithNotes:'Paladin / Crusader Lord / Inquisitor (trước là ngọn human) nay là ngọn của Thánh Giáo Quang Minh (faiths.js), mở cho mọi chủng tộc; human là chủng tộc được ưu ái (favored). Hắc Giáo là cửa chính để human vào Death.',
  crowns:[
    { id:'musketeer',     tier:4, from:['sniper'],      school:'ranged',  nameEn:'Musketeer',      nameVi:'Hỏa Mai Thủ',      role:'Sniper',    gate:null, req:{Firearm:60},          trial:'Line of fire',   marker:'súng hỏa mai dài + mũ lông vũ', summary:'Firearm là mastery con của Ranged chưa ai dùng.' },
    { id:'deadeye',       tier:5, from:['musketeer'],   school:'ranged',  nameEn:'Deadeye',        nameVi:'Thần Xạ',          role:'Mythic',    gate:null, req:{Firearm:90},          trial:'One bullet',     marker:'súng trường dài hơn người + áo khoác dài không tay', summary:'Một viên: đứng yên 3s rồi bắn xuyên toàn bộ màn theo đường thẳng.' },
    { id:'warlord',       tier:5, from:['marshal'],     school:'combat',  nameEn:'Warlord',        nameVi:'Chiến Chúa',       role:'Mythic',    gate:null, req:{Shield:90,Spear:80},  trial:'Campaign',       marker:'lều cờ sau lưng (banner lớn) + giáp vàng', summary:'' },
    { id:'grandmaster',   tier:4, from:['mystic'],      school:'martial', nameEn:'Grandmaster',    nameVi:'Đại Tông Sư',      role:'Monk',      gate:null, req:{Spirit:75},           trial:'Hundred bouts',  marker:'không giáp, râu dài, một chuỗi hạt', summary:'' },
    { id:'living_legend', tier:5, from:['grandmaster'], school:'martial', nameEn:'Living Legend',  nameVi:'Huyền Thoại Sống', role:'Mythic',    gate:null, req:{Spirit:95,Unarmed:80}, trial:'Thousand bouts', marker:'áo vải trắng không một vết + tóc bạc buộc cao', summary:'Đỉnh Martial của human: tay không nhưng đòn thường có tầm như vũ khí (khí phóng ra).' },
    // Nhánh sở trường: tổ chức và tiền — lính đánh thuê.
    { id:'sellsword',     tier:3, from:['duelist','bandit'], school:'combat', schoolAlt:['shadow'], nameEn:'Sellsword', nameVi:'Lính Đánh Thuê', role:'Mercenary', gate:null, req:{Sword:40,Dagger:20}, trial:'First contract', marker:'giáp chắp vá nhiều phe + túi tiền to ở hông', summary:'Dùng được mọi vũ khí cận chiến; nhận "hợp đồng" đầu trận (giết X / sống sót Y giây) để lấy thưởng vàng → đổi buff ngay trong trận.' },
    { id:'free_captain',  tier:4, from:['sellsword'],   school:'combat',  nameEn:'Free Captain',   nameVi:'Thủ Lĩnh Tự Do',   role:'Commander', gate:null, req:{Sword:60,Shield:30},  trial:'Payroll',        marker:'mũ sĩ quan không huy hiệu + cờ trắng có túi tiền', summary:'Thuê lính: trả vàng gọi 2 lính đánh thuê (thuộc hạ melee/ranged chọn lúc gọi); lính không được trả thì bỏ đi.' },
    { id:'kingmaker',     tier:5, from:['free_captain'],school:'combat',  nameEn:'Kingmaker',      nameVi:'Kẻ Tạo Vua',       role:'Mythic',    gate:null, req:{Sword:80,Shield:60,Stealth:40}, trial:'Coronation', marker:'áo choàng vua mặc hờ, vương miện cầm tay chứ không đội', summary:'Mua chuộc: trả vàng biến một địch thường thành thuộc hạ vĩnh viễn trong trận; boss thì mua được 5s ngừng đánh.' },
    { id:'heretic',       tier:2, from:['adept'],       school:'death',   hidden:true, unlock:'event:forbidden_tome', nameEn:'Heretic', nameVi:'Dị Giáo Đồ', role:'Caster', gate:null, req:{Arcane:25}, trial:'Burning', marker:'mặt nạ bị đóng dấu + sách bị khóa xích', summary:'Nghề ẩn mở Death cho human không cần theo Hắc Giáo; từ đây đi Necromancer như foreign.' }
  ]
};

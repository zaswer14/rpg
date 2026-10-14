/* Chủng tộc: HUMAN — chủng tộc "chuẩn", thân gần skeleton nhất; nên là chủng tộc thứ hai để kiểm chứng mô hình dùng chung. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.human = {
  id:'human', nameEn:'Human', nameVi:'Nhân Loại',
  lore:'Không có gì bẩm sinh, nên học được gần như mọi thứ; sức mạnh đến từ tổ chức, đức tin và kỷ luật.',
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
  crowns:[
    { id:'paladin',       tier:3, from:['guard'],       school:'combat',  nameEn:'Paladin',        nameVi:'Thánh Kỵ Sĩ',     role:'Tank',      gate:null, req:{Shield:50,Spirit:25}, trial:'Vigil',          marker:'khiên có mặt trời + áo choàng trắng vai', summary:'Guard + đức tin; hồi máu khi block.' },
    { id:'crusader_lord', tier:4, from:['paladin'],     school:'combat',  nameEn:'Crusader Lord',  nameVi:'Thập Tự Chúa',     role:'Commander', gate:null, req:{Shield:70,Spirit:50}, trial:'Crusade',        marker:'cờ thập tự cắm lưng + mũ vương miện hở mặt', summary:'' },
    { id:'inquisitor',    tier:4, from:['stalker'],     school:'shadow',  nameEn:'Inquisitor',     nameVi:'Phán Quan',        role:'Hunter',    gate:null, req:{Stealth:60,Spirit:40}, trial:'Interrogation', marker:'mũ rộng vành + xích bạc + sách', summary:'Săn phép thuật; khống chế caster.' },
    { id:'musketeer',     tier:4, from:['sniper'],      school:'ranged',  nameEn:'Musketeer',      nameVi:'Hỏa Mai Thủ',      role:'Sniper',    gate:null, req:{Firearm:60},          trial:'Line of fire',   marker:'súng hỏa mai dài + mũ lông vũ', summary:'Firearm là mastery con của Ranged chưa ai dùng.' },
    { id:'warlord',       tier:5, from:['marshal'],     school:'combat',  nameEn:'Warlord',        nameVi:'Chiến Chúa',       role:'Mythic',    gate:null, req:{Shield:90,Spear:80},  trial:'Campaign',       marker:'lều cờ sau lưng (banner lớn) + giáp vàng', summary:'' },
    { id:'grandmaster',   tier:4, from:['mystic'],      school:'martial', nameEn:'Grandmaster',    nameVi:'Đại Tông Sư',      role:'Monk',      gate:null, req:{Spirit:75},           trial:'Hundred bouts',  marker:'không giáp, râu dài, một chuỗi hạt', summary:'' },
    { id:'heretic',       tier:2, from:['adept'],       school:'death',   hidden:true, unlock:'event:forbidden_tome', nameEn:'Heretic', nameVi:'Dị Giáo Đồ', role:'Caster', gate:null, req:{Arcane:25}, trial:'Burning', marker:'mặt nạ bị đóng dấu + sách bị khóa xích', summary:'Nghề ẩn mở Death cho human; từ đây đi Necromancer như foreign.' }
  ]
};

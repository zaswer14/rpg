/* Chủng tộc: BEASTFOLK (người thú) — dã thú, võ thuật, chiến đấu; cấm huyền thuật thuần. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.beastfolk = {
  id:'beastfolk', nameEn:'Beastfolk', nameVi:'Người Thú',
  lore:'Bầy trước cá nhân; tổ tiên nói qua totem, không qua sách.',
  origin:{ id:'cub', tier:0, nameEn:'Cub', nameVi:'Thú Con', summary:'Không gear, vuốt tự nhiên. Marker: tai/đuôi (thân).' },
  body:{ rig:'humanoid64', notes:'Đầu thú (sói/mèo/gấu chọn một làm chuẩn, các biến thể là palette swap), đuôi là lớp cape. Mũ trùm phải có khe tai: mọi overlay head cần biến thể.',
    evolutions:[
      { id:'primal', nameEn:'Primal', nameVi:'Nguyên Thủy', visual:'lông dày hơn, vuốt dài, mắt sáng' },
      { id:'feral',  nameEn:'Feral',  nameVi:'Hoang Dã',    visual:'khom người, chạy bốn chân (anim riêng)' }
    ] },
  schools:{ native:['beast','martial','combat'], foreign:['ranged','shadow','death'], forbidden:['arcane','craft'] },
  schoolNotes:{ death:'Chỉ Soul/Spirit (Medium → Oracle → Totem Shaman); Necromancer cấm.' },
  blockedJobs:['necromancer','grand_necromancer'],
  prefix:{ en:'Fang', viSuffix:'Thú' },
  accent:{ ochre:'#C98A3A', bloodpaint:'#B0352F', totem:'#7FBF6A' },
  silhouetteHook:'Luôn hơi khom, trọng tâm thấp; vũ khí ngắn và cong.',
  crowns:[
    { id:'moon_howler',     tier:3, from:['hunter'],      school:'beast',   nameEn:'Moon Howler',     nameVi:'Hú Nguyệt',      role:'Hunter',    gate:null, req:{Taming:40,Stealth:30}, trial:'Full moon',    marker:'mặt trăng vẽ trên ngực + bầy 2 sói nhỏ', summary:'Terminal T3.' },
    { id:'fang_rider',      tier:4, from:['beast_rider'], school:'beast',   nameEn:'Fang Rider',      nameVi:'Kỵ Nha',         role:'Rider',     gate:null, req:{Riding:60,Taming:50},  trial:'Great hunt',   marker:'cưỡi gấu/sói lớn + giáo xương', summary:'' },
    { id:'primal_berserker',tier:3, from:['duelist'],     school:'combat',  nameEn:'Primal Berserker',nameVi:'Cuồng Thú',      role:'Bruiser',   gate:null, req:{Axe:50,Body:25},       trial:'Blood pit',    marker:'hai rìu + sơn máu trên mặt, không giáp ngực', summary:'Terminal T3.' },
    { id:'alpha',           tier:4, from:['colossus'],    school:'martial', nameEn:'Alpha',           nameVi:'Thủ Lĩnh Bầy',   role:'Bruiser',   gate:null, req:{Body:70},              trial:'Challenge',    marker:'bờm dựng + sẹo chéo mặt + vuốt kim loại', summary:'' },
    { id:'pack_lord',       tier:5, from:['alpha'],       school:'martial', nameEn:'Pack Lord',       nameVi:'Bầy Chúa',       role:'Mythic',    gate:null, req:{Body:90,Taming:60},    trial:'Thousand howls',marker:'áo choàng da thủ lĩnh cũ + 3 thú đi theo', summary:'' },
    { id:'totem_shaman',    tier:4, from:['oracle'],      school:'death',   nameEn:'Totem Shaman',    nameVi:'Pháp Sư Totem',  role:'Support',   gate:null, req:{Soul:60,Taming:40},    trial:'Ancestor fire',marker:'cột totem đeo lưng + mặt nạ gỗ', summary:'Death foreign, chỉ Spirit.' }
  ]
};

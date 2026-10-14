/* Chủng tộc: DRAGONKIN — lửa + chiến đấu; cấm bóng tối. Cánh là rủi ro silhouette. */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.races = window.JobLibrary.races || {};
window.JobLibrary.races.dragonkin = {
  id:'dragonkin', nameEn:'Dragonkin', nameVi:'Long Nhân',
  lore:'Hậu duệ xa của rồng; càng dùng lửa càng gần tổ tiên, càng gần tổ tiên càng mất người.',
  origin:{ id:'hatchling', tier:0, nameEn:'Hatchling', nameVi:'Long Ấu', summary:'Vảy mỏng, đuôi ngắn, không gear. Marker: sừng nhỏ (thân).' },
  body:{ rig:'humanoid64', notes:'Đầu rồng, đuôi là lớp cape, vảy là palette thân. Cánh chỉ xuất hiện ở evolution winged (rig riêng, phá ô 64).',
    evolutions:[
      { id:'wyrmblood', nameEn:'Wyrmblood', nameVi:'Long Huyết', visual:'vảy sáng từ trong, hơi thở lửa khi idle' },
      { id:'winged',    nameEn:'Winged',    nameVi:'Hữu Dực',    visual:'cánh (rig riêng)' }
    ] },
  schools:{ native:['arcane','combat'], foreign:['ranged','martial','craft','beast'], forbidden:['shadow','death'] },
  schoolNotes:{ arcane:'Fire native; Frost cấm.' },
  prefix:{ en:'Wyrm', viSuffix:'Long' },
  accent:{ ember:'#E06A2A', gold:'#D9A441', scale:'#7A2E2E' },
  silhouetteHook:'Đuôi luôn thấy, sừng cong về sau; vũ khí có răng cưa.',
  crowns:[
    { id:'flame_warden',  tier:3, from:['guard'],     school:'combat',  nameEn:'Flame Warden',  nameVi:'Hỏa Vệ',        role:'Tank',   gate:null, req:{Shield:50,Fire:30},  trial:'Ember gate',    marker:'khiên tròn có lò lửa + hơi thở lửa khi block', summary:'Terminal T3.' },
    { id:'dragon_knight', tier:4, from:['phalanx'],   school:'combat',  nameEn:'Dragon Knight', nameVi:'Long Kỵ Sĩ',    role:'Knight', gate:null, req:{Spear:65,Fire:50},   trial:'Lance of ash',  marker:'thương dài có lửa + giáp vảy đỏ', summary:'' },
    { id:'wyrm_caller',   tier:4, from:['warlock'],   school:'arcane',  nameEn:'Wyrm Caller',   nameVi:'Triệu Long',    role:'Mage',   gate:null, req:{Fire:75},            trial:'Ancestor roar', marker:'một rồng con bay cạnh + gậy sừng', summary:'' },
    { id:'elder_wyrm',    tier:5, from:['wyrm_caller'],school:'arcane', nameEn:'Elder Wyrm',    nameVi:'Cổ Long',       role:'Mythic', gate:null, req:{Fire:95},            trial:'Molt',          marker:'cánh + sừng lớn (rig riêng), không vũ khí', summary:'Cần evolution winged.', bodyEvolution:'winged' },
    { id:'scale_lord',    tier:4, from:['colossus'],  school:'martial', nameEn:'Scale Lord',    nameVi:'Lân Chúa',      role:'Bruiser',gate:null, req:{Body:70,Fire:40},    trial:'Shed skin',     marker:'vảy dày như giáp + vuốt lửa', summary:'' },
    { id:'ember_sage',    tier:4, from:['mystic'],    school:'martial', nameEn:'Ember Sage',    nameVi:'Hỏa Hiền',      role:'Monk',   gate:null, req:{Spirit:70,Fire:40},  trial:'Still flame',   marker:'ngồi thiền trên lửa + không giáp', summary:'' }
  ]
};

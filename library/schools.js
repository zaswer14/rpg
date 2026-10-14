/* Job Library — 8 trường phái (school) dùng chung cho mọi chủng tộc, mọi game.
 * Không phụ thuộc game. Nạp bằng <script> hoặc copy phần object sang JSON cho engine khác.
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.schools = {
  combat:  { nameEn:'Combat',  nameVi:'Chiến đấu',   masteries:['Sword','Axe','Spear','Shield'],          weapons:['swordshield','sword','axe','spearshield'] },
  ranged:  { nameEn:'Ranged',  nameVi:'Tầm xa',      masteries:['Throwing','Bow','Crossbow','Firearm'],   weapons:['bow','dagger'] },
  shadow:  { nameEn:'Shadow',  nameVi:'Bóng tối',    masteries:['Stealth','Dagger','Trap'],               weapons:['dagger','axe','sword'] },
  arcane:  { nameEn:'Arcane',  nameVi:'Huyền thuật', masteries:['Fire','Frost','Lightning','Arcane'],     weapons:['focus'] },
  death:   { nameEn:'Death',   nameVi:'Tử thuật',    masteries:['Necromancy','Soul','Curse'],             weapons:['focus','dagger'] },
  craft:   { nameEn:'Craft',   nameVi:'Chế tác',     masteries:['Engineering','Alchemy','Construct'],     weapons:['tool','swordshield'] },
  beast:   { nameEn:'Beast',   nameVi:'Dã thú',      masteries:['Riding','Taming'],                       weapons:['spearshield','bow'] },
  martial: { nameEn:'Martial', nameVi:'Võ thuật',    masteries:['Unarmed','Body','Spirit'],               weapons:['unarmed'] }
};
// Trạng thái một chủng tộc có thể gán cho mỗi trường phái.
window.JobLibrary.ACCESS = {
  native:    { nameVi:'Bản địa',  masteryBonus:0,  note:'Vào từ T1, gate bình thường, có ngọn riêng.' },
  foreign:   { nameVi:'Ngoại lai', masteryBonus:15, note:'Vào được nhưng mọi gate Mastery +15; không có ngọn riêng T4–T5.' },
  forbidden: { nameVi:'Cấm',       masteryBonus:null, note:'Không vào bằng đường thường; chỉ qua nghề ẩn (hidden) nếu chủng tộc có.' }
};

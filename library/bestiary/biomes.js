/* Bestiary — VÙNG (biome): nơi quái phụ sống. Bảng sinh quái của mỗi vùng suy từ species[].habitat;
 * vùng chỉ ghi trọng số riêng (weights, mặc định 10) và tỉ lệ tinh anh/thủ lĩnh.
 *  { id, nameEn, nameVi, tiers:[min,max] gợi ý, palette:{sky,far,ground,edge} cho nền runtime,
 *    eliteChance, alphaChance, weights?:{speciesId:n}, lord?: id loài chúa vùng (spawn:false), mood }
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.biomes = {
  grave_hills:  { nameEn:'Grave Hills',   nameVi:'Đồi Mộ',        tiers:[0,5], palette:{ sky:'#10202b', far:'#1b333a', ground:'#3c4b46', edge:'#789484' },
                  eliteChance:.08, alphaChance:.02, weights:{ grave_rat:14, carrion_crow:12, feral_ghoul:12, bone_dragon:3 },
                  mood:'Nghĩa địa đổi chủ; hoang hồn và thú ăn xác. Map thử nghiệm hiện tại.' },
  moss_forest:  { nameEn:'Mossy Wood',    nameVi:'Rừng Rêu',      tiers:[0,3], palette:{ sky:'#0f2219', far:'#1d3a26', ground:'#3d4a32', edge:'#7fa36a' },
                  eliteChance:.08, alphaChance:.03, weights:{ dire_wolf:14, moss_slime:14, tusk_boar:12, rot_treant:4 },
                  mood:'Rừng ẩm, thú thật và thảo yêu; nơi học đọc telegraph cơ bản.' },
  venom_marsh:  { nameEn:'Venom Marsh',   nameVi:'Đầm Độc',       tiers:[1,4], palette:{ sky:'#141d1a', far:'#24342a', ground:'#36402f', edge:'#8fd14f' },
                  eliteChance:.1,  alphaChance:.03, weights:{ spore_cap:14, snap_vine:12, gloom_basilisk:4 },
                  mood:'Mọi thứ gây Độc; Ánh Sáng/Lửa có lợi.' },
  crystal_cave: { nameEn:'Crystal Cave',  nameVi:'Hang Tinh Thể', tiers:[0,4], palette:{ sky:'#0d1424', far:'#1d2440', ground:'#38394f', edge:'#a8b8ff' },
                  eliteChance:.1,  alphaChance:.03, weights:{ cave_bat:14, bone_beetle:12, crystal_golem:12 },
                  mood:'Hang tối, quái phục kích từ trần; tinh linh và cơ giới.' },
  ash_peak:     { nameEn:'Ash Peak',      nameVi:'Núi Tro',       tiers:[1,5], palette:{ sky:'#1f1210', far:'#3a1f19', ground:'#4a3a33', edge:'#e06a2a' },
                  eliteChance:.12, alphaChance:.04, weights:{ ember_fox:12, imp:12, ash_drake:12 },
                  mood:'Núi lửa ngủ; long tộc non, yêu ma và ma thú lửa. Nước/Băng có lợi.' },
  storm_spire:  { nameEn:'Storm Spire',   nameVi:'Đỉnh Bão',      tiers:[2,5], palette:{ sky:'#121a26', far:'#253247', ground:'#3e4654', edge:'#f5e663' },
                  eliteChance:.12, alphaChance:.05, weights:{ sky_wyvern:12, gale_griffin:10, thunder_ram:12, thunderbird:3 },
                  lord:'elder_dragon', mood:'Vách đá giữa mây; quái bay và sét. Cổ Long là chúa vùng (sự kiện, chưa sinh ngẫu nhiên).' }
};

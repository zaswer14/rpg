/* PHẦN CHUNG — ĐỊA HÌNH. Dữ liệu địa hình dùng được cho mọi game có bản đồ ô (hiện có Vạn Kiếp dùng).
 * Gồm: độ lệch độ cao / độ ẩm / nhiệt và độ hoang nền theo biome, 7 đặc trưng ô (chi phí đi, độ hoang), quái theo đặc trưng.
 * Biome: 6 vùng săn của bestiary/biomes.js + 10 biome của terrain/ecology.js. Thiết kế: vankiep/docs/03 mục 2.
 * Game đọc qua JobLibrary.terrain = { biomes, features, featureSpawn } (Vạn Kiếp gán lại thành G.TERRAIN, G.FEATURES, G.FEATURE_SPAWN
 * trong vankiep/data/world.js).
 */
window.JobLibrary = window.JobLibrary || {};
(function (L) {
  const G = {};
  // ── ĐỊA HÌNH theo biome (vankiep/docs/03 mục 2): độ lệch cộng vào trường độ cao / độ ẩm / nhiệt trước khi chuẩn hóa,
  // đặc trưng biome không có (no), biome rừng (forest: ô ẩm vừa cũng thành rừng), độ hoang nền (wild, ≤ .8 để sát làng vẫn còn tầng ven).
  // Độ lệch được làm mượt qua biên vùng.
  G.TERRAIN = {
    golden_plains: { elev:-.10, moist:0,    temp:0,    no:['mountain','marsh'], wild:0 },
    moss_forest:   { elev:0,    moist:.25,  temp:0,    no:[], forest:true, wild:.2 },
    fae_glade:     { elev:-.05, moist:.25,  temp:.05,  no:[], forest:true, wild:.3 },
    mist_coast:    { elev:-.05, moist:.15,  temp:0,    no:[], wild:.2 },
    serpent_bay:   { elev:-.10, moist:.20,  temp:.15,  no:[], wild:.5 },
    elder_wood:    { elev:.05,  moist:.25,  temp:0,    no:[], forest:true, wild:.2 },
    frost_tundra:  { elev:0,    moist:0,    temp:-.30, no:['jungle','marsh'], wild:.5 },
    crystal_cave:  { elev:.20,  moist:0,    temp:0,    no:[], wild:.4 },
    storm_spire:   { elev:.30,  moist:.05,  temp:-.15, no:['jungle','marsh'], wild:.7 },
    ash_peak:      { elev:.20,  moist:-.20, temp:.30,  no:['forest','jungle'], wild:.5 },
    wind_steppe:   { elev:0,    moist:-.20, temp:0,    no:[], wild:.1 },
    forge_ruins:   { elev:.05,  moist:-.10, temp:.10,  no:['forest','jungle'], wild:.4 },
    red_desert:    { elev:0,    moist:-.45, temp:.30,  no:['forest','jungle','marsh','lake'], wild:.4 },
    venom_marsh:   { elev:-.20, moist:.35,  temp:.10,  no:['mountain'], wild:.4 },
    grave_hills:   { elev:.05,  moist:0,    temp:0,    no:['jungle'], wild:.3 },
    abyss_rift:    { elev:-.05, moist:-.10, temp:.10,  no:['forest','jungle','lake'], wild:.8 }
  };

  // ── ĐẶC TRƯNG Ô (vankiep/docs/03 mục 2.4). cost: chi phí đi bộ (lãnh thổ, tỉnh, độ hoang); wild: cộng vào độ hoang của ô.
  // Thứ tự = mã lưu trong map.feat.
  G.FEATURES = [
    { id:'open',     nameVi:'Đồng trống', cost:1,   wild:0 },
    { id:'hills',    nameVi:'Đồi',        cost:2,   wild:.10 },
    { id:'forest',   nameVi:'Rừng',       cost:2,   wild:.15 },
    { id:'jungle',   nameVi:'Rừng rậm',   cost:3.5, wild:.30 },
    { id:'marsh',    nameVi:'Đầm',        cost:4,   wild:.25 },
    { id:'mountain', nameVi:'Núi',        cost:8,   wild:.35 },
    { id:'lake',     nameVi:'Hồ',         cost:Infinity, wild:0 }
  ];

  // Quái theo địa hình: nhân trọng số loài ĐÃ có trong bảng của tầng (không thêm loài, nên không phá luật Tier).
  G.FEATURE_SPAWN = {
    hills:    { behavior:{ charger:1.3 } },
    forest:   { behavior:{ ambusher:1.4 }, family:{ beast:1.2, plant:1.2 } },
    jungle:   { behavior:{ ambusher:1.8, flyer:.7 }, family:{ insect:1.5, plant:1.5 } },
    marsh:    { behavior:{ rooted:1.3 }, family:{ ooze:1.5, plant:1.5 } },
    mountain: { behavior:{ flyer:1.5 }, family:{ dragon:1.3, avian:1.3 } }
  };

  L.terrain = { biomes: G.TERRAIN, features: G.FEATURES, featureSpawn: G.FEATURE_SPAWN };
})(window.JobLibrary);

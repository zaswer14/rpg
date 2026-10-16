/* Vạn Kiếp — CÂY NGHỀ RIÊNG (docs/10): lớp đè lên thư viện nghề chung (shared/trunk.js, races, faiths), truyền vào
 * JobLibrary.compose({ overlay: G.JOB_TREE }) ở life.js G.init. Thư viện nghề và Skeleton Codex không đổi.
 *
 * Người dùng (16/10/2026): lên Tier giờ khó hơn nhiều (docs/09), nên Tier 1 phải rộng hơn, và nghề phải đặt đúng nghĩa Tier:
 *   Tier 1 Chức Nghiệp Giả là nghề có danh phận (lính, kỵ sĩ, thợ săn, thầy lang…), Tier 2 Siêu Phàm Giả là tinh anh.
 *   - add: 13 nghề Tier 1 mới (đủ 8 trường phái; Dã thú trước không có Tier 1, Tử thuật không có Tier 1),
 *          2 nghề Tier 2 (Trọng Kỵ Sĩ, Thú Sư), 1 nghề Tier 3 (Kỵ Sĩ Đoàn Trưởng) cho đường kỵ sĩ và đường thú;
 *   - set.addFrom: nghề Tier 2 của thân chung nhận thêm tiền nhiệm Tier 1 mới, nên mỗi nghề Tier 1 mới đều có lối lên;
 *   - set.nameVi: đổi tên nghề có tên nghe như nghề thường mà đang ở tầng tinh anh trở lên (Vệ Binh → Cận Vệ, Thợ Săn → Thợ Săn Quái,
 *     Sơn Tặc → Cường Đạo…), nhường tên cũ cho nghề Tier 1.
 * req chỉ dùng mastery của trường phái nghề đó (Kỵ Sĩ không đòi Cưỡi thú: Người Lùn, Cơ Nhân bị cấm Dã thú).
 * gate: null thì dùng kỹ năng tạm `<id>#g1`, `#g2` (cult.js G.gatePair); tên, mô tả ở data/skills.js.
 */
window.LifeSim = window.LifeSim || {};
(function (G) {
  const T1 = (id, school, nameVi, nameEn, role, req, trial, summary) => ({ id, tier: 1, school, role, from: ['@origin'], gate: null, req, trial, nameEn, nameVi, legacy: null, summary });
  G.JOB_TREE = {
    add: [
      // ── Tier 1 mới: nghề có danh phận, vào thẳng từ xuất thân ──
      T1('pikeman', 'combat', 'Lính Giáo', 'Pikeman', 'Soldier', { Spear: 10 }, 'Drill trial', 'Lính giáo trong hàng quân: đứng vững, giữ khoảng cách, chặn ngựa.'),
      T1('knight', 'combat', 'Kỵ Sĩ', 'Knight', 'Cavalry', { Sword: 10 }, 'Accolade', 'Chiến binh cưỡi ngựa đã tuyên thệ với một lãnh chúa; mũi nhọn của đội kỵ.'),
      T1('crossbowman', 'ranged', 'Lính Nỏ', 'Crossbowman', 'Ranged', { Crossbow: 10 }, 'Volley drill', 'Lính nỏ giữ tường thành và đoàn xe: chậm mà xuyên giáp.'),
      T1('trapper', 'ranged', 'Thợ Săn', 'Huntsman', 'Hunter', { Bow: 10 }, 'First hunt', 'Săn thú, đặt bẫy, đọc dấu chân; sống ở bìa rừng, bán da và thịt.'),
      T1('scout', 'shadow', 'Trinh Sát', 'Scout', 'Scout', { Stealth: 10 }, 'Recon trial', 'Đi trước đoàn quân, đoàn buôn: nhìn thấy trước khi bị thấy.'),
      T1('brigand', 'shadow', 'Sơn Tặc', 'Brigand', 'Bandit', { Dagger: 6, Axe: 6 }, 'Road toll', 'Chặn đường, đòi mãi lộ; sống ngoài luật trong rừng núi.'),
      T1('hedge_witch', 'arcane', 'Phù Thủy Làng', 'Hedge Witch', 'Caster', { Arcane: 10 }, 'Kitchen hex', 'Bùa ngải, thuốc bói, câu chú giữ nhà; dân làng vừa nhờ vừa sợ.'),
      T1('gravekeeper', 'death', 'Người Giữ Mộ', 'Gravekeeper', 'Warden', { Necromancy: 8 }, 'Night watch', 'Canh nghĩa địa, đặt người chết nằm yên; biết cái chết nói gì.'),
      T1('spirit_caller', 'death', 'Thầy Đồng', 'Spirit Caller', 'Support', { Soul: 8 }, 'First trance', 'Gọi vong, hỏi tổ tiên, xem ngày; cầu nối giữa người sống và người chết.'),
      T1('herbalist', 'craft', 'Thầy Lang', 'Herbalist', 'Healer', { Alchemy: 10 }, 'First remedy', 'Hái thuốc, bó xương, nấu cao; làng nào cũng cần một người.'),
      T1('wrestler', 'martial', 'Đô Vật', 'Wrestler', 'Bruiser', { Body: 10 }, 'Ring trial', 'Vật ở hội làng, khiêng cột đình; thân thể là vũ khí.'),
      T1('ascetic', 'martial', 'Khổ Tu', 'Ascetic', 'Monk', { Spirit: 10 }, 'Fasting trial', 'Nhịn đói, ngồi thiền, đi chân trần; luyện hơi thở trước khi luyện quyền.'),
      T1('tamer', 'beast', 'Thuần Thú Sư', 'Tamer', 'Tamer', { Taming: 10 }, 'Bond trial', 'Thuần chó săn, chim ưng, ngựa chiến; thú nghe lời hơn người.'),
      // ── Tier 2, Tier 3 mới: đường kỵ sĩ và đường thú ──
      { id: 'lancer', tier: 2, school: 'combat', role: 'Cavalry', from: ['knight'], gate: null, req: { Spear: 25, Sword: 15 }, trial: 'Joust', nameEn: 'Lancer', nameVi: 'Trọng Kỵ Sĩ', legacy: null, summary: 'Kỵ sĩ giáp nặng, thương dài; một đợt xung phong phá vỡ hàng bộ binh.' },
      { id: 'beastmaster', tier: 2, school: 'beast', role: 'Tamer', from: ['tamer', 'trapper'], gate: null, req: { Taming: 30, Riding: 15 }, trial: 'Pack trial', nameEn: 'Beastmaster', nameVi: 'Thú Sư', legacy: null, summary: 'Chỉ huy một bầy thú đã thuần; đánh trận cùng bầy.' },
      { id: 'knight_captain', tier: 3, school: 'combat', role: 'Commander', from: ['lancer'], gate: null, req: { Spear: 50, Sword: 35 }, trial: 'Charge trial', nameEn: 'Knight Captain', nameVi: 'Kỵ Sĩ Đoàn Trưởng', legacy: null, summary: 'Cầm đầu một đoàn kỵ sĩ; tên được ghi trong sổ quân của triều đình.' }
    ],
    set: {
      // Tier 2 của thân chung: thêm tiền nhiệm Tier 1 mới; đổi tên nghề nghe như nghề thường.
      guard: { addFrom: ['pikeman'], nameVi: 'Cận Vệ' },
      duelist: { addFrom: ['knight'] },
      marksman: { addFrom: ['crossbowman'], nameVi: 'Xạ Thủ' },
      hunter: { addFrom: ['trapper', 'tamer'], nameVi: 'Thợ Săn Quái' },
      assassin: { addFrom: ['scout'] },
      bandit: { addFrom: ['brigand'], nameVi: 'Cường Đạo' },
      elementalist: { addFrom: ['hedge_witch'] },
      medium: { addFrom: ['spirit_caller'] },
      necromancer: { addFrom: ['gravekeeper'] },
      alchemist: { addFrom: ['herbalist'] },
      shaper: { addFrom: ['wrestler'], nameVi: 'Luyện Thể Sư' },
      monk: { addFrom: ['ascetic'], nameVi: 'Võ Tăng' },   // "Tu sĩ" là sinh kế (G.WORKS.priest)
      // Tier 3 trở lên: tên cho đúng tầm Siêu Việt Giả; đường kỵ sĩ, đường thú nối vào.
      sniper: { nameVi: 'Thiện Xạ' },   // đổi chỗ với marksman: "Thiện Xạ" nghe cao hơn "Xạ Thủ"
      stalker: { nameVi: 'Ảnh Hành Giả' },
      warlock: { nameVi: 'Ma Đạo Sư' },
      artificer: { nameVi: 'Đại Kỹ Sư' },
      beast_rider: { addFrom: ['beastmaster'] },
      paladin: { addFrom: ['lancer'] },
      marshal: { addFrom: ['knight_captain'] },
      dragon_knight: { addFrom: ['knight_captain'], optional: true },
      sellsword: { nameVi: 'Đoàn Trưởng Dong Binh', optional: true }   // ngọn riêng của Nhân Loại, Tier 3
    },
    // Chế độ tự động chọn hướng đi trong cùng trường phái (cult.js G.skDir): nghề nào hợp với đời này hơn.
    // Hàm trả 0–1 theo sinh kế, xuất thân, lý lịch; nghề không có ở đây là 0. Không có bảng này thì máy luôn chọn nghề đứng đầu danh sách.
    lean: {
      knight: S => (S.roles && S.roles.noble) || (S.flags && (S.flags.house || S.flags.royal)) ? 1 : S.q >= 4 ? .5 : 0,
      pikeman: S => (S.flags && (S.flags.served || S.flags.soldier)) ? .8 : S.work === 'guard' ? .6 : 0,
      crossbowman: S => (S.flags && S.flags.served) ? .6 : S.work === 'guard' ? .5 : 0,
      fighter: S => S.work === 'adventurer' || S.work === 'guard' ? .5 : 0,
      trapper: S => S.work === 'hunter' ? 1 : S.work === 'woodcutter' ? .5 : 0,
      archer: S => S.work === 'adventurer' ? .4 : 0,
      tamer: S => S.work === 'herder' ? 1 : S.work === 'hunter' ? .4 : 0,
      scout: S => S.work === 'adventurer' || S.work === 'sailor' ? .5 : 0,
      brigand: S => S.work === 'thief' || (S.flags && S.flags.wanted) ? 1 : S.q <= 1 ? .3 : 0,
      rogue: S => S.work === 'thief' ? .6 : 0,
      hedge_witch: S => S.urban ? 0 : .5,
      adept: S => S.work === 'scholar' ? .8 : 0,
      gravekeeper: S => S.undead ? .8 : S.work === 'priest' ? .3 : 0,
      spirit_caller: S => S.work === 'priest' || S.faith === 'ancestor' ? .8 : 0,
      herbalist: S => S.work === 'healer' ? 1 : S.work === 'farmer' ? .3 : 0,
      tinkerer: S => S.work === 'smith' || S.work === 'miner' ? .7 : 0,
      wrestler: S => S.work === 'farmer' || S.work === 'miner' || S.work === 'woodcutter' ? .5 : 0,
      ascetic: S => S.work === 'priest' || S.aim === 'faith' ? .8 : 0,
      brawler: S => S.work === 'sailor' || S.work === 'fisher' ? .4 : 0,
      lancer: S => (S.roles && S.roles.noble) ? .5 : 0,
      beastmaster: S => S.work === 'herder' || S.work === 'hunter' ? .5 : 0
    },
    displayNames: {
      skeleton: {
        bandit: { en: 'Grave Bandit', vi: 'Cường Đạo Hầm Mộ' },
        stalker: { en: 'Shade Stalker', vi: 'Ảnh Hành Giả Bóng Tối' },
        sniper: { en: 'Bone Sniper', vi: 'Thiện Xạ Xương' },
        artificer: { en: 'Bone Artificer', vi: 'Đại Kỹ Sư Xương' },
        hunter: { en: 'Grave Hunter', vi: 'Thợ Săn Quái Hầm Mộ' }
      }
    }
  };
})(window.LifeSim);

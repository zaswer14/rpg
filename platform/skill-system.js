/* Skeleton Codex V12 — Skill Library & 5-rank mastery, Roles & Elements simulator (offline, no dependencies).
 * V12 balance patch: 147 skill, gate mới, pool gacha theo nhánh, giá quay theo Tier, thưởng stat theo nguồn sức mạnh.
 * All sample numbers, skills and requirements are design proposals, not balance locks.
 */
(() => {
'use strict';
const S = (id, name, tier, kind, access, desc, r = {}) => ({
  id, name, tier, kind, access, desc, jobs:r.jobs||[], domains:r.domains||[],
  lineage:r.lineage||'', mastery:r.mastery||'', level:r.level||0,
  weapons:r.weapons||[], cost:r.cost||'—', cooldown:r.cooldown??0,
  tags:r.tags||[], combo:r.combo||'', aerial:!!r.aerial,
  roles:r.roles||[], method:r.method||'martial', element:r.element||'neutral',
  elements:r.elements||[], hits:r.hits||[], statuses:r.statuses||[], attunement:r.attunement||null,
  unlock:r.unlock||'', animation:r.animation||'', rankRewards:r.rankRewards||null,
  masteryGain:r.masteryGain||null, // V12: mastery nhận khi dùng skill; null = suy ra từ weapons/method/element
  summonType:r.summonType||null, summonCount:r.summonCount||1 // V12.2: turret | ranged | melee | hound; null = suy ra từ tags
});
const SKILLS = [
  // TIER 0 — basic neutral abilities; every job can retain these later.
  S('bone_dash','Bone Dash',0,'active','universal','Lướt ngang ngắn, né đòn đúng thời điểm để nối chuỗi.',{cost:'18 Stamina',cooldown:5,tags:['Movement','Dodge Cancel']}),
  S('bone_leap','Bone Leap',0,'active','universal','Bật nhảy bổ trợ để vượt địa hình hoặc tiếp cận.',{cost:'16 Stamina',cooldown:7,tags:['Movement','Air'],aerial:true}),
  S('loose_bone','Loose Bone Toss',0,'active','universal','Ném mảnh xương làm gián đoạn mục tiêu nhỏ.',{cost:'12 Stamina',cooldown:4,tags:['Projectile','Starter']}),
  S('brace','Brace',0,'active','universal','Giữ thế trong khoảnh khắc để giảm đẩy lùi.',{cost:'12 Stamina',cooldown:7,tags:['Guard','Defense']}),
  S('quick_recover','Quick Recovery',0,'active','universal','Hồi phục tư thế nhanh sau khi tiếp đất.',{cost:'15 Stamina',cooldown:9,tags:['Recovery','Movement']}),
  S('balanced_frame','Balanced Frame',0,'passive','universal','Giảm đôi chút thời gian mất thăng bằng khi đáp xuống.',{tags:['Mobility']}),
  S('scavenger_eye','Scavenger Eye',0,'passive','universal','Phát hiện các vật phẩm thu thập ở lối rẽ gần.',{tags:['Exploration']}),
  S('light_bones','Light Bones',0,'passive','universal','Tăng nhẹ khả năng điều khiển hướng khi đang trên không.',{tags:['Air']}),

  // V7 TIER 0 — weapon starters. Restricted controls discipline; all are available to Wanderer.
  S('cracked_slash','Cracked Slash',0,'active','restricted','Chém ngang kiếm sứt, nhanh vừa, đánh trúng trước mặt; nối sau Normal 1.',{domains:['origin','combat','shadow'],weapons:['sword'],cost:'13 Stamina',cooldown:4,roles:['attack'],tags:['Sword','Side Slash','Linker'],combo:'Normal 1 → Cracked Slash',animation:'Chém ngang · 0.18/0.09/0.24s',unlock:'Tập kiếm gỗ'}),
  S('rising_chip','Rising Chip',0,'active','restricted','Vung kiếm từ thấp lên cao, hất kẻ địch nhỏ; hiệu quả lên boss giảm.',{domains:['origin','combat','shadow'],weapons:['sword'],cost:'20 Stamina',cooldown:8,roles:['attack','control'],statuses:['stagger'],tags:['Sword','Uppercut','Launch'],combo:'Normal 2 → Rising Chip → Air Normal',animation:'Chém hất lên · 0.26/0.09/0.33s',unlock:'Tập kiểm soát nhịp kiếm'}),
  S('stone_throw','Stone Throw',0,'active','universal','Nhặt và ném một hòn đá theo đường cong ngắn; kỹ thuật tầm xa đầu tiên, không dùng cung.',{cost:'10 Stamina',cooldown:4,roles:['attack'],tags:['Thrown Stone','Projectile','Starter'],combo:'Normal Throw → Stone Throw',animation:'Vung tay ném · 0.22/0.07/0.27s',unlock:'Tập nhặt và ném đá'}),
  S('aimed_stone','Aimed Stone',0,'active','universal','Ngắm kỹ và ném đá tầm xa hơn, có thể hơi khựng mục tiêu nhỏ; nhịp chậm hơn Stone Throw.',{cost:'16 Stamina',cooldown:7,roles:['attack','control'],statuses:['stagger'],tags:['Thrown Stone','Charged','Precision'],combo:'Stone Throw → di chuyển → Aimed Stone (khi đã mở thêm slot)',animation:'Ngắm rồi ném · 0.38/0.08/0.36s',unlock:'Bia tập ném đá chính xác'}),
  S('needle_stab','Needle Stab',0,'active','restricted','Đâm dao ngắn với startup nhanh, lợi khi kết thúc Normal đúng khoảng cách.',{domains:['origin','shadow'],weapons:['dagger'],cost:'12 Stamina',cooldown:4,roles:['attack'],tags:['Dagger','Thrust','Linker'],combo:'Normal 2 → Needle Stab',animation:'Đâm tầm gần · 0.13/0.06/0.19s',unlock:'Thử thách dao găm'}),
  S('cracked_axe','Cracked Axe Slam',0,'active','restricted','Bổ rìu nặng theo cung cao xuống thấp, gây mất thăng bằng nhưng dễ bị ngắt.',{domains:['origin','combat'],weapons:['axe'],cost:'25 Stamina',cooldown:9,roles:['attack','control'],statuses:['stagger'],tags:['Axe','Overhead','Heavy'],combo:'Normal Heavy → Axe Slam',animation:'Bổ từ trên xuống · 0.39/0.11/0.38s',unlock:'Bài tập rìu nặng'}),
  S('spear_jab','Spear Jab',0,'active','restricted','Đâm thẳng đầu thương ra xa, trúng một mục tiêu và giữ khoảng cách.',{domains:['origin','combat'],weapons:['spear'],cost:'14 Stamina',cooldown:5,roles:['attack'],tags:['Spear','Thrust','Range'],combo:'Normal Thrust → Spear Jab',animation:'Đâm thẳng · 0.20/0.07/0.27s',unlock:'Sân tập thương'}),
  S('shield_nudge','Shield Nudge',0,'active','restricted','Đẩy khiên cự ly ngắn để giảm áp lực, gây ít sát thương và stagger nhẹ.',{domains:['origin','combat'],weapons:['shield'],cost:'16 Stamina',cooldown:8,roles:['defense','attack'],hits:[{type:'physical',element:'neutral',share:100}],statuses:['stagger'],tags:['Shield','Interrupt'],combo:'Normal 1 → Shield Nudge',animation:'Húc khiên · 0.20/0.11/0.32s',unlock:'Tập giữ khiên'}),
  S('focus_pulse','Worn Focus Pulse',0,'active','restricted','Phóng xung phép trung tính từ pháp khí rạn nứt; phép không nhất thiết có nguyên tố.',{domains:['origin','death','elemental','arcane'],weapons:['focus'],cost:'10 Mana',cooldown:5,roles:['attack'],method:'magic',tags:['Focus','Projectile'],combo:'Normal Cast → Focus Pulse',animation:'Thi triển · 0.29/0.06/0.24s',unlock:'Pháp khí cũ'}),
  S('junk_snare','Junk Snare',0,'active','restricted','Đặt bẫy dây vụn trên mặt đất gây chậm rất ngắn, không gây sát thương.',{domains:['origin','craft','shadow'],weapons:['tool'],cost:'16 Stamina',cooldown:13,roles:['control','utility'],method:'tech',statuses:['root'],tags:['Trap','Ground','Setup'],animation:'Quỳ đặt bẫy · 0.30/0.08/0.30s',unlock:'Nhặt vật liệu + hướng dẫn bẫy'}),
  S('bone_dive','Bone Dive',0,'active','universal','Lao chéo xuống khi đang trên không; trúng địch nhỏ gây hitstop, tiếp đất có recovery.',{cost:'19 Stamina',cooldown:9,roles:['attack','mobility'],tags:['Air','Dive','Finisher'],aerial:true,combo:'Jump → Air Normal → Bone Dive',animation:'Lao xuống · 0.18/0.12/0.36s',unlock:'Thử thách di chuyển trên không'}),
  S('quiet_tread','Quiet Tread',0,'passive','universal','Giảm nhẹ tiếng động lúc di chuyển chậm, thuận lợi khi tiếp cận quái cảnh giới.',{roles:['utility','mobility'],tags:['Stealth','Exploration'],unlock:'Quan sát quái tuần tra'}),
  S('ragged_persistence','Ragged Persistence',0,'passive','universal','Sau khi bị đánh lùi, giảm nhẹ thời gian phục hồi tư thế; có giới hạn hồi nội bộ.',{roles:['defense'],tags:['Recovery','Poise'],unlock:'Thử thách sống sót'}),
  S('wanderer_improvise','Wanderer Improvisation',0,'active','exclusive','Đòn ứng biến bằng vũ khí đang cầm, nhịp vụng về nhưng linh hoạt; chỉ nghề Wanderer sử dụng.',{jobs:['Wanderer'],cost:'15 Stamina',cooldown:7,roles:['attack','utility'],tags:['Starter','Improvisation'],combo:'Normal 1 → Improvisation',animation:'Ứng biến · 0.25/0.10/0.31s',unlock:'Thưởng mở đầu Tier 0'}),
  S('first_footfall','First Footfall',0,'passive','lineage','Bài học di chuyển từ Wanderer: điều khiển hướng một chút trong lúc rơi; có thể kế thừa theo nhánh.',{lineage:'Wanderer',roles:['mobility'],tags:['Lineage','Air Control'],unlock:'Vượt hang động đầu tiên'}),
  // V7 TIER 0 — small, learnable elemental seeds, no forced element/job identity.
  S('frost_fleck','Frost Fleck',0,'active','universal','Mảnh băng nhỏ tạo Chill nhẹ; không đóng băng tức thì.',{cost:'10 Mana',cooldown:6,roles:['attack','control'],method:'magic',element:'ice',statuses:['chill'],tags:['Projectile','Starter'],animation:'Tụ băng · 0.26/0.06/0.28s',unlock:'Cuộn phép Băng sơ cấp'}),
  S('static_snap','Static Snap',0,'active','universal','Tia điện ngắn trước mặt; có thể tăng tích lũy Shock nếu mục tiêu đã Wet.',{cost:'11 Mana',cooldown:7,roles:['attack','control'],method:'magic',element:'lightning',statuses:['shock'],tags:['Short Range','Starter'],animation:'Chớp điện · 0.23/0.06/0.29s',unlock:'Cuộn phép Sét sơ cấp'}),
  S('wind_puff','Wind Puff',0,'active','universal','Luồng gió nhỏ đẩy mục tiêu nhẹ lùi lại; không gây sát thương trực tiếp.',{cost:'9 Mana',cooldown:8,roles:['control','mobility'],method:'magic',element:'wind',tags:['Push','Spacing'],animation:'Thổi gió · 0.22/0.10/0.25s',unlock:'Cuộn phép Gió sơ cấp'}),
  S('pebble_knock','Pebble Knock',0,'active','universal','Hất một viên đá từ đất lên theo cung thấp, sát thương phép Đất nhỏ.',{cost:'10 Mana',cooldown:7,roles:['attack'],method:'magic',element:'earth',tags:['Projectile','Arc'],animation:'Gọi đá · 0.30/0.08/0.30s',unlock:'Cuộn phép Đất sơ cấp'}),
  S('pale_glimmer','Pale Glimmer',0,'active','universal','Tạo tia sáng che chắn thoáng chốc và giảm một tầng Curse yếu; không hồi HP.',{cost:'13 Mana',cooldown:17,roles:['defense','support'],method:'magic',element:'light',statuses:['barrier','purify'],tags:['Cleanse','Barrier'],animation:'Đưa tay lên · 0.32/0.04/0.30s',unlock:'Cuộn phép Ánh sáng sơ cấp'}),
  S('shade_mote','Shade Mote',0,'active','universal','Đốm bóng tối bay chậm gây lượng sát thương phép nhỏ, chưa tạo lời nguyền mạnh.',{cost:'10 Mana',cooldown:6,roles:['attack'],method:'magic',element:'dark',tags:['Projectile','Starter'],animation:'Tụ bóng · 0.29/0.08/0.27s',unlock:'Cuộn phép Bóng tối sơ cấp'}),
  S('sprout_grasp','Sprout Grasp',0,'active','universal','Mầm cây vươn lên níu chân mục tiêu nhỏ trong thời gian ngắn; không gây damage.',{cost:'11 Mana',cooldown:13,roles:['control','utility'],method:'magic',element:'nature',statuses:['root'],tags:['Ground','Bind'],animation:'Chạm đất · 0.35/0.08/0.30s',unlock:'Cuộn phép Tự nhiên sơ cấp'}),
  S('water_veil','Water Veil',0,'active','universal','Màng nước mỏng hấp thụ lượng sát thương nhỏ trong thoáng chốc, không tự hồi HP.',{cost:'13 Mana',cooldown:14,roles:['defense'],method:'magic',element:'water',statuses:['barrier'],tags:['Barrier','Timing'],animation:'Tạo màn nước · 0.30/0.06/0.26s',unlock:'Cuộn phép Nước sơ cấp'}),
  // TIER 1 — common techniques, discipline-limited and true profession-exclusive.
  S('forward_roll','Forward Roll',1,'active','universal','Lăn qua khe hẹp, có thể hủy một số recovery được phép.',{cost:'20 Stamina',cooldown:6,tags:['Movement','Dodge Cancel']}),
  S('air_step','Air Step',1,'active','universal','Đổi hướng một lần trên không, không tạo thêm cú nhảy.',{cost:'18 Stamina',cooldown:9,tags:['Air','Movement'],aerial:true}),
  S('last_stand','Last Stand',1,'passive','universal','Cho một lượng poise nhỏ khi HP thấp, có thời gian hồi nội bộ.',{tags:['Survival']}),
  S('sword_cleave','Sword Cleave',1,'active','restricted','Chém ngang kiểm soát không gian cận chiến.',{domains:['combat','shadow'],weapons:['sword'],mastery:'Sword',level:15,cost:'22 Stamina',cooldown:5,tags:['Slash','Starter'],combo:'Normal 2 → Sword Cleave'}),
  S('shield_tap','Shield Tap',1,'active','restricted','Hất khiên ngắn có thể cắt đòn của kẻ địch yếu.',{domains:['combat'],weapons:['shield'],mastery:'Shield',level:10,cost:'15 Stamina',cooldown:6,tags:['Guard','Interrupt'],combo:'Brace → Shield Tap'}),
  S('aimed_shot','Aimed Shot',1,'active','restricted','Gồng dây cung cho phát bắn mạnh hơn; giảm tốc độ di chuyển.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:10,cost:'16 Stamina',cooldown:4,tags:['Projectile','Charged']}),
  S('knife_feint','Knife Feint',1,'active','restricted','Bước lùi lừa nhịp, mở cửa sổ phản kích khi đối thủ vung hụt.',{domains:['shadow'],weapons:['dagger'],mastery:'Dagger',level:10,cost:'16 Stamina',cooldown:6,tags:['Counter','Movement']}),
  S('soul_spark','Soul Spark',1,'active','restricted','Bắn đạn Soul nhỏ để duy trì combo từ xa.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:10,cost:'10 Soul',cooldown:3,tags:['Projectile','Linker']}),
  S('scrap_mine','Scrap Mine',1,'active','restricted','Đặt bẫy chậm kích hoạt, mạnh ở vị trí hẹp.',{domains:['craft'],weapons:['tool'],mastery:'Engineering',level:10,cost:'15 Stamina',cooldown:12,tags:['Trap','Setup']}),
  S('firm_grip','Firm Grip',1,'passive','restricted','Giảm mức hao Stamina của combo kiếm liên tiếp.',{domains:['combat'],weapons:['sword'],mastery:'Sword',level:20,tags:['Sword']}),
  S('rough_three_cut','Rough Three-Cut',1,'active','exclusive','Ba đòn chém thô nhưng chắc, kỹ thuật riêng của Bone Fighter.',{jobs:['Bone Fighter'],weapons:['sword'],cost:'28 Stamina',cooldown:7,tags:['Slash','Multi-hit']}),
  S('split_arrow','Split Arrow',1,'active','exclusive','Hai mũi tên chia góc ở cự ly vừa.',{jobs:['Skeleton Archer'],weapons:['bow'],cost:'25 Stamina',cooldown:10,tags:['Projectile','Spread']}),
  S('shadow_slip','Shadow Slip',1,'active','exclusive','Lướt thấp vượt sau mục tiêu đang mở sơ hở.',{jobs:['Bone Rogue'],weapons:['dagger'],cost:'24 Stamina',cooldown:10,tags:['Movement','Backstab']}),
  S('grave_chant','Grave Chant',1,'active','exclusive','Kênh phép ngắn để tạo thêm Soul sau đòn trúng.',{jobs:['Bone Acolyte'],weapons:['focus'],cost:'12 Soul',cooldown:14,tags:['Resource','Setup']}),
  S('pocket_turret','Pocket Turret',1,'active','exclusive','Triển khai trụ xương nhỏ, tồn tại trong thời gian ngắn.',{jobs:['Bone Tinkerer'],weapons:['tool'],cost:'20 Stamina',cooldown:16,tags:['Summon','Setup']}),
  // TIER 2 — specialize without imposing a maximum learned skill count.
  S('guard_counter','Guard Counter',2,'active','restricted','Phản đòn khi chặn đúng lúc; gây stagger cao.',{domains:['combat'],weapons:['shield'],mastery:'Shield',level:30,cost:'22 Stamina',cooldown:8,tags:['Counter','Guard'],combo:'Brace → Guard Counter → Sword Cleave'}),
  S('leaping_strike','Leaping Strike',2,'active','restricted','Nhảy bổ xuống kẻ địch, tạo điểm kết thúc combo trên không.',{domains:['combat','shadow'],weapons:['sword','axe','dagger'],cost:'28 Stamina',cooldown:9,tags:['Air','Finisher'],aerial:true}),
  S('armor_rend','Armor Rend',2,'active','restricted','Chém nặng làm giảm giáp tạm thời.',{domains:['combat','shadow'],weapons:['axe'],mastery:'Axe',level:30,cost:'30 Stamina',cooldown:10,tags:['Armor Break','Heavy']}),
  S('volley','Arrow Volley',2,'active','restricted','Bắn loạt mũi tên chế áp vùng phía trước.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:30,cost:'30 Stamina',cooldown:12,tags:['Projectile','AoE']}),
  S('ankle_trap','Ankle Trap',2,'active','restricted','Bẫy làm chậm kẻ địch chạy qua.',{domains:['ranged','shadow','craft'],mastery:'Stealth',level:15,cost:'18 Stamina',cooldown:13,tags:['Trap','Control']}),
  S('soul_bind','Soul Bind',2,'active','restricted','Giữ chân mục tiêu nhỏ để mở combo phối hợp.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:30,cost:'26 Soul',cooldown:13,tags:['Control','Linker']}),
  S('turret_repair','Field Repair',2,'active','restricted','Sửa thiết bị hoặc công trình gần nhân vật.',{domains:['craft'],weapons:['tool'],mastery:'Engineering',level:30,cost:'18 Stamina',cooldown:8,tags:['Support','Construct']}),
  S('iron_memory','Iron Memory',2,'passive','restricted','Tăng kháng knockback khi đang mang khiên.',{domains:['combat'],weapons:['shield'],mastery:'Shield',level:30,tags:['Guard','Poise']}),
  S('perfect_timing','Perfect Timing',2,'passive','restricted','Thưởng nhỏ khi cancel chính xác sau hit-confirm.',{domains:['combat','shadow'],mastery:'Sword',level:30,tags:['Combo']}),
  S('shield_oath','Shield Oath',2,'active','exclusive','Thế phòng ngự độc quyền Bone Guard, phản lại đòn đầu trúng khiên.',{jobs:['Bone Guard'],weapons:['shield'],cost:'24 Stamina',cooldown:15,tags:['Guard','Counter']}),
  S('viper_riposte','Viper Riposte',2,'active','exclusive','Nhát kiếm phản đòn rất nhanh nhưng tầm ngắn.',{jobs:['Bone Duelist'],weapons:['sword'],cost:'25 Stamina',cooldown:11,tags:['Counter','Slash']}),
  S('grave_splitter','Grave Splitter',2,'active','exclusive','Nện rìu phá poise với startup lớn.',{jobs:['Bone Raider'],weapons:['axe'],cost:'38 Stamina',cooldown:13,tags:['Heavy','Armor Break']}),
  S('hunter_mark','Hunter Mark',2,'active','exclusive','Đánh dấu mục tiêu để phát bắn tiếp theo gây áp lực điểm yếu.',{jobs:['Grave Hunter'],weapons:['bow'],cost:'14 Stamina',cooldown:12,tags:['Mark','Setup']}),
  S('phantom_step','Phantom Step',2,'active','exclusive','Lướt xuyên mục tiêu trong khoảng rất ngắn.',{jobs:['Grave Assassin'],weapons:['dagger'],cost:'30 Stamina',cooldown:14,tags:['Movement','Backstab']}),
  S('summon_guard','Summon Bone Guard',2,'active','exclusive','Triệu hồi một vệ binh yếu giữ vị trí và chặn đòn.',{jobs:['Necromancer'],weapons:['focus'],cost:'35 Soul',cooldown:20,tags:['Summon','Setup']}),
  S('soul_vessel','Soul Vessel',2,'passive','exclusive','Bone Medium: gia tăng Soul nhận từ kỹ năng hỗ trợ đúng nhịp.',{jobs:['Soul Medium'],tags:['Resource','Support']}),
  S('deploy_sentry','Deploy Sentry',2,'active','exclusive','Kỹ sư Bone Engineer đặt tháp bắn ổn định.',{jobs:['Bone Engineer'],weapons:['tool'],cost:'35 Stamina',cooldown:19,tags:['Construct','Setup']}),
  S('guardian_pulse','Guardian Pulse',2,'passive','lineage','Thế thủ truyền lại trong tuyến Bone Guard: khi chịu đòn mạnh, nhận chút poise.',{lineage:'Bone Guard',tags:['Lineage','Defense']}),
  // TIER 3 — accessible signature tier + unique job ultimates.
  S('soulburst','Soulburst',3,'signature','universal','Giải phóng năng lượng tích lũy theo vòng bán kính nhỏ.',{cost:'60 Soul',cooldown:42,tags:['AoE','Finisher']}),
  S('aerial_specialist','Aerial Specialist',3,'passive','universal','Giảm nhẹ landing recovery sau khi kết thúc combo trên không.',{tags:['Air','Combo']}),
  S('phantom_blade','Phantom Blade',3,'signature','exclusive','Sword Wraith tung chuỗi kiếm ảnh bùng nổ trong cự ly ngắn.',{jobs:['Sword Wraith'],weapons:['sword'],cost:'55 Stamina',cooldown:35,tags:['Multi-hit','Finisher']}),
  S('dread_cleaver','Dread Cleaver',3,'signature','exclusive','Dread Knight dồn Soul vào một đường kiếm nặng phá tuyến.',{jobs:['Dread Knight'],weapons:['sword'],cost:'45 Soul',cooldown:32,tags:['Heavy','Armor Break']}),
  S('ravager_whirl','Ravager Whirl',3,'signature','exclusive','Grave Marauder xoay rìu dọn vùng, khó hủy recovery.',{jobs:['Grave Marauder'],weapons:['axe'],cost:'58 Stamina',cooldown:36,tags:['AoE','Heavy']}),
  S('ghostline_shot','Ghostline Shot',3,'signature','exclusive','Phantom Sniper nạp lâu để bắn xuyên nhiều mục tiêu.',{jobs:['Phantom Sniper'],weapons:['bow'],cost:'55 Stamina',cooldown:39,tags:['Projectile','Pierce']}),
  S('legion_call','Legion Call',3,'signature','exclusive','Grand Necromancer gọi đội hình lính xương phối hợp.',{jobs:['Grand Necromancer'],weapons:['focus'],cost:'60 Soul',cooldown:40,tags:['Summon','Command']}),
  S('soul_lattice','Soul Lattice',3,'signature','exclusive','Soul Weaver tạo lưới kết giới hỗ trợ nhiều vị trí.',{jobs:['Soul Weaver'],weapons:['focus'],cost:'50 Soul',cooldown:38,tags:['Support','Zone']}),
  S('shade_echo','Shade Echo',3,'active','exclusive','Shade Stalker tạo bóng mờ đánh lạc hướng kẻ địch.',{jobs:['Shade Stalker'],weapons:['dagger'],cost:'28 Stamina',cooldown:15,tags:['Decoy','Stealth']}),
  S('duelist_focus','Duelist Focus',3,'passive','lineage','Cơ sở từ Bone Duelist, giữ sự tập trung cho chuỗi phản đòn.',{lineage:'Bone Duelist',tags:['Sword','Combo']}),
  S('wraith_rush','Wraith Rush',3,'active','restricted','Đâm lướt nhanh, chỉ dùng với kiếm và kỹ năng Sword cao.',{domains:['combat'],weapons:['sword'],mastery:'Sword',level:55,cost:'35 Stamina',cooldown:14,tags:['Movement','Launcher'],combo:'Normal 2 → Wraith Rush → Air Normal'}),
  // TIER 4 — high tier identity; no extra hotbar capacity.
  S('battle_instinct','Battle Instinct',4,'passive','universal','Tăng khả năng duy trì nhịp combo khi liên tiếp đánh trúng.',{tags:['Combo']}),
  S('reaper_verdict','Reaper Verdict',4,'signature','exclusive','Death Knight dồn sát thương một đường kiếm kết liễu.',{jobs:['Death Knight'],weapons:['sword'],cost:'70 Soul',cooldown:48,tags:['Finisher','Heavy']}),
  S('grave_dominion','Grave Dominion',4,'signature','exclusive','Lich tạo khu vực tăng sức mạnh summon trong thời gian ngắn.',{jobs:['Lich King'],weapons:['focus'],cost:'85 Soul',cooldown:55,tags:['Zone','Summon']}),
  S('citadel_protocol','Citadel Protocol',4,'signature','exclusive','Bone Architect dựng bộ công trình phòng thủ theo trận địa.',{jobs:['Bone Architect'],weapons:['tool'],cost:'65 Stamina',cooldown:50,tags:['Construct','Setup']}),
  S('legion_banner','Legion Banner',4,'signature','exclusive','Legion Marshal cắm cờ tăng hiệu quả giữ tuyến.',{jobs:['Legion Marshal'],weapons:['shield'],cost:'65 Stamina',cooldown:52,tags:['Support','Guard']}),
  S('eternal_mark','Eternal Mark',4,'signature','exclusive','Eternal Huntsman đặt dấu ấn dài hạn lên mục tiêu mạnh.',{jobs:['Eternal Huntsman'],weapons:['bow'],cost:'62 Stamina',cooldown:48,tags:['Mark','Boss']}),
  S('death_whisper','Silent Requiem',4,'signature','exclusive','Death Whisper kết thúc combo dagger rồi nhanh chóng rút lui.',{jobs:['Death Whisper'],weapons:['dagger'],cost:'66 Stamina',cooldown:46,tags:['Finisher','Escape']}),
  // TIER 5 — narrow mythic options but older available skills are retained.
  S('sovereign_step','Sovereign Step',5,'active','universal','Bước chuyển vị trí với hiệu ứng trễ ngắn, cần tiêu hao nhiều năng lượng.',{cost:'52 Soul',cooldown:19,tags:['Movement','Mythic']}),
  S('abyss_judgment','Abyss Judgment',5,'signature','exclusive','Abyss Sovereign tung sóng kiếm tạo sức ép trên diện rộng.',{jobs:['Abyss Sovereign'],weapons:['sword'],cost:'95 Soul',cooldown:62,tags:['AoE','Heavy']}),
  S('death_symphony','Death Symphony',5,'signature','exclusive','Death Sovereign ra lệnh tử linh hợp kích toàn khu vực.',{jobs:['Death Sovereign'],weapons:['focus'],cost:'100 Soul',cooldown:68,tags:['Summon','Finisher']}),
  S('endless_will','Endless Will',5,'passive','universal','Tăng kháng gián đoạn trong một khoảng ngắn sau Ultimate.',{tags:['Survival','Ultimate']}),

  // ===== V12 BALANCE PATCH — 27 skill mới lấp khoảng trống T1–T5 và làm nguyên liệu gate =====
  // Nguyên tắc: Restricted theo domain (2–4 nghề dùng chung), không thêm exclusive; mọi gate T3+ chỉ dùng skill tier >= tier đích - 1.
  // TIER 1 — nguyên liệu gate cho Grave Hunter / Grave Bandit / Soul Medium / Bone Raider
  S('snare_arrow','Snare Arrow',1,'active','restricted','Tên buộc dây vụn, trúng mục tiêu làm chậm ngắn để mở khoảng cách bắn.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:10,cost:'15 Stamina',cooldown:9,roles:['control','attack'],statuses:['root'],tags:['Projectile','Control','Setup'],masteryGain:['Bow','Stealth']}),
  S('cutpurse_toss','Cutpurse Toss',1,'active','restricted','Ném đồ cướp được vào mặt kẻ địch; sát thương thấp nhưng gây khựng và mở góc đánh thấp.',{domains:['shadow'],cost:'12 Stamina',cooldown:6,roles:['attack','utility'],statuses:['stagger'],tags:['Projectile','Throw','Starter'],masteryGain:['Throwing','Stealth']}),
  S('spirit_ward','Spirit Ward',1,'active','restricted','Kết giới linh hồn nhỏ quanh thân, hấp thụ một đòn và hồi lại chút Soul khi vỡ.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:10,cost:'14 Soul',cooldown:15,roles:['defense','support'],method:'magic',element:'dark',statuses:['barrier'],tags:['Barrier','Resource'],masteryGain:['Soul']}),
  S('axe_hook','Axe Hook',1,'active','restricted','Móc lưỡi rìu kéo mục tiêu nhỏ lại gần, mở đòn bổ tiếp theo.',{domains:['combat','shadow'],weapons:['axe'],mastery:'Axe',level:10,cost:'20 Stamina',cooldown:8,roles:['control','attack'],statuses:['stagger'],tags:['Axe','Pull','Linker'],combo:'Axe Hook → Cracked Axe Slam',masteryGain:['Axe']}),
  // TIER 2 — nguyên liệu gate cho Phantom Sniper / Soul Weaver / Soul Assassin / Shade Stalker
  S('steady_draw','Steady Draw',2,'passive','restricted','Giữ nhịp thở khi kéo cung: giảm rung đường tên và rút ngắn giữ ngắm.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:25,roles:['support'],tags:['Bow','Precision']}),
  S('corpse_lantern','Corpse Lantern',2,'active','restricted','Treo đèn hồn ma tại chỗ: kẻ địch trong vùng bị suy yếu nhẹ, đồng minh hồi Soul chậm.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:25,cost:'24 Soul',cooldown:16,roles:['support','control'],method:'magic',element:'dark',statuses:['curse'],tags:['Zone','Debuff','Setup'],masteryGain:['Soul','Necromancy']}),
  S('soul_tithe','Soul Tithe',2,'active','restricted','Nhát đâm trích hồn: mỗi đòn trúng hoàn lại một phần Soul đã chi.',{domains:['shadow'],weapons:['dagger'],mastery:'Dagger',level:25,cost:'18 Soul',cooldown:9,roles:['attack','support'],method:'hybrid',element:'dark',hits:[{type:'physical',element:'neutral',share:60},{type:'magical',element:'dark',share:40}],tags:['Dagger','Thrust','Resource'],combo:'Needle Stab → Soul Tithe',masteryGain:['Dagger','Soul']}),
  S('soul_thread','Soul Thread',2,'active','restricted','Nối sợi linh hồn với thuộc hạ hoặc đồng minh gần: hồi HP theo thời gian cho cả hai đầu sợi.',{domains:['death'],weapons:['focus'],mastery:'Soul',level:20,cost:'22 Soul',cooldown:15,roles:['healing','support'],method:'magic',element:'dark',statuses:['regen'],tags:['Heal','Over Time','Link'],masteryGain:['Soul']}),
  S('veil_sense','Veil Sense',2,'passive','restricted','Cảm nhận hướng nhìn của kẻ địch khi đứng yên; đòn lén đầu tiên sau khi ẩn mạnh hơn.',{domains:['shadow'],mastery:'Stealth',level:20,roles:['support'],tags:['Stealth','Backstab']}),
  // TIER 3 — 8 active + 2 passive theo domain
  S('phalanx_thrust','Phalanx Thrust',3,'active','restricted','Đâm thương từ sau khiên theo nhịp hành quân, tầm xa và giữ tuyến.',{domains:['combat'],weapons:['spear'],mastery:'Spear',level:20,cost:'26 Stamina',cooldown:9,roles:['attack','control'],statuses:['stagger'],tags:['Spear','Thrust','Range','Guard'],combo:'Brace → Phalanx Thrust',masteryGain:['Spear','Shield']}),
  S('iron_charge','Iron Charge',3,'active','restricted','Lao thẳng với vai giáp, húc văng kẻ địch nhỏ trên đường và nối ngay một nhát chém.',{domains:['combat'],weapons:['sword','axe','spear'],mastery:'Sword',level:40,cost:'32 Stamina',cooldown:13,roles:['attack','mobility'],statuses:['stagger'],tags:['Movement','Heavy','Launcher'],masteryGain:['Sword','Shield']}),
  S('piercing_bolt','Piercing Bolt',3,'active','restricted','Mũi tên nặng nạp lâu, xuyên qua mục tiêu đầu và cắm vào mục tiêu sau.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:40,cost:'28 Stamina',cooldown:11,roles:['attack'],tags:['Projectile','Pierce','Charged'],masteryGain:['Bow']}),
  S('hunters_net','Hunter\'s Net',3,'active','restricted','Quăng lưới rộng trói nhiều mục tiêu nhỏ trong chốc lát; boss chỉ bị chậm.',{domains:['ranged','craft'],mastery:'Stealth',level:30,cost:'24 Stamina',cooldown:15,roles:['control'],statuses:['root'],tags:['Trap','AoE','Control'],masteryGain:['Stealth','Engineering']}),
  S('soul_rend','Soul Rend',3,'active','restricted','Chém chéo hai dao xé linh hồn; mục tiêu đang bị nguyền nhận thêm phần sát thương bóng tối.',{domains:['shadow'],weapons:['dagger'],mastery:'Dagger',level:45,cost:'30 Soul',cooldown:12,roles:['attack'],method:'hybrid',element:'dark',hits:[{type:'physical',element:'neutral',share:55},{type:'magical',element:'dark',share:45}],tags:['Dagger','Multi-hit','Finisher'],combo:'Soul Tithe → Soul Rend',masteryGain:['Dagger','Soul']}),
  S('smoke_veil','Smoke Veil',3,'active','restricted','Bung màn khói xương: kẻ địch mất dấu trong giây lát, đòn kế tiếp tính là đánh lén.',{domains:['shadow'],mastery:'Stealth',level:40,cost:'26 Stamina',cooldown:18,roles:['support','mobility'],tags:['Stealth','Decoy','Setup'],masteryGain:['Stealth']}),
  S('bone_spike_field','Bone Spike Field',3,'active','restricted','Gai xương trồi từ đất theo dải trước mặt, gây sát thương và giữ chân mục tiêu nhỏ.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:45,cost:'32 Soul',cooldown:14,roles:['attack','control'],method:'magic',element:'dark',statuses:['root'],tags:['AoE','Zone','Setup'],masteryGain:['Necromancy']}),
  S('soul_siphon','Soul Siphon',3,'active','restricted','Kênh rút Soul từ thuộc hạ hoặc mục tiêu đang nguyền, hồi tài nguyên và chút HP.',{domains:['death'],weapons:['focus'],mastery:'Soul',level:35,cost:'10 Soul',cooldown:17,roles:['support','healing'],method:'magic',element:'dark',tags:['Resource','Channel','Sustain'],masteryGain:['Soul']}),
  S('arc_welder','Arc Welder',3,'active','restricted','Hàn hồ quang bằng dụng cụ: tia điện ngắn gây Shock, đồng thời sửa công trình gần.',{domains:['craft'],weapons:['tool'],mastery:'Engineering',level:40,cost:'24 Stamina',cooldown:10,roles:['attack','support'],method:'tech',element:'lightning',hits:[{type:'magical',element:'lightning',share:100}],statuses:['shock'],tags:['Tool','Projectile','Construct'],masteryGain:['Engineering']}),
  S('fortify_module','Fortify Module',3,'active','restricted','Gắn mô-đun gia cố lên công trình hoặc chính mình: tăng chống ngắt đòn và độ bền thiết bị.',{domains:['craft'],weapons:['tool'],mastery:'Engineering',level:45,cost:'28 Stamina',cooldown:16,roles:['defense','support'],method:'tech',statuses:['barrier'],tags:['Construct','Guard','Setup'],masteryGain:['Engineering']}),
  S('marksman_breath','Marksman Breath',3,'passive','restricted','Đứng yên một nhịp trước khi bắn tăng độ chính xác và tốc độ đường tên.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:45,roles:['support'],tags:['Bow','Precision','Combo']}),
  S('grave_attunement','Grave Attunement',3,'passive','restricted','Càng nhiều thuộc hạ hoặc mục tiêu bị nguyền quanh mình, Soul hồi càng nhanh.',{domains:['death'],mastery:'Soul',level:40,roles:['support'],tags:['Resource','Summon','Sustain']}),
  // TIER 4 — 5 active + 2 passive
  S('warlord_stride','Warlord Stride',4,'active','restricted','Bước chiến chúa: xông lên với giáp linh hồn, mỗi đòn trúng trên đường gia cố thêm giáp.',{domains:['combat'],weapons:['sword','axe','spear'],mastery:'Sword',level:65,cost:'40 Soul',cooldown:16,roles:['attack','defense','mobility'],method:'hybrid',element:'dark',hits:[{type:'physical',element:'neutral',share:70},{type:'magical',element:'dark',share:30}],statuses:['barrier'],tags:['Movement','Heavy','Guard'],masteryGain:['Sword','Necromancy']}),
  S('skyfall_arrow','Skyfall Arrow',4,'active','restricted','Bắn lên trời, mưa tên rơi xuống vùng đã đánh dấu sau một nhịp trễ.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:70,cost:'40 Stamina',cooldown:18,roles:['attack','control'],statuses:['stagger'],tags:['Projectile','AoE','Delayed'],masteryGain:['Bow']}),
  S('shadow_execution','Shadow Execution',4,'active','restricted','Đòn xử quyết từ bóng: sát thương tăng mạnh lên mục tiêu dưới ngưỡng HP, hụt thì phạt recovery dài.',{domains:['shadow'],weapons:['dagger'],mastery:'Dagger',level:70,cost:'38 Stamina',cooldown:17,roles:['attack'],tags:['Dagger','Finisher','Execute','Backstab'],masteryGain:['Dagger','Stealth']}),
  S('necrotic_wave','Necrotic Wave',4,'active','restricted','Sóng hoại tử lan ngang mặt đất, gây sát thương bóng tối và nguyền mọi mục tiêu chạm phải.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:70,cost:'45 Soul',cooldown:18,roles:['attack','control'],method:'magic',element:'dark',statuses:['curse'],tags:['AoE','Projectile','Debuff'],masteryGain:['Necromancy','Soul']}),
  S('siege_turret','Siege Turret',4,'active','restricted','Dựng pháo công thành chậm, bắn đạn nặng xuyên giáp; cần sửa chữa để tồn tại lâu.',{domains:['craft'],weapons:['tool'],mastery:'Engineering',level:70,cost:'45 Stamina',cooldown:24,roles:['summon','attack'],method:'tech',tags:['Construct','Summon','Heavy'],masteryGain:['Engineering']}),
  S('unyielding_bones','Unyielding Bones',4,'passive','universal','Khi HP dưới nửa, khung xương cứng lại: giảm sát thương nhận và chống đẩy lùi.',{roles:['defense'],tags:['Survival','Poise']}),
  S('arcane_reservoir','Arcane Reservoir',4,'passive','universal','Mở rộng bể năng lượng: tăng Mana/Soul tối đa và hồi nhanh hơn khi không dùng skill.',{roles:['support'],tags:['Resource','Sustain']}),
  // V12.1 — 6 exclusive cho nghề còn thiếu (cấp Rank 1 khi thắng Trial nghề đó, không cần gacha)
  S('long_draw','Long Draw',2,'active','exclusive','Bone Marksman kéo dây tới giới hạn: đứng yên nạp lâu, một phát xuyên giáp mạnh.',{jobs:['Bone Marksman'],weapons:['bow'],cost:'24 Stamina',cooldown:11,roles:['attack'],tags:['Projectile','Charged','Pierce'],masteryGain:['Bow']}),
  S('tomb_pilfer','Tomb Pilfer',2,'active','exclusive','Grave Bandit móc túi giữa đòn: trúng mục tiêu thì rơi vật phẩm hồi phục nhỏ hoặc chiến tích.',{jobs:['Grave Bandit'],weapons:['dagger'],cost:'16 Stamina',cooldown:12,roles:['attack','utility'],tags:['Dagger','Loot','Starter'],masteryGain:['Dagger','Stealth']}),
  S('shield_wall','Shield Wall',3,'active','exclusive','Bone Phalanx cắm khiên dựng tường: chắn toàn bộ đạn phía trước, đâm thương qua khe khiên.',{jobs:['Bone Phalanx'],weapons:['shield'],cost:'30 Stamina',cooldown:17,roles:['defense','control'],statuses:['barrier','stagger'],tags:['Guard','Zone','Spear'],masteryGain:['Shield','Spear']}),
  S('hunt_call','Hunt Call',3,'active','exclusive','Wild Hunt Captain thổi tù và gọi chó săn ma lao vào mục tiêu đã đánh dấu.',{jobs:['Wild Hunt Captain'],weapons:['bow'],cost:'32 Stamina',cooldown:20,roles:['summon','support'],tags:['Summon','Command','Mark'],masteryGain:['Bow','Stealth']}),
  S('harvest_step','Harvest Step',3,'active','exclusive','Soul Assassin lướt qua mục tiêu đang bị nguyền, gặt một phần Soul và để lại vết cắt.',{jobs:['Soul Assassin'],weapons:['dagger'],cost:'28 Soul',cooldown:13,roles:['mobility','attack'],method:'hybrid',element:'dark',hits:[{type:'physical',element:'neutral',share:50},{type:'magical',element:'dark',share:50}],tags:['Movement','Backstab','Resource'],masteryGain:['Dagger','Soul']}),
  S('overclock','Overclock',3,'active','exclusive','Bone Artificer ép thiết bị chạy quá tải: trụ/bẫy gần đó bắn nhanh gấp đôi rồi hỏng dần.',{jobs:['Bone Tinkerer Prime'],weapons:['tool'],cost:'26 Stamina',cooldown:19,roles:['support','summon'],method:'tech',tags:['Construct','Buff','Setup'],masteryGain:['Engineering']}),
  // V12.1 — 3 signature Restricted T3 cho martial thuần (không cần attunement)
  S('bone_tempest','Bone Tempest',3,'signature','restricted','Bão xương: xoay vũ khí liên tục quét vùng rộng, đòn cuối đập đất đẩy lùi.',{domains:['combat'],weapons:['sword','axe','spear'],mastery:'Sword',level:45,cost:'55 Stamina',cooldown:40,roles:['attack','control'],statuses:['stagger'],tags:['AoE','Multi-hit','Heavy','Signature'],masteryGain:['Sword']}),
  S('hundred_barbs','Hundred Barbs',3,'signature','restricted','Trăm gai: bắn loạt tên gai rải dọc tuyến, xuyên mọi mục tiêu và cắm xuống đất thành bãi gai.',{domains:['ranged'],weapons:['bow'],mastery:'Bow',level:45,cost:'52 Stamina',cooldown:42,roles:['attack','control'],statuses:['root'],tags:['Projectile','Pierce','AoE','Signature'],masteryGain:['Bow']}),
  S('veil_massacre','Veil Massacre',3,'signature','restricted','Tàn sát trong màn: biến mất rồi tung chuỗi đâm lên mọi mục tiêu gần, kết thúc sau lưng mục tiêu cuối.',{domains:['shadow'],weapons:['dagger'],mastery:'Dagger',level:45,cost:'50 Stamina',cooldown:38,roles:['attack','mobility'],tags:['Multi-hit','Stealth','Backstab','Signature'],masteryGain:['Dagger','Stealth']}),
  // V12.2 — nhánh tử thuật: 4 skill triệu hồi, mỗi Tier một kiểu hành vi. Quân gọi ra có cấp thấp hơn chủ (tier skill − 1), máu mỏng.
  S('raise_skeleton','Raise Skeleton',1,'active','restricted','Dựng một lính xương cận chiến từ đất: máu mỏng, đi theo chủ và lao vào kẻ địch gần.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:10,cost:'16 Soul',cooldown:14,roles:['summon'],method:'magic',element:'dark',tags:['Summon','Melee','Setup'],summonType:'melee',masteryGain:['Necromancy','Soul']}),
  S('bone_archer','Skeletal Archer',2,'active','restricted','Gọi cung thủ xương: đứng cách chủ một quãng, bắn mục tiêu gần nhất; rất dễ chết khi bị áp sát.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:25,cost:'24 Soul',cooldown:16,roles:['summon'],method:'magic',element:'dark',tags:['Summon','Ranged','Setup'],summonType:'ranged',masteryGain:['Necromancy','Soul']}),
  S('bone_knight','Bone Knight',3,'active','restricted','Gọi kỵ sĩ xương: máu dày hơn lính thường, chặn đòn cho chủ, đánh chậm nhưng gây khựng.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:45,cost:'36 Soul',cooldown:20,roles:['summon','defense'],method:'magic',element:'dark',tags:['Summon','Melee','Guard'],summonType:'melee',masteryGain:['Necromancy','Soul']}),
  S('soul_wraith','Soul Wraith',4,'active','restricted','Thả oán linh bay nhanh, ưu tiên săn mục tiêu bị nguyền; tan khi hết thời gian hoặc chịu vài đòn.',{domains:['death'],weapons:['focus'],mastery:'Soul',level:60,cost:'40 Soul',cooldown:18,roles:['summon','attack'],method:'magic',element:'dark',tags:['Summon','Hound','Curse'],summonType:'hound',masteryGain:['Soul','Necromancy']}),
  // V12.3 — nhánh tấn công cho Craft (Siege Gunner, T3 terminal từ Bone Engineer) và lối Grave Bandit → Shade Stalker.
  S('heavy_bolt','Heavy Bolt',2,'active','restricted','Bắn mũi nỏ máy nặng: nạp ngắn, đường đạn thẳng, xuyên một phần giáp; trúng mục tiêu bị trói gây khựng.',{domains:['craft'],weapons:['tool'],mastery:'Engineering',level:25,cost:'22 Stamina',cooldown:8,roles:['attack'],method:'tech',tags:['Projectile','Charged','Pierce'],masteryGain:['Engineering','Throwing']}),
  S('blast_charge','Blast Charge',2,'active','restricted','Ném khối nổ phế liệu có kíp trễ: nổ vùng nhỏ, gây khựng và phá công trình địch.',{domains:['craft'],weapons:['tool'],mastery:'Engineering',level:25,cost:'26 Stamina',cooldown:12,roles:['attack','control'],method:'tech',statuses:['stagger'],tags:['Throw','AoE','Delayed','Setup'],masteryGain:['Engineering','Throwing']}),
  S('breach_cannon','Breach Cannon',3,'active','exclusive','Siege Gunner vác pháo phá thành bắn thẳng: nạp lâu, giật lùi, đạn xuyên hàng và nổ khi chạm đất.',{jobs:['Siege Gunner'],weapons:['tool'],cost:'38 Stamina',cooldown:16,roles:['attack','control'],method:'tech',statuses:['stagger'],tags:['Projectile','Pierce','Heavy','AoE'],masteryGain:['Engineering']}),
  S('shadow_climb','Shadow Climb',2,'active','restricted','Bám vào tường hoặc mép bệ trong bóng tối rồi thả người xuống; đòn tiếp đất tính là đánh lén.',{domains:['shadow'],mastery:'Stealth',level:20,cost:'18 Stamina',cooldown:10,roles:['mobility','attack'],tags:['Movement','Stealth','Climb','Backstab'],aerial:true,masteryGain:['Stealth']}),
  // TIER 5 — 2 active
  S('sovereign_bulwark','Sovereign Bulwark',5,'active','restricted','Thành lũy chúa tể: dựng tường giáp hồn chắn đạn và đòn, phản lại đòn đầu tiên.',{domains:['combat'],mastery:'Sword',level:85,cost:'55 Soul',cooldown:28,roles:['defense','control'],method:'hybrid',element:'dark',statuses:['barrier','stagger'],tags:['Guard','Counter','Zone'],masteryGain:['Shield','Necromancy']}),
  S('oblivion_pulse','Oblivion Pulse',5,'active','restricted','Xung hư vô nổ quanh thân, xóa buff kẻ địch và làm thuộc hạ hợp kích ngay sau đó.',{domains:['death'],weapons:['focus'],mastery:'Necromancy',level:85,cost:'60 Soul',cooldown:26,roles:['attack','support'],method:'magic',element:'dark',statuses:['curse'],tags:['AoE','Command','Debuff'],masteryGain:['Necromancy','Soul']}),

  // V6: element-themed examples for future races/jobs. All names & numbers are illustrative.
  // Attunement is an optional requirement, independent from job access and from a skill's element.
  S('field_mend','Field Mend',0,'active','universal','Sơ cứu hoặc chỉnh lại kết cấu cơ thể, hồi một lượng HP nhỏ; không đồng nghĩa Quick Recovery.',{cost:'12 Stamina',cooldown:12,tags:['Heal','Self/Ally'],roles:['healing'],method:'martial'}),
  S('flicker_ember','Flicker Ember',0,'active','universal','Tia lửa nhỏ làm quen với kỹ thuật nguyên tố; có khả năng tạo Burn nhẹ.',{cost:'9 Mana',cooldown:5,tags:['Projectile','Starter'],roles:['attack'],method:'magic',element:'fire',statuses:['burn']}),
  S('water_drop','Water Drop',0,'active','universal','Giọt nước đẩy mục tiêu nhẹ và tạo trạng thái Wet.',{cost:'9 Mana',cooldown:5,tags:['Projectile','Setup'],roles:['attack','control'],method:'magic',element:'water',statuses:['wet']}),
  S('flame_arc','Flame Arc',1,'active','universal','Kiếm quét mang lửa: đòn vật lý kết hợp phần phụ sát thương lửa.',{weapons:['sword'],cost:'20 Stamina + 8 Mana',cooldown:8,tags:['Slash','Hybrid','Linker'],roles:['attack'],method:'hybrid',element:'fire',attunement:{element:'fire',level:20},hits:[{type:'physical',element:'neutral',share:70},{type:'magical',element:'fire',share:30}],statuses:['burn']}),
  S('water_mend','Water Mend',1,'active','universal','Dòng nước hồi HP mục tiêu theo thời gian; không gây sát thương.',{cost:'22 Mana',cooldown:14,tags:['Heal','Over Time'],roles:['healing','support'],method:'magic',element:'water',attunement:{element:'water',level:20},statuses:['regen']}),
  S('frost_guard','Frost Guard',1,'active','universal','Tạo lớp lá chắn băng ngắn; khi vỡ có thể gây Chill gần đó.',{cost:'25 Mana',cooldown:16,tags:['Barrier','Guard'],roles:['defense','control'],method:'magic',element:'ice',attunement:{element:'ice',level:20},statuses:['barrier','chill']}),
  S('gust_step','Gust Step',1,'active','universal','Lướt được tăng lực bằng gió, đổi vị trí để nối combo trên không.',{cost:'18 Mana',cooldown:9,tags:['Movement','Air'],roles:['mobility'],method:'magic',element:'wind',attunement:{element:'wind',level:20},aerial:true}),
  S('stone_skin','Stone Skin',1,'active','universal','Gia cố da/giáp bằng đất, tăng chống ngắt đòn trong chốc lát.',{cost:'22 Mana',cooldown:17,tags:['Armor','Guard'],roles:['defense'],method:'magic',element:'earth',attunement:{element:'earth',level:20},statuses:['barrier']}),
  S('thunder_jolt','Thunder Jolt',1,'active','universal','Phóng điện nhỏ; có tương tác riêng với mục tiêu Wet.',{cost:'17 Mana',cooldown:8,tags:['Projectile','Linker'],roles:['attack','control'],method:'magic',element:'lightning',attunement:{element:'lightning',level:20},statuses:['shock']}),
  S('root_snare','Root Snare',1,'active','universal','Dây leo trói chân mục tiêu chạm đất; không tự gây damage.',{cost:'19 Mana',cooldown:13,tags:['Trap','Control'],roles:['control'],method:'magic',element:'nature',attunement:{element:'nature',level:20},statuses:['root']}),
  S('radiant_aegis','Radiant Aegis',1,'active','universal','Dựng lớp bảo hộ ánh sáng, có thể giải một hiệu ứng lời nguyền.',{cost:'24 Mana',cooldown:17,tags:['Barrier','Cleanse'],roles:['defense','support'],method:'magic',element:'light',attunement:{element:'light',level:20},statuses:['barrier','purify']}),
  S('umbra_bind','Umbra Bind',1,'active','universal','Ấn bóng tối giữ chân ngắn và giảm khả năng gây áp lực.',{cost:'20 Mana',cooldown:15,tags:['Control','Debuff'],roles:['control'],method:'magic',element:'dark',attunement:{element:'dark',level:20},statuses:['curse']}),
  S('ice_lance','Ice Lance',2,'active','restricted','Pháp kỹ băng tinh luyện dành cho nghề nguyên tố về sau.',{domains:['elemental','arcane'],cost:'28 Mana',cooldown:9,tags:['Projectile','Pierce'],roles:['attack','control'],method:'magic',element:'ice',attunement:{element:'ice',level:40},statuses:['chill']}),
  S('earth_wall','Earth Wall',2,'active','universal','Dựng bức tường đất cản đạn và thay đổi đường đi trong một khoảng ngắn.',{cost:'33 Mana',cooldown:23,tags:['Terrain','Barrier'],roles:['defense','utility'],method:'magic',element:'earth',attunement:{element:'earth',level:35},statuses:['barrier']}),
  S('conductive_surge','Conductive Surge',2,'active','universal','Phóng xung điện theo đường ngắn; đạt hiệu quả khống chế khi mục tiêu đang Wet.',{cost:'30 Mana',cooldown:16,tags:['AoE','Setup Payoff'],roles:['attack','control'],method:'magic',element:'lightning',attunement:{element:'lightning',level:35},statuses:['shock']}),
  S('verdant_recovery','Verdant Recovery',2,'passive','universal','Mở cơ chế hồi phục lượng nhỏ khi hoàn thành điều kiện tương tác Nature.',{tags:['Heal','Sustain'],roles:['healing','support'],method:'magic',element:'nature',attunement:{element:'nature',level:30},statuses:['regen']}),
  S('tidal_sanctuary','Tidal Sanctuary',3,'signature','universal','Tạo vùng nước phục hồi cho đội, thay thế Ultimate gây damage.',{cost:'65 Mana',cooldown:55,tags:['Zone','Heal','Signature'],roles:['healing','support'],method:'magic',element:'water',attunement:{element:'water',level:50},statuses:['regen']}),
  S('storm_waltz','Storm Waltz',3,'signature','universal','Vũ điệu gió và điện: một Signature đa nguyên tố, có nhiều thành phần hit tách biệt.',{cost:'65 Mana',cooldown:49,tags:['AoE','Air','Multi-element'],roles:['attack','mobility'],method:'magic',element:'wind',elements:['wind','lightning'],attunement:{element:'wind',level:50},hits:[{type:'magical',element:'wind',share:55},{type:'magical',element:'lightning',share:45}],statuses:['shock'],aerial:true}),
];
// Roles answer WHAT the skill does. Method answers HOW it is performed.
// Element is a separate property; neutral is not physical damage.
const ROLES = {
  attack:{label:'Tấn công',icon:'⚔️'},healing:{label:'Hồi phục HP',icon:'💚'},
  defense:{label:'Phòng thủ',icon:'🛡️'},mobility:{label:'Cơ động',icon:'💨'},
  control:{label:'Khống chế',icon:'⛓️'},support:{label:'Hỗ trợ',icon:'✦'},
  summon:{label:'Triệu hồi',icon:'♟️'},utility:{label:'Tiện ích',icon:'🧭'}
};
const METHODS = {
  martial:'Vật lý / kỹ thuật',magic:'Phép thuật',hybrid:'Kết hợp vật lý + phép',
  tech:'Cơ khí / công cụ',innate:'Năng lực bẩm sinh'
};
const ELEMENTS = {
  neutral:{label:'Trung tính',icon:'○',note:'Không gắn nguyên tố; không đồng nghĩa sát thương vật lý.'},
  fire:{label:'Lửa',icon:'🔥',note:'Thiêu đốt / Burn; thiên về áp lực theo thời gian.'},
  water:{label:'Nước',icon:'💧',note:'Wet; hỗ trợ, hồi phục và tạo tiền đề tương tác.'},
  ice:{label:'Băng',icon:'❄️',note:'Chill; làm chậm hoặc lá chắn; không gộp với Nước.'},
  lightning:{label:'Sét',icon:'⚡',note:'Shock; gây gián đoạn, tận dụng mục tiêu Wet.'},
  wind:{label:'Gió',icon:'🌪️',note:'Đẩy/lướt, thay đổi khoảng cách, không trung.'},
  earth:{label:'Đất',icon:'🪨',note:'Giáp, chướng ngại, khống chế vị trí.'},
  light:{label:'Ánh sáng',icon:'✨',note:'Lá chắn, thanh tẩy; không mặc định khắc mọi Dark.'},
  dark:{label:'Bóng tối',icon:'🌑',note:'Áp chế, Curse; Soul chỉ là tài nguyên riêng.'},
  nature:{label:'Tự nhiên',icon:'🌿',note:'Root, hồi phục theo thời gian, tăng trưởng.'}
};
const STATUSES = {
  burn:'Burn',wet:'Wet',chill:'Chill',shock:'Shock',root:'Root',
  barrier:'Barrier',regen:'Regen',purify:'Cleanse',curse:'Curse',stagger:'Stagger',armor_break:'Armor Break'
};
const REACTIONS = [
  {name:'Wet + Sét',needs:['wet','lightning'],effect:'Kích hoạt Conductive: gia tăng khả năng Shock hoặc lan sang mục tiêu ở gần (có giới hạn).'},
  {name:'Wet + Băng',needs:['wet','ice'],effect:'Tăng tích lũy Chill; Freeze chỉ xảy ra khi đủ ngưỡng và mục tiêu không miễn nhiễm.'},
  {name:'Burn + Nước',needs:['burn','water'],effect:'Giảm / dập Burn, có thể tạo hơi nước ngắn (không tự cộng sát thương vô hạn).'},
  {name:'Ánh sáng + Curse',needs:['light','curse'],effect:'Cleanse có thể giảm một tầng Curse theo cấp hiệu ứng và kháng trạng thái.'}
];
// Existing 63 V5 skills are explicitly audited, never inferred from visual tags at runtime.
const ROLE_GROUPS = {
  attack:'loose_bone sword_cleave aimed_shot soul_spark rough_three_cut split_arrow leaping_strike armor_rend volley viper_riposte grave_splitter soulburst phantom_blade dread_cleaver ravager_whirl ghostline_shot wraith_rush reaper_verdict death_whisper abyss_judgment',
  healing:'',
  defense:'brace last_stand shield_tap guard_counter iron_memory shield_oath guardian_pulse citadel_protocol',
  mobility:'bone_dash bone_leap quick_recover balanced_frame light_bones forward_roll air_step knife_feint shadow_slip phantom_step aerial_specialist shade_echo sovereign_step',
  control:'ankle_trap soul_bind hunter_mark eternal_mark',
  support:'firm_grip grave_chant turret_repair perfect_timing soul_vessel soul_lattice duelist_focus battle_instinct legion_banner endless_will',
  summon:'pocket_turret summon_guard deploy_sentry legion_call grave_dominion death_symphony',
  utility:'scavenger_eye scrap_mine'
};
const METHOD_GROUPS = {
  magic:'soul_spark grave_chant soul_bind summon_guard soul_vessel guardian_pulse soulburst phantom_blade dread_cleaver legion_call soul_lattice shade_echo grave_dominion reaper_verdict sovereign_step abyss_judgment death_symphony',
  tech:'scrap_mine pocket_turret ankle_trap turret_repair deploy_sentry citadel_protocol'
};
const ELEMENT_GROUPS = {
  dark:'soul_spark soul_bind summon_guard guardian_pulse soulburst phantom_blade dread_cleaver legion_call soul_lattice shade_echo grave_dominion reaper_verdict abyss_judgment death_symphony'
};
for(const [role,ids] of Object.entries(ROLE_GROUPS)) for(const id of ids.split(' ').filter(Boolean)) {
  const s=SKILLS.find(x=>x.id===id); if(!s) throw new Error('Unknown role skill: '+id);
  if(s.roles.length) throw new Error('Duplicate skill role: '+id); s.roles=[role];
}
for(const [method,ids] of Object.entries(METHOD_GROUPS)) for(const id of ids.split(' ').filter(Boolean)) {
  const s=SKILLS.find(x=>x.id===id); if(!s) throw new Error('Unknown method skill: '+id); s.method=method;
}
for(const [el,ids] of Object.entries(ELEMENT_GROUPS)) for(const id of ids.split(' ').filter(Boolean)) {
  const s=SKILLS.find(x=>x.id===id); if(!s) throw new Error('Unknown element skill: '+id); s.element=el;
}
const EXTRA_ROLE = {shield_tap:['attack'],guard_counter:['attack'], armor_rend:['control'],
  turret_repair:['utility'],soul_lattice:['defense'],summon_guard:['defense'],
  soulburst:['control'],phantom_blade:['mobility'],scrap_mine:['control'],
  shade_echo:['utility'],hunter_mark:['support'],citadel_protocol:['summon'],
  legion_banner:['defense'],eternal_mark:['support']};
for(const [id,extras] of Object.entries(EXTRA_ROLE)) {
  const s=SKILLS.find(x=>x.id===id); if(!s) throw new Error('Unknown secondary role skill: '+id);
  s.roles.push(...extras.filter(role=>!s.roles.includes(role)));
}
// Explicit attack-part overrides; proportions are PREVIEW descriptors, not DPS formulas.
const HIT_OVERRIDES = {
  phantom_blade:[{type:'physical',element:'neutral',share:70},{type:'magical',element:'dark',share:30}],
  dread_cleaver:[{type:'physical',element:'neutral',share:65},{type:'magical',element:'dark',share:35}],
  reaper_verdict:[{type:'physical',element:'neutral',share:55},{type:'magical',element:'dark',share:45}],
  abyss_judgment:[{type:'physical',element:'neutral',share:50},{type:'magical',element:'dark',share:50}]
};
for(const s of SKILLS){
  if(!s.roles.length) throw new Error('Missing primary role: '+s.id);
  if(!s.elements.length) s.elements=[s.element];
  if(HIT_OVERRIDES[s.id]) {s.hits=HIT_OVERRIDES[s.id];s.method='hybrid';s.elements=['neutral','dark'];}
  if(!s.hits.length && s.roles[0]==='attack') s.hits=[{type:s.method==='magic'?'magical':'physical',element:s.element,share:100}];
  // Mixed damage parts always expose every associated element in UI/filtering.
  for(const part of s.hits) if(!s.elements.includes(part.element)) s.elements.unshift(part.element);
  if(s.id==='shield_tap') s.hits=[{type:'physical',element:'neutral',share:100}];
  if(s.id==='guard_counter') s.hits=[{type:'physical',element:'neutral',share:100}];
  if(s.id==='soul_bind') s.statuses=['root'];
  if(s.id==='ankle_trap') s.statuses=['root'];
  if(s.id==='guardian_pulse') s.statuses=['barrier'];
  if(s.id==='shield_oath') s.statuses=['barrier'];
  if(s.id==='armor_rend') s.statuses=['armor_break'];
  if(s.id==='grave_splitter') s.statuses=['stagger','armor_break'];
  if(s.id==='hunter_mark') s.statuses=['curse'];
  if(s.id==='soul_lattice') s.statuses=['barrier'];
  if(!s.elements.every(el=>!!ELEMENTS[el])) throw new Error('Unknown element: '+s.id);
  if(!s.roles.every(role=>!!ROLES[role])) throw new Error('Unknown role: '+s.id);
  if(s.hits.length && s.hits.reduce((sum,h)=>sum+h.share,0)!==100) throw new Error('Hit weights != 100: '+s.id);
}
// First-tier provenance and attack animation are design metadata; cooldown alone does not define animation.
for(const s of SKILLS.filter(s=>s.tier===0)) {
  if(!s.unlock) s.unlock = s.element!=='neutral' ? 'Cuộn phép hoặc người hướng dẫn sơ cấp' :
    (s.kind==='passive'?'Khám phá / huấn luyện':'Huấn luyện khởi đầu');
}
// V8: permanent rewards are determined by each skill's rank, not by character Level.
// Rewards at ranks 2-4 are rare and additive (strong skills). Rank 5 always rewards a stat.

// V9: rarity is intrinsic to the SKILL, independent of job Tier, mastery rank and element.
// Pool odds below are design examples, not monetized loot-box rates.
const RARITIES={
  white:{label:'Trắng · Phổ thông',short:'Trắng',weight:55,mult:1,duplicate:2},
  green:{label:'Lục · Cải tiến',short:'Lục',weight:25,mult:1.5,duplicate:3},
  blue:{label:'Lam · Hiếm',short:'Lam',weight:12,mult:2,duplicate:5},
  purple:{label:'Tím · Sử thi',short:'Tím',weight:5,mult:3,duplicate:10},
  gold:{label:'Vàng · Huyền thoại',short:'Vàng',weight:2.5,mult:5,duplicate:15},
  red:{label:'Đỏ · Thần thoại',short:'Đỏ',weight:0.5,mult:8,duplicate:30} // V12: hạ điểm trùng vàng/đỏ (22→15, 45→30)
};
const RARITY_ORDER=Object.keys(RARITIES);
const RARITY_IDS={
  white:'bone_dash bone_leap loose_bone brace quick_recover balanced_frame scavenger_eye light_bones cracked_slash stone_throw needle_stab focus_pulse junk_snare shade_mote',
  green:'aimed_stone spear_jab shield_nudge bone_dive quiet_tread ragged_persistence static_snap wind_puff pebble_knock water_drop flicker_ember field_mend sprout_grasp',
  blue:'rising_chip cracked_axe frost_fleck pale_glimmer water_veil first_footfall',
  purple:'wanderer_improvise',
  // V12 (A4): mỗi Tier có 2–3 màu kề nhau, không để Tier == Rarity.
  // T1: 6 kỹ thuật nhập môn restricted hạ xuống trắng; T2: 3 skill cơ chế mạnh lên tím.
  white_v12:'sword_cleave shield_tap aimed_shot knife_feint soul_spark scrap_mine cutpurse_toss',
  green_v12:'snare_arrow spirit_ward axe_hook raise_skeleton',
  blue_v12:'bone_archer long_draw tomb_pilfer steady_draw corpse_lantern soul_thread veil_sense firm_grip last_stand phalanx_thrust hunters_net smoke_veil arc_welder heavy_bolt blast_charge shadow_climb',
  purple_v12:'bone_knight soul_wraith shield_wall hunt_call harvest_step overclock leaping_strike armor_rend volley soul_tithe iron_charge piercing_bolt soul_rend bone_spike_field soul_siphon fortify_module marksman_breath grave_attunement skyfall_arrow shadow_execution siege_turret unyielding_bones arcane_reservoir breach_cannon',
  gold_v12:'bone_tempest hundred_barbs veil_massacre warlord_stride necrotic_wave sovereign_bulwark oblivion_pulse'
};
const rarityAssignments={};
for(const [key,ids] of Object.entries(RARITY_IDS))for(const id of ids.split(' ').filter(Boolean)) {
  const rarity=key.replace(/_v12$/,'');
  if(rarityAssignments[id]) throw Error('Repeated rarity: '+id);
  rarityAssignments[id]=rarity;
}
// Explicit assignment for Tier 0; higher tiers have a stable preview policy until art/design authoring.
// Tier is NOT a rarity requirement: designers may override any one skill at any Tier.
for(const s of SKILLS){
  const inferred = s.tier>=5 ? (s.kind==='signature'?'red':'gold') :
    s.tier===4 ? (s.kind==='signature'?'red':'purple') :
    s.tier===3 ? (s.kind==='signature'?'gold':'blue') :
    s.tier===2 ? (s.kind==='signature'?'purple':'blue') :
    s.tier===1 ? (s.kind==='signature'?'purple':'green') : 'white';
  s.rarity=rarityAssignments[s.id]||inferred;
  if(!RARITIES[s.rarity])throw Error('Invalid rarity: '+s.id);
}
for(const id of Object.keys(rarityAssignments))if(!SKILLS.some(s=>s.id===id))throw Error('Unknown rarity id: '+id);
const UPGRADE_BASE={2:1,3:2,4:2,5:3};
function rankCost(skill,nextRank){return Math.ceil(UPGRADE_BASE[nextRank]*RARITIES[skill.rarity].mult);}

const CORE_STATS=['STR','DEX','VIT','INT','WIL','AGI'];
const RANK_MAX=5;
// Thưởng chỉ số theo bậc: shared/skills.js (JobLibrary.skillRewards), dùng chung với Vạn Kiếp.
const REWARD_BY_SKILL=(window.JobLibrary&&window.JobLibrary.skillRewards)||{};
function defaultReward(s){
  // Higher-tier skills retain the same five-rank rule; bonuses are design defaults,
  // not a promise of final balance. Add explicit rankRewards on a skill to override.
  const stat=(s.roles.includes('healing')?'VIT':
    s.roles.includes('defense')?'VIT':s.roles.includes('mobility')?'AGI':
    s.roles.includes('summon')?'INT':s.roles.includes('utility')?'DEX':
    s.method==='magic'?'INT':s.method==='tech'?'DEX':
    s.roles.includes('control')?'WIL':'STR');
  // V12 (C2): tổng thưởng tăng theo độ hiếm để farm trắng không lợi hơn skill cao.
  // trắng/lục/lam: 1 · tím: 2 · vàng: 2 (+1 ở R3 nếu signature) · đỏ: 4 (R3 +1, R4 +1, R5 +2).
  const r=s.rarity;
  if(r==='red')return {3:{[stat]:1},4:{[stat]:1},5:{[stat]:2}};
  if(r==='gold')return s.kind==='signature'?{3:{[stat]:1},5:{[stat]:2}}:{5:{[stat]:2}};
  if(r==='purple')return {5:{[stat]:2}};
  return {5:{[stat]:1}};
}
for(const skill of SKILLS){
  skill.rankRewards=skill.rankRewards||REWARD_BY_SKILL[skill.id]||defaultReward(skill);
  // Hand-authored previews: only selected gold/red skills get early bonuses.
  const rareEarly={reaper_verdict:{STR:1}};
  if(rareEarly[skill.id]&&!skill.rankRewards[3])skill.rankRewards[3]=rareEarly[skill.id];
  if(!skill.rankRewards[5]) throw new Error('Skill missing rank 5 bonus: '+skill.id);
  for(const [rank,statMap] of Object.entries(skill.rankRewards)){
    if(+rank<2||+rank>5)throw new Error('Invalid reward rank '+skill.id);
    for(const [k,v] of Object.entries(statMap)) if(!CORE_STATS.includes(k)||!Number.isInteger(v)||v<=0)throw new Error('Invalid stat reward '+skill.id);
  }
}
function getRank(profile,skillId){return Math.max(0,Math.min(5,Number(profile.ranks?.[skillId])||0));}
function skillLevel(profile){return SKILLS.reduce((n,s)=>n+(getRank(profile,s.id)===RANK_MAX?1:0),0);}
function rewardStats(profile){
  const stats=Object.fromEntries(CORE_STATS.map(k=>[k,5]));
  const fromSkills=Object.fromEntries(CORE_STATS.map(k=>[k,0]));
  for(const skill of SKILLS){const rank=getRank(profile,skill.id);
    for(const [threshold,rewards] of Object.entries(skill.rankRewards)){
      if(rank<+threshold)continue;
      for(const [key,value] of Object.entries(rewards)){stats[key]+=value;fromSkills[key]+=value;}
    }
  }
  return {stats,fromSkills};
}
// V12.2: kiểu thuộc hạ và số lượng cho skill cũ chưa khai báo summonType.
const SUMMON_OVERRIDES={pocket_turret:['turret',1],deploy_sentry:['turret',1],siege_turret:['turret',1],summon_guard:['melee',1],legion_call:['melee',3],hunt_call:['hound',1],citadel_protocol:['turret',2]};
for(const [id,[type,count]] of Object.entries(SUMMON_OVERRIDES)){const s=SKILLS.find(x=>x.id===id);if(!s)throw Error('summon override '+id);s.summonType=type;s.summonCount=count;}
for(const s of SKILLS)if(s.roles.includes('summon')&&!s.summonType&&!['grave_dominion','death_symphony','overclock'].includes(s.id))s.summonType=s.method==='tech'?'turret':'melee';
// V12.2 (C): giới hạn thuộc hạ đồng thời theo nghề thật.
const JOB_SUMMON_CAP={'Bone Acolyte':2,'Necromancer':3,'Soul Medium':2,'Grand Necromancer':4,'Soul Weaver':3,'Lich King':4,'Death Sovereign':5,
  'Bone Tinkerer':2,'Bone Engineer':3,'Bone Tinkerer Prime':3,'Siege Gunner':2,'Bone Architect':4,'Grave Hunter':2,'Wild Hunt Captain':3};
const summonCap=job=>JOB_SUMMON_CAP[job]||2;
const JOB_REQUIRED_MAX={
  'Bone Fighter':['cracked_slash','brace'],
  'Skeleton Archer':['stone_throw','aimed_stone'],
  'Bone Rogue':['needle_stab','bone_dash'],
  'Bone Acolyte':['focus_pulse','shade_mote'],
  'Bone Tinkerer':['junk_snare','scavenger_eye'],
  'Bone Guard':['rough_three_cut','shield_tap'],
  'Bone Duelist':['rough_three_cut','sword_cleave'],
  'Bone Raider':['rough_three_cut','axe_hook'],
  'Bone Marksman':['aimed_shot','split_arrow'],
  'Grave Hunter':['aimed_shot','snare_arrow'],
  'Grave Assassin':['shadow_slip','knife_feint'],
  'Grave Bandit':['shadow_slip','cutpurse_toss'],
  'Necromancer':['grave_chant','soul_spark'],
  'Soul Medium':['grave_chant','spirit_ward'],
  'Bone Engineer':['pocket_turret','scrap_mine'],
  'Bone Phalanx':['shield_oath','iron_memory'],
  'Dread Knight':['shield_oath','guard_counter'],
  'Sword Wraith':['viper_riposte','perfect_timing'],
  'Grave Marauder':['armor_rend','leaping_strike'],
  'Phantom Sniper':['volley','steady_draw'],
  'Wild Hunt Captain':['hunter_mark','ankle_trap'],
  'Soul Assassin':['phantom_step','soul_tithe'],
  'Shade Stalker':['shadow_climb','veil_sense'], // V12.3: bỏ phantom_step (exclusive Grave Assassin) vì Stalker nay có lối vào từ Grave Bandit
  'Grand Necromancer':['summon_guard','soul_bind'],
  'Soul Weaver':['corpse_lantern','soul_thread'],
  'Bone Tinkerer Prime':['deploy_sentry','turret_repair'],
  'Siege Gunner':['heavy_bolt','blast_charge'],
  'Legion Marshal':['phalanx_thrust','iron_charge'],
  'Death Knight':['dread_cleaver','wraith_rush'],
  'Eternal Huntsman':['ghostline_shot','piercing_bolt'],
  'Death Whisper':['soul_rend','smoke_veil'],
  'Lich King':['legion_call','bone_spike_field'],
  'Bone Architect':['fortify_module','arc_welder'],
  'Abyss Sovereign':['reaper_verdict','warlord_stride'],
  'Death Sovereign':['grave_dominion','necrotic_wave']
};
for(const job of J.filter(j=>j.tier>0)){
  if(!JOB_REQUIRED_MAX[job.id])throw new Error('Job missing max skill gate: '+job.id);
  for(const id of JOB_REQUIRED_MAX[job.id]){
    const s=SKILLS.find(x=>x.id===id);
    if(!s)throw new Error('Unknown gate skill '+job.id+': '+id);
    // V12 (A2): gate Tier n chỉ dùng skill tier >= n-1 và không quá tier n-1 (nhận qua huấn luyện).
    if(s.tier<job.tier-1||s.tier>job.tier-1)throw new Error('Gate skill tier out of band '+job.id+': '+id);
  }
  // V12 (A1): mọi gate skill phải mới so với toàn bộ nghề tiền nhiệm trên mọi tuyến.
  const seen=new Set();const walk=id=>{for(const f of byId[id].from){(JOB_REQUIRED_MAX[f]||[]).forEach(x=>seen.add(x));walk(f);}};walk(job.id);
  for(const id of JOB_REQUIRED_MAX[job.id])if(seen.has(id))throw new Error('Gate skill reused from predecessor '+job.id+': '+id);
}
// V11 design metadata: bilingual display and complete five-rank upgrade intentions.
// Gameplay still uses its V10 group dispatcher for effects not yet individually authored in runtime.
for(const s of SKILLS){
 const authored=window.SkeletonV11Data.modelFor(s);
 s.nameVi=authored.nameVi;s.rankPlan=authored.ranks;s.rankArchetype=authored.archetype;
}
const skillById = Object.fromEntries(SKILLS.map(s => [s.id, s]));
const SLOT_GROUPS = [{key:'active',label:'ACTIVE',ids:['active1','active2','active3']},
  {key:'signature',label:'SIGNATURE',ids:['signature1']},
  {key:'passive',label:'PASSIVE',ids:['passive1','passive2']}];
const SLOT_KIND = Object.fromEntries(SLOT_GROUPS.flatMap(g=>g.ids.map(id=>[id,g.key])));
const loadoutCapacity = job => {
  const tier=byId[job]?.tier??0;
  return tier===0 ? {active:1,signature:0,passive:1} :
    tier===1 ? {active:2,signature:0,passive:1} :
    tier===2 ? {active:3,signature:0,passive:2} : {active:3,signature:1,passive:2};
};
const unlockedSlots = (job,kind) => SLOT_GROUPS.find(g=>g.key===kind).ids.slice(0,loadoutCapacity(job)[kind]);

const WEAPON_SETS = {
  swordshield:{label:'Kiếm + Khiên',weapons:['sword','shield']}, sword:{label:'Kiếm',weapons:['sword']},
  bow:{label:'Cung (Tier 1+)',weapons:['bow']}, dagger:{label:'Dao găm',weapons:['dagger']},
  axe:{label:'Rìu',weapons:['axe']}, focus:{label:'Pháp khí',weapons:['focus']},
  tool:{label:'Công cụ',weapons:['tool']}, spearshield:{label:'Thương + Khiên',weapons:['spear','shield']},
};
// V12 (D3): bộ vũ khí hợp lệ theo domain nghề; origin dùng được mọi loại trừ cung.
const DOMAIN_WEAPONS={
  origin:['swordshield','sword','dagger','axe','spearshield','focus','tool'],
  combat:['swordshield','sword','axe','spearshield'],
  ranged:['bow','dagger'],
  shadow:['dagger','axe','sword'],
  death:['focus','dagger'],
  craft:['tool','swordshield'],
};
const weaponAllowed=(job,weapon)=>{const j=byId[job];if(!j||!WEAPON_SETS[weapon])return false;if(j.tier===0&&weapon==='bow')return false;return (DOMAIN_WEAPONS[j.domain]||Object.keys(WEAPON_SETS)).includes(weapon);};
const profileFor = job => {
  if (['Bone Phalanx','Legion Marshal'].includes(job)) return 'spearshield';
  if (['Bone Raider','Grave Marauder'].includes(job)) return 'axe';
  if (['Bone Duelist','Sword Wraith'].includes(job)) return 'sword';
  if (job==='Bone Guard') return 'swordshield';
  return {ranged:'bow',shadow:'dagger',death:'focus',craft:'tool',combat:'sword',origin:'sword'}[byId[job]?.domain]||'sword';
};
const PROFILES = {};
const STORE_KEY='skeleton-codex-skill-v10-playable';
const PREVIOUS_KEY='skeleton-codex-skill-v9-demo';
const LEGACY_KEY='skeleton-codex-skill-v8-demo';
let savedData={};
try{savedData=JSON.parse(localStorage.getItem(STORE_KEY)||localStorage.getItem(PREVIOUS_KEY)||localStorage.getItem(LEGACY_KEY)||localStorage.getItem('skeleton-codex-skill-v7-demo')||'{}')||{};
  if(savedData.profiles&&typeof savedData.profiles==='object')Object.assign(PROFILES,savedData.profiles);
}catch(e){savedData={};}
// One simulated character: learned skills, ranks, stat rewards and Level are shared
// across job previews. Job-specific weapon/loadout remain merely preview settings.
const fromOldWanderer=PROFILES.Wanderer?.learned;
const PROGRESS={
  learned:Array.isArray(savedData.progress?.learned)?[...savedData.progress.learned]:
    Array.isArray(fromOldWanderer)?[...fromOldWanderer]:['bone_dash','brace','balanced_frame'],
  ranks:savedData.progress?.ranks&&typeof savedData.progress.ranks==='object'?{...savedData.progress.ranks}:{},
  trophies:Math.max(0,Math.floor(Number(savedData.progress?.trophies)||0)),
  points:Math.max(0,Math.floor(Number(savedData.progress?.points)||0)),
  pulls:Math.max(0,Math.floor(Number(savedData.progress?.pulls)||0)),
  sinceBlue:Math.max(0,Math.floor(Number(savedData.progress?.sinceBlue)||0)),
  sincePurple:Math.max(0,Math.floor(Number(savedData.progress?.sincePurple)||0)),
  challenges:Array.isArray(savedData.progress?.challenges)?savedData.progress.challenges.filter(x=>typeof x==='string'):[],
  firstClear:Array.isArray(savedData.progress?.firstClear)?savedData.progress.firstClear.filter(x=>typeof x==='string'):[],
  job:byId[savedData.progress?.job]?savedData.progress.job:'Wanderer',
  history:Array.isArray(savedData.progress?.history)?savedData.progress.history.filter(x=>byId[x]):['Wanderer'],
  mastery:Object.fromEntries(['Sword','Shield','Necromancy','Throwing','Bow','Dagger','Stealth','Soul','Engineering','Axe','Spear'].map(k=>[k,Math.max(0,Math.min(100,Number(savedData.progress?.mastery?.[k])||0))])),
  affinity:Object.fromEntries(['fire','water','ice','lightning','wind','earth','light','dark','nature'].map(k=>[k,Math.max(0,Math.min(100,Number(savedData.progress?.affinity?.[k])||0))])),
  trials:Array.isArray(savedData.progress?.trials)?savedData.progress.trials.filter(x=>byId[x]):[],
  wins:Math.max(0,Number(savedData.progress?.wins)||0),
  defeats:Math.max(0,Number(savedData.progress?.defeats)||0),
  log:Array.isArray(savedData.progress?.log)?savedData.progress.log.slice(-60):[],
  // V13: sổ săn quái phụ {speciesId:{kills,elite,alpha}}; chỉ ghi khi thắng màn.
  bestiary:Object.fromEntries(Object.entries(savedData.progress?.bestiary&&typeof savedData.progress.bestiary==='object'?savedData.progress.bestiary:{})
    .filter(([k,v])=>/^[a-z][a-z0-9_]{0,40}$/.test(k)&&v&&typeof v==='object').slice(0,200)
    .map(([k,v])=>[k,{kills:Math.max(0,Math.floor(Number(v.kills)||0)),elite:Math.max(0,Math.floor(Number(v.elite)||0)),alpha:Math.max(0,Math.floor(Number(v.alpha)||0))}])),
};
if(!PROGRESS.history.includes(PROGRESS.job))PROGRESS.history.push(PROGRESS.job);
PROGRESS.learned=[...new Set(PROGRESS.learned.filter(id=>!!skillById[id]))];
for(const id of Object.keys(PROGRESS.ranks)) if(!PROGRESS.learned.includes(id))delete PROGRESS.ranks[id];
for(const id of PROGRESS.learned){const oldRank=PROFILES.Wanderer?.ranks?.[id];
  PROGRESS.ranks[id]=Math.max(1,Math.min(RANK_MAX,Number(PROGRESS.ranks[id]??oldRank??1)||1));
}
const save = () => {try {localStorage.setItem(STORE_KEY,JSON.stringify({profiles:PROFILES,progress:PROGRESS}));}catch(e){}};
const getProfile = job => {
  if(!PROFILES[job]||!PROFILES[job].slots){
    PROFILES[job]={slots:{active1:job==='Wanderer'?'bone_dash':null,active2:null,active3:null,signature1:null,passive1:job==='Wanderer'?'balanced_frame':null,passive2:null},weapon:profileFor(job)};
  }
  // The profile is a view onto the same single character's progression.
  PROFILES[job].learned=PROGRESS.learned;
  PROFILES[job].ranks=PROGRESS.ranks;
  const strongest=Object.entries(PROGRESS.affinity).sort((a,b)=>b[1]-a[1])[0];
  PROFILES[job].affinity={element:strongest&&strongest[1]>0?strongest[0]:'neutral',level:strongest?strongest[1]:0};
  return PROFILES[job];
};
const ui = {
  job:document.getElementById('skillJob'), weapon:document.getElementById('skillWeapon'),
  tier:document.getElementById('skillTier'), kind:document.getElementById('skillKind'),
  access:document.getElementById('skillAccess'), search:document.getElementById('skillSearch'),
  role:document.getElementById('skillRole'), element:document.getElementById('skillElement'),
  method:document.getElementById('skillMethod'), rarity:document.getElementById('skillRarity'), affinityElement:document.getElementById('skillAffinityElement'),
  affinityLevel:document.getElementById('skillAffinityLevel'), affinityValue:document.getElementById('skillAffinityValue'),
  library:document.getElementById('skillCards'), slots:document.getElementById('skillSlots'),
  overview:document.getElementById('skillMetrics'), feedback:document.getElementById('skillFeedback')
};
if(!ui.job) return;
ui.job.innerHTML=J.map(j=>`<option value="${esc(j.id)}">T${j.tier} · ${esc(j.nameVi+' / '+j.id)}</option>`).join('');
ui.role.innerHTML='<option value="all">Mọi vai trò</option>'+Object.entries(ROLES).map(([id,meta])=>`<option value="${id}">${meta.icon} ${meta.label}</option>`).join('');
ui.element.innerHTML='<option value="all">Mọi nguyên tố</option>'+Object.entries(ELEMENTS).map(([id,meta])=>`<option value="${id}">${meta.icon} ${meta.label}</option>`).join('');
ui.method.innerHTML='<option value="all">Mọi nguồn kỹ năng</option>'+Object.entries(METHODS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('');
ui.rarity.innerHTML='<option value="all">Mọi độ hiếm</option>'+Object.entries(RARITIES).map(([id,r])=>`<option value="${id}">${r.label}</option>`).join('');
ui.affinityElement.innerHTML=Object.entries(ELEMENTS).map(([id,meta])=>`<option value="${id}">${meta.icon} ${meta.label}</option>`).join('');
document.getElementById('skillRoleLegend').innerHTML=Object.values(ROLES).map(r=>`<span class="role-legend-tag">${r.icon} ${r.label}</span>`).join('');
document.getElementById('skillElementAtlas').innerHTML=Object.entries(ELEMENTS).map(([id,el])=>`<div class="element-atlas-item el-${id}"><b>${el.icon} ${el.label}</b><small>${el.note}</small></div>`).join('');
document.getElementById('skillElementReactions').innerHTML=REACTIONS.map(r=>`<div><b>${r.name}</b><p>${r.effect}</p></div>`).join('');
ui.weapon.innerHTML=Object.entries(WEAPON_SETS).map(([key,v])=>`<option value="${key}">${esc(v.label)}</option>`).join('');
ui.job.value=PROGRESS.job;
let selectedJob=ui.job.value;
ui.weapon.value=getProfile(selectedJob).weapon;
function syncAffinity(){const a=getProfile(selectedJob).affinity;ui.affinityElement.value=a.element;ui.affinityLevel.value=a.level;ui.affinityValue.textContent=a.level;}
syncAffinity();
const accessLabel = a => ({universal:'Universal',restricted:'Restricted',exclusive:'Job Exclusive',lineage:'Lineage'})[a];
const kindLabel = k => ({active:'Active',signature:'Signature',passive:'Passive'})[k];
const masteryValue = m => m ? (PROGRESS.mastery[m]||0) : 0;
function lineageJobs(source){
  const result=new Set([source]); const queue=[source];
  while(queue.length){let src=queue.shift(); const item=byId[src];
    if(!item)continue;
    for(const next of item.to){if(!result.has(next)){result.add(next);queue.push(next)}}
  }
  return result;
}
function eligibility(skill, job, profile){
  const info=byId[job], problems=[];
  if(info.tier < skill.tier) problems.push(`Cần Tier ${skill.tier}`);
  if(skill.access==='exclusive' && !skill.jobs.includes(job)) problems.push(`Chỉ nghề: ${skill.jobs.join(', ')}`);
  if(skill.access==='restricted') {
    const allowed = skill.jobs.includes(job) || skill.domains.includes(info.domain);
    if(!allowed) problems.push(`Giới hạn nghề: ${[...skill.jobs,...skill.domains.map(d=>'nhóm '+d)].join(', ')}`);
  }
  if(skill.access==='lineage' && !PROGRESS.history.includes(skill.lineage) && !lineageJobs(skill.lineage).has(job)) problems.push(`Chỉ nhánh ${skill.lineage}`);
  const equipment=WEAPON_SETS[profile.weapon] || WEAPON_SETS.sword;
  if(skill.weapons.length && !skill.weapons.some(w=>equipment.weapons.includes(w))) problems.push(`Cần vũ khí: ${skill.weapons.join(' / ')}`);
  if(skill.mastery && masteryValue(skill.mastery)<skill.level) problems.push(`Cần ${skill.mastery} ${skill.level} (${masteryValue(skill.mastery)}/${skill.level})`);
  if(skill.attunement && ((PROGRESS.affinity[skill.attunement.element]||0)<skill.attunement.level)) problems.push(`Cần cộng hưởng ${ELEMENTS[skill.attunement.element].label} ≥ ${skill.attunement.level} (hiện tại ${ELEMENTS[profile.affinity.element].label} ${profile.affinity.level})`);
  return problems;
}
const alertUser = message => {ui.feedback.textContent=message;};
function cleanSlots(profile,job) {
  for (const [id,skillId] of Object.entries(profile.slots)) {
    if(skillId && (!unlockedSlots(job,SLOT_KIND[id]||'active').includes(id) || !skillById[skillId] || SLOT_KIND[id]!==skillById[skillId].kind || !profile.learned.includes(skillId) || eligibility(skillById[skillId],job,profile).length)) profile.slots[id]=null;
  }
}
function renderSlots(){
  const p=getProfile(selectedJob);cleanSlots(p,selectedJob);
  const cap=loadoutCapacity(selectedJob);
  ui.slots.innerHTML=SLOT_GROUPS.map(group=>`<div class="skill-slot-group"><div class="slot-heading">${group.label} <span>${group.ids.filter(id=>p.slots[id]).length}/${cap[group.key]}</span></div>
  <div class="slots-list">${group.ids.map((id,i)=>{let s=skillById[p.slots[id]],locked=i>=cap[group.key];return `<div class="skill-slot ${s?'filled':''} ${locked?'slot-locked':''}"><span class="slot-number">${i+1}</span><div class="slot-info"><strong>${locked?'🔒 Chưa mở slot':s?esc(s.nameVi+' / '+s.name):'Chưa lắp skill'}</strong><small>${locked?'Mở tại Tier cao hơn':s?esc(`${ROLES[s.roles[0]].label} · ${s.elements.map(e=>ELEMENTS[e].label).join('+')}`):'Slot '+kindLabel(group.key)}</small></div>${s?`<button class="skill-mini-btn" data-remove="${id}" aria-label="Tháo ${esc(s.nameVi)}">Tháo</button>`:''}</div>`}).join('')}</div></div>`).join('');
  ui.slots.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{let skill=skillById[p.slots[b.dataset.remove]];p.slots[b.dataset.remove]=null;save();alertUser(`Đã tháo ${skill?.nameVi||'skill'} khỏi loadout.`);renderAll();});
}
function renderMetrics(){
  const profile=getProfile(selectedJob);
  const eligible=SKILLS.filter(s=>eligibility(s,selectedJob,profile).length===0).length;
  const learned=profile.learned.filter(id=>!!skillById[id]).length;
  const usable=profile.learned.filter(id=>skillById[id] && eligibility(skillById[id],selectedJob,profile).length===0).length;
  const equipped=Object.values(profile.slots).filter(Boolean).length;
  ui.overview.innerHTML=[['Level = Max Skill',skillLevel(profile)],['Tổng kho skill',SKILLS.length],['Skill đã max',skillLevel(profile)],['Đã học',learned],['Đã học & hợp lệ',usable],['Đang lắp',`${equipped}/${Object.values(loadoutCapacity(selectedJob)).reduce((a,b)=>a+b,0)}`]].map(([key,val])=>`<div class="skill-metric"><b>${val}</b><span>${key}</span></div>`).join('');
}
function renderCards(){
  const p=getProfile(selectedJob), q=ui.search.value.trim().toLowerCase(), tier=ui.tier.value, kind=ui.kind.value, access=ui.access.value;
  const hits=SKILLS.filter(s=>(tier==='all'||s.tier===Number(tier)) && (kind==='all'||s.kind===kind) && (access==='all'||s.access===access)
    && (ui.role.value==='all'||s.roles.includes(ui.role.value))
    && (ui.element.value==='all'||s.elements.includes(ui.element.value))
    && (ui.method.value==='all'||s.method===ui.method.value)
    && (ui.rarity.value==='all'||s.rarity===ui.rarity.value)
    && (`${s.name} ${s.nameVi} ${RARITIES[s.rarity].label} ${s.desc} ${s.unlock} ${s.animation} ${s.tags.join(' ')} ${s.jobs.join(' ')} ${s.roles.map(x=>ROLES[x].label).join(' ')} ${s.elements.map(x=>ELEMENTS[x].label).join(' ')} ${METHODS[s.method]} ${s.statuses.map(x=>STATUSES[x]).join(' ')}`.toLowerCase().includes(q)));
  ui.library.innerHTML=hits.map(s=>{
    const why=eligibility(s,selectedJob,p), learned=p.learned.includes(s.id), occupied=Object.values(p.slots).includes(s.id);
    const rank=getRank(p,s.id);
    const status=occupied?'Đã lắp':!learned?'Chưa sở hữu':why.length?'Bị khóa':rank===5?'Đã max':'Đang luyện';
    const allRewards=Object.entries(s.rankRewards).sort((a,b)=>+a[0]-+b[0]).map(([r,bonus])=>`Bậc ${r}: ${Object.entries(bonus).map(([k,v])=>'+'+v+' '+k).join(', ')}`).join(' · ');
    const statByRank=(rank)=>Object.entries(s.rankRewards).filter(([threshold])=>Number(threshold)<=rank).flatMap(([,v])=>Object.entries(v)).reduce((acc,[k,v])=>(acc[k]=(acc[k]||0)+v,acc),{});
    const statStr=(rank)=>Object.entries(statByRank(rank)).map(([k,v])=>'+'+v+' '+k).join(', ')||'—';
    const rankRows=s.rankPlan.map((v,i)=>`<tr class="${rank===v.rank?'v11-now':''}"><td>R${v.rank}${rank>=v.rank?' ✓':''}</td><td>${s.kind==='passive'?'Hiệu lực':'Sức mạnh / hiệu lực'} ${v.potency}%${s.kind!=='passive'?' · CD '+v.cooldown+'% · niệm '+v.startup+'%':''}</td><td>${esc(v.feature)}</td><td>${statStr(v.rank)}</td></tr>`).join('');
    const preview=`<details class="v11-rank-detail"><summary>★ Xem đủ 5 bậc: thông số, cơ chế, chỉ số vĩnh viễn</summary><div class="v11-scroll"><table class="v11-table v11-rank-table"><thead><tr><th>Bậc</th><th>Hệ số thiết kế so với R1</th><th>Thay đổi hành vi</th><th>Tổng thưởng chỉ số đến bậc này</th></tr></thead><tbody>${rankRows}</tbody></table></div><p class="small">Hệ số thiết kế là mục tiêu V11, không cộng trực tiếp vào chỉ số nhân vật. Gameplay V10 vẫn xử lý kỹ năng theo nhóm; hiệu ứng độc lập ghi ở đây cần triển khai riêng để khớp hoàn toàn.</p></details>`;
    const progress=`<div class="skill-rank-row"><strong>Bậc ${rank}/5 ${rank===5?'◆ MAX':''}</strong><span>${Array.from({length:5},(_,i)=>`<i class="${rank>i?'lit':''}"></i>`).join('')}</span></div><p class="skill-rank-bonuses"><b>Thưởng vĩnh viễn:</b> ${allRewards}</p>`;
    const buttons=[];
    if(!learned) buttons.push('<span class="skill-source-hint">Nhận qua vòng quay hoặc khiêu chiến bảo đảm</span>');
    else{
      if(rank<5){const price=rankCost(s,rank+1);buttons.push(`<button class="skill-action primary" data-rankup="${s.id}" ${PROGRESS.points<price?'disabled':''}>Nâng ${rank} → ${rank+1} · ${price} điểm</button>`);}
      if(!occupied)buttons.push(why.length?'<button class="skill-action" disabled>Không thể lắp</button>':`<button class="skill-action" data-equip="${s.id}">Lắp vào slot</button>`);
    }
    const btn=`<div class="skill-rank-actions">${buttons.join('')}</div>`;
    const rule=s.access==='exclusive'?`Nghề: ${s.jobs.join(', ')}`:s.access==='lineage'?`Nhánh: ${s.lineage}`:s.access==='restricted'?`Nhóm: ${s.domains.join(', ')||s.jobs.join(', ')}`:'Không khóa nghề';
    return `<article class="skill-card-v5 rarity-${s.rarity} ${why.length?'skill-locked':''}"><div class="skill-topline"><span class="skill-tier">TIER ${s.tier}</span><span class="skill-rarity rarity-${s.rarity}">${RARITIES[s.rarity].label}</span><span class="skill-access ${s.access}">${accessLabel(s.access)}</span><span class="skill-state">${status}</span></div>
      <h4>${esc(s.nameVi)} <span class="v11-en">/ ${esc(s.name)}</span></h4>${progress}${preview}<p class="skill-rank-bonuses"><b>Cơ chế thực thi V10:</b> Bậc 1 mở đòn/công dụng · Bậc 2 giảm startup hoặc tăng hiệu quả passive · Bậc 3 tăng sức mạnh hoặc khống chế/trạng thái tùy nhóm · Bậc 4 tăng phạm vi/tốc độ đạn hoặc biến thể theo nhóm · Bậc 5 tăng hiệu quả và nhận thưởng chỉ số (một số Signature có đòn nối).</p><p class="skill-type">${kindLabel(s.kind)} · ${esc(s.cost)}${s.cooldown?` · CD ${s.cooldown}s`:''}</p>
      <div class="skill-dimensions"><span class="skill-role-pill">${s.roles.map(role=>ROLES[role].icon+' '+ROLES[role].label).join(' · ')}</span><span class="skill-method-pill">${METHODS[s.method]}</span><span class="skill-element-pill el-${s.element}">${s.elements.map(e=>ELEMENTS[e].icon+' '+ELEMENTS[e].label).join(' + ')}</span></div>
      <p>${esc(s.desc)}</p>
      ${s.hits.length?`<p class="skill-hitline"><b>Đòn trúng:</b> ${s.hits.map(h=>`${h.type==='physical'?'Vật lý':'Phép'} ${h.share}% [${ELEMENTS[h.element].label}]`).join(' + ')}</p>`:'<p class="skill-hitline"><b>Sát thương:</b> Không trực tiếp</p>'}
      ${s.statuses.length?`<p class="skill-statusline"><b>Hiệu ứng:</b> ${s.statuses.map(st=>STATUSES[st]).join(' · ')}</p>`:''}
      <div class="skill-mini-tags">${s.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>
      <p class="skill-requirement">${esc(rule)}${s.mastery?` · ${esc(s.mastery)} ≥ ${s.level}`:''}${s.weapons.length?` · Vũ khí: ${s.weapons.join('/')}`:''}${s.attunement?` · Cộng hưởng ${ELEMENTS[s.attunement.element].label} ≥ ${s.attunement.level}`:''}${s.combo?`<br><b>Combo:</b> ${esc(s.combo)}`:''}${s.unlock?`<br><b>Nguồn học:</b> ${esc(s.unlock)}`:''}${s.animation?`<br><b>Animation:</b> ${esc(s.animation)}`:''}</p>
      ${why.length?`<p class="skill-lock-reasons">🔒 ${why.map(esc).join(' · ')}</p>`:''}
      ${btn}</article>`;
  }).join('')||'<p class="skill-empty">Không có skill khớp bộ lọc.</p>';
  ui.library.querySelectorAll('[data-rankup]').forEach(b=>b.onclick=()=>{
    const p=getProfile(selectedJob),skill=skillById[b.dataset.rankup];
    if(!p.learned.includes(skill.id)){alertUser('Skill chưa sở hữu.');return;}
    const rank=getRank(p,skill.id);if(rank<1||rank>=RANK_MAX)return;
    const price=rankCost(skill,rank+1);if(PROGRESS.points<price){alertUser('Không đủ Điểm thông thạo. Khiêu chiến và quay trúng skill trùng để nhận thêm.');return;}
    PROGRESS.points-=price;p.ranks[skill.id]=rank+1;
    alertUser(`Đã nâng ${skill.nameVi} / ${skill.name} lên bậc ${rank+1}/5 (trừ ${price} điểm).${rank+1===5?' Level +1!':''} Thưởng chỉ số là vĩnh viễn.`);
    renderAll();
  });
  ui.library.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{
    const p=getProfile(selectedJob), skill=skillById[b.dataset.equip];
    if(!p.learned.includes(skill.id)||eligibility(skill,selectedJob,p).length){alertUser('Skill chưa học hoặc không còn hợp lệ.');return;}
    const group=SLOT_GROUPS.find(g=>g.key===skill.kind), available=unlockedSlots(selectedJob,skill.kind), open=available.find(id=>!p.slots[id]);
    if(!open){alertUser(`Chỉ mở ${available.length} slot ${group.label} ở Tier hiện tại. Tháo skill hoặc thăng Tier.`);return;}
    p.slots[open]=skill.id;save();alertUser(`Đã lắp ${skill.nameVi} / ${skill.name} vào slot ${open}.`);renderAll();
  });
}

// V10 challenge rewards are granted by the playable game after a verified battle clear.
const GACHA_COST_BASE=60;
// V12 (E): giá quay tăng theo Tier nghề thật: 60/80/100/120/140/160.
const gachaCost=()=>GACHA_COST_BASE+20*(byId[PROGRESS.job]?.tier||0);
const FIGHT_REWARDS={solo:{name:'Đấu 1 vs 1',reward:70,first:30},group:{name:'Đấu nhóm đối thủ',reward:120,first:60},elite:{name:'Tinh anh',reward:190,first:90}};
const BEGINNER_CHALLENGES=[
  {id:'fighter',name:'Sân tập kiếm & khiên',job:'Bone Fighter',desc:'Giữ thế, phản đòn và chém ngang',ids:['cracked_slash','brace']},
  {id:'ranged',name:'Bãi tập ném đá',job:'Skeleton Archer',desc:'Ném cơ bản và căn thời điểm ngắm',ids:['stone_throw','aimed_stone']},
  {id:'rogue',name:'Lối đi bóng tối',job:'Bone Rogue',desc:'Đâm nhanh rồi rút lui',ids:['needle_stab','bone_dash']},
  {id:'acolyte',name:'Tàn tích pháp thuật',job:'Bone Acolyte',desc:'Xung phép và đốm bóng tối',ids:['focus_pulse','shade_mote']},
  {id:'tinkerer',name:'Bẫy trong hang',job:'Bone Tinkerer',desc:'Đặt bẫy và thu thập',ids:['junk_snare','scavenger_eye']}
];
const POOL_TAGS={all:'Toàn bộ',melee:'Cận chiến / Khiên',throw:'Tầm xa / Ném đá',shadow:'Dao găm / Cơ động',magic:'Pháp thuật / Nguyên tố',craft:'Bẫy / Cơ khí'};
const skillMatchesPool=(s,pool)=>pool==='all'||
  (pool==='melee'&&(s.weapons.some(w=>['sword','shield','axe','spear'].includes(w))||s.tags.some(t=>['Sword','Shield','Axe','Spear'].includes(t))))||
  (pool==='throw'&&(s.id==='stone_throw'||s.id==='aimed_stone'||s.tags.some(t=>['Projectile','Thrown Stone'].includes(t))||s.weapons.includes('bow')))||
  (pool==='shadow'&&(s.weapons.includes('dagger')||s.domains.includes('shadow')||s.roles.includes('mobility')))||
  (pool==='magic'&&s.method==='magic')||
  (pool==='craft'&&(s.method==='tech'||s.id==='scavenger_eye'));
const gachaUI={
  trophies:document.getElementById('gachaTrophies'),points:document.getElementById('gachaPoints'),pulls:document.getElementById('gachaPulls'),
  result:document.getElementById('gachaResult'),pool:document.getElementById('gachaPool'),tier:document.getElementById('gachaTier'),
  odds:document.getElementById('gachaOdds'), pity:document.getElementById('gachaPity'),challenges:document.getElementById('gachaChallenges'),
  roll:document.getElementById('gachaRoll'), wheel:document.getElementById('gachaWheel')
};
// V12 (A3): pool chỉ gồm skill mà nghề hiện tại HOẶC một nghề hậu duệ còn đến được có thể dùng.
// Exclusive của nhánh khác, Restricted ngoài domain tuyến, Lineage không thuộc lịch sử đều bị loại.
function reachableJobs(job){const out=new Set([job]);const st=[job];while(st.length){const x=st.pop();for(const t of byId[x].to)if(!out.has(t)){out.add(t);st.push(t);}}return out;}
function usableOnBranch(s){
  const reach=reachableJobs(PROGRESS.job);
  if(s.access==='exclusive')return s.jobs.some(j=>reach.has(j));
  if(s.access==='restricted')return [...reach].some(j=>s.jobs.includes(j)||s.domains.includes(byId[j].domain));
  if(s.access==='lineage')return PROGRESS.history.includes(s.lineage)||reach.has(s.lineage);
  return true;
}
function poolSkills(){const maxTier=byId[PROGRESS.job].tier,p=gachaUI.pool.value;
  return SKILLS.filter(s=>s.tier<=maxTier&&usableOnBranch(s)&&skillMatchesPool(s,p));
}
function currentOdds(list){
  const available=new Set(list.map(s=>s.rarity));
  const weights=Object.fromEntries(RARITY_ORDER.map(k=>[k,available.has(k)?RARITIES[k].weight:0]));
  const pityPurple=PROGRESS.sincePurple>=29;
  const pityBlue=PROGRESS.sinceBlue>=9;
  if(pityPurple&&RARITY_ORDER.some((k,i)=>i>=3&&available.has(k))){
    RARITY_ORDER.slice(0,3).forEach(k=>weights[k]=0);
  }else if((pityBlue||pityPurple)&&RARITY_ORDER.some((k,i)=>i>=2&&available.has(k))){
    RARITY_ORDER.slice(0,2).forEach(k=>weights[k]=0);
  }
  const total=Object.values(weights).reduce((a,b)=>a+b,0);
  return Object.fromEntries(RARITY_ORDER.map(k=>[k,total?100*weights[k]/total:0]));
}
function grantSkill(id,reason){
  const s=skillById[id];if(!s)throw Error('Invalid granted skill '+id);
  if(PROGRESS.learned.includes(id)){
    const points=RARITIES[s.rarity].duplicate;
    PROGRESS.points+=points;
    return `${s.name}: trùng → +${points} điểm`;
  }
  PROGRESS.learned.push(id);PROGRESS.ranks[id]=1;
  return `${s.name}: mở khóa bậc 1`;
}
function renderEconomy(){
  if(!gachaUI.roll)return;
  gachaUI.trophies.textContent=PROGRESS.trophies;
  gachaUI.tier.value=String(byId[PROGRESS.job].tier);gachaUI.tier.disabled=true;
  gachaUI.points.textContent=PROGRESS.points;
  gachaUI.pulls.textContent=PROGRESS.pulls;
  const list=poolSkills(),odds=currentOdds(list);
  gachaUI.odds.innerHTML=RARITY_ORDER.map(r=>`<span class="odds-chip rarity-${r}"><b>${RARITIES[r].short}</b><strong>${odds[r].toFixed(1)}%</strong></span>`).join('');
  gachaUI.pity.textContent=`Bảo hiểm: ${Math.max(0,10-PROGRESS.sinceBlue)} lượt đến Lam+ · ${Math.max(0,30-PROGRESS.sincePurple)} lượt đến Tím+ (nếu pool có). Bộ lọc thay đổi tỷ lệ thực tế.`;
  gachaUI.roll.disabled=PROGRESS.trophies<gachaCost()||list.length===0;
  gachaUI.roll.textContent=`Quay 1 lượt · ${gachaCost()} chiến tích (Tier ${byId[PROGRESS.job].tier})`;
  gachaUI.challenges.innerHTML=BEGINNER_CHALLENGES.map(c=>{
    const used=PROGRESS.challenges.includes(c.id),names=c.ids.map(id=>skillById[id].nameVi+' / '+skillById[id].name).join(' + ');
    return `<article class="gacha-challenge"><b>${c.job}</b><small>${c.name} · ${c.desc}</small><div>Thưởng đảm bảo: ${names}</div><button data-challenge="${c.id}" ${used?'disabled':''}>${used?'✓ Đã vượt':'Chiến đấu thử thách'}</button></article>`;
  }).join('');
  gachaUI.challenges.querySelectorAll('[data-challenge]').forEach(b=>b.onclick=()=>{
    const c=BEGINNER_CHALLENGES.find(x=>x.id===b.dataset.challenge);
    if(c && !PROGRESS.challenges.includes(c.id))window.SkeletonGame?.start('training',c.job);
  });
}
gachaUI.pool.innerHTML=Object.entries(POOL_TAGS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
gachaUI.tier.innerHTML=Array.from({length:6},(_,i)=>`<option value="${i}">Tier ${i} và thấp hơn${i?' (thử nghiệm)':''}</option>`).join('');
[gachaUI.pool,gachaUI.tier].forEach(el=>el.onchange=renderEconomy);
document.querySelectorAll('[data-fight]').forEach(button=>button.onclick=()=>{
  window.SkeletonGame?.start(button.dataset.fight);
});
gachaUI.roll.onclick=()=>{
  const list=poolSkills();if(PROGRESS.trophies<gachaCost()||!list.length)return;
  const odds=currentOdds(list);
  let weighted=RARITY_ORDER.filter(k=>odds[k]>0),sample=Math.random()*100,rarity=weighted.at(-1);
  for(const k of weighted){sample-=odds[k];if(sample<0){rarity=k;break;}}
  const choices=list.filter(s=>s.rarity===rarity);
  const skill=choices[Math.floor(Math.random()*choices.length)];
  if(!skill)return;
  PROGRESS.trophies-=gachaCost();PROGRESS.pulls++;
  PROGRESS.sinceBlue=RARITY_ORDER.indexOf(rarity)>=2?0:PROGRESS.sinceBlue+1;
  PROGRESS.sincePurple=RARITY_ORDER.indexOf(rarity)>=3?0:PROGRESS.sincePurple+1;
  const message=grantSkill(skill.id,'spin');
  gachaUI.result.innerHTML=`<span class="skill-rarity rarity-${rarity}">${RARITIES[rarity].label}</span> <b>${skill.nameVi} / ${skill.name}</b> · ${message.includes('trùng')?'trùng, cộng điểm nâng skill':'skill mới, bậc 1'} · ${message}`;
  renderAll();
};

function renderAll(){
  const p=getProfile(selectedJob);cleanSlots(p,selectedJob);
  document.getElementById('skillSlotDescription').textContent = selectedJob+' · Tier '+byId[selectedJob].tier+' mở '+loadoutCapacity(selectedJob).active+' Active, '+loadoutCapacity(selectedJob).passive+' Passive, '+loadoutCapacity(selectedJob).signature+' Signature. Normal Attack, Jump, Dodge là thao tác nền, không chiếm slot.';
  renderMetrics();renderSlots();renderCards();renderEconomy();save();
  if(typeof window!=='undefined'){window.dispatchEvent(new Event('skeleton-progress-changed'));}
  if(typeof recalc==='function')recalc();
}
ui.job.onchange=()=>{selectedJob=ui.job.value;ui.weapon.value=getProfile(selectedJob).weapon;syncAffinity();alertUser(`Đang xem trang bị nghề ${selectedJob}; Level/kho skill là của cùng một nhân vật, chọn nghề không chuyển nghề thật.`);renderAll();};
ui.weapon.onchange=()=>{if(!weaponAllowed(selectedJob,ui.weapon.value)){ui.weapon.value=getProfile(selectedJob).weapon;alertUser('Nghề này không dùng bộ vũ khí đó (V12 giới hạn vũ khí theo domain; Tier 0 chưa dùng cung).');return;}getProfile(selectedJob).weapon=ui.weapon.value;alertUser('Đổi vũ khí: skill không còn hợp lệ sẽ tự tháo khỏi loadout, nhưng không bị quên.');renderAll();};
ui.affinityElement.disabled=true;
ui.affinityLevel.disabled=true;
[ui.tier,ui.kind,ui.access,ui.role,ui.element,ui.method,ui.rarity].forEach(x=>x.onchange=renderCards);
ui.search.oninput=renderCards;
// Link to V4 Mastery simulator. Improving Mastery changes usability, not ownership.
document.querySelectorAll('[data-m]').forEach(el=>el.addEventListener('input',()=>{
  alertUser('Mastery thay đổi: đang đánh giá lại điều kiện sử dụng skill trong build mẫu.');renderAll();
}));
document.getElementById('skillReset').onclick=()=>{
  PROGRESS.learned.splice(0,PROGRESS.learned.length,'bone_dash','brace','balanced_frame');
  PROGRESS.trophies=0;PROGRESS.points=0;PROGRESS.pulls=0;PROGRESS.sinceBlue=0;PROGRESS.sincePurple=0;PROGRESS.challenges=[];PROGRESS.firstClear=[];PROGRESS.job='Wanderer';PROGRESS.history=['Wanderer'];PROGRESS.trials=[];PROGRESS.wins=0;PROGRESS.defeats=0;PROGRESS.log=[];Object.keys(PROGRESS.mastery).forEach(k=>PROGRESS.mastery[k]=0);Object.keys(PROGRESS.affinity).forEach(k=>PROGRESS.affinity[k]=0);
  for(const k of Object.keys(PROGRESS.ranks))delete PROGRESS.ranks[k];
  for(const id of PROGRESS.learned)PROGRESS.ranks[id]=1;
  for(const key of Object.keys(PROFILES))delete PROFILES[key];
  selectedJob='Wanderer';ui.job.value=selectedJob;ui.weapon.value=getProfile(selectedJob).weapon;syncAffinity();
  alertUser('Đã đặt lại toàn bộ kho học và bậc skill của nhân vật mô phỏng.');renderAll();
};
// Shared read-only snapshot powers the Tier 0 stats panel and the transition gate.
function jobGate(target){
  const previous=byId[PROGRESS.job],next=byId[target];
  const isEdge=!!previous&&previous.to.includes(target);
  const required=(JOB_REQUIRED_MAX[target]||[]).map(id=>({id,name:skillById[id].nameVi+' / '+skillById[id].name,rank:getRank(PROGRESS,id),passed:getRank(PROGRESS,id)===5}));
  const missing=next?Object.entries(next.req).filter(([k,v])=>masteryValue(k)<v).map(([k,v])=>`${k} ${masteryValue(k)}/${v}`):[];
  return {isEdge,required,missing,trial:PROGRESS.trials.includes(target),passed:isEdge&&!!required.length&&required.every(x=>x.passed)&&!missing.length,ready:isEdge&&!!required.length&&required.every(x=>x.passed)&&!missing.length&&PROGRESS.trials.includes(target)};
}
// V12: huấn luyện coi là đã nhận khi đã thắng VÀ đang sở hữu đủ cặp gate hiện hành; save cũ với gate V11 được huấn luyện lại một lần.
function trainingCleared(target){
  const won=PROGRESS.challenges.includes('train:'+target)||BEGINNER_CHALLENGES.some(c=>c.job===target&&PROGRESS.challenges.includes(c.id));
  return won&&(JOB_REQUIRED_MAX[target]||[]).every(id=>PROGRESS.learned.includes(id));
}
function recordVictory(result){
  if(!result || !['solo','group','elite','boss','training','trial'].includes(result.mode))return {ok:false,message:'Loại trận không hợp lệ'};
  const mode=result.mode,target=result.target;
  if((mode==='training'||mode==='trial') && (!byId[target] || !byId[PROGRESS.job].to.includes(target)))return {ok:false,message:'Không có cạnh chuyển nghề'};
  if(mode==='training' && trainingCleared(target))return {ok:false,message:'Thử thách đã nhận'};
  if(mode==='trial' && (!jobGate(target).passed || PROGRESS.trials.includes(target)))return {ok:false,message:'Chưa đủ điều kiện Trial hoặc đã hoàn thành'};
  const rewards={...FIGHT_REWARDS,boss:{name:'Boss',reward:260,first:120},training:{name:'Huấn luyện nghề',reward:60,first:0},trial:{name:'Trial chuyển nghề',reward:220,first:0}};
  const entry=rewards[mode];const key=mode+':'+(target||'');const first=!PROGRESS.firstClear.includes(key);
  // V13: tiền thưởng quái phụ (đã hạ trong màn) cộng khi thắng, trần 50% thưởng gốc của màn.
  const kills=Array.isArray(result.hunt?.kills)?result.hunt.kills.filter(k=>k&&/^[a-z][a-z0-9_]{0,40}$/.test(k.species)&&['normal','elite','alpha'].includes(k.grade)).slice(0,40):[];
  const hunt=Math.min(Math.floor(entry.reward*.5),kills.reduce((a,k)=>a+Math.max(0,Math.min(40,Math.floor(Number(k.bounty)||0))),0));
  for(const k of kills){const b=PROGRESS.bestiary[k.species]||(PROGRESS.bestiary[k.species]={kills:0,elite:0,alpha:0});b.kills++;if(k.grade!=='normal')b[k.grade]++;}
  const earned=entry.reward+(first?entry.first:0)+hunt;
  PROGRESS.trophies+=earned;PROGRESS.wins++;
  if(first)PROGRESS.firstClear.push(key);
  let extra=[];
  if(mode==='training'){
    const starter=BEGINNER_CHALLENGES.find(c=>c.job===target);
    PROGRESS.challenges.push(starter?starter.id:'train:'+target);
    extra=(JOB_REQUIRED_MAX[target]||[]).map(id=>grantSkill(id,'training'));
  }
  if(mode==='trial'){PROGRESS.trials.push(target);
    // V12.1: thắng Trial nhận toàn bộ skill exclusive của nghề đích ở Rank 1 (trùng → điểm). Exclusive không còn phụ thuộc gacha.
    extra=SKILLS.filter(s=>s.access==='exclusive'&&s.jobs.includes(target)).map(s=>grantSkill(s.id,'trial'));
  }
  const mastery={...result.mastery};
  const recommended=Object.keys(byId[PROGRESS.job]?.req||{});
  // All wins progress the current discipline; specific combat actions additionally increase their own.
  const fallback={combat:'Sword',ranged:byId[PROGRESS.job].tier?'Bow':'Throwing',shadow:'Dagger',death:'Necromancy',craft:'Engineering',origin:'Sword'}[byId[PROGRESS.job].domain]||'Sword';
  mastery[fallback]=(Number(mastery[fallback])||0)+5;
  for(const [key,raw] of Object.entries(mastery))if(Object.hasOwn(PROGRESS.mastery,key))PROGRESS.mastery[key]=Math.min(100,PROGRESS.mastery[key]+Math.max(0,Math.min(12,Math.floor(Number(raw)||0))));
  if(result.element && Object.hasOwn(PROGRESS.affinity,result.element))PROGRESS.affinity[result.element]=Math.min(100,PROGRESS.affinity[result.element]+Math.min(10,2+Math.floor(Number(result.elementHits)||0)));
  const message=`Thắng ${entry.name}${target?' · '+window.SkeletonV11Data.labelJob(target):''}: +${earned} Chiến tích${hunt?` (gồm ${hunt} săn ${kills.length} quái phụ)`:kills.length?` · hạ ${kills.length} quái phụ`:''}${extra.length?' · '+extra.join(' / '):''}${mode==='trial'?' · Trial hoàn tất':''}`;
  PROGRESS.log.push({when:new Date().toISOString(),mode,target,earned,hunt:kills.length});PROGRESS.log=PROGRESS.log.slice(-60);
  gachaUI.result.textContent=message;
  renderAll();syncAffinity();return {ok:true,message,earned};
}
if(typeof window!=='undefined')window.SkeletonSkillProgress={
  getSnapshot(job=PROGRESS.job){const p=getProfile(job);return {job,level:skillLevel(p),ranks:{...p.ranks},...rewardStats(p)};},
  getGate(job,target){
    const gate=jobGate(target);return job===PROGRESS.job?gate:{...gate,isEdge:false,passed:false,ready:false};
  },
  getCharacter(){return {job:PROGRESS.job,tier:byId[PROGRESS.job].tier,history:[...PROGRESS.history],mastery:{...PROGRESS.mastery},affinity:{...PROGRESS.affinity},trials:[...PROGRESS.trials],wins:PROGRESS.wins,defeats:PROGRESS.defeats,log:[...PROGRESS.log]};},
  getJobCatalog(){return J.map(j=>({id:j.id,nameVi:j.nameVi,tier:j.tier,domain:j.domain,grade:j.grade,from:[...j.from],req:{...j.req},to:[...j.to],terminal:j.terminal,trial:j.trial,role:j.role,requiredSkills:[...(JOB_REQUIRED_MAX[j.id]||[])]}));},
  getSkill(id){const s=skillById[id];return s?JSON.parse(JSON.stringify(s)):null;},
  getSkills(){return SKILLS.map(s=>({id:s.id,name:s.name,nameVi:s.nameVi,kind:s.kind,tier:s.tier,element:s.element,rarity:s.rarity}));},
  getAllSkills(){return SKILLS.map(s=>JSON.parse(JSON.stringify(s)));},
  getGachaCost(){return gachaCost();},
  getPoolSkillIds(){return poolSkills().map(s=>s.id);},
  getCombatBuild(){const job=PROGRESS.job,p=getProfile(job);cleanSlots(p,job);return {job,weapon:p.weapon,slots:{...p.slots},ranks:{...PROGRESS.ranks},stats:rewardStats(PROGRESS).stats,summonCap:summonCap(job),passives:Object.values(p.slots).filter(id=>skillById[id]?.kind==='passive')};},
  getBestiary(){return JSON.parse(JSON.stringify(PROGRESS.bestiary));},
  getEconomy(){return {trophies:PROGRESS.trophies,points:PROGRESS.points,pulls:PROGRESS.pulls,challenges:[...PROGRESS.challenges]};},
  getRankCost(id,nextRank){return skillById[id]?rankCost(skillById[id],nextRank):null;},
  getTrainingStatus(target){const starter=BEGINNER_CHALLENGES.find(c=>c.job===target);return {available:!!byId[PROGRESS.job].to.includes(target),cleared:trainingCleared(target),skills:(JOB_REQUIRED_MAX[target]||[]).map(id=>({id,name:skillById[id].nameVi+' / '+skillById[id].name,rank:getRank(PROGRESS,id)}))};},
  onVictory:recordVictory,
  onDefeat(){PROGRESS.defeats++;renderAll();},
  changeJob(target){const gate=jobGate(target);if(!gate.ready)return {ok:false,message:!gate.isEdge?'Không có đường chuyển nghề hợp lệ':gate.required.some(x=>!x.passed)?'Cần nâng toàn bộ skill bắt buộc lên bậc 5':gate.missing.length?'Chưa đủ Mastery: '+gate.missing.join(', '):!gate.trial?'Chưa thắng Trial':'Thiếu điều kiện chuyển nghề'};
    PROGRESS.job=target;PROGRESS.history.push(target);selectedJob=target;ui.job.value=target;ui.weapon.value=getProfile(target).weapon;syncAffinity();renderAll();return {ok:true,message:'Đã chuyển vĩnh viễn thành '+window.SkeletonV11Data.labelJob(target)+' · Tier '+byId[target].tier};},
  weaponAllowed(weapon,job=PROGRESS.job){return weaponAllowed(job,weapon);},
  setCombatWeapon(weapon){if(!weaponAllowed(PROGRESS.job,weapon))return false;getProfile(PROGRESS.job).weapon=weapon;if(selectedJob===PROGRESS.job)ui.weapon.value=weapon;renderAll();return true;},
  setCombatSlot(id,skillId){const job=PROGRESS.job,p=getProfile(job),s=skillById[skillId];if(!unlockedSlots(job,SLOT_KIND[id]||'active').includes(id)||!s||s.kind!==SLOT_KIND[id]||!PROGRESS.learned.includes(skillId)||eligibility(s,job,p).length)return false;Object.keys(p.slots).forEach(k=>{if(p.slots[k]===skillId)p.slots[k]=null;});p.slots[id]=skillId;renderAll();return true;},
  refresh(){renderAll();},
  exportSave(){save();return JSON.stringify({version:10,profiles:PROFILES,progress:PROGRESS},null,2);},
  importSave(json){let data;try{data=typeof json==='string'?JSON.parse(json):json;}catch(e){return {ok:false,message:'JSON không hợp lệ'};}
    if(!data||!data.progress||!Array.isArray(data.progress.learned)||!data.progress.ranks||!byId[data.progress.job])return {ok:false,message:'Thiếu cấu trúc save V10'};
    // Reload after structured validation so every module rebuilds from the same canonical data.
    try{localStorage.setItem(STORE_KEY,JSON.stringify({profiles:data.profiles||{},progress:data.progress}));location.reload();return {ok:true};}catch(e){return {ok:false,message:'Không thể ghi save'};}
  }
};
renderAll();
})();

/* Skeleton Codex V10 → V12 — playable 2D platform combat, placeholder geometry, offline.
 * V12: scaling STR/DEX/INT theo nguồn sức mạnh, mastery suy từ dữ liệu skill, vũ khí giới hạn theo domain.
 * Uses the V9 skill library as canonical authoring data; gameplay coefficients are prototypes.
 * No simulation rewards. One reward transaction is recorded only on actual scene victory.
 * V13: quái phụ trên map (bestiary ở ../shared/bestiary): họ, kiểu di chuyển, cấp tinh anh/thủ lĩnh, biến tố, vùng săn.
 */
(()=>{'use strict';
const api=window.SkeletonSkillProgress;
const v11Name=(id)=>window.SkeletonV11Data?.labelJob(id)||id;
const v11Skill=(s)=>s?s.nameVi+' / '+s.name:'—';
if(!api)throw Error('V10 requires SkeletonSkillProgress from skill-system.js');
const $=id=>document.getElementById(id);
const c=$('gameCanvas'),ctx=c.getContext('2d');
if(!ctx)return;
const CW=c.width,CH=c.height,G=1050,FLOOR=402,WORLD=2630,FINISH=2520;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const rand=(a,b)=>a+Math.random()*(b-a);
const COLORS={neutral:'#ded6bd',fire:'#f4a265',water:'#62cbef',ice:'#a8ebfc',lightning:'#fcdf77',earth:'#c2a885',wind:'#9de6c4',dark:'#bf9ee7',light:'#f4e2aa',nature:'#a2df9a'};
const MASTERY_WEAPONS={swordshield:'Sword',sword:'Sword',bow:'Bow',dagger:'Dagger',axe:'Axe',focus:'Necromancy',tool:'Engineering',spearshield:'Spear'};
const input={left:false,right:false,jump:false,normal:false,dodge:false,skill1:false,skill2:false,skill3:false,signature:false};
let game=null,raf=0,lastFrame=0,lastMode='solo',lastTarget=null,logBuffer=[];
const modeTitle={solo:'Đơn đấu',group:'Đấu nhóm',elite:'Tinh anh',boss:'Boss',training:'Huấn luyện chuyển nghề',trial:'Trial chuyển nghề'};
function message(txt){$('playBattleLog').textContent=txt;logBuffer.push(txt);logBuffer=logBuffer.slice(-12);if(game)game.notice={text:txt,time:3};}
function isPlaying(){return game?.state==='running';}
function overlay(text){$('gameOverlay').textContent=text;$('gameOverlay').classList.toggle('is-hidden',!text);}
function setInput(name,value){if(name in input)input[name]=value;}
const platforms=[{x:0,y:FLOOR,w:980,h:68},{x:1045,y:FLOOR,w:810,h:68},{x:1920,y:FLOOR,w:710,h:68},{x:360,y:322,w:170,h:14},{x:805,y:315,w:155,h:14},{x:1070,y:308,w:205,h:14},{x:1500,y:330,w:180,h:14},{x:1928,y:300,w:180,h:14},{x:2250,y:323,w:155,h:14}];
// Small gaps are genuine jump hazards; raised stepping ledges provide alternate routes.
function playerFactory(){
  const build=api.getCombatBuild(),stats=build.stats;
  const maxHP=60+8*stats.VIT, maxStam=60+4*stats.VIT+3*stats.AGI,maxMana=25+5*stats.WIL+2*stats.INT;
  return {x:83,y:FLOOR-48,w:30,h:48,vx:0,vy:0,face:1,onGround:false,hp:maxHP,maxHP,stam:maxStam,maxStam,mana:maxMana,maxMana,
    stats,build,statuses:{},stun:0,iframes:0,attack:null,attackTimer:0,combo:0,comboTimer:0,guard:0,shield:0,cooldowns:{},normalCD:0,dodgeCD:0,dodgeTime:0,
    contact:{},healed:{},hitstop:0,hitConfirm:0,kills:0,jumpCount:0,damageTaken:0,staminaSpent:0,castCount:0};
}
function enemyFactory(x,kind,tier=0){
 const base={grunt:{hp:52,speed:94,range:48,damage:9,windup:.42,recovery:.9},scout:{hp:43,speed:135,range:42,damage:8,windup:.27,recovery:1},caster:{hp:44,speed:68,range:230,damage:9,windup:.68,recovery:1.7},brute:{hp:110,speed:74,range:67,damage:16,windup:.7,recovery:1.5},boss:{hp:205,speed:92,range:88,damage:20,windup:.75,recovery:1.45}}[kind];
 const factor=1+Math.min(5,tier)*.22;
 return {id:Math.floor(Math.random()*1e9),x,y:FLOOR-(kind==='boss'?65:kind==='brute'?51:42),w:kind==='boss'?50:kind==='brute'?40:30,h:kind==='boss'?65:kind==='brute'?51:42,
 vx:0,vy:0,onGround:false,face:-1,hp:Math.round(base.hp*factor),maxHP:Math.round(base.hp*factor),speed:base.speed*(1+.05*tier),range:base.range,damage:Math.round(base.damage*(1+.12*tier)),
 windup:base.windup,recovery:base.recovery,cooldown:rand(.8,1.5),charge:0,stun:0,iframes:0,kind,phase:0,statuses:{},flash:0,armor:kind==='boss'?6:kind==='brute'?4:1,magicResist:kind==='caster'?5:2};
}
function initEnemies(mode,tier){const list=[];
 if(mode==='solo')list.push(enemyFactory(850,'grunt',tier));
 else if(mode==='group')list.push(enemyFactory(690,'scout',tier),enemyFactory(1350,'grunt',tier),enemyFactory(2130,'caster',tier));
 else if(mode==='elite')list.push(enemyFactory(670,'grunt',tier),enemyFactory(1520,'brute',tier),enemyFactory(2220,'scout',tier));
 else if(mode==='training')list.push(enemyFactory(730,'grunt',tier),enemyFactory(1750,'scout',tier));
 else if(mode==='trial')list.push(enemyFactory(760,'scout',tier),enemyFactory(1980,'brute',tier),enemyFactory(2250,'caster',tier));
 else list.push(enemyFactory(800,'scout',tier),enemyFactory(1550,'brute',tier),enemyFactory(2230,'boss',tier));
 return list;
}
function start(mode='solo',target=null){
 if(!modeTitle[mode])return;
 const char=api.getCharacter();
 if(mode==='training'){
  if(!target||!api.getTrainingStatus(target).available||api.getTrainingStatus(target).cleared){message('Huấn luyện không hợp lệ hoặc đã nhận thưởng.');return;}
 }
 if(mode==='trial'){
  if(!target||!api.getGate(char.job,target).passed||api.getGate(char.job,target).trial){message('Chưa đạt skill rank 5/Mastery hoặc Trial đã hoàn tất.');return;}
 }
 lastMode=mode;lastTarget=target;
 Object.keys(input).forEach(k=>input[k]=false);
 const p=playerFactory();
 const B=bestiary(),biome=B?.biomes[$('playBiome')?.value]?$('playBiome').value:'grave_hills',sideOn=!$('playSide')||$('playSide').checked;
 game={state:'running',mode,target,tier:char.tier,player:p,enemies:initEnemies(mode,char.tier),projectiles:[],traps:[],allies:[],zone:null,particles:[],pickups:[{x:590,y:369,taken:false,type:'hp',amount:24},{x:1380,y:365,taken:false,type:'hp',amount:24},{x:2120,y:364,taken:false,type:'hp',amount:24}],
 clock:0,camera:0,notice:{text:'Vượt địa hình, đánh bại toàn bộ đối thủ rồi đến cổng sáng',time:3},actionMastery:{},elementHits:{},collected:0,
 biome,palette:B?.biomes[biome]?.palette||null,hunt:{kills:[]},fx:[]};
 if(sideOn)game.enemies.push(...spawnSide(mode,char.tier,biome));
 overlay('');c.focus({preventScroll:true});updateHeader();draw();
 if(!raf){lastFrame=performance.now();raf=requestAnimationFrame(frame);}
}
function stop(){if(!game)return;game.state='stopped';overlay('Đã thoát trận — không nhận Chiến tích.\nNhấn Bắt đầu để vào màn khác.');updateHeader();}
function finish(win){if(!game||game.state!=='running')return;
 game.state=win?'won':'lost';
 if(win){
   const actions=game.actionMastery;
   // Extra mastery from actual use is deliberately capped server-side in the progression adapter.
   const mainElement=Object.entries(game.elementHits).sort((a,b)=>b[1]-a[1])[0];
   const result=api.onVictory({mode:game.mode,target:game.target,mastery:actions,element:mainElement?.[0],elementHits:mainElement?.[1]||0,hunt:game.hunt});
   overlay(result.ok?`THẮNG — ${modeTitle[game.mode]}\n${result.message}\nQuay skill / nâng rank hoặc chơi lại`:'Không ghi được phần thưởng: '+result.message);
   message(result.message);renderProgress();
 }else{
   api.onDefeat();overlay('THẤT BẠI\nKhông mất skill hoặc Chiến tích.\nThử lại hoặc đổi build.');message('Thua trận '+modeTitle[game.mode]+' — không có phần thưởng.');
 }
 updateHeader();
}
function gainMastery(k,amt=1){if(!game||!k)return;game.actionMastery[k]=Math.min(60,(game.actionMastery[k]||0)+amt);}
function addParticles(x,y,color,count=5){if(!game)return;for(let i=0;i<count;i++)game.particles.push({x,y,vx:rand(-90,90),vy:rand(-130,-30),life:rand(.15,.55),color});}
function dealEnemy(e,damage,source,options={}){
 if(e.hp<=0||e.iframes>0||e.hidden)return false;
 const p=game.player;
 const mitigation=options.magic?e.magicResist:e.armor;
 const adjusted=(damage-(options.ignoreDefense?0:mitigation))*(e.statuses.armor_break?1.18:1)*(e.statuses.curse?1.12:1)*(e.side?sideTakenMult(e,options,source):1);
 const amount=Math.max(1,Math.round(adjusted));e.hp=Math.max(0,e.hp-amount);e.flash=.15;
 if(e.side){e.lastHit=game.clock;e.lastBurn=options.status==='burn'||source==='burn';if(e.diving&&e.fam==='avian'){e.diving=0;e.contact=false;e.stun=Math.max(e.stun,.8);}}
 e.vx=(e.x>p.x?1:-1)*Math.min(280,options.knock||115)*(e.side?e.knock:1);
 if(options.launch&&!(e.side&&!e.knock))e.vy=-240;
 if(options.stun&&!(e.side&&e.fam==='construct'&&!e.statuses.armor_break))e.stun=Math.max(e.stun,Math.min(e.kind==='boss'?.3:.8,options.stun));
 if(options.status&&!(e.side&&e.fam==='elemental'&&options.status===e.status)){const key=options.status;e.statuses[key]=Math.max(e.statuses[key]||0,e.kind==='boss'?.8:2.2);
   if(key==='shock'&&e.statuses.wet){e.hp=Math.max(0,e.hp-6);addParticles(e.x,e.y,'#e8de80',9);e.statuses.wet=0;}
   if(key==='chill'&&e.statuses.wet){e.stun=Math.max(e.stun,.6);e.statuses.wet=0;addParticles(e.x,e.y,COLORS.ice,8);}
   if(key==='wet'&&e.statuses.burn){e.statuses.burn=0;addParticles(e.x,e.y,'#c7e1eb',9);}
 }
 addParticles(e.x+e.w/2,e.y+18,options.color||'#eacb89',5);
 if(e.hp<=0){p.kills++;addParticles(e.x+e.w/2,e.y,'#cb9c85',12);if(e.side)sideDeath(e,options);}
 return true;
}
function damagePlayer(damage,source){const p=game.player;if(p.hp<=0||p.iframes>0||p.dodgeTime>0)return 0;
 let amount=Math.round(damage*(1-Math.min(.38,passivePower(p).reduction)));
 if(p.guard>0){amount=Math.ceil(amount*.27);p.stam=Math.min(p.maxStam,p.stam+3);gainMastery('Shield',2);addParticles(p.x+15,p.y+15,'#a7d2ed',8);}
 if(p.shield>0){const absorbed=Math.min(amount,p.shield);p.shield-=absorbed;amount-=absorbed;}
 if(amount<=0){p.iframes=.12;return 0;}
 p.hp=Math.max(0,p.hp-amount);p.damageTaken+=amount;p.iframes=.65;p.stun=.22;p.vx=(source.x<p.x?1:-1)*240;p.vy=-120;
 addParticles(p.x+15,p.y+20,'#ff9d88',9);
 if(p.hp===0)finish(false);
 return amount;
}
function costSkill(s,p){const x=String(s.cost||'').match(/(\d+)\s*(Stamina|Mana|Soul)/i);const base=x?+x[1]:s.kind==='signature'?26:12;const type=x&&/stamina/i.test(x[2])?'stam':'mana';return {type,amount:base};}
function spendCost(s,p){const cost=costSkill(s,p);if(p[cost.type]<cost.amount)return false;p[cost.type]-=cost.amount;p.staminaSpent+=cost.type==='stam'?cost.amount:0;return true;}
function fireProjectile(x,y,vx,vy,damage,side,color,status=null,pierce=0,magic=false){const q={x,y,w:12,h:12,vx,vy,damage,side,color,status,pierce,magic,life:3,hitIds:new Set()};game.projectiles.push(q);return q;}
// V12 (D1): chỉ số scale theo nguồn sức mạnh thay vì INT cho mọi skill.
// martial: kiếm/rìu/thương/khiên → STR; cung/dao/ném → DEX; tay không → trung bình STR/DEX.
// magic → INT; hybrid → trung bình STR(hoặc DEX)/INT; tech → trung bình DEX/INT.
const DEX_WEAPONS=['bow','dagger'];
function physicalStat(p,weapons=[],tags=[]){
 const s=p.stats;
 if(weapons.some(w=>DEX_WEAPONS.includes(w))||tags.some(t=>/Throw|Thrown|Projectile/i.test(t)))return s.DEX;
 if(weapons.length)return s.STR;
 return (s.STR+s.DEX)/2;
}
function scalingStat(p,skill){
 const s=p.stats,w=skill.weapons||[],tags=skill.tags||[];
 if(skill.method==='magic')return s.INT;
 if(skill.method==='hybrid')return (physicalStat(p,w,tags)+s.INT)/2;
 if(skill.method==='tech')return (s.DEX+s.INT)/2;
 return physicalStat(p,w,tags);
}
const weaponStat=(p,weapon)=>DEX_WEAPONS.includes(weapon)?p.stats.DEX:weapon==='focus'?p.stats.INT:weapon==='tool'?(p.stats.DEX+p.stats.INT)/2:p.stats.STR;
function meleeDamage(p,e,base,opts={}){
 const stat=opts.stat??weaponStat(p,p.build.weapon);
 const dmg=base*(1+(stat-5)*.025)*(1+passivePower(p).damage);
 if(dealEnemy(e,dmg,'player',opts))gainMastery(MASTERY_WEAPONS[p.build.weapon]||'Sword');
}
function meleeSweep(p,reach,base,opts={}){
 const box={x:p.face>0?p.x+p.w:p.x-reach,y:p.y-18,w:reach,h:p.h+25};
 let hits=0;
 for(const e of game.enemies)if(e.hp>0&&!e.hidden&&hit(box,e)){
    meleeDamage(p,e,base,opts);hits++;
    if(opts.single)break;
 }
 if(hits&&p.attack?.type==='normal')p.hitConfirm=.28;
 if(!hits)addParticles(p.x+p.w/2+p.face*reach,p.y+23,opts.color||'#d2d5b8',2);
 return hits;
}
function passivePower(p){
 const set=p.build.passives||[],buff={speed:0,stamRegen:0,manaRegen:0,damage:0,reduction:0,jump:0,loot:0,critical:0,guard:false,light:false,bonus:false,scavenge:false};
 for(const id of set){const skill=api.getSkill(id),rank=p.build.ranks[id]||1;if(!skill)continue;
   const roles=skill.roles||[],t=skill.tags.join(' ').toLowerCase();
   if(roles.includes('mobility')||/mobility|air|speed|dodge|stealth/.test(t)){buff.speed+=2+rank*2;buff.jump+=rank*2;}
   if(roles.includes('defense')||/poise|armor|guard|shield/.test(t)){buff.reduction+=.01+.014*rank;buff.stamRegen+=rank*.4;}
   if(roles.includes('attack')||/critical|precision|timing|attack/.test(t)){buff.damage+=.018*rank;buff.critical+=.01*rank;}
   if(roles.includes('utility')||/scaveng|loot|explor/.test(t)){buff.loot+=rank*.02;buff.stamRegen+=rank*.5;}
   if(roles.includes('support')||roles.includes('healing'))buff.manaRegen+=rank*.7;
   buff.guard ||= id==='ragged_persistence';buff.light ||= id==='light_bones'||id==='first_footfall';buff.bonus ||= id==='balanced_frame';buff.scavenge ||= id==='scavenger_eye';
 }
 return buff;
}
function normalAttack(){const p=game.player;if(p.stun>0||p.normalCD>0||p.attackTimer>0)return;
 const weapon=p.build.weapon;
 const spec={swordshield:[.26,17,83],sword:[.24,18,86],dagger:[.15,12,62],axe:[.52,32,93],spearshield:[.34,18,130],bow:[.52,17,470],focus:[.42,16,390],tool:[.37,16,110]}[weapon]||[.25,16,76];
 if(p.stam<4)return;p.stam-=4;p.normalCD=spec[0];p.attackTimer=spec[0]*.8;p.combo=(p.comboTimer>0?p.combo+1:1)%4;p.comboTimer=.85;
 p.attack={type:'normal',time:p.attackTimer,duration:p.attackTimer,done:false,delay:spec[0]*.35,weapon,damage:spec[1]+(p.combo>=2?3:0),reach:spec[2]};
 gainMastery(MASTERY_WEAPONS[weapon]||'Sword',1);if(weapon==='swordshield'||weapon==='spearshield')gainMastery('Shield',.4);
}
function castSlot(which){
 const p=game.player;if(p.stun>0)return;
 const id=p.build.slots[which];if(!id)return;
 const skill=api.getSkill(id),rank=p.build.ranks[id]||0;
 if(p.attackTimer>0){if(rank<4||p.hitConfirm<=0)return;p.attackTimer=0;p.attack=null;p.hitConfirm=0;}
 if(!skill||rank<1||skill.kind==='passive'||p.cooldowns[id]>0)return;
 if(!spendCost(skill,p))return;
 const baseCD=Number(skill.cooldown)||4;const rankModel=skill.rankPlan?.[rank-1];p.cooldowns[id]=Math.max(.5,baseCD*(rankModel?.cooldown??(100-5.5*(rank-1)))/100);
 // At rank 2 faster execution; rank 4 allows post-hit cancel; rank 5 has a follow-up.
 const windup=clamp((.25+(skill.kind==='signature'?.17:0))*(rankModel?.startup??(100-14*(rank-1)))/100,.08,.44);
 p.attackTimer=windup+.1;
 p.attack={type:'skill',time:p.attackTimer,duration:p.attackTimer,done:false,delay:windup,skill,rank,bonus:0};p.castCount++;
 for(const [m,amt] of Object.entries(masteryGainFor(skill,p.build.weapon)))gainMastery(m,amt);
}
// V12 (D2): mastery suy ra từ dữ liệu skill (weapons / method / element / cost / tags), không còn regex theo tên.
// Skill có trường masteryGain thì dùng đúng danh sách đó.
function masteryGainFor(skill,weapon){
 const g={};const add=(k,v)=>{if(k)g[k]=Math.max(g[k]||0,v);};
 if(Array.isArray(skill.masteryGain)&&skill.masteryGain.length){skill.masteryGain.forEach((m,i)=>add(m,i===0?2:1));return g;}
 const w=skill.weapons||[],tags=skill.tags||[],cost=String(skill.cost||'');
 const WM={sword:'Sword',shield:'Shield',bow:'Bow',dagger:'Dagger',axe:'Axe',spear:'Spear',tool:'Engineering'};
 let primary=null;
 for(const x of w)if(WM[x]){primary=primary||WM[x];add(WM[x],2);}
 if(w.includes('focus'))primary=primary||'Necromancy';
 if(tags.some(t=>/Thrown Stone|Throw|Toss/i.test(t))||/stone/.test(skill.id)||skill.id==='loose_bone'){add('Throwing',3);primary=primary||'Throwing';}
 if(tags.some(t=>/Guard|Defense|Barrier/i.test(t))||skill.roles.includes('defense'))add('Shield',skill.method==='magic'?1:2);
 if(/Soul/i.test(cost)||skill.element==='dark'||tags.some(t=>/Soul|Spirit/i.test(t)))add('Soul',2);
 if(skill.method==='tech')add('Engineering',2);
 if(tags.some(t=>/Stealth|Backstab|Decoy/i.test(t))||(skill.domains.includes('shadow')&&skill.roles.includes('mobility')))add('Stealth',skill.roles[0]==='mobility'?1:2);
 if(skill.method==='magic'&&(skill.element==='dark'||skill.domains.includes('death')||/Soul/i.test(cost)))add('Necromancy',2);
 if(!primary&&!Object.keys(g).length)add(MASTERY_WEAPONS[weapon]||'Sword',1);
 else if(!Object.keys(g).length)add(primary,2);
 return g;
}
function activateSkill(p,s,rank){
 const k=s.id.toLowerCase(),text=(s.name+' '+(s.tags||[]).join(' ')).toLowerCase(),roles=s.roles||[],color=COLORS[s.element]||COLORS.neutral;
 // V11: the authored Rank potency curve scales direct attack/projectile damage relative to R1.
 const rankPotency=(s.rankPlan?.[rank-1]?.potency??(100+22*(rank-1)))/100;
 const power=(14+(s.kind==='signature'?17:0)+Math.max(0,scalingStat(p,s)-5)*.8)*rankPotency*(1+passivePower(p).damage);
 const force=rank>=3?1.5:1;
 const status=s.statuses?.find(a=>['chill','wet','shock','root','burn','stagger'].includes(a))||({ice:'chill',water:'wet',lightning:'shock',fire:'burn'}[s.element]||null);
 if(k==='bone_dash'||/dash|slip|step|rush|teleport|shadow walk/.test(text)&&roles.includes('mobility')){
   p.x=clamp(p.x+p.face*(115+18*rank),0,WORLD-p.w);p.iframes=Math.max(p.iframes,.18+.05*rank);addParticles(p.x,p.y,color,9);
   if(rank>=3)meleeSweep(p,55,power*.55,{stat:5,stun:.2,color});return;
 }
 if(k==='bone_leap'||/leap|jump|vault/.test(text)&&roles.includes('mobility')){p.vy=-510-rank*14;p.onGround=false;if(rank>=3)p.iframes=.18;return;}
 // V12.2: triệu hồi và lệnh cho thuộc hạ.
 if(k==='grave_dominion'){for(const a of game.allies){a.buff=Math.max(a.buff||0,6+rank);a.hp=Math.min(a.maxHp,a.hp+a.maxHp*.3);}game.zone={x:p.x-150-rank*20,w:300+rank*40,time:6+rank,color};addParticles(p.x,p.y,color,14);return;}
 if(k==='death_symphony'){for(const a of game.allies){a.buff=Math.max(a.buff||0,5+rank);const e=nearestEnemy(a.x,520);if(e)dealEnemy(e,a.damage*(2+rank*.4),'summon',{color,stun:.25,magic:true});}meleeSweep(p,160+rank*20,power*.8,{stat:5,color,magic:true});return;}
 if(k==='overclock'){for(const a of game.allies)if(a.type==='turret'){a.overclock=5+rank*.5;a.hp=Math.max(1,a.hp);}addParticles(p.x,p.y,color,10);return;}
 if(s.summonType||roles.includes('summon')){
   spawnSummons(p,s,rank,color);if(k==='citadel_protocol')p.shield=Math.min(90,p.shield+12+rank*3);return;
 }
 if(roles.includes('healing')||/mend|heal|restore|recovery/.test(text)&&!roles.includes('attack')){
   p.hp=Math.min(p.maxHP,p.hp+15+rank*9);p.stun=0;if(s.element==='light')delete p.statuses.curse;addParticles(p.x,p.y,'#a0e9b0',12);if(rank>=4)p.shield+=8;return;
 }
 if(k==='brace'||roles.includes('defense')||s.statuses?.includes('barrier')||/shield|ward|oath|veil|guard/.test(text)&&!roles.includes('attack')){
   p.guard=Math.max(p.guard,.5+.22*rank);p.shield=Math.min(90,p.shield+6*rank+(s.kind==='signature'?18:0));if(s.element==='light')delete p.statuses.curse;addParticles(p.x,p.y,'#b9e0e8',12);
   if(rank>=4)meleeSweep(p,68,6+rank*2,{stat:5,stun:.2,color});return;
 }
 if(/trap|snare|mine|grasp|bind|root/.test(text)||roles.includes('control')&&!roles.includes('attack')&&s.method==='tech'){
   game.traps.push({x:clamp(p.x+p.face*(42+10*rank),0,WORLD),y:FLOOR-14,w:54+rank*7,h:16,life:9,damage:roles.includes('attack')?power:0,root:1+rank*.35,color});
   addParticles(p.x+p.face*40,FLOOR-14,color,7);return;
 }
 if(/wind puff|wind wall/.test(text)||s.element==='wind'&&roles.includes('control')&&!roles.includes('attack')){meleeSweep(p,135,rank*2,{knock:200,stun:.15,color});return;}
 if(roles.includes('support')&&!roles.includes('attack')){
    // Mark, curse, prepare, rally: gameplay buffs/debuffs without fake direct damage.
    if(s.statuses.includes('curse')||/mark|hex|curse/.test(text)){
      for(const e of game.enemies)if(e.hp>0&&Math.abs(e.x-p.x)<200+rank*30){e.statuses.curse=3+.5*rank;addParticles(e.x,e.y,color,7);}
    }else{p.shield=Math.min(90,p.shield+rank*4);p.stam=Math.min(p.maxStam,p.stam+rank*8);p.mana=Math.min(p.maxMana,p.mana+rank*5);}
    return;
 }
 if(roles.includes('utility')&&!roles.includes('attack')&&!roles.includes('control')){
    p.stam=Math.min(p.maxStam,p.stam+rank*12);p.mana=Math.min(p.maxMana,p.mana+rank*7);
    if(rank>=3)p.iframes=Math.max(p.iframes,.12+rank*.04);
    addParticles(p.x,p.y,color,6);return;
 }
 if(roles.includes('control')&&!roles.includes('attack')&&!roles.includes('summon')){
    for(const e of game.enemies)if(e.hp>0&&Math.abs(e.x-p.x)<130+rank*18){e.statuses.root=Math.max(e.statuses.root||0,rank*.25+.45);addParticles(e.x,e.y,color,5);}
    return;
 }
 const projectile=s.method==='magic'||s.weapons?.includes('bow')||/throw|shot|bolt|arrow|pulse|mote|fleck|spark|ember|pebble|toss|volley|ghostline/.test(text)||s.tags?.includes('Projectile');
 if(projectile){
   const distance=/aimed|sniper|ghostline/.test(text)?610:390;
   const magicPart=(s.hits||[]).some(h=>h.type==='magical')||s.method==='magic';
   const speed=distance*(rank>=4?1.5:1.1);
   const amount=(rank>=4&&(/volley|split|scatter/.test(text)))?3:1;
   for(let i=0;i<amount;i++){
     const angle=(i-(amount-1)/2)*.14;
     fireProjectile(p.x+p.face*25,p.y+18,p.face*speed,(angle*speed)-(/stone|pebble|toss/.test(text)?85:0),power*force,'player',color,status,rank===5?1:0,magicPart);
   }
   if(s.element!=='neutral')game.elementHits[s.element]=(game.elementHits[s.element]||0)+1;
   return;
 }
 const range=/spear|lance|pierce/.test(text)?165:/axe|cleave|slam/.test(text)?110:82;
 const heavy=/axe|slam|reaper|judgment|verdict|cleave/.test(text);
 meleeSweep(p,range,power*(heavy?1.25:1)*force,{stat:5,stun:rank>=3?.22:0,launch:rank>=4&&/rising|uppercut|launch/.test(text),status,color,magic:(s.hits||[]).some(h=>h.type==='magical'),knock:heavy?190:105});
 if(rank===5){p.shield=Math.min(p.shield+2,50);if(s.kind==='signature')fireProjectile(p.x+p.face*30,p.y+20,p.face*420,0,power*.6,'player',color,status);}
 if(s.element!=='neutral')game.elementHits[s.element]=(game.elementHits[s.element]||0)+1;
}
function processAttack(p,dt){if(!p.attack)return;const a=p.attack;a.time-=dt;
 if(!a.done && a.time<=a.duration-a.delay+.001){
   a.done=true;
   if(a.type==='normal'){
     if(['bow','focus'].includes(a.weapon))fireProjectile(p.x+p.face*25,p.y+20,p.face*a.reach,0,a.damage*(1+(weaponStat(p,a.weapon)-5)*.025)*(1+passivePower(p).damage),'player',a.weapon==='focus'?'#ac9fe6':'#d6d0ab',null,0,a.weapon==='focus');
     else meleeSweep(p,a.reach,a.damage,{stun:a.weapon==='axe'?.3:0,color:'#d6d0ab',single:a.weapon==='dagger',stat:weaponStat(p,a.weapon)});
   }else activateSkill(p,a.skill,a.rank);
 }
 if(a.time<=0)p.attack=null;
}
function applyPhysics(e,dt,mobile=true){
 const prevBottom=e.y+e.h;e.vy+=G*dt;e.y+=e.vy*dt;e.x=clamp(e.x,0,WORLD-e.w);e.onGround=false;
 if(e.vy>=0)for(const plat of platforms){if(e.x+e.w<=plat.x||e.x>=plat.x+plat.w)continue;
   if(prevBottom<=plat.y+7&&e.y+e.h>=plat.y&&e.y+e.h<=plat.y+Math.max(26,e.vy*dt+12)){
     e.y=plat.y-e.h;e.vy=0;e.onGround=true;break;
   }
 }
 if(e.y>CH+140){if(e===game.player){finish(false);}else if(e.hp>0||e.reviveAt){e.hp=0;game.player.kills++;if(e.side){e.reviveAt=0;sideDeath(e,{fell:true});}}}
}
function updatePlayer(dt){const p=game.player;if(!p||p.hp<=0)return;
 for(const k of Object.keys(p.statuses)){p.statuses[k]-=dt;if(p.statuses[k]<=0)delete p.statuses[k];}
 // V13: trạng thái quái phụ gây lên người chơi (Đốt/Độc/Chảy máu mất máu theo giây, Lạnh chậm, Trói đứng yên).
 const st=p.statuses,dot=(st.burn?3:0)+(st.poison?2:0)+(st.bleed?(Math.abs(p.vx)>40?3:2):0);
 if(dot>0){p.hp=Math.max(0,p.hp-dot*dt);p.damageTaken+=dot*dt;if(p.hp<=0){finish(false);return;}}
 const slow=(st.chill?.65:1)*(st.root?0:1);
 p.stun=Math.max(0,p.stun-dt);p.iframes=Math.max(0,p.iframes-dt);p.guard=Math.max(0,p.guard-dt);p.normalCD=Math.max(0,p.normalCD-dt);p.dodgeCD=Math.max(0,p.dodgeCD-dt);p.dodgeTime=Math.max(0,p.dodgeTime-dt);p.comboTimer=Math.max(0,p.comboTimer-dt);p.hitConfirm=Math.max(0,p.hitConfirm-dt);p.attackTimer=Math.max(0,p.attackTimer-dt);
 for(const id in p.cooldowns)p.cooldowns[id]=Math.max(0,p.cooldowns[id]-dt);
 const passive=passivePower(p);p.stam=Math.min(p.maxStam,p.stam+dt*(passive.bonus?18:15));p.mana=Math.min(p.maxMana,p.mana+dt*9);
 if(p.stun<=0){
   if(input.left&&!input.right){p.face=-1;p.vx=-(200+p.stats.AGI*2+passive.speed)*(p.dodgeTime>0?2.2:1)*slow;}
   else if(input.right&&!input.left){p.face=1;p.vx=(200+p.stats.AGI*2+passive.speed)*(p.dodgeTime>0?2.2:1)*slow;}
   else p.vx*=Math.max(0,1-dt*10);
   if(input.jump&&p.onGround&&!st.root){p.vy=-472-passive.jump;p.onGround=false;p.jumpCount++;gainMastery('Stealth',.1);input.jump=false;}
   if(input.dodge&&p.dodgeCD===0&&p.stam>=17){p.stam-=17;p.dodgeCD=1.2;p.dodgeTime=.23;p.iframes=Math.max(p.iframes,.26);p.vx=p.face*440;gainMastery('Stealth',1);input.dodge=false;}
   if(input.normal)normalAttack();
   for(const key of ['skill1','skill2','skill3','signature'])if(input[key]){castSlot({skill1:'active1',skill2:'active2',skill3:'active3',signature:'signature1'}[key]);input[key]=false;}
 }
 if(p.dodgeTime>0)p.vx=p.face*420;
 p.x+=p.vx*dt;processAttack(p,dt);applyPhysics(p,dt);
 if(passive.light&&!p.onGround&&input.left)p.x-=10*dt;
 for(const item of game.pickups)if(!item.taken&&Math.abs(item.x-p.x)<36&&Math.abs(item.y-p.y)<60){item.taken=true;game.collected++;
   if(item.type==='mana'){p.mana=Math.min(p.maxMana,p.mana+item.amount);continue;}
   p.hp=Math.min(p.maxHP,p.hp+(item.amount+(passive.scavenge?item.amount/2:0))*(st.curse?.5:1));p.stam=Math.min(p.maxStam,p.stam+(item.stam??22));}
 // Quái phụ không bắt buộc: cổng chỉ chờ đối thủ chính của màn.
 if(p.x>FINISH&&game.enemies.every(e=>e.side||e.hp<=0))finish(true);
}
// ===== V12.2 THUỘC HẠ =====
// Quân gọi ra có cấp = tier skill − 1 và máu mỏng (so với grunt 52 HP): lính T1 ~20 HP, kỵ sĩ T3 ~45 HP.
const SUMMON_BASE={turret:{hp:22,dmg:5,speed:0,range:400,rate:.8,w:22,h:20},ranged:{hp:16,dmg:4,speed:120,range:340,rate:1.1,w:20,h:30},
 melee:{hp:20,dmg:5,speed:150,range:44,rate:1.0,w:22,h:34},hound:{hp:14,dmg:4,speed:230,range:40,rate:.7,w:26,h:18}};
function nearestEnemy(x,maxDist,prefer=null){const list=game.enemies.filter(e=>e.hp>0&&!e.hidden&&Math.abs(e.x-x)<maxDist);
 list.sort((a,b)=>((prefer&&b.statuses[prefer]?1:0)-(prefer&&a.statuses[prefer]?1:0))||Math.abs(a.x-x)-Math.abs(b.x-x));return list[0];}
function spawnSummons(p,s,rank,color){
 const type=s.summonType||'melee',base=SUMMON_BASE[type],unitTier=Math.max(0,s.tier-1),count=(s.summonCount||1)+(rank>=5&&s.id==='raise_skeleton'?1:0)+(rank>=3&&s.id==='hunt_call'?1:0);
 const knight=s.id==='bone_knight',sig=s.kind==='signature';
 const intBonus=Math.max(0,p.stats.INT-5)*.3;
 for(let i=0;i<count;i++){
  const hp=Math.round((base.hp+8*unitTier+4*rank)*(knight?2:1)*(count>1?.7:1)*(sig?.8:1));
  const dmg=(base.dmg+1.5*unitTier+rank+intBonus*.5)*(sig?.9:1);
  game.allies.push({type,id:Math.floor(Math.random()*1e9),skill:s.id,x:p.x+p.face*(28+i*26),y:p.y+p.h-base.h,w:base.w,h:base.h,vx:0,vy:0,onGround:false,face:p.face,
   hp,maxHp:hp,damage:dmg,speed:base.speed*(1+rank*.04),range:base.range+(type==='ranged'?20*rank:0),rate:base.rate,time:(type==='turret'?12:9)+2*rank+(knight?4:0),cooldown:.6,
   guard:knight,prefer:type==='hound'?'curse':null,stun:0,color,buff:0,overclock:0});
 }
 const cap=p.build.summonCap||2;while(game.allies.length>cap)game.allies.shift();
 addParticles(p.x,p.y,color,9);
}
function damageAlly(a,amount,source){a.hp-=amount;a.stun=Math.max(a.stun,.15);addParticles(a.x+a.w/2,a.y+8,'#d9b4a6',5);if(a.hp<=0)addParticles(a.x+a.w/2,a.y,'#8c7f8a',10);}
function updateAllies(dt){const p=game.player;
 for(const a of game.allies){a.time-=dt;a.cooldown-=dt;a.stun=Math.max(0,a.stun-dt);if(a.buff>0)a.buff-=dt;if(a.overclock>0){a.overclock-=dt;a.hp-=dt*(a.maxHp*.06);}
  const mult=(a.buff>0?1.5:1)*(game.zone&&a.x>game.zone.x&&a.x<game.zone.x+game.zone.w?1.3:1);
  if(a.type==='turret'){a.vx=0;
   if(a.cooldown<=0){const e=nearestEnemy(a.x,a.range);if(e){fireProjectile(a.x+a.w/2,a.y+10,Math.sign(e.x-a.x)*380,0,a.damage*mult,'player',a.color,null,a.skill==='siege_turret'?1:0);a.cooldown=a.rate*(a.overclock>0?.5:1);}}
  }else if(a.stun>0){a.vx=0;}
  else{
   const e=nearestEnemy(a.x,460,a.prefer);
   if(a.type==='ranged'){
     const near=nearestEnemy(a.x,70);
     if(near){a.vx=(a.x<near.x?-1:1)*a.speed;}
     else if(e){a.face=e.x>=a.x?1:-1;a.vx=0;if(a.cooldown<=0){fireProjectile(a.x+a.w/2,a.y+10,a.face*360,0,a.damage*mult,'player',a.color,a.skill==='bone_archer'?'chill':null);a.cooldown=a.rate;}}
     else{const d=p.x-a.x;a.vx=Math.abs(d)>90?Math.sign(d)*a.speed:0;}
   }else{ // melee / hound
     if(e){const d=e.x-a.x;a.face=d>=0?1:-1;
       if(Math.abs(d)<a.range+e.w/2&&Math.abs(e.y-a.y)<70){a.vx=0;if(a.cooldown<=0){dealEnemy(e,a.damage*mult*(a.prefer&&e.statuses[a.prefer]?1.5:1),'summon',{color:a.color,stun:a.guard?.3:a.type==='hound'?0:.12,magic:a.type==='hound'});a.cooldown=a.rate;}}
       else a.vx=a.face*a.speed;
     }else{const d=p.x-a.x-p.face*40;a.vx=Math.abs(d)>30?Math.sign(d)*a.speed:0;}
   }
  }
  if(a.type==='hound'){a.x+=a.vx*dt;a.y=Math.min(a.y,FLOOR-a.h);}else{if(a.onGround&&Math.abs(a.vx)>0&&((a.x>915&&a.x<1060)||(a.x>1790&&a.x<1930)))a.vy=-455;a.x+=a.vx*dt;applyPhysics(a,dt);}
  a.x=clamp(a.x,0,WORLD-a.w);
 }
 if(game.zone){game.zone.time-=dt;if(game.zone.time<=0)game.zone=null;}
 game.allies=game.allies.filter(a=>a.time>0&&a.hp>0&&a.y<CH+40);
}
// ===== V13 QUÁI PHỤ =====
// Dữ liệu ở ../shared/bestiary (họ, kiểu, cỡ, cấp, biến tố, vùng); ở đây chỉ có luật chạy: AI theo kiểu, luật họ, biến tố, rơi đồ.
// Quái phụ nằm chung game.enemies với cờ side để skill/thuộc hạ/đạn đánh được, nhưng không chặn cổng cuối màn.
let BESTIARY=null;
function bestiary(){if(!BESTIARY&&window.JobLibrary?.bestiary){const b=window.JobLibrary.bestiary();if(b.errors.length)console.warn('Bestiary lỗi dữ liệu:',b.errors);else BESTIARY=b;}return BESTIARY;}
const SIDE_NESTS=[430,1180,1640,2040,2390];
const SIDE_COUNT={solo:2,group:3,elite:3,boss:2,training:2,trial:2},SIDE_ELITE={elite:.15,boss:.1};
const SIDE_WINDUP={pacer:.4,chaser:.38,charger:.6,leaper:.45,flyer:.5,spitter:.6,ambusher:.25,rooted:.3};
const SMALLER={XL:'L',L:'M',M:'S',S:'S'};
const FAMILY_COLOR={beast:'#a98b6d',magical_beast:'#8f7fb8',dragon:'#a5584a',insect:'#7c8a55',ooze:'#6fae7a',plant:'#5d8a4a',undead:'#9aa39a',elemental:'#d9c27a',construct:'#8b8d91',fiend:'#a2464f',spirit:'#a9c4e8',avian:'#6d6a7c'};
const STATUS_COLOR={burn:'#f4a265',poison:'#8fd14f',bleed:'#b0352f',chill:'#a8ebfc',curse:'#bf9ee7',root:'#86b87f'};
function spawnSide(mode,tier,biome){const B=bestiary();if(!B?.biomes[biome])return [];
 const nests=[...SIDE_NESTS].sort(()=>Math.random()-.5).slice(0,SIDE_COUNT[mode]||2).sort((a,b)=>a-b),out=[];
 for(const x of nests){const r=B.roll(biome,tier,{eliteBonus:SIDE_ELITE[mode]||0});if(r)out.push(...makeSide(r.species,r.grade,r.affixes,r.count,x,{tier}));}
 return out;
}
function makeSide(s,grade,affixes,count,x,extra={}){
 const B=bestiary(),tier=extra.tier??game.tier,sp=extra.size?{...s,size:extra.size}:s,st=B.stats(sp,grade,tier,affixes),beh=s.behavior,list=[];
 const ranged=beh==='spitter'||(beh==='rooted'&&!!st.status&&st.status!=='root');
 const recovery=1.1+({S:-.2,M:0,L:.3,XL:.5}[sp.size]||0);
 for(let i=0;i<count;i++){
  const ex=clamp(x+(i-(count-1)/2)*Math.max(36,st.w+10),20,WORLD-st.w-20),hoverY=170+rand(-25,35);
  list.push({id:Math.floor(Math.random()*1e9),side:true,sp:s,fam:s.family,beh,size:sp.size,grade,affixes:[...affixes],
   x:ex,y:st.flying?hoverY:(extra.bottom??FLOOR)-st.h,w:st.w,h:st.h,vx:0,vy:0,onGround:false,face:-1,hp:st.hp,maxHP:st.hp,speed:st.speed,
   range:ranged?260:Math.round(st.w*.5+26),damage:st.dmg,windup:SIDE_WINDUP[beh]||.45,recovery,cooldown:rand(.6,1.4),charge:0,stun:0,iframes:.3,kind:'side',phase:0,statuses:{},flash:0,
   armor:st.armor,baseArmor:st.armor,magicResist:st.magicResist,knock:st.knock,flying:st.flying,status:st.status,color:st.color,bounty:extra.child||extra.minion?1:st.bounty,
   home:ex,hoverY,state:'idle',hidden:beh==='ambusher',ranged,mult:1,touchCD:0,lastHit:-9,child:!!extra.child,minion:!!extra.minion,alt:0,attackKind:null});
 }
 return list;
}
function groundAhead(e,dir=e.face){const fx=dir>0?e.x+e.w+4:e.x-4,foot=e.y+e.h;return platforms.some(q=>fx>=q.x&&fx<=q.x+q.w&&Math.abs(q.y-foot)<6);}
function groundBelow(x,y){let best=null;for(const q of platforms)if(x>=q.x&&x<=q.x+q.w&&q.y>=y-4&&(best===null||q.y<best))best=q.y;return best??FLOOR;}
// Luật họ khi nhận đòn: hư thể, nhầy, thân nguyên tố, vảy rồng (sau lưng/lúc hít hơi), thảo yêu sợ lửa.
function sideTakenMult(e,o,source){const magic=!!o.magic,p=game.player;let m=1;
 if(e.fam==='spirit'&&!magic)m*=.5;
 if(e.fam==='ooze')m*=magic?1.3:.7;
 if(e.fam==='elemental'&&!magic)m*=.75;
 if(e.fam==='dragon'&&(e.breath||((p.x+p.w/2)-(e.x+e.w/2))*e.face<0))m*=1.35;
 if(e.fam==='plant'&&source==='burn')m*=2;
 return m;
}
function applyPlayerStatus(k,dur=2.5){const p=game.player;if(!k||p.hp<=0)return;if(k==='shock'){p.stun=Math.max(p.stun,.25);return;}p.statuses[k]=Math.max(p.statuses[k]||0,k==='root'?1:dur);}
function healSide(e,amt){if(amt>0&&e.hp>0){e.hp=Math.min(e.maxHP,e.hp+amt);addParticles(e.x+e.w/2,e.y,'#c23a4a',4);}}
function hitPlayerBy(e,dmg,src=e){const dealt=damagePlayer(dmg,src);if(!dealt)return 0;
 let st=e.status;if(!st&&e.fam==='insect'&&Math.random()<.25)st='poison';
 if(st)applyPlayerStatus(st);
 if(e.affixes.includes('frostbound'))applyPlayerStatus('chill',2);
 if(e.fam==='fiend'){applyPlayerStatus('curse',3);healSide(e,dealt*.3);}
 if(e.affixes.includes('vampiric'))healSide(e,dealt*.4);
 return dealt;
}
function sideStrike(e,t,mult=1){const dmg=e.damage*e.mult*mult;if(t===game.player)hitPlayerBy(e,dmg);else damageAlly(t,dmg*(t.guard?.7:1),e);}
function sideContact(e,t,mult){if(!e.contact)return;const p=game.player;
 if(hit(e,p)){sideStrike(e,p,mult);e.contact=false;}else if(t!==p&&hit(e,t)){sideStrike(e,t,mult);e.contact=false;}}
function sideShot(e,t){const cx=e.x+e.w/2,cy=e.y+e.h*.4,dx=(t.x+t.w/2)-cx,dy=(t.y+t.h/2)-cy,len=Math.max(1,Math.hypot(dx,dy)),arc=e.fam==='plant';
 const q=fireProjectile(cx,cy,arc?clamp(dx/.58,-420,420):dx/len*300,arc?-260:e.flying?dy/len*300:0,e.damage*e.mult,'enemy',e.color||'#d7c7a0',null,0,true);
 q.owner=e;q.life=2.2;if(arc)q.grav=900;
}
function sideBreath(e){for(const vy of [-50,0,50]){const q=fireProjectile(e.face>0?e.x+e.w:e.x,e.y+e.h*.35,e.face*340,vy+(e.flying?200:0),e.damage*e.mult*.8,'enemy',e.color||'#f4a265',null,0,true);q.owner=e;q.life=.5;}}
function coreBurst(e){e.coreBurst=true;e.speed*=1.25;
 for(const dir of [-1,1]){const q=fireProjectile(e.x+e.w/2,e.y+e.h*.4,dir*320,0,e.damage*.8,'enemy',e.color||'#c9a6ff',null,0,true);q.owner=e;q.life=1.4;}
 addParticles(e.x+e.w/2,e.y+e.h/2,e.color||'#c9a6ff',16);
}
function sideDeath(e,o={}){
 if(e.fam==='undead'&&!e.revived&&!o.fell&&!o.magic&&!e.lastBurn){e.revived=true;e.reviveAt=game.clock+1.5;return;}
 const cx=e.x+e.w/2,gy=groundBelow(cx,e.y+e.h)-14;
 if(!o.fell){
  if(e.fam==='ooze'&&!e.child&&e.size!=='S')game.enemies.push(...makeSide(e.sp,'normal',[],2,e.x,{child:true,size:SMALLER[e.size],bottom:e.y+e.h}));
  if(e.affixes.includes('volatile'))game.fx.push({x:cx,y:e.y+e.h/2,t:.8,r:90,dmg:e.damage*1.2,color:'#ffb347'});
  if(e.fam==='magical_beast')game.pickups.push({x:cx,y:gy,taken:false,type:'mana',amount:18});
  if(e.grade!=='normal'||Math.random()<.25)game.pickups.push({x:cx+8,y:gy,taken:false,type:'hp',amount:e.grade==='normal'?10:20,stam:8});
 }
 game.hunt.kills.push({species:e.sp.id,grade:e.grade,bounty:e.bounty});
 if(e.grade!=='normal')message(`Hạ ${bestiary().grades[e.grade].nameVi} ${e.sp.nameVi} · +${e.bounty} Chiến tích khi thắng màn`);
}
function updateSideFx(dt){
 for(const e of game.enemies)if(e.side&&e.reviveAt&&game.clock>=e.reviveAt){e.reviveAt=0;e.hp=Math.round(e.maxHP*.4);e.stun=.3;addParticles(e.x+e.w/2,e.y,'#9aa39a',12);}
 for(const f of game.fx){f.t-=dt;if(f.t>0)continue;const p=game.player;
  if(Math.abs(p.x+p.w/2-f.x)<f.r&&Math.abs(p.y+p.h/2-f.y)<f.r)damagePlayer(f.dmg,{x:f.x});
  for(const a of game.allies)if(Math.abs(a.x+a.w/2-f.x)<f.r)damageAlly(a,f.dmg,f);
  addParticles(f.x,f.y,f.color,22);}
 game.fx=game.fx.filter(f=>f.t>0);
}
function sideChoose(e,abs,dy){
 const near=abs<e.range+e.w*.5&&Math.abs(dy)<70;
 if(e.fam==='dragon'&&abs<200&&(e.flying||Math.abs(dy)<80)&&e.alt++%2===0)return 'breath';
 switch(e.beh){
  case 'charger':return abs<330&&abs>70&&Math.abs(dy)<60?'dash':near?'melee':null;
  case 'leaper':return abs<240&&abs>55&&Math.abs(dy)<90?'leap':near?'melee':null;
  case 'flyer':return abs<170&&dy>-20?'dive':null;
  case 'spitter':return abs<330?'shot':null;
  case 'rooted':return e.ranged&&abs<290?'shot':abs<110&&Math.abs(dy)<70?'melee':null;
  default:return near?'melee':null;
 }
}
function sideRelease(e,t,d,abs,dy){const k=e.attackKind;e.cooldown=e.recovery;e.breath=false;
 if(k==='melee'){if(abs<e.range+e.w*.5+25&&Math.abs(dy)<75)sideStrike(e,t);}
 else if(k==='shot')sideShot(e,t);
 else if(k==='breath')sideBreath(e);
 else if(k==='dash'){e.dash=.55;e.dashSpeed=Math.max(330,e.speed*3.2);e.contact=true;e.cooldown+=.55;}
 else if(k==='leap'){e.leaping=true;e.contact=true;e.vy=-430;e.vx=clamp(d*1.6,-380,380);e.onGround=false;}
 else if(k==='dive'){const len=Math.max(1,Math.hypot(d,dy));e.diving=.7;e.dvx=d/len*440;e.dvy=Math.max(120,dy/len*440);e.contact=true;e.cooldown+=.7;}
}
// Hướng đi mong muốn theo kiểu di chuyển (rules.behaviors), trả về vận tốc ngang.
function sideIntent(e,d,abs){const dir=d>=0?1:-1,sp=e.speed*e.mult*(e.statuses.chill?.55:1);
 if(e.beh==='rooted')return 0;
 if(e.state==='home'){const h=e.home-e.x;if(Math.abs(h)>=10)e.face=Math.sign(h);return Math.abs(h)<10?0:Math.sign(h)*sp*.7;}
 if(e.state==='idle'){
  if(e.beh==='pacer'||e.flying){if(Math.abs(e.x-e.home)>80)e.face=e.home>e.x?1:-1;else if(!e.flying&&!groundAhead(e))e.face=-e.face;return e.face*sp*.45;}
  return 0;
 }
 e.face=dir;
 switch(e.beh){
  case 'pacer':return Math.abs(e.x+dir*20-e.home)<170&&abs>e.range*.6?dir*sp*.7:0;
  case 'charger':return abs>260?dir*sp:0;
  case 'leaper':return abs>210?dir*sp:abs<70?-dir*sp*.8:0;
  case 'spitter':return abs<120?-dir*sp:abs>300?dir*sp:0;
  case 'flyer':return abs>120?dir*sp:0;
  default:return abs>e.range*.7?dir*sp:0;
 }
}
function sideMove(e,dt,vx){
 if(e.flying){e.vx=vx;e.x=clamp(e.x+vx*dt,0,WORLD-e.w);
  const t=e.state==='hunt'&&e.beh==='flyer'?enemyTarget(e):null;
  const goal=(t?Math.min(e.hoverY+40,t.y-90):e.hoverY)+Math.sin(game.clock*2.4+e.id%7)*14;
  e.y+=(Math.max(90,goal)-e.y)*Math.min(1,dt*2.5);e.vy=0;return;
 }
 if(e.onGround)e.vx=vx;
 // Không tự đi ra khỏi mép; kẻ truy đuổi nhảy qua hố như đối thủ chính.
 if(e.onGround&&e.vx&&!groundAhead(e,Math.sign(e.vx))){if(e.beh==='chaser'||e.beh==='ambusher')e.vy=-455;else e.vx=0;}
 e.x+=e.vx*dt;applyPhysics(e,dt);
}
function updateSide(e,dt){
 const t=enemyTarget(e),d=(t.x+t.w/2)-(e.x+e.w/2),abs=Math.abs(d),dy=(t.y+t.h/2)-(e.y+e.h/2);
 e.cooldown=Math.max(0,e.cooldown-dt);e.touchCD=Math.max(0,e.touchCD-dt);
 // Luật họ và biến tố chạy mỗi khung.
 e.mult=e.fam==='beast'&&game.enemies.some(o=>o!==e&&o.side&&o.hp>0&&o.fam==='beast'&&Math.abs(o.x-e.x)<220)?1.25:1;
 const quiet=game.clock-e.lastHit;
 if(e.fam==='plant'&&quiet>3)e.hp=Math.min(e.maxHP,e.hp+e.maxHP*.03*dt);
 if(e.affixes.includes('regenerating')&&quiet>2)e.hp=Math.min(e.maxHP,e.hp+e.maxHP*.02*dt);
 if(e.fam==='magical_beast'&&!e.coreBurst&&e.hp<e.maxHP*.4)coreBurst(e);
 if(e.affixes.includes('frenzied')&&!e.frenzy&&e.hp<e.maxHP*.5){e.frenzy=true;e.speed*=1.4;e.recovery*=.7;addParticles(e.x+e.w/2,e.y,'#ff7a5c',10);}
 if(e.affixes.includes('summoner')&&!e.called&&e.hp<e.maxHP*.6){e.called=true;game.enemies.push(...makeSide(e.sp,'normal',[],2,e.x,{minion:true,size:SMALLER[e.size],bottom:e.y+e.h}));}
 e.armor=e.baseArmor-(e.statuses.armor_break&&e.affixes.includes('armored')?4:0);
 if(e.fam==='elemental'&&!e.touchCD&&!e.hidden&&hit(e,game.player)){hitPlayerBy(e,e.damage*.5);e.touchCD=1;}
 if(e.hidden){e.vx=0;
  if(abs<110&&Math.abs(dy)<90){e.hidden=false;e.state='hunt';e.face=d>=0?1:-1;e.charge=e.windup;e.attackKind='melee';addParticles(e.x+e.w/2,e.y+e.h,e.color||'#6a5a7a',10);}
  applyPhysics(e,dt);return;
 }
 if(e.stun>0||(e.statuses.root&&!e.flying)){e.vx=0;e.charge=0;e.dash=0;e.diving=0;e.contact=false;if(!e.flying||e.fam!=='spirit')applyPhysics(e,dt);return;}
 const aggro=e.beh==='rooted'?(e.ranged?290:110):e.beh==='pacer'?230:e.flying?380:360,leash=e.fam==='construct'?300:600;
 if(e.state==='idle'&&abs<aggro&&Math.abs(dy)<(e.flying?300:170))e.state='hunt';
 else if(e.state==='hunt'&&e.beh!=='rooted'&&(abs>aggro+260||(Math.abs(e.x-e.home)>leash&&abs>140)))e.state='home';
 else if(e.state==='home'&&(Math.abs(e.x-e.home)<24||abs<aggro*.5))e.state=Math.abs(e.x-e.home)<24?'idle':'hunt';
 if(e.charge>0){e.charge-=dt;if(e.charge<=0)sideRelease(e,t,d,abs,dy);sideMove(e,dt,0);return;}
 if(e.dash>0){e.dash-=dt;if(!groundAhead(e)){e.dash=0;e.vx=0;e.stun=.35;}else e.vx=e.face*e.dashSpeed;
  sideContact(e,t,1.2);if(e.dash<=0)e.contact=false;e.x+=e.vx*dt;applyPhysics(e,dt);return;}
 if(e.leaping){sideContact(e,t,1);e.x+=e.vx*dt;applyPhysics(e,dt);if(e.onGround&&e.vy>=0){e.leaping=false;e.contact=false;}return;}
 if(e.diving>0){e.diving-=dt;sideContact(e,t,1);e.x=clamp(e.x+e.dvx*dt,0,WORLD-e.w);e.y=Math.min(e.y+e.dvy*dt,groundBelow(e.x+e.w/2,e.y)-e.h);if(e.diving<=0)e.contact=false;return;}
 if(e.state==='hunt'&&e.cooldown===0){const k=sideChoose(e,abs,dy);
  if(k){e.attackKind=k;e.face=d>=0?1:-1;e.charge=k==='breath'?.7:e.windup;e.breath=k==='breath';sideMove(e,dt,0);return;}}
 sideMove(e,dt,sideIntent(e,d,abs));
}
function drawSide(e){
 const fc=e.flash>0?'#f8ebcd':FAMILY_COLOR[e.fam]||'#b2bdb6',ac=e.color||'#e8dcc0',x=e.x,y=e.y,w=e.w,h=e.h,f=e.face,cx=x+w/2;
 if(e.hidden){rect(cx-8,FLOOR-5,4,3,ac);rect(cx+4,FLOOR-5,4,3,ac);return;}
 shadow(e.flying?x+w*.2:x,FLOOR,e.flying?w*.6:w);
 if(e.reviveAt){rect(x,y+h-8+Math.sin(game.clock*40),w,8,fc);return;}   // xác Bất Tử đang rung, sắp dậy
 const aura=bestiary()?.grades[e.grade]?.aura,flap=Math.sin(game.clock*14+e.id%9)*h*.35,leg=Math.abs(e.vx)>5?Math.sin(game.clock*16)*2:0;
 if(aura){ctx.strokeStyle=aura;ctx.lineWidth=2;ctx.strokeRect(x-4,y-4,w+8,h+8);}
 ctx.save();if(e.fam==='spirit')ctx.globalAlpha=.62;
 const tri=(ax,ay,bx,by,qx,qy,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.lineTo(qx,qy);ctx.closePath();ctx.fill();};
 const blob=(ex,ey,rx,ry,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(ex,ey,Math.max(1,rx),Math.max(1,ry),0,0,Math.PI*2);ctx.fill();};
 const hs=h*.45,hx=f>0?x+w-hs*.6:x-hs*.4,hy=y+h*.12;
 switch(e.fam){
  case 'beast':case 'magical_beast':case 'dragon':
   rect(x,y+h*.3,w,h*.45,fc);rect(hx,hy,hs,hs,fc);
   for(const i of [.08,.28,.62,.82])rect(x+w*i,y+h*.72,Math.max(3,w*.08),h*.28+(i<.5?leg:-leg),fc);
   if(e.fam==='magical_beast')rect(x+w*.1,y+h*.3,w*.8,3,ac);
   if(e.fam==='dragon'){rect(f>0?x-w*.25:x+w,y+h*.4,w*.25,4,fc);rect(hx+hs*.2,hy-6,3,7,'#e8dcc0');rect(hx+hs*.65,hy-6,3,7,'#e8dcc0');
    if(e.flying){tri(cx-w*.2,y+h*.32,cx+w*.2,y+h*.32,cx,y+h*.32-h*.5-flap,'#7d4338');}}
   break;
  case 'insect':
   blob(cx,y+h*.55,w*.5,h*.4,fc);ctx.strokeStyle=fc;ctx.lineWidth=2;ctx.beginPath();
   for(const i of [-.3,0,.3]){ctx.moveTo(cx+w*i,y+h*.7);ctx.lineTo(cx+w*i-6,y+h+leg);ctx.moveTo(cx+w*i,y+h*.7);ctx.lineTo(cx+w*i+6,y+h-leg);}ctx.stroke();break;
  case 'ooze':{const sq=Math.sin(game.clock*6+e.id%5)*.08;ctx.fillStyle=fc;ctx.beginPath();ctx.ellipse(cx,y+h,w*.5*(1+sq),h*(1-sq),0,Math.PI,0);ctx.fill();break;}
  case 'plant':rect(cx-3,y+h*.4,6,h*.6,'#4a6b3a');blob(cx,y+h*.3,w*.45,h*.3,fc);rect(f>0?cx:cx-w*.35,y+h*.28,w*.35,3,'#2a1a1a');break;
  case 'undead':case 'fiend':
   rect(x+w*.28,y,w*.44,h*.3,fc);rect(x+w*.2,y+h*.3,w*.6,h*.42,fc);rect(x+w*.25,y+h*.72,w*.15,h*.28+leg,fc);rect(x+w*.6,y+h*.72,w*.15,h*.28-leg,fc);
   rect(f>0?x+w*.75:x,y+h*.38,w*.25,4,fc);
   if(e.fam==='fiend'){tri(cx,y+h*.35,cx-w*.7,y+h*.1-flap*.4,cx-w*.3,y+h*.5,'#6e2a33');tri(cx,y+h*.35,cx+w*.7,y+h*.1-flap*.4,cx+w*.3,y+h*.5,'#6e2a33');}
   break;
  case 'elemental':blob(cx,y+h/2,w*.5,h*.5,ac+'88');blob(cx,y+h/2,w*.3,h*.3,fc);break;
  case 'construct':rect(x,y+h*.15,w,h*.85,fc);rect(f>0?x+w*.15:x+w*.7,y,w*.15,h*.2,'#5a5c60');rect(x,y+h*.45,w,3,e.statuses.armor_break?'#ffd27a':'#6d6f73');break;
  case 'spirit':blob(cx,y+h*.4,w*.5,h*.4,fc);for(const i of [-.3,0,.3])tri(cx+w*i-5,y+h*.6,cx+w*i+5,y+h*.6,cx+w*i,y+h+Math.sin(game.clock*8+i*9)*3,fc);break;
  case 'avian':blob(cx,y+h*.55,w*.45,h*.35,fc);tri(cx-w*.1,y+h*.5,cx-w*.6,y+h*.5-flap,cx-w*.2,y+h*.7,fc);tri(cx+w*.1,y+h*.5,cx+w*.6,y+h*.5-flap,cx+w*.2,y+h*.7,fc);
   tri(f>0?x+w:x,y+h*.45,f>0?x+w+8:x-8,y+h*.52,f>0?x+w:x,y+h*.6,'#d9b45a');break;
 }
 ctx.restore();
 const ey=['beast','magical_beast','dragon'].includes(e.fam)?hy+hs*.3:y+h*.22;
 rect(f>0?x+w*.72:x+w*.18,ey,3,3,e.status?ac:'#24313c');
 if(e.charge>0){rect(cx-3,y-20,6,9,'#ef987e');const k=e.attackKind;
  if(k==='melee'||k==='breath'){const r=k==='breath'?200:e.range;ctx.fillStyle=k==='breath'?ac+'55':'#f6b27e55';ctx.fillRect(f>0?x+w:x-r,y,r,h);}
  else if(k==='dash'){ctx.fillStyle='#f6b27e33';ctx.fillRect(f>0?x+w:x-300,y+h*.5,300,h*.5);}}
 if(e.statuses.root)rect(x,y+h-6,w,6,'#86b87f');
 rect(x,y-8,w,4,'#34494a');rect(x,y-8,w*Math.max(0,e.hp/e.maxHP),4,aura||'#d7a07a');
 if(aura){const B=bestiary();ctx.font='bold 11px system-ui';ctx.fillStyle=aura;ctx.textAlign='center';
  ctx.fillText(`★ ${e.sp.nameVi}${e.affixes.length?' · '+e.affixes.map(a=>B.affixes[a].nameVi).join(', '):''}`,cx,y-13);ctx.textAlign='left';}
}
// Địch chọn mục tiêu gần nhất trong số người chơi và thuộc hạ (trừ oán linh bay).
function enemyTarget(e){let best=game.player,bd=Math.abs(game.player.x-e.x);
 for(const a of game.allies){if(a.type==='hound')continue;const d=Math.abs(a.x-e.x);if(d<bd){bd=d;best=a;}}return best;}
function updateEnemies(dt){const p0=game.player;
 updateSideFx(dt);
 for(const e of game.enemies){if(e.hp<=0)continue;
  e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,e.stun-dt);e.iframes=Math.max(0,e.iframes-dt);
  for(const k of Object.keys(e.statuses)){e.statuses[k]-=dt;if(e.statuses[k]<=0)delete e.statuses[k];}
  if(e.statuses.burn && Math.random()<dt*2)dealEnemy(e,2,'burn',{color:COLORS.fire});
  if(e.side){if(e.hp>0)updateSide(e,dt);continue;}
  if(e.stun>0||e.statuses.root){e.vx=0;applyPhysics(e,dt);continue;}
  const p=enemyTarget(e);
  const d=p.x-e.x,abs=Math.abs(d);e.face=d>=0?1:-1;
  e.cooldown=Math.max(0,e.cooldown-dt);
  if(e.kind==='boss'&&e.hp<e.maxHP*.5&&e.phase===0){e.phase=1;e.windup=.54;e.recovery=.95;e.damage=Math.ceil(e.damage*1.22);addParticles(e.x+e.w/2,e.y,'#ffb4bb',18);}
  if(e.charge>0){e.charge-=dt;e.vx=0;
    if(e.charge<=0){
       if(e.kind==='boss'){
         const burst=e.hp<e.maxHP*.5?2:1;for(let n=0;n<burst;n++)fireProjectile(e.x+e.w/2,e.y+22,e.face*(290+n*60),0,e.damage*.75,'enemy','#f3a1ba');
       }
       if(e.kind==='caster'){fireProjectile(e.x+e.face*22,e.y+16,e.face*290,0,e.damage,'enemy','#dd93df');}
       else if(abs<e.range+25&&Math.abs(p.y-e.y)<70){if(p===game.player)damagePlayer(e.damage,e);else damageAlly(p,e.damage*(p.guard?.7:1),e);}
       e.cooldown=e.recovery;
    }
  }else if(abs<e.range&&Math.abs(p.y-e.y)<68&&e.cooldown===0){e.charge=e.windup;}
  else if(e.kind==='caster'&&abs<300&&abs>75&&e.cooldown===0){e.charge=e.windup;}
  else if(abs<440){
    const preferred=e.kind==='caster'?200:e.range*.7;
    e.vx=abs>preferred?e.face*e.speed*(e.statuses.chill?.55:1):0;
  }else e.vx=0;
  // Jump small gaps and ledges when pursuing, but retain fall risk.
  if(e.onGround&&abs>65&&((e.x>915&&e.x<1060)||(e.x>1790&&e.x<1930)))e.vy=-455;
  e.x+=e.vx*dt;applyPhysics(e,dt);
 }
}
function updateProjectiles(dt){for(const q of game.projectiles){q.life-=dt;if(q.grav)q.vy+=q.grav*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
 if(q.side==='player')for(const e of game.enemies){if(e.hp>0&&!e.hidden&&hit(q,e)&&!q.hitIds.has(e.id)){q.hitIds.add(e.id);dealEnemy(e,q.damage,'projectile',{status:q.status==='chill'?'chill':q.status,color:q.color,magic:q.magic,stun:q.status==='stagger'?.3:0});if(q.pierce<=0){q.life=0;break;}q.pierce--;}}
 else if(q.side==='enemy'){if(hit(q,game.player)){if(q.owner)hitPlayerBy(q.owner,q.damage,q);else{damagePlayer(q.damage,q);game.player.statuses.curse=2.5;}q.life=0;}else for(const a of game.allies){if(a.type!=='hound'&&hit(q,a)){damageAlly(a,q.damage,q);q.life=0;break;}}}
 if(q.y>CH+30||q.x<0||q.x>WORLD)q.life=0;
 }game.projectiles=game.projectiles.filter(q=>q.life>0);
 for(const trap of game.traps){trap.life-=dt;for(const e of game.enemies){if(e.hp>0&&!e.hidden&&!e.flying&&hit(trap,e)){if(trap.damage)dealEnemy(e,trap.damage,'trap',{status:'root',color:trap.color});else e.statuses.root=Math.max(e.statuses.root||0,trap.root);trap.life=0;break;}}}
 game.traps=game.traps.filter(t=>t.life>0);
 updateAllies(dt);
 for(const z of game.particles){z.life-=dt;z.x+=z.vx*dt;z.y+=z.vy*dt;z.vy+=320*dt;}game.particles=game.particles.filter(x=>x.life>0);
}
function step(dt){if(!isPlaying())return;game.clock+=dt;updatePlayer(dt);if(!isPlaying())return;updateEnemies(dt);updateProjectiles(dt);
 if(game.notice)game.notice.time-=dt;
 const p=game.player;game.camera=clamp(p.x-270,0,WORLD-CW);
 updateHeader();
}
function frame(now){raf=requestAnimationFrame(frame);const dt=Math.min(.033,(now-lastFrame)/1000||0);lastFrame=now;if(isPlaying())step(dt);draw();}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function shadow(x,y,w){ctx.fillStyle='#02090c66';ctx.beginPath();ctx.ellipse(x+w/2,y+1,w*.7,5,0,0,Math.PI*2);ctx.fill();}
function drawSkeleton(p){const x=p.x,y=p.y;shadow(x,FLOOR,p.w);ctx.save();ctx.translate(Math.round(x+p.w/2),Math.round(y));
 if(p.iframes>0&&Math.floor(game.clock*17)%2===0)ctx.globalAlpha=.45;
 const dir=p.face;ctx.strokeStyle='#dedbc7';ctx.lineWidth=4;ctx.lineCap='round';
 ctx.fillStyle='#e5dfc6';ctx.fillRect(-8,2,16,16);ctx.fillRect(-9,21,18,7);
 ctx.fillStyle='#1e3536';ctx.fillRect(-6,6,4,5);ctx.fillRect(3,6,4,5);ctx.fillStyle='#d9d5bd';ctx.fillRect(-4,18,8,5);
 ctx.beginPath();ctx.moveTo(-3,27);ctx.lineTo(-6,44);ctx.moveTo(5,27);ctx.lineTo(8,44);ctx.moveTo(-8,23);ctx.lineTo(-14+Math.sin(game.clock*4)*2,34);ctx.moveTo(8,23);ctx.lineTo(14+dir*3,34);ctx.stroke();
 if(p.guard>0||p.shield>0){ctx.strokeStyle='#9bd8e2';ctx.lineWidth=3;ctx.strokeRect(-20,-4,40,53);}
 if(p.attack){ctx.strokeStyle=p.attack.type==='skill'?'#94dfff':'#e7d29a';ctx.lineWidth=5;ctx.beginPath();ctx.arc(dir*17,24,23,dir>0?-1:Math.PI*.95,dir>0?1.1:Math.PI*1.85);ctx.stroke();}
 ctx.globalAlpha=1;let pip=-12;for(const k of Object.keys(p.statuses))if(STATUS_COLOR[k]){ctx.fillStyle=STATUS_COLOR[k];ctx.fillRect(pip,-12,7,7);pip+=9;}
 ctx.restore();}
function drawEnemy(e){shadow(e.x,FLOOR,e.w);const color=e.flash>0?'#f8ebcd':e.kind==='boss'?'#bd719d':e.kind==='brute'?'#ac8d7c':e.kind==='caster'?'#b18ad4':e.kind==='scout'?'#d2b67c':'#b2bdb6';
 rect(e.x,e.y,e.w,e.h,color);rect(e.x+7,e.y+9,5,5,'#24313c');rect(e.x+e.w-12,e.y+9,5,5,'#24313c');
 if(e.charge>0){rect(e.x+e.w/2-4,e.y-16,8,10,'#ef987e');ctx.fillStyle='#f6b27e55';ctx.fillRect(e.face>0?e.x+e.w:e.x-e.range,e.y,e.range,e.h);}
 if(e.statuses.root)rect(e.x,e.y+e.h-6,e.w,6,'#86b87f');
 rect(e.x,e.y-8,e.w,4,'#34494a');rect(e.x,e.y-8,e.w*(e.hp/e.maxHP),4,'#e3a385');
}
function draw(){const pal=game?.palette;ctx.clearRect(0,0,CW,CH);rect(0,0,CW,CH,pal?.sky||'#10202b');
 const camera=game?.camera||0;ctx.save();ctx.translate(-Math.round(camera),0);
 // Three parallax mountain layers; all drawn by code, no art dependency. V13: màu theo vùng săn.
 for(let i=0;i<24;i++){const x=i*145+40,y=290+Math.sin(i*1.8)*35;rect(x,140,85,y-140,pal?.far||'#1b333a');rect(x+15,160,18,23,pal?'#ffffff12':'#27464a');}
 for(const plat of platforms){rect(plat.x,plat.y,plat.w,plat.h,pal?.ground||'#3c4b46');rect(plat.x,plat.y,plat.w,7,pal?.edge||'#789484');for(let xx=plat.x+13;xx<plat.x+plat.w;xx+=60)rect(xx,plat.y+13,20,3,pal?'#00000030':'#50645a');}
 rect(FINISH,FLOOR-95,16,95,game&&game.enemies.every(e=>e.side||e.hp<=0)?'#ccdaa0':'#465c5d');rect(FINISH-18,FLOOR-95,56,9,'#d8bd7e');
 if(game){
  for(const item of game.pickups)if(!item.taken){if(item.type==='mana'){rect(item.x,item.y,10,10,'#83bddd');rect(item.x+3,item.y+3,4,4,'#e3f4ff');}else if(item.amount<24){rect(item.x,item.y+2,9,9,'#8ed4a3');rect(item.x+3,item.y,3,13,'#c7e8a8');}else{rect(item.x,item.y,12,12,'#8ed4a3');rect(item.x+4,item.y-3,4,18,'#c7e8a8');}}
  for(const f of game.fx){ctx.strokeStyle=f.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(1-f.t/.8)+6,0,Math.PI*2);ctx.stroke();}
  for(const trap of game.traps)rect(trap.x,trap.y,trap.w,trap.h,trap.color);
  if(game.zone)rect(game.zone.x,FLOOR-6,game.zone.w,6,game.zone.color);
  for(const a of game.allies){
    if(a.type==='turret'){rect(a.x,a.y,a.w,a.h,a.color);rect(a.x+9,a.y-6,4,6,'#faf2d2');}
    else if(a.type==='hound'){rect(a.x,a.y+4,a.w,a.h-6,a.color);rect(a.x+(a.face>0?a.w-6:0),a.y,8,8,'#f1e6ff');}
    else{rect(a.x+5,a.y,a.w-10,a.h,a.color);rect(a.x+6,a.y-7,10,8,'#efe6cf');if(a.guard)rect(a.x+(a.face>0?a.w-4:-2),a.y+6,6,18,'#9fb7c4');if(a.type==='ranged')rect(a.x+(a.face>0?a.w-2:-4),a.y+8,6,14,'#c9b27a');}
    rect(a.x,a.y-12,a.w,3,'#3a2f33');rect(a.x,a.y-12,a.w*Math.max(0,a.hp/a.maxHp),3,a.buff>0?'#ffd56a':'#8ed4a3');
  }
  for(const e of game.enemies)if(e.side){if(e.hp>0||e.reviveAt)drawSide(e);}else if(e.hp>0)drawEnemy(e);
  for(const q of game.projectiles){ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,6,0,Math.PI*2);ctx.fill();}
  for(const z of game.particles)rect(z.x,z.y,4,4,z.color);
  drawSkeleton(game.player);
 }
 ctx.restore();
 // Game HUD rendered in canvas as well, for screenshots/portable play.
 if(game){const p=game.player;
   rect(16,13,218,14,'#263b42');rect(16,13,218*p.hp/p.maxHP,14,'#cf837c');
   rect(16,31,218,9,'#223e42');rect(16,31,218*p.stam/p.maxStam,9,'#a7d4a4');
   rect(16,44,218,9,'#223e42');rect(16,44,218*p.mana/p.maxMana,9,'#83bddd');
   ctx.fillStyle='#f5e5bf';ctx.font='bold 13px system-ui';ctx.fillText(`${modeTitle[game.mode]}${game.target?' · '+game.target:''}`,255,26);
   ctx.fillText(`Kẻ địch: ${game.enemies.filter(e=>!e.side&&e.hp>0).length} | Quái phụ: ${game.enemies.filter(e=>e.side&&e.hp>0).length} · ${bestiary()?.biomes[game.biome]?.nameVi||''} | ${Math.round(game.player.x)}/${FINISH}`,255,46);
   if(game.notice?.time>0){ctx.fillStyle='#e8d198';ctx.fillText(game.notice.text,16,77);}
 }else{ctx.fillStyle='#e3d7ab';ctx.font='bold 26px system-ui';ctx.fillText('SKELETON CODEX · V10 PLAYABLE',215,208);}
}
function updateHeader(){const a=api.getCharacter(),economy=api.getEconomy(),snapshot=api.getSnapshot();
 $('playSummary').innerHTML=`<span>⚔ ${a.job} · Tier ${a.tier}</span><span>Level ${snapshot.level} = ${snapshot.level} skill MAX</span><span>🏆 ${economy.trophies} Chiến tích</span><span>✦ ${economy.points} Điểm</span><span>✓ ${a.wins} thắng / ${a.defeats} thua</span>`;
 const p=game?.player;
 $('gameStats').textContent=p?`HP ${Math.ceil(p.hp)}/${p.maxHP} · Stamina ${Math.ceil(p.stam)}/${p.maxStam} · Mana ${Math.ceil(p.mana)}/${p.maxMana} · Khiên ${Math.ceil(p.shield)}${Object.keys(p.statuses).filter(k=>STATUS_COLOR[k]).map(k=>' · '+(bestiary()?.rules.playerStatuses[k]?.nameVi||k)).join('')}`:'HP / Stamina / Mana cập nhật khi vào màn';
 $('gameTarget').textContent=game?`${modeTitle[game.mode]} · ${game.enemies.filter(e=>!e.side&&e.hp>0).length} địch còn sống · ${game.hunt.kills.length} quái phụ đã hạ · x=${Math.round(p.x)} / ${FINISH} · ${game.state}`:'Chọn màn chơi rồi bắt đầu';
}
function renderProgress(){const a=api.getCharacter(),build=api.getCombatBuild();
 $('playWeapon').value=build.weapon;
 [...$('playWeapon').options].forEach(o=>{o.disabled=!api.weaponAllowed(o.value);});
 $('playBuildInfo').textContent=`Nghề ${v11Name(build.job)}, vũ khí ${build.weapon}. Active: ${['active1','active2','active3'].map(k=>build.slots[k]?v11Skill(api.getSkill(build.slots[k]))+' (R'+build.ranks[build.slots[k]]+')':'—').join(' / ')}. Signature: ${build.slots.signature1?v11Skill(api.getSkill(build.slots.signature1)):'—'}. Passive: ${['passive1','passive2'].map(k=>build.slots[k]?api.getSkill(build.slots[k]).name:'—').join(', ')}.`;
 $('gameAbilities').textContent=`J: thường | K/1: ${build.slots.active1?v11Skill(api.getSkill(build.slots.active1)):'—'} | 2: ${build.slots.active2?v11Skill(api.getSkill(build.slots.active2)):'—'} | 3: ${build.slots.active3?v11Skill(api.getSkill(build.slots.active3)):'—'} | Q: ${build.slots.signature1?v11Skill(api.getSkill(build.slots.signature1)):'—'}`;
 $('playProgress').innerHTML=`<p>Mastery: ${Object.entries(a.mastery).filter(x=>x[1]>0).map(([k,v])=>`${k}: ${Math.floor(v)}`).join(' · ')||'Chưa tập luyện'}</p><p>Affinity: ${Object.entries(a.affinity).filter(x=>x[1]>0).map(([k,v])=>`${k}: ${Math.floor(v)}`).join(' · ')||'Chưa mở'}</p>`;
 const catalog=api.getJobCatalog(),job=catalog.find(x=>x.id===a.job);
 $('playNextJobs').innerHTML=job.to.length?job.to.map(target=>{const gate=api.getGate(a.job,target),training=api.getTrainingStatus(target);
   return `<div class="check ${gate.ready?'yes':''}"><strong>${v11Name(target)}</strong> · ${gate.required.map(x=>`${x.name} R${x.rank}/5`).join(' + ')} · ${gate.missing.length?'Mastery thiếu: '+gate.missing.join(', '):'Mastery đủ'} · ${gate.trial?'✓ Trial':'Trial chưa xong'}<div class="job-actions"><button data-train-game="${target}" ${training.cleared?'disabled':''}>${training.cleared?'Đã nhận skill':'Đấu đào tạo'}</button><button data-trial-game="${target}" ${!gate.passed||gate.trial?'disabled':''}>Đấu Trial</button><button data-change-game="${target}" ${!gate.ready?'disabled':''}>Chuyển nghề</button></div></div>`;
 }).join(''):'<p>◆ Nghề Terminal. Tiếp tục học skill, nâng Rank và khiêu chiến.</p>';
 document.querySelectorAll('[data-train-game]').forEach(b=>b.onclick=()=>start('training',b.dataset.trainGame));
 document.querySelectorAll('[data-trial-game]').forEach(b=>b.onclick=()=>start('trial',b.dataset.trialGame));
 document.querySelectorAll('[data-change-game]').forEach(b=>b.onclick=()=>{if(isPlaying()){message('Hãy kết thúc trận trước khi chuyển nghề.');return;}const res=api.changeJob(b.dataset.changeGame);message(res.message);renderProgress();});
 updateHeader();
}
const KEY_MAP={KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyW:'jump',ArrowUp:'jump',Space:'jump',KeyJ:'normal',KeyK:'skill1',Digit1:'skill1',Digit2:'skill2',Digit3:'skill3',KeyQ:'signature',ShiftLeft:'dodge',ShiftRight:'dodge',KeyL:'dodge'};
window.addEventListener('keydown',e=>{if(!game||!['running','paused'].includes(game.state)||e.target.closest('input,select,textarea'))return;
 if(e.code==='KeyP'){e.preventDefault();game.state=game.state==='running'?'paused':'running';overlay(game.state==='paused'?'TẠM DỪNG\nNhấn P để tiếp tục':'');return;}
 if(!isPlaying())return;
 const name=KEY_MAP[e.code];if(!name)return;e.preventDefault();setInput(name,true);
},{passive:false});
window.addEventListener('keyup',e=>{const name=KEY_MAP[e.code];if(name)setInput(name,false);});
window.addEventListener('blur',()=>{Object.keys(input).forEach(k=>input[k]=false);});
for(const button of document.querySelectorAll('[data-hold]')){
 const name=button.dataset.hold;
 const down=e=>{e.preventDefault();setInput(name,true);button.classList.add('is-down');try{button.setPointerCapture(e.pointerId);}catch(_){} };
 const up=e=>{e.preventDefault();setInput(name,false);button.classList.remove('is-down');};
 button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',()=>{setInput(name,false);button.classList.remove('is-down');});
}
$('playStart').onclick=()=>start($('playMode').value);
$('playRestart').onclick=()=>start(lastMode,lastTarget);
$('playStop').onclick=stop;
$('playWeapon').onchange=e=>{if(isPlaying()){message('Không đổi vũ khí giữa trận.');renderProgress();return;}if(!api.setCombatWeapon(e.target.value))message('Nghề hiện tại không dùng bộ vũ khí này (giới hạn theo domain V12; Tier 0 chưa dùng cung).');renderProgress();};
$('saveExport').onclick=()=>{const blob=new Blob([api.exportSave()],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='skeleton-codex-v10-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),5000);};
$('saveImport').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;const result=api.importSave(await file.text());if(!result.ok)message(result.message);e.target.value='';};
window.addEventListener('skeleton-progress-changed',()=>{if(!isPlaying())renderProgress();});
// spawnMonster: công cụ QA cho quái phụ (gọi từ console): SkeletonGame.spawnMonster('dire_wolf','elite',600).
function spawnMonster(id,grade='normal',x=null){const B=bestiary(),sp=B?.byId[id];if(!isPlaying()||!sp||!B.grades[grade])return false;
 const pool=Object.keys(B.affixes),aff=[];while(aff.length<B.grades[grade].affixes)aff.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
 game.enemies.push(...makeSide(sp,grade,aff,1,x??game.player.x+260));return true;}
window.SkeletonGame={start,stop,message,isPlaying,spawnMonster,debug(){return game?{state:game.state,mode:game.mode,x:game.player.x,hp:game.player.hp,enemies:game.enemies.filter(e=>!e.side&&e.hp>0).length,enemyHp:game.enemies.filter(e=>!e.side).map(e=>Math.round(e.hp)),biome:game.biome,side:game.enemies.filter(e=>e.side&&(e.hp>0||e.reviveAt)).map(e=>({id:e.sp.id,grade:e.grade,affixes:e.affixes,hp:Math.round(e.hp),max:e.maxHP,x:Math.round(e.x),y:Math.round(e.y),state:e.hidden?'hidden':e.state})),hunt:game.hunt.kills.map(k=>k.species+':'+k.grade),playerStatuses:Object.keys(game.player.statuses),allies:game.allies.map(a=>({type:a.type,skill:a.skill,hp:Math.round(a.hp),max:a.maxHp,dmg:Math.round(a.damage*10)/10,x:Math.round(a.x)}))}:null;}};
{const B=bestiary(),sel=$('playBiome');if(sel){if(B)sel.innerHTML=Object.entries(B.biomes).map(([id,b])=>`<option value="${id}">${b.nameVi} · Tier ${b.tiers[0]}–${b.tiers[1]}</option>`).join('');else{sel.disabled=true;if($('playSide'))$('playSide').disabled=true;}}}
renderProgress();overlay('Chọn thử thách và nhấn Bắt đầu màn.');draw();
})();

/* Skeleton Codex V10 → V12 — playable 2D platform combat, placeholder geometry, offline.
 * V12: scaling STR/DEX/INT theo nguồn sức mạnh, mastery suy từ dữ liệu skill, vũ khí giới hạn theo domain.
 * Uses the V9 skill library as canonical authoring data; gameplay coefficients are prototypes.
 * No simulation rewards. One reward transaction is recorded only on actual scene victory.
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
 game={state:'running',mode,target,tier:char.tier,player:p,enemies:initEnemies(mode,char.tier),projectiles:[],traps:[],allies:[],zone:null,particles:[],pickups:[{x:590,y:369,taken:false},{x:1380,y:365,taken:false},{x:2120,y:364,taken:false}],
 clock:0,camera:0,notice:{text:'Vượt địa hình, đánh bại toàn bộ đối thủ rồi đến cổng sáng',time:3},actionMastery:{},elementHits:{},collected:0};
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
   const result=api.onVictory({mode:game.mode,target:game.target,mastery:actions,element:mainElement?.[0],elementHits:mainElement?.[1]||0});
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
 if(e.hp<=0||e.iframes>0)return false;
 const p=game.player;
 const mitigation=options.magic?e.magicResist:e.armor;
 const adjusted=(damage-(options.ignoreDefense?0:mitigation))*(e.statuses.armor_break?1.18:1)*(e.statuses.curse?1.12:1);
 const amount=Math.max(1,Math.round(adjusted));e.hp=Math.max(0,e.hp-amount);e.flash=.15;
 e.vx=(e.x>p.x?1:-1)*Math.min(280,options.knock||115);
 if(options.launch)e.vy=-240;
 if(options.stun)e.stun=Math.max(e.stun,Math.min(e.kind==='boss'?.3:.8,options.stun));
 if(options.status){const key=options.status;e.statuses[key]=Math.max(e.statuses[key]||0,e.kind==='boss'?.8:2.2);
   if(key==='shock'&&e.statuses.wet){e.hp=Math.max(0,e.hp-6);addParticles(e.x,e.y,'#e8de80',9);e.statuses.wet=0;}
   if(key==='chill'&&e.statuses.wet){e.stun=Math.max(e.stun,.6);e.statuses.wet=0;addParticles(e.x,e.y,COLORS.ice,8);}
   if(key==='wet'&&e.statuses.burn){e.statuses.burn=0;addParticles(e.x,e.y,'#c7e1eb',9);}
 }
 addParticles(e.x+e.w/2,e.y+18,options.color||'#eacb89',5);
 if(e.hp<=0){p.kills++;addParticles(e.x+e.w/2,e.y,'#cb9c85',12);}
 return true;
}
function damagePlayer(damage,source){const p=game.player;if(p.hp<=0||p.iframes>0||p.dodgeTime>0)return;
 let amount=Math.round(damage*(1-Math.min(.38,passivePower(p).reduction)));
 if(p.guard>0){amount=Math.ceil(amount*.27);p.stam=Math.min(p.maxStam,p.stam+3);gainMastery('Shield',2);addParticles(p.x+15,p.y+15,'#a7d2ed',8);}
 if(p.shield>0){const absorbed=Math.min(amount,p.shield);p.shield-=absorbed;amount-=absorbed;}
 if(amount<=0){p.iframes=.12;return;}
 p.hp=Math.max(0,p.hp-amount);p.damageTaken+=amount;p.iframes=.65;p.stun=.22;p.vx=(source.x<p.x?1:-1)*240;p.vy=-120;
 addParticles(p.x+15,p.y+20,'#ff9d88',9);
 if(p.hp===0)finish(false);
}
function costSkill(s,p){const x=String(s.cost||'').match(/(\d+)\s*(Stamina|Mana|Soul)/i);const base=x?+x[1]:s.kind==='signature'?26:12;const type=x&&/stamina/i.test(x[2])?'stam':'mana';return {type,amount:base};}
function spendCost(s,p){const cost=costSkill(s,p);if(p[cost.type]<cost.amount)return false;p[cost.type]-=cost.amount;p.staminaSpent+=cost.type==='stam'?cost.amount:0;return true;}
function fireProjectile(x,y,vx,vy,damage,side,color,status=null,pierce=0,magic=false){game.projectiles.push({x,y,w:12,h:12,vx,vy,damage,side,color,status,pierce,magic,life:3,hitIds:new Set()});}
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
 for(const e of game.enemies)if(e.hp>0&&hit(box,e)){
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
 if(e.y>CH+140){if(e===game.player){finish(false);}else{e.hp=0;game.player.kills++;}}
}
function updatePlayer(dt){const p=game.player;if(!p||p.hp<=0)return;
 for(const k of Object.keys(p.statuses)){p.statuses[k]-=dt;if(p.statuses[k]<=0)delete p.statuses[k];}
 p.stun=Math.max(0,p.stun-dt);p.iframes=Math.max(0,p.iframes-dt);p.guard=Math.max(0,p.guard-dt);p.normalCD=Math.max(0,p.normalCD-dt);p.dodgeCD=Math.max(0,p.dodgeCD-dt);p.dodgeTime=Math.max(0,p.dodgeTime-dt);p.comboTimer=Math.max(0,p.comboTimer-dt);p.hitConfirm=Math.max(0,p.hitConfirm-dt);p.attackTimer=Math.max(0,p.attackTimer-dt);
 for(const id in p.cooldowns)p.cooldowns[id]=Math.max(0,p.cooldowns[id]-dt);
 const passive=passivePower(p);p.stam=Math.min(p.maxStam,p.stam+dt*(passive.bonus?18:15));p.mana=Math.min(p.maxMana,p.mana+dt*9);
 if(p.stun<=0){
   if(input.left&&!input.right){p.face=-1;p.vx=-(200+p.stats.AGI*2+passive.speed)*(p.dodgeTime>0?2.2:1);}
   else if(input.right&&!input.left){p.face=1;p.vx=(200+p.stats.AGI*2+passive.speed)*(p.dodgeTime>0?2.2:1);}
   else p.vx*=Math.max(0,1-dt*10);
   if(input.jump&&p.onGround){p.vy=-472-passive.jump;p.onGround=false;p.jumpCount++;gainMastery('Stealth',.1);input.jump=false;}
   if(input.dodge&&p.dodgeCD===0&&p.stam>=17){p.stam-=17;p.dodgeCD=1.2;p.dodgeTime=.23;p.iframes=Math.max(p.iframes,.26);p.vx=p.face*440;gainMastery('Stealth',1);input.dodge=false;}
   if(input.normal)normalAttack();
   for(const key of ['skill1','skill2','skill3','signature'])if(input[key]){castSlot({skill1:'active1',skill2:'active2',skill3:'active3',signature:'signature1'}[key]);input[key]=false;}
 }
 if(p.dodgeTime>0)p.vx=p.face*420;
 p.x+=p.vx*dt;processAttack(p,dt);applyPhysics(p,dt);
 if(passive.light&&!p.onGround&&input.left)p.x-=10*dt;
 for(const item of game.pickups)if(!item.taken&&Math.abs(item.x-p.x)<36&&Math.abs(item.y-p.y)<60){item.taken=true;p.hp=Math.min(p.maxHP,p.hp+24+(passive.scavenge?12:0));p.stam=Math.min(p.maxStam,p.stam+22);game.collected++;}
 if(p.x>FINISH&&game.enemies.every(e=>e.hp<=0))finish(true);
}
// ===== V12.2 THUỘC HẠ =====
// Quân gọi ra có cấp = tier skill − 1 và máu mỏng (so với grunt 52 HP): lính T1 ~20 HP, kỵ sĩ T3 ~45 HP.
const SUMMON_BASE={turret:{hp:22,dmg:5,speed:0,range:400,rate:.8,w:22,h:20},ranged:{hp:16,dmg:4,speed:120,range:340,rate:1.1,w:20,h:30},
 melee:{hp:20,dmg:5,speed:150,range:44,rate:1.0,w:22,h:34},hound:{hp:14,dmg:4,speed:230,range:40,rate:.7,w:26,h:18}};
function nearestEnemy(x,maxDist,prefer=null){const list=game.enemies.filter(e=>e.hp>0&&Math.abs(e.x-x)<maxDist);
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
// Địch chọn mục tiêu gần nhất trong số người chơi và thuộc hạ (trừ oán linh bay).
function enemyTarget(e){let best=game.player,bd=Math.abs(game.player.x-e.x);
 for(const a of game.allies){if(a.type==='hound')continue;const d=Math.abs(a.x-e.x);if(d<bd){bd=d;best=a;}}return best;}
function updateEnemies(dt){const p0=game.player;
 for(const e of game.enemies){if(e.hp<=0)continue;
  e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,e.stun-dt);e.iframes=Math.max(0,e.iframes-dt);
  for(const k of Object.keys(e.statuses)){e.statuses[k]-=dt;if(e.statuses[k]<=0)delete e.statuses[k];}
  if(e.statuses.burn && Math.random()<dt*2)dealEnemy(e,2,'burn',{color:COLORS.fire});
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
function updateProjectiles(dt){for(const q of game.projectiles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
 if(q.side==='player')for(const e of game.enemies){if(e.hp>0&&hit(q,e)&&!q.hitIds.has(e.id)){q.hitIds.add(e.id);dealEnemy(e,q.damage,'projectile',{status:q.status==='chill'?'chill':q.status,color:q.color,magic:q.magic,stun:q.status==='stagger'?.3:0});if(q.pierce<=0){q.life=0;break;}q.pierce--;}}
 else if(q.side==='enemy'){if(hit(q,game.player)){damagePlayer(q.damage,q);game.player.statuses.curse=2.5;q.life=0;}else for(const a of game.allies){if(a.type!=='hound'&&hit(q,a)){damageAlly(a,q.damage,q);q.life=0;break;}}}
 if(q.y>CH+30||q.x<0||q.x>WORLD)q.life=0;
 }game.projectiles=game.projectiles.filter(q=>q.life>0);
 for(const trap of game.traps){trap.life-=dt;for(const e of game.enemies){if(e.hp>0&&hit(trap,e)){if(trap.damage)dealEnemy(e,trap.damage,'trap',{status:'root',color:trap.color});else e.statuses.root=Math.max(e.statuses.root||0,trap.root);trap.life=0;break;}}}
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
 ctx.restore();}
function drawEnemy(e){shadow(e.x,FLOOR,e.w);const color=e.flash>0?'#f8ebcd':e.kind==='boss'?'#bd719d':e.kind==='brute'?'#ac8d7c':e.kind==='caster'?'#b18ad4':e.kind==='scout'?'#d2b67c':'#b2bdb6';
 rect(e.x,e.y,e.w,e.h,color);rect(e.x+7,e.y+9,5,5,'#24313c');rect(e.x+e.w-12,e.y+9,5,5,'#24313c');
 if(e.charge>0){rect(e.x+e.w/2-4,e.y-16,8,10,'#ef987e');ctx.fillStyle='#f6b27e55';ctx.fillRect(e.face>0?e.x+e.w:e.x-e.range,e.y,e.range,e.h);}
 if(e.statuses.root)rect(e.x,e.y+e.h-6,e.w,6,'#86b87f');
 rect(e.x,e.y-8,e.w,4,'#34494a');rect(e.x,e.y-8,e.w*(e.hp/e.maxHP),4,'#e3a385');
}
function draw(){ctx.clearRect(0,0,CW,CH);rect(0,0,CW,CH,'#10202b');
 const camera=game?.camera||0;ctx.save();ctx.translate(-Math.round(camera),0);
 // Three parallax mountain layers; all drawn by code, no art dependency.
 for(let i=0;i<24;i++){const x=i*145+40,y=290+Math.sin(i*1.8)*35;rect(x,140,85,y-140,'#1b333a');rect(x+15,160,18,23,'#27464a');}
 for(const plat of platforms){rect(plat.x,plat.y,plat.w,plat.h,'#3c4b46');rect(plat.x,plat.y,plat.w,7,'#789484');for(let xx=plat.x+13;xx<plat.x+plat.w;xx+=60)rect(xx,plat.y+13,20,3,'#50645a');}
 rect(FINISH,FLOOR-95,16,95,game&&game.enemies.every(e=>e.hp<=0)?'#ccdaa0':'#465c5d');rect(FINISH-18,FLOOR-95,56,9,'#d8bd7e');
 if(game){
  for(const item of game.pickups)if(!item.taken){rect(item.x,item.y,12,12,'#8ed4a3');rect(item.x+4,item.y-3,4,18,'#c7e8a8');}
  for(const trap of game.traps)rect(trap.x,trap.y,trap.w,trap.h,trap.color);
  if(game.zone)rect(game.zone.x,FLOOR-6,game.zone.w,6,game.zone.color);
  for(const a of game.allies){
    if(a.type==='turret'){rect(a.x,a.y,a.w,a.h,a.color);rect(a.x+9,a.y-6,4,6,'#faf2d2');}
    else if(a.type==='hound'){rect(a.x,a.y+4,a.w,a.h-6,a.color);rect(a.x+(a.face>0?a.w-6:0),a.y,8,8,'#f1e6ff');}
    else{rect(a.x+5,a.y,a.w-10,a.h,a.color);rect(a.x+6,a.y-7,10,8,'#efe6cf');if(a.guard)rect(a.x+(a.face>0?a.w-4:-2),a.y+6,6,18,'#9fb7c4');if(a.type==='ranged')rect(a.x+(a.face>0?a.w-2:-4),a.y+8,6,14,'#c9b27a');}
    rect(a.x,a.y-12,a.w,3,'#3a2f33');rect(a.x,a.y-12,a.w*Math.max(0,a.hp/a.maxHp),3,a.buff>0?'#ffd56a':'#8ed4a3');
  }
  for(const e of game.enemies)if(e.hp>0)drawEnemy(e);
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
   ctx.fillText(`Kẻ địch: ${game.enemies.filter(e=>e.hp>0).length} | ${Math.round(game.player.x)}/${FINISH}`,255,46);
   if(game.notice?.time>0){ctx.fillStyle='#e8d198';ctx.fillText(game.notice.text,16,77);}
 }else{ctx.fillStyle='#e3d7ab';ctx.font='bold 26px system-ui';ctx.fillText('SKELETON CODEX · V10 PLAYABLE',215,208);}
}
function updateHeader(){const a=api.getCharacter(),economy=api.getEconomy(),snapshot=api.getSnapshot();
 $('playSummary').innerHTML=`<span>⚔ ${a.job} · Tier ${a.tier}</span><span>Level ${snapshot.level} = ${snapshot.level} skill MAX</span><span>🏆 ${economy.trophies} Chiến tích</span><span>✦ ${economy.points} Điểm</span><span>✓ ${a.wins} thắng / ${a.defeats} thua</span>`;
 const p=game?.player;
 $('gameStats').textContent=p?`HP ${Math.ceil(p.hp)}/${p.maxHP} · Stamina ${Math.ceil(p.stam)}/${p.maxStam} · Mana ${Math.ceil(p.mana)}/${p.maxMana} · Khiên ${Math.ceil(p.shield)}`:'HP / Stamina / Mana cập nhật khi vào màn';
 $('gameTarget').textContent=game?`${modeTitle[game.mode]} · ${game.enemies.filter(e=>e.hp>0).length} địch còn sống · x=${Math.round(p.x)} / ${FINISH} · ${game.state}`:'Chọn màn chơi rồi bắt đầu';
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
window.SkeletonGame={start,stop,message,isPlaying,debug(){return game?{state:game.state,mode:game.mode,x:game.player.x,hp:game.player.hp,enemies:game.enemies.filter(e=>e.hp>0).length,enemyHp:game.enemies.map(e=>Math.round(e.hp)),allies:game.allies.map(a=>({type:a.type,skill:a.skill,hp:Math.round(a.hp),max:a.maxHp,dmg:Math.round(a.damage*10)/10,x:Math.round(a.x)}))}:null;}};
renderProgress();overlay('Chọn thử thách và nhấn Bắt đầu màn.');draw();
})();

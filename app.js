
(()=>{'use strict';
const UPGUIDE=JSON.parse(document.getElementById('upGuidePayload').textContent);
 const DATA=JSON.parse(document.getElementById('payload').textContent), GUIDE=JSON.parse(document.getElementById('guidePayload').textContent), CATALOG=JSON.parse(document.getElementById('catalogPayload').textContent), META=DATA.meta, B=META.worldBounds;
const MOB_BY_ID=new Map(CATALOG.mobs.map(m=>[m.id,m]));const ITEM_BY_ID=new Map(CATALOG.items.map(i=>[i.id,i]));const QUEST_BY_ID=new Map(CATALOG.quests.map(q=>[q.id,q]));
const $=id=>document.getElementById(id);const V=$('viewport'),S=$('stage'),IMG=$('floorImage'),L=$('markerLayer'),MW=$('mapWrap');
const MIN_ZOOM=.035,MAX_ZOOM=6;
const CAT={all:{label:'Todos',icon:'layers',color:'#dcc575'},hunt:{label:'Hunts',icon:'swords',color:'#eba85f'},quest:{label:'Quests',icon:'scroll',color:'#bda0e0'},boss:{label:'Bosses',icon:'skull',color:'#e87c62'},dungeon:{label:'Dungeons',icon:'dungeon',color:'#7dbbc8'},npc:{label:'NPCs',icon:'user',color:'#91b875'},other:{label:'Outros',icon:'other',color:'#b8a184'}};
const TERRAIN_HUNTS=JSON.parse($('terrainHuntsPayload').textContent);
const HUNT_COVERAGE=new Map(JSON.parse($('huntCoveragePayload').textContent).map(x=>[x.id,x]));
const TERRAIN_BY_MARKER=new Map();for(const zone of TERRAIN_HUNTS)for(const id of zone.markerIds)TERRAIN_BY_MARKER.set(id,zone);
// Community reference: approximate area anchor, not an official spawn coordinate.
DATA.markers.push({id:638,name:'Hunt Kuroari · South Forest',position:{x:844,y:1054,z:7},tags:['hunt'],community:true});
GUIDE.byMarker['638']={monsterIds:[],questIds:[],monsters:'Kuroari',notes:'Nome informado pela comunidade. Área aproximada a partir da imagem de referência. Level e drops não informados.'};
const MARKERS=DATA.markers.map(m=>{const tags=[...m.tags];if((TERRAIN_BY_MARKER.has(m.id)||HUNT_COVERAGE.has(m.id))&&!tags.includes('hunt')&&m.locationRole!=='access'&&!HUNT_COVERAGE.get(m.id)?.hideHuntOnSurface)tags.unshift('hunt');return {...m,tags,main:(['hunt','quest','boss','dungeon','npc'].find(t=>tags.includes(t))||inferTag(m.name,m.id)),level:parseLevel(m.name)??(TERRAIN_BY_MARKER.get(m.id)?.levelNote?null:TERRAIN_BY_MARKER.get(m.id)?.level)??null}});
const SEARCH_HAY=new Map(MARKERS.map(m=>{const ex=GUIDE.byMarker[String(m.id)]||{};const details=(TERRAIN_BY_MARKER.get(m.id)?.consolidated?TERRAIN_BY_MARKER.get(m.id).mobIds:(ex.monsterIds?.length?ex.monsterIds:(TERRAIN_BY_MARKER.get(m.id)?.mobIds||[]))).flatMap(id=>{const a=MOB_BY_ID.get(id);return a?[a.nome,...(a.aliases||[]),...a.drops.map(d=>d.nome),...a.drops.map(d=>d.item)]:[]});const q=(ex.questIds||[]).map(id=>QUEST_BY_ID.get(id)).filter(Boolean).flatMap(q=>[q.titulo,q.premio,q.boss,q.requisitos,...(q.rewards||[]).flatMap(r=>[r.name,r.itemId]),...(q.bossDrops||[]).flatMap(r=>[r.boss,r.name])]);return [m.id,normalize([m.name,ex.monsters,TERRAIN_BY_MARKER.get(m.id)?.name,...(TERRAIN_BY_MARKER.get(m.id)?.monsterNames||[]),HUNT_COVERAGE.get(m.id)?.familyName,...details,...q].join(' '))]}));const ALL=MARKERS.length;const W=B.maxX-B.minX+1,H=B.maxY-B.minY+1;S.style.width=W+'px';S.style.height=H+'px';
const SUGGESTED_ZONES=JSON.parse(document.getElementById('upZoneGeometryPayload').textContent).zones;
const SUGGESTED_BY_ID=new Map(SUGGESTED_ZONES.map(x=>[String(x.markerId),x]));
let reviewedZones=loadObject('gn_zone_polygons_v14');
let zoneEditor=null;
let pinBaseTx=0,pinBaseTy=0,pinBaseScale=1,pinTimer=0,upSet='basico',upBand='all',upEnabled=true;
 let floor=7,cat='all',levelFilter=0,query='',onlyFloor=false,onlyFav=false,selected=null,scale=1,tx=0,ty=0,names=false,drag=null,renderScheduled=false,visibleCount=40;
let completed=loadObject('gn_completed_v7');
let favorites=loadObject('gn_favs_v1'),extras=loadObject('gn_extras_v1'),onlyMonsters=false,compactIcons=true,showSprites=true;try{compactIcons=localStorage.getItem('gn_compact_icons_v2')!=='false'}catch(_){ }
function normalize(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function loadObject(key){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch(_){return {}}}
function persist(key,val){try{localStorage.setItem(key,JSON.stringify(val))}catch(_){showToast('Não foi possível salvar no navegador. Use a exportação para backup.')}}
function parseLevel(name){const v=name.match(/(?:n[ií]vel\s*)?(\d{2,4})\s*(?:\+|a\s*\d{2,4})/i);if(v)return Number(v[1]);const u=name.match(/(?:n[ií]vel|lvl|lv)\s*[:\-]?\s*(\d{2,4})/i);return u?Number(u[1]):null}
function inferTag(name,id){let n=normalize(name);if(/\b(npc|mercante|comerciante|treiner|trainer)\b/.test(n))return 'npc';if(/\bboss\b/.test(n))return 'boss';if(/\bdungeon\b/.test(n))return 'dungeon';if(/\bquest/.test(n))return 'quest';if(/\bhunt/.test(n))return 'hunt';if((GUIDE.byMarker[String(id)]?.monsterIds||[]).length&&!/passagem|caminho|ponte|portal|acesso|cidade|quest|dungeon|boss|saga/.test(n))return 'hunt';return 'other'}
function ico(name,cls='ico'){return `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`}
function textElement(tag,txt,cls){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=txt;return el}
function floorData(z=floor){return META.floors.find(f=>f.z===+z)}
function stagePos(p){return{x:p.x-B.minX,y:p.y-B.minY}}
function screenPoint(p){const q=stagePos(p);return{x:tx+q.x*scale,y:ty+q.y*scale}}
function worldFromClient(cx,cy){const r=V.getBoundingClientRect();return{x:Math.floor((cx-r.left-tx)/scale+B.minX),y:Math.floor((cy-r.top-ty)/scale+B.minY),z:floor}}
function syncPinLayer(){L.style.transform='none';for(const node of L.children){const p=screenPoint({x:Number(node.dataset.worldX),y:Number(node.dataset.worldY)});node.style.left=p.x+'px';node.style.top=p.y+'px'}}
function place(){const ratio=Math.max(1,window.devicePixelRatio||1);tx=Math.round(tx*ratio)/ratio;ty=Math.round(ty*ratio)/ratio;updateRegion();scheduleTerrain();S.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${scale})`;S.style.setProperty('--inv',(1/scale).toFixed(5));$('zoomLabel').textContent=(scale*100).toFixed(scale<.1?1:0)+'%';syncPinLayer();if(!drag)schedulePins();$('zoomIn').disabled=scale>=MAX_ZOOM-.00001;$('zoomOut').disabled=scale<=MIN_ZOOM+.000001;$('zoomLabel').title=scale>=MAX_ZOOM?'Zoom máximo: pixels originais preservados':'Ampliação do minimapa';}

function schedulePins(){if(drag)return;clearTimeout(pinTimer);pinTimer=setTimeout(renderPins,90)}
function fit(){const f=floorData();if(!f)return;const r=V.getBoundingClientRect();scale=Math.min((r.width-110)/f.width,(r.height-105)/f.height);scale=Math.max(.035,Math.min(2.0,scale));center(f.x+f.width/2,f.y+f.height/2)}
function center(x,y,desiredZoom){if(desiredZoom!==undefined)scale=Math.max(.035,Math.min(MAX_ZOOM,desiredZoom));const r=V.getBoundingClientRect(),p=stagePos({x,y});tx=r.width/2-p.x*scale;ty=r.height/2-p.y*scale;place()}
function zoom(factor,sx=V.getBoundingClientRect().width/2,sy=V.getBoundingClientRect().height/2){const k=Math.max(.035,Math.min(MAX_ZOOM,scale*factor));tx=sx-(sx-tx)*(k/scale);ty=sy-(sy-ty)*(k/scale);scale=k;place()}
function switchFloor(z,refit=false){floor=clamp(Number(z),0,15);MW.classList.toggle('floor7',floor===7);const f=floorData();if(!f)return;$('floorSelect').value=String(floor);$('quickFloor').value=String(floor);IMG.style.left=(f.x-B.minX)+'px';IMG.style.top=(f.y-B.minY)+'px';IMG.style.width=f.width+'px';IMG.style.height=f.height+'px';IMG.src=f.file;L.replaceChildren();drawUpZones();$('cursorZ').textContent=floor;$('floorTitle').textContent=floor===7?'SUPERFÍCIE · Z7':`ANDAR · Z${floor}`;$('floorDescription').textContent='Minimapa do jogo · top-down';$('mapStats').textContent=MARKERS.filter(m=>m.position.z===floor).length+' marcações neste andar';if(refit)fit();else place();renderResults();updateFloorUI();hideZoneTip();hideTip()}
function filtered(){return MARKERS.filter(m=>{
 if(cat==='other'){if(m.main!=='other')return false}else if(cat!=='all'&&!m.tags.includes(cat)&&m.main!==cat)return false;
 if(levelFilter>0&&!(m.level!==null&&m.level>=levelFilter))return false;
 if(onlyFloor&&m.position.z!==floor)return false;
 if(onlyFav&&!favorites[m.id])return false;
 if(onlyMonsters&&!extraFor(m).monsters)return false;
 if(query){const hay=SEARCH_HAY.get(m.id)||'';if(!hay.includes(query)&&!`${m.position.x} ${m.position.y} ${m.position.z}`.includes(query))return false;}
 return true;
 })}
function renderCategories(){const c=$('categories');c.replaceChildren();for(const [key,v] of Object.entries(CAT)){const count=key==='all'?ALL:MARKERS.filter(m=>key==='other'?m.main==='other':m.tags.includes(key)||m.main===key).length;const btn=document.createElement('button');btn.className='cat'+(cat===key?' active':'');btn.type='button';btn.style.setProperty('--color',v.color);btn.setAttribute('aria-pressed',cat===key?'true':'false');const left=document.createElement('span');left.className='cat-text';const symbol=document.createElement('span');symbol.className='category-symbol';symbol.innerHTML=ico(v.icon,'ico small-ico');left.appendChild(symbol);left.appendChild(textElement('span',v.label));btn.appendChild(left);btn.appendChild(textElement('b',count));btn.addEventListener('click',()=>{cat=key;visibleCount=40;renderCategories();renderResults();schedulePins()});c.appendChild(btn)}}
function renderResults(){syncTabs();if(!zoneEditor)drawUpZones();const list=$('results'),seenAreas=new Set(),m=filtered().filter(item=>{const a=TERRAIN_BY_MARKER.get(item.id);if(!a?.consolidated)return true;if(seenAreas.has(a.id))return false;seenAreas.add(a.id);return true});list.replaceChildren();$('resultsCount').textContent=m.length+' '+(m.length===1?'local':'locais');$('favoriteCount').textContent='('+Object.keys(favorites).filter(k=>favorites[k]).length+')';if(!m.length){list.appendChild(textElement('div','Nenhum marcador encontrado. Tente mudar a categoria, o andar ou o nível.','empty-list'));schedulePins();return}const frag=document.createDocumentFragment();for(const item of m.slice(0,visibleCount)){const b=document.createElement('button');b.type='button';b.className='result-card'+(selected&&selected.id===item.id?' selected':'');const a=document.createElement('span');a.className='result-icon';a.style.setProperty('--cat-color',CAT[item.main].color);a.innerHTML=ico(CAT[item.main].icon);const rel=GUIDE.byMarker[String(item.id)]||{};const mon=rel.monsterIds?.length?MOB_BY_ID.get(rel.monsterIds[0]):null;if(mon?.img&&!TERRAIN_BY_MARKER.get(item.id)?.consolidated){a.innerHTML='';const thumb=document.createElement('img');thumb.src=mon.img;thumb.alt='';thumb.className='result-sprite';a.appendChild(thumb)}b.appendChild(a);const info=document.createElement('span');info.className='result-info';info.appendChild(textElement('div',TERRAIN_BY_MARKER.get(item.id)?.consolidated?TERRAIN_BY_MARKER.get(item.id).name:item.name,'result-name'));const meta=document.createElement('div');meta.className='result-meta';meta.appendChild(textElement('span','Z'+item.position.z));meta.appendChild(textElement('span',`${item.position.x}, ${item.position.y}`));const region=TERRAIN_BY_MARKER.get(item.id);if(region?.consolidated)meta.appendChild(textElement('span',huntLevelLabel(region),'lv'));else if(item.level!==null)meta.appendChild(textElement('span','Lv '+item.level+'+','lv'));if(favorites[item.id])meta.appendChild(textElement('span','★','lv'));info.appendChild(meta);b.appendChild(info);const arrow=document.createElement('span');arrow.className='result-next';arrow.innerHTML=ico('chevron','ico small-ico');b.appendChild(arrow);b.addEventListener('click',()=>TERRAIN_BY_MARKER.get(item.id)?.consolidated?focusRespawn(item):choose(item,true));frag.appendChild(b)}if(m.length>visibleCount){const more=document.createElement('button');more.className='load-more';more.type='button';more.textContent=`Mostrar mais ${Math.min(40,m.length-visibleCount)} de ${m.length-visibleCount} locais`;more.addEventListener('click',()=>{visibleCount+=40;renderResults()});frag.appendChild(more)}list.appendChild(frag);schedulePins()}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function renderPins(){
 clearTimeout(pinTimer);pinTimer=0;
 const v=V.getBoundingClientRect(),pad=100;
 const rx0=(-tx-pad)/scale+B.minX,ry0=(-ty-pad)/scale+B.minY;
 const rx1=(v.width-tx+pad)/scale+B.minX,ry1=(v.height-ty+pad)/scale+B.minY;
 const fragment=document.createDocumentFragment();
 // No huge numbered clusters. Only show actual individual icons after zooming in.
 if(scale>=.9){const candidates=filtered().filter(m=>m.position.z===floor&&m.position.x>=rx0&&m.position.x<=rx1&&m.position.y>=ry0&&m.position.y<=ry1),representatives=new Map();
 for(const m of candidates){const a=TERRAIN_BY_MARKER.get(m.id);if(!a?.consolidated)continue;const previous=representatives.get(a.id);if(!previous||m.id===selected?.id||(m.id===a.primaryMarkerId&&previous!==selected?.id))representatives.set(a.id,m.id)}
 for(const m of candidates){const a=TERRAIN_BY_MARKER.get(m.id);if(a?.consolidated&&representatives.get(a.id)!==m.id)continue;fragment.appendChild(makePin(m));}
 }
 pinBaseTx=tx;pinBaseTy=ty;pinBaseScale=scale;
 L.replaceChildren(fragment);L.style.transform='none';
}
function makePin(m){const p=screenPoint(m.position),c=document.createElement('button');c.className='map-marker marker-'+m.main+(selected&&selected.id===m.id?' is-selected':'');c.type='button';c.style.left=p.x+'px';c.style.top=p.y+'px';c.style.setProperty('--pin-color',CAT[m.main].color);c.dataset.originalIcon=String(m.icon_id??'');c.dataset.category=m.main;c.dataset.worldX=m.position.x;c.dataset.worldY=m.position.y;c.setAttribute('aria-label',(TERRAIN_BY_MARKER.get(m.id)?.consolidated?TERRAIN_BY_MARKER.get(m.id).name:m.name)+' — '+m.position.x+', '+m.position.y+', Z'+m.position.z);const pin=document.createElement('span');pin.className='pin-shape';pin.innerHTML=ico(CAT[m.main].icon,'ico category-pin');c.appendChild(pin);if(completed[m.id]){c.classList.add('is-complete');const badge=document.createElementNS('http://www.w3.org/2000/svg','svg');badge.setAttribute('viewBox','0 0 24 24');badge.setAttribute('class','marker-check');badge.setAttribute('aria-hidden','true');badge.innerHTML='<circle class="check-ring" cx="12" cy="12" r="9"/><path class="check-path" d="m7 12.4 3.2 3.1 6.8-7"/>';c.appendChild(badge)}const area=TERRAIN_BY_MARKER.get(m.id),link=GUIDE.byMarker[String(m.id)]||{};const spriteMob=link.monsterIds?.length?MOB_BY_ID.get(link.monsterIds[0]):null;if(showSprites&&scale>=2&&spriteMob?.img&&!area?.consolidated){const th=document.createElement('img');th.src=spriteMob.img;th.className='mob-flag-sprite';th.alt='Criatura associada';th.loading='lazy';c.appendChild(th)}c.appendChild(textElement('span',area?.consolidated?area.name:m.name,'point-label'));c.addEventListener('pointerdown',e=>e.stopPropagation());c.addEventListener('click',e=>{e.stopPropagation();hideTip();choose(m,false)});c.addEventListener('pointerenter',e=>showTip(m,e));c.addEventListener('pointermove',moveTip);c.addEventListener('pointerleave',hideTip);return c}
function showTip(m,e){const d=$('hoverTip');d.replaceChildren();const a=TERRAIN_BY_MARKER.get(m.id);if(a?.consolidated){d.appendChild(textElement('div','ÁREA DE HUNT','tip-kind'));d.appendChild(textElement('h4',a.name));d.appendChild(textElement('div',(a.monsterNames||a.mobIds.map(mobName)).join(' · '),'tip-hint'));d.appendChild(textElement('div',huntLevelLabel(a),'tip-coords'));if(a.spawnNote)d.appendChild(textElement('div',a.spawnNote,'tip-hint'));d.classList.add('visible');moveTip(e);return;}const ex=extraFor(m);d.appendChild(textElement('div',CAT[m.main].label,'tip-kind'));d.appendChild(textElement('h4',m.name));d.appendChild(textElement('div',`X ${m.position.x} · Y ${m.position.y} · Z ${m.position.z}`,'tip-coords'));const matches=linkedMobs(m);if(matches.length){const r=document.createElement('div');r.className='tip-mobs';for(const mon of matches.slice(0,3)){const w=document.createElement('span');w.className='tip-mob';if(mon.img)w.appendChild(imgElement(mon.img,mon.nome,'tip-sprite'));w.appendChild(textElement('span',mon.nome));r.appendChild(w)}d.appendChild(r);const first=matches[0];if(first.drops.length)d.appendChild(textElement('div',first.drops.slice(0,3).map(x=>x.nome+(x.pct!==null&&x.pct!==undefined?' ('+x.pct+'%)':'')).join(' · '),'tip-hint'));d.appendChild(textElement('div','Drops e taxas: conforme arquivo monsters.js do Guia Ninja','tip-provenance'))}else if(ex.monsters)d.appendChild(textElement('div',ex.monsters,'tip-hint'));if((ex.questIds||[]).length)d.appendChild(textElement('div',(ex.questIds||[]).map(id=>QUEST_BY_ID.get(id)?.titulo).filter(Boolean).join(' · '),'tip-hint'));for(const boss of linkedQuestBosses(m))for(const drop of boss.drops)d.appendChild(textElement('div',drop.name+' · '+(drop.pct==null?'chance não informada no Guia':drop.pct+'%'),'tip-hint'));d.classList.add('visible');moveTip(e)}
function moveTip(e){const d=$('hoverTip'),r=V.getBoundingClientRect(),w=d.offsetWidth||210,h=d.offsetHeight||110;d.style.left=clamp(e.clientX-r.left+18,8,r.width-w-8)+'px';d.style.top=clamp(e.clientY-r.top+15,8,r.height-h-8)+'px'}
function hideTip(){$('hoverTip').classList.remove('visible')}
function choose(m,focus){if(focus)return flyToMarker(m.id,{panThenZoom:true,preserveFilters:true});selected=m;if(m.position.z!==floor)switchFloor(m.position.z,false);schedulePins();openDetails();renderResults();if(window.innerWidth<=980)openDetailPanel();if(window.innerWidth<=680)closeFilters()}
function extraFor(m){const c=HUNT_COVERAGE.get(m.id),area=TERRAIN_BY_MARKER.get(m.id),names=(area?.mobIds||[]).map(id=>MOB_BY_ID.get(id)?.nome).filter(Boolean).join(', ');return {...(names?{monsters:names}:{}),...(GUIDE.byMarker[String(m.id)]||{}),...(c?.familyKey?.startsWith('unknown:')?{monsters:c.familyName}:{}),...(extras[String(m.id)]||{})}}
function linkedMobs(m){const linked=(GUIDE.byMarker[String(m.id)]||{}).monsterIds||[];const area=TERRAIN_BY_MARKER.get(m.id);const ids=area?.consolidated?area.mobIds:linked.length?linked:area?.mobIds||[];return ids.map(id=>MOB_BY_ID.get(id)).filter(Boolean)}
function linkedQuests(m){const ids=(GUIDE.byMarker[String(m.id)]||{}).questIds||[];return ids.map(id=>QUEST_BY_ID.get(id)).filter(Boolean)}
function imgElement(src,alt,cls){const im=document.createElement('img');im.src=src;im.alt=alt;im.className=cls||'';im.loading='lazy';im.onerror=()=>im.remove();return im}
function dropImage(drop){if(drop.asset)return drop.asset;const info=ITEM_BY_ID.get(drop.item);return info?.sprite?'sprites/'+info.sprite:''}
function appendText(parent,txt,cls,tag='span'){const e=textElement(tag,txt,cls);parent.appendChild(e);return e}
function renderCreatureList(m,ex){const target=$('monsterPanel');target.replaceChildren();const matches=linkedMobs(m);if(matches.length){for(const mob of matches){const btn=document.createElement('button');btn.className='creature-card';btn.type='button';btn.setAttribute('aria-label',`Ver drops de ${mob.nome}`);if(mob.img)btn.appendChild(imgElement(mob.img,mob.nome,'creature-sprite'));const content=document.createElement('span');content.className='creature-copy';appendText(content,mob.nome,'creature-name','strong');appendText(content,`${mob.drops.length} drops no guia · toque para ver`,`creature-desc`);btn.appendChild(content);const tip=document.createElement('span');tip.className='creature-hover';appendText(tip,'DROPS DE '+mob.nome.toUpperCase(),'creature-hover-title');for(const d of mob.drops.slice(0,6))appendText(tip,`${d.nome} · ${d.pct??'?'}%`,'creature-hover-line');if(mob.drops.length>6)appendText(tip,`+ ${mob.drops.length-6} itens na ficha`,'creature-hover-line');btn.appendChild(tip);btn.addEventListener('click',()=>btn.classList.toggle('expanded'));target.appendChild(btn)}}else if(TERRAIN_BY_MARKER.get(m.id)?.consolidated){return}else if(ex.monsters){itemPills(target,toList(ex.monsters),safeSprite(ex.sprite),'monster',toList(ex.drops))}else{const bosses=linkedQuestBosses(m);const labels=bosses.length?bosses.map(b=>b.name):m.tags.includes('boss')?linkedQuests(m).map(q=>q.boss).filter(Boolean):[];if(labels.length){itemPills(target,[...new Set(labels)],'','monster');target.appendChild(textElement('p','Boss de quest · confira os itens e recompensas abaixo.','source-note'))}else placeholder(target,'Monstros não associados','Não foi possível relacionar um monstro do guia a este marcador pelo nome.');}} 
function renderLootList(m,ex){const target=$('lootPanel');target.replaceChildren();const mobs=linkedMobs(m);if(mobs.length){for(const mob of mobs){const section=document.createElement('div');section.className='drop-group';const header=document.createElement('div');header.className='drop-head';appendText(header,mob.nome,'drop-group-name','strong');appendText(header,`${mob.drops.length} drops`,'drop-group-count');section.appendChild(header);for(const drop of mob.drops){const row=document.createElement('div');row.className='drop-line';const pic=dropImage(drop);if(pic)row.appendChild(imgElement(pic,drop.nome,'drop-sprite'));else{const ph=document.createElement('span');ph.className='drop-fallback';ph.innerHTML=ico('chest','ico small-ico');row.appendChild(ph)}const name=document.createElement('span');name.className='drop-copy';appendText(name,drop.nome,'drop-name','strong');if(drop.rar)appendText(name,drop.rar,'drop-rarity');row.appendChild(name);appendText(row,drop.pct!==null&&drop.pct!==undefined?String(drop.pct)+'%':'—','drop-percent');section.appendChild(row)}target.appendChild(section)}}const manual=toList(ex.drops);if(manual.length){const panel=document.createElement('div');panel.className='manual-drop';appendText(panel,'DROPS ADICIONADOS NA FICHA','control-label');itemPills(panel,manual,'');target.appendChild(panel)}const questRewards=linkedQuests(m).filter(q=>q.rewards?.length||q.premio);if(!mobs.length&&!manual.length&&!questRewards.length)placeholder(target,'Sem loot associado','O Guia ainda não tem itens relacionados a este ponto.');for(const q of questRewards)appendQuestLoot(target,q);if(mobs.length){appendText(target,'Taxas transcritas do arquivo monsters.js do seu Guia Ninja. Associação do monstro à coordenada por nome; confirme o ponto dentro do jogo.','drop-disclaimer','p')}}
function linkedQuestBosses(marker){return (CATALOG.bosses||[]).filter(b=>b.markerIds.includes(marker.id))}
function appendQuestItems(parent,rewards){
 const grid=document.createElement('div');grid.className='quest-item-grid';
 for(const reward of rewards){const item=ITEM_BY_ID.get(reward.itemId);if(!item)continue;const button=document.createElement('button');button.type='button';button.className='quest-item-card';button.dataset.itemId=item.id;button.setAttribute('aria-label','Consultar origem de '+item.nome);if(item.sprite)button.appendChild(imgElement('sprites/'+item.sprite,item.nome,'quest-item-sprite'));const copy=document.createElement('span');copy.appendChild(textElement('strong',item.nome));copy.appendChild(textElement('small','Consultar no assistente ↗'));button.appendChild(copy);if(reward.origin)button.title=reward.origin;button.addEventListener('click',()=>{if(!window.AtlasTools)return;window.AtlasTools.open('chat');window.AtlasTools.ask('Onde consigo '+item.nome+'?')});grid.appendChild(button)}
 parent.appendChild(grid);
}
function appendQuestLoot(parent,q){
 const group=document.createElement('section');group.className='quest-loot-group';group.dataset.questId=q.id;group.appendChild(textElement('h4',q.titulo,'quest-loot-title'));
 if(q.premio)group.appendChild(textElement('p',q.premio,'quest-reward'));
 for(const drop of q.bossDrops||[])group.appendChild(textElement('p',drop.boss+' → '+drop.name+' · '+(drop.pct==null?'chance não informada no Guia':drop.pct+'%'),'quest-boss-drop'));
 if(q.rewards?.length)appendQuestItems(group,q.rewards);
 group.appendChild(textElement('small','Itens e recompensas conforme o Guia NTO.','quest-reward-source'));parent.appendChild(group);
}
function renderQuestList(m,ex){
 const sect=$('questSection'),target=$('questPanel');target.replaceChildren();const qlist=linkedQuests(m);sect.style.display=qlist.length?'':'none';
 for(const q of qlist){const card=document.createElement('article');card.className='quest-card';card.dataset.questId=q.id;appendText(card,q.titulo,'quest-name','h4');
  if(q.boss){appendText(card,'BOSS','quest-label');appendText(card,q.boss,'quest-body','p')}
  if(q.requisitos){appendText(card,'REQUISITOS','quest-label');appendText(card,q.requisitos,'quest-body','p')}
  if(q.premio||q.rewards?.length){appendText(card,'RECOMPENSAS E ITENS','quest-label');if(q.premio)appendText(card,q.premio,'quest-reward','p');if(q.rewards?.length)appendQuestItems(card,q.rewards)}else appendText(card,'O Guia não informa um item de recompensa para esta quest.','quest-body','p');
  for(const drop of q.bossDrops||[])appendText(card,drop.boss+' → '+drop.name+' · '+(drop.pct==null?'chance não informada':drop.pct+'%'),'quest-boss-drop','p');
  const remarks=(q.obs||[]).slice(0,5);if(remarks.length){appendText(card,'DICAS','quest-label');for(const p of remarks)appendText(card,p,'quest-body','p')}
  if(q.imgs?.length){const imgs=document.createElement('div');imgs.className='quest-images';for(const pic of q.imgs.slice(0,4)){const a=document.createElement('a');a.href=pic.src;a.target='_blank';a.rel='noopener';a.title=pic.alt||'Imagem da quest';a.appendChild(imgElement(pic.src,pic.alt||q.titulo,'quest-image'));imgs.appendChild(a)}card.appendChild(imgs)}
  const a=document.createElement('a');a.href='https://ntoultimateguide.vercel.app/#quests';a.target='_blank';a.rel='noopener';a.className='quest-link';a.textContent='Ver seção de quests no Guia Ninja ↗';card.appendChild(a);target.appendChild(card);
 }
}

function toList(str){return String(str||'').split(/[,;\n]/).map(s=>s.trim()).filter(Boolean).slice(0,35)}
function itemPills(el,items,sprite,kind='item',hoverDrops=[]){el.replaceChildren();if(!items.length)return false;const wrap=document.createElement('div');wrap.className='item-list';for(const [i,name] of items.entries()){const p=document.createElement(kind==='monster'?'button':'span');if(kind==='monster')p.type='button';p.className='item-pill'+(kind==='monster'?' monster-pill':'');if(i===0&&sprite){const im=document.createElement('img');im.src=sprite;im.alt='Sprite associado';im.onerror=()=>im.remove();p.appendChild(im)}else p.innerHTML=ico(kind==='monster'?'user':'chest','ico small-ico');p.appendChild(document.createTextNode(name));if(kind==='monster'&&hoverDrops.length){const tip=document.createElement('span');tip.className='monster-drop-tip';tip.textContent='Drops cadastrados neste local: '+hoverDrops.join(', ');p.appendChild(tip)}wrap.appendChild(p)}el.appendChild(wrap);return true}
function safeSprite(s){const v=String(s||'').trim();return (/^(?:https?:\/\/|sprites\/|assets\/)/i.test(v)&&!/[<>"']/g.test(v))?v:''}
function placeholder(el,title,msg){el.replaceChildren();const p=document.createElement('div');p.className='loot-empty';p.innerHTML=ico('info');const wrap=document.createElement('div');wrap.appendChild(textElement('strong',title));wrap.appendChild(textElement('small',msg));p.appendChild(wrap);el.appendChild(p)}
function openDetails(){if(!selected)return;updateCoverageNote(selected);document.querySelector('.shell').classList.add('detail-visible');const m=selected,ex=extraFor(m);$('editArea').hidden=!zoneVertices({id:m.id})&&!FOREST_ZONES.some(z=>FOREST_MOBS[z.mob].id===m.id)&&!TERRAIN_BY_MARKER.has(m.id);const done=!!completed[m.id];$('completeBtn').classList.toggle('done',done);$('completeBtn').setAttribute('aria-pressed',String(done));$('completeBtn').title=done?'Retirar conclusão':'Marcar como concluído';$('completeBtn').querySelector('.complete-label').textContent=done?'Concluído':'Concluir';$('detailEmpty').style.display='none';$('detailOpen').classList.add('show');const area=TERRAIN_BY_MARKER.get(m.id);$('detailName').textContent=area?.consolidated?area.name:m.name;$('detailCategory').textContent=CAT[m.main].label.toUpperCase();$('factFloor').textContent=m.position.z===7?'Superfície · Z7':'Z'+m.position.z;$('factLevel').textContent=area?.consolidated?huntLevelLabel(area):(m.level===null?'Não informado':m.level+'+');$('factCoords').textContent=m.position.x+' · '+m.position.y+' · '+m.position.z;$('detailSource').textContent=m.name+' · '+CAT[m.main].label;const mc=linkedMobs(m),qc=linkedQuests(m),gs=$('guideStatus');gs.textContent=mc.length||qc.length?`${mc.length} criatura(s) e ${qc.length} quest(s) relacionadas pelo nome da marcação. Dados internos extraídos do código do Guia Ninja; confirme a localização no jogo.`:'Ainda não há associação com a base do Guia Ninja para este ponto.';gs.className='source-status'+(mc.length||qc.length?' verified':'');if(!(GUIDE.byMarker[String(m.id)]?.monsterIds||[]).length&&TERRAIN_BY_MARKER.get(m.id)?.mobIds?.length)gs.textContent='Monstros indicados pelos marcadores desta área. Drops conforme a base do Guia Ninja.';if(HUNT_COVERAGE.get(m.id)?.familyKey?.startsWith('unknown:'))gs.textContent='Monstro indicado no marcador original. A ficha de drops ainda não está associada ao Guia.';if(area?.consolidated)gs.textContent='Monstros da área completa conforme a revisão da comunidade. Drops conforme o Guia Ninja.';if(m.community&&!area?.consolidated){gs.textContent='Nome confirmado pela comunidade. Level e drops ainda não cadastrados. O ponto e o limite são aproximados.';$('detailSource').textContent='Área azul da imagem fornecida pela comunidade · coordenada aproximada';}const tags=$('detailTags');tags.replaceChildren();for(const tag of [...new Set([m.main,...m.tags])]){const x=document.createElement('span');x.className='mini-tag';x.style.borderColor=CAT[tag]?.color||'#594a3e';x.textContent=CAT[tag]?.label||tag;tags.appendChild(x)}if(area?.consolidated)tags.appendChild(textElement('span',huntLevelLabel(area),'mini-tag'));else if(m.level!==null)tags.appendChild(textElement('span','Lv '+m.level+'+','mini-tag'));$('favoriteBtn').classList.toggle('is-fave',!!favorites[m.id]);renderCreatureList(m,ex);appendUncataloguedAreaMobs(m);window.AtlasTools?.syncDetails(m);renderLootList(m,ex);renderQuestList(m,ex);if(ex.rewards){const extraReward=textElement('p','Recompensas cadastradas: '+ex.rewards,'source-note');$('lootPanel').appendChild(extraReward)}if(ex.notes){$('notesPanel').replaceChildren();$('notesPanel').appendChild(textElement('div',ex.notes,'source-note'))}else placeholder($('notesPanel'),'Notas em preparação','Informações adicionais ainda não associadas a esta marcação.');}
function openDetailPanel(){$('detailPanel').classList.add('open');if(window.innerWidth<=680)$('backdrop').classList.add('visible')}
function closeDetailPanel(){document.querySelector('.shell').classList.remove('detail-visible');$('detailPanel').classList.remove('open');if(!$('sidebar').classList.contains('open'))$('backdrop').classList.remove('visible')}
function openFilters(){$('sidebar').classList.add('open');$('backdrop').classList.add('visible');closeDetailPanel();$('backdrop').classList.add('visible')}
function closeFilters(){$('sidebar').classList.remove('open');if(!$('detailPanel').classList.contains('open'))$('backdrop').classList.remove('visible')}
function showToast(msg){const a=$('toast');a.textContent=msg;a.classList.add('on');clearTimeout(showToast.t);showToast.t=setTimeout(()=>a.classList.remove('on'),2300)}
function downloadObject(obj,name){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function saveEdit(e){e.preventDefault();if(!selected)return;const d={monsters:$('editMonsters').value.trim(),drops:$('editDrops').value.trim(),rewards:$('editRewards').value.trim(),sprite:$('editSprite').value.trim(),notes:$('editNotes').value.trim()};if(Object.values(d).every(v=>!v))delete extras[selected.id];else extras[selected.id]=d;persist('gn_extras_v1',extras);$('editDialog').close();openDetails();showToast('Ficha salva neste navegador')}

const UP_COLORS=['#75cbb8','#6ec987','#a2a9ef','#edbe78','#c28be8','#f2a16e','#e17683','#d8bc69'];
function upRanges(){return UPGUIDE[upSet].ranges}
function levelColor(i){return UP_COLORS[i%UP_COLORS.length]}
function svgNode(tag,attrs){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,String(v));return n}
function zoneColor(a,fallback='#86bfa1'){const n=normalize(a.name);if(n.includes('nukenin'))return '#fb6576';if(n.includes('kuroari'))return '#59adff';if(n.includes('renegade'))return '#f8cd56';return fallback}
function zoneVertices(a){const id=String(a.id),manual=reviewedZones[id];return Array.isArray(manual?.vertices)&&manual.vertices.length>=3?manual.vertices:SUGGESTED_BY_ID.get(id)?.vertices||null}
function zoneToPath(verts){return verts.map((p,i)=>`${i?'L':'M'}${p[0]-B.minX},${p[1]-B.minY}`).join(' ')+' Z'}
function validUpAnchor(a,r){const m=MARKERS.find(m=>m.id===a.id);return !(m?.level!==null&&m?.level!==undefined&&m.level>r.ate)}
function zoneRangesForMarker(id){return upRanges().filter(r=>r.anchors.some(a=>String(a.id)===String(id)&&validUpAnchor(a,r)))}
function showZoneTip(e,a,bands,reviewed){if(zoneEditor)return;const tip=$('upZoneTooltip');tip.replaceChildren();
 const marker=MARKERS.find(m=>m.id===a.id);const raw=a.name.match(/(?:n[ií]vel\s*)?(\d{2,4})\s*a\s*(\d{2,4})(?:\/(\d{2,4}))?/i);const actual=raw?'Level '+raw[1]+'–'+(raw[3]||raw[2]):marker?.level?'Level '+marker.level+'+':bands.length?bands.map(x=>`Guia: level ${x.de}–${x.ate}`).join(' · '):'Level não informado';const title=textElement('strong',actual);tip.appendChild(title);
 tip.appendChild(textElement('span',a.name));const m=MARKERS.find(m=>m.id===a.id);if(m){const mobs=linkedMobs(m);if(mobs.length)tip.appendChild(textElement('span',mobs.map(x=>x.nome).join(' · '),'zone-mob-name'));}
 tip.appendChild(textElement('small',reviewed?'Contorno ajustado manualmente':'Limite aproximado · confira no jogo'));
 tip.hidden=false;moveZoneTip(e)}
function moveZoneTip(e){const tip=$('upZoneTooltip');if(tip.hidden)return;const r=MW.getBoundingClientRect();const w=tip.offsetWidth||220,h=tip.offsetHeight||80;
 tip.style.left=Math.max(7,Math.min(e.clientX-r.left+14,r.width-w-8))+'px';tip.style.top=Math.max(7,Math.min(e.clientY-r.top+14,r.height-h-8))+'px'}
function hideZoneTip(){$('upZoneTooltip').hidden=true}
function drawUpZones(){
 const root=$('levelZones');if(!root)return;root.replaceChildren();const visibleMarkerIds=new Set(filtered().map(m=>String(m.id)));
 root.setAttribute('width',W);root.setAttribute('height',H);root.setAttribute('viewBox',`0 0 ${W} ${H}`);
 if(!upEnabled){return;}
 const seen=new Map();
 upRanges().forEach((r,i)=>{if(upBand!=='all'&&upBand!==r.id)return;
  for(const a of r.anchors){if(a.z!==floor||!validUpAnchor(a,r)||!visibleMarkerIds.has(String(a.id)))continue;
    const id=String(a.id);if((floor===7&&[430,147,199,563,182,379,102,137].includes(a.id))||HUNT_COVERAGE.has(a.id)||TERRAIN_BY_MARKER.has(a.id))continue;if(!seen.has(id))seen.set(id,{a,bands:[],color:zoneColor(a,levelColor(i))});
    seen.get(id).bands.push(r);
  }
 });
 for(const [id,group] of seen){const verts=zoneVertices(group.a);if(!verts||verts.length<3)continue;
  const reviewed=!!reviewedZones[id]?.vertices;
  const node=svgNode('path',{d:zoneToPath(verts),fill:group.color,stroke:group.color,class:'up-zone-path '+(reviewed?'is-reviewed':'is-suggested'),tabindex:0,'aria-label':group.bands.map(r=>`Level ${r.de} a ${r.ate}`).join(', ')+': '+group.a.name});
  node.addEventListener('pointerenter',e=>showZoneTip(e,group.a,group.bands,reviewed));
  node.addEventListener('pointermove',moveZoneTip);
  node.addEventListener('pointerleave',hideZoneTip);
  node.addEventListener('pointerdown',hideZoneTip);
  node.addEventListener('focus',e=>showZoneTip({clientX:V.getBoundingClientRect().left+V.clientWidth/2,clientY:V.getBoundingClientRect().top+90},group.a,group.bands,reviewed));
  node.addEventListener('blur',hideZoneTip);
  node.addEventListener('click',e=>{if(zoneEditor)return;e.stopPropagation();if(drag)return;const m=MARKERS.find(m=>m.id===group.a.id);if(m)choose(m,false)});
  root.appendChild(node);
 }
 drawForestZones(root);
 drawTerrainHunts(root);
 drawZoneEditSketch();
}
function drawZoneEditSketch(){const root=$('levelZones');if(!root||!zoneEditor)return;
 const verts=zoneEditor.vertices;const g=svgNode('g',{'aria-hidden':'true'});
 if(verts.length>=2){const shape=svgNode(verts.length>=3?'polygon':'polyline',{points:verts.map(p=>(p[0]-B.minX)+','+(p[1]-B.minY)).join(' '),class:'zone-edit-sketch'});g.appendChild(shape)}
 for(const [x,y] of verts)g.appendChild(svgNode('circle',{cx:x-B.minX,cy:y-B.minY,r:Math.max(1.6,4/scale),class:'zone-edit-dot'}));
 root.appendChild(g);
 $('zoneEditInstructions').textContent=`${verts.length} ponto(s). Clique nas bordas da hunt para traçar; depois pressione Salvar limite. Esc cancela.`;
 $('zoneEditFinish').disabled=verts.length<3;
 $('zoneEditUndo').disabled=verts.length===0;
}
function startZoneEdit(a){if(!a)return;hideZoneTip();zoneEditor={anchor:a,vertices:[]};$('zoneEditToolbar').hidden=false;$('zoneEditName').textContent='Delimitar: '+a.name;MW.classList.add('zone-edit-mode');drawUpZones();if(window.innerWidth<=700)closeFilters()}
function stopZoneEdit(){zoneEditor=null;$('zoneEditToolbar').hidden=true;MW.classList.remove('zone-edit-mode');drawUpZones()}
function undoZonePoint(){if(!zoneEditor)return;zoneEditor.vertices.pop();drawUpZones()}
function saveZoneEdit(){if(!zoneEditor||zoneEditor.vertices.length<3)return;
 const points=zoneEditor.vertices;
 const area=Math.abs(points.reduce((n,p,i)=>n+p[0]*points[(i+1)%points.length][1]-points[(i+1)%points.length][0]*p[1],0))/2;
 if(area<10){showToast('Contorno muito pequeno. Escolha pelo menos três pontos afastados.');return}
 reviewedZones[String(zoneEditor.anchor.id)]={vertices:points,z:zoneEditor.anchor.z,name:zoneEditor.anchor.name,source:'tracado_manualmente'};
 persist('gn_zone_polygons_v14',reviewedZones);stopZoneEdit();showToast('Limite salvo no navegador. Exporte para fazer backup.')}
function resetZoneEdit(){if(!zoneEditor)return;delete reviewedZones[String(zoneEditor.anchor.id)];persist('gn_zone_polygons_v14',reviewedZones);stopZoneEdit();showToast('Contorno sugerido restaurado.')}
function initZoneEditor(){
 $('zoneEditFinish').addEventListener('click',saveZoneEdit);$('zoneEditUndo').addEventListener('click',undoZonePoint);$('zoneEditCancel').addEventListener('click',stopZoneEdit);$('zoneEditReset').addEventListener('click',resetZoneEdit);
 V.addEventListener('pointerdown',e=>{if(!zoneEditor||e.button!==0)return;
  e.preventDefault();e.stopImmediatePropagation();const pos=worldFromClient(e.clientX,e.clientY);
  if(pos.z!==zoneEditor.anchor.z)return;
  zoneEditor.vertices.push([pos.x,pos.y]);drawUpZones();
 },true);
 document.addEventListener('keydown',e=>{if(!zoneEditor)return;if(e.key==='Escape'){e.preventDefault();stopZoneEdit()}else if(e.key==='Backspace'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();undoZonePoint()}});
 $('exportZonesBtn').addEventListener('click',()=>downloadObject({version:1,source:'Guia Ninja Atlas v14',polygons:reviewedZones},'atlas_limites_hunts_revisados.json'));
 $('importZonesBtn').addEventListener('click',()=>$('importZonesFile').click());
 $('importZonesFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{
  const data=JSON.parse(await file.text());const polygons=data.polygons||data;
  if(!polygons||typeof polygons!=='object'||Array.isArray(polygons))throw new Error('Formato inválido');
  let count=0;for(const [id,entry] of Object.entries(polygons)){
   if(!/^\d+$/.test(id)||!MARKERS.some(m=>String(m.id)===id))continue;
   if(!Array.isArray(entry?.vertices)||entry.vertices.length<3||entry.vertices.length>1500)continue;
   if(!entry.vertices.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=-10000&&n<=100000)))continue;
   reviewedZones[id]={vertices:entry.vertices,z:entry.z||7,source:'importado'};count++;
  }if(!count)throw new Error('Nenhum contorno válido');persist('gn_zone_polygons_v14',reviewedZones);drawUpZones();showToast(count+' contornos importados.');
 }catch(err){showToast('Não foi possível importar: '+err.message)}e.target.value=''});
}
function renderUpLegend(){
 const legend=$('upLegend'),r=upRanges();legend.replaceChildren();
 r.forEach((level,i)=>{const b=document.createElement('button');b.type='button';b.className='up-range'+(upBand===level.id?' chosen':'');
  b.style.setProperty('--band-color',levelColor(i));b.textContent=`${level.de}–${level.ate}`;
  b.title=`Level ${level.de} a ${level.ate} · ${level.anchors.filter(a=>validUpAnchor(a,level)).length} localizações compatíveis`;
  b.setAttribute('aria-pressed',String(upBand===level.id));b.addEventListener('click',()=>{upBand=upBand===level.id?'all':level.id;$('upBand').value=upBand;refreshUp()});legend.appendChild(b);
 });
}
function renderUpRecommendations(){
 const box=$('upRecommendations');box.replaceChildren();
 if(!upEnabled){box.appendChild(textElement('p','Camada de evolução desativada.','up-empty'));return}
 const chosen=upRanges().find(x=>x.id===upBand);
 if(!chosen){box.appendChild(textElement('p','Selecione uma faixa para ver as hunts recomendadas.','up-empty'));return}
 const heading=textElement('strong',`Level ${chosen.de}–${chosen.ate}`,'up-rec-title');box.appendChild(heading);
 const rec=document.createElement('div');rec.className='up-rec-mobs';
 for(const opt of chosen.options){let line=opt.mobs.join(' + ');if(opt.local)line+=' · '+opt.local;rec.appendChild(textElement('span',line))}
 box.appendChild(rec);
 const validAnchors=chosen.anchors.filter(a=>validUpAnchor(a,chosen));
 if(validAnchors.length===0){box.appendChild(textElement('p','Esta faixa ainda não tem localização compatível com o level informado pelos marcadores. Não vamos desenhar uma zona incorreta.','up-empty'));return}
 box.appendChild(textElement('small',`${validAnchors.length} locais relacionados nos marcadores (associação por nome)`));
 for(const a of validAnchors){
  const link=document.createElement('button');link.className='up-destination';link.type='button';
  link.appendChild(textElement('span',a.name));link.appendChild(textElement('small',`Z${a.z} · ${a.x}, ${a.y}`));
  link.addEventListener('click',()=>{const m=MARKERS.find(m=>m.id===a.id);if(m)choose(m,true);if(window.innerWidth<=680)closeFilters()});
  const row=document.createElement('div');row.style.display='flex';row.style.gap='5px';row.appendChild(link);
  const delineate=document.createElement('button');delineate.type='button';delineate.className='zone-small-action';delineate.textContent='Delimitar';delineate.title='Desenhar a área real desta hunt, ponto a ponto';
  delineate.addEventListener('click',()=>{if(a.z!==floor)switchFloor(a.z,false);center(a.x,a.y,Math.max(scale,1.6));startZoneEdit(a)});row.appendChild(delineate);box.appendChild(row);
 }
 
}
function refreshUp(){renderUpLegend();renderUpRecommendations();drawUpZones()}
function initUpPanel(){
 const band=$('upBand');
 function rebuild(){band.replaceChildren();band.add(new Option('Todas as faixas','all'));upRanges().forEach(r=>band.add(new Option(`${r.de}–${r.ate}`,r.id)));upBand='all';band.value=upBand;refreshUp()}
 $('upToggle').addEventListener('change',e=>{upEnabled=e.target.checked;refreshUp()});
 $('upSet').addEventListener('change',e=>{upSet=e.target.value;rebuild()});
 band.addEventListener('change',e=>{upBand=e.target.value;refreshUp()});
 rebuild();
}

function init(){MW.classList.toggle('compact-icons',compactIcons);initUpPanel();initZoneEditor();for(const f of META.floors){const opt=document.createElement('option');opt.value=f.z;opt.textContent=f.z===7?'Z7 · Superfície':`Z${f.z}`;$('floorSelect').appendChild(opt);$('quickFloor').appendChild(opt.cloneNode(true))}$('totalMarkers').textContent=ALL;renderCategories();renderResults();switchFloor(7);requestAnimationFrame(()=>forestHome());
 $('withMonsters').addEventListener('change',e=>{onlyMonsters=e.target.checked;visibleCount=40;renderResults()});$('searchInput').addEventListener('input',e=>{query=normalize(e.target.value.trim());$('clearSearch').style.display=query?'block':'none';visibleCount=40;renderResults()});$('clearSearch').addEventListener('click',()=>{$('searchInput').value='';query='';$('clearSearch').style.display='none';renderResults()});$('levelSelect').addEventListener('change',e=>{levelFilter=+e.target.value;visibleCount=40;renderResults()});$('floorSelect').addEventListener('change',e=>switchFloor(e.target.value));$('quickFloor').addEventListener('change',e=>switchFloor(e.target.value));$('onlyFloor').addEventListener('change',e=>{onlyFloor=e.target.checked;visibleCount=40;renderResults()});$('favoritesOnly').addEventListener('change',e=>{onlyFav=e.target.checked;visibleCount=40;renderResults()});$('resetFilters').addEventListener('click',()=>{cat='all';query='';levelFilter=0;onlyFav=false;onlyFloor=false;onlyMonsters=false;visibleCount=40;$('searchInput').value='';$('levelSelect').value='0';$('favoritesOnly').checked=false;$('onlyFloor').checked=false;$('withMonsters').checked=false;$('clearSearch').style.display='none';renderCategories();renderResults()});
 $('spriteToggle').addEventListener('change',e=>{showSprites=e.target.checked;schedulePins()});$('iconStyleToggle').addEventListener('click',()=>{compactIcons=!compactIcons;MW.classList.toggle('compact-icons',compactIcons);try{localStorage.setItem('gn_compact_icons_v2',String(compactIcons))}catch(_){ }showToast(compactIcons?'Ícones compactos do minimapa':'Ícones grandes destacados')});$('zoomIn').addEventListener('click',()=>zoom(1.55));$('zoomOut').addEventListener('click',()=>zoom(1/1.55));$('fitMap').addEventListener('click',fit);$('namesToggle').addEventListener('click',()=>{names=!names;MW.classList.toggle('show-names',names);$('namesToggle').style.borderColor=names?'#e3aa56':'';showToast(names?'Nomes visíveis':'Nomes ocultos')});
 V.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,px:e.clientX,py:e.clientY,tx,ty,moved:false}});V.addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id){const dx=e.clientX-drag.px,dy=e.clientY-drag.py;if(Math.hypot(dx,dy)>4&&!drag.moved){drag.moved=true;V.setPointerCapture(e.pointerId);V.classList.add('dragging');hideZoneTip();hideTip()}if(drag.moved){tx=drag.tx+dx;ty=drag.ty+dy;place()}}const p=worldFromClient(e.clientX,e.clientY);$('cursorX').textContent=p.x;$('cursorY').textContent=p.y});function stopDrag(){if(!drag)return;drag=null;V.classList.remove('dragging');schedulePins()}V.addEventListener('pointerup',stopDrag);V.addEventListener('pointercancel',stopDrag);
 let floorWheelAt=0;V.addEventListener('wheel',e=>{e.preventDefault();if(!e.deltaY)return;if(e.ctrlKey){const now=performance.now();if(now-floorWheelAt<180)return;floorWheelAt=now;switchFloor(floor+(e.deltaY>0?-1:1),false);return}const r=V.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.00135),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 V.addEventListener('dblclick',e=>{if(e.target.closest('button'))return;const p=worldFromClient(e.clientX,e.clientY);center(p.x,p.y,Math.min(3,scale*1.5))});
 $('completeBtn').addEventListener('click',()=>{if(!selected)return;if(completed[selected.id])delete completed[selected.id];else completed[selected.id]=true;persist('gn_completed_v7',completed);openDetails();schedulePins();showToast(completed[selected.id]?'Local marcado como concluído':'Conclusão desmarcada')});
 $('favoriteBtn').addEventListener('click',()=>{if(!selected)return;if(favorites[selected.id])delete favorites[selected.id];else favorites[selected.id]=true;persist('gn_favs_v1',favorites);openDetails();renderResults();showToast(favorites[selected.id]?'Adicionado aos favoritos':'Removido dos favoritos')});$('centerDetail').addEventListener('click',()=>{if(!selected)return;if(selected.position.z!==floor)switchFloor(selected.position.z,false);center(selected.position.x,selected.position.y,Math.max(scale,1));if(window.innerWidth<=980)closeDetailPanel()});$('copyCoords').addEventListener('click',async()=>{if(!selected)return;const s=`${selected.position.x}, ${selected.position.y}, ${selected.position.z}`;try{await navigator.clipboard.writeText(s);showToast('Coordenadas copiadas: '+s)}catch(_){const ta=document.createElement('textarea');ta.value=s;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();showToast(ok?'Coordenadas copiadas':'Coordenadas: '+s)}});
 $('editDetails').addEventListener('click',()=>{if(!selected)return;const x=extraFor(selected);$('editMonsters').value=x.monsters||'';$('editDrops').value=x.drops||'';$('editRewards').value=x.rewards||'';$('editSprite').value=x.sprite||'';$('editNotes').value=x.notes||'';$('editDialog').showModal()});$('editForm').addEventListener('submit',saveEdit);$('closeDialog').addEventListener('click',()=>$('editDialog').close());$('cancelEdit').addEventListener('click',()=>$('editDialog').close());$('exportData').addEventListener('click',()=>downloadObject({source:'Guia Ninja Atlas - enriquecimentos locais',version:1,created_at:new Date().toISOString(),enrichments:extras,favorites:Object.keys(favorites).filter(k=>favorites[k]).map(Number)},'atlas_ninja_minhas_fichas.json'));
 $('importData').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data.enrichments||typeof data.enrichments!=='object'||Array.isArray(data.enrichments))throw new Error('Estrutura incompatível');const valid=new Set(MARKERS.map(m=>String(m.id)));let added=0;for(const [id,obj] of Object.entries(data.enrichments)){if(!valid.has(id)||!obj||typeof obj!=='object'||Array.isArray(obj))continue;extras[id]={};for(const field of ['monsters','drops','rewards','notes','sprite']){if(typeof obj[field]==='string')extras[id][field]=obj[field].slice(0,4000)}added++}if(Array.isArray(data.favorites)){for(const id of data.favorites){if(valid.has(String(id)))favorites[String(id)]=true}}persist('gn_extras_v1',extras);persist('gn_favs_v1',favorites);if(selected)openDetails();renderResults();showToast(`${added} fichas importadas`)}catch(err){showToast('Não foi possível importar: '+err.message)}finally{e.target.value=''}});
 $('openFilters').addEventListener('click',openFilters);$('closeDetail').addEventListener('click',closeDetailPanel);$('backdrop').addEventListener('click',()=>{closeFilters();closeDetailPanel()});window.addEventListener('resize',()=>{place();if(window.innerWidth>980){closeFilters()}});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeFilters();closeDetailPanel();hideTip()};if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'){e.preventDefault();$('searchInput').focus();if(window.innerWidth<=680)openFilters()}})}
window.AtlasNavigate={go(x,y,z=7,zoom=3){switchFloor(z,false);center(x,y,zoom);void 0;},refresh(){schedulePins()}};
const FOREST_ZONES=JSON.parse($('forestReferencePayload').textContent);
const FOREST_MOBS={nukenin:{name:'Nukenin',id:430,color:'#fb6576',level:'150–400'},kuroari:{name:'Kuroari',id:638,color:'#59adff',level:'não informado'},renegade:{name:'Renegade',id:147,color:'#f8cd56',level:'150+'}};
let markersVisible=true;
function drawForestZones(root){
 if(floor!==7)return;
 const chosen=upRanges().find(r=>r.id===upBand);
 for(const zone of FOREST_ZONES){
  const mob=FOREST_MOBS[zone.mob];if(!filtered().some(m=>m.id===mob.id))continue;
  // Kuroari has no verified level in the attached database.
  if(chosen&&(zone.mob==='kuroari'||chosen.ate<150||(zone.mob==='nukenin'&&chosen.de>400)))continue;
  const verts=mob.id&&reviewedZones[String(mob.id)]?.vertices||zone.vertices;
  const manual=reviewedZones[String(mob.id)]?.vertices;const terrainRings=manual?[manual]:(zone.rings||[verts]);
  const node=svgNode('path',{d:terrainRings.map(zoneToPath).join(' '),'fill-rule':'evenodd',fill:mob.color,stroke:mob.color,class:'up-zone-path forest-zone',tabindex:0,'data-mob':zone.mob,'aria-label':mob.name+', level '+mob.level+', limite aproximado'});
  const show=e=>{
   if(zoneEditor)return;
   const tip=$('upZoneTooltip');tip.replaceChildren();tip.style.setProperty('--tip-color',mob.color);
   tip.appendChild(textElement('small','SOUTH FOREST · ÁREA DE HUNT','zone-eyebrow'));
   const title=textElement('strong',mob.name);tip.appendChild(title);
   tip.appendChild(textElement('span',mob.level==='não informado'?'Level não informado':'Level '+mob.level,'zone-level'));
   tip.appendChild(textElement('small','Silhueta do terreno · limites de spawn aproximados'));
   tip.appendChild(textElement('small',zone.mob==='kuroari'?'Nome informado pela comunidade · dados pendentes':'Clique para ver monstros e drops','zone-click-hint'));
   tip.hidden=false;moveZoneTip(e);
  };
  node.style.color=mob.color;node.addEventListener('pointerenter',show);node.addEventListener('pointermove',moveZoneTip);node.addEventListener('pointerleave',hideZoneTip);
  node.addEventListener('pointerdown',()=>{});
  node.addEventListener('focus',()=>show({clientX:V.getBoundingClientRect().left+V.clientWidth/2,clientY:V.getBoundingClientRect().top+V.clientHeight/2}));node.addEventListener('blur',hideZoneTip);
  node.addEventListener('click',e=>{if(zoneEditor)return;e.stopPropagation();hideZoneTip();if(mob.id){const m=MARKERS.find(m=>m.id===mob.id);if(m)choose(m,false)}});
  root.appendChild(node);
 }
}
function forestHome(){if(floor!==7)switchFloor(7,false);center(866,1038,Math.min(3,Math.max(1.4,Math.min((V.clientWidth-120)/310,(V.clientHeight-160)/350))));updateRegion()}
function updateRegion(){
 if(!$('regionTitle'))return;
 const x=(V.clientWidth/2-tx)/scale+B.minX,y=(V.clientHeight/2-ty)/scale+B.minY;
 const forest=x>=700&&x<=1030&&y>=925&&y<=1230;
 const konoha=x>=970&&x<=1160&&y>=820&&y<980;
 $('regionTitle').textContent=scale<.65?'Mundo Ninja':forest?'South Forest':konoha?'Konoha':'Explorando o mundo';
 $('regionDescription').textContent=scale<.65?'Todos os caminhos. Seu próximo destino.':forest||konoha?'País do Fogo · NTO Ultimate':'NTO Ultimate · mapa da comunidade';if(scale>=.65){const contains=a=>a&&a.z===floor&&x>=a.bounds[0]&&x<=a.bounds[2]&&y>=a.bounds[1]&&y<=a.bounds[3];const focused=selected&&TERRAIN_BY_MARKER.get(selected.id);const zone=contains(focused)?focused:(!forest&&!konoha?TERRAIN_HUNTS.find(contains):null);if(zone){$('regionTitle').textContent=zone.name;$('regionDescription').textContent=huntLevelLabel(zone)+' · Z'+floor;}}
}
function updateFloorUI(){
 const label=floor===7?'Superfície':floor<7?'Acima da superfície':'Subsolo';
 $('floorTitle').textContent='Z'+floor;$('floorDescription').textContent=label;
 $('floorUp').disabled=floor===0;$('floorDown').disabled=floor===15;
 for(const b of $('floorTrack').children){b.classList.toggle('current',Number(b.dataset.floor)===floor);b.setAttribute('aria-pressed',String(Number(b.dataset.floor)===floor))}
}
function syncTabs(){
 if(!$('exploreTab'))return;
 $('exploreTab').classList.toggle('active',!onlyFav);$('favoritesTab').classList.toggle('active',onlyFav);
 $('exploreTab').setAttribute('aria-pressed',String(!onlyFav));$('favoritesTab').setAttribute('aria-pressed',String(onlyFav));
}
function initNewUI(){
 initTerrainRenderer();initRespawns();
 for(const [key,category] of Object.entries(CAT)){if(key==='all')continue;const row=document.createElement('div');row.className='marker-key-item';row.style.setProperty('--key-color',category.color);row.innerHTML=ico(category.icon,'ico small-ico');row.appendChild(textElement('span',category.label));$('markerKey').appendChild(row)}
 for(let z=0;z<16;z++){const b=document.createElement('button');b.dataset.floor=z;b.title='Z'+z+(z===7?' · Superfície':'');b.setAttribute('aria-label','Ir para andar Z'+z);b.addEventListener('click',()=>switchFloor(z,false));$('floorTrack').appendChild(b)}updateFloorUI();
 $('editArea').addEventListener('click',()=>{if(!selected)return;const p=selected.position;const a={id:selected.id,name:selected.name,x:p.x,y:p.y,z:p.z};if(floor!==p.z)switchFloor(p.z,false);closeDetailPanel();startZoneEdit(a);});
 $('floorUp').addEventListener('click',()=>switchFloor(floor-1,false));$('floorDown').addEventListener('click',()=>switchFloor(floor+1,false));
 $('forestView').addEventListener('click',forestHome);$('worldView').addEventListener('click',fit);
 $('closeFiltersNew').addEventListener('click',closeFilters);
 for(const [id,value] of [['exploreTab',false],['favoritesTab',true]])$(id).addEventListener('click',()=>{onlyFav=value;$('favoritesOnly').checked=value;visibleCount=40;renderResults()});
 $('openHelp').addEventListener('click',()=>$('helpDialog').showModal());for(const id of ['closeHelp','helpDone'])$(id).addEventListener('click',()=>$('helpDialog').close());
 $('layersButton').addEventListener('click',()=>{const open=$('layersPopover').hidden;$('layersPopover').hidden=!open;$('layersButton').setAttribute('aria-expanded',String(open))});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.layer-controls')){$('layersPopover').hidden=true;$('layersButton').setAttribute('aria-expanded','false')}});
 $('showAreasNew').addEventListener('change',e=>{upEnabled=e.target.checked;$('upToggle').checked=upEnabled;refreshUp()});
 $('upToggle').addEventListener('change',()=>{$('showAreasNew').checked=upEnabled});
 $('showMarkersNew').addEventListener('change',e=>{markersVisible=e.target.checked;MW.classList.toggle('hide-markers',!markersVisible)});
 $('areaOpacity').addEventListener('input',e=>MW.style.setProperty('--area-opacity',Number(e.target.value)/100));
 for(const b of document.querySelectorAll('[data-zone-mob]'))b.addEventListener('click',()=>{
  const zone=FOREST_ZONES.find(z=>z.mob===b.dataset.zoneMob);switchFloor(7,false);
  if(!upEnabled){upEnabled=true;$('upToggle').checked=true;$('showAreasNew').checked=true}
  upBand='all';$('upBand').value='all';refreshUp();
  const xs=zone.vertices.map(p=>p[0]),ys=zone.vertices.map(p=>p[1]);center((Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2,Math.min(4,Math.max(2,scale)));
  const node=document.querySelector('.forest-zone[data-mob="'+zone.mob+'"]');if(node)node.focus({preventScroll:true});
 });
 document.addEventListener('keydown',e=>{
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||e.ctrlKey||e.altKey||e.metaKey||document.querySelector('dialog[open]')||zoneEditor)return;
  if(e.key==='PageUp'){e.preventDefault();switchFloor(floor-1,false)}if(e.key==='PageDown'){e.preventDefault();switchFloor(floor+1,false)}if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.3)}if(e.key==='-'){e.preventDefault();zoom(1/1.3)}if(e.key==='Home'){e.preventDefault();fit()}if(e.key==='Escape'){$('layersPopover').hidden=true;$('layersButton').setAttribute('aria-expanded','false');hideZoneTip()}
 });
 const observer=new MutationObserver(()=>{if(selected)for(const id of ['favoriteBtn','completeBtn','centerDetail','copyCoords','editDetails'])$(id).disabled=false;});observer.observe($('detailName'),{childList:true});
}

// Render the visible raster directly at display resolution. It never passes
// through a magnified CSS bitmap, and interpolation stays disabled.
let terrainContext=null,terrainFrame=0;
function initTerrainRenderer(){
 if(typeof window.CanvasRenderingContext2D==='undefined')return;
 const canvas=$('mapCanvas');
 try{terrainContext=canvas.getContext('2d',{alpha:false})}catch(_){return}
 if(!terrainContext)return;
 IMG.addEventListener('load',scheduleTerrain);
 IMG.addEventListener('error',()=>{MW.classList.remove('canvas-ready');canvas.hidden=true});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(scheduleTerrain).observe(V);
 window.addEventListener('resize',scheduleTerrain);scheduleTerrain();
}
function scheduleTerrain(){if(terrainContext&&!terrainFrame)terrainFrame=requestAnimationFrame(drawTerrain)}
function drawTerrain(){
 terrainFrame=0;
 if(!terrainContext||!IMG.complete||!IMG.naturalWidth){MW.classList.remove('canvas-ready');$('mapCanvas').hidden=true;return}
 const canvas=$('mapCanvas'),ratio=Math.min(3,Math.max(1,window.devicePixelRatio||1));
 const width=Math.max(1,Math.round(V.clientWidth*ratio)),height=Math.max(1,Math.round(V.clientHeight*ratio));
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
 const ctx=terrainContext;ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#080b08';ctx.fillRect(0,0,width,height);
 const f=floorData(),left=tx+(f.x-B.minX)*scale,top=ty+(f.y-B.minY)*scale;
 const sx=Math.max(0,Math.floor(-left/scale)),sy=Math.max(0,Math.floor(-top/scale));
 const ex=Math.min(IMG.naturalWidth,Math.ceil((V.clientWidth-left)/scale)),ey=Math.min(IMG.naturalHeight,Math.ceil((V.clientHeight-top)/scale));
 if(ex>sx&&ey>sy){const sw=ex-sx,sh=ey-sy;
  ctx.drawImage(IMG,sx,sy,sw,sh,Math.round((left+sx*scale)*ratio),Math.round((top+sy*scale)*ratio),Math.round(sw*scale*ratio),Math.round(sh*scale*ratio));
 }
 canvas.hidden=false;MW.classList.add('canvas-ready');
}

let respawnLimit=30;
function huntLevelLabel(zone){if(zone.levelNote)return zone.levelNote;return zone.level?(zone.levelMax?'Level '+zone.level+'–'+zone.levelMax:'Level '+zone.level+'+'):'Level não informado'}
function terrainHuntVisible(zone,visible){
 if(zone.z!==floor)return false;
 visible=visible||new Set(filtered().map(m=>m.id));if(!zone.markerIds.some(id=>visible.has(id)))return false;
 const band=upRanges().find(r=>r.id===upBand);return !band||zone.level===null||(zone.level<=band.ate&&(!zone.levelMax||zone.levelMax>=band.de));
}
function drawTerrainHunts(root){
 const visible=new Set(filtered().map(m=>m.id));
 for(const zone of TERRAIN_HUNTS){
  if(!terrainHuntVisible(zone,visible))continue;
  const manual=zone.markerIds.map(id=>reviewedZones[String(id)]).find(x=>x?.vertices?.length>=3&&(!x.z||x.z===floor));
  const path=svgNode('path',{d:manual?zoneToPath(manual.vertices):(zone.path||zone.rings.map(zoneToPath).join(' ')),'fill-rule':'evenodd',fill:zone.color,stroke:zone.color,class:'up-zone-path terrain-hunt',tabindex:0,'data-area-id':zone.id,'aria-label':zone.name+' · '+huntLevelLabel(zone)});
  path.style.color=zone.color;
  const show=e=>{if(zoneEditor)return;const tip=$('upZoneTooltip');tip.replaceChildren();tip.style.setProperty('--tip-color',zone.color);tip.appendChild(textElement('small','ÁREA DE HUNT · Z'+zone.z,'zone-eyebrow'));tip.appendChild(textElement('strong',zone.name));tip.appendChild(textElement('span',huntLevelLabel(zone),'zone-level'));if(zone.spawnNote)tip.appendChild(textElement('small',zone.spawnNote));if(zone.mobIds.length)tip.appendChild(textElement('small',(zone.monsterNames||zone.mobIds.map(mobName)).join(' · ')));tip.appendChild(textElement('small',manual?'Contorno ajustado manualmente':zone.source==='single-family-island'?'Ilha inteira · monstros indicados nos marcadores':zone.source.includes('cave')?'Pisos e caminhos da cave · spawn aproximado':'Silhueta do terreno · limite de spawn aproximado'));if(zone.markerIds.includes(558))tip.appendChild(textElement('small','Ilha inteira: centro verde e borda de areia'));tip.appendChild(textElement('small','Clique para abrir monstros e drops','zone-click-hint'));tip.hidden=false;moveZoneTip(e)};
  path.addEventListener('pointerenter',show);path.addEventListener('pointermove',moveZoneTip);path.addEventListener('pointerleave',hideZoneTip);path.addEventListener('focus',()=>show({clientX:V.getBoundingClientRect().left+V.clientWidth/2,clientY:V.getBoundingClientRect().top+V.clientHeight/2}));path.addEventListener('blur',hideZoneTip);path.addEventListener('click',e=>{if(zoneEditor||drag)return;e.stopPropagation();hideZoneTip();const marker=MARKERS.find(m=>m.id===(zone.primaryMarkerId||zone.markerIds[0]));if(marker)choose(marker,false)});root.appendChild(path);
 }
}
function focusRespawn(marker){return flyToMarker(marker.id,{panThenZoom:true,preserveFilters:true})}
function respawnMarkers(){return MARKERS.filter(m=>m.main==='hunt')}
function renderRespawns(){
 const box=$('respawnResults'),mob=$('respawnMob').value,q=normalize($('respawnSearch').value.trim());box.replaceChildren();
 const all=respawnMarkers().filter(m=>{const linked=GUIDE.byMarker[String(m.id)]||{},ids=TERRAIN_BY_MARKER.get(m.id)?.consolidated?TERRAIN_BY_MARKER.get(m.id).mobIds:(linked.monsterIds?.length?linked.monsterIds:(TERRAIN_BY_MARKER.get(m.id)?.mobIds||[]));return (!mob||(mob.startsWith('unknown:')?HUNT_COVERAGE.get(m.id)?.familyKey===mob:ids.includes(mob)))&&(!q||(SEARCH_HAY.get(m.id)||'').includes(q))});
 const listedAreas=new Set(),list=all.filter(m=>{const a=TERRAIN_BY_MARKER.get(m.id);if(!a?.consolidated)return true;if(listedAreas.has(a.id))return false;listedAreas.add(a.id);return true});const areas=new Set(all.map(m=>TERRAIN_BY_MARKER.get(m.id)?.id||([430,147,638].includes(m.id)?'forest-'+m.id:null)).filter(Boolean));const refs=list.filter(m=>HUNT_COVERAGE.get(m.id)?.status==='access').length,missing=list.filter(m=>HUNT_COVERAGE.get(m.id)?.status==='unexplored').length;$('respawnCount').textContent=all.length+' referências · '+areas.size+' áreas'+(refs?' · '+refs+' acessos sem área':'')+(missing?' · '+missing+' sem terreno':'');
 for(const marker of list.slice(0,respawnLimit)){
  const button=document.createElement('button');button.type='button';button.className='respawn-destination';button.dataset.markerId=marker.id;
  const text=document.createElement('span');const area=TERRAIN_BY_MARKER.get(marker.id);text.appendChild(textElement('strong',area?.consolidated?area.name:marker.name));text.appendChild(textElement('small','Z'+marker.position.z+(area?.consolidated?' · '+huntLevelLabel(area):(marker.level!==null?' · Level '+marker.level+'+':''))));button.appendChild(text);const c=HUNT_COVERAGE.get(marker.id);const status=textElement('span',c?.status==='access'?'Referência':c?.status==='unexplored'?'Sem terreno':TERRAIN_BY_MARKER.has(marker.id)||[430,147,638].includes(marker.id)?'Área':'Ponto','respawn-status');if(c?.status==='access'||c?.status==='unexplored'){status.classList.add('pending');status.title=c.reason||''}button.appendChild(status);button.addEventListener('click',()=>focusRespawn(marker));box.appendChild(button);
 }
 if(list.length>respawnLimit){const more=document.createElement('button');more.type='button';more.className='load-more';more.textContent='Mostrar mais '+Math.min(30,list.length-respawnLimit);more.addEventListener('click',()=>{respawnLimit+=30;renderRespawns()});box.appendChild(more)}
 if(!list.length)box.appendChild(textElement('p','Nenhum respawn encontrado.','up-empty'));
}
function initRespawns(){
 const ids=new Set(respawnMarkers().flatMap(m=>{const ids=(GUIDE.byMarker[String(m.id)]||{}).monsterIds||[];return TERRAIN_BY_MARKER.get(m.id)?.consolidated?TERRAIN_BY_MARKER.get(m.id).mobIds:ids.length?ids:TERRAIN_BY_MARKER.get(m.id)?.mobIds||[]}));
 const mobs=[...ids].map(id=>MOB_BY_ID.get(id)).filter(Boolean).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
 for(const mob of mobs)$('respawnMob').add(new Option(mob.nome,mob.id));for(const id of ids)if(!MOB_BY_ID.has(id))$('respawnMob').add(new Option(mobName(id),id));const unknown=new Map();for(const c of HUNT_COVERAGE.values())if(c.familyKey?.startsWith('unknown:'))unknown.set(c.familyKey,c.familyName);for(const [key,name] of [...unknown].sort((a,b)=>a[1].localeCompare(b[1],'pt-BR')))$('respawnMob').add(new Option(name,key));$('coverageRelated').addEventListener('click',showRelatedHunts);
 for(const [id,event] of [['respawnMob','change'],['respawnSearch','input']])$(id).addEventListener(event,()=>{respawnLimit=30;renderRespawns()});renderRespawns();
}
function updateCoverageNote(marker){
 const c=HUNT_COVERAGE.get(marker.id),box=$('coverageNote');box.hidden=true;$('coverageRelated').hidden=true;
 if(!c)return;
 if(c.status==='access'){box.hidden=false;$('coverageMessage').textContent='O ponto original foi preservado. O piso junto dele não define um contorno próprio; pode indicar o acesso a uma cave em outro andar.';$('coverageRelated').hidden=!c.familyKey;}
 else if(c.status==='unexplored'){box.hidden=false;$('coverageMessage').textContent='A imagem do minimapa não tem terreno explorado nesta coordenada. O marcador original continua disponível.';}
 else if(c.anchorOutside){box.hidden=false;$('coverageMessage').textContent='O marcador original fica junto da água ou da borda. A área destacada foi associada pelo nome e pela proximidade; o limite de spawn é aproximado.';}
}
function showRelatedHunts(){
 if(!selected)return;const c=HUNT_COVERAGE.get(selected.id);if(!c)return;
 const value=c.familyKey?.startsWith('unknown:')?c.familyKey:c.mobIds?.[0];if(!value)return;
 $('respawnMob').value=value;$('respawnSearch').value='';respawnLimit=30;renderRespawns();document.querySelector('.respawn-panel').open=true;closeDetailPanel();if(window.innerWidth<=680)openFilters();$('respawnMob').focus();$('respawnMob').scrollIntoView?.({block:'nearest'});
}


function mobName(id){const area=TERRAIN_HUNTS.find(a=>a.mobIds.includes(id));return MOB_BY_ID.get(id)?.nome||area?.monsterNames?.[area.mobIds.indexOf(id)]||(id==='kuroari'?'Kuroari':id)}
function appendUncataloguedAreaMobs(marker){const area=TERRAIN_BY_MARKER.get(marker.id);if(!area?.consolidated)return;const known=new Set(linkedMobs(marker).map(m=>normalize(m.nome))),names=new Set([...(area.monsterNames||[]),...area.mobIds.map(mobName)]);for(const name of names){if(known.has(normalize(name)))continue;const card=document.createElement('div');card.className='uncatalogued-mob';card.appendChild(textElement('strong',name));card.appendChild(textElement('small','Level e drops ainda não cadastrados.'));$('monsterPanel').appendChild(card)}}

let flightFrame=0,flightCancel=null;
function stopAtlasFlight(){if(flightFrame)cancelAnimationFrame(flightFrame);flightFrame=0;if(flightCancel){flightCancel(false);flightCancel=null}if($('atlasFlightStatus'))$('atlasFlightStatus').hidden=true;MW.classList.remove('is-traveling')}
function flyToMarker(id,{frameArea=true,panThenZoom=false,preserveFilters=false}={}){
 const marker=MARKERS.find(m=>m.id===Number(id));if(!marker)return Promise.resolve(false);stopAtlasFlight();window.AtlasTools?.close(false);if(!preserveFilters)$('resetFilters').click();closeFilters();selected=marker;openDetails();renderResults();const mobile=window.innerWidth<=980;if(mobile)closeDetailPanel();
 const area=frameArea?TERRAIN_BY_MARKER.get(marker.id):null,target=area?{x:(area.bounds[0]+area.bounds[2])/2,y:(area.bounds[1]+area.bounds[3])/2}:marker.position;
 const start={x:(V.clientWidth/2-tx)/scale+B.minX,y:(V.clientHeight/2-ty)/scale+B.minY,scale},desired=area?Math.min(4,Math.max(.5,Math.min((V.clientWidth-100)/(area.bounds[2]-area.bounds[0]+20),(V.clientHeight-145)/(area.bounds[3]-area.bounds[1]+20)))):3;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduced){if(floor!==marker.position.z)switchFloor(marker.position.z,false);center(target.x,target.y,desired);if(mobile){openDetails();openDetailPanel()}return Promise.resolve(true)}
 const distance=Math.hypot(target.x-start.x,target.y-start.y),middle=Math.max(MIN_ZOOM,Math.min(start.scale,desired,V.clientWidth/(distance*1.2+V.clientWidth))),duration=clamp(1000+Math.sqrt(distance)*18,1100,2300);let begun=null,changedFloor=false;
 $('atlasFlightLabel').textContent='Indo para '+(area?.name||marker.name)+' · Z'+marker.position.z;$('atlasFlightStatus').hidden=false;MW.classList.add('is-traveling');
 return new Promise(resolve=>{flightCancel=resolve;const ease=t=>t*t*(3-2*t);function frame(now){if(begun===null)begun=now;const p=clamp((now-begun)/duration,0,1),t=ease(panThenZoom?Math.min(p/.7,1):p);const cx=start.x+(target.x-start.x)*t,cy=start.y+(target.y-start.y)*t;scale=panThenZoom?Math.exp(Math.log(start.scale)+(Math.log(desired)-Math.log(start.scale))*ease(clamp((p-.7)/.3,0,1))):p<.5?Math.exp(Math.log(start.scale)+(Math.log(middle)-Math.log(start.scale))*ease(p*2)):Math.exp(Math.log(middle)+(Math.log(desired)-Math.log(middle))*ease((p-.5)*2));
  if(p>=(panThenZoom ? .7 : .5)&&!changedFloor){changedFloor=true;if(floor!==marker.position.z)switchFloor(marker.position.z,false)}
  tx=V.clientWidth/2-(cx-B.minX)*scale;ty=V.clientHeight/2-(cy-B.minY)*scale;place();
  if(p<1)flightFrame=requestAnimationFrame(frame);else{flightFrame=0;flightCancel=null;$('atlasFlightStatus').hidden=true;MW.classList.remove('is-traveling');schedulePins();if(mobile){openDetails();openDetailPanel()}resolve(true)}}flightFrame=requestAnimationFrame(frame)});
}
function initAtlasTools(){
 if(!window.createAtlasTools)return;
 window.AtlasTools=window.createAtlasTools({fullGuide:JSON.parse($('assistantGuidePayload').textContent),knowledge:JSON.parse($('assistantKnowledgePayload').textContent),xpData:JSON.parse($('xpPayload').textContent),markers:MARKERS,areas:TERRAIN_HUNTS,catalog:CATALOG,guide:GUIDE,upGuide:UPGUIDE,getSet:()=>upSet,coverage:id=>HUNT_COVERAGE.get(id),selected:()=>selected,flyToMarker});
 window.AtlasNavigate.flyToMarker=flyToMarker;window.AtlasNavigate.stop=stopAtlasFlight;
 V.addEventListener('pointerdown',stopAtlasFlight,{capture:true});V.addEventListener('wheel',stopAtlasFlight,{capture:true});$('stopAtlasFlight').addEventListener('click',stopAtlasFlight);
 for(const id of ['floorTrack','floorUp','floorDown','zoomIn','zoomOut','fitMap','forestView','worldView'])$(id).addEventListener('click',stopAtlasFlight,{capture:true});
 document.addEventListener('keydown',e=>{if(['Escape','PageUp','PageDown','Home','+','-','='].includes(e.key)&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))stopAtlasFlight()});
}

init();
initNewUI();
initAtlasTools();
})();

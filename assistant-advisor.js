(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.createAtlasAdvisor=factory;})(typeof window!=='undefined'?window:globalThis,function(ctx){
 'use strict';
 const kb=ctx.knowledge,items=new Map(ctx.items.map(i=>[i.id,i])),quests=new Map(ctx.quests.map(q=>[q.id,q])),markers=new Map(ctx.markers.map(m=>[m.id,m]));
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();let state=null;
 function distance(a,b){let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+Number(a[i-1]!==b[j-1]));prev=row}return prev[b.length];}
 function hasWord(words,aliases){return aliases.some(a=>words.includes(a)||(a.length>=5&&words.some(w=>w.length>=5&&Math.abs(a.length-w.length)<=1&&(distance(a,w)<=1||(a.length===w.length&&[...a].map((c,i)=>c===w[i]?-1:i).filter(i=>i>=0).length===2&&[...a].some((c,i)=>i<a.length-1&&a.slice(0,i)+a[i+1]+a[i]+a.slice(i+2)===w))))));}
 function target(id,label){const marker=markers.get(id);return marker?{marker,label:label||marker.name,floor:marker.position.z}:null;}
 function targets(ids,label){return ids.map(id=>target(id,label)).filter(Boolean);}
 function dedupe(list,limit=8){const seen=new Set();return list.filter(t=>{if(!t)return false;const key=t.area?.id||'m'+t.marker.id;if(seen.has(key))return false;seen.add(key);return true}).slice(0,limit);}
 const itemList=ids=>ids.map(id=>items.get(id)).filter(Boolean),names=ids=>itemList(ids).map(i=>i.nome).join(', ');
 function stats(i){return (i.atributos||[]).filter(a=>/attack|defesa|range|level/i.test(a)).join(' · ');}
 function finish(result,topic){let suggested=[];if(topic.kind==='weapon')suggested=topic.scope==='vip'?kb.vipWeapons[topic.category]||[]:kb.weapons[topic.category]?.itemIds||[];if(topic.kind==='set')suggested=topic.set==='free'?[...kb.sets.akatsuki.itemIds,...kb.sets.otsutsuki.itemIds]:topic.set==='vip'?kb.vipSet?.itemIds||[]:kb.sets[topic.set]?.itemIds||[];const text=' '+norm(result.text)+' ';const matched=ctx.items.filter(i=>norm(i.nome).length>=4&&text.includes(' '+norm(i.nome)+' '));const mentioned=matched.filter(i=>!matched.some(other=>other.id!==i.id&&norm(other.nome).length>norm(i.nome).length&&norm(other.nome).includes(norm(i.nome)))).map(i=>i.id);result={...result,itemIds:[...new Set([...(result.itemIds||[]),...suggested,...mentioned])].filter(id=>items.has(id))};state={...topic,last:result};return {source:'Fonte: Guia NTO · armas, sets, tasks e marcadores do Atlas.',...result};}
 function weaponChoices(scope='free'){return finish({text:'Qual tipo de arma você quer melhorar? Espada/sword, distance/shuriken e luva/glove usam recomendações e caminhos diferentes.',targets:[],suggestions:[{label:'Espada / sword',query:'Qual é a melhor espada '+scope+'?'},{label:'Distance / shuriken',query:'Qual é a melhor shuriken '+scope+'?'},{label:'Luva / glove',query:'Qual é a melhor luva '+scope+'?'}]},{kind:'weapon-choice',scope});}
 function weaponAnswer(category,scope='free',question=''){
  const spec=kb.weapons[category];if(!spec)return weaponChoices(scope);
  if(scope==='vip'){const list=itemList(kb.vipWeapons[category]||[]);return finish({text:'Para '+spec.label+' VIP, o comparativo do Guia usa '+list.map(i=>i.nome+' ('+stats(i)+')'+(i.passiva?'. '+i.passiva:'')).join('; ')+'. Origem informada: '+[...new Set(list.map(i=>i.origem).filter(Boolean))].join(' ')+'\n\nSe você quer conseguir pelo jogo sem comprar no shop, posso mostrar as opções free e suas quests.',targets:[],suggestions:[{label:'Mostrar opção free',query:'Qual é a melhor '+spec.label.split(' / ')[0]+' free?'}]},{kind:'weapon',category,scope});}
  const list=itemList(spec.itemIds),quest=quests.get(spec.questId),route=spec.markerIds.map(id=>target(id,spec.routeLabel||quest?.titulo)).filter(Boolean);let text='';
  if(category==='sword'){
   const n=norm(question);let chosen=null,reason='';
   if(/\b(cura|curar|vida|hp|sustain)\b/.test(n)){chosen=items.get('zabuzasword-7391');reason='Para recuperar HP com os ataques';}
   else if(/\b(chakra|mana)\b/.test(n)){chosen=items.get('samehada-7425');reason='Para recuperar chakra com os ataques';}
   else if(/\b(critico|criticos|burst|dano)\b/.test(n)){chosen=items.get('shibuki-10484');reason='Para buscar críticos altos';}
   else if(/\b(trap|prender|controle|imobilizar)\b/.test(n)){chosen=items.get('algumaarmabolada3-7421');reason='Para prender o alvo';}
   else if(/\b(slow|lentidao|lyze)\b/.test(n)){chosen=items.get('algumaarmabolada-7406');reason='Para aplicar lentidão';}
   text='O caminho das melhores espadas free indicado no Guia é a Quest New Sword, em Ilhota. As opções são: '+names(spec.itemIds)+'.';
   if(chosen)text+='\n\n'+reason+', veja '+chosen.nome+': '+chosen.passiva+' '+stats(chosen)+'.';
   else text+='\n\nEscolha pela passiva: Kubikiribouchou recupera HP; Samehada recupera chakra; Shibuki pode causar críticos altos; Nuibari prende o alvo. Posso recomendar uma delas pelo que você precisa.';
   if(quest)text+='\n\nRequisito no Guia: '+quest.requisitos+'. '+(quest.obs||[]).join(' ');
  }else if(category==='distance'){
   const i=list[0];text='Distance e shuriken são a mesma categoria aqui. A referência free do Guia é '+i.nome+' ('+stats(i)+'). '+(i.passiva||'')+'\n\nVocê consegue a Fuuma Katon Shuriken na Quest New Shuriken/Glove, no Covil Orochimaru, conforme a confirmação da comunidade. Use o início em Z7 e os pontos dos andares seguintes.';
  }else{
   const i=list[0],alternative=itemList(spec.alternateItemIds||[])[0];text='Luva e glove são a mesma categoria. A referência free do Guia é '+i.nome+' ('+stats(i)+'). Origem cadastrada: '+i.origem+'\n\nPara chegar à região, use a marcação “Inicio Quest New Shuriken/Glove”, no Covil Orochimaru, e os pontos dos andares seguintes.';
   if(alternative)text+=' '+alternative.nome+' também aparece no comparativo free, com '+stats(alternative)+'.';
  }
  const suggestions=category==='sword'?[{label:'Quero recuperar HP',query:'Qual dessas espadas ajuda a curar HP?'},{label:'Quero recuperar chakra',query:'Qual dessas espadas recupera chakra?'},{label:'E a melhor shuriken?',query:'E a melhor shuriken?'}]:[{label:'Onde fica essa quest?',query:'Onde fica essa quest?'},{label:'E a melhor espada?',query:'E a melhor espada?'}];
  return finish({text,targets:route,suggestions},{kind:'weapon',category,scope});
 }
 function akatsukiText(){return 'Akatsuki: é a referência de set free por quests no Guia. Passiva: '+kb.sets.akatsuki.passive+'\n'+ctx.bosses.map(b=>b.drops.map(d=>d.name+' → '+b.name+' ('+(quests.get(b.questId)?.titulo||'quest')+')').join('; ')).join('; ')+'.';}
 function akatsukiTargets(){return ctx.bosses.flatMap(b=>ctx.bossTargets(b).slice(0,1));}
 function otsutsukiText(){const set=kb.sets.otsutsuki;return 'Otsutsuki (Hagoromo): obtido com o '+set.npcName+', no '+set.location+', trocando '+set.currency+' das tasks. Peças cadastradas: '+names(set.itemIds)+'. Passiva: '+set.passive+'\nFaça tasks e troque os pontos pelas peças. O Guia informa '+set.tasksPerDay+' tasks por dia, ou '+set.tasksWithPass+' com Passe de Batalha.';}
 function npcAnswer(question=''){
  const set=kb.sets.otsutsuki,n=norm(question);let text=otsutsukiText();
  if(/\b(quanto|quantos|preco|custa|custam|custo)\b/.test(n))text+='\n\nO preço em pontos de cada peça não está cadastrado no Guia. Consulte a troca no Hagoromo.';
  return finish({text,targets:targets([set.npcMarkerId],set.npcName+' · tasks e set Otsutsuki'),suggestions:[{label:'Quais tasks posso fazer?',query:'Quais tasks dão pontos para o set Otsutsuki?'},{label:'E o set Akatsuki?',query:'Como consigo o set Akatsuki?'}]},{kind:'set',set:'otsutsuki'});
 }
 function freeSetAnswer(question=''){
  const beginner=/iniciante|comec|comecando|novo|primeiro|level [1-9]\b|nivel [1-9]\b/.test(norm(question)),a=akatsukiText(),o=otsutsukiText(),npc=target(kb.sets.otsutsuki.npcMarkerId,kb.sets.otsutsuki.npcName+' · set Otsutsuki');
  const text=(beginner?'Para começar free, o Guia indica o set Otsutsuki por tasks no NPC Hagoromo. Akatsuki é o caminho de evolução por quests.':'Para montar o melhor conjunto free indicado no Guia, o caminho é Akatsuki pelas quests. Para começar, há o Otsutsuki por tasks no NPC.')+'\n\n'+(beginner?o+'\n\n'+a:a+'\n\n'+o);
  return finish({text,targets:dedupe(beginner?[npc,...akatsukiTargets()]:[...akatsukiTargets(),npc]),suggestions:[{label:'Ir pelo set de iniciante',query:'Como pego o set Otsutsuki?'},{label:'Como farmar pontos?',query:'Quais tasks dão pontos de evento?'},{label:'Qual arma combina?',query:'Quais são as melhores armas free?'}]},{kind:'set',set:'free'});
 }
 function tasksAnswer(question=''){
  const n=norm(question),set=kb.sets.otsutsuki;let selected=kb.tasks;
  if(!/\b(todas|lista|quais)\b/.test(n)){const match=kb.tasks.filter(t=>n.includes(norm(t.name)));selected=match.length?match:kb.tasks.filter(t=>['bandit','nukenin','renegade','eirian'].includes(t.mobId));}
  let text='As tasks do '+set.npcName+' dão pontos de evento para trocar pelo set Otsutsuki. Limite no Guia: '+set.tasksPerDay+' por dia, ou '+set.tasksWithPass+' com Passe de Batalha.\n\n'+selected.map(t=>t.name+': '+t.kills+' abates → '+t.points+' pontos'+(t.note?'. '+t.note:'')).join('\n');
  if(/melhor|rapido|rende|pontos/.test(n))text+='\n\nEirian é a task com maior pontuação por entrega na tabela (100), mas o Guia destaca que é forte e recomenda grupo. O tempo para completar depende da sua hunt e do seu set.';
  const npc=target(set.npcMarkerId,set.npcName+' · entregar tasks e trocar pontos');return finish({text,targets:dedupe([npc,...selected.slice(0,3).flatMap(t=>ctx.destinations(t.mobId).slice(0,1))])},{kind:'tasks',set:'otsutsuki'});
 }
 function anbuAnswer(){const set=kb.sets.anbu;return finish({text:'O set ANBU é recebido automaticamente ao chegar ao level '+set.unlockLevel+', conforme o Guia. Peças: '+names(set.itemIds)+'. Passiva: '+set.passive+' Para a progressão free por quests ou NPC, também posso mostrar Akatsuki e Otsutsuki.',targets:[],suggestions:[{label:'Comparar sets free',query:'Qual é o melhor set free?'}]},{kind:'set',set:'anbu'});}
 function respond(question){const n=norm(question),words=n.split(' '),previous=state,free=/\b(free|gratis|gratuito|gratuita|gratuitos|gratuitas)\b|sem (pagar|gastar|comprar|vip|donate|cash)|nao (quero|posso) (pagar|gastar)|nao tenho vip/.test(n),vip=!free&&/\b(vip|shop|donate|pago|paga)\b/.test(n),scope=free?'free':vip?'vip':previous?.scope||'free';
  const best=/\b(melhor|melhores|top|bis|forte|fortes|endgame|recomenda|recomendam|recomendacao|indica|indicacao|boa|boas|bom|bons)\b/.test(n),setWord=/\b(set|sets|conjunto|equipamento|equipamentos)\b/.test(n),otsu=hasWord(words,kb.sets.otsutsuki.aliases),akatsuki=hasWord(words,['akatsuki']),categories=Object.entries(kb.weapons).filter(([id,s])=>hasWord(words,s.aliases)&&!s.aliases.some(a=>new RegExp('\\b'+a+' nao\\b|\\bsem '+a+'\\b|\\bnao (?:quero |uso )?'+a+'\\b').test(n))).map(([id])=>id);
  if(/\b(quest|quests)\b/.test(n)&&/new (shuriken|glove)|shuriken glove/.test(n)&&!best&&!/kage/.test(n))return finish({text:'O Atlas marca o início da Quest New Shuriken/Glove no Covil Orochimaru, em Z7, com outros pontos em Z6 e Z5. Os botões abaixo levam às marcações reais do mapa.',targets:targets(kb.weapons.distance.markerIds,'Quest New Shuriken/Glove · acesso')},{kind:'route'});
  if(categories.length&&(best||previous?.kind==='weapon'||previous?.kind==='weapon-choice'||words.length<=5||/\b(onde|pego|consigo|conseguir|pegar|obter)\b/.test(n))){
   const named=ctx.items.find(i=>norm(i.nome).length>5&&n.includes(norm(i.nome)));if(!best&&named&&!/^(e |pra |para )/.test(n))return null;
   if(categories.length===1)return weaponAnswer(categories[0],scope,question);
   const results=categories.map(c=>weaponAnswer(c,scope,question));return finish({text:results.map(r=>r.text).join('\n\n'),targets:dedupe(results.flatMap(r=>r.targets))},{kind:'weapon-choice',scope});
  }
  if(/\b(arma|armas|weapon|weapons)\b/.test(n)&&(best||/\b(onde|pego|consigo)\b/.test(n)))return weaponChoices(scope);
  const taskWords=/\b(task|tasks|tarefa|tarefas)\b/.test(n),taskQuestion=/\b(quais|qual) (?:a |as |o |os |e a |e as )?(?:melhor |melhores )?(?:task|tasks|tarefa|tarefas)\b/.test(n);
  if(setWord&&taskWords&&!taskQuestion)return npcAnswer(question);
  if((taskWords&&(!setWord||taskQuestion)||/pontuacao|pontos de evento/.test(n)&&!setWord)&&!/\b(preco|custa|custam)\b/.test(n))return tasksAnswer(question);
  if((akatsuki&&otsu&&(best||/\bou\b|diferenca|compara/.test(n)))||(previous?.kind==='set'&&!setWord&&/qual.*(melhor|xp)|diferenca|comparar|mais (xp|experiencia)/.test(n)))return finish({text:'O Guia indica Akatsuki como referência free por quests: '+kb.sets.akatsuki.passive+' Otsutsuki é a alternativa obtida no Hagoromo por pontos de tasks: '+kb.sets.otsutsuki.passive+' Para começar, siga o NPC; para evoluir para Akatsuki, faça as quests das peças.',targets:dedupe([...akatsukiTargets(),target(kb.sets.otsutsuki.npcMarkerId,'Hagoromo · set Otsutsuki')])},{kind:'set',set:'free'});
  if(akatsuki&&!otsu&&/\b(npc|vende|vender|trocar|troca)\b/.test(n))return finish({text:akatsukiText()+'\n\nO caminho por NPC informado no Guia é para Otsutsuki, com Hagoromo e pontos de tasks.',targets:akatsukiTargets(),suggestions:[{label:'Quero o set por NPC',query:'Como consigo o set Otsutsuki?'}]},{kind:'set',set:'akatsuki'});
  if(previous?.kind==='set'&&['otsutsuki','free'].includes(previous.set)&&/quanto.*ponto|\b(custa|custam|preco)\b/.test(n))return npcAnswer(question);
  const namedNpc=ctx.markers.some(m=>m.main==='npc'&&norm(m.name).split(' ').some(t=>t.length>4&&!['tasks','items','skins','auras','compra','venda','itens','necessario'].includes(t)&&words.includes(t)));if(otsu||(!namedNpc&&/\b(npc|trocar|troca)\b/.test(n)&&previous?.kind==='set'))return npcAnswer(question);
  if(/\banbu\b/.test(n)&&(setWord||/pego|ganho|receb|consigo/.test(n)))return anbuAnswer();
  if(setWord&&(best||free||/iniciante|comec|farmar/.test(n))&&!vip)return freeSetAnswer(question);
  if(setWord&&akatsuki)return finish({text:akatsukiText(),targets:akatsukiTargets(),suggestions:[{label:'E o set por NPC?',query:'Como consigo o set Otsutsuki?'}]},{kind:'set',set:'akatsuki'});
  if(vip&&setWord){const v=kb.vipSet;return finish({text:'No comparativo VIP do Guia, o conjunto de referência é '+v.label+'. Itens: '+names(v.itemIds)+'.\n\nSenju é indicado para up e hunts: '+v.profiles.senju.efeito+' Para arma, o comparativo usa Gunbai (sword), Raijin Slayer (glove) ou Kurumaken Shuriken (distance), conforme sua categoria.\n\nPara PvP a escolha depende do objetivo: Shippuden é universal, Uchiha é ofensivo e Kurama tem anti-heal. '+v.profiles.kurama.efeito+' A origem de cada equipamento aparece nos seus atributos.',targets:[],itemIds:v.itemIds,suggestions:[{label:'Comparar com set free',query:'Qual é o melhor set free?'},{label:'Melhor sword VIP',query:'Qual é a melhor sword VIP?'}]},{kind:'set',set:'vip',scope:'vip'});}
  if(previous?.kind==='weapon'&&/\b(cura|curar|hp|vida|chakra|critico|trap|slow|passiva|passivas)\b/.test(n))return weaponAnswer(previous.category,previous.scope,question);
  if(previous?.kind==='weapon'&&/^(e )?(a |o |as |os )?(vip|free|gratis|gratuita|paga|pago)\b/.test(n))return weaponAnswer(previous.category,scope,question);
  if(previous?.last&&/onde (fica|e|consigo|pego)|como (chego|chegar|vou)|me leva|ir ate|mostra.*local|localizacao|coordenadas/.test(n)&&(/\b(essa|esse|isso|esta|este|la|mesmo|dessa|desse)\b/.test(n)||/^(e )?(onde fica|como chego|ir ate|mostra o local)( a| o)? (quest|local|npc)$/.test(n)))return finish({text:previous.last.targets.length?'Estes são os locais da resposta anterior. Toque em “Ir até” para viajar pelo mapa.':'A resposta anterior não tem uma localização mapeada. Diga o item, a quest ou a categoria para eu consultar o Guia.',targets:previous.last.targets,suggestions:previous.last.suggestions||[]},{...previous});
  if(previous?.last&&/^(e )?(onde|la|como chego|me leva)$/.test(n))return finish({text:'Use os destinos abaixo para continuar pelo mapa.',targets:previous.last.targets},{...previous});
  return null;
 }
 function observe(question,result){if(!result||/Não encontrei/.test(result.text)){state=null;return}const n=norm(question),category=/quest new sword/.test(n)?'sword':null;state={kind:category?'weapon':'lookup',category,scope:'free',last:result};}
 return Object.freeze({respond,observe,reset(){state=null}});
});

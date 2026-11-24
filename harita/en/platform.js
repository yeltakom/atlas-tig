/* Dicle Vadisi Atlası 0.2: dosyalar, olaylar ve zaman çizgisi, anıtlar, görsel arşiv.
   app.js'ten sonra yüklenir; A, B, setImagery, turnOn, bars, $, esc, imById, fitAll oradan gelir. */
window.__atlas.platformReady=(async function(){
const T=window.__atlas;const {A,B,setImagery,turnOn,bars,$,esc,imById,fitAll,GROUPS,RED,FONT,PINK,CYAN}=T;const ORANGE='#8a8a8a';
const ik=(id,source,filter,img,size,gizli)=>({id,type:'symbol',source,filter:filter||['all'],layout:Object.assign({'icon-image':img,'icon-size':size||1,'icon-allow-overlap':true,'icon-ignore-placement':true},gizli?{visibility:'none'}:{})});
const J=u=>fetch(u).then(r=>r.json());
const [OL,AN,KO,KAM]=await Promise.all([J('data/olaylar.json'),J('data/anitlar.geojson'),J('data/korpus.json'),J('../data/kamulastirma_2016.geojson')]);
const mob=()=>window.innerWidth<=860;
const toMap=()=>{if(mob())window.scrollTo({top:0,behavior:'smooth'});};
const AY=['','January','February','March','April','May','June','July','August','September','October','November','December'];
const dec=t=>{const p=String(t).split('-').map(Number);return p[0]+((p[1]||1)-1)/12+((p[2]||1)-1)/365;};
const trh=t=>{const p=String(t).split('-');return (p[2]?Number(p[2])+' ':'')+(p[1]?AY[Number(p[1])]+' ':'')+p[0];};
const SER={baraj:'Dam',kasaba:'Town',devlet:'State',karsi:'Counter'};
const SERU={baraj:'Dam: decision, finance, construction',kasaba:'Town: protection, evacuation, relocation, water',devlet:'The state\'s showing and counting face',karsi:'Counter-record: campaign, report, art'};
const imFor=y=>{const id=y<1988?'l1985':y<1996?'l1990':y<2012?'l2000':y<2017?'w10':y>2024?'s2024':'s'+y;return imById[id]?id:'s2018';};
const km=(a,b)=>{const R=6371,r=Math.PI/180,dy=(b[1]-a[1])*r,dx=(b[0]-a[0])*r,h=Math.sin(dy/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dx/2)**2;return 2*R*Math.asin(Math.sqrt(h));};

/* ---------- kayıt kartı ---------- */
const kart=$('kart');
function showCard(html,ns){kart.innerHTML='<div class="kh">'+html.head+'<button type="button" id="k-kapat" aria-label="Close card">Close</button></div>'+html.body;kart.hidden=false;$('k-kapat').onclick=()=>{kart.hidden=true;setSel(null);};if(!mob())$('side').scrollTo({top:0,behavior:'smooth'});else if(!ns)kart.scrollIntoView({behavior:'smooth',block:'start'});}
const dl=rows=>'<dl>'+rows.filter(r=>r[1]).map(r=>'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>').join('')+'</dl>';

/* ---------- harita katmanları ---------- */
const OLG={type:'FeatureCollection',features:OL.filter(o=>o.yer).map(o=>({type:'Feature',properties:{id:o.id,ad:o.ad,serit:o.serit},geometry:{type:'Point',coordinates:o.yer}}))};
const EMPTY={type:'FeatureCollection',features:[]};
const NL=[
 {id:'anit-hat',type:'line',source:'anit',filter:['==',['get','tur'],'hat'],paint:{'line-color':PINK,'line-width':1.6,'line-dasharray':[1.5,1.5]}},
 {id:'anit-yerinde',type:'circle',source:'anit',filter:['==',['get','tur'],'yerinde'],minzoom:11,paint:{'circle-radius':3.5,'circle-color':['case',['get','gol'],RED,'#111'],'circle-stroke-color':'#fff','circle-stroke-width':1}},
 ik('anit-eski','anit',['==',['get','tur'],'eski'],'carpi',1.05),
 ik('anit-yeni','anit',['==',['get','tur'],'yeni'],'kare',.95),
 {id:'anit-lab',type:'symbol',source:'anit',filter:['in',['get','tur'],['literal',['eski','yeni']]],minzoom:13.2,layout:{'text-field':['get','ad'],'text-font':FONT,'text-size':11,'text-offset':[0.8,0],'text-anchor':'left','text-optional':true},paint:{'text-color':'#fff','text-halo-color':'#000','text-halo-width':1.5}},
 ik('kam','kam',null,'elmas',1,true),
 {id:'kam-lab',type:'symbol',source:'kam',minzoom:10.5,layout:{visibility:'none','text-field':['get','ad'],'text-font':FONT,'text-size':11,'text-offset':[0.9,0],'text-anchor':'left','text-optional':true},paint:{'text-color':'#fff','text-halo-color':'#000','text-halo-width':1.5}},
 {id:'olay',type:'circle',source:'olay',layout:{visibility:'none'},paint:{'circle-radius':4,'circle-color':['match',['get','serit'],'kasaba',PINK,'devlet',ORANGE,'karsi',CYAN,'#fff'],'circle-stroke-color':'#000','circle-stroke-width':1}},
 {id:'sec',type:'circle',source:'sec',paint:{'circle-radius':15,'circle-color':'rgba(0,0,0,0)','circle-stroke-color':'#fff','circle-stroke-width':2.5}},
 {id:'sec2',type:'circle',source:'sec',paint:{'circle-radius':19,'circle-color':'rgba(0,0,0,0)','circle-stroke-color':PINK,'circle-stroke-width':1.5}}
];
const NG=[
 {id:'g-anit',ad:'Monuments: old site, new site, relocation route',alt:'Cross is the old site, square the new site, dashed line the relocation route',renk:RED,layers:['anit-hat','anit-eski','anit-yeni','anit-lab'],on:true},
 {id:'g-anity',ad:'Excavation sites and structures remaining in place',alt:'White dot within the lake boundary, black dot outside',renk:'#000',layers:['anit-yerinde'],on:true},
 {id:'g-kam',ad:'Villages in the 2016 urgent expropriation decision',alt:'Of the 48 villages named in press reports, '+KAM.features.length+' have a known location',renk:'#fff',layers:['kam','kam-lab'],on:false},
 {id:'g-olay',ad:'Event locations',alt:'Events with a known location',renk:'#fff',layers:['olay'],on:false}
];
const mapReady=new Promise(ok=>{const t=()=>(A.getSource('gol')&&B.getSource('gol'))?ok():setTimeout(t,120);t();});
mapReady.then(()=>[A,B].forEach(m=>{m.addSource('anit',{type:'geojson',data:{type:'FeatureCollection',features:AN.features.filter(f=>f.geometry)}});m.addSource('olay',{type:'geojson',data:OLG});m.addSource('kam',{type:'geojson',data:KAM});m.addSource('sec',{type:'geojson',data:EMPTY});
  NL.forEach(l=>m.addLayer(JSON.parse(JSON.stringify(l))));
  ['anit-eski','anit-yeni','anit-yerinde','olay','kam'].forEach(id=>{m.on('click',id,e=>{const p=e.features[0].properties;id==='kam'?kamCard(p,e.features[0].geometry.coordinates):id==='olay'?selEvent(OL.find(o=>o.id===p.id),true):anitCard(p.ad,p.tur);});m.on('mouseenter',id,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',id,()=>m.getCanvas().style.cursor='');});}));
const kl=$('katlist');const addGroup=g=>{GROUPS.push(g);const l=document.createElement('label');l.innerHTML='<input type="checkbox" id="'+g.id+'"'+(g.on?' checked':'')+'><i style="background:'+g.renk+'"></i><span>'+esc(g.ad)+'</span><small>'+esc(g.alt)+'</small>';kl.insertBefore(l,kl.firstChild);
  l.querySelector('input').onchange=e=>{g.on=e.target.checked;[A,B].forEach(m=>g.layers.forEach(id=>m.getLayer(id)&&m.setLayoutProperty(id,'visibility',g.on?'visible':'none')));};};NG.forEach(addGroup);
const setSel=c=>[A,B].forEach(m=>m.getSource('sec')&&m.getSource('sec').setData(c?{type:'Feature',properties:{},geometry:{type:'Point',coordinates:c}}:EMPTY));
const KR={gol_icinde:'within the lake boundary',kiyi_1km:'within 1 km of the shore',kiyi_3km:'1 to 3 km from the shore',uzak:'more than 3 km from the shore'};
function kamCard(p,c){showCard({head:'<div><p class="eyebrow">Urgent expropriation, 2016</p><h3>'+esc(p.ad)+'</h3></div>',body:dl([['Province, district',esc(p.il)+', '+esc(p.ilce)],['Relative to the lake',KR[p.gol_iliskisi]],['Source','Enerji Günlüğü, report on the Official Gazette (Resmî Gazete) of 14 October 2016'],['Location','GeoNames name match']])+'<p class="not">The decision does not cover the village itself but some properties, for the relocation of village roads that will lie under the lake.'+(p.aday>1?' There are '+p.aday+' records under this name, and the one nearest the lake was chosen. The location is uncertain.':'')+'</p>'});setSel(c);}
const setIm=(a,b)=>{if(a&&imById[a]){setImagery('A',a);$('imA').value=a;}if(b&&imById[b]){setImagery('B',b);$('imB').value=b;}};

/* ---------- zaman çizgisi ---------- */
const SEG=[[1950,1996,.10],[1996,2016,.27],[2016,2022,.48],[2022,2027,.15]];
const X=d=>{let x=0;for(const [a,b,w] of SEG){if(d>=b){x+=w;continue;}if(d>a)x+=w*(d-a)/(b-a);break;}return Math.min(1,x)*100;};
const zc=$('zc-in'),LANE=['baraj','kasaba','devlet','karsi'];
$('zc-lab').innerHTML=LANE.map(s=>'<span>'+SER[s]+'</span>').join('');
LANE.forEach((s,i)=>{const d=document.createElement('div');d.className='ln';d.style.top=(5+i*15+5)+'px';zc.appendChild(d);});
[1954,1982,1997,2006,2012,2016,2017,2018,2019,2020,2021,2022,2024,2026].forEach(y=>{const t=document.createElement('div');t.className='yt';t.style.left=X(y)+'%';zc.appendChild(t);const l=document.createElement('span');l.className='yl';l.style.left=X(y)+'%';l.textContent=y;zc.appendChild(l);});
OL.forEach(o=>{o.d=dec(o.t);o.y=Math.floor(o.d);const b=document.createElement('button');b.type='button';b.className=o.serit+(o.t2?' ar':'');b.style.left=X(o.d)+'%';b.style.top=(5+LANE.indexOf(o.serit)*15)+'px';if(o.t2)b.style.width='max(5px,'+(X(dec(o.t2))-X(o.d))+'%)';b.title=trh(o.t)+' · '+o.ad;b.setAttribute('aria-label',b.title);b.onclick=()=>selEvent(o,true);zc.appendChild(b);o.el=b;});
let curEv=null;
function selEvent(o,fly){if(!o)return;curEv=o;OL.forEach(x=>x.el.classList.toggle('sec',x===o));
  const i=OL.indexOf(o),im=imFor(o.y);
  showCard({head:'<div><p class="eyebrow">'+esc(SERU[o.serit])+'</p><h3>'+esc(o.ad)+'</h3></div>',
   body:dl([['Date',esc(trh(o.t))+(o.t2?' to '+esc(trh(o.t2)):'')],['Location',o.yer?o.yer[1].toFixed(4)+', '+o.yer[0].toFixed(4):'No single location on the map'],['Source',esc(o.kaynak)],['Imagery',esc(imById[im].ad)]])+(o.teyit?'<p class="not"><b>Open point.</b> '+esc(o.teyit)+'</p>':'')+
   '<div class="row"><button type="button" id="e-on">Previous</button><button type="button" id="e-son">Next</button>'+(o.yer?'<button type="button" id="e-git">Show on map</button>':'')+'</div>'});
  $('e-on').onclick=()=>selEvent(OL[Math.max(0,i-1)],true);$('e-son').onclick=()=>selEvent(OL[Math.min(OL.length-1,i+1)],true);
  if(o.yer){$('e-git').onclick=()=>{go();toMap();};}
  function go(){A.flyTo({center:o.yer,zoom:o.yer[0]>41.7?12.4:14.3,duration:1300});}
  setIm(o.y>=2019?'s2018':null,im);setSel(o.yer||null);if(fly&&o.yer)go();}

/* ---------- olaylar paneli ---------- */
let serF='';const os=$('o-serit');
[['','All']].concat(Object.entries(SER)).forEach(([k,v])=>{const b=document.createElement('button');b.type='button';b.textContent=v;b.setAttribute('aria-pressed',k===serF);b.onclick=()=>{serF=k;os.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));drawEv();};os.appendChild(b);});
function drawEv(){const ol=$('o-liste');ol.innerHTML='';OL.filter(o=>!serF||o.serit===serF).forEach(o=>{const li=document.createElement('li');li.className='t';li.tabIndex=0;li.innerHTML='<b>'+esc(trh(o.t))+'</b><span><i class="'+o.serit+'"></i>'+esc(o.ad)+'<small>'+esc(o.kaynak)+(o.teyit?' · open point':'')+'</small></span>';li.onclick=()=>{selEvent(o,true);};li.onkeydown=e=>{if(e.key==='Enter')selEvent(o,true);};ol.appendChild(li);});}
drawEv();

/* ---------- anıtlar ---------- */
const AF=AN.features,byAd={};
AF.forEach(f=>{const p=f.properties;(byAd[p.ad]=byAd[p.ad]||{p,ad:p.ad})[p.tur]=f.geometry&&f.geometry.coordinates;});
const ANIT=Object.values(byAd).filter(a=>a.p.akibet!=='yerinde'),YER=Object.values(byAd).filter(a=>a.p.akibet==='yerinde');
ANIT.forEach(a=>{if(a.eski&&a.yeni)a.km=km(a.eski,a.yeni);});
const AK={tasindi:'Moved',kismi:'Partly moved',birakildi:'Left in place, under water',celiski:'Sources conflict',yerinde:'In place'};
function anitCard(ad,tur){const a=byAd[ad];if(!a)return;const p=a.p,c=a[tur]||a.eski||a.yeni||a.yerinde;
  showCard({head:'<div><p class="eyebrow">Monument record</p><h3>'+esc(ad)+'</h3></div>',
   body:dl([['Status',AK[p.akibet]+(p.akibet==='yerinde'?(p.gol?', within the lake boundary':', outside the lake boundary'):'')],['Construction',esc(p.yapim)],['Relocation',esc(p.tarih)],['Distance',a.km?a.km.toFixed(2)+' km, as the crow flies':''],['Source',esc(p.kaynak)]])+(p.not?'<p class="not">'+esc(p.not)+'</p>':'')+(T.anitHook?T.anitHook(ad):'')+
   '<div class="row">'+(a.eski?'<button type="button" id="a-e">Old site</button>':'')+(a.yeni?'<button type="button" id="a-y">New site</button>':'')+(a.eski&&a.yeni?'<button type="button" id="a-b">Both together</button>':'')+'</div>'});
  const fl=k=>{A.flyTo({center:k,zoom:16,duration:1200});setSel(k);toMap();};
  if(a.eski)$('a-e').onclick=()=>{setIm('w13045','w41468');fl(a.eski);};if(a.yeni)$('a-y').onclick=()=>{setIm('w13045','w41468');fl(a.yeni);};
  if(a.eski&&a.yeni)$('a-b').onclick=()=>{A.fitBounds([[Math.min(a.eski[0],a.yeni[0]),Math.min(a.eski[1],a.yeni[1])],[Math.max(a.eski[0],a.yeni[0]),Math.max(a.eski[1],a.yeni[1])]],{padding:70,duration:1200});setSel(null);toMap();};
  if(c)setSel(c);}
const li=(a,cls,sub)=>{const l=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<i class="'+cls+'"></i><span>'+esc(a.ad)+'</span><small>'+esc(sub)+'</small>'+(a.p.tarih?'<em>'+esc(a.p.tarih)+'</em>':'');b.onclick=()=>{anitCard(a.ad);const c=a.eski||a.yeni||a.yerinde;if(c){A.flyTo({center:c,zoom:15.5,duration:1200});toMap();}};l.appendChild(b);return l;};
ANIT.forEach(a=>$('an-liste').appendChild(li(a,a.p.akibet==='tasindi'?'sq':a.p.akibet==='birakildi'?'':'ho',AK[a.p.akibet])));
YER.sort((a,b)=>b.p.gol-a.p.gol).forEach(a=>$('an-yer').appendChild(li(a,a.p.gol?'':'ho',a.p.gol?'within the lake boundary':'outside')));
const nT=ANIT.filter(a=>a.p.akibet==='tasindi').length,nK=ANIT.filter(a=>a.p.akibet!=='tasindi').length,nYi=YER.filter(a=>a.p.gol).length,kms=ANIT.filter(a=>a.km).map(a=>a.km);
$('an-ozet').innerHTML=[[nT,'structures moved'],[nK,'structures partly moved, left behind or uncertain'],[nYi+' / '+YER.length,'sites remaining in place within the lake boundary'],[Math.min(...kms).toFixed(1)+' to '+Math.max(...kms).toFixed(1)+' km','relocation distance']].map(r=>'<div><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join('');
bars('an-mes',ANIT.filter(a=>a.km).sort((a,b)=>b.km-a.km).map(a=>[a.ad,a.km,a.km.toFixed(2)+' km']),true);

/* ---------- görsel arşiv ---------- */
const kats=[...new Set(KO.map(k=>k.kat))];kats.forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k+' ('+KO.filter(x=>x.kat===k).length+')';$('k-kat').appendChild(o);});
let kN=45;
function korCard(k){showCard({head:'<div><p class="eyebrow">Visual archive · '+esc(k.id)+' · '+esc(k.kat)+'</p><h3>'+esc(k.baslik)+'</h3></div>',
  body:(k.img?'<img src="'+esc(k.img)+'" alt="" onerror="this.remove()">':'')+dl([['Producer',esc(k.uretici)],['Date',esc(k.tarih)],['Type',esc(k.tip)]])+(k.not?'<p class="not">'+esc(k.not)+'</p>':'')+
  '<div class="row">'+(k.link?'<a class="btn" href="'+esc(k.link)+'" target="_blank" rel="noopener noreferrer">Go to source</a>':'')+(k.yil&&k.yil>=1985?'<button type="button" id="k-yil">Open '+k.yil+' imagery</button>':'')+'</div>'});
  if($('k-yil'))$('k-yil').onclick=()=>{setIm(null,imFor(k.yil));toMap();};}
function drawK(){const q=$('k-ara').value.trim().toLocaleLowerCase('tr'),kat=$('k-kat').value,dn=$('k-don').value.split('-').map(Number);
  const r=KO.filter(k=>(!kat||k.kat===kat)&&(!$('k-don').value||(k.yil&&k.yil>=dn[0]&&k.yil<=dn[1]))&&(!q||(k.baslik+' '+k.uretici+' '+k.not).toLocaleLowerCase('tr').includes(q)));
  $('k-say').textContent=r.length+' records';const g=$('k-grid');g.innerHTML='';
  r.slice(0,kN).forEach(k=>{const b=document.createElement('button');b.type='button';b.innerHTML=(k.img?'<img loading="lazy" src="'+esc(k.img)+'" alt="" onerror="this.outerHTML=\'<div class=ph></div>\'">':'<div class="ph"></div>')+'<span>'+esc(k.baslik)+'</span><small>'+esc(k.yil||'undated')+' · '+esc(k.kat)+'</small>';b.onclick=()=>korCard(k);g.appendChild(b);});
  $('k-daha').hidden=r.length<=kN;}
['k-ara','k-kat','k-don'].forEach(id=>$(id).addEventListener('input',()=>{kN=45;drawK();}));$('k-daha').onclick=()=>{kN+=60;drawK();};drawK();
const DON=[['2005 and earlier',0,2005],['2006 to 2016',2006,2016],['2017 to 2018',2017,2018],['2019 to 2020',2019,2020],['2021 and later',2021,2100]];
bars('a-kkat',kats.map(k=>[k,KO.filter(x=>x.kat===k).length]).sort((a,b)=>b[1]-a[1]));
bars('a-kdon',DON.map(d=>[d[0],KO.filter(k=>k.yil&&k.yil>=d[1]&&k.yil<=d[2]).length]),true);
bars('a-oser',LANE.map(s=>[SERU[s],OL.filter(o=>o.serit===s).length]));

/* ---------- dosyalar ---------- */
const kmr=kms.length?Math.min(...kms).toFixed(1)+' to '+Math.max(...kms).toFixed(1):'';
const DOS=[
 {no:'01',ad:'How many settlements went under water?',soru:'Published figures range from 69 to 199. Where does the difference come from?',sayi:'73',view:null,im:['s2018','s2021'],on:['g-koyin','g-koyk1','g-iz'],
  bulgu:['73 settlement points fall inside the lake boundary polygon: Batman 29, Siirt 21, Diyarbakır 12, Mardin 6, Şırnak 5.','Of these, 70 have a pre-filling ground elevation below the 525 m water level.','There are 102 more settlements within 1 km of the shoreline. They are not under water, but their fields, roads or cemeteries may be.','On the August 2022 map, 68 residential clusters are still drawn inside the lake. 66 of them were matched to a place name.','Published figures: 199 (Expert Committee 2008, HYG), 184 (Morvaridi 2004), 108 (Bimay 2021), 104 (Eroğlu 2022), 80 (Aliefendioğlu 2016), 69 (ministry source). The difference depends on whether hamlets and previously evacuated villages are counted.'],
  yontem:'The lake boundary polygon was intersected with the settlement points and the 2022 map data. The elevation value comes from the digital elevation model in the place-name database.',
  acik:'The primary village list, that is, the annexes of the resettlement plan and the environmental impact report, has not yet been found. The same village may have been counted twice under two names: Gündük and Müdevver, Başarı and İkiyaka, Kumçay and Kumgeçit, Yazlıca and Çattepe. The figure of 73 is not a verified list.',
  kaynak:'GeoNames; OpenStreetMap, August 2022; the lake boundary layer from the researcher\'s archive; the publications named.',git:[['Settlement index','#yerlesimler'],['Table of figures','#analiz']]},
 {no:'02',ad:'Hasankeyf: what was moved, what was left?',soru:'Old and new sites of the monuments, dates of relocation and where the sources conflict.',sayi:nT+' + '+nK,view:[41.4165,37.7205,14.1],im:['w13045','w41468'],on:['g-anit','g-anity','g-ark'],
  bulgu:['Between May 2017 and December 2019, '+nT+' structures or parts of structures were moved from the old town to Kültür Park. The first was the Zeynel Bey Türbesi on 12 May 2017, and the last was the main body of the Er-Rızk Camii on 16 December 2019.','For the four structures whose old and new sites are known, the relocation distance is '+kmr+' km as the crow flies. The structures were gathered side by side in a single park.','The piers of the Artuklu Köprüsü were among the structures to be moved on the 2006 list, but they were not moved. Of the Süleyman Han Camii, only the minaret, the fountain and the portal were moved, and the main building remained within the fill.','On 10 August 2017, rocks were blasted, more than 200 caves were filled in, and an embankment of more than 60 metres was built around the castle.','Of the '+YER.length+' excavation sites and structures recorded on the map, '+nYi+' are within the lake boundary.'],
  yontem:'Relocation dates were taken from published sources, and old and new locations from volunteer mapping. The distance was calculated as the straight line between two points.',
  acik:'For the Koç Camii the sources conflict: the official account says the structure was left under water, while a structure under this name is recorded inside Kültür Park on the map. The new site of the Orta Kapı and the old sites of the Süleyman Han Camii and the Kızlar Camii are not yet marked. For Er-Rızk two weights are given, 720 and 1,700 tonnes.',
  kaynak:'Eroğlu 2022; HYG 2017 and 2019; Aykan 2024; Anadolu Ajansı; OpenStreetMap, query of 16 Nov 2026.',git:[['Monument records','#anitlar'],['Events','#olaylar']]},
 {no:'03',ad:'Filling: when and where did the water arrive?',soru:'The official language said test. What do the satellite images show?',sayi:'19 Jul 2019',view:[41.413,37.716,12.6],im:['s2019','s2020'],on:['g-gol','g-koyin'],
  bulgu:['The gates closed on 19 July 2019. Sources give different days between 19 and 23 July, and the public was first told that it was a test.','On 8 October 2019, old Hasankeyf was placed within a security cordon. On 4 November 2019, the bazaar was demolished and the old road was closed.','The water reached the old town in early 2020. The first turbine entered service on 19 May 2020.','Share of water within the lake boundary in annual satellite mosaics: 8 per cent in 2018, 20 per cent in 2019, 82 per cent in 2020, 62 per cent in 2021 and 84 per cent in 2024. This is a rough estimate.','The calculated area of the lake boundary layer is 318 km², and the official figure is 313 km².'],
  yontem:'The share of dark surface within the lake boundary was measured in annual Sentinel-2 mosaics. The 8 per cent before filling is the riverbed and shadows.',
  acik:'An annual mosaic does not show a single day. To say when the water reached each village, dated images and a water index from the infrared band are needed. This analysis has not yet been done.',
  kaynak:'DSİ; HYG 2019; Hasankeyf Coordination 2019; NASA Earth Observatory 2020; Sentinel-2 cloudless, EOX.',git:[['Water surface chart','#analiz'],['Events','#olaylar']]},
 {no:'04',ad:'Severed links: roads, bridges, rivers',soru:'The water cut off not only the villages but also the links between them.',sayi:'306 km',view:null,im:['s2018','s2022'],on:['g-yol','g-su','g-yolbag'],
  bulgu:['On the August 2022 map, 306 km of road are still drawn within the lake boundary: 134 km of village roads, 71 km of field tracks, 54 km of provincial roads and 16 km of main roads.','The length of rivers and streams remaining in the lake is 443 km: Tigris 174, Garzan 47, Botan 44, Gökçesu 17, Batman River 17 km.','The old Batman road was in use from 1955 until 4 November 2019.'],
  yontem:'The length of road and waterway lines remaining within the lake boundary was calculated.',
  acik:'How much longer the journeys between villages have become, that is, a network analysis, has not yet been done. The road data rely on volunteer mapping and are incomplete.',
  kaynak:'OpenStreetMap, August 2022; soL Haber 2019; Köm and Özdemir 2023.',git:[['Road and waterway charts','#analiz'],['Layers','#katmanlar']]},
 {no:'05',ad:'Expropriation and entitlement',soru:'Whom did the state count, and whom did it not?',sayi:'710 / 2,120',view:null,im:['s2017','s2021'],on:['g-kam','g-koyin'],
  bulgu:['The urgent expropriation decision dated 26 September 2016 was published on 14 October 2016. According to press reports, it covers 990 parcels in 50 villages in 4 provinces. The decision concerns the relocation of village roads that will lie under the lake.','The 48 villages named in the report: Beşiri 12, Gercüş 2, Hasankeyf 2, Bismil 5, Siirt Merkez 14, Kurtalan 3, Eruh 4, Güçlükonak 6.','Of the 48 villages, '+KAM.features.length+' were found on the map. Of these, '+KAM.features.filter(f=>f.properties.gol_iliskisi==='gol_icinde').length+' are within the lake boundary and '+KAM.features.filter(f=>f.properties.gol_iliskisi==='kiyi_1km').length+' are within 1 km of the shore.','The list contains no villages from Mardin and Dargeçit. It is not a list of the villages that went under water.','In Hasankeyf, of 2,120 entitlement applications, 710 were accepted and 1,415 were rejected. The number of dwellings for New Hasankeyf varies by source: 698, 710, 875.'],
  yontem:'The village names were taken from the press report and matched against the place-name database. Where several records share a name, the one nearest the lake was chosen.',
  acik:'The Official Gazette text of the decision has not yet been seen. The report says 50 villages, and 48 are named. Five villages could not be found on the map: Doğanpazarı, Kungeçit, Demirkaya, Kaleboğaz, Kayakgölü. The cards of villages whose name match is uncertain carry a note.',
  kaynak:'Enerji Günlüğü and Haberler.com, October 2016; HYG 2017; Özdemirkol 2023; Hasankeyf District Governorate; Eroğlu 2022; GeoNames.',git:[['Events','#olaylar'],['Layers','#katmanlar']]},
 {no:'06',ad:'Image regime: who showed what?',soru:'The state\'s promotional imagery and the archive of counter-records.',sayi:String(KO.length),view:null,im:null,on:[],
  bulgu:['The archive has '+KO.length+' records in '+kats.length+' clusters. The largest clusters: '+kats.map(k=>[k,KO.filter(x=>x.kat===k).length]).sort((a,b)=>b[1]-a[1]).slice(0,4).map(r=>r[0]+' '+r[1]).join(', ')+'.','Of the records with a known date, '+KO.filter(k=>k.yil>=2017&&k.yil<=2020).length+' were produced between 2017 and 2020, that is, in the years of relocation and filling.','Each record gives the producer, date, type and a link to the source.'],
  yontem:'The records come from the visual corpus of the research. The clusters were built by producer and context.',
  acik:'The shooting location of the records is not yet marked. When place information is added, the images will be linked to the map.',
  kaynak:'Visibility and Erasure visual corpus.',git:[['Visual archive','#arsiv'],['Archive charts','#analiz']]},
 {no:'07',ad:'Fieldwork and testimonies',soru:'This dossier is closed on purpose.',sayi:'closed',view:null,im:null,on:[],
  bulgu:['Between 2019 and 2026, the researcher held ten field sessions in the valley.','The field photographs carry no location data. The photographs will not be placed on the map until each one has been matched to a place individually.','Interviews and interview locations will not be published or mapped until the consent process is complete.'],
  yontem:'',acik:'Matching the photographs to places and obtaining interview consent are in progress.',kaynak:'The researcher\'s field archive.',git:[]}
];
const dl_=$('d-liste'),dd=$('d-detay');
const dosBtn=d=>{const b=document.createElement('button');b.type='button';b.innerHTML='<b>'+d.no+'</b><span>'+esc(d.ad)+'</span><strong>'+esc(d.sayi)+'</strong><em>'+esc(d.soru)+'</em>';b.onclick=()=>openDos(d);$('dos').appendChild(b);};DOS.forEach(dosBtn);const addDos=d=>{DOS.push(d);dosBtn(d);};
function openDos(d){dl_.hidden=true;dd.hidden=false;kart.hidden=true;setSel(null);
  dd.innerHTML='<div class="row"><button type="button" class="btn" id="d-geri">All dossiers</button></div><p class="eyebrow">Dossier '+d.no+'</p><h1>'+esc(d.ad)+'</h1><p>'+esc(d.soru)+'</p><h2>Findings</h2><ul>'+d.bulgu.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(d.yontem?'<h2>Method</h2><p>'+esc(d.yontem)+'</p>':'')+'<h2>Open questions</h2><p class="acik">'+esc(d.acik)+'</p><h2>Source</h2><p class="small">'+esc(d.kaynak)+'</p>'+(d.ek?d.ek():'')+(d.git.length?'<h2>Records</h2><div class="row">'+d.git.map(g=>'<a class="btn" href="'+g[1]+'">'+esc(g[0])+'</a>').join('')+'</div>':'');
  $('d-geri').onclick=()=>{dd.hidden=true;dl_.hidden=false;};if(d.sonra)d.sonra();
  d.on.forEach(turnOn);if(d.im)setIm(d.im[0],d.im[1]);if(d.view)A.flyTo({center:[d.view[0],d.view[1]],zoom:d.view[2],duration:1400});else if(d.im)fitAll();
  if(!mob())$('side').scrollTo({top:0});}
Object.assign(T,{OL,ANIT,YER,KO,DOS,KAM,selEvent,openDos,showCard,dl,setSel,setIm,toMap,mob,addGroup,mapReady,addDos,imFor,km,trh,anitCard});
})().catch(e=>console.error('platform',e));

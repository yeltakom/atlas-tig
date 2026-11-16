/* Dicle Vadisi Atlası. Tek dosya uygulama: iki eşlenmiş harita, katmanlar, dizin, analiz. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const RED='#e2001a';

/* ---------- uydu görüntüleri ve altlıklar ---------- */
const EOX=y=>({id:'s'+y,ad:y+' · Sentinel-2 yıllık mozaik (10 m)',yil:y,max:14,tiles:['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-'+y+'_3857/default/g/{z}/{y}/{x}.jpg'],att:'Sentinel-2 cloudless, EOX IT Services GmbH (Copernicus Sentinel verisi '+y+')'});
const GIBS=y=>({id:'l'+y,ad:y+' · Landsat yıllık mozaik (30 m)',yil:y,max:12,tiles:['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual/default/'+y+'-12-01/GoogleMapsCompatible_Level12/{z}/{y}/{x}.jpg'],att:'NASA GIBS, Landsat WELD'});
const WB=(n,t)=>({id:'w'+n,ad:'Yüksek çözünürlük · arşiv sürümü '+t,max:17,tiles:['https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+n+'/{z}/{y}/{x}'],att:'Esri World Imagery Wayback, sürüm '+t+' (Esri, Maxar, Earthstar Geographics)'});
const IM=[GIBS(1985),GIBS(1990),GIBS(2000),EOX(2016),EOX(2017),EOX(2018),EOX(2019),EOX(2020),EOX(2021),EOX(2022),EOX(2023),EOX(2024),
  WB(10,'20.02.2014'),WB(13045,'18.01.2018'),WB(12576,'05.06.2019'),WB(1049,'13.01.2021'),WB(41468,'18.01.2024'),
  {id:'esri',ad:'Yüksek çözünürlük · güncel',max:18,tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],att:'Esri World Imagery (Esri, Maxar, Earthstar Geographics)'},
  {id:'osm',ad:'Harita · OpenStreetMap',max:19,tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],att:'© OpenStreetMap katkıcıları'},
  {id:'topo',ad:'Harita · topoğrafya',max:16,tiles:['https://a.tile.opentopomap.org/{z}/{x}/{y}.png'],att:'© OpenStreetMap katkıcıları, SRTM. Stil © OpenTopoMap (CC BY-SA)'},
  {id:'bos',ad:'Altlık yok',tiles:null}];
const imById=Object.fromEntries(IM.map(i=>[i.id,i]));
const cur={A:'s2018',B:'s2021'};

/* ---------- veri katmanları ---------- */
const SRC={gol:'data/gol.geojson',su:'data/suyollari.geojson',yolin:'data/yollar_gol_icinde.geojson',yolbag:'data/yollar_baglam.geojson',arazi:'data/arazi.geojson',osm:'data/yerler_osm.geojson',koy:'data/yerlesimler.geojson',geo:'data/yerler_geonames.geojson',iz:'data/yerlesim_izleri.geojson'};
const FONT=['Open Sans Bold'], FONTR=['Open Sans Regular'];
const lab=(id,source,filter,extra)=>Object.assign({id,type:'symbol',source,filter,layout:Object.assign({'text-field':['get','ad'],'text-font':FONT,'text-size':11.5,'text-offset':[0.7,0],'text-anchor':'left','text-max-width':9,'text-optional':true},extra&&extra.layout||{}),paint:Object.assign({'text-color':'#fff','text-halo-color':'#000','text-halo-width':1.4},extra&&extra.paint||{})},extra&&extra.top||{});
const REF={type:'FeatureCollection',features:[['Batman',41.1322,37.8874],['Siirt',41.95,37.9333],['Bismil',40.659,37.8469],['Hasankeyf (eski yer)',41.4133,37.7147],['Yeni Hasankeyf',41.417,37.7314],['Ilısu Barajı',41.85,37.5286],['Kurtalan',41.7028,37.9267],['Dargeçit',41.7178,37.5461],['Beşiri',41.2917,37.9203],['Gercüş',41.3844,37.5681]].map(r=>({type:'Feature',properties:{ad:r[0]},geometry:{type:'Point',coordinates:[r[1],r[2]]}}))};
const LAYERS=[
 {id:'yolbag',type:'line',source:'yolbag',paint:{'line-color':'#fff','line-opacity':.45,'line-width':['match',['get','sinif'],'primary',1.6,'trunk',1.8,'motorway',2,'secondary',1.1,.7]}},
 {id:'gol-fill',type:'fill',source:'gol',paint:{'fill-color':RED,'fill-opacity':.14}},
 {id:'arazi',type:'fill',source:'arazi',filter:['all',['in',['get','sinif'],['literal',['farm','orchard','cemetery','residential']]],['!=',['get','gol_iliskisi'],'kiyi_1500m']],paint:{'fill-color':['match',['get','sinif'],'farm','#b7e04a','orchard','#3fbf6f','cemetery','#c9a6ff','#ffffff'],'fill-opacity':.42,'fill-outline-color':'#000'}},
 {id:'su',type:'line',source:'su',paint:{'line-color':'#5cc8ff','line-width':['case',['==',['get','ad'],'Dicle Nehri'],2.6,['==',['get','sinif'],'river'],1.6,.9],'line-opacity':.95}},
 {id:'yolin',type:'line',source:'yolin',filter:['>=',['get','oran'],.3],paint:{'line-color':'#ffd400','line-width':['match',['get','sinif'],'primary',2.4,'trunk',2.4,'secondary',2,'tertiary',1.5,1],'line-dasharray':[2,1.5]}},
 {id:'kopru',type:'circle',source:'yolin',filter:['==',['get','kopru'],true],paint:{'circle-radius':3,'circle-color':'#ffd400','circle-stroke-color':'#000','circle-stroke-width':1}},
 {id:'gol-line',type:'line',source:'gol',paint:{'line-color':RED,'line-width':1.6}},
 {id:'isi',type:'heatmap',source:'koy',filter:['==',['get','gol_iliskisi'],'gol_icinde'],maxzoom:13,paint:{'heatmap-radius':['interpolate',['linear'],['zoom'],8,18,12,60],'heatmap-opacity':.7,'heatmap-color':['interpolate',['linear'],['heatmap-density'],0,'rgba(0,0,0,0)',.25,'rgba(255,220,0,.5)',.6,'rgba(255,120,0,.75)',1,'rgba(226,0,26,.9)']}},
 {id:'iz',type:'circle',source:'iz',paint:{'circle-radius':['interpolate',['linear'],['get','alan_ha'],0.3,6,10,12,55,22],'circle-color':'rgba(255,255,255,0)','circle-stroke-color':'#fff','circle-stroke-width':1.6}},
 {id:'derinlik',type:'circle',source:'koy',filter:['all',['==',['get','gol_iliskisi'],'gol_icinde'],['has','yukseklik'],['<=',['get','yukseklik'],525]],paint:{'circle-radius':['interpolate',['linear'],['-',525,['get','yukseklik']],0,4,20,8,50,14,80,22],'circle-color':['interpolate',['linear'],['-',525,['get','yukseklik']],0,'#9fd8ff',25,'#2f8fe0',50,'#0b4fa8',80,'#041c5c'],'circle-opacity':.85,'circle-stroke-color':'#fff','circle-stroke-width':1}},
 {id:'geo',type:'circle',source:'geo',filter:['in',['get','sinif'],['literal',['S.RUIN','S.CAVE','S.BDG','S.MSQE','S.CH']]],paint:{'circle-radius':3,'circle-color':'#ff9a2e','circle-stroke-color':'#000','circle-stroke-width':.8}},
 {id:'ark',type:'circle',source:'osm',filter:['in',['get','sinif'],['literal',['archaeological','ruins','attraction']]],paint:{'circle-radius':4.5,'circle-color':'#ff9a2e','circle-stroke-color':'#000','circle-stroke-width':1.2}},
 {id:'kamu',type:'circle',source:'osm',filter:['in',['get','sinif'],['literal',['school','graveyard','town_hall']]],paint:{'circle-radius':3.5,'circle-color':'#c9a6ff','circle-stroke-color':'#000','circle-stroke-width':1}},
 {id:'koy-k3',type:'circle',source:'koy',filter:['==',['get','gol_iliskisi'],'kiyi_3km'],paint:{'circle-radius':3,'circle-color':'#bbb','circle-stroke-color':'#000','circle-stroke-width':.8}},
 {id:'koy-k1',type:'circle',source:'koy',filter:['==',['get','gol_iliskisi'],'kiyi_1km'],paint:{'circle-radius':4,'circle-color':'#fff','circle-stroke-color':'#000','circle-stroke-width':1.4}},
 {id:'koy-in',type:'circle',source:'koy',filter:['==',['get','gol_iliskisi'],'gol_icinde'],paint:{'circle-radius':['interpolate',['linear'],['zoom'],8,3.5,13,6],'circle-color':RED,'circle-stroke-color':'#fff','circle-stroke-width':1.4}},
 lab('ark-lab','osm',['in',['get','sinif'],['literal',['archaeological','ruins']]],{top:{minzoom:11.5},layout:{'text-font':FONTR,'text-size':11},paint:{'text-color':'#ffd9a8'}}),
 lab('koy-k1-lab','koy',['==',['get','gol_iliskisi'],'kiyi_1km'],{top:{minzoom:11.5},layout:{'text-font':FONTR,'text-size':11}}),
 lab('koy-in-lab','koy',['==',['get','gol_iliskisi'],'gol_icinde'],{top:{minzoom:10.3},paint:{'text-color':'#fff','text-halo-color':RED,'text-halo-width':1.6}}),
 lab('ref-lab','ref',['all'],{layout:{'text-size':13,'text-offset':[0,0],'text-anchor':'center','text-transform':'uppercase','text-letter-spacing':.06},paint:{'text-halo-width':1.8}})
];
const GROUPS=[
 {id:'g-gol',ad:'Göl sınırı',alt:'Baraj gölünün azami kıyı çizgisi',renk:RED,sek:'ln',layers:['gol-line'],on:true},
 {id:'g-golf',ad:'Göl alanı dolgusu',alt:'Eski görüntülerin üzerinde su altında kalacak alanı gösterir',renk:'rgba(226,0,26,.3)',sek:'sq',layers:['gol-fill'],on:true},
 {id:'g-koyin',ad:'Göl sınırı içindeki yerleşimler',alt:'Nokta göl poligonunun içine düşüyor',renk:RED,layers:['koy-in','koy-in-lab'],on:true},
 {id:'g-koyk1',ad:'Kıyı yerleşimleri, 1 km',alt:'Kıyı çizgisine 1 km ve daha yakın',renk:'#fff',layers:['koy-k1','koy-k1-lab'],on:true},
 {id:'g-koyk3',ad:'Çevre yerleşimler, 1 ile 3 km',renk:'#bbb',layers:['koy-k3'],on:false},
 {id:'g-su',ad:'Nehir ve çaylar',alt:'Dicle ve kolları, göl içinde kalan dereler',renk:'#5cc8ff',sek:'ln',layers:['su'],on:true},
 {id:'g-yol',ad:'Göl içinde kalan yollar ve köprüler',alt:'2022 haritasında hâlâ çizili duran yollar',renk:'#ffd400',sek:'ln',layers:['yolin','kopru'],on:true},
 {id:'g-arazi',ad:'Göl içinde kalan konut, tarla, bahçe, mezarlık',alt:'Beyaz konut alanı, yeşil tarla ve bahçe, mor mezarlık',renk:'#b7e04a',sek:'sq',layers:['arazi'],on:true},
 {id:'g-ark',ad:'Arkeolojik alanlar ve höyükler',renk:'#ff9a2e',layers:['ark','ark-lab'],on:true},
 {id:'g-geo',ad:'Harabe, mağara, köprü kayıtları',alt:'Eski haritalardan derlenmiş yer kayıtları',renk:'#ff9a2e',layers:['geo'],on:false},
 {id:'g-kamu',ad:'Okul, mezarlık, muhtarlık',renk:'#c9a6ff',layers:['kamu'],on:false},
 {id:'g-iz',ad:'Analiz: su altındaki yerleşim izleri',alt:'Haritalanmış konut alanı kümeleri, halka büyüklüğü alanla orantılı',renk:'#fff',layers:['iz'],on:false},
 {id:'g-derinlik',ad:'Analiz: tahmini su derinliği',alt:'525 m su kotu ile yerleşimin arazi yüksekliği arasındaki fark',renk:'#0b4fa8',layers:['derinlik'],on:false},
 {id:'g-isi',ad:'Analiz: yoğunluk yüzeyi',alt:'Göl sınırı içindeki yerleşimlerin mekânsal yoğunluğu',renk:'#ff7800',sek:'sq',layers:['isi'],on:false},
 {id:'g-yolbag',ad:'Ana yollar (bağlam)',renk:'#ddd',sek:'ln',layers:['yolbag'],on:true},
 {id:'g-ref',ad:'İlçe ve yer adları',renk:'#fff',sek:'sq',layers:['ref-lab'],on:true}
];
const CLICKABLE=['koy-in','koy-k1','koy-k3','ark','geo','kamu','iz','derinlik','kopru','arazi'];

function baseStyle(){return {version:8,glyphs:'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',sources:{},layers:[{id:'zemin',type:'background',paint:{'background-color':'#e9e9e6'}}]};}
function mk(el){const m=new maplibregl.Map({container:el,style:baseStyle(),center:[41.45,37.76],zoom:9.2,minZoom:7,maxZoom:17.5,attributionControl:false,dragRotate:false,pitchWithRotate:false});m.touchZoomRotate.disableRotation();return m;}
const A=mk('mapA'),B=mk('mapB');const maps={A,B};
B.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
A.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-right');
A.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');

function setImagery(side,id){const m=maps[side],im=imById[id];cur[side]=id;
  if(m.getLayer('uydu'))m.removeLayer('uydu'); if(m.getSource('uydu'))m.removeSource('uydu');
  if(im.tiles){m.addSource('uydu',{type:'raster',tiles:im.tiles,tileSize:256,maxzoom:im.max,attribution:im.att});
    const first=m.getStyle().layers.find(l=>l.id!=='zemin'&&l.id!=='uydu');m.addLayer({id:'uydu',type:'raster',source:'uydu'},first?first.id:undefined);}
  $('im'+side).value=id; document.querySelectorAll('#imlist button').forEach(b=>b.setAttribute('aria-pressed',cur[b.dataset.side]===b.dataset.id));}
function addData(m){Object.entries(SRC).forEach(([k,u])=>m.addSource(k,{type:'geojson',data:u}));m.addSource('ref',{type:'geojson',data:REF});
  LAYERS.forEach(l=>m.addLayer(JSON.parse(JSON.stringify(l))));
  GROUPS.forEach(g=>g.layers.forEach(id=>m.setLayoutProperty(id,'visibility',g.on?'visible':'none')));
  m.on('click',e=>{const f=m.queryRenderedFeatures([[e.point.x-7,e.point.y-7],[e.point.x+7,e.point.y+7]],{layers:CLICKABLE.filter(id=>m.getLayer(id))});if(!f.length)return;
    const order=id=>CLICKABLE.indexOf(id);f.sort((a,b)=>order(a.layer.id)-order(b.layer.id));popup(m,f[0],e.lngLat);});
  CLICKABLE.forEach(id=>{m.on('mouseenter',id,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',id,()=>m.getCanvas().style.cursor='');});}
let pop=null;
const REL={gol_icinde:'Göl sınırının içinde',kiyi_1km:'Kıyıdan 1 km içinde',kiyi_3km:'Kıyıdan 1 ile 3 km arası',tam:'Tamamı göl sınırının içinde',kismi:'Kısmen göl sınırının içinde',kiyi_1500m:'Kıyıda, sınırın dışında'};
const SINIF={archaeological:'Arkeolojik alan',ruins:'Harabe',attraction:'Höyük ya da ziyaret yeri',school:'Okul',graveyard:'Mezarlık',town_hall:'Muhtarlık ya da belediye',farm:'Tarla',orchard:'Meyve bahçesi',cemetery:'Mezarlık',residential:'Konut alanı','S.RUIN':'Harabe kaydı','S.CAVE':'Mağara kaydı','S.BDG':'Köprü kaydı','S.MSQE':'Cami kaydı','S.CH':'Kilise kaydı'};
function altNames(p){const n=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ı/g,'i').toLowerCase().replace(/[^a-z]/g,'');const seen=new Set([n(p.ad||'')]),out=[];String(p.diger||'').split(',').forEach(a=>{a=a.trim();const k=n(a);if(a&&!seen.has(k)){seen.add(k);out.push(a);}});return out.slice(0,5);}
function popup(m,f,ll){const p=f.properties,L=f.layer.id;let h='';
  if(L.startsWith('koy')||L==='derinlik'){const al=altNames(p);h='<b>'+esc(p.ad)+'</b>'+(al.length?'<span>Diğer adlar: '+esc(al.join(', '))+'</span>':'')+'<span>'+esc(p.il)+' · '+REL[p.gol_iliskisi]+(p.gol_iliskisi==='gol_icinde'?'':' ('+p.uzaklik_m+' m)')+'</span>'+(p.yukseklik!=null?'<span>Arazi yüksekliği '+p.yukseklik+' m'+(p.gol_iliskisi==='gol_icinde'&&p.yukseklik<=525?' · tahmini su derinliği '+(525-p.yukseklik)+' m':'')+'</span>':'')+'<span>Kaynak: GeoNames</span>';}
  else if(L==='iz'){h='<b>'+esc(p.ad||'Adsız yerleşim izi')+'</b><span>Haritalanmış konut alanı: '+p.alan_ha+' hektar, '+p.poligon+' parça</span><span>'+REL[p.gol_iliskisi]+'</span><span>Kaynak: OpenStreetMap 2022, ad en yakın GeoNames kaydından</span>';}
  else if(L==='saha'){h='<b>'+esc(p.ad)+'</b><span>Saha işareti · '+(p.konum==='gol_icinde'?'göl sınırının içinde':'göl sınırının dışında')+'</span>';}
  else if(L==='kopru'){h='<b>'+esc(p.ad||'Köprü')+'</b><span>Göl sınırı içinde kalan köprü kaydı</span><span>Kaynak: OpenStreetMap 2022</span>';}
  else if(L==='arazi'){h='<b>'+esc(p.ad||SINIF[p.sinif]||p.sinif)+'</b><span>'+(SINIF[p.sinif]||p.sinif)+' · '+p.alan_ha+' hektar</span><span>'+REL[p.gol_iliskisi]+'</span><span>Kaynak: OpenStreetMap 2022</span>';}
  else{h='<b>'+esc(p.ad||SINIF[p.sinif]||'Kayıt')+'</b><span>'+(SINIF[p.sinif]||esc(p.sinif))+(p.gol_iliskisi?' · '+REL[p.gol_iliskisi]:'')+'</span><span>Kaynak: '+(L==='geo'?'GeoNames':'OpenStreetMap 2022')+'</span>';}
  if(pop)pop.remove();pop=new maplibregl.Popup({closeButton:true,maxWidth:'280px'}).setLngLat(f.geometry.type==='Point'?f.geometry.coordinates:ll).setHTML(h).addTo(m);}

/* ---------- iki haritayı eşle, ayırıcı ---------- */
let lock=false;const sync=(a,b)=>a.on('move',()=>{if(lock)return;lock=true;b.jumpTo({center:a.getCenter(),zoom:a.getZoom()});lock=false;});
sync(A,B);sync(B,A);
const box=$('maps'),sp=$('split');let split=.5;
const setSplit=v=>{split=Math.max(.03,Math.min(.97,v));box.style.setProperty('--split',(split*100)+'%');sp.setAttribute('aria-valuenow',Math.round(split*100));};
let drag=false;sp.addEventListener('pointerdown',e=>{drag=true;sp.setPointerCapture(e.pointerId);});
sp.addEventListener('pointermove',e=>{if(!drag)return;const r=box.getBoundingClientRect();setSplit((e.clientX-r.left)/r.width);});
['pointerup','pointercancel'].forEach(t=>sp.addEventListener(t,()=>drag=false));
sp.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')setSplit(split-.03);if(e.key==='ArrowRight')setSplit(split+.03);});
const setMode=tek=>{box.classList.toggle('tek',tek);$('m-tek').setAttribute('aria-pressed',tek);$('m-kars').setAttribute('aria-pressed',!tek);};
$('m-tek').onclick=()=>setMode(true);$('m-kars').onclick=()=>setMode(false);

/* ---------- menüler ---------- */
['A','B'].forEach(s=>{const sel=$('im'+s);IM.forEach(i=>{const o=document.createElement('option');o.value=i.id;o.textContent=i.ad;sel.appendChild(o);});sel.onchange=()=>setImagery(s,sel.value);});
const iml=$('imlist');iml.innerHTML='<b>Görüntü</b><b>Sol</b><b>Sağ</b>';
IM.forEach(i=>{const t=document.createElement('span');t.textContent=i.ad;iml.appendChild(t);['A','B'].forEach(s=>{const w=document.createElement('span'),b=document.createElement('button');b.type='button';b.textContent=s==='A'?'Sol':'Sağ';b.dataset.side=s;b.dataset.id=i.id;b.onclick=()=>setImagery(s,i.id);w.style.padding='0';w.appendChild(b);iml.appendChild(w);});});
const kl=$('katlist');GROUPS.forEach(g=>{const l=document.createElement('label');l.innerHTML='<input type="checkbox" id="'+g.id+'"'+(g.on?' checked':'')+'><i class="'+(g.sek||'')+'" style="background:'+g.renk+'"></i><span>'+esc(g.ad)+'</span>'+(g.alt?'<small>'+esc(g.alt)+'</small>':'');kl.appendChild(l);
  l.querySelector('input').onchange=e=>{g.on=e.target.checked;[A,B].forEach(m=>g.layers.forEach(id=>m.getLayer(id)&&m.setLayoutProperty(id,'visibility',g.on?'visible':'none')));};});
function turnOn(gid){const g=GROUPS.find(x=>x.id===gid);if(g&&!g.on){$(gid).checked=true;$(gid).dispatchEvent(new Event('change'));}}

/* ---------- yerler ---------- */
const TUR=[['Bütün göl',null],['Hasankeyf',[41.413,37.714,13.6]],['Ilısu baraj gövdesi',[41.85,37.535,12.6]],['Botan ve Dicle kavşağı, Çattepe',[41.775,37.735,12.6]],['Garzan kolu, Kumçay',[41.49,37.825,12.2]],['Batman Çayı kavşağı, Oymataş',[41.02,37.80,12.8]],['Bismil ucu, Salat ve Körtik Tepe',[40.94,37.82,12.4]],['Güçlükonak yakası, Koçtepe',[41.87,37.56,12.6]],['Siirt kolu, Başur',[41.80,37.93,12]]];
const fitAll=()=>A.fitBounds([[40.76,37.49],[42.09,38.02]],{padding:20,duration:800});
TUR.forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t[0];b.onclick=()=>{t[1]?A.flyTo({center:[t[1][0],t[1][1]],zoom:t[1][2],duration:1400}):fitAll();if(window.innerWidth<=860)window.scrollTo({top:0,behavior:'smooth'});};$('tur').appendChild(b);});

/* ---------- bölümler ---------- */
const PAN=['giris','katmanlar','yerlesimler','analiz','kronoloji','kaynaklar'];
function route(){let h=location.hash.replace('#','');if(!PAN.includes(h))h='giris';PAN.forEach(p=>{$('p-'+p).hidden=p!==h;});document.querySelectorAll('#nav a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+h));}
window.addEventListener('hashchange',route);route();

/* ---------- kronoloji, sayılar, kaynaklar ---------- */
const KRON=[['1954','Dicle üzerinde baraj için etüt çalışmaları başlıyor.'],['1978, 1981','Hasankeyf arkeolojik sit alanı ilan ediliyor, 22 yapı anıt olarak tescil ediliyor.'],['1982','Ilısu projesinin GAP kapsamında yapılması kararlaştırılıyor.'],['1985','En eski uydu mozaiği.','l1985'],['1990','Uydu mozaiği.','l1990'],['1997','Proje yatırım programına alınıyor, ilk uluslararası konsorsiyum kuruluyor.'],['2000','Uydu mozaiği. Vadi baraj öncesi haliyle.','l2000'],['2001, 2002','İlk konsorsiyum dağılıyor.'],['2005','Yeniden yerleşim planı ve çevresel etki raporu güncelleniyor.'],['2006','Hasankeyf\'i Yaşatma Girişimi kuruluyor. Temel atma töreni yapılıyor.'],['2009','Almanya, Avusturya ve İsviçre ihracat kredi teminatını geri çekiyor.'],['2010','İnşaat tam kapasiteyle başlıyor. Ilısu köyü Yeni Ilısu\'ya taşınıyor. Yeni Hasankeyf\'in inşaatı başlıyor.'],['2012','Derivasyon tünelleri bitiyor, gövde inşaatı başlıyor.'],['2016','Sentinel-2 görüntüsü. Yollar için acele kamulaştırma kararı.','s2016'],['2017','Zeynel Bey Türbesi taşınıyor. Hasankeyf\'te kayalar düşürülüyor, mağaralar dolduruluyor.','s2017'],['2018','Dolumdan önceki son tam yıl.','s2018'],['2019','Temmuz sonunda uydu görüntüleri su birikimini gösteriyor. Ekim sonunda eski Hasankeyf\'in giriş yolu kapanıyor.','s2019'],['2020','Su Hasankeyf\'e ulaşıyor. İlk türbin devreye giriyor.','s2020'],['2021','Göl dolmuş halde. Resmi açılış töreni.','s2021'],['2024','Güncel durum.','s2024']];
KRON.forEach(k=>{const li=document.createElement('li');li.innerHTML='<b>'+k[0]+'</b><span>'+esc(k[1])+'</span>';if(k[2]){const b=document.createElement('button');b.type='button';b.textContent='Görüntüyü aç';b.onclick=()=>{setImagery('B',k[2]);if(window.innerWidth<=860)window.scrollTo({top:0,behavior:'smooth'});};li.lastChild.appendChild(b);}$('kron').appendChild(li);});
const SAY=[['199','yerleşim: 83 tam, 116 kısmi, 49\'u boş. Uzmanlar Komitesi raporu, 2008'],['199','köy ve Hasankeyf. Hasankeyf\'i Yaşatma Girişimi, 2017 ve 2019'],['184','köy, yaklaşık 85\'i boş sayılıyor. Morvaridi, 2004'],['108','yerleşim. Bimay, 2021'],['104','köy ve mezra, 1 ilçe. Eroğlu, 2022'],['80','köy, 5 il, 11 ilçe. Aliefendioğlu, 2016'],['69','27 köy ve 42 mezra, 1 ilçe. Bakanlık kaynaklı, Özdemirkol 2023'],['73','yerleşim noktası göl sınırının içinde. Bu atlasın hesabı']];
$('a-say').innerHTML=SAY.map(s=>'<tr><td>'+s[0]+'</td><td>'+esc(s[1])+'</td></tr>').join('');
$('src').innerHTML=['Yerleşim noktaları ve diğer adlar: GeoNames, Türkiye dökümü, 16.11.2026. CC BY 4.0.','Yollar, su yolları, arazi kullanımı, arkeolojik alanlar: OpenStreetMap katkıcıları, Ağustos 2022 dökümü. ODbL.','Göl sınırı: araştırmacının arşivindeki katman. Öznitelikleri DSİ kaynaklı görünüyor, üzerinde kurum görüşü olmadığı notu var.','Sentinel-2 yıllık mozaikleri: Sentinel-2 cloudless, EOX IT Services GmbH. Copernicus Sentinel verisi içerir. Lisans yıla göre değişir, yayın öncesi teyit edilmeli.','Landsat mozaikleri 1985, 1990, 2000: NASA GIBS, Landsat WELD.','Yüksek çözünürlüklü görüntüler: Esri World Imagery ve Wayback arşivi.','Altlık haritalar: OpenStreetMap, OpenTopoMap.','Sayılar tablosu: adı geçen rapor ve yayınlar. Kronoloji: Hasankeyf Koordinasyonu 2019 raporu ve basın kaynakları.'].map(s=>'<li>'+esc(s)+'</li>').join('');

/* ---------- dizin ve analiz ---------- */
const bars=(el,rows,red)=>{const mx=Math.max(...rows.map(r=>r[1]),1);$(el).innerHTML=rows.map(r=>'<span>'+esc(r[0])+'</span><i'+(red?' class="r"':'')+' style="width:'+(100*r[1]/mx).toFixed(1)+'%"></i><span>'+(r[2]||r[1])+'</span>').join('');};
bars('a-suyil',[[2017,9.4],[2018,7.9],[2019,19.8],[2020,81.9],[2021,61.8],[2022,81.8],[2023,76.2],[2024,84.1]].map(r=>[String(r[0]),r[1],'%'+Math.round(r[1])+' · yaklaşık '+Math.round(318*r[1]/100)+' km²']),true);
bars('a-su',[['Dicle',174],['Garzan',47],['Botan Çayı',44],['Gökçesu Çayı',17],['Batman Çayı',17],['Zorava Çayı',14],['Başur Çayı',11],['İnli Çayı',10],['Diğer',109]].map(r=>[r[0],r[1],r[1]+' km']));
bars('a-yol',[['Üçüncül yol',134],['Arazi yolu',71],['İkincil yol',54],['Köy içi yol',17],['Ana yol',19],['Diğer',11]].map(r=>[r[0],r[1],r[1]+' km']));
let KOY=[];
fetch(SRC.koy).then(r=>r.json()).then(j=>{KOY=j.features.map(f=>Object.assign({ll:f.geometry.coordinates},f.properties));KOY.forEach(k=>k._alt=altNames(k));
  const ins=KOY.filter(k=>k.gol_iliskisi==='gol_icinde'),k1=KOY.filter(k=>k.gol_iliskisi==='kiyi_1km');
  const iller=[...new Set(KOY.map(k=>k.il))].sort((a,b)=>a.localeCompare(b,'tr'));iller.forEach(i=>{const o=document.createElement('option');o.value=i;o.textContent=i;$('f-il').appendChild(o);});
  $('ozet').innerHTML=[[ins.length,'yerleşim göl sınırının içinde'],[k1.length,'yerleşim kıyıdan 1 km içinde'],['306 km','yol göl içinde'],['443 km','nehir ve çay göl içinde'],['318 km²','göl sınırı alanı'],['1985 ile 2024','arası uydu görüntüsü']].map(n=>'<div><b>'+n[0]+'</b><span>'+n[1]+'</span></div>').join('');
  bars('a-il',iller.map(i=>[i,ins.filter(k=>k.il===i).length]).filter(r=>r[1]).sort((a,b)=>b[1]-a[1]),true);
  const bins=[[440,460],[460,480],[480,500],[500,520],[520,526],[526,600]];bars('a-h',bins.map(b=>[b[1]===600?'525 m üstü':b[0]+' ile '+Math.min(b[1],525)+' m',ins.filter(k=>k.yukseklik!=null&&k.yukseklik>=b[0]&&k.yukseklik<b[1]).length]));
  draw();});
fetch(SRC.arazi).then(r=>r.json()).then(j=>{const t={};j.features.forEach(f=>{const p=f.properties;if(p.gol_iliskisi==='kiyi_1500m')return;t[p.sinif]=(t[p.sinif]||0)+p.alan_ha;});
  const ad={residential:'Konut alanı',farm:'Tarla',orchard:'Meyve bahçesi',cemetery:'Mezarlık',scrub:'Çalılık',forest:'Orman',grass:'Çayır'};
  bars('a-arazi',Object.entries(t).filter(e=>ad[e[0]]).sort((a,b)=>b[1]-a[1]).map(e=>[ad[e[0]],Math.round(e[1]),Math.round(e[1])+' ha']));});
function draw(){const q=$('ara').value.trim().toLocaleLowerCase('tr'),il=$('f-il').value,r=$('f-r').value;
  const L=KOY.filter(k=>(!il||k.il===il)&&(!r||k.gol_iliskisi===r)&&(!q||(k.ad+' '+k.diger).toLocaleLowerCase('tr').includes(q))).sort((a,b)=>a.ad.localeCompare(b.ad,'tr'));
  $('say').textContent=L.length+' yerleşim';const ul=$('liste');ul.innerHTML='';
  L.slice(0,300).forEach(k=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';const c=k.gol_iliskisi==='gol_icinde'?'':(k.gol_iliskisi==='kiyi_1km'?'k1':'k3');
    b.innerHTML='<i class="'+c+'"></i><span>'+esc(k.ad)+'</span><small>'+esc(k.il)+(k.yukseklik!=null?' · '+k.yukseklik+' m':'')+'</small>'+(k._alt.length?'<em>'+esc(k._alt.join(', '))+'</em>':'');
    b.onclick=()=>{if(k.gol_iliskisi==='kiyi_3km')turnOn('g-koyk3');A.flyTo({center:k.ll,zoom:13.2,duration:1200});const m=split<.5?B:A;A.once('moveend',()=>popup(m,{properties:k,layer:{id:'koy-in'},geometry:{type:'Point',coordinates:k.ll}},k.ll));if(window.innerWidth<=860)window.scrollTo({top:0,behavior:'smooth'});};
    li.appendChild(b);ul.appendChild(li);});}
['ara','f-il','f-r'].forEach(id=>$(id).addEventListener('input',draw));

/* ---------- başlat ---------- */
let ready=0;const start=()=>{if(++ready<2)return;[A,B].forEach(addData);setImagery('A',cur.A);setImagery('B',cur.B);fitAll();};
A.on('load',start);B.on('load',start);
window.__atlas={A,B,setImagery};
})();

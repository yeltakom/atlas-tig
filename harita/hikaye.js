/* Dicle Vadisi Atlası: üç boyutlu anlatı. Tek harita, arazi kabartması, bölüm bölüm kamera, su kotu modeli.
   Su modeli tarayıcıda hesaplanır: dolum öncesi arazi yüksekliği karoları (Mapzen Terrain, SRTM) göl sınırı poligonuyla maskelenir. */
(async function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const qs=new URLSearchParams(location.search);
const DEM=qs.get('dem')||'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const PINK='#ffaee6',CYAN='#5df0e6',PURPLE='#552d7f',ORANGE='#ff8a1f',RED='#ff0000';
const FONT=['Open Sans Bold'];
const mob=()=>window.innerWidth<=860;
const fmt=(v,d)=>v.toFixed(d).replace('.',',');
const J=u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null);

/* ---------- görüntüler ---------- */
const EOX=y=>({ad:y+' · Sentinel-2 yıllık mozaik',max:14,tiles:['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-'+y+'_3857/default/g/{z}/{y}/{x}.jpg'],att:'Sentinel-2 cloudless, EOX IT Services GmbH (Copernicus Sentinel verisi '+y+')'});
const WB=(n,t)=>({ad:'Yüksek çözünürlük · arşiv sürümü '+t,max:17,tiles:['https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+n+'/{z}/{y}/{x}'],att:'Esri World Imagery Wayback, sürüm '+t});
const IMG={s2018:EOX(2018),s2019:EOX(2019),s2020:EOX(2020),s2021:EOX(2021),s2022:EOX(2022),s2024:EOX(2024),w2014:WB(10,'20.02.2014'),w2018:WB(13045,'18.01.2018'),w2019:WB(12576,'05.06.2019'),w2021:WB(1049,'13.01.2021'),w2024:WB(41468,'18.01.2024')};

/* ---------- bölümler: kamera, görüntü, katman, su ---------- */
const B=[
 {t:'Bir vadinin su altında bırakılması',e:'Dicle Vadisi Atlası · üç boyutlu anlatı',m:'Ilısu Barajı 19 Temmuz 2019\'da su tutmaya başladı. Bu anlatı, Dicle vadisini barajdan önceki arazisiyle üç boyutlu gösterir ve suyun nereye ulaştığını adım adım izler. Aşağı kaydır.',k:'',
  cam:{center:[41.43,37.74],zoom:9.7,pitch:55,bearing:-18},im:'s2018',kat:['gol'],su:null},
 {t:'Vadi',e:'01 · 2018, sudan önce',m:'Dicle, Bismil\'den Ilısu\'ya dar bir vadide akıyordu. Batman Çayı, Garzan ve Botan ona bu vadide karışıyordu. Bu atlasın hesabına göre bugünkü göl sınırının içinde Dicle\'nin 174 kilometresi, kollarıyla birlikte 443 kilometre nehir ve çay kaldı.',k:'Göl sınırı katmanı; OpenStreetMap, Ağustos 2022.',
  cam:{center:[41.22,37.795],zoom:10.9,pitch:62,bearing:82},im:'s2018',kat:['nehir'],su:null},
 {t:'Yerleşimler',e:'02 · kıyıdaki köyler',m:'Pembe noktalar, bugünkü göl sınırının içine düşen 73 yerleşim noktası. Beyaz noktalar kıyıya bir kilometreden yakın olanlar. Yayımlanmış sayılar 69 ile 199 arasında değişiyor, çünkü kaynaklar mezraları ve önceden boşaltılmış köyleri farklı sayıyor.',k:'GeoNames; yayımlanmış sayılar için atlasın Analiz bölümü.',
  cam:{center:[41.62,37.80],zoom:10.7,pitch:58,bearing:-32},im:'s2018',kat:['gol','nehir','koy','kiyi'],su:null},
 {t:'Hasankeyf',e:'03 · eski kent',m:'Kale kayalığı ve aşağı şehir nehrin güney yakasında duruyordu. Kent 1978 ve 1981\'de iki aşamada sit alanı ilan edildi. Kırmızı noktalar, sonradan taşınan ya da yerinde bırakılan yapıların eski yerleri.',k:'HYG 2019, s. 30; OpenStreetMap.',
  cam:{center:[41.4115,37.7128],zoom:14.7,pitch:66,bearing:172},im:'w2014',kat:['anit-eski','anit-yer'],su:null},
 {t:'Baraj',e:'04 · 2006 ile 2018 arası',m:'Temel 5 Ağustos 2006\'da atıldı. Almanya, Avusturya ve İsviçre kredi kuruluşları 7 Temmuz 2009\'da çekildi, inşaat yerli finansmanla sürdü. Gövde 2018\'de tamamlandı. Yüksekliği 135 metre, normal su kotu 525 metre.',k:'Özdemirkol 2023; Eberlein ve diğerleri 2010; Eroğlu 2022.',
  cam:{center:[41.8485,37.531],zoom:13.5,pitch:64,bearing:-38},im:'w2018',kat:['gol','baraj'],su:null},
 {t:'Taşıma',e:'05 · 2017 ile 2019 arası',m:'Zeynel Bey Türbesi 12 Mayıs 2017\'de taşındı. Ardından başka yapılar ve yapı parçaları yaklaşık iki kilometre kuzeydoğudaki Kültür Park\'a götürüldü. Pembe çizgiler taşınma hatları. Köprünün ayakları yerinde bırakıldı. 10 Ağustos 2017\'de kale kayalıkları patlatıldı, mağaralar dolduruldu.',k:'Eroğlu 2022; HYG 2019, s. 17; Anadolu Ajansı.',
  cam:{center:[41.4175,37.7205],zoom:14.1,pitch:62,bearing:38},im:'w2019',kat:['anit-hat','anit-eski','anit-yeni'],su:null},
 {t:'Su yükseliyor',e:'06 · 19 Temmuz 2019',m:'Kapaklar kapandı. Kamuoyuna önce test denildi. Bu görüntü bir modeldir: vadinin dolum öncesi arazi yüksekliğine göre, su kotu yükseldikçe göl sınırının içinde nerelerin su altında kaldığını gösterir. Tarihi değil kotu izler. Alttaki çubukla kotu kendin değiştirebilirsin.',k:'Arazi: Mapzen Terrain Tiles, SRTM. Göl sınırı katmanı. Model bu atlasın hesabıdır.',
  cam:{center:[41.47,37.745],zoom:10.1,pitch:58,bearing:18},im:'s2018',kat:['gol','koy'],su:{from:'min',to:525,ms:16000}},
 {t:'Su Hasankeyf\'e ulaşıyor',e:'07 · Ekim 2019 ile 2020 başı',m:'8 Ekim 2019\'da eski kent güvenlik çemberine alındı. 4 Kasım\'da çarşı yıkıldı, 1955\'ten beri kullanılan eski Batman yolu kapandı. Su 2020 başında aşağı şehre ulaştı. Modelde nehir bu noktada yaklaşık 476 metrede, su kotu 525 metrede.',k:'soL Haber 2019; Hasankeyf Koordinasyonu 2019; NASA Earth Observatory 2020.',
  cam:{center:[41.412,37.7145],zoom:14.3,pitch:64,bearing:150},im:'w2014',kat:['gol','anit-eski','anit-yer'],su:{from:470,to:525,ms:12000}},
 {t:'Uydudan, yıl yıl',e:'08 · 2018 ile 2022 arası',m:'Aynı vadi, Sentinel-2 uydusunun yıllık mozaiklerinde. Görüntü 2018\'den 2022\'ye kendiliğinden ilerler. 2019 mozaiği ağırlıklı olarak dolum öncesi karelerden oluşur. Görüntü, dolum öncesi arazinin üzerine giydirildiği için su yamaçlara tırmanıyor gibi görünür.',k:'Sentinel-2 cloudless, EOX IT Services GmbH.',
  cam:{center:[41.50,37.76],zoom:10.3,pitch:50,bearing:-5},im:'s2018',kat:['gol'],su:0,dongu:['s2018','s2019','s2020','s2021','s2022']},
 {t:'Su altında kalanlar',e:'09 · bugün',m:'Göl sınırının içinde 73 yerleşim noktası, derlenen yayınlarda adı geçen 29 arkeolojik alan ve kurtarma kazısı, 2022 haritasında hâlâ çizili duran 306 kilometre yol var. Turuncu noktalar arkeolojik alanlar. Bu sayılar hesaba dayanır, doğrulanmış bir liste değildir.',k:'GeoNames; OpenStreetMap, Ağustos 2022; araştırma raporu, 17.11.2026.',
  cam:{center:[41.72,37.76],zoom:10.9,pitch:60,bearing:-58},im:'s2022',kat:['gol','koy','kazi'],su:525},
 {t:'Yeni Hasankeyf',e:'10 · yeniden yerleşim',m:'Yeni kent, eskisinin yaklaşık iki kilometre kuzeyinde kuruldu. Konut sayısı kaynaklara göre 698 ile 875 arasında değişiyor. 2.120 hak sahipliği başvurusundan 710\'u kabul edildi, 1.415\'i reddedildi. Taşınan yapılar kentin doğusundaki parkta yan yana duruyor.',k:'HYG 2017; Hasankeyf Kaymakamlığı; Eroğlu 2022.',
  cam:{center:[41.4215,37.7325],zoom:14.2,pitch:60,bearing:-24},im:'w2024',kat:['gol','anit-yeni','yy'],su:0},
 {t:'Atlas',e:'Çalışma sürümü',m:'Bu anlatı atlasın kısa yoludur. Kayıtların tamamı, kaynakları, açık soruları ve yöntemiyle birlikte atlasta durur: dosyalar, olaylar, yerleşim kartları, anıtlar, görsel arşiv ve kütüphane.',k:'',
  cam:{center:[41.45,37.75],zoom:9.6,pitch:45,bearing:10},im:'s2024',kat:['gol','koy'],su:0,son:true}
];

/* ---------- bölüm kartları ve gezinme ---------- */
const bol=$('bolumler'),ray=$('ray');
B.forEach((b,i)=>{const s=document.createElement('section');s.className='bl';s.dataset.i=i;
  s.innerHTML='<div class="bk'+(i===0?' kapak':'')+'"><p class="eyebrow">'+esc(b.e)+'</p>'+(i===0?'<h1>'+esc(b.t)+'</h1>':'<h2>'+esc(b.t)+'</h2>')+'<p>'+esc(b.m)+'</p>'+(b.k?'<p class="kay">Kaynak: '+esc(b.k)+'</p>':'')+
   (b.son?'<div class="row"><a class="btn" href="index.html#dosyalar">Dosyalar</a><a class="btn" href="index.html#olaylar">Olaylar</a><a class="btn" href="index.html#yerlesimler">Yerleşimler</a><a class="btn" href="index.html#anitlar">Anıtlar</a><a class="btn" href="index.html#kutuphane">Kütüphane</a><a class="btn" href="index.html#kaynaklar">Yöntem</a></div>':'')+
   (i<B.length-1?'<button type="button" class="ileri" data-i="'+(i+1)+'">'+(i===0?'Başla':'Sonraki')+'</button>':'')+'</div>';
  bol.appendChild(s);
  const li=document.createElement('li'),bt=document.createElement('button');bt.type='button';bt.textContent=i===0?'·':String(i);bt.title=b.t;bt.setAttribute('aria-label',b.t);bt.onclick=()=>s.scrollIntoView({behavior:'smooth'});li.appendChild(bt);ray.appendChild(li);});
bol.querySelectorAll('.ileri').forEach(b=>b.onclick=()=>bol.children[+b.dataset.i].scrollIntoView({behavior:'smooth'}));

/* ---------- harita ---------- */
const map=new maplibregl.Map({container:'hmap',style:{version:8,glyphs:'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',sources:{},layers:[{id:'zemin',type:'background',paint:{'background-color':'#000'}}]},
  center:B[0].cam.center,zoom:B[0].cam.zoom-(mob()?.9:0),pitch:B[0].cam.pitch,bearing:B[0].cam.bearing,maxPitch:78,minZoom:7,maxZoom:17,attributionControl:{compact:true},interactive:true});
const HAND=['scrollZoom','boxZoom','dragRotate','dragPan','keyboard','doubleClickZoom','touchZoomRotate','touchPitch'];
const serbest=on=>{HAND.forEach(h=>map[h]&&(on?map[h].enable():map[h].disable()));document.body.classList.toggle('serbest',on);$('serbest').textContent=on?'Anlatıya dön':'Serbest gez';$('serbest').setAttribute('aria-pressed',on);if(on)map.stop();else go(cur,true);};
HAND.forEach(h=>map[h]&&map[h].disable());
await new Promise(r=>map.on('load',r));
const [GOL,SUY,KOY,ANIT,ARK,YY]=await Promise.all(['gol','suyollari','yerlesimler','anitlar','arkeoloji','yeni_yerlesimler'].map(f=>J('data/'+f+'.geojson')));
const pts=fc=>({type:'FeatureCollection',features:(fc?fc.features:[]).filter(f=>f.geometry)});

/* arazi */
let arazi=false;
try{map.addSource('dem',{type:'raster-dem',tiles:[DEM],encoding:'terrarium',tileSize:256,maxzoom:13,attribution:'Arazi: Mapzen Terrain Tiles (SRTM ve diğerleri), AWS Open Data'});
  map.addSource('dem2',{type:'raster-dem',tiles:[DEM],encoding:'terrarium',tileSize:256,maxzoom:13});
  map.setTerrain({source:'dem',exaggeration:1.5});arazi=true;
  if(map.setSky)map.setSky({'sky-color':'#07030f','horizon-color':'#2a1640','fog-color':'#0b0613','fog-ground-blend':.55,'horizon-fog-blend':.6,'sky-horizon-blend':.9,'atmosphere-blend':.5});
}catch(e){console.warn('arazi yok',e);}
if(arazi)map.addLayer({id:'golge',type:'hillshade',source:'dem2',paint:{'hillshade-exaggeration':.32,'hillshade-shadow-color':'#000','hillshade-highlight-color':'#fff','hillshade-accent-color':'#000'}});
else map.addLayer({id:'golge',type:'background',paint:{'background-color':'#000','background-opacity':0}});

/* su modeli tuvali */
const Z=11,N=2**Z,X0=1255,X1=1263,Y0=789,Y1=793,W=(X1-X0+1)*256,H=(Y1-Y0+1)*256;
const lonX=x=>x/N*360-180,latY=y=>Math.atan(Math.sinh(Math.PI*(1-2*y/N)))*180/Math.PI;
const px=lon=>((lon+180)/360*N-X0)*256,py=lat=>((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*N-Y0)*256;
const suc=document.createElement('canvas');suc.width=W;suc.height=H;const sux=suc.getContext('2d');
map.addSource('su',{type:'canvas',canvas:suc,animate:false,coordinates:[[lonX(X0),latY(Y0)],[lonX(X1+1),latY(Y0)],[lonX(X1+1),latY(Y1+1)],[lonX(X0),latY(Y1+1)]]});
map.addLayer({id:'su',type:'raster',source:'su',paint:{'raster-opacity':.92,'raster-fade-duration':0}});

/* vektör katmanlar */
const lab=(id,source,filter,color,minzoom,size)=>({id,type:'symbol',source,filter,minzoom:minzoom||0,layout:{'text-field':['get','ad'],'text-font':FONT,'text-size':size||11.5,'text-offset':[0.8,0],'text-anchor':'left','text-optional':true,'text-max-width':9},paint:{'text-color':color,'text-halo-color':'#000','text-halo-width':1.6}});
map.addSource('gol',{type:'geojson',data:GOL});map.addSource('suy',{type:'geojson',data:SUY});map.addSource('koy',{type:'geojson',data:KOY});map.addSource('anit',{type:'geojson',data:pts(ANIT)});
map.addSource('kazi',{type:'geojson',data:pts(ARK)});map.addSource('yy',{type:'geojson',data:pts(YY)});
map.addSource('baraj',{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{ad:'Ilısu Barajı'},geometry:{type:'Point',coordinates:[41.8497,37.5290]}}]}});
const ALL=true;
const L={
 gol:[{id:'gol',type:'line',source:'gol',paint:{'line-color':CYAN,'line-width':1.8}}],
 nehir:[{id:'nehir',type:'line',source:'suy',filter:['==',['get','sinif'],'river'],paint:{'line-color':CYAN,'line-width':['case',['==',['get','ad'],'Dicle Nehri'],3,1.6],'line-opacity':.9}}],
 kiyi:[{id:'kiyi',type:'circle',source:'koy',filter:['==',['get','gol_iliskisi'],'kiyi_1km'],paint:{'circle-radius':3.5,'circle-color':'#fff','circle-stroke-color':'#000','circle-stroke-width':1.2}}],
 koy:[{id:'koy',type:'circle',source:'koy',filter:['==',['get','gol_iliskisi'],'gol_icinde'],paint:{'circle-radius':['interpolate',['linear'],['zoom'],8,3.5,13,6.5],'circle-color':PINK,'circle-stroke-color':PURPLE,'circle-stroke-width':1.8}},
      lab('koy-lab','koy',['==',['get','gol_iliskisi'],'gol_icinde'],'#fff',10.4)],
 'anit-hat':[{id:'anit-hat',type:'line',source:'anit',filter:['==',['get','tur'],'hat'],paint:{'line-color':PINK,'line-width':2.2,'line-dasharray':[1.5,1.2]}}],
 'anit-yer':[{id:'anit-yer',type:'circle',source:'anit',filter:['==',['get','tur'],'yerinde'],paint:{'circle-radius':4,'circle-color':['case',['get','gol'],RED,'#111'],'circle-stroke-color':'#fff','circle-stroke-width':1.2}}],
 'anit-eski':[{id:'anit-eski',type:'circle',source:'anit',filter:['==',['get','tur'],'eski'],paint:{'circle-radius':7,'circle-color':RED,'circle-stroke-color':'#fff','circle-stroke-width':2}},lab('anit-eski-lab','anit',['==',['get','tur'],'eski'],'#fff',12.5)],
 'anit-yeni':[{id:'anit-yeni',type:'circle',source:'anit',filter:['==',['get','tur'],'yeni'],paint:{'circle-radius':7,'circle-color':'#fff','circle-stroke-color':'#000','circle-stroke-width':2}},lab('anit-yeni-lab','anit',['==',['get','tur'],'yeni'],'#fff',13.2)],
 kazi:[{id:'kazi',type:'circle',source:'kazi',paint:{'circle-radius':6,'circle-color':ORANGE,'circle-stroke-color':'#000','circle-stroke-width':1.8}},lab('kazi-lab','kazi',['all'],ORANGE,10.4,11)],
 yy:[{id:'yy',type:'circle',source:'yy',paint:{'circle-radius':8,'circle-color':CYAN,'circle-stroke-color':'#000','circle-stroke-width':2}},lab('yy-lab','yy',['all'],CYAN,9,12.5)],
 baraj:[{id:'baraj',type:'circle',source:'baraj',paint:{'circle-radius':8,'circle-color':'#fff','circle-stroke-color':RED,'circle-stroke-width':3}},lab('baraj-lab','baraj',['all'],'#fff',8,13)]
};
Object.values(L).flat().forEach(l=>{l.layout=Object.assign({},l.layout,{visibility:'none'});map.addLayer(l);});
const katman=list=>Object.entries(L).forEach(([k,ls])=>ls.forEach(l=>map.setLayoutProperty(l.id,'visibility',list.includes(k)?'visible':'none')));

/* görüntü geçişi */
let imN=0,imCur=null;
function setIm(k){if(k===imCur||!IMG[k])return;imCur=k;const im=IMG[k],id='uydu'+(++imN),old='uydu'+(imN-1);
  map.addSource(id,{type:'raster',tiles:im.tiles,tileSize:256,maxzoom:im.max,attribution:im.att});
  map.addLayer({id,type:'raster',source:id,paint:{'raster-opacity':0,'raster-opacity-transition':{duration:900,delay:0}}},'golge');
  setTimeout(()=>map.getLayer(id)&&map.setPaintProperty(id,'raster-opacity',1),60);
  setTimeout(()=>{if(map.getLayer(old)){map.removeLayer(old);map.removeSource(old);}},1700);$('gor').textContent=im.ad;}

/* ---------- su modeli ---------- */
const M={hazir:false};
async function model(){
  const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});const jobs=[];
  for(let ty=Y0;ty<=Y1;ty++)for(let tx=X0;tx<=X1;tx++)jobs.push(new Promise(res=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{x.drawImage(im,(tx-X0)*256,(ty-Y0)*256);res(1);};im.onerror=()=>res(0);im.src=DEM.replace('{z}',Z).replace('{x}',tx).replace('{y}',ty);}));
  const ok=(await Promise.all(jobs)).reduce((a,b)=>a+b,0);if(ok<jobs.length*.9)throw new Error('arazi karoları yüklenemedi');
  const d=x.getImageData(0,0,W,H).data;
  const mc=document.createElement('canvas');mc.width=W;mc.height=H;const mx=mc.getContext('2d',{willReadFrequently:true});mx.beginPath();
  for(const f of GOL.features){const g=f.geometry,polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;for(const p of polys)for(const r of p){r.forEach((q,i)=>{const X=px(q[0]),Y=py(q[1]);i?mx.lineTo(X,Y):mx.moveTo(X,Y);});mx.closePath();}}
  mx.fill('evenodd');const md=mx.getImageData(0,0,W,H).data;
  const el=i=>d[4*i]*256+d[4*i+1]+d[4*i+2]/256-32768;
  const ii=[],ev=[];for(let i=0;i<W*H;i++)if(md[4*i+3]>127){ii.push(i);ev.push(el(i));}
  const ord=ev.map((e,k)=>k).sort((a,b)=>ev[a]-ev[b]),n=ord.length;
  M.idx=new Int32Array(n);M.el=new Float32Array(n);M.cA=new Float64Array(n+1);M.cEA=new Float64Array(n+1);
  const rowA=new Float64Array(H);for(let y=0;y<H;y++){const r=40075.017*Math.cos(latY(Y0+(y+.5)/256)*Math.PI/180)/(N*256);rowA[y]=r*r;}
  for(let k=0;k<n;k++){const i=ii[ord[k]],e=ev[ord[k]],a=rowA[(i/W)|0];M.idx[k]=i;M.el[k]=e;M.cA[k+1]=M.cA[k]+a;M.cEA[k+1]=M.cEA[k]+a*e;}
  M.n=n;M.min=Math.ceil(M.el[Math.min(n-1,Math.floor(n*.002))]);M.poligon=M.cA[n];
  M.img=sux.createImageData(W,H);M.prev=0;
  const ke=KOY.features.filter(f=>f.properties.gol_iliskisi==='gol_icinde').map(f=>{const X=Math.floor(px(f.geometry.coordinates[0])),Y=Math.floor(py(f.geometry.coordinates[1]));return (X>=0&&Y>=0&&X<W&&Y<H)?el(Y*W+X):9999;}).sort((a,b)=>a-b);
  M.koy=ke;M.koyN=ke.length;M.hazir=true;
  /* eğri */
  const P=[];for(let v=M.min;v<=525;v+=1){const s=olc(v);P.push([v,s.alan]);}M.egri=P;const mxA=P[P.length-1][1]||1;
  $('h-yol').setAttribute('points',P.map(p=>(4+(p[0]-M.min)/(525-M.min)*212).toFixed(1)+','+(52-p[1]/mxA*46).toFixed(1)).join(' '));
  const r=$('h-r');r.min=M.min;r.max=525;r.step=.5;r.value=M.min;$('h-min').textContent=M.min+' m';
  const s5=olc(525);$('h-not').textContent='Model 525 metrede '+fmt(s5.alan,0)+' km² su yüzeyi ve '+fmt(s5.hacim,1)+' milyar m³ hacim veriyor. Resmî rakamlar 313 km² ve 10,41 milyar m³. Arazi yaklaşık 60 metrelik karelerle okunur, model tarihi değil kotu gösterir.';
  window.__hikaye=Object.assign(window.__hikaye||{},{M,olc});
}
const ub=(arr,v,n)=>{let lo=0,hi=n;while(lo<hi){const m=(lo+hi)>>1;arr[m]<=v?lo=m+1:hi=m;}return lo;};
function olc(v){const k=ub(M.el,v,M.n);return {k,alan:M.cA[k],hacim:(v*M.cA[k]-M.cEA[k])/1000,koy:ub(M.koy,v,M.koyN)};}
let suT=null;
function ciz(v){if(!M.hazir)return;const s=olc(v),D=M.img.data;
  for(let k=0;k<M.prev;k++)D[4*M.idx[k]+3]=0;
  for(let k=0;k<s.k;k++){const i=4*M.idx[k],t=Math.min(1,(v-M.el[k])/70);D[i]=93-83*t;D[i+1]=240-190*t;D[i+2]=230-80*t;D[i+3]=150+95*t;}
  M.prev=s.k;sux.putImageData(M.img,0,0);const src=map.getSource('su');if(src&&src.play){src.play();clearTimeout(suT);suT=setTimeout(()=>src.pause(),350);}
  $('h-kot').textContent=fmt(v,0);$('h-alan').textContent=fmt(s.alan,0);$('h-hacim').textContent=fmt(s.hacim,1);$('h-koy').textContent=s.koy+' / '+M.koyN;$('h-r').value=v;
  const mxA=M.egri[M.egri.length-1][1]||1;$('h-nok').setAttribute('cx',(4+(v-M.min)/(525-M.min)*212).toFixed(1));$('h-nok').setAttribute('cy',(52-s.alan/mxA*46).toFixed(1));M.v=v;}
let anim=0;
function yuksel(from,to,ms){const id=++anim,t0=performance.now();let last=0;const f=now=>{if(id!==anim)return;const t=Math.min(1,(now-t0)/ms),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;if(now-last>45||t===1){ciz(from+(to-from)*e);last=now;}if(t<1)requestAnimationFrame(f);};requestAnimationFrame(f);}
function suAyar(su){anim++;const hud=$('hud');
  if(su==null){hud.hidden=true;map.setLayoutProperty('su','visibility','none');return;}
  map.setLayoutProperty('su','visibility','visible');
  if(!M.hazir){hud.hidden=true;return;}
  if(typeof su==='number'){hud.hidden=su===0;if(su===0){map.setLayoutProperty('su','visibility','none');}else ciz(su);return;}
  hud.hidden=false;yuksel(su.from==='min'?M.min:su.from,su.to,su.ms);}
$('h-r').oninput=e=>{anim++;ciz(+e.target.value);};
$('h-oy').onclick=()=>yuksel(M.min,525,14000);

let cur=-1,dongu=null,surukle=null;
function go(i,zorla){if(i===cur&&!zorla)return;cur=i;const b=B[i];
  [...ray.children].forEach((li,k)=>li.firstChild.setAttribute('aria-current',k===i));[...bol.children].forEach((s,k)=>s.classList.toggle('etkin',k===i));
  clearInterval(dongu);dongu=null;clearTimeout(surukle);
  if(document.body.classList.contains('serbest'))return;
  const c=Object.assign({},b.cam);if(mob())c.zoom-=.9;
  map.flyTo(Object.assign({duration:zorla?1200:4200,essential:true,curve:1.25},c));
  setIm(b.im);katman(b.kat);suAyar(b.su);
  if(b.dongu){let k=0;dongu=setInterval(()=>{k=(k+1)%b.dongu.length;setIm(b.dongu[k]);},2400);}
  /* kamera yavaşça döner: üçüncü boyutu görünür kılar */
  surukle=setTimeout(()=>{if(cur===i&&!document.body.classList.contains('serbest'))map.easeTo({bearing:c.bearing+(i%2?18:-18),duration:60000,easing:t=>t});},5200);
  if(qs.get('kamera'))$('kam').hidden=false;}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)go(+e.target.dataset.i);}),{threshold:.55});
[...bol.children].forEach(s=>io.observe(s));
$('serbest').onclick=()=>serbest(!document.body.classList.contains('serbest'));
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();bol.children[Math.min(B.length-1,cur+1)].scrollIntoView({behavior:'smooth'});}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();bol.children[Math.max(0,cur-1)].scrollIntoView({behavior:'smooth'});}});
if(qs.get('kamera')){$('kam').hidden=false;map.on('move',()=>{const c=map.getCenter();$('kam').textContent='center:['+c.lng.toFixed(4)+','+c.lat.toFixed(4)+'],zoom:'+map.getZoom().toFixed(1)+',pitch:'+Math.round(map.getPitch())+',bearing:'+Math.round(map.getBearing());});}
setIm(B[0].im);katman(B[0].kat);go(0,true);
window.__hikaye=Object.assign(window.__hikaye||{},{map,B,go,M});
model().then(()=>{if(cur>=0)suAyar(B[cur].su);}).catch(e=>{console.warn('su modeli',e);$('hud').hidden=true;});
})().catch(e=>console.error('hikaye',e));

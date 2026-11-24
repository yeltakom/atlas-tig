/* Dicle Vadisi Atlası: üç boyutlu anlatı. Tek harita, arazi kabartması, bölüm bölüm kamera, su kotu modeli.
   Su modeli tarayıcıda hesaplanır: dolum öncesi arazi yüksekliği karoları (Mapzen Terrain, SRTM) göl sınırı poligonuyla maskelenir. */
(async function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const qs=new URLSearchParams(location.search);
const DEM=qs.get('dem')||'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const PINK='#ffffff',CYAN='#ffffff',PURPLE='#000000',ORANGE='#ffffff',RED='#ffffff';
function ikon(m){const mk=(ad,fn)=>{const s=32,c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');fn(x,s);const d=x.getImageData(0,0,s,s);if(!m.hasImage(ad))m.addImage(ad,{width:s,height:s,data:new Uint8Array(d.data.buffer)},{pixelRatio:2});};
 const cz=(x,yol,dolgu,cizgi,w)=>{x.beginPath();yol();x.closePath();if(dolgu){x.fillStyle=dolgu;x.fill();}x.lineWidth=w||3;x.strokeStyle=cizgi;x.stroke();};
 mk('ucgen',(x,s)=>cz(x,()=>{x.moveTo(s/2,4);x.lineTo(s-4,s-5);x.lineTo(4,s-5);},'#fff','#000'));
 mk('kare',(x,s)=>cz(x,()=>{x.rect(6,6,s-12,s-12);},'#fff','#000'));
 mk('kare-bos',(x,s)=>{cz(x,()=>{x.rect(6,6,s-12,s-12);},null,'#000',8);cz(x,()=>{x.rect(6,6,s-12,s-12);},null,'#fff',4);});
 mk('elmas',(x,s)=>{const p=()=>{x.moveTo(s/2,4);x.lineTo(s-4,s/2);x.lineTo(s/2,s-4);x.lineTo(4,s/2);};cz(x,p,null,'#000',8);cz(x,p,null,'#fff',4);});
 mk('carpi',(x,s)=>{const l=(w,c)=>{x.beginPath();x.moveTo(7,7);x.lineTo(s-7,s-7);x.moveTo(s-7,7);x.lineTo(7,s-7);x.lineWidth=w;x.strokeStyle=c;x.stroke();};l(10,'#000');l(5,'#fff');});}
const ik=(id,source,filter,img,size,gizli)=>({id,type:'symbol',source,filter:filter||['all'],layout:Object.assign({'icon-image':img,'icon-size':size||1,'icon-allow-overlap':true,'icon-ignore-placement':true},gizli?{visibility:'none'}:{})});
const FONT=['Open Sans Bold'];
const mob=()=>window.innerWidth<=860;
const fmt=(v,d)=>v.toFixed(d);
const J=u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null);

/* ---------- görüntüler ---------- */
const EOX=y=>({ad:y+' · Sentinel-2 annual mosaic',max:14,tiles:['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-'+y+'_3857/default/g/{z}/{y}/{x}.jpg'],att:'Sentinel-2 cloudless, EOX IT Services GmbH (Copernicus Sentinel data '+y+')'});
const WB=(n,t)=>({ad:'High resolution · archive release '+t,max:17,tiles:['https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+n+'/{z}/{y}/{x}'],att:'Esri World Imagery Wayback, release '+t});
const IMG={s2018:EOX(2018),s2019:EOX(2019),s2020:EOX(2020),s2021:EOX(2021),s2022:EOX(2022),s2024:EOX(2024),w2014:WB(10,'20 February 2014'),w2018:WB(13045,'18 January 2018'),w2019:WB(12576,'5 June 2019'),w2021:WB(1049,'13 January 2021'),w2024:WB(41468,'18 January 2024')};

/* ---------- bölümler: kamera, görüntü, katman, su ---------- */
const B=[
 {t:'Flooding a valley',e:'Tigris Valley Atlas · 3D narrative',m:'The Ilısu Dam began impounding water on 19 July 2019. This narrative shows the Tigris valley in three dimensions, with its terrain from before the dam, and follows step by step where the water reached. Scroll down.',k:'',
  cam:{center:[41.43,37.74],zoom:9.7,pitch:55,bearing:-18},im:'s2018',kat:['gol'],su:null},
 {t:'The valley',e:'01 · 2018, before the water',m:'The Tigris ran through a narrow valley from Bismil to Ilısu. The Batman River, the Garzan and the Botan joined it in this valley. By this atlas\'s calculation, 174 kilometres of the Tigris remain inside today\'s reservoir boundary, and 443 kilometres of river and stream including its tributaries.',k:'Reservoir boundary layer; OpenStreetMap, August 2022.',
  cam:{center:[41.22,37.795],zoom:10.9,pitch:62,bearing:82},im:'s2018',kat:['nehir'],su:null},
 {t:'Settlements',e:'02 · villages on the shore',m:'The white dots are the 73 settlement points that fall inside today\'s reservoir boundary. The black dots are those less than one kilometre from the shore. Published figures range from 69 to 199, because sources count hamlets and villages evacuated earlier differently.',k:'GeoNames; for published figures, the Analysis section of the atlas.',
  cam:{center:[41.62,37.80],zoom:10.7,pitch:58,bearing:-32},im:'s2018',kat:['gol','nehir','koy','kiyi'],su:null},
 {t:'Hasankeyf',e:'03 · the old town',m:'The castle rock and the lower town stood on the south bank of the river. The town was declared a protected site in two stages, in 1978 and 1981. The crosses mark the former locations of structures that were later moved or left in place.',k:'HYG 2019, p. 30; OpenStreetMap.',
  cam:{center:[41.4115,37.7128],zoom:14.7,pitch:66,bearing:172},im:'w2014',kat:['anit-eski','anit-yer'],su:null},
 {t:'The dam',e:'04 · 2006 to 2018',m:'The foundation was laid on 5 August 2006. Credit agencies from Germany, Austria and Switzerland withdrew on 7 July 2009, and construction continued with domestic financing. The body was completed in 2018. Its height is 135 metres and the normal water level is 525 metres.',k:'Özdemirkol 2023; Eberlein et al. 2010; Eroğlu 2022.',
  cam:{center:[41.8485,37.531],zoom:13.5,pitch:64,bearing:-38},im:'w2018',kat:['gol','baraj'],su:null},
 {t:'Relocation',e:'05 · 2017 to 2019',m:'The Zeynel Bey Tomb was moved on 12 May 2017. Other structures and parts of structures were then taken to Kültür Park, about two kilometres to the north-east. Dashed lines are relocation routes, the cross is the old location and the square the new one. The piers of the bridge were left in place. On 10 August 2017 the castle rocks were blasted and the caves were filled.',k:'Eroğlu 2022; HYG 2019, p. 17; Anadolu Ajansı.',
  cam:{center:[41.4175,37.7205],zoom:14.1,pitch:62,bearing:38},im:'w2019',kat:['anit-hat','anit-eski','anit-yeni'],su:null},
 {t:'The water rises',e:'06 · 19 July 2019',m:'The gates closed. The public was first told it was a test. This view is a model: based on the pre-filling terrain height of the valley, it shows in black which areas inside the reservoir boundary go under water as the water level rises. It follows the level, not the date. You can change the level yourself with the bar below.',k:'Terrain: Mapzen Terrain Tiles, SRTM. Reservoir boundary layer. The model is this atlas\'s own calculation.',
  cam:{center:[41.47,37.745],zoom:10.1,pitch:58,bearing:18},im:'s2018',kat:['gol','koy'],su:{from:'min',to:525,ms:16000}},
 {t:'The water reaches Hasankeyf',e:'07 · October 2019 to early 2020',m:'On 8 October 2019 the old town was placed under a security cordon. On 4 November the bazaar was demolished and the old Batman road, in use since 1955, was closed. The water reached the lower town in early 2020. In the model the river is at about 476 metres at this point and the water level is at 525 metres.',k:'soL Haber 2019; Hasankeyf Koordinasyonu 2019; NASA Earth Observatory 2020.',
  cam:{center:[41.412,37.7145],zoom:14.3,pitch:64,bearing:150},im:'w2014',kat:['gol','anit-eski','anit-yer'],su:{from:470,to:525,ms:12000}},
 {t:'From the satellite, year by year',e:'08 · 2018 to 2022',m:'The same valley in the annual mosaics of the Sentinel-2 satellite. The image advances by itself from 2018 to 2022. The 2019 mosaic consists mostly of pre-filling scenes. Because the image is draped over the pre-filling terrain, the water appears to climb the slopes.',k:'Sentinel-2 cloudless, EOX IT Services GmbH.',
  cam:{center:[41.50,37.76],zoom:10.3,pitch:50,bearing:-5},im:'s2018',kat:['gol'],su:0,dongu:['s2018','s2019','s2020','s2021','s2022']},
 {t:'What went under',e:'09 · today',m:'Inside the reservoir boundary there are 73 settlement points, 29 archaeological sites and rescue excavations named in the compiled publications, and 306 kilometres of road still drawn on the 2022 map. The triangles are archaeological sites. These numbers rest on calculation, not on a verified list.',k:'GeoNames; OpenStreetMap, August 2022; research report, 17.11.2026.',
  cam:{center:[41.72,37.76],zoom:10.9,pitch:60,bearing:-58},im:'s2022',kat:['gol','koy','kazi'],su:525},
 {t:'New Hasankeyf',e:'10 · resettlement',m:'The new town was built about two kilometres north of the old one. The number of dwellings varies between 698 and 875 depending on the source. Of 2,120 applications for entitlement, 710 were accepted and 1,415 were rejected. The relocated structures stand side by side in the park east of the town.',k:'HYG 2017; Hasankeyf Kaymakamlığı; Eroğlu 2022.',
  cam:{center:[41.4215,37.7325],zoom:14.2,pitch:60,bearing:-24},im:'w2024',kat:['gol','anit-yeni','yy'],su:0},
 {t:'Atlas',e:'Working version',m:'This narrative is a short route into the atlas. The full records, with their sources, open questions and method, are in the atlas: files, events, settlement cards, monuments, visual archive and library.',k:'',
  cam:{center:[41.45,37.75],zoom:9.6,pitch:45,bearing:10},im:'s2024',kat:['gol','koy'],su:0,son:true}
];

/* ---------- bölüm kartları ve gezinme ---------- */
const bol=$('bolumler'),ray=$('ray');
B.forEach((b,i)=>{const s=document.createElement('section');s.className='bl';s.dataset.i=i;
  s.innerHTML='<div class="bk'+(i===0?' kapak':'')+'"><p class="eyebrow">'+esc(b.e)+'</p>'+(i===0?'<h1>'+esc(b.t)+'</h1>':'<h2>'+esc(b.t)+'</h2>')+'<p>'+esc(b.m)+'</p>'+(b.k?'<p class="kay">Source: '+esc(b.k)+'</p>':'')+
   (b.son?'<div class="row"><a class="btn" href="index.html#dosyalar">Files</a><a class="btn" href="index.html#olaylar">Events</a><a class="btn" href="index.html#yerlesimler">Settlements</a><a class="btn" href="index.html#anitlar">Monuments</a><a class="btn" href="index.html#kutuphane">Library</a><a class="btn" href="index.html#kaynaklar">Method</a></div>':'')+
   (i<B.length-1?'<button type="button" class="ileri" data-i="'+(i+1)+'">'+(i===0?'Start':'Next')+'</button>':'')+'</div>';
  bol.appendChild(s);
  const li=document.createElement('li'),bt=document.createElement('button');bt.type='button';bt.textContent=i===0?'·':String(i);bt.title=b.t;bt.setAttribute('aria-label',b.t);bt.onclick=()=>s.scrollIntoView({behavior:'smooth'});li.appendChild(bt);ray.appendChild(li);});
bol.querySelectorAll('.ileri').forEach(b=>b.onclick=()=>bol.children[+b.dataset.i].scrollIntoView({behavior:'smooth'}));

/* ---------- harita ---------- */
const map=new maplibregl.Map({container:'hmap',style:{version:8,glyphs:'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',sources:{},layers:[{id:'zemin',type:'background',paint:{'background-color':'#000'}}]},
  center:B[0].cam.center,zoom:B[0].cam.zoom-(mob()?.9:0),pitch:B[0].cam.pitch,bearing:B[0].cam.bearing,maxPitch:78,minZoom:7,maxZoom:17,attributionControl:{compact:true},interactive:true});
const HAND=['scrollZoom','boxZoom','dragRotate','dragPan','keyboard','doubleClickZoom','touchZoomRotate','touchPitch'];
const serbest=on=>{HAND.forEach(h=>map[h]&&(on?map[h].enable():map[h].disable()));document.body.classList.toggle('serbest',on);$('serbest').textContent=on?'Back to the narrative':'Explore freely';$('serbest').setAttribute('aria-pressed',on);if(on)map.stop();else go(cur,true);};
HAND.forEach(h=>map[h]&&map[h].disable());
await new Promise(r=>map.on('load',r));ikon(map);
const [GOL,SUY,KOY,ANIT,ARK,YY]=await Promise.all(['gol','suyollari','yerlesimler','anitlar','arkeoloji','yeni_yerlesimler'].map(f=>J('data/'+f+'.geojson')));
const pts=fc=>({type:'FeatureCollection',features:(fc?fc.features:[]).filter(f=>f.geometry)});

/* arazi */
let arazi=false;
try{map.addSource('dem',{type:'raster-dem',tiles:[DEM],encoding:'terrarium',tileSize:256,maxzoom:13,attribution:'Terrain: Mapzen Terrain Tiles (SRTM and others), AWS Open Data'});
  map.addSource('dem2',{type:'raster-dem',tiles:[DEM],encoding:'terrarium',tileSize:256,maxzoom:13});
  map.setTerrain({source:'dem',exaggeration:1.5});arazi=true;
  if(map.setSky)map.setSky({'sky-color':'#000000','horizon-color':'#3a3a3a','fog-color':'#0d0d0d','fog-ground-blend':.55,'horizon-fog-blend':.6,'sky-horizon-blend':.9,'atmosphere-blend':.5});
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
map.addSource('baraj',{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{ad:'Ilısu Dam'},geometry:{type:'Point',coordinates:[41.8497,37.5290]}}]}});
const ALL=true;
const L={
 gol:[{id:'gol',type:'line',source:'gol',paint:{'line-color':CYAN,'line-width':1.8}}],
 nehir:[{id:'nehir',type:'line',source:'suy',filter:['==',['get','sinif'],'river'],paint:{'line-color':CYAN,'line-width':['case',['==',['get','ad'],'Dicle Nehri'],3,1.6],'line-opacity':.9}}],
 kiyi:[{id:'kiyi',type:'circle',source:'koy',filter:['==',['get','gol_iliskisi'],'kiyi_1km'],paint:{'circle-radius':3.5,'circle-color':'#000','circle-stroke-color':'#fff','circle-stroke-width':1.3}}],
 koy:[{id:'koy',type:'circle',source:'koy',filter:['==',['get','gol_iliskisi'],'gol_icinde'],paint:{'circle-radius':['interpolate',['linear'],['zoom'],8,3.5,13,6.5],'circle-color':PINK,'circle-stroke-color':PURPLE,'circle-stroke-width':1.8}},
      lab('koy-lab','koy',['==',['get','gol_iliskisi'],'gol_icinde'],'#fff',10.4)],
 'anit-hat':[{id:'anit-hat',type:'line',source:'anit',filter:['==',['get','tur'],'hat'],paint:{'line-color':PINK,'line-width':2.2,'line-dasharray':[1.5,1.2]}}],
 'anit-yer':[{id:'anit-yer',type:'circle',source:'anit',filter:['==',['get','tur'],'yerinde'],paint:{'circle-radius':4,'circle-color':['case',['get','gol'],RED,'#111'],'circle-stroke-color':'#fff','circle-stroke-width':1.2}}],
 'anit-eski':[ik('anit-eski','anit',['==',['get','tur'],'eski'],'carpi',1.15),lab('anit-eski-lab','anit',['==',['get','tur'],'eski'],'#fff',12.5)],
 'anit-yeni':[ik('anit-yeni','anit',['==',['get','tur'],'yeni'],'kare',1.05),lab('anit-yeni-lab','anit',['==',['get','tur'],'yeni'],'#fff',13.2)],
 kazi:[ik('kazi','kazi',null,'ucgen',1),lab('kazi-lab','kazi',['all'],ORANGE,10.4,11)],
 yy:[ik('yy','yy',null,'kare-bos',1.25),lab('yy-lab','yy',['all'],CYAN,9,12.5)],
 baraj:[{id:'baraj',type:'circle',source:'baraj',paint:{'circle-radius':7,'circle-color':'#000','circle-stroke-color':'#fff','circle-stroke-width':3}},lab('baraj-lab','baraj',['all'],'#fff',8,13)]
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
  const s5=olc(525);$('h-not').textContent='At 525 metres the model gives a water surface of '+fmt(s5.alan,0)+' km² and a volume of '+fmt(s5.hacim,1)+' billion m³. The official figures are 313 km² and 10.41 billion m³. The terrain is read from cells of about 60 metres, and the model shows the level, not the date.';
  window.__hikaye=Object.assign(window.__hikaye||{},{M,olc});
}
const ub=(arr,v,n)=>{let lo=0,hi=n;while(lo<hi){const m=(lo+hi)>>1;arr[m]<=v?lo=m+1:hi=m;}return lo;};
function olc(v){const k=ub(M.el,v,M.n);return {k,alan:M.cA[k],hacim:(v*M.cA[k]-M.cEA[k])/1000,koy:ub(M.koy,v,M.koyN)};}
let suT=null;
function ciz(v){if(!M.hazir)return;const s=olc(v),D=M.img.data;
  for(let k=0;k<M.prev;k++)D[4*M.idx[k]+3]=0;
  for(let k=0;k<s.k;k++){const i=4*M.idx[k],t=Math.min(1,(v-M.el[k])/70);D[i]=0;D[i+1]=0;D[i+2]=0;D[i+3]=120+125*t;}
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

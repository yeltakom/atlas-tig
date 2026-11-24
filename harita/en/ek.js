/* Dicle Vadisi Atlası 0.3 ek modülü: araştırma raporundan gelen veriler, yerleşim kaydı, kütüphane,
   gün gün dolum, su yüzeyi katmanları, görünümü kaydetme. platform.js'ten sonra yüklenir. Her veri dosyası isteğe bağlıdır. */
(async function(){
const T=window.__atlas; await T.platformReady;
const {A,B,$,esc,bars,imById,fitAll,FONT,PINK,CYAN,PURPLE,RED,showCard,dl,setSel,setIm,toMap,mob,addGroup,mapReady,addDos,cur,REL,altNames,turnOn,setImagery,KAM,trh}=T;
const ORANGE='#ffffff';
const ik=(id,source,filter,img,size,gizli)=>({id,type:'symbol',source,filter:filter||['all'],layout:Object.assign({'icon-image':img,'icon-size':size||1,'icon-allow-overlap':true,'icon-ignore-placement':true},gizli?{visibility:'none'}:{})});
const J=u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null);
const FILES=['arkeoloji.geojson','yeni_yerlesimler.geojson','barajlar.geojson','anit_ek.json','belgeler.json','sayilar.json','koy_adlari.json','baraj_kunye.json','listeler.json','goruntu_kaynaklari.json','tarihi_haritalar.json','foto_arsivleri.json','benzer_projeler.json','wikidata_yerlesim.json','wayback_cekim.json','saha_isaretleri.geojson'];
const [ARK,YY,BRJ,AEK,BLG,SAYI,KAD,KUN,LST,GOR,THR,FOT,BNZ,WD,WBC,SAHA]=await Promise.all(FILES.map(f=>J('data/'+f)));
const nrm=s=>String(s||'').replace(/ı/g,'i').replace(/İ/g,'i').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
const link=(u,t)=>u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(t||'Go to source')+'</a>':'';
const src=(k,u)=>esc(k||'')+(u?(k?' · ':'')+link(u,'link'):'');
const pts=fc=>({type:'FeatureCollection',features:(fc?fc.features:[]).filter(f=>f.geometry)});
const not=t=>t?'<p class="not">'+esc(t)+'</p>':'';
const sayi=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');

/* ---------- harita katmanları ---------- */
const DUR={su_altinda:'Under water',kismen:'Partly under water',disarida:'Outside the reservoir boundary',bilinmiyor:'Status unknown'};
const BD={isletmede:'In operation',insaat:'Under construction',planlanan:'Planned'};
const KONUM={rapor:'Coordinates given in the source',yaklasik:'Approximate location, no coordinates in the source'};
function kaziCard(p,c){showCard({head:'<div><p class="eyebrow">Archaeological site · rescue excavation</p><h3>'+esc(p.ad)+'</h3></div>',
  body:dl([['Other name',esc(p.diger_ad)],['Status',DUR[p.durum]||''],['Period',esc(p.donem)],['Excavation',esc(p.kazi_yillari)],['Institution',esc(p.kurum)],['Location',c?(KONUM[p.konum_guven]||''):'Not marked on the map'],['Source',src(p.kaynak,p.url)]])+not(p.not)});setSel(c||null);}
function yyCard(p,c){showCard({head:'<div><p class="eyebrow">New settlement</p><h3>'+esc(p.ad)+'</h3></div>',
  body:dl([['Old place',esc(p.eski_yer)],['Province, district',[p.il,p.ilce].filter(Boolean).map(esc).join(', ')],['Dwellings',p.konut_sayisi?esc(p.konut_sayisi):''],['Year',esc(p.yil)],['Built by',esc(p.yapan)],['Location',c?(KONUM[p.konum_guven]||''):'Not marked on the map'],['Source',src(p.kaynak,p.url)]])+not(p.sorunlar)});setSel(c||null);}
function brjCard(p,c){showCard({head:'<div><p class="eyebrow">Dam · '+esc(p.nehir||'')+'</p><h3>'+esc(p.ad)+'</h3></div>',
  body:dl([['Status',BD[p.durum]||esc(p.durum)],['Year',p.yil?esc(p.yil):''],['Installed capacity',p.guc_mw?esc(p.guc_mw)+' MW':''],['Location',c?(KONUM[p.konum_guven]||''):'Not marked on the map'],['Source',src(p.kaynak,p.url)]])+not(p.not)});setSel(c||null);}
const lab=(id,source,color,minzoom)=>({id,type:'symbol',source,minzoom,layout:{'text-field':['get','ad'],'text-font':FONT,'text-size':11,'text-offset':[0.9,0],'text-anchor':'left','text-optional':true},paint:{'text-color':color,'text-halo-color':'#000','text-halo-width':1.6}});
const JRC='https://storage.googleapis.com/global-surface-water/tiles2021/';
mapReady.then(()=>{[A,B].forEach(m=>{
  const before=m.getLayer('yolbag')?'yolbag':undefined;
  [['jrc-t','transitions'],['jrc-o','occurrence']].forEach(([id,k])=>{m.addSource(id,{type:'raster',tiles:[JRC+k+'/{z}/{x}/{y}.png'],tileSize:256,maxzoom:13,attribution:'Source: EC JRC/Google'});m.addLayer({id,type:'raster',source:id,layout:{visibility:'none'},paint:{'raster-opacity':.9}},before);});
  const hit=(id,fn)=>{m.on('click',id,e=>{const f=e.features[0];fn(f.properties,f.geometry.coordinates.slice());});m.on('mouseenter',id,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',id,()=>m.getCanvas().style.cursor='');};
  if(ARK){m.addSource('kazi',{type:'geojson',data:pts(ARK)});m.addLayer(ik('kazi','kazi',null,'ucgen',1));m.addLayer(lab('kazi-lab','kazi',ORANGE,9.6));hit('kazi',kaziCard);}
  if(YY){m.addSource('yy',{type:'geojson',data:pts(YY)});m.addLayer(ik('yy','yy',null,'kare-bos',1.15));m.addLayer(lab('yy-lab','yy',CYAN,9));hit('yy',yyCard);}
  if(BRJ){m.addSource('brj',{type:'geojson',data:pts(BRJ)});m.addLayer({id:'brj',type:'circle',source:'brj',layout:{visibility:'none'},paint:{'circle-radius':7,'circle-color':'#000','circle-stroke-color':'#fff','circle-stroke-width':3}});m.addLayer(Object.assign(lab('brj-lab','brj','#fff',7),{layout:Object.assign(lab('x','brj','#fff',7).layout,{visibility:'none'})}));hit('brj',brjCard);}
  if(SAHA){m.addSource('saha',{type:'geojson',data:SAHA});m.addLayer(ik('saha','saha',null,'kare',.7,true));m.addLayer(Object.assign(lab('saha-lab','saha','#fff',11),{layout:Object.assign(lab('x','saha','#fff',11).layout,{visibility:'none'})}));
    hit('saha',(p,c)=>{showCard({head:'<div><p class="eyebrow">Field marker, local copy only</p><h3>'+esc(p.ad)+'</h3></div>',body:dl([['Location',p.konum==='gol_icinde'?'Inside the reservoir boundary':'Outside the reservoir boundary']])});setSel(c);});}
});});
if(SAHA)addGroup({id:'g-saha',ad:'Field markers',alt:'The researcher\'s own markers, not published',renk:'#fff',layers:['saha','saha-lab'],on:false});
if(BRJ)addGroup({id:'g-brj',ad:'Upper Tigris dams',alt:pts(BRJ).features.length+' dam locations marked, '+BRJ.features.length+' records',renk:'#fff',layers:['brj','brj-lab'],on:false});
if(YY)addGroup({id:'g-yy',ad:'New settlements',alt:'Settlements built for displaced people',renk:CYAN,layers:['yy','yy-lab'],on:true});
if(ARK)addGroup({id:'g-kazi',ad:'Rescue excavations and archaeological sites',alt:pts(ARK).features.length+' site locations marked, '+ARK.features.length+' records',renk:ORANGE,layers:['kazi','kazi-lab'],on:true});
addGroup({id:'g-jrco',ad:'Thematic: water occurrence, 1984 to 2021',alt:'Dark blue is always water, light blue is occasional water. Source: EC JRC/Google',renk:'#8a8a8a',layers:['jrc-o'],on:false});
addGroup({id:'g-jrct',ad:'Thematic: surface water transitions, 1984 to 2021',alt:'Green is new permanent water, that is, the reservoir. Blue is long-standing permanent water, that is, the river. Source: EC JRC/Google',renk:'#8a8a8a',layers:['jrc-t'],on:false});

/* ---------- yerleşim kaydı ---------- */
const KADm={};(KAD||[]).forEach(k=>{const n=nrm(k.resmi_ad);(KADm[n]=KADm[n]||[]).push(k);});
const KAMs=new Set((KAM?KAM.features:[]).map(f=>nrm(f.properties.ad)));
const tile=(lon,lat,z)=>{const n=2**z,xf=(lon+180)/360*n,yf=(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n;return {x:Math.floor(xf),y:Math.floor(yf),px:(xf%1)*100,py:(yf%1)*100};};
const chip=(url,cap,t)=>'<figure><img loading="lazy" src="'+url+'" alt="" onerror="this.style.opacity=.15"><figcaption>'+cap+'</figcaption><u style="left:'+t.px.toFixed(1)+'%;top:'+t.py.toFixed(1)+'%"></u></figure>';
function koyCard(p,c,haritadan){const w=WD&&WD.k[p.id],al=altNames(p),ka=KADm[nrm(p.ad)]||[];
  const eski=ka.flatMap(k=>k.eski_adlar.map(e=>esc(e.ad)+(e.dil&&e.dil!=='belirtilmemiş'?' ('+esc(e.dil)+')':'')));
  const pop=w?w.pop:[];let ph='';
  if(pop.length>2){const mx=Math.max(...pop.map(x=>x[1]),1),p19=pop.find(x=>x[0]===2019);
    ph='<div class="spark" role="img" aria-label="Population by year">'+pop.map(x=>'<i'+(x[0]>=2020?' class="s"':'')+' style="height:'+Math.max(2,100*x[1]/mx).toFixed(0)+'%" title="'+x[0]+': '+x[1]+'"></i>').join('')+'</div><div class="sparkx"><span>'+pop[0][0]+': '+sayi(pop[0][1])+'</span><span>'+(p19?'2019: '+sayi(p19[1]):'')+'</span><span>'+pop[pop.length-1][0]+': '+sayi(pop[pop.length-1][1])+'</span></div><p style="font-size:11.5px">Population by year. Shaded columns are the years after the water arrived. Source: Wikidata.</p>';}
  const t13=tile(c[0],c[1],13),t15=tile(c[0],c[1],15);
  const E=y=>'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-'+y+'_3857/default/g/13/'+t13.y+'/'+t13.x+'.jpg';
  const W=r=>'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+r+'/15/'+t15.y+'/'+t15.x;
  const derin=p.gol_iliskisi==='gol_icinde'&&p.yukseklik!=null&&p.yukseklik<=525;
  showCard({head:'<div><p class="eyebrow">Settlement record · '+esc(p.il||'')+'</p><h3>'+esc(p.ad)+'</h3></div>',
   body:dl([['Kurdish',w?esc(w.ku):''],['Armenian',w?esc(w.hy):''],['Arabic',w?esc(w.ar):''],['Other names',esc(al.join(', '))],['Old names',eski.join(', ')],
     ['Relation to the reservoir',(REL[p.gol_iliskisi]||'')+(p.gol_iliskisi&&p.gol_iliskisi!=='gol_icinde'&&p.uzaklik_m!=null?' ('+p.uzaklik_m+' m)':'')],
     ['Elevation',p.yukseklik!=null?p.yukseklik+' m'+(derin?', estimated water depth '+(525-p.yukseklik)+' m':''):''],
     ['Expropriation',KAMs.has(nrm(p.ad))?'Named in the press list of the 2016 urgent expropriation decision':''],
     ['Source','GeoNames'+(w?'; '+link('https://www.wikidata.org/wiki/'+w.wd,'Wikidata '+w.wd):'')+(w&&w.trw?'; '+link('https://tr.wikipedia.org/wiki/'+encodeURIComponent(w.trw.replace(/ /g,'_')),'Wikipedia'):'')+(ka.length?'; village names compilation':'')]])+
    (w&&w.es==='y'?not('The Wikidata record was matched by location, not by name. The names and population may belong to another settlement.'):'')+ph+
    '<div class="cift">'+chip(E(2018),'2018',t13)+chip(E(2022),'2022',t13)+chip(W(10),'archive 2014',t15)+chip(W(41468),'archive 2024',t15)+'</div><p style="font-size:11.5px">Above, Sentinel-2 annual mosaic; below, high-resolution archive. Archive dates are release dates. The ring marks the settlement point.</p>'+
    '<div class="row"><button type="button" id="ky-git">Show on map</button></div>'},haritadan);
  $('ky-git').onclick=()=>{A.flyTo({center:c,zoom:14.2,duration:1200});toMap();};setSel(c);}
T.koyCard=koyCard;
/* dizinde Kürtçe ve Ermenice adlarla arama */
if(WD){const t=()=>{const K=T.koy();if(!K.length)return setTimeout(t,200);K.forEach(k=>{const w=WD.k[k.id];if(!w)return;const ek=[w.ku,w.hy,w.ar].filter(Boolean);if(!ek.length)return;k.diger=(k.diger||'')+','+ek.join(',');k._alt=[...new Set(ek.concat(k._alt||[]))].slice(0,6);});T.draw();};t();}

/* ---------- anıt kayıtlarına rapordan ek bilgi ---------- */
const anahtar=ad=>{const w=String(ad).split(/[\s()]+/).map(nrm).filter(x=>x.length>3&&!['camii','cami','turbesi','zaviyesi','hamami','kopusu','koprusu','ayaklari'].includes(x));return w[0]||nrm(ad);};
const AEKm={};(AEK||[]).forEach(e=>{AEKm[anahtar(e.ad)]=e;});
T.anitHook=ad=>{const e=AEKm[anahtar(ad)];if(!e)return '';return dl([['Weight',e.agirlik_ton?esc(e.agirlik_ton)+' tonnes':''],['Contractor',esc(e.yuklenici)],['Report source',src(e.kaynak,e.url)]])+not(e.not);};
if(AEK&&$('an-liste')){const var_=new Set(T.ANIT.map(a=>anahtar(a.ad)));AEK.filter(e=>!var_.has(anahtar(e.ad))).forEach(e=>{const l=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<i class="ho"></i><span>'+esc(e.ad)+'</span><small>from the report</small>'+(e.tasima_tarihi?'<em>'+esc(e.tasima_tarihi)+'</em>':'');
  b.onclick=()=>showCard({head:'<div><p class="eyebrow">Monument record · from the research report</p><h3>'+esc(e.ad)+'</h3></div>',body:dl([['Fate',esc(e.akibet)],['Relocation',esc(e.tasima_tarihi)],['Weight',e.agirlik_ton?esc(e.agirlik_ton)+' tonnes':''],['Contractor',esc(e.yuklenici)],['Location','Not marked on the map'],['Source',src(e.kaynak,e.url)]])+not(e.not)});l.appendChild(b);$('an-liste').appendChild(l);});}

/* ---------- gün gün dolum: MODIS ---------- */
const G='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/',D0=Date.UTC(2019,5,1),DAY=864e5,gun=$('gun');
let gk='MODIS_Terra_CorrectedReflectance_Bands721',gms=D0+48*DAY,oy=null;
const iso=ms=>new Date(ms).toISOString().slice(0,10);
const modisIm=()=>({id:'modis',ad:'Daily MODIS (250 m) · '+iso(gms)+(gk.includes('721')?' · water highlighted':' · natural colour'),max:9,tiles:[G+gk+'/default/'+iso(gms)+'/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg'],att:'NASA EOSDIS GIBS, MODIS Terra'});
function modisOpt(){imById.modis=modisIm();['A','B'].forEach(s=>{const sel=$('im'+s);let o=sel.querySelector('option[value=modis]');if(!o){o=document.createElement('option');o.value='modis';sel.appendChild(o);}o.textContent=imById.modis.ad;});}
function setGun(ms){gms=ms;modisOpt();setImagery('B','modis');$('gun-t').textContent=trh(iso(ms));$('gun-r').value=Math.round((ms-D0)/DAY);}
function durdur(){if(oy){clearInterval(oy);oy=null;$('gun-oy').textContent='Play';}}
function openGun(){gun.hidden=false;setGun(gms);if(A.getZoom()>10.5)fitAll();toMap();}
modisOpt();
$('gun-r').oninput=e=>{durdur();setGun(D0+(+e.target.value)*DAY);};
$('gun-oy').onclick=()=>{if(oy)return durdur();$('gun-oy').textContent='Pause';oy=setInterval(()=>{const n=gms+4*DAY;if(n>D0+760*DAY)return durdur();setGun(n);},1500);};
$('gun-k').onclick=()=>{gk=gk.includes('721')?'MODIS_Terra_CorrectedReflectance_TrueColor':'MODIS_Terra_CorrectedReflectance_Bands721';setGun(gms);};
$('gun-x').onclick=()=>{durdur();gun.hidden=true;setIm(null,'s2021');};
$('imB').addEventListener('change',e=>{if(e.target.value==='modis'){gun.hidden=false;$('gun-t').textContent=trh(iso(gms));}else{durdur();gun.hidden=true;}});

/* ---------- üç boyutlu arazi ---------- */
let ucb=false;const DEMU='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
$('m-3b').onclick=()=>{ucb=!ucb;$('m-3b').setAttribute('aria-pressed',ucb);[A,B].forEach(m=>{try{if(ucb){if(!m.getSource('dem'))m.addSource('dem',{type:'raster-dem',tiles:[DEMU],encoding:'terrarium',tileSize:256,maxzoom:13,attribution:'Terrain: Mapzen Terrain Tiles, AWS Open Data'});m.setTerrain({source:'dem',exaggeration:1.5});m.dragRotate.enable();m.touchZoomRotate.enableRotation();if(m.touchPitch)m.touchPitch.enable();}else{m.setTerrain(null);m.dragRotate.disable();m.touchZoomRotate.disableRotation();}}catch(err){console.warn('3b',err);}});
  A.easeTo(ucb?{pitch:60,bearing:-20,duration:1200}:{pitch:0,bearing:0,duration:800});};

/* ---------- görünümü PNG olarak kaydet ---------- */
$('kaydet').onclick=()=>{try{const ca=A.getCanvas(),cb=B.getCanvas(),w=ca.width,h=ca.height,dpr=w/ca.clientWidth,tek=$('maps').classList.contains('tek'),bar=Math.round(40*dpr);
  const c=document.createElement('canvas');c.width=w;c.height=h+bar;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);x.drawImage(ca,0,0);
  if(!tek){const sx=Math.round(w*parseFloat(getComputedStyle($('maps')).getPropertyValue('--split'))/100);x.drawImage(cb,sx,0,w-sx,h,sx,0,w-sx,h);x.fillStyle=PINK;x.fillRect(sx-dpr,0,2*dpr,h);}
  const a=imById[cur.A],b=imById[cur.B];x.textBaseline='middle';x.fillStyle='#fff';x.font=(11*dpr)+'px Helvetica, Arial, sans-serif';
  x.fillText('Tigris Valley Atlas · '+(tek?a.ad:'left: '+a.ad+' · right: '+b.ad)+' · '+new Date().toISOString().slice(0,10),8*dpr,h+bar*.3,w-16*dpr);
  x.fillStyle=ORANGE;x.fillText('Imagery: '+[...new Set([a.att,tek?null:b.att].filter(Boolean))].join(' · ')+' · Data: OpenStreetMap, GeoNames',8*dpr,h+bar*.72,w-16*dpr);
  c.toBlob(bl=>{const l=document.createElement('a');l.href=URL.createObjectURL(bl);l.download='tigris-atlas-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.png';document.body.appendChild(l);l.click();l.remove();});
 }catch(e){console.error('kaydet',e);}};

/* ---------- kütüphane ---------- */
const ER={acik:'Open',kisitli:'Restricted',bulunamadi:'Not found'};
const KUT=[
 {k:'belge',ad:'Documents',d:BLG,t:x=>x.baslik,s:x=>[x.yil,x.tur,ER[x.erisim]].filter(Boolean).join(' · '),e:x=>x.kurum,c:x=>x.erisim==='bulunamadi'?'ho':x.erisim==='kisitli'?'or':'',
  rows:x=>[['Institution',esc(x.kurum)],['Year',x.yil?esc(x.yil):''],['Type',esc(x.tur)],['Language',esc(x.dil)],['Access',ER[x.erisim]||'']],n:x=>x.not},
 {k:'liste',ad:'Village lists',d:LST,t:x=>x.liste_adi,s:x=>(x.koyler?x.koyler.length:0)+' villages',e:x=>x.kaynak,c:x=>'cy',
  rows:x=>[['Source',esc(x.kaynak)],['Year',x.yil?esc(x.yil):''],['Villages',(()=>{const g={};(x.koyler||[]).forEach(k=>{const a=[k.ilce,k.il].filter(Boolean).join(', ')||'Not specified';(g[a]=g[a]||[]).push(k.ad);});return Object.entries(g).map(([a,l])=>'<b>'+esc(a)+':</b> '+esc(l.join(', '))).join('<br>');})()]],n:x=>x.not},
 {k:'harita',ad:'Historical maps',d:THR,t:x=>x.ad,s:x=>[x.yil,x.olcek].filter(Boolean).join(' · '),e:x=>x.yapan,c:x=>'or',
  rows:x=>[['Built by',esc(x.yapan)],['Year',esc(x.yil)],['Scale',esc(x.olcek)],['Sheet',esc(x.pafta)],['Coverage',esc(x.kapsam)],['Licence',esc(x.lisans)]],n:x=>x.not},
 {k:'foto',ad:'Photograph and film archives',d:FOT,t:x=>x.ad,s:x=>x.donem,e:x=>x.kurum,c:x=>'rd',
  rows:x=>[['Institution',esc(x.kurum)],['Period',esc(x.donem)],['Content',esc(x.icerik)],['Record no.',esc(x.kayit_no)],['Count',x.adet?esc(x.adet):''],['Licence',esc(x.lisans)]],n:x=>x.not},
 {k:'goruntu',ad:'Imagery sources',d:GOR,t:x=>x.ad,s:x=>x.kullanilabilir?'available':'unavailable',e:x=>x.saglayici,c:x=>x.kullanilabilir?'cy':'ho',
  rows:x=>[['Provider',esc(x.saglayici)],['Type',esc(x.kategori)],['Date range',esc(x.tarih_araligi)],['Resolution',esc(x.cozunurluk)],['Licence',esc(x.lisans)],['Attribution',esc(x.atif_metni)],['In this atlas',x.kullanilabilir?'Can be loaded in the web map':'Cannot be loaded or no permission']],n:x=>x.not},
 {k:'proje',ad:'Similar projects and method',d:BNZ,t:x=>x.ad,s:x=>[x.yil,x.tur].filter(Boolean).join(' · '),e:x=>x.yapan,c:x=>'',
  rows:x=>[['Built by',esc(x.yapan)],['Year',esc(x.yil)],['Type',esc(x.tur)],['Method',esc(x.yontem)],['Finding',esc(x.bulgu)]],n:x=>''}
].filter(k=>k.d&&k.d.length);
let kt=KUT[0];
function kutCard(K,x){showCard({head:'<div><p class="eyebrow">Library · '+esc(K.ad)+'</p><h3>'+esc(K.t(x))+'</h3></div>',body:dl(K.rows(x))+not(K.n(x))+(x.url?'<div class="row"><a class="btn" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Go to source</a>'+(x.diger_url?'<a class="btn" href="'+esc(x.diger_url)+'" target="_blank" rel="noopener noreferrer">Second link</a>':'')+'</div>':'')});}
function drawKut(){if(!kt)return;const q=$('ku-ara').value.trim().toLocaleLowerCase('tr');const L=kt.d.filter(x=>!q||JSON.stringify(x).toLocaleLowerCase('tr').includes(q));
  $('ku-say').textContent=L.length+' records';const ul=$('ku-liste');ul.innerHTML='';
  L.forEach(x=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<i class="'+kt.c(x)+'"></i><span>'+esc(kt.t(x))+'</span><small>'+esc(kt.s(x)||'')+'</small>'+(kt.e(x)?'<em>'+esc(kt.e(x))+'</em>':'');b.onclick=()=>kutCard(kt,x);li.appendChild(b);ul.appendChild(li);});}
KUT.forEach(K=>{const b=document.createElement('button');b.type='button';b.textContent=K.ad+' ('+K.d.length+')';b.setAttribute('aria-pressed',K===kt);b.onclick=()=>{kt=K;$('ku-tur').querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',o===b));drawKut();};$('ku-tur').appendChild(b);});
$('ku-ara').addEventListener('input',drawKut);drawKut();

/* ---------- analiz ---------- */
const BIR={kisi:'people',hane:'households',konut:'dwellings',yerlesim:'settlements',parsel:'parcels',diger:''},TR={resmi:'official',stk:'civil society',akademik:'academic',basin:'press'};
if(SAYI)$('a-sayi').innerHTML=SAYI.slice().sort((a,b)=>(a.birim||'').localeCompare(b.birim||'')||(a.yil||0)-(b.yil||0)).map(s=>'<tr><td>'+esc(s.sayi)+'<small>'+esc(BIR[s.birim]||'')+'</small></td><td>'+esc(s.ne_sayiyor)+'<small>'+esc(s.kaynak)+(s.yil?', '+esc(s.yil):'')+(TR[s.tur]?' · '+TR[s.tur]:'')+(s.url?' · '+link(s.url,'link'):'')+'</small></td></tr>').join('');
if(ARK){const c={};ARK.features.forEach(f=>{const d=f.properties.durum||'bilinmiyor';c[d]=(c[d]||0)+1;});bars('a-ark',Object.entries(c).sort((a,b)=>b[1]-a[1]).map(e=>[DUR[e[0]]||e[0],e[1]]));}
if(KUN&&KUN.uretim&&KUN.uretim.length)bars('a-uretim',KUN.uretim.slice().sort((a,b)=>a.yil-b.yil).map(u=>[String(u.yil),u.gwh,sayi(u.gwh)+' GWh']),true);
let NUF=null;
if(WD){const t=()=>{const K=T.koy();if(!K.length)return setTimeout(t,200);const byId=Object.fromEntries(K.map(k=>[k.id,k]));const V=Object.entries(WD.k).map(([id,w])=>({id,w,k:byId[id]})).filter(o=>o.k);
  const uniq={};V.forEach(o=>{if(!uniq[o.w.wd]||o.w.es==='a')uniq[o.w.wd]=o;});const U=Object.values(uniq);
  bars('a-ad',[['Matched with a Wikidata record',U.length],['Kurdish name recorded',U.filter(o=>o.w.ku).length],['Armenian name recorded',U.filter(o=>o.w.hy).length],['Arabic name recorded',U.filter(o=>o.w.ar).length],['Old name in the compilation',(KAD||[]).length]]);
  const yak=U.filter(o=>o.k.gol_iliskisi!=='kiyi_3km'),yrs=[];for(let y=2007;y<=2024;y++)yrs.push(y);
  const tam=yak.filter(o=>{const m=Object.fromEntries(o.w.pop);return yrs.every(y=>m[y]!=null);});
  const top=yrs.map(y=>[String(y),tam.reduce((s,o)=>s+Object.fromEntries(o.w.pop)[y],0)]);
  bars('a-nufus',top.map(r=>[r[0],r[1],sayi(r[1])]),false);$('a-nufus-not').textContent='Total population of the '+tam.length+' settlements inside the reservoir boundary or within 1 km of the shore that have a recorded population for every year from 2007 to 2024. Source: annual village populations in Wikidata records.';
  const kay=yak.map(o=>{const m=Object.fromEntries(o.w.pop);return m[2019]>=30&&m[2024]!=null?{ad:o.k.ad,a:m[2019],b:m[2024],o:(m[2024]-m[2019])/m[2019]}:null;}).filter(Boolean).sort((a,b)=>a.o-b.o).slice(0,10);
  bars('a-kayip',kay.map(k=>[k.ad,Math.round(-k.o*100),k.a+' → '+k.b+' ('+Math.round(-k.o*100)+'%)']),true);
  NUF={U,tam,top,kay};};t();}

/* ---------- yeni dosyalar ---------- */
const liste=(id,items,fn)=>'<ul class="liste" id="'+id+'">'+items.map((x,i)=>'<li><button type="button" data-i="'+i+'">'+fn(x)+'</button></li>').join('')+'</ul>';
const bagla=(id,items,fn)=>{const u=$(id);if(u)u.querySelectorAll('button').forEach(b=>b.onclick=()=>fn(items[+b.dataset.i]));};
if(ARK){const fs=ARK.features,n=fs.length,ko=pts(ARK).features.length,c={};fs.forEach(f=>{const d=f.properties.durum||'bilinmiyor';c[d]=(c[d]||0)+1;});
 addDos({no:'08',ad:'Rescue excavations: archaeology under water',soru:'Which sites in the dam area were excavated, and for which is the fate known?',sayi:String(n),view:null,im:['s2018','s2022'],on:['g-kazi','g-ark'],
  bulgu:['The compiled publications name '+n+' archaeological sites and rescue excavations in the reservoir area. '+ko+' of them have a location marked on the map.','By status: '+Object.entries(c).map(e=>(DUR[e[0]]||e[0]).toLocaleLowerCase('tr')+': '+e[1]).join(', ')+'.','For most sites the period, excavation year and under-water status are not given in the compiled sources. Fields left empty on the cards are empty for this reason.','The triangles are the sites of this file. The small black dots are the archaeological site records on the 2022 map.'],
  yontem:'The list of sites was taken from the publications compiled in the research report. Where the source gives no coordinates, the location was taken from the record of the same name in the atlas map layers and marked as approximate.',
  acik:'Whether a site went under water comes from the reservoir boundary calculation, not from the publications. It should be checked against the excavation reports one by one. Approximate locations may be off by 1 to 2 km.',
  kaynak:'Research report, 17.11.2026; Ökse et al. 2008; OpenStreetMap; GeoNames.',git:[['Library','#kutuphane'],['Layers','#katmanlar']],
  ek:()=>'<h2>Sites</h2>'+liste('d-kazi',fs,f=>'<i class="'+(f.geometry?'or':'ho')+'"></i><span>'+esc(f.properties.ad)+'</span><small>'+esc((DUR[f.properties.durum]||'').toLocaleLowerCase('tr'))+'</small>'+(f.properties.donem?'<em>'+esc(f.properties.donem)+'</em>':'')),
  sonra:()=>bagla('d-kazi',fs,f=>{const c2=f.geometry&&f.geometry.coordinates;kaziCard(f.properties,c2);if(c2){A.flyTo({center:c2,zoom:13.5,duration:1200});toMap();}})});}
if(SAYI||YY){const kisi=(SAYI||[]).filter(s=>s.birim==='kisi'),yf=YY?YY.features:[];
 addDos({no:'09',ad:'Resettlement and the politics of counting',soru:'How many people were displaced and where were they resettled? The numbers change depending on who counts.',sayi:kisi.length?kisi.length+' figures':'',view:[41.4205,37.7335,13.6],im:['w10','w41468'],on:['g-yy','g-koyin'],
  bulgu:kisi.slice(0,7).map(s=>s.sayi+' people: '+s.ne_sayiyor+' ('+s.kaynak+(s.yil?', '+s.yil:'')+').').concat(yf.length?['New settlements named in the compiled sources: '+yf.map(f=>f.properties.ad+(f.properties.konut_sayisi?' ('+f.properties.konut_sayisi+' dwellings)':'')).join(', ')+'.']:[]),
  yontem:'The figures were compiled from published reports, statements and articles. For each figure, what was counted and its source are given in the table in the Analysis section.',
  acik:'The village-by-village annexes of the resettlement plan and the environmental impact report could not be found. For this reason it cannot be compared which settlements the figures cover. No source on a new settlement was found for Çattepe and Kesmeköprü.',
  kaynak:'Research report, 17.11.2026; the publications named.',git:[['Table of figures','#analiz'],['Documents','#kutuphane']],
  ek:()=>yf.length?'<h2>New settlements</h2>'+liste('d-yy',yf,f=>'<i class="'+(f.geometry?'cy':'ho')+'"></i><span>'+esc(f.properties.ad)+'</span><small>'+(f.properties.konut_sayisi?esc(f.properties.konut_sayisi)+' dwellings':'')+'</small>'):'',
  sonra:()=>bagla('d-yy',yf,f=>{const c2=f.geometry&&f.geometry.coordinates;yyCard(f.properties,c2);if(c2){A.flyTo({center:c2,zoom:14,duration:1200});toMap();}})});}
if(KUN||BRJ){const bf=BRJ?BRJ.features:[];
 addDos({no:'10',ad:'Dam and basin',soru:'The dam\'s technical profile, the electricity it produces and its effect on the lower basin.',sayi:'1,200 MW',view:[41.85,37.535,11.6],im:['w10','w41468'],on:['g-brj','g-gol'],
  bulgu:(KUN&&KUN.asagi_havza?KUN.asagi_havza.map(h=>h.baslik+'. '+h.not):[]).concat(bf.length?['The Upper Tigris and its tributaries have '+bf.length+' compiled dam records, '+pts(BRJ).features.length+' of them with a marked location.']:[]).concat(KUN&&KUN.su_seviyesi&&!KUN.su_seviyesi.length?['No public time series was found for the reservoir water level. Possible sources are listed below.']:[]),
  yontem:'Technical values were compiled from official agency pages and publications. Where sources give different values, both values are kept in the table.',
  acik:'Sources give different values for crest length, body volume, storage volume and reservoir area. The location and year of dams other than Ilısu and Batman were not verified.',
  kaynak:'Research report, 17.11.2026; DSİ; Batman Valiliği; Eroğlu 2022; Enerji Atlası.',git:[['Production chart','#analiz'],['Documents','#kutuphane']],
  ek:()=>(KUN&&KUN.teknik&&KUN.teknik.length?'<h2>Technical profile</h2><table class="tbl">'+KUN.teknik.map(t=>'<tr><td style="font-size:12px;font-weight:400">'+esc(t.ozellik)+'</td><td>'+esc(t.deger)+'<small>'+src(t.kaynak,t.url)+'</small></td></tr>').join('')+'</table>':'')+
   (KUN&&KUN.su_seviyesi_kaynaklari&&KUN.su_seviyesi_kaynaklari.length?'<h2>Possible sources for the water level</h2><ul>'+KUN.su_seviyesi_kaynaklari.map(s=>'<li>'+link(s.url,s.ad)+'. '+esc(s.not)+'</li>').join('')+'</ul>':'')+
   (bf.length?'<h2>Dams</h2>'+liste('d-brj',bf,f=>'<i class="'+(f.geometry?'':'ho')+'"></i><span>'+esc(f.properties.ad)+'</span><small>'+esc([f.properties.nehir,f.properties.yil].filter(Boolean).join(' · '))+'</small>'):''),
  sonra:()=>bagla('d-brj',bf,f=>{const c2=f.geometry&&f.geometry.coordinates;brjCard(f.properties,c2);if(c2){A.flyTo({center:c2,zoom:11.5,duration:1200});toMap();}})});}
if(WD){addDos({no:'11',ad:'Place names and population',soru:'The names of villages in other languages and what happened to the population after the water came.',sayi:'2007-2024',view:null,im:['s2018','s2022'],on:['g-koyin','g-koyk1'],
  get bulgu(){if(!NUF)return ['Loading data, reopen this file.'];const t=NUF.top,a=t[0],b=t.find(r=>r[0]==='2019'),c=t[t.length-1];return ['Of the 260 settlement points around the reservoir, '+NUF.U.length+' matched a Wikidata record. '+NUF.U.filter(o=>o.w.ku).length+' have a Kurdish name and '+NUF.U.filter(o=>o.w.hy).length+' an Armenian name recorded.','The total population of the '+NUF.tam.length+' settlements inside the reservoir and on the shore, for '+a[0]+': '+sayi(a[1])+'; for 2019: '+sayi(b[1])+'; for '+c[0]+': '+sayi(c[1])+'.'].concat(NUF.kay.length?['Largest population losses between 2019 and 2024: '+NUF.kay.slice(0,5).map(k=>k.ad+' ('+k.a+' → '+k.b+')').join(', ')+'.']:[]).concat(['Tapping a settlement opens its card with names, population curve and before and after images.']);},
  yontem:'Settlement points were matched to Wikidata records first by name, then by location. Names and annual populations were taken from Wikidata records. The population values are the address-based population records held there.',
  acik:'The language of names follows the Wikidata label and its origin was not verified. Village population is the number of people registered to the village, which may not be the number living there. The series breaks for villages that became neighbourhoods. Only some of the settlements that went under water were matched.',
  kaynak:'Wikidata, query 18.11.2026; GeoNames; village names compilation.',git:[['Population charts','#analiz'],['Settlement index','#yerlesimler']]});}
/* var olan dosyalara ek denetimler */
const D3=T.DOS.find(d=>d.no==='03');if(D3){D3.ek=()=>'<h2>Watch day by day</h2><p class="small">With daily satellite imagery, from June 2019 to June 2021. In the water-highlighted image water appears black and dark blue, and cloud light blue. The resolution is 250 metres.</p><div class="row"><button type="button" class="btn" id="d-gun">Watch the filling day by day</button><button type="button" class="btn" id="d-jrc">Show new permanent water</button></div>';
  D3.sonra=()=>{$('d-gun').onclick=openGun;$('d-jrc').onclick=()=>{turnOn('g-jrct');fitAll();toMap();};};}
if(WBC){const D2=T.DOS.find(d=>d.no==='02');const yer=WBC.hasankeyf||Object.values(WBC)[0];if(D2&&yer&&yer.cekimler){const WBu=n=>'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+n+'/{z}/{y}/{x}';
  yer.cekimler.forEach(c=>{const id='wc'+c[1];imById[id]={id,ad:'High resolution · capture '+c[0]+' (Hasankeyf)',max:17,tiles:[WBu(c[1])],att:'Esri World Imagery Wayback, capture '+c[0]+(c[4]?' ('+c[4]+')':'')};['A','B'].forEach(s=>{const o=document.createElement('option');o.value=id;o.textContent=imById[id].ad;$('im'+s).appendChild(o);});});
  D2.ek=()=>'<h2>Close-up series, with real capture dates</h2><p class="small">Capture dates of the archive imagery at the Hasankeyf bazaar point. Tapping a date switches the right side to that capture.</p><div class="chips" id="d-wb">'+yer.cekimler.map(c=>'<button type="button" data-id="wc'+c[1]+'">'+esc(c[0])+'</button>').join('')+'</div>';
  D2.sonra=()=>{$('d-wb').querySelectorAll('button').forEach(b=>b.onclick=()=>{setIm(null,b.dataset.id);A.flyTo({center:[41.4118,37.7137],zoom:15.5,duration:1000});toMap();});};}}
if($('src'))['Kurdish, Armenian and Arabic names and annual village populations: Wikidata, query 18.11.2026. CC0.','Surface water transitions and water occurrence: JRC Global Surface Water 1984-2021, Pekel et al. 2016. Source: EC JRC/Google.','Daily satellite imagery: NASA EOSDIS GIBS, MODIS Terra corrected reflectance.','Relief: Esri World Hillshade.','Archaeological sites, new settlements, dams, documents, figures, historical maps and archives: sources compiled in the research report of 17.11.2026. Each record gives its own source.','Typeface: Unbounded, SIL Open Font License.'].forEach(s=>{const li=document.createElement('li');li.textContent=s;$('src').appendChild(li);});
Object.assign(T,{ARK,YY,BRJ,WD,openGun,koyCard,kaziCard});
})().catch(e=>console.error('ek',e));

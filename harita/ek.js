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
const link=(u,t)=>u?'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">'+esc(t||'Kaynağa git')+'</a>':'';
const src=(k,u)=>esc(k||'')+(u?(k?' · ':'')+link(u,'bağlantı'):'');
const pts=fc=>({type:'FeatureCollection',features:(fc?fc.features:[]).filter(f=>f.geometry)});
const not=t=>t?'<p class="not">'+esc(t)+'</p>':'';
const sayi=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');

/* ---------- harita katmanları ---------- */
const DUR={su_altinda:'Su altında',kismen:'Kısmen su altında',disarida:'Göl sınırının dışında',bilinmiyor:'Durumu bilinmiyor'};
const BD={isletmede:'İşletmede',insaat:'İnşaat hâlinde',planlanan:'Planlanan'};
const KONUM={rapor:'Kaynakta verilen koordinat',yaklasik:'Yaklaşık konum, kaynakta koordinat yok'};
function kaziCard(p,c){showCard({head:'<div><p class="eyebrow">Arkeolojik alan · kurtarma kazısı</p><h3>'+esc(p.ad)+'</h3></div>',
  body:dl([['Diğer ad',esc(p.diger_ad)],['Durum',DUR[p.durum]||''],['Dönem',esc(p.donem)],['Kazı',esc(p.kazi_yillari)],['Kurum',esc(p.kurum)],['Konum',c?(KONUM[p.konum_guven]||''):'Haritada işaretli değil'],['Kaynak',src(p.kaynak,p.url)]])+not(p.not)});setSel(c||null);}
function yyCard(p,c){showCard({head:'<div><p class="eyebrow">Yeni yerleşim</p><h3>'+esc(p.ad)+'</h3></div>',
  body:dl([['Eski yer',esc(p.eski_yer)],['İl, ilçe',[p.il,p.ilce].filter(Boolean).map(esc).join(', ')],['Konut',p.konut_sayisi?esc(p.konut_sayisi):''],['Yıl',esc(p.yil)],['Yapan',esc(p.yapan)],['Konum',c?(KONUM[p.konum_guven]||''):'Haritada işaretli değil'],['Kaynak',src(p.kaynak,p.url)]])+not(p.sorunlar)});setSel(c||null);}
function brjCard(p,c){showCard({head:'<div><p class="eyebrow">Baraj · '+esc(p.nehir||'')+'</p><h3>'+esc(p.ad)+'</h3></div>',
  body:dl([['Durum',BD[p.durum]||esc(p.durum)],['Yıl',p.yil?esc(p.yil):''],['Kurulu güç',p.guc_mw?esc(p.guc_mw)+' MW':''],['Konum',c?(KONUM[p.konum_guven]||''):'Haritada işaretli değil'],['Kaynak',src(p.kaynak,p.url)]])+not(p.not)});setSel(c||null);}
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
    hit('saha',(p,c)=>{showCard({head:'<div><p class="eyebrow">Saha işareti, yalnızca yerel kopyada</p><h3>'+esc(p.ad)+'</h3></div>',body:dl([['Konum',p.konum==='gol_icinde'?'Göl sınırının içinde':'Göl sınırının dışında']])});setSel(c);});}
});});
if(SAHA)addGroup({id:'g-saha',ad:'Saha işaretleri',alt:'Araştırmacının kendi yer işaretleri, yayında yok',renk:'#fff',layers:['saha','saha-lab'],on:false});
if(BRJ)addGroup({id:'g-brj',ad:'Yukarı Dicle barajları',alt:pts(BRJ).features.length+' barajın konumu işaretli, '+BRJ.features.length+' kayıt',renk:'#fff',layers:['brj','brj-lab'],on:false});
if(YY)addGroup({id:'g-yy',ad:'Yeni yerleşimler',alt:'Yerinden edilenler için kurulan yerleşimler',renk:CYAN,layers:['yy','yy-lab'],on:true});
if(ARK)addGroup({id:'g-kazi',ad:'Kurtarma kazıları ve arkeolojik alanlar',alt:pts(ARK).features.length+' alanın konumu işaretli, '+ARK.features.length+' kayıt',renk:ORANGE,layers:['kazi','kazi-lab'],on:true});
addGroup({id:'g-jrco',ad:'Tematik: su görülme sıklığı, 1984 ile 2021',alt:'Koyu mavi her zaman su, açık mavi ara sıra su. Kaynak: EC JRC/Google',renk:'#8a8a8a',layers:['jrc-o'],on:false});
addGroup({id:'g-jrct',ad:'Tematik: su yüzeyi geçişleri, 1984 ile 2021',alt:'Yeşil yeni kalıcı su, yani baraj gölü. Mavi eskiden beri kalıcı su, yani nehir. Kaynak: EC JRC/Google',renk:'#8a8a8a',layers:['jrc-t'],on:false});

/* ---------- yerleşim kaydı ---------- */
const KADm={};(KAD||[]).forEach(k=>{const n=nrm(k.resmi_ad);(KADm[n]=KADm[n]||[]).push(k);});
const KAMs=new Set((KAM?KAM.features:[]).map(f=>nrm(f.properties.ad)));
const tile=(lon,lat,z)=>{const n=2**z,xf=(lon+180)/360*n,yf=(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n;return {x:Math.floor(xf),y:Math.floor(yf),px:(xf%1)*100,py:(yf%1)*100};};
const chip=(url,cap,t)=>'<figure><img loading="lazy" src="'+url+'" alt="" onerror="this.style.opacity=.15"><figcaption>'+cap+'</figcaption><u style="left:'+t.px.toFixed(1)+'%;top:'+t.py.toFixed(1)+'%"></u></figure>';
function koyCard(p,c,haritadan){const w=WD&&WD.k[p.id],al=altNames(p),ka=KADm[nrm(p.ad)]||[];
  const eski=ka.flatMap(k=>k.eski_adlar.map(e=>esc(e.ad)+(e.dil&&e.dil!=='belirtilmemiş'?' ('+esc(e.dil)+')':'')));
  const pop=w?w.pop:[];let ph='';
  if(pop.length>2){const mx=Math.max(...pop.map(x=>x[1]),1),p19=pop.find(x=>x[0]===2019);
    ph='<div class="spark" role="img" aria-label="Yıllara göre nüfus">'+pop.map(x=>'<i'+(x[0]>=2020?' class="s"':'')+' style="height:'+Math.max(2,100*x[1]/mx).toFixed(0)+'%" title="'+x[0]+': '+x[1]+'"></i>').join('')+'</div><div class="sparkx"><span>'+pop[0][0]+': '+sayi(pop[0][1])+'</span><span>'+(p19?'2019: '+sayi(p19[1]):'')+'</span><span>'+pop[pop.length-1][0]+': '+sayi(pop[pop.length-1][1])+'</span></div><p style="font-size:11.5px">Nüfus, yıllara göre. Taralı sütunlar su geldikten sonraki yıllar. Kaynak: Wikidata.</p>';}
  const t13=tile(c[0],c[1],13),t15=tile(c[0],c[1],15);
  const E=y=>'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-'+y+'_3857/default/g/13/'+t13.y+'/'+t13.x+'.jpg';
  const W=r=>'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+r+'/15/'+t15.y+'/'+t15.x;
  const derin=p.gol_iliskisi==='gol_icinde'&&p.yukseklik!=null&&p.yukseklik<=525;
  showCard({head:'<div><p class="eyebrow">Yerleşim kaydı · '+esc(p.il||'')+'</p><h3>'+esc(p.ad)+'</h3></div>',
   body:dl([['Kürtçe',w?esc(w.ku):''],['Ermenice',w?esc(w.hy):''],['Arapça',w?esc(w.ar):''],['Diğer adlar',esc(al.join(', '))],['Eski adlar',eski.join(', ')],
     ['Göle göre',(REL[p.gol_iliskisi]||'')+(p.gol_iliskisi&&p.gol_iliskisi!=='gol_icinde'&&p.uzaklik_m!=null?' ('+p.uzaklik_m+' m)':'')],
     ['Yükseklik',p.yukseklik!=null?p.yukseklik+' m'+(derin?', tahmini su derinliği '+(525-p.yukseklik)+' m':''):''],
     ['Kamulaştırma',KAMs.has(nrm(p.ad))?'2016 acele kamulaştırma kararının basın listesinde adı geçiyor':''],
     ['Kaynak','GeoNames'+(w?'; '+link('https://www.wikidata.org/wiki/'+w.wd,'Wikidata '+w.wd):'')+(w&&w.trw?'; '+link('https://tr.wikipedia.org/wiki/'+encodeURIComponent(w.trw.replace(/ /g,'_')),'Vikipedi'):'')+(ka.length?'; köy adları derlemesi':'')]])+
    (w&&w.es==='y'?not('Wikidata kaydı ada göre değil konuma göre eşleşti. Adlar ve nüfus başka bir yerleşime ait olabilir.'):'')+ph+
    '<div class="cift">'+chip(E(2018),'2018',t13)+chip(E(2022),'2022',t13)+chip(W(10),'arşiv 2014',t15)+chip(W(41468),'arşiv 2024',t15)+'</div><p style="font-size:11.5px">Üstte Sentinel-2 yıllık mozaik, altta yüksek çözünürlüklü arşiv. Arşiv tarihleri yayın tarihidir. Halka yerleşim noktasını gösterir.</p>'+
    '<div class="row"><button type="button" id="ky-git">Haritada göster</button></div>'},haritadan);
  $('ky-git').onclick=()=>{A.flyTo({center:c,zoom:14.2,duration:1200});toMap();};setSel(c);}
T.koyCard=koyCard;
/* dizinde Kürtçe ve Ermenice adlarla arama */
if(WD){const t=()=>{const K=T.koy();if(!K.length)return setTimeout(t,200);K.forEach(k=>{const w=WD.k[k.id];if(!w)return;const ek=[w.ku,w.hy,w.ar].filter(Boolean);if(!ek.length)return;k.diger=(k.diger||'')+','+ek.join(',');k._alt=[...new Set(ek.concat(k._alt||[]))].slice(0,6);});T.draw();};t();}

/* ---------- anıt kayıtlarına rapordan ek bilgi ---------- */
const anahtar=ad=>{const w=String(ad).split(/[\s()]+/).map(nrm).filter(x=>x.length>3&&!['camii','cami','turbesi','zaviyesi','hamami','kopusu','koprusu','ayaklari'].includes(x));return w[0]||nrm(ad);};
const AEKm={};(AEK||[]).forEach(e=>{AEKm[anahtar(e.ad)]=e;});
T.anitHook=ad=>{const e=AEKm[anahtar(ad)];if(!e)return '';return dl([['Ağırlık',e.agirlik_ton?esc(e.agirlik_ton)+' ton':''],['Yüklenici',esc(e.yuklenici)],['Rapor kaynağı',src(e.kaynak,e.url)]])+not(e.not);};
if(AEK&&$('an-liste')){const var_=new Set(T.ANIT.map(a=>anahtar(a.ad)));AEK.filter(e=>!var_.has(anahtar(e.ad))).forEach(e=>{const l=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<i class="ho"></i><span>'+esc(e.ad)+'</span><small>rapordan</small>'+(e.tasima_tarihi?'<em>'+esc(e.tasima_tarihi)+'</em>':'');
  b.onclick=()=>showCard({head:'<div><p class="eyebrow">Anıt kaydı · araştırma raporundan</p><h3>'+esc(e.ad)+'</h3></div>',body:dl([['Akıbet',esc(e.akibet)],['Taşıma',esc(e.tasima_tarihi)],['Ağırlık',e.agirlik_ton?esc(e.agirlik_ton)+' ton':''],['Yüklenici',esc(e.yuklenici)],['Konum','Haritada işaretli değil'],['Kaynak',src(e.kaynak,e.url)]])+not(e.not)});l.appendChild(b);$('an-liste').appendChild(l);});}

/* ---------- gün gün dolum: MODIS ---------- */
const G='https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/',D0=Date.UTC(2019,5,1),DAY=864e5,gun=$('gun');
let gk='MODIS_Terra_CorrectedReflectance_Bands721',gms=D0+48*DAY,oy=null;
const iso=ms=>new Date(ms).toISOString().slice(0,10);
const modisIm=()=>({id:'modis',ad:'Günlük MODIS (250 m) · '+iso(gms)+(gk.includes('721')?' · su vurgulu':' · doğal renk'),max:9,tiles:[G+gk+'/default/'+iso(gms)+'/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg'],att:'NASA EOSDIS GIBS, MODIS Terra'});
function modisOpt(){imById.modis=modisIm();['A','B'].forEach(s=>{const sel=$('im'+s);let o=sel.querySelector('option[value=modis]');if(!o){o=document.createElement('option');o.value='modis';sel.appendChild(o);}o.textContent=imById.modis.ad;});}
function setGun(ms){gms=ms;modisOpt();setImagery('B','modis');$('gun-t').textContent=trh(iso(ms));$('gun-r').value=Math.round((ms-D0)/DAY);}
function durdur(){if(oy){clearInterval(oy);oy=null;$('gun-oy').textContent='Oynat';}}
function openGun(){gun.hidden=false;setGun(gms);if(A.getZoom()>10.5)fitAll();toMap();}
modisOpt();
$('gun-r').oninput=e=>{durdur();setGun(D0+(+e.target.value)*DAY);};
$('gun-oy').onclick=()=>{if(oy)return durdur();$('gun-oy').textContent='Durdur';oy=setInterval(()=>{const n=gms+4*DAY;if(n>D0+760*DAY)return durdur();setGun(n);},1500);};
$('gun-k').onclick=()=>{gk=gk.includes('721')?'MODIS_Terra_CorrectedReflectance_TrueColor':'MODIS_Terra_CorrectedReflectance_Bands721';setGun(gms);};
$('gun-x').onclick=()=>{durdur();gun.hidden=true;setIm(null,'s2021');};
$('imB').addEventListener('change',e=>{if(e.target.value==='modis'){gun.hidden=false;$('gun-t').textContent=trh(iso(gms));}else{durdur();gun.hidden=true;}});

/* ---------- üç boyutlu arazi ---------- */
let ucb=false;const DEMU='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
$('m-3b').onclick=()=>{ucb=!ucb;$('m-3b').setAttribute('aria-pressed',ucb);[A,B].forEach(m=>{try{if(ucb){if(!m.getSource('dem'))m.addSource('dem',{type:'raster-dem',tiles:[DEMU],encoding:'terrarium',tileSize:256,maxzoom:13,attribution:'Arazi: Mapzen Terrain Tiles, AWS Open Data'});m.setTerrain({source:'dem',exaggeration:1.5});m.dragRotate.enable();m.touchZoomRotate.enableRotation();if(m.touchPitch)m.touchPitch.enable();}else{m.setTerrain(null);m.dragRotate.disable();m.touchZoomRotate.disableRotation();}}catch(err){console.warn('3b',err);}});
  A.easeTo(ucb?{pitch:60,bearing:-20,duration:1200}:{pitch:0,bearing:0,duration:800});};

/* ---------- görünümü PNG olarak kaydet ---------- */
$('kaydet').onclick=()=>{try{const ca=A.getCanvas(),cb=B.getCanvas(),w=ca.width,h=ca.height,dpr=w/ca.clientWidth,tek=$('maps').classList.contains('tek'),bar=Math.round(40*dpr);
  const c=document.createElement('canvas');c.width=w;c.height=h+bar;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);x.drawImage(ca,0,0);
  if(!tek){const sx=Math.round(w*parseFloat(getComputedStyle($('maps')).getPropertyValue('--split'))/100);x.drawImage(cb,sx,0,w-sx,h,sx,0,w-sx,h);x.fillStyle=PINK;x.fillRect(sx-dpr,0,2*dpr,h);}
  const a=imById[cur.A],b=imById[cur.B];x.textBaseline='middle';x.fillStyle='#fff';x.font=(11*dpr)+'px Helvetica, Arial, sans-serif';
  x.fillText('Dicle Vadisi Atlası · '+(tek?a.ad:'sol: '+a.ad+' · sağ: '+b.ad)+' · '+new Date().toISOString().slice(0,10),8*dpr,h+bar*.3,w-16*dpr);
  x.fillStyle=ORANGE;x.fillText('Görüntü: '+[...new Set([a.att,tek?null:b.att].filter(Boolean))].join(' · ')+' · Veri: OpenStreetMap, GeoNames',8*dpr,h+bar*.72,w-16*dpr);
  c.toBlob(bl=>{const l=document.createElement('a');l.href=URL.createObjectURL(bl);l.download='dicle-atlasi-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.png';document.body.appendChild(l);l.click();l.remove();});
 }catch(e){console.error('kaydet',e);}};

/* ---------- kütüphane ---------- */
const ER={acik:'Açık',kisitli:'Kısıtlı',bulunamadi:'Bulunamadı'};
const KUT=[
 {k:'belge',ad:'Belgeler',d:BLG,t:x=>x.baslik,s:x=>[x.yil,x.tur,ER[x.erisim]].filter(Boolean).join(' · '),e:x=>x.kurum,c:x=>x.erisim==='bulunamadi'?'ho':x.erisim==='kisitli'?'or':'',
  rows:x=>[['Kurum',esc(x.kurum)],['Yıl',x.yil?esc(x.yil):''],['Tür',esc(x.tur)],['Dil',esc(x.dil)],['Erişim',ER[x.erisim]||'']],n:x=>x.not},
 {k:'liste',ad:'Köy listeleri',d:LST,t:x=>x.liste_adi,s:x=>(x.koyler?x.koyler.length:0)+' köy',e:x=>x.kaynak,c:x=>'cy',
  rows:x=>[['Kaynak',esc(x.kaynak)],['Yıl',x.yil?esc(x.yil):''],['Köyler',(()=>{const g={};(x.koyler||[]).forEach(k=>{const a=[k.ilce,k.il].filter(Boolean).join(', ')||'Belirtilmemiş';(g[a]=g[a]||[]).push(k.ad);});return Object.entries(g).map(([a,l])=>'<b>'+esc(a)+':</b> '+esc(l.join(', '))).join('<br>');})()]],n:x=>x.not},
 {k:'harita',ad:'Tarihi haritalar',d:THR,t:x=>x.ad,s:x=>[x.yil,x.olcek].filter(Boolean).join(' · '),e:x=>x.yapan,c:x=>'or',
  rows:x=>[['Yapan',esc(x.yapan)],['Yıl',esc(x.yil)],['Ölçek',esc(x.olcek)],['Pafta',esc(x.pafta)],['Kapsam',esc(x.kapsam)],['Lisans',esc(x.lisans)]],n:x=>x.not},
 {k:'foto',ad:'Fotoğraf ve film arşivleri',d:FOT,t:x=>x.ad,s:x=>x.donem,e:x=>x.kurum,c:x=>'rd',
  rows:x=>[['Kurum',esc(x.kurum)],['Dönem',esc(x.donem)],['İçerik',esc(x.icerik)],['Kayıt no',esc(x.kayit_no)],['Adet',x.adet?esc(x.adet):''],['Lisans',esc(x.lisans)]],n:x=>x.not},
 {k:'goruntu',ad:'Görüntü kaynakları',d:GOR,t:x=>x.ad,s:x=>x.kullanilabilir?'kullanılabilir':'kullanılamıyor',e:x=>x.saglayici,c:x=>x.kullanilabilir?'cy':'ho',
  rows:x=>[['Sağlayıcı',esc(x.saglayici)],['Tür',esc(x.kategori)],['Tarih aralığı',esc(x.tarih_araligi)],['Çözünürlük',esc(x.cozunurluk)],['Lisans',esc(x.lisans)],['Atıf',esc(x.atif_metni)],['Bu atlasta',x.kullanilabilir?'Web haritasında yüklenebilir':'Yüklenemiyor ya da izin yok']],n:x=>x.not},
 {k:'proje',ad:'Benzer projeler ve yöntem',d:BNZ,t:x=>x.ad,s:x=>[x.yil,x.tur].filter(Boolean).join(' · '),e:x=>x.yapan,c:x=>'',
  rows:x=>[['Yapan',esc(x.yapan)],['Yıl',esc(x.yil)],['Tür',esc(x.tur)],['Yöntem',esc(x.yontem)],['Bulgu',esc(x.bulgu)]],n:x=>''}
].filter(k=>k.d&&k.d.length);
let kt=KUT[0];
function kutCard(K,x){showCard({head:'<div><p class="eyebrow">Kütüphane · '+esc(K.ad)+'</p><h3>'+esc(K.t(x))+'</h3></div>',body:dl(K.rows(x))+not(K.n(x))+(x.url?'<div class="row"><a class="btn" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Kaynağa git</a>'+(x.diger_url?'<a class="btn" href="'+esc(x.diger_url)+'" target="_blank" rel="noopener noreferrer">İkinci bağlantı</a>':'')+'</div>':'')});}
function drawKut(){if(!kt)return;const q=$('ku-ara').value.trim().toLocaleLowerCase('tr');const L=kt.d.filter(x=>!q||JSON.stringify(x).toLocaleLowerCase('tr').includes(q));
  $('ku-say').textContent=L.length+' kayıt';const ul=$('ku-liste');ul.innerHTML='';
  L.forEach(x=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<i class="'+kt.c(x)+'"></i><span>'+esc(kt.t(x))+'</span><small>'+esc(kt.s(x)||'')+'</small>'+(kt.e(x)?'<em>'+esc(kt.e(x))+'</em>':'');b.onclick=()=>kutCard(kt,x);li.appendChild(b);ul.appendChild(li);});}
KUT.forEach(K=>{const b=document.createElement('button');b.type='button';b.textContent=K.ad+' ('+K.d.length+')';b.setAttribute('aria-pressed',K===kt);b.onclick=()=>{kt=K;$('ku-tur').querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',o===b));drawKut();};$('ku-tur').appendChild(b);});
$('ku-ara').addEventListener('input',drawKut);drawKut();

/* ---------- analiz ---------- */
const BIR={kisi:'kişi',hane:'hane',konut:'konut',yerlesim:'yerleşim',parsel:'parsel',diger:''},TR={resmi:'resmî',stk:'sivil toplum',akademik:'akademik',basin:'basın'};
if(SAYI)$('a-sayi').innerHTML=SAYI.slice().sort((a,b)=>(a.birim||'').localeCompare(b.birim||'')||(a.yil||0)-(b.yil||0)).map(s=>'<tr><td>'+esc(s.sayi)+'<small>'+esc(BIR[s.birim]||'')+'</small></td><td>'+esc(s.ne_sayiyor)+'<small>'+esc(s.kaynak)+(s.yil?', '+esc(s.yil):'')+(TR[s.tur]?' · '+TR[s.tur]:'')+(s.url?' · '+link(s.url,'bağlantı'):'')+'</small></td></tr>').join('');
if(ARK){const c={};ARK.features.forEach(f=>{const d=f.properties.durum||'bilinmiyor';c[d]=(c[d]||0)+1;});bars('a-ark',Object.entries(c).sort((a,b)=>b[1]-a[1]).map(e=>[DUR[e[0]]||e[0],e[1]]));}
if(KUN&&KUN.uretim&&KUN.uretim.length)bars('a-uretim',KUN.uretim.slice().sort((a,b)=>a.yil-b.yil).map(u=>[String(u.yil),u.gwh,sayi(u.gwh)+' GWh']),true);
let NUF=null;
if(WD){const t=()=>{const K=T.koy();if(!K.length)return setTimeout(t,200);const byId=Object.fromEntries(K.map(k=>[k.id,k]));const V=Object.entries(WD.k).map(([id,w])=>({id,w,k:byId[id]})).filter(o=>o.k);
  const uniq={};V.forEach(o=>{if(!uniq[o.w.wd]||o.w.es==='a')uniq[o.w.wd]=o;});const U=Object.values(uniq);
  bars('a-ad',[['Wikidata kaydıyla eşleşen',U.length],['Kürtçe adı kayıtlı',U.filter(o=>o.w.ku).length],['Ermenice adı kayıtlı',U.filter(o=>o.w.hy).length],['Arapça adı kayıtlı',U.filter(o=>o.w.ar).length],['Derlemede eski adı geçen',(KAD||[]).length]]);
  const yak=U.filter(o=>o.k.gol_iliskisi!=='kiyi_3km'),yrs=[];for(let y=2007;y<=2024;y++)yrs.push(y);
  const tam=yak.filter(o=>{const m=Object.fromEntries(o.w.pop);return yrs.every(y=>m[y]!=null);});
  const top=yrs.map(y=>[String(y),tam.reduce((s,o)=>s+Object.fromEntries(o.w.pop)[y],0)]);
  bars('a-nufus',top.map(r=>[r[0],r[1],sayi(r[1])]),false);$('a-nufus-not').textContent='Göl sınırı içindeki ve kıyıdan 1 km içindeki yerleşimlerden 2007 ile 2024 arasında her yıl nüfusu kayıtlı olan '+tam.length+' yerleşimin toplamı. Kaynak: Wikidata kayıtlarındaki yıllık köy nüfusları.';
  const kay=yak.map(o=>{const m=Object.fromEntries(o.w.pop);return m[2019]>=30&&m[2024]!=null?{ad:o.k.ad,a:m[2019],b:m[2024],o:(m[2024]-m[2019])/m[2019]}:null;}).filter(Boolean).sort((a,b)=>a.o-b.o).slice(0,10);
  bars('a-kayip',kay.map(k=>[k.ad,Math.round(-k.o*100),k.a+' → '+k.b+' (%'+Math.round(-k.o*100)+')']),true);
  NUF={U,tam,top,kay};};t();}

/* ---------- yeni dosyalar ---------- */
const liste=(id,items,fn)=>'<ul class="liste" id="'+id+'">'+items.map((x,i)=>'<li><button type="button" data-i="'+i+'">'+fn(x)+'</button></li>').join('')+'</ul>';
const bagla=(id,items,fn)=>{const u=$(id);if(u)u.querySelectorAll('button').forEach(b=>b.onclick=()=>fn(items[+b.dataset.i]));};
if(ARK){const fs=ARK.features,n=fs.length,ko=pts(ARK).features.length,c={};fs.forEach(f=>{const d=f.properties.durum||'bilinmiyor';c[d]=(c[d]||0)+1;});
 addDos({no:'08',ad:'Kurtarma kazıları: su altındaki arkeoloji',soru:'Baraj alanında hangi alanlar kazıldı, hangilerinin akıbeti biliniyor?',sayi:String(n),view:null,im:['s2018','s2022'],on:['g-kazi','g-ark'],
  bulgu:['Derlenen yayınlarda baraj gölü alanında adı geçen '+n+' arkeolojik alan ve kurtarma kazısı var. '+ko+' tanesinin konumu haritada işaretli.','Duruma göre: '+Object.entries(c).map(e=>(DUR[e[0]]||e[0]).toLocaleLowerCase('tr')+' '+e[1]).join(', ')+'.','Alanların çoğunda dönem, kazı yılı ve su altı durumu derlenen kaynaklarda yazmıyor. Kartlarda boş kalan alanlar bu yüzden boş.','Üçgenler bu dosyanın alanlarıdır. Küçük siyah noktalar 2022 haritasındaki arkeolojik alan kayıtlarıdır.'],
  yontem:'Alan listesi araştırma raporunda derlenen yayınlardan alındı. Kaynakta koordinat yoksa konum atlasın harita katmanlarındaki aynı adlı kayıttan alındı ve yaklaşık olarak işaretlendi.',
  acik:'Alanların su altında kalıp kalmadığı yayınlardan değil, göl sınırı hesabından geliyor. Kazı raporlarıyla tek tek doğrulanmalı. Yaklaşık konumlar 1 ile 2 km kayabilir.',
  kaynak:'Araştırma raporu, 17.11.2026; Ökse ve diğerleri 2008; OpenStreetMap; GeoNames.',git:[['Kütüphane','#kutuphane'],['Katmanlar','#katmanlar']],
  ek:()=>'<h2>Alanlar</h2>'+liste('d-kazi',fs,f=>'<i class="'+(f.geometry?'or':'ho')+'"></i><span>'+esc(f.properties.ad)+'</span><small>'+esc((DUR[f.properties.durum]||'').toLocaleLowerCase('tr'))+'</small>'+(f.properties.donem?'<em>'+esc(f.properties.donem)+'</em>':'')),
  sonra:()=>bagla('d-kazi',fs,f=>{const c2=f.geometry&&f.geometry.coordinates;kaziCard(f.properties,c2);if(c2){A.flyTo({center:c2,zoom:13.5,duration:1200});toMap();}})});}
if(SAYI||YY){const kisi=(SAYI||[]).filter(s=>s.birim==='kisi'),yf=YY?YY.features:[];
 addDos({no:'09',ad:'Yeniden yerleşim ve sayma siyaseti',soru:'Kaç kişi yerinden edildi, nereye yerleştirildi? Sayılar kimin saydığına göre değişiyor.',sayi:kisi.length?kisi.length+' sayı':'',view:[41.4205,37.7335,13.6],im:['w10','w41468'],on:['g-yy','g-koyin'],
  bulgu:kisi.slice(0,7).map(s=>s.sayi+' kişi: '+s.ne_sayiyor+' ('+s.kaynak+(s.yil?', '+s.yil:'')+').').concat(yf.length?['Derlenen kaynaklarda adı geçen yeni yerleşimler: '+yf.map(f=>f.properties.ad+(f.properties.konut_sayisi?' ('+f.properties.konut_sayisi+' konut)':'')).join(', ')+'.']:[]),
  yontem:'Sayılar yayımlanmış rapor, açıklama ve makalelerden derlendi. Her sayı için neyin sayıldığı ve kaynağı Analiz bölümündeki tabloda yazar.',
  acik:'Yeniden yerleşim planının ve çevresel etki raporunun köy köy ekleri bulunamadı. Bu yüzden sayıların hangi yerleşimleri kapsadığı karşılaştırılamıyor. Çattepe ve Kesmeköprü için yeni yerleşim kaynağı bulunamadı.',
  kaynak:'Araştırma raporu, 17.11.2026; adı geçen yayınlar.',git:[['Sayılar tablosu','#analiz'],['Belgeler','#kutuphane']],
  ek:()=>yf.length?'<h2>Yeni yerleşimler</h2>'+liste('d-yy',yf,f=>'<i class="'+(f.geometry?'cy':'ho')+'"></i><span>'+esc(f.properties.ad)+'</span><small>'+(f.properties.konut_sayisi?esc(f.properties.konut_sayisi)+' konut':'')+'</small>'):'',
  sonra:()=>bagla('d-yy',yf,f=>{const c2=f.geometry&&f.geometry.coordinates;yyCard(f.properties,c2);if(c2){A.flyTo({center:c2,zoom:14,duration:1200});toMap();}})});}
if(KUN||BRJ){const bf=BRJ?BRJ.features:[];
 addDos({no:'10',ad:'Baraj ve havza',soru:'Barajın teknik künyesi, ürettiği elektrik ve aşağı havzaya etkisi.',sayi:'1.200 MW',view:[41.85,37.535,11.6],im:['w10','w41468'],on:['g-brj','g-gol'],
  bulgu:(KUN&&KUN.asagi_havza?KUN.asagi_havza.map(h=>h.baslik+'. '+h.not):[]).concat(bf.length?['Yukarı Dicle ve kollarında derlenen '+bf.length+' baraj kaydı var, '+pts(BRJ).features.length+' tanesinin konumu işaretli.']:[]).concat(KUN&&KUN.su_seviyesi&&!KUN.su_seviyesi.length?['Göl su seviyesi için kamuya açık bir zaman serisi bulunamadı. Olası kaynaklar aşağıda listelendi.']:[]),
  yontem:'Teknik değerler resmî kurum sayfalarından ve yayınlardan derlendi. Kaynakların farklı değer verdiği yerde iki değer de tabloda durur.',
  acik:'Kret uzunluğu, gövde hacmi, depolama hacmi ve göl alanı için kaynaklar farklı değerler veriyor. Ilısu ve Batman dışındaki barajların konumu ve yılı doğrulanmadı.',
  kaynak:'Araştırma raporu, 17.11.2026; DSİ; Batman Valiliği; Eroğlu 2022; Enerji Atlası.',git:[['Üretim grafiği','#analiz'],['Belgeler','#kutuphane']],
  ek:()=>(KUN&&KUN.teknik&&KUN.teknik.length?'<h2>Teknik künye</h2><table class="tbl">'+KUN.teknik.map(t=>'<tr><td style="font-size:12px;font-weight:400">'+esc(t.ozellik)+'</td><td>'+esc(t.deger)+'<small>'+src(t.kaynak,t.url)+'</small></td></tr>').join('')+'</table>':'')+
   (KUN&&KUN.su_seviyesi_kaynaklari&&KUN.su_seviyesi_kaynaklari.length?'<h2>Su seviyesi için olası kaynaklar</h2><ul>'+KUN.su_seviyesi_kaynaklari.map(s=>'<li>'+link(s.url,s.ad)+'. '+esc(s.not)+'</li>').join('')+'</ul>':'')+
   (bf.length?'<h2>Barajlar</h2>'+liste('d-brj',bf,f=>'<i class="'+(f.geometry?'':'ho')+'"></i><span>'+esc(f.properties.ad)+'</span><small>'+esc([f.properties.nehir,f.properties.yil].filter(Boolean).join(' · '))+'</small>'):''),
  sonra:()=>bagla('d-brj',bf,f=>{const c2=f.geometry&&f.geometry.coordinates;brjCard(f.properties,c2);if(c2){A.flyTo({center:c2,zoom:11.5,duration:1200});toMap();}})});}
if(WD){addDos({no:'11',ad:'Yer adları ve nüfus',soru:'Köylerin başka dillerdeki adları ve su geldikten sonra nüfusa ne olduğu.',sayi:'2007-2024',view:null,im:['s2018','s2022'],on:['g-koyin','g-koyk1'],
  get bulgu(){if(!NUF)return ['Veri yükleniyor, dosyayı yeniden aç.'];const t=NUF.top,a=t[0],b=t.find(r=>r[0]==='2019'),c=t[t.length-1];return ['Göl çevresindeki 260 yerleşim noktasından '+NUF.U.length+' tanesi bir Wikidata kaydıyla eşleşti. '+NUF.U.filter(o=>o.w.ku).length+' tanesinin Kürtçe, '+NUF.U.filter(o=>o.w.hy).length+' tanesinin Ermenice adı kayıtlı.','Göl içindeki ve kıyıdaki '+NUF.tam.length+' yerleşimin toplam nüfusu '+a[0]+' yılında '+sayi(a[1])+', 2019 yılında '+sayi(b[1])+', '+c[0]+' yılında '+sayi(c[1])+'.'].concat(NUF.kay.length?['2019 ile 2024 arasında en çok nüfus kaybedenler: '+NUF.kay.slice(0,5).map(k=>k.ad+' ('+k.a+' → '+k.b+')').join(', ')+'.']:[]).concat(['Bir yerleşime dokununca kartında adları, nüfus eğrisi ve önce sonra görüntüleri açılır.']);},
  yontem:'Yerleşim noktaları Wikidata kayıtlarıyla önce ada, sonra konuma göre eşleştirildi. Adlar ve yıllık nüfuslar Wikidata kayıtlarından alındı. Nüfus değerleri oradaki adrese dayalı nüfus kayıtlarıdır.',
  acik:'Adların dili Wikidata etiketine göre yazıldı, kökeni doğrulanmadı. Köy nüfusu, köye kayıtlı kişi sayısıdır, köyde yaşayan kişi sayısı olmayabilir. Mahalleye dönüşen köylerde seri kesilir. Su altında kalan yerleşimlerin yalnızca bir kısmı eşleşti.',
  kaynak:'Wikidata, sorgu 18.11.2026; GeoNames; köy adları derlemesi.',git:[['Nüfus grafikleri','#analiz'],['Yerleşim dizini','#yerlesimler']]});}
/* var olan dosyalara ek denetimler */
const D3=T.DOS.find(d=>d.no==='03');if(D3){D3.ek=()=>'<h2>Gün gün izle</h2><p class="small">Günlük uydu görüntüsüyle Haziran 2019 ile Haziran 2021 arası. Su vurgulu görüntüde su siyah ve koyu mavi, bulut açık mavi görünür. Çözünürlük 250 metredir.</p><div class="row"><button type="button" class="btn" id="d-gun">Dolumu gün gün izle</button><button type="button" class="btn" id="d-jrc">Yeni kalıcı suyu göster</button></div>';
  D3.sonra=()=>{$('d-gun').onclick=openGun;$('d-jrc').onclick=()=>{turnOn('g-jrct');fitAll();toMap();};};}
if(WBC){const D2=T.DOS.find(d=>d.no==='02');const yer=WBC.hasankeyf||Object.values(WBC)[0];if(D2&&yer&&yer.cekimler){const WBu=n=>'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+n+'/{z}/{y}/{x}';
  yer.cekimler.forEach(c=>{const id='wc'+c[1];imById[id]={id,ad:'Yüksek çözünürlük · çekim '+c[0]+' (Hasankeyf)',max:17,tiles:[WBu(c[1])],att:'Esri World Imagery Wayback, çekim '+c[0]+(c[4]?' ('+c[4]+')':'')};['A','B'].forEach(s=>{const o=document.createElement('option');o.value=id;o.textContent=imById[id].ad;$('im'+s).appendChild(o);});});
  D2.ek=()=>'<h2>Yakın plan serisi, gerçek çekim tarihleriyle</h2><p class="small">Hasankeyf çarşısı noktasında arşivdeki görüntülerin çekim tarihleri. Bir tarihe dokununca sağ taraf o çekime geçer.</p><div class="chips" id="d-wb">'+yer.cekimler.map(c=>'<button type="button" data-id="wc'+c[1]+'">'+esc(c[0])+'</button>').join('')+'</div>';
  D2.sonra=()=>{$('d-wb').querySelectorAll('button').forEach(b=>b.onclick=()=>{setIm(null,b.dataset.id);A.flyTo({center:[41.4118,37.7137],zoom:15.5,duration:1000});toMap();});};}}
if($('src'))['Kürtçe, Ermenice, Arapça adlar ve yıllık köy nüfusları: Wikidata, sorgu 18.11.2026. CC0.','Su yüzeyi geçişleri ve su görülme sıklığı: JRC Global Surface Water 1984-2021, Pekel ve diğerleri 2016. Source: EC JRC/Google.','Günlük uydu görüntüsü: NASA EOSDIS GIBS, MODIS Terra düzeltilmiş yansıtım.','Kabartma: Esri World Hillshade.','Arkeolojik alanlar, yeni yerleşimler, barajlar, belgeler, sayılar, tarihi haritalar ve arşivler: 17.11.2026 tarihli araştırma raporunda derlenen kaynaklar. Her kayıtta kendi kaynağı yazar.','Yazı tipi: Unbounded, SIL Open Font License.'].forEach(s=>{const li=document.createElement('li');li.textContent=s;$('src').appendChild(li);});
Object.assign(T,{ARK,YY,BRJ,WD,openGun,koyCard,kaziCard});
})().catch(e=>console.error('ek',e));

/* Dicle Vadisi Atlası 0.2: dosyalar, olaylar ve zaman çizgisi, anıtlar, görsel arşiv.
   app.js'ten sonra yüklenir; A, B, setImagery, turnOn, bars, $, esc, imById, fitAll oradan gelir. */
window.__atlas.platformReady=(async function(){
const T=window.__atlas;const {A,B,setImagery,turnOn,bars,$,esc,imById,fitAll,GROUPS,RED,FONT,PINK,CYAN}=T;const ORANGE='#ff8a1f';
const J=u=>fetch(u).then(r=>r.json());
const [OL,AN,KO,KAM]=await Promise.all([J('data/olaylar.json'),J('data/anitlar.geojson'),J('data/korpus.json'),J('data/kamulastirma_2016.geojson')]);
const mob=()=>window.innerWidth<=860;
const toMap=()=>{if(mob())window.scrollTo({top:0,behavior:'smooth'});};
const AY=['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const dec=t=>{const p=String(t).split('-').map(Number);return p[0]+((p[1]||1)-1)/12+((p[2]||1)-1)/365;};
const trh=t=>{const p=String(t).split('-');return (p[2]?Number(p[2])+' ':'')+(p[1]?AY[Number(p[1])]+' ':'')+p[0];};
const SER={baraj:'Baraj',kasaba:'Kasaba',devlet:'Devlet',karsi:'Karşı'};
const SERU={baraj:'Baraj: karar, finans, inşaat',kasaba:'Kasaba: koruma, tahliye, taşıma, su',devlet:'Devletin gösteren ve sayan yüzü',karsi:'Karşı kayıt: kampanya, rapor, sanat'};
const imFor=y=>{const id=y<1988?'l1985':y<1996?'l1990':y<2012?'l2000':y<2017?'w10':y>2024?'s2024':'s'+y;return imById[id]?id:'s2018';};
const km=(a,b)=>{const R=6371,r=Math.PI/180,dy=(b[1]-a[1])*r,dx=(b[0]-a[0])*r,h=Math.sin(dy/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dx/2)**2;return 2*R*Math.asin(Math.sqrt(h));};

/* ---------- kayıt kartı ---------- */
const kart=$('kart');
function showCard(html,ns){kart.innerHTML='<div class="kh">'+html.head+'<button type="button" id="k-kapat" aria-label="Kartı kapat">Kapat</button></div>'+html.body;kart.hidden=false;$('k-kapat').onclick=()=>{kart.hidden=true;setSel(null);};if(!mob())$('side').scrollTo({top:0,behavior:'smooth'});else if(!ns)kart.scrollIntoView({behavior:'smooth',block:'start'});}
const dl=rows=>'<dl>'+rows.filter(r=>r[1]).map(r=>'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>').join('')+'</dl>';

/* ---------- harita katmanları ---------- */
const OLG={type:'FeatureCollection',features:OL.filter(o=>o.yer).map(o=>({type:'Feature',properties:{id:o.id,ad:o.ad,serit:o.serit},geometry:{type:'Point',coordinates:o.yer}}))};
const EMPTY={type:'FeatureCollection',features:[]};
const NL=[
 {id:'anit-hat',type:'line',source:'anit',filter:['==',['get','tur'],'hat'],paint:{'line-color':PINK,'line-width':1.6,'line-dasharray':[1.5,1.5]}},
 {id:'anit-yerinde',type:'circle',source:'anit',filter:['==',['get','tur'],'yerinde'],minzoom:11,paint:{'circle-radius':3.5,'circle-color':['case',['get','gol'],RED,'#111'],'circle-stroke-color':'#fff','circle-stroke-width':1}},
 {id:'anit-eski',type:'circle',source:'anit',filter:['==',['get','tur'],'eski'],paint:{'circle-radius':6,'circle-color':RED,'circle-stroke-color':'#fff','circle-stroke-width':1.6}},
 {id:'anit-yeni',type:'circle',source:'anit',filter:['==',['get','tur'],'yeni'],paint:{'circle-radius':6,'circle-color':'#fff','circle-stroke-color':'#000','circle-stroke-width':1.6}},
 {id:'anit-lab',type:'symbol',source:'anit',filter:['in',['get','tur'],['literal',['eski','yeni']]],minzoom:13.2,layout:{'text-field':['get','ad'],'text-font':FONT,'text-size':11,'text-offset':[0.8,0],'text-anchor':'left','text-optional':true},paint:{'text-color':'#fff','text-halo-color':'#000','text-halo-width':1.5}},
 {id:'kam',type:'circle',source:'kam',layout:{visibility:'none'},paint:{'circle-radius':7,'circle-color':'rgba(0,0,0,0)','circle-stroke-color':'#ffd400','circle-stroke-width':2.2}},
 {id:'kam-lab',type:'symbol',source:'kam',minzoom:10.5,layout:{visibility:'none','text-field':['get','ad'],'text-font':FONT,'text-size':11,'text-offset':[0.9,0],'text-anchor':'left','text-optional':true},paint:{'text-color':'#ffd400','text-halo-color':'#000','text-halo-width':1.5}},
 {id:'olay',type:'circle',source:'olay',layout:{visibility:'none'},paint:{'circle-radius':4,'circle-color':['match',['get','serit'],'kasaba',PINK,'devlet',ORANGE,'karsi',CYAN,'#fff'],'circle-stroke-color':'#000','circle-stroke-width':1}},
 {id:'sec',type:'circle',source:'sec',paint:{'circle-radius':15,'circle-color':'rgba(0,0,0,0)','circle-stroke-color':'#fff','circle-stroke-width':2.5}},
 {id:'sec2',type:'circle',source:'sec',paint:{'circle-radius':19,'circle-color':'rgba(0,0,0,0)','circle-stroke-color':PINK,'circle-stroke-width':1.5}}
];
const NG=[
 {id:'g-anit',ad:'Anıtlar: eski yer, yeni yer, taşınma hattı',alt:'Kırmızı eski yer, beyaz yeni yer',renk:RED,layers:['anit-hat','anit-eski','anit-yeni','anit-lab'],on:true},
 {id:'g-anity',ad:'Yerinde kalan kazı alanları ve yapılar',alt:'Kırmızı göl sınırı içinde, siyah dışında',renk:'#111',layers:['anit-yerinde'],on:true},
 {id:'g-kam',ad:'2016 acele kamulaştırma kararındaki köyler',alt:'Haber kaynaklı 48 köyden konumu bulunan '+KAM.features.length+' köy',renk:'#ffd400',layers:['kam','kam-lab'],on:false},
 {id:'g-olay',ad:'Olay yerleri',alt:'Konumu bilinen olaylar',renk:'#fff',layers:['olay'],on:false}
];
const mapReady=new Promise(ok=>{const t=()=>(A.getSource('gol')&&B.getSource('gol'))?ok():setTimeout(t,120);t();});
mapReady.then(()=>[A,B].forEach(m=>{m.addSource('anit',{type:'geojson',data:{type:'FeatureCollection',features:AN.features.filter(f=>f.geometry)}});m.addSource('olay',{type:'geojson',data:OLG});m.addSource('kam',{type:'geojson',data:KAM});m.addSource('sec',{type:'geojson',data:EMPTY});
  NL.forEach(l=>m.addLayer(JSON.parse(JSON.stringify(l))));
  ['anit-eski','anit-yeni','anit-yerinde','olay','kam'].forEach(id=>{m.on('click',id,e=>{const p=e.features[0].properties;id==='kam'?kamCard(p,e.features[0].geometry.coordinates):id==='olay'?selEvent(OL.find(o=>o.id===p.id),true):anitCard(p.ad,p.tur);});m.on('mouseenter',id,()=>m.getCanvas().style.cursor='pointer');m.on('mouseleave',id,()=>m.getCanvas().style.cursor='');});}));
const kl=$('katlist');const addGroup=g=>{GROUPS.push(g);const l=document.createElement('label');l.innerHTML='<input type="checkbox" id="'+g.id+'"'+(g.on?' checked':'')+'><i style="background:'+g.renk+'"></i><span>'+esc(g.ad)+'</span><small>'+esc(g.alt)+'</small>';kl.insertBefore(l,kl.firstChild);
  l.querySelector('input').onchange=e=>{g.on=e.target.checked;[A,B].forEach(m=>g.layers.forEach(id=>m.getLayer(id)&&m.setLayoutProperty(id,'visibility',g.on?'visible':'none')));};};NG.forEach(addGroup);
const setSel=c=>[A,B].forEach(m=>m.getSource('sec')&&m.getSource('sec').setData(c?{type:'Feature',properties:{},geometry:{type:'Point',coordinates:c}}:EMPTY));
const KR={gol_icinde:'göl sınırının içinde',kiyi_1km:'kıyıdan 1 km içinde',kiyi_3km:'kıyıdan 1 ile 3 km arası',uzak:'kıyıdan 3 km\'den uzak'};
function kamCard(p,c){showCard({head:'<div><p class="eyebrow">Acele kamulaştırma, 2016</p><h3>'+esc(p.ad)+'</h3></div>',body:dl([['İl, ilçe',esc(p.il)+', '+esc(p.ilce)],['Göle göre',KR[p.gol_iliskisi]],['Kaynak','Enerji Günlüğü, 14.10.2016 Resmî Gazete haberi'],['Konum','GeoNames ad eşleşmesi']])+'<p class="not">Karar köyün kendisini değil, göl altında kalacak köy yollarının taşınması için bazı taşınmazları kapsar.'+(p.aday>1?' Bu adla '+p.aday+' kayıt var, göle en yakın olanı seçildi. Konum belirsiz.':'')+'</p>'});setSel(c);}
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
   body:dl([['Tarih',esc(trh(o.t))+(o.t2?' ile '+esc(trh(o.t2)):'')],['Yer',o.yer?o.yer[1].toFixed(4)+', '+o.yer[0].toFixed(4):'Haritada tek bir yeri yok'],['Kaynak',esc(o.kaynak)],['Görüntü',esc(imById[im].ad)]])+(o.teyit?'<p class="not"><b>Açık nokta.</b> '+esc(o.teyit)+'</p>':'')+
   '<div class="row"><button type="button" id="e-on">Önceki</button><button type="button" id="e-son">Sonraki</button>'+(o.yer?'<button type="button" id="e-git">Haritada göster</button>':'')+'</div>'});
  $('e-on').onclick=()=>selEvent(OL[Math.max(0,i-1)],true);$('e-son').onclick=()=>selEvent(OL[Math.min(OL.length-1,i+1)],true);
  if(o.yer){$('e-git').onclick=()=>{go();toMap();};}
  function go(){A.flyTo({center:o.yer,zoom:o.yer[0]>41.7?12.4:14.3,duration:1300});}
  setIm(o.y>=2019?'s2018':null,im);setSel(o.yer||null);if(fly&&o.yer)go();}

/* ---------- olaylar paneli ---------- */
let serF='';const os=$('o-serit');
[['','Hepsi']].concat(Object.entries(SER)).forEach(([k,v])=>{const b=document.createElement('button');b.type='button';b.textContent=v;b.setAttribute('aria-pressed',k===serF);b.onclick=()=>{serF=k;os.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));drawEv();};os.appendChild(b);});
function drawEv(){const ol=$('o-liste');ol.innerHTML='';OL.filter(o=>!serF||o.serit===serF).forEach(o=>{const li=document.createElement('li');li.className='t';li.tabIndex=0;li.innerHTML='<b>'+esc(trh(o.t))+'</b><span><i class="'+o.serit+'"></i>'+esc(o.ad)+'<small>'+esc(o.kaynak)+(o.teyit?' · açık nokta var':'')+'</small></span>';li.onclick=()=>{selEvent(o,true);};li.onkeydown=e=>{if(e.key==='Enter')selEvent(o,true);};ol.appendChild(li);});}
drawEv();

/* ---------- anıtlar ---------- */
const AF=AN.features,byAd={};
AF.forEach(f=>{const p=f.properties;(byAd[p.ad]=byAd[p.ad]||{p,ad:p.ad})[p.tur]=f.geometry&&f.geometry.coordinates;});
const ANIT=Object.values(byAd).filter(a=>a.p.akibet!=='yerinde'),YER=Object.values(byAd).filter(a=>a.p.akibet==='yerinde');
ANIT.forEach(a=>{if(a.eski&&a.yeni)a.km=km(a.eski,a.yeni);});
const AK={tasindi:'Taşındı',kismi:'Kısmen taşındı',birakildi:'Yerinde bırakıldı, su altında',celiski:'Kaynaklar çelişiyor',yerinde:'Yerinde'};
function anitCard(ad,tur){const a=byAd[ad];if(!a)return;const p=a.p,c=a[tur]||a.eski||a.yeni||a.yerinde;
  showCard({head:'<div><p class="eyebrow">Anıt kaydı</p><h3>'+esc(ad)+'</h3></div>',
   body:dl([['Durum',AK[p.akibet]+(p.akibet==='yerinde'?(p.gol?', göl sınırının içinde':', göl sınırının dışında'):'')],['Yapım',esc(p.yapim)],['Taşıma',esc(p.tarih)],['Mesafe',a.km?a.km.toFixed(2).replace('.',',')+' km, kuş uçuşu':''],['Kaynak',esc(p.kaynak)]])+(p.not?'<p class="not">'+esc(p.not)+'</p>':'')+(T.anitHook?T.anitHook(ad):'')+
   '<div class="row">'+(a.eski?'<button type="button" id="a-e">Eski yer</button>':'')+(a.yeni?'<button type="button" id="a-y">Yeni yer</button>':'')+(a.eski&&a.yeni?'<button type="button" id="a-b">İkisi birlikte</button>':'')+'</div>'});
  const fl=k=>{A.flyTo({center:k,zoom:16,duration:1200});setSel(k);toMap();};
  if(a.eski)$('a-e').onclick=()=>{setIm('w13045','w41468');fl(a.eski);};if(a.yeni)$('a-y').onclick=()=>{setIm('w13045','w41468');fl(a.yeni);};
  if(a.eski&&a.yeni)$('a-b').onclick=()=>{A.fitBounds([[Math.min(a.eski[0],a.yeni[0]),Math.min(a.eski[1],a.yeni[1])],[Math.max(a.eski[0],a.yeni[0]),Math.max(a.eski[1],a.yeni[1])]],{padding:70,duration:1200});setSel(null);toMap();};
  if(c)setSel(c);}
const li=(a,cls,sub)=>{const l=document.createElement('li'),b=document.createElement('button');b.type='button';b.innerHTML='<i class="'+cls+'"></i><span>'+esc(a.ad)+'</span><small>'+esc(sub)+'</small>'+(a.p.tarih?'<em>'+esc(a.p.tarih)+'</em>':'');b.onclick=()=>{anitCard(a.ad);const c=a.eski||a.yeni||a.yerinde;if(c){A.flyTo({center:c,zoom:15.5,duration:1200});toMap();}};l.appendChild(b);return l;};
ANIT.forEach(a=>$('an-liste').appendChild(li(a,a.p.akibet==='tasindi'?'sq':a.p.akibet==='birakildi'?'':'ho',AK[a.p.akibet])));
YER.sort((a,b)=>b.p.gol-a.p.gol).forEach(a=>$('an-yer').appendChild(li(a,a.p.gol?'':'ho',a.p.gol?'göl sınırı içinde':'dışında')));
const nT=ANIT.filter(a=>a.p.akibet==='tasindi').length,nK=ANIT.filter(a=>a.p.akibet!=='tasindi').length,nYi=YER.filter(a=>a.p.gol).length,kms=ANIT.filter(a=>a.km).map(a=>a.km);
$('an-ozet').innerHTML=[[nT,'yapı taşındı'],[nK,'yapı kısmen taşındı, bırakıldı ya da belirsiz'],[nYi+' / '+YER.length,'yerinde kalan alan göl sınırının içinde'],[Math.min(...kms).toFixed(1).replace('.',',')+' ile '+Math.max(...kms).toFixed(1).replace('.',',')+' km','taşınma mesafesi']].map(r=>'<div><b>'+r[0]+'</b><span>'+r[1]+'</span></div>').join('');
bars('an-mes',ANIT.filter(a=>a.km).sort((a,b)=>b.km-a.km).map(a=>[a.ad,a.km,a.km.toFixed(2).replace('.',',')+' km']),true);

/* ---------- görsel arşiv ---------- */
const kats=[...new Set(KO.map(k=>k.kat))];kats.forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k+' ('+KO.filter(x=>x.kat===k).length+')';$('k-kat').appendChild(o);});
let kN=45;
function korCard(k){showCard({head:'<div><p class="eyebrow">Görsel arşiv · '+esc(k.id)+' · '+esc(k.kat)+'</p><h3>'+esc(k.baslik)+'</h3></div>',
  body:(k.img?'<img src="'+esc(k.img)+'" alt="" onerror="this.remove()">':'')+dl([['Üretici',esc(k.uretici)],['Tarih',esc(k.tarih)],['Tür',esc(k.tip)]])+(k.not?'<p class="not">'+esc(k.not)+'</p>':'')+
  '<div class="row">'+(k.link?'<a class="btn" href="'+esc(k.link)+'" target="_blank" rel="noopener noreferrer">Kaynağa git</a>':'')+(k.yil&&k.yil>=1985?'<button type="button" id="k-yil">'+k.yil+' görüntüsünü aç</button>':'')+'</div>'});
  if($('k-yil'))$('k-yil').onclick=()=>{setIm(null,imFor(k.yil));toMap();};}
function drawK(){const q=$('k-ara').value.trim().toLocaleLowerCase('tr'),kat=$('k-kat').value,dn=$('k-don').value.split('-').map(Number);
  const r=KO.filter(k=>(!kat||k.kat===kat)&&(!$('k-don').value||(k.yil&&k.yil>=dn[0]&&k.yil<=dn[1]))&&(!q||(k.baslik+' '+k.uretici+' '+k.not).toLocaleLowerCase('tr').includes(q)));
  $('k-say').textContent=r.length+' kayıt';const g=$('k-grid');g.innerHTML='';
  r.slice(0,kN).forEach(k=>{const b=document.createElement('button');b.type='button';b.innerHTML=(k.img?'<img loading="lazy" src="'+esc(k.img)+'" alt="" onerror="this.outerHTML=\'<div class=ph></div>\'">':'<div class="ph"></div>')+'<span>'+esc(k.baslik)+'</span><small>'+esc(k.yil||'tarihsiz')+' · '+esc(k.kat)+'</small>';b.onclick=()=>korCard(k);g.appendChild(b);});
  $('k-daha').hidden=r.length<=kN;}
['k-ara','k-kat','k-don'].forEach(id=>$(id).addEventListener('input',()=>{kN=45;drawK();}));$('k-daha').onclick=()=>{kN+=60;drawK();};drawK();
const DON=[['2005 ve öncesi',0,2005],['2006 ile 2016',2006,2016],['2017 ile 2018',2017,2018],['2019 ile 2020',2019,2020],['2021 ve sonrası',2021,2100]];
bars('a-kkat',kats.map(k=>[k,KO.filter(x=>x.kat===k).length]).sort((a,b)=>b[1]-a[1]));
bars('a-kdon',DON.map(d=>[d[0],KO.filter(k=>k.yil&&k.yil>=d[1]&&k.yil<=d[2]).length]),true);
bars('a-oser',LANE.map(s=>[SERU[s],OL.filter(o=>o.serit===s).length]));

/* ---------- dosyalar ---------- */
const kmr=kms.length?Math.min(...kms).toFixed(1).replace('.',',')+' ile '+Math.max(...kms).toFixed(1).replace('.',','):'';
const DOS=[
 {no:'01',ad:'Kaç yerleşim su altında kaldı?',soru:'Yayımlanmış sayılar 69 ile 199 arasında. Fark nereden geliyor?',sayi:'73',view:null,im:['s2018','s2021'],on:['g-koyin','g-koyk1','g-iz'],
  bulgu:['Göl sınırı poligonunun içine 73 yerleşim noktası düşüyor: Batman 29, Siirt 21, Diyarbakır 12, Mardin 6, Şırnak 5.','Bunların 70\'inin dolum öncesi arazi yüksekliği 525 metrelik su kotunun altında.','Kıyı çizgisine 1 km içinde 102 yerleşim daha var. Bunlar su altında değil, ama tarlası, yolu ya da mezarlığı su altında kalmış olabilir.','Ağustos 2022 haritasında göl içinde 68 konut kümesi hâlâ çizili duruyor. 66\'sı bir yer adıyla eşleşti.','Yayımlanmış sayılar: 199 (Uzmanlar Komitesi 2008, HYG), 184 (Morvaridi 2004), 108 (Bimay 2021), 104 (Eroğlu 2022), 80 (Aliefendioğlu 2016), 69 (Bakanlık kaynaklı). Fark, mezraların ve önceden boşaltılmış köylerin sayılıp sayılmamasına bağlı.'],
  yontem:'Göl sınırı poligonu, yerleşim noktaları ve 2022 harita verisiyle kesiştirildi. Yükseklik değeri yer adı veritabanındaki sayısal yükseklik modelinden gelir.',
  acik:'Birincil köy listesi, yani yeniden yerleşim planı ve çevresel etki raporunun ekleri henüz bulunamadı. Aynı köy iki adla iki kez sayılmış olabilir: Gündük ve Müdevver, Başarı ve İkiyaka, Kumçay ve Kumgeçit, Yazlıca ve Çattepe. 73 sayısı doğrulanmış bir liste değildir.',
  kaynak:'GeoNames; OpenStreetMap, Ağustos 2022; araştırmacının arşivindeki göl sınırı katmanı; adı geçen yayınlar.',git:[['Yerleşim dizini','#yerlesimler'],['Sayılar tablosu','#analiz']]},
 {no:'02',ad:'Hasankeyf: ne taşındı, ne bırakıldı?',soru:'Anıtların eski ve yeni yeri, taşınma tarihi ve kaynakların çeliştiği yerler.',sayi:nT+' + '+nK,view:[41.4165,37.7205,14.1],im:['w13045','w41468'],on:['g-anit','g-anity','g-ark'],
  bulgu:['Mayıs 2017 ile Aralık 2019 arasında '+nT+' yapı ya da yapı parçası eski kentten Kültür Park\'a taşındı. İlki 12 Mayıs 2017\'de Zeynel Bey Türbesi, sonuncusu 16 Aralık 2019\'da Er-Rızk Camii\'nin ana gövdesi.','Eski ve yeni yeri bilinen dört yapıda taşınma mesafesi kuş uçuşu '+kmr+' km. Yapılar yan yana, tek bir parkta toplandı.','Artuklu Köprüsü\'nün ayakları 2006 listesinde taşınacaklar arasındaydı, taşınmadı. Süleyman Han Camii\'nin yalnızca minaresi, çeşmesi ve taç kapısı taşındı, ana yapı dolgu içinde kaldı.','10 Ağustos 2017\'de kayalar patlatıldı, 200\'den fazla mağara dolduruldu, kalenin çevresine 60 metreyi aşan set yapıldı.','Haritada kayıtlı '+YER.length+' kazı alanı ve yapının '+nYi+' tanesi göl sınırının içinde.'],
  yontem:'Taşıma tarihleri yayımlanmış kaynaklardan, eski ve yeni konumlar gönüllü haritalamadan alındı. Mesafe iki nokta arasında kuş uçuşu hesaplandı.',
  acik:'Koç Camii için kaynaklar çelişiyor: resmî anlatı yapının su altında bırakıldığını yazıyor, haritada Kültür Park içinde bu adla bir yapı kayıtlı. Orta Kapı\'nın yeni yeri ve Süleyman Han ile Kızlar Camii\'nin eski yeri henüz işaretli değil. Er-Rızk için 720 ve 1.700 ton olarak iki ağırlık veriliyor.',
  kaynak:'Eroğlu 2022; HYG 2017 ve 2019; Aykan 2024; Anadolu Ajansı; OpenStreetMap, sorgu 16.11.2026.',git:[['Anıt kayıtları','#anitlar'],['Olaylar','#olaylar']]},
 {no:'03',ad:'Dolum: su ne zaman, nereye geldi?',soru:'Resmî dil test dedi. Uydu görüntüleri ne gösteriyor?',sayi:'19.7.2019',view:[41.413,37.716,12.6],im:['s2019','s2020'],on:['g-gol','g-koyin'],
  bulgu:['Kapaklar 19 Temmuz 2019\'da kapandı. Kaynaklar 19 ile 23 Temmuz arasında farklı günler veriyor, kamuoyuna önce test denildi.','8 Ekim 2019\'da eski Hasankeyf güvenlik çemberine alındı, 4 Kasım 2019\'da çarşı yıkıldı ve eski yol kapandı.','Su eski kente 2020 başında ulaştı. İlk türbin 19 Mayıs 2020\'de devreye girdi.','Yıllık uydu mozaiklerinde göl sınırı içindeki su payı: 2018\'de yüzde 8, 2019\'da yüzde 20, 2020\'de yüzde 82, 2021\'de yüzde 62, 2024\'te yüzde 84. Bu kaba bir tahmindir.','Göl sınırı katmanının hesaplanan alanı 318 km², resmî rakam 313 km².'],
  yontem:'Sentinel-2 yıllık mozaiklerinde göl sınırı içindeki koyu yüzeyin payı ölçüldü. Dolumdan önceki yüzde 8, nehir yatağı ve gölgelerdir.',
  acik:'Yıllık mozaik tek bir günü göstermez. Suyun köy köy ne zaman geldiğini söylemek için tarihli görüntüler ve kızılötesi bantla su indeksi gerekir. Bu analiz henüz yapılmadı.',
  kaynak:'DSİ; HYG 2019; Hasankeyf Koordinasyonu 2019; NASA Earth Observatory 2020; Sentinel-2 cloudless, EOX.',git:[['Su yüzeyi grafiği','#analiz'],['Olaylar','#olaylar']]},
 {no:'04',ad:'Kopan bağlantılar: yollar, köprüler, nehirler',soru:'Su yalnızca köyleri değil, köylerin arasındaki bağı da kapattı.',sayi:'306 km',view:null,im:['s2018','s2022'],on:['g-yol','g-su','g-yolbag'],
  bulgu:['Ağustos 2022 haritasında göl sınırı içinde 306 km yol hâlâ çizili: 134 km köy yolu, 71 km tarla yolu, 54 km il yolu, 16 km ana yol.','Göl içinde kalan nehir ve çay uzunluğu 443 km: Dicle 174, Garzan 47, Botan 44, Gökçesu 17, Batman Çayı 17 km.','Eski Batman yolu 1955\'ten 4 Kasım 2019\'a kadar kullanıldı.'],
  yontem:'Yol ve su yolu çizgilerinin göl sınırı içinde kalan uzunluğu hesaplandı.',
  acik:'Hangi köyler arasında yol süresinin ne kadar uzadığı, yani ağ analizi henüz yapılmadı. Yol verisi gönüllü haritalamaya dayanır, eksiktir.',
  kaynak:'OpenStreetMap, Ağustos 2022; soL Haber 2019; Köm ve Özdemir 2023.',git:[['Yol ve su grafikleri','#analiz'],['Katmanlar','#katmanlar']]},
 {no:'05',ad:'Kamulaştırma ve hak sahipliği',soru:'Devlet kimi saydı, kimi saymadı?',sayi:'710 / 2.120',view:null,im:['s2017','s2021'],on:['g-kam','g-koyin'],
  bulgu:['26 Eylül 2016 tarihli acele kamulaştırma kararı 14 Ekim 2016\'da yayımlandı. Haberlere göre 4 ilde 50 köyde 990 parseli kapsıyor. Karar, göl altında kalacak köy yollarının taşınması içindir.','Haberde adı geçen 48 köy: Beşiri 12, Gercüş 2, Hasankeyf 2, Bismil 5, Siirt Merkez 14, Kurtalan 3, Eruh 4, Güçlükonak 6.','48 köyün '+KAM.features.length+' tanesi haritada bulundu. Bunların '+KAM.features.filter(f=>f.properties.gol_iliskisi==='gol_icinde').length+' tanesi göl sınırının içinde, '+KAM.features.filter(f=>f.properties.gol_iliskisi==='kiyi_1km').length+' tanesi kıyıdan 1 km içinde.','Listede Mardin ve Dargeçit köyleri yok. Bu liste su altında kalan köylerin listesi değildir.','Hasankeyf\'te 2.120 hak sahipliği başvurusundan 710\'u kabul edildi, 1.415\'i reddedildi. Yeni Hasankeyf için konut sayısı kaynaklara göre 698, 710, 875 olarak değişiyor.'],
  yontem:'Köy adları haberden alındı, yer adı veritabanıyla eşleştirildi. Aynı adla birden çok kayıt varsa göle en yakın olanı seçildi.',
  acik:'Kararın Resmî Gazete metni henüz görülmedi. Haber 50 köy diyor, adı sayılan 48. Beş köy haritada bulunamadı: Doğanpazarı, Kungeçit, Demirkaya, Kaleboğaz, Kayakgölü. Ad eşleşmesi belirsiz olan köylerin kartında not var.',
  kaynak:'Enerji Günlüğü ve Haberler.com, Ekim 2016; HYG 2017; Özdemirkol 2023; Hasankeyf Kaymakamlığı; Eroğlu 2022; GeoNames.',git:[['Olaylar','#olaylar'],['Katmanlar','#katmanlar']]},
 {no:'06',ad:'Görüntü rejimi: kim neyi gösterdi?',soru:'Devletin tanıtım görüntüsü ile karşı kayıtların arşivi.',sayi:String(KO.length),view:null,im:null,on:[],
  bulgu:['Arşivde '+KO.length+' kayıt var, '+kats.length+' kümede. En büyük kümeler: '+kats.map(k=>[k,KO.filter(x=>x.kat===k).length]).sort((a,b)=>b[1]-a[1]).slice(0,4).map(r=>r[0]+' '+r[1]).join(', ')+'.','Tarihi bilinen kayıtların '+KO.filter(k=>k.yil>=2017&&k.yil<=2020).length+' tanesi 2017 ile 2020 arasında, yani taşıma ve dolum yıllarında üretildi.','Her kayıtta üretici, tarih, tür ve kaynağa bağlantı var.'],
  yontem:'Kayıtlar araştırmanın görsel korpusundan gelir. Kümeler üreticiye ve bağlama göre kuruldu.',
  acik:'Kayıtların çekim yeri henüz işaretli değil. Yer bilgisi eklendiğinde görüntüler haritaya bağlanacak.',
  kaynak:'Visibility and Erasure görsel korpusu.',git:[['Görsel arşiv','#arsiv'],['Arşiv grafikleri','#analiz']]},
 {no:'07',ad:'Saha ve tanıklıklar',soru:'Bu dosya bilerek kapalı.',sayi:'kapalı',view:null,im:null,on:[],
  bulgu:['Araştırmacı 2019 ile 2026 arasında vadide on saha oturumu yaptı.','Saha fotoğraflarında konum verisi yok. Fotoğrafların yeri tek tek eşleştirilmeden haritaya konmayacak.','Görüşmeler ve görüşme yerleri, onay süreci tamamlanana kadar yayımlanmaz ve haritalanmaz.'],
  yontem:'',acik:'Fotoğrafların yer eşleştirmesi ve görüşme onayları sürüyor.',kaynak:'Araştırmacının saha arşivi.',git:[]}
];
const dl_=$('d-liste'),dd=$('d-detay');
const dosBtn=d=>{const b=document.createElement('button');b.type='button';b.innerHTML='<b>'+d.no+'</b><span>'+esc(d.ad)+'</span><strong>'+esc(d.sayi)+'</strong><em>'+esc(d.soru)+'</em>';b.onclick=()=>openDos(d);$('dos').appendChild(b);};DOS.forEach(dosBtn);const addDos=d=>{DOS.push(d);dosBtn(d);};
function openDos(d){dl_.hidden=true;dd.hidden=false;kart.hidden=true;setSel(null);
  dd.innerHTML='<div class="row"><button type="button" class="btn" id="d-geri">Bütün dosyalar</button></div><p class="eyebrow">Dosya '+d.no+'</p><h1>'+esc(d.ad)+'</h1><p>'+esc(d.soru)+'</p><h2>Bulgular</h2><ul>'+d.bulgu.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'+(d.yontem?'<h2>Yöntem</h2><p>'+esc(d.yontem)+'</p>':'')+'<h2>Açık sorular</h2><p class="acik">'+esc(d.acik)+'</p><h2>Kaynak</h2><p class="small">'+esc(d.kaynak)+'</p>'+(d.ek?d.ek():'')+(d.git.length?'<h2>Kayıtlar</h2><div class="row">'+d.git.map(g=>'<a class="btn" href="'+g[1]+'">'+esc(g[0])+'</a>').join('')+'</div>':'');
  $('d-geri').onclick=()=>{dd.hidden=true;dl_.hidden=false;};if(d.sonra)d.sonra();
  d.on.forEach(turnOn);if(d.im)setIm(d.im[0],d.im[1]);if(d.view)A.flyTo({center:[d.view[0],d.view[1]],zoom:d.view[2],duration:1400});else if(d.im)fitAll();
  if(!mob())$('side').scrollTo({top:0});}
Object.assign(T,{OL,ANIT,YER,KO,DOS,KAM,selEvent,openDos,showCard,dl,setSel,setIm,toMap,mob,addGroup,mapReady,addDos,imFor,km,trh,anitCard});
})().catch(e=>console.error('platform',e));

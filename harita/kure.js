/* Dicle Vadisi Atlası: küre. Visibility and Erasure görsel korpusu bir küre üzerinde:
   her görüntü üreticisinin bulunduğu kentin üstünde asılı durur, Hasankeyf'e bir hatla bağlanır.
   Bölümler katman olarak açılıp kapanır. Konumlar üreticinin merkezine göre anahtar sözcükle atanmıştır, yaklaşıktır. */
import * as THREE from './vendor/three/three.module.min.js';
import {OrbitControls} from './vendor/three/OrbitControls.js';

const H=document.documentElement,BASE=H.dataset.base||'',EN=H.lang==='en';
const S=EN?{kat:'Layers',bol:'Sections',hep:'All',hic:'None',diger:'Other layers',hat:'Lines to Hasankeyf',yer:'Place names',uydu:'Satellite fragments',gol:'Reservoir and Tigris',yor:'Orbits',bulut:'Clouds',yil:'Up to year',kayit:'records',ure:'Producer',tar:'Date',tur:'Type',konum:'Placed at',git:'Open source',atlas:'Open in atlas',kapat:'Close',yaklasik:'approximate, by producer seat'}
 :{kat:'Katmanlar',bol:'Bölümler',hep:'Hepsi',hic:'Hiçbiri',diger:'Diğer katmanlar',hat:'Hasankeyf\'e hatlar',yer:'Yer adları',uydu:'Uydu parçaları',gol:'Baraj gölü ve Dicle',yor:'Yörüngeler',bulut:'Bulutlar',yil:'Şu yıla kadar',kayit:'kayıt',ure:'Üretici',tar:'Tarih',tur:'Tür',konum:'Konum',git:'Kaynağa git',atlas:'Atlasta aç',kapat:'Kapat',yaklasik:'yaklaşık, üreticinin merkezine göre'};
const $=id=>document.getElementById(id),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const R=1,HK=[41.41,37.71],mob=innerWidth<760;
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x000000,1);
$('kure').appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(mob?52:40,innerWidth/innerHeight,.01,100);
const controls=new OrbitControls(camera,renderer.domElement);
Object.assign(controls,{enableDamping:true,dampingFactor:.06,enablePan:false,minDistance:1.15,maxDistance:6,autoRotate:true,autoRotateSpeed:.25,rotateSpeed:.5,zoomSpeed:.6});
function pos(lon,lat,r){const phi=(lon+180)*Math.PI/180,th=(90-lat)*Math.PI/180;return new THREE.Vector3(-Math.cos(phi)*Math.sin(th)*r,Math.cos(th)*r,Math.sin(phi)*Math.sin(th)*r);}
camera.position.copy(pos(HK[0]-14,HK[1]+2,2.5));camera.lookAt(0,0,0);

/* dünya ve bulutlar */
const globe=new THREE.Mesh(new THREE.SphereGeometry(R,128,96),new THREE.MeshBasicMaterial({color:0x000000}));scene.add(globe);
const kafes=new THREE.Group();scene.add(kafes);
{const m=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.16});
 for(let lat=-60;lat<=60;lat+=30){const p=[];for(let l=0;l<=360;l+=4)p.push(pos(l-180,lat,R*1.001));kafes.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),m));}
 for(let lon=-180;lon<180;lon+=30){const p=[];for(let l=-90;l<=90;l+=4)p.push(pos(lon,l,R*1.001));kafes.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),m));}}
const yukle=src=>new Promise((ok,no)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>ok(i);i.onerror=no;i.src=src;});
function esikle(img,w,h,es){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);
  const d=x.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const l=.3*p[i]+.59*p[i+1]+.11*p[i+2];const v=l>es+18?255:l>es-18?Math.round((l-es+18)/36*255):0;p[i]=p[i+1]=p[i+2]=v;}x.putImageData(d,0,0);return c;}
function gurultu(){const w=1024,h=512,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,w,h);
  for(let k=0;k<1100;k++){const cx=Math.random()*w,cy=h*.1+Math.random()*h*.8,r=2+Math.random()*16;x.fillStyle='rgba(255,255,255,'+(.15+Math.random()*.5)+')';x.beginPath();x.ellipse(cx,cy,r*2.4,r,Math.random()*.6-.3,0,7);x.fill();}return c;}
let bulutMat=null;const duzMat=globe.material;
const L={hat:true,yer:!mob,uydu:true,gol:true,yor:true,bulut:true};
(async()=>{let c;const T='2019-07-19',W='https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&SRS=EPSG:4326&BBOX=-180,-90,180,90&FORMAT=image/jpeg&STYLES=';
  try{c=esikle(await yukle(W+'&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&WIDTH=4096&HEIGHT=2048&TIME='+T),4096,2048,150);}
  catch(e){try{c=esikle(await yukle(W+'&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&WIDTH=2048&HEIGHT=1024&TIME='+T),2048,1024,150);}catch(e2){c=gurultu();}}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;bulutMat=new THREE.MeshBasicMaterial({map:t});if(L.bulut)globe.material=bulutMat;})();

/* yörüngeler */
const yor=new THREE.Group();scene.add(yor);
for(let k=0;k<9;k++){const r=R*(1.5+Math.random()*.5),pts=[],a=1+Math.random()*.25;for(let i=0;i<=256;i++){const t=i/256*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*r*a,0,Math.sin(t)*r));}
  const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineDashedMaterial({color:0xffffff,dashSize:.02,gapSize:.02,transparent:true,opacity:.3}));l.computeLineDistances();l.rotation.set((Math.random()-.5)*2.6,Math.random()*Math.PI,(Math.random()-.5)*1.6);yor.add(l);}

const veri=await fetch(BASE+'kure/kure.json').then(r=>r.json());
const KOR=await fetch(BASE+(EN?'en/':'')+'data/korpus.json').then(r=>r.json());
const kById=Object.fromEntries(KOR.map(k=>[k.id,k]));
const rnd=(a,b)=>a+Math.random()*(b-a),gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;

/* göl sınırı ve Dicle */
const golG=new THREE.Group();scene.add(golG);
{const p=veri.gol.map(q=>pos(q[0],q[1],R*1.0015));golG.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineBasicMaterial({color:0xff3df0})));
 const D=[[39.9,38.35],[40.2,37.91],[41.0,37.82],[41.41,37.71],[41.85,37.53],[42.2,37.3],[43.1,36.35],[43.7,34.6],[44.4,33.3],[45.8,32.5],[47.2,31.8],[47.4,31.0],[47.8,30.5],[48.5,30.0]],q=[];
 for(let i=0;i<D.length-1;i++)for(let t=0;t<1;t+=.1)q.push(pos(D[i][0]+(D[i+1][0]-D[i][0])*t,D[i][1]+(D[i+1][1]-D[i][1])*t,R*1.0015));
 golG.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(q),new THREE.LineBasicMaterial({color:0xffffff})));}

/* kentler: nokta, ad, Hasankeyf'e hat */
const hatG=new THREE.Group(),adG=new THREE.Group();scene.add(hatG,adG);
const hk=pos(HK[0],HK[1],1).normalize();
function yay(lon,lat){const b=pos(lon,lat,1).normalize(),ang=hk.angleTo(b),p=[];if(ang<.004)return null;const n=48,yuk=.03+ang*.22;
  for(let i=0;i<=n;i++){const t=i/n,v=new THREE.Vector3().copy(hk).multiplyScalar(Math.sin((1-t)*ang)/Math.sin(ang)).addScaledVector(b,Math.sin(t*ang)/Math.sin(ang));p.push(v.multiplyScalar(R*(1.002+Math.sin(Math.PI*t)*yuk)));}
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.5}));}
function etiket(t){const c=document.createElement('canvas'),x=c.getContext('2d'),f='700 28px Helvetica, Arial, sans-serif';x.font=f;const w=Math.ceil(x.measureText(t).width)+16;c.width=w;c.height=40;x.font=f;x.fillStyle='#fff';x.fillRect(0,0,w,40);x.fillStyle='#000';x.textBaseline='middle';x.fillText(t,8,21);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:true,sizeAttenuation:true}));s.userData.w=w;s.center.set(-.08,.5);return s;}
const YER=veri.yer.map((y,i)=>{const o={i,ad:EN?y[1]:y[0],lon:y[2],lat:y[3],kayit:[]};
  o.hat=yay(o.lon,o.lat);if(o.hat)hatG.add(o.hat);
  o.nok=new THREE.Mesh(new THREE.SphereGeometry(.0045,10,8),new THREE.MeshBasicMaterial({color:0xffffff}));o.nok.position.copy(pos(o.lon,o.lat,R*1.002));hatG.add(o.nok);
  o.et=etiket(o.ad.toLocaleUpperCase(EN?'en':'tr'));o.et.position.copy(pos(o.lon,o.lat,R*1.004));adG.add(o.et);return o;});

/* kayıt düzlemleri: üreticinin kentinin üstünde yığın */
const kart=new THREE.Group();scene.add(kart);const ucan=[],tl=new THREE.TextureLoader();tl.crossOrigin='anonymous';
const SP=mob?.75:1,sayac={};veri.kayit.forEach(q=>sayac[q[1]]=(sayac[q[1]]||0)+1);
function bos(id){const c=document.createElement('canvas');c.width=160;c.height=110;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,160,110);x.strokeStyle='#000';x.lineWidth=4;x.strokeRect(2,2,156,106);x.fillStyle='#000';x.font='700 40px Helvetica, Arial, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(id,80,57);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
veri.kayit.forEach(r=>{const [id,ci,img,w,h]=r,k=kById[id];if(!k)return;const y=YER[ci],sira=y.kayit.length,cok=sayac[ci];
  const yay_=Math.min(7,.9+Math.sqrt(cok)*.85),lon=y.lon+gauss()*yay_*1.25,lat=y.lat+gauss()*yay_,yuk=1.025+sira*(cok>30?.0042:.007)+Math.random()*.01,ol=(cok>30?rnd(.035,.075):rnd(.045,.09))*SP;
  const W=w||160,Hh=h||110,m=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,transparent:true,opacity:0,map:img?null:bos(id)});
  const me=new THREE.Mesh(new THREE.PlaneGeometry(ol*W/Math.max(W,Hh),ol*Hh/Math.max(W,Hh)),m);
  const n=pos(lon,lat,1).normalize(),p=n.clone().multiplyScalar(R*yuk);me.position.copy(p);
  const dogu=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),n).normalize(),yukari=new THREE.Vector3().crossVectors(n,dogu).normalize();
  me.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dogu,yukari,n));me.rotateX((Math.random()-.5)*.5);me.rotateY((Math.random()-.5)*.5);me.rotateZ((Math.random()-.5)*.2);
  if(img)tl.load(BASE+'kure/'+img,t=>{t.colorSpace=THREE.SRGBColorSpace;m.map=t;m.needsUpdate=true;});
  me.userData={k,id,bol:parseInt(id,10),yer:y,p0:p.clone(),n,f:Math.random()*6.28,s:.001+Math.random()*.003,t0:performance.now()+Math.random()*2200,img};
  y.kayit.push(me);kart.add(me);ucan.push(me);});
ucan.sort((a,b)=>a.userData.bol-b.userData.bol||parseFloat(a.userData.id.split('.')[1])-parseFloat(b.userData.id.split('.')[1]));

/* uydu parçaları */
const uyduG=new THREE.Group();scene.add(uyduG);
const ty=(lat,z)=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*2**z,tx=(lon,z)=>(lon+180)/360*2**z;
async function uydu(url,lon,lat,z,nx,ny){const x0=Math.floor(tx(lon,z)-nx/2),y0=Math.floor(ty(lat,z)-ny/2),c=document.createElement('canvas');c.width=256*nx;c.height=256*ny;const x=c.getContext('2d');
  const isler=[];let ok=0;for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)isler.push(yukle(url.replace('{z}',z).replace('{x}',x0+i).replace('{y}',y0+j)).then(im=>{x.drawImage(im,i*256,j*256);ok++;}).catch(()=>{}));
  await Promise.all(isler);if(!ok)throw 0;x.strokeStyle='#ff3df0';x.lineWidth=3;x.beginPath();veri.gol.forEach((p,k)=>{const X=(tx(p[0],z)-x0)*256,Y=(ty(p[1],z)-y0)*256;k?x.lineTo(X,Y):x.moveTo(X,Y);});x.stroke();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return [t,c.width,c.height];}
const EOX=y=>'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-'+y+'_3857/default/g/{z}/{y}/{x}.jpg',WB=n=>'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+n+'/{z}/{y}/{x}';
[[EOX(2018),41.41,37.715,12,2,3],[EOX(2021),41.41,37.715,12,3,2],[EOX(2018),41.55,37.76,11,3,2],[EOX(2022),41.55,37.76,11,2,3],[EOX(2019),41.85,37.53,12,2,2],[EOX(2024),41.2,37.80,11,2,3],[WB(10),41.4118,37.7137,15,2,2],[WB(41468),41.4118,37.7137,15,2,2]].forEach(async u=>{try{const [t,w,h]=await uydu(...u);
  const ol=rnd(.1,.18)*SP,me=new THREE.Mesh(new THREE.PlaneGeometry(ol*w/Math.max(w,h),ol*h/Math.max(w,h)),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));
  const n=pos(HK[0]+gauss()*9+6,HK[1]+gauss()*6-7,1).normalize();me.position.copy(n.clone().multiplyScalar(R*rnd(1.05,1.2)));me.lookAt(n.clone().multiplyScalar(3));me.rotateX((Math.random()-.5)*.4);me.rotateY((Math.random()-.5)*.4);uyduG.add(me);}catch(e){}});

/* ---------- katman paneli ---------- */
const BOL={};ucan.forEach(m=>{(BOL[m.userData.bol]=BOL[m.userData.bol]||{n:0,ad:m.userData.k.kat,on:true}).n++;});
let yilMax=2026,sec=null;
const yillar=ucan.map(m=>m.userData.k.yil).filter(Boolean),yMin=Math.min(...yillar);
const p=$('panel');
p.innerHTML='<h2>'+S.bol+'</h2><div class="r"><button type="button" id="b-hep">'+S.hep+'</button><button type="button" id="b-hic">'+S.hic+'</button></div><div id="bl"></div><h2>'+S.yil+' <b id="yil-t">2026</b></h2><input type="range" id="yil" min="'+yMin+'" max="2026" value="2026" aria-label="'+S.yil+'"><h2>'+S.diger+'</h2><div id="dl"></div><p id="say"></p><p class="kucuk">'+(EN?'Each image hangs above the city of its producer and is tied to Hasankeyf by a line. Positions are approximate.':'Her görüntü üreticisinin kentinin üstünde durur ve Hasankeyf\'e bir hatla bağlanır. Konumlar yaklaşıktır.')+'</p>';
Object.entries(BOL).forEach(([b,o])=>{const l=document.createElement('label');l.innerHTML='<input type="checkbox" checked><i>'+String(b).padStart(2,'0')+'</i><span>'+esc(o.ad)+'</span><em>'+o.n+'</em>';$('bl').appendChild(l);l.firstChild.onchange=e=>{o.on=e.target.checked;uygula();};});
[['hat',S.hat],['yer',S.yer],['gol',S.gol],['uydu',S.uydu],['yor',S.yor],['bulut',S.bulut]].forEach(([k,ad])=>{const l=document.createElement('label');l.innerHTML='<input type="checkbox"'+(L[k]?' checked':'')+'><i></i><span>'+ad+'</span>';$('dl').appendChild(l);l.firstChild.onchange=e=>{L[k]=e.target.checked;uygula();};});
const hepsi=v=>{Object.values(BOL).forEach(o=>o.on=v);$('bl').querySelectorAll('input').forEach(i=>i.checked=v);uygula();};
$('b-hep').onclick=()=>hepsi(true);$('b-hic').onclick=()=>hepsi(false);
$('yil').oninput=e=>{yilMax=+e.target.value;$('yil-t').textContent=yilMax;uygula();};
const acik=m=>BOL[m.userData.bol].on&&(!m.userData.k.yil||m.userData.k.yil<=yilMax);
function uygula(){let n=0;ucan.forEach(m=>{m.visible=acik(m);if(m.visible)n++;});
  YER.forEach(y=>{const v=y.kayit.some(m=>m.visible);if(y.hat)y.hat.visible=L.hat&&v;y.nok.visible=v;y.et.visible=L.yer&&v;});
  uyduG.visible=L.uydu;golG.visible=L.gol;yor.visible=L.yor;globe.material=L.bulut&&bulutMat?bulutMat:duzMat;kafes.visible=!L.bulut;
  $('say').textContent=n+' / '+ucan.length+' '+S.kayit;if(sec&&!sec.visible)kapat();}
$('kat-d').textContent=S.kat;$('kat-d').onclick=()=>{p.hidden=!p.hidden;$('kat-d').setAttribute('aria-expanded',!p.hidden);};if(mob)p.hidden=true;

/* ---------- seçim ve kayıt kartı ---------- */
const kb=$('kart');let ucus=null;
function vurgula(){YER.forEach(y=>{if(y.hat)y.hat.material.opacity=sec?(y===sec.userData.yer?1:.12):.5;});ucan.forEach(m=>{m.material.color.setScalar(!sec||m===sec?1:.38);});}
function kapat(){sec=null;kb.hidden=true;vurgula();}
function ac(m,uc){sec=m;const u=m.userData,k=u.k;vurgula();controls.autoRotate=false;
  kb.innerHTML='<div class="kh"><b>'+esc(k.id)+'</b><span>'+esc(k.kat)+'</span><button type="button" id="k-x" aria-label="'+S.kapat+'">×</button></div>'+(u.img?'<img src="'+BASE+'kure/'+u.img+'" alt="">':'')+'<h3>'+esc(k.baslik)+'</h3><dl>'+[[S.ure,k.uretici],[S.tar,k.tarih],[S.tur,k.tip],[S.konum,u.yer.ad+' ('+S.yaklasik+')']].filter(r=>r[1]).map(r=>'<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>').join('')+'</dl>'+(k.not?'<p>'+esc(k.not)+'</p>':'')+
   '<div class="r"><button type="button" id="k-on" aria-label="←">←</button><button type="button" id="k-son" aria-label="→">→</button>'+(k.link?'<a href="'+esc(k.link)+'" target="_blank" rel="noopener noreferrer">'+S.git+' -></a>':'')+'<a href="index.html#arsiv">'+S.atlas+' -></a></div>';
  kb.hidden=false;$('k-x').onclick=kapat;const g=ucan.filter(acik),i=g.indexOf(m);$('k-on').onclick=()=>ac(g[(i-1+g.length)%g.length],true);$('k-son').onclick=()=>ac(g[(i+1)%g.length],true);
  if(uc){const d=camera.position.length();ucus={a:camera.position.clone(),b:u.n.clone().multiplyScalar(Math.max(2.3,Math.min(d,2.8))),t0:performance.now()};}}
const ray=new THREE.Raycaster(),fare=new THREE.Vector2();let bas=null;
const vur=e=>{fare.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(fare,camera);const h=ray.intersectObjects([globe,...ucan.filter(m=>m.visible)],false)[0];return h&&h.object!==globe?h.object:null;};
renderer.domElement.addEventListener('pointerdown',e=>{bas=[e.clientX,e.clientY];});
renderer.domElement.addEventListener('pointerup',e=>{if(!bas||Math.hypot(e.clientX-bas[0],e.clientY-bas[1])>6)return;const m=vur(e);if(m)ac(m,false);else kapat();});
renderer.domElement.addEventListener('pointermove',e=>{if(e.buttons)return;renderer.domElement.style.cursor=vur(e)?'pointer':'grab';});
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.key==='Escape')kapat();if(sec&&e.key==='ArrowRight')$('k-son').click();if(sec&&e.key==='ArrowLeft')$('k-on').click();});

/* ---------- çizim ---------- */
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const az=matchMedia('(prefers-reduced-motion: reduce)').matches;if(az)controls.autoRotate=false;
controls.addEventListener('start',()=>{controls.autoRotate=false;ucus=null;clearTimeout(window.__dn);});
controls.addEventListener('end',()=>{if(!az)window.__dn=setTimeout(()=>{if(!sec)controls.autoRotate=true;},8000);});
function dongu(now){requestAnimationFrame(dongu);
  for(const m of ucan){const u=m.userData;m.material.opacity=Math.min(1,Math.max(0,(now-u.t0)/1200));if(!az)m.position.copy(u.p0).addScaledVector(u.n,Math.sin(now*.0004+u.f)*u.s);}
  if(ucus){const t=Math.min(1,(now-ucus.t0)/1100),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,d=ucus.a.length()+(ucus.b.length()-ucus.a.length())*e;camera.position.copy(ucus.a).lerp(ucus.b,e).setLength(d);if(t>=1)ucus=null;}
  const k=Math.min(1.6,camera.position.length()/2.4);adG.children.forEach(s=>s.scale.set(s.userData.w/40*.022*k,.022*k,1));
  yor.rotation.y+=az?0:.0003;controls.update();renderer.render(scene,camera);}
uygula();requestAnimationFrame(dongu);
window.__kure={scene,camera,ucan,controls,YER,ac,BOL,uygula};
$('atif-d').onclick=()=>{$('atif').hidden=!$('atif').hidden;};

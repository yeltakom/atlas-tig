/* Dicle Vadisi Atlası: küre. Siyah beyaz bulutlu dünya, Hasankeyf üstünde havada asılı, üst üste binen görüntüler.
   Yazı ya da kaynak katmanı yok; atıf yalnızca köşedeki düğmeyle açılır. */
import * as THREE from './vendor/three/three.module.min.js';
import {OrbitControls} from './vendor/three/OrbitControls.js';

const BASE=document.documentElement.dataset.base||'';
const R=1,HK=[41.41,37.71];
const mob=innerWidth<760;
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.setClearColor(0x000000,1);
document.getElementById('kure').appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(mob?52:40,innerWidth/innerHeight,.01,100);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.06;controls.enablePan=false;controls.minDistance=1.25;controls.maxDistance=6;
controls.autoRotate=true;controls.autoRotateSpeed=.35;controls.rotateSpeed=.5;controls.zoomSpeed=.6;

/* enlem boylamdan küre noktası: SphereGeometry UV'si ile aynı düzen */
function pos(lon,lat,r){const phi=(lon+180)*Math.PI/180,th=(90-lat)*Math.PI/180;return new THREE.Vector3(-Math.cos(phi)*Math.sin(th)*r,Math.cos(th)*r,Math.sin(phi)*Math.sin(th)*r);}
{const p=pos(HK[0]+8,HK[1]-6,2.75);camera.position.copy(p);camera.lookAt(0,0,0);}

/* dünya */
const globe=new THREE.Mesh(new THREE.SphereGeometry(R,128,96),new THREE.MeshBasicMaterial({color:0x111111}));
scene.add(globe);
const rim=new THREE.Mesh(new THREE.SphereGeometry(R*1.004,96,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.06,side:THREE.BackSide}));
scene.add(rim);
const yukle=src=>new Promise((ok,no)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>ok(i);i.onerror=no;i.src=src;});
function esikle(img,w,h,es){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);
  const d=x.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const l=.3*p[i]+.59*p[i+1]+.11*p[i+2];const v=l>es+18?255:l>es-18?Math.round((l-es+18)/36*255):0;p[i]=p[i+1]=p[i+2]=v;}x.putImageData(d,0,0);return c;}
function gurultu(){const w=1024,h=512,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,w,h);
  for(let k=0;k<1100;k++){const cx=Math.random()*w,cy=h*.1+Math.random()*h*.8,r=2+Math.random()*16;x.fillStyle='rgba(255,255,255,'+(.15+Math.random()*.5)+')';x.beginPath();x.ellipse(cx,cy,r*2.4,r,Math.random()*.6-.3,0,7);x.fill();}return c;}
(async()=>{let c;
  const T='2019-07-19',W='https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&SRS=EPSG:4326&BBOX=-180,-90,180,90&FORMAT=image/jpeg&STYLES=';
  try{const i=await yukle(W+'&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&WIDTH=4096&HEIGHT=2048&TIME='+T);c=esikle(i,4096,2048,150);}
  catch(e){try{const i=await yukle(W+'&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&WIDTH=2048&HEIGHT=1024&TIME='+T);c=esikle(i,2048,1024,150);}catch(e2){c=gurultu();}}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;globe.material=new THREE.MeshBasicMaterial({map:t});})();

/* kesikli yörüngeler */
const yor=new THREE.Group();scene.add(yor);
for(let k=0;k<11;k++){const r=R*(1.02+Math.random()*.5),pts=[];const a=1+Math.random()*.25;for(let i=0;i<=256;i++){const t=i/256*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*r*a,0,Math.sin(t)*r));}
  const g=new THREE.BufferGeometry().setFromPoints(pts);const l=new THREE.Line(g,new THREE.LineDashedMaterial({color:0xffffff,dashSize:.012+Math.random()*.02,gapSize:.01+Math.random()*.02,transparent:true,opacity:.35+Math.random()*.3}));
  l.computeLineDistances();l.rotation.set((Math.random()-.5)*2.6,Math.random()*Math.PI,(Math.random()-.5)*1.6);yor.add(l);}

/* görüntü düzlemleri */
const kart=new THREE.Group();scene.add(kart);const ucan=[];
const tl=new THREE.TextureLoader();tl.crossOrigin='anonymous';
function duzlem(tex,w,h,lon,lat,yuk,olcek,egim){const m=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:true});
  const k=olcek,me=new THREE.Mesh(new THREE.PlaneGeometry(k*w/Math.max(w,h),k*h/Math.max(w,h)),m);
  const n=pos(lon,lat,1).normalize(),p=n.clone().multiplyScalar(R*yuk);me.position.copy(p);
  const kuzey=new THREE.Vector3(0,1,0),dogu=new THREE.Vector3().crossVectors(kuzey,n).normalize(),yukari=new THREE.Vector3().crossVectors(n,dogu).normalize();
  me.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dogu,yukari,n));
  me.rotateX((Math.random()-.5)*egim);me.rotateY((Math.random()-.5)*egim);me.rotateZ((Math.random()-.5)*egim*.4);
  me.userData={p0:p.clone(),n,f:Math.random()*6.28,s:.002+Math.random()*.006,t0:performance.now()+Math.random()*2500};kart.add(me);ucan.push(me);return me;}
const rnd=(a,b)=>a+Math.random()*(b-a);
const gauss=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;
const veri=await fetch(BASE+'kure/kure.json').then(r=>r.json());

/* uydu parçaları: Sentinel-2 yıllık mozaik ve arşiv, göl sınırı pembe çizgiyle */
const ty=(lat,z)=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*2**z,tx=(lon,z)=>(lon+180)/360*2**z;
async function uydu(url,lon,lat,z,nx,ny){const x0=Math.floor(tx(lon,z)-nx/2),y0=Math.floor(ty(lat,z)-ny/2),c=document.createElement('canvas');c.width=256*nx;c.height=256*ny;const x=c.getContext('2d');
  const isler=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)isler.push(yukle(url.replace('{z}',z).replace('{x}',x0+i).replace('{y}',y0+j)).then(im=>x.drawImage(im,i*256,j*256)).catch(()=>{}));
  await Promise.all(isler);x.strokeStyle='#ff3df0';x.lineWidth=3;x.beginPath();veri.gol.forEach((p,k)=>{const X=(tx(p[0],z)-x0)*256,Y=(ty(p[1],z)-y0)*256;k?x.lineTo(X,Y):x.moveTo(X,Y);});x.stroke();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return [t,c.width,c.height];}
const EOX=y=>'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-'+y+'_3857/default/g/{z}/{y}/{x}.jpg';
const WB=n=>'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/'+n+'/{z}/{y}/{x}';
const UY=[[EOX(2018),41.41,37.715,12,2,3],[EOX(2021),41.41,37.715,12,3,2],[EOX(2018),41.55,37.76,11,3,2],[EOX(2022),41.55,37.76,11,2,3],[EOX(2019),41.85,37.53,12,2,2],[EOX(2024),41.2,37.80,11,2,3],
  [WB(10),41.4118,37.7137,15,2,2],[WB(41468),41.4118,37.7137,15,2,2],[WB(13045),41.424,37.727,15,3,2],[EOX(2020),41.75,37.80,11,3,2],[EOX(2023),41.0,37.83,11,2,2],[WB(12576),41.85,37.53,14,3,2]];
const SP=mob?.62:1;
UY.forEach(async u=>{try{const [t,w,h]=await uydu(...u);duzlem(t,w,h,HK[0]+gauss()*11,HK[1]+gauss()*7,rnd(1.04,1.22),rnd(.16,.3)*SP,.35);}catch(e){}});

/* araştırma korpusundan görüntüler: Hasankeyf üstünde küme, Dicle boyunca iz */
const sec=veri.img.slice().sort(()=>Math.random()-.5).slice(0,mob?60:110);
const DICLE=[[41.4,37.7],[42.2,37.3],[43.1,36.3],[43.7,34.6],[44.4,33.3],[45.8,32.5],[47.2,31.8],[47.4,31.0],[47.8,30.5]];
sec.forEach((im,i)=>{tl.load(BASE+'kure/'+im[0],t=>{t.colorSpace=THREE.SRGBColorSpace;let lon,lat,yuk,ol;
  if(i%7===6){const k=Math.random()*(DICLE.length-1),a=DICLE[Math.floor(k)],b=DICLE[Math.ceil(k)],f=k%1;lon=a[0]+(b[0]-a[0])*f+gauss()*1.2;lat=a[1]+(b[1]-a[1])*f+gauss()*1.2;yuk=rnd(1.02,1.08);ol=rnd(.04,.07);}
  else{lon=HK[0]+gauss()*17;lat=HK[1]+gauss()*11;yuk=rnd(1.03,1.3);ol=rnd(.08,.2);}
  duzlem(t,im[1],im[2],lon,lat,yuk,ol*SP,.5);});});

/* çizim */
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const az=matchMedia('(prefers-reduced-motion: reduce)').matches;if(az)controls.autoRotate=false;
controls.addEventListener('start',()=>{controls.autoRotate=false;clearTimeout(window.__dn);});
controls.addEventListener('end',()=>{if(!az)window.__dn=setTimeout(()=>controls.autoRotate=true,6000);});
function dongu(now){requestAnimationFrame(dongu);
  for(const m of ucan){const u=m.userData;const a=Math.min(1,Math.max(0,(now-u.t0)/1400));m.material.opacity=a;
    if(!az)m.position.copy(u.p0).addScaledVector(u.n,Math.sin(now*.0004+u.f)*u.s);}
  yor.rotation.y+=az?0:.0004;controls.update();renderer.render(scene,camera);}
requestAnimationFrame(dongu);
window.__kure={scene,camera,ucan,controls};
document.getElementById('atif-d').onclick=()=>{const a=document.getElementById('atif');a.hidden=!a.hidden;};

import os,re,json,shutil
S='/home/claude/en_src';H='/home/claude/atlas-tig/harita';E=H+'/en'
os.makedirs(E+'/data',exist_ok=True)
T=set(os.listdir(S+'/data'))
FIX={'Türkçe':'Turkish','raporda belirtilmedi':'not stated in the report','1902-1916 (2. baskı 1914)':'1902-1916 (2nd edition 1914)','2017 (örnek yazı)':'2017 (sample text)','belirtilmemiş':'not stated'}
def fix(x):
    if isinstance(x,dict): return {k:fix(v) for k,v in x.items()}
    if isinstance(x,list): return [fix(v) for v in x]
    if isinstance(x,str):
        x=FIX.get(x,x); return x.replace(' pafta',' sheet').replace('pafta ','sheet ')
    return x
for f in T:
    d=fix(json.load(open(S+'/data/'+f,encoding='utf-8')))
    if f=='korpus.json':
        for k in d:
            if k.get('img'): k['img']=k['img'].replace('../images/','../../images/')
    json.dump(d,open(E+'/data/'+f,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
def datafix(s):
    return re.sub(r"(['\"])data/([a-z0-9_]+\.(?:geojson|json))",lambda m:m.group(1)+('data/' if m.group(2) in T else '../data/')+m.group(2),s)
RED="<script>(()=>{const T=new Set(%s);const f=window.fetch.bind(window);window.fetch=(u,o)=>{if(typeof u==='string'&&u.startsWith('data/')){const n=u.slice(5).split('?')[0];if(!T.has(n))u='../'+u;}return f(u,o);};})();</script>"%json.dumps(sorted(T))
for f in ['app.js','platform.js','ek.js','hikaye.js']:
    if os.path.exists(S+'/'+f): open(E+'/'+f,'w',encoding='utf-8').write(datafix(open(S+'/'+f,encoding='utf-8').read()))
for f in ['index.html','hikaye.html']:
    if not os.path.exists(S+'/'+f): continue
    h=open(S+'/'+f,encoding='utf-8').read()
    h=h.replace('href="vendor/','href="../vendor/').replace('src="vendor/','src="../vendor/')
    h=re.sub(r'href="(style|hikaye)\.css',r'href="../\1.css',h)
    h=h.replace('<script','%s\n<script'%RED,1) if 'window.fetch=' not in h else h
    if f=='index.html':
        h=re.sub(r'(<nav[^>]*>\s*)',r'\1<a href="../" lang="tr" hreflang="tr">TR</a>',h,1)
        h=h.replace('<a href="hikaye.html">3D Narrative</a>','<a href="hikaye.html">3D Narrative</a><a href="kure.html">Globe</a>') if 'kure.html' not in h else h
    else:
        h=h.replace('<a class="btn" href="index.html">','<a class="btn" href="../hikaye.html" lang="tr">TR</a><a class="btn" href="kure.html">Globe</a><a class="btn" href="index.html">',1) if 'kure.html' not in h else h
    open(E+'/'+f,'w',encoding='utf-8').write(h)
k=open(H+'/kure.html',encoding='utf-8').read()
k=k.replace('lang="tr" data-base=""','lang="en" data-base="../"').replace('<title>Dicle Vadisi Atlası: küre</title>','<title>Tigris Valley Atlas: globe</title>')
k=k.replace('aria-label="Döndürülebilen küre: Hasankeyf üzerinde üst üste binen görüntüler"','aria-label="Rotatable globe: overlapping images above Hasankeyf"').replace('aria-label="Görüntü kaynakları"','aria-label="Image credits"')
k=re.sub(r'<div id="atif" hidden>.*?</div>','<div id="atif" hidden>Clouds: NASA EOSDIS GIBS, MODIS Terra, 19 July 2019, converted to black and white. Satellite fragments: Sentinel-2 cloudless, EOX IT Services GmbH (contains Copernicus Sentinel data); Esri World Imagery Wayback. Photographs and images: Visibility and Erasure visual corpus, rights remain with their makers. Pink line: reservoir boundary.</div>',k,flags=re.S)
k=k.replace('x','src="../kure.js?v=1"')
open(E+'/kure.html','w',encoding='utf-8').write(k)
print('built',sorted(os.listdir(E)))

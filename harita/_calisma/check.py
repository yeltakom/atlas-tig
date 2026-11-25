import sys,json,re
s,t=sys.argv[1],sys.argv[2]
if s.endswith(('.json','.geojson')):
    a,b=json.load(open(s)),json.load(open(t))
    def shape(x):
        if isinstance(x,dict): return {k:shape(v) for k,v in x.items()}
        if isinstance(x,list): return [shape(v) for v in x]
        return type(x).__name__
    print('STRUCTURE OK' if shape(a)==shape(b) else 'STRUCTURE DIFFERS')
else:
    A,B=open(s).read(),open(t).read()
    strip=lambda x:re.sub(r"'(?:\\.|[^'\\])*'|\"(?:\\.|[^\"\\])*\"|`(?:\\.|[^`\\])*`|>[^<]*<","Q",x)
    a,b=strip(A),strip(B)
    print('CODE SKELETON OK' if a==b else 'CODE SKELETON DIFFERS: %d vs %d chars; first diff at %d'%(len(a),len(b),next((i for i,(p,q) in enumerate(zip(a,b)) if p!=q),min(len(a),len(b)))))
    tr=re.findall(r"[çğışöüÇĞİŞÖÜ]",B)
    print('turkish chars left:',len(tr))

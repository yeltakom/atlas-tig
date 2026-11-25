import http.server,io,math,os,re
from PIL import Image
ROOT='/home/claude/atlas-tig/harita'
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=ROOT,**k)
    def log_message(s,*a): pass
    def do_GET(s):
        m=re.match(r'/dem/(\d+)/(\d+)/(\d+)\.png',s.path)
        if not m: return super().do_GET()
        z,x,y=map(int,m.groups());n=2**z;im=Image.new('RGB',(256,256));px=im.load()
        for j in range(0,256):
            lat=math.degrees(math.atan(math.sinh(math.pi*(1-2*(y+(j+.5)/256)/n))))
            for i in range(256):
                lon=(x+(i+.5)/256)/n*360-180
                e=450+abs(lat-37.75)*2600+abs(lon-41.4)*40+30*math.sin(lon*40)*math.cos(lat*55)
                v=e+32768;px[i,j]=(int(v//256),int(v%256),int((v%1)*256))
        b=io.BytesIO();im.save(b,'PNG');d=b.getvalue()
        s.send_response(200);s.send_header('Content-Type','image/png');s.send_header('Access-Control-Allow-Origin','*');s.send_header('Content-Length',str(len(d)));s.end_headers();s.wfile.write(d)
http.server.ThreadingHTTPServer(('127.0.0.1',8767),H).serve_forever()

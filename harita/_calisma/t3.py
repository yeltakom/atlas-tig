import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for name,w,h in(('d',1360,860),('m',390,844)):
            pg=await b.new_page(viewport={'width':w,'height':h})
            errs=[]
            pg.on('console',lambda m: errs.append(m.text[:300]) if m.type=='error' else None)
            pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)[:300]))
            await pg.goto('http://localhost:8767/index.html'); await pg.wait_for_timeout(7000)
            info=await pg.evaluate("()=>{const a=window.__atlas;const q=s=>document.querySelectorAll(s).length;return {dos:q('#dos button'),zc:q('#zc-in button'),kut:q('#ku-liste li'),kutTur:q('#ku-tur button'),say:q('#a-sayi tr'),nuf:q('#a-nufus i'),kayip:document.getElementById('a-kayip').innerText.slice(0,120),ad:document.getElementById('a-ad').innerText.replace(/\\n/g,' ').slice(0,160),kazi:a.A.getLayer('kazi')?1:0,jrc:a.A.getLayer('jrc-t')?1:0,kat:q('#katlist label'),font:document.fonts.check('12px Unbounded')}}")
            print(name,info); print('  ERR',[e for e in errs if 'ERR_' not in e and 'Failed to load resource' not in e and 'Failed to fetch' not in e][:6])
            await pg.screenshot(path=f'/home/claude/s_{name}.png')
            if name=='d':
                await pg.evaluate("()=>{const a=window.__atlas;const k=a.koy().find(x=>x.ad==='Ufaca');a.koyCard(k,k.ll)}"); await pg.wait_for_timeout(1500); await pg.screenshot(path='/home/claude/s_koy.png')
                await pg.evaluate("()=>{const a=window.__atlas;a.openDos(a.DOS.find(d=>d.no==='11'))}"); await pg.wait_for_timeout(1500); await pg.screenshot(path='/home/claude/s_d11.png')
                await pg.evaluate("()=>{const a=window.__atlas;a.openDos(a.DOS.find(d=>d.no==='03'));a.openGun()}"); await pg.wait_for_timeout(1500); await pg.screenshot(path='/home/claude/s_gun.png')
                await pg.goto('http://localhost:8767/index.html#arsiv'); await pg.wait_for_timeout(2500); await pg.screenshot(path='/home/claude/s_ar.png')
                await pg.goto('http://localhost:8767/index.html#kutuphane'); await pg.wait_for_timeout(2500); await pg.screenshot(path='/home/claude/s_ku.png')
            await pg.close()
        await b.close()
asyncio.run(main())

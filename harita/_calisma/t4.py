import asyncio,urllib.parse
from playwright.async_api import async_playwright
U='http://localhost:8767/hikaye.html?kamera=1&dem='+urllib.parse.quote('http://localhost:8767/dem/{z}/{x}/{y}.png',safe='')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for name,w,h in(('d',1360,820),('m',390,844)):
            pg=await b.new_page(viewport={'width':w,'height':h})
            errs=[]
            pg.on('console',lambda m: errs.append(m.text[:300]) if m.type in('error','warning') else None)
            pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)[:300]))
            await pg.goto(U); await pg.wait_for_timeout(14000)
            info=await pg.evaluate("()=>{const h=window.__hikaye;if(!h)return 'yok';const M=h.M;return {hazir:M.hazir,n:M.n,min:M.min,poligon:M.poligon&&M.poligon.toFixed(1),o525:M.hazir?Object.fromEntries(Object.entries(h.olc(525)).map(([k,v])=>[k,+(+v).toFixed(2)])):null,koyN:M.koyN,bl:document.querySelectorAll('.bl').length,terrain:!!h.map.getTerrain(),layers:h.map.getStyle().layers.length}}")
            print(name,info); print('  ERR',[e for e in errs if 'ERR_' not in e and 'Failed to load resource' not in e and 'Failed to fetch' not in e and 'AJAXError' not in e][:8])
            if name=='d':
                await pg.evaluate("()=>document.querySelectorAll('.bl')[6].scrollIntoView()"); await pg.wait_for_timeout(11000); await pg.screenshot(path='/home/claude/h_su.png')
                await pg.evaluate("()=>document.querySelectorAll('.bl')[3].scrollIntoView()"); await pg.wait_for_timeout(7000); await pg.screenshot(path='/home/claude/h_hk.png')
            else:
                await pg.evaluate("()=>document.querySelectorAll('.bl')[6].scrollIntoView()"); await pg.wait_for_timeout(9000); await pg.screenshot(path='/home/claude/h_m.png')
            await pg.close()
        await b.close()
asyncio.run(main())

import asyncio,sys
from playwright.async_api import async_playwright
P=sys.argv[1] if len(sys.argv)>1 else ''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for n,w,h in (('d',1360,860),('m',390,844)):
            pg=await b.new_page(viewport={'width':w,'height':h});errs=[]
            pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)[:300]))
            await pg.goto('http://localhost:8767/'+P+'kure.html'); await pg.wait_for_timeout(9000)
            print(n,await pg.evaluate("()=>window.__kure?{ucan:window.__kure.ucan.length,yer:window.__kure.YER.length,bol:Object.keys(window.__kure.BOL).length,say:document.getElementById('say').textContent,lab:document.querySelectorAll('#bl label').length}:'yok'"),errs[:4])
            if n=='d':
                await pg.evaluate("()=>{const k=window.__kure;k.controls.autoRotate=false}"); await pg.wait_for_timeout(2500)
                print(await pg.evaluate("()=>document.getElementById('kart').innerText.slice(0,200)"))
            await pg.screenshot(path=f'/home/claude/k_{P[:2]}{n}.png'); await pg.close()
        await b.close()
asyncio.run(main())

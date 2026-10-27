// Local demo regression: all external requests are blocked.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = __dirname;
for (const name of ['index.html','app.js','profile.js','supabase-client.js']) {
 const source = fs.readFileSync(path.join(root,name),'utf8');
 assert.doesNotMatch(source,/app\.li-la\.fr|signInWithOtp|createClient|onAuthStateChange|location\.(href|replace|assign)/);
}
const server = http.createServer((req,res)=>{
 let pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/LiLa-V2-Demo\//,'/');
 if(pathname.endsWith('/')) pathname+='index.html';
 const filename=path.resolve(root,'.'+pathname);
 if(!filename.startsWith(root+path.sep)){res.writeHead(404).end();return;}
 try{const data=fs.readFileSync(filename);res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[path.extname(filename)]||'text/plain');res.end(data);}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage();const errors=[],forbidden=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(/supabase|app\.li-la\.fr/i.test(req.url()))forbidden.push(req.url());});
  page.on('response',res=>{if(res.status()===404)missing.push(res.url());});
  await page.route('https://**/*',route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('lila_user_profile',JSON.stringify({firstName:'RealAccount',email:'private@example.com'})));
  for(const entry of ['/','/LiLa-V2-Demo/']){
   const url=`http://127.0.0.1:${server.address().port}${entry}`;
   await page.goto(url);
   assert.equal(page.url(),url);
   assert.equal(await page.locator('#cockpit').isVisible(),true);
   assert.equal(await page.locator('#auth-gate,#auth-form,#sign-out').count(),0);
   assert.equal(await page.locator('#greeting').textContent(),'Bonjour, Camille.');
   assert.equal(await page.locator('.space').count(),6);
   await page.locator('#search').fill('reseau');assert.equal(await page.locator('.space:visible').count(),1);
   await page.locator('.space:visible').click();assert.equal(await page.locator('#detail').isVisible(),true);
   await page.keyboard.press('Escape');await page.locator('#search').fill('zzzz');assert.equal(await page.locator('#no-results').isVisible(),true);
   await page.locator('#search').fill('');await page.locator('#profile-button').click();
   assert.match(await page.locator('#profile-fields').textContent(),/Camille/);
   assert.doesNotMatch(await page.locator('#profile-fields').textContent(),/RealAccount|private@example/);
   await page.keyboard.press('Escape');
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}`);
   }
   await page.reload();assert.equal(await page.locator('#cockpit').isVisible(),true);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(forbidden,[]);assert.deepEqual(missing,[]);
  console.log('PASS: direct demo access at root and project path; no auth or Supabase requests; fictional profile; search/dialogs; reload; 320/390/768/1440px; no JS errors or missing local resources.');
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

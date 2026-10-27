const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=__dirname;
const server=http.createServer((req,res)=>{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/LiLa-V2-Demo\//,'/');if(pathname.endsWith('/'))pathname+='index.html';const filename=path.resolve(root,'.'+pathname);if(!filename.startsWith(root+path.sep)){res.writeHead(404).end();return;}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.json':'application/json'})[path.extname(filename)]||'text/plain');res.end(fs.readFileSync(filename));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();const errors=[],external=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:')&&new URL(r.url()).hostname!=='me.kis.v2.scr.kaspersky-labs.com')external.push(r.url());});page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 // Block the host antivirus injection separately; it is not part of the demo.
 await page.route('**://me.kis.v2.scr.kaspersky-labs.com/**',r=>r.abort());
 await page.route('https://**/*',r=>r.abort());
 const base=`http://127.0.0.1:${server.address().port}/LiLa-V2-Demo/`;
 const go=async route=>{await page.goto(base+'#'+route);await page.waitForFunction(()=>document.querySelector('main h1'));};
 await go('accueil');assert.equal(await page.locator('.home-card').count(),6);assert.equal(await page.getByText('Ma journée',{exact:true}).count(),0);
 await page.getByRole('button',{name:'ChatGPT'}).click();assert.match(await page.locator('dialog').textContent(),/Aucun service connecté/);await page.keyboard.press('Escape');
 await page.locator('.home-card').filter({hasText:'Hub Immobilier'}).click();await page.waitForSelector('#hub-query');
 assert.equal(await page.locator('.property-card').count(),2);await page.locator('#hub-query').fill('aucun');assert.equal(await page.locator('.property-card').count(),0);
 await page.locator('#hub-query').fill('pessac');assert.equal(await page.locator('.property-card').count(),1);await page.getByRole('link',{name:'Voir le bien',exact:true}).click();
 await page.getByRole('link',{name:'Ouvrir le projet de suivi',exact:true}).click();assert.equal(await page.locator('.visit-row').count(),5);
 await page.locator('[data-visitor="lea"]').click();assert.match(await page.locator('dialog').textContent(),/Contre-visite/);await page.getByRole('link',{name:'Fiche contact',exact:true}).click();await page.waitForURL('**#contact/lea');assert.equal(await page.locator('dialog').isVisible(),false);assert.match(await page.locator('h1').textContent(),/Léa/);
 await go('taches/pessac');await page.locator('[data-task="lea"]').check();await page.getByRole('link',{name:'Retour au projet',exact:true}).click();assert.equal(await page.locator('[data-task="lea"]').isChecked(),true);
 await go('biens');assert.equal(await page.locator('.property-card').count(),5);
 for(const id of ['pessac','bordeaux','merignac','talence','begles']){await go('projet/'+id);assert.match(await page.locator('h1').textContent(),/Projet/);}
 await go('deposer');await page.locator('[name=type]').selectOption('Appartement');assert.equal(await page.locator('[name=floor]').isVisible(),true);assert.equal(await page.locator('[name=land]').isVisible(),false);
 await page.locator('[name=transaction]').selectOption('Location');await page.locator('[name=rent]').fill('1200');assert.equal(await page.locator('[name=price]').isVisible(),false);
 await page.locator('[name=title]').fill('<img src=x onerror=alert(1)>');await page.locator('[name=features][value=Balcon]').check();
 await page.locator('#photos').setInputFiles(path.join(root,'assets/lila-icon-192.png'));assert.equal(await page.locator('#photo-preview img').count(),1);
 await page.getByRole('button',{name:'Prévisualiser le bien'}).click();assert.match(await page.locator('#detail-title').textContent(),/<img/);assert.equal(await page.locator('#detail-title img').count(),0);assert.match(await page.locator('dialog').textContent(),/1\s?200/);assert.match(await page.locator('dialog').textContent(),/Balcon/);assert.equal(await page.locator('dialog img').count(),1);await page.keyboard.press('Escape');assert.equal(await page.locator('[name=rent]').inputValue(),'1200');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});for(const route of ['accueil','hub','biens','projets','projet/pessac','reseau','notes','taches','contact/lea','deposer']){await go(route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route}: overflow ${width}`);}}
 await go('accueil');await page.screenshot({path:process.env.TEMP+'\\lila-demo-home.png',fullPage:true});await go('projet/pessac');await page.screenshot({path:process.env.TEMP+'\\lila-demo-project.png',fullPage:true});
 await page.reload();assert.match(await page.locator('h1').textContent(),/Projet/);await page.goto(`http://127.0.0.1:${server.address().port}/#accueil`);await page.waitForSelector('.home-card');assert.equal(await page.locator('.home-card').count(),6);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(missing,[]);console.log('PASS: navigation, project/visitors/contact/notes/tasks, filters, conditional form, local photo/preview, escaped text, root/project-path/reload, 10 views at 320/390/768/1440px, zero external requests or JS errors.');
 }finally{if(browser)await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

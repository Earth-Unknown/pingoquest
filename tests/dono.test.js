const {chromium}=require('playwright');const fs=require('fs');const assert=require('assert');
(async()=>{
 const code=fs.readFileSync(process.env.CODIGO,'utf8').trim();
 let h=fs.readFileSync(__dirname+'/../index.html','utf8');
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:400,height:800}});const pg=await ctx.newPage();
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('https://x.test/',r=>r.fulfill({contentType:'text/html',body:h}));
 await pg.goto('https://x.test/');await pg.waitForTimeout(300);
 await pg.evaluate(()=>{S.onb=true;document.getElementById('welcome').hidden=true;tab='profile';render()});
 assert.strictEqual(await pg.locator('[data-act="devday"]').count(),0);
 for(let i=0;i<7;i++)await pg.locator('h1[data-act="admtap"]').click({force:true});
 assert.strictEqual(await pg.locator('#admcode').count(),1);
 await pg.fill('#admcode','errado');await pg.click('[data-act="admok"]');await pg.waitForTimeout(300);
 assert.strictEqual(await pg.locator('[data-act="devday"]').count(),0);
 await pg.fill('#admcode',code);await pg.click('[data-act="admok"]');await pg.waitForTimeout(300);
 assert.strictEqual(await pg.locator('[data-act="devday"]').count(),1);
 // devoff só vale para dono
 await pg.evaluate(()=>{localStorage.setItem('pingoquest-devoff','5')});
 assert(await pg.evaluate(()=>devOff())===5);
 await pg.click('[data-act="admoff"]');
 assert(await pg.evaluate(()=>devOff())===0);
 assert.deepStrictEqual(errs,[]);console.log('dono OK');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

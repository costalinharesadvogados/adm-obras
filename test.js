const {chromium, devices} = require('playwright');
const fs=require('fs');
const ERR=[], LOG=[];
(async()=>{
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({...devices['iPhone SE'], locale:'pt-BR', acceptDownloads:true});
  const p = await ctx.newPage();
  p.on('console', m => { if(m.type()==='error') ERR.push('CONSOLE: '+m.text()); });
  p.on('pageerror', e => ERR.push('PAGEERROR: '+e.message));
  const step = async (n, fn) => { try{ await fn(); LOG.push('✔ '+n);}catch(e){ LOG.push('✘ '+n+' → '+e.message); ERR.push(n+': '+e.message);} };

  await p.goto('http://localhost:8099/', {waitUntil:'networkidle'});
  await p.waitForTimeout(600);

  await step('boot removido', async()=>{ if(await p.locator('#boot').count()) throw new Error('boot ainda visível'); });
  await step('5 ambientes iniciais', async()=>{
    await p.locator('#nav button[data-v=ambientes]').tap();
    await p.waitForTimeout(250);
    const n = await p.locator('#listaAmb .card').count();
    if(n!==5) throw new Error('ambientes='+n);
    const txt = await p.locator('#listaAmb').innerText();
    for(const a of ['Quarto Arthur','Banheiro Arthur','Banheiro Suíte Master','Banheiro Social','Banheiro Francisco'])
      if(!txt.includes(a)) throw new Error('faltou '+a);
  });
  await p.screenshot({path:'/tmp/s1-ambientes.png'});

  await step('abrir ambiente e editar medidas', async()=>{
    await p.locator('#listaAmb .card').first().tap();
    await p.waitForTimeout(250);
    await p.locator('#ambHead .iconbtn').tap();
    await p.waitForTimeout(250);
    await p.fill('#aL','3,20'); await p.fill('#aC','4,00'); await p.fill('#aP','2,70');
    await p.locator('#ovFoot .btn', {hasText:'Salvar'}).tap();
    await p.waitForTimeout(300);
    const t = await p.locator('#ambHead').innerText();
    if(!t.includes('12,8')) throw new Error('área não calculada: '+t.replace(/\n/g,'|'));
  });
  await p.screenshot({path:'/tmp/s2-ambiente.png'});

  await step('criar material com cálculo', async()=>{
    await p.locator('#ambTabs .chip', {hasText:'Materiais'}).tap();
    await p.waitForTimeout(200);
    await p.locator('button', {hasText:'Novo material'}).last().tap();
    await p.waitForTimeout(250);
    await p.fill('#mNome','Porcelanato 60x60');
    await p.selectOption('#mUn','m²');
    await p.fill('#mPreco','89,90'); await p.fill('#mPrev','14'); await p.fill('#mComp','15'); await p.fill('#mUsa','5');
    const calc = await p.locator('#mCalc').innerText();
    if(!calc.includes('1.348,50')) throw new Error('cálculo errado: '+calc);
    await p.locator('#ovFoot .btn',{hasText:'Salvar'}).tap();
    await p.waitForTimeout(300);
    const t = await p.locator('#ambConteudo').innerText();
    if(!t.includes('Porcelanato')) throw new Error('material não listado');
  });

  await step('anexar recibo ao material', async()=>{
    await p.locator('#ambConteudo .item').first().tap();
    await p.waitForTimeout(300);
    const [fc] = await Promise.all([ p.waitForEvent('filechooser'), p.locator('button',{hasText:'Anexar recibo'}).tap() ]);
    await fc.setFiles('/tmp/recibo.png');
    await p.waitForSelector('#rVal',{timeout:8000});
    await p.fill('#rVal','1.400,00');
    await p.locator('#ovFoot .btn',{hasText:'Salvar'}).tap();
    await p.waitForSelector('#mRec .thumb',{timeout:8000});
    const n = await p.locator('#mRec .thumb').count();
    if(n!==1) throw new Error('recibos='+n);
    const conf = await p.locator('#mConf').innerText();
    if(!conf.includes('diferença')) throw new Error('conferência de recibo ausente: '+conf);
    await p.locator('#ovFoot .btn',{hasText:'Salvar'}).tap();
    await p.waitForTimeout(400);
  });

  await step('criar tarefa com prazo vencido', async()=>{
    await p.locator('#ambTabs .chip',{hasText:'Tarefas'}).tap();
    await p.waitForTimeout(200);
    await p.locator('button',{hasText:'Nova tarefa'}).last().tap();
    await p.waitForTimeout(250);
    await p.fill('#tTit','Assentar piso');
    await p.fill('#tPrazo','2026-08-01');
    await p.selectOption('#tPrio','alta');
    await p.locator('#ovFoot .btn',{hasText:'Salvar'}).tap();
    await p.waitForTimeout(300);
    const t = await p.locator('#ambConteudo').innerText();
    if(!t.includes('Venceu')) throw new Error('tag de vencido ausente: '+t.replace(/\n/g,'|'));
  });

  await step('anexar planta', async()=>{
    await p.locator('#ambTabs .chip',{hasText:'Arquivos'}).tap();
    await p.waitForTimeout(200);
    const antes = await p.locator('#gridAmbArq .thumb').count();
    await p.locator('button',{hasText:'Adicionar planta'}).last().tap();
    await p.waitForTimeout(300);
    await p.locator('#fCats .chip',{hasText:'Planta'}).tap();
    const [fc2] = await Promise.all([ p.waitForEvent('filechooser'), p.locator('#ovFoot .btn',{hasText:'Escolher'}).tap() ]);
    await fc2.setFiles('/tmp/planta.png');
    await p.waitForTimeout(1800);
    const n = await p.locator('#gridAmbArq .thumb').count();
    if(n!==antes+1) throw new Error('arquivos='+n+' antes='+antes);
    if(!await p.locator('#gridAmbArq img').count()) throw new Error('miniatura não gerada');
  });
  await p.screenshot({path:'/tmp/s3-arquivos.png'});

  await step('visualizador abre e fecha', async()=>{
    await p.locator('#gridAmbArq .thumb').first().tap();
    await p.waitForTimeout(500);
    if(!await p.locator('#viewer.on').count()) throw new Error('viewer não abriu');
    await p.locator('#vClose').tap(); await p.waitForTimeout(300);
    if(await p.locator('#viewer.on').count()) throw new Error('viewer não fechou');
  });

  await step('painel soma os valores', async()=>{
    await p.locator('#nav button[data-v=painel]').tap();
    await p.waitForTimeout(350);
    const t = await p.locator('#kpis').innerText();
    if(!t.includes('1.348,50')) throw new Error('gasto errado: '+t.replace(/\n/g,'|'));
    const pr = await p.locator('#cardProg').innerText();
    if(!pr.includes('Andamento')) throw new Error('barra de andamento ausente');
    const al = await p.locator('#painelAlerta').innerText();
    if(!al.toLowerCase().includes('vencido')) throw new Error('alerta ausente: '+al);
  });
  await p.screenshot({path:'/tmp/s4-painel.png'});

  await step('lista de compras', async()=>{
    await p.locator('#nav button[data-v=materiais]').tap();
    await p.waitForTimeout(300);
    await p.locator('button',{hasText:'Novo material'}).last().tap();
    await p.waitForTimeout(250);
    await p.fill('#mNome','Rejunte cinza'); await p.fill('#mPreco','30'); await p.fill('#mPrev','10'); await p.fill('#mComp','4');
    await p.locator('#ovFoot .btn',{hasText:'Salvar'}).tap();
    await p.waitForTimeout(400);
    const r = await p.locator('#resumoMat').innerText();
    if(!r.includes('180,00')) throw new Error('falta comprar errado: '+r.replace(/\n/g,'|'));
    await p.locator('button',{hasText:'Lista de compras'}).tap();
    await p.waitForTimeout(300);
    const n = await p.locator('#listaMat .item').count();
    if(n!==1) throw new Error('lista de compras com '+n+' itens');
  });

  await step('prompt do Claude', async()=>{
    await p.locator('#fabClaude').tap();
    await p.waitForTimeout(300);
    await p.locator('#cSug .chip').first().tap();
    await p.evaluate(()=>{ window.__cap=null; navigator.clipboard.writeText = t => { window.__cap=t; return Promise.resolve(); }; });
    await p.locator('#ovFoot .btn',{hasText:/^Copiar$/}).tap();
    await p.waitForTimeout(400);
    const cap = await p.evaluate(()=>window.__cap);
    if(!cap) throw new Error('nada copiado');
    if(/1 materiais|1 tarefas/.test(await p.locator('#painelAmb').innerText())) throw new Error('plural errado no painel');
    for(const k of ['Porcelanato','12,8','Obra:']) if(!cap.includes(k)) throw new Error('contexto sem '+k+' → '+cap.slice(0,300));
  });

  await step('persistência após recarregar', async()=>{
    await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(800);
    const t = await p.locator('#kpis').innerText();
    if(!t.includes('1.468,50')) throw new Error('perdeu dados: '+t.replace(/\n/g,'|'));
  });

  await step('botão do Claude sempre acessível e sem sobrepor', async()=>{
   for(const v of ['painel','ambientes','materiais','tarefas','arquivos']){
    await p.locator('#nav button[data-v='+v+']').tap(); await p.waitForTimeout(350);
    if(!await p.locator('#fabClaude:visible').count()) throw new Error('sem botão do Claude em '+v);
    for(const pos of [99999]){
      await p.evaluate(y=>window.scrollTo(0,y), pos); await p.waitForTimeout(350);
      const bad = await p.evaluate(()=>{
        const out=[];
        document.querySelectorAll('main .btn, main .item').forEach(e=>{
          const b=e.getBoundingClientRect();
          if(b.width===0||b.bottom<0||b.top>window.innerHeight) return;
          const cx=b.left+b.width/2, cy=Math.min(Math.max(b.top+b.height/2,2),window.innerHeight-2);
          const el=document.elementFromPoint(cx,cy);
          if(el && !e.contains(el) && el!==e) out.push(((e.textContent||'').trim().slice(0,24))+'['+(e.id||e.className)+'] ← '+(el.id||el.className||el.tagName)+':'+(el.textContent||'').trim().slice(0,20));
        });
        return out;
      });
      if(bad.length) throw new Error('elemento coberto em '+v+': '+bad.join(' | '));
    }
   }
  });

  await step('excluir material', async()=>{
    await p.locator('#nav button[data-v=materiais]').tap(); await p.waitForTimeout(350);
    await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(300);
    const antes = await p.locator('#listaMat .item').count();
    await p.locator('#listaMat .item',{hasText:'Rejunte'}).tap();
    await p.waitForTimeout(300);
    await p.locator('#ovFoot .btn',{hasText:'Excluir'}).tap();
    await p.waitForTimeout(300);
    await p.locator('#ovFoot .btn',{hasText:'Excluir'}).tap();
    await p.waitForTimeout(500);
    const dep = await p.locator('#listaMat .item').count();
    if(dep !== antes-1) throw new Error('antes='+antes+' depois='+dep);
  });

  await step('nome muito longo não estoura', async()=>{
    await p.locator('#nav button[data-v=ambientes]').tap(); await p.waitForTimeout(250);
    await p.locator('#addAmb').tap(); await p.waitForTimeout(250);
    await p.fill('#aNome','Banheiro da Suíte Master com Closet Integrado e Bancada Dupla em Quartzo Branco');
    await p.locator('#ovFoot .btn',{hasText:'Salvar'}).tap();
    await p.waitForTimeout(500);
    const o = await p.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
    if(o>1) throw new Error('overflow '+o);
  });

  await step('nova unidade fica isolada', async()=>{
    await p.locator('#btnMenu').tap(); await p.waitForTimeout(350);
    await p.locator('#menuUni').tap(); await p.waitForTimeout(400);
    await p.locator('#ovFoot .btn',{hasText:'Nova unidade'}).tap(); await p.waitForTimeout(300);
    await p.fill('#uNome','Casa Aldeota'); await p.fill('#uOrc','50.000');
    await p.locator('#ovFoot .btn',{hasText:'Salvar'}).tap(); await p.waitForTimeout(600);
    const k = await p.locator('#kpis').innerText();
    if(!/0,00/.test(k)||/1\.348/.test(k)) throw new Error('unidade nova não está zerada: '+k.replace(/\n/g,'|'));
    const prog = await p.locator('#cardOrc').innerText();
    if(!prog.includes('50.000')) throw new Error('orçamento não gravou: '+prog.replace(/\n/g,'|'));
    // volta para a obra original
    await p.locator('#btnUnits').tap(); await p.waitForTimeout(300);
    await p.locator('#ovBody .item',{hasText:'AP 103A'}).tap(); await p.waitForTimeout(600);
    const k2 = await p.locator('#kpis').innerText();
    if(!k2.includes('1.348,50')) throw new Error('dados da obra original sumiram: '+k2.replace(/\n/g,'|'));
  });

  await step('backup e restauração', async()=>{
    await p.locator('#btnMenu').tap(); await p.waitForTimeout(350);
    const [dl] = await Promise.all([ p.waitForEvent('download'), p.locator('#menuBk2').tap() ]);
    const caminho = '/tmp/backup.json';
    await dl.saveAs(caminho);
    const j = JSON.parse(require('fs').readFileSync(caminho,'utf8'));
    if(j.app!=='obra-em-dia') throw new Error('backup inválido');
    if(Object.keys(j.arquivos||{}).length < 2) throw new Error('backup sem os arquivos');
    // apaga tudo e restaura
    await p.evaluate(async()=>{ indexedDB.deleteDatabase('obraemdia'); });
    await p.waitForTimeout(400);
    await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(900);
    const zerado = await p.locator('#kpis').innerText();
    if(zerado.includes('1.348,50')) throw new Error('não zerou para o teste');
    await p.locator('#btnMenu').tap(); await p.waitForTimeout(350);
    const [fc3] = await Promise.all([ p.waitForEvent('filechooser'), p.locator('#menuRest').tap() ]);
    await fc3.setFiles(caminho);
    await p.waitForTimeout(600);
    await p.locator('#ovFoot .btn',{hasText:'Restaurar'}).tap();
    await p.waitForTimeout(2500);
    const t = await p.locator('#kpis').innerText();
    if(!t.includes('1.348,50')) throw new Error('restauração falhou: '+t.replace(/\n/g,'|'));
    await p.locator('#nav button[data-v=arquivos]').tap(); await p.waitForTimeout(900);
    if(!await p.locator('#gridArq img').count()) throw new Error('fotos não voltaram');
  });

  await step('relatório em markdown', async()=>{
    await p.locator('#btnMenu').tap(); await p.waitForTimeout(350);
    const [dl2] = await Promise.all([ p.waitForEvent('download'), p.locator('#menuRel').tap() ]);
    await dl2.saveAs('/tmp/rel.md');
    const md = require('fs').readFileSync('/tmp/rel.md','utf8');
    for(const k of ['Relatório da obra','Quarto Arthur','Porcelanato','Assentar piso'])
      if(!md.includes(k)) throw new Error('relatório sem '+k);
  });

  await step('alvos de toque >= 48px', async()=>{
    const small = await p.evaluate(()=>{
      const out=[];
      document.querySelectorAll('button,.chip,select,input,.item[role=button],.thumb,.tapzone').forEach(e=>{
        const r=e.getBoundingClientRect();
        if(r.width===0||r.height===0) return;
        if(r.height<48) out.push((e.id||e.className||e.tagName)+' h='+Math.round(r.height));
      });
      return out;
    });
    if(small.length) throw new Error(small.join(' | '));
  });

  await step('sem rolagem horizontal (375px)', async()=>{
    const o = await p.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
    if(o>1) throw new Error('overflow '+o+'px');
  });

  await step('paisagem 667x375', async()=>{
    await p.setViewportSize({width:667,height:375}); await p.waitForTimeout(400);
    const o = await p.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
    if(o>1) throw new Error('overflow '+o);
    await p.screenshot({path:'/tmp/s5-paisagem.png'});
  });

  await step('tela pequena 320x568', async()=>{
    await p.setViewportSize({width:320,height:568}); await p.waitForTimeout(400);
    const o = await p.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
    if(o>1) throw new Error('overflow '+o);
    await p.screenshot({path:'/tmp/s6-320.png', fullPage:true});
  });

  await step('modo escuro', async()=>{
    await p.emulateMedia({colorScheme:'dark'});
    await p.setViewportSize({width:375,height:667}); await p.waitForTimeout(400);
    await p.screenshot({path:'/tmp/s7-dark.png'});
  });

  console.log(LOG.join('\n'));
  console.log('\n--- ERROS ('+ERR.length+') ---\n'+ERR.join('\n'));
  await b.close();
  process.exit(ERR.length?1:0);
})();

(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}

  /* header: solid on scroll + mobile menu */
  var hdr=$('#hdr');
  if(hdr){
    var solid=function(){ if(window.scrollY>40||document.body.classList.contains('inner')) hdr.classList.add('solid'); else hdr.classList.remove('solid'); };
    window.addEventListener('scroll',solid,{passive:true}); solid();
    var tg=$('.navtoggle');
    if(tg) tg.addEventListener('click',function(){ var o=hdr.classList.toggle('open'); tg.setAttribute('aria-expanded',o?'true':'false'); });
    $$('nav a',hdr).forEach(function(a){a.addEventListener('click',function(){hdr.classList.remove('open')})});
  }

  /* reveal on scroll: only items below the fold wait, so the page is complete at rest */
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('rv-in'); e.target.classList.remove('rv-wait'); io.unobserve(e.target);} })},{threshold:.12});
    $$('.rv').forEach(function(el,i){ var r=el.getBoundingClientRect(); if(r.top>window.innerHeight){ el.classList.add('rv-wait'); el.style.transitionDelay=((i%3)*90)+'ms'; io.observe(el);} });
  }

  /* count-up numbers */
  var nums=$$('[data-count]');
  if(nums.length && 'IntersectionObserver' in window && !reduce){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting) return; cio.unobserve(e.target);
      var el=e.target, end=parseFloat(el.getAttribute('data-count')), suf=el.getAttribute('data-suffix')||'', t0=null;
      function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/1400), v=Math.round(end*(1-Math.pow(1-p,3)));
        el.textContent=v.toLocaleString('en-US')+suf; if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    })},{threshold:.5});
    nums.forEach(function(n){cio.observe(n)});
  }

  /* parallax on office photos */
  var px=$$('.ofig img');
  if(px.length && !reduce){
    var onpx=function(){ px.forEach(function(img){ var r=img.parentNode.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight) return; var c=(r.top+r.height/2-innerHeight/2)/innerHeight; img.style.transform='translateY('+(c*-30)+'px)'; }); };
    window.addEventListener('scroll',onpx,{passive:true}); onpx();
  }

  /* countdown */
  $$('[data-countdown]').forEach(function(el){
    var target=new Date(el.getAttribute('data-countdown')).getTime();
    var parts={d:$('[data-u=d]',el),h:$('[data-u=h]',el),m:$('[data-u=m]',el),s:$('[data-u=s]',el)};
    function tick(){ var ms=Math.max(0,target-Date.now()), s=Math.floor(ms/1000);
      if(parts.d) parts.d.textContent=Math.floor(s/86400);
      if(parts.h) parts.h.textContent=String(Math.floor(s%86400/3600)).padStart(2,'0');
      if(parts.m) parts.m.textContent=String(Math.floor(s%3600/60)).padStart(2,'0');
      if(parts.s) parts.s.textContent=String(s%60).padStart(2,'0'); }
    tick(); if(!reduce) setInterval(tick,1000);
  });

  /* reading progress bar */
  var prog=$('.progress');
  if(prog){ var onp=function(){ var h=document.documentElement; var p=h.scrollTop/(h.scrollHeight-h.clientHeight||1); prog.style.width=(p*100)+'%'; }; window.addEventListener('scroll',onp,{passive:true}); onp(); }

  /* process rail */
  var steps=$('#steps');
  if(steps && 'IntersectionObserver' in window && !reduce){
    steps.style.setProperty('--p','6%');
    new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){steps.style.setProperty('--p','100%');o.disconnect()}})},{threshold:.3}).observe(steps);
  }

  /* animated skyline (home hero) */
  var cv=$('#sky');
  if(cv){
    var ctx=cv.getContext('2d'), W,H,blds=[],cars=[],t0=performance.now();
    var rnd=function(s){ var x=Math.sin(s)*10000; return x-Math.floor(x); };
    var build=function(){
      var dpr=Math.min(window.devicePixelRatio||1,2); W=cv.clientWidth; H=cv.clientHeight;
      cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      blds=[]; var x=-10,i=0;
      while(x<W+20){
        var w=40+rnd(i*3.1+1)*70, far=rnd(i*1.9+2)<.45, h=H*(.1+rnd(i*7.7+3)*.24)*(far?.85:1);
        var b={x:x,w:w,h:h,far:far,win:[]}, cols=Math.max(2,Math.floor(w/12)), rows=Math.floor(h/16);
        for(var r=1;r<rows;r++)for(var c=0;c<cols;c++) b.win.push({x:x+5+c*(w-10)/cols,y:H-h+r*16,on:rnd(i*13+r*7+c+5)>.6,ph:rnd(i+r+c*3)*6.28});
        blds.push(b); x+=w+rnd(i*5.3)*8; i++;
      }
      blds.sort(function(a,b){return (b.far?1:0)-(a.far?1:0)});
      cars=[]; for(var k=0;k<14;k++) cars.push({x:rnd(k*9+1)*W,s:(20+rnd(k*4+2)*40)*(k%2?1:-1),lane:k%2});
    };
    var draw=function(now){
      var t=(now-t0)/1000; ctx.clearRect(0,0,W,H);
      var g=ctx.createRadialGradient(W*.72,H,10,W*.72,H,H*.9); g.addColorStop(0,'rgba(212,175,90,.22)'); g.addColorStop(1,'rgba(212,175,90,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      for(var i=0;i<blds.length;i++){ var b=blds[i];
        ctx.fillStyle=b.far?'rgba(29,51,88,.55)':'rgba(10,19,36,.94)'; ctx.fillRect(b.x,H-b.h,b.w,b.h);
        for(var j=0;j<b.win.length;j++){ var w=b.win[j], lit=w.on;
          if(!reduce && rnd(j+i*31+Math.floor(t/3))>.985) lit=!lit; if(!lit) continue;
          var a=b.far?.22:.5+.28*Math.sin(t*.8+w.ph);
          ctx.fillStyle=b.far?'rgba(183,193,211,'+a+')':'rgba(240,206,128,'+a+')'; ctx.fillRect(w.x,w.y,4,6); } }
      ctx.fillStyle='rgba(7,14,26,.96)'; ctx.fillRect(0,H-14,W,14);
      for(var k=0;k<cars.length;k++){ var c=cars[k]; if(!reduce){ c.x+=c.s/60; if(c.x>W+20)c.x=-20; if(c.x<-20)c.x=W+20; }
        ctx.fillStyle=c.s>0?'rgba(255,232,180,.9)':'rgba(230,80,80,.85)'; ctx.fillRect(c.x,H-(c.lane?9:5),6,2); }
      if(!reduce) requestAnimationFrame(draw);
    };
    build(); requestAnimationFrame(draw);
    var rt; window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){build(); if(reduce) requestAnimationFrame(draw);},150)});
  }

  /* copy buttons + interest shortcuts */
  function copyText(t,btn){
    var done=function(){var o=btn.textContent;btn.textContent='Copied';setTimeout(function(){btn.textContent=o},1400)};
    try{navigator.clipboard.writeText(t).then(done,function(){btn.textContent='Select and copy'})}catch(e){btn.textContent='Select and copy'}
  }
  $$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){copyText(b.getAttribute('data-copy'),b)})});
  $$('[data-interest]').forEach(function(a){a.addEventListener('click',function(){var s=$('#f-int'); if(s) s.value=a.getAttribute('data-interest')})});

  /* Netlify forms: send in place, fall back to a copyable message */
  $$('form[data-netlify]').forEach(function(f){
    var sent=$('.sent',f), ready=$('.readybox',f), out=$('pre',ready||f), err=$('.err',f), btn=$('button[type=submit]',f), label=btn?btn.textContent:'';
    var copy=$('.copymsg',f); if(copy) copy.addEventListener('click',function(){copyText(out.textContent,copy)});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var name=f.elements['name'], email=f.elements['email'];
      if(!name||!email||!name.value.trim()||email.value.indexOf('@')<1){ if(err){err.textContent='Add your name and a valid email so we can reply.';err.hidden=false;} return; }
      if(err) err.hidden=true;
      var lines=[]; [].forEach.call(f.elements,function(el){ if(!el.name||el.type==='hidden'||el.name==='company-website'||!el.value) return; lines.push(el.name+': '+el.value); });
      var body=lines.join('\n');
      function fallback(){ if(out) out.textContent=body; var m=$('.mailto',f); if(m) m.href='mailto:val@atlanticandvine.com?subject='+encodeURIComponent('Website: '+(f.getAttribute('name')||'inquiry'))+'&body='+encodeURIComponent(body); if(ready) ready.hidden=false; btn.disabled=false; btn.textContent=label; }
      btn.disabled=true; btn.textContent='Sending…'; if(ready) ready.hidden=true; if(sent) sent.hidden=true;
      try{
        fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(f)).toString()})
          .then(function(r){ if(!r.ok) throw 0; if(sent) sent.hidden=false; f.reset(); btn.disabled=false; btn.textContent=label; })
          .catch(fallback);
      }catch(x){ fallback(); }
    });
  });
})();

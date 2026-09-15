(function(){

  /* ---- theme toggle ---- */
  var root=document.documentElement, tbtn=document.getElementById('theme');
  function sysDark(){return window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;}
  var stored=null;try{stored=localStorage.getItem('gla-theme');}catch(e){}
  if(stored)root.setAttribute('data-theme',stored);
  tbtn&&tbtn.addEventListener('click',function(){
    var cur=root.getAttribute('data-theme')||(sysDark()?'dark':'light');
    var next=cur==='dark'?'light':'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('gla-theme',next);}catch(e){}
  });

  /* ---- mobile menu ---- */
  var menuBtn=document.getElementById('menuToggle'), mobileMenu=document.getElementById('mobileMenu');
  function closeMenu(){ if(!mobileMenu)return; mobileMenu.classList.remove('open'); menuBtn&&menuBtn.setAttribute('aria-expanded','false'); }
  menuBtn&&mobileMenu&&menuBtn.addEventListener('click',function(){
    var open=mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded',open?'true':'false');
  });
  mobileMenu&&mobileMenu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});

  /* ---- scroll progress + back-to-top ---- */
  var sbar=document.getElementById('scrollbar'), totop=document.getElementById('totop');
  function onScroll(){
    var h=document.documentElement;
    var max=(h.scrollHeight-h.clientHeight)||1;
    if(sbar)sbar.style.width=Math.min(100,(h.scrollTop/max)*100)+'%';
    if(totop)totop.classList.toggle('show',window.scrollY>window.innerHeight*0.6);
  }
  document.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
  totop&&totop.addEventListener('click',function(){
    window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
  });

  /* ---- scroll reveal ---- */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  /* ---- count up ---- */
  var counted=false;
  var statObs=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting&&!counted){counted=true;
        document.querySelectorAll('[data-count]').forEach(function(el){
          var target=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'',t0=null,dur=1400;
          function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/dur,1);var ease=1-Math.pow(1-p,3);
            var val=Math.round(target*ease);
            el.textContent=(target>=1000?val:val)+ (p===1?suf:'');
            if(p<1)requestAnimationFrame(step);}
          if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches)requestAnimationFrame(step);
        });
      }
    });
  },{threshold:.4});
  var sb=document.querySelector('.stats');sb&&statObs.observe(sb);

  /* ---- hero globe meridian (canvas) ---- */
  var cvs=document.getElementById('globe');
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(cvs){
    var ctx=cvs.getContext('2d'),W,H,DPR=Math.min(window.devicePixelRatio||1,2),t=0,raf=0;
    var nodes=[ /* eight chapters plotted at real lon/lat */
      {lon:-0.1,lat:51.5,name:'London'},{lon:-74,lat:40.7,name:'New York'},
      {lon:73.0,lat:33.7,name:'Islamabad'},{lon:46.7,lat:24.7,name:'Riyadh'},
      {lon:-79.4,lat:43.7,name:'Toronto'},{lon:29.0,lat:41.0,name:'Istanbul'},
      {lon:4.3,lat:50.8,name:'Brussels'},{lon:55.3,lat:25.2,name:'Dubai'}
    ];
    function resize(){W=cvs.clientWidth;H=cvs.clientHeight;cvs.width=W*DPR;cvs.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
    function project(lon,lat,rot){
      var la=lat*Math.PI/180, lo=lon*Math.PI/180+rot;
      return {x:Math.cos(la)*Math.sin(lo), y:Math.sin(la), z:Math.cos(la)*Math.cos(lo)};
    }
    function geo(cx,cy,R,rot){return function(lon,lat){var p=project(lon,lat,rot);return {x:cx+p.x*R,y:cy-p.y*R,z:p.z};};}

    function frame(){
      var cx=W*0.72, cy=H*0.48, R=Math.min(W*0.62,H*0.92)*0.5, rot=t;
      var P=geo(cx,cy,R,rot);
      ctx.clearRect(0,0,W,H);

      // soft golden aura behind the sphere
      var aura=ctx.createRadialGradient(cx,cy,R*0.2,cx,cy,R*1.5);
      aura.addColorStop(0,'rgba(198,161,91,0.16)');
      aura.addColorStop(0.5,'rgba(198,161,91,0.05)');
      aura.addColorStop(1,'rgba(198,161,91,0)');
      ctx.fillStyle=aura;ctx.beginPath();ctx.arc(cx,cy,R*1.5,0,Math.PI*2);ctx.fill();

      // faint filled sphere for depth
      var body=ctx.createRadialGradient(cx-R*0.3,cy-R*0.3,R*0.1,cx,cy,R);
      body.addColorStop(0,'rgba(30,54,74,0.55)');
      body.addColorStop(1,'rgba(12,26,38,0.15)');
      ctx.fillStyle=body;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();

      function drawLatitude(lat,alpha,w){
        ctx.beginPath();var s=false;
        for(var lon=-180;lon<=180;lon+=4){var p=P(lon,lat);if(p.z>-0.05){var a=p.z<0?alpha*0.28:alpha;if(!s){ctx.moveTo(p.x,p.y);s=true;}else ctx.lineTo(p.x,p.y);}else s=false;}
        ctx.strokeStyle='rgba(214,182,120,'+alpha+')';ctx.lineWidth=w;ctx.stroke();
      }
      function drawMeridian(lon,alpha,w){
        ctx.beginPath();var s=false;
        for(var lat=-90;lat<=90;lat+=4){var p=P(lon,lat);if(p.z>-0.05){if(!s){ctx.moveTo(p.x,p.y);s=true;}else ctx.lineTo(p.x,p.y);}else s=false;}
        ctx.strokeStyle='rgba(214,182,120,'+alpha+')';ctx.lineWidth=w;ctx.stroke();
      }

      // graticule — latitudes
      for(var i=-75;i<=75;i+=15){ drawLatitude(i, i===0?0.34:0.13, i===0?1.3:0.9); }
      // graticule — meridians (back ones dim, front ones brighter)
      for(var lo=0;lo<180;lo+=15){
        var mid=P(lo,0);
        drawMeridian(lo, mid.z>0?0.15:0.06, 0.9);
      }

      // animated sweeping highlight meridian (the "drawing" golden line)
      var sweepLon=(t*46)%360;
      ctx.save();ctx.shadowColor='rgba(224,196,132,0.9)';ctx.shadowBlur=12;
      drawMeridian(sweepLon, 0.55, 1.6);
      ctx.restore();

      // glowing rim
      ctx.save();ctx.shadowColor='rgba(224,196,132,0.6)';ctx.shadowBlur=18;
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle='rgba(224,196,132,0.55)';ctx.lineWidth=1.4;ctx.stroke();
      ctx.restore();
      ctx.beginPath();ctx.arc(cx,cy,R+6,0,Math.PI*2);ctx.strokeStyle='rgba(198,161,91,0.16)';ctx.lineWidth=1;ctx.stroke();

      // chapter connection arcs — flowing dashed gold
      var pts=nodes.map(function(n){return P(n.lon,n.lat);});
      ctx.save();ctx.setLineDash([5,7]);ctx.lineDashOffset=-t*38;
      for(var a=0;a<pts.length;a++){for(var b=a+1;b<pts.length;b++){
        if(pts[a].z>-0.1&&pts[b].z>-0.1){
          var mx=(pts[a].x+pts[b].x)/2,my=(pts[a].y+pts[b].y)/2-R*0.28;
          ctx.beginPath();ctx.moveTo(pts[a].x,pts[a].y);ctx.quadraticCurveTo(mx,my,pts[b].x,pts[b].y);
          ctx.strokeStyle='rgba(224,196,132,0.18)';ctx.lineWidth=1;ctx.stroke();
        }
      }}
      ctx.restore();

      // chapter nodes with pulse
      pts.forEach(function(p){
        if(p.z<=0)return;
        var pulse=(Math.sin(t*2.4)+1)/2;
        ctx.beginPath();ctx.arc(p.x,p.y,9+4*pulse,0,Math.PI*2);ctx.strokeStyle='rgba(224,196,132,'+(0.35-0.22*pulse)+')';ctx.lineWidth=1;ctx.stroke();
        ctx.save();ctx.shadowColor='rgba(224,196,132,0.9)';ctx.shadowBlur=10;
        ctx.beginPath();ctx.arc(p.x,p.y,3.2,0,Math.PI*2);ctx.fillStyle='#EBD39B';ctx.fill();
        ctx.restore();
      });
    }

    function loop(){ t+=0.0016; frame(); raf=requestAnimationFrame(loop); }
    resize();
    if(reduce){ t=0.7; frame(); }               // single static, beautiful frame
    else { loop(); }
    window.addEventListener('resize',function(){resize();if(reduce)frame();});
    document.addEventListener('visibilitychange',function(){
      if(reduce)return;
      if(document.hidden){cancelAnimationFrame(raf);} else {raf=requestAnimationFrame(loop);}
    });
  }

  /* ---- membership application form ---- */
  var form = document.getElementById('applyForm');
  if (form) {
    var dropzone = document.getElementById('uploadZone');
    var fileInput = document.getElementById('pictureInput');
    var preview = document.getElementById('uploadPreview');
    var previewImg = preview.querySelector('img');
    var previewName = preview.querySelector('.fname');
    var removeBtn = document.getElementById('removePicture');
    var msg = document.getElementById('formMsg');
    var submitBtn = document.getElementById('submitBtn');
    var btnLabelEl = submitBtn.querySelector('.btn-label');
    var submitDefaultLabel = btnLabelEl.textContent;
    var pictureDataUrl = null;
    var pictureName = null;

    /* pre-select the enquiry type from ?intent= on the URL, and
       jump straight to the form when arriving with #apply-form */
    try {
      var params = new URLSearchParams(window.location.search);
      var intent = params.get('intent');
      if (intent) {
        var radio = form.querySelector('input[name="intent"][value="' + intent + '"]');
        if (radio) radio.checked = true;
      }
    } catch (e) {}

    function showMsg(kind, text) {
      msg.textContent = text;
      msg.className = 'form-msg show ' + kind;
    }

    function resizeImage(file, maxDim, quality) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        var reader = new FileReader();
        reader.onload = function (e) {
          img.onload = function () {
            var w = img.width, h = img.height;
            if (w > h && w > maxDim) { h = Math.round(h * (maxDim / w)); w = maxDim; }
            else if (h > maxDim) { w = Math.round(w * (maxDim / h)); h = maxDim; }
            var canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    function handleFile(file) {
      if (!file) return;
      if (!/^image\//.test(file.type)) { showMsg('err', 'Please choose an image file for the picture upload.'); return; }
      if (file.size > 12 * 1024 * 1024) { showMsg('err', 'That image is larger than 12MB — please choose a smaller file.'); return; }
      resizeImage(file, 1000, 0.82).then(function (dataUrl) {
        pictureDataUrl = dataUrl;
        pictureName = (file.name || 'photo.jpg').replace(/\.[a-zA-Z0-9]+$/, '.jpg');
        previewImg.src = dataUrl;
        previewName.textContent = file.name;
        preview.classList.add('show');
        dropzone.querySelector('.utext').textContent = 'Photo selected — click to change';
      }).catch(function () {
        showMsg('err', 'That image could not be read. Please try a different file.');
      });
    }

    dropzone.addEventListener('click', function () { fileInput.click(); });
    dropzone.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
    fileInput.addEventListener('change', function () { handleFile(fileInput.files[0]); });
    ['dragenter', 'dragover'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.remove('drag'); });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    removeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      pictureDataUrl = null; pictureName = null;
      fileInput.value = '';
      preview.classList.remove('show');
      dropzone.querySelector('.utext').textContent = 'Click to upload, or drag a photo here';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form-msg';

      if (!pictureDataUrl) { showMsg('err', 'Please add a passport-size picture before submitting.'); return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var endpoint = window.GLF_FORM_ENDPOINT || '';
      if (!endpoint || endpoint.indexOf('PASTE_YOUR') === 0) {
        showMsg('err', 'The application backend is not configured yet. Please email your details directly to globallawyersforum@gmail.com in the meantime.');
        return;
      }

      var data = {
        intent: (form.querySelector('input[name="intent"]:checked') || {}).value || 'membership',
        name: form.name.value.trim(),
        address: form.address.value.trim(),
        cell: form.cell.value.trim(),
        email: form.email.value.trim(),
        cnic: form.cnic.value.trim(),
        passport: form.passport.value.trim(),
        barLicense: form.barLicense.value.trim(),
        parentBar: form.parentBar.value.trim(),
        message: form.message ? form.message.value.trim() : '',
        pictureBase64: pictureDataUrl,
        pictureName: pictureName,
        pictureType: 'image/jpeg',
        pageUrl: window.location.href,
        submittedAt: new Date().toISOString()
      };

      submitBtn.classList.add('loading');
      submitBtn.setAttribute('disabled', 'disabled');
      btnLabelEl.textContent = 'Submitting';

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).then(function (res) {
        return res.text().then(function (t) {
          try { return JSON.parse(t); } catch (e) { return { ok: true }; }
        });
      }).then(function (result) {
        if (result && result.ok === false) throw new Error(result.error || 'Submission failed');
        showMsg('ok', 'Thank you, ' + (data.name.split(' ')[0] || '') + '. Your submission has been received — a confirmation is on its way to ' + data.email + ' from globallawyersforum@gmail.com.');
        form.reset();
        pictureDataUrl = null; pictureName = null;
        preview.classList.remove('show');
        dropzone.querySelector('.utext').textContent = 'Click to upload, or drag a photo here';
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }).catch(function () {
        showMsg('err', 'Something went wrong sending your application. Please try again, or email globallawyersforum@gmail.com directly.');
      }).then(function () {
        submitBtn.classList.remove('loading');
        submitBtn.removeAttribute('disabled');
        btnLabelEl.textContent = submitDefaultLabel;
      });
    });
  }
})();

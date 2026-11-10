import './style.css';

const state = {
  lang: localStorage.getItem('stp_lang') || 'en',
  files: [],
  pages: [],
  settings: { copies: 1, color: 'bw', paper: 'A4', sides: 'single', range: 'all', margin: 0, nup: 1 },
  price: 0,
  status: 'Uploaded',
  orderId: null,
};

const rates = {
  A4: { bw: 2, color: 5 },
  A3: { bw: 4, color: 10 }
};

const T = {
  en: {
    brand:'SCAN TO PRINT', subtitle:'Print documents from your phone in a few simple steps.',
    upload:'Upload Document', camera:'Camera Scan', drag:'Drag & drop files here or tap to browse',
    settings:'Print Settings', preview:'Preview', price:'Live Price', pay:'Payment', order:'Order Status',
    copies:'Copies', color:'Color mode', bw:'Black & White', colour:'Colour', paper:'Paper size',
    sides:'Printing', single:'Single side', double:'Double side', pageRange:'Page range',
    all:'All pages', delete:'Delete now', rotate:'Rotate', remove:'Remove', add:'Add pages',
    checkout:'Continue to payment', guest:'Guest mode', privacy:'Your documents are not saved permanently.',
    empty:'No document added yet.', total:'Total', pages:'pages', done:'Done', uploadHint:'PDF, JPG, PNG, DOC, DOCX',
    home:'Home', tools:'Tools', dashboard:'Owner Dashboard', language:'Hindi', back:'Back'
  },
  hi: {
    brand:'स्कैन टू प्रिंट', subtitle:'अपने फोन से दस्तावेज़ आसानी से प्रिंट करें।',
    upload:'दस्तावेज़ अपलोड', camera:'कैमरा स्कैन', drag:'फाइल यहाँ छोड़ें या ब्राउज़ करें',
    settings:'प्रिंट सेटिंग', preview:'प्रीव्यू', price:'लाइव कीमत', pay:'पेमेंट', order:'ऑर्डर स्टेटस',
    copies:'कॉपी', color:'कलर मोड', bw:'ब्लैक एंड व्हाइट', colour:'कलर', paper:'पेपर साइज',
    sides:'प्रिंटिंग', single:'सिंगल साइड', double:'डबल साइड', pageRange:'पेज रेंज',
    all:'सभी पेज', delete:'अभी डिलीट करें', rotate:'घुमाएँ', remove:'हटाएँ', add:'पेज जोड़ें',
    checkout:'पेमेंट पर जाएँ', guest:'गेस्ट मोड', privacy:'आपके डॉक्यूमेंट स्थायी रूप से सेव नहीं होते।',
    empty:'अभी कोई डॉक्यूमेंट नहीं जोड़ा गया है।', total:'कुल', pages:'पेज', done:'हो गया', uploadHint:'PDF, JPG, PNG, DOC, DOCX',
    home:'होम', tools:'टूल्स', dashboard:'ओनर डैशबोर्ड', language:'English', back:'वापस'
  }
};

function t(k){ return T[state.lang][k] || k; }

function uid(){ return 'STP-' + Math.random().toString(36).slice(2,8).toUpperCase(); }

function filePages(file){
  const type = file.type || '';
  if(type === 'application/pdf') return 1;
  return 1;
}

function recalc(){
  const pageCount = Math.max(1, state.pages.length);
  const rate = rates[state.settings.paper][state.settings.color];
  const sideFactor = state.settings.sides === 'double' ? 0.9 : 1;
  state.price = Math.round(pageCount * state.settings.copies * rate * sideFactor);
}

function render(){
  recalc();
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="logo">${t('brand')}</div>
        <nav>
          <button class="navbtn active" data-view="home">${t('home')}</button>
          <button class="navbtn" data-view="tools">${t('tools')}</button>
          <button class="navbtn" data-view="dashboard">${t('dashboard')}</button>
        </nav>
        <button class="lang" id="langBtn">हिंदी / English</button>
      </header>

      <main>
        <section class="hero">
          <div>
            <span class="pill">● ${t('guest')}</span>
            <h1>${t('subtitle')}</h1>
            <p class="muted">${t('privacy')}</p>
          </div>
          <div class="hero-actions">
            <button class="primary" id="uploadBtn">＋ ${t('upload')}</button>
            <button class="secondary" id="cameraBtn">⌾ ${t('camera')}</button>
          </div>
        </section>

        <input id="fileInput" type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />

        <section id="dropzone" class="dropzone">
          <div class="dropicon">↑</div>
          <h3>${t('drag')}</h3>
          <p>${t('uploadHint')}</p>
        </section>

        <div class="grid">
          <section class="card pages-card">
            <div class="section-head"><h2>${t('preview')}</h2><span id="pageCount">0 ${t('pages')}</span></div>
            <div id="pages" class="pages"></div>
          </section>

          <aside class="card settings-card">
            <h2>${t('settings')}</h2>
            <label>${t('copies')}<div class="stepper"><button data-step="-1">−</button><b id="copies">${state.settings.copies}</b><button data-step="1">＋</button></div></label>
            <label>${t('color')}
              <select id="color">
                <option value="bw">${t('bw')}</option>
                <option value="color">${t('colour')}</option>
              </select>
            </label>
            <label>${t('paper')}<select id="paper"><option>A4</option><option>A3</option></select></label>
            <label>${t('sides')}<select id="sides"><option value="single">${t('single')}</option><option value="double">${t('double')}</option></select></label>
            <label>${t('pageRange')}<input id="range" placeholder="1-5 or all" value="all" /></label>
            <label>Pages per sheet<select id="nup"><option value="1">1</option><option value="2">2</option><option value="4">4</option></select></label>
            <label>Margin<select id="margin"><option value="0">0 mm</option><option value="5">5 mm</option><option value="10">10 mm</option></select></label>

            <div class="pricebox">
              <span>${t('price')}</span>
              <strong>₹<span id="price">${state.price}</span></strong>
              <small>${state.pages.length || 0} ${t('pages')} × ${state.settings.copies}</small>
            </div>
            <button class="primary wide" id="checkout">${t('checkout')} →</button>
            <button class="danger wide" id="deleteNow">${t('delete')}</button>
          </aside>
        </div>

        <section class="card status-card">
          <div class="section-head"><h2>${t('order')}</h2><span id="orderId">${state.orderId || '—'}</span></div>
          <div class="timeline">
            ${['Uploaded','Paid','Printing','Done'].map((x,i)=>`<div class="step ${['Uploaded','Paid','Printing','Done'].indexOf(state.status)>=i?'on':''}"><span>${i+1}</span><b>${x}</b></div>`).join('')}
          </div>
        </section>
      </main>

      <footer>
        <span>HTTPS • Privacy • Auto-delete</span>
        <button id="support">WhatsApp / Help</button>
      </footer>
    </div>
  `;
  bind();
}

function addFiles(fileList){
  [...fileList].forEach(file=>{
    state.files.push(file);
    const n=filePages(file);
    for(let i=0;i<n;i++){
      state.pages.push({ id:uid(), name:file.name, type:file.type, url:file.type.startsWith('image/') ? URL.createObjectURL(file) : null, rotation:0 });
    }
  });
  render();
}

function bind(){
  document.querySelector('#uploadBtn')?.addEventListener('click',()=>document.querySelector('#fileInput').click());
  document.querySelector('#cameraBtn')?.addEventListener('click',()=>{
    const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.capture='environment';
    input.onchange=()=>addFiles(input.files); input.click();
  });
  document.querySelector('#fileInput')?.addEventListener('change',e=>addFiles(e.target.files));
  const dz=document.querySelector('#dropzone');
  dz?.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag')});
  dz?.addEventListener('dragleave',()=>dz.classList.remove('drag'));
  dz?.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag');addFiles(e.dataTransfer.files)});
  document.querySelector('#langBtn')?.addEventListener('click',()=>{state.lang=state.lang==='en'?'hi':'en';localStorage.setItem('stp_lang',state.lang);render()});
  document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{state.settings.copies=Math.max(1,state.settings.copies+Number(b.dataset.step));render()});
  ['color','paper','sides','range','nup','margin'].forEach(id=>{
    document.querySelector('#'+id)?.addEventListener('change',e=>{state.settings[id]=e.target.value;render()});
  });
  document.querySelectorAll('.page-action').forEach(b=>b.onclick=()=>{
    const p=state.pages.find(x=>x.id===b.dataset.id);
    if(!p)return;
    if(b.dataset.action==='remove') state.pages=state.pages.filter(x=>x.id!==p.id);
    if(b.dataset.action==='rotate') p.rotation=(p.rotation+90)%360;
    render();
  });
  document.querySelector('#deleteNow')?.addEventListener('click',()=>{
    state.files=[];state.pages=[];state.orderId=null;state.status='Uploaded';render();
  });
  document.querySelector('#checkout')?.addEventListener('click',()=>{
    if(!state.pages.length){alert('Please upload a document first.');return;}
    state.orderId=uid(); state.status='Paid'; render();
    setTimeout(()=>{state.status='Printing';render()},1200);
    setTimeout(()=>{state.status='Done';render()},3200);
  });
  document.querySelector('#support')?.addEventListener('click',()=>alert('Connect your WhatsApp number here.'));
  document.querySelectorAll('.navbtn').forEach(b=>b.onclick=()=> {
    if(b.dataset.view==='tools') showTools();
    else if(b.dataset.view==='dashboard') showDashboard();
    else render();
  });
}

function showTools(){
  document.querySelector('#app').innerHTML=`<div class="shell"><header class="topbar"><div class="logo">${t('brand')}</div><button class="secondary" onclick="location.reload()">← ${t('back')}</button></header><main><section class="hero"><div><span class="pill">PHASE 2–5</span><h1>Document & Business Tools</h1><p class="muted">All requested features are reserved in this application architecture.</p></div></section><section class="toolgrid">${[
'Aadhaar/PAN/ID layout','Passport photo maker','Photo/signature resizer','Auto size compress','PDF merge','PDF split','PDF compress','Image to PDF','Word to PDF','PDF to image','Text redact/mask','Black-white clean scan','Shadow/fold remover','N-up','Margin & fit-to-page','Photo print','Help/WhatsApp support','WhatsApp/SMS updates','Shop owner dashboard','Rate list & timing',
'Form-ready packs','Resume maker','ID card/admit card print','Question paper/notes bulk print','Order history','Dubara print karo','Coupon/referral','Cloud import','PDF password remove','Watermark','Signature','Photo enhance','Booklet print','Spiral/binding','Lamination','Stapling','Invoice/GST bill','Home delivery','Rating/review','Refund/reprint policy',
'OCR Hindi','Handwritten notes to clean PDF','Auto document detect','WhatsApp bot','Voice/Hindi guide','Offline/slow net mode','Printer status alert','Sensitive document warning/PIN','Saved templates',
'Nearby print shop','Subscription','Bulk plan','Courier/same-day express','Typing/form filling/xerox','Sticker print','Visiting card print'
].map((x,i)=>`<div class="tool"><span>${i+21}</span><b>${x}</b><small>Ready for integration</small></div>`).join('')}</section></main></div>`;
}

function showDashboard(){
  document.querySelector('#app').innerHTML=`<div class="shell"><header class="topbar"><div class="logo">${t('brand')}</div><button class="secondary" onclick="location.reload()">← ${t('back')}</button></header><main><section class="hero"><div><span class="pill">OWNER</span><h1>Shop Owner Dashboard</h1><p class="muted">Orders, queue, earnings and rate controls.</p></div></section><section class="stats"><div class="stat"><small>Today orders</small><strong>24</strong></div><div class="stat"><small>Printing queue</small><strong>6</strong></div><div class="stat"><small>Today earnings</small><strong>₹1,840</strong></div><div class="stat"><small>Completed</small><strong>18</strong></div></section><section class="card"><h2>Print Queue</h2><div class="queue"><div><b>STP-7A91K2</b><span>Paid • 8 pages • Colour</span><button class="primary">Print</button></div><div><b>STP-2F31M8</b><span>Paid • 4 pages • B/W</span><button class="primary">Print</button></div><div><b>STP-91X2Q0</b><span>Printing • A3 • 2 copies</span><button class="secondary">Details</button></div></div></section></main></div>`;
}

render();
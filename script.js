
const app = document.getElementById('app');
let page = 'home';
let role = 'resident';
let signedIn = false;
let communitySearch = '';
let filter = 'All';
let selectedId = 1;
let editingPost = false;
let joinedEvent = false;
let supportedIssue = false;
let likedPosts = [];
let account = { name: 'Asha Sultana', email: 'asha@example.com', building: 'Block A', status: 'approved' };
let posts = [
  {
    id: 7, title: 'A folding ladder to lend', category: 'Borrow', author: 'Rafi',
    body: 'I can lend this small ladder over the weekend. Leave a comment if you need it.',
    image: 'images/folding-ladder.jpg', imageAlt: 'A folding step ladder beside a potted plant',
    likes: 2, comments: [], state: 'Open'
  },
  {
    id: 8, title: 'Picture books for younger readers', category: 'Giveaway', author: 'Asha',
    body: 'I have a few picture books to pass on. You can collect them from Block A on Friday afternoon.',
    image: 'images/picture-books.jpg', imageAlt: 'A stack of children’s picture books on a wooden bench',
    likes: 3, comments: [], state: 'Open'
  },
  { id: 1, title: 'Weekend community clean-up', category: 'Announcement', author: 'Mira', body: 'Meet by the main gate on Friday at 8:00 AM. Bring reusable gloves if you have them. Everyone is welcome!', likes: 12, comments: ['Asha: I will bring two extra pairs of gloves.'], state: 'Open' },
  { id: 2, title: 'Does anyone have a ladder to lend?', category: 'Borrow', author: 'Rafi', body: 'I need it for a small repair this weekend.', likes: 5, comments: [], state: 'Open' },
  { id: 3, title: 'Need help carrying a bookshelf', category: 'Help', author: 'Nadia', body: 'Saturday morning, around 10:00. Block B.', likes: 3, comments: [], state: 'Open' },
  { id: 4, title: 'Books looking for a new home', category: 'Giveaway', author: 'Samira', body: 'A small collection of school books in Block A.', likes: 4, comments: [], state: 'Open' },
  { id: 5, title: 'Can I borrow a watering can?', category: 'Borrow', author: 'Asha', body: 'I need a watering can for this weekend. Please reply below if you can lend one.', likes: 1, comments: ['Asha: I can lend mine. We can arrange a handover here.'], state: 'Open' },
  { id: 6, title: 'Extra plant pots available', category: 'Giveaway', author: 'Asha', body: 'Six small terracotta pots.', likes: 2, comments: [], state: 'Completed' }
];
let issues = [
  { id: 1, title: 'Streetlight near the main gate', category: 'Lighting', location: 'Block A entrance', description: 'The streetlight beside the main gate is not working.', status: 'In progress', supports: 8, updates: ['01 Nov — Open — Issue submitted.', '02 Nov — In progress — Electrician has been contacted.'] },
  { id: 2, title: 'Water leak in the common garden', category: 'Water', location: 'Common garden', description: 'Water is leaking from the outdoor pipe.', status: 'Open', supports: 5, updates: ['04 Nov — Open — Issue submitted.'] },
  { id: 3, title: 'Waste bins near Block B', category: 'Waste', location: 'Block B', description: 'Extra waste bins are needed.', status: 'Resolved', supports: 7, updates: ['01 Nov — Open — Issue submitted.', '05 Nov — Resolved — New bins installed.'] }
];
let events = [
  { id: 1, title: 'Rooftop gardening afternoon', time: 'Friday · 4:00 PM', location: 'Greenview rooftop garden', description: 'Bring plant cuttings, questions and your curiosity.', people: 18, status: 'Published' },
  { id: 2, title: 'Neighbourhood clean-up', time: 'Friday · 8:00 AM', location: 'Main gate', description: 'A one-hour clean-up of common spaces.', people: 12, status: 'Published' }
];
let services = [
  { name: 'Greenview Repair Desk', category: 'Repairs', description: 'Electrical and plumbing repairs', location: 'Community office', contact: 'Contact provider directly (with consent)', status: 'Active' },
  { name: 'Community Study Corner', category: 'Tutoring', description: 'Tutoring and study support', location: 'Community centre', contact: 'Contact shown with provider consent', status: 'Active' },
  { name: 'Neighbourhood Grocery', category: 'Grocery', description: 'Everyday groceries close to home', location: 'Block C', contact: 'Ask at community office', status: 'Active' }
];
let members = [ {name:'Nadia Rahman',building:'Block B',status:'Pending'}, {name:'Samiul Hasan',building:'Block C',status:'Pending'} ];
let reports = [{ title: 'Unrelated advertising', reason: 'Spam', status: 'Pending review' }];
const residentNav = [['feed','Feed'],['help','Help & sharing'],['events','Events'],['issues','Community Pulse'],['services','Local services']];
const adminNav = [['admin','Overview'],['members','Memberships'],['moderation','Moderation'],['adminIssues','Issue management'],['content','Events & services']];


function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function go(next, id) { if (next === 'feed') communitySearch = ''; if(next==='contentForm' && contentEditIndex<0) contentType='Event'; if(next==='postForm' && id===undefined) { editingPost=false; selectedId=0; } page = next; if (id !== undefined) selectedId = id; filter = 'All'; render(); window.scrollTo(0,0); }
function setFilter(value) { filter = value; render(); }
function toast(message) { let element = document.getElementById('toast'); element.textContent = message; element.classList.add('show'); setTimeout(() => element.classList.remove('show'), 3200); }
function pill(text) { let name = String(text).toLowerCase().replaceAll(' ',''); return `<span class="pill ${name === 'inprogress' ? 'progress' : name}">${escapeHtml(text)}</span>`; }
function heading(title, sub = '') { return `<div class="page-title"><h1>${escapeHtml(title)}</h1>${sub ? `<p class="muted">${escapeHtml(sub)}</p>` : ''}</div>`; }
function button(text, action, kind = '', extra = '') { return `<button class="btn ${kind}" onclick="${action}" ${extra}>${text}</button>`; }
function filters(names) { return `<div class="filter-row">${names.map(name => `<button class="filter ${filter === name ? 'active' : ''}" onclick="setFilter('${name}')">${name}</button>`).join('')}</div>`; }
function field(id, label, type = 'text', placeholder = '', value = '') { return `<div class="form-group"><label for="${id}">${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}" value="${escapeHtml(value)}"><span class="error" id="${id}Error"></span></div>`; }
function textarea(id, label, placeholder = '', value = '') { return `<div class="form-group"><label for="${id}">${label}</label><textarea id="${id}" placeholder="${placeholder}">${escapeHtml(value)}</textarea><span class="error" id="${id}Error"></span></div>`; }
function select(id, label, values) { return `<div class="form-group"><label for="${id}">${label}</label><select id="${id}"><option value="">Select ${label.toLowerCase()}</option>${values.map(v=>`<option value="${v}">${v}</option>`).join('')}</select><span class="error" id="${id}Error"></span></div>`; }
function panel(content, classes = '') { return `<section class="panel ${classes}">${content}</section>`; }


const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const imageLimit = 2 * 1024 * 1024;

function imageUploadField() {
  return `<div class="form-group">
    <label for="attachment">Attach an image (optional)</label>
    <input id="attachment" type="file" accept="image/jpeg,image/png,image/webp"
      aria-describedby="attachmentHint attachmentStatus attachmentError">
    <p class="note attachment-hint" id="attachmentHint">One JPG, PNG or WebP image, up to 2 MB. Images stay in this tab until you refresh.</p>
    <span class="note" id="attachmentStatus" role="status"></span>
    <span class="error" id="attachmentError" role="alert"></span>
    <div id="attachmentPreview" hidden>
      <img class="attachment-image attachment-small" id="attachmentImage" alt="Selected image preview">
    </div>
    <button class="btn small secondary attachment-clear" id="attachmentClear" type="button" hidden>Remove image</button>
  </div>`;
}

function attachedImage(src, alt, small = false) {
  if (!src) return '';
  return `<img class="attachment-image${small ? ' attachment-small' : ''}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function connectImageInput(form, existingImage = '') {
  const input = form.querySelector('#attachment');
  const preview = form.querySelector('#attachmentPreview');
  const previewImage = form.querySelector('#attachmentImage');
  const clear = form.querySelector('#attachmentClear');
  const status = form.querySelector('#attachmentStatus');
  const error = form.querySelector('#attachmentError');
  const submit = form.querySelector('button[type="submit"]');

  let selectedImage = existingImage;
  let imageError = '';
  // A second selection or a removal cancels the result of an earlier read.
  let selection = 0;

  function updatePreview() {
    preview.hidden = !selectedImage;
    if (selectedImage) previewImage.src = selectedImage;
    else previewImage.removeAttribute('src');

    clear.hidden = !selectedImage && !imageError && !submit.disabled;
    clear.textContent = selectedImage ? 'Remove image' : 'Clear selection';
  }

  function finishReading(message = '') {
    imageError = message;
    status.textContent = '';
    error.textContent = message;
    input.classList.toggle('errorBorder', Boolean(message));
    submit.disabled = false;
    updatePreview();
  }

  input.addEventListener('change', function () {
    const current = ++selection;
    const file = input.files[0];
    if (!file) return finishReading();
    if (!imageTypes.includes(file.type)) return finishReading('Choose a JPG, PNG or WebP image.');
    if (!file.size) return finishReading('This file is empty. Choose another image.');
    if (file.size > imageLimit) return finishReading('Choose an image of 2 MB or less.');

    imageError = '';
    error.textContent = '';
    input.classList.remove('errorBorder');
    submit.disabled = true;
    status.textContent = 'Reading image…';
    updatePreview();

    const reader = new FileReader();
    reader.onload = function () {
      if (current !== selection) return;
      const image = new Image();
      image.onload = function () {
        if (current !== selection) return;
        selectedImage = reader.result;
        finishReading();
      };
      image.onerror = function () {
        if (current === selection) finishReading('This file could not be opened as an image. Choose another file.');
      };
      image.src = reader.result;
    };
    reader.onerror = function () {
      if (current === selection) finishReading('This file could not be read. Choose another image.');
    };
    reader.readAsDataURL(file);
  });

  clear.addEventListener('click', function () {
    selection++;
    input.value = '';
    selectedImage = '';
    finishReading();
    input.focus();
  });

  updatePreview();

  return function getImage() {
    if (submit.disabled) return null;
    if (imageError) {
      showError('attachment', imageError);
      input.focus();
      return null;
    }
    return selectedImage;
  };
}


function brandButton(destination) {
  return `<button class="brand" type="button" onclick="go('${destination}')">
    <span class="brand-mark" aria-hidden="true">N</span>NeighbourNest
  </button>`;
}

function publicPage(content, wide = false) {
  const aboutCurrent = page === 'about' ? 'aria-current="page"' : '';
  const loginCurrent = page === 'login' ? 'aria-current="page"' : '';

  app.innerHTML = `<header class="site-header">
    <div class="header-inner">
      ${brandButton('home')}
      <nav class="public-nav" aria-label="Main navigation">
        ${button('About', "go('about')", 'secondary small', aboutCurrent)}
        ${button('Log in', "go('login')", 'secondary small', loginCurrent)}
      </nav>
    </div>
  </header>
  <main class="public-main">${wide ? content : `<section class="panel public-card">${content}</section>`}</main>`;
}

function navGroup(label, links) {
  const buttons = links.map(([id, text]) => {
    const active = page === id;
    return `<button class="nav-link ${active ? 'active' : ''}" type="button" onclick="go('${id}')"
      ${active ? 'aria-current="page"' : ''}>${text}</button>`;
  }).join('');
  return `<div class="nav-group"><p class="nav-label">${label}</p>${buttons}</div>`;
}

function shell(content) {
  const administrator = role === 'admin';
  const roleLinks = administrator ? adminNav : residentNav;
  const nav = navGroup(administrator ? 'Administration' : 'Community', roleLinks) +
    navGroup('More', [['inbox', 'Inbox'], ['about', 'About'], ['profile', 'Profile']]) +
    `<div class="nav-actions">
      <button class="nav-link" type="button" onclick="switchRole()">Switch demo role</button>
      <button class="nav-link" type="button" onclick="logout()">Log out</button>
    </div>`;

  app.innerHTML = `<div class="app-shell">
    <header class="site-header">
      <div class="header-inner">
        ${brandButton(administrator ? 'admin' : 'feed')}
        <span class="community">Greenview Community</span>
        <form class="search-form" role="search" onsubmit="searchFromHeader(this.elements.query.value); return false">
          <input type="search" name="query" aria-label="Search community posts" placeholder="Search posts"
            value="${escapeHtml(page === 'feed' ? communitySearch : '')}">
          <button class="btn small secondary" type="submit">Search</button>
        </form>
        <span class="header-role">${administrator ? 'Administrator' : 'Resident'}</span>
        <details class="mobile-menu">
          <summary class="btn small secondary">Menu</summary>
          <nav aria-label="Mobile navigation">${nav}</nav>
        </details>
      </div>
    </header>
    <div class="layout">
      <aside class="sidebar"><nav aria-label="Community navigation">${nav}</nav></aside>
      <main class="main">${content}</main>
    </div>
  </div>`;
}

function searchFromHeader(value) {
  communitySearch = value.trim();
  page = 'feed';
  filter = 'All';
  render();
}

function logout() {
  signedIn = false;
  go('home');
}

function switchRole() {
  role = role === 'resident' ? 'admin' : 'resident';
  go(role === 'admin' ? 'admin' : 'feed');
}

function homePage() {
  publicPage(`<section class="landing">
    <div>
      <p class="eyebrow">Greenview Community</p>
      <h1>Your neighbourhood, together.</h1>
      <p class="subtitle">Share updates, lend a hand and keep up with what’s happening around Greenview.</p>
      <div class="actions">
        ${button('Join the community', "go('register')")}
        ${button('Learn about NeighbourNest', "go('about')", 'secondary')}
      </div>
    </div>
    <section class="panel landing-list">
      <h2>On the noticeboard</h2>
      <ul>
        <li><strong>Community feed</strong>Share news, ask for help or lend a neighbour something.</li>
        <li><strong>Community Pulse</strong>Report an issue and follow updates.</li>
        <li><strong>Local events</strong>Find out what’s coming up in Greenview.</li>
      </ul>
    </section>
  </section>`, true);
}

function aboutPage() {
  return `<article class="about">
    <div class="about-intro">
      <h1>About NeighbourNest</h1>
      <p class="subtitle">NeighbourNest is a neighbourhood website for Greenview residents. It brings community notices, offers of help and local updates into one place.</p>
    </div>
    <figure class="about-photo">
      <img src="images/greenview-courtyard.jpg" alt="Leafy shared courtyard in a Dhaka apartment community">
    </figure>
    <div class="about-feature-grid">
      ${panel('<h3>Share with neighbours</h3><p>Post updates, ask to borrow something or pass on an item you no longer need.</p>')}
      ${panel('<h3>Report local issues</h3><p>Use Community Pulse to report a problem and follow its progress.</p>')}
      ${panel('<h3>Find events and services</h3><p>See what’s coming up and browse useful local contacts.</p>')}
    </div>
  </article>`;
}

function inboxPage() {
  return heading('Inbox') + panel('<h3>Messaging is coming later</h3><p class="muted">Neighbour-to-neighbour messages will appear here when messaging is available.</p>');
}

function loginPage() { publicPage(`<h2>Welcome back</h2><p class="subtitle">Log in to your community account.</p><form id="loginForm" novalidate>${field('email','Email address','email','asha@example.com')}${field('password','Password','password','Enter password')}<button type="submit" class="btn wide">Log in</button></form><p class="note">New here? <a href="#" onclick="go('register');return false">Create an account</a></p><p class="note">For the demo, enter a valid-format email and a password of at least eight characters.</p><div class="actions">${button('Back to home',"go('home')",'secondary small')}</div>`); document.getElementById('loginForm').addEventListener('submit',submitLogin); }
function registerPage() { publicPage(`<h2>Join NeighbourNest</h2><p class="subtitle">Create your resident account.</p><form id="registerForm" novalidate>${field('name','Full name','text','Your full name')}${field('email','Email address','email','you@example.com')}${field('building','Building or block','text','e.g. Block A')}<div class="two">${field('password','Password','password','At least 8 characters')}${field('confirm','Confirm password','password','Repeat password')}</div><button class="btn wide" type="submit">Request to join</button></form><p class="note">An administrator will review your request. <a href="#" onclick="go('login');return false">Already registered?</a></p>`); document.getElementById('registerForm').addEventListener('submit',submitRegister); }
function membershipPage() { publicPage(`<h2>${account.status==='rejected'?'Your request was rejected':'Your request is pending'}</h2><p class="subtitle">Thanks for joining NeighbourNest.</p>${panel(`<h3>${account.status==='rejected'?'Review outcome':'Waiting for approval'}</h3><p>Your community administrator will review your name and building details.</p>${pill(account.status==='rejected'?'Rejected':'Pending')}`)}<p class="note">You can edit your profile while waiting. Community content opens after approval.</p><div class="actions">${button('Edit profile',"go('pendingProfile')")}${button('Log out',"go('home')",'secondary')}</div>`); }
function pendingProfile() { publicPage(`<h2>Edit your request</h2><p class="muted">Your profile remains pending until an administrator approves it.</p><form id="pendingForm" novalidate>${field('name','Full name','text','',account.name)}${field('building','Building or block','text','',account.building)}<button class="btn wide">Save changes</button></form><div class="actions">${button('Back',"go('membership')",'secondary')}</div>`); document.getElementById('pendingForm').addEventListener('submit', e=>{e.preventDefault();clearErrors();let ok=required('name',3)&&required('building',2);if(ok){account.name=document.getElementById('name').value.trim();account.building=document.getElementById('building').value.trim();go('membership');toast('Profile updated in demo.');}}); }



function postCard(post) {
  const postTitle = escapeHtml(post.title);
  return panel(`
    <div class="flex-between"><p class="meta">${escapeHtml(post.author)} · Greenview Community</p>${pill(post.category)}</div>
    <h3>${postTitle}</h3>
    <p>${escapeHtml(post.body)}</p>
    ${attachedImage(post.image, post.imageAlt || 'Image attached to ' + post.title, true)}
    <div class="flex-between post-footer">
      <span class="post-counts">${post.likes} ${post.likes === 1 ? 'like' : 'likes'} · ${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}</span>
      ${button('View post', `go('post',${post.id})`, 'small secondary')}
    </div>`, 'feed-card');
}

function feedPage(search = '') {
  const query = search.toLowerCase();
  const list = posts.filter(post => (filter === 'All' || filter === post.category) &&
    (!query || (post.title + ' ' + post.body).toLowerCase().includes(query)));
  const nextEvent = events.find(event => event.status === 'Published');

  return `<div class="page-toolbar">
    ${heading('Community feed')}
    ${button('Create post', "go('postForm')")}
  </div>
  <div class="split">
    <div>
      ${search ? `<p class="search-result muted">Results for “${escapeHtml(search)}”
        ${button('Clear search', "go('feed')", 'small secondary')}</p>` : ''}
      ${filters(['All', 'Announcement', 'General', 'Help', 'Borrow', 'Giveaway'])}
      ${list.length ? list.map(postCard).join('') : '<div class="empty">No matching posts found.</div>'}
    </div>
    <aside aria-label="Community summary">
      ${panel(`<h3>Community Pulse</h3>
        <p><strong>${issues.filter(issue => issue.status === 'Open').length}</strong> open issues</p>
        <p><strong>${issues.filter(issue => issue.status === 'Resolved').length}</strong> issues resolved</p>
        <div class="actions">${button('View Pulse', "go('issues')", 'secondary small')}</div>`)}
      ${panel(`<h3>Coming up</h3>${nextEvent ? `<p>${escapeHtml(nextEvent.title)}</p>
        <p class="meta">${escapeHtml(nextEvent.time)}</p>
        ${button('View event', `go('event',${nextEvent.id})`, 'secondary small')}` :
        '<p class="muted">No events scheduled.</p>'}`)}
    </aside>
  </div>`;
}

function postPage() { let p=posts.find(p=>p.id===selectedId); if(!p) return heading('Post not found'); return `${heading(p.category==='Help'||p.category==='Borrow'||p.category==='Giveaway'?'Help a neighbour':'Neighbourhood conversation')}${panel(`<div class="flex-between"><h3>${escapeHtml(p.title)}</h3>${pill(p.state)}</div><p class="meta">${escapeHtml(p.author)} · ${escapeHtml(p.category)}</p><p>${escapeHtml(p.body)}</p>${attachedImage(p.image, p.imageAlt || 'Image attached to ' + p.title)}<div class="row-actions">${button((likedPosts.includes(p.id)?'Unlike':'Like')+' · '+p.likes,`toggleLike(${p.id})`,'small secondary')}${button('Report post',`reportPost(${p.id})`,'small outline')}${p.author==='Asha'&&['Help','Borrow','Giveaway'].includes(p.category)&&p.state==='Open'?button('Mark completed',`completePost(${p.id})`,'small secondary'):''}${p.author==='Asha'?button('Edit',`editPost(${p.id})`,'small outline'):''}</div>`)}<div style="height:14px"></div>${panel(`<h3>Discussion</h3>${p.comments.length?p.comments.map(c=>`<div class="feature-strip">${escapeHtml(c)}</div>`).join(''):'<p class="muted">No comments yet. Start the conversation.</p>'}<form id="commentForm" novalidate>${textarea('comment','Write a comment','Add to the conversation...')}<button class="btn" type="submit">Comment</button></form>`)}<div class="actions">${button('Back to feed',"go('feed')",'secondary')}</div>`; }
function toggleLike(id) { let p=posts.find(p=>p.id===id); if(likedPosts.includes(id)){likedPosts=likedPosts.filter(n=>n!==id);p.likes--;}else{likedPosts.push(id);p.likes++;}render(); }
function reportPost(id) { let reason=prompt('Why are you reporting this post?'); if(reason && reason.trim()){reports.push({title:posts.find(p=>p.id===id).title,reason:reason.trim(),status:'Pending review'});toast('Report submitted for demo review.');} }
function completePost(id) { posts.find(p=>p.id===id).state='Completed';render();toast('Post marked completed.'); }
function editPost(id) { editingPost=true;go('postForm',id); }
function postFormPage() { let p=editingPost ? posts.find(p=>p.id===selectedId&&p.author==='Asha') : null; return `${heading(p?'Edit your post':'Share with your neighbours','Help, borrow and giveaway posts can be marked completed later.')}${panel(`<form id="postForm" novalidate>${select('category','Category',['General','Help','Borrow','Giveaway'])}${field('title','Title','text','Give your post a clear title',p?p.title:'')}${textarea('description','Description','What would you like to share?',p?p.body:'')}${imageUploadField()}<div class="actions"><button class="btn" type="submit">${p?'Save changes':'Publish post'}</button>${button('Cancel',"go('feed')",'secondary','type="button"')}</div></form>`, 'form-panel')}`; }
function helpPage() { let list=posts.filter(p=>['Help','Borrow','Giveaway'].includes(p.category)&&(filter==='All'||filter===p.category)); return `${heading('Small acts. Stronger community.','Ask for help, lend something or give something a new home.')}<div class="flex-between">${filters(['All','Help','Borrow','Giveaway'])}${button('Add a post',"selectedId=0;go('postForm')",'small')}</div><div class="cards">${list.map(p=>panel(`<h3>${escapeHtml(p.title)}</h3><p class="meta">${escapeHtml(p.category)} · ${escapeHtml(p.author)}</p><p>${escapeHtml(p.body)}</p>${attachedImage(p.image, p.imageAlt || 'Image attached to ' + p.title, true)}<div class="flex-between">${pill(p.state)}${button('View post',`go('post',${p.id})`,'small secondary')}</div>`)).join('')}</div>`; }


function eventsPage() { let list=events.filter(e=>e.status==='Published'&&(filter==='All'||(filter==='My RSVPs'&&joinedEvent&&e.id===1)));return `${heading('Make time for your community','Join local activities and meet your neighbours.')}${filters(['All','My RSVPs'])}<div class="cards">${list.map(e=>panel(`<div class="eyebrow">Community event</div><h3>${escapeHtml(e.title)}</h3><p class="meta">${escapeHtml(e.time)} · ${escapeHtml(e.location)}</p><p>${escapeHtml(e.description)}</p><div class="row-actions">${button('View event',`go('event',${e.id})`,'small')}<span class="pill">${e.people} neighbours going</span></div>`)).join('')||'<div class="empty">No events match this filter.</div>'}</div>`; }
function eventPage() {let e=events.find(e=>e.id===selectedId);if(!e)return heading('Event not found');return `${heading(e.title)}${panel(`<span class="pill">Community event</span><h2 style="margin-top:15px">Grow something together</h2><p><strong>${escapeHtml(e.time)}</strong><br>Location: ${escapeHtml(e.location)}<br>Hosted by the community administrator</p><p>${escapeHtml(e.description)}</p><div class="actions">${e.id===1?(joinedEvent?button('Cancel RSVP',"toggleRsvp()",'secondary'):button('Join event',"toggleRsvp()")):button('Join event',"toast('This is a UI-only sample.')")}</div><p class="note">${e.people} neighbours are attending. Your RSVP can be changed.</p>`,'form-panel')}`; }
function toggleRsvp(){joinedEvent=!joinedEvent;events[0].people+=joinedEvent?1:-1;render();toast(joinedEvent?'You joined the event.':'Your RSVP was cancelled.');}
function issuesPage() {let list=issues.filter(i=>filter==='All'||i.status===filter);let counts=['Open','In progress','Resolved'].map(s=>`<div class="panel compact"><div class="stat">${issues.filter(i=>i.status===s).length}</div><span class="muted">${s} issues</span></div>`).join('');return `${heading('Community Pulse','Track local concerns and follow their progress.')}<div class="cards three">${counts}</div><div class="flex-between">${filters(['All','Open','In progress','Resolved'])}${button('Report an issue',"go('issueForm')",'small')}</div>${list.map(i=>panel(`<div class="flex-between"><h3>${escapeHtml(i.title)}</h3>${pill(i.status)}</div><p class="meta">${escapeHtml(i.category)} · ${i.supports} residents support this report</p>${attachedImage(i.image, 'Photo for ' + i.title, true)}${button('View progress',`go('issue',${i.id})`,'small secondary')}`)).join('')||'<div class="empty">No issues in this category.</div>'}`; }
function issuePage(){let i=issues.find(i=>i.id===selectedId);if(!i)return heading('Issue not found');return `${heading(i.title)}${panel(`<h3>Reported by Asha</h3><p>${escapeHtml(i.description)}</p>${attachedImage(i.image, 'Photo for ' + i.title)}<p class="meta">Location: ${escapeHtml(i.location)}</p><div class="flex-between">${pill(i.status)}${button((supportedIssue&&i.id===1?'Remove support':'Support issue')+' · '+i.supports,`toggleSupport(${i.id})`,'small secondary')}</div>`)}<div style="height:14px"></div>${panel(`<h3>Progress updates</h3><div class="timeline">${i.updates.map(u=>`<div class="timeline-item">${escapeHtml(u)}</div>`).join('')}</div><p class="note">Only administrators can change the issue status.</p>`)}`;}
function toggleSupport(id) {let i=issues.find(i=>i.id===id);if(id!==1){toast('Support interaction shown on main gate issue demo.');return;}supportedIssue=!supportedIssue;i.supports+=supportedIssue?1:-1;render();}
function issueFormPage(){return `${heading('Report a community issue','Share the location and a clear description of the problem.')}${panel(`<form id="issueForm" novalidate>${field('title','Issue title','text','e.g. Broken light near the gate')}<div class="two">${select('category','Category',['Lighting','Water','Waste','Other'])}${field('location','Location','text','Building or common area')}</div>${textarea('description','Description','Describe the problem clearly.')}${imageUploadField()}<div class="actions"><button type="submit" class="btn">Submit report</button>${button('Cancel',"go('issues')",'secondary','type="button"')}</div></form>`,'form-panel')}`;}
function servicesPage(){let list=services.filter(s=>(filter==='All'||filter===s.category)&&s.status==='Active');return `${heading('Useful contacts, close to home','Directory listings are informational; no booking or payments.')}<div class="form-panel">${field('serviceSearch','Find a service','text','Search name or category')}</div>${filters(['All','Repairs','Grocery','Tutoring'])}<div class="cards" id="servicesList">${list.map(serviceCard).join('')}</div>`;}
function serviceCard(s){return panel(`<h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.description)}</p><p class="meta">${escapeHtml(s.location)}<br>${escapeHtml(s.contact)}</p><span class="pill">Administrator-maintained</span>`);}
function profilePage(){return `${heading('Your community profile')}${panel(`<div class="flex-between"><div><h3>${escapeHtml(account.name)}</h3><p>${escapeHtml(account.building)} · Greenview Community</p><p>Joined this community as a resident.</p>${pill('Approved')}</div>${button('Edit profile',"go('profileEdit')",'small')}</div>`)}<div class="cards" style="margin-top:16px">${panel(`<h3>Your activity</h3><p>6 posts shared<br>2 issues reported<br>3 upcoming event RSVPs</p>`)}${panel(`<h3>Account privacy</h3><p>Your email is private.<br>Only approved residents see posts.<br>Your building label can be edited.</p>`)}</div>`;}
function profileEditPage(){return `${heading('Manage your account')}${panel(`<form id="profileForm" novalidate><div class="two">${field('name','Full name','text','',account.name)}${field('building','Building or block','text','',account.building)}</div>${field('email','Email address','email','',account.email)}<div class="two">${field('currentPassword','Current password','password')}${field('newPassword','New password','password')}</div>${field('confirm','Confirm new password','password')}<button class="btn" type="submit">Save changes</button><p class="note">Leave password fields empty to keep your current password.</p></form>`,'form-panel')}`;}


function adminPage(){return `${heading('Community overview','Your dashboard for keeping the neighbourhood connected.')}<div class="cards three">${[['6','Pending memberships'],[reports.filter(r=>r.status==='Pending review').length,'Flagged posts'],[issues.filter(i=>i.status!=='Resolved').length,'Unresolved issues']].map(([number,label])=>panel(`<div class="stat">${number}</div><span class="muted">${label}</span>`,'compact')).join('')}</div><div class="cards" style="margin-top:18px">${panel(`<h3>Today's priorities</h3><p>Review new membership requests.<br>Check flagged community posts.<br>Update progress on local issues.</p>${button('Review memberships',"go('members')",'small')}`)}${panel(`<h3>Community content</h3><p>${events.length} upcoming events<br>${services.length} local service listings<br>Publish updates for residents.</p>${button('Manage content',"go('content')",'small')}`)}</div>`;}
function membersPage(){let list=members.filter(m=>filter==='All'||m.status===filter);return `${heading('Welcome new neighbours','Review membership requests for Greenview Community.')}${filters(['All','Pending','Approved','Rejected'])}${panel(`<div class="table-wrap"><table><thead><tr><th>Resident</th><th>Building</th><th>Status</th><th>Review request</th></tr></thead><tbody>${list.map((m)=>`<tr><td>${escapeHtml(m.name)}</td><td>${escapeHtml(m.building)}</td><td>${pill(m.status)}</td><td>${m.status==='Pending'?`${button('Approve',`reviewMember('${m.name}','Approved')`,'small')} ${button('Reject',`reviewMember('${m.name}','Rejected')`,'small secondary')}`:'Reviewed'}</td></tr>`).join('')}</tbody></table></div><p class="note">Approval grants access to this community only.</p>`)}`;}
function reviewMember(name,status){members.find(m=>m.name===name).status=status;render();toast(name+' marked '+status.toLowerCase()+' in demo.');}
function moderationPage(){return `${heading('Keep community discussions useful')}${reports.map((r,i)=>panel(`<h3>Reported post: ${escapeHtml(r.title)}</h3><p class="meta">Reason: ${escapeHtml(r.reason)} · Submitted by an approved resident</p><p>Review the content before deciding.</p><div class="flex-between">${pill(r.status)}<div class="row-actions">${r.status==='Pending review'?`${button('Hide post',`moderate(${i},'Hidden')`,'small')} ${button('Dismiss',`moderate(${i},'Dismissed')`,'small secondary')}`:button('Restore post',`moderate(${i},'Restored')`,'small secondary')}</div></div>`)).join('')}${panel(`<h3>Moderation decisions</h3><p><strong>Hide:</strong> remove a post from residents’ feeds.<br><strong>Dismiss:</strong> keep a post visible and close the report.<br><strong>Restore:</strong> make previously hidden content visible again.</p>`)}`;}
function moderate(id,status){reports[id].status=status;render();toast('Report marked '+status.toLowerCase()+'.');}
function adminIssuesPage(){return `${heading('Manage community issues')}${issues.map(i=>panel(`<div class="flex-between"><div><h3>${escapeHtml(i.title)}</h3><p>${escapeHtml(i.location)} · ${i.supports} supporters</p>${pill(i.status)}</div>${button('Update issue',`go('issueEdit',${i.id})`,'small')}</div>`)).join('')}`;}
function issueEditPage(){let i=issues.find(i=>i.id===selectedId);return `${heading('Update community issue')}${panel(`<h3>${escapeHtml(i.title)}</h3>${attachedImage(i.image, 'Photo for ' + i.title, true)}<form id="issueEditForm" novalidate>${select('status','Status',['Open','In progress','Resolved'])}${textarea('progress','Progress note','Write a clear update for residents')}<button type="submit" class="btn">Save update</button><p class="note">The update appears in the resident timeline.</p></form>`,'form-panel')}`;}
function contentPage(){let entries=filter==='Services'?services:events;return `${heading('Community content','Manage local events and the service directory.')}<div class="flex-between">${filters(['All','Services'])}${button('Add new',"go('contentForm')",'small')}</div>${entries.map((entry,i)=>panel(`<div class="flex-between"><div><h3>${escapeHtml(entry.title||entry.name)}</h3><p class="meta">${escapeHtml(entry.time||entry.category)} · ${escapeHtml(entry.location)}</p>${pill(entry.status)}</div><div class="row-actions">${button('Edit',`editContent(${i})`,'small secondary')}${button(entry.title?'Cancel':'Hide',`hideContent(${i})`,'small secondary')}</div></div>`)).join('')}`;}
let contentEditIndex=-1;
function editContent(index){contentType=filter==='Services'?'Service':'Event';contentEditIndex=index;go('contentForm');}
function hideContent(index){if(filter==='Services'){services[index].status='Hidden';}else{events[index].status='Cancelled';}render();toast('Content updated in demo.');}
function contentFormPage(){return `${heading('Add community content','Fields change based on the selected content type.')}${panel(`<div class="filter-row"><button class="filter active" id="eventTab" onclick="setContentType('Event')">Event</button><button class="filter" id="serviceTab" onclick="setContentType('Service')">Service</button></div><form id="contentForm" novalidate>${field('title','Title or service name','text','Enter a name')}<div class="two"><div id="fieldA">${field('details','Date and time','text','Friday · 4:00 PM')}</div><div id="fieldB">${field('location','Location','text','Location or public contact')}</div></div>${textarea('description','Description','Add useful details')}<button class="btn" type="submit">Save content</button></form>`,'form-panel')}`;}
let contentType='Event';
function setContentType(type){contentType=type;document.getElementById('eventTab').classList.toggle('active',type==='Event');document.getElementById('serviceTab').classList.toggle('active',type==='Service');document.getElementById('fieldA').innerHTML=field('details',type==='Event'?'Date and time':'Service category','text',type==='Event'?'Friday · 4:00 PM':'Repairs / Grocery / Tutoring');document.getElementById('fieldB').innerHTML=field('location',type==='Event'?'Location':'Location / public contact','text');}


function clearErrors(){document.querySelectorAll('.error').forEach(e=>e.textContent='');document.querySelectorAll('.errorBorder,.successBorder').forEach(e=>e.classList.remove('errorBorder','successBorder'));}
function showError(id,message){let input=document.getElementById(id);if(input){input.classList.add('errorBorder');let error=document.getElementById(id+'Error');if(error)error.textContent=message;}return false;}
function showSuccess(id){let input=document.getElementById(id);if(input)input.classList.add('successBorder');return true;}
function required(id,min=1){let input=document.getElementById(id);if(!input||input.value.trim().length<min)return showError(id,`Please enter at least ${min} character${min===1?'':'s'}.`);return showSuccess(id);}
function validEmail(){let value=document.getElementById('email').value.trim();return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?showSuccess('email'):showError('email','Enter a valid email address.');}
function validPassword(){let value=document.getElementById('password').value;return value.length>=8?showSuccess('password'):showError('password','Password must be at least 8 characters.');}
function submitLogin(e){e.preventDefault();clearErrors();let ok=validEmail()&validPassword();if(ok){signedIn=true;role='resident';account.status='approved';go('feed');toast('Welcome! This is a demo login, not real authentication.');}}
function submitRegister(e){e.preventDefault();clearErrors();let ok=required('name',3)&validEmail()&required('building',2)&validPassword();let confirm=document.getElementById('confirm').value;if(confirm!==document.getElementById('password').value){showError('confirm','Passwords do not match.');ok=false;}else{showSuccess('confirm');}if(ok){account.name=document.getElementById('name').value.trim();account.email=document.getElementById('email').value.trim();account.building=document.getElementById('building').value.trim();account.status='pending';go('membership');}}
function attachForms(){
 let form=document.getElementById('commentForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();clearErrors();if(required('comment',2)){posts.find(p=>p.id===selectedId).comments.push(account.name+': '+document.getElementById('comment').value.trim());render();toast('Comment added to demo.');}});
 form=document.getElementById('postForm');
 if (form) {
   const post = editingPost ? posts.find(p => p.id === selectedId && p.author === 'Asha') : null;
   if (post) document.getElementById('category').value = post.category;
   const getImage = connectImageInput(form, post?.image);
   form.addEventListener('submit', function (event) {
     event.preventDefault();
     clearErrors();
     const valid = required('category') & required('title') & required('description');
     const image = getImage();
     if (!valid || image === null) return;

     const title = document.getElementById('title').value.trim();
     const category = document.getElementById('category').value;
     const body = document.getElementById('description').value.trim();
     if (post) {
       post.title = title;
       post.category = category;
       post.body = body;
       if (post.image !== image) delete post.imageAlt;
       post.image = image;
     } else {
       posts.unshift({
         id: Date.now(), title, category, body, image,
         author: 'Asha', likes: 0, comments: [], state: 'Open'
       });
     }
     selectedId = 0;
     editingPost = false;
     go('feed');
     toast('Post saved in this demo.');
   });
 }

 form=document.getElementById('issueForm');
 if (form) {
   const getImage = connectImageInput(form);
   form.addEventListener('submit', function (event) {
     event.preventDefault();
     clearErrors();
     const valid = required('title', 4) & required('category') & required('location', 3) & required('description', 10);
     const image = getImage();
     if (!valid || image === null) return;

     issues.unshift({
       id: Date.now(),
       title: document.getElementById('title').value.trim(),
       category: document.getElementById('category').value,
       location: document.getElementById('location').value.trim(),
       description: document.getElementById('description').value.trim(),
       image,
       status: 'Open',
       supports: 0,
       updates: ['Today — Open — Issue submitted.']
     });
     go('issues');
     toast('Issue added in this demo.');
   });
 }
 form=document.getElementById('profileForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();clearErrors();let ok=required('name',3)&required('building',2)&validEmail();let newPassword=document.getElementById('newPassword').value;if(newPassword&&(newPassword.length<8||document.getElementById('confirm').value!==newPassword||!document.getElementById('currentPassword').value)){showError('newPassword','Enter current password and matching new password of 8+ characters.');ok=false;}if(ok){account.name=document.getElementById('name').value.trim();account.email=document.getElementById('email').value.trim();account.building=document.getElementById('building').value.trim();go('profile');toast('Profile changed in this demo.');}});
 form=document.getElementById('issueEditForm');if(form){document.getElementById('status').value=issues.find(i=>i.id===selectedId).status;form.addEventListener('submit',e=>{e.preventDefault();clearErrors();let ok=required('status')&required('progress',5);if(ok){let issue=issues.find(i=>i.id===selectedId);issue.status=document.getElementById('status').value;issue.updates.push('Today — '+issue.status+' — '+document.getElementById('progress').value.trim());go('adminIssues');toast('Issue progress updated in demo.');}});}
 form=document.getElementById('contentForm');if(form){if(contentType==='Service')setContentType('Service');if(contentEditIndex>=0){let item=(contentType==='Service'?services:events)[contentEditIndex];if(item){document.getElementById('title').value=item.title||item.name;document.getElementById('details').value=item.time||item.category;document.getElementById('location').value=item.location;document.getElementById('description').value=item.description;}}form.addEventListener('submit',e=>{e.preventDefault();clearErrors();let ok=required('title',3)&required('details',3)&required('location',3)&required('description',5);if(ok){let title=document.getElementById('title').value.trim(),details=document.getElementById('details').value.trim(),location=document.getElementById('location').value.trim(),description=document.getElementById('description').value.trim();if(contentType==='Event'){let item={id:Date.now(),title,time:details,location,description,people:0,status:'Published'};if(contentEditIndex>=0){item.id=events[contentEditIndex].id;item.people=events[contentEditIndex].people;events[contentEditIndex]=item;}else events.push(item);}else{let item={name:title,category:details,location,description,contact:'Contact provider directly',status:'Active'};if(contentEditIndex>=0) services[contentEditIndex]=item;else services.push(item);}contentEditIndex=-1;go('content');toast('Content saved in demo.');}});}
 let search=document.getElementById('serviceSearch');if(search)search.addEventListener('input',()=>{let query=search.value.toLowerCase();let list=services.filter(s=>s.status==='Active'&&(filter==='All'||s.category===filter)&&(s.name+s.category+s.description).toLowerCase().includes(query));document.getElementById('servicesList').innerHTML=list.map(serviceCard).join('')||'<div class="empty">No matching services.</div>';});
}
function render(){
 if (page === 'about') return signedIn ? shell(aboutPage()) : publicPage(aboutPage(), true);
 if(page==='home')return homePage();if(page==='login')return loginPage();if(page==='register')return registerPage();if(page==='membership')return membershipPage();if(page==='pendingProfile')return pendingProfile();
 let screens={inbox:inboxPage,feed:()=>feedPage(communitySearch),post:postPage,postForm:postFormPage,help:helpPage,events:eventsPage,event:eventPage,issues:issuesPage,issue:issuePage,issueForm:issueFormPage,services:servicesPage,profile:profilePage,profileEdit:profileEditPage,admin:adminPage,members:membersPage,moderation:moderationPage,adminIssues:adminIssuesPage,issueEdit:issueEditPage,content:contentPage,contentForm:contentFormPage};
 shell(screens[page]?screens[page]():heading('Page not found'));attachForms();
}
render();

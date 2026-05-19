// ─── STATE ────────────────────────────────────────────────────────
let currentPage = 'home';
let currentUser = null;
let db = { users: [], clients: [], projects: [] };
let currentTab = 'overview';


function loadDB() {
  try {
    const saved = localStorage.getItem('mavi_db');
    if (saved) db = JSON.parse(saved);
  } catch(e) {}
 
  if (!db.users || db.users.length === 0) {
    db.users = [
      { id:1, name:'Admin User', email:'admin@mavi.com', password:'admin123', role:'admin', dept:'Engineering', joined: new Date().toISOString().split('T')[0], status:'active' }
    ];
    db.clients = [
      { id:1, name:'TechCorp India', email:'contact@techcorp.in', industry:'FinTech', status:'active', plan:'Enterprise', createdAt: new Date().toISOString().split('T')[0] },
      { id:2, name:'CloudBase Ltd', email:'ops@cloudbase.io', industry:'SaaS', status:'active', plan:'Pro', createdAt: new Date().toISOString().split('T')[0] }
    ];
    db.projects = [
      { id:1, name:'Kubernetes Migration', client:'TechCorp India', status:'in-progress', lead:'Admin User', deadline:'2025-09-30' },
      { id:2, name:'CI/CD Overhaul', client:'CloudBase Ltd', status:'completed', lead:'Admin User', deadline:'2025-05-01' }
    ];
    saveDB();
  }
}
function saveDB() {
  try { localStorage.setItem('mavi_db', JSON.stringify(db)); } catch(e) {}
}
function nextId(arr) {
  return arr.length > 0 ? Math.max(...arr.map(r=>r.id)) + 1 : 1;
}


function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  currentPage = name;
  window.scrollTo(0, 0);
  if (name === 'auth') renderAuth('login');
  if (name === 'dashboard') renderDashboard();
  updateNav();
}
function updateNav() {
  const navAuth = document.getElementById('navAuth');
  if (currentUser) {
    navAuth.innerHTML = `<span style="font-size:.85rem;color:var(--muted);margin-right:.5rem">${currentUser.name.split(' ')[0]}</span><button class="nav-btn" onclick="showPage('dashboard')">Dashboard</button>`;
  } else {
    navAuth.innerHTML = `<button class="nav-btn ghost" onclick="showPage('auth')">Login</button>`;
  }
}


function toast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show t-${type}`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}


function renderAuth(mode) {
  const ac = document.getElementById('authContent');
  if (mode === 'login') {
    ac.innerHTML = `
      <h2>Welcome Back</h2>
      <p>Sign in to your MaViSolution account</p>
      <div id="authAlert"></div>
      <div class="form-group"><label>Email Address</label><input type="email" id="authEmail" placeholder="admin@mavi.com"/></div>
      <div class="form-group">
  <label>Password</label>

  <div style="position:relative">
    <input type="password" id="authPass" placeholder="Enter your password"/>

    <span 
      onclick="togglePassword('authPass', this)"
      style="
        position:absolute;
        right:12px;
        top:50%;
        transform:translateY(-50%);
        cursor:pointer;
        font-size:.85rem;
        color:var(--muted)
      "
    >
      Show
    </span>
  </div>
</div>

<div style="text-align:right;margin-top:.5rem">
  <a onclick="forgotPassword()" 
     style="cursor:pointer;font-size:.85rem;color:#4f46e5">
     Forgot Password?
  </a>
</div>
      <button class="btn-full" onclick="doLogin()">Sign In</button>
      <div class="auth-switch">Don't have an account? <a onclick="renderAuth('register')">Create one</a></div>
    `;
  } else {
    ac.innerHTML = `
      <h2>Create Account</h2>
      <p>Join MaViSolution platform</p>
      <div id="authAlert"></div>
      <div class="form-group"><label>Full Name</label><input type="text" id="regName" placeholder="John Doe"/></div>
      <div class="form-group"><label>Email Address</label><input type="email" id="regEmail" placeholder="you@company.com"/></div>
      <div class="form-group"><label>Password</label><input type="password" id="regPass" placeholder="Min 6 characters"/></div>
      <div class="form-group"><label>Department</label>
        <select id="regDept"><option value="">Select department</option><option>Engineering</option><option>DevOps</option><option>Cloud</option><option>Security</option><option>Management</option></select>
      </div>
      <button class="btn-full" onclick="doRegister()">Create Account</button>
      <div class="auth-switch">Already have an account? <a onclick="renderAuth('login')">Sign in</a></div>
    `;
  }
}
function authAlert(msg, type='error') {
  document.getElementById('authAlert').innerHTML = `<div class="alert ${type}">${msg}</div>`;
}
function doLogin() {
  const email = document.getElementById('authEmail').value.trim();
  const pass = document.getElementById('authPass').value;
  if (!email || !pass) { authAlert('Please fill in all fields.'); return; }
  const user = db.users.find(u => u.email === email && u.password === pass);
  if (!user) { authAlert('Invalid email or password.'); return; }
  if (user.status === 'inactive') { authAlert('Your account has been deactivated.'); return; }
  currentUser = user;
  toast(`Welcome back, ${user.name.split(' ')[0]}!`);
  showPage('dashboard');
}
function togglePassword(id, el) {
  const input = document.getElementById(id);

  if (input.type === 'password') {
    input.type = 'text';
    el.textContent = 'Hide';
  } else {
    input.type = 'password';
    el.textContent = 'Show';
  }
}

function forgotPassword() {
  const email = prompt('Enter your registered email');

  if (!email) return;

  const user = db.users.find(u => u.email === email);

  if (!user) {
    toast('No account found.', 'error');
    return;
  }

  const newPass = prompt('Enter new password');

  if (!newPass || newPass.length < 6) {
    toast('Password must be at least 6 characters.', 'error');
    return;
  }

  user.password = newPass;

  saveDB();

  toast('Password reset successful!');
}
function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const dept = document.getElementById('regDept').value;
  if (!name || !email || !pass || !dept) { authAlert('Please fill in all fields.'); return; }
  if (pass.length < 6) { authAlert('Password must be at least 6 characters.'); return; }
  if (db.users.find(u => u.email === email)) { authAlert('An account with this email already exists.'); return; }
  const newUser = { id: nextId(db.users), name, email, password: pass, role: 'user', dept, joined: new Date().toISOString().split('T')[0], status: 'active' };
  db.users.push(newUser);
  saveDB();
  currentUser = newUser;
  toast('Account created successfully!');
  showPage('dashboard');
}
function logout() {
  currentUser = null;
  toast('Signed out.', 'success');
  showPage('home');
}
// forget password//

// ─── DASHBOARD ────────────────────────────────────────────────────
function renderDashboard() {
  if (!currentUser) { showPage('auth'); return; }
  document.getElementById('dashTitle').textContent = `Hello, ${currentUser.name.split(' ')[0]} 👋`;
  document.getElementById('dashSub').textContent = `${currentUser.role === 'admin' ? 'Admin' : 'User'} · ${currentUser.dept} · ${currentUser.email}`;

  const tabs = currentUser.role === 'admin'
    ? ['overview','users','clients','projects','profile']
    : ['overview','projects','profile'];

  document.getElementById('dashTabs').innerHTML = tabs.map(t =>
    `<div class="tab ${t === currentTab ? 'active' : ''}" onclick="switchTab('${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</div>`
  ).join('');

  renderTab();
}
function switchTab(tab) {
  currentTab = tab;
  renderDashboard();
}
function renderTab() {
  const c = document.getElementById('dashContent');
  if (currentTab === 'overview') renderOverview(c);
  else if (currentTab === 'users') renderUsers(c);
  else if (currentTab === 'clients') renderClients(c);
  else if (currentTab === 'projects') renderProjects(c);
  else if (currentTab === 'profile') renderProfile(c);
}

function renderOverview(c) {
  const activeU = db.users.filter(u=>u.status==='active').length;
  const activeC = db.clients.filter(c=>c.status==='active').length;
  const inProg = db.projects.filter(p=>p.status==='in-progress').length;
  const done = db.projects.filter(p=>p.status==='completed').length;
  c.innerHTML = `
    <div class="stats-cards">
      <div class="stat-card"><div class="label">Total Users</div><div class="value">${db.users.length}</div><div class="sub">↑ ${activeU} active</div></div>
      <div class="stat-card"><div class="label">Clients</div><div class="value">${db.clients.length}</div><div class="sub">↑ ${activeC} active</div></div>
      <div class="stat-card"><div class="label">Projects</div><div class="value">${db.projects.length}</div><div class="sub">${inProg} in progress</div></div>
      <div class="stat-card"><div class="label">Completed</div><div class="value">${done}</div><div class="sub">↑ delivery rate 100%</div></div>
    </div>
    <div class="table-container">
      <div class="table-header"><h3>Recent Projects</h3></div>
      <table>
        <thead><tr><th>Project</th><th>Client</th><th>Lead</th><th>Status</th><th>Deadline</th></tr></thead>
        <tbody>
          ${db.projects.slice(-5).reverse().map(p=>`<tr>
            <td style="font-weight:500">${p.name}</td>
            <td style="color:var(--muted)">${p.client}</td>
            <td style="color:var(--muted)">${p.lead}</td>
            <td>${statusBadge(p.status)}</td>
            <td style="color:var(--muted)">${p.deadline}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function statusBadge(s) {
  const map = { 'active':'badge-user','inactive':'badge-role','in-progress':'badge-manager','completed':'badge-admin','planning':'badge-role','paused':'badge-role' };
  const lbl = { 'in-progress':'In Progress','completed':'Completed','planning':'Planning','paused':'Paused','active':'Active','inactive':'Inactive' };
  return `<span class="badge-role ${map[s]||'badge-role'}">${lbl[s]||s}</span>`;
}

function renderUsers(c) {
  const users = db.users;
  c.innerHTML = `
    <div class="table-container">
      <div class="table-header">
        <h3>User Management</h3>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <input class="search-input" id="userSearch" placeholder="Search users..." oninput="filterUsers()" />
          <button class="btn-add" onclick="openUserModal()">+ Add User</button>
        </div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Dept</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="usersBody"></tbody>
      </table>
    </div>
  `;
  renderUsersBody(users);
}
function renderUsersBody(users) {
  const body = document.getElementById('usersBody');
  if (!body) return;
  if (!users.length) { body.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted)">No users found</td></tr>`; return; }
  body.innerHTML = users.map(u => `<tr>
    <td style="color:var(--muted)">${u.id}</td>
    <td style="font-weight:500">${u.name}</td>
    <td style="color:var(--muted)">${u.email}</td>
    <td><span class="badge-role badge-${u.role}">${u.role}</span></td>
    <td style="color:var(--muted)">${u.dept||'-'}</td>
    <td style="color:var(--muted)">${u.joined}</td>
    <td>${statusBadge(u.status)}</td>
    <td><div class="actions">
      <button class="btn-icon" onclick='openUserModal(${JSON.stringify(u)})'>✏️</button>
      ${u.id !== 1 ? `<button class="btn-icon del" onclick="deleteUser(${u.id})">🗑</button>` : ''}
    </div></td>
  </tr>`).join('');
}
function filterUsers() {
  const q = document.getElementById('userSearch').value.toLowerCase();
  renderUsersBody(db.users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
}

function renderClients(c) {
  c.innerHTML = `
    <div class="table-container">
      <div class="table-header">
        <h3>Client Management</h3>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <input class="search-input" id="clientSearch" placeholder="Search clients..." oninput="filterClients()"/>
          <button class="btn-add" onclick="openClientModal()">+ Add Client</button>
        </div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Industry</th><th>Plan</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="clientsBody"></tbody>
      </table>
    </div>
  `;
  renderClientsBody(db.clients);
}
function renderClientsBody(clients) {
  const body = document.getElementById('clientsBody');
  if (!body) return;
  if (!clients.length) { body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--muted)">No clients found</td></tr>`; return; }
  body.innerHTML = clients.map(cl => `<tr>
    <td style="color:var(--muted)">${cl.id}</td>
    <td style="font-weight:500">${cl.name}</td>
    <td style="color:var(--muted)">${cl.email}</td>
    <td style="color:var(--muted)">${cl.industry}</td>
    <td><span class="badge-role badge-manager">${cl.plan}</span></td>
    <td>${statusBadge(cl.status)}</td>
    <td><div class="actions">
      <button class="btn-icon" onclick='openClientModal(${JSON.stringify(cl)})'>✏️</button>
      <button class="btn-icon del" onclick="deleteClient(${cl.id})">🗑</button>
    </div></td>
  </tr>`).join('');
}
function filterClients() {
  const q = document.getElementById('clientSearch').value.toLowerCase();
  renderClientsBody(db.clients.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)));
}

function renderProjects(c) {
  c.innerHTML = `
    <div class="table-container">
      <div class="table-header">
        <h3>Projects</h3>
        ${currentUser.role==='admin' ? `<button class="btn-add" onclick="openProjectModal()">+ Add Project</button>` : ''}
      </div>
      <table>
        <thead><tr><th>#</th><th>Project</th><th>Client</th><th>Lead</th><th>Status</th><th>Deadline</th>${currentUser.role==='admin'?'<th>Actions</th>':''}</tr></thead>
        <tbody>
          ${db.projects.map(p=>`<tr>
            <td style="color:var(--muted)">${p.id}</td>
            <td style="font-weight:500">${p.name}</td>
            <td style="color:var(--muted)">${p.client}</td>
            <td style="color:var(--muted)">${p.lead}</td>
            <td>${statusBadge(p.status)}</td>
            <td style="color:var(--muted)">${p.deadline}</td>
            ${currentUser.role==='admin' ? `<td><div class="actions">
              <button class="btn-icon" onclick='openProjectModal(${JSON.stringify(p)})'>✏️</button>
              <button class="btn-icon del" onclick="deleteProject(${p.id})">🗑</button>
            </div></td>` : ''}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderProfile(c) {
  const u = currentUser;
  c.innerHTML = `
    <div class="profile-card">
      <div class="avatar-circle">${u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
      <h3 style="font-family:var(--display);font-size:1.2rem;font-weight:800">${u.name}</h3>
      <p style="color:var(--muted);font-size:.875rem;margin-bottom:1.5rem">${u.email} · ${u.role} · ${u.dept}</p>
      <div style="display:grid;gap:.75rem;margin-bottom:1.5rem">
        <div class="form-group" style="margin:0"><label>Full Name</label><input id="pName" value="${u.name}"/></div>
        <div class="form-group" style="margin:0"><label>Email</label><input id="pEmail" value="${u.email}"/></div>
        <div class="form-group" style="margin:0"><label>Department</label>
          <select id="pDept">
            ${['Engineering','DevOps','Cloud','Security','Management'].map(d=>`<option ${d===u.dept?'selected':''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0"><label>New Password <span style="color:var(--muted)">(leave blank to keep current)</span></label><input type="password" id="pPass" placeholder="New password"/></div>
      </div>
      <button class="btn-primary" onclick="updateProfile()">Save Changes</button>
    </div>
  `;
}
function updateProfile() {
  const idx = db.users.findIndex(u => u.id === currentUser.id);
  const newEmail = document.getElementById('pEmail').value.trim();
  const existingWithEmail = db.users.find(u => u.email === newEmail && u.id !== currentUser.id);
  if (existingWithEmail) { toast('Email already in use.', 'error'); return; }
  db.users[idx].name = document.getElementById('pName').value.trim();
  db.users[idx].email = newEmail;
  db.users[idx].dept = document.getElementById('pDept').value;
  const newPass = document.getElementById('pPass').value;
  if (newPass.length >= 6) db.users[idx].password = newPass;
  else if (newPass.length > 0) { toast('Password must be at least 6 characters.', 'error'); return; }
  currentUser = db.users[idx];
  saveDB();
  toast('Profile updated!');
  renderDashboard();
}

// ─── MODALS ───────────────────────────────────────────────────────
function openModal() { document.getElementById('modalOverlay').style.display = 'flex'; }
function closeModal(e) { if (!e || e.target === document.getElementById('modalOverlay')) { document.getElementById('modalOverlay').style.display = 'none'; } }

function openUserModal(user) {
  const isEdit = !!user;
  document.getElementById('modalContent').innerHTML = `
    <h3>${isEdit ? 'Edit User' : 'Add New User'}<button class="modal-close" onclick="closeModal()">✕</button></h3>
    <div class="form-row">
      <div class="form-group"><label>Full Name</label><input id="mName" value="${isEdit ? user.name : ''}"/></div>
      <div class="form-group"><label>Email</label><input id="mEmail" value="${isEdit ? user.email : ''}"/></div>
    </div>
    ${!isEdit ? `<div class="form-group"><label>Password</label><input type="password" id="mPass" placeholder="Min 6 chars"/></div>` : ''}
    <div class="form-row">
      <div class="form-group"><label>Role</label><select id="mRole"><option ${!isEdit||user.role==='user'?'selected':''} value="user">User</option><option ${isEdit&&user.role==='manager'?'selected':''} value="manager">Manager</option><option ${isEdit&&user.role==='admin'?'selected':''} value="admin">Admin</option></select></div>
      <div class="form-group"><label>Department</label><select id="mDept">${['Engineering','DevOps','Cloud','Security','Management'].map(d=>`<option ${isEdit&&user.dept===d?'selected':''}>${d}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label>Status</label><select id="mStatus"><option ${!isEdit||user.status==='active'?'selected':''} value="active">Active</option><option ${isEdit&&user.status==='inactive'?'selected':''} value="inactive">Inactive</option></select></div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-full" style="width:auto;padding:.65rem 1.5rem" onclick="saveUser(${isEdit ? user.id : 'null'})">${isEdit ? 'Update' : 'Create'} User</button>
    </div>
  `;
  openModal();
}
function saveUser(id) {
  const name = document.getElementById('mName').value.trim();
  const email = document.getElementById('mEmail').value.trim();
  const role = document.getElementById('mRole').value;
  const dept = document.getElementById('mDept').value;
  const status = document.getElementById('mStatus').value;
  if (!name || !email) { toast('Name and email are required.', 'error'); return; }
  if (id) {
    const idx = db.users.findIndex(u => u.id === id);
    if (db.users.find(u => u.email === email && u.id !== id)) { toast('Email already in use.', 'error'); return; }
    db.users[idx] = { ...db.users[idx], name, email, role, dept, status };
    if (currentUser.id === id) currentUser = db.users[idx];
  } else {
    const pass = document.getElementById('mPass').value;
    if (!pass || pass.length < 6) { toast('Password must be at least 6 chars.', 'error'); return; }
    if (db.users.find(u => u.email === email)) { toast('Email already exists.', 'error'); return; }
    db.users.push({ id: nextId(db.users), name, email, password: pass, role, dept, status, joined: new Date().toISOString().split('T')[0] });
  }
  saveDB(); closeModal({}); toast(id ? 'User updated!' : 'User created!'); renderDashboard();
}
function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  db.users = db.users.filter(u => u.id !== id);
  saveDB(); toast('User deleted.'); renderDashboard();
}

function openClientModal(cl) {
  const isEdit = !!cl;
  document.getElementById('modalContent').innerHTML = `
    <h3>${isEdit ? 'Edit Client' : 'Add New Client'}<button class="modal-close" onclick="closeModal()">✕</button></h3>
    <div class="form-row">
      <div class="form-group"><label>Company Name</label><input id="cName" value="${isEdit ? cl.name : ''}"/></div>
      <div class="form-group"><label>Email</label><input id="cEmail" value="${isEdit ? cl.email : ''}"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Industry</label><select id="cInd"><option ${!isEdit||cl.industry==='FinTech'?'selected':''}>FinTech</option><option ${isEdit&&cl.industry==='SaaS'?'selected':''}>SaaS</option><option ${isEdit&&cl.industry==='E-Commerce'?'selected':''}>E-Commerce</option><option ${isEdit&&cl.industry==='Healthcare'?'selected':''}>Healthcare</option><option ${isEdit&&cl.industry==='Logistics'?'selected':''}>Logistics</option><option ${isEdit&&cl.industry==='Other'?'selected':''}>Other</option></select></div>
      <div class="form-group"><label>Plan</label><select id="cPlan"><option ${!isEdit||cl.plan==='Starter'?'selected':''}>Starter</option><option ${isEdit&&cl.plan==='Pro'?'selected':''}>Pro</option><option ${isEdit&&cl.plan==='Enterprise'?'selected':''}>Enterprise</option></select></div>
    </div>
    <div class="form-group"><label>Status</label><select id="cStatus"><option ${!isEdit||cl.status==='active'?'selected':''} value="active">Active</option><option ${isEdit&&cl.status==='inactive'?'selected':''} value="inactive">Inactive</option></select></div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-full" style="width:auto;padding:.65rem 1.5rem" onclick="saveClient(${isEdit ? cl.id : 'null'})">${isEdit ? 'Update' : 'Add'} Client</button>
    </div>
  `;
  openModal();
}
function saveClient(id) {
  const name = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const industry = document.getElementById('cInd').value;
  const plan = document.getElementById('cPlan').value;
  const status = document.getElementById('cStatus').value;
  if (!name || !email) { toast('Name and email required.', 'error'); return; }
  if (id) {
    const idx = db.clients.findIndex(c => c.id === id);
    db.clients[idx] = { ...db.clients[idx], name, email, industry, plan, status };
  } else {
    db.clients.push({ id: nextId(db.clients), name, email, industry, plan, status, createdAt: new Date().toISOString().split('T')[0] });
  }
  saveDB(); closeModal({}); toast(id ? 'Client updated!' : 'Client added!'); renderDashboard();
}
function deleteClient(id) {
  if (!confirm('Delete this client?')) return;
  db.clients = db.clients.filter(c => c.id !== id);
  saveDB(); toast('Client deleted.'); renderDashboard();
}

function openProjectModal(proj) {
  const isEdit = !!proj;
  const clientOptions = db.clients.map(c => `<option ${isEdit&&proj.client===c.name?'selected':''}>${c.name}</option>`).join('');
  const userOptions = db.users.map(u => `<option ${isEdit&&proj.lead===u.name?'selected':''}>${u.name}</option>`).join('');
  document.getElementById('modalContent').innerHTML = `
    <h3>${isEdit ? 'Edit Project' : 'Add Project'}<button class="modal-close" onclick="closeModal()">✕</button></h3>
    <div class="form-group"><label>Project Name</label><input id="pjName" value="${isEdit ? proj.name : ''}"/></div>
    <div class="form-row">
      <div class="form-group"><label>Client</label><select id="pjClient">${clientOptions}</select></div>
      <div class="form-group"><label>Lead</label><select id="pjLead">${userOptions}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Status</label><select id="pjStatus">
        <option ${!isEdit||proj.status==='planning'?'selected':''} value="planning">Planning</option>
        <option ${isEdit&&proj.status==='in-progress'?'selected':''} value="in-progress">In Progress</option>
        <option ${isEdit&&proj.status==='completed'?'selected':''} value="completed">Completed</option>
        <option ${isEdit&&proj.status==='paused'?'selected':''} value="paused">Paused</option>
      </select></div>
      <div class="form-group"><label>Deadline</label><input type="date" id="pjDeadline" value="${isEdit ? proj.deadline : ''}"/></div>
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn-full" style="width:auto;padding:.65rem 1.5rem" onclick="saveProject(${isEdit ? proj.id : 'null'})">${isEdit ? 'Update' : 'Create'} Project</button>
    </div>
  `;
  openModal();
}
function saveProject(id) {
  const name = document.getElementById('pjName').value.trim();
  const client = document.getElementById('pjClient').value;
  const lead = document.getElementById('pjLead').value;
  const status = document.getElementById('pjStatus').value;
  const deadline = document.getElementById('pjDeadline').value;
  if (!name) { toast('Project name required.', 'error'); return; }
  if (id) {
    const idx = db.projects.findIndex(p => p.id === id);
    db.projects[idx] = { ...db.projects[idx], name, client, lead, status, deadline };
  } else {
    db.projects.push({ id: nextId(db.projects), name, client, lead, status, deadline });
  }
  saveDB(); closeModal({}); toast(id ? 'Project updated!' : 'Project created!'); renderDashboard();
}
function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  db.projects = db.projects.filter(p => p.id !== id);
  saveDB(); toast('Project deleted.'); renderDashboard();
}

// ─── INIT ─────────────────────────────────────────────────────────
loadDB();
updateNav();


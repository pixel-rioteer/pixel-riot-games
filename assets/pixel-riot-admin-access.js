import { supabase, getSession, escapeHtml } from "/assets/pixel-riot-app.js?v=20260917-1";

const P=[
  ["Games","manage_games_view","View games"],["Games","manage_games_create","Create games"],["Games","manage_games_edit","Edit game content"],["Games","manage_games_delete","Delete games"],["Games","manage_page_builder","Use page builder"],
  ["Requests","manage_requests_view","View requests"],["Requests","manage_requests_dismiss","Dismiss requests"],
  ["Reports","manage_reports_view","View reports"],["Reports","manage_reports_resolve","Resolve reports"],["Reports","manage_reports_dismiss","Dismiss reports"],["Reports","manage_reports_ban","Ban users"],
  ["Accounts","manage_users_view","View accounts"],["Accounts","manage_users_create","Create accounts"],["Accounts","manage_users_edit","Edit accounts"],["Accounts","manage_users_permissions","Change permissions"],["Accounts","manage_users_ban","Ban/unban"],["Accounts","manage_users_tags","Manage tags"]
];

async function games(){return (await supabase.from("games").select("id,title,slug").order("sort_order",{ascending:true})).data||[]}
async function invokeError(error){let msg=error?.message||"Edge Function returned an error.";try{if(error?.context){const text=await error.context.text();if(text){try{const j=JSON.parse(text);msg=j.error||j.message||text}catch{msg=text}}}}catch{}return msg}

function accessMarkup(gs,prefix="pr"){
  return `<div data-pr-access-box class="md:col-span-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
    <div class="flex items-start justify-between gap-4"><div><h3 class="font-black text-lg">Account Access</h3><p class="muted mt-1">New accounts are blocked until you authorize them.</p></div><label class="check"><input id="${prefix}-authorized" type="checkbox"><span>Authorize account</span></label></div>
    <div class="mt-5"><label class="text-sm font-bold text-gray-300">Page editing access</label><select id="${prefix}-page-mode" class="field mt-2"><option value="all">All game pages</option><option value="selected">Only selected game pages</option></select>
    <div id="${prefix}-page-list" class="hidden mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">${gs.map(g=>`<label class="check border border-white/5 rounded-xl"><input type="checkbox" data-pr-game value="${escapeHtml(g.id)}"><span>${escapeHtml(g.title)} <small class="muted">/${escapeHtml(g.slug)}</small></span></label>`).join("")}</div>
    <p class="muted text-xs mt-2">Page access limits Edit and Page Builder permissions to these games.</p></div></div>`;
}

function permissionMarkup(prefix,values={}){
  return `<div class="md:col-span-2 mt-1"><h3 class="text-sm font-black text-gray-300 mb-3">Permissions</h3><div class="grid lg:grid-cols-4 gap-4">${["Games","Requests","Reports","Accounts"].map(group=>`<div class="permission-group"><h3>${group}</h3>${P.filter(x=>x[0]===group).map(([,k,l])=>`<label class="check"><input type="checkbox" data-${prefix}-perm="${k}" ${values[k]?'checked':''}><span>${l}</span></label>`).join("")}</div>`).join("")}</div></div>`;
}

async function installCreate(){
  if(!location.pathname.endsWith("/admin.html"))return;
  const s=await getSession();if(!s)return;
  const {data:me}=await supabase.from("profiles").select("role").eq("id",s.user.id).maybeSingle();if(me?.role!=="owner")return;
  const form=document.getElementById("user-form");if(!form)return;

  // Remove any duplicate/legacy access panels left by an older cached script.
  const accessBoxes=[...form.querySelectorAll("[data-pr-access-box],#pixel-riot-access-box")];
  accessBoxes.slice(1).forEach(x=>x.remove());
  if(!form.querySelector("[data-pr-access-box]")){
    const box=document.createElement("div");box.innerHTML=accessMarkup(await games());
    const target=form.querySelector("button[type=submit],button:not([type])");form.insertBefore(box.firstElementChild,target||null);
  }
  const mode=document.getElementById("pr-page-mode"),list=document.getElementById("pr-page-list");if(mode)mode.onchange=()=>list?.classList.toggle("hidden",mode.value!=="selected");

  if(form.dataset.accessSubmit)return;form.dataset.accessSubmit="1";
  form.addEventListener("submit",async e=>{
    e.preventDefault();e.stopImmediatePropagation();
    const f=form,m=document.getElementById("user-message");m.textContent="Creating account...";
    const permissions={};P.forEach(([,k])=>permissions[k]=!!f.elements[k]?.checked);
    const page_permissions={};if(document.getElementById("pr-page-mode")?.value==="all")page_permissions._all=true;else document.querySelectorAll("[data-pr-game]:checked").forEach(x=>page_permissions[String(x.value)]=true);
    const {data,error}=await supabase.functions.invoke("owner-manage-user",{body:{username:f.username.value.trim(),email:f.email.value.trim(),password:f.password.value,tag:f.custom_tag.value.trim()||f.tag.value,role:f.role.value,permissions,authorized:document.getElementById("pr-authorized")?.checked===true,page_permissions}});
    if(error){m.textContent=await invokeError(error);return}if(data?.error){m.textContent=data.error;return}
    m.textContent=`Created ${data?.user?.username||f.username.value.trim()}.`;f.reset();if(mode){mode.value="all";list?.classList.add("hidden")}await renderUsersEditor();
  },{capture:true});
}

async function updateUser(id,payload){return supabase.functions.invoke("owner-manage-user",{body:{action:"update",id,...payload}})}

async function renderUsersEditor(){
  const c=document.getElementById("users-list");if(!c)return;
  const {data,error}=await supabase.from("profiles").select("id,username,role,tag,permissions,banned,banned_reason,authorized,page_permissions").order("username");
  if(error){c.innerHTML=`<p class="text-red-400">${escapeHtml(error.message)}</p>`;return}
  const gs=await games();
  c.innerHTML=(data||[]).map(u=>{
    const p=u.permissions||{},pp=u.page_permissions||{};
    return `<div class="request block" data-user-editor="${escapeHtml(u.id)}"><div class="flex items-center justify-between gap-4"><div><b>${escapeHtml(u.username)}</b><p class="muted">${escapeHtml(u.role)} · ${u.authorized?'AUTHORIZED':'NOT AUTHORIZED'}${u.banned?' · BANNED':''}</p></div><button type="button" data-edit-user class="action-cyan">Edit access</button></div>
    <div data-user-panel class="hidden mt-4 border-t border-white/10 pt-4"><div class="grid md:grid-cols-2 gap-3">
      <label class="check"><input data-u-authorized type="checkbox" ${u.authorized?'checked':''}><span>Authorized</span></label>
      <select data-u-role class="field"><option value="member" ${u.role==='member'?'selected':''}>Member</option><option value="moderator" ${u.role==='moderator'?'selected':''}>Moderator</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select>
      <select data-u-tag class="field"><option value="Developer" ${u.tag==='Developer'?'selected':''}>Developer</option><option value="Moderator" ${u.tag==='Moderator'?'selected':''}>Moderator</option><option value="Reviewer" ${u.tag==='Reviewer'?'selected':''}>Reviewer</option><option value="Partner" ${u.tag==='Partner'?'selected':''}>Partner</option><option value="Tester" ${u.tag==='Tester'?'selected':''}>Tester</option><option value="VIP" ${u.tag==='VIP'?'selected':''}>VIP</option><option value="Community Team" ${u.tag==='Community Team'?'selected':''}>Community Team</option><option value="Member" ${u.tag==='Member'?'selected':''}>Member</option>${u.tag&&!['Developer','Moderator','Reviewer','Partner','Tester','VIP','Community Team','Member'].includes(u.tag)?`<option selected value="${escapeHtml(u.tag)}">${escapeHtml(u.tag)}</option>`:''}</select>
      <select data-u-page-mode class="field"><option value="all" ${pp._all?'selected':''}>All game pages</option><option value="selected" ${!pp._all?'selected':''}>Only selected pages</option></select></div>
      <div data-u-pages class="${pp._all?'hidden':''} grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">${gs.map(g=>`<label class="check border border-white/5 rounded-xl"><input type="checkbox" data-u-game value="${escapeHtml(g.id)}" ${pp[String(g.id)]?'checked':''}><span>${escapeHtml(g.title)}</span></label>`).join("")}</div>
      ${permissionMarkup("u",p)}
      <div class="mt-4"><button type="button" data-save-user class="primary">Save access</button><span data-user-msg class="muted ml-3"></span></div>
    </div></div>`;
  }).join("")||'<p class="muted">No profiles found.</p>';

  c.querySelectorAll('[data-edit-user]').forEach(b=>b.onclick=()=>b.closest('[data-user-editor]').querySelector('[data-user-panel]').classList.toggle('hidden'));
  c.querySelectorAll('[data-u-page-mode]').forEach(s=>s.onchange=()=>s.closest('[data-user-panel]').querySelector('[data-u-pages]').classList.toggle('hidden',s.value!=='selected'));
  c.querySelectorAll('[data-save-user]').forEach(b=>b.onclick=async()=>{
    const card=b.closest('[data-user-editor]'),m=card.querySelector('[data-user-msg]'),permissions={};
    card.querySelectorAll('[data-u-perm]').forEach(x=>permissions[x.dataset.uPerm]=x.checked);
    const page_permissions={};if(card.querySelector('[data-u-page-mode]').value==='all')page_permissions._all=true;else card.querySelectorAll('[data-u-game]:checked').forEach(x=>page_permissions[String(x.value)]=true);
    b.disabled=true;b.textContent='Saving...';const {data,error}=await updateUser(card.dataset.userEditor,{authorized:card.querySelector('[data-u-authorized]').checked,role:card.querySelector('[data-u-role]').value,tag:card.querySelector('[data-u-tag]').value,permissions,page_permissions});
    m.textContent=error?await invokeError(error):(data?.error||'Saved ✓');b.disabled=false;b.textContent='Save access';if(!error&&!data?.error)setTimeout(renderUsersEditor,500);
  });
}

async function install(){
  await installCreate();
  const c=document.getElementById("users-list");if(c&&!c.dataset.editorReady){c.dataset.editorReady="1";await renderUsersEditor()}
}
new MutationObserver(()=>install().catch(console.error)).observe(document.documentElement,{childList:true,subtree:true});
install().catch(console.error);
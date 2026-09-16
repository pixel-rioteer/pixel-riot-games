import { getSession, supabase, escapeHtml } from "/assets/pixel-riot-app.js?v=20260916-3";

const session = await getSession();
if (!session || !location.pathname.endsWith("/admin.html")) return;
const { data: me } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
if (me?.role !== "owner") return;

const gamesResult = await supabase.from("games").select("id,title,slug").order("sort_order", { ascending: true });
const games = gamesResult.data || [];

function accessMarkup(){
  return `<div id="access-settings" class="md:col-span-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5"><div class="flex items-start justify-between gap-4"><div><h3 class="font-black text-lg">Account Access</h3><p class="muted mt-1">Only authorized accounts can enter PIXEL-RIOT.</p></div><label class="check"><input id="authorized-account" type="checkbox"><span>Authorize this account</span></label></div><div class="mt-5"><label class="text-sm font-bold text-gray-300">Page editing access</label><p class="muted mt-1">Choose whether this person can edit every game page or only selected pages.</p><select id="page-access-mode" class="field mt-3"><option value="all">All game pages</option><option value="selected">Only selected game pages</option></select><div id="page-access-games" class="hidden mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">${games.map(g=>`<label class="check border border-white/5 rounded-xl"><input type="checkbox" value="${g.id}" data-page-game><span>${escapeHtml(g.title)} <small class="muted">/${escapeHtml(g.slug)}</small></span></label>`).join("")}</div></div></div>`;
}

function install(){
  const form=document.getElementById("user-form");
  if(!form)return false;
  if(!document.getElementById("access-settings")){
    const submit=form.querySelector("button[type=submit],button:not([type])");
    const box=document.createElement("div");box.innerHTML=accessMarkup();
    form.insertBefore(box.firstElementChild,submit||null);
    const mode=document.getElementById("page-access-mode"),list=document.getElementById("page-access-games");
    mode.addEventListener("change",()=>list.classList.toggle("hidden",mode.value!=="selected"));
  }
  if(!form.dataset.accessWrapped){
    const wait=setInterval(()=>{
      if(typeof form.onsubmit!=="function")return;
      clearInterval(wait);const original=form.onsubmit;form.onsubmit=async e=>{
        const authorized=document.getElementById("authorized-account")?.checked===true;
        const mode=document.getElementById("page-access-mode")?.value||"all";
        const page_permissions={};
        if(mode==="all")page_permissions._all=true;
        else document.querySelectorAll("[data-page-game]:checked").forEach(x=>page_permissions[x.value]=true);
        await original(e);
        const username=form.username?.value?.trim();
        if(username){
          await new Promise(r=>setTimeout(r,300));
          const {data:user}=await supabase.from("profiles").select("id").eq("username",username).maybeSingle();
          if(user) await supabase.from("profiles").update({authorized,page_permissions}).eq("id",user.id);
        }
      };form.dataset.accessWrapped="1";
    },100);
  }
  return true;
}

const observer=new MutationObserver(install);observer.observe(document.body,{childList:true,subtree:true});install();

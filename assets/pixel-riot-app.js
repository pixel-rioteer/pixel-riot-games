import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const SUPABASE_URL = "https://kklarbwjgyxqhculbluy.supabase.co";
const SUPABASE_KEY = "sb_publishable_hQILSRKRQCek4Er8CDUNXiA_YtxZnYE0";
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export function escapeHtml(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
export function starString(rating){const n=Math.round(Number(rating)||0);return "★".repeat(n)+"☆".repeat(Math.max(0,5-n));}
export function rootPath(path){return "/"+path.replace(/^\/+/,"");}
export async function getSession(){const {data}=await supabase.auth.getSession();return data.session;}
export async function getProfile(){const session=await getSession();if(!session)return null;const {data,error}=await supabase.from("profiles").select("id, username, is_admin, role, banned, banned_reason, tag, permissions").eq("id",session.user.id).single();if(error){console.error(error);return null;}return {...data,email:session.user.email};}
export function rankBadge(role){if(role==="owner")return '<span class="ml-1 px-2 py-0.5 rounded-lg bg-yellow-500 text-black text-xs font-black align-middle">OWNER</span>';if(role==="admin")return '<span class="ml-1 px-2 py-0.5 rounded-lg bg-purple-600 text-white text-xs font-black align-middle">ADMIN</span>';if(role==="moderator")return '<span class="ml-1 px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-black align-middle">MOD</span>';return "";}
export function tagBadge(tag){if(!tag||tag==="Member")return "";return `<span class="ml-1 px-2 py-0.5 rounded-lg bg-white/10 text-cyan-300 text-xs font-black align-middle">${escapeHtml(tag)}</span>`;}
export async function blockIfBanned(){const profile=await getProfile();if(profile?.banned){await signOut();alert(`Your account has been banned${profile.banned_reason?`: ${profile.banned_reason}`:"."}`);window.location.href=rootPath("home/");return true;}return false;}
export async function signUp({email,password,username}){return supabase.auth.signUp({email,password,options:{data:{username}}});}
export async function signIn({email,password}){return supabase.auth.signInWithPassword({email,password});}
export async function signInWithMagicLink(email){return supabase.auth.signInWithOtp({email,options:{emailRedirectTo:`${window.location.origin}/account.html`}});}
export async function signOut(){await supabase.auth.signOut();}
export async function requireAuth(redirectTo=rootPath("login.html")){const session=await getSession();if(!session){window.location.href=redirectTo;return null;}return session;}
async function buildAuthNavLinks(){const profile=await getProfile();const links=[{href:rootPath("games/"),label:"All Games"},{href:rootPath("leaderboard.html"),label:"Leaderboard"}];if(profile){links.push({href:rootPath("account.html"),label:`Hi, ${escapeHtml(profile.username)}${rankBadge(profile.role)}${tagBadge(profile.tag)}`,raw:true},{href:rootPath("settings.html"),label:"Settings"});if(profile.is_admin)links.push({href:rootPath("admin.html"),label:"Admin"});links.push({href:"#",label:"Log Out",action:"logout"});}else links.push({href:rootPath("login.html"),label:"Log In"},{href:rootPath("signup.html"),label:"Sign Up",highlight:true});return links;}
function linkHtml(link){if(link.action==="logout")return `<a href="#" data-nav-logout class="hover:text-cyan-400">${escapeHtml(link.label)}</a>`;return `<a href="${link.href}" class="${link.highlight?"px-4 py-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400":"hover:text-cyan-400"}">${link.raw?link.label:escapeHtml(link.label)}</a>`;}
function attachLogoutHandlers(root){root.querySelectorAll("[data-nav-logout]").forEach(el=>el.addEventListener("click",async e=>{e.preventDefault();await signOut();window.location.href=rootPath("home/");}));}
function ensureMobileMenu(nav,desktopContainer){let toggle=nav.querySelector("[data-mobile-menu-toggle]"),panel=nav.querySelector("[data-mobile-menu-panel]");if(toggle&&panel)return panel;toggle=document.createElement("button");toggle.dataset.mobileMenuToggle="";toggle.setAttribute("aria-label","Menu");toggle.className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/15 text-cyan-300 text-xl leading-none";toggle.textContent="☰";(desktopContainer.parentElement||nav).appendChild(toggle);panel=document.createElement("div");panel.dataset.mobileMenuPanel="";panel.className="md:hidden hidden flex-col gap-1 px-6 pb-5 pt-2 border-t border-white/10 bg-black/95";nav.appendChild(panel);toggle.addEventListener("click",()=>{const open=panel.classList.contains("hidden");panel.classList.toggle("hidden",!open);panel.classList.toggle("flex",open);toggle.textContent=open?"✕":"☰";});return panel;}
function syncMobileMenu(panel,desktopContainer){panel.innerHTML="";desktopContainer.querySelectorAll("a,button").forEach(el=>{const clone=el.cloneNode(true);clone.className="block py-3 text-gray-200 hover:text-cyan-400 border-b border-white/5 last:border-0";panel.appendChild(clone);});attachLogoutHandlers(panel);}
export async function renderAuthNav(){const slots=document.querySelectorAll("[data-auth-nav-slot]");if(!slots.length)return;const html=(await buildAuthNavLinks()).map(linkHtml).join("");slots.forEach(slot=>{slot.innerHTML=html;attachLogoutHandlers(slot);const nav=slot.closest("nav");if(!nav)return;const desktop=slot.parentElement?.classList.contains("md:flex")?slot.parentElement:slot;syncMobileMenu(ensureMobileMenu(nav,desktop),desktop);});}
export async function fetchGames(){const {data,error}=await supabase.from("games").select("*").order("sort_order",{ascending:true});if(error){console.error(error);return [];}return data;}
export async function fetchGameBySlug(slug){const {data,error}=await supabase.from("games").select("*").eq("slug",slug).single();if(error){console.error(error);return null;}return data;}
export async function fetchLeaderboard(){const {data,error}=await supabase.from("game_leaderboard").select("*").order("avg_rating",{ascending:false});if(error){console.error(error);return [];}return data;}
export async function createGame(game){return supabase.from("games").insert([game]).select().single();}
export async function updateGame(id,patch){return supabase.from("games").update(patch).eq("id",id).select().single();}
export async function deleteGame(id){return supabase.from("games").delete().eq("id",id);}
export async function fetchGameRequests(){const {data,error}=await supabase.from("game-reqs").select("*").order("id",{ascending:false});if(error){console.error(error);return [];}return data;}
export async function deleteGameRequest(id){return supabase.from("game-reqs").delete().eq("id",id);}
export async function fetchReviews(gameId){const {data,error}=await supabase.from("reviews").select("id, rating, body, created_at, user_id, profiles(username, role, tag)").eq("game_id",gameId).order("created_at",{ascending:false});if(error){console.error(error);return [];}return data;}
export async function upsertReview({gameId,userId,rating,body}){return supabase.from("reviews").upsert([{game_id:gameId,user_id:userId,rating,body}],{onConflict:"game_id,user_id"}).select().single();}
export async function fetchFavoriteGameIds(userId){const {data,error}=await supabase.from("favorites").select("game_id").eq("user_id",userId);if(error){console.error(error);return [];}return data.map(row=>row.game_id);}
export async function addFavorite(userId,gameId){return supabase.from("favorites").insert([{user_id:userId,game_id:gameId}]);}
export async function removeFavorite(userId,gameId){return supabase.from("favorites").delete().eq("user_id",userId).eq("game_id",gameId);}
export async function fileReport({reporterId,reportedUserId,reviewId=null,reason}){return supabase.from("reports").insert([{reporter_id:reporterId,reported_user_id:reportedUserId,review_id:reviewId,reason}]);}
export async function fetchReports(){const {data,error}=await supabase.from("reports").select("id, reason, status, created_at, reported_user_id, reviewer:reporter_id(username), reported:reported_user_id(username, role, tag)").order("created_at",{ascending:false});if(error){console.error(error);return [];}return data;}
export async function updateReportStatus(id,status){return supabase.from("reports").update({status}).eq("id",id);}
export async function banUser(userId,reason){return supabase.from("profiles").update({banned:true,banned_reason:reason}).eq("id",userId);}
export async function unbanUser(userId){return supabase.from("profiles").update({banned:false,banned_reason:null}).eq("id",userId);}
export async function saveGamePage(id,page_theme,page_layout,content={}){const patch={page_theme:JSON.parse(JSON.stringify(page_theme)),page_layout:JSON.parse(JSON.stringify(page_layout))};for(const key of ["title","category","tagline","image_url","platform","price","price_breakdown","description","tips","known_issues","secrets_cheats","commands_reference","elements_reference"]){if(Object.prototype.hasOwnProperty.call(content,key))patch[key]=content[key];}const result=await supabase.from("games").update(patch).eq("id",id).select("*").single();if(result.error)console.error("saveGamePage failed",result.error);return result;}
export async function createManagedUser(payload){const session=await getSession();if(!session)return {data:null,error:new Error("You must be logged in.")};return supabase.functions.invoke("owner-create-user",{body:payload});}
export async function fetchProfiles(){const {data,error}=await supabase.from("profiles").select("id,username,role,tag,permissions,banned,banned_reason").order("username");if(error)console.error(error);return {data:data||[],error};}

export async function uploadGameImage(file){
  if(!file||!file.type?.startsWith("image/")) throw new Error("Please choose an image file.");
  if(file.size>10*1024*1024) throw new Error("Images must be 10MB or smaller.");
  const session=await getSession();
  if(!session) throw new Error("You must be logged in to upload an image.");
  const ext=(file.name?.split(".").pop()||file.type.split("/").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"")||"png";
  const path=`${session.user.id}/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from("game-images").upload(path,file,{contentType:file.type,upsert:false});
  if(error) throw error;
  const {data}=supabase.storage.from("game-images").getPublicUrl(path);
  return data.publicUrl;
}

function imageUploadUI(input){
  if(!input||input.dataset.imageUploadReady)return;
  input.dataset.imageUploadReady="1";
  const wrap=document.createElement("div");
  wrap.className="flex flex-wrap items-center gap-2 mt-2";
  const fileInput=document.createElement("input");
  fileInput.type="file";fileInput.accept="image/*";fileInput.className="hidden";
  const button=document.createElement("button");
  button.type="button";button.className="secondary";button.textContent="Upload / choose photo";
  const hint=document.createElement("span");hint.className="muted text-xs";hint.textContent="or paste an image here (Ctrl/Cmd+V)";
  wrap.append(button,fileInput,hint);input.insertAdjacentElement("afterend",wrap);
  const setBusy=(busy)=>{button.disabled=busy;button.textContent=busy?"Uploading…":"Upload / choose photo";};
  const upload=async file=>{try{setBusy(true);input.value=await uploadGameImage(file);input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}));}catch(err){alert(err.message||"Image upload failed.");}finally{setBusy(false);}};
  button.addEventListener("click",()=>fileInput.click());
  fileInput.addEventListener("change",()=>{if(fileInput.files?.[0])upload(fileInput.files[0]);});
  input.addEventListener("paste",e=>{const item=[...(e.clipboardData?.items||[])].find(x=>x.type.startsWith("image/"));if(item){e.preventDefault();upload(item.getAsFile());}});
}
function enhanceImageInputs(root=document){root.querySelectorAll?.('[data-field="image_url"], [data-prop="url"]').forEach(imageUploadUI);}
function installImagePasteSupport(){enhanceImageInputs(document);const observer=new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)enhanceImageInputs(n);})));observer.observe(document.body,{childList:true,subtree:true});}

async function installOwnerImageScaler(){
  if(!document.getElementById("game-main")||location.pathname.includes("admin.html"))return;
  const slug=new URLSearchParams(location.search).get("slug");
  if(!slug)return;
  const profile=await getProfile();
  if(profile?.role!=="owner")return;
  const game=await fetchGameBySlug(slug);if(!game)return;
  const waitForImage=()=>document.querySelector("#game-main img");
  const apply=()=>{
    const img=waitForImage();if(!img)return false;
    const imageSection=Array.isArray(game.page_layout)?game.page_layout.find(x=>x.type==="image"):null;
    const p=imageSection?.props||{};
    img.style.width=`${Math.max(10,Math.min(100,Number(p.width)||100))}%`;
    img.style.maxHeight=`${Math.max(100,Math.min(1600,Number(p.maxHeight)||1600))}px`;
    img.style.objectFit=p.fit||"contain";
    img.style.objectPosition=p.position||"center";
    img.style.margin=`${p.align==="left"?"0 auto 0 0":p.align==="right"?"0 0 0 auto":"0 auto"}`;
    return true;
  };
  const panel=document.createElement("aside");panel.id="owner-image-scaler";panel.innerHTML=`<div class="ois-head"><b>OWNER IMAGE CONTROLS</b><button type="button" data-ois-close>×</button></div><label>Width <output data-w>100%</output><input data-w-range type="range" min="10" max="100" value="100"></label><label>Max height <output data-h>1600px</output><input data-h-range type="range" min="100" max="1600" step="10" value="1600"></label><label>Fit<select data-fit><option value="contain">Contain — show whole image</option><option value="cover">Cover — fill area</option><option value="fill">Fill — stretch</option></select></label><label>Alignment<select data-align><option value="center">Center</option><option value="left">Left</option><option value="right">Right</option></select></label><button type="button" data-apply class="ois-save">Save image size</button><p data-msg></p>`;
  const css=document.createElement("style");css.textContent="#owner-image-scaler{position:fixed;right:18px;bottom:18px;z-index:9999;width:min(340px,calc(100vw - 36px));padding:16px;border:1px solid rgba(34,211,238,.35);border-radius:18px;background:rgba(5,5,8,.96);backdrop-filter:blur(18px);box-shadow:0 20px 60px rgba(0,0,0,.55);color:#fff;font:14px system-ui}.ois-head{display:flex;justify-content:space-between;align-items:center;color:#22d3ee;margin-bottom:14px}.ois-head button{background:none;border:0;color:#aaa;font-size:22px;cursor:pointer}.ois-head~label{display:block;margin:12px 0;color:#ddd}.ois-head~label output{float:right;color:#22d3ee}.ois-head~label input,.ois-head~label select{display:block;width:100%;margin-top:7px}.ois-head~label select{background:#08080b;color:#fff;border:1px solid #333;border-radius:9px;padding:8px}.ois-save{width:100%;margin-top:8px;padding:10px;border:0;border-radius:10px;background:#22d3ee;color:#001014;font-weight:900;cursor:pointer}#owner-image-scaler [data-msg]{font-size:12px;color:#888;margin:8px 0 0}#owner-image-scaler [data-w-range],#owner-image-scaler [data-h-range]{accent-color:#22d3ee}";document.head.appendChild(css);document.body.appendChild(panel);
  const imageSection=Array.isArray(game.page_layout)?game.page_layout.find(x=>x.type==="image"):null;const p=imageSection?.props||{};const wr=panel.querySelector("[data-w-range]"),hr=panel.querySelector("[data-h-range]"),fit=panel.querySelector("[data-fit]"),align=panel.querySelector("[data-align]");wr.value=Number(p.width)||100;hr.value=Number(p.maxHeight)||1600;fit.value=p.fit||"contain";align.value=p.align||"center";panel.querySelector("[data-w]").value=`${wr.value}%`;panel.querySelector("[data-h]").value=`${hr.value}px`;
  const preview=()=>{if(!imageSection)return;imageSection.props=imageSection.props||{};imageSection.props.width=Number(wr.value);imageSection.props.maxHeight=Number(hr.value);imageSection.props.fit=fit.value;imageSection.props.align=align.value;imageSection.props.position="center";panel.querySelector("[data-w]").value=`${wr.value}%`;panel.querySelector("[data-h]").value=`${hr.value}px`;apply();};wr.oninput=hr.oninput=fit.onchange=align.onchange=preview;
  panel.querySelector("[data-apply]").onclick=async()=>{const b=panel.querySelector("[data-apply]"),msg=panel.querySelector("[data-msg]");b.disabled=true;b.textContent="Saving…";const result=await saveGamePage(game.id,game.page_theme||{},game.page_layout||[]);if(result.error){msg.textContent=result.error.message;b.disabled=false;b.textContent="Save image size";return}Object.assign(game,result.data);msg.textContent="Saved ✓";b.disabled=false;b.textContent="Save image size";setTimeout(()=>msg.textContent="",1600)};
  panel.querySelector("[data-ois-close]").onclick=()=>panel.remove();
  const observer=new MutationObserver(()=>apply());observer.observe(document.getElementById("game-main"),{childList:true,subtree:true});
  const timer=setInterval(()=>{if(apply())clearInterval(timer)},250);setTimeout(()=>clearInterval(timer),10000);
}

document.addEventListener("DOMContentLoaded",()=>{renderAuthNav();installImagePasteSupport();installOwnerImageScaler();});

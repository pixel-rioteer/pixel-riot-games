import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const SUPABASE_URL = "https://kklarbwjgyxqhculbluy.supabase.co";
const SUPABASE_KEY = "sb_publishable_hQILSRKRQCekEr8CDUNXiA_YtxZnYE0";
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
function enhanceImageInputs(root=document){
  root.querySelectorAll?.('[data-field="image_url"], [data-prop="url"]').forEach(imageUploadUI);
}
function installImagePasteSupport(){
  enhanceImageInputs(document);
  const observer=new MutationObserver(mutations=>mutations.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)enhanceImageInputs(n);})));observer.observe(document.body,{childList:true,subtree:true});
}

document.addEventListener("DOMContentLoaded",()=>{renderAuthNav();installImagePasteSupport();});

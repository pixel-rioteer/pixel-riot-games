// PIXEL-RIOT shared app logic: Supabase auth, games, reviews, favorites, nav injection.
// Loaded as a module: <script type="module" src="/assets/pixel-riot-app.js"></script>

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://kklarbwjgyxqhculbluy.supabase.co";
const SUPABASE_KEY = "sb_publishable_hQILSRKRQCekEr8CDUNXiA_YtxZnYE0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- small helpers ----------
export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function starString(rating) {
  const n = Math.round(Number(rating) || 0);
  return "★".repeat(n) + "☆".repeat(Math.max(0, 5 - n));
}

// This site is served from its domain root, so every page/asset path is absolute
// (leading "/"). That means this helper works identically no matter how deep the
// page importing it lives in the folder structure.
export function rootPath(path) {
  return "/" + path.replace(/^\/+/, "");
}

// ---------- auth ----------
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, is_admin, role, banned, banned_reason")
    .eq("id", session.user.id)
    .single();
  if (error) {
    console.error("Failed to load profile:", error);
    return null;
  }
  return { ...data, email: session.user.email };
}

// A small colored tag for a user's role. Returns "" for ordinary members.
export function rankBadge(role) {
  if (role === "owner") {
    return '<span class="ml-1 px-2 py-0.5 rounded-lg bg-yellow-500 text-black text-xs font-black align-middle">OWNER</span>';
  }
  if (role === "admin") {
    return '<span class="ml-1 px-2 py-0.5 rounded-lg bg-purple-600 text-white text-xs font-black align-middle">ADMIN</span>';
  }
  return "";
}

// If the current session belongs to a banned account, sign them out and bounce them
// to a page explaining why. Call this on every page that needs a live session.
export async function blockIfBanned() {
  const profile = await getProfile();
  if (profile?.banned) {
    const reason = profile.banned_reason ? `: ${profile.banned_reason}` : ".";
    await signOut();
    alert(`Your account has been banned${reason}`);
    window.location.href = rootPath("home/");
    return true;
  }
  return false;
}

export async function signUp({ email, password, username }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  return { data, error };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Passwordless login: emails the user a one-time sign-in link.
export async function signInWithMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/account.html` },
  });
  return { data, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Redirects to the login page if there is no active session. Returns the session if present.
export async function requireAuth(redirectTo = rootPath("login.html")) {
  const session = await getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

// ---------- nav injection ----------
async function buildAuthNavLinks() {
  const profile = await getProfile();
  const links = [
    { href: rootPath("games/"), label: "All Games" },
    { href: rootPath("leaderboard.html"), label: "Leaderboard" },
  ];
  if (profile) {
    links.push({
      href: rootPath("account.html"),
      label: `Hi, ${escapeHtml(profile.username)}${rankBadge(profile.role)}`,
      raw: true,
    });
    links.push({ href: rootPath("settings.html"), label: "Settings" });
    if (profile.is_admin) links.push({ href: rootPath("admin.html"), label: "Admin" });
    links.push({ href: "#", label: "Log Out", action: "logout" });
  } else {
    links.push({ href: rootPath("login.html"), label: "Log In" });
    links.push({ href: rootPath("signup.html"), label: "Sign Up", highlight: true });
  }
  return links;
}

function linkHtml(link) {
  if (link.action === "logout") {
    return `<a href="#" data-nav-logout class="hover:text-cyan-400">${escapeHtml(link.label)}</a>`;
  }
  const cls = link.highlight
    ? "px-4 py-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400"
    : "hover:text-cyan-400";
  const label = link.raw ? link.label : escapeHtml(link.label);
  return `<a href="${link.href}" class="${cls}">${label}</a>`;
}

function attachLogoutHandlers(root) {
  root.querySelectorAll("[data-nav-logout]").forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut();
      window.location.href = rootPath("home/");
    });
  });
}

// Adds a hamburger button + slide-down panel so nav links (which are `hidden md:flex`
// on every page in this site) are actually reachable on a phone-width screen.
function ensureMobileMenu(nav, desktopContainer) {
  let toggle = nav.querySelector("[data-mobile-menu-toggle]");
  let panel = nav.querySelector("[data-mobile-menu-panel]");
  if (toggle && panel) return panel;

  toggle = document.createElement("button");
  toggle.setAttribute("data-mobile-menu-toggle", "");
  toggle.setAttribute("aria-label", "Menu");
  toggle.className =
    "md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/15 text-cyan-300 text-xl leading-none";
  toggle.textContent = "☰";
  (desktopContainer.parentElement || nav).appendChild(toggle);

  panel = document.createElement("div");
  panel.setAttribute("data-mobile-menu-panel", "");
  panel.className = "md:hidden hidden flex-col gap-1 px-6 pb-5 pt-2 border-t border-white/10 bg-black/95";
  nav.appendChild(panel);

  toggle.addEventListener("click", () => {
    const nowOpen = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !nowOpen);
    panel.classList.toggle("flex", nowOpen);
    toggle.textContent = nowOpen ? "✕" : "☰";
  });

  return panel;
}

function syncMobileMenu(panel, desktopContainer) {
  if (!panel) return;
  panel.innerHTML = "";
  desktopContainer.querySelectorAll("a, button").forEach((el) => {
    const clone = el.cloneNode(true);
    clone.className = "block py-3 text-gray-200 hover:text-cyan-400 border-b border-white/5 last:border-0";
    panel.appendChild(clone);
  });
  attachLogoutHandlers(panel);
}

// Injects auth-aware links into every <nav> on the page inside an element with
// [data-auth-nav-slot], and builds a mobile hamburger menu mirroring the full nav
// (page links + auth links) since the desktop nav is hidden below the md breakpoint.
export async function renderAuthNav() {
  const slots = document.querySelectorAll("[data-auth-nav-slot]");
  if (!slots.length) return;

  const links = await buildAuthNavLinks();
  const html = links.map(linkHtml).join("");

  slots.forEach((slot) => {
    slot.innerHTML = html;
    attachLogoutHandlers(slot);

    const nav = slot.closest("nav");
    if (!nav) return;
    const desktopContainer =
      slot.parentElement && slot.parentElement.classList.contains("md:flex") ? slot.parentElement : slot;
    const panel = ensureMobileMenu(nav, desktopContainer);
    syncMobileMenu(panel, desktopContainer);
  });
}

// ---------- games ----------
export async function fetchGames() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Failed to load games:", error);
    return [];
  }
  return data;
}

export async function fetchGameBySlug(slug) {
  const { data, error } = await supabase.from("games").select("*").eq("slug", slug).single();
  if (error) {
    console.error("Failed to load game:", error);
    return null;
  }
  return data;
}

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from("game_leaderboard")
    .select("*")
    .order("avg_rating", { ascending: false });
  if (error) {
    console.error("Failed to load leaderboard:", error);
    return [];
  }
  return data;
}

// admin only (enforced by RLS too)
export async function createGame(game) {
  return supabase.from("games").insert([game]).select().single();
}
export async function updateGame(id, patch) {
  return supabase.from("games").update(patch).eq("id", id).select().single();
}
export async function deleteGame(id) {
  return supabase.from("games").delete().eq("id", id);
}

// ---------- game requests (admin only, enforced by RLS) ----------
export async function fetchGameRequests() {
  const { data, error } = await supabase
    .from("game-reqs")
    .select("*")
    .order("id", { ascending: false });
  if (error) {
    console.error("Failed to load game requests:", error);
    return [];
  }
  return data;
}

export async function deleteGameRequest(id) {
  return supabase.from("game-reqs").delete().eq("id", id);
}

// ---------- reviews ----------
export async function fetchReviews(gameId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, user_id, profiles(username, role)")
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load reviews:", error);
    return [];
  }
  return data;
}

export async function upsertReview({ gameId, userId, rating, body }) {
  return supabase
    .from("reviews")
    .upsert([{ game_id: gameId, user_id: userId, rating, body }], { onConflict: "game_id,user_id" })
    .select()
    .single();
}

// ---------- favorites ----------
export async function fetchFavoriteGameIds(userId) {
  const { data, error } = await supabase.from("favorites").select("game_id").eq("user_id", userId);
  if (error) {
    console.error("Failed to load favorites:", error);
    return [];
  }
  return data.map((row) => row.game_id);
}

export async function addFavorite(userId, gameId) {
  return supabase.from("favorites").insert([{ user_id: userId, game_id: gameId }]);
}

export async function removeFavorite(userId, gameId) {
  return supabase.from("favorites").delete().eq("user_id", userId).eq("game_id", gameId);
}

// ---------- reports & moderation ----------
export async function fileReport({ reporterId, reportedUserId, reviewId = null, reason }) {
  return supabase
    .from("reports")
    .insert([{ reporter_id: reporterId, reported_user_id: reportedUserId, review_id: reviewId, reason }]);
}

// Staff (admin/owner) only — enforced by RLS.
export async function fetchReports() {
  const { data, error } = await supabase
    .from("reports")
    .select("id, reason, status, created_at, reported_user_id, reviewer:reporter_id(username), reported:reported_user_id(username, role)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load reports:", error);
    return [];
  }
  return data;
}

export async function updateReportStatus(id, status) {
  return supabase.from("reports").update({ status }).eq("id", id);
}

// Owner only — enforced by RLS.
export async function banUser(userId, reason) {
  return supabase.from("profiles").update({ banned: true, banned_reason: reason }).eq("id", userId);
}

export async function unbanUser(userId) {
  return supabase.from("profiles").update({ banned: false, banned_reason: null }).eq("id", userId);
}

// Auto-run nav injection on every page that imports this module.
document.addEventListener("DOMContentLoaded", renderAuthNav);

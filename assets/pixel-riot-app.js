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
    .select("id, username, is_admin")
    .eq("id", session.user.id)
    .single();
  if (error) {
    console.error("Failed to load profile:", error);
    return null;
  }
  return { ...data, email: session.user.email };
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
    links.push({ href: rootPath("account.html"), label: `Hi, ${profile.username}` });
    if (profile.is_admin) links.push({ href: rootPath("admin.html"), label: "Admin" });
    links.push({ href: "#", label: "Log Out", action: "logout" });
  } else {
    links.push({ href: rootPath("login.html"), label: "Log In" });
    links.push({ href: rootPath("signup.html"), label: "Sign Up", highlight: true });
  }
  return links;
}

// Injects auth-aware links into every <nav> on the page inside an element with
// [data-auth-nav-slot]. If no slot exists, appends one to the first nav's inner container.
export async function renderAuthNav() {
  const slots = document.querySelectorAll("[data-auth-nav-slot]");
  const targets = slots.length
    ? slots
    : (() => {
        const nav = document.querySelector("nav");
        if (!nav) return [];
        const container = nav.querySelector("div") || nav;
        const slot = document.createElement("div");
        slot.className = "flex items-center gap-4 text-sm font-semibold";
        slot.setAttribute("data-auth-nav-slot", "");
        container.appendChild(slot);
        return [slot];
      })();

  const links = await buildAuthNavLinks();
  const html = links
    .map((link) => {
      if (link.action === "logout") {
        return `<a href="#" data-nav-logout class="hover:text-cyan-400">${escapeHtml(link.label)}</a>`;
      }
      const cls = link.highlight
        ? "px-4 py-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400"
        : "hover:text-cyan-400";
      return `<a href="${link.href}" class="${cls}">${escapeHtml(link.label)}</a>`;
    })
    .join("");

  targets.forEach((slot) => {
    slot.innerHTML = html;
  });

  document.querySelectorAll("[data-nav-logout]").forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut();
      window.location.href = rootPath("home/");
    });
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

// ---------- reviews ----------
export async function fetchReviews(gameId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, user_id, profiles(username)")
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

// Auto-run nav injection on every page that imports this module.
document.addEventListener("DOMContentLoaded", renderAuthNav);

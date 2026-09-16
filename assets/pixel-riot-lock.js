// PIXEL-RIOT private-site gate. Only accounts explicitly marked authorized may enter protected pages.
import { getProfile, rootPath } from "/assets/pixel-riot-app.js?v=20260916-3";

const path = window.location.pathname.replace(/\\/+$/, "") || "/";
const publicPaths = ["/", "/login.html", "/signup.html"];
if (!publicPaths.includes(path)) {
  const profile = await getProfile();
  if (!profile || (profile.role !== "owner" && profile.authorized !== true)) {
    window.location.replace(rootPath("login.html?unauthorized=1"));
  }
}

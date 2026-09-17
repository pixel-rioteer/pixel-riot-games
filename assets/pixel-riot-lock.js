// PIXEL-RIOT protected-page gate. Only explicitly authorized accounts may enter protected pages.
import { requireAuthorized } from "/assets/pixel-riot-app.js?v=20260917-2";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const publicPaths = ["/", "/login.html"];

if (!publicPaths.includes(path)) {
  await requireAuthorized("/login.html");
}

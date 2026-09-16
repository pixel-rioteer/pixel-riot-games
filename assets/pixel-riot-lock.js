// Temporary lock: while the site is in a "coming soon" phase, every page except the
// homepage (/) and /login.html redirects anyone who isn't staff (admin/owner) back to /.
// Remove the <script type="module" src="/assets/pixel-riot-lock.js"> tag from a page's
// <head> to lift the lock on that page once you're ready to launch it publicly.
// The version query intentionally busts stale browser/CDN module caches after auth changes.
import { getProfile, rootPath } from "/assets/pixel-riot-app.js?v=20260916-2";

const profile = await getProfile();
if (!profile || !profile.is_admin) {
  window.location.replace(rootPath(""));
}

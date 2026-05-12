const PixelRiot = (() => {
  const accountKey = 'pixelRiotUsername';

  function getUsername() {
    return localStorage.getItem(accountKey) || '';
  }

  function setUsername(username) {
    localStorage.setItem(accountKey, username.trim());
  }

  function reviewKey(game) {
    return `pixelRiotReviews:${game}`;
  }

  function getReviews(game) {
    try {
      return JSON.parse(localStorage.getItem(reviewKey(game)) || '[]');
    } catch {
      return [];
    }
  }

  function saveReview(game, review) {
    const reviews = getReviews(game);
    reviews.unshift(review);
    localStorage.setItem(reviewKey(game), JSON.stringify(reviews.slice(0, 12)));
  }

  function renderAccountWidgets() {
    const username = getUsername();
    document.querySelectorAll('[data-account-name]').forEach((node) => {
      node.textContent = username ? `Signed in as ${username}` : 'No account yet';
    });
    document.querySelectorAll('[data-username-field]').forEach((field) => {
      if (username && !field.value) field.value = username;
    });
  }

  function setupAccountForm() {
    const form = document.querySelector('[data-account-form]');
    if (!form) return;

    const input = form.querySelector('[name="username"]');
    const message = form.querySelector('[data-account-message]');
    input.value = getUsername();

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const username = input.value.trim();
      if (username.length < 3) {
        message.textContent = 'Choose a username with at least 3 characters.';
        return;
      }
      setUsername(username);
      message.textContent = `Account ready. Welcome, ${username}.`;
      renderAccountWidgets();
    });
  }

  function stars(rating) {
    return `${rating} ${'&#9733;'.repeat(Number(rating))}`;
  }

  function renderReviews(game) {
    const list = document.querySelector('[data-review-list]');
    if (!list) return;

    const reviews = getReviews(game);
    if (!reviews.length) {
      list.innerHTML = '<p class="text-gray-400">No player reviews yet. Be the first to add one.</p>';
      return;
    }

    list.innerHTML = reviews.map((review) => `
      <article class="rounded-2xl border border-white/10 bg-black/40 p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <strong class="text-cyan-300">${escapeHtml(review.username)}</strong>
          <span class="text-cyan-300 font-black">${stars(review.rating)}</span>
        </div>
        <p class="mt-3 text-gray-300 leading-relaxed">${escapeHtml(review.text)}</p>
      </article>
    `).join('');
  }

  function setupReviewForm() {
    const form = document.querySelector('[data-review-form]');
    if (!form) return;

    const game = form.dataset.reviewGame;
    const usernameInput = form.querySelector('[name="username"]');
    const message = form.querySelector('[data-review-message]');
    if (getUsername() && usernameInput) usernameInput.value = getUsername();

    renderReviews(game);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const username = String(formData.get('username') || '').trim();
      const rating = String(formData.get('rating') || '').trim();
      const text = String(formData.get('review') || '').trim();

      if (username.length < 3) {
        message.textContent = 'Add a username first.';
        return;
      }
      if (!rating) {
        message.textContent = 'Pick a star rating.';
        return;
      }
      if (text.length < 5) {
        message.textContent = 'Write a short review before submitting.';
        return;
      }

      setUsername(username);
      saveReview(game, { username, rating, text, createdAt: new Date().toISOString() });
      form.reset();
      usernameInput.value = username;
      message.textContent = 'Review added on this device.';
      renderAccountWidgets();
      renderReviews(game);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function init() {
    renderAccountWidgets();
    setupAccountForm();
    setupReviewForm();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PixelRiot.init);

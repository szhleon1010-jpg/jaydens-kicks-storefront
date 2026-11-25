document.addEventListener('DOMContentLoaded', () => {
  const descriptions = {
    koi:'Orange koi swim through cobalt waves inspired by Japanese woodblock prints.',
    galaxy:'Deep violet nebulae and bright stars sweep across black leather.',
    flame:'Electric blue flames and fine traces run across a black leather base.'
  };
  const main = document.querySelector('main');
  const detail = location.pathname.endsWith('/product.html');
  const designId = new URLSearchParams(location.search).get('design');
  const sizeRange = 'US men’s 5–14';
  const home = 'index.html';
  const nav = document.querySelector('nav');
  nav.innerHTML = '<a href="index.html#collection">Collection</a><a href="index.html#request">Custom</a><a href="index.html#reviews">Reviews</a>';
  const productLink = id => 'product.html?design=' + encodeURIComponent(id);
  const photo = id => '<div class="product art ' + id + '" role="img" aria-label="' + catalog[id].title + ' design mockup"></div>';
  const description = id => catalog[id].description || descriptions[id];
  if (detail) {
    document.querySelectorAll('.logo').forEach(link => link.href = home);
    main.innerHTML = '<a class="back" href="index.html#collection">← Back to collection</a>';
    if (!Object.hasOwn(catalog, designId)) {
      main.insertAdjacentHTML('beforeend','<h1>Design unavailable</h1>');
      return;
    }
    const design = catalog[designId];
    document.title = design.title + ' | Jayden’s Kicks';
    main.insertAdjacentHTML('beforeend', `
      <section class="detail">${photo(designId)}
        <div class="detail-copy"><p class="stock">Made to order</p><h1>${design.title}</h1>
        <p class="price">${money(design.price)}</p><p>${description(designId)}</p>
        <dl><dt>Color palette</dt><dd>${design.colors[0]}</dd><dt>Sizes</dt><dd>${sizeRange}, including half sizes</dd>
        <dt>Production</dt><dd>Estimated 2–3 weeks before shipping. Size availability and delivery date require confirmation.</dd></dl>
        <button class="button" id="detail-customize">Choose size and color ↗</button>
        <p class="fine">Sample price. Image is a design mockup.</p></div>
      </section><section class="review-section" id="reviews"><h2>Customer reviews<span>.</span></h2><div id="review-list"></div><a class="back" href="index.html#reviews">Write a review ↗</a></section>`);
    document.querySelector('#detail-customize').onclick = () => openProduct(designId);
  } else {
    document.querySelector('.section-head > p').textContent = 'Six designs. Sample pricing and lead times.';
    document.querySelector('#process li p').textContent = 'Browse six designs and pick your starting point.';
    document.querySelector('.grid').innerHTML = Object.entries(catalog).map(([id, design]) => `
      <article><a class="product-link" href="${productLink(id)}">${photo(id)}
        <div class="card-body"><div class="card-title"><h3>${design.title}</h3><strong>${money(design.price)}</strong></div>
        <p>${sizeRange}</p><div class="card-end"><span class="stock">Made to order</span><span>View details ↗</span></div></div>
      </a></article>`).join('');
    main.insertAdjacentHTML('beforeend', `
      <section class="studio-panel" id="request"><div><h2>Design your own<span>.</span></h2><p>Tell Jayden what you’d like painted, which colors to use, and when you need your pair.</p></div>
        <form id="request-form"><div class="fields"><label>Name<input name="name" autocomplete="name" required maxlength="80"></label><label>Email<input name="email" type="email" autocomplete="email" required maxlength="120"></label></div>
        <div class="fields"><label>US men’s size<select name="size" required>${configuration.elements.size.innerHTML}</select></label><label>Preferred colors<input name="colors" required maxlength="100"></label></div>
        <label>Design idea<textarea name="idea" rows="4" required maxlength="700"></textarea></label><label>Needed by (optional)<input name="date" type="date"></label>
        <p class="fine">Demonstration only. Use sample contact details. Your request will be saved to this website.</p>
        <button class="button">Submit custom request</button><p role="status" id="request-status"></p></form></section>
      <section class="studio-panel" id="reviews"><div><h2>Customer reviews<span>.</span></h2><div id="review-list"></div></div>
        <form id="review-form"><label>Display name<input name="name" maxlength="60" required></label>
        <div class="fields"><label>Design<select name="design" required>${Object.entries(catalog).map(([id, design]) => '<option value="' + id + '">' + design.title + '</option>').join('')}</select></label>
        <label>Rating<select name="rating" required><option value="">Choose a rating</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label></div>
        <label>Your review<textarea name="review" rows="3" maxlength="500" required></textarea></label><p class="fine">Reviews are public. Use a display name and leave out personal information.</p>
        <button class="button">Post review</button><p role="status" id="review-status"></p></form></section>`);
    document.querySelector('#request-form').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      await submitForm(form, document.querySelector('#request-status'), 'requests',
        Object.fromEntries(new FormData(form)), 'Custom request received. This is a demonstration');
    };
    document.querySelector('#review-form').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const result = await submitForm(form, document.querySelector('#review-status'), 'reviews',
        Object.fromEntries(new FormData(form)), 'Review published');
      if (result) renderReviews();
    };
  }
  async function renderReviews() {
    const list = document.querySelector('#review-list');
    list.textContent = 'Loading reviews…';
    try {
      const response = await fetch('/api/submissions?kind=reviews');
      if (!response.ok) throw new Error();
      const data = await response.json();
      const reviews = data.reviews.filter(review => Object.hasOwn(catalog, review.design) && (!detail || review.design === designId));
      list.replaceChildren();
      if (!reviews.length) list.textContent = 'Be the first to review a design.';
      for (const review of reviews) {
        const article = document.createElement('article');
        const author = document.createElement('strong');
        const body = document.createElement('p');
        author.textContent = review.name + ' · ' + review.rating + '/5 · ' + catalog[review.design].title;
        body.textContent = review.review;
        article.append(author, body);
        list.append(article);
      }
    } catch {
      list.textContent = 'Reviews are temporarily unavailable. Please refresh to try again.';
    }
  }
  renderReviews();
});

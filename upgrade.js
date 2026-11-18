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
        <p class="fine">Download a draft to share with Jayden. Online submission requires a studio contact destination.</p>
        <button class="button">Download custom request ↓</button><p role="status" id="request-status"></p></form></section>
      <section class="studio-panel" id="reviews"><div><h2>Customer reviews<span>.</span></h2><div id="review-list"></div></div>
        <form id="review-form"><label>Display name<input name="name" maxlength="60" required></label>
        <div class="fields"><label>Design<select name="design" required>${Object.entries(catalog).map(([id, design]) => '<option value="' + id + '">' + design.title + '</option>').join('')}</select></label>
        <label>Rating<select name="rating" required><option value="">Choose a rating</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label></div>
        <label>Your review<textarea name="review" rows="3" maxlength="500" required></textarea></label><p class="fine">Reviews are saved on this device.</p>
        <button class="button">Save review</button><p role="status" id="review-status"></p></form></section>`);
    document.querySelector('#request-form').onsubmit = event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const draft = ['Jayden’s Kicks custom request', 'Name: ' + data.name, 'Email: ' + data.email,
        'US men’s size: ' + data.size, 'Preferred colors: ' + data.colors, 'Design: ' + data.idea,
        'Needed by: ' + (data.date || 'Flexible')].join('\n');
      const url = URL.createObjectURL(new Blob([draft], {type:'text/plain;charset=utf-8'}));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jaydens-kicks-custom-request.txt';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.querySelector('#request-status').textContent = 'Your draft is ready to share.';
    };
    document.querySelector('#review-form').onsubmit = event => {
      event.preventDefault();
      const status = document.querySelector('#review-status');
      const review = Object.fromEntries(new FormData(event.currentTarget));
      review.name = review.name.trim();
      review.review = review.review.trim();
      if (!review.name || !review.review) {
        status.textContent = 'Enter your name and review.';
        return;
      }
      try {
        localStorage.setItem(reviewKey, JSON.stringify([review, ...readReviews()]));
      } catch {
        status.textContent = 'Your browser could not save this review.';
        return;
      }
      event.currentTarget.reset();
      status.textContent = 'Review saved on this device.';
      renderReviews();
    };
  }
  const reviewKey = 'jaydens-kicks-reviews-v1';
  function readReviews() {
    try {
      const reviews = JSON.parse(localStorage.getItem(reviewKey) || '[]');
      return Array.isArray(reviews) ? reviews.filter(review => review && Object.hasOwn(catalog, review.design)) : [];
    } catch { return []; }
  }
  function renderReviews() {
    const list = document.querySelector('#review-list');
    const reviews = readReviews().filter(review => !detail || review.design === designId);
    list.replaceChildren();
    if (!reviews.length) list.textContent = 'No reviews saved on this device yet.';
    for (const review of reviews) {
      const article = document.createElement('article');
      const author = document.createElement('strong');
      const body = document.createElement('p');
      author.textContent = review.name + ' · ' + review.rating + '/5 · ' + catalog[review.design].title;
      body.textContent = review.review;
      article.append(author, body);
      list.append(article);
    }
  }
  renderReviews();
});


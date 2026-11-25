'use strict';
const catalog = {
  koi: {title:'Koi Fish Edition', price:185, colors:['White / Cobalt / Orange','Request a custom palette']},
  galaxy: {title:'Galaxy Edition', price:195, colors:['Black / Violet','Request a custom palette']},
  flame: {title:'Flame Edition', price:175, colors:['Black / Electric Blue','Request a custom palette']}
};
Object.assign(catalog, {
    jade: {title:'Jade Garden Edition', price:185, colors:['White / Jade Green','Request a custom palette'], description:'Hand-painted jade vines climb across white leather.'},
    sunset: {title:'Afterglow Edition', price:190, colors:['Cream / Ember / Plum','Request a custom palette'], description:'A sunset gradient blends ember orange into deep plum.'},
    storm: {title:'Silver Storm Edition', price:195, colors:['Charcoal / Silver / Teal','Request a custom palette'], description:'Silver lightning and fine teal traces cut across charcoal leather.'}
  });
const $ = s => document.querySelector(s);
const custom = $('#custom'), checkout = $('#checkout'), configuration = $('#custom-form'), order = $('#order-form');
const currency = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const money = n => currency.format(n);
const key = 'jaydens-kicks-v1';
let bag = [], selected, timer;
try {
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  if (Array.isArray(saved)) bag = saved.filter(item => item && Object.hasOwn(catalog,item.design));
} catch {}
for(let s = 5; s <= 14; s += .5) configuration.elements.size.add(new Option(String(s),String(s)));
function save(){
  try {localStorage.setItem(key, JSON.stringify(bag));} catch {}
  $('#count').textContent = bag.length;
}
function toast(message){
  const node = $('#toast');
  node.textContent = message;
  node.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => node.hidden = true, 2800);
}
function openProduct(id) {
  selected = id;
  const design = catalog[selected];
  configuration.reset();
  $('#design-title').textContent = design.title;
  $('#design-info').textContent = 'Made to order · Sample production time: 2–3 weeks before shipping.';
  $('#design-price').textContent = money(design.price);
  configuration.elements.color.replaceChildren(...design.colors.map(color => new Option(color,color)));
  custom.showModal();
}
configuration.addEventListener('submit', event => {
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(configuration));
  bag.push({design:selected,...fields});
  save();
  custom.close();
  toast('Pair added to your bag.');
});
function renderBag(){
  const items = $('#items');
  items.replaceChildren();
  bag.forEach((item,index) => {
    const row = document.createElement('div'), details = document.createElement('div');
    const title = document.createElement('b'), note = document.createElement('small'), remove = document.createElement('button');
    title.textContent = catalog[item.design].title + ' · ' + money(catalog[item.design].price);
    note.textContent = 'US ' + item.size + ' · ' + item.color + (item.notes ? ' · ' + item.notes : '');
    details.append(title,note);
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label','Remove pair ' + (index+1) + ' from bag');
    remove.onclick = () => {bag.splice(index,1);save();renderBag();(items.querySelector('button') || checkout.querySelector('[data-close]')).focus();};
    row.className = 'item';
    row.append(details,remove);
    items.append(row);
  });
  order.hidden = !bag.length;
  if(!bag.length) items.textContent = 'Your bag is empty. Choose a design to get started.';
  $('#total').textContent = money(bag.reduce((sum,item) => sum+catalog[item.design].price,0));
  $('#order-status').textContent = '';
}
$('[data-bag]').onclick = () => {renderBag();checkout.showModal();};
document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => button.closest('dialog').close());
order.addEventListener('submit', async event => {
  event.preventDefault();
  if (!bag.length) return;
  const result = await submitForm(order, $('#order-status'), 'orders',
    {...Object.fromEntries(new FormData(order)), items:bag},
    'Demo order placed. Payment simulated. No money was charged');
  if (result) {
    bag = [];
    save();
    $('#items').textContent = 'Your demonstration order was received.';
    order.querySelector('button.button').hidden = true;
  }
});
save();

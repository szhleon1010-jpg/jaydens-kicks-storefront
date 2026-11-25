const { randomUUID } = require('node:crypto');
const prices = {koi:185, galaxy:195, flame:175, jade:185, sunset:190, storm:195};
const endpoint = 'https://vercel.com/api/blob';
function headers() {
  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN;
  if (!token) throw new Error('Storage unavailable');
  return {
    authorization: 'Bearer ' + token,
    'x-api-version': '13',
    'x-vercel-blob-store-id': process.env.BLOB_STORE_ID || 'store_1wdSuZr0CISBuxSt'
  };
}
function text(value, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error('Invalid field');
  return value.trim();
}
function size(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 5 || number > 14 || number * 2 % 1) throw new Error('Invalid size');
  return String(number);
}
async function storage(url, options = {}) {
  const response = await fetch(url, {...options, headers:{...headers(), ...options.headers}});
  if (!response.ok) throw new Error('Storage request failed');
  return response.json();
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const kind = req.query.kind;
  if (!['reviews','requests','orders'].includes(kind)) return res.status(404).json({error:'Not found'});
  try {
    if (req.method === 'GET' && kind === 'reviews') {
      const listing = await storage(endpoint + '?prefix=reviews%2F&limit=1000');
      const latest = listing.blobs.sort((a,b) => b.uploadedAt.localeCompare(a.uploadedAt)).slice(0,100);
      const reviews = await Promise.all(latest.map(blob => storage(blob.url)));
      return res.status(200).json({reviews});
    }
    if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({error:'Invalid origin'});
    if (!req.headers['content-type']?.startsWith('application/json')) return res.status(415).json({error:'JSON required'});
    const body = req.body;
    if (!body || JSON.stringify(body).length > 16000) return res.status(400).json({error:'Invalid submission'});
    let record;
    try {
      if (kind === 'reviews') {
        if (!prices[body.design] || ![1,2,3,4,5].includes(Number(body.rating))) throw new Error();
        record = {name:text(body.name,60), design:body.design, rating:Number(body.rating), review:text(body.review)};
      } else if (kind === 'requests') {
        const email = text(body.email,120);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error();
        record = {name:text(body.name,80), email, size:size(body.size), colors:text(body.colors,100), idea:text(body.idea,700), date:typeof body.date === 'string' ? body.date.slice(0,10) : ''};
      } else {
        if (!Array.isArray(body.items) || !body.items.length || body.items.length > 20) throw new Error();
        const items = body.items.map(item => {
          if (!prices[item.design]) throw new Error();
          return {design:item.design, size:size(item.size), color:text(item.color,100), notes:typeof item.notes === 'string' ? item.notes.slice(0,300) : '', price:prices[item.design]};
        });
        const shipping = {};
        for (const field of ['name','email','address','city','postal','country']) shipping[field] = text(body[field],150);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) throw new Error();
        record = {items, shipping, total:items.reduce((sum,item) => sum + item.price,0), payment:'Simulated card payment', status:'Demo order received'};
      }
    } catch {
      return res.status(400).json({error:'Please check all required fields.'});
    }
    const id = randomUUID();
    const data = {...record, id, createdAt:new Date().toISOString(), demonstration:true};
    await storage(endpoint + '/?pathname=' + encodeURIComponent(kind + '/' + id + '.json'), {
      method:'PUT',
      headers:{'x-vercel-blob-access':'private','x-add-random-suffix':'0','x-content-type':'application/json'},
      body:JSON.stringify(data)
    });
    return res.status(201).json({id});
  } catch (error) {
    console.error('Submission storage failed', error.message);
    return res.status(503).json({error:'Unable to save right now. Please try again.'});
  }
};



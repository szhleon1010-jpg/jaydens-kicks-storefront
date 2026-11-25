# Jayden’s Kicks school demonstration

The frontend uses HTML, CSS, and native JavaScript. The Vercel JavaScript function at api/submissions.js saves requests, demo orders, and public reviews to private Vercel Blob storage.

Production is https://jaydens-kicks.vercel.app.

Run on Vercel with the connected private Blob store. This version needs the Vercel API and cannot submit forms from a file URL or static-only hosting. Credentials stay in Vercel environment settings. Never commit .env files.

Checkout uses a fixed sample card and simulates payment. Use fictional shipping and contact details. Shipping and tax are not calculated. Requests and orders are stored as separate private records with reference IDs. Reviews are publicly readable through the API, limited to the latest 100 records from the first 1,000 stored reviews. This school demo has no moderation dashboard or email notifications.

The product prices and availability are examples. Sneaker images are generated design mockups.

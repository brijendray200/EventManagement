# EventSphere Deployment Guide

## 1. Required services

- MongoDB
- Razorpay live account
- Cloudinary account
- SMTP provider
- A Linux VPS or cloud VM with Node.js, PM2, and Nginx

## 2. Environment variables

Frontend:

- Copy [`.env.example`](/C:/Users/brije/OneDrive/Documents/EventManagement/.env.example) to `.env`
- Set `VITE_API_URL` to your public API URL

Backend:

- Copy [`server/.env.example`](/C:/Users/brije/OneDrive/Documents/EventManagement/server/.env.example) to `server/.env`
- Fill MongoDB, JWT, Razorpay, Cloudinary, SMTP, and domain values

## 3. Local production build check

Frontend:

```bash
npm install
npm run build
```

Backend:

```bash
cd server
npm install
npm run build
```

## 4. Docker

```bash
docker compose up --build -d
```

This starts:

- MongoDB on `27017`
- Backend on `5000`
- Frontend on `5173`

## 5. PM2

Use [`ecosystem.config.cjs`](/C:/Users/brije/OneDrive/Documents/EventManagement/ecosystem.config.cjs)

```bash
cd server
npm run pm2:start
```

## 6. Nginx

Use [`nginx.conf`](/C:/Users/brije/OneDrive/Documents/EventManagement/nginx.conf) as reverse proxy base.

Route plan:

- `/` -> frontend
- `/api` -> backend
- `/socket.io` -> backend websocket server

## 7. SSL

Recommended with Certbot:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 8. Final live checklist

- Production domain resolves correctly
- HTTPS works
- `COOKIE_SECURE=true` in backend env
- `COOKIE_SAME_SITE=none` if frontend and backend are on different subdomains
- Razorpay webhook configured to `/api/payments/webhooks/razorpay`
- Cloudinary upload signature endpoint working
- SMTP password reset mail verified
- Login, refresh token, logout tested
- Booking payment success/failure tested
- Ad payment tested
- Contact form tested
- AI endpoints tested
- Organizer and admin dashboards tested

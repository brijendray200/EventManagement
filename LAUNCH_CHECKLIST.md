# EventSphere Launch Checklist

## Core

- Frontend build passes
- Backend build passes
- MongoDB connected
- Health endpoint `/health` returns success

## Auth

- Register works
- Login works
- Refresh token rotation works
- Logout clears cookies
- Forgot password email works
- Reset password link works

## Media

- Event image upload works
- Ad creative upload works
- Profile avatar upload works

## Payments

- Razorpay order creation works
- Frontend verification works
- Webhook signature verified
- Booking gets confirmed
- Ad gets activated

## AI

- `/api/ai/chat` works
- `/api/ai/recommendations` works
- `/api/ai/event-summary/:id` works
- `/api/ai/organizer-insights` works

## Infra

- Docker compose works
- PM2 apps start
- Nginx reverse proxy works
- SSL installed
- Domain DNS configured
- CI workflow green

# Stagepass — Customer Web (Next.js)

Customer side of the Event Ticket Booking Platform, built from the canvas designs.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Screens → routes

| # | Screen | Route | Type |
|---|---|---|---|
| 1 | Home | `/` | Server |
| 2 | Event listing + filters | `/events?category=&city=&max=&sort=&q=` | Server (GET-form filters) |
| 3 | Event details | `/events/[id]` | Server |
| 4 | Waiting room | `/events/[id]/queue` | Server |
| 5 | Seat selection | `/events/[id]/seats` | Server + `SeatMap` client |
| 6 | Checkout | `/checkout?event=&seats=` | Server + `CheckoutForm` client |
| 7 | Payment | `/checkout/payment?event=&seats=` (`&status=failed` shows the error state) | Server + `PaymentForm` client |
| 8 | Booking confirmed | `/booking/[id]?event=&seats=` | Server |
| 9 | My Tickets | `/tickets` | Server + `TicketsTabs` client |
| 10 | Sign in / Register | `/login`, `/register` | `AuthCard` client |
| 11 | Profile | `/profile` | Server |

Try the full flow: Home → an event → **Book now** → pick seats → **Hold seats & continue** → tick terms → **Continue to payment** → **Pay**.
The `[Music Festival]` event goes through the waiting room first.

## Project structure

```
src/
  app/                 # routes (see table above)
  components/
    Header.tsx         # Logo, Header, Footer, Avatar
    EventCard.tsx      # EventCard (grid) + EventRow (list)
    SeatMap.tsx        # live seat map, selection, max 6, hold & continue
    HoldTimer.tsx      # 10-min countdown (matches Redis TTL)
    CheckoutSteps.tsx  CheckoutForm.tsx  PaymentForm.tsx  OrderSummary.tsx
    TicketsTabs.tsx  AuthCard.tsx  QrCode.tsx  icons.tsx
  lib/
    types.ts           # EventItem, Tier, Seat, Booking …
    api.ts             # ← pages call ONLY this. Swap mocks for fetch() here
    mock-data.ts       # fake events, seat map, bookings
    order.ts           # rebuilds an order draft from ?event=&seats=
    format.ts          # formatLKR, param helpers
  app/globals.css      # design tokens (@theme) — same palette as the designs
```

## Connecting the Spring Boot backend

1. Add `.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
2. Replace the mock returns in `src/lib/api.ts` with `fetch` calls (endpoint list is in that file).
3. Look for `TODO (backend)` comments — each one says which endpoint replaces the mock:
   - `SeatMap` → WebSocket `/topic/event/{id}/seats` + `POST /holds`
   - `CheckoutForm` → `POST /orders` (personal data in the body, not the URL)
   - `PaymentForm` → gateway session + poll order status after the webhook
   - `queue/page.tsx` → queue position + admission token
   - `AuthCard` → `/auth/login`, `/auth/register`, Google OAuth2
4. Once orders exist on the backend, switch `?event=&seats=` to `?order={orderId}` in `lib/order.ts`.

## Notes

- Prices, artist names and venues are `[placeholders]`.
- Fonts (DM Sans, Space Grotesk) load through `next/font/google`, so the first build needs internet.
- `QrCode.tsx` is a placeholder graphic — use `qrcode.react` with the signed ticket token later.

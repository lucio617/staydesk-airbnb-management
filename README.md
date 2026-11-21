# Staydesk

Private guest check-in and booking management built with React, Vinext, Cloudflare D1 and R2.

## Run locally
Use Node 22.13 or newer.
Install with `npm run install:ci`, then `npm run build`.
Apply the generated migration once:
`node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_typical_warbound.sql`
Start `npm run dev`. Use the printed localhost URL.
The local development server simulates ChatGPT sign-in for loopback only. Hosted authentication is managed by Sites. No shared password or public signup is configured.

## Features
Private login, booking CRUD, per-guest details, guest count, ID attachments, document deletion/download, payments, status changes, room readiness, search, calendar, and guest register.
The database and uploaded documents persist server-side. Local and deployed databases are separate.
Dates use Asia/Kolkata and amounts use INR. Booking data is entered manually; no Airbnb channel synchronization or payment collection is configured.
ID uploads accept JPEG, PNG and PDF up to 8 MB, require recorded guest consent and are authorized by owner. Deleting a booking deletes its attachments.

## Deployment
The Sites manifest contains the project ID and D1/R2 bindings. Preserve migrations and manifest in source. Build with the Sites build helper, package and publish through Sites.
See design.md for the visual and interaction specification.

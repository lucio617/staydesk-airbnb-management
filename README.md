# Staydesk

Staydesk keeps booking and guest details in Supabase Postgres and Aadhaar attachments in a private Supabase Storage bucket. Requests pass through the signed-in owner's booking API. The existing ChatGPT sign-in flow is used for owner identity.

## Configure Supabase

1. In your own Supabase project, run `supabase/migrations/202611210001_staydesk.sql` once in the SQL Editor. This creates both tables and the private document bucket. The tables must be available through the project's Data API.
2. Create a local `.dev.vars` file beside `package.json` using the project URL and a server secret from Supabase project settings.

   ```dotenv
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_REPLACE_ME
   ```

3. With Node 22.13 or newer, run `npm run install:ci` then `npm run dev`. Open the localhost address printed by the server. The local development server simulates sign-in for loopback. Use a separate Supabase project for test records.

The server key belongs in server-side configuration only. Git ignores `.dev.vars`. In a hosted runtime, configure the same two names as worker bindings and use a trusted authentication gateway that sets the authenticated user headers.

## Existing records

Changing the storage provider affects future saves in this version. Existing Cloudflare D1 rows and R2 files require a separate transfer. Preserve booking IDs, owner IDs, document IDs and the object keys referenced by the document rows. Verify booking counts and attachment downloads under the original owner's identity before deleting source data.

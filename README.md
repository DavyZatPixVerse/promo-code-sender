# PixVerse Creator Promo Codes

Invitees enter the email on their invitation and receive their assigned promo code. The lookup is case insensitive. An assignment can be looked up again; actual redemption and usage limits are managed by PixVerse.

## Local preview

Use Node.js 22. Copy the dummy configuration and start the local server:

```sh
cp .env.example .env.local
npm run dev
```

Open http://127.0.0.1:4173 and try `creator@example.com`. It returns the dummy code `DEMO-PVX-2026`. There are no package dependencies.

## Deploy to Vercel

1. Import this repository into Vercel. Use **Other** for the framework preset and the directory containing `vercel.json` as the project root. No build command is required.
2. In **Settings → Environment Variables**, add `PROMO_CODES_JSON` to **Production**, preferably as a sensitive variable. Paste the JSON object without surrounding shell quotes. Example (dummy data only):

   ```json
   {"creator@example.com":"DEMO-PVX-2026","another@example.com":"DEMO-PVX-2027"}
   ```

3. Deploy or redeploy after editing the variable. Test with an assigned email and an unassigned email before sharing the production URL.

Keep real assignments in Vercel or in the ignored local `.env.local` file. Each email and each code must be unique. Use a separate dummy list for preview deployments. For a large list, move the assignments to a server-side datastore rather than relying on environment variable capacity.

Entering an email does not verify ownership: someone who knows an invited address can retrieve its code. If that is unacceptable for a campaign, add an emailed verification link or one-time password before launch.

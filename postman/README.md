# Postman

1. **Import:** Postman → **Import** → `MomentsMatter-API.postman_collection.json`
2. **Variables:** Open the collection → **Variables** tab:
   - `base_url` — API base (default `http://localhost:3000`)
   - `firebase_token` — Firebase **ID token** (see below)
   - `moment_id` — from **Analyze** response → `moments[0].id`
   - `upload_id` — from **Analyze** response → `uploadId`
3. **Firebase token:** In your React app after login, call `await user.getIdToken()` and paste the string into `firebase_token`.

All requests use the collection’s **Bearer** auth (inherits to each request).

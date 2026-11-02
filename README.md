# Geo Quiz

Sporcle-style geography quizzes for a group of friends, with accounts and per-quiz leaderboards.

- **Countries of the World**: name all 197 countries on a zoomable world map.
- **Flags of the World**: name the country for each flag, with streak scoring.
- **Capitals of the World**, plus one capitals quiz per continent (Africa, Asia, Europe, North America, South America, Oceania).
- **Danish Actors**: name the actor or actress in each photo. The admin uploads the photos on the Settings page.

It is built with Vite, React and TypeScript, hosted free on GitHub Pages, and uses Supabase for logins and scores.

---

## Setup

Allow about 15 minutes. You need a GitHub account and a free Supabase account.

### 1. Create the Supabase project

1. Go to <https://supabase.com>, sign in and click **New project**.
2. Pick a name (e.g. `geo-quiz`), a database password (you won't need it again) and the region closest to you. Then create the project and wait until it's ready.

### 2. Configure authentication

In the Supabase dashboard, open **Authentication → Sign In / Providers** (under *Configuration* in the left menu). Don't open the Email provider itself; the settings you need are on the page.

1. In the **User Signups** section at the top, make sure **Allow new users to sign up** is on.
2. In the same section, turn **Confirm email** **off** and click **Save changes**. Accounts use hidden fake addresses (`<username>@geoquiz.local`) that can't receive mail, so confirmation must be off.
3. Further down, under **Auth Providers**, check that **Email** says *Enabled* (it is by default).

The Email provider's own panel (with "Secure email change") doesn't need any changes.

Optionally, under **Authentication → URL Configuration**, set **Site URL** to your future site address, `https://<your-github-user>.github.io/<repo-name>/`. Nothing depends on it, but it keeps Supabase tidy.

### 3. Run the database migration

1. Open `supabase/migration.sql` and check the two values near the top:
   - `select lower('Radmud')`: the admin's username. The account with this name (any capitalisation) becomes the admin.
   - `'change-me'`: the first invite code. You can also change it later on the Settings page.
2. In Supabase, open **SQL Editor → New query**, paste the whole file and click **Run**. It should finish without errors (a few "already exists, skipping" notices on later runs are fine).

The migration is safe to run again later, for example after editing it.

### 4. Copy your API keys

You need two values:

- **Project URL**, like `https://abcdefgh.supabase.co`. Find it under **Project Settings → Data API**, or via the **Connect** button at the top of the dashboard. You can also build it yourself: it's `https://<project-id>.supabase.co`, where the project ID is the code in your dashboard address (`supabase.com/dashboard/project/<project-id>`) and is also shown under **Project Settings → General**.
- **Publishable key** (`sb_publishable_…`) from **Project Settings → API Keys**. The older **anon public** key (on the *Legacy API keys* tab) also works.

Both values are meant to be public: they end up in the website's JavaScript. The database is protected by the row-level security rules in the migration. **Never** use the `service_role` / secret key here.

### 5. Put the code on GitHub

1. Create a new repository on GitHub, e.g. `geo-quiz`. It can be public or private; Pages works for public repos on the free plan.
2. Push this folder to it:

   ```bash
   cd geo-quiz
   git init
   git add .
   git commit -m "Geo Quiz"
   git branch -M main
   git remote add origin https://github.com/<your-github-user>/geo-quiz.git
   git push -u origin main
   ```

### 6. Add the keys to GitHub

In the repository on GitHub, open **Settings → Secrets and variables → Actions**.

On the **Secrets** tab, add two repository secrets:

| Name                     | Value                                |
| ------------------------ | ------------------------------------ |
| `VITE_SUPABASE_URL`      | your Project URL                     |
| `VITE_SUPABASE_ANON_KEY` | your anon / publishable key          |

On the **Variables** tab, add:

| Name                  | Value    |
| --------------------- | -------- |
| `VITE_ADMIN_USERNAME` | `Radmud` |

`VITE_ADMIN_USERNAME` only controls when the Settings link appears; the database decides who is really admin. Optionally you can add `VITE_AUTH_EMAIL_DOMAIN` if you want a different fake-email domain than `geoquiz.local`. Pick it before anyone signs up, and never change it afterwards.

### 7. Turn on GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open the **Actions** tab. If the first run failed because Pages wasn't enabled yet, click it and choose **Re-run all jobs**. Otherwise push any change to `main`.

When the workflow is green, the site is live at `https://<your-github-user>.github.io/<repo-name>/`. Every push to `main` runs the tests, builds and redeploys.

### 8. First login

1. Open the site, choose **Create account**, and sign up as **Radmud** with the invite code from step 3. Do this first, so nobody else can claim the admin name.
2. You'll see **Settings** in the top bar. There you can set time limits, leaderboard size and mode, and the invite code.
3. Send your friends the link and the invite code.

---

## Local development

```bash
npm install
cp .env.example .env.local    # fill in the Supabase values, or leave them empty
npm run dev                   # http://localhost:5173
npm test                      # unit tests (answer matching, scoring, map data, ...)
npm run build                 # type-check + production build into dist/
```

If the Supabase values are empty, the app runs in **local mode**: accounts, scores and settings are stored in your browser only. This is handy for trying things out without a database. In local mode the invite code is `letmein`, and the admin is whoever signs up as `VITE_ADMIN_USERNAME`.

Tip: after the first `npm install`, commit `package-lock.json`. GitHub Actions will then use the faster, reproducible `npm ci`.

---

## How it works

### Accounts

- Users only ever see a username and password. Behind the scenes, `Radmud` signs in to Supabase as `radmud@geoquiz.local`, so usernames are case-insensitive.
- Usernames are 3–20 letters, numbers or underscores.
- The invite code is checked twice:
  - in the sign-up form, through `check_signup()`, to give a friendly message;
  - in a database trigger on `auth.users`, which rejects any account without a valid code. Calling the Supabase API directly doesn't get around it.
- Changing the invite code doesn't affect existing accounts.
- Sessions persist across visits. Logging out only logs out the current device.

### Accepted answers

All country data is in **`src/data/countries.ts`**: names, aliases, continent, capitals, capital spellings, flag code and map id. Edit it freely; the comments at the top explain each field and the continent choices.

Before comparing, answers are normalized: case, accents, punctuation, hyphens, apostrophes and spaces are ignored, a leading "the" is dropped, "&" equals "and", and "St"/"St." equals "Saint". So you only need to add genuinely different names as aliases, not spelling variants of the same one. There is deliberately no typo tolerance.

**Two-word names must be typed in full.** "Saudi" doesn't count for Saudi Arabia, nor "Burkina", "Vatican" or "Dominican Rep". Abbreviations still work (UK, USA, KSA, RSA, DRC), and so do genuinely different names (Ivory Coast, Holy See, Swaziland). Names of three or more words can have short forms (Saint Vincent, Bosnia, São Tomé). A unit test enforces the rule, so an alias that breaks it stops the deploy. To allow a short form on purpose, like "Vatican", add it to `SHORT_FORM_EXCEPTIONS` in `src/data/countries.ts`.

**Countries quiz:** a country is accepted the instant its name is complete, Sporcle-style, and the box clears. If you were actually typing a longer name, you can just keep going:

- "Niger…ia" counts Niger and then Nigeria.
- "UK…raine" counts the UK and then Ukraine.
- Typing "USA" doesn't leave a stray "A" behind.

**Flags and Capitals:** the right answer is accepted the instant it's complete. A wrong answer is only marked wrong once it can't grow into a longer name. So "Guinea", "UK", "Niger" and "Dominica" are never marked wrong mid-word; you can always finish typing "Guinea-Bissau", "Ukraine", "Nigeria" or "Dominican Republic". If you really mean the short one, press **Enter** to have it checked.

**Capitals: outline or map.** On the admin Settings page, under *Capitals quizzes*, choose what's shown next to the country name:

- *Country outline* (default): the country's silhouette.
- *Map with the country highlighted*: a map of the continent (or the world, for Capitals of the World). The country in question is shown in yellow, small ones get a pulsing ring, answered countries turn green, and missed ones turn red at the end.

The setting applies to all seven capitals quizzes from the next game, and shares the same leaderboards. The continent framings are in `CONTINENT_VIEWS` at the top of `src/components/MapView.tsx`.

### Danish Actors

The 100 people are in **`src/data/people.ts`**, grouped into International, Present men, Present women, Comedians and revue, and Classics. You can edit names or add people there, but never change an `id` once a photo is uploaded: it's also the photo's file name.

**Photos.** On the Settings page, *Danish Actors photos* lists everyone. Click a card, or drop an image on it, to add or replace that person's photo; *Remove* deletes it. Large photos are shrunk to at most 720 px and saved as JPEG before upload. The photos sit in a private Supabase storage bucket (`people-photos`). Only logged-in players can see them, through links that expire after an hour, and only the admin can change them. Only people with a photo are asked, so you can add photos gradually.

**Accepted answers:**
- The full name. A first name or surname alone never counts, because the list has many shared names (Mikkelsen, Nielsen, Christensen, Kaas…).
- For names with three or more parts: the first name plus any one other part. "Sidse Babett" and "Sidse Knudsen" both work, and "Anders Berthelsen" works for Anders W. Berthelsen.
- Danish letters typed any way: ø = o = oe, å = a = aa, æ = ae. "Søren" = "Soren" = "Soeren", "Asbæk" = "Asbaek".
- Typing someone else's full name is wrong, even if that person has no photo yet. A name that could still grow into another one waits, as in Flags: "Nikolaj Lie" could become "Nikolaj Lie Kaas".

Scoring and leaderboards work exactly as in Flags. The "total" saved with a score is the number of people with a photo at the time.

### Scoring (Flags, Capitals and Danish Actors)

The numbers live in `src/lib/scoring.ts` (`SCORING`):

- points = round((100 + speed bonus) × streak multiplier)
- speed bonus = max(0, 100 − 10 × seconds since the prompt appeared)
- multiplier = 1 + 0.1 × (streak − 1), capped at 2.0

A wrong answer resets the streak. The prompt stays on screen and its clock keeps running. **Skip** (or **Tab**) resets the streak and sends the prompt to the back of the queue. Scores never go down.

### Leaderboards

- **Countries:** everyone who named all 197 countries comes first, fastest first. Everyone else follows, ranked by countries named, then by time.
- **Flags and Capitals:** ranked by score, then correct answers, then time. "Done in" shows the time when every prompt was answered before the limit.
- The admin chooses the number of rows and between "best score per player" and "all attempts".
- The admin can delete a score with the × next to it.
- Attempts with zero correct answers aren't saved.
- The ordering is implemented both in SQL (`get_leaderboard`, `get_rank`) and in TypeScript (`src/lib/ranking.ts`, used by local mode). Keep them in step if you change one.

### Map and flags

- `public/map/countries-50m.json` is Natural Earth 1:50m admin-0 countries (public domain), converted to TopoJSON by `scripts/build-map.mjs` in the same format as the `world-atlas` package.
- Kosovo has no ISO numeric code and gets the explicit id `XK`. Northern Cyprus and Somaliland are merged into Cyprus and Somalia. Antarctica is dropped.
- Small countries automatically get a circle marker so they can be seen and tapped.
- To rebuild the map from a newer Natural Earth release:
  ```bash
  node scripts/build-map.mjs path/to/ne_50m_admin_0_countries.geojson
  ```
- Flags are SVGs from [flag-icons](https://github.com/lipis/flag-icons) (MIT, license in `public/flags/LICENSE.txt`), bundled in `public/flags`. Nothing is hotlinked. `npm run copy:flags` re-copies them from the npm package.

### Database

`supabase/migration.sql` creates:

- `profiles`: one row per user, with `is_admin`.
- `settings`: time limits, leaderboard size and mode, and the capitals outline/map option. Readable by everyone; only the admin can update it.
- `settings_private`: the invite code. Admin only.
- `scores`: logged-in users can read all scores and insert only their own. Nobody can edit scores; the admin can delete them.
- Storage bucket `people-photos` (private): photos for Danish Actors. Logged-in users can view; only the admin can upload, replace or delete.

### Updating an existing installation

When an update adds something to the database, it comes with a small SQL file in `supabase/`. Run it once in the SQL Editor; each one is safe to run again. Re-running the whole `migration.sql` works too and keeps all accounts, scores and settings.

- `update-capitals-map.sql`: adds the capitals outline/map setting.
- `update-people-quiz.sql`: adds photo storage for Danish Actors and lets scores be saved for new quizzes. It also includes the capitals setting, so if you missed the file above, this one covers both.

### Changing the admin

1. Edit the username in `admin_username()` at the top of the migration.
2. Run this in the SQL Editor:
   ```sql
   update public.profiles set is_admin = (lower(username) = public.admin_username());
   ```
3. Update the `VITE_ADMIN_USERNAME` variable on GitHub.

---

## Troubleshooting

- **"Sign-up was rejected."** The database refused the account. Usually the invite code changed between the check and the sign-up, or the migration wasn't run.
- **"Photo storage isn't set up yet."** Run `supabase/update-people-quiz.sql` in the SQL Editor.
- **"The database needs a small update first."** The site is newer than the database. Run the SQL file the message names (see *Updating an existing installation*).
- **"Account created, but no session was returned."** "Confirm email" is still on in Supabase (step 2). Turn it off. The user can then log in normally.
- **The site shows "Local mode".** The GitHub secrets are missing or misnamed. Check step 6, then re-run the workflow.
- **Blank page on GitHub Pages.** Check that Pages uses **GitHub Actions** as the source (step 7), and look at the Actions log.
- **Everything stopped working after a quiet week.** Free Supabase projects pause after about a week without activity. Open the Supabase dashboard and click **Restore**.

# Gelir & Gider

A Turkish, mobile-first finance PWA. Opens immediately without an email, username or password. Records and pending edits are stored locally; a JSON backup can be downloaded and restored on a fresh device. Monthly recurring income/expenses, finite installments, debt links and per-month payment marks are supported.

## Current deployment and cloud prerequisite

GitHub Pages uses `.github/workflows/publish.yml`. Only the explicit public asset list is published; SQL, tests and private data are excluded from the Pages artifact. Never commit personal records, backups or recovery keys (the repository itself is public).

Run `recovery.sql` once in the configured Supabase project's SQL editor to enable cloud vaults. This is **not** applied by GitHub Actions. On 2026-11-17 the RPC was checked and returned PGRST202 (not installed). Until installation, the UI truthfully reports device-only storage. Existing `finance_state` rows and auth configuration are untouched, and existing account data is not automatically migrated. Export and import a backup if migrating existing records.

The new vault uses a cryptographically random 256-bit bearer recovery key, not a shared public account or a fabricated email/password. RLS and revoked table privileges prevent direct anonymous/authenticated reads and writes. SECURITY DEFINER RPCs accept the key over HTTPS POST, store only its SHA-256 hash, enforce payload bounds and optimistic revisions. The browser never receives service-role credentials. Anonymous Supabase Auth does not need to be enabled.

Download the recovery key once and save it outside Safari. Whoever possesses that file can read and change its vault. The key is never placed in a URL. Clearing website data without a saved key or backup loses access. A key restores only successfully cloud-saved changes; offline/pending edits require an up-to-date JSON backup. Backups contain personal financial information and should be stored privately. There is no key-loss recovery, account email recovery, or automatic merge.

The public write RPC permits new random vault creation; for broader public use put it behind server-side abuse protection/rate limits and monitor database usage. This repository does not claim those controls are deployed.

## Verification

`node --test tests/vault.test.mjs` covers local persistence, failed local writes, cross-tab conflicts, simulated cloud round-trip/recovery, wrong-key rejection, revision conflicts, and edits during an in-flight initial read. Mock cloud tests are not proof of the SQL installation. Verify real cloud recovery and isolation after applying SQL: save a disposable record, recover with its key in a fresh browser, confirm an unrelated key returns no data, and verify direct table access is rejected.

The service worker caches only public application files, never Supabase API responses. Local records remain in browser storage. Editing a recurring record can change past scheduled totals; paid amounts remain separately recorded. Compare accounting totals with statements.

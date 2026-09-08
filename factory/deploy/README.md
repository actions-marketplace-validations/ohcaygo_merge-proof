# Existing-site deployment

Keep Cloudflare Pages project `merge-proof` and `merge-proof.ohcaygo.com`.
The Pages worker proxies only `/api/*`, `/download/*` and `/webhooks/stripe`.
Production variables are `FACTORY_BACKEND=https://161.35.59.206` and an encrypted
`FACTORY_PROXY_SECRET`, matching `proxySecret` in the backend's private JSON.
Never put either private JSON or the secret in the Pages upload or Git.

The dedicated DigitalOcean backend is Droplet `598775880` (`merge-proof-factory`),
NYC1, Debian 13, Basic Regular 1 vCPU / 2 GB / 50 GB, $12/month, no add-ons.
The application runs as `mergeproof`, listens on loopback port 4327, and stores
production state in `/var/lib/merge-proof/state`. Nginx terminates IP-address TLS.
The public IP avoids adding another hostname. Certificate renewal is checked twice
daily by `merge-proof-certbot.timer`; its deploy hook reloads Nginx. Verify renewal
with `certbot renew --dry-run` after certificate or webserver configuration changes.

`build-pages.js <new-directory> <existing-public-sample.pdf>` creates a direct-upload
bundle, checking the original sample's SHA256 before copying it. Upload to this
existing project only. Keep Pages Functions fail-closed. The worker rejects dynamic
requests from preview/pages.dev origins and never follows backend redirects.

Use the systemd service in this directory with an immutable release directory and
`/opt/merge-proof/current` symlink. Root owns deployed code; the service can write
only its state and temporary working files. Run the factory tests as `mergeproof`
on the actual host before switching Pages. Keep fixture state separate from live.
Do not claim real-money completion from fixture or test-mode payments.

Rollback: restore the previous Pages production deployment in the existing project;
restore the previous backend release symlink and restart the service. Preserve
production state. No automated backups or paid optional services are authorized.

This is deployment guidance, not a receipt that every step has completed. Current
execution evidence and outstanding gates are in `../PUBLIC-LAUNCH.md`.

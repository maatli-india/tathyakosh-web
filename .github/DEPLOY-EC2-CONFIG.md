# EC2 deploy — GitHub config

Workflow: `.github/workflows/deploy-ui-ec2.yml` (**UI service — EC2**). Manual only:
Actions → Run workflow → pick branch → tick env(s). The runner runs `npm ci && npm run build` (Vite → `dist/`),
pushes a `linux/arm64` nginx image to DockerHub, then AWS SSM Run Command starts it on the env's EC2 behind
Traefik — the same pattern as the Trickle website (`trickle-web/.github/workflows/deploy-ui-ec2.yml`) and the
Kosh API (`tathyakosh/.github/workflows/deploy-api-SSM.yml`). No SSH, no `.pem` in GitHub.

## Where each env runs

| Env | EC2 | Container | `PUBLIC_HOST` example |
|---|---|---|---|
| dev | websites box `maatli-websites` | `tathyakosh-web-dev` | `kosh-dev.maatli.com` |
| qa | websites box (same as dev) | `tathyakosh-web-qa` | — |
| prod | `trickle-prod` (Trickle + Kosh APIs and all prod websites, until Kosh gets its own EC2) | `tathyakosh-web-prod` | `kosh.maatli.com` |

Image: `<DOCKERHUB_USERNAME>/tathyakosh-web`, tag `YYYYMMDD_hhmm.N` (IST) — same format as the API. **One image for
every env:** the build has no env-specific values; the env's `NEXT_PUBLIC_API_BASE_URL` is passed to the container as
`API_BASE_URL` at deploy, so a dev image can go to qa/prod unchanged. Moving Kosh to another EC2 later = change that
env's `EC2_INSTANCE_ID` (and the CloudFront origin); nothing in the repo changes.

The image is `nginx:alpine` serving `dist/` on port 80 (`nginx.conf`): SPA fallback to `/index.html`,
`/assets/*` cached for a year (`immutable`), `index.html` sent with `no-cache`, gzip on. The UI calls the API
same-origin at `/kosh/*`; nginx proxies that to `API_BASE_URL` with `Cache-Control: no-store` (the static build has
no server of its own). `nginx.conf` is an nginx:alpine template — `${API_BASE_URL}` is filled in at container start.
Locally, `npm run dev` proxies `/kosh/*` the same way to `NEXT_PUBLIC_API_BASE_URL` from `.env.local` (default: the
dev API).

## One-time EC2 setup (per instance)

The box is set up by the `platform-scripts/ec2/` scripts 01–03 (create, configure, run setup via SSM).

1. SSM agent online; instance profile has `AmazonSSMManagedInstanceCore`.
2. Docker + Traefik running (`platform-scripts/ec2/docker-compose.traefik.yml`) on network `traefik-public`;
   security group open on 80/443.
3. DockerHub repo `<DOCKERHUB_USERNAME>/tathyakosh-web` is created by the first push with the account's default
   visibility. It must be **public**, like `trickle-web`: the hosts have no `docker login`, so a private image fails
   at `docker pull`.
4. Free RAM: the container is capped at 64 MB (`CONTAINER_MEMORY`) and uses ~21 MB.

The UI has no runtime secrets, so no Secrets Manager entry is needed.

## CloudFront + DNS (GoDaddy)

Kosh has its own distributions: a Free flat-rate plan covers one distribution and one apex domain, and the Trickle
ones (`E2QJH5YWBK5AEK` nonprod) are bound to `trickle.org.in`.

| Env | Distribution | Plan | Origin |
|---|---|---|---|
| dev/qa | `maatli-websites-nonprod` (any nonprod `*.maatli.com` site) | pay-as-you-go, **no WAF** | `web-origin-nonprod.trickle.org.in` (websites box) |
| prod | Kosh prod (later) | Free | the `trickle-prod` origin hostname |

Pay-as-you-go is $0 inside the account-wide 1 TB / 10M requests per month free tier, with no bill ceiling. Never
enable its security protections (WAF): ~$5/ACL + $1/rule per month plus per-request fees. The account allows 3 Free
plans: Trickle nonprod (used), Trickle prod, Kosh prod.

Origins, acme behavior and default behavior as in `platform-scripts/aws/cloudfront-websites.md` step 11, alternate
domain `PUBLIC_HOST`, cert `eda8f540-…` (covers `*.maatli.com`). The `X-Origin-Verify` value must equal
`CF_ORIGIN_SECRET`. Do not add the apex `maatli.com` — it is the company site.

IAM user `maatli-gha-deploy` → policy `gha-deployment` → `InvalidateWebsitesCache` must list each Kosh distribution
ARN, or the invalidation step fails after a successful deploy.

`CNAME` record: `PUBLIC_HOST` → the CloudFront distribution's domain (not an `A` record to the Elastic IP).
CloudFront adds `X-Origin-Verify` to every origin request; Traefik routes only requests that carry it.

The distribution also needs a `/kosh/*` behavior (HTTPS origin) so admin API calls get through: allowed methods
`GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`, cache policy `CachingDisabled`, origin request policy `AllViewer`
(forwards `X-Admin-Key`, `Content-Type`, query strings and `Host`). CloudFront's out-of-the-box behavior allows only
GET/HEAD and drops `X-Admin-Key`.

Traefik issues the Let's Encrypt certificate itself: CloudFront forwards `/.well-known/acme-challenge/*` to port 80,
where Traefik's ACME router (not the app router) answers. The first deploy of a host returns 502 for about a minute,
until the certificate is issued.

## GitHub Environments `dev`, `qa`, `prod`

| Type | Key | Required | Example (dev) |
|---|---|---|---|
| Variable | `NEXT_PUBLIC_API_BASE_URL` | yes | `https://api-dev.kosh.maatli.com/kosh` (prod `https://api.kosh.maatli.com/kosh`) — must end in `/kosh`, no `/v1`, no trailing `/` (checked). Same key as Trickle; never baked into the build |
| Variable | `PUBLIC_HOST` | deploy | `kosh-dev.maatli.com` — Traefik `Host` rule, no `https://` |
| Variable | `CF_DISTRIBUTION_ID` | no | Kosh distribution in front of this env, e.g. `E1ABCDEF2GHIJK` — invalidates `/*` after each deploy; unset = warning, no invalidation. A placeholder such as `<add_later>` fails the job after the deploy — leave it unset |
| Secret | `EC2_INSTANCE_ID` | deploy | `i-0abc…` — dev and qa: `maatli-websites`; prod: `trickle-prod` |

Missing required keys fail the deploy job before anything is deployed.

## Secrets (repo level, or per env to override)

| Key | Notes |
|---|---|
| `DOCKERHUB_USERNAME` | Same account as the API images |
| `DOCKERHUB_TOKEN` | DockerHub access token, Read & Write |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM user allowed `ssm:SendCommand` (the instances + `AWS-RunShellScript`) and `ssm:GetCommandInvocation` — the API workflow's key works |
| `CF_ORIGIN_SECRET` | Needed for deploy. Hex string; must equal the `X-Origin-Verify` value CloudFront sends to the origin |
| `TELEGRAM_BOT_TOKEN` | Same bot as the API deploys |
| `TELEGRAM_CHAT_ID` | Same chat as the API deploys |

## Repo variables (optional)

`SERVICE_NAME` (default `Kosh website`) · `NODE_VERSION` (Node.js, default `24` LTS) ·
`TRAEFIK_NETWORK` (default `traefik-public`)

## Inputs

| action | build_tag | What runs |
|---|---|---|
| `deploy` | empty | Build the selected branch → push image → run it on the ticked envs (dev/qa) |
| `deploy` | git commit SHA, e.g. `c290d6e` | Check out that commit, build it → push → run on the ticked envs (dev/qa) |
| `deploy` | image tag, e.g. `20261111_1635.2` | No build — run that existing image on any ticked env, incl. PROD |
| `build` | empty / git SHA | Build + push the image only; nothing changes on EC2. Deploy it later by its tag |

Detection rule: `YYYYMMDD_hhmm.N` = image tag, any other 7–40 hex = git SHA, anything else fails.
Use the full 40-char SHA to avoid ambiguity. An image tag needs `action=deploy`.

Same rules as the API workflow: any mix of `dev` / `qa` / `prod` (qa waits for dev and is skipped if dev fails).
**PROD only takes an existing image tag** — no fresh builds; promote the image tested on dev/qa.

Jobs (same as the API workflow): `release` (validate, build + push the image; no build for an image tag) →
`deploy-dev` / `deploy-qa` / `deploy-prod` (deploy only). **Re-run failed jobs** on a failed deploy redeploys
the same image — it does not rebuild.

Each deploy is health-checked inside the container with busybox `wget` (`GET http://127.0.0.1:80/` must succeed;
5 s + 10 × 2 s). On failure the previous image is started again and the run fails. The host keeps the current and
previous image per env.

Telegram always shows the branch, SHA and message of the code that went live — on an image-tag deploy that is the
image's own, not the selected branch's latest commit.

## Rollback

1. **By image tag (fast, exact):** copy `Rollback: build_tag=…` from the Telegram message or run summary →
   Run workflow with `action=deploy`, tick **that** env, `build_tag=<tag>`.
2. **By git SHA:** `build_tag=<sha>` rebuilds old code (dev/qa only).

# rashadmorgan.com portfolio site

Static site. No build step, no serverless functions, no API key, no running cost.
Live at https://work.rashadmorgan.com

```
netlify.toml                      site config, headers, redirects
public/
  index.html                      landing page
  playbook/index.html             The IT Integration Playbook
  playbook/*.pdf
  scaling/index.html              Scaling Faster Than Headcount
  scaling/*.pdf
  root-cause/index.html           Root Cause Is the Deliverable
  root-cause/*.pdf
  retrospect/index.html           post incident review tool (demo build)
```

## Deploy

Push to the repo. Netlify builds on push. Nothing else to configure.

```
git add -A
git commit -m "..."
git push
```

Publish directory is `public`, build command is blank, both set by netlify.toml.
Leave the Functions directory field empty in Netlify site settings. If it is set
to `netlify/functions`, Netlify will look for serverless functions that no longer
exist in this project.

## Domain

The root domain forwards to LinkedIn at the registrar with path forwarding on,
so that rule applies to every path and the root cannot serve this site while it
exists. The site runs on a subdomain instead and the root rule is untouched.

DNS, in Squarespace under Custom records:

```
CNAME  work                          ->  rashadmorgan-site.netlify.app
TXT    subdomain-owner-verification  ->  (Netlify verification token)
```

The TXT record is required because the parent domain is managed elsewhere.

## Writing

Each piece is a single HTML file with the stylesheet inline. The PDF beside it is
generated from the same file so the two never drift:

```
wkhtmltopdf --page-size Letter --margin-top 22mm --margin-bottom 22mm \
  --margin-left 24mm --margin-right 24mm --enable-local-file-access \
  public/scaling/index.html public/scaling/scaling-faster-than-headcount.pdf
```

Design: Georgia throughout, navy `#1B3A63` for section labels and links, slate
`#4E6178` for secondary text. The masthead uses `transform: scaleY(1.16)` on the
h1 to make Georgia read taller than it was drawn. Print rules keep headings with
their content across page breaks.

## About the Retrospect demo build

`public/retrospect/index.html` renders a worked example rather than calling a
model, so it runs with no API key and no cost. A "Demo" tag in the header, a
"Worked example" label on the review card, and a line in the placeholder all say
so, since nobody should assume their own notes were analysed.

To make it live later: add a serverless function that proxies the Anthropic API
with the key held server side, set `ANTHROPIC_API_KEY` in Netlify environment
variables, restore the functions directory setting, and point the generate
handler at it instead of the local `SAMPLE_REVIEW` object.

## Local preview

```
cd public && python -m http.server 8080
```

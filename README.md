# rashadmorgan.com portfolio site

Static site. No build step, no serverless functions, no API key, no running cost.

```
netlify.toml                  site config, headers, redirects
public/
  index.html                  landing page
  playbook/index.html         The IT Integration Playbook
  playbook/*.pdf              downloadable version
  retrospect/index.html       post incident review tool (demo build)
```

## Deploy

1. Push this directory to a GitHub repo.
2. Netlify: Add new site, Import an existing project, pick the repo.
   Publish directory `public`, build command blank. netlify.toml sets these.
3. Deploy. Nothing else to configure.

## Domain

The root domain forwards to LinkedIn at the registrar with path forwarding on,
so that rule applies to every path and the root cannot serve this site while it
exists. Use a subdomain and leave the root rule alone:

1. Netlify: Domain management, Add a domain, `work.rashadmorgan.com`
2. Squarespace DNS Settings, Custom records, add:
   `CNAME  work  ->  rashadmorgan-site.netlify.app`
3. Netlify provisions the certificate automatically. Allow up to an hour.

## About the Retrospect demo build

`public/retrospect/index.html` renders a worked example rather than calling a
model. The interface, record layout, and output structure are identical to the
live version. The placeholder text and a "Demo" tag in the header state this
plainly so nobody assumes their own notes were analysed.

To make it live later: restore the serverless function, set `ANTHROPIC_API_KEY`
in Netlify environment variables, and point the generate handler at
`/api/anthropic` instead of the local sample. The function code is kept
separately and is about thirty lines.

## Local preview

Any static server works:

```
cd public && python3 -m http.server 8080
```

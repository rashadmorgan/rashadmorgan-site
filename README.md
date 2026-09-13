# rashadmorgan.com portfolio site

Static site plus one serverless function. No build step.

```
netlify.toml                  site config, headers, redirects
public/
  index.html                  landing page
  playbook/index.html         The IT Integration Playbook
  playbook/*.pdf              downloadable version
  retrospect/index.html       post incident review tool
netlify/functions/
  anthropic.js                API proxy, keeps the key server side
```

## Deploy

1. Push this directory to a GitHub repo.
2. Netlify: Add new site, Import an existing project, pick the repo.
   Publish directory `public`, functions directory `netlify/functions`,
   build command blank. netlify.toml already sets these.
3. Site configuration, Environment variables, add:
   `ANTHROPIC_API_KEY` = your key from console.anthropic.com
   Never commit this value.
4. Deploy.

## Domain

The root domain currently forwards to LinkedIn at the registrar, with path
forwarding on. That forwarding applies to every path, so the root cannot serve
this site while the rule exists.

Use a subdomain instead and leave the root rule alone:

1. Netlify: Domain management, Add a domain, `work.rashadmorgan.com`
2. Squarespace DNS Settings, Custom records, add:
   `CNAME  work  ->  <your-site>.netlify.app`
3. Netlify provisions the certificate automatically. Allow up to an hour.

If you would rather serve the site at the root, delete both Squarespace
forwarding rules first, then point the apex at Netlify per their instructions.

## Local development

```
npm install -g netlify-cli
netlify dev
```

Runs the site and the function together on localhost:8888.

## Notes

- `ALLOWED_ORIGINS` in `netlify/functions/anthropic.js` must include the final
  domain. It is set to work.rashadmorgan.com. Change it if you use another.
- The function only accepts a `prompt` field and caps its length, so the
  endpoint cannot be reused as a general purpose relay if the URL is found.
- Netlify's free tier includes 125k function invocations a month, which is far
  more than a portfolio piece will use.

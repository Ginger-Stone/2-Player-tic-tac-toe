# Application Deployment Instructions

This web application has been deployed to netlify. The client side is deployed to sites and the server to functions.

Technologies used: NodeJS, Vanilla js, CSS, HTML

## Deployment

First ensure that 'config.js' file has environment set to production

```javascript
const environment = "prod";
```

Deployment are made through [Netlify CLI](https://docs.netlify.com/site-deploys/create-deploys/) with the command

```javascript
netlify deploy --prod
```

## Adding environment variables

Switch to production environment variables and deploy

```javascript
netlify env:import .env
```

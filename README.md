# primary-school

## Changes made in app and deployment for it to work in github pages

- Github pages does not allow server side rendering therefore turn off SSR and make it single page app
  In `react-router.config.ts` set `ssr: false`

  Makde sure no SSR features are used in the app, more details in [docs](https://reactrouter.com/how-to/spa)

- In the github pages as the application is deployed as a sub app with respoistory name those base names has to be added in following places
  - In `react-router.config.ts` set basename 
  - In `vite.config.ts` set base

- In git actions for sub url refresh to work make sure to include the step `SPA fallback so direct URL refreshes work on Pages`


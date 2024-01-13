# BBOX Drawer by CeritaPeta.co.uk

<img src='public/logo.png' width="200">

Bounding box tool by ceritapeta.co.uk. This tool can be used to generate bounding box coordinates and geojson.

# Contributing Guide

We use tailwind and vite with typescript to develop this app. Requirement:

1. NodeJS
2. typescript
3. tailwind for css
4. mapbox public token

You need mapbox public token to emulate this locally.

1. create a mapbox account [over here](https://account.mapbox.com/auth/signup/)
2. follow the instruction on how to [generate default public access token](https://docs.mapbox.com/accounts/guides/tokens/#mapbox-account-dashboard)
3. obtain the token


Development environment setup

- have `Node.JS` and `npm` installed
- `git clone` this repository
- install the packages `npm install`
- create a `src/mapboxtoken.ts` with the following value:

```typescript
// src/mapboxtoken.ts
export default '<your mapbox token>'
```

Development server:

- run the dev server `npm run dev`
- open the server using your browser, usually `http://localhost:5173/`
- edit the code in `/src`

# Creating a Pull Request

1. fork this repository so you have your own repository
2. `git clone` your own repository
3. do your changes
4. `git push` your local changes to your own repository that is a fork of this repository
5. go to this repository, and create a pull request.
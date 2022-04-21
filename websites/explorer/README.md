# iBlock Core Website

Welcome to iBlock Core's website! The website is composed two sections:
- Explorer
- Marketplace

## How to Start the Website

On the root folder `website`, install the packages. This process can take some time depending on the internet speed. To install, run:
```shell
npm install
```
Then, copy the environment variables.
```shell
cp .env.example .env
```
Finally, start the React website!
```shell
npm start
```

### Note on SWR
SWR is more intended to get data, not update it, usually you have another function to update and after it you will run mutate to update the cache and trigger a revalidation (SWR will fetch it again)

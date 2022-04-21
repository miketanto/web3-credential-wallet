# Light version
FROM node:17-alpine

# Alpine needs python3 & g++ installed manually (to run `npm ci`)
RUN apk update && apk add g++ make python3

# From docker-compose build `args` (ENV is for CMD)
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# $NODE_ENV is the same as using ${NODE_ENV}
RUN mkdir -p /usr/src/app/${NODE_ENV}
WORKDIR /usr/src/app/${NODE_ENV}

RUN echo $NODE_ENV

# Pre-installation preps
COPY package.json /usr/src/app/${NODE_ENV}
COPY package-lock.json /usr/src/app/${NODE_ENV}

# Install packages
RUN npm ci

COPY . /usr/src/app/${NODE_ENV}

# process.env.NODE_ENV is set above when `ENV NODE_ENV=$NODE_ENV`
CMD ["npm", "run", "deploy"]

# Run start script (with permission)
# RUN chmod +x ./scripts/start.sh
# CMD './scripts/start.sh'

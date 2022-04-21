# Indexer

### Problem
Retrieving transactions directly from the chain sometimes takes too long, 
especially when searching for transactions associated with an address. Those queries take
too long to execute as they have to traverse back the blockchain from the latest block.

### Solution
A shallow database of the indexed transactions (that anyone can run on their own local node),
which provides rapid access to

### Installation

**Pre-reqs:**
1. Docker and docker-compose is installed
2. Docker is running
3. docker-compose has permission (through user `docker`)

**Steps:**
1. Install the project packages
```shell
npm install
```

2. Create the .env file (for the actual .env file, please request jwp6@illinois.edu for a copy)
```shell
cp .env.example .env
```

3. Spin up docker
```shell
docker-compose up -d
```

### Post Installation

You will see two indexers and two indexed DBs running. One is for the production chain and the other is for dev chain
- Production DB is exposed on env `DB_EXTERNAL_PORT`
- Development DB is exposed on env `DB_DEV_EXTERNAL_PORT`

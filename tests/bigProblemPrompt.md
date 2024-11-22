I am developing a multitenant database system with 3 apps (Apps - licenses management, Admin side for each app and Member side -mobile/web for members- 

We are in the begining of the development process and this is the file structure of our project so far

.env
├── .eslintrc.js
├── .github
│   └── workflows
│       └── ci.yml
├── .gitignore
├── .prettierrc.js
├── .turbo
│   ├── cache
│   ├── cookies
│   │   ├── 1.cookie
│   │   ├── 2.cookie
│   │   ├── 3.cookie
│   │   ├── 4.cookie
│   │   └── 5.cookie
│   └── daemon
│       └── 2337a1cf9a23651f-turbo.log.2024-11-22
├── apps
│   ├── admin-portal
│   │   ├── .env.local
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── components
│   │   │   │   └── .gitkeep
│   │   │   ├── hooks
│   │   │   │   └── .gitkeep
│   │   │   ├── pages
│   │   │   │   └── .gitkeep
│   │   │   ├── styles
│   │   │   │   └── .gitkeep
│   │   │   └── utils
│   │   │       └── .gitkeep
│   │   └── tsconfig.json
│   ├── client-app
│   │   ├── .env.local
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── components
│   │   │   │   └── .gitkeep
│   │   │   ├── hooks
│   │   │   │   └── .gitkeep
│   │   │   ├── pages
│   │   │   ├── styles
│   │   │   │   └── .gitkeep
│   │   │   └── utils
│   │   │       └── .gitkeep
│   │   └── tsconfig.json
│   └── management-portal
│       ├── .env.local
│       ├── package.json
│       ├── src
│       │   ├── components
│       │   │   └── .gitkeep
│       │   ├── hooks
│       │   │   ├── .gitkeep
│       │   │   └── useAuth.ts
│       │   ├── pages
│       │   │   └── .gitkeep
│       │   ├── styles
│       │   │   └── .gitkeep
│       │   └── utils
│       │       └── .gitkeep
│       └── tsconfig.json
├── commands-guide.md
├── docker
│   ├── development
│   │   ├── Dockerfile
│   │   └── postgres
│   │       ├── Dockerfile
│   │       └── postgresql.conf
│   ├── init
│   │   └── 01-init.sql
│   └── production
│       └── Dockerfile
├── docker-compose.yml
├── docs
│   ├── api
│   │   └── README.md
│   ├── architecture
│   │   └── README.md
│   └── development
│       └── README.md
├── package.json
├── packages
│   ├── config
│   │   ├── .turbo
│   │   │   └── turbo-build.log
│   │   ├── dist
│   │   │   ├── index.d.mts
│   │   │   ├── index.d.ts
│   │   │   ├── index.js
│   │   │   └── index.mjs
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── auth
│   │   │   │   ├── jwt.ts
│   │   │   │   └── types.ts
│   │   │   ├── constants.ts
│   │   │   ├── environment.ts
│   │   │   ├── index.ts
│   │   │   └── tsconfig.base.json
│   │   └── tsconfig.base.json
│   ├── core
│   │   ├── .turbo
│   │   │   └── turbo-build.log
│   │   ├── dist
│   │   │   ├── index.d.mts
│   │   │   ├── index.d.ts
│   │   │   ├── index.js
│   │   │   ├── index.js.map
│   │   │   ├── index.mjs
│   │   │   └── index.mjs.map
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── auth
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── guards.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   └── types.ts
│   │   │   ├── database
│   │   │   │   ├── connection.ts
│   │   │   │   ├── schema.sql
│   │   │   │   ├── test-connection.ts
│   │   │   │   └── types.ts
│   │   │   ├── index.ts
│   │   │   └── utils
│   │   │       └── logger.ts
│   │   └── tsup.config.ts
│   └── ui
│       ├── package.json
│       └── src
├── services
│   ├── api
│   │   ├── .env
│   │   ├── .turbo
│   │   │   └── turbo-build.log
│   │   ├── db
│   │   │   └── packages
│   │   │       └── core
│   │   │           └── src
│   │   │               └── index.ts
│   │   ├── dist
│   │   │   ├── app.controller.d.ts
│   │   │   ├── app.controller.d.ts.map
│   │   │   ├── app.controller.js
│   │   │   ├── app.module.d.ts
│   │   │   ├── app.module.d.ts.map
│   │   │   ├── app.module.js
│   │   │   ├── db
│   │   │   │   └── packages
│   │   │   │       └── core
│   │   │   │           └── src
│   │   │   │               ├── index.d.ts
│   │   │   │               ├── index.d.ts.map
│   │   │   │               ├── index.js
│   │   │   │               └── index.js.map
│   │   │   ├── index.d.ts
│   │   │   ├── index.d.ts.map
│   │   │   ├── index.js
│   │   │   ├── index.js.map
│   │   │   ├── main.d.ts
│   │   │   ├── main.d.ts.map
│   │   │   ├── main.js
│   │   │   ├── src
│   │   │   │   ├── app.module.d.ts
│   │   │   │   ├── app.module.d.ts.map
│   │   │   │   ├── app.module.js
│   │   │   │   ├── app.module.js.map
│   │   │   │   ├── main.d.ts
│   │   │   │   ├── main.d.ts.map
│   │   │   │   ├── main.js
│   │   │   │   └── main.js.map
│   │   │   └── tsconfig.tsbuildinfo
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── tsconfig.json
│   └── websocket
│       ├── .env
│       ├── .turbo
│       │   └── turbo-build.log
│       ├── dist
│       │   ├── main.d.ts
│       │   ├── main.d.ts.map
│       │   ├── main.js
│       │   ├── main.js.map
│       │   ├── tsconfig.tsbuildinfo
│       │   ├── ws.controller.d.ts
│       │   ├── ws.controller.d.ts.map
│       │   ├── ws.controller.js
│       │   ├── ws.module.d.ts
│       │   ├── ws.module.d.ts.map
│       │   ├── ws.module.js
│       │   └── ws.module.js.map
│       ├── package.json
│       ├── src
│       │   ├── main.ts
│       │   ├── ws.controller.ts
│       │   └── ws.module.ts
│       └── tsconfig.json
├── test-env.sh
├── tests
│   ├── e2e
│   ├── integration
│   └── unit
└── turbo.json

Im trying to debug an early problem with the apis and in that process I deleted the node_modules. Now when I try to do npm install
I am having problems with the internal modules registration. this is the error I am getting right now. I want you to take me 
step by step into solving this. 

I will produce every package json present.



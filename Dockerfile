FROM node:24-alpine AS base

WORKDIR /app

RUN npm install -g pnpm

COPY postcss.config.mjs postcss.config.mjs
COPY tsconfig.json tsconfig.json
COPY next-env.d.ts next-env.d.ts
COPY next.config.ts next.config.ts
COPY package-lock.json package-lock.json
COPY package.json package.json

RUN pnpm install

FROM base AS build

WORKDIR /app

COPY . .

RUN pnpm build

FROM base AS prod_modules

WORKDIR /app

RUN rm -rf node_modules

RUN pnpm install --prod

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs

CMD ["node", "server.js"]

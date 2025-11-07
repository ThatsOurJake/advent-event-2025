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

# syntax=docker/dockerfile:1

# Build the architecture-independent frontend on the native builder platform.
FROM --platform=$BUILDPLATFORM node:20-alpine AS build-stage
ENV NPM_CONFIG_LOGLEVEL=warn
ENV CI=true
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.11.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm config set store-dir /pnpm/store && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Package the same static output for each target architecture.
FROM nginxinc/nginx-unprivileged:1.31-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

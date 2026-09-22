FROM oven/bun:1.4.2-alpine

WORKDIR /usr/app

# No git checkout in the image, so skip lefthook's hook installation.
ENV LEFTHOOK=0

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY ./ ./

# --bun forces Vite to run on Bun even though its shebang says node.
CMD [ "bun", "--bun", "run", "dev", "--host" ]

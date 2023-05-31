FROM rust:1.69.0-slim AS backend

WORKDIR /app

COPY backend backend

WORKDIR /app/backend

ENV CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse

RUN cargo build --release

FROM node:19-slim AS frontend

WORKDIR /app

COPY frontend frontend

WORKDIR /app/frontend

RUN yarn && yarn build

FROM debian:stable-slim

RUN apt-get update &&\
    apt-get install -y ca-certificates &&\
    rm -rf /var/lib/apt/lists/*

COPY --from=backend /app/backend/target/release/hci-backend /usr/local/bin/hci-backend
COPY --from=frontend /app/frontend/dist /srv/static

ENV STATIC_FILE_DIRECTORY=/srv/static

EXPOSE 3000

CMD ["hci-backend"]

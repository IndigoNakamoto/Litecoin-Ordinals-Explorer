FROM rust:1.76.0-bookworm AS builder

ARG ORD_LITECOIN_GIT_REF=0.20.1-litecoin

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src

RUN git clone https://github.com/ynohtna92/ord-litecoin.git ord \
 && cd ord \
 && git checkout "$ORD_LITECOIN_GIT_REF"

COPY src/index/fetcher.rs /usr/src/ord/src/index/fetcher.rs

WORKDIR /usr/src/ord

RUN cargo build --bin ord --release

FROM debian:bookworm-slim

COPY --from=builder /usr/src/ord/target/release/ord /usr/local/bin/ord

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates openssl \
 && rm -rf /var/lib/apt/lists/*

ENV RUST_BACKTRACE=1
ENV RUST_LOG=info

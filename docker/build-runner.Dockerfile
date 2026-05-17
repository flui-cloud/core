FROM debian:12-slim

ARG RAILPACK_VERSION=0.22.2
ARG BUILDKIT_VERSION=0.15.1

RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://github.com/railwayapp/railpack/releases/download/v${RAILPACK_VERSION}/railpack-v${RAILPACK_VERSION}-x86_64-unknown-linux-musl.tar.gz" \
    | tar xz -C /usr/local/bin railpack \
    && chmod +x /usr/local/bin/railpack

RUN curl -fsSL "https://github.com/moby/buildkit/releases/download/v${BUILDKIT_VERSION}/buildkit-v${BUILDKIT_VERSION}.linux-amd64.tar.gz" \
    | tar xz -C /usr/local/bin --strip-components=1 bin/buildctl \
    && chmod +x /usr/local/bin/buildctl

RUN railpack --version && buildctl --version

#!/bin/sh

set -eu

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert is required. Install it first: https://github.com/FiloSottile/mkcert" >&2
  exit 1
fi

project_directory=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

# Read one key from .env the same way Docker Compose and Vite do: an explicitly
# exported value wins over the .env file. Parse just the requested key instead
# of sourcing .env, so quotes, CRLF and shell metacharacters cannot break the
# script.
read_env_value() {
  if [ -f "$project_directory/.env" ]; then
    sed -n "s/^$1[[:space:]]*=[[:space:]]*//p" "$project_directory/.env" |
      tail -n 1 |
      tr -d '\r' |
      sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
  fi
}

if [ -z "${GITSTARS_CERT_DIR-}" ]; then
  GITSTARS_CERT_DIR=$(read_env_value GITSTARS_CERT_DIR)
fi

if [ -z "${GITSTARS_UID-}" ]; then
  GITSTARS_UID=$(read_env_value GITSTARS_UID)
fi

if [ -z "${GITSTARS_GID-}" ]; then
  GITSTARS_GID=$(read_env_value GITSTARS_GID)
fi

certificate_directory=${GITSTARS_CERT_DIR:-"$project_directory/.certs"}

case "$certificate_directory" in
  /*) ;;
  *) certificate_directory="$project_directory/$certificate_directory" ;;
esac

mkdir -p "$certificate_directory"
# Normalize the path so later messages do not contain "./" segments.
certificate_directory=$(CDPATH= cd -- "$certificate_directory" && pwd)
mkcert -install
mkcert \
  -cert-file "$certificate_directory/localhost.pem" \
  -key-file "$certificate_directory/localhost-key.pem" \
  localhost 127.0.0.1 ::1

# compose.yaml runs the container as the host user (see `user:`) and mounts
# this directory read-only. The public certificate can be shared, but the
# private key must stay readable by its owner only.
chmod 0644 "$certificate_directory/localhost.pem"
chmod 0600 "$certificate_directory/localhost-key.pem"

# compose.yaml defaults GITSTARS_UID/GITSTARS_GID to 1000. When that does not
# match the host user the container cannot read the 0600 private key.
container_uid=${GITSTARS_UID:-1000}
container_gid=${GITSTARS_GID:-1000}

if [ "$container_uid" != "$(id -u)" ] || [ "$container_gid" != "$(id -g)" ]; then
  echo "warning: compose.yaml runs the container as ${container_uid}:${container_gid}," >&2
  echo "warning: but the current user is $(id -u):$(id -g), so it cannot read the 0600 private key." >&2
  echo "warning: add the following lines to .env and recreate the container:" >&2
  echo "warning:   GITSTARS_UID=$(id -u)" >&2
  echo "warning:   GITSTARS_GID=$(id -g)" >&2
fi

echo "Local HTTPS certificate created in $certificate_directory"

#!/bin/sh
# Applied to the isolated worker and inherited by every Git subprocess.
ulimit -t 110 || exit 1
ulimit -f 131072 || exit 1
ulimit -n 128 || exit 1
exec "$@"

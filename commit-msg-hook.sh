#!/bin/sh
# commitplease-original

# Needed to get a tty for the python script
exec < /dev/tty

.git/hooks/commit-msg-check $1
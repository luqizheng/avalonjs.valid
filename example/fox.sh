#!/bin/sh

# export MONO_IOMAP="all"
export MONO_EXTERNAL_ENCODINGS="gbk:gb18030"
# export MONO_THREADS_PER_CPU=100

ulimit -Hn 20000 >/dev/null
ulimit -Sn 18000 >/dev/null


case "$1" in
    -b)
        mono TinyFox.exe "$@" >/dev/null 2>&1 &
    ;;

    *)
        mono TinyFox.exe "$@"
    ;;

esac


exit 0

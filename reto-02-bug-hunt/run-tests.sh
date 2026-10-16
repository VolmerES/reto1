#!/bin/sh
# Runs the Bug Hunt tests. Usage: ./run-tests.sh      (all the bugs)
#                                 ./run-tests.sh 3    (only bug 3)
# If Java 17+ is not installed, it downloads one into .jdk/ just for this project.
set -e
cd "$(dirname "$0")"

java_version() {
    "$1" -version 2>&1 | awk -F '"' '/version/ { split($2, parts, "."); print parts[1]; exit }'
}

has_java() {
    version="$(java_version "$1" 2>/dev/null || true)"
    [ -n "$version" ] && [ "$version" -ge 17 ]
}

use_downloaded_java() {
    home="$(find .jdk -maxdepth 5 -type f -path '*/bin/java' 2>/dev/null | head -1 | sed 's#/bin/java$##')"
    [ -n "$home" ] && export JAVA_HOME="$home" && export PATH="$JAVA_HOME/bin:$PATH"
}

download_java() {
    case "$(uname -s)" in
        Darwin) os=mac ;;
        Linux) os=linux ;;
        *) echo "No sé descargar Java para este sistema. Instalad Java 17 o superior y volved a probar."; exit 1 ;;
    esac
    case "$(uname -m)" in
        arm64 | aarch64) arch=aarch64 ;;
        *) arch=x64 ;;
    esac
    echo "No encuentro Java 17 o superior. Descargando uno solo para este proyecto (solo la primera vez)..."
    rm -rf .jdk && mkdir -p .jdk
    curl -fsSL -o .jdk/jdk.tar.gz "https://api.adoptium.net/v3/binary/latest/21/ga/$os/$arch/jdk/hotspot/normal/eclipse"
    tar -xzf .jdk/jdk.tar.gz -C .jdk
    rm .jdk/jdk.tar.gz
}

if [ -n "$JAVA_HOME" ] && has_java "$JAVA_HOME/bin/java"; then
    :
elif has_java java; then
    unset JAVA_HOME
elif use_downloaded_java; then
    :
else
    download_java
    if ! use_downloaded_java; then
        echo "No se ha podido descargar Java. Instalad Java 17 o superior y volved a probar."
        exit 1
    fi
fi

tests="Bug*Test"
if [ -n "$1" ]; then
    tests="Bug$1*Test"
fi

echo "Pasando los tests (la primera vez descarga lo que necesita y tarda un poco)..."
rm -rf target/surefire-reports
sh ./mvnw -q -B test -Dtest="$tests" -Dsurefire.failIfNoSpecifiedTests=false || true

echo
echo "Resultado:"
for bug in 1 2 3 4 5; do
    report="$(ls target/surefire-reports/TEST-dev.bughunt.shop.Bug${bug}*Test.xml 2>/dev/null | head -1)"
    if [ -z "$report" ]; then
        [ -z "$1" ] && echo "  Bug $bug   no se ha podido ejecutar (mira los errores de arriba)"
        continue
    fi
    if grep -q -E 'failures="[1-9]|errors="[1-9]' "$report"; then
        echo "  Bug $bug   FALLA"
    else
        echo "  Bug $bug   PASA"
    fi
done

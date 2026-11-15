#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Android Gradle Plugin 8.x requires JDK 17+. The machine default may be JDK 8,
# so prefer the local JDK 17 installation unless an explicit compatible JDK is set.
if /usr/libexec/java_home -v 17 >/dev/null 2>&1; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
fi
if [ ! -x "${JAVA_HOME:-}/bin/java" ]; then
  echo "需要 JDK 17+：请设置 JAVA_HOME" >&2
  exit 1
fi
JAVA_MAJOR="$("$JAVA_HOME/bin/java" -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -1)"
if [ -n "$JAVA_MAJOR" ] && [ "$JAVA_MAJOR" -lt 17 ]; then
  echo "当前 Java 版本为 $JAVA_MAJOR，需要 JDK 17+" >&2
  exit 1
fi

if [ ! -d web/node_modules ]; then
  (cd web && npm ci)
fi
(cd web && npm run build)

if [ ! -x ./gradlew ]; then
  echo "缺少 Gradle wrapper，请运行 gradle wrapper --gradle-version 8.9" >&2
  exit 1
fi
./gradlew assembleDebug

mkdir -p dist
cp app/build/outputs/apk/debug/app-debug.apk dist/number-island-tv-2.4.0-debug.apk
(cd dist && shasum -a 256 number-island-tv-2.4.0-debug.apk > number-island-tv-2.4.0-debug.apk.sha256)
echo "APK: $ROOT/dist/number-island-tv-2.4.0-debug.apk"
cat "$ROOT/dist/number-island-tv-2.4.0-debug.apk.sha256"

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$jdkPath = Join-Path $root ".jdk\jdk-21.0.11+10"
$gradlePath = Join-Path $root ".gradle-cache\gradle-8.14.3\bin\gradle.bat"
$androidSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"

if (-not (Test-Path $jdkPath)) {
    throw "JDK 21 was not found at $jdkPath"
}

if (-not (Test-Path $gradlePath)) {
    throw "Gradle 8.14.3 was not found at $gradlePath"
}

$env:JAVA_HOME = $jdkPath
$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

npm run build
npx cap sync android

Push-Location (Join-Path $root "android")
try {
    & $gradlePath assembleDebug --no-daemon
} finally {
    Pop-Location
}

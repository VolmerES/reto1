# Runs the Bug Hunt tests. If Java 17+ is not installed, it downloads one into .jdk\ just for this project.
param([string]$Bug = "")

Set-Location $PSScriptRoot

function Get-JavaVersion([string]$javaExe) {
    $output = cmd /c "`"$javaExe`" -version 2>&1"
    if ("$output" -match 'version "(\d+)') { return [int]$Matches[1] }
    return 0
}

function Use-DownloadedJava {
    $java = Get-ChildItem -Path .jdk -Filter java.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $java) { return $false }
    $env:JAVA_HOME = $java.Directory.Parent.FullName
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    return $true
}

function Save-Java {
    Write-Host "No encuentro Java 17 o superior. Descargando uno solo para este proyecto (solo la primera vez)..."
    $arch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "aarch64" } else { "x64" }
    $url = "https://api.adoptium.net/v3/binary/latest/21/ga/windows/$arch/jdk/hotspot/normal/eclipse"
    if (Test-Path .jdk) { Remove-Item .jdk -Recurse -Force }
    New-Item -ItemType Directory -Path .jdk | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $ProgressPreference = "SilentlyContinue"
    Invoke-WebRequest -Uri $url -OutFile .jdk\jdk.zip -UseBasicParsing
    Expand-Archive -Path .jdk\jdk.zip -DestinationPath .jdk -Force
    Remove-Item .jdk\jdk.zip
}

$javaReady = $false
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $javaReady = (Get-JavaVersion "$env:JAVA_HOME\bin\java.exe") -ge 17
}
if (-not $javaReady -and (Get-Command java -ErrorAction SilentlyContinue)) {
    $javaReady = (Get-JavaVersion "java") -ge 17
    if ($javaReady) { Remove-Item Env:\JAVA_HOME -ErrorAction SilentlyContinue }
}
if (-not $javaReady) {
    if (-not (Use-DownloadedJava)) {
        Save-Java
        if (-not (Use-DownloadedJava)) {
            Write-Host "No se ha podido descargar Java. Instalad Java 17 o superior y volved a probar."
            exit 1
        }
    }
}

$tests = if ($Bug) { "Bug$($Bug)*Test" } else { "Bug*Test" }

Write-Host "Pasando los tests (la primera vez descarga lo que necesita y tarda un poco)..."
if (Test-Path target\surefire-reports) { Remove-Item target\surefire-reports -Recurse -Force }
cmd /c "mvnw.cmd -q -B test -Dtest=$tests -Dsurefire.failIfNoSpecifiedTests=false"

Write-Host ""
Write-Host "Resultado:"
foreach ($number in 1..5) {
    $report = Get-ChildItem -Path target\surefire-reports -Filter "TEST-dev.bughunt.shop.Bug$($number)*Test.xml" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $report) {
        if (-not $Bug) { Write-Host "  Bug $number   no se ha podido ejecutar (mira los errores de arriba)" }
        continue
    }
    [xml]$xml = Get-Content $report.FullName
    $suite = $xml.testsuite
    if ([int]$suite.failures -gt 0 -or [int]$suite.errors -gt 0) {
        Write-Host "  Bug $number   FALLA"
    } else {
        Write-Host "  Bug $number   PASA"
    }
}

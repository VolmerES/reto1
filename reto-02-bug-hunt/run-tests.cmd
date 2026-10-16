@echo off
rem Runs the Bug Hunt tests. Double-click it, or from a terminal: run-tests.cmd 3 (only bug 3)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-tests.ps1" %*
echo.
pause

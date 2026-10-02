@echo off
REM Deployment script for alternance-offer-crawler backend
REM Runs on the Ikoula Windows server via the backend-deploy.yml SSH step.
REM Explicit errorlevel checks are required: Windows cmd.exe does not honor
REM bash "set -e" semantics, so without these checks a failed step would
REM silently continue and the CI job would still report success.
REM On any failure we restart the previous build (still on disk) to minimize
REM downtime, then exit 1 so CI shows red.

setlocal

echo ============================================================
echo === alternance-offer-crawler Backend Deployment ===
echo ============================================================

echo.
echo === [1/6] Stopping API to release Prisma engine file lock ===
call pm2 stop dev-alternance-api
if errorlevel 1 (
    echo WARNING: Failed to stop PM2 app (may already be stopped)
)

echo.
echo === [2/6] Installing dependencies ===
call npm ci
if errorlevel 1 (
    echo ERROR: npm ci failed
    goto :fail
)

echo.
echo === [3/6] Building backend ===
cd apps\backend
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    goto :fail_in_backend
)

echo.
echo === [4/6] Generating Prisma client ===
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed
    goto :fail_in_backend
)

echo.
echo === [5/6] Running database migrations ===
call npx prisma migrate deploy
if errorlevel 1 (
    echo ERROR: Database migrations failed
    goto :fail_in_backend
)

echo.
echo === [6/6] Restarting API ===
cd ..\..
call pm2 restart dev-alternance-api --update-env
if errorlevel 1 (
    echo ERROR: Failed to restart PM2
    goto :fail
)

echo.
echo ============================================================
echo === ✓ Deploy succeeded ===
echo ============================================================
exit /b 0

:fail_in_backend
cd ..\..

:fail
echo.
echo ============================================================
echo === ✗ DEPLOY FAILED ===
echo === Attempting to restart previous build to minimize downtime ===
echo ============================================================
call pm2 restart dev-alternance-api --update-env
exit /b 1

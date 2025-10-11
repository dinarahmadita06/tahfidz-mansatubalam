@echo off
echo Killing all Node processes...
taskkill /F /IM node.exe /T
timeout /t 2

echo Generating Prisma client...
call npx prisma generate

echo Starting development server...
call npm run dev

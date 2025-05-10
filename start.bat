@echo off
start cmd /k "cd /d %~dp0backend && npm install && npm run dev"
start cmd /k "cd /d %~dp0frontend && npm install && npm run start"
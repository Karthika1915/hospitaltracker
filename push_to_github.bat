@echo off
set GIT_PATH="C:\Program Files\Git\cmd\git.exe"

echo Initializing Git...
%GIT_PATH% init
echo.
echo Adding files...
%GIT_PATH% add .
echo.
echo Committing files...
%GIT_PATH% commit -m "Complete Smart Hospital Tracker with AI and Geolocation"
echo.
echo Renaming branch to main...
%GIT_PATH% branch -M main
echo.
echo Adding remote origin...
%GIT_PATH% remote add origin https://github.com/Sandhya-1626/smart-hospital-tracker.git
%GIT_PATH% remote set-url origin https://github.com/Sandhya-1626/smart-hospital-tracker.git
echo.
echo Pushing to GitHub...
%GIT_PATH% push -u origin main --force
echo.
echo Done!

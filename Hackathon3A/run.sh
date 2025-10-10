#!/bin/bash

echo "=== Lancement du backend ==="
cd backend
npm install
node app.js &
sleep 2

echo "=== Lancement du frontend ==="
cd ../frontend
npm install
npm run dev


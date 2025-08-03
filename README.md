# Soodafza (Day-1 MVP)
Ultra-light PWA (Vanilla JS + Firebase REST). Features: Auth (email/pass), POS-lite Sales, Inventory CRUD, Delivery (location share), Offline via Service Worker.

## Quick Start
1) Open DevTools Console and set Firebase keys:
   localStorage.setItem("F_API_KEY","<YOUR_FIREBASE_API_KEY>");
   localStorage.setItem("F_DB_URL","https://<YOUR_DB>.firebaseio.com");

2) Serve locally:
   - Python:    python -m http.server 5173
   - Or Node:   npx serve -l 5173
   Open http://localhost:5173

3) Sign-in (email/password), first login becomes admin (seed in code).

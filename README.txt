Web AR Object Scanner — Laptop Webcam (AR-style tags)

What this project does:
- Detects common objects in real-time using your laptop webcam.
- Draws AR-style floating labels above detected objects with:
  - Object name
  - Confidence level
  - Description from built-in database

Files included:
- index.html
- script.js
- styles.css
- README.txt

How to run:
1. Serve the files over HTTP (do NOT open via file://)
   - Python 3: `python -m http.server 8000`
   - Open http://localhost:8000 in your browser.
2. Allow camera access when prompted.
3. Point your laptop camera at objects (cup, bottle, laptop, etc.).
4. Floating AR-style labels should appear above detected objects with info.

Notes:
- Accuracy depends on lighting, object size, and model limitations.
- All processing runs locally in your browser (no data upload).
- You can customize object descriptions in script.js inside the `descriptions` object.

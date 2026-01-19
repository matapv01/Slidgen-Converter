# Copilot Instructions for Converter Project

## Project Overview
- This project is a web-based converter tool that uses Puppeteer for server-side rendering and exporting of HTML slides to PNG and PDF.
- The main components are:
  - `puppeteer-server.js`: Node.js server exposing endpoints for screenshot and PDF generation using Puppeteer.
  - `puppeteer-client.js`: Client-side JS that communicates with the Puppeteer server to export slides.
  - `main.py`, `html_lib.py`, `test.py`: Python scripts for additional processing or automation.
  - HTML files (`edit.html`, `edit-goc.html`, `input.html`, `output.html`): User interfaces for editing and viewing slides.

## Key Workflows
- **Start Puppeteer Server:**
  - Run `node puppeteer-server.js` (or use `start-server.bat` on Windows) to launch the Puppeteer backend on port 3001.
- **Export Slide as PNG/PDF:**
  - The client (`puppeteer-client.js`) calls `/generate-screenshot` or `/generate-pdf` endpoints with HTML content.
  - Download is triggered in-browser using a Blob and a hidden anchor element.
- **Edit and Preview:**
  - Use `edit.html` for editing slides. The canvas element with id `canvas` is the main export target.

## Patterns & Conventions
- All Puppeteer server endpoints expect JSON with `htmlContent`, `slideTitle`, and `options`.
- Default export size is 1920x1080. PDF exports use zero margins and can be landscape.
- Client code checks server health before export and retries PDF generation up to 3 times on failure.
- All downloads are initiated client-side; no files are saved on the server.
- Python scripts are standalone and not directly integrated with the Puppeteer workflow.

## Integration Points
- The client and server communicate via HTTP (fetch API). No WebSocket or persistent connection.
- No database or persistent storage is used; all processing is in-memory and per-request.
- External dependencies: Puppeteer (Node.js), standard browser APIs, Python 3.x (for scripts).

## Examples
- To export a slide as PNG:
  ```js
  window.exportSlideAsPNG('my-slide');
  ```
- To export as PDF:
  ```js
  window.exportSlideAsPDF('my-slide');
  ```

## File References
- `puppeteer-client.js`: Client logic and export helpers
- `puppeteer-server.js`: Server logic for rendering
- `edit.html`: Main UI for editing/exporting
- `start-server.bat`: Windows batch to start server

---
For questions about architecture or workflow, see code comments in `puppeteer-client.js` and `puppeteer-server.js`.

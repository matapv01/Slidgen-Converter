# HTML Slide Converter & Editor

A web-based tool for converting and editing HTML slides with real-time preview.

## Project Structure

```
Converter/
├── docker/                     # Docker configuration files
│   ├── Dockerfile.converter    # Node.js converter service
│   ├── Dockerfile.web         # Web server for editor
│   └── docker-compose.yml     # Docker compose configuration
├── Converter/                 # HTML to absolute converter service
│   ├── converter.js          # Main converter script
│   ├── html_lib.py          # Python template library
│   └── test.py              # Test template generator
├── Editor/                   # Web editor interface
│   ├── edit.html            # Main editor UI
│   ├── css/                 # Editor styles
│   └── js/                  # Editor scripts
├── public/                   # Served static files
│   ├── input.html           # Source HTML template
│   └── output.html          # Converted HTML output
└── server.js                # Express server
```

## Architecture

1. **Converter Service**:
   - Node.js service using Puppeteer for HTML conversion
   - Converts relative positioned HTML to absolute positioned
   - Runs in an isolated container

2. **Web Editor**:
   - Interactive HTML editor with live preview
   - Drag & drop interface for slide elements
   - Property panel for element styling

3. **Express Server**:
   - Serves the web editor interface
   - Coordinates conversion requests
   - Handles file operations

## Docker Setup

1. **Build & Run**:
```bash
cd Converter
docker-compose up --build
```

2. **Services**:
- Editor: http://localhost:3000
- Converter: http://localhost:3001

## Development

1. **Local Setup**:
```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Run development server
npm run dev
```

2. **Testing**:
```bash
# Test converter
node Converter/test.js

# Test Python templates
python Converter/test.py
```

## API Endpoints

1. **Convert HTML**:
```
POST /api/convert
Body: { html: string }
Returns: { converted: string }
```

2. **Save Template**:
```
POST /api/save
Body: { name: string, html: string }
```

## File Formats

1. **Input HTML**:
- Regular HTML with relative positioning
- Uses CSS Flexbox/Grid for layout

2. **Output HTML**: 
- Absolute positioned elements
- Self-contained styles
- Resolution independent

## Docker Configuration

1. **Network Flow**:
```
User -> Nginx (80) -> Express (3000) -> Converter (3001)
```

2. **Volume Mounts**:
- `/app/public` - Shared between containers
- `/app/Editor` - Web editor files
- `/app/Converter` - Converter service

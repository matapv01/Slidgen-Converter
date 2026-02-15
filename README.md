# SlidegenWeb2 - HTML Slide Converter & Editor

A web-based tool for generating, converting, and editing HTML presentation slides with real-time preview.

## Project Structure

```
SlidegenWeb2/
├── Converter/
│   └── Converter/
│       ├── html_lib.py              # Thư viện slide templates (generate_* functions)
│       ├── converter.js             # Node.js converter (relative → absolute positioning)
│       ├── converter.py             # Python wrapper gọi converter.js
│       ├── test_all_slides.py       # Tự động generate tất cả slides từ html_lib
│       ├── convert_all_slides.py    # Tự động convert tất cả slides
│       ├── test.py                  # Test đơn lẻ
│       ├── tool_des.py              # Tool descriptions
│       ├── package.json             # Node.js dependencies
│       └── all_slides_test/         # Output: slides đã generate
├── frontend/                        # Web editor interface
├── backend/                         # Backend API server
├── docker/                          # Docker configuration
├── tools/                           # Utility tools
├── requirements.txt                 # Python dependencies
└── README.md
```

## Requirements

- **Python** >= 3.8
- **Node.js** >= 18.0.0 (cần cho converter, dùng Puppeteer)
- **npm** (đi kèm Node.js 18+)

## Installation

### 1. Cài Node.js 18+

```bash
# Thêm NodeSource repo và cài Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Kiểm tra version
node --version   # >= v18.x.x
```

> **Note:** Nếu gặp lỗi conflict với `libnode-dev` hoặc `libnode72`, chạy:
> ```bash
> dpkg --force-depends --remove libnode72 nodejs libnode-dev
> apt-get install -y nodejs
> ```

### 2. Cài Node.js dependencies (Puppeteer + Chromium)

```bash
cd Converter/Converter
npm install
```

> **Note:** Lần đầu sẽ tải Chromium (~170MB), cần vài phút.

### 3. Cài Python dependencies

```bash
pip install -r requirements.txt
```

## Usage

### Bước 1: Generate tất cả slides từ html_lib

Script tự động phát hiện tất cả hàm `generate_*` trong `html_lib.py` (dùng `inspect` module) và gọi với default parameters:

```bash
cd Converter/Converter
python test_all_slides.py
```

Output: thư mục `all_slides_test/` chứa tất cả file HTML slides.

### Bước 2: Convert slides (relative → absolute positioning)

Chuyển đổi tất cả slides từ `all_slides_test/` sang `converted_slides/`:

```bash
cd Converter/Converter
python convert_all_slides.py
```

### Convert đơn lẻ

```bash
cd Converter/Converter
python converter.py  # Mặc định: input.html → output.html
```

## Architecture

1. **html_lib.py** — Thư viện Python chứa 114+ hàm `generate_*()`, mỗi hàm trả về HTML string cho 1 loại slide

2. **test_all_slides.py** — Dùng `inspect.getmembers()` để tự động phát hiện tất cả hàm `generate_*` → không hardcode tên hàm

3. **converter.js** — Node.js + Puppeteer, mở HTML trong headless Chrome và chuyển đổi layout từ relative → absolute positioning

4. **convert_all_slides.py** — Quét thư mục `all_slides_test/*.html` và convert từng file → không hardcode tên file

## Docker Setup

```bash
cd Converter
docker-compose up --build
```

Services:
- Editor: http://localhost:3000
- Converter: http://localhost:3001

## API Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/convert` | `{ html: string }` | Convert HTML slide |
| POST | `/api/save` | `{ name: string, html: string }` | Save template |

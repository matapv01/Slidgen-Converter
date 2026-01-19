import os
import tempfile
import subprocess
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CONVERTER_JS_PATH = os.path.join(REPO_ROOT, 'Converter', 'Converter', 'converter.js')


def run_node_converter(input_path: str, output_path: str) -> None:
    if not os.path.isfile(CONVERTER_JS_PATH):
        raise FileNotFoundError(f"converter.js not found at {CONVERTER_JS_PATH}")

    cmd = [
        'node',
        CONVERTER_JS_PATH,
        input_path,
        output_path,
    ]

    proc = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        cwd=REPO_ROOT,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Converter failed (code {proc.returncode}): {proc.stderr}\n{proc.stdout}")


@app.get('/health')
def health() -> Response:
    return jsonify({'status': 'ok'})


@app.post('/convert/upload')
def convert_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided under form field "file"'}), 400

    uploaded = request.files['file']
    if uploaded.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, 'input.html')
            output_path = os.path.join(tmpdir, 'output.html')
            uploaded.save(input_path)

            run_node_converter(input_path, output_path)

            with open(output_path, 'rb') as f:
                html_bytes = f.read()
            return Response(html_bytes, mimetype='text/html')
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


@app.post('/convert/html')
def convert_html():
    data = request.get_json(silent=True) or {}
    html = data.get('html')
    if not html:
        return jsonify({'error': 'Missing "html" string in JSON body'}), 400

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, 'input.html')
            output_path = os.path.join(tmpdir, 'output.html')
            with open(input_path, 'w', encoding='utf-8') as f:
                f.write(html)

            run_node_converter(input_path, output_path)

            with open(output_path, 'rb') as f:
                html_bytes = f.read()
            return Response(html_bytes, mimetype='text/html')
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


@app.post('/convert/url')
def convert_url():
    data = request.get_json(silent=True) or {}
    url = data.get('url')
    if not url:
        return jsonify({'error': 'Missing "url" in JSON body'}), 400

    # Simple fetch via requests to persist HTML then convert
    try:
        import requests
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()

        with tempfile.TemporaryDirectory() as tmpdir:
            input_path = os.path.join(tmpdir, 'input.html')
            output_path = os.path.join(tmpdir, 'output.html')
            with open(input_path, 'w', encoding='utf-8') as f:
                f.write(resp.text)

            run_node_converter(input_path, output_path)

            with open(output_path, 'rb') as f:
                html_bytes = f.read()
            return Response(html_bytes, mimetype='text/html')
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=True)



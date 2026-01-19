import subprocess
import os

def run_html_converter(input_file, output_file):
    js_script_path = 'converter.js'
    if not os.path.exists(js_script_path):
        print(f"Lỗi: Không tìm thấy file script '{js_script_path}'.")
        return
    if not os.path.exists(input_file):
        print(f"Lỗi: Không tìm thấy file input '{input_file}'.")
        return

    print(f"[Python] Chuẩn bị gọi script: {js_script_path}")
    print(f"[Python]  - File nguồn: {input_file}")
    print(f"[Python]  - File đích:  {output_file}")
    
    try:
        command = ['node', js_script_path, input_file, output_file]
        result = subprocess.run(
            command, capture_output=True, text=True, check=True, encoding='utf-8'
        )
        print("\n--- Log từ Node.js ---")
        print(result.stdout)
        print("------------------------")
        print(f"[Python] Script Node.js đã thực thi thành công!")
        print(f"[Python] File kết quả đã được tạo tại: {output_file}")

    except FileNotFoundError:
        print("\n[LỖI] Lệnh 'node' không được tìm thấy.")
    except subprocess.CalledProcessError as e:
        print("\n[LỖI] Script Node.js đã gặp sự cố.")
        print("\n--- Log lỗi từ Node.js ---\n" + e.stderr + "---------------------------")

if __name__ == "__main__":
    run_html_converter('input.html', 'output.html')
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script chuyển đổi liên tục tất cả slides từ all_slides_test sang converted_slides
Chạy không ngừng cho đến khi hoàn thành tất cả files
"""

import os
import time
from pathlib import Path
from converter import run_html_converter

def convert_all_continuous():
    """
    Chuyển đổi liên tục tất cả files từ all_slides_test sang converted_slides
    """
    # Thư mục nguồn và đích
    input_dir = Path("all_slides_test")
    output_dir = Path("converted_slides")
    
    # Tạo thư mục đích nếu chưa có
    output_dir.mkdir(exist_ok=True)
    print(f"✅ Đã tạo thư mục: {output_dir}")
    
    # Lấy danh sách tất cả file HTML (bỏ qua index.html)
    html_files = sorted([f for f in input_dir.glob("*.html") if f.is_file() and f.name != "index.html"])
    total_files = len(html_files)
    
    print(f"\n🔄 Bắt đầu chuyển đổi liên tục {total_files} file HTML...")
    print("=" * 80)
    
    # Thống kê
    success_count = 0
    error_count = 0
    skipped_count = 0
    start_time = time.time()
    
    for i, html_file in enumerate(html_files, 1):
        # Tên file đầu ra
        output_filename = html_file.stem + "_converted.html"
        output_path = output_dir / output_filename
        
        # Kiểm tra file đã tồn tại chưa
        if output_path.exists():
            print(f"⏭️  [{i}/{total_files}] Đã tồn tại: {output_filename}")
            skipped_count += 1
            continue
        
        print(f"\n📄 [{i}/{total_files}] Đang chuyển đổi: {html_file.name}")
        print(f"    Input:  {html_file}")
        print(f"    Output: {output_path}")
        
        try:
            # Chuyển đổi file
            run_html_converter(str(html_file), str(output_path))
            
            # Kiểm tra file đã được tạo chưa
            if output_path.exists():
                print(f"    ✅ Thành công: {output_filename}")
                success_count += 1
            else:
                print(f"    ❌ Lỗi: File không được tạo")
                error_count += 1
                
        except KeyboardInterrupt:
            print(f"\n\n⚠️  Người dùng đã dừng quá trình tại file {i}/{total_files}")
            break
        except Exception as e:
            print(f"    ❌ Lỗi ngoại lệ: {str(e)}")
            error_count += 1
        
        # Thêm delay nhỏ để tránh quá tải
        time.sleep(0.5)
    
    # Thống kê cuối cùng
    end_time = time.time()
    duration = end_time - start_time
    
    print("\n" + "=" * 80)
    print("📊 KẾT QUẢ CHUYỂN ĐỔI LIÊN TỤC:")
    print(f"✅ Thành công: {success_count} files")
    print(f"❌ Lỗi: {error_count} files")
    print(f"⏭️  Đã tồn tại: {skipped_count} files")
    print(f"📁 Tổng cộng: {total_files} files")
    print(f"⏱️  Thời gian: {duration:.1f} giây")
    print(f"📂 File đã lưu tại: {output_dir}/")
    
    if success_count + skipped_count == total_files:
        print("\n🎉 HOÀN THÀNH! Đã chuyển đổi tất cả slides thành công!")
    else:
        print(f"\n⚠️  Còn {total_files - success_count - skipped_count} files chưa được chuyển đổi")
    
    return {
        "total": total_files,
        "success": success_count,
        "error": error_count,
        "skipped": skipped_count,
        "duration": duration
    }

def create_final_index():
    """
    Tạo file index.html cuối cùng cho tất cả slides đã chuyển đổi
    """
    output_dir = Path("converted_slides")
    
    if not output_dir.exists():
        print("❌ Thư mục converted_slides không tồn tại!")
        return
    
    # Lấy danh sách tất cả file đã chuyển đổi
    converted_files = sorted([f for f in output_dir.glob("*_converted.html") if f.is_file()])
    
    html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Danh sách các Slide đã chuyển đổi</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #333;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }}
        .stats {{
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }}
        .slide-card {{
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: #fafafa;
            transition: transform 0.2s, box-shadow 0.2s;
        }}
        .slide-card:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }}
        .slide-link {{
            color: #2196F3;
            text-decoration: none;
            font-weight: 500;
            display: block;
            margin-bottom: 8px;
        }}
        .slide-link:hover {{
            text-decoration: underline;
        }}
        .slide-name {{
            color: #666;
            font-size: 0.9em;
            font-family: monospace;
        }}
        .timestamp {{
            color: #999;
            font-size: 0.8em;
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Danh sách các Slide đã chuyển đổi (từ all_slides_test)</h1>
        
        <div class="stats">
            <strong>📊 Tổng cộng: {len(converted_files)} slides đã được chuyển đổi thành công</strong>
        </div>
        
        <div class="grid">
"""
    
    for i, file_path in enumerate(converted_files, 1):
        # Tạo tên hiển thị từ tên file
        display_name = file_path.stem.replace('_converted', '').replace('_', ' ').title()
        
        html_content += f"""            <div class="slide-card">
                <a href="{file_path.name}" class="slide-link" target="_blank">
                    {i:02d}. {display_name}
                </a>
                <div class="slide-name">{file_path.name}</div>
            </div>
"""
    
    html_content += f"""        </div>
        
        <div class="timestamp">
            📅 Tạo lúc: {time.strftime('%d/%m/%Y %H:%M:%S')}
        </div>
    </div>
</body>
</html>"""
    
    # Lưu file index
    index_path = output_dir / "index.html"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Đã tạo file index tại: {index_path}")

if __name__ == "__main__":
    print("🚀 Bắt đầu chuyển đổi liên tục tất cả slides...")
    print("⚡ Chạy không ngừng cho đến khi hoàn thành!")
    print("💡 Bấm Ctrl+C để dừng nếu cần thiết")
    print("-" * 80)
    
    try:
        # Chuyển đổi tất cả files
        result = convert_all_continuous()
        
        # Tạo file index cuối cùng
        if result["success"] > 0:
            print("\n📝 Đang tạo file index...")
            create_final_index()
        
        print("\n🎯 Quá trình chuyển đổi đã hoàn tất!")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Quá trình đã bị dừng bởi người dùng")
    except Exception as e:
        print(f"\n❌ Lỗi nghiêm trọng: {e}")

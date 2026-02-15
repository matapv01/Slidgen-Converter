#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script chuyển đổi tất cả slides từ all_slides_test sang converted_slides.
Tự động phát hiện tất cả file HTML - không hardcode tên file.
"""

import os
import time
from pathlib import Path
from converter import run_html_converter


def convert_all_continuous():
    """
    Chuyển đổi tất cả files HTML từ all_slides_test sang converted_slides.
    Tự động quét thư mục nguồn - hoạt động với bất kỳ file nào.
    """
    input_dir = Path("all_slides_test")
    output_dir = Path("converted_slides")
    
    if not input_dir.exists():
        print(f"❌ Thư mục nguồn '{input_dir}' không tồn tại!")
        print("💡 Chạy test_all_slides.py trước để tạo slides.")
        return {"total": 0, "success": 0, "error": 0, "skipped": 0, "duration": 0}
    
    output_dir.mkdir(exist_ok=True)
    print(f"✅ Thư mục đích: {output_dir}")
    
    # Lấy tất cả file HTML (bỏ qua index.html)
    html_files = sorted([
        f for f in input_dir.glob("*.html")
        if f.is_file() and f.name != "index.html"
    ])
    total_files = len(html_files)
    
    if total_files == 0:
        print("⚠️  Không tìm thấy file HTML nào trong thư mục nguồn!")
        return {"total": 0, "success": 0, "error": 0, "skipped": 0, "duration": 0}
    
    print(f"\n🔄 Bắt đầu chuyển đổi {total_files} file HTML...")
    print("=" * 80)
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    start_time = time.time()
    
    for i, html_file in enumerate(html_files, 1):
        output_filename = html_file.stem + "_converted.html"
        output_path = output_dir / output_filename
        
        # Skip nếu đã tồn tại
        if output_path.exists():
            print(f"⏭️  [{i}/{total_files}] Đã tồn tại: {output_filename}")
            skipped_count += 1
            continue
        
        print(f"\n📄 [{i}/{total_files}] Đang chuyển đổi: {html_file.name}")
        
        try:
            run_html_converter(str(html_file), str(output_path))
            
            if output_path.exists():
                print(f"    ✅ Thành công: {output_filename}")
                success_count += 1
            else:
                print(f"    ❌ Lỗi: File không được tạo")
                error_count += 1
                
        except KeyboardInterrupt:
            print(f"\n\n⚠️  Đã dừng tại file {i}/{total_files}")
            break
        except Exception as e:
            print(f"    ❌ Lỗi: {str(e)}")
            error_count += 1
        
        time.sleep(0.5)
    
    duration = time.time() - start_time
    
    print("\n" + "=" * 80)
    print("📊 KẾT QUẢ:")
    print(f"  ✅ Thành công: {success_count}")
    print(f"  ❌ Lỗi: {error_count}")
    print(f"  ⏭️  Bỏ qua: {skipped_count}")
    print(f"  📁 Tổng: {total_files}")
    print(f"  ⏱️  Thời gian: {duration:.1f}s")
    
    if success_count + skipped_count == total_files:
        print("\n🎉 HOÀN THÀNH!")
    else:
        print(f"\n⚠️  Còn {total_files - success_count - skipped_count} files chưa chuyển đổi")
    
    return {
        "total": total_files,
        "success": success_count,
        "error": error_count,
        "skipped": skipped_count,
        "duration": duration
    }


def create_final_index():
    """Tạo file index.html cho tất cả slides đã chuyển đổi"""
    output_dir = Path("converted_slides")
    
    if not output_dir.exists():
        print("❌ Thư mục converted_slides không tồn tại!")
        return
    
    converted_files = sorted([
        f for f in output_dir.glob("*_converted.html") if f.is_file()
    ])
    
    if not converted_files:
        print("⚠️  Không có file nào đã chuyển đổi!")
        return
    
    # Build card HTML
    cards_html = ""
    for i, file_path in enumerate(converted_files, 1):
        display_name = file_path.stem.replace('_converted', '').replace('_', ' ').title()
        cards_html += f"""            <div class="slide-card">
                <a href="{file_path.name}" class="slide-link" target="_blank">
                    {i:02d}. {display_name}
                </a>
                <div class="slide-name">{file_path.name}</div>
            </div>
"""

    html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slides đã chuyển đổi</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0; padding: 20px; background: #f5f5f5;
        }}
        .container {{
            max-width: 1200px; margin: 0 auto; background: white;
            padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        h1 {{ color: #333; text-align: center; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }}
        .stats {{ background: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 30px; text-align: center; }}
        .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }}
        .slide-card {{
            border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #fafafa;
            transition: transform 0.2s, box-shadow 0.2s;
        }}
        .slide-card:hover {{ transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }}
        .slide-link {{ color: #2196F3; text-decoration: none; font-weight: 500; display: block; margin-bottom: 8px; }}
        .slide-link:hover {{ text-decoration: underline; }}
        .slide-name {{ color: #666; font-size: 0.9em; font-family: monospace; }}
        .timestamp {{ color: #999; font-size: 0.8em; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Slides đã chuyển đổi</h1>
        <div class="stats">
            <strong>📊 Tổng: {len(converted_files)} slides</strong>
        </div>
        <div class="grid">
{cards_html}        </div>
        <div class="timestamp">📅 {time.strftime('%d/%m/%Y %H:%M:%S')}</div>
    </div>
</body>
</html>"""
    
    index_path = output_dir / "index.html"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Đã tạo index: {index_path}")


if __name__ == "__main__":
    print("🚀 Bắt đầu chuyển đổi tất cả slides...")
    print("💡 Bấm Ctrl+C để dừng\n")
    
    try:
        result = convert_all_continuous()
        
        if result["success"] > 0:
            print("\n📝 Đang tạo file index...")
            create_final_index()
        
        print("\n🎯 Hoàn tất!")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Đã dừng bởi người dùng")
    except Exception as e:
        print(f"\n❌ Lỗi: {e}")

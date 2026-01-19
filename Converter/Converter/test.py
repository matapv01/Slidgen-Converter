def generate_workout_slide(
    main_title: str = "THE WORKOUT\nTHAT STOOD OUT",
    description: str = "Based on your tracking, identify the activity you did most often this year and share why it's your favorite. Include photos of you doing and enjoying the activity.",
    image1_url: str = "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop",
    image2_url: str = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
    accent_color: str = "#CDFF00",
    bg_color: str = "#1a1a1a",
    text_color: str = "#ffffff",
    font_family: str = "'Inter', sans-serif"
) -> str:
    """
    Tạo slide HTML cho workout/fitness với phong cách tối và màu nhấn neon.
    
    Args:
        main_title: Tiêu đề chính (dùng \\n để xuống dòng)
        description: Đoạn mô tả bên phải
        image1_url: URL hình ảnh thứ nhất
        image2_url: URL hình ảnh thứ hai
        accent_color: Màu nhấn (mặc định xanh lá neon)
        bg_color: Màu nền (mặc định tối)
        text_color: Màu chữ mô tả
        font_family: Font chữ
    
    Returns:
        Chuỗi HTML hoàn chỉnh của slide
    """
    
    # Xử lý tiêu đề có xuống dòng
    title_lines = main_title.split('\n')
    title_html = ''.join([f'<div>{line}</div>' for line in title_lines])
    
    html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=1920, height=1080">
    <title>Workout Slide</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: {font_family};
            background-color: {bg_color};
            width: 1920px;
            height: 1080px;
            position: relative;
            overflow: hidden;
            padding: 60px 80px;
        }}
        
        /* Header section */
        .header-section {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 50px;
        }}
        
        /* Tiêu đề chính */
        .main-title {{
            font-family: {font_family};
            font-size: 100px;
            font-weight: 900;
            font-style: italic;
            line-height: 0.95;
            color: {accent_color};
            text-transform: uppercase;
            max-width: 900px;
        }}
        
        /* Mô tả */
        .description {{
            font-family: {font_family};
            font-size: 20px;
            font-weight: 500;
            line-height: 1.6;
            color: {text_color};
            max-width: 420px;
            text-align: left;
            margin-top: 20px;
        }}
        
        /* Container cho 2 hình ảnh */
        .images-container {{
            display: flex;
            gap: 40px;
            margin-top: 40px;
        }}
        
        /* Khung hình ảnh */
        .image-frame {{
            position: relative;
            width: 580px;
            height: 420px;
        }}
        
        /* Viền màu accent */
        .image-border {{
            position: absolute;
            top: -8px;
            left: -8px;
            right: -8px;
            bottom: -8px;
            border: 4px solid {accent_color};
            pointer-events: none;
        }}
        
        /* Hình ảnh */
        .image-frame img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: grayscale(100%) contrast(1.1);
        }}
        
        /* Hiệu ứng halftone overlay */
        .halftone-overlay {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle, transparent 40%, {bg_color} 41%);
            background-size: 4px 4px;
            opacity: 0.3;
            pointer-events: none;
        }}
    </style>
</head>
<body>
    <!-- Header với tiêu đề và mô tả -->
    <div class="header-section">
        <h1 class="main-title">{title_html}</h1>
        <p class="description">{description}</p>
    </div>
    
    <!-- Container hình ảnh -->
    <div class="images-container">
        <!-- Hình ảnh 1 -->
        <div class="image-frame">
            <div class="image-border"></div>
            <img src="{image1_url}" alt="Workout image 1">
            <div class="halftone-overlay"></div>
        </div>
        
        <!-- Hình ảnh 2 -->
        <div class="image-frame">
            <div class="image-border"></div>
            <img src="{image2_url}" alt="Workout image 2">
            <div class="halftone-overlay"></div>
        </div>
    </div>
</body>
</html>'''
    
    return html



custom_slide = generate_workout_slide()

# Save to HTML file
with open("input.html", "w", encoding="utf-8") as f:
    f.write(custom_slide)

def generate_process_steps_slide(
    main_title="Cách tiếp cận đề xuất",
    steps=[
        {
            "image_url": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2940&auto=format&fit=crop",
            "title": "Thiết lập nền tảng số",
            "description": "Thuyết trình là công cụ giao tiếp có thể dùng để giảng dạy."
        },
        {
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
            "title": "Ra mắt các chiến dịch số",
            "description": "Thuyết trình là công cụ giao tiếp có thể dùng để giảng dạy."
        },
        {
            "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2940&auto=format&fit=crop",
            "title": "Theo dõi kết quả",
            "description": "Thuyết trình là công cụ giao tiếp có thể dùng để giảng dạy."
        }
    ],
    accent_color="#EAD6D6",
    bg_color="#FCFCFC",
    title_color="#1F2937",
    text_heading_color="#374151",
    text_body_color="#6B7280",
    font_family_title="'Playfair Display', serif",
    font_family_body="'Montserrat', sans-serif",
    custom_css=""
):
    """
    Generates a structured, multi-step process or plan slide.
    Features a three-column layout with a title panel, an image strip, and corresponding text.
    """
    
    images_html = ""
    steps_text_html = ""
    for step in steps:
        images_html += f"<img src='{step.get('image_url', '')}' alt='{step.get('title', '')}' class='step-image'>"
        steps_text_html += f"""
        <div class="step-item">
            <h3 class="step-title">{step.get('title', '')}</h3>
            <p class="step-description">{step.get('description', '')}</p>
        </div>
        """

    html_code = f"""<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{main_title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500&family=Montserrat:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {{ font-size: 16px; }}
        body, html {{
            margin: 0; padding: 0; height: 100%; width: 100%;
            font-family: {font_family_body};
            overflow: hidden;
            background-color: {bg_color};
        }}
        
        .slide-container {{
            width: 100%; height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }}
        
        .content-wrapper {{
            display: flex;
            width: 100%; height: 100%;
            max-width: 80rem; /* 1280px */
        }}
        
        .title-section {{
            flex: 0 0 30%;
            background-color: {accent_color};
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            box-sizing: border-box;
        }}
        
        .main-title {{
            font-family: {font_family_title};
            font-size: 3rem;
            font-weight: 500;
            font-style: italic;
            color: {title_color};
            line-height: 1.3;
            text-align: center;
        }}
        
        .steps-layout {{
            flex: 1;
            display: flex;
            align-items: center;
            padding: 3rem 4rem;
        }}
        
        .image-strip-section {{
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 1.5rem;
            height: 100%;
            max-height: 35rem; /* 560px */
        }}
        .step-image {{
            width: 10rem; /* 160px */
            height: 10rem; /* 160px */
            object-fit: cover;
            box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.07);
        }}
        
        .steps-text-section {{
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding-left: 3rem;
            height: 100%;
            max-height: 35rem; /* 560px */
        }}
        .step-item {{
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }}
        .step-title {{
            font-size: 1.25rem;
            font-weight: 500;
            color: {text_heading_color};
            margin: 0 0 0.5rem 0;
        }}
        .step-description {{
            font-size: 0.9rem;
            color: {text_body_color};
            line-height: 1.6;
            margin: 0;
            max-width: 25rem; /* 400px */
        }}

        @media (max-width: 64em) {{ /* 1024px */
            .steps-layout {{ padding: 2rem; }}
            .main-title {{ font-size: 2.5rem; }}
        }}

        @media (max-width: 48em) {{ /* 768px */
            .content-wrapper {{ flex-direction: column; }}
            .title-section {{ flex: 0 0 auto; width: 100%; height: 8rem; }}
            .steps-layout {{ flex-direction: column; padding: 2rem; align-items: flex-start; overflow-y: auto; }}
            .image-strip-section, .steps-text-section {{
                 flex-direction: row; justify-content: flex-start; gap: 1rem;
                 width: 100%; max-height: none; height: auto;
                 padding-left: 0;
            }}
             .image-strip-section {{
                 align-items: flex-start; /* Fix image alignment */
                 flex-wrap: wrap; /* Allow wrapping */
             }}
            .steps-text-section {{
                display: block; /* Change from flex to block */
            }}
            .step-item {{ margin-bottom: 2rem; }}
            .step-image {{ width: 8rem; height: 8rem; }}
        }}
    </style>
</head>
<body>
    <div class="slide-container">
        <div class="content-wrapper">
            <div class="title-section">
                <h1 class="main-title">{main_title}</h1>
            </div>
            <div class="steps-layout">
                <div class="image-strip-section">
                    {images_html}
                </div>
                <div class="steps-text-section">
                    {steps_text_html}
                </div>
            </div>
        </div>
    </div>
</body>
</html>"""
    return html_code

custom_slide = generate_process_steps_slide()

# Save to HTML file
with open("test.html", "w", encoding="utf-8") as f:
    f.write(custom_slide)

print("Custom slide generated successfully! Open 'presentation_slide.html' in your browser.")

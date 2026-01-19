"""
Test script to generate all slides from html_lib module
This script creates HTML files for all slide generation functions in html_lib.py
"""

import os
from html_lib import *

def create_output_directory():
    """Create output directory for all generated slides"""
    output_dir = "all_slides_test"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    return output_dir

def save_slide(html_content, filename, output_dir):
    """Save slide HTML content to file"""
    filepath = os.path.join(output_dir, f"{filename}.html")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"✓ Generated: {filename}.html")

def test_all_slides():
    """Generate all slides from html_lib module"""
    output_dir = create_output_directory()
    print(f"Generating all slides in directory: {output_dir}\n")
    
    # Title and Introduction Slides
    print("=== TITLE & INTRODUCTION SLIDES ===")
    
    # 1. Title Slide
    slide = generate_title_slide()
    save_slide(slide, "01_title_slide", output_dir)
    
    # 2. Introduction Slide
    slide = generate_introduction_slide()
    save_slide(slide, "02_introduction_slide", output_dir)
    
    # 3. Intro Slide 1
    slide = generate_intro_slide1()
    save_slide(slide, "03_intro_slide1", output_dir)
    
    # 4. Elegant Intro Slide
    slide = generate_elegant_intro_slide()
    save_slide(slide, "04_elegant_intro_slide", output_dir)
    
    # 5. Inspirational Quote Slide
    slide = generate_inspirational_quote_slide()
    save_slide(slide, "05_inspirational_quote_slide", output_dir)
    
    # 6. Title Slide 2
    slide = generate_title_slide_2()
    save_slide(slide, "06_title_slide_2", output_dir)
    
    # 7. Dynamic Intro Slide
    slide = generate_dynamic_intro_slide()
    save_slide(slide, "07_dynamic_intro_slide", output_dir)
    
    # 8. Big Concept Slide
    slide = generate_big_concept_slide()
    save_slide(slide, "08_big_concept_slide", output_dir)
    
    # 9. Elegant Agenda Slide
    slide = generate_elegant_agenda_slide()
    save_slide(slide, "09_elegant_agenda_slide", output_dir)
    
    # 10. Playful Title Slide
    slide = generate_playful_title_slide()
    save_slide(slide, "10_playful_title_slide", output_dir)
    
    # 11. Minimalist Title Slide
    slide = generate_minimalist_title_slide()
    save_slide(slide, "11_minimalist_title_slide", output_dir)
    
    # 12. Mission Slide
    slide = generate_mission_slide()
    save_slide(slide, "12_mission_slide", output_dir)
    
    # 13. Intro Slide (alternative)
    slide = generate_intro_slide()
    save_slide(slide, "13_intro_slide", output_dir)
    
    print("\n=== TRANSITION SLIDES ===")
    
    # 14. Geometric Transition Slide
    slide = generate_geometric_transition_slide()
    save_slide(slide, "14_geometric_transition_slide", output_dir)
    
    # 15. Transition Slide 2
    slide = generate_transition_slide_2()
    save_slide(slide, "15_transition_slide_2", output_dir)
    
    # 16. Dusk Transition Slide
    slide = generate_dusk_transition_slide()
    save_slide(slide, "16_dusk_transition_slide", output_dir)
    
    # 17. Memphis Transition Slide
    slide = generate_memphis_transition_slide()
    save_slide(slide, "17_memphis_transition_slide", output_dir)
    
    print("\n=== SECTION HEADER SLIDES ===")
    
    # 19. Pushpin Section Header
    slide = generate_pushpin_section_header()
    save_slide(slide, "19_pushpin_section_header", output_dir)
    
    # 20. Section Header Slide
    slide = generate_section_header_slide()
    save_slide(slide, "20_section_header_slide", output_dir)
    
    print("\n=== CONTENT SLIDES ===")
    
    # 21. Credits Slide
    slide = generate_credits_slide()
    save_slide(slide, "21_credits_slide", output_dir)
    
    # 22. Content Slide
    slide = generate_content_slide()
    save_slide(slide, "22_content_slide", output_dir)
    
    # 23. Two Column Slide
    slide = generate_two_column_slide()
    save_slide(slide, "23_two_column_slide", output_dir)
    
    # 25. Comparison Slide
    slide = generate_comparison_slide()
    save_slide(slide, "25_comparison_slide", output_dir)
    
    # 26. Process Slide
    slide = generate_process_slide()
    save_slide(slide, "26_process_slide", output_dir)
    
    # 28. Icon List Slide 2
    slide = generate_icon_list_slide_2()
    save_slide(slide, "28_icon_list_slide_2", output_dir)
    
    # 29. Image Cutout List Slide
    slide = generate_image_cutout_list_slide()
    save_slide(slide, "29_image_cutout_list_slide", output_dir)
    
    print("\n=== BODY SLIDES ===")
    
    # 30-49. Body Slides (2-20)
    slide = generate_body_slide2()
    save_slide(slide, "30_body_slide2", output_dir)
    
    slide = generate_body_slide3()
    save_slide(slide, "31_body_slide3", output_dir)
    
    slide = generate_body_slide4()
    save_slide(slide, "32_body_slide4", output_dir)
    
    slide = generate_body_slide5()
    save_slide(slide, "33_body_slide5", output_dir)
    
    slide = generate_body_slide7()
    save_slide(slide, "35_body_slide7", output_dir)
    
    slide = generate_body_slide10()
    save_slide(slide, "36_body_slide10", output_dir)
    
    slide = generate_body_slide11()
    save_slide(slide, "37_body_slide11", output_dir)
    
    slide = generate_body_slide12()
    save_slide(slide, "38_body_slide12", output_dir)
    
    slide = generate_body_slide15()
    save_slide(slide, "41_body_slide15", output_dir)

    slide = generate_body_slide18()
    save_slide(slide, "44_body_slide18", output_dir)
    
    slide = generate_body_slide19()
    save_slide(slide, "45_body_slide19", output_dir)
    
    slide = generate_body_slide20()
    save_slide(slide, "46_body_slide20", output_dir)
    
    print("\n=== STRATEGY & POINTS SLIDES ===")
    
    # 47. Main Points Slide
    slide = generate_main_points_slide()
    save_slide(slide, "48_main_points_slide", output_dir)
    
    # 49. Elegant Points Slide
    slide = generate_elegant_points_slide()
    save_slide(slide, "49_elegant_points_slide", output_dir)
    
    # 50. Horizontal Timeline Slide
    slide = generate_horizontal_timeline_slide()
    save_slide(slide, "50_horizontal_timeline_slide", output_dir)
    
    print("\n=== CORPORATE SLIDES ===")
    
    # 51. Corporate Content Slide
    slide = generate_corporate_content_slide()
    save_slide(slide, "51_corporate_content_slide", output_dir)
    
    # 52. Split Content Slide
    slide = generate_split_content_slide()
    save_slide(slide, "52_split_content_slide", output_dir)
    
    # 53. Corporate Multicolumn Slide
    slide = generate_corporate_multicolumn_slide()
    save_slide(slide, "53_corporate_multicolumn_slide", output_dir)
    
    # 54. Corporate Grid Slide
    slide = generate_corporate_grid_slide()
    save_slide(slide, "54_corporate_grid_slide", output_dir)
    
    # 55. Business Overview Slide
    slide = generate_business_overview_slide()
    save_slide(slide, "55_business_overview_slide", output_dir)
    
    # 56. Vision Mission Slide
    slide = generate_vision_mission_slide()
    save_slide(slide, "56_vision_mission_slide", output_dir)
    
    # 57. Strategic Goals Slide
    slide = generate_strategic_goals_slide()
    save_slide(slide, "57_strategic_goals_slide", output_dir)
    
    # 58. Service Roadmap Slide
    slide = generate_service_roadmap_slide()
    save_slide(slide, "58_service_roadmap_slide", output_dir)
    
    # 59. Financial Projections Slide Dark
    slide = generate_financial_projections_slide_dark()
    save_slide(slide, "59_financial_projections_slide_dark", output_dir)
    
    print("\n=== TECH & LIST SLIDES ===")
    
    # 60. Minimalist Tech List Slide
    slide = generate_minimalist_tech_list_slide()
    save_slide(slide, "60_minimalist_tech_list_slide", output_dir)
    
    # 61. Centered Tech Columns Slide
    slide = generate_centered_tech_columns_slide()
    save_slide(slide, "61_centered_tech_columns_slide", output_dir)
    
    # 62. Split Layout List Slide
    slide = generate_split_layout_list_slide()
    save_slide(slide, "62_split_layout_list_slide", output_dir)
    
    # 63. Reference Slide
    slide = generate_reference_slide()
    save_slide(slide, "63_reference_slide", output_dir)
    
    # 64. Icon List Slide
    slide = generate_icon_list_slide()
    save_slide(slide, "64_icon_list_slide", output_dir)
    
    # 65. Flexible Columns Slide
    slide = generate_flexible_columns_slide()
    save_slide(slide, "65_flexible_columns_slide", output_dir)
    
    # 66. Text with Image Slide
    slide = generate_text_with_image_slide()
    save_slide(slide, "66_text_with_image_slide", output_dir)
    
    # 67. Instructions Slide
    slide = generate_instructions_slide()
    save_slide(slide, "67_instructions_slide", output_dir)
    
    print("\n=== GEOMETRIC SLIDES ===")
    
    # 68. Geometric Split Content Slide
    slide = generate_geometric_split_content_slide()
    save_slide(slide, "68_geometric_split_content_slide", output_dir)
    
    # 69. Geometric Split Content Slide 2
    slide = generate_geometric_split_content_slide_2()
    save_slide(slide, "69_geometric_split_content_slide_2", output_dir)
    
    # 70. Geometric Image Content Slide
    slide = generate_geometric_image_content_slide()
    save_slide(slide, "70_geometric_image_content_slide", output_dir)
    
    # 71. Geometric Content Slide
    slide = generate_geometric_content_slide()
    save_slide(slide, "71_geometric_content_slide", output_dir)
    
    # 72. Geometric Grid Slide
    slide = generate_geometric_grid_slide()
    save_slide(slide, "72_geometric_grid_slide", output_dir)
    
    print("\n=== MEMPHIS STYLE SLIDES ===")
    
    # 73. Memphis Content Slide
    slide = generate_memphis_content_slide()
    save_slide(slide, "73_memphis_content_slide", output_dir)
    
    # 74. Memphis Multicolumn Slide
    slide = generate_memphis_multicolumn_slide()
    save_slide(slide, "74_memphis_multicolumn_slide", output_dir)
    
    # 75. Memphis Grid Slide
    slide = generate_memphis_grid_slide()
    save_slide(slide, "75_memphis_grid_slide", output_dir)
    
    print("\n=== PREMIUM & ABSTRACT SLIDES ===")
    
    # 76. Premium Abstract Slide
    slide = generate_premium_abstract_slide()
    save_slide(slide, "76_premium_abstract_slide", output_dir)
    
    print("\n=== TEAM SLIDES ===")
    
    # 77. Team Slide
    slide = generate_team_slide()
    save_slide(slide, "77_team_slide", output_dir)
    
    # 78. Colorful Team Grid Slide
    slide = generate_colorful_team_grid_slide()
    save_slide(slide, "78_colorful_team_grid_slide", output_dir)
    
    # 79. Corporate Team Slide
    slide = generate_corporate_team_slide()
    save_slide(slide, "79_corporate_team_slide", output_dir)
    
    print("\n=== THANK YOU SLIDES ===")
    
    # 80. Thank You Slide 2
    slide = generate_thank_you_slide_2()
    save_slide(slide, "80_thank_you_slide_2", output_dir)
    
    # 81. Thank You Slide 3
    slide = generate_thank_you_slide_3()
    save_slide(slide, "81_thank_you_slide_3", output_dir)
    
    # 82. Thank You Slide
    slide = generate_thank_you_slide()
    save_slide(slide, "82_thank_you_slide", output_dir)
    
    # 83. Corporate Thank You Slide
    slide = generate_corporate_thank_you_slide()
    save_slide(slide, "83_corporate_thank_you_slide", output_dir)
    
    print(f"\n🎉 SUCCESS! Generated 83 slides in '{output_dir}' directory")
    print(f"📁 Directory: {os.path.abspath(output_dir)}")

if __name__ == "__main__":
    test_all_slides()

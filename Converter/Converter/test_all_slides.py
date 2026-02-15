"""
Test script to generate all slides from html_lib module.
Dynamically discovers all generate_* functions - no hardcoded function names.
When html_lib changes (add/remove/rename functions), this script still works.
"""

import os
import inspect
import html_lib


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
    print(f"  ✓ Generated: {filename}.html")


def get_all_generate_functions():
    """
    Dynamically discover all generate_* functions from html_lib.
    Returns a sorted list of (name, function) tuples.
    Skips nested/inner functions (e.g. generate_planning_phase_slide.get_icon_svg).
    """
    funcs = []
    for name, obj in inspect.getmembers(html_lib):
        if inspect.isfunction(obj) and name.startswith("generate_") and obj.__module__ == html_lib.__name__:
            funcs.append((name, obj))
    funcs.sort(key=lambda x: x[0])
    return funcs


def test_all_slides():
    """Generate all slides from html_lib module dynamically"""
    output_dir = create_output_directory()
    
    # Discover all generate_* functions
    all_funcs = get_all_generate_functions()
    total = len(all_funcs)
    
    print(f"🔍 Discovered {total} generate_* functions in html_lib")
    print(f"📂 Output directory: {os.path.abspath(output_dir)}\n")
    print("=" * 70)
    
    success_count = 0
    error_count = 0
    error_list = []
    
    for i, (func_name, func) in enumerate(all_funcs, 1):
        # Create filename from function name (remove 'generate_' prefix)
        slide_name = func_name.replace("generate_", "")
        filename = f"{i:03d}_{slide_name}"
        
        try:
            # Call with default parameters (no args)
            html_content = func()
            
            if html_content and isinstance(html_content, str):
                save_slide(html_content, filename, output_dir)
                success_count += 1
            else:
                print(f"  ⚠️  [{i}/{total}] {func_name} returned empty/invalid content")
                error_count += 1
                error_list.append((func_name, "Empty or invalid return value"))
                
        except Exception as e:
            print(f"  ❌ [{i}/{total}] {func_name} ERROR: {e}")
            error_count += 1
            error_list.append((func_name, str(e)))
    
    # Summary
    print("\n" + "=" * 70)
    print(f"📊 RESULTS:")
    print(f"  ✅ Success: {success_count}/{total}")
    print(f"  ❌ Errors:  {error_count}/{total}")
    
    if error_list:
        print(f"\n⚠️  Failed functions:")
        for fname, err in error_list:
            print(f"    - {fname}: {err}")
    
    print(f"\n🎉 Done! Generated slides in '{output_dir}' directory")
    print(f"📁 Path: {os.path.abspath(output_dir)}")
    
    return {"total": total, "success": success_count, "error": error_count}


if __name__ == "__main__":
    test_all_slides()

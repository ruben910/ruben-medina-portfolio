import os
from PIL import Image, ImageDraw, ImageFont

# Path of the chosen image
source_image_path = r"C:/Users/ruben/.gemini/antigravity/brain/23c06d49-ff84-4dc3-93f7-599aaf971043/app_icon_google_colors_1784143951954.png"
output_image_path = r"c:\Users\ruben\.gemini\antigravity\scratch\PROYECTOS 2026\ruben-medina-portfolio\assets\og_image_premium.png"

# Verify source exists
if not os.path.exists(source_image_path):
    print("Error: Source image not found at", source_image_path)
else:
    try:
        # Open image
        img = Image.open(source_image_path)
        draw = ImageDraw.Draw(img)
        
        width, height = img.size
        
        # Try to load a modern bold font from Windows
        font_path = "C:/Windows/Fonts/trebucbd.ttf" # Trebuchet Bold
        if not os.path.exists(font_path):
            font_path = "C:/Windows/Fonts/arialbd.ttf" # Fallback to Arial Bold
            
        try:
            # Dynamically size the font relative to image size
            font_size = int(height * 0.08)
            font = ImageFont.truetype(font_path, font_size)
        except:
            font = ImageFont.load_default()
        
        text = "RM"
        
        # Get bounding box of the text to position it
        left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
        text_width = right - left
        text_height = bottom - top
        
        # Position in bottom right, with some padding
        padding = int(width * 0.05)
        x = width - text_width - padding
        y = height - text_height - padding
        
        # Draw shadow/outline for premium tech feel
        shadow_color = (0, 0, 0, 200)
        draw.text((x+3, y+3), text, font=font, fill=shadow_color)
        
        # Draw text (White / Cyan)
        text_color = (255, 255, 255) # Clean White
        draw.text((x, y), text, font=font, fill=text_color)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
        
        img.save(output_image_path)
        print("Successfully created customized image at", output_image_path)
    except Exception as e:
        print("Error processing image:", e)

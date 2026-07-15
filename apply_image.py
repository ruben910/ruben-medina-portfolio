import os

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Add Metadata to Head
meta_tags = """
    <!-- Open Graph & PWA Icons -->
    <meta property="og:image" content="assets/og_image_premium.png">
    <link rel="apple-touch-icon" href="assets/og_image_premium.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
"""

if '<meta property="og:image"' not in text:
    text = text.replace('<title>', meta_tags + '\n    <title>')

# 2. Replace the Main Image (perfil_ruben.jpg inside the layout-grid > image-section > image-wrapper)
if 'assets/perfil_ruben.jpg' in text:
    text = text.replace('assets/perfil_ruben.jpg', 'assets/og_image_premium.png')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("index.html successfully updated")

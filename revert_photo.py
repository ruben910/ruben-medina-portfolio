import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to change the src of the image back to perfil_ruben.jpg in the body layout
# but keep the og:image and apple-touch-icon as og_image_premium.png.

# Use regex to find the img tag using og_image_premium.png and switch it back to perfil_ruben.jpg
text = re.sub(r'<img src="assets/og_image_premium\.png"(.*?)alt="Rubén Medina"', r'<img src="assets/perfil_ruben.jpg"\1alt="Rubén Medina"', text)
text = re.sub(r'<img src="assets/og_image_premium\.png"(.*?)alt="Ruben Medina"', r'<img src="assets/perfil_ruben.jpg"\1alt="Ruben Medina"', text)

# Just in case the alt was different or missing
text = text.replace('<img src="assets/og_image_premium.png" alt="Rubén Medina"', '<img src="assets/perfil_ruben.jpg" alt="Rubén Medina"')
text = text.replace('<img src="assets/og_image_premium.png" class="absolute', '<img src="assets/perfil_ruben.jpg" class="absolute')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Reverted main photo back to perfil_ruben.jpg inside the index.html")

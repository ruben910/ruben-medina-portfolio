with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('src="assets/og_image_premium.png" alt="Rubén Medina', 'src="assets/perfil_ruben.jpg" alt="Rubén Medina')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Reverted!")

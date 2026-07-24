import os
import shutil
import subprocess

# Rutas de las imagenes generadas
brain_dir = r"C:\Users\ruben\.gemini\antigravity-ide\brain\713b41d6-4e60-45c7-886d-076461a33926"
workspace_dir = r"c:\Users\ruben\.gemini\antigravity\scratch\PROYECTOS 2026\ruben-medina-portfolio"
assets_dir = os.path.join(workspace_dir, "assets")

img_oficina_src = os.path.join(brain_dir, "ruben_oficina_v2_1784899553764.png")
img_saludo_src = os.path.join(brain_dir, "ruben_saludo_1784899198249.png")

img_oficina_dest = os.path.join(assets_dir, "ruben_oficina_v2.png")
img_saludo_dest = os.path.join(assets_dir, "ruben_saludo.png")

print("1. Copiando imagenes a la carpeta de assets...")
shutil.copy(img_oficina_src, img_oficina_dest)
shutil.copy(img_saludo_src, img_saludo_dest)
print(" Imagenes copiadas con exito.")

print("2. Corrigiendo el archivo resume.html para que apunte a la carpeta local...")
resume_path = os.path.join(workspace_dir, "resume.html")
with open(resume_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'src="file:///C:/Users/ruben/.gemini/antigravity-ide/brain/713b41d6-4e60-45c7-886d-076461a33926/ruben_oficina_v2_1784899553764.png"',
    'src="assets/ruben_oficina_v2.png"'
)
content = content.replace(
    'src="file:///C:/Users/ruben/.gemini/antigravity-ide/brain/713b41d6-4e60-45c7-886d-076461a33926/ruben_saludo_1784899198249.png"',
    'src="assets/ruben_saludo.png"'
)

with open(resume_path, "w", encoding="utf-8") as f:
    f.write(content)
print(" resume.html actualizado con exito.")

print("3. Ejecutando comandos de Git (Add, Commit, Push)...")
os.chdir(workspace_dir)

try:
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", "Añadir nuevas imágenes de perfil al resumé"], check=True)
    subprocess.run(["git", "push"], check=True)
    print(" Git Push completado con exito. ¡Todo esta en tu repositorio!")
except Exception as e:
    print(f" Error ejecutando Git: {e}")
    print("Asegurate de tener el repositorio vinculado correctamente.")

print("\n=== PROCESO FINALIZADO ===")

@echo off
echo ========================================================
echo   Auto-Subida de Cambios (Antigravity AI)
echo ========================================================
echo.
echo Copiando imagenes a la carpeta assets...
copy "C:\Users\ruben\.gemini\antigravity-ide\brain\29fd7cd9-2e47-4565-a058-8a0f3368e263\perfil_opcion_1_1784842203128.png" "assets\perfil_opcion_1.png"
copy "C:\Users\ruben\.gemini\antigravity-ide\brain\29fd7cd9-2e47-4565-a058-8a0f3368e263\perfil_opcion_2_1784842219803.png" "assets\perfil_opcion_2.png"

echo.
echo Subiendo el portafolio a GitHub...
git add .
git commit -m "feat: integrar efecto hover y subir imagenes generadas"
git push

echo.
echo ========================================================
echo   ¡Éxito! Las imagenes y el código se han subido.
echo   La página en vivo se actualizará en unos minutos.
echo ========================================================
pause

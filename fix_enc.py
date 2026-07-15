import os

def check_and_fix_file(filepath):
    print(f"Buscando en {filepath}")
    with open(filepath, 'rb') as f:
        data = f.read()

    # Si encontramos b'\xe9' (é en Latin-1) y NO b'\xc3\xa9' (é en UTF-8), es que está en Latin-1
    # O podemos intentar decodificar usando utf-8. Si falla, es Latin-1.
    is_utf8 = False
    try:
        data.decode('utf-8')
        is_utf8 = True
    except UnicodeDecodeError:
        is_utf8 = False

    if not is_utf8:
        print(f"{filepath} no es UTF-8. Convirtiendo desde local (Latin-1) a UTF-8...")
        text = data.decode('latin-1')  # o cp1252
        with open(filepath, 'wb') as f:
            f.write(text.encode('utf-8'))
        print(f"[OK] {filepath} convertido a UTF-8.")
    else:
        # A veces es utf-8 pero tiene "Ã©" (doble codificación).
        # "Ã" es \xc3\x83 en utf-8.
        if b'\xc3\x83' in data:
            print(f"{filepath} tiene doble codificaci\xf3n UTF-8. Corrigiendo...")
            text = data.decode('utf-8')
            # el texto se lee como "Ã©", que son los bytes originales latin-1 interpretados como unicode
            # lo volvemos a pasar a bytes asumiendo latin1 y luego decodeamos utf8
            raw_bytes = text.encode('latin-1', errors='ignore')
            fixed_text = raw_bytes.decode('utf-8', errors='replace')
            with open(filepath, 'wb') as f:
                f.write(fixed_text.encode('utf-8'))
            print(f"[OK] {filepath} doble codificaci\xf3n arreglada.")
        else:
            print(f"[OK] {filepath} ya est\xe1 en UTF-8 correcto.")

for file in ['index.html', 'servicios.html', 'portal-vip.html', 'orquestador-ia.html', 'modelos-ia.html']:
    if os.path.exists(file):
        check_and_fix_file(file)

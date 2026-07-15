import re

# Read the markdown
with open('EBOOK_CONTENT_MASTER.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Convert markdown to basic HTML for the reader
html_content = md_content
html_content = re.sub(r'^# (.*?)$', r'<h1 class="text-4xl md:text-5xl font-black text-white mb-6">\1</h1>', html_content, flags=re.MULTILINE)
html_content = re.sub(r'^## (.*?)$', r'<h2 class="text-3xl font-bold text-blue-400 mt-12 mb-6 border-b border-blue-500/20 pb-4">\1</h2>', html_content, flags=re.MULTILINE)
html_content = re.sub(r'^### (.*?)$', r'<h3 class="text-2xl font-bold text-white mt-8 mb-4">\1</h3>', html_content, flags=re.MULTILINE)
html_content = re.sub(r'^#### (.*?)$', r'<h4 class="text-xl font-bold text-emerald-400 mt-6 mb-3">\1</h4>', html_content, flags=re.MULTILINE)
html_content = re.sub(r'\*\*(.*?)\*\*', r'<strong class="text-white">\1</strong>', html_content)
html_content = re.sub(r'\*(.*?)\*', r'<em class="text-blue-200">\1</em>', html_content)

# Handle blockquotes
html_content = re.sub(r'^> (.*?)$', r'<blockquote class="border-l-4 border-primary bg-blue-500/10 p-6 rounded-r-xl text-lg text-blue-100 my-6 italic">\1</blockquote>', html_content, flags=re.MULTILINE)

# Handle lists
html_content = re.sub(r'^\* (.*?)$', r'<li class="mb-2 text-slate-300 flex items-start line-height-relaxed"><span class="text-blue-500 mr-2">✓</span>\1</li>', html_content, flags=re.MULTILINE)

# Paragraphs (very basic, wrapping non-tag lines in <p>)
lines = html_content.split('\n')
formatted_lines = []
in_list = False
for line in lines:
    line = line.strip()
    if not line:
        continue
    if line.startswith('<li'):
        if not in_list:
            formatted_lines.append('<ul class="mb-6 space-y-2">')
            in_list = True
        formatted_lines.append(line)
    else:
        if in_list:
            formatted_lines.append('</ul>')
            in_list = False
        if not line.startswith('<'):
            formatted_lines.append(f'<p class="text-lg text-slate-400 leading-relaxed mb-6">{line}</p>')
        else:
            formatted_lines.append(line)
if in_list:
    formatted_lines.append('</ul>')

final_body = '\n'.join(formatted_lines)

# Create the full HTML web reader
reader_html = f"""<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lectura: E-book Blueprint IA</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    colors: {{
                        main: '#09090b', card: '#121215', primary: '#3b82f6'
                    }},
                    fontFamily: {{ sans: ['Outfit', 'sans-serif'] }}
                }}
            }}
        }}
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {{ background-color: #09090b; color: #ffffff; }}
        ::-webkit-scrollbar {{ width: 8px; }}
        ::-webkit-scrollbar-track {{ background: #09090b; }}
        ::-webkit-scrollbar-thumb {{ background: #333; border-radius: 10px; }}
    </style>
</head>
<body class="flex min-h-screen relative font-sans">
    
    <!-- Sidebar / Progress (Hide on mobile) -->
    <aside class="hidden md:flex w-72 h-screen fixed left-0 top-0 bg-card border-r border-[#1f1f22] flex-col p-8 overflow-y-auto">
        <div class="flex items-center gap-3 border-b border-[#1f1f22] pb-6 mb-6">
            <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/50 text-primary">
                <i data-lucide="book-open"></i>
            </div>
            <div>
                <p class="text-[10px] text-primary uppercase font-bold tracking-widest">Acceso VIP Premium</p>
                <p class="font-bold text-white">Blueprint IA</p>
            </div>
        </div>
        <div class="flex-1 space-y-4 text-sm font-medium">
            <a href="#" class="block text-primary hover:text-white transition-colors border-l-2 border-primary pl-3">Portada y Manifiesto</a>
            <a href="#" class="block text-slate-500 hover:text-white transition-colors pl-3 border-l-2 border-transparent">Arquitectura de $10K</a>
            <a href="#" class="block text-slate-500 hover:text-white transition-colors pl-3 border-l-2 border-transparent">Ingeniería de Prompts</a>
            <a href="#" class="block text-slate-500 hover:text-white transition-colors pl-3 border-l-2 border-transparent">Automatización WhatsApp</a>
            <a href="#" class="block text-slate-500 hover:text-white transition-colors pl-3 border-l-2 border-transparent">Cerebro CRM</a>
            <a href="#" class="block text-slate-500 hover:text-white transition-colors pl-3 border-l-2 border-transparent">El Jaque Mate</a>
        </div>
        <div class="mt-auto pt-6 border-t border-[#1f1f22]">
            <a href="portal-vip.html" class="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                <i data-lucide="unlock" class="w-4 h-4"></i> Ir a Sala Privada
            </a>
        </div>
    </aside>

    <!-- Reading Canvas -->
    <main class="flex-1 md:ml-72 bg-main relative">
        <div class="max-w-3xl mx-auto px-6 py-12 md:py-24">
            
            <!-- Mobile Return -->
            <a href="ebook.html" class="md:hidden inline-flex items-center gap-2 text-slate-400 mb-8 border border-white/10 px-4 py-2 rounded-full text-xs">
                <i data-lucide="arrow-left" class="w-4 h-4"></i> Volver a Landing
            </a>

            <!-- Content Container -->
            <article class="prose prose-invert prose-lg max-w-none">
                {final_body}
            </article>

            <!-- Final Action CTA -->
            <div class="mt-24 p-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-center">
                <h3 class="text-2xl font-black text-white mb-2">¿Listo para construir el sistema?</h3>
                <p class="text-slate-400 mb-6">Felicidades por finalizar. Es hora de llevar esto a la realidad operativa.</p>
                <a href="portal-vip.html" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-[0_5px_20px_rgba(59,130,246,0.3)]">
                    Solicitar Auditoría VIP con Rubén
                </a>
            </div>

        </div>
    </main>

    <script>lucide.createIcons();</script>
</body>
</html>"""

with open('leer-blueprint.html', 'w', encoding='utf-8') as f:
    f.write(reader_html)

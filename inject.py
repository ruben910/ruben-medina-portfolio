import os

def insert_in_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Navbar link in secondary-nav
    link_html = """
                <a href="ebook.html" class="nav-link" style="border: 1px solid rgba(59,130,246,0.3); background: rgba(59,130,246,0.05); color: #60a5fa;">
                    <i data-lucide="book-open"></i> E-book IA
                </a>
"""
    if 'href="ebook.html"' not in content:
        content = content.replace(
            '<div class="secondary-nav">',
            '<div class="secondary-nav">' + link_html
        )

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

def insert_in_servicios():
    with open('servicios.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Banner Downsell HTML (Titanium / Bento Style)
    bg_banner = """
        <!-- === DOWNSELL EBOOK BANNER === -->
        <section style="margin-top: 6rem; margin-bottom: 4rem;">
            <div style="background: linear-gradient(145deg, #0f172a, #09090b); border: 1px solid rgba(59,130,246,0.2); border-radius: 24px; padding: 3rem; display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05); text-align: center; position: relative; overflow: hidden;" class="md:flex-row md:text-left">
                <!-- Glow -->
                <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
                
                <div style="flex: 1; z-index: 10;">
                    <span style="display: inline-block; padding: 4px 12px; background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); border-radius: 99px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem;">Opcional: Empieza por aquí</span>
                    <h2 style="font-size: 2.5rem; font-weight: 900; color: #fff; margin-bottom: 1rem; line-height: 1.1;">¿Aún no estás listo para<br><span style="color: #60a5fa;">delegarlo todo?</span></h2>
                    <p style="color: #a1a1aa; font-weight: 300; max-w-lg; font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem;">Adquiere el <strong>Blueprint IA</strong> y recibe el diagrama arquitectónico completo para configurar tu propio ecosistema de automatización sin invertir miles de dólares en mi agencia.</p>
                    <a href="ebook.html" style="display: inline-flex; align-items: center; gap: 8px; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 12px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 15px rgba(59,130,246,0.4); transition: transform 0.2s;">
                        <i data-lucide="download" style="width: 18px;"></i> Desbloquear Blueprint - $19
                    </a>
                </div>

                <!-- Simple Mockup Right -->
                <div style="flex: 1; display: flex; justify-content: center; z-index: 10; padding-top: 1rem;">
                    <div style="width: 180px; height: 240px; background: linear-gradient(135deg, #1e3a8a, #09090b); border-radius: 4px 12px 12px 4px; box-shadow: -15px 15px 30px rgba(0,0,0,0.8), inset 2px 0 5px rgba(255,255,255,0.2); position: relative; border-left: 20px solid #0f172a; transform: perspective(800px) rotateY(-15deg) rotateX(5deg); display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center; color: #fff; opacity: 0.9;">
                            <i data-lucide="cpu" style="width: 32px; height: 32px; color: #60a5fa; margin: 0 auto 10px;"></i>
                            <h4 style="font-weight: 900; font-size: 1.2rem; line-height: 1;">AI<br>Blueprint</h4>
                        </div>
                    </div>
                </div>
            </div>
        </section>
"""

    if 'DOWNSELL EBOOK BANNER' not in content:
        # insert right before </div> </main> or </body>
        # Let's insert before </main>
        content = content.replace(
            '</main>',
            bg_banner + '\n    </main>'
        )

    with open('servicios.html', 'w', encoding='utf-8') as f:
        f.write(content)

try:
    insert_in_index()
    print("Injected into index.html")
except Exception as e:
    print(e)
    
try:
    insert_in_servicios()
    print("Injected into servicios.html")
except Exception as e:
    print(e)

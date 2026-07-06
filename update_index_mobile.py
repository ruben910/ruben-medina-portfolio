import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace mobile CSS
css_old_mobile = r'''.action-section {
                flex: none;
                padding: 3rem 2rem;
                min-height: 50vh;
                border-top-left-radius: 30px;
                border-top-right-radius: 30px;
                margin-top: -30px;
                position: relative;
            }

            .profile-header h1 {
                font-size: 2.8rem;
            }

            .profile-header p {
                font-size: 1.2rem;
            }

            .action-hub {
                max-height: 250px;
                overflow-y: auto;
                padding-right: 10px;
                /\* Optional scrollbar styling \*/
                scrollbar-width: thin;
                scrollbar-color: #dcdcdc transparent;
            }
            .action-hub::-webkit-scrollbar {
                width: 6px;
            }
            .action-hub::-webkit-scrollbar-thumb {
                background-color: #dcdcdc;
                border-radius: 10px;
            }
            .action-btn {
                padding: 1.2rem 1.5rem;'''

css_new_mobile = '''
            .image-section {
                height: 45vh;
                position: sticky;
                top: 0;
                z-index: 0;
            }

            .action-section {
                flex: none;
                padding: 3.5rem 2rem;
                min-height: 60vh;
                border-top-left-radius: 30px;
                border-top-right-radius: 30px;
                margin-top: -30px;
                position: relative;
                z-index: 10;
                background-color: var(--card-bg);
                box-shadow: 0 -10px 40px rgba(0,0,0,0.05); /* Slight shadow to show depth over image */
            }

            .profile-header h1 {
                font-size: 2.8rem;
            }

            .profile-header p {
                font-size: 1.2rem;
            }

            .action-btn {
                padding: 1.2rem 1.5rem;'''

# The regex replacement for the CSS
content = re.sub(
    r'\.action-section\s*\{.*?\.action-btn\s*\{\s*padding:\s*1\.2rem\s*1\.5rem;',
    css_new_mobile,
    content,
    flags=re.DOTALL
)

# And make sure action-hub doesn't have max-height in mobile media query. The re.sub just removed it.

# I should add a CSS fix globally for SVG icons inside action-btn
icon_css = '''
        .action-btn .icon svg {
            width: 24px;
            height: 24px;
            stroke-width: 1.5;
        }
        
'''
content = content.replace('.action-btn.primary:hover {', icon_css + '.action-btn.primary:hover {')

# Replace the HTML block inside action-hub
html_old_hub = r'''<div class="action-hub">
                <a href="servicios.html" class="action-btn">
                    <span class="icon">💻</span>
                    <span class="text">Servicios Tecnológicos</span>
                </a>
                <a href="modelos-ia.html" class="action-btn">
                    <span class="icon">✨</span>
                    <span class="text">Experimentos AI</span>
                </a>
                <a href="portal-cliente.html" class="action-btn primary">
                    <span class="icon">🔐</span>
                    <span class="text">Portal de Clientes</span>
                </a>
                <a href="presentacion.html" class="action-btn">
                    <span class="icon">📊</span>
                    <span class="text">Presentación</span>
                </a>
            </div>'''
            
html_new_hub = '''<div class="action-hub">
                <a href="servicios.html" class="action-btn">
                    <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
                    <span class="text">Servicios Tecnológicos</span>
                </a>
                <a href="modelos-ia.html" class="action-btn">
                    <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></span>
                    <span class="text">Experimentos AI</span>
                </a>
                <a href="portal-cliente.html" class="action-btn primary">
                    <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                    <span class="text">Portal de Clientes</span>
                </a>
                <a href="presentacion.html" class="action-btn">
                    <span class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg></span>
                    <span class="text">Presentación</span>
                </a>
            </div>'''
            
content = re.sub(
    r'<div class="action-hub">.*?</div>\n\s*</div>\n\s*</div>',
    html_new_hub + '\n\n        </div>\n    </div>',
    content,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

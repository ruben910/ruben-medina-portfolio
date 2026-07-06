import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# CSS adjustments
css_to_add = '''
        .brands-carousel {
            position: relative;
            height: 40px;
            margin-top: 1rem;
            display: flex;
            align-items: center;
        }

        .brand-item {
            position: absolute;
            left: 0;
            display: flex;
            align-items: center;
            gap: 12px;
            opacity: 0;
            animation: fadeCarousel 15s infinite;
        }

        .brand-item img {
            height: 24px;
            width: auto;
            filter: grayscale(100%) opacity(70%);
        }

        .brand-item span {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-secondary);
            letter-spacing: 0.5px;
        }

        @keyframes fadeCarousel {
            0% { opacity: 0; transform: translateY(10px); }
            4% { opacity: 1; transform: translateY(0); }
            16% { opacity: 1; transform: translateY(0); }
            20% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
'''

content = content.replace('/* Animaciones */', css_to_add + '\n        /* Animaciones */')

# Mobile adjustments
mobile_css = '''
            .action-hub {
                max-height: 250px;
                overflow-y: auto;
                padding-right: 10px;
                /* Optional scrollbar styling */
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
'''
content = content.replace('.action-btn {\n                padding: 1.2rem 1.5rem;', mobile_css + '\n            .action-btn {\n                padding: 1.2rem 1.5rem;')

# HTML adjustments
html_to_add = '''
            <div class="profile-header">
                <h1>Rubén Medina</h1>
                <p>Developer & Especialista AI</p>

                <!-- Carrusel de Marcas -->
                <div class="brands-carousel">
                    <div class="brand-item" style="animation-delay: 0s;">
                        <img src="assets/logos/google-cloud.svg" alt="Google Cloud">
                        <span>Google Cloud</span>
                    </div>
                    <div class="brand-item" style="animation-delay: 3s;">
                        <img src="assets/logos/antigravity.svg" alt="Antigravity AI">
                        <span>Antigravity AI</span>
                    </div>
                    <div class="brand-item" style="animation-delay: 6s;">
                        <img src="assets/logos/meta.svg" alt="Meta">
                        <span>Meta</span>
                    </div>
                    <div class="brand-item" style="animation-delay: 9s;">
                        <img src="assets/logos/supabase.svg" alt="Supabase">
                        <span>Supabase</span>
                    </div>
                    <div class="brand-item" style="animation-delay: 12s;">
                        <img src="assets/logos/github.svg" alt="GitHub">
                        <span>GitHub</span>
                    </div>
                </div>
            </div>
'''

content = re.sub(
    r'<div class="profile-header">.*?</div>',
    html_to_add.strip(),
    content,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

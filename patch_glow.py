import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update the CSS for brands-row and add animations
css_additions = """
        .tech-stack {
            position: relative;
            overflow: hidden; /* Contains the sweeping glow */
            border-radius: 20px; /* if any background exists */
        }
        
        .tech-stack::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            right: -100px;
            width: 150px;
            background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.4), rgba(255, 255, 255, 0.6), rgba(96, 165, 250, 0.4), transparent);
            transform: skewX(-25deg);
            animation: sweepScanner 5s infinite;
            z-index: 10;
            pointer-events: none;
            filter: blur(8px);
        }

        @keyframes sweepScanner {
            0% { right: -150px; opacity: 0; }
            5% { opacity: 1; }
            40% { right: 120%; opacity: 1; }
            50% { right: 120%; opacity: 0; }
            100% { right: 120%; opacity: 0; }
        }

        .brands-row > * {
            animation: colorPop 5s infinite;
        }
        
        @keyframes colorPop {
            0%, 5%, 35%, 100% {
                filter: grayscale(100%) opacity(0.4) brightness(1.5);
                transform: translateY(0);
            }
            15% {
                filter: grayscale(0%) opacity(1) brightness(1.2) drop-shadow(0 0 10px rgba(59,130,246,0.3));
                transform: translateY(-3px);
            }
        }
"""

# Insert CSS right before </style>
html = html.replace('</style>', css_additions + '\n    </style>')

# 2. Modify the HTML elements to include the animation delays
# We need to find the specific images and add inline style for the delay.
# Delays (from right to left, over the 5s loop):
# Element 5 (Span text): ~0.2s
# Element 4 (Github): ~0.5s
# Element 3 (Supabase): ~0.8s
# Element 2 (Meta): ~1.1s
# Element 1 (Google Cloud): ~1.4s

# We will use string replace for each specific tag found in `check_brands.py`

html = html.replace(
    '<img src="assets/logos/google-cloud.svg" alt="Google Cloud" onerror="this.style.display=\'none\'">',
    '<img src="assets/logos/google-cloud.svg" alt="Google Cloud" style="animation-delay: 1.4s" onerror="this.style.display=\'none\'">'
)

html = html.replace(
    '<img src="assets/logos/meta.svg" alt="Meta" onerror="this.style.display=\'none\'">',
    '<img src="assets/logos/meta.svg" alt="Meta" style="animation-delay: 1.1s" onerror="this.style.display=\'none\'">'
)

html = html.replace(
    '<img src="assets/logos/supabase.svg" alt="Supabase" onerror="this.style.display=\'none\'">',
    '<img src="assets/logos/supabase.svg" alt="Supabase" style="animation-delay: 0.8s" onerror="this.style.display=\'none\'">'
)

html = html.replace(
    '<img src="assets/logos/github.svg" alt="GitHub" onerror="this.style.display=\'none\'">',
    '<img src="assets/logos/github.svg" alt="GitHub" style="animation-delay: 0.5s" onerror="this.style.display=\'none\'">'
)

html = html.replace(
    '<span class="brand-text">Antigravity</span>',
    '<span class="brand-text" style="animation-delay: 0.2s">Antigravity</span>'
)

# And because hover might fight with animation, let's keep hover but animation runs infinite
# The hover rule .brands-row img:hover should probably have !important for UX, but CSS specificity might handle it if not important

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

import os

with open('ebook.html', 'r', encoding='utf-8') as f:
    text = f.read()

modal_html = """
    <!-- Lead Capture Modal (Organic Acquisition) -->
    <div id="lead-modal" class="fixed inset-0 z-[200] bg-[#09090b]/90 backdrop-blur-md flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300">
        <div class="bg-card w-full max-w-md p-8 rounded-3xl border border-glassborder shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative transform scale-95 transition-transform duration-300" id="lead-scale-box">
            
            <button onclick="closeLeadModal()" class="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>

            <div class="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
                <i data-lucide="unlock" class="w-6 h-6"></i>
            </div>
            
            <h3 class="text-2xl font-black text-white mb-2">Desbloquea el Blueprint</h3>
            <p class="text-sm text-slate-400 mb-6">Inicia tu proceso de transformación digital. Ingresa tus datos para acceder oficialmente al documento maestro.</p>
            
            <form onsubmit="handleLeadSubmit(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre Completo</label>
                    <input type="text" required placeholder="Ej. Carlos Martínez" class="w-full bg-[#09090b] border border-[#27272a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Correo Corporativo</label>
                    <input type="email" required placeholder="tu@empresa.com" class="w-full bg-[#09090b] border border-[#27272a] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                </div>
                
                <button type="submit" id="submit-lead-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 flex justify-center items-center gap-2 transition-all shadow-lg">
                    <span>Adquirir y Leer Ahora</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
            </form>
            
            <p class="text-[10px] text-center text-slate-500 mt-4"><i data-lucide="shield-check" class="w-3 h-3 inline mr-1 text-emerald-500"></i> Conexión encriptada SSL. No compartimos tus datos.</p>
        </div>
    </div>
"""

# Insert modal before closing body
if 'id="lead-modal"' not in text:
    text = text.replace('</body>', modal_html + '\n</body>')

# Replace JS logic
js_replacement = """
        // 2. Checkout / Toast Logic updated for Real Lead Capture
        function triggerCheckout() {
            const modal = document.getElementById('lead-modal');
            const box = document.getElementById('lead-scale-box');
            
            modal.classList.remove('opacity-0', 'pointer-events-none');
            box.classList.remove('scale-95');
            box.classList.add('scale-100');
        }
        
        function closeLeadModal() {
            const modal = document.getElementById('lead-modal');
            const box = document.getElementById('lead-scale-box');
            
            modal.classList.add('opacity-0', 'pointer-events-none');
            box.classList.remove('scale-100');
            box.classList.add('scale-95');
        }
        
        function handleLeadSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('submit-lead-btn');
            btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Registrando lead...';
            btn.classList.add('opacity-80', 'pointer-events-none');
            lucide.createIcons();
            
            // Simular petición a Supabase/CRM (2 segundos)
            setTimeout(() => {
                btn.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-green-400"></i> ¡Acceso Concedido!';
                btn.classList.remove('bg-blue-600', 'hover:bg-blue-500');
                btn.classList.add('bg-[#09090b]', 'border', 'border-emerald-500');
                lucide.createIcons();
                
                // Redirigir al lector web del eBook
                setTimeout(() => {
                    window.location.href = 'leer-blueprint.html';
                }, 800);
            }, 2000);
        }
"""
text = text.replace("""function triggerCheckout() {
            const toast = document.getElementById('toast-notification');
            
            toast.classList.add('toast-active');
            
            setTimeout(() => {
                toast.classList.remove('toast-active');
                alert("Simulación: Abriendo pasarela de checkout emergente.");
            }, 3000);
        }""", js_replacement)

with open('ebook.html', 'w', encoding='utf-8') as f:
    f.write(text)

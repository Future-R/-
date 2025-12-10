window.App.pages.counter = {
    count: 0,
    
    render: function() {
        this.count = 0; // Reset on load
        return `
        <div class="flex flex-col items-center justify-center flex-1 w-full fade-in">
            <div class="w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-zinc-200 relative overflow-hidden">
                <!-- Screws -->
                <div class="absolute top-6 left-6 w-3 h-3 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center"><div class="w-full h-[1px] bg-zinc-400 transform rotate-45"></div></div>
                <div class="absolute top-6 right-6 w-3 h-3 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center"><div class="w-full h-[1px] bg-zinc-400 transform rotate-45"></div></div>
                <div class="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center"><div class="w-full h-[1px] bg-zinc-400 transform rotate-45"></div></div>
                <div class="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center"><div class="w-full h-[1px] bg-zinc-400 transform rotate-45"></div></div>

                <!-- Screen -->
                <div class="mb-10 relative">
                    <div class="bg-[#F5F5F0] border-2 border-zinc-200 rounded-2xl p-8 pt-10 pb-6 text-center shadow-inner relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                        <p class="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-[0.3em] text-zinc-400 uppercase">当前计数</p>
                        <span id="counter-display" class="block text-9xl font-mono font-bold text-zinc-800 tracking-tighter tabular-nums leading-none drop-shadow-sm select-none">000</span>
                    </div>
                </div>

                <!-- Controls -->
                <div class="flex flex-col items-center gap-8">
                    <div class="relative">
                        <div id="btn-shadow" class="absolute inset-0 rounded-full bg-red-700 blur-[1px] transform translate-y-2 transition-all duration-100"></div>
                        <button id="btn-increment" class="relative w-32 h-32 rounded-full bg-gradient-to-b from-red-500 to-red-600 border-[4px] border-zinc-100 ring-1 ring-zinc-300 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-4px_6px_rgba(0,0,0,0.1)] active:scale-[0.98] active:translate-y-1 transition-all duration-100 ease-out outline-none group">
                            <div class="text-red-100 opacity-90 font-bold text-4xl select-none group-hover:scale-110 transition-transform">+</div>
                        </button>
                    </div>

                    <button id="btn-reset" class="flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-300 hover:bg-white transition-all duration-300 uppercase font-bold text-xs tracking-widest outline-none">
                        <i data-lucide="rotate-ccw" class="w-3 h-3"></i>
                        <span>重置</span>
                    </button>
                </div>
            </div>
            
            <div class="mt-8 text-center opacity-60">
                <p class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">按 [空格] 计数 • 按 [Esc] 重置</p>
            </div>
        </div>
        `;
    },

    mount: function() {
        const display = document.getElementById('counter-display');
        const btnInc = document.getElementById('btn-increment');
        const btnShadow = document.getElementById('btn-shadow');
        const btnReset = document.getElementById('btn-reset');

        const updateDisplay = () => {
            display.innerText = this.count.toString().padStart(3, '0');
        };

        const playSound = (type) => {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (type === 'tick') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
            } else {
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
                osc.start();
                osc.stop(ctx.currentTime + 0.15);
            }
        };

        const increment = () => {
            this.count++;
            updateDisplay();
            playSound('tick');
            if (navigator.vibrate) navigator.vibrate(10);
            
            // Visual press effect manually since we are in JS
            btnShadow.classList.remove('translate-y-2');
            btnShadow.classList.add('translate-y-1');
            setTimeout(() => {
                btnShadow.classList.add('translate-y-2');
                btnShadow.classList.remove('translate-y-1');
            }, 150);
        };

        const reset = () => {
            this.count = 0;
            updateDisplay();
            playSound('reset');
            if (navigator.vibrate) navigator.vibrate(30);
        };

        btnInc.addEventListener('click', increment);
        btnReset.addEventListener('click', reset);

        // Keyboard support
        this.handleKey = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                increment();
            }
            if (e.code === 'Backspace' || e.code === 'Escape') {
                e.preventDefault();
                reset();
            }
        };
        window.addEventListener('keydown', this.handleKey);
        
        // Clean up when leaving page (optional for this simple app, but good practice)
        // Since we don't have a formal unmount lifecycle in this simple router, we rely on page replacements removing listeners from DOM elements,
        // but window listeners persist. For a full app, Router should handle cleanup.
        // For now, we will just patch Router to clear window listeners if we wanted to be strict.
    }
};

// --- COUNTER ---
window.App = window.App || {};
window.App.pages = window.App.pages || {};

window.App.pages.counter = {
    count: 0,
    handleKey: function(e) {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this.increment();
        }
    },
    increment: function() {
        this.count++;
        this.updateDisplay(true);
    },
    updateDisplay: function(animate = false) {
        const display = document.getElementById('counter-display');
        const shell = document.querySelector('#counter-shell');
        if(!display) return;
        
        display.innerText = this.count.toString().padStart(3, '0');
        if (animate) {
            display.classList.remove('text-flash');
            void display.offsetWidth;
            display.classList.add('text-flash');
            
            const btn = document.getElementById('btn-increment');
            btn.classList.remove('hit-effect');
            void btn.offsetWidth;
            btn.classList.add('hit-effect');
            
            if(shell) {
                shell.classList.remove('shake-hard');
                void shell.offsetWidth;
                shell.classList.add('shake-hard');
            }
            if(navigator.vibrate) navigator.vibrate(20);
        }
    },
    render: function() {
        this.count = 0;
        return `
        <div class="flex flex-col items-center justify-center flex-1 w-full fade-in py-10">
            <div id="counter-shell" class="streamline-shell w-full max-w-sm p-8 relative">
                <!-- VFD Screen -->
                <div class="mb-10 mx-auto w-full">
                    <div class="device-screen p-6 text-center h-40 flex items-center justify-center relative">
                        <div class="absolute top-2 left-4 text-[10px] font-bold text-zinc-600 tracking-widest uppercase">计数序列_01</div>
                        <span id="counter-display" class="block text-8xl font-mono font-bold text-orange-500 tabular-nums leading-none drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]">000</span>
                    </div>
                </div>

                <!-- Main Button -->
                <div class="flex flex-col items-center gap-8 mb-4">
                    <button id="btn-increment" class="transition-transform w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-[6px] border-white shadow-[0_10px_20px_rgba(234,88,12,0.3),inset_0_2px_10px_rgba(255,255,255,0.4)] active:shadow-none active:translate-y-1 flex items-center justify-center group ring-4 ring-zinc-100 outline-none">
                        <i data-lucide="plus" class="w-12 h-12 text-white stroke-[4] drop-shadow-md"></i>
                    </button>
                    <div class="text-zinc-400 text-xs font-bold tracking-widest flex items-center">
                        点击或按下 <span class="shortcut-key">SPACE</span> 计数
                    </div>

                    <button id="btn-reset" class="atom-btn px-8 py-3 bg-zinc-100 text-zinc-500 text-xs tracking-widest shadow-sm">
                        系统重置
                    </button>
                </div>
                
                <div class="text-center mt-6">
                    <div class="w-12 h-1 bg-zinc-200 mx-auto rounded-full mb-2"></div>
                    <span class="text-[10px] text-zinc-300 font-bold tracking-[0.2em]">未来科技</span>
                </div>
            </div>
        </div>
        `;
    },
    mount: function() {
        const btnInc = document.getElementById('btn-increment');
        const btnReset = document.getElementById('btn-reset');
        this.updateDisplay();
        btnInc.addEventListener('click', () => { this.increment(); });
        btnReset.addEventListener('click', () => { this.count = 0; this.updateDisplay(); });
        if(window.lucide) window.lucide.createIcons();
    }
};



// --- DICE ROLLER ---
window.App = window.App || {};
window.App.pages = window.App.pages || {};

window.App.pages.diceRoller = {
    history: [],
    rolling: false,
    render: function() {
        return `
        <div class="flex flex-col items-center justify-center flex-1 w-full fade-in py-6">
            <div class="streamline-shell w-full max-w-lg p-8 bg-gradient-to-br from-white to-indigo-50">
                <div class="flex items-center gap-3 mb-6 border-b border-zinc-200 pb-4">
                    <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                        <i data-lucide="box" class="w-5 h-5"></i>
                    </div>
                    <h2 class="text-lg font-black text-zinc-700 tracking-wider">电子骰子</h2>
                </div>
                <div id="dice-screen" class="device-screen h-64 flex items-center justify-center mb-6 bg-[#0c0a20] relative cursor-pointer hover:border-indigo-400 transition-colors">
                        <div class="dice-scene pointer-events-none">
                            <div id="dice-cube" class="dice-cube">
                                <div class="dice-face dice-face-front">?</div>
                                <div class="dice-face dice-face-back">?</div>
                                <div class="dice-face dice-face-right">?</div>
                                <div class="dice-face dice-face-left">?</div>
                                <div class="dice-face dice-face-top">?</div>
                                <div class="dice-face dice-face-bottom">?</div>
                            </div>
                        </div>
                        <div id="dice-result-overlay" class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm hidden z-20 pointer-events-none">
                        <span class="text-6xl font-black text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]">20</span>
                        </div>
                        <div class="absolute bottom-2 right-2 text-[10px] text-zinc-600 font-bold opacity-50">TOUCH SCREEN</div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="text-[10px] font-bold text-zinc-400 tracking-widest block mb-2">骰子面数</label>
                        <select id="dice-sides" class="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                            <option value="4">D4 (4面)</option>
                            <option value="6">D6 (6面)</option>
                            <option value="20" selected>D20 (20面)</option>
                            <option value="100">D100 (100面)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-zinc-400 tracking-widest block mb-2">数量 (MAX 20)</label>
                        <input id="dice-count" type="number" min="1" max="20" value="1" class="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    </div>
                </div>
                <div class="mb-6 px-4 py-2 bg-zinc-100 rounded-lg border-l-4 border-indigo-400">
                        <div class="text-[10px] font-bold text-zinc-400 mb-1 tracking-widest">投掷记录</div>
                        <div id="dice-history" class="h-16 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                            <div class="text-zinc-300 text-xs italic">暂无记录</div>
                        </div>
                </div>
                <button id="btn-roll" class="atom-btn py-4 w-full text-indigo-600 bg-white border-indigo-200 border-b-indigo-300">
                    投掷骰子
                </button>
            </div>
        </div>
        `;
    },
    mount: function() {
        const cube = document.getElementById('dice-cube');
        const btn = document.getElementById('btn-roll');
        const screen = document.getElementById('dice-screen');
        const sidesSelect = document.getElementById('dice-sides');
        const countInput = document.getElementById('dice-count');
        const historyLog = document.getElementById('dice-history');
        const overlay = document.getElementById('dice-result-overlay');

        const rollDice = async () => {
            if (this.rolling) return;
            this.rolling = true;
            overlay.classList.add('hidden');
            let count = parseInt(countInput.value);
            if (count > 20) count = 20;
            if (count < 1) count = 1;
            countInput.value = count;
            const sides = parseInt(sidesSelect.value);
            cube.classList.add('dice-rolling');
            await new Promise(r => setTimeout(r, 600));
            cube.classList.remove('dice-rolling');
            const results = [];
            for(let i=0; i<count; i++) results.push(Math.floor(Math.random() * sides) + 1);
            const total = results.reduce((a,b)=>a+b, 0);
            overlay.innerHTML = `<div class="text-center"><div class="text-6xl font-black text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]">${total}</div><div class="text-xs text-indigo-200 font-mono mt-2">[${results.join(', ')}]</div></div>`;
            overlay.classList.remove('hidden');
            this.history.unshift(`D${sides} x ${count} = ${total} [${results.join(',')}]`);
            if(this.history.length > 5) this.history.pop();
            historyLog.innerHTML = this.history.map(h => `<div class="text-xs font-mono text-zinc-600 border-b border-zinc-200 pb-1 last:border-0">${h}</div>`).join('');
            this.rolling = false;
        };

        btn.addEventListener('click', rollDice);
        screen.addEventListener('click', rollDice);

        if(window.lucide) window.lucide.createIcons();
    }
};

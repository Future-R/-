window.App.pages.textMapEditor = {
    rows: 10,
    cols: 10,
    MAX_SIZE: 40,
    mapData: [],
    fontFamily: "'MS Gothic', monospace",

    initMap: function() {
        if (this.mapData.length === 0) {
            this.mapData = Array(this.rows).fill('Ｘ'.repeat(this.cols));
        }
    },

    render: function() {
        this.initMap();
        
        const specialChars = "① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨ ⑩ ♨ ✟ ※ ◎ □ ■ ♠ ♥ ♦ ♣ Ｘ";
        const boxDrawingRows = ["┌┬┐┏┳┓╔╦╗╭─╮", "├┼┤┣╋┫╠╬╣│╳┃", "└┴┘┗┻┛╚╩╝╰━╯", "┍┑┎┒╒╕╓╖╱╲┄┅", "┕┙┖┚╘╛╙╜╲╱┆┇"];

        return `
        <div class="flex flex-col xl:flex-row gap-8 w-full fade-in items-start pb-20">
            <!-- LEFT PANEL -->
            <div class="flex-1 w-full bg-[#f0f0eb] rounded-[2.5rem] p-4 md:p-8 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1)] border-4 border-white relative">
                
                <div class="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 pb-6 border-b-2 border-zinc-300 gap-6">
                    <div class="flex items-center gap-3">
                        <div class="p-3 bg-zinc-800 rounded-xl shadow-lg">
                            <i data-lucide="settings-2" class="w-6 h-6 text-amber-400"></i>
                        </div>
                        <div>
                            <h2 class="font-black uppercase tracking-widest text-xl text-zinc-800">地图参数</h2>
                            <span class="text-[10px] font-mono font-bold text-zinc-400">MAP_CONFIG_V3</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-3 w-full xl:w-auto">
                        <button id="btn-open-import" class="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-full transition-all duration-300 font-bold uppercase tracking-wider shadow-sm hover:translate-y-[-2px]">
                            <i data-lucide="upload" class="w-5 h-5"></i>
                            <span>导入地图</span>
                        </button>
                        <button id="btn-copy-all" class="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-full transition-all duration-300 font-bold uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px]">
                            <i data-lucide="clipboard-type" class="w-5 h-5"></i>
                            <span>复制全图</span>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <!-- Size -->
                    <div class="bg-white rounded-2xl p-4 shadow-sm border border-zinc-200">
                        <label class="text-xs uppercase font-bold text-zinc-500 tracking-wider mb-2 block">地图尺寸 (最大 ${this.MAX_SIZE})</label>
                        <div class="flex items-center gap-4">
                            <div class="relative flex-1">
                                <input id="input-rows" type="number" min="1" max="${this.MAX_SIZE}" value="${this.rows}" class="w-full bg-zinc-100 border-2 border-zinc-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-zinc-700 focus:outline-none focus:border-sky-400 text-center">
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">高</span>
                            </div>
                            <span class="text-zinc-300 font-black text-xl">×</span>
                            <div class="relative flex-1">
                                <input id="input-cols" type="number" min="1" max="${this.MAX_SIZE}" value="${this.cols}" class="w-full bg-zinc-100 border-2 border-zinc-200 rounded-xl px-4 py-3 font-mono text-lg font-bold text-zinc-700 focus:outline-none focus:border-sky-400 text-center">
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">宽</span>
                            </div>
                        </div>
                    </div>
                    <!-- Font -->
                    <div class="bg-white rounded-2xl p-4 shadow-sm border border-zinc-200">
                         <div class="flex justify-between items-center mb-2">
                            <label class="text-xs uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                              <i data-lucide="type" class="w-3 h-3"></i> 字体选择
                            </label>
                            <a href="https://gitgud.io/era-games-zh/meta/eraFonts" target="_blank" class="flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:text-sky-400 hover:underline">
                              <i data-lucide="download" class="w-3 h-3"></i> 下载字体
                            </a>
                         </div>
                         <select id="select-font" class="w-full bg-zinc-100 border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-700 focus:outline-none focus:border-sky-400">
                           <option value="'MS Gothic', monospace">MS Gothic (era默认)</option>
                           <option value="'ERA MONO SC'">ERA MONO SC</option>
                           <option value="'EraPixel'">EraPixel</option>
                         </select>
                    </div>
                </div>

                <!-- EDITOR -->
                <div class="bg-[#2a2a2e] p-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.1)] border-b-[8px] border-zinc-800">
                  <div class="bg-[#09090b] rounded-xl p-4 md:p-6 overflow-x-auto relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-[6px] border-[#1a1a1c] min-h-[500px]">
                    <div class="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none z-10"></div>
                     <div id="grid-container" class="flex flex-col gap-0 min-w-max relative z-0 pb-4 pr-4">
                        <!-- Grid injected here -->
                     </div>
                  </div>
                  <div class="flex justify-center mt-3">
                     <div class="text-[10px] font-mono text-zinc-500 tracking-[0.5em] uppercase">ERA终端 2000型</div>
                  </div>
                </div>
            </div>

            <!-- RIGHT PANEL -->
            <div class="w-full xl:w-96 bg-white rounded-[2rem] p-6 shadow-xl border-2 border-white sticky top-6 z-20">
                <div class="bg-sky-50 rounded-2xl p-4 mb-6 border border-sky-100">
                    <div class="flex items-center gap-2 text-sky-600 mb-1">
                        <i data-lucide="grid-3x3" class="w-5 h-5"></i>
                        <h2 class="font-black uppercase tracking-wider text-sm">字符工具箱</h2>
                    </div>
                    <p class="text-xs text-sky-800/60 font-medium">点击任意字符即可复制到剪贴板。</p>
                </div>
                
                <div class="space-y-8">
                    <div>
                        <h3 class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 pl-1">常用符号</h3>
                        <div class="grid grid-cols-6 gap-2">
                             ${specialChars.split(' ').map(c => `<button onclick="navigator.clipboard.writeText('${c}')" class="aspect-square flex items-center justify-center bg-zinc-50 border-2 border-zinc-100 rounded-xl hover:bg-amber-400 hover:border-amber-400 hover:text-white transition-all text-base font-bold shadow-sm active:scale-95">${c}</button>`).join('')}
                        </div>
                    </div>
                    <div>
                        <h3 class="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 pl-1">制表符</h3>
                        <div class="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                           ${boxDrawingRows.map(row => `
                             <div class="flex gap-1 justify-between">
                                ${row.split('').map(c => `<button onclick="navigator.clipboard.writeText('${c}')" class="w-full aspect-square flex items-center justify-center bg-white border border-zinc-200 rounded-lg hover:bg-sky-500 hover:border-sky-500 hover:text-white transition-all text-lg font-mono leading-none shadow-sm active:scale-90">${c}</button>`).join('')}
                             </div>
                           `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL -->
            <div id="modal-import" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div class="bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl border-4 border-white relative">
                    <button id="btn-close-modal" class="absolute top-6 right-6 p-2 rounded-full bg-zinc-100 hover:bg-red-100 hover:text-red-500 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                    <div class="mb-6">
                        <h3 class="text-2xl font-black text-zinc-800 uppercase tracking-tight">导入地图数据</h3>
                        <p class="text-zinc-500 text-sm mt-1">将文本粘贴到下方。系统将自动调整地图尺寸（最大 ${this.MAX_SIZE}x${this.MAX_SIZE}）。</p>
                    </div>
                    <textarea id="import-area" class="w-full h-64 bg-zinc-50 rounded-xl p-4 font-mono text-sm border-2 border-zinc-200 focus:border-amber-400 outline-none resize-none mb-6 leading-relaxed" placeholder="在此粘贴文本地图..."></textarea>
                    <div class="flex justify-end gap-4">
                        <button id="btn-cancel-import" class="px-6 py-3 rounded-full font-bold text-zinc-500 hover:bg-zinc-100 transition-colors">取消</button>
                        <button id="btn-confirm-import" class="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold uppercase tracking-wider shadow-lg transition-all">确认导入</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    mount: function() {
        // Elements
        const gridContainer = document.getElementById('grid-container');
        const inputRows = document.getElementById('input-rows');
        const inputCols = document.getElementById('input-cols');
        const selectFont = document.getElementById('select-font');
        const btnCopyAll = document.getElementById('btn-copy-all');
        const btnOpenImport = document.getElementById('btn-open-import');
        const modalImport = document.getElementById('modal-import');
        const btnCloseModal = document.getElementById('btn-close-modal');
        const btnCancelImport = document.getElementById('btn-cancel-import');
        const btnConfirmImport = document.getElementById('btn-confirm-import');
        const importArea = document.getElementById('import-area');

        // Render Grid Function
        const renderGrid = () => {
            gridContainer.innerHTML = this.mapData.map((row, i) => `
                <div class="flex items-center group relative" style="height: 1.5em">
                   <div class="absolute -left-8 top-0 h-full flex items-center w-6 justify-end text-[12px] text-zinc-700 font-mono select-none">${i+1}</div>
                   <input 
                     type="text" 
                     data-idx="${i}" 
                     value="${row}" 
                     style="font-family: ${this.fontFamily}; width: calc(${this.cols * 1.1}em + 4rem); height: 1.5em; line-height: 1.5; font-size: 1.5rem; letter-spacing: 0px;" 
                     class="map-input block bg-transparent text-zinc-100 border-none outline-none p-0 m-0 cursor-text selection:bg-amber-500/50" 
                     spellcheck="false"
                   />
                   <button onclick="window.App.pages.textMapEditor.copyRow(${i})" class="ml-2 p-1.5 rounded-md transition-all duration-200 bg-zinc-800 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-sky-500 hover:text-white scale-75 md:scale-100"><i data-lucide="copy" class="w-4 h-4"></i></button>
                </div>
            `).join('');
            if(window.lucide) window.lucide.createIcons();
        };

        // Event Listeners for Inputs
        inputRows.addEventListener('change', (e) => this.updateSize(parseInt(e.target.value), this.cols));
        inputCols.addEventListener('change', (e) => this.updateSize(this.rows, parseInt(e.target.value)));
        
        selectFont.addEventListener('change', (e) => {
            this.fontFamily = e.target.value;
            renderGrid();
        });

        // Delegate grid inputs
        gridContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('map-input')) {
                const idx = parseInt(e.target.dataset.idx);
                this.mapData[idx] = e.target.value;
            }
        });

        btnCopyAll.addEventListener('click', () => navigator.clipboard.writeText(this.mapData.join('\n')));

        // Import Modal Logic
        const toggleModal = (show) => modalImport.classList.toggle('hidden', !show);
        btnOpenImport.addEventListener('click', () => toggleModal(true));
        btnCloseModal.addEventListener('click', () => toggleModal(false));
        btnCancelImport.addEventListener('click', () => toggleModal(false));
        
        btnConfirmImport.addEventListener('click', () => {
            const text = importArea.value;
            if(!text.trim()) return;
            
            const lines = text.split('\n');
            const newRows = Math.min(this.MAX_SIZE, lines.length);
            let maxLen = 0;
            lines.forEach(l => maxLen = Math.max(maxLen, l.length));
            const newCols = Math.min(this.MAX_SIZE, Math.max(1, maxLen));

            this.rows = newRows;
            this.cols = newCols;
            inputRows.value = newRows;
            inputCols.value = newCols;

            this.mapData = [];
            for(let i=0; i<newRows; i++) {
                let line = lines[i] || "";
                if (line.length > newCols) line = line.substring(0, newCols);
                if (line.length < newCols) line = line + 'Ｘ'.repeat(newCols - line.length);
                this.mapData.push(line);
            }
            renderGrid();
            importArea.value = '';
            toggleModal(false);
        });

        // Font Availability Check
        const checkFont = (font) => {
           if (document.fonts && document.fonts.check) return document.fonts.check(`12px ${font}`);
           return true; 
        };
        Array.from(selectFont.options).forEach(opt => {
             if (opt.value.includes('Gothic')) return;
             // Extract font name from value string "'Name'"
             const fontName = opt.value.replace(/'/g, '');
             if (!checkFont(opt.value)) {
                 opt.disabled = true;
                 opt.innerText += " (未安装)";
                 opt.style.color = "#a1a1aa";
             }
        });

        // Initial Render
        renderGrid();
    },

    updateSize: function(newRows, newCols) {
        newRows = Math.min(this.MAX_SIZE, Math.max(1, newRows));
        newCols = Math.min(this.MAX_SIZE, Math.max(1, newCols));
        this.rows = newRows;
        this.cols = newCols;

        // Resize Map Data
        if (newRows > this.mapData.length) {
            for(let i=this.mapData.length; i<newRows; i++) this.mapData.push('Ｘ'.repeat(newCols));
        } else if (newRows < this.mapData.length) {
            this.mapData.splice(newRows);
        }

        this.mapData = this.mapData.map(row => {
            if (newCols > row.length) return row + 'Ｘ'.repeat(newCols - row.length);
            else if (newCols < row.length) return row.substring(0, newCols);
            return row;
        });

        // Re-mount logic effectively just re-renders the grid part
        const inputRows = document.getElementById('input-rows');
        const inputCols = document.getElementById('input-cols');
        if(inputRows) inputRows.value = newRows;
        if(inputCols) inputCols.value = newCols;
        
        // Find grid container and update innerHTML
        const grid = document.getElementById('grid-container');
        if(grid) {
             grid.innerHTML = this.mapData.map((row, i) => `
                <div class="flex items-center group relative" style="height: 1.5em">
                   <div class="absolute -left-8 top-0 h-full flex items-center w-6 justify-end text-[12px] text-zinc-700 font-mono select-none">${i+1}</div>
                   <input type="text" data-idx="${i}" value="${row}" style="font-family: ${this.fontFamily}; width: calc(${this.cols * 1.1}em + 4rem); height: 1.5em; line-height: 1.5; font-size: 1.5rem; letter-spacing: 0px;" class="map-input block bg-transparent text-zinc-100 border-none outline-none p-0 m-0 cursor-text selection:bg-amber-500/50" spellcheck="false" />
                   <button onclick="window.App.pages.textMapEditor.copyRow(${i})" class="ml-2 p-1.5 rounded-md transition-all duration-200 bg-zinc-800 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-sky-500 hover:text-white scale-75 md:scale-100"><i data-lucide="copy" class="w-4 h-4"></i></button>
                </div>
            `).join('');
            if(window.lucide) window.lucide.createIcons();
        }
    },

    copyRow: function(idx) {
        if(this.mapData[idx]) navigator.clipboard.writeText(this.mapData[idx]);
    }
};
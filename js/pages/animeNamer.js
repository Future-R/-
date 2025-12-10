window.App.pages.animeNamer = {
    history: [],
    
    prefixes: ["少女", "旅人", "勇者", "魔神", "终焉", "灰烬", "空想", "弑神", "奥术", "虚空", "神授", "诸神", "灵子", "不灭", "湮灭", "超载", "奇迹", "共鸣", "嗜血", "灵魂", "灾厄", "究极", "超越", "光明", "混沌", "希望", "绝望", "灭亡", "无限", "无想", "悲鸣", "原初", "心象", "星屑", "白夜", "零点", "绝对", "幻想", "沉默", "熔解", "弥生", "水无", "千年", "暴走", "青枫", "浮世", "胧月", "红莲", "黄泉", "鬼杀", "妖怪", "人间", "伊甸", "银河", "破碎", "真理", "空想", "天命", "死亡", "爆裂", "异邦", "の未来"],
    suffixes: ["代码", "计划", "指令", "结界", "领域", "地带", "力量", "王冠", "次元", "风暴", "黎明", "地狱", "枷锁", "梦境", "轮回", "沙漏", "残响", "之花", "之魂", "之翼", "之心", "默示录", "序曲", "终章", "诗篇", "战车", "阳炎", "红炎", "失格", "宣告", "审判", "契约", "乐队", "杀手", "使徒", "统领", "纹章", "深渊", "鸟居", "特攻", "游戏", "英雄", "余晖", "纪元", "核心", "武装", "战争", "此端", "彼端", "纷争", "教会", "禁止", "转生", "三日月", "圆舞曲", "协奏曲", "奏鸣曲", "狂想曲", "华尔兹", "理想乡", "决战兵器"],

    generateName: function() {
        const getRandomInt = (max) => Math.floor(Math.random() * max);
        const prefixIndex = getRandomInt(this.prefixes.length);
        const suffixIndex = getRandomInt(this.suffixes.length);
        
        let codeName = "";
        let story = "";
        
        const codeNameRoll = getRandomInt(200);
        if (codeNameRoll >= 1 && codeNameRoll <= 5) codeName = "代号:";
        else if (codeNameRoll >= 6 && codeNameRoll <= 7) codeName = "Re:";
        else if (codeNameRoll === 8) codeName = "The ";
        else if (codeNameRoll === 9) codeName = "此乃";
        else if (codeNameRoll === 10) codeName = "其为";

        const storyRoll = getRandomInt(200);
        if (storyRoll >= 11 && storyRoll <= 12) story = "物语";
        else if (storyRoll >= 13 && storyRoll <= 15) story = "传说";
        else if (storyRoll === 16) story = "与猫";
        else if (storyRoll === 17) story = "战线";
        else if (storyRoll === 18) story = "战纪";
        else if (storyRoll === 19) story = "英雄传";

        let extraPrefix = "";
        if (getRandomInt(100) < 4) extraPrefix = this.prefixes[getRandomInt(this.prefixes.length)];

        let star = "";
        if (getRandomInt(100) < 4) star = "☆";

        // Inversion
        if (getRandomInt(100) < 5) {
            if (this.suffixes[suffixIndex].startsWith("の") || this.suffixes[suffixIndex].startsWith("之")) {
                return codeName + extraPrefix + this.suffixes[suffixIndex].substring(1) + "の" + this.prefixes[prefixIndex] + story;
            }
            return codeName + extraPrefix + this.suffixes[suffixIndex] + star + this.prefixes[prefixIndex] + story;
        }

        // Normal
        if (this.prefixes[prefixIndex].startsWith("の") || this.prefixes[prefixIndex].startsWith("之")) {
            return codeName + extraPrefix + this.prefixes[prefixIndex].substring(1) + "の" + this.suffixes[suffixIndex] + story;
        }
        
        return codeName + extraPrefix + this.prefixes[prefixIndex] + star + this.suffixes[suffixIndex] + story;
    },

    render: function() {
        return `
        <div class="flex flex-col items-center justify-center flex-1 w-full fade-in gap-8">
            <div class="w-full max-w-lg bg-white rounded-3xl p-8 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.1)] border border-zinc-200 relative overflow-hidden group">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-2 text-zinc-400">
                         <i data-lucide="sparkles" class="w-4 h-4"></i>
                         <span class="text-xs font-mono uppercase tracking-widest">随机命名生成装置</span>
                    </div>
                    <div class="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                         <div id="anim-bar" class="h-full bg-red-500 transition-all duration-300 w-0"></div>
                    </div>
                </div>

                <div class="min-h-[160px] flex items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-100 p-6 mb-8 relative">
                   <h2 id="name-display" class="text-3xl md:text-4xl font-bold text-center text-zinc-800 break-words leading-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-800 to-zinc-600">
                     <span class="text-zinc-300 text-sm font-mono font-normal">准备就绪...</span>
                   </h2>
                   <div class="absolute bottom-2 right-4 text-[60px] font-bold text-zinc-100 pointer-events-none select-none -z-0 opacity-50 font-serif">名前</div>
                </div>

                <div class="flex gap-4">
                    <button id="btn-gen" class="flex-1 bg-zinc-800 hover:bg-red-600 text-white rounded-xl py-4 font-bold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-zinc-200 hover:shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                        <i id="icon-refresh" data-lucide="refresh-cw" class="w-5 h-5"></i>
                        <span>生成名称</span>
                    </button>
                    
                    <button id="btn-copy" disabled class="bg-white border border-zinc-200 text-zinc-600 hover:text-red-600 hover:border-red-200 rounded-xl px-6 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i data-lucide="copy" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>

            <div id="history-container" class="w-full max-w-lg hidden">
                <h3 class="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4 pl-2">生成记录</h3>
                <div id="history-list" class="space-y-2"></div>
            </div>
        </div>
        `;
    },

    mount: function() {
        const btnGen = document.getElementById('btn-gen');
        const btnCopy = document.getElementById('btn-copy');
        const nameDisplay = document.getElementById('name-display');
        const animBar = document.getElementById('anim-bar');
        const iconRefresh = document.getElementById('icon-refresh');
        const historyList = document.getElementById('history-list');
        const historyContainer = document.getElementById('history-container');

        let isAnimating = false;
        let currentName = '';

        const updateHistory = () => {
            if (this.history.length === 0) return;
            historyContainer.classList.remove('hidden');
            historyList.innerHTML = this.history.map(name => `
                <div class="group flex items-center justify-between p-3 bg-white/50 border border-transparent hover:border-zinc-200 rounded-lg transition-all duration-200 hover:bg-white cursor-pointer" onclick="navigator.clipboard.writeText('${name}')">
                    <span class="font-medium text-zinc-600 text-sm">${name}</span>
                    <i data-lucide="copy" class="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"></i>
                </div>
            `).join('');
            if(window.lucide) window.lucide.createIcons();
        };

        const generate = () => {
            if (isAnimating) return;
            isAnimating = true;
            iconRefresh.classList.add('animate-spin');
            animBar.classList.remove('w-0');
            animBar.classList.add('w-full');
            
            let count = 0;
            const interval = setInterval(() => {
                nameDisplay.innerText = this.generateName();
                count++;
                if (count > 8) {
                    clearInterval(interval);
                    currentName = this.generateName();
                    nameDisplay.innerText = currentName;
                    this.history = [currentName, ...this.history].slice(0, 10);
                    updateHistory();
                    
                    isAnimating = false;
                    iconRefresh.classList.remove('animate-spin');
                    animBar.classList.remove('w-full');
                    animBar.classList.add('w-0');
                    btnCopy.disabled = false;
                }
            }, 50);
        };

        btnGen.addEventListener('click', generate);
        btnCopy.addEventListener('click', () => {
            if(currentName) navigator.clipboard.writeText(currentName);
        });

        // Restore history if revisiting page
        updateHistory();
    }
};

// --- CARD GAME UI & RENDERERS ---
// Requires: card-game.js (which defines window.App.pages.cardGame)

window.App = window.App || {};
window.App.pages = window.App.pages || {};
window.App.pages.cardGame = window.App.pages.cardGame || {};

Object.assign(window.App.pages.cardGame, {
    
    isPortrait: function() {
        return window.innerHeight > window.innerWidth;
    },

    render: function() {
        const containerClass = this.isPortrait() 
            ? "flex flex-col h-[calc(100vh-80px)] w-full fade-in relative overflow-hidden bg-zinc-50" 
            : "flex flex-col h-[calc(100vh-140px)] w-full fade-in relative max-w-7xl mx-auto";
            
        return `<div class="${containerClass}"><div id="game-board" class="flex-1 flex flex-col relative h-full">${this.renderContent()}</div></div>`;
    },
    
    renderGame: function() {
        const board = document.getElementById('game-board');
        if(board) { 
            board.innerHTML = this.renderContent(); 
            if(window.lucide) window.lucide.createIcons(); 
            const logEl = document.getElementById('game-log-content');
            if (logEl) logEl.scrollTop = logEl.scrollHeight;
        }
    },

    renderContent: function() {
        switch(this.state.mode) {
            case 'intro': return this.renderIntro();
            case 'character_select': return this.renderCharacterSelect();
            case 'map': return this.renderMap();
            case 'battle': 
            case 'scoring': 
                return this.isPortrait() ? this.renderBattlePortrait() : this.renderBattleLandscape();
            case 'reward': return this.renderReward();
            case 'event': return this.renderEvent();
            default: return this.renderIntro();
        }
    },

    renderIntro: function() {
        return `
        <div class="flex flex-col items-center justify-center h-full gap-8 text-center p-4">
            <div class="relative">
                <div class="absolute -inset-4 bg-gradient-to-r from-red-600 via-amber-500 to-sky-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div class="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-2xl relative z-10 border border-white/10">
                    <i data-lucide="paw-print" class="w-12 h-12"></i>
                </div>
            </div>
            <div>
                <h1 class="text-4xl font-black text-zinc-800 mb-2">小动物大乱斗 2</h1>
                <p class="text-zinc-500 font-bold tracking-widest uppercase">Cute Monster Duelists</p>
            </div>
            <div class="max-w-md w-full text-sm text-zinc-500 leading-relaxed bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
                <p class="mb-4 font-bold text-zinc-400 uppercase tracking-tighter">请选择游玩模式</p>
                <div class="grid grid-cols-1 gap-4">
                    <!-- Classic mode on top -->
                    <button onclick="window.App.pages.cardGame.selectMode('classic')" class="group p-5 bg-white text-zinc-800 rounded-2xl border-2 border-zinc-200 hover:border-sky-500 hover:shadow-xl hover:shadow-sky-100 transition-all flex items-center gap-4 text-left shadow-sm">
                        <div class="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <i data-lucide="swords" class="w-7 h-7"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-black text-lg">经典模式</div>
                            <div class="text-[11px] text-zinc-400 font-bold uppercase">对等博弈 · 随机全技能实装</div>
                        </div>
                    </button>

                    <!-- Adventure mode at bottom with experimental warning -->
                    <button onclick="window.App.pages.cardGame.selectMode('adventure')" class="group p-5 bg-zinc-50 text-zinc-600 rounded-2xl border-2 border-zinc-200 hover:border-amber-400 transition-all flex items-center gap-4 text-left relative overflow-hidden">
                         <div class="absolute top-0 right-0 px-3 py-0.5 bg-amber-400 text-white text-[9px] font-black uppercase rounded-bl-lg animate-pulse">实验性</div>
                        <div class="w-12 h-12 bg-zinc-200 rounded-xl flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                            <i data-lucide="map" class="w-7 h-7"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-black text-lg opacity-80 group-hover:opacity-100">闯关模式</div>
                            <div class="text-[11px] opacity-60 font-bold uppercase">核心系统开发中 · 不稳定</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>`;
    },

    renderCharacterSelect: function() {
        return `
        <div class="flex flex-col items-center justify-center h-full gap-8 p-4">
            <h2 class="text-2xl font-black text-zinc-700 uppercase tracking-widest">选择对战伙伴</h2>
            <div class="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                ${Object.entries(this.CONST.CHARACTERS).map(([id, char]) => `
                    <div onclick="window.App.pages.cardGame.selectCharacter('${id}')" class="flex-1 bg-white border-4 border-zinc-200 rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer hover:border-amber-400 hover:shadow-xl transition-all group active:scale-95">
                        <div class="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4 border-2 border-zinc-200 group-hover:bg-amber-50 group-hover:border-amber-200">
                            <i data-lucide="${char.icon}" class="w-10 h-10 ${char.color}"></i>
                        </div>
                        <h3 class="text-xl font-black text-zinc-800 mb-2">${char.name}</h3>
                        <p class="text-xs text-zinc-400 font-bold leading-relaxed">${char.desc}</p>
                    </div>
                `).join('')}
            </div>
            <button onclick="window.App.pages.cardGame.initGame()" class="text-zinc-400 font-bold hover:text-zinc-600 text-sm underline">返回主菜单</button>
        </div>`;
    },

    renderMap: function() {
        const isClassic = this.state.gameMode === 'classic';
        const title = isClassic ? "对决广场" : `第 ${this.state.level} 区域`;
        const nextOpponent = isClassic ? "镜像对手" : this.CONST.ENEMIES[(this.state.level-1)%this.CONST.ENEMIES.length].name;
        
        return `
        <div class="flex flex-col items-center justify-center h-full gap-6 p-4">
            <h2 class="text-2xl font-black text-zinc-700 uppercase tracking-widest">${title}</h2>
            
            ${!isClassic ? `
                <div class="flex gap-4 mb-4 w-full justify-center">
                    <div class="w-full max-w-xs h-1 bg-zinc-200 rounded-full overflow-hidden">
                        <div class="h-full bg-sky-500" style="width: ${(this.state.level / this.state.maxLevel) * 100}%"></div>
                    </div>
                </div>
                <div class="flex gap-4 max-w-lg w-full justify-center mb-8">
                     <div class="bg-yellow-50 px-6 py-2 rounded-full border border-yellow-200 text-yellow-700 font-bold flex items-center gap-2 shadow-sm">
                        <i data-lucide="coins" class="w-4 h-4"></i> ${this.state.gold} G
                     </div>
                </div>
            ` : `
                <div class="text-center text-xs text-zinc-400 font-bold mb-8 max-w-md px-6 leading-relaxed">
                    在经典模式中，双方持有的 42 张卡牌完全一致。<br>所有技能已随机分配到卡牌中（每种技能出现 2 次，单牌上限 3 技能）。
                </div>
            `}

            <div class="grid grid-cols-2 gap-4 max-w-lg w-full">
                <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center gap-2">
                    <div class="text-xs font-bold text-zinc-400">牌库容量</div>
                    <div class="text-3xl font-black text-zinc-800">${isClassic ? 42 : this.state.playerDeck.length}</div>
                    <div class="text-[10px] text-zinc-400 font-bold uppercase">Card Count</div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center gap-2">
                    <div class="text-xs font-bold text-zinc-400">对阵对手</div>
                    <div class="text-xl font-black ${isClassic ? 'text-sky-500' : 'text-rose-500'} mt-1 truncate w-full text-center">${nextOpponent}</div>
                    <div class="text-[10px] text-zinc-400 font-bold uppercase">${isClassic ? 'Mirror Mode' : 'Opponent'}</div>
                </div>
            </div>

            <div class="flex flex-col gap-4 mt-8 w-full items-center">
                <button onclick="window.App.pages.cardGame.enterBattle()" class="atom-btn px-16 py-5 text-xl bg-red-600 text-white border-red-700 shadow-xl shadow-red-200 animate-bounce">
                    开始对决！
                </button>
                <button onclick="window.App.pages.cardGame.initGame()" class="text-zinc-400 font-bold hover:text-zinc-600 text-sm underline">退出</button>
            </div>
        </div>`;
    },

    // --- HELPER: TOOLTIP CONTENT ---
    getCardTooltip: function(card) {
        if (!card.skills || card.skills.length === 0) return '';
        const skillItems = card.skills.map(s => `
            <div class="flex items-start gap-2 mb-1.5 last:mb-0">
                <span class="bg-white/20 px-1.5 rounded text-[10px] font-bold shrink-0 mt-0.5 border border-white/10">${this.CONST.SKILLS[s].name}</span>
                <span class="text-[10px] opacity-90 leading-tight text-left">${this.CONST.SKILLS[s].desc}</span>
            </div>
        `).join('');
        
        return `
            <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 bg-zinc-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-[300] flex flex-col gap-2 scale-90 group-hover:scale-100 origin-bottom">
                <div class="text-xs font-black text-zinc-400 border-b border-white/10 pb-1.5 flex justify-between items-center">
                    <span class="tracking-widest uppercase">${this.CONST.COLOR_NAMES[card.color]}</span>
                    <span class="bg-zinc-800 px-2 py-0.5 rounded-full text-white">点数 ${card.number}</span>
                </div>
                <div class="flex flex-col">${skillItems}</div>
                <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-900 rotate-45 border-r border-b border-white/10"></div>
            </div>
        `;
    },

    getSettlementButtonText: function(totalP, totalA) {
        if (totalP > totalA) return "大获全胜 🐾";
        if (totalA > totalP) return "一败涂地 💦";
        return "旗鼓相当 ⚖️";
    },

    renderBattlePortrait: function() {
        let totalP, totalA, scores;
        if (this.state.mode === 'scoring' && this.state.scoringState) {
             totalP = this.state.scoringState.totalP;
             totalA = this.state.scoringState.totalA;
             scores = [0,1,2].map(i => this.calculateStackScore(i));
        } else {
             scores = [0,1,2].map(i => this.calculateStackScore(i));
             totalP = scores.reduce((a,b)=>a+b.player, 0);
             totalA = scores.reduce((a,b)=>a+b.ai, 0);
        }
        const selCount = this.state.selectedCardIndices.length;
        const enemy = this.state.enemyData || { name: '镜像对手', icon: 'cat', color: 'text-zinc-500' };
        
        let actionBtnHTML = '';
        if (selCount > 0) {
             const btnText = selCount >= 2 ? "多换一" : "丢掉";
             const btnColor = selCount >= 2 ? "bg-sky-500 border-sky-600" : "bg-orange-500 border-orange-600";
             const btnIcon = selCount >= 2 ? "refresh-cw" : "trash-2";
             actionBtnHTML = `
                <button onclick="window.App.pages.cardGame.handleDiscardAction()" class="absolute bottom-28 right-5 z-[60] w-14 h-14 rounded-full ${btnColor} text-white border-b-4 shadow-lg flex flex-col items-center justify-center active:translate-y-1 active:border-b-0 transition-all animate-bounce">
                    <i data-lucide="${btnIcon}" class="w-5 h-5"></i>
                    <span class="text-[10px] font-bold mt-0.5">${btnText}</span>
                </button>
             `;
        }
        
        let modalHtml = '';
        if (this.state.discardConfirmOpen) modalHtml = this.renderDiscardModal();
        else if (this.state.trainingPending) modalHtml = this.renderTrainModal();
        else if (this.state.pileViewMode) modalHtml = this.renderPileModal();
        
        let scoringOverlay = '';
        if (this.state.mode === 'scoring' && this.state.scoringState && this.state.scoringState.finished) {
            scoringOverlay = `
            <div class="absolute inset-x-0 bottom-40 z-[60] flex justify-center pointer-events-none">
                <button onclick="window.App.pages.cardGame.confirmRoundEnd()" class="pointer-events-auto bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xl font-black py-3 px-12 rounded-full shadow-lg border-4 border-white animate-bounce flex items-center gap-2">
                    <span>${this.getSettlementButtonText(totalP, totalA)}</span>
                </button>
            </div>`;
        }
        const isScoring = this.state.mode === 'scoring';
        const activeField = isScoring ? this.state.scoringState.activeField : -1;
        const hand = this.state.hands[0];
        const centerIdx = (hand.length - 1) / 2;
        const handVisuals = hand.map((card, i) => {
            const isSelected = this.state.selectedCardIndices.includes(i);
            const offset = i - centerIdx;
            let rotate = offset * 6; 
            let translateY = Math.abs(offset) * 8 + (Math.abs(offset) > 1 ? 5 : 0); 
            let translateX = offset * 30; 
            let scale = 0.6; 
            let zIndex = i; 
            if (isSelected) {
                rotate = 0; translateY = -90; scale = 0.9; zIndex = 100;
            } 
            const hoverClass = isSelected ? '' : 'hover:z-50 hover:scale-75 hover:-translate-y-12 hover:rotate-0 transition-all duration-200 ease-out';
            const style = `transform: translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale}); z-index: ${zIndex};`;
            return `<div class="absolute bottom-0 origin-bottom transition-all duration-300 ease-out will-change-transform ${hoverClass}" style="${style}">
                ${this.renderPlayerCard(card, i, true)}
            </div>`;
        }).join('');

        return `
            <div class="flex flex-col h-full relative overflow-hidden bg-zinc-50 text-zinc-800">
                ${modalHtml}
                ${scoringOverlay}
                <div class="h-14 shrink-0 bg-white border-b border-zinc-200 shadow-sm flex justify-between items-center px-4 relative z-20">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200 relative">
                             <i data-lucide="${this.state.playerAvatar}" class="w-4 h-4 text-zinc-500"></i>
                             <div class="absolute -bottom-1 -right-1 flex gap-0.5">
                                <div class="w-1.5 h-1.5 rounded-full ${this.state.ippon[0]>0?'bg-green-500':'bg-zinc-300'} border border-white"></div>
                                <div class="w-1.5 h-1.5 rounded-full ${this.state.ippon[0]>1?'bg-green-500':'bg-zinc-300'} border border-white"></div>
                             </div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xl font-black text-green-500 leading-none">${totalP}</span>
                            <span class="text-[8px] text-zinc-400 font-bold uppercase">我方</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="text-[8px] font-bold text-zinc-400 tracking-widest uppercase mb-0.5">ROUND ${this.state.ippon[0]+this.state.ippon[1]+1}</div>
                        ${this.state.log.length > 0 ? `<div class="text-[10px] text-zinc-500 truncate max-w-[100px] bg-zinc-100 px-2 py-0.5 rounded animate-pulse border border-zinc-200">${this.state.log[this.state.log.length-1].text}</div>` : ''}
                    </div>
                    <div class="flex items-center gap-2 flex-row-reverse text-right">
                         <div class="w-8 h-8 ${enemy.bg || 'bg-rose-100'} rounded-full flex items-center justify-center border border-zinc-200 relative">
                             <i data-lucide="${enemy.icon}" class="w-4 h-4 ${enemy.color}"></i>
                             <div class="absolute -bottom-1 -left-1 flex gap-0.5">
                                <div class="w-1.5 h-1.5 rounded-full ${this.state.ippon[1]>0?'bg-rose-500':'bg-zinc-300'} border border-white"></div>
                                <div class="w-1.5 h-1.5 rounded-full ${this.state.ippon[1]>1?'bg-rose-500':'bg-zinc-300'} border border-white"></div>
                             </div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xl font-black text-rose-500 leading-none">${totalA}</span>
                            <span class="text-[8px] text-zinc-400 font-bold uppercase">对方</span>
                        </div>
                    </div>
                </div>
                <div class="h-8 bg-zinc-100 flex justify-between items-center px-4 relative z-10 border-b border-zinc-200">
                     <div class="flex items-center gap-1">
                        ${this.state.hands[1].map(c => `<div class="w-3 h-4 bg-zinc-300 rounded-[2px] border border-zinc-200"></div>`).join('')}
                     </div>
                     <div class="flex gap-2 text-[10px] font-bold text-zinc-500">
                        <span onclick="window.App.pages.cardGame.viewPile('discard', 1)" class="flex items-center gap-1 bg-white border border-zinc-300 px-2 py-0.5 rounded shadow-sm cursor-pointer hover:bg-rose-50 transition-all"><i data-lucide="trash" class="w-3 h-3 text-rose-400"></i> ${this.state.discardPiles[1].length}</span>
                        <span class="flex items-center gap-1 bg-white border border-zinc-300 px-2 py-0.5 rounded shadow-sm text-zinc-400"><i data-lucide="layers" class="w-3 h-3"></i> ${this.state.decks[1].length}</span>
                     </div>
                </div>
                <div class="flex-1 grid grid-cols-3 gap-2 p-2 pb-40 overflow-hidden relative">
                    ${[0, 1, 2].map(idx => {
                        const isDimmed = isScoring && activeField !== -1 && activeField !== idx;
                        const dimClass = isDimmed ? 'opacity-20 grayscale' : '';
                        return `<div class="${dimClass} h-full relative z-0 transition-all duration-300 min-w-0">${this.renderFieldStackPortrait(idx, scores[idx])}</div>`;
                    }).join('')}
                </div>
                ${actionBtnHTML}
                <button onclick="window.App.pages.cardGame.viewPile('draw', 0)" class="absolute bottom-4 left-4 z-50 w-12 h-12 bg-white rounded-full border-2 border-zinc-200 shadow-lg flex flex-col items-center justify-center text-zinc-600 active:scale-95 transition-all">
                    <i data-lucide="layers" class="w-4 h-4 mb-0.5"></i>
                    <span class="text-[9px] font-black">${this.state.decks[0].length}</span>
                </button>
                <button onclick="window.App.pages.cardGame.viewPile('discard', 0)" class="absolute bottom-4 right-4 z-50 w-12 h-12 bg-white rounded-full border-2 border-zinc-200 shadow-lg flex flex-col items-center justify-center text-zinc-600 active:scale-95 transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4 mb-0.5 text-rose-500"></i>
                    <span class="text-[9px] font-black">${this.state.discardPiles[0].length}</span>
                </button>
                <div class="absolute bottom-2 left-0 right-0 h-0 z-40 flex justify-center items-end pointer-events-none overflow-visible">
                    <div class="relative w-1 h-1 flex justify-center items-end pointer-events-auto overflow-visible">
                         ${hand.length === 0 ? '<div class="absolute bottom-24 w-32 text-center text-zinc-300 text-xs font-bold animate-pulse -ml-16 uppercase">牌组已空</div>' : handVisuals}
                    </div>
                </div>
            </div>
        `;
    },

    renderBattleLandscape: function() {
        let totalP, totalA, scores;
        if (this.state.mode === 'scoring' && this.state.scoringState) {
             totalP = this.state.scoringState.totalP;
             totalA = this.state.scoringState.totalA;
             scores = [0,1,2].map(i => this.calculateStackScore(i));
        } else {
             scores = [0,1,2].map(i => this.calculateStackScore(i));
             totalP = scores.reduce((a,b)=>a+b.player, 0);
             totalA = scores.reduce((a,b)=>a+b.ai, 0);
        }
        const selCount = this.state.selectedCardIndices.length;
        const targetMode = this.state.awaitingTarget !== null;
        const enemy = this.state.enemyData || { name: '镜像对手', icon: 'cat', color: 'text-zinc-500' };
        
        let actionBtnText = "丢弃";
        let actionBtnColor = "bg-zinc-200 text-zinc-500 cursor-not-allowed"; 
        let actionIcon = "trash-2";
        let actionClick = "";
        
        if (selCount > 0) {
             actionBtnColor = "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200 cursor-pointer shadow-sm active:scale-95";
             actionClick = "window.App.pages.cardGame.handleDiscardAction()";
             if (selCount >= 2) {
                 actionBtnText = "多换一";
                 actionBtnColor = "bg-sky-100 text-sky-600 border-sky-200 hover:bg-sky-200 cursor-pointer shadow-sm active:scale-95";
                 actionIcon = "refresh-cw";
             }
        }
        
        let modalHtml = '';
        if (this.state.discardConfirmOpen) modalHtml = this.renderDiscardModal();
        else if (this.state.trainingPending) modalHtml = this.renderTrainModal();
        else if (this.state.pileViewMode) modalHtml = this.renderPileModal();
        
        let scoringOverlay = '';
        if (this.state.mode === 'scoring' && this.state.scoringState && this.state.scoringState.finished) {
            scoringOverlay = `
            <div class="absolute inset-x-0 bottom-32 z-[60] flex justify-center pointer-events-none">
                <button onclick="window.App.pages.cardGame.confirmRoundEnd()" class="pointer-events-auto bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xl font-black py-3 px-12 rounded-full shadow-lg border-4 border-white animate-bounce flex items-center gap-2">
                    <span>${this.getSettlementButtonText(totalP, totalA)}</span>
                </button>
            </div>`;
        }
        const isScoring = this.state.mode === 'scoring';
        const activeField = isScoring ? this.state.scoringState.activeField : -1;

        return `
            <div class="flex flex-col md:flex-row h-full gap-4 relative">
                ${modalHtml}
                ${scoringOverlay}
                <div class="hidden md:flex w-64 flex-col gap-2 shrink-0">
                     <div class="bg-white p-4 rounded-xl shadow-lg border border-zinc-200 relative overflow-hidden">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white">
                                <i data-lucide="${this.state.playerAvatar}" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <div class="text-xs text-zinc-400 font-bold uppercase">对战方</div>
                                <div class="font-black text-zinc-800">${this.state.character ? (this.CONST.CHARACTERS[this.state.character]?.name || '对战方') : '我方伙伴'}</div>
                            </div>
                        </div>
                        <div class="flex justify-between items-end border-t border-zinc-100 pt-2">
                            <div class="flex flex-col"><span class="text-xs text-zinc-400 font-bold uppercase">累计点数</span><span id="score-player" class="text-3xl font-black text-green-500 transition-all duration-300 transform ${isScoring?'scale-110':''}">${totalP}</span></div>
                            <div class="flex gap-1">
                                <div class="w-2 h-2 rounded-full ${this.state.ippon[0]>0?'bg-green-500':'bg-zinc-200'}"></div>
                                <div class="w-2 h-2 rounded-full ${this.state.ippon[0]>1?'bg-green-500':'bg-zinc-200'}"></div>
                            </div>
                        </div>
                     </div>
                     <div class="bg-white p-4 rounded-xl shadow-lg border border-zinc-200 relative overflow-hidden">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 ${enemy.bg || 'bg-rose-100'} rounded-full flex items-center justify-center ${enemy.color || 'text-rose-500'}">
                                <i data-lucide="${enemy.icon}" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <div class="text-xs text-zinc-400 font-bold uppercase">对手方</div>
                                <div class="font-black ${enemy.color || 'text-rose-600'}">${enemy.name}</div>
                            </div>
                        </div>
                        <div class="flex justify-between items-end border-t border-zinc-100 pt-2">
                            <div class="flex flex-col"><span class="text-xs text-zinc-400 font-bold uppercase">累计点数</span><span id="score-ai" class="text-3xl font-black text-rose-500 transition-all duration-300 transform ${isScoring?'scale-110':''}">${totalA}</span></div>
                            <div class="flex gap-1">
                                <div class="w-2 h-2 rounded-full ${this.state.ippon[1]>0?'bg-rose-500':'bg-zinc-200'}"></div>
                                <div class="w-2 h-2 rounded-full ${this.state.ippon[1]>1?'bg-rose-500':'bg-zinc-200'}"></div>
                            </div>
                        </div>
                     </div>
                     <div class="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-3 overflow-hidden flex flex-col shadow-inner min-h-0">
                        <div id="game-log-content" class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 font-mono h-[200px]">
                             ${this.state.log.map(l => `<div class="text-xs ${l.color} mb-1 border-b border-white/5 pb-1">${l.text}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="flex-1 flex flex-col gap-2 min-w-0 relative">
                    <div class="flex justify-between items-end px-4 h-20">
                         <div class="flex -space-x-3">
                            ${this.state.hands[1].map(c => `<div id="ai-card-${c.id}" class="w-10 h-14 bg-zinc-700 border border-zinc-600 rounded shadow-sm"></div>`).join('')}
                         </div>
                         <div class="flex gap-2 text-[10px] font-bold text-zinc-400">
                             <div class="flex flex-col items-center"><i data-lucide="layers" class="w-4 h-4 mb-1"></i>${this.state.decks[1].length}</div>
                             <div class="flex flex-col items-center cursor-pointer hover:text-red-500 transition-colors" onclick="window.App.pages.cardGame.viewPile('discard', 1)" title="查看对手弃牌堆"><i data-lucide="trash" class="w-4 h-4 mb-1"></i>${this.state.discardPiles[1].length}</div>
                         </div>
                    </div>
                    <div class="flex-1 grid grid-cols-3 gap-2 md:gap-4 p-2 bg-zinc-100/50 rounded-3xl border border-zinc-200 shadow-inner relative z-0">
                        ${[0, 1, 2].map(idx => {
                            const isDimmed = isScoring && activeField !== -1 && activeField !== idx;
                            const dimClass = isDimmed ? 'opacity-20 grayscale transition-all duration-500' : 'transition-all duration-500';
                            return `<div class="${dimClass} h-full relative z-10">${this.renderFieldStack(idx, scores[idx])}</div>`;
                        }).join('')}
                    </div>
                    <div class="h-48 relative flex items-end px-4 gap-4 ${isScoring ? 'opacity-50 pointer-events-none grayscale' : ''}">
                        <div class="flex flex-col gap-2 mb-4 shrink-0 z-10">
                            <button onclick="window.App.pages.cardGame.viewPile('draw', 0)" class="w-12 h-16 bg-zinc-800 rounded border-2 border-zinc-600 flex flex-col items-center justify-center text-zinc-400 shadow-lg group">
                                <i data-lucide="layers" class="w-5 h-5 mb-1 text-zinc-300 group-hover:text-white"></i>
                                <span class="text-[10px] font-bold">${this.state.decks[0].length}</span>
                            </button>
                            <button onclick="window.App.pages.cardGame.viewPile('discard', 0)" class="w-12 h-16 bg-zinc-200 rounded border-2 border-zinc-300 flex flex-col items-center justify-center text-zinc-500 shadow hover:bg-zinc-300 group">
                                <i data-lucide="trash-2" class="w-5 h-5 mb-1 group-hover:text-red-500"></i>
                                <span class="text-[10px] font-bold">${this.state.discardPiles[0].length}</span>
                            </button>
                        </div>
                        <div class="flex-1 flex items-end justify-center gap-2 md:gap-4 -ml-6 mr-20"> 
                            ${this.state.hands[0].map((card, i) => this.renderPlayerCard(card, i)).join('')}
                        </div>
                        <div class="absolute right-4 bottom-6 z-20">
                            ${selCount > 0 ? `
                            <button onclick="${actionClick}" class="w-24 h-24 rounded-full border-4 font-bold transition-all flex flex-col items-center justify-center gap-1 shadow-lg ${actionBtnColor}">
                                <i data-lucide="${actionIcon}" class="w-6 h-6"></i>
                                <span class="text-xs">${actionBtnText}</span>
                            </button>` : ''}
                        </div>
                    </div>
                </div>
                ${targetMode ? `<div class="absolute inset-0 bg-black/40 z-50 flex items-center justify-center pointer-events-none"><div class="bg-black text-white px-6 py-3 rounded-full animate-bounce font-bold pointer-events-auto">点击指定目标区域</div></div>` : ''}
            </div>`;
    },
    
    renderPileModal: function() {
        const mode = this.state.pileViewMode;
        if (!mode) return '';
        const isEnemy = mode.owner === 1;
        const pileName = mode.type === 'draw' ? '牌组' : '弃牌堆';
        const ownerName = isEnemy ? '对方' : '我方';
        let cards = [];
        if (mode.type === 'draw') {
            cards = [...this.state.decks[mode.owner]].sort((a,b) => (a.color - b.color) || (a.number - b.number));
        } else {
            cards = [...this.state.discardPiles[mode.owner]];
        }
        const isPortrait = this.isPortrait();
        const gridClass = isPortrait ? "grid grid-cols-4 gap-1 place-items-center" : "flex flex-wrap justify-center gap-4";
        const cardWrapperStyle = isPortrait ? 'width: 77px; height: 116px;' : '';
        const innerTransform = isPortrait ? 'transform: scale(0.6); transform-origin: top left;' : 'transform: scale(0.9);';

        return `
        <div class="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-hidden">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border-4 ${isEnemy ? 'border-rose-400' : 'border-zinc-200'}">
                <div class="p-3 border-b border-zinc-200 flex justify-between items-center bg-zinc-50 shrink-0">
                    <h3 class="text-base md:text-lg font-black ${isEnemy ? 'text-rose-500' : 'text-zinc-800'}">${ownerName}${pileName} (${cards.length})</h3>
                    <button onclick="window.App.pages.cardGame.closeModal()" class="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 rounded-full transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <!-- pt-24 allows the top-row tooltips to display without clipping -->
                <div class="flex-1 overflow-y-auto p-4 bg-zinc-100/50 pt-24">
                    <div class="${gridClass} overflow-visible">
                        ${cards.length === 0 ? '<div class="col-span-4 text-zinc-400 font-bold py-10 w-full text-center uppercase tracking-widest">目前暂无卡牌</div>' : cards.map(c => `
                            <div style="${cardWrapperStyle}" class="relative overflow-visible">
                                <div style="${innerTransform}" class="overflow-visible">
                                    ${this.renderCardStatic(c)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    },
    
    renderDiscardModal: function() {
        return `<div class="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border-4 border-zinc-200 animate-in zoom-in duration-200">
                <div class="text-center">
                    <h3 class="text-lg font-black mb-2">执行战术置换？</h3>
                    <p class="text-sm text-zinc-500 mb-4 font-bold">弃置选中的 ${this.state.selectedCardIndices.length} 张牌，并重新抽取 1 张。</p>
                    <div class="flex gap-2">
                        <button onclick="window.App.pages.cardGame.cancelDiscard()" class="flex-1 py-3 bg-zinc-100 rounded-xl font-bold hover:bg-zinc-200 transition-colors">取消</button>
                        <button onclick="window.App.pages.cardGame.confirmDiscard()" class="flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg">确认执行</button>
                    </div>
                </div>
            </div></div>`;
    },
    
    renderTrainModal: function() {
        return `<div class="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border-4 border-zinc-200 animate-in zoom-in duration-200">
                <div class="text-center">
                    <h3 class="text-lg font-black mb-4">下达特训指令</h3>
                    <p class="text-sm text-zinc-500 mb-6 font-bold">指定相邻手牌的点数调整方向：</p>
                    <div class="flex gap-4">
                        <button onclick="window.App.pages.cardGame.handleTrainChoice(-1)" class="flex-1 py-4 bg-zinc-100 text-xl font-black rounded-xl hover:bg-zinc-200 border-2 border-zinc-300">-1</button>
                        <button onclick="window.App.pages.cardGame.handleTrainChoice(1)" class="flex-1 py-4 bg-amber-500 text-white text-xl font-black rounded-xl hover:bg-amber-600 border-2 border-amber-600 shadow-lg">+1</button>
                    </div>
                </div>
            </div></div>`;
    },

    renderReward: function() {
        const isPortrait = this.isPortrait();
        const containerClass = isPortrait 
            ? "flex flex-col items-center justify-start h-full gap-2 overflow-y-auto pb-4 pt-2"
            : "flex flex-col items-center justify-center h-full gap-4 overflow-y-auto pb-4";
        const titleSize = isPortrait ? "text-2xl" : "text-3xl";
        const groupWrapperClass = isPortrait ? "flex flex-col w-full max-w-lg gap-2 flex-1 px-4" : "flex flex-col w-full max-w-4xl gap-4 flex-1";
        const groupClass = isPortrait
            ? "bg-white rounded-xl border-2 border-zinc-200 p-2 flex flex-row items-center justify-between gap-2 shadow-sm shrink-0 w-full"
            : "bg-white rounded-2xl border-2 border-zinc-200 p-4 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:border-amber-400 hover:shadow-lg transition-all group/pack relative shrink-0";
        const cardContainerClass = isPortrait
            ? "flex-1 flex justify-center gap-0 overflow-x-visible"
            : "flex-1 flex justify-center md:justify-start gap-2 overflow-x-visible p-2";
        const cardScaleStyle = isPortrait ? "transform: scale(0.5); margin-left: -1rem; margin-right: -1rem;" : "transform: scale(0.75); transform-origin: center;";
        const btnClass = isPortrait
            ? "bg-zinc-800 text-white px-3 py-2 text-xs rounded-full font-bold shadow-lg active:scale-95"
            : "bg-zinc-800 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-500 transition-colors shadow-lg active:scale-95";
        const iconClass = isPortrait
            ? "w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-300 text-[10px]"
            : "w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center border-2 border-zinc-300 mb-2";

        return `
        <div class="${containerClass}">
            <h2 class="${titleSize} font-black text-amber-500 shrink-0">战斗优胜</h2>
            <p class="text-zinc-500 font-bold shrink-0 text-xs md:text-base">获得战利品：请选择一组卡牌加入牌组</p>
            <div class="${groupWrapperClass}">
                ${this.state.rewardGroups.map((group, idx) => `
                    <div class="${groupClass}">
                         <div class="flex flex-col items-center justify-center shrink-0 ${isPortrait?'w-10':'w-24'}">
                            <div class="${iconClass}">
                                <span class="font-black text-zinc-400">${idx+1}</span>
                            </div>
                         </div>
                         <div class="${cardContainerClass}">
                            ${group.map((card) => `<div style="${cardScaleStyle}" class="relative overflow-visible">${this.renderCardStatic(card)}</div>`).join('')}
                         </div>
                         <div class="shrink-0">
                             <button onclick="window.App.pages.cardGame.selectRewardGroup(${idx})" class="${btnClass}">
                                 收录
                             </button>
                         </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="window.App.pages.cardGame.skipReward()" class="mt-2 text-zinc-400 hover:text-zinc-600 text-sm font-bold underline shrink-0 pb-4">放弃奖励</button>
        </div>`;
    },

    renderEvent: function() {
        const evt = this.state.eventData;
        let content = '';
        if (evt.type === 'shop') {
             const removalMode = evt.removalMode;
             let deckView = '';
             if (removalMode) {
                 deckView = `<div class="w-full mt-4"><p class="text-center text-red-500 font-bold mb-4 animate-pulse">选择要移除的卡牌 (支付 100 G)</p><div class="flex flex-wrap justify-center gap-2 max-h-[300px] overflow-y-auto p-4 bg-zinc-100 rounded-xl">${this.state.playerDeck.map((c, i) => `<div onclick="window.App.pages.cardGame.buyRemoval(${i})" class="scale-75 cursor-pointer hover:opacity-80 transition-opacity -ml-4 first:ml-0 relative group"><div class="absolute inset-0 bg-red-500/20 z-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 font-bold text-white uppercase">移除</div>${this.renderCardStatic(c)}</div>`).join('')}</div></div>`;
             }
             content = `
                <div class="w-16 h-16 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-4"><i data-lucide="store" class="w-8 h-8"></i></div>
                <h3 class="text-2xl font-black text-zinc-800 mb-2">流浪交易所</h3>
                <div class="flex items-center gap-2 mb-6 bg-yellow-50 px-4 py-1 rounded-full border border-yellow-200 text-yellow-700 font-bold shadow-sm"><i data-lucide="coins" class="w-4 h-4"></i> ${this.state.gold} G</div>
                <div class="grid grid-cols-2 gap-4 w-full max-w-lg mb-4">
                    <button onclick="window.App.pages.cardGame.buyCardPack()" class="flex flex-col items-center p-6 bg-white border-2 border-zinc-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"><i data-lucide="package-plus" class="w-8 h-8 text-purple-500 mb-2"></i><span class="font-bold text-zinc-700">扩充包</span><span class="text-xs font-bold text-yellow-600 mt-1">50 G</span></button>
                    <button onclick="window.App.pages.cardGame.toggleRemovalMode()" class="flex flex-col items-center p-6 bg-white border-2 border-zinc-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all ${removalMode ? 'ring-2 ring-red-500 border-red-500' : ''}"><i data-lucide="trash-2" class="w-8 h-8 text-red-500 mb-2"></i><span class="font-bold text-zinc-700">卡牌精简</span><span class="text-xs font-bold text-yellow-600 mt-1">100 G</span></button>
                </div>
                ${deckView}
                <button onclick="window.App.pages.cardGame.resolveEvent()" class="mt-6 text-zinc-400 hover:text-zinc-600 font-bold uppercase tracking-widest">离开</button>`;
        } else if (evt.type === 'blacksmith') {
             content = `<div class="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4"><i data-lucide="hammer" class="w-8 h-8"></i></div><h3 class="text-2xl font-black text-zinc-800 mb-2">卡牌强化所</h3><p class="text-zinc-500 mb-6 text-center max-w-md font-bold">选择一张卡牌进行特化改造 (点数+1 并获得随机技能)</p><div class="flex flex-wrap justify-center gap-2 max-h-[300px] overflow-y-auto p-4 bg-zinc-100 rounded-xl w-full max-w-3xl">${this.state.playerDeck.map((c, i) => `<div onclick="window.App.pages.cardGame.state.eventData.selectedIdx = ${i}; window.App.pages.cardGame.resolveEvent()" class="scale-75 cursor-pointer hover:opacity-80 transition-opacity -ml-4 first:ml-0">${this.renderCardStatic(c)}</div>`).join('')}</div><button onclick="window.App.pages.cardGame.state.eventData.selectedIdx = null; window.App.pages.cardGame.resolveEvent()" class="mt-6 text-zinc-400 hover:text-zinc-600 font-bold uppercase tracking-widest">跳过</button>`;
        } else {
             content = `<div class="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"><i data-lucide="tent" class="w-8 h-8"></i></div><h3 class="text-2xl font-black text-zinc-800 mb-2">整备营地</h3><p class="text-zinc-500 mb-6 text-center max-w-md font-bold">休整完毕，准备迎接下一阶段的对决。</p><button onclick="window.App.pages.cardGame.resolveEvent()" class="atom-btn px-8 py-3 bg-zinc-800 text-white">出发</button>`;
        }
        return `<div class="flex flex-col items-center justify-center h-full fade-in">${content}</div>`;
    },

    renderCardStatic: function(card, showShiny = false) {
        const bg = this.CONST.COLORS[card.color];
        const iconName = this.CONST.COLOR_ICONS[card.color];
        const shinyClass = showShiny ? 'card-shine' : '';
        const tooltip = this.getCardTooltip(card);
        
        return `
        <div class="group relative w-32 h-48 select-none overflow-visible">
            ${tooltip}
            <div class="absolute inset-0 rounded-xl ${bg} border-4 border-white shadow-xl flex flex-col items-center p-3 text-white overflow-hidden ${shinyClass}">
                <div class="absolute top-2 right-2 opacity-50"><i data-lucide="${iconName}" class="w-6 h-6"></i></div>
                <div class="mt-4 text-6xl font-black drop-shadow-md">${this.getCardValue(card)}</div>
                <div class="mt-auto w-full flex flex-col gap-1">
                    ${card.skills.map(s => `<div class="bg-black/20 rounded px-1 text-[10px] font-bold text-center py-0.5">${this.CONST.SKILLS[s].name}</div>`).join('')}
                </div>
            </div>
        </div>`;
    },
    
    renderPlayerCard: function(card, idx, isPortraitFan = false) {
        const isSelected = this.state.selectedCardIndices.includes(idx);
        const bg = this.CONST.COLORS[card.color];
        const iconName = this.CONST.COLOR_ICONS[card.color];
        let activeClass = isPortraitFan 
            ? (isSelected ? 'border-amber-300 shadow-2xl ring-4 ring-amber-200/50' : 'border-white shadow-lg')
            : (isSelected ? 'border-amber-300 -translate-y-10 shadow-2xl ring-4 ring-amber-200/50 z-20' : 'border-white hover:-translate-y-6 hover:shadow-xl z-10');
        const animClass = (Date.now() - (card.drawnAt || 0) < 500) ? 'animate-draw' : '';
        const tooltip = this.getCardTooltip(card);
        
        let numberHtml = isPortraitFan 
            ? `<div class="absolute top-1 left-2 text-4xl font-black drop-shadow-md z-10 leading-none">${this.getCardValue(card)}</div>`
            : `<div class="mt-4 text-6xl font-black drop-shadow-md">${this.getCardValue(card)}</div>`;

        return `
        <div id="card-${card.id}" class="group relative flex flex-col items-center ${animClass} overflow-visible">
            ${tooltip}
            <div onclick="window.App.pages.cardGame.selectCard(${idx})" class="w-32 h-48 shrink-0 rounded-xl ${bg} border-4 ${activeClass} relative flex flex-col items-center p-3 text-white cursor-pointer transition-all duration-200 select-none overflow-hidden">
                <div class="absolute top-2 right-2 opacity-50"><i data-lucide="${iconName}" class="w-6 h-6"></i></div>
                ${numberHtml}
                <div class="mt-auto w-full flex flex-col gap-1">
                    ${card.skills.map(s => `<div class="bg-black/20 rounded px-1 text-[10px] font-bold text-center py-0.5">${this.CONST.SKILLS[s].name}</div>`).join('')}
                </div>
                ${isSelected ? '<div class="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white"><i data-lucide="check" class="w-3 h-3"></i></div>' : ''}
            </div>
        </div>`;
    },
    
    renderFieldStack: function(idx, score) {
        const stack = this.state.fields[idx];
        const stackColor = this.getStackColor(idx);
        const baseBg = stackColor === 0 ? 'bg-red-50' : stackColor === 1 ? 'bg-amber-50' : 'bg-sky-50';
        const borderColor = this.CONST.COLOR_BORDERS[stackColor];
        const containerH = 460; const cardH = 128; const baseGap = 10; 
        const availableContentH = containerH - 60; 
        const standardStep = cardH + baseGap;
        let step = standardStep;
        if (stack.length > 1 && (stack.length-1) * standardStep + cardH > availableContentH) {
             step = (availableContentH - cardH) / (stack.length - 1);
        }
        const stackVisuals = stack.map((c, i) => this.renderSmallCard(c, i, i * step)).join('');
        const selIndices = this.state.selectedCardIndices;
        let overlayContent = '';
        let cursorClass = 'cursor-pointer hover:bg-black/5';
        const topCard = stack.length > 0 ? stack[stack.length - 1] : null;
        const isLocked = topCard && this.hasSkill(topCard, 'lock');
        const lockIcon = isLocked ? `<div class="absolute -top-3 -right-3 z-30 bg-zinc-800 text-white w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-pulse"><i data-lucide="lock" class="w-4 h-4"></i></div>` : '';
        if (selIndices.length === 1 && this.state.turn === 0 && !this.state.awaitingTarget) {
            if (this.canPlay(this.state.hands[0][selIndices[0]], idx)) {
                 overlayContent = `<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"><div class="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce ring-4 ring-green-200/50">出牌</div></div>`;
                 cursorClass = 'cursor-pointer bg-green-500/5 hover:bg-green-500/10 border-green-400';
            }
        } else if (this.state.awaitingTarget) {
            overlayContent = `<div class="bg-rose-500 text-white text-xs px-2 py-1 rounded shadow animate-pulse absolute inset-0 flex items-center justify-center pointer-events-none z-30 h-8 m-auto w-max">指定目标</div>`;
            cursorClass = 'cursor-pointer ring-4 ring-rose-500/50 bg-rose-500/10 z-[60]';
        }
        return `
        <div onclick="window.App.pages.cardGame.handleStackClick(${idx})" class="relative h-[460px] border-2 ${borderColor} ${baseBg} rounded-2xl flex flex-col group transition-colors ${cursorClass} overflow-visible z-0">
            ${lockIcon} ${overlayContent}
            <div class="absolute top-0 left-0 right-0 p-2 flex justify-between items-start pointer-events-none z-20 bg-gradient-to-b from-white/90 to-transparent h-12 rounded-t-xl overflow-hidden">
                 <div class="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold ${this.CONST.COLOR_TEXT[stackColor]} shadow-sm border border-black/5">${this.CONST.COLOR_NAMES[stackColor]}</div>
                 <div class="flex flex-col items-end"><span class="text-xs font-black ${score.ai > score.player ? 'text-red-500' : 'text-zinc-400'}">${score.ai}</span><div class="w-full h-[1px] bg-zinc-300 my-0.5"></div><span class="text-sm font-black ${score.player > score.ai ? 'text-green-500' : 'text-zinc-600'}">${score.player}</span></div>
            </div>
            <div id="stack-container-${idx}" class="relative w-full h-full mt-10 overflow-visible">
                ${stackVisuals}
            </div>
        </div>`;
    },

    renderFieldStackPortrait: function(idx, score) {
        const stack = this.state.fields[idx];
        const stackColor = this.getStackColor(idx);
        const baseBg = stackColor === 0 ? 'bg-red-50' : stackColor === 1 ? 'bg-amber-50' : 'bg-sky-50';
        const borderColor = stackColor === 0 ? 'border-red-200' : stackColor === 1 ? 'border-amber-200' : 'border-sky-200';
        const textColor = stackColor === 0 ? 'text-red-600' : stackColor === 1 ? 'text-amber-600' : 'text-sky-600';
        let cardPositions = [];
        const step = 8; 
        for(let i=0; i<stack.length; i++) cardPositions.push(Math.min(i * step, 60));
        const stackVisuals = stack.map((c, i) => {
            return `<div style="top: ${cardPositions[i]}%; left: 0; right: 0; position: absolute; display: flex; justify-content: center; z-index: ${i}; overflow: visible;">
                        <div class="transform scale-75 origin-top overflow-visible">${this.renderSmallCard(c, i, undefined, true)}</div>
                    </div>`;
        }).join('');
        const selIndices = this.state.selectedCardIndices;
        let overlayContent = '', cursorClass = '';
        const topCard = stack.length > 0 ? stack[stack.length - 1] : null;
        const isLocked = topCard && this.hasSkill(topCard, 'lock');
        const lockIcon = isLocked ? `<div class="absolute -top-2 -right-2 z-30 bg-zinc-800 text-white w-6 h-6 flex items-center justify-center rounded-full border border-white shadow-lg animate-pulse"><i data-lucide="lock" class="w-3 h-3"></i></div>` : '';
        if (selIndices.length === 1 && this.state.turn === 0 && !this.state.awaitingTarget) {
            if (this.canPlay(this.state.hands[0][selIndices[0]], idx)) {
                 overlayContent = `<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"><div class="bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow animate-pulse">出牌</div></div>`;
                 cursorClass = 'ring-2 ring-green-500 bg-green-50/50';
            }
        } else if (this.state.awaitingTarget) {
            overlayContent = `<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"><div class="bg-rose-500 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse">目标</div></div>`;
            cursorClass = 'ring-2 ring-rose-500 bg-rose-50/50';
        }
        return `
        <div onclick="window.App.pages.cardGame.handleStackClick(${idx})" class="relative h-full rounded-xl border-2 ${borderColor} ${baseBg} ${cursorClass} flex flex-col overflow-visible transition-all active:scale-95 shadow-sm">
            ${lockIcon} ${overlayContent}
            <div class="h-10 border-b ${borderColor} bg-white/60 flex flex-col items-center justify-center shrink-0 z-20 backdrop-blur-sm rounded-t-xl">
                 <span class="text-[10px] font-black ${textColor}">${this.CONST.COLOR_NAMES[stackColor]}</span>
                 <div class="flex items-center gap-2 text-[10px] font-bold">
                     <span class="text-rose-500">${score.ai}</span>
                     <span class="text-zinc-400">/</span>
                     <span class="text-green-500">${score.player}</span>
                 </div>
            </div>
            <div id="stack-container-${idx}" class="relative flex-1 w-full overflow-visible">
                ${stackVisuals}
            </div>
        </div>`;
    },
    
    renderSmallCard: function(card, index, topPos, isPortraitStack = false) {
        const bg = this.CONST.COLORS[card.color];
        const isMine = card.owner === 0;
        const borderClass = isMine ? 'border-green-500 ring-2 ring-green-200' : 'border-rose-500 ring-2 ring-rose-200';
        const skillIcons = card.skills.slice(0, 3).map(s => `<div class="w-5 h-5 bg-black/40 rounded-full text-[9px] flex items-center justify-center text-white font-bold shadow-sm ring-1 ring-white/20" title="${this.CONST.SKILLS[s].name}">${this.CONST.SKILLS[s].short}</div>`).join('');
        const tooltip = this.getCardTooltip(card);
        const isFreshPlay = this.state.lastPlayedCard.id === card.id && (Date.now() - this.state.lastPlayedCard.time < 1000);
        const style = (topPos !== undefined && !isPortraitStack) ? `top: ${topPos}px; left: 10%; width: 80%; z-index: ${index};` : '';
        const posClass = isPortraitStack ? '' : 'absolute';

        return `
        <div id="small-card-${card.id}" style="${style}" class="${posClass} h-32 w-24 rounded-xl border-4 ${borderClass} ${bg} shadow-lg flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 hover:!z-[100] shrink-0 ${isFreshPlay?'animate-ai-drop':''} group cursor-help overflow-visible">
             ${tooltip}
             <div class="absolute inset-0 overflow-hidden rounded-lg">
                <div class="absolute top-1 right-1 flex gap-1 flex-wrap justify-end max-w-[80%]">${skillIcons}</div>
                <div class="text-3xl font-black drop-shadow-md absolute bottom-2 left-2">${this.getCardValue(card)}</div>
             </div>
        </div>`;
    },
    
    animateElementExit: async function(elementId, isAi = false) {
        const el = document.getElementById(elementId);
        if(el) {
            el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.transform = isAi ? 'scale(0)' : 'translateY(-100px) scale(0.8) rotate(5deg)';
            el.style.opacity = '0';
            await new Promise(r => setTimeout(r, 250));
        }
    },
    
    showFloatingScore: function(targetEl, text, color) {
        const rect = targetEl.getBoundingClientRect();
        const floatEl = document.createElement('div');
        floatEl.className = 'fixed z-[100] pointer-events-none font-black text-2xl drop-shadow-md animate-float-up';
        floatEl.style.color = color;
        floatEl.style.left = `${rect.left + rect.width / 2}px`;
        floatEl.style.top = `${rect.top}px`;
        floatEl.style.transform = 'translateX(-50%)';
        floatEl.innerText = text;
        document.body.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 1000);
    },

    injectStyles: function() {
        if (!document.getElementById('card-game-styles')) {
            const style = document.createElement('style');
            style.id = 'card-game-styles';
            style.innerHTML = `
                @keyframes drawCard { 0% { transform: translateY(60px) scale(0.8); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
                .animate-draw { animation: drawCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                @keyframes aiDrop { 0% { transform: translateY(-100px) scale(1.1); opacity: 0; } 60% { transform: translateY(10px) scale(1); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
                .animate-ai-drop { animation: aiDrop 0.5s ease-out forwards; }
                @keyframes boomEffect { 0% { transform: scale(1); filter: brightness(1); } 20% { transform: scale(1.2) rotate(5deg); filter: brightness(2) hue-rotate(-30deg); } 40% { transform: scale(1.1) rotate(-5deg); filter: brightness(1.5); } 100% { transform: scale(0); opacity: 0; } }
                .animate-boom { animation: boomEffect 0.6s ease-in forwards !important; }
                @keyframes bounceEffect { 0% { transform: translateY(0); } 30% { transform: translateY(10px); } 100% { transform: translateY(-200px); opacity: 0; } }
                .animate-bounce-up { animation: bounceEffect 0.5s ease-in forwards !important; }
                @keyframes floatUp { 0% { transform: translate(-50%, 0) scale(0.8); opacity: 0; } 20% { transform: translate(-50%, -20px) scale(1.2); opacity: 1; } 100% { transform: translate(-50%, -60px) scale(1); opacity: 0; } }
                .animate-float-up { animation: floatUp 0.8s ease-out forwards; }
                .card-shine { overflow: hidden; position: relative; }
                .card-shine::after { content:''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-25deg); animation: shine 3s infinite; }
                @keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
            `;
            document.head.appendChild(style);
        }
    }
});

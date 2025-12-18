

// --- CARD GAME UI & RENDERERS ---
// Requires: card-game.js (which defines window.App.pages.cardGame)

window.App = window.App || {};
window.App.pages = window.App.pages || {};
window.App.pages.cardGame = window.App.pages.cardGame || {};

Object.assign(window.App.pages.cardGame, {
    
    // --- HELPER: ORIENTATION CHECK ---
    isPortrait: function() {
        return window.innerHeight > window.innerWidth;
    },

    // --- MAIN RENDER WRAPPER ---
    render: function() {
        // Dynamic container class based on orientation
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
            
            // Auto-scroll log
            const logEl = document.getElementById('game-log-content');
            if (logEl) logEl.scrollTop = logEl.scrollHeight;
        }
    },

    renderContent: function() {
        switch(this.state.mode) {
            case 'intro': return this.renderIntro();
            case 'map': return this.renderMap();
            case 'battle': 
            case 'scoring': 
                return this.isPortrait() ? this.renderBattlePortrait() : this.renderBattleLandscape();
            case 'reward': return this.renderReward();
            case 'event': return this.renderEvent();
            default: return this.renderIntro();
        }
    },

    // --- VIEW COMPONENT RENDERERS ---

    renderIntro: function() {
        return `
        <div class="flex flex-col items-center justify-center h-full gap-8 text-center p-4">
            <div class="relative">
                <div class="absolute -inset-4 bg-gradient-to-r from-red-600 via-amber-500 to-sky-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div class="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center text-white shadow-2xl relative z-10 border border-white/10">
                    <i data-lucide="gamepad-2" class="w-12 h-12"></i>
                </div>
            </div>
            <div>
                <h1 class="text-4xl font-black text-zinc-800 mb-2">卡牌冒险者</h1>
                <p class="text-zinc-500 font-bold">Roguelite Deck Builder</p>
            </div>
            <div class="max-w-md text-sm text-zinc-500 leading-relaxed bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
                <p class="mb-2">勇者，选择你的卡牌，击败怪兽！</p>
                <ul class="text-left list-disc pl-5 space-y-1">
                    <li><span class="text-red-600 font-bold">力量</span> (拳)、<span class="text-amber-600 font-bold">勇气</span> (冠)、<span class="text-sky-600 font-bold">智慧</span> (灯) 相生相克。</li>
                    <li>点击左下角可查看 <span class="font-bold text-zinc-700">牌堆</span> 与 <span class="font-bold text-zinc-700">弃牌堆</span>。</li>
                    <li>战斗获胜可获得 <span class="text-amber-500 font-bold">金币</span> 和 <span class="text-purple-500 font-bold">卡牌包</span>。</li>
                </ul>
            </div>
            <button onclick="window.App.pages.cardGame.initGame(); window.App.pages.cardGame.startRun()" class="atom-btn px-12 py-4 text-lg bg-zinc-800 text-white border-zinc-600 hover:bg-black">
                开始冒险
            </button>
        </div>`;
    },

    renderMap: function() {
        return `
        <div class="flex flex-col items-center justify-center h-full gap-6 p-4">
            <h2 class="text-2xl font-black text-zinc-700">第 ${this.state.level} 层</h2>
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

            <div class="grid grid-cols-2 gap-4 max-w-lg w-full">
                <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center gap-2">
                    <div class="text-xs font-bold text-zinc-400">当前牌组</div>
                    <div class="text-3xl font-black text-zinc-800">${this.state.playerDeck.length}</div>
                    <div class="text-[10px] text-zinc-400">张卡牌</div>
                </div>
                <div class="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center gap-2">
                    <div class="text-xs font-bold text-zinc-400">下个对手</div>
                    <div class="text-3xl font-black text-rose-500">Lv.${this.state.level}</div>
                    <div class="text-[10px] text-zinc-400">野生怪兽</div>
                </div>
            </div>

            <button onclick="window.App.pages.cardGame.enterBattle()" class="atom-btn px-16 py-5 text-xl bg-red-600 text-white border-red-700 shadow-xl shadow-red-200 mt-8 animate-bounce">
                遭遇战斗！
            </button>
        </div>`;
    },

    // --- BATTLE RENDERER (PORTRAIT) ---
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
        const enemy = this.state.enemyData || { name: '???', icon: 'skull', color: 'text-zinc-500' };
        
        // Portrait Action Button (Floating above Discard)
        let actionBtnHTML = '';
        if (selCount > 0) {
             const btnText = selCount >= 2 ? "重组" : "弃牌";
             const btnColor = selCount >= 2 ? "bg-sky-500 border-sky-600" : "bg-orange-500 border-orange-600";
             const btnIcon = selCount >= 2 ? "refresh-cw" : "trash-2";
             // Positioned absolute bottom-24 right-4 (above the discard pile button)
             actionBtnHTML = `
                <button onclick="window.App.pages.cardGame.handleDiscardAction()" class="absolute bottom-28 right-5 z-[60] w-14 h-14 rounded-full ${btnColor} text-white border-b-4 shadow-lg flex flex-col items-center justify-center active:translate-y-1 active:border-b-0 transition-all animate-bounce">
                    <i data-lucide="${btnIcon}" class="w-5 h-5"></i>
                    <span class="text-[10px] font-bold mt-0.5">${btnText}</span>
                </button>
             `;
        }

        // Modals
        let modalHtml = '';
        if (this.state.discardConfirmOpen) modalHtml = this.renderDiscardModal();
        else if (this.state.trainingPending) modalHtml = this.renderTrainModal();
        else if (this.state.pileViewMode) modalHtml = this.renderPileModal();
        
        // Scoring Overlay
        let scoringOverlay = '';
        if (this.state.mode === 'scoring' && this.state.scoringState && this.state.scoringState.finished) {
            scoringOverlay = `
            <div class="absolute inset-x-0 bottom-40 z-[60] flex justify-center pointer-events-none">
                <button onclick="window.App.pages.cardGame.confirmRoundEnd()" class="pointer-events-auto bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xl font-black py-3 px-12 rounded-full shadow-[0_10px_20px_rgba(245,158,11,0.5)] border-4 border-white hover:scale-105 active:scale-95 transition-all animate-bounce flex items-center gap-2">
                    <span>🏆 下一轮</span>
                </button>
            </div>`;
        }

        const isScoring = this.state.mode === 'scoring';
        const activeField = isScoring ? this.state.scoringState.activeField : -1;
        
        // Player Hand Logic for Fan
        const hand = this.state.hands[0];
        const centerIdx = (hand.length - 1) / 2;
        
        const handVisuals = hand.map((card, i) => {
            const isSelected = this.state.selectedCardIndices.includes(i);
            const offset = i - centerIdx;
            
            // CORRECTED Fan Math
            // 1. Rotate: Negative offset (left cards) should rotate NEGATIVE (CCW). 
            let rotate = offset * 6; 
            
            // 2. TranslateY: Abs offset. Push sides DOWN (positive Y).
            //    Using an exponential or stronger curve looks better.
            let translateY = Math.abs(offset) * 8 + (Math.abs(offset) > 1 ? 5 : 0); 
            
            // 3. TranslateX: Negative offset (left cards) should move NEGATIVE (Left).
            //    Positive offset (right cards) should move POSITIVE (Right).
            let translateX = offset * 30; 
            
            let scale = 0.6; // Slightly larger default for better readability
            let zIndex = i; // Natural stacking (Left on bottom, Right on top)
            
            if (isSelected) {
                rotate = 0; // Reset rotation
                translateY = -90; // Pop UP drastically above the hand
                scale = 0.9; // Big size
                zIndex = 100; // Top layer
                translateX = translateX; // Keep X position roughly the same to avoid jumping horizontally
            } 
            
            // Allow hover to peek if not mobile touch
            const hoverClass = isSelected ? '' : 'hover:z-50 hover:scale-75 hover:-translate-y-12 hover:rotate-0 transition-all duration-200 ease-out';
            
            // Origin bottom is crucial for the fan effect
            const style = `transform: translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale}); z-index: ${zIndex};`;
            
            return `<div class="absolute bottom-0 origin-bottom transition-all duration-300 ease-out will-change-transform ${hoverClass}" style="${style}">
                ${this.renderPlayerCard(card, i, true)}
            </div>`;
        }).join('');

        return `
            <div class="flex flex-col h-full relative overflow-hidden bg-zinc-50 text-zinc-800">
                ${modalHtml}
                ${scoringOverlay}
                
                <!-- TOP HUD: Info Bar -->
                <div class="h-14 shrink-0 bg-white border-b border-zinc-200 shadow-sm flex justify-between items-center px-4 relative z-20">
                    <!-- Player Info -->
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
                            <span class="text-[8px] text-zinc-400 font-bold">YOU</span>
                        </div>
                    </div>

                    <!-- Center Log / Turn -->
                    <div class="flex flex-col items-center">
                        <div class="text-[8px] font-bold text-zinc-400 tracking-widest uppercase mb-0.5">VS</div>
                        ${this.state.log.length > 0 ? `<div class="text-[10px] text-zinc-500 truncate max-w-[100px] bg-zinc-100 px-2 py-0.5 rounded animate-pulse border border-zinc-200">${this.state.log[this.state.log.length-1].text}</div>` : ''}
                    </div>

                    <!-- Enemy Info -->
                    <div class="flex items-center gap-2 flex-row-reverse text-right">
                         <div class="w-8 h-8 ${enemy.bg} rounded-full flex items-center justify-center border border-zinc-200 relative">
                             <i data-lucide="${enemy.icon}" class="w-4 h-4 ${enemy.color}"></i>
                             <div class="absolute -bottom-1 -left-1 flex gap-0.5">
                                <div class="w-1.5 h-1.5 rounded-full ${this.state.ippon[1]>0?'bg-rose-500':'bg-zinc-300'} border border-white"></div>
                                <div class="w-1.5 h-1.5 rounded-full ${this.state.ippon[1]>1?'bg-rose-500':'bg-zinc-300'} border border-white"></div>
                             </div>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xl font-black text-rose-500 leading-none">${totalA}</span>
                            <span class="text-[8px] text-zinc-400 font-bold">ENEMY</span>
                        </div>
                    </div>
                </div>

                <!-- Enemy Hand (Mini) & Piles -->
                <div class="h-8 bg-zinc-100 flex justify-between items-center px-4 relative z-10 border-b border-zinc-200">
                     <div class="flex items-center gap-1">
                        ${this.state.hands[1].map(c => `<div class="w-3 h-4 bg-zinc-300 rounded-[2px] border border-zinc-200"></div>`).join('')}
                     </div>
                     <div class="flex gap-2 text-[10px] font-bold text-zinc-500">
                        <span onclick="window.App.pages.cardGame.viewPile('discard', 1)" class="flex items-center gap-1 bg-white border border-zinc-300 px-2 py-0.5 rounded shadow-sm cursor-pointer hover:bg-rose-50 active:scale-95 transition-all"><i data-lucide="trash" class="w-3 h-3 text-rose-400"></i> ${this.state.discardPiles[1].length}</span>
                        <span class="flex items-center gap-1 bg-white border border-zinc-300 px-2 py-0.5 rounded shadow-sm text-zinc-400"><i data-lucide="layers" class="w-3 h-3"></i> ${this.state.decks[1].length}</span>
                     </div>
                </div>

                <!-- BATTLEFIELD (Portrait Optimized) -->
                <!-- pb-36 ensures bottom field cards aren't covered by hand -->
                <div class="flex-1 grid grid-cols-3 gap-2 p-2 pb-36 overflow-hidden relative">
                    ${[0, 1, 2].map(idx => {
                        const isDimmed = isScoring && activeField !== -1 && activeField !== idx;
                        const dimClass = isDimmed ? 'opacity-20 grayscale' : '';
                        return `<div class="${dimClass} h-full relative z-0 transition-all duration-300 min-w-0">${this.renderFieldStackPortrait(idx, scores[idx])}</div>`;
                    }).join('')}
                </div>

                <!-- FLOATING CONTROLS LAYER (Z-50) -->
                <!-- Action Button -->
                ${actionBtnHTML}

                <!-- Draw Pile Button (Bottom Left) -->
                <button onclick="window.App.pages.cardGame.viewPile('draw', 0)" class="absolute bottom-4 left-4 z-50 w-12 h-12 bg-white rounded-full border-2 border-zinc-200 shadow-lg flex flex-col items-center justify-center text-zinc-600 hover:scale-110 active:scale-95 transition-all">
                    <i data-lucide="layers" class="w-4 h-4 mb-0.5"></i>
                    <span class="text-[9px] font-black">${this.state.decks[0].length}</span>
                </button>

                <!-- Discard Pile Button (Bottom Right) -->
                <button onclick="window.App.pages.cardGame.viewPile('discard', 0)" class="absolute bottom-4 right-4 z-50 w-12 h-12 bg-white rounded-full border-2 border-zinc-200 shadow-lg flex flex-col items-center justify-center text-zinc-600 hover:scale-110 active:scale-95 transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4 mb-0.5 text-rose-500"></i>
                    <span class="text-[9px] font-black">${this.state.discardPiles[0].length}</span>
                </button>

                <!-- FAN HAND CONTAINER (Z-40) -->
                <!-- Use overflow-visible to allow cards to pop up without clipping -->
                <!-- We use a fixed width container centered to act as the fan anchor -->
                <div class="absolute bottom-2 left-0 right-0 h-0 z-40 flex justify-center items-end pointer-events-none overflow-visible">
                    <div class="relative w-1 h-1 flex justify-center items-end pointer-events-auto overflow-visible">
                         ${hand.length === 0 ? '<div class="absolute bottom-24 w-32 text-center text-zinc-300 text-xs font-bold animate-pulse -ml-16">回合跳过</div>' : handVisuals}
                    </div>
                </div>

            </div>
        `;
    },

    // --- BATTLE RENDERER (LANDSCAPE) ---
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
        const enemy = this.state.enemyData || { name: '???', icon: 'skull', color: 'text-zinc-500' };

        // Action Button
        let actionBtnText = "弃 牌";
        let actionBtnColor = "bg-zinc-200 text-zinc-500 cursor-not-allowed"; 
        let actionIcon = "trash-2";
        let actionClick = "";

        if (selCount > 0) {
             actionBtnColor = "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200 cursor-pointer shadow-sm active:scale-95";
             actionClick = "window.App.pages.cardGame.handleDiscardAction()";
             if (selCount >= 2) {
                 actionBtnText = "重 组";
                 actionBtnColor = "bg-sky-100 text-sky-600 border-sky-200 hover:bg-sky-200 cursor-pointer shadow-sm active:scale-95";
                 actionIcon = "refresh-cw";
             }
        }
        
        // Modals & Overlays
        let modalHtml = '';
        if (this.state.discardConfirmOpen) modalHtml = this.renderDiscardModal();
        else if (this.state.trainingPending) modalHtml = this.renderTrainModal();
        else if (this.state.pileViewMode) modalHtml = this.renderPileModal();

        // Scoring Overlay
        let scoringOverlay = '';
        if (this.state.mode === 'scoring' && this.state.scoringState && this.state.scoringState.finished) {
            scoringOverlay = `
            <div class="absolute inset-x-0 bottom-32 z-[60] flex justify-center pointer-events-none">
                <button onclick="window.App.pages.cardGame.confirmRoundEnd()" class="pointer-events-auto bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xl font-black py-3 px-12 rounded-full shadow-[0_10px_20px_rgba(245,158,11,0.5)] border-4 border-white hover:scale-105 active:scale-95 transition-all animate-bounce flex items-center gap-2">
                    <span>🏆 确认战果</span>
                </button>
            </div>`;
        }
        
        const isScoring = this.state.mode === 'scoring';
        const activeField = isScoring ? this.state.scoringState.activeField : -1;

        return `
            <div class="flex flex-col md:flex-row h-full gap-4 relative">
                ${modalHtml}
                ${scoringOverlay}
                
                <!-- Sidebar (Stats & Log) -->
                <div class="hidden md:flex w-64 flex-col gap-2 shrink-0">
                     <div class="bg-white p-4 rounded-xl shadow-lg border border-zinc-200 relative overflow-hidden">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white">
                                <i data-lucide="${this.state.playerAvatar}" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <div class="text-xs text-zinc-400 font-bold uppercase">Player</div>
                                <div class="font-black text-zinc-800">新人训练家</div>
                            </div>
                        </div>
                        <div class="flex justify-between items-end border-t border-zinc-100 pt-2">
                            <div class="flex flex-col"><span class="text-xs text-zinc-400 font-bold">Total Score</span><span id="score-player" class="text-3xl font-black text-green-500 transition-all duration-300 transform ${isScoring?'scale-110':''}">${totalP}</span></div>
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
                                <div class="text-xs text-zinc-400 font-bold uppercase">Enemy</div>
                                <div class="font-black ${enemy.color || 'text-rose-600'}">Lv.${this.state.level} ${enemy.name}</div>
                            </div>
                        </div>
                        <div class="flex justify-between items-end border-t border-zinc-100 pt-2">
                            <div class="flex flex-col"><span class="text-xs text-zinc-400 font-bold">Total Score</span><span id="score-ai" class="text-3xl font-black text-rose-500 transition-all duration-300 transform ${isScoring?'scale-110':''}">${totalA}</span></div>
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

                <!-- Main Board -->
                <div class="flex-1 flex flex-col gap-2 min-w-0 relative">
                    <!-- Enemy Area -->
                    <div class="flex justify-between items-end px-4 h-20">
                         <div class="flex -space-x-3">
                            ${this.state.hands[1].map(c => `<div id="ai-card-${c.id}" class="w-10 h-14 bg-zinc-700 border border-zinc-600 rounded shadow-sm"></div>`).join('')}
                         </div>
                         <div class="flex gap-2 text-[10px] font-bold text-zinc-400">
                             <div class="flex flex-col items-center"><i data-lucide="layers" class="w-4 h-4 mb-1"></i>${this.state.decks[1].length}</div>
                             <div class="flex flex-col items-center cursor-pointer hover:text-red-500 transition-colors" onclick="window.App.pages.cardGame.viewPile('discard', 1)" title="查看敌方弃牌"><i data-lucide="trash" class="w-4 h-4 mb-1"></i>${this.state.discardPiles[1].length}</div>
                         </div>
                    </div>

                    <!-- Fields -->
                    <div class="flex-1 grid grid-cols-3 gap-2 md:gap-4 p-2 bg-zinc-100/50 rounded-3xl border border-zinc-200 shadow-inner relative z-0">
                        ${[0, 1, 2].map(idx => {
                            const isDimmed = isScoring && activeField !== -1 && activeField !== idx;
                            const dimClass = isDimmed ? 'opacity-20 grayscale transition-all duration-500' : 'transition-all duration-500';
                            return `<div class="${dimClass} h-full relative z-10">${this.renderFieldStack(idx, scores[idx])}</div>`;
                        }).join('')}
                    </div>

                    <!-- Player Area -->
                    <div class="h-48 relative flex items-end px-4 gap-4 ${isScoring ? 'opacity-50 pointer-events-none grayscale' : ''}">
                        <div class="flex flex-col gap-2 mb-4 shrink-0 z-10">
                            <button onclick="window.App.pages.cardGame.viewPile('draw', 0)" class="w-12 h-16 bg-zinc-800 rounded border-2 border-zinc-600 flex flex-col items-center justify-center text-zinc-400 hover:scale-105 transition-transform shadow-lg group">
                                <i data-lucide="layers" class="w-5 h-5 mb-1 text-zinc-300 group-hover:text-white"></i>
                                <span class="text-[10px] font-bold">${this.state.decks[0].length}</span>
                            </button>
                            <button onclick="window.App.pages.cardGame.viewPile('discard', 0)" class="w-12 h-16 bg-zinc-200 rounded border-2 border-zinc-300 flex flex-col items-center justify-center text-zinc-500 hover:scale-105 transition-transform shadow hover:bg-zinc-300 group">
                                <i data-lucide="trash-2" class="w-5 h-5 mb-1 group-hover:text-red-500"></i>
                                <span class="text-[10px] font-bold">${this.state.discardPiles[0].length}</span>
                            </button>
                        </div>

                        <div class="flex-1 flex items-end justify-center gap-2 md:gap-4 -ml-6 mr-20"> 
                            ${this.state.hands[0].map((card, i) => this.renderPlayerCard(card, i)).join('')}
                        </div>

                        <div class="absolute right-4 bottom-6 z-20">
                            <button onclick="${actionClick}" class="w-24 h-24 rounded-full border-4 font-bold transition-all flex flex-col items-center justify-center gap-1 shadow-lg ${actionBtnColor}">
                                <i data-lucide="${actionIcon}" class="w-6 h-6"></i>
                                <span class="text-xs">${actionBtnText}</span>
                            </button>
                        </div>
                    </div>
                </div>
                ${targetMode ? `<div class="absolute inset-0 bg-black/40 z-50 flex items-center justify-center pointer-events-none"><div class="bg-black text-white px-6 py-3 rounded-full animate-bounce font-bold pointer-events-auto">点击上方堆叠选择目标</div></div>` : ''}
            </div>`;
    },
    
    // --- MODALS ---
    renderPileModal: function() {
        const mode = this.state.pileViewMode;
        if (!mode) return '';
        
        const isEnemy = mode.owner === 1;
        const pileName = mode.type === 'draw' ? '抽牌堆' : '弃牌堆';
        const ownerName = isEnemy ? '敌方' : '我方';
        
        let cards = [];
        if (mode.type === 'draw') {
            cards = [...this.state.decks[mode.owner]].sort((a,b) => (a.color - b.color) || (a.number - b.number));
        } else {
            cards = [...this.state.discardPiles[mode.owner]];
        }

        // Detect if portrait mode for grid density
        const isPortrait = this.isPortrait();
        // In portrait: use grid-cols-4 and smaller card scale to fit more
        const gridClass = isPortrait 
            ? "grid grid-cols-4 gap-1 place-items-center" 
            : "flex flex-wrap justify-center gap-4";
            
        // Scale down cards in modal to fit more
        // If portrait, wrapper needs to handle the scaled dimensions of the card (w-32=128px)
        // 128 * 0.6 = 76.8px width per card
        // 192 * 0.6 = 115.2px height per card
        const cardWrapperStyle = isPortrait ? 'width: 77px; height: 116px; overflow: hidden;' : '';
        const innerTransform = isPortrait ? 'transform: scale(0.6); transform-origin: top left;' : 'transform: scale(0.9);';

        return `
        <div class="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border-4 ${isEnemy ? 'border-rose-400' : 'border-zinc-200'}">
                <div class="p-3 border-b border-zinc-200 flex justify-between items-center bg-zinc-50 shrink-0">
                    <h3 class="text-base md:text-lg font-black ${isEnemy ? 'text-rose-500' : 'text-zinc-800'}">${ownerName}${pileName} (${cards.length})</h3>
                    <button onclick="window.App.pages.cardGame.closeModal()" class="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 rounded-full"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <div class="flex-1 overflow-y-auto p-4 bg-zinc-100/50">
                    <div class="${gridClass}">
                        ${cards.length === 0 ? '<div class="col-span-4 text-zinc-400 font-bold py-10 w-full text-center">空空如也</div>' : cards.map(c => `
                            <div style="${cardWrapperStyle}">
                                <div style="${innerTransform}">
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
                    <h3 class="text-lg font-black mb-2">确认战术弃牌？</h3>
                    <p class="text-sm text-zinc-500 mb-4">弃掉 ${this.state.selectedCardIndices.length} 张牌，抽取 1 张新牌。</p>
                    <div class="flex gap-2">
                        <button onclick="window.App.pages.cardGame.cancelDiscard()" class="flex-1 py-3 bg-zinc-100 rounded-xl font-bold hover:bg-zinc-200">取消</button>
                        <button onclick="window.App.pages.cardGame.confirmDiscard()" class="flex-1 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600">确认</button>
                    </div>
                </div>
            </div></div>`;
    },
    
    renderTrainModal: function() {
        return `<div class="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border-4 border-zinc-200 animate-in zoom-in duration-200">
                <div class="text-center">
                    <h3 class="text-lg font-black mb-4">特训调整</h3>
                    <p class="text-sm text-zinc-500 mb-6">调整相邻手牌的点数</p>
                    <div class="flex gap-4">
                        <button onclick="window.App.pages.cardGame.handleTrainChoice(-1)" class="flex-1 py-4 bg-zinc-100 text-xl font-bold rounded-xl hover:bg-zinc-200 border-2 border-zinc-300">-1</button>
                        <button onclick="window.App.pages.cardGame.handleTrainChoice(1)" class="flex-1 py-4 bg-amber-500 text-white text-xl font-bold rounded-xl hover:bg-amber-600 border-2 border-amber-600">+1</button>
                    </div>
                </div>
            </div></div>`;
    },

    renderReward: function() {
        const isPortrait = this.isPortrait();
        
        // Compact Portrait Configs
        const containerClass = isPortrait 
            ? "flex flex-col items-center justify-start h-full gap-2 overflow-y-auto pb-4 pt-2"
            : "flex flex-col items-center justify-center h-full gap-4 overflow-y-auto pb-4";
            
        const titleSize = isPortrait ? "text-2xl" : "text-3xl";
        const groupWrapperClass = isPortrait ? "flex flex-col w-full max-w-lg gap-2 flex-1 px-4" : "flex flex-col w-full max-w-4xl gap-4 flex-1";
        
        // Portrait: Horizontal row for pack, small cards. Landscape: Standard.
        const groupClass = isPortrait
            ? "bg-white rounded-xl border-2 border-zinc-200 p-2 flex flex-row items-center justify-between gap-2 shadow-sm shrink-0 w-full"
            : "bg-white rounded-2xl border-2 border-zinc-200 p-4 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:border-amber-400 hover:shadow-lg transition-all group/pack relative overflow-hidden shrink-0";
            
        // Portrait: very small cards, overlapping negative margin
        const cardContainerClass = isPortrait
            ? "flex-1 flex justify-center gap-0 overflow-x-visible"
            : "flex-1 flex justify-center md:justify-start gap-2 overflow-x-auto p-2";
            
        const cardScaleStyle = isPortrait ? "transform: scale(0.5); margin-left: -1rem; margin-right: -1rem;" : "transform: scale(0.75); transform-origin: center;";
        
        const btnClass = isPortrait
            ? "bg-zinc-800 text-white px-3 py-2 text-xs rounded-full font-bold shadow-lg whitespace-nowrap active:scale-95"
            : "bg-zinc-800 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-500 transition-colors shadow-lg active:scale-95";

        const iconClass = isPortrait
            ? "w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-300 text-[10px]"
            : "w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center border-2 border-zinc-300 mb-2";

        return `
        <div class="${containerClass}">
            <h2 class="${titleSize} font-black text-amber-500 shrink-0">战斗胜利！</h2>
            <p class="text-zinc-500 font-bold shrink-0 text-xs md:text-base">请选择一组卡牌包加入牌库：</p>
            
            <div class="${groupWrapperClass}">
                ${this.state.rewardGroups.map((group, idx) => `
                    <div class="${groupClass}">
                         <!-- Left: Pack Info -->
                         <div class="flex flex-col items-center justify-center shrink-0 ${isPortrait?'w-10':'w-24'}">
                            <div class="${iconClass}">
                                <span class="font-black text-zinc-400">${idx+1}</span>
                            </div>
                            ${!isPortrait ? '<div class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">PACK</div>' : ''}
                         </div>
                         
                         <!-- Middle: Cards -->
                         <div class="${cardContainerClass}">
                            ${group.map((card) => `<div style="${cardScaleStyle}">${this.renderCardStatic(card)}</div>`).join('')}
                         </div>

                         <!-- Right: Select Button -->
                         <div class="shrink-0">
                             <button onclick="window.App.pages.cardGame.selectRewardGroup(${idx})" class="${btnClass}">
                                 选择
                             </button>
                         </div>
                         
                         <!-- Hover Effect (Landscape only mostly) -->
                         <div class="absolute inset-0 bg-amber-50 opacity-0 group-hover/pack:opacity-20 pointer-events-none transition-opacity"></div>
                    </div>
                `).join('')}
            </div>
            
            <button onclick="window.App.pages.cardGame.skipReward()" class="mt-2 text-zinc-400 hover:text-zinc-600 text-sm font-bold underline shrink-0 pb-4">跳过奖励</button>
        </div>`;
    },

    renderEvent: function() {
        const evt = this.state.eventData;
        let content = '';
        if (evt.type === 'shop') {
             const removalMode = evt.removalMode;
             let deckView = '';
             if (removalMode) {
                 deckView = `<div class="w-full mt-4"><p class="text-center text-red-500 font-bold mb-4 animate-pulse">选择一张卡牌移除 (花费 100 G)</p><div class="flex flex-wrap justify-center gap-2 max-h-[300px] overflow-y-auto p-4 bg-zinc-100 rounded-xl">${this.state.playerDeck.map((c, i) => `<div onclick="window.App.pages.cardGame.buyRemoval(${i})" class="scale-75 cursor-pointer hover:opacity-80 transition-opacity -ml-4 first:ml-0 relative group"><div class="absolute inset-0 bg-red-500/20 z-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 font-bold text-white">移除</div>${this.renderCardStatic(c)}</div>`).join('')}</div></div>`;
             }
             content = `
                <div class="w-16 h-16 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mb-4"><i data-lucide="store" class="w-8 h-8"></i></div>
                <h3 class="text-2xl font-black text-zinc-800 mb-2">流浪商人</h3>
                <div class="flex items-center gap-2 mb-6 bg-yellow-50 px-4 py-1 rounded-full border border-yellow-200 text-yellow-700 font-bold"><i data-lucide="coins" class="w-4 h-4"></i> ${this.state.gold} G</div>
                <div class="grid grid-cols-2 gap-4 w-full max-w-lg mb-4">
                    <button onclick="window.App.pages.cardGame.buyCardPack()" class="flex flex-col items-center p-6 bg-white border-2 border-zinc-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors"><i data-lucide="package-plus" class="w-8 h-8 text-purple-500 mb-2"></i><span class="font-bold text-zinc-700">随机卡包 (3张)</span><span class="text-xs font-bold text-yellow-600 mt-1">50 G</span></button>
                    <button onclick="window.App.pages.cardGame.toggleRemovalMode()" class="flex flex-col items-center p-6 bg-white border-2 border-zinc-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-colors ${removalMode ? 'ring-2 ring-red-500 border-red-500 bg-red-50' : ''}"><i data-lucide="trash-2" class="w-8 h-8 text-red-500 mb-2"></i><span class="font-bold text-zinc-700">移除卡牌</span><span class="text-xs font-bold text-yellow-600 mt-1">100 G</span></button>
                </div>
                ${deckView}
                <button onclick="window.App.pages.cardGame.resolveEvent()" class="mt-6 text-zinc-400 hover:text-zinc-600 font-bold">离开商店</button>`;
        } else if (evt.type === 'blacksmith') {
             content = `<div class="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4"><i data-lucide="hammer" class="w-8 h-8"></i></div><h3 class="text-2xl font-black text-zinc-800 mb-2">装备强化</h3><p class="text-zinc-500 mb-6 text-center max-w-md">选择一张牌进行强化 (点数+1)</p><div class="flex flex-wrap justify-center gap-2 max-h-[300px] overflow-y-auto p-4 bg-zinc-100 rounded-xl w-full max-w-3xl">${this.state.playerDeck.map((c, i) => `<div onclick="window.App.pages.cardGame.state.eventData.selectedIdx = ${i}; window.App.pages.cardGame.resolveEvent()" class="scale-75 cursor-pointer hover:opacity-80 transition-opacity -ml-4 first:ml-0">${this.renderCardStatic(c)}</div>`).join('')}</div><button onclick="window.App.pages.cardGame.state.eventData.selectedIdx = null; window.App.pages.cardGame.resolveEvent()" class="mt-6 text-zinc-400 hover:text-zinc-600 font-bold">离开</button>`;
        } else {
             content = `<div class="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"><i data-lucide="tent" class="w-8 h-8"></i></div><h3 class="text-2xl font-black text-zinc-800 mb-2">宁静的营地</h3><p class="text-zinc-500 mb-6 text-center max-w-md">整理装备，准备下一场战斗。</p><button onclick="window.App.pages.cardGame.resolveEvent()" class="atom-btn px-8 py-3 bg-zinc-800 text-white">继续旅程</button>`;
        }
        return `<div class="flex flex-col items-center justify-center h-full fade-in">${content}</div>`;
    },

    // --- SUB-RENDERERS ---
    
    renderCardStatic: function(card, showShiny = false) {
        const bg = this.CONST.COLORS[card.color];
        const iconName = this.CONST.COLOR_ICONS[card.color];
        const shinyClass = showShiny ? 'card-shine' : '';
        const skillDetails = card.skills.map(s => `<div class="flex items-start gap-2 mb-1"><span class="bg-white/20 px-1 rounded text-[10px] shrink-0 mt-0.5">${this.CONST.SKILLS[s].name}</span><span class="text-[10px] opacity-80 leading-tight text-left">${this.CONST.SKILLS[s].desc}</span></div>`).join('');
        const tooltip = (card.skills.length > 0) ? `<div class="absolute bottom-full mb-2 w-48 bg-zinc-900 text-white p-3 rounded-xl shadow-2xl border border-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-[200] flex flex-col gap-2 scale-95 group-hover:scale-100 origin-bottom left-1/2 -translate-x-1/2"><div class="text-xs font-bold text-zinc-400 border-b border-zinc-700 pb-1 flex justify-between"><span>${this.CONST.COLOR_NAMES[card.color]} · ${card.number}</span></div><div>${skillDetails}</div></div>` : '';
        return `<div class="w-32 h-48 rounded-xl ${bg} border-4 border-white shadow-xl relative flex flex-col items-center p-3 text-white select-none ${shinyClass} group relative overflow-hidden">${tooltip}<div class="absolute top-2 right-2 opacity-50"><i data-lucide="${iconName}" class="w-6 h-6"></i></div><div class="mt-4 text-6xl font-black drop-shadow-md">${this.getCardValue(card)}</div><div class="mt-auto w-full flex flex-col gap-1">${card.skills.map(s => `<div class="bg-black/20 rounded px-1 text-[10px] font-bold text-center py-0.5">${this.CONST.SKILLS[s].name}</div>`).join('')}${card.skills.length === 0 ? '<div class="text-[10px] text-white/50 text-center italic">无技能</div>' : ''}</div></div>`;
    },
    
    // Updated: Accept `isPortraitFan` prop to remove container styling (the container div handles transforms)
    renderPlayerCard: function(card, idx, isPortraitFan = false) {
        const isSelected = this.state.selectedCardIndices.includes(idx);
        const bg = this.CONST.COLORS[card.color];
        const iconName = this.CONST.COLOR_ICONS[card.color];
        
        let activeClass = '';
        if (!isPortraitFan) {
             activeClass = isSelected ? 'border-amber-300 -translate-y-10 shadow-2xl ring-4 ring-amber-200/50 z-20' : 'border-white hover:-translate-y-6 hover:shadow-xl z-10';
        } else {
             activeClass = isSelected ? 'border-amber-300 shadow-2xl ring-4 ring-amber-200/50' : 'border-white shadow-lg';
        }
        
        const animClass = (Date.now() - (card.drawnAt || 0) < 500) ? 'animate-draw' : '';
        
        // Replicate static card inner structure
        const skillDetails = card.skills.map(s => `<div class="flex items-start gap-2 mb-1"><span class="bg-white/20 px-1 rounded text-[10px] shrink-0 mt-0.5">${this.CONST.SKILLS[s].name}</span><span class="text-[10px] opacity-80 leading-tight text-left">${this.CONST.SKILLS[s].desc}</span></div>`).join('');
        const tooltip = (card.skills.length > 0) ? `<div class="absolute bottom-full mb-2 w-48 bg-zinc-900 text-white p-3 rounded-xl shadow-2xl border border-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 flex flex-col gap-2 scale-95 group-hover:scale-100 origin-bottom"><div class="text-xs font-bold text-zinc-400 border-b border-zinc-700 pb-1 flex justify-between"><span>${this.CONST.COLOR_NAMES[card.color]}</span><span>点数 ${card.number}</span></div><div>${skillDetails}</div></div>` : '';

        // Number Positioning Logic
        // If it's a portrait fan and NOT selected (selected pops up so center is fine, but consistency is better)
        // Actually, let's just make it top-left for portrait fan mode always for visibility
        let numberHtml = '';
        if (isPortraitFan) {
             numberHtml = `<div class="absolute top-1 left-2 text-4xl font-black drop-shadow-md z-10 leading-none">${this.getCardValue(card)}</div>`;
        } else {
             numberHtml = `<div class="mt-4 text-6xl font-black drop-shadow-md">${this.getCardValue(card)}</div>`;
        }

        // Add overflow-hidden to card main div to prevent numbers sticking out when scaled down
        return `
        <div id="card-${card.id}" class="group relative flex flex-col items-center ${animClass}">
            <div onclick="window.App.pages.cardGame.selectCard(${idx})" class="w-32 h-48 shrink-0 rounded-xl ${bg} border-4 ${activeClass} relative flex flex-col items-center p-3 text-white cursor-pointer transition-all duration-200 select-none overflow-hidden">
                <div class="absolute top-2 right-2 opacity-50"><i data-lucide="${iconName}" class="w-6 h-6"></i></div>
                ${numberHtml}
                <div class="mt-auto w-full flex flex-col gap-1">
                    ${card.skills.map(s => `<div class="bg-black/20 rounded px-1 text-[10px] font-bold text-center py-0.5">${this.CONST.SKILLS[s].name}</div>`).join('')}
                    ${card.skills.length === 0 ? '<div class="text-[10px] text-white/50 text-center italic">无技能</div>' : ''}
                </div>
                ${isSelected ? '<div class="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white"><i data-lucide="check" class="w-3 h-3"></i></div>' : ''}
            </div>
            ${tooltip}
        </div>`;
    },
    
    renderFieldStack: function(idx, score) {
        const stack = this.state.fields[idx];
        const stackColor = this.getStackColor(idx);
        const baseBg = stackColor === 0 ? 'bg-red-50' : stackColor === 1 ? 'bg-amber-50' : 'bg-sky-50';
        const borderColor = this.CONST.COLOR_BORDERS[stackColor];
        
        // Stack visual calculation
        const containerH = 460; const headerOffset = 50; const cardH = 128; const baseGap = 10; 
        const availableContentH = containerH - headerOffset - 10; 
        const standardStep = cardH + baseGap;
        const totalH_Standard = (stack.length - 1) * standardStep + cardH;
        let step = standardStep;
        if (stack.length > 1 && totalH_Standard > availableContentH) {
             const maxTop = availableContentH - cardH;
             step = maxTop / (stack.length - 1);
        }
        let cardPositions = [];
        for(let i=0; i<stack.length; i++) cardPositions.push(i * step);

        const stackVisuals = stack.map((c, i) => this.renderSmallCard(c, i, cardPositions[i])).join('');
        const selIndices = this.state.selectedCardIndices;
        let overlayContent = '';
        let cursorClass = 'cursor-pointer hover:bg-black/5';
        const topCard = stack.length > 0 ? stack[stack.length - 1] : null;
        const isLocked = topCard && this.hasSkill(topCard, 'lock');
        const lockIcon = isLocked ? `<div class="absolute -top-3 -right-3 z-30 bg-zinc-800 text-white w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-pulse" title="封印"><i data-lucide="lock" class="w-4 h-4"></i></div>` : '';

        if (selIndices.length === 1 && this.state.turn === 0 && !this.state.awaitingTarget) {
            if (this.canPlay(this.state.hands[0][selIndices[0]], idx)) {
                 overlayContent = `<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"><div class="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce ring-4 ring-green-200/50">放置</div></div>`;
                 cursorClass = 'cursor-pointer bg-green-500/5 hover:bg-green-500/10 border-green-400';
            }
        } else if (this.state.awaitingTarget) {
            overlayContent = `<div class="bg-rose-500 text-white text-xs px-2 py-1 rounded shadow animate-pulse absolute inset-0 flex items-center justify-center pointer-events-none z-30 h-8 m-auto w-max">选择目标</div>`;
            cursorClass = 'cursor-pointer ring-4 ring-rose-500/50 bg-rose-500/10 z-[60]';
        }

        return `
        <div onclick="window.App.pages.cardGame.handleStackClick(${idx})" class="relative h-[460px] border-2 ${borderColor} ${baseBg} rounded-2xl flex flex-col group transition-colors ${cursorClass} overflow-visible z-0">
            ${lockIcon} ${overlayContent}
            <div class="absolute top-0 left-0 right-0 p-2 flex justify-between items-start pointer-events-none z-20 bg-gradient-to-b from-white/90 to-transparent h-12 rounded-t-xl overflow-hidden">
                 <div class="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold ${this.CONST.COLOR_TEXT[stackColor]} shadow-sm border border-black/5">${this.CONST.COLOR_NAMES[stackColor]}</div>
                 <div class="flex flex-col items-end"><span class="text-xs font-black ${score.ai > score.player ? 'text-red-500' : 'text-zinc-400'}">${score.ai}</span><div class="w-full h-[1px] bg-zinc-300 my-0.5"></div><span class="text-sm font-black ${score.player > score.ai ? 'text-green-500' : 'text-zinc-600'}">${score.player}</span></div>
            </div>
            <div id="stack-container-${idx}" class="relative w-full h-full mt-10">
                ${stack.length === 0 ? '<div class="absolute inset-0 flex items-center justify-center text-zinc-300 text-sm font-bold tracking-widest pointer-events-none">空</div>' : ''}
                ${stackVisuals}
            </div>
        </div>`;
    },

    // --- PORTRAIT STACK RENDERER (Flexible Height) ---
    renderFieldStackPortrait: function(idx, score) {
        const stack = this.state.fields[idx];
        const stackColor = this.getStackColor(idx);
        // Changed to LIGHT colors (zinc-50 base + tinted)
        const baseBg = stackColor === 0 ? 'bg-red-50' : stackColor === 1 ? 'bg-amber-50' : 'bg-sky-50';
        const borderColor = stackColor === 0 ? 'border-red-200' : stackColor === 1 ? 'border-amber-200' : 'border-sky-200';
        const textColor = stackColor === 0 ? 'text-red-600' : stackColor === 1 ? 'text-amber-600' : 'text-sky-600';
        
        // Stack visual calculation for FLEX height (Percentage based)
        // In portrait, cards are scaled down (0.7 in renderSmallCard + CSS scale).
        // We use simple % offset.
        
        let cardPositions = [];
        const maxCards = 8; // Visual limit roughly
        const step = 8; // % down per card
        for(let i=0; i<stack.length; i++) {
            // Cap visual stack to not overflow bottom too hard
            const offset = Math.min(i * step, 60); 
            cardPositions.push(offset);
        }

        const stackVisuals = stack.map((c, i) => {
            // Create a wrapper for positioning, using absolute position to ensure centering and correct layer
            // Removed width constraint, letting the inner card define width via scale
            return `<div style="top: ${cardPositions[i]}%; left: 0; right: 0; position: absolute; display: flex; justify-content: center; z-index: ${i};">
                        <div class="transform scale-75 origin-top">${this.renderSmallCard(c, i, undefined, true)}</div>
                    </div>`;
        }).join('');

        const selIndices = this.state.selectedCardIndices;
        let overlayContent = '';
        let cursorClass = '';
        const topCard = stack.length > 0 ? stack[stack.length - 1] : null;
        const isLocked = topCard && this.hasSkill(topCard, 'lock');
        const lockIcon = isLocked ? `<div class="absolute -top-2 -right-2 z-30 bg-zinc-800 text-white w-6 h-6 flex items-center justify-center rounded-full border border-white shadow-lg animate-pulse" title="封印"><i data-lucide="lock" class="w-3 h-3"></i></div>` : '';

        if (selIndices.length === 1 && this.state.turn === 0 && !this.state.awaitingTarget) {
            if (this.canPlay(this.state.hands[0][selIndices[0]], idx)) {
                 overlayContent = `<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"><div class="bg-green-500 text-white px-2 py-1 rounded text-[10px] font-bold shadow animate-pulse">放置</div></div>`;
                 cursorClass = 'ring-2 ring-green-500 bg-green-50/50';
            }
        } else if (this.state.awaitingTarget) {
            overlayContent = `<div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"><div class="bg-rose-500 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse">目标</div></div>`;
            cursorClass = 'ring-2 ring-rose-500 bg-rose-50/50';
        }

        return `
        <div onclick="window.App.pages.cardGame.handleStackClick(${idx})" class="relative h-full rounded-xl border-2 ${borderColor} ${baseBg} ${cursorClass} flex flex-col overflow-hidden transition-all active:scale-95 shadow-sm">
            ${lockIcon} ${overlayContent}
            <!-- Header -->
            <div class="h-10 border-b ${borderColor} bg-white/60 flex flex-col items-center justify-center shrink-0 z-20 backdrop-blur-sm">
                 <span class="text-[10px] font-black ${textColor}">${this.CONST.COLOR_NAMES[stackColor]}</span>
                 <div class="flex items-center gap-2 text-[10px] font-bold">
                     <span class="text-rose-500">${score.ai}</span>
                     <span class="text-zinc-400">/</span>
                     <span class="text-green-500">${score.player}</span>
                 </div>
            </div>
            
            <!-- Cards Container -->
            <div id="stack-container-${idx}" class="relative flex-1 w-full overflow-visible">
                ${stack.length === 0 ? '<div class="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs font-bold tracking-widest pointer-events-none">EMPTY</div>' : ''}
                ${stackVisuals}
            </div>
        </div>`;
    },
    
    renderSmallCard: function(card, index, topPos, isPortraitStack = false) {
        const bg = this.CONST.COLORS[card.color];
        const isMine = card.owner === 0;
        const borderClass = isMine ? 'border-green-500 ring-2 ring-green-200' : 'border-rose-500 ring-2 ring-rose-200';
        
        // Use simpler group name 'group' instead of 'group/card' to avoid Tailwind conflicts in nested contexts
        // Move icons to top-1 right-1 to be more visible even when stacked
        const skillIcons = card.skills.slice(0, 3).map(s => `<div class="w-5 h-5 bg-black/40 rounded-full text-[9px] flex items-center justify-center text-white font-bold shadow-sm backdrop-blur-sm ring-1 ring-white/20" title="${this.CONST.SKILLS[s].name}">${this.CONST.SKILLS[s].short}</div>`).join('');
        
        const skillDetails = card.skills.map(s => `<div class="flex items-start gap-2 mb-1"><span class="bg-white/20 px-1 rounded text-[10px] shrink-0 mt-0.5">${this.CONST.SKILLS[s].name}</span><span class="text-[10px] opacity-80 leading-tight text-left">${this.CONST.SKILLS[s].desc}</span></div>`).join('');
        
        // Improve tooltip visibility (z-index 50, bottom-full)
        const tooltip = (card.skills.length > 0) ? `<div class="absolute bottom-full mb-2 w-48 bg-zinc-900 text-white p-3 rounded-xl shadow-2xl border border-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 flex flex-col gap-2 scale-95 group-hover:scale-100 origin-bottom left-1/2 -translate-x-1/2"><div class="text-xs font-bold text-zinc-400 border-b border-zinc-700 pb-1 flex justify-between"><span>${isMine ? '我方' : '敌方'} · ${card.number}</span></div><div>${skillDetails}</div></div>` : '';
        
        const isFreshPlay = this.state.lastPlayedCard.id === card.id && (Date.now() - this.state.lastPlayedCard.time < 1000);
        const animClass = isFreshPlay ? 'animate-ai-drop' : '';
        // Note: For Landscape, styles are injected via style attribute. For portrait wrapper, we use topPos 0 usually and rely on wrapper.
        // We keep style for landscape compatibility if called there.
        // For portrait stack, we do NOT inject position styles here to avoid conflicts with wrapper
        const style = (topPos !== undefined && !isPortraitStack) ? `top: ${topPos}px; left: 10%; width: 80%; z-index: ${index};` : '';
        
        // Add title attribute as fallback
        const skillTitle = card.skills.map(s => `[${this.CONST.SKILLS[s].name}] ${this.CONST.SKILLS[s].desc}`).join('\n');
        
        // Add absolute position ONLY if not portrait stack wrapper mode OR if needed by landscape
        const posClass = isPortraitStack ? '' : 'absolute';

        // Added overflow-hidden to main card container
        return `<div id="small-card-${card.id}" style="${style}" title="${skillTitle}" class="${posClass} h-32 w-24 rounded-xl border-4 ${borderClass} ${bg} shadow-lg flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 hover:!z-[100] shrink-0 ${animClass} group cursor-help overflow-hidden">
             ${tooltip}
             <div class="absolute top-1 right-1 flex gap-1 flex-wrap justify-end max-w-[80%]">${skillIcons}</div>
             <div class="text-3xl font-black drop-shadow-md absolute bottom-2 left-2">${this.getCardValue(card)}</div>
        </div>`;
    },
    
    // --- ANIMATIONS ---
    animateElementExit: async function(elementId, isAi = false) {
        const el = document.getElementById(elementId);
        if(el) {
            el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.transform = isAi ? 'scale(0)' : 'translateY(-100px) scale(0.8) rotate(5deg)';
            el.style.opacity = '0';
            await new Promise(r => setTimeout(r, 250));
        }
    },
    
    // Floating Score Animation
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
        
        // Remove after animation
        setTimeout(() => {
            floatEl.remove();
        }, 1000);
    },

    // Styles
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
                
                /* Utils for portrait safe areas */
                .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
            `;
            document.head.appendChild(style);
        }
    }
});

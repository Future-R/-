

// --- CARD GAME (SOLO) ---
window.App = window.App || {};
window.App.pages = window.App.pages || {};

window.App.pages.cardGame = {
    // Game Constants
    CONST: {
        // Changed Green (Emerald) to Yellow/Amber for accessibility
        COLORS: { 0: 'bg-red-500', 1: 'bg-amber-400', 2: 'bg-sky-500' },
        COLOR_BORDERS: { 0: 'border-red-500', 1: 'border-amber-400', 2: 'border-sky-500' },
        COLOR_TEXT: { 0: 'text-red-500', 1: 'text-amber-500', 2: 'text-sky-500' },
        COLOR_NAMES: { 0: '红', 1: '黄', 2: '蓝' },
        // Skills Definition
        SKILLS: {
            'add1': { name: '+1', short: '1', desc: '结算时分数+1', type: 'score' },
            'add2': { name: '+2', short: '2', desc: '结算时分数+2', type: 'score' },
            'add3': { name: '+3', short: '3', desc: '结算时分数+3', type: 'score' },
            'min': { name: '最小', short: '0', desc: '比点大小时视为 0', type: 'value' },
            'max': { name: '最大', short: '8', desc: '比点大小时视为 8', type: 'value' },
            'discolor': { name: '变色', short: '变', desc: '可打入任意颜色列。打出后变为该列颜色', type: 'play' },
            'dye': { name: '染色', short: '染', desc: '可打入任意列。此牌在场时，该列视为此牌颜色', type: 'field' },
            'bounce': { name: '回弹', short: '弹', desc: '弃置时：选择一个堆叠，将顶牌退回持有者牌库', type: 'discard_target' },
            'boom': { name: '炸弹', short: '炸', desc: '弃置时：选择一个堆叠，破坏所有牌', type: 'discard_target' },
            'handover': { name: '交接', short: '交', desc: '此牌在顶端时，己方出牌无视大小', type: 'field' },
            'domineer': { name: '霸道', short: '霸', desc: '出牌时无视大小限制', type: 'play' },
            'lock': { name: '锁定', short: '锁', desc: '此牌在顶端时，对手只能出同色牌', type: 'field' },
            'replace': { name: '替换', short: '换', desc: '打出时破坏顶端牌。可对同点数打出', type: 'play' },
            'double': { name: '翻倍', short: '翻', desc: '此牌在顶端时，己方此列分数 x2', type: 'score' },
            'hammer': { name: '宝锤', short: '锤', desc: '弃置时：重洗手牌并抽取同数量', type: 'discard_self' },
            'copy': { name: '复制', short: '复', desc: '打出时：此牌词条变为下方牌的词条', type: 'play' },
            'guard': { name: '守护', short: '盾', desc: '此牌在场时，此列卡牌无法被破坏', type: 'field' },
            'reverse': { name: '逆转', short: '逆', desc: '此牌在场时，全局比点规则颠倒(小吃大)', type: 'field' },
        },
        MAX_HAND: 6,
        WIN_IPPON: 2,
        MAX_REDRAW_TOKENS: 3
    },

    // Game State
    state: {
        started: false,
        turn: 0, // 0: Player, 1: AI
        ippon: [0, 0], // [Player, AI]
        fields: [[], [], []], // 3 Stacks
        hands: [[], []], 
        decks: [[], []],
        log: [],
        selectedCardIndices: [],
        redrawTokens: 3,
        isProcessing: false,
        winner: null,
        awaitingTarget: null, 
        browsingStackIdx: -1,
        effectQueue: [], // For sequential discard resolution
        pendingDraw: 0, // Cards to draw after effects
    },

    // --- INITIALIZATION ---

    initDeck: function(ownerId) {
        const deck = [];
        const skillKeys = Object.keys(this.CONST.SKILLS);
        
        for (let i = 0; i < 24; i++) {
            const color = Math.floor(Math.random() * 3);
            const number = Math.floor(Math.random() * 7) + 1; // 1-7
            
            const numSkills = Math.random() < 0.6 ? 1 : (Math.random() < 0.8 ? 2 : (Math.random() < 0.95 ? 0 : 3));
            const cardSkills = [];
            const pool = [...skillKeys];
            
            for (let k = 0; k < numSkills; k++) {
                if (pool.length === 0) break;
                const r = Math.floor(Math.random() * pool.length);
                cardSkills.push(pool[r]);
                pool.splice(r, 1);
            }

            deck.push({
                id: Math.random().toString(36).substr(2, 9),
                owner: ownerId,
                color: color,
                originalColor: color,
                number: number,
                skills: cardSkills,
                drawnAt: 0 
            });
        }
        return deck.sort(() => Math.random() - 0.5);
    },

    initGame: function() {
        if (!document.getElementById('card-game-styles')) {
            const style = document.createElement('style');
            style.id = 'card-game-styles';
            style.innerHTML = `
                @keyframes drawCard { 
                    0% { transform: translateY(60px) scale(0.8); opacity: 0; } 
                    100% { transform: translateY(0) scale(1); opacity: 1; } 
                }
                .animate-draw { animation: drawCard 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `;
            document.head.appendChild(style);
        }

        try {
            this.state.started = true;
            this.state.ippon = [0, 0];
            this.state.winner = null;
            this.state.redrawTokens = this.CONST.MAX_REDRAW_TOKENS;
            this.state.log = ["游戏开始！"];
            this.state.effectQueue = [];
            this.state.pendingDraw = 0;
            this.startRound();
        } catch (e) {
            console.error("Init Game Error:", e);
            alert("游戏初始化失败，请查看控制台。");
        }
    },

    startRound: function() {
        this.state.turn = 0;
        this.state.fields = [[], [], []];
        this.state.decks = [this.initDeck(0), this.initDeck(1)];
        this.state.hands = [[], []];
        this.drawCards(0, 7);
        this.drawCards(1, 7);
        this.state.isProcessing = false;
        this.state.selectedCardIndices = [];
        this.state.awaitingTarget = null;
        this.state.browsingStackIdx = -1;
        this.state.effectQueue = [];
        this.state.pendingDraw = 0;
        this.log("回合开始。");
        this.renderGame();
    },

    drawCards: function(playerId, count) {
        const now = Date.now();
        for (let i = 0; i < count; i++) {
            if (this.state.decks[playerId].length > 0) {
                const card = this.state.decks[playerId].pop();
                card.drawnAt = now + (i * 100);
                this.state.hands[playerId].push(card);
            }
        }
    },

    // --- LOGIC HELPERS ---

    getStackColor: function(fieldIdx) {
        const stack = this.state.fields[fieldIdx];
        if (!stack) return fieldIdx;
        for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i] && stack[i].skills && stack[i].skills.includes('dye')) {
                return stack[i].color;
            }
        }
        return fieldIdx;
    },

    isGlobalReverse: function() {
        let count = 0;
        this.state.fields.forEach(stack => {
            stack.forEach(c => {
                if (this.hasSkill(c, 'reverse')) count++;
            });
        });
        return count % 2 !== 0;
    },

    getCardValue: function(card) {
        if (!card) return 0;
        if (card.skills.includes('min')) return 0;
        if (card.skills.includes('max')) return 8;
        return card.number;
    },

    hasSkill: function(card, skillName) {
        return card && card.skills && card.skills.includes(skillName);
    },

    canPlay: function(card, fieldIdx) {
        if (!card) return false;
        const stack = this.state.fields[fieldIdx];
        const top = stack.length > 0 ? stack[stack.length - 1] : null;
        const stackColor = this.getStackColor(fieldIdx);
        const isReversed = this.isGlobalReverse();

        const isWild = this.hasSkill(card, 'discolor') || this.hasSkill(card, 'dye');

        // 1. GLOBAL Lock Check (Highest Priority)
        // Scan ALL fields to see if any field has a Lock belonging to the OPPONENT of the current turn player.
        // If it's my turn, check if Opponent has any Locks. If so, I am restricted.
        let lockedColors = [];
        this.state.fields.forEach(s => {
            const t = s.length > 0 ? s[s.length - 1] : null;
            // Condition: Top card exists AND Owner is NOT current turn player AND Top has Lock
            if (t && t.owner !== this.state.turn && this.hasSkill(t, 'lock')) {
                lockedColors.push(t.color);
            }
        });

        // If there are any active locks from the opponent, I MUST match one of them (or use Wild)
        if (lockedColors.length > 0) {
            if (!isWild && !lockedColors.includes(card.color)) {
                return false;
            }
        }

        // 2. Normal Zone Color Check
        // You can only play Red in Red zone, etc.
        if (card.color !== stackColor && !isWild) {
            return false;
        }

        // 3. Value Check
        if (!top) return true;
        
        if (top.owner === this.state.turn && this.hasSkill(top, 'handover')) return true;
        if (this.hasSkill(card, 'domineer')) return true;

        const myVal = this.getCardValue(card);
        const topVal = this.getCardValue(top);

        if (this.hasSkill(card, 'replace')) {
             if (isReversed) return myVal <= topVal;
             return myVal >= topVal;
        }

        if (isReversed) {
            return myVal < topVal;
        }
        return myVal > topVal;
    },

    // --- INTERACTIONS ---

    handleStackClick: async function(fieldIdx) {
        // Priority 1: Awaiting Target (Discard Effects)
        if (this.state.awaitingTarget) {
            await this.resolveDiscardEffect(fieldIdx);
            return;
        }

        // Priority 2: Playing a Card
        // Only if NOT processing AND Player Turn AND Card Selected
        if (!this.state.isProcessing && this.state.turn === 0 && this.state.selectedCardIndices.length === 1) {
            const cardIdx = this.state.selectedCardIndices[0];
            const card = this.state.hands[0][cardIdx];
            if (this.canPlay(card, fieldIdx)) {
                this.playCard(0, cardIdx, fieldIdx);
                return;
            }
        }
        
        // Priority 3: Browse (Always Allowed)
        this.openStackBrowser(fieldIdx);
    },

    animateCardExit: async function(cardId) {
        const el = document.getElementById(`card-${cardId}`);
        if(el) {
            el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.transform = 'translateY(-100px) scale(0.8) rotate(5deg)';
            el.style.opacity = '0';
            // Wait for animation to finish
            await new Promise(r => setTimeout(r, 250));
        }
    },

    playCard: async function(playerId, cardIdx, fieldIdx) {
        if (this.state.isProcessing) return;
        this.state.isProcessing = true;
        
        const hand = this.state.hands[playerId];
        const card = hand[cardIdx];

        // Animate Player Exit
        if (playerId === 0) {
            await this.animateCardExit(card.id);
        }

        hand.splice(cardIdx, 1);
        this.state.selectedCardIndices = [];

        const stack = this.state.fields[fieldIdx];
        const top = stack.length > 0 ? stack[stack.length - 1] : null;

        // Check Replace
        if (this.hasSkill(card, 'replace') && top) {
             if (this.hasSkill(top, 'guard')) {
                 this.log(`${playerId===0?'我方':'敌方'} [替换] 失败，目标有 [守护]`);
             } else {
                 this.log(`${playerId===0?'我方':'敌方'} [替换] 破坏了顶牌`);
                 stack.pop();
             }
        }

        const currentTop = stack.length > 0 ? stack[stack.length - 1] : null;
        if (this.hasSkill(card, 'copy') && currentTop) {
            this.log(`${playerId===0?'我方':'敌方'} [复制] 覆盖了词条`);
            card.skills = [...currentTop.skills];
        }

        if (this.hasSkill(card, 'discolor')) {
            card.color = fieldIdx;
        }

        stack.push(card);
        this.renderGame();
        await this.checkTurnEnd();
    },

    // --- DISCARD & REDRAW SYSTEM ---

    handleDiscardAction: async function() {
        if (this.state.turn !== 0 || this.state.isProcessing) return;
        const indices = this.state.selectedCardIndices;
        if (indices.length === 0) return;
        
        this.state.isProcessing = true;
        this.state.effectQueue = [];
        this.state.pendingDraw = 0;

        let isRedraw = false;
        
        if (indices.length >= 2 && this.state.redrawTokens > 0) {
            this.state.redrawTokens--;
            isRedraw = true;
            this.log(`战术重组: 弃${indices.length}抽1`);
            this.state.pendingDraw = 1;
        } else {
             this.log(indices.length > 1 ? "批量弃牌" : "弃牌");
        }

        // Animate Discards
        const sorted = [...indices].sort((a, b) => b - a);
        const animations = sorted.map(idx => {
             const card = this.state.hands[0][idx];
             return this.animateCardExit(card.id);
        });
        await Promise.all(animations);

        // Process Logic
        const cardsToDiscard = [];
        sorted.forEach(idx => {
            cardsToDiscard.push(this.state.hands[0][idx]);
            this.state.hands[0].splice(idx, 1);
        });
        
        this.state.selectedCardIndices = [];
        this.renderGame(); 

        // Build Effect Queue
        let hasHammer = false;
        cardsToDiscard.forEach(card => {
             if (this.hasSkill(card, 'hammer')) hasHammer = true;
             if (this.hasSkill(card, 'boom')) this.state.effectQueue.push({ type: 'boom', card: card, source: 0 });
             if (this.hasSkill(card, 'bounce')) this.state.effectQueue.push({ type: 'bounce', card: card, source: 0 });
        });

        if (hasHammer) {
            this.log("发动 [宝锤]: 重洗手牌");
            const count = this.state.hands[0].length;
            const oldHand = this.state.hands[0].splice(0, count);
            oldHand.forEach(c => this.state.decks[0].push(c));
            this.state.decks[0].sort(() => Math.random() - 0.5);
            this.drawCards(0, count);
        }

        await this.processNextEffect();
    },

    processNextEffect: async function() {
        if (this.state.effectQueue.length > 0) {
            const effect = this.state.effectQueue.shift();
            this.state.awaitingTarget = {
                type: effect.type,
                sourcePlayer: effect.source,
                cardData: effect.card
            };
            this.log(`请为 [${effect.type === 'boom' ? '炸弹' : '回弹'}] 选择目标...`, "text-amber-500 animate-pulse");
            this.state.isProcessing = false; 
            this.renderGame();
        } else {
            this.state.isProcessing = true;
            if (this.state.pendingDraw > 0) {
                this.drawCards(0, this.state.pendingDraw);
                this.state.pendingDraw = 0;
            }
            this.checkTurnEnd();
        }
    },

    resolveDiscardEffect: async function(targetFieldIdx) {
        if (!this.state.awaitingTarget) return;

        this.state.isProcessing = true; 

        const { type, sourcePlayer } = this.state.awaitingTarget;
        const stack = this.state.fields[targetFieldIdx];
        this.state.awaitingTarget = null;

        const hasGuard = stack.some(c => this.hasSkill(c, 'guard'));
        
        // Fix: Guard ONLY protects against BOOM. BOUNCE is allowed.
        if (hasGuard && type === 'boom') {
             this.log(`[炸弹] 被 [守护] 抵挡！`);
        } else {
            if (type === 'boom') {
                this.log(`${sourcePlayer===0?'我方':'敌方'} [炸弹] 炸毁了 ${this.CONST.COLOR_NAMES[targetFieldIdx]}区！`, "text-red-500");
                this.state.fields[targetFieldIdx] = [];
            } else if (type === 'bounce') {
                if (stack.length > 0) {
                    this.log(`${sourcePlayer===0?'我方':'敌方'} [回弹] 将顶牌退回牌库`);
                    const top = stack.pop();
                    this.state.decks[top.owner].push(top);
                    this.state.decks[top.owner].sort(() => Math.random() - 0.5);
                } else {
                    this.log("目标区域为空，效果失效");
                }
            }
        }
        
        this.renderGame();
        await new Promise(r => setTimeout(r, 500));
        this.processNextEffect();
    },

    // --- AI ---

    aiTurn: async function() {
        const hand = this.state.hands[1];
        if (hand.length === 0) {
            await this.checkTurnEnd();
            return;
        }

        let bestMove = null;
        let bestScore = -9999;

        for (let i = 0; i < hand.length; i++) {
            const card = hand[i];
            for (let f = 0; f < 3; f++) {
                if (this.canPlay(card, f)) {
                    let score = this.getCardValue(card);
                    if (this.hasSkill(card, 'score3')) score += 3;
                    if (this.hasSkill(card, 'double')) score += 5;
                    if (this.hasSkill(card, 'reverse')) score += 4; 
                    if (this.hasSkill(card, 'boom')) score -= 10; 
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { type: 'play', cardIdx: i, fieldIdx: f };
                    }
                }
            }
        }

        await new Promise(r => setTimeout(r, 600));

        if (bestMove) {
            if (bestMove.type === 'play') {
                await this.playCard(1, bestMove.cardIdx, bestMove.fieldIdx);
            }
        } else {
            let discardIdx = 0;
            const boomIdx = hand.findIndex(c => this.hasSkill(c, 'boom') || this.hasSkill(c, 'bounce'));
            if (boomIdx >= 0) discardIdx = boomIdx;
            
            const card = hand[discardIdx];
            hand.splice(discardIdx, 1);
            this.log("AI 弃掉了一张牌");
            
            if (this.hasSkill(card, 'boom') || this.hasSkill(card, 'bounce')) {
                let targetF = 0;
                let maxDiff = -99;
                for(let f=0; f<3; f++) {
                    const s = this.calculateStackScore(f);
                    if (s.player - s.ai > maxDiff) {
                        maxDiff = s.player - s.ai;
                        targetF = f;
                    }
                }
                
                this.state.awaitingTarget = {
                     type: this.hasSkill(card, 'boom') ? 'boom' : 'bounce',
                     sourcePlayer: 1,
                     cardData: card
                };
                await this.resolveDiscardEffect(targetF);
            } else {
                await this.checkTurnEnd();
            }
        }
    },

    checkTurnEnd: async function() {
        if (this.state.hands[0].length === 0 && this.state.hands[1].length === 0) {
            await this.resolveRound();
        } else {
            this.state.turn = 1 - this.state.turn;
            this.state.isProcessing = false;
            this.renderGame();
            if (this.state.turn === 1) this.aiTurn();
        }
    },

    calculateStackScore: function(fieldIdx) {
        const stack = this.state.fields[fieldIdx];
        if (!stack || stack.length === 0) return { player: 0, ai: 0 };

        const top = stack[stack.length - 1];
        let pScore = 0;
        let aScore = 0;

        stack.forEach(c => {
            let val = 1;
            if (this.hasSkill(c, 'add1')) val += 1;
            if (this.hasSkill(c, 'add2')) val += 2;
            if (this.hasSkill(c, 'add3')) val += 3;
            
            if (c.owner === 0) pScore += val;
            else aScore += val;
        });

        if (this.hasSkill(top, 'double')) {
            if (top.owner === 0) pScore *= 2;
            else aScore *= 2;
        }

        return { player: pScore, ai: aScore };
    },

    resolveRound: async function() {
        this.state.isProcessing = true;
        this.log("回合结束，结算...", "text-amber-500");
        await new Promise(r => setTimeout(r, 1000));

        let totalP = 0;
        let totalA = 0;

        for (let f = 0; f < 3; f++) {
            const scores = this.calculateStackScore(f);
            totalP += scores.player;
            totalA += scores.ai;
        }

        this.log(`最终比分: ${totalP} - ${totalA}`);

        if (totalP > totalA) {
            this.state.ippon[0]++;
            this.log("我方获得 1 胜场 (IPPON)!", "text-green-500");
        } else if (totalA > totalP) {
            this.state.ippon[1]++;
            this.log("敌方获得 1 胜场 (IPPON)!", "text-red-400");
        } else {
            this.log("平局！");
        }

        await new Promise(r => setTimeout(r, 2000));

        if (this.state.ippon[0] >= this.CONST.WIN_IPPON) {
            this.state.winner = 0;
            this.state.started = false;
        } else if (this.state.ippon[1] >= this.CONST.WIN_IPPON) {
            this.state.winner = 1;
            this.state.started = false;
        } else {
            this.startRound();
        }
        this.renderGame();
    },

    log: function(msg, colorClass = "text-zinc-400") {
        this.state.log.unshift({ text: msg, color: colorClass });
        if (this.state.log.length > 30) this.state.log.pop();
        const logEl = document.getElementById('game-log-content');
        if (logEl) {
            logEl.innerHTML = this.state.log.map(l => `<div class="text-xs ${l.color} mb-1 border-b border-white/5 pb-1">${l.text}</div>`).join('');
        }
    },

    // --- RENDER ---

    renderGame: function() {
        const board = document.getElementById('game-board');
        if (board) {
            board.innerHTML = this.renderBoard();
            if(window.lucide) window.lucide.createIcons();
        }
    },

    render: function() {
        return `
        <div class="flex flex-col h-[calc(100vh-140px)] w-full fade-in relative max-w-7xl mx-auto">
             <div id="game-board" class="flex-1 flex flex-col gap-4 relative">
                ${this.renderBoard()}
             </div>
        </div>
        `;
    },

    renderBoard: function() {
        if (!this.state.started) {
            const winnerHtml = this.state.winner !== null ? `
                <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl border border-zinc-700">
                    <div class="text-center animate-bounce">
                        <h1 class="text-6xl font-black ${this.state.winner === 0 ? 'text-green-500' : 'text-red-500'} mb-4 drop-shadow-[0_0_15px_currentColor]">
                            ${this.state.winner === 0 ? '胜 利' : '失 败'}
                        </h1>
                        <button onclick="window.App.pages.cardGame.initGame()" class="atom-btn px-8 py-3 bg-white text-zinc-800">再来一局</button>
                    </div>
                </div>` : '';

            return `
            ${winnerHtml}
            <div class="flex flex-col items-center justify-center h-full gap-6">
                <div class="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
                    <i data-lucide="dog" class="w-10 h-10"></i>
                </div>
                <h1 class="text-3xl font-black text-zinc-700 tracking-wider">阿不然打牌啰</h1>
                <div class="text-sm text-zinc-500 max-w-md text-center leading-relaxed bg-zinc-100 p-6 rounded-xl border border-zinc-200">
                    <div class="font-bold mb-2 text-zinc-700">游戏规则</div>
                    <ul class="text-left list-disc pl-5 space-y-1 text-xs">
                        <li>将牌打出到对应颜色的区域，且点数不能比顶端牌小。</li>
                        <li>双方手牌打完后，结算分数，1张牌1分，分高者胜。</li>
                        <li>三局两胜制，拿下两轮胜利即赢得游戏。</li>
                    </ul>
                </div>
                <button onclick="window.App.pages.cardGame.initGame()" class="atom-btn px-10 py-4 text-red-600 bg-red-50 border-red-200 border-b-red-300">
                    开始对战
                </button>
            </div>`;
        }

        const scores = [0,1,2].map(i => this.calculateStackScore(i));
        const totalP = scores.reduce((a,b)=>a+b.player, 0);
        const totalA = scores.reduce((a,b)=>a+b.ai, 0);
        
        const selCount = this.state.selectedCardIndices.length;
        const targetMode = this.state.awaitingTarget !== null;

        let actionBtnText = "弃 牌";
        let actionBtnColor = "bg-zinc-200 text-zinc-500 cursor-not-allowed"; 
        let actionIcon = "trash-2";
        let actionClick = "";

        if (selCount > 0) {
             actionBtnColor = "bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200 cursor-pointer shadow-sm active:scale-95";
             actionClick = "window.App.pages.cardGame.handleDiscardAction()";
             
             if (selCount >= 2) {
                 if (this.state.redrawTokens > 0) {
                     actionBtnText = `重组 (${this.state.redrawTokens})`;
                     actionBtnColor = "bg-sky-100 text-sky-600 border-sky-200 hover:bg-sky-200 cursor-pointer shadow-sm active:scale-95";
                     actionIcon = "refresh-cw";
                 } else {
                     actionBtnText = "批量弃牌";
                 }
             }
        }

        const queueStatus = this.state.effectQueue.length > 0 
            ? `<div class="absolute top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-3 py-1 rounded-full shadow z-30 animate-pulse font-bold">
                 正在结算特效: ${this.state.effectQueue.length} 个待处理
               </div>` 
            : '';
        
        const globalReverse = this.isGlobalReverse();
        const reverseOverlay = globalReverse 
            ? `<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-10">
                 <span class="text-[8rem] font-black text-black rotate-12 block">REVERSE</span>
               </div>`
            : '';

        return `
            <div class="flex flex-col md:flex-row h-full gap-4">
                <div class="hidden md:flex w-64 flex-col gap-2 shrink-0">
                     <div class="bg-zinc-800 text-white p-4 rounded-xl shadow-lg border border-zinc-700 relative overflow-hidden">
                        <div class="absolute top-2 right-2">
                            <button onclick="window.App.pages.cardGame.initGame()" class="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white" title="重新开始">
                                <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">总分 (Total)</div>
                        <div class="flex justify-between items-end">
                            <div class="flex flex-col">
                                <span class="text-xs text-green-400 font-bold">我方</span>
                                <span class="text-4xl font-black">${totalP}</span>
                            </div>
                            <div class="h-8 w-[1px] bg-zinc-600"></div>
                            <div class="flex flex-col items-end">
                                <span class="text-xs text-red-400 font-bold">对手</span>
                                <span class="text-4xl font-black">${totalA}</span>
                            </div>
                        </div>
                     </div>
                     <div class="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-3 overflow-hidden flex flex-col shadow-inner min-h-0">
                        <div id="game-log-content" class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 font-mono">
                             ${this.state.log.map(l => `<div class="text-xs ${l.color} mb-1 border-b border-white/5 pb-1">${l.text}</div>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="flex-1 flex flex-col gap-2 min-w-0 relative">
                    ${queueStatus}
                    <div class="flex md:hidden justify-between items-center bg-zinc-800 text-white p-2 rounded-lg text-xs font-bold">
                        <span>AI: ${totalA}</span>
                        <span>VS</span>
                        <span>ME: ${totalP}</span>
                        <button onclick="window.App.pages.cardGame.initGame()" class="ml-2 p-1 hover:bg-white/10 rounded">
                             <i data-lucide="rotate-ccw" class="w-3 h-3"></i>
                        </button>
                    </div>

                    <div class="flex justify-center -space-x-2 py-2 shrink-0 h-16 opacity-90 transition-all z-0">
                        ${this.state.hands[1].map(() => `
                            <div class="w-12 h-16 bg-zinc-700 border border-zinc-500 rounded shadow-sm relative">
                                <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjNDA0MDQwIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjNTA1MDUwIiAvPgo8L3N2Zz4=')] opacity-50"></div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex-1 grid grid-cols-3 gap-2 md:gap-6 p-2 md:p-6 bg-zinc-100/50 rounded-3xl border border-zinc-200 shadow-inner overflow-hidden relative z-0">
                        ${reverseOverlay}
                        ${[0, 1, 2].map(idx => this.renderFieldStack(idx, scores[idx])).join('')}
                    </div>

                    <div class="h-40 md:h-48 relative flex items-end justify-center pb-4 md:pb-6 gap-2 md:gap-4 px-4 z-20 pointer-events-none">
                        <div class="flex items-end gap-2 md:gap-4 overflow-visible pointer-events-auto">
                            ${this.state.hands[0].map((card, i) => this.renderPlayerCard(card, i)).join('')}
                        </div>
                        <div class="absolute right-0 bottom-6 pointer-events-auto">
                            <button onclick="${actionClick}" 
                                    class="w-24 h-24 rounded-full border-4 font-bold transition-all flex flex-col items-center justify-center gap-1 shadow-lg ${actionBtnColor}">
                                <i data-lucide="${actionIcon}" class="w-6 h-6"></i>
                                <span class="text-xs">${actionBtnText}</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                ${targetMode ? `<div class="absolute inset-0 bg-black/40 z-50 flex items-center justify-center pointer-events-none"><div class="bg-black text-white px-6 py-3 rounded-full animate-bounce font-bold pointer-events-auto">点击上方堆叠选择目标</div></div>` : ''}
                ${this.state.browsingStackIdx !== -1 ? this.renderStackBrowser() : ''}
            </div>`;
    },

    renderFieldStack: function(idx, score) {
        const stack = this.state.fields[idx];
        const stackColor = this.getStackColor(idx);
        const colorName = this.CONST.COLOR_NAMES[stackColor];
        const baseBg = stackColor === 0 ? 'bg-red-50' : stackColor === 1 ? 'bg-amber-50' : 'bg-sky-50';
        const borderColor = this.CONST.COLOR_BORDERS[stackColor];
        const textColor = this.CONST.COLOR_TEXT[stackColor];
        
        const stackVisuals = stack.slice(-6).map((c, i) => {
            const offset = i * 20; 
            const z = i;
            const isTop = i === (Math.min(stack.length, 6) - 1);
            return this.renderSmallCard(c, offset, z, isTop);
        }).join('');

        const selIndices = this.state.selectedCardIndices;
        let overlayContent = '';
        let onClickFn = `window.App.pages.cardGame.handleStackClick(${idx})`;
        let cursorClass = 'cursor-pointer hover:bg-black/5';

        // Check if Top Card is Lock and Enemy's
        const topCard = stack.length > 0 ? stack[stack.length - 1] : null;
        const isLocked = topCard && this.hasSkill(topCard, 'lock');
        const lockIcon = isLocked ? `<div class="absolute -top-3 -right-3 z-30 bg-zinc-800 text-white w-8 h-8 flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-pulse" title="锁定: 只能出同色牌"><i data-lucide="lock" class="w-4 h-4"></i></div>` : '';


        if (selIndices.length === 1 && this.state.turn === 0 && !this.state.awaitingTarget) {
            if (this.canPlay(this.state.hands[0][selIndices[0]], idx)) {
                 overlayContent = `<div class="bg-green-500/80 text-white text-sm px-3 py-1 rounded-full font-bold shadow animate-bounce">放置</div>`;
                 cursorClass = 'cursor-pointer bg-green-500/10 hover:bg-green-500/20';
            }
        }
        else if (this.state.awaitingTarget) {
            overlayContent = `<div class="bg-red-500 text-white text-xs px-2 py-1 rounded shadow animate-pulse">选择目标</div>`;
            cursorClass = 'cursor-pointer ring-4 ring-red-500/50 bg-red-500/10';
        }

        return `
        <div onclick="${onClickFn}" class="relative h-full border-2 ${borderColor} ${baseBg} rounded-2xl flex flex-col justify-end pb-4 overflow-hidden group transition-colors ${cursorClass}">
            ${lockIcon}
            <div class="absolute top-0 left-0 right-0 p-2 flex justify-between items-start pointer-events-none z-10">
                 <div class="bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold ${textColor} shadow-sm border border-black/5">${colorName}区</div>
                 <div class="flex flex-col items-end">
                    <span class="text-xs font-black ${score.ai > score.player ? 'text-red-500' : 'text-zinc-400'}">${score.ai}</span>
                    <div class="w-full h-[1px] bg-zinc-300 my-0.5"></div>
                    <span class="text-sm font-black ${score.player > score.ai ? 'text-green-500' : 'text-zinc-600'}">${score.player}</span>
                 </div>
            </div>
            <div class="relative w-full h-full mt-10 mx-auto max-w-[80%] z-10">
                ${stack.length === 0 ? '<div class="absolute inset-0 flex items-center justify-center text-zinc-300 text-sm font-bold tracking-widest pointer-events-none">空</div>' : ''}
                ${stackVisuals}
            </div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">${overlayContent}</div>
        </div>`;
    },

    renderSmallCard: function(card, bottomOffset, zIndex, isTop) {
        const bg = this.CONST.COLORS[card.color];
        const isMine = card.owner === 0;
        const border = isMine ? 'border-zinc-600' : 'border-red-400 border-dashed';
        
        // Enlarged Icons 3x
        const skillIcons = card.skills.slice(0, 3).map(s => {
             const sk = this.CONST.SKILLS[s];
             const txt = sk.short || sk.name[0];
             // w-3 h-3 (12px) -> w-9 h-9 (36px)
             // text-[8px] -> text-lg
             return `<div class="w-9 h-9 bg-black/20 rounded-full text-lg flex items-center justify-center text-white font-bold shadow-sm" title="${sk.name}">${txt}</div>`;
        }).join('');

        const skillDetails = isTop ? card.skills.map(s => {
            const sk = this.CONST.SKILLS[s];
            return `<div class="flex items-start gap-2 mb-1">
                <span class="bg-white/20 px-1 rounded text-[10px] shrink-0 mt-0.5">${sk.name}</span>
                <span class="text-[10px] opacity-80 leading-tight text-left">${sk.desc}</span>
            </div>`;
        }).join('') : '';

        const tooltip = (isTop && card.skills.length > 0) ? `
            <div class="absolute bottom-full mb-4 w-48 bg-zinc-900 text-white p-3 rounded-xl shadow-2xl border border-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 flex flex-col gap-2 scale-95 group-hover:scale-100 origin-bottom left-1/2 -translate-x-1/2">
                <div class="text-xs font-bold text-zinc-400 border-b border-zinc-700 pb-1 flex justify-between">
                    <span>顶牌效果</span>
                    <span>点数 ${card.number}</span>
                </div>
                <div>${skillDetails}</div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900"></div>
            </div>` : '';

        return `
        <div class="absolute left-0 right-0 h-32 rounded-lg border-2 ${border} ${bg} shadow-md flex flex-col items-center justify-center text-white transition-all transform ${isTop ? 'group-hover:scale-105 group-hover:-translate-y-2' : ''}" 
             style="bottom: ${bottomOffset}px; z-index: ${zIndex}">
             ${tooltip}
             <div class="absolute top-2 right-2 flex flex-col gap-1">${skillIcons}</div>
             <div class="text-3xl font-black drop-shadow-md absolute bottom-2 left-2">${this.getCardValue(card)}</div>
        </div>`;
    },

    renderPlayerCard: function(card, idx, isStatic = false) {
        const isSelected = !isStatic && this.state.selectedCardIndices.includes(idx);
        const bg = this.CONST.COLORS[card.color];
        
        const skillDetails = card.skills.map(s => {
            const sk = this.CONST.SKILLS[s];
            return `<div class="flex items-start gap-2 mb-1">
                <span class="bg-white/20 px-1 rounded text-[10px] shrink-0 mt-0.5">${sk.name}</span>
                <span class="text-[10px] opacity-80 leading-tight text-left">${sk.desc}</span>
            </div>`;
        }).join('');

        const onclick = isStatic ? '' : `onclick="window.App.pages.cardGame.selectCard(${idx})"`;
        const cursor = isStatic ? '' : 'cursor-pointer';
        const activeClass = isSelected ? 'border-yellow-300 -translate-y-10 shadow-2xl ring-4 ring-yellow-200/50 z-20' : 'border-white/20 hover:-translate-y-6 hover:shadow-xl z-10';
        const cardClass = isStatic ? 'border-white/20 shadow-lg' : activeClass;
        
        // Animation check
        const animClass = (!isStatic && Date.now() - (card.drawnAt || 0) < 500) ? 'animate-draw' : '';

        return `
        <div id="card-${card.id}" class="group relative flex flex-col items-center ${animClass}">
            <div ${onclick} 
                 class="w-24 h-36 shrink-0 rounded-xl ${bg} border-4 ${cardClass} 
                 relative flex flex-col items-center justify-between p-2 text-white ${cursor} transition-all duration-200 select-none">
                <div class="flex gap-1 w-full justify-end flex-wrap">
                    ${card.skills.slice(0,3).map(s => {
                        const sk = this.CONST.SKILLS[s];
                        const txt = sk.short || sk.name[0];
                        return `<div class="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[9px] font-bold">${txt}</div>`;
                    }).join('')}
                </div>
                <div class="text-5xl font-black drop-shadow-lg">${this.getCardValue(card)}</div>
                <div class="w-full h-1 bg-white/30 rounded-full"></div>
                ${isSelected ? '<div class="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white"><i data-lucide="check" class="w-3 h-3"></i></div>' : ''}
            </div>
            <div class="absolute bottom-full mb-4 w-48 bg-zinc-900 text-white p-3 rounded-xl shadow-2xl border border-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 flex flex-col gap-2 scale-95 group-hover:scale-100 origin-bottom">
                <div class="text-xs font-bold text-zinc-400 border-b border-zinc-700 pb-1 flex justify-between">
                    <span>${this.CONST.COLOR_NAMES[card.color]}卡</span>
                    <span>点数 ${card.number}</span>
                </div>
                <div>${skillDetails || '<span class="text-xs text-zinc-500 italic">无特殊效果</span>'}</div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900"></div>
            </div>
        </div>`;
    },

    renderStackBrowser: function() {
        const idx = this.state.browsingStackIdx;
        const stack = this.state.fields[idx];
        // Reverse stack for display so top card is first/visible
        const displayStack = [...stack].reverse();
        
        return `
        <div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 fade-in" onclick="window.App.pages.cardGame.closeStackBrowser()">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border-2 border-zinc-200" onclick="event.stopPropagation()">
                <div class="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                    <h3 class="font-black text-zinc-700 text-lg flex items-center gap-2">
                        <div class="w-4 h-4 rounded-full ${this.CONST.COLORS[idx]}"></div>
                        ${this.CONST.COLOR_NAMES[idx]}区卡牌一览 (${stack.length}) - 顶牌在左
                    </h3>
                    <button onclick="window.App.pages.cardGame.closeStackBrowser()" class="w-8 h-8 flex items-center justify-center hover:bg-zinc-200 rounded-full">
                        <i data-lucide="x" class="w-5 h-5 text-zinc-500"></i>
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-6 bg-zinc-100/50">
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 justify-items-center">
                        ${stack.length === 0 ? '<div class="col-span-full text-center text-zinc-400 py-10">此处空空如也</div>' : ''}
                        ${displayStack.map((c, i) => this.renderPlayerCard(c, i, true)).join('')}
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    selectCard: function(idx) {
        if (this.state.isProcessing) return;
        const pos = this.state.selectedCardIndices.indexOf(idx);
        if (pos >= 0) {
            this.state.selectedCardIndices.splice(pos, 1);
        } else {
            this.state.selectedCardIndices.push(idx);
        }
        this.renderGame();
    },
    
    closeStackBrowser: function() {
        this.state.browsingStackIdx = -1;
        this.renderGame();
    },

    mount: function() {
        if(window.lucide) window.lucide.createIcons();
    }
};


// --- CARD GAME CORE LOGIC ---
// Requires: card-game-config.js, card-game-ui.js

window.App = window.App || {};
window.App.pages = window.App.pages || {};
window.App.pages.cardGame = window.App.pages.cardGame || {};

// Extend the object with Core Logic
Object.assign(window.App.pages.cardGame, {
    // Global App State
    state: {
        mode: 'intro',
        gameMode: 'classic', // 'adventure' or 'classic'
        level: 1,
        maxLevel: 10,
        playerDeck: [], 
        gold: 100, 
        character: null,
        
        // Battle State
        turn: 0,
        ippon: [0, 0],
        fields: [[], [], []],
        hands: [[], []], 
        decks: [[], []], 
        discardPiles: [[], []], 
        
        log: [],
        selectedCardIndices: [],
        isProcessing: false,
        battleWinner: null,
        
        // Interaction State
        awaitingTarget: null, 
        effectQueue: [],
        pendingDraw: 0,
        lastPlayedCard: { id: null, time: 0 }, 
        discardConfirmOpen: false,
        trainingPending: null,
        pileViewMode: null, 
        scoringState: null, 

        // Roguelite State
        rewardGroups: [],
        eventData: null,
        
        // Avatars
        playerAvatar: 'paw-print',
        enemyData: null
    },

    // --- DECK HELPERS ---
    createCard: function(ownerId, color, number, skills = []) {
        return {
            id: Math.random().toString(36).substr(2, 9),
            owner: ownerId,
            color: color,
            originalColor: color,
            number: number,
            skills: [...skills],
            drawnAt: 0 
        };
    },

    initStarterDeck: function(charType) {
        const deck = [];
        if (charType === 'dog') {
            for (let c = 0; c < 3; c++) {
                for (let n = 1; n <= 7; n++) {
                    deck.push(this.createCard(0, c, n, []));
                }
            }
        } else if (charType === 'cat') {
            for (let n = 1; n <= 7; n++) {
                deck.push(this.createCard(0, 2, n, []));
                deck.push(this.createCard(0, 2, n, []));
            }
            const shuffle = deck.sort(() => Math.random() - 0.5);
            shuffle[0].skills.push('dye');
            shuffle[1].skills.push('dye');
            shuffle[2].skills.push('discolor');
            shuffle[3].skills.push('discolor');
        }
        return deck;
    },

    // Refined Classic Mode Deck: 2 copies of each skill, max 3 skills per card, min/max exclusivity
    initClassicDeck: function(ownerId) {
        const deck = [];
        for (let c = 0; c < 3; c++) {
            for (let n = 1; n <= 7; n++) {
                deck.push(this.createCard(ownerId, c, n, []));
                deck.push(this.createCard(ownerId, c, n, []));
            }
        }
        
        const skillKeys = Object.keys(this.CONST.SKILLS);
        const skillPool = [];
        skillKeys.forEach(s => { 
            skillPool.push(s, s); 
        });
        
        // Shuffle pool
        skillPool.sort(() => Math.random() - 0.5);

        for (const skill of skillPool) {
            // Find a valid card for this skill
            const validCards = deck.filter(card => {
                if (card.skills.length >= 3) return false;
                if (card.skills.includes(skill)) return false;
                // Exclusivity rule: max and min cannot coexist
                if (skill === 'max' && card.skills.includes('min')) return false;
                if (skill === 'min' && card.skills.includes('max')) return false;
                return true;
            });

            if (validCards.length > 0) {
                const target = validCards[Math.floor(Math.random() * validCards.length)];
                target.skills.push(skill);
            }
        }
        
        return deck.sort(() => Math.random() - 0.5);
    },

    generateAiDeck: function(level) {
        const enemyIdx = (level - 1) % this.CONST.ENEMIES.length;
        const config = this.CONST.ENEMIES[enemyIdx].deckConfig;
        const deck = [];
        
        config.colors.forEach(c => {
            config.nums.forEach(n => {
                for(let i=0; i<config.copies; i++) {
                    deck.push(this.createCard(1, c, n, []));
                }
            });
        });

        const skillKeys = Object.keys(this.CONST.SKILLS);
        const skillCount = Math.floor(level / 2) + 2;
        for (let i = 0; i < skillCount; i++) {
            const card = deck[Math.floor(Math.random() * deck.length)];
            const s = skillKeys[Math.floor(Math.random() * skillKeys.length)];
            if (!card.skills.includes(s)) card.skills.push(s);
        }

        return deck.sort(() => Math.random() - 0.5);
    },

    generateRewardGroups: function() {
        const groups = [];
        const skillKeys = Object.keys(this.CONST.SKILLS);
        for (let g = 0; g < 3; g++) {
            const group = [];
            for (let c = 0; c < 3; c++) {
                const color = Math.floor(Math.random() * 3);
                let number = Math.floor(Math.random() * 6) + 3; 
                if (Math.random() < 0.2) number = Math.floor(Math.random() * 3) + 1;
                
                const numSkills = Math.random() < 0.3 ? 1 : (Math.random() < 0.8 ? 2 : 1);
                const skills = [];
                const pool = [...skillKeys];
                for (let k = 0; k < numSkills; k++) {
                    if(pool.length===0) break;
                    const r = Math.floor(Math.random() * pool.length);
                    skills.push(pool[r]);
                    pool.splice(r,1);
                }
                group.push(this.createCard(0, color, number, skills));
            }
            groups.push(group);
        }
        return groups;
    },

    // --- GAME CONTROL ---
    initGame: function() {
        this.injectStyles();
        this.state.mode = 'intro';
        this.renderGame();
    },

    selectMode: function(mode) {
        this.state.gameMode = mode;
        if (mode === 'classic') {
            this.state.character = null;
            this.state.playerAvatar = 'dog';
            this.state.mode = 'map'; 
            this.renderGame();
        } else {
            this.state.mode = 'character_select';
            this.renderGame();
        }
    },

    selectCharacter: function(charType) {
        this.state.character = charType;
        this.state.playerAvatar = this.CONST.CHARACTERS[charType].icon;
        this.state.playerDeck = this.initStarterDeck(charType);
        this.state.level = 1;
        this.state.gold = 100;
        this.startRun();
    },

    startRun: function() {
        this.state.mode = 'map';
        this.renderGame();
    },

    enterBattle: function() {
        this.state.mode = 'battle';
        this.state.turn = 0;
        this.state.ippon = [0, 0];
        this.state.fields = [[], [], []];
        
        if (this.state.gameMode === 'classic') {
            this.state.log = [{ text: `经典对决开始：全技能随机实装。`, color: 'text-sky-400 font-bold' }];
            this.state.decks = [this.initClassicDeck(0), this.initClassicDeck(1)];
            this.state.enemyData = { name: '镜像对手', icon: 'cat', color: 'text-rose-500', bg: 'bg-rose-100' };
        } else {
            this.state.log = [{ text: `Lv.${this.state.level} 遭遇战开始。`, color: 'text-zinc-400' }];
            this.state.decks = [
                JSON.parse(JSON.stringify(this.state.playerDeck)).map(c => ({...c, owner: 0})).sort(() => Math.random() - 0.5),
                this.generateAiDeck(this.state.level)
            ];
            const enemyIdx = (this.state.level - 1) % this.CONST.ENEMIES.length;
            this.state.enemyData = this.CONST.ENEMIES[enemyIdx];
        }

        this.state.discardPiles = [[], []];
        this.state.hands = [[], []];
        this.state.effectQueue = [];
        this.state.pendingDraw = 0;
        this.state.isProcessing = false;
        this.state.pileViewMode = null;
        this.state.scoringState = null;

        this.drawCards(0, 5); 
        this.drawCards(1, 5);
        this.renderGame();
    },

    // --- BATTLE LOGIC ---
    drawCards: function(playerId, count) {
        const now = Date.now();
        for (let i = 0; i < count; i++) {
            if (this.state.decks[playerId].length === 0) {
                if (this.state.discardPiles[playerId].length > 0) {
                    if(playerId === 0) this.log("牌库耗尽，重新洗切弃牌堆。", "text-zinc-500 italic");
                    this.state.decks[playerId] = [...this.state.discardPiles[playerId]];
                    this.state.discardPiles[playerId] = [];
                    this.state.decks[playerId].sort(() => Math.random() - 0.5);
                } else {
                    break;
                }
            }
            
            if (this.state.decks[playerId].length > 0) {
                const card = this.state.decks[playerId].pop();
                card.drawnAt = now + (i * 100);
                this.state.hands[playerId].push(card);
            }
        }
    },

    sendToDiscard: function(card, playerId) {
        card.color = card.originalColor; 
        this.state.discardPiles[playerId].push(card);
    },
    
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
        this.state.fields.forEach(stack => { stack.forEach(c => { if (this.hasSkill(c, 'reverse')) count++; }); });
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

        let lockedColors = [];
        this.state.fields.forEach(s => {
            const t = s.length > 0 ? s[s.length - 1] : null;
            if (t && t.owner !== this.state.turn && this.hasSkill(t, 'lock')) lockedColors.push(t.color);
        });
        if (lockedColors.length > 0) { if (!lockedColors.includes(card.color)) return false; }

        if (card.color !== stackColor && !isWild) return false;
        if (!top) return true;
        if (top.owner === this.state.turn && this.hasSkill(top, 'handover')) return true;
        if (this.hasSkill(card, 'domineer')) return true;

        const myVal = this.getCardValue(card);
        const topVal = this.getCardValue(top);
        if (this.hasSkill(card, 'replace')) {
             if (isReversed) return myVal <= topVal;
             return myVal >= topVal;
        }
        if (isReversed) return myVal < topVal;
        return myVal > topVal;
    },

    // --- ACTIONS ---
    handleStackClick: async function(fieldIdx) {
        if (this.state.mode !== 'battle') return;
        if (this.state.awaitingTarget) { await this.resolveDiscardEffect(fieldIdx); return; }
        
        if (!this.state.isProcessing && this.state.turn === 0 && this.state.selectedCardIndices.length === 1) {
            const cardIdx = this.state.selectedCardIndices[0];
            const card = this.state.hands[0][cardIdx];
            if (this.canPlay(card, fieldIdx)) {
                if (this.hasSkill(card, 'train')) {
                    this.state.trainingPending = { type: 'play', indices: [cardIdx], targetField: fieldIdx };
                    this.renderGame();
                    return;
                }
                this.playCard(0, cardIdx, fieldIdx);
            }
        }
    },

    playCard: async function(playerId, cardIdx, fieldIdx) {
        if (this.state.isProcessing) return;
        this.state.isProcessing = true;
        
        const hand = this.state.hands[playerId];
        const card = hand[cardIdx];

        if (playerId === 0) await this.animateElementExit(`card-${card.id}`);
        else await this.animateElementExit(`ai-card-${card.id}`, true);

        hand.splice(cardIdx, 1);
        this.state.selectedCardIndices = [];

        const stack = this.state.fields[fieldIdx];
        const top = stack.length > 0 ? stack[stack.length - 1] : null;

        if (this.hasSkill(card, 'replace') && top) {
             if (this.hasSkill(top, 'guard')) {
                 this.log(`${playerId===0?'我方':'敌方'} [背刺] 失败：目标拥有 [格挡]`);
             } else {
                 this.log(`${playerId===0?'我方':'敌方'} [背刺] 破坏了顶层卡牌`);
                 const topCardEl = document.getElementById(`small-card-${top.id}`);
                 if (topCardEl) {
                     topCardEl.classList.add('animate-boom');
                     await new Promise(r => setTimeout(r, 400));
                 }
                 const destroyed = stack.pop();
                 this.sendToDiscard(destroyed, destroyed.owner);
             }
        }

        const currentTop = stack.length > 0 ? stack[stack.length - 1] : null;
        if (this.hasSkill(card, 'copy') && currentTop) {
            this.log(`${playerId===0?'我方':'敌方'} [模仿] 成功复制能力`);
            card.skills = [...currentTop.skills];
        }

        if (this.hasSkill(card, 'discolor')) card.color = fieldIdx;

        stack.push(card);
        this.state.lastPlayedCard = { id: card.id, time: Date.now() };

        setTimeout(() => {
            if (this.state.lastPlayedCard.id === card.id) {
                this.state.lastPlayedCard = { id: null, time: 0 };
            }
        }, 600);
        
        if (this.hasSkill(card, 'continue')) {
            this.log(`[补给] 双方各补充 1 张手牌`);
            this.drawCards(0, 1);
            this.drawCards(1, 1);
            this.renderGame(); 
            await new Promise(r => setTimeout(r, 500));
        }

        if (this.hasSkill(card, 'control') && stack.length >= 3) {
            const below1 = stack[stack.length - 2];
            const below2 = stack[stack.length - 3];
            const myVal = this.getCardValue(card);
            const v1 = this.getCardValue(below1);
            const v2 = this.getCardValue(below2);
            const isReverse = this.isGlobalReverse();
            const diff1 = isReverse ? (v1 - myVal) : (myVal - v1);
            const diff2 = isReverse ? (v2 - myVal) : (myVal - v2);
            if (diff1 === 1 && diff2 === 2) {
                this.log(`[魅惑] 获取了下方卡牌的控制权`);
                below1.owner = playerId;
                below2.owner = playerId;
                const el1 = document.getElementById(`small-card-${below1.id}`);
                const el2 = document.getElementById(`small-card-${below2.id}`);
                if(el1) el1.classList.add('animate-pulse');
                if(el2) el2.classList.add('animate-pulse');
            }
        }
        
        this.renderGame();

        if (this.hasSkill(card, 'rush')) {
            await new Promise(r => setTimeout(r, 500));
            const validIndices = [];
            for(let i=0; i<hand.length; i++) {
                let can = false;
                for(let f=0; f<3; f++) if (this.canPlay(hand[i], f)) { can = true; break; }
                if(can) validIndices.push(i);
            }
            if (validIndices.length > 0) {
                this.log(`[连斩] 触发追加攻击`);
                const rndIdx = validIndices[Math.floor(Math.random() * validIndices.length)];
                const validFields = [];
                const c = hand[rndIdx];
                for(let f=0; f<3; f++) if (this.canPlay(c, f)) validFields.push(f);
                if (validFields.length > 0) {
                    const targetF = validFields[Math.floor(Math.random() * validFields.length)];
                    if (this.hasSkill(c, 'train')) this.applyTraining(playerId, rndIdx, 1); 
                    this.state.isProcessing = false; 
                    await this.playCard(playerId, rndIdx, targetF);
                    return; 
                }
            }
        }
        await this.checkTurnEnd();
    },

    executeDiscard: async function() {
        this.state.isProcessing = true;
        this.state.effectQueue = [];
        this.state.pendingDraw = 0;
        const indices = this.state.selectedCardIndices;
        
        if (indices.length >= 2) {
            this.log(`多换一：弃置 ${indices.length} 张并抽 1 张`);
            this.state.pendingDraw = 1;
        } else { this.log("弃置 1 张卡牌"); }

        const sorted = [...indices].sort((a, b) => b - a);
        const animations = sorted.map(idx => this.animateElementExit(`card-${this.state.hands[0][idx].id}`));
        await Promise.all(animations);

        const cardsToDiscard = [];
        sorted.forEach(idx => {
            const c = this.state.hands[0][idx];
            cardsToDiscard.push(c);
            this.sendToDiscard(c, 0); 
            this.state.hands[0].splice(idx, 1);
        });
        this.state.selectedCardIndices = [];
        this.renderGame(); 

        let hasHammer = false;
        cardsToDiscard.forEach(card => {
             if (this.hasSkill(card, 'hammer')) hasHammer = true;
             if (this.hasSkill(card, 'boom')) this.state.effectQueue.push({ type: 'boom', card: card, source: 0 });
             if (this.hasSkill(card, 'bounce')) this.state.effectQueue.push({ type: 'bounce', card: card, source: 0 });
        });
        if (hasHammer) {
            this.log("[整备] 手牌已全部重新洗切");
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
            this.state.awaitingTarget = { type: effect.type, sourcePlayer: effect.source, cardData: effect.card };
            const effectName = effect.type === 'boom' ? '爆裂' : '击退';
            this.log(`请指定 [${effectName}] 的目标区域...`, "text-amber-500 animate-pulse");
            this.renderGame();
        } else {
            if (this.state.pendingDraw > 0) {
                this.drawCards(0, this.state.pendingDraw);
                this.state.pendingDraw = 0;
            }
            this.state.isProcessing = false;
            this.renderGame();
            await this.checkTurnEnd(); 
        }
    },

    resolveDiscardEffect: async function(targetFieldIdx) {
        if (!this.state.awaitingTarget) return;
        this.state.isProcessing = true; 
        
        if (this.state.log && this.state.log.length > 0) {
            this.state.log.forEach(l => {
               if(l.text && l.text.includes('指定') && l.color.includes('animate-pulse')) l.color = l.color.replace('animate-pulse','');
            });
        }

        const { type, sourcePlayer } = this.state.awaitingTarget;
        const stack = this.state.fields[targetFieldIdx];
        this.state.awaitingTarget = null;
        const stackEl = document.getElementById(`stack-container-${targetFieldIdx}`);
        const hasGuard = stack.some(c => this.hasSkill(c, 'guard'));
        
        if (hasGuard && type === 'boom') {
             this.log(`[爆裂] 效果被 [格挡] 无效化`);
        } else {
            if (type === 'boom') {
                if (stack.length > 0) {
                    this.log(`${sourcePlayer===0?'我方':'敌方'} [爆裂] 清空了 ${this.CONST.COLOR_NAMES[targetFieldIdx]}区域`, "text-red-500");
                    if (stackEl) Array.from(stackEl.children).forEach(child => child.classList.add('animate-boom'));
                    await new Promise(r => setTimeout(r, 600)); 
                    stack.forEach(c => this.sendToDiscard(c, c.owner));
                    this.state.fields[targetFieldIdx] = [];
                } else { this.log("目标区域为空，效果未触发"); }
            } else if (type === 'bounce') {
                if (stack.length > 0) {
                    this.log(`${sourcePlayer===0?'我方':'敌方'} [击退] 使顶层牌撤回牌库`);
                    const top = stack[stack.length-1]; 
                    const topCardEl = document.getElementById(`small-card-${top.id}`);
                    if (topCardEl) { topCardEl.classList.add('animate-bounce-up'); await new Promise(r => setTimeout(r, 500)); }
                    const popped = stack.pop();
                    this.state.decks[popped.owner].push(popped);
                    this.state.decks[popped.owner].sort(() => Math.random() - 0.5);
                } else { this.log("目标区域为空，效果未触发"); }
            }
        }
        this.renderGame();
        await new Promise(r => setTimeout(r, 300));
        await this.processNextEffect();
    },

    // --- AI & END TURN ---
    aiTurn: async function() {
        const hand = this.state.hands[1];
        if (hand.length === 0) { 
             await this.checkTurnEnd(); 
             return; 
        }
        
        let bestMove = null;
        let bestScore = -9999;
        await new Promise(r => setTimeout(r, 800));

        // AI Thinking
        for (let i = 0; i < hand.length; i++) {
            const card = hand[i];
            for (let f = 0; f < 3; f++) {
                if (this.canPlay(card, f)) {
                    let score = this.getCardValue(card);
                    if (this.hasSkill(card, 'score3')) score += 3;
                    if (this.hasSkill(card, 'double')) score += 5;
                    if (this.hasSkill(card, 'reverse')) score += 4; 
                    if (this.hasSkill(card, 'boom')) score -= 10; 
                    if (this.hasSkill(card, 'control')) score += 6; 
                    
                    if (score > bestScore) { 
                        bestScore = score; 
                        bestMove = { type: 'play', cardIdx: i, fieldIdx: f }; 
                    }
                }
            }
        }

        if (bestMove) {
            const card = hand[bestMove.cardIdx];
            if (!this.canPlay(card, bestMove.fieldIdx)) {
                bestMove = null; 
            } else {
                if (this.hasSkill(card, 'train')) this.applyTraining(1, bestMove.cardIdx, Math.random()>0.5?1:-1);
                await this.playCard(1, bestMove.cardIdx, bestMove.fieldIdx);
                return;
            }
        }
        
        if (!bestMove) {
            let discardIdx = 0;
            const boomIdx = hand.findIndex(c => this.hasSkill(c, 'boom') || this.hasSkill(c, 'bounce'));
            if (boomIdx >= 0) discardIdx = boomIdx;
            const card = hand[discardIdx];
            if (this.hasSkill(card, 'train')) this.applyTraining(1, discardIdx, Math.random()>0.5?1:-1);
            
            await this.animateElementExit(`ai-card-${card.id}`, true);
            hand.splice(discardIdx, 1);
            this.log("敌方 弃置了一张牌");
            this.sendToDiscard(card, 1);
            
            if (this.hasSkill(card, 'boom') || this.hasSkill(card, 'bounce')) {
                let targetF = 0;
                let maxDiff = -99;
                for(let f=0; f<3; f++) {
                    const s = this.calculateStackScore(f);
                    if (s.player - s.ai > maxDiff) { maxDiff = s.player - s.ai; targetF = f; }
                }
                this.state.awaitingTarget = { type: this.hasSkill(card, 'boom') ? 'boom' : 'bounce', sourcePlayer: 1, cardData: card };
                await this.resolveDiscardEffect(targetF);
            } else { await this.checkTurnEnd(); }
        }
    },

    checkTurnEnd: async function() {
        if (this.state.hands[0].length === 0 && this.state.hands[1].length === 0) { 
            await this.resolveRound(); 
            return; 
        }
        const nextTurn = 1 - this.state.turn;
        if (this.state.hands[nextTurn].length > 0) {
            this.state.turn = nextTurn;
            this.state.isProcessing = false;
            this.renderGame();
            if (this.state.turn === 1) this.aiTurn();
        } else {
             this.log(`${nextTurn===0?'我方':'敌方'} 手牌耗尽，轮到下一方执行。`, "text-zinc-400 italic");
             this.state.isProcessing = false;
             this.renderGame();
             if (this.state.turn === 1) setTimeout(() => this.aiTurn(), 600);
        }
    },

    calculateStackScore: function(fieldIdx) {
        const stack = this.state.fields[fieldIdx];
        if (!stack || stack.length === 0) return { player: 0, ai: 0 };
        const top = stack[stack.length - 1];
        let pScore = 0; let aScore = 0;
        stack.forEach(c => {
            let val = 1;
            if (this.hasSkill(c, 'add1')) val += 1;
            if (this.hasSkill(c, 'add2')) val += 2;
            if (this.hasSkill(c, 'add3')) val += 3;
            if (c.owner === 0) pScore += val; else aScore += val;
        });
        if (this.hasSkill(top, 'double')) { if (top.owner === 0) pScore *= 2; else aScore *= 2; }
        return { player: pScore, ai: aScore };
    },

    // --- ROUND RESOLUTION ---
    resolveRound: async function() {
        this.state.isProcessing = true;
        this.state.mode = 'scoring';
        this.state.scoringState = { totalP: 0, totalA: 0, activeField: -1, finished: false };
        this.log("结算开始，正在统计各区域点数...", "text-amber-500");
        this.renderGame();
        
        for(let i=0; i<3; i++) {
            this.state.scoringState.activeField = i;
            this.renderGame();
            const stack = this.state.fields[i];
            if (stack.length > 0) await new Promise(r => setTimeout(r, 200));
            else await new Promise(r => setTimeout(r, 100));
            
            for(const c of stack) {
                const elId = `small-card-${c.id}`;
                const el = document.getElementById(elId);
                if(el) {
                    el.scrollIntoView({behavior: "smooth", block: "center"});
                    el.classList.add('ring-4', 'ring-white', 'z-50', 'scale-110');
                }
                await new Promise(r => setTimeout(r, 150)); 
                let val = 1;
                if (this.hasSkill(c, 'add1')) val += 1;
                if (this.hasSkill(c, 'add2')) val += 2;
                if (this.hasSkill(c, 'add3')) val += 3;
                if (this.showFloatingScore && el) {
                    const color = c.owner === 0 ? '#22c55e' : '#f43f5e';
                    this.showFloatingScore(el, `+${val}`, color);
                }
                if (c.owner === 0) this.state.scoringState.totalP += val;
                else this.state.scoringState.totalA += val;
                this.renderGame(); 
                if(el) el.classList.remove('ring-4', 'ring-white', 'z-50', 'scale-110');
                await new Promise(r => setTimeout(r, 100));
            }
            const top = stack[stack.length-1];
            if(top && this.hasSkill(top, 'double')) {
                 this.log("区域效果 [鼓舞] 触发：点数翻倍。");
                 let stackP = 0, stackA = 0;
                 stack.forEach(c => {
                    let v = 1;
                    if (this.hasSkill(c, 'add1')) v += 1;
                    if (this.hasSkill(c, 'add2')) v += 2;
                    if (this.hasSkill(c, 'add3')) v += 3;
                    if(c.owner === 0) stackP += v; else stackA += v;
                 });
                 const el = document.getElementById(`small-card-${top.id}`);
                 if(el) {
                     el.classList.add('animate-bounce');
                     if(this.showFloatingScore) {
                         const val = top.owner === 0 ? stackP : stackA;
                         this.showFloatingScore(el, `x2 (+${val})`, '#facc15'); 
                     }
                 }
                 await new Promise(r => setTimeout(r, 300));
                 if(top.owner === 0) this.state.scoringState.totalP += stackP;
                 else this.state.scoringState.totalA += stackA;
                 this.renderGame();
            }
        }
        this.state.scoringState.activeField = -1;
        this.state.scoringState.finished = true;
        this.renderGame();
    },
    
    confirmRoundEnd: function() {
        const { totalP, totalA } = this.state.scoringState;
        this.log(`最终得分统计: ${totalP} vs ${totalA}`);
        if (totalP > totalA) {
            this.state.ippon[0]++;
            this.log("我方获取该局优胜。", "text-sky-500 font-bold");
        } else if (totalA > totalP) {
            this.state.ippon[1]++;
            this.log("对手获取该局优胜。", "text-red-500 font-bold");
        } else { this.log("双方平局。"); }

        if (this.state.ippon[0] >= this.CONST.WIN_IPPON) {
            this.handleBattleWin();
        } else if (this.state.ippon[1] >= this.CONST.WIN_IPPON) {
            this.handleBattleLoss();
        } else {
             for(let p=0; p<2; p++) {
                 this.state.hands[p].forEach(c => this.sendToDiscard(c, p));
                 this.state.hands[p] = [];
             }
             for(let f=0; f<3; f++) {
                 this.state.fields[f].forEach(c => this.sendToDiscard(c, c.owner));
                 this.state.fields[f] = [];
             }
             this.drawCards(0, 5);
             this.drawCards(1, 5);
             this.state.turn = 0; 
             this.state.isProcessing = false;
             this.state.mode = 'battle';
             this.state.scoringState = null; 
             this.log("进入下一局对决，请准备。");
             this.renderGame();
        }
    },

    // --- GAME LOOP & REWARDS ---
    handleBattleWin: function() {
        this.log("对决全胜！取得最终胜利。", "text-amber-500 font-black");
        if (this.state.gameMode === 'classic') {
            this.state.mode = 'map'; 
            this.renderGame();
            return;
        }
        this.state.gold += (50 + this.state.level * 10);
        this.state.rewardGroups = this.generateRewardGroups();
        this.state.mode = 'reward';
        this.renderGame();
    },

    handleBattleLoss: function() {
        alert("战斗结束。虽然这次失利了，但累积了宝贵的经验。再试一次吧？");
        this.initGame();
    },

    selectRewardGroup: function(groupIndex) {
        if (groupIndex >= 0 && groupIndex < this.state.rewardGroups.length) {
            const group = this.state.rewardGroups[groupIndex];
            group.forEach(card => this.state.playerDeck.push(card));
        }
        this.proceedToNextStage();
    },

    skipReward: function() {
        this.proceedToNextStage();
    },

    proceedToNextStage: function() {
        this.state.level++;
        if (this.state.level > this.state.maxLevel) {
            alert("恭喜通关！你已经征服了所有挑战。");
            this.initGame();
            return;
        }
        if (Math.random() < 0.3) {
            this.state.mode = 'event';
            const type = Math.random() < 0.6 ? 'shop' : 'blacksmith';
            this.state.eventData = { type: type, removalMode: false, selectedIdx: null };
        } else {
            this.state.mode = 'map';
        }
        this.renderGame();
    },

    // --- SHOP & EVENTS ---
    buyCardPack: function() {
        if (this.state.gold >= 50) {
            this.state.gold -= 50;
            const newCards = this.generateRewardGroups()[0]; 
            newCards.forEach(c => this.state.playerDeck.push(c));
            alert(`交换成功：牌库中加入了 ${newCards.length} 张新卡牌。`);
            this.renderGame();
        } else { alert("持有的金币不足以完成交换。"); }
    },
    buyRemoval: function(idx) {
        if (this.state.gold >= 100) {
            this.state.gold -= 100;
            this.state.playerDeck.splice(idx, 1);
            this.state.eventData.removalMode = false; 
            this.renderGame();
        } else { alert("持有的金币不足。"); }
    },
    toggleRemovalMode: function() {
        this.state.eventData.removalMode = !this.state.eventData.removalMode;
        this.renderGame();
    },
    resolveEvent: function() {
         const { type, selectedIdx } = this.state.eventData;
         if (type === 'blacksmith' && selectedIdx !== null) {
            const card = this.state.playerDeck[selectedIdx];
            card.number = Math.min(card.number + 1, 9); 
            if (card.skills.length < 3) {
                 const keys = Object.keys(this.CONST.SKILLS);
                 const newSkill = keys[Math.floor(Math.random() * keys.length)];
                 if (!card.skills.includes(newSkill)) card.skills.push(newSkill);
            }
        }
        this.state.mode = 'map';
        this.renderGame();
    },

    // --- INTERACTIONS ---
    handleDiscardAction: function() {
        if (this.state.turn !== 0 || this.state.isProcessing) return;
        const indices = this.state.selectedCardIndices;
        if (indices.length === 0) return;
        const trainCards = indices.filter(idx => this.hasSkill(this.state.hands[0][idx], 'train'));
        if (trainCards.length > 0) { this.state.trainingPending = { type: 'discard', indices: indices }; this.renderGame(); return; }
        if (indices.length > 2) { this.state.discardConfirmOpen = true; this.renderGame(); return; }
        this.executeDiscard();
    },
    confirmDiscard: function() { this.state.discardConfirmOpen = false; this.executeDiscard(); },
    cancelDiscard: function() { this.state.discardConfirmOpen = false; this.renderGame(); },
    handleTrainChoice: function(val) {
        if (!this.state.trainingPending) return;
        const { type, indices, targetField } = this.state.trainingPending;
        indices.forEach(idx => this.applyTraining(0, idx, val));
        this.state.trainingPending = null;
        if (type === 'play') this.playCard(0, indices[0], targetField); else this.executeDiscard();
    },
    applyTraining: function(playerId, cardIdx, diff) {
        const hand = this.state.hands[playerId];
        const targets = [];
        if (cardIdx > 0) targets.push(hand[cardIdx - 1]);
        if (cardIdx < hand.length - 1) targets.push(hand[cardIdx + 1]);
        targets.forEach(c => {
            let newVal = c.number + diff;
            if (newVal < 0) newVal = 0; if (newVal > 8) newVal = 8;
            c.number = newVal;
        });
        this.log(`[特训] 成功：相邻手牌点数已调整。`);
    },
    selectCard: function(idx) {
        if (this.state.isProcessing) return;
        const pos = this.state.selectedCardIndices.indexOf(idx);
        if (pos >= 0) this.state.selectedCardIndices.splice(pos, 1); else this.state.selectedCardIndices.push(idx);
        this.renderGame();
    },
    
    viewPile: function(type, owner = 0) {
        this.state.pileViewMode = { type: type, owner: owner };
        this.renderGame();
    },
    
    closeModal: function() {
        this.state.pileViewMode = null;
        this.state.discardConfirmOpen = false;
        this.state.trainingPending = null;
        this.renderGame();
    },
    
    log: function(msg, colorClass = "text-zinc-400") {
        this.state.log.push({ text: msg, color: colorClass });
        if (this.state.log.length > 50) this.state.log.shift();
        const logEl = document.getElementById('game-log-content');
        if (logEl) {
            logEl.innerHTML = this.state.log.map(l => `<div class="text-xs ${l.color} mb-1 border-b border-white/5 pb-1">${l.text}</div>`).join('');
            logEl.scrollTop = logEl.scrollHeight;
        }
    },
    mount: function() { if(window.lucide) window.lucide.createIcons(); }
});

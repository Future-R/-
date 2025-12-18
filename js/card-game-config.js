
// --- CARD GAME CONFIG ---
window.App = window.App || {};
window.App.pages = window.App.pages || {};
window.App.pages.cardGame = window.App.pages.cardGame || {};

window.App.pages.cardGame.CONST = {
    COLORS: { 0: 'bg-red-600', 1: 'bg-amber-400', 2: 'bg-sky-600' },
    COLOR_BORDERS: { 0: 'border-red-600', 1: 'border-amber-400', 2: 'border-sky-600' },
    COLOR_TEXT: { 0: 'text-red-600', 1: 'text-amber-600', 2: 'text-sky-600' },
    COLOR_NAMES: { 0: '力量', 1: '勇气', 2: '智慧' }, 
    COLOR_ICONS: { 0: 'hand-fist', 1: 'crown', 2: 'lightbulb' }, 
    
    CHARACTERS: {
        'dog': { name: '智慧小狗', icon: 'dog', desc: '红黄蓝全色均衡牌组 (1-7 各1张)', color: 'text-amber-500' },
        'cat': { name: '优雅小猫', icon: 'cat', desc: '纯蓝牌组 (1-7 各2张)，自带[染色]与[变色]技能', color: 'text-sky-500' }
    },

    SKILLS: {
        'add1': { name: '磨刀', short: '+1', desc: '结算时分数+1', type: 'score' },
        'add2': { name: '重击', short: '+2', desc: '结算时分数+2', type: 'score' },
        'add3': { name: '必杀', short: '+3', desc: '结算时分数+3', type: 'score' },
        'min': { name: '最小', short: '0', desc: '比点大小时视为 0', type: 'value' },
        'max': { name: '最大', short: '8', desc: '比点大小时视为 8', type: 'value' },
        'discolor': { name: '变阵', short: '变', desc: '可打入任意颜色列。打出后变为该列颜色', type: 'play' },
        'dye': { name: '领域', short: '染', desc: '可打入任意列。此牌在场时，该列视为此牌颜色', type: 'field' },
        'bounce': { name: '击退', short: '弹', desc: '弃置时：选择一个堆叠，将顶牌退回持有者牌库', type: 'discard_target' },
        'boom': { name: '爆裂', short: '炸', desc: '弃置时：选择一个堆叠，破坏所有牌', type: 'discard_target' },
        'handover': { name: '接力', short: '交', desc: '此牌在顶端时，己方出牌无视大小', type: 'field' },
        'domineer': { name: '霸气', short: '霸', desc: '出牌时无视大小限制', type: 'play' },
        'lock': { name: '威慑', short: '锁', desc: '此牌在顶端时，对手只能使用同色手牌', type: 'field' },
        'replace': { name: '背刺', short: '换', desc: '打出时破坏顶端牌。可对同点数打出', type: 'play' },
        'double': { name: '鼓舞', short: '翻', desc: '此牌在顶端时，己方此列分数 x2', type: 'score' },
        'hammer': { name: '整备', short: '锤', desc: '弃置时：重洗手牌并抽取同数量', type: 'discard_self' },
        'copy': { name: '模仿', short: '复', desc: '打出时：此牌词条变为下方牌的词条', type: 'play' },
        'guard': { name: '格挡', short: '盾', desc: '此牌在场时，此列卡牌无法被破坏', type: 'field' },
        'reverse': { name: '逆转', short: '逆', desc: '此牌在场时，全局比点规则颠倒(小吃大)', type: 'field' },
        'continue': { name: '补给', short: '续', desc: '打出时：双方各抽1张牌', type: 'play' },
        'rush': { name: '连斩', short: '速', desc: '打出时：随机打出一张可出的手牌', type: 'play' },
        'train': { name: '特训', short: '训', desc: '打出或弃置时：相邻手牌点数 +1 或 -1', type: 'play_discard' },
        'control': { name: '魅惑', short: '控', desc: '若下方两张牌点数依次小1和小2，获得其控制权', type: 'play' },
    },
    
    ENEMIES: [
        { name: '绿毛虫', icon: 'bug', color: 'text-green-500', bg: 'bg-green-100', deckConfig: { colors: [0, 1, 2], nums: [1, 2, 3, 4], copies: 2 } },
        { name: '小拉达', icon: 'rat', color: 'text-purple-500', bg: 'bg-purple-100', deckConfig: { colors: [0, 1, 2], nums: [1, 2, 3, 4, 5], copies: 2 } },
        { name: '波波', icon: 'bird', color: 'text-amber-600', bg: 'bg-amber-100', deckConfig: { colors: [0, 1, 2], nums: [2, 3, 4, 5, 6], copies: 2 } },
        { name: '皮皮', icon: 'moon', color: 'text-pink-400', bg: 'bg-pink-100', deckConfig: { colors: [0, 1, 2], nums: [1, 3, 5, 7], copies: 3 } },
        { name: '喵喵', icon: 'cat', color: 'text-yellow-600', bg: 'bg-yellow-100', deckConfig: { colors: [0, 1, 2], nums: [1, 2, 4, 6, 8], copies: 2 } },
        { name: '鲤鱼王', icon: 'fish', color: 'text-red-500', bg: 'bg-red-100', deckConfig: { colors: [2], nums: [1, 2, 3], copies: 8 } },
        { name: '卡比兽', icon: 'bed', color: 'text-blue-800', bg: 'bg-blue-100', deckConfig: { colors: [0, 1, 2], nums: [6, 7, 8], copies: 4 } },
        { name: '耿鬼', icon: 'ghost', color: 'text-purple-700', bg: 'bg-purple-200', deckConfig: { colors: [0, 1, 2], nums: [4, 5, 6, 7, 8], copies: 2 } },
        { name: '超梦', icon: 'zap', color: 'text-fuchsia-600', bg: 'bg-fuchsia-100', deckConfig: { colors: [0, 1, 2], nums: [1, 2, 3, 4, 5, 6, 7, 8], copies: 2 } },
    ],
    MAX_HAND: 6,
    WIN_IPPON: 2
};

window.App.pages.dashboard = {
    render: function() {
        // Data Definitions
        const internalTools = [
            { id: 'counter', name: '手动计数器', desc: '精密增量统计设备。', path: 'counter', icon: 'mouse-pointer-2', status: 'active' },
            { id: 'anime-namer', name: '二次元起名器', desc: '二次元味儿超冲随机起名。', path: 'anime-namer', icon: 'sparkles', status: 'active' },
            { id: 'text-map', name: '文字地图编辑器', desc: '基于字符的复古地图绘制系统。', path: 'text-map', icon: 'map', status: 'active' },
            { id: 'calc', name: '计算模组', desc: '基础算术运算单元。', path: 'calc', icon: 'calculator', status: 'coming_soon' },
            { id: 'timer', name: '计时单元', desc: '时间测量系统。', path: 'timer', icon: 'clock', status: 'coming_soon' },
            { id: 'notes', name: '数据日志', desc: '个人思维存储库。', path: 'notes', icon: 'database', status: 'coming_soon' }
        ];

        const externalTools = [
            { id: 'diff-checker', name: '文本差异对比', desc: 'diffchecker.com', path: 'https://www.diffchecker.com/zh-Hans/', icon: 'file-diff', status: 'active', isExternal: true },
            { id: 'sauce-nao', name: '以图搜图', desc: 'saucenao.com', path: 'https://saucenao.com/', icon: 'image', status: 'active', isExternal: true },
            { id: 'regex-online', name: '正则表达式在线', desc: 'jyshare.com', path: 'https://www.jyshare.com/front-end/854/', icon: 'code', status: 'active', isExternal: true }
        ];

        const renderCard = (tool, variant) => {
            const isActive = tool.status === 'active';
            const internalStyles = `bg-gradient-to-br from-white to-[#f2f2f0] border-[3px] border-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05),inset_0_-2px_4px_rgba(0,0,0,0.05)] hover:translate-y-[-4px] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] text-zinc-800`;
            const externalStyles = `bg-gradient-to-br from-slate-100 to-slate-200 border-[3px] border-slate-50 shadow-[4px_4px_0px_rgba(100,116,139,0.2)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(100,116,139,0.2)] text-slate-700`;
            const disabledStyles = `bg-zinc-100 border-2 border-dashed border-zinc-300 opacity-60 cursor-not-allowed`;
            
            const styles = isActive ? (variant === 'internal' ? internalStyles : externalStyles) : disabledStyles;
            
            // Onclick handler
            let onclick = "";
            if (isActive) {
                onclick = tool.isExternal 
                    ? `window.open('${tool.path}', '_blank', 'noopener,noreferrer')`
                    : `window.App.Router.navigate('${tool.path}')`;
            }

            const iconBg = isActive 
                ? (variant === 'internal' ? 'bg-amber-100 text-amber-600 shadow-inner group-hover:bg-amber-400 group-hover:text-white' : 'bg-white text-sky-600 shadow-sm group-hover:text-sky-700')
                : 'bg-zinc-200 text-zinc-400';

            const indicator = isActive ? `
                <div class="bg-white/50 backdrop-blur rounded-full p-1.5 border border-white/50">
                   ${tool.isExternal 
                       ? '<i data-lucide="external-link" class="w-4 h-4 text-slate-400"></i>' 
                       : '<i data-lucide="arrow-right" class="w-4 h-4 text-amber-400 -rotate-45 group-hover:rotate-0 transition-transform"></i>'}
                </div>` : '';

            const internalShine = (variant === 'internal' && isActive) ? 
                `<div class="absolute top-0 right-0 w-[150%] h-full bg-gradient-to-l from-white/60 to-transparent skew-x-12 translate-x-full group-hover:translate-x-[-20%] transition-transform duration-700 pointer-events-none"></div>` : '';

            return `
            <button onclick="${onclick}" ${!isActive ? 'disabled' : ''} class="relative group overflow-hidden rounded-[2rem] p-6 text-left transition-all duration-300 w-full flex flex-col h-full min-h-[180px] ${styles}">
                ${internalShine}
                <div class="relative z-10 flex flex-col h-full justify-between">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-3.5 rounded-2xl transition-all duration-300 ${iconBg}">
                            <i data-lucide="${tool.icon}" class="w-8 h-8"></i>
                        </div>
                        ${indicator}
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-zinc-800 tracking-tight leading-none mb-2">${tool.name}</h3>
                        <p class="text-sm font-medium leading-relaxed opacity-70">${tool.description}</p>
                    </div>
                </div>
                ${isActive ? `<div class="absolute bottom-0 left-0 w-full h-1.5 ${variant === 'internal' ? 'bg-amber-400' : 'bg-sky-400'} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>` : ''}
            </button>
            `;
        };

        const activeInternal = internalTools.filter(t => t.status === 'active').map(t => renderCard(t, 'internal')).join('');
        const activeExternal = externalTools.filter(t => t.status === 'active').map(t => renderCard(t, 'external')).join('');

        return `
        <div class="flex flex-col gap-12 fade-in pb-12">
            <section>
                <div class="flex items-center gap-4 mb-6 border-b-2 border-zinc-300 pb-4">
                    <h2 class="text-2xl font-black text-zinc-800 tracking-tight">核心工具</h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    ${activeInternal}
                </div>
            </section>
            <section>
                <div class="flex items-center gap-4 mb-6 border-b-2 border-zinc-300 pb-4">
                    <h2 class="text-2xl font-black text-zinc-800 tracking-tight">外部工具</h2>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    ${activeExternal}
                </div>
            </section>
        </div>
        `;
    }
};

// --- DASHBOARD (City Pop Cassette Style) ---
window.App = window.App || {};
window.App.pages = window.App.pages || {};

window.App.pages.dashboard = {
    handleKey: function(e) {},
    render: function() {
        const tools = window.App.config.tools || [];

        const renderCard = (tool) => {
            const isExt = tool.type === 'external';
            const onclick = isExt 
                    ? `window.open('${tool.path}', '_blank', 'noopener,noreferrer')`
                    : `window.App.Router.navigate('${tool.path}')`;
            
            return `
            <div onclick="${onclick}" class="cassette-card cursor-pointer group">
                <!-- Deco Dots -->
                <div class="deco-dot top-1.5 left-1.5"></div>
                <div class="deco-dot top-1.5 right-1.5"></div>
                <div class="deco-dot bottom-1.5 left-1.5"></div>
                <div class="deco-dot bottom-1.5 right-1.5"></div>
                
                <!-- Main Label -->
                <div class="cassette-label ${tool.labelClass}">
                    <div class="cassette-icon-float">
                        <i data-lucide="${tool.icon}" class="w-5 h-5 text-white drop-shadow-sm"></i>
                    </div>
                    
                    <!-- Title (Top) -->
                    <div class="flex flex-col mt-1">
                        <h3 class="font-black text-xl leading-tight tracking-tight text-white drop-shadow-sm">${tool.name}</h3>
                    </div>
                    
                    <!-- Window / Reels (CENTERED) -->
                    <div class="cassette-window">
                        <div class="cassette-spool">
                            <div class="cassette-spool-teeth"></div>
                        </div>
                        <div class="h-4 flex-1 mx-2 bg-zinc-800 rounded-sm border border-white/20 relative overflow-hidden shadow-inner">
                                <div class="absolute inset-0 bg-black/60"></div>
                                <div class="absolute top-1/2 left-0 w-full h-[2px] bg-white/20"></div>
                        </div>
                        <div class="cassette-spool">
                            <div class="cassette-spool-teeth"></div>
                        </div>
                    </div>

                    <!-- Desc (Bottom) -->
                    <div class="text-xs font-bold text-white/90 drop-shadow-sm self-end mb-1">${tool.desc}</div>
                </div>

                <!-- Bottom Tape Area -->
                <div class="cassette-bottom"></div>
            </div>
            `;
        };

        return `
        <div class="flex flex-col gap-10 fade-in pb-12">
            <section>
                <div class="flex items-center gap-3 mb-6">
                    <h2 class="text-lg font-black text-zinc-500 tracking-widest">核心工具</h2>
                    <div class="h-[1px] flex-1 bg-zinc-300"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${tools.filter(t => t.type === 'internal').map(renderCard).join('')}
                </div>
            </section>
            <section>
                <div class="flex items-center gap-3 mb-6">
                    <h2 class="text-lg font-black text-zinc-500 tracking-widest">外部工具</h2>
                    <div class="h-[1px] flex-1 bg-zinc-300"></div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${tools.filter(t => t.type === 'external').map(renderCard).join('')}
                </div>
            </section>
        </div>
        `;
    }
};

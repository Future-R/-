// Future Toolkit Core
// Merges App, Layout, and Router to prevent loading race conditions

window.App = {
    pages: {},
    state: {},
    
    init: function() {
        console.log("Future Toolkit Initializing...");
        this.Router.init();
        this.Router.handleRoute();
    }
};

// --- ROUTER ---
window.App.Router = {
    routes: {
        '': 'dashboard',
        'counter': 'counter',
        'anime-namer': 'animeNamer',
        'text-map': 'textMapEditor'
    },

    init: function() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('popstate', () => this.handleRoute());
    },

    handleRoute: function() {
        const hash = window.location.hash.slice(1) || '';
        const cleanHash = hash.replace(/\/$/, "");
        
        const pageName = this.routes[cleanHash] || 'dashboard';
        const pageModule = window.App.pages[pageName];

        const appContainer = document.getElementById('app');
        
        // Render Layout
        appContainer.innerHTML = window.App.Layout.render(cleanHash);

        // Mount Page
        const mainContent = document.getElementById('main-content');
        if (pageModule && mainContent) {
            try {
                mainContent.innerHTML = pageModule.render();
                if (pageModule.mount) {
                    pageModule.mount(mainContent);
                }
            } catch (e) {
                console.error("Error rendering page:", e);
                mainContent.innerHTML = `<div class="text-red-500 p-8">Module Error: ${e.message}</div>`;
            }
        } else {
            if (mainContent) mainContent.innerHTML = `<div class="text-center p-10 opacity-50 font-mono">404 - Module Not Found</div>`;
        }

        // Refresh Icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        window.scrollTo(0,0);
    },

    navigate: function(path) {
        window.location.hash = path;
    }
};

// --- LAYOUT ---
window.App.Layout = {
    render: function(currentPath) {
        const isHome = currentPath === '' || currentPath === '/';
        
        const backButton = !isHome ? `
            <button onclick="window.App.Router.navigate('')"
                class="relative z-10 flex items-center gap-2 px-6 py-2.5 
                  bg-[#e8e8e3] hover:bg-white 
                  rounded-full 
                  shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bebebe,-2px_-2px_4px_#ffffff]
                  text-zinc-600 hover:text-sky-600 font-bold uppercase tracking-wider text-sm
                  transition-all duration-200 active:scale-95
                  border border-[#d4d4d0]">
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
                <span>返回</span>
            </button>
        ` : '';

        const versionBadge = isHome ? `
            <div class="hidden md:flex items-center gap-2 mr-4 opacity-30">
                 <i data-lucide="radio" class="w-6 h-6"></i>
                 <span class="font-mono text-xs">V.1.0.4 // 在线</span>
            </div>
        ` : '';

        return `
        <!-- Background Atmosphere -->
        <div class="fixed inset-0 pointer-events-none z-0">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#f0f0eb_0%,#dcdcd9_100%)]"></div>
            <div class="absolute top-[-20%] left-[-10%] w-[60vh] h-[60vh] bg-sky-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
            <div class="absolute bottom-[-10%] right-[-5%] w-[50vh] h-[50vh] bg-amber-200/40 rounded-full blur-[80px] mix-blend-multiply"></div>
        </div>

        <!-- Header -->
        <header class="relative z-20 w-full pt-6 px-6">
            <div class="max-w-7xl mx-auto">
                <div class="bg-gradient-to-b from-white to-[#f0f0eb] rounded-[2rem] shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] border border-[#d4d4d0] p-4 flex items-center justify-between relative overflow-hidden">
                    <!-- Chrome Shine -->
                    <div class="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none"></div>

                    <div class="flex items-center gap-4 group cursor-pointer relative z-10" onclick="window.App.Router.navigate('')">
                        <div class="relative">
                            <div class="absolute inset-0 bg-amber-400 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-300 border-[3px] border-white shadow-[0_4px_6px_rgba(0,0,0,0.1),inset_0_-4px_4px_rgba(0,0,0,0.1)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                <i data-lucide="atom" class="w-8 h-8 text-sky-600 animate-spin-slow"></i>
                            </div>
                        </div>
                        <div class="flex flex-col">
                            <h1 class="text-2xl font-black tracking-widest uppercase text-zinc-800 drop-shadow-sm">
                                未来的<span class="text-sky-600">工具箱</span>
                            </h1>
                            <div class="flex gap-1 mt-1">
                                <div class="h-1.5 w-8 bg-amber-400 rounded-full"></div>
                                <div class="h-1.5 w-4 bg-sky-400 rounded-full"></div>
                                <div class="h-1.5 w-2 bg-red-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    ${backButton}
                    ${versionBadge}
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main id="main-content" class="relative z-10 flex-1 w-full max-w-7xl mx-auto p-6 flex flex-col">
            <!-- Dynamic Content Here -->
        </main>

        <!-- Footer -->
        <footer class="relative z-10 w-full py-8 text-center mt-auto">
            <div class="max-w-md mx-auto relative">
                <div class="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-300 -z-10"></div>
                <div class="bg-[#dcdcd9] inline-block px-4">
                    <div class="flex flex-col items-center gap-2">
                        <a href="https://github.com/Future-R" target="_blank" rel="noopener noreferrer"
                           class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-200 hover:bg-sky-600 hover:text-white transition-all duration-300 shadow-lg">
                            <i data-lucide="github" class="w-4 h-4"></i>
                            <span class="text-xs font-bold tracking-widest">FUTURE-R</span>
                        </a>
                        <p class="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2">
                            未来科技 © 2025
                        </p>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }
};
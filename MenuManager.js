// MenuManager.js - メニュー表示切替とモード管理

export function toggleMode() {
    if (this.mode === 'measure') {
        this.setAdjustMode();
    } else {
        this.setMeasureMode();
    }
}

export function setMeasureMode() {
    this.mode = 'measure';
    this.updateModeButton();
    this.updateStatusBar();
    // 測定モードに切り替えたら拡大鏡を表示
    if (this.baseImage) {
        this.magnifier.classList.add('show');
    }
    this.redraw();
}

export function setAdjustMode() {
    this.mode = 'adjust';
    this.updateModeButton();
    this.updateStatusBar();
    // 移動モードに切り替えたら拡大鏡を非表示
    this.magnifier.classList.remove('show');
    this.redraw();
}

export function updateModeButton() {
    const btn = document.getElementById('top-mode-button');
    if (!btn) return;
    
    // アイコンは常にメジャー、色は変更しない
    btn.innerHTML = '<span class="icon">straighten</span>';
    
    if (this.mode === 'measure') {
        btn.classList.remove('mode-adjust');
        btn.classList.add('mode-measure');
        btn.title = '測定モード';
    } else {
        btn.classList.remove('mode-measure');
        btn.classList.add('mode-adjust');
        btn.title = '移動モード';
    }
}

export function toggleTestMode() {
    this.testMode = !this.testMode;
    const testModeBtn = document.getElementById('test-mode-btn');
    if (testModeBtn) {
        if (this.testMode) {
            testModeBtn.classList.add('active');
            console.log('テストモード: ON');
        } else {
            testModeBtn.classList.remove('active');
            console.log('テストモード: OFF');
        }
    }
    
    // フレームとテクスチャリストをクリア（再読み込みを促す）
    this.availableFrames = [];
    this.availableTextures = [];
}

export function updateMenuDisplay() {
    const width = window.innerWidth;
    const toggleBtn = document.getElementById('menu-page-toggle-btn');
    
    if (width <= 700) {
        // 700px以下：ページネーション表示
        const page1Buttons = [
            document.getElementById('open-face-btn'),
            document.getElementById('top-mode-button'),
            document.getElementById('open-frame-btn'),
            document.getElementById('texture-btn'),
            document.getElementById('color-window-btn')
        ];
        
        const page2Buttons = [
            document.getElementById('reload-frame-btn'),
            document.getElementById('test-mode-btn'),
            document.getElementById('export-text-btn'),
            document.getElementById('info-window-btn'),
            document.getElementById('save-image-btn'),
            document.getElementById('fullscreen-btn')
        ];
        
        // 全てのボタンを非表示
        [...page1Buttons, ...page2Buttons].forEach(btn => {
            if (btn) btn.classList.remove('page-visible');
        });
        
        // 現在のページのボタンのみ表示
        const currentButtons = this.menuPage === 0 ? page1Buttons : page2Buttons;
        currentButtons.forEach(btn => {
            if (btn) btn.classList.add('page-visible');
        });
        
        // トグルボタン表示とmargin-left制御
        if (toggleBtn) {
            toggleBtn.style.display = 'flex';
            // ページ1: margin-left: auto、ページ2: margin-leftなし
            toggleBtn.style.marginLeft = this.menuPage === 0 ? 'auto' : 'auto';
        }
    } else {
        // 700px超：全表示、ページネーション非表示
        const buttons = document.querySelectorAll('.chevron-button, .menu-toggle');
        buttons.forEach(btn => btn.classList.add('page-visible'));
        
        if (toggleBtn) toggleBtn.style.display = 'none';
    }
}

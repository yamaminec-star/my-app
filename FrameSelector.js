// FrameSelector.js - フレーム選択UI管理

export async function openFrameSelector() {
    const modal = document.getElementById('frame-selector-modal');
    modal.style.display = 'flex';
    
    if (this.availableFrames.length === 0) {
        await this.loadFrameList();
    }
    
    this.setupFrameFilters();
    this.updateFrameFilters();
    
    // フィルター表示状態を復元
    const filterDiv = document.getElementById('frame-filters');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    const icon = toggleBtn.querySelector('.icon');
    
    if (this.filterVisible) {
        filterDiv.classList.add('show');
        icon.textContent = 'expand_less';
    } else {
        filterDiv.classList.remove('show');
        icon.textContent = 'expand_more';
    }
    
    // 列数ボタンのactiveクラスを設定
    document.querySelectorAll('.column-selector button').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === this.gridColumns) {
            btn.classList.add('active');
        }
    });
    
    // グリッドレイアウトを更新（画像サイズ計算）
    setTimeout(() => this.updateGridLayout(), 100);
}

export function closeFrameSelector() {
    const modal = document.getElementById('frame-selector-modal');
    modal.style.display = 'none';
}

export function toggleFrameFilter() {
    this.filterVisible = !this.filterVisible;
    const filterDiv = document.getElementById('frame-filters');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    const icon = toggleBtn.querySelector('.icon');
    
    if (this.filterVisible) {
        filterDiv.classList.add('show');
        icon.textContent = 'expand_less';
    } else {
        filterDiv.classList.remove('show');
        icon.textContent = 'expand_more';
    }
}

export async function forceReloadFrameList() {
    try {
        // キャッシュをクリアして最新データを取得
        const response = await fetch('./frames/frame-list.json', {
            cache: 'no-cache'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // データを強制更新
        this.availableFrames = data.frames || data;
        console.log(`フレームリスト更新: ${this.availableFrames.length}個のフレームを読み込みました`);
        
        // フィルターもリセット
        this.filteredFrames = [...this.availableFrames];
        
    } catch (error) {
        console.error('フレームリストの更新に失敗:', error);
        throw error;
    }
}

export async function loadFrameList() {
    // テストモードの場合はダミーデータを使用
    if (this.testMode) {
        const dummyFrames = this.generateDummyFrames();
        this.availableFrames = dummyFrames;
        this.filteredFrames = [...this.availableFrames];
        console.log(`テストモード: ${this.availableFrames.length}個のダミーフレームを生成しました`);
        return;
    }
    
    try {
        const response = await fetch('./frames/frame-list.json', {
            cache: 'no-cache'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.availableFrames = data.frames || data;
        console.log(`${this.availableFrames.length}個のフレームを読み込みました`);
        
        // 初期状態で全フレームを表示（フィルターなし）
        this.filteredFrames = [...this.availableFrames];
        
    } catch (error) {
        console.error('フレームリストの読み込みに失敗:', error);
        this.availableFrames = [];
        this.filteredFrames = [];
        const grid = document.getElementById('frame-grid');
        if (grid) {
            grid.innerHTML = '<div class="loading">フレームリストの読み込みに失敗しました</div>';
        }
    }
}

export function setupFrameFilters() {
    // シリーズ名を抽出
    const seriesSet = new Set();

    this.availableFrames.forEach(frame => {
        const filename = typeof frame === 'string' ? frame : frame.filename;
        const parsed = this.parseFrameFilename(filename);
        if (parsed) {
            seriesSet.add(parsed.series);
        }
    });

    // フィルターUIを作成
    this.createFilterUI('series-filters', Array.from(seriesSet).sort());
    this.setupRangeSliders();
    
    // グリッドサイズを更新
    this.updateGridLayout();
}


export function parseFrameFilename(filename) {
    const match = filename.match(/(.+?)(\d{3})_PD(\d+)_OW(\d+)(?:_v[\d\.]+|_\d{8}|_build\d+|_rev\d+)*\.png/);

    if (match) {
        return {
            series: match[1] + match[2],
            number: match[2],
            pd: parseInt(match[3]),
            ow: parseInt(match[4])
        };
    }
    return null;
}


export function renderFrameGrid() {
    const grid = document.getElementById('frame-grid');
    if (!grid) return;

    if (this.filteredFrames.length === 0) {
        grid.innerHTML = '<div class="loading">条件に一致するフレームが見つかりません</div>';
        return;
    }

    grid.innerHTML = '';
    this.filteredFrames.forEach(frame => {
        const filename = typeof frame === 'string' ? frame : frame.filename;
        const frameItem = this.createFrameItem(filename);
        grid.appendChild(frameItem);
    });
}


export function createFrameItem(filename) {
    const item = document.createElement('div');
    item.className = 'frame-item';

    const img = document.createElement('img');
    
    // テストモードの場合はダミーデータを使用
    if (this.testMode) {
        const frame = this.availableFrames.find(f => f.filename === filename);
        if (frame && frame.data) {
            img.src = frame.data;
        }
    } else {
        img.src = `./frames/${filename}`;
    }
    
    img.alt = filename;
    // サイズはupdateAllFrameItemSizesで設定される
    img.onerror = () => {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pgo8L3N2Zz4K';
    };

    const name = document.createElement('div');
    name.className = 'frame-item-name';
    name.textContent = this.filenameToDisplayName(filename);

    item.appendChild(img);
    item.appendChild(name);

    item.addEventListener('click', () => this.selectFrame(filename));

    return item;
}


export async function selectFrame(filename) {
    try {
        this.frameImageName = filename;
        
        const img = new Image();
        img.onload = () => {
            this.originalFrameImage = img;
            this.originalFrameSize = {
                width: img.width,
                height: img.height
            };
            
            // 現在のテクスチャ状態に応じて処理
            if (this.currentTexture === null) {
                // テクスチャなし - カラー設定を適用
                this.applyColorAndResize();
            } else {
                // テクスチャあり - テクスチャ処理を適用
                this.applyTextureAndResize();
            }
            this.redraw();
            this.updateStatusBar();
            this.updateInfoWindowContent();
            this.updateProductName();
            this.saveSettings();
            this.closeFrameSelector();
        };
        
        img.onerror = () => {
            console.error('フレーム画像の読み込みに失敗:', filename);
        };
        
        // テストモードの場合はダミーデータを使用
        if (this.testMode) {
            const frame = this.availableFrames.find(f => f.filename === filename);
            if (frame && frame.data) {
                img.src = frame.data;
            } else {
                console.error('テストモード: フレームデータが見つかりません:', filename);
            }
        } else {
            img.src = `./frames/${filename}`;
        }
    } catch (error) {
        console.error('フレーム選択エラー:', error);
    }
}

// UIUpdater.js - UI更新機能

export function updateStatusBar(customMessage = null) {
    const statusBar = document.getElementById('status-bar');
    if (!statusBar) return;
    
    // カスタムメッセージが指定された場合はそれを表示
    if (customMessage) {
        statusBar.textContent = customMessage;
        return;
    }
    
    let status = '';
    
    if (!this.baseImage) {
        status = '顔写真を開いてください';
    } else if (this.mode === 'measure') {
        if (this.measurementPoints.length === 0) {
            status = '測定モード: 2点をクリックして距離を測定';
        } else if (this.measurementPoints.length === 1) {
            status = '測定モード: 2点目をクリック';
        } else {
            status = `測定完了: ${this.pixelDistance.toFixed(2)}px = ${this.baseRealSize}mm (比率: ${this.scaleRatio.toFixed(4)} px/mm)`;
        }
    } else if (this.mode === 'adjust') {
        status = this.frameImage ? 
            '移動モード: フレームをドラッグして位置を調整' : 
            'フレームを開いてください';
    }
    
    statusBar.textContent = status;
}



export function updateGridLayout() {
    const frameGrid = document.querySelector('.frame-grid');
    if (!frameGrid) return;
    
    // グリッドを列数で等分
    frameGrid.style.gridTemplateColumns = `repeat(${this.gridColumns}, 1fr)`;
    
    // 画像サイズを計算して更新
    this.updateAllFrameItemSizes();
}


export function updateAllFrameItemSizes() {
    const frameGrid = document.querySelector('.frame-grid');
    if (!frameGrid) return;
    
    // modal-bodyの幅を取得
    const modalBody = frameGrid.parentElement;
    const bodyWidth = modalBody.clientWidth;
    
    // 利用可能幅 = body幅 - padding左右
    const availableWidth = bodyWidth - 40; // padding 20px × 2
    
    // gap の合計 = 12px × (列数 - 1)
    const totalGap = 12 * (this.gridColumns - 1);
    
    // 1列あたりの幅
    const columnWidth = (availableWidth - totalGap) / this.gridColumns;
    
    // アイテムpadding を引いた画像幅
    const imageWidth = columnWidth - 16; // padding 8px × 2
    
    // アスペクト比8:3で高さを計算
    const imageHeight = imageWidth * (3 / 8);
    
    // すべての画像に適用
    const images = document.querySelectorAll('.frame-item img');
    images.forEach(img => {
        img.style.width = imageWidth + 'px';
        img.style.height = imageHeight + 'px';
    });
}


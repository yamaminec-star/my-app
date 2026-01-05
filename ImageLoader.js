// ImageLoader.js - 画像読み込み機能

export function openFaceImage() {
    this.faceInput.value = ''; // ファイル選択状態をクリア
    this.faceInput.click();
}

export function loadFaceImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    this.baseImageName = file.name;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            this.baseImage = img;
            this.resizeCanvas();
            this.redraw();
            this.updateStatusBar();
            this.updateInfoWindowContent();
            this.updateProductName();
            
            // 測定モードの場合は拡大鏡を表示
            if (this.mode === 'measure') {
                this.magnifier.classList.add('show');
            }
            
            this.saveSettings();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

export function openFrameImage() {
    this.frameInput.value = ''; // ファイル選択状態をクリア
    this.frameInput.click();
}

export function loadFrameImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    this.frameImageName = file.name;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            this.originalFrameImage = img;
            this.originalFrameSize = {
                width: img.width,
                height: img.height
            };
            // フレーム読み込み後、現在のテクスチャ状態に応じて処理
            if (this.currentTexture === null) {
                // テクスチャなし - カラー設定を適用
                this.applyColorAndResize();
            } else {
                // テクスチャあり - テクスチャ処理を適用
                this.applyTextureAndResize();
            }
            // 即座に再描画
            this.redraw();
            this.updateStatusBar();
            this.updateInfoWindowContent();
            this.updateProductName();
            this.saveSettings();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

export async function reloadFrame() {
    // ステータスバーで更新開始を通知
    this.updateStatusBar('フレーム・テクスチャデータを更新中...');
    
    try {
        // フレームJSONを強制更新
        await this.forceReloadFrameList();
        
        // テクスチャJSONを強制更新
        await this.forceReloadTextureList();
        
        // フレーム画像も再適用
        if (this.originalFrameImage) {
            // 現在のテクスチャ状態に応じて処理
            if (this.currentTexture === null) {
                this.applyColorAndResize();
            } else {
                this.applyTextureAndResize();
            }
            this.redraw();
            this.updateStatusBar();
        }
        
        console.log('フレーム・テクスチャデータの更新が完了しました');
        this.updateStatusBar('フレーム・テクスチャデータ更新完了');
        
    } catch (error) {
        console.error('データ更新エラー:', error);
        this.updateStatusBar('データ更新に失敗しました');
    }
}

// ResetManager.js - リセット機能

export function resetAll() {
    console.log('アプリを初期状態にリセットします...');
    
    // 画像をクリア
    this.baseImage = null;
    this.frameImage = null;
    this.originalFrameImage = null;
    this.frameImageData = null;
    this.baseImageName = '';
    this.frameImageName = '';
    
    // 測定データをクリア
    this.measurementPoints = [];
    this.pixelDistance = 0;
    this.realDistance = 0;
    this.scaleRatio = 0;
    this.draggingPointIndex = -1;
    
    // 設定を初期値に戻す
    this.baseRealSize = 60;
    this.frameRealSize = 160;
    this.frameOffset = {x: 100, y: 100};
    this.frameSize = {width: 0, height: 0};
    this.originalFrameSize = {width: 0, height: 0};
    
    // カラー設定を初期値に戻す
    this.hue = 0;
    this.saturation = 100;
    this.brightness = 0;
    this.opacity = 100;
    this.subHue = 0;
    this.subSaturation = 0;
    this.subBrightness = 0;
    this.subOpacity = 0;
    
    // ウィンドウ位置をクリア
    this.windowPositions = {};
    
    // テクスチャをリセット
    this.currentTexture = null;
    this.currentTextureName = 'none';
    
    // UI状態をリセット
    this.colorWindowVisible = false;
    this.infoWindowVisible = false;
    this.textureWindowVisible = false;
    this.currentColorTab = 'black';
    this.mode = 'adjust';
    
    // ウィンドウを閉じる
    const colorWindow = document.getElementById('color-window');
    if (colorWindow) colorWindow.classList.remove('show');
    
    const infoWindow = document.getElementById('info-window');
    if (infoWindow) infoWindow.classList.remove('show');
    
    const textureWindow = document.getElementById('texture-window');
    if (textureWindow) textureWindow.classList.remove('show');
    
    const frameModal = document.getElementById('frame-selector-modal');
    if (frameModal) frameModal.style.display = 'none';
    
    // ファイル入力をクリア
    if (this.faceInput) this.faceInput.value = '';
    if (this.frameInput) this.frameInput.value = '';
    
    // LocalStorageをクリア
    localStorage.removeItem('faceMeasurementSettings');
    
    // ウィンドウ位置を初期値に戻す（transformをクリア）
    ['magnifier', 'info-window', 'color-window'].forEach(windowId => {
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            windowElement.style.transform = '';
        }
    });
    
    // UIを更新
    this.applySettingsToUI();
    this.updateModeButton();
    this.updateStatusBar();
    this.updateInfoWindowContent();
    this.redraw();
    
    console.log('リセット完了');
}

// テストモード切り替え
// 設定のリセット（画像は保持）

export function resetSettings() {
    console.log('設定を初期値にリセットします...');
    
    // 測定データをクリア
    this.measurementPoints = [];
    this.pixelDistance = 0;
    this.realDistance = 0;
    this.scaleRatio = 0;
    this.draggingPointIndex = -1;
    
    // 設定を初期値に戻す
    this.baseRealSize = 60;
    this.frameRealSize = 160;
    this.frameOffset = {x: 100, y: 100};
    
    // カラー設定を初期値に戻す
    this.hue = 0;
    this.saturation = 100;
    this.brightness = 0;
    this.opacity = 100;
    this.subHue = 0;
    this.subSaturation = 0;
    this.subBrightness = 0;
    this.subOpacity = 0;
    
    // ウィンドウ位置をクリア
    this.windowPositions = {};
    
    // ウィンドウ位置を初期値に戻す（transformをクリア）
    ['magnifier', 'info-window', 'color-window', 'texture-window'].forEach(windowId => {
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            windowElement.style.transform = '';
        }
    });
    
    // LocalStorageから設定を削除
    localStorage.removeItem('faceMeasurementSettings');
    
    // UIを更新
    this.applySettingsToUI();
    this.updateModeButton();
    this.updateStatusBar();
    this.updateInfoWindowContent();
    
    // フレームがある場合は再適用
    if (this.originalFrameImage) {
        if (this.currentTexture === null) {
            this.applyColorAndResize();
        } else {
            this.applyTextureAndResize();
        }
    }
    
    this.redraw();
    
    console.log('設定リセット完了');
}

// スケールリンクを更新

// InfoWindow.js - 情報ウィンドウUI + 情報表示機能

export function toggleInfoWindow() {
    this.infoWindowVisible = !this.infoWindowVisible;
    const window = document.getElementById('info-window');
    
    if (this.infoWindowVisible) {
        window.classList.add('show');
        this.updateInfoWindowContent();
    } else {
        window.classList.remove('show');
    }
}

export function updateInfoWindowContent() {
    // 顔写真情報
    const faceFileName = document.getElementById('face-file-name-window');
    if (faceFileName) {
        faceFileName.textContent = this.baseImageName || '未選択';
    }
    
    // 測定情報
    const pixelDistance = document.getElementById('pixel-distance-window');
    if (pixelDistance) {
        pixelDistance.textContent = this.pixelDistance > 0 ? `${this.pixelDistance.toFixed(2)}px` : '--px';
    }
    
    const realDistance = document.getElementById('real-distance-window');
    if (realDistance) {
        realDistance.textContent = this.baseRealSize;
    }
    
    const scaleRatio = document.getElementById('scale-ratio-window');
    if (scaleRatio) {
        scaleRatio.textContent = this.scaleRatio > 0 ? this.scaleRatio.toFixed(4) : '--';
    }
    
    // フレーム情報
    const frameFileName = document.getElementById('frame-file-name-window');
    if (frameFileName) {
        frameFileName.textContent = this.frameImageName || '未選択';
    }
    
    const frameRealSize = document.getElementById('frame-real-size-window');
    if (frameRealSize) {
        frameRealSize.value = this.frameRealSize;
    }
    
    //　テクスチャ情報
    const textureNameEl = document.getElementById('texture-file-name-window');
    if (textureNameEl) {
        textureNameEl.textContent = this.currentTextureName || '未選択';
    }

    // カラー情報
    const colorBlack = document.getElementById('color-black-window');
    const colorWhite = document.getElementById('color-white-window');
    
    if (colorBlack) {
        // 黒部分のRGB値を計算
        const h = this.hue / 360;
        const s = this.saturation / 100;
        const v = this.brightness / 100;
        const rgb = this.hsvToRgb(h, s, v);
        const r = Math.round(rgb.r * 255);
        const g = Math.round(rgb.g * 255);
        const b = Math.round(rgb.b * 255);
        const a = Math.round(this.opacity);
        
        colorBlack.textContent = `RGB(${r}, ${g}, ${b}) A:${a}`;
    }
    
    if (colorWhite) {
        // 白部分のRGB値を計算
        const h = this.subHue / 360;
        const s = this.subSaturation / 100;
        const v = this.subBrightness / 100;
        const rgb = this.hsvToRgb(h, s, v);
        const r = Math.round(rgb.r * 255);
        const g = Math.round(rgb.g * 255);
        const b = Math.round(rgb.b * 255);
        const a = Math.round(this.subOpacity);
        
        colorWhite.textContent = `RGB(${r}, ${g}, ${b}) A:${a}`;
    }
    
    // サイズ計算
    const calc160 = document.getElementById('calc-160-window');
    
    if (this.scaleRatio > 0) {
        if (calc160) calc160.textContent = `→ 160mm: ${(160 * this.scaleRatio).toFixed(2)}px`;
    } else {
        if (calc160) calc160.textContent = '→ 160mm: --px (比率未設定)';
    }
    
    // 測定点情報
    const measurementPoints = document.getElementById('measurement-points-window');
    if (measurementPoints) {
        if (this.measurementPoints.length === 0) {
            measurementPoints.textContent = '測定点なし';
        } else {
            let html = '';
            this.measurementPoints.forEach((point, index) => {
                html += `● 点${index + 1}: (${Math.round(point.x)}, ${Math.round(point.y)})<br>`;
            });
            measurementPoints.innerHTML = html;
        }
    }
}

// Helpers.js - ユーティリティ関数

export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

     
// ウィンドウ位置保存関連の機能

export function updateScaleLink() {
    const scaleLink = document.getElementById('scale-link');
    if (scaleLink) {
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        const newUrl = `${baseUrl}?scale=${this.currentScale.toFixed(1)}`;
        scaleLink.href = newUrl;
        scaleLink.textContent = newUrl;
    }
}


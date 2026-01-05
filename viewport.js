// URLパラメータからscaleを取得して表示倍率を設定
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const scaleParam = urlParams.get('scale');
    
    let appliedScale = 1.0;
    
    if (scaleParam) {
        // 数値に変換
        const scale = parseFloat(scaleParam);
        
        // 範囲チェック（0.1〜3.0に制限）
        const validScale = Math.max(0.1, Math.min(3.0, scale));
        
        // viewport metaタグを更新
        const viewport = document.getElementById('viewport-meta');
        if (viewport && !isNaN(validScale)) {
            viewport.setAttribute('content', 
                `width=device-width, initial-scale=${validScale}`);
            appliedScale = validScale;
        }
    }
    
    // フィルターウィンドウのサイズを固定（Transform相殺）
    if (appliedScale !== 1.0) {
        window.addEventListener('DOMContentLoaded', function() {
            const filterWindow = document.getElementById('frame-filters');
            if (filterWindow) {
                const inverseScale = 1 / appliedScale;
                filterWindow.style.transform = `scale(${inverseScale})`;
                filterWindow.style.transformOrigin = 'top left';
                // 相殺後の幅を調整
                filterWindow.style.width = `${100 * appliedScale}%`;
            }
        });
    }
})();

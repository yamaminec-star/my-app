// FrameProcessor.js - フレーム処理とカラー/テクスチャ適用

export function applyColorAndResize() {
    if (!this.originalFrameImage) return;
    
    // フレームサイズの計算
    if (this.scaleRatio > 0) {
        const targetWidth = this.frameRealSize * this.scaleRatio;
        const scale = targetWidth / this.originalFrameSize.width;
        this.frameSize = {
            width: this.originalFrameSize.width * scale,
            height: this.originalFrameSize.height * scale
        };
    } else {
        this.frameSize = {
            width: this.originalFrameSize.width,
            height: this.originalFrameSize.height
        };
    }
    
    // カラーとパターンを適用
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.originalFrameSize.width;
    tempCanvas.height = this.originalFrameSize.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.drawImage(this.originalFrameImage, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    this.applyColorToFrame(imageData);
    
    tempCtx.putImageData(imageData, 0, 0);
    
    // リサイズ
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = this.frameSize.width;
    resizedCanvas.height = this.frameSize.height;
    const resizedCtx = resizedCanvas.getContext('2d');
    
    resizedCtx.drawImage(tempCanvas, 0, 0, this.frameSize.width, this.frameSize.height);
    
    // 即座にframeImageを更新
    const dataURL = resizedCanvas.toDataURL();
    this.frameImage = new Image();
    this.frameImage.onload = () => {
        // 画像が読み込まれたら再描画
        this.redraw();
    };
    this.frameImage.src = dataURL;
}

export function applyColorToFrame(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // メインカラー（黒部分用）HSBからRGBへ変換
    const mainRgb = this.hsvToRgb(this.hue / 360, this.saturation / 100, this.brightness / 100);
    const mainR = Math.round(mainRgb.r * 255);
    const mainG = Math.round(mainRgb.g * 255);
    const mainB = Math.round(mainRgb.b * 255);
    const mainAlpha = this.opacity / 100; // 黒部分の透過率
    
    // サブカラー（白部分用）HSBからRGBへ変換
    const subRgb = this.hsvToRgb(this.subHue / 360, this.subSaturation / 100, this.subBrightness / 100);
    const subR = Math.round(subRgb.r * 255);
    const subG = Math.round(subRgb.g * 255);
    const subB = Math.round(subRgb.b * 255);
    const subAlpha = this.subOpacity / 100; // 白部分の透過率

    for (let i = 0; i < data.length; i += 4) {
        const sum = data[i] + data[i + 1] + data[i + 2];
        
        // 黒っぽい部分（メインカラー）
        if (sum < 60) {
            data[i] = mainR;
            data[i + 1] = mainG;
            data[i + 2] = mainB;
            data[i + 3] = Math.round(data[i + 3] * mainAlpha);
        }
        // 白っぽい部分（サブカラー）
        else if (sum > 700) { // 白判定の閾値（RGB合計が700以上）
            data[i] = subR;
            data[i + 1] = subG;
            data[i + 2] = subB;
            data[i + 3] = Math.round(255 * subAlpha); // 透過率を適用
        }
    }
}

export function updateFrameSize() {
    if (this.originalFrameImage) {
        // 現在のテクスチャ状態に応じて適切な処理を選択
        if (this.currentTexture === null) {
            // テクスチャなし - カラー設定を適用
            this.applyColorAndResize();
        } else {
            // テクスチャあり - テクスチャ処理を適用
            this.applyTextureAndResize();
        }
        this.redraw();
    }
    this.updateInfoWindowContent();
    this.saveSettings();
}

export function applyTextureToFrame() {
    if (!this.originalFrameImage) return;

    if (this.currentTexture === null) {
        // テクスチャなし - 既存のカラー設定を使用
        this.applyColorAndResize();
    } else {
        // テクスチャありの場合
        this.applyTextureAndResize();
    }
}

export function applyTextureAndResize() {
    if (!this.originalFrameImage || !this.currentTexture) return;
    
    // フレームサイズの計算
    if (this.scaleRatio > 0) {
        const targetWidth = this.frameRealSize * this.scaleRatio;
        const scale = targetWidth / this.originalFrameSize.width;
        this.frameSize = {
            width: this.originalFrameSize.width * scale,
            height: this.originalFrameSize.height * scale
        };
    } else {
        this.frameSize = {
            width: this.originalFrameSize.width,
            height: this.originalFrameSize.height
        };
    }
    
    // currentTextureが既に画像オブジェクトの場合
    const processTexture = (textureImg) => {
        // テンポラリキャンバスを作成（元のサイズ）
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.originalFrameSize.width;
        tempCanvas.height = this.originalFrameSize.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // フレーム画像を描画
        tempCtx.drawImage(this.originalFrameImage, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // テクスチャを1600×600にリサイズしてパターンを作成
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = 1600;
        patternCanvas.height = 600;
        const patternCtx = patternCanvas.getContext('2d');
        patternCtx.drawImage(textureImg, 0, 0, 1600, 600);
        const patternData = patternCtx.getImageData(0, 0, patternCanvas.width, patternCanvas.height);
        
        const data = imageData.data;
        
        // サブカラー（白部分用）HSBからRGBへ変換
        const subRgb = this.hsvToRgb(this.subHue / 360, this.subSaturation / 100, this.subBrightness / 100);
        const subR = Math.round(subRgb.r * 255);
        const subG = Math.round(subRgb.g * 255);
        const subB = Math.round(subRgb.b * 255);
        const subAlpha = this.subOpacity / 100;
        
        // ピクセルごとに処理
        for (let i = 0; i < data.length; i += 4) {
            const sum = data[i] + data[i + 1] + data[i + 2];
            
            // 黒っぽい部分（テクスチャを適用）
            if (sum < 60) {
                const pixelIndex = i / 4;
                const x = pixelIndex % tempCanvas.width;
                const y = Math.floor(pixelIndex / tempCanvas.width);
                
                // テクスチャのピクセル位置を計算（繰り返し）
                const texX = x % patternCanvas.width;
                const texY = y % patternCanvas.height;
                const texIndex = (texY * patternCanvas.width + texX) * 4;
                
                // テクスチャの色を取得
                data[i] = patternData.data[texIndex];
                data[i + 1] = patternData.data[texIndex + 1];
                data[i + 2] = patternData.data[texIndex + 2];
                data[i + 3] = data[i + 3]; // 元のアルファ値を保持
            }
            // 白っぽい部分（サブカラーを適用）
            else if (sum > 700) {
                data[i] = subR;
                data[i + 1] = subG;
                data[i + 2] = subB;
                data[i + 3] = Math.round(255 * subAlpha);
            }
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        // リサイズ
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = this.frameSize.width;
        resizedCanvas.height = this.frameSize.height;
        const resizedCtx = resizedCanvas.getContext('2d');
        
        resizedCtx.drawImage(tempCanvas, 0, 0, this.frameSize.width, this.frameSize.height);
        
        // frameImageを更新
        const dataURL = resizedCanvas.toDataURL();
        this.frameImage = new Image();
        this.frameImage.onload = () => {
            this.redraw();
        };
        this.frameImage.src = dataURL;
    };
    
    // currentTextureが画像オブジェクトかどうか確認
    if (this.currentTexture instanceof HTMLImageElement) {
        // 既に画像オブジェクトの場合は直接使用
        processTexture(this.currentTexture);
    } else {
        // data URLの場合は画像オブジェクトを作成
        const textureImg = new Image();
        textureImg.crossOrigin = "anonymous";
        textureImg.onload = () => {
            processTexture(textureImg);
        };
        textureImg.src = this.currentTexture;
    }
}

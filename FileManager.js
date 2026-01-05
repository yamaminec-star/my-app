// FileManager.js - ファイル保存・設定保存管理

export function saveImage() {
    if (!this.baseImage) {
        alert('画像が読み込まれていません');
        return;
    }
    
    // 現在の日時から月日時分を取得
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // フレーム名から拡張子を除去
    const frameName = this.frameImageName ? this.frameImageName.replace(/\.[^/.]+$/, '') : 'noframe';
    
    // ファイル名: 月日時分_フレーム名
    const fileName = `${month}${day}${hours}${minutes}_${frameName}.png`;
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = this.canvas.toDataURL();
    link.click();
}

export function loadSettings() {
    try {
        const settings = localStorage.getItem('faceMeasurementSettings');
        if (settings) {
            const data = JSON.parse(settings);
            
            // フォルダパス
            if (data.faceFolder) this.faceFolder = data.faceFolder;
            if (data.frameFolder) this.frameFolder = data.frameFolder;
            if (data.lastFaceFile) this.lastFaceFile = data.lastFaceFile;
            if (data.lastFrameFile) this.lastFrameFile = data.lastFrameFile;
            
            // 実寸値
            if (data.baseRealSize !== undefined) this.baseRealSize = data.baseRealSize;
            if (data.frameRealSize !== undefined) this.frameRealSize = data.frameRealSize;
            
            // カラー設定
            if (data.hue !== undefined) this.hue = data.hue;
            if (data.saturation !== undefined) this.saturation = data.saturation;
            if (data.brightness !== undefined) this.brightness = data.brightness;
            if (data.opacity !== undefined) this.opacity = data.opacity;
            
            // サブカラー設定
            if (data.subHue !== undefined) this.subHue = data.subHue;
            if (data.subSaturation !== undefined) this.subSaturation = data.subSaturation;
            if (data.subBrightness !== undefined) this.subBrightness = data.subBrightness;
            if (data.subOpacity !== undefined) this.subOpacity = data.subOpacity;
            
            // ウィンドウ位置
            if (data.windowPositions) this.windowPositions = data.windowPositions;
            
            // テクスチャ設定
            if (data.currentTextureName) this.currentTextureName = data.currentTextureName;
            
            this.notes = data.notes || '';
            const notesTextarea = document.getElementById('notes-textarea');
            if (notesTextarea) notesTextarea.value = this.notes;

            // UIに反映（アプリ初期化時のみ）
            if (!this.initialized) {
                setTimeout(() => {
                    this.applySettingsToUI();
                    this.restoreWindowPositions();
                    this.initialized = true;
                }, 100);
            } else {
                // 初期化済みの場合はUIのみ更新
                this.applySettingsToUI();
            }
        }
    } catch (e) {
        console.error('設定の読み込みに失敗:', e);
    }
}

export function saveSettings() {
    try {
        const settings = {
            faceFolder: this.faceFolder,
            frameFolder: this.frameFolder,
            lastFaceFile: this.lastFaceFile,
            lastFrameFile: this.lastFrameFile,
            baseRealSize: this.baseRealSize,
            frameRealSize: this.frameRealSize,
            hue: this.hue,
            saturation: this.saturation,
            brightness: this.brightness,
            opacity: this.opacity,
            subHue: this.subHue,
            subSaturation: this.subSaturation,
            subBrightness: this.subBrightness,
            subOpacity: this.subOpacity,
            windowPositions: this.windowPositions,
            currentTextureName: this.currentTextureName,
            notes: this.notes,
        };
        
        localStorage.setItem('faceMeasurementSettings', JSON.stringify(settings));
    } catch (e) {
        console.error('設定の保存に失敗:', e);
    }
}

export function applySettingsToUI() {
    // PD値
    const topRealSizeEl = document.getElementById('top-real-size');
    if (topRealSizeEl) topRealSizeEl.value = this.baseRealSize;
    
    // フレーム実寸
    const frameRealSizeWindowEl = document.getElementById('frame-real-size-window');
    if (frameRealSizeWindowEl) frameRealSizeWindowEl.value = this.frameRealSize;
}

export function saveWindowPosition(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) {
        console.warn(`ウィンドウが見つかりません: ${windowId}`);
        return;
    }

    // 現在のtransform値を取得
    const style = window.getComputedStyle(windowElement);
    const transform = style.transform;
    
    let x = 0, y = 0;
    
    if (transform && transform !== 'none') {
        const match = transform.match(/matrix\([\d\.\-\s,]+,\s*([\d\.\-]+),\s*([\d\.\-]+)\)/);
        if (match) {
            // matrix形式の場合
            x = parseFloat(match[1]);
            y = parseFloat(match[2]);
        } else {
            // translate形式の場合
            const translateMatch = transform.match(/translate\(([\d\.\-]+)px,\s*([\d\.\-]+)px\)/);
            if (translateMatch) {
                x = parseFloat(translateMatch[1]);
                y = parseFloat(translateMatch[2]);
            }
        }
    } else {
        // transformがない場合は0,0として保存（CSS初期位置を使用）
        x = 0;
        y = 0;
    }

    this.windowPositions[windowId] = { x, y };
    
    // 設定を保存
    this.saveSettings();
}

export function restoreWindowPositions() {
    // 保存された位置を復元、または初期位置にリセット
    Object.keys(this.windowPositions).forEach(windowId => {
        const windowElement = document.getElementById(windowId);
        if (windowElement && this.windowPositions[windowId]) {
            const pos = this.windowPositions[windowId];
            // 保存された位置を復元（transformを使用）
            windowElement.style.left = '';
            windowElement.style.top = '';
            windowElement.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        }
    });
    
    // 保存された位置がない場合はCSSデフォルト位置をそのまま使用
    // （CSSでcalc()で中央配置済み）
}

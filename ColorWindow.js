// ColorWindow.js - カラーウィンドウUI + カラー変更機能

export function setupColorPicker(colorType) {
    const picker = document.getElementById(colorType + '-picker');
    const handle = document.getElementById(colorType + '-handle');
    const hueHandle = document.getElementById(colorType + '-hue-handle');
    const hueTrack = hueHandle.parentElement;
    
    if (!picker || !handle || !hueHandle || !hueTrack) return;
    
    // 2Dカラーピッカー
    let isDragging = false;
    
    const updateColor = (e) => {
        const rect = picker.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));
        
        const saturation = (x / rect.width) * 100;
        const brightness = 100 - (y / rect.height) * 100;
        
        if (colorType === 'black') {
            this.saturation = saturation;
            this.brightness = brightness;
        } else {
            this.subSaturation = saturation;
            this.subBrightness = brightness;
        }
        
        handle.style.left = saturation + '%';
        handle.style.top = (100 - brightness) + '%';
        
        this.updateRGBDisplay(colorType);
        this.applyColorChange();
    };
    
    picker.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateColor(e);
    });
    
    // タッチイベント追加
    picker.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        const touch = e.touches[0];
        updateColor({clientX: touch.clientX, clientY: touch.clientY});
    }, {passive: false});
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateColor(e);
        }
    });
    
    // タッチムーブイベント追加
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            updateColor({clientX: touch.clientX, clientY: touch.clientY});
        }
    }, {passive: false});
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // タッチエンド追加
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Hueスライダー
    let isHueDragging = false;
    
    const updateHue = (e) => {
        const rect = hueTrack.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        
        const hue = (x / rect.width) * 360;
        
        if (colorType === 'black') {
            this.hue = hue;
        } else {
            this.subHue = hue;
        }
        
        hueHandle.style.left = (hue / 360 * 100) + '%';
        
        this.updateColorPickerBackground(colorType);
        this.updateRGBDisplay(colorType);
        this.applyColorChange();
    };
    
    hueTrack.addEventListener('mousedown', (e) => {
        isHueDragging = true;
        updateHue(e);
    });
    
    // タッチイベント追加
    hueTrack.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isHueDragging = true;
        const touch = e.touches[0];
        updateHue({clientX: touch.clientX, clientY: touch.clientY});
    }, {passive: false});
    
    document.addEventListener('mousemove', (e) => {
        if (isHueDragging) {
            updateHue(e);
        }
    });
    
    // タッチムーブイベント追加
    document.addEventListener('touchmove', (e) => {
        if (isHueDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            updateHue({clientX: touch.clientX, clientY: touch.clientY});
        }
    }, {passive: false});
    
    document.addEventListener('mouseup', () => {
        isHueDragging = false;
    });
    
    // タッチエンド追加
    document.addEventListener('touchend', () => {
        isHueDragging = false;
    });
    
    // 不透明度スライダー
    const opacityHandle = document.getElementById(colorType + '-opacity-handle');
    const opacityTrack = opacityHandle ? opacityHandle.parentElement : null;
    const opacityValue = document.getElementById(colorType + '-opacity-value');
    
    if (opacityHandle && opacityTrack) {
        let isOpacityDragging = false;
        
        const updateOpacity = (e) => {
            const rect = opacityTrack.getBoundingClientRect();
            let x = e.clientX - rect.left;
            x = Math.max(0, Math.min(x, rect.width));
            
            const opacity = (x / rect.width) * 100;
            
            if (colorType === 'black') {
                this.opacity = opacity;
            } else {
                this.subOpacity = opacity;
            }
            
            opacityHandle.style.left = opacity + '%';
            if (opacityValue) {
                opacityValue.textContent = opacity.toFixed(0);
            }
            
            this.updateRGBDisplay(colorType);
            this.applyColorChange();
        };
        
        opacityTrack.addEventListener('mousedown', (e) => {
            isOpacityDragging = true;
            updateOpacity(e);
        });
        
        opacityTrack.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isOpacityDragging = true;
            const touch = e.touches[0];
            updateOpacity({clientX: touch.clientX, clientY: touch.clientY});
        }, {passive: false});
        
        document.addEventListener('mousemove', (e) => {
            if (isOpacityDragging) {
                updateOpacity(e);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isOpacityDragging) {
                e.preventDefault();
                const touch = e.touches[0];
                updateOpacity({clientX: touch.clientX, clientY: touch.clientY});
            }
        }, {passive: false});
        
        document.addEventListener('mouseup', () => {
            isOpacityDragging = false;
        });
        
        document.addEventListener('touchend', () => {
            isOpacityDragging = false;
        });
    }
    
    // リセットボタン
    const resetBtn = document.getElementById(colorType + '-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (colorType === 'black') {
                this.hue = 0;
                this.saturation = 0;
                this.brightness = 0;
                this.opacity = 100;
            } else {
                this.subHue = 0;
                this.subSaturation = 0;
                this.subBrightness = 100;
                this.subOpacity = 0;
            }
            
            this.updateColorPickerUI(colorType);
            this.updateRGBDisplay(colorType);
            this.applyColorChange();
        });
    }
}

export function updateColorPickerBackground(colorType) {
    const picker = document.getElementById(colorType + '-picker');
    if (!picker) return;
    
    const hue = colorType === 'black' ? this.hue : this.subHue;
    picker.style.background = `
        linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,1)),
        linear-gradient(to right, rgba(255,255,255,1), hsl(${hue}, 100%, 50%))
    `;
}

export function updateColorPickerUI(colorType) {
    const handle = document.getElementById(colorType + '-handle');
    const hueHandle = document.getElementById(colorType + '-hue-handle');
    const opacityHandle = document.getElementById(colorType + '-opacity-handle');
    const opacityValue = document.getElementById(colorType + '-opacity-value');
    
    let h, s, b, o;
    if (colorType === 'black') {
        h = this.hue;
        s = this.saturation;
        b = this.brightness;
        o = this.opacity;
    } else {
        h = this.subHue;
        s = this.subSaturation;
        b = this.subBrightness;
        o = this.subOpacity;
    }
    
    if (handle) {
        handle.style.left = s + '%';
        handle.style.top = (100 - b) + '%';
    }
    
    if (hueHandle) {
        hueHandle.style.left = (h / 360 * 100) + '%';
    }
    
    if (opacityHandle) {
        opacityHandle.style.left = o + '%';
    }
    
    if (opacityValue) {
        opacityValue.textContent = o.toFixed(0);
    }
    
    this.updateColorPickerBackground(colorType);
    this.updateRGBDisplay(colorType);
}

export function updateRGBDisplay(colorType) {
    let h, s, v;
    if (colorType === 'black') {
        h = this.hue / 360;
        s = this.saturation / 100;
        v = this.brightness / 100;
    } else {
        h = this.subHue / 360;
        s = this.subSaturation / 100;
        v = this.subBrightness / 100;
    }
    
    const rgb = this.hsvToRgb(h, s, v);
    const r = Math.round(rgb.r * 255);
    const g = Math.round(rgb.g * 255);
    const b = Math.round(rgb.b * 255);
    
    const rEl = document.getElementById(colorType + '-r');
    const gEl = document.getElementById(colorType + '-g');
    const bEl = document.getElementById(colorType + '-b');
    
    if (rEl) rEl.textContent = r;
    if (gEl) gEl.textContent = g;
    if (bEl) bEl.textContent = b;
    
    const aEl = document.getElementById(colorType + '-a');
    if (aEl) {
        if (colorType === 'black') {
            aEl.textContent = Math.round(this.opacity);
        } else {
            aEl.textContent = Math.round(this.subOpacity);
        }
    }
}

export function switchColorTab(tab) {
    this.currentColorTab = tab;
    
    // タブボタンの状態を更新
    const tabs = ['black', 'white'];
    tabs.forEach(t => {
        const btn = document.getElementById('tab-btn-' + t);
        const content = document.getElementById('tab-' + t);
        if (btn) {
            if (t === tab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
        if (content) {
            if (t === tab) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        }
    });
    this.updateColorPickerBackground(tab);

}

export function toggleColorWindow() {
    this.colorWindowVisible = !this.colorWindowVisible;
    const window = document.getElementById('color-window');
    
    if (this.colorWindowVisible) {
        window.classList.add('show');
        this.updateColorPickerUI(this.currentColorTab);
    } else {
        window.classList.remove('show');
    }
}

export function hsvToRgb(h, s, v) {
    let r, g, b;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    
    return { r, g, b };
}

export function applyColorChange() {
    if (this.colorUpdateTimer) {
        clearTimeout(this.colorUpdateTimer);
    }
    this.colorUpdateTimer = setTimeout(() => this.performColorUpdate(), 50);
}

export function performColorUpdate() {
    if (!this.originalFrameImage) return;
    
    // テクスチャの有無に応じて適切な処理を実行
    if (this.currentTexture === null || this.currentTextureName === 'none') {
        // テクスチャなし - カラー設定を適用
        this.applyColorAndResize();
    } else {
        // テクスチャあり - テクスチャ処理を適用（白部分も更新される）
        this.applyTextureAndResize();
    }
    
    this.redraw();
    this.saveSettings();
    this.updateInfoWindowContent();  // 追加
    this.updateStatusBar();           // 追加
}

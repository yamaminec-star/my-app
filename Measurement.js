// Measurement.js - 測定機能（マウス/タッチ操作、距離計算）

export function onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!this.baseImage) return;
    
    const scale = Math.min(
        this.canvas.width / this.baseImage.width,
        this.canvas.height / this.baseImage.height
    );
    
    const imgX = (this.canvas.width - this.baseImage.width * scale) / 2;
    const imgY = (this.canvas.height - this.baseImage.height * scale) / 2;
    
    const relX = (x - imgX) / scale;
    const relY = (y - imgY) / scale;
    
    if (this.mode === 'measure') {
        // 既存の測定点をクリックしたかチェック（画面座標で30ピクセル）
        let clickedPointIndex = -1;
        for (let i = 0; i < this.measurementPoints.length; i++) {
            const point = this.measurementPoints[i];
            // 画面座標での距離を計算
            const screenPointX = imgX + point.x * scale;
            const screenPointY = imgY + point.y * scale;
            const screenDist = Math.sqrt(
                Math.pow(x - screenPointX, 2) + Math.pow(y - screenPointY, 2)
            );
            
            if (screenDist < 30) {
                clickedPointIndex = i;
                break;
            }
        }
        
        if (clickedPointIndex !== -1) {
            // 既存の点をドラッグ開始
            this.draggingPointIndex = clickedPointIndex;
            this.dragging = true;
        } else {
            // 新しい点を追加
            if (this.measurementPoints.length < 2) {
                this.measurementPoints.push({ x: relX, y: relY });
                if (this.measurementPoints.length === 2) {
                    this.calculateDistance();
                }
            } else {
                // 2点ある場合は最初の点から置き換え
                this.measurementPoints = [{ x: relX, y: relY }];
            }
        }
        
        this.redraw();
        this.updateInfoWindowContent();
        this.updateStatusBar();
    } else if (this.mode === 'adjust' && this.frameImage) {
        this.dragging = true;
        this.dragStart = {
            x: x - (imgX + this.frameOffset.x * scale),
            y: y - (imgY + this.frameOffset.y * scale)
        };
    }
}

export function onMouseMove(e) {
    if (!this.dragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!this.baseImage) return;
    
    const scale = Math.min(
        this.canvas.width / this.baseImage.width,
        this.canvas.height / this.baseImage.height
    );
    
    const imgX = (this.canvas.width - this.baseImage.width * scale) / 2;
    const imgY = (this.canvas.height - this.baseImage.height * scale) / 2;
    
    if (this.mode === 'measure' && this.draggingPointIndex !== -1) {
        // 測定点をドラッグ
        const relX = (x - imgX) / scale;
        const relY = (y - imgY) / scale;
        this.measurementPoints[this.draggingPointIndex] = { x: relX, y: relY };
        
        if (this.measurementPoints.length === 2) {
            this.calculateDistance();
        }
        
        this.redraw();
        this.updateInfoWindowContent();
        this.updateStatusBar();
    } else if (this.mode === 'adjust') {
        // フレーム位置を調整
        const relX = (x - imgX) / scale - this.dragStart.x / scale;
        const relY = (y - imgY) / scale - this.dragStart.y / scale;
        
        this.frameOffset = { x: relX, y: relY };
        this.redraw();
    }
}

export function onMouseUp(e) {
    this.dragging = false;
    this.draggingPointIndex = -1;
}

export function onTouchStart(e) {
    if (!this.baseImage) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    
    this.onMouseDown(mouseEvent);
    
    // 測定モードの場合は拡大鏡を表示
    if (this.mode === 'measure') {
        this.updateMagnifier(touch.clientX, touch.clientY);
    }
}

export function onTouchMove(e) {
    if (!this.baseImage) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    
    this.onMouseMove(mouseEvent);
    
    // 測定モードの場合は拡大鏡を更新
    if (this.mode === 'measure') {
        this.updateMagnifier(touch.clientX, touch.clientY);
    }
}

export function onTouchEnd(e) {
    e.preventDefault();
    
    const mouseEvent = new MouseEvent('mouseup', {});
    this.onMouseUp(mouseEvent);
}

export function calculateDistance() {
    if (this.measurementPoints.length === 2) {
        const p1 = this.measurementPoints[0];
        const p2 = this.measurementPoints[1];
        
        this.pixelDistance = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
        );
        
        this.updateRatio();
        this.redraw();
    }
}

export function updateRatio() {
    if (this.pixelDistance > 0 && this.baseRealSize > 0) {
        this.scaleRatio = this.pixelDistance / this.baseRealSize;
        this.updateFrameSize();
        this.updateInfoWindowContent();
        this.updateStatusBar();
    }
}

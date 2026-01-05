// Canvas.js - 描画とキャンバス管理

export function updateProductName() {
    const display = document.getElementById('product-name-display');
    if (display) {
        if (this.frameImageName) {
            const name = this.frameImageName.replace(/\.[^/.]+$/, '');
            display.textContent = name;
        } else {
            display.textContent = '製品名なし';
        }
    }
}

export function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    const rect = container.getBoundingClientRect();
    
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    
    // 拡大鏡キャンバスのサイズ設定
    this.magnifierCanvas.width = 220;
    this.magnifierCanvas.height = 220;
    
    this.redraw();
}

export function redraw() {
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.baseImage) return;
    
    // 顔画像の描画
    const scale = Math.min(
        this.canvas.width / this.baseImage.width,
        this.canvas.height / this.baseImage.height
    );
    
    const x = (this.canvas.width - this.baseImage.width * scale) / 2;
    const y = (this.canvas.height - this.baseImage.height * scale) / 2;
    
    this.ctx.drawImage(
        this.baseImage,
        x, y,
        this.baseImage.width * scale,
        this.baseImage.height * scale
    );
    
    // フレーム画像の描画
    if (this.frameImage && this.frameSize) {
        this.ctx.drawImage(
            this.frameImage,
            x + this.frameOffset.x * scale,
            y + this.frameOffset.y * scale,
            this.frameSize.width * scale,
            this.frameSize.height * scale
        );
    }
    
    // 測定モードの場合、測定点と線を描画
    if (this.mode === 'measure' && this.measurementPoints.length > 0) {
        this.ctx.fillStyle = 'red';
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        
        for (const point of this.measurementPoints) {
            this.ctx.beginPath();
            this.ctx.arc(
                x + point.x * scale,
                y + point.y * scale,
                5,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
        
        if (this.measurementPoints.length === 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                x + this.measurementPoints[0].x * scale,
                y + this.measurementPoints[0].y * scale
            );
            this.ctx.lineTo(
                x + this.measurementPoints[1].x * scale,
                y + this.measurementPoints[1].y * scale
            );
            this.ctx.stroke();
        }
    }
}

// Magnifier.js - 拡大鏡機能

export function updateMagnifier(clientX, clientY) {
    if (!this.baseImage) return;
    
    // 測定モードの時は常に拡大鏡を表示
    if (this.mode !== 'measure') {
        this.magnifier.classList.remove('show');
        return;
    } else {
        this.magnifier.classList.add('show');
    }
    
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const scale = Math.min(
        this.canvas.width / this.baseImage.width,
        this.canvas.height / this.baseImage.height
    );
    
    const imgX = (this.canvas.width - this.baseImage.width * scale) / 2;
    const imgY = (this.canvas.height - this.baseImage.height * scale) / 2;
    
    // 画像外でも拡大鏡を更新（測定モードでは常に表示）
    let sourceX, sourceY;
    
    if (x >= imgX && x <= imgX + this.baseImage.width * scale &&
        y >= imgY && y <= imgY + this.baseImage.height * scale) {
        // 画像内の場合
        sourceX = (x - imgX) / scale;
        sourceY = (y - imgY) / scale;
    } else {
        // 画像外の場合は境界にクランプ
        sourceX = Math.max(0, Math.min(this.baseImage.width, (x - imgX) / scale));
        sourceY = Math.max(0, Math.min(this.baseImage.height, (y - imgY) / scale));
    }
    
    const magnifierSize = 220;
    const sourceSize = magnifierSize / this.magnifierZoom;
    
    this.magnifierCtx.clearRect(0, 0, magnifierSize, magnifierSize);
    
    this.magnifierCtx.drawImage(
        this.baseImage,
        Math.max(0, sourceX - sourceSize / 2),
        Math.max(0, sourceY - sourceSize / 2),
        sourceSize,
        sourceSize,
        0, 0,
        magnifierSize,
        magnifierSize
    );
}

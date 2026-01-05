// DummyData.js - ダミーフレーム・テクスチャ生成（テストモード用）

// ダミーフレーム画像を生成（30個）
export function generateDummyFrames() {
    const frames = [];
    for (let i = 1; i <= 30; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // 透明背景
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 黒文字
        ctx.fillStyle = 'black';
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`TEST${i}`, canvas.width / 2, canvas.height / 2);
        
        // base64に変換
        const dataUrl = canvas.toDataURL('image/png');
        
        frames.push({
            filename: `TEST${String(i).padStart(3, '0')}_PD065_OW145.png`,
            data: dataUrl
        });
    }
    return frames;
}

// ダミーテクスチャ画像を生成（10個）
export function generateDummyTextures() {
    const colors = [
        {name: 'Red', color: '#FF0000'},
        {name: 'Blue', color: '#0000FF'},
        {name: 'Green', color: '#00FF00'},
        {name: 'Yellow', color: '#FFFF00'},
        {name: 'Purple', color: '#800080'},
        {name: 'Orange', color: '#FFA500'},
        {name: 'Pink', color: '#FFC0CB'},
        {name: 'Cyan', color: '#00FFFF'},
        {name: 'Gray', color: '#808080'},
        {name: 'Brown', color: '#A52A2A'}
    ];
    
    const textures = [];
    colors.forEach((colorData, i) => {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        
        // 単色で塗りつぶし
        ctx.fillStyle = colorData.color;
        ctx.fillRect(0, 0, 10, 10);
        
        // base64に変換
        const dataUrl = canvas.toDataURL('image/png');
        
        textures.push({
            name: `Test ${colorData.name}`,
            type: 'image',
            file: `test_${colorData.name.toLowerCase()}.png`,
            data: dataUrl
        });
    });
    
    return textures;
}

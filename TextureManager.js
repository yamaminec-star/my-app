// TextureManager.js - テクスチャ管理

export async function forceReloadTextureList() {
    try {
        // キャッシュをクリアして最新データを取得
        const response = await fetch('./textures/texture-list.json', {
            cache: 'no-cache'
        });
        if (!response.ok) {
            console.log('texture-list.json が見つかりません（正常）');
            return;
        }
        const data = await response.json();
        
        // データを強制更新
        if (Array.isArray(data)) {
            this.availableTextures = data.map(filename => ({
                name: this.filenameToDisplayName(filename),
                type: 'image',
                file: filename
            }));
        } else if (data.textures && Array.isArray(data.textures)) {
            const textureArray = data.textures;
            this.availableTextures = textureArray.map(item => {
                if (typeof item === 'string') {
                    return {
                        name: this.filenameToDisplayName(item),
                        type: 'image',
                        file: item
                    };
                } else {
                    return item;
                }
            });
        }
        
        console.log(`テクスチャリスト更新: ${this.availableTextures.length}個のテクスチャを読み込みました`);
        
    } catch (error) {
        console.log('テクスチャリストの更新をスキップ:', error);
        // テクスチャは必須ではないのでエラーにしない
    }
}

export function toggleTextureWindow() {
    this.textureWindowVisible = !this.textureWindowVisible;
    const window = document.getElementById('texture-window');
    
    if (this.textureWindowVisible) {
        window.classList.add('show');
        if (this.availableTextures.length === 0) {
            this.loadTextureList().then(() => {
                this.renderTextureGrid();
            });
        } else {
            this.renderTextureGrid();
        }
    } else {
        window.classList.remove('show');
    }
}


export async function loadTextureList() {
    // テストモードの場合はダミーデータを使用
    if (this.testMode) {
        this.availableTextures = this.generateDummyTextures();
        console.log(`テストモード: ${this.availableTextures.length}個のダミーテクスチャを生成しました`);
        return;
    }
    
    try {
        const response = await fetch('./textures/texture-list.json', {
            cache: 'no-cache'
        });
        if (!response.ok) {
            console.log('texture-list.jsonが見つかりません。デフォルトテクスチャを使用します。');
            this.availableTextures = this.getDefaultTextures();
            return;
        }
        const data = await response.json();
        
        // ファイル名のみの配列に対応
        if (Array.isArray(data)) {
            // シンプルな配列形式 ["file1.png", "file2.png"]
            this.availableTextures = data.map(filename => ({
                name: this.filenameToDisplayName(filename),
                type: 'image',
                file: filename
            }));
        } else if (data.textures && Array.isArray(data.textures)) {
            // オブジェクト形式との互換性 {"textures": ["file1.png", "file2.png"]}
            const textureArray = data.textures;
            this.availableTextures = textureArray.map(item => {
                if (typeof item === 'string') {
                    // ファイル名のみの場合
                    return {
                        name: this.filenameToDisplayName(item),
                        type: 'image',
                        file: item
                    };
                } else {
                    // オブジェクト形式の場合（従来互換）
                    return item;
                }
            });
        } else {
            // 予期しない形式
            console.log('texture-list.jsonの形式が不正です。デフォルトテクスチャを使用します。');
            this.availableTextures = this.getDefaultTextures();
            return;
        }
        
        console.log(`${this.availableTextures.length}個のテクスチャを読み込みました`);
    } catch (error) {
        console.log('外部テクスチャの読み込みに失敗。デフォルトテクスチャを使用します:', error);
        this.availableTextures = this.getDefaultTextures();
    }
}


export function filenameToDisplayName(filename) {
    // ファイル名から表示名を生成（バージョン情報除去対応）
    return filename
        .replace(/\.[^/.]+$/, '')      // 拡張子を削除
        .replace(/_v[\d\.]+/g, '')     // バージョン削除 (_v1.2, _v2.0.1等)
        .replace(/_\d{8}/g, '')        // 日付削除 (_20231201等)
        .replace(/_build\d+/g, '')     // ビルド番号削除 (_build001等)
        .replace(/_rev\d+/g, '')       // リビジョン削除 (_rev3等)
        .replace(/_/g, ' ')            // アンダースコアをスペースに
        .replace(/\b\w/g, l => l.toUpperCase()); // 各単語の最初を大文字に
}


export function getDefaultTextures() {
    // デフォルトテクスチャなし（外部ファイルのみ）
    return [];
}


export function renderTextureGrid() {
    const grid = document.getElementById('texture-grid');
    if (!grid) return;

    // 「なし」オプションを保持
    const noneOption = grid.querySelector('.texture-item');
    grid.innerHTML = '';
    grid.appendChild(noneOption);
    
    // 現在の選択を更新
    const textureItems = grid.querySelectorAll('.texture-item');
    textureItems.forEach(item => item.classList.remove('selected'));
    if (this.currentTextureName === 'none') {
        noneOption.classList.add('selected');
    }

    if (this.availableTextures.length === 0) {
        // テクスチャがない場合のメッセージ
        const noTextureMsg = document.createElement('div');
        noTextureMsg.className = 'loading';
        noTextureMsg.textContent = 'テクスチャファイルが見つかりません。./textures/フォルダにテクスチャ画像とtexture-list.jsonを配置してください。';
        grid.appendChild(noTextureMsg);
    } else {
        this.availableTextures.forEach(texture => {
            const textureItem = this.createTextureItem(texture);
            grid.appendChild(textureItem);
        });
    }
}


export function createTextureItem(texture) {
    const item = document.createElement('div');
    item.className = 'texture-item';
    if (this.currentTextureName === texture.name) {
        item.classList.add('selected');
    }

    const preview = document.createElement('div');
    preview.className = 'texture-preview';

    if (texture.type === 'pattern') {
        const patternStyle = this.getPatternStyle(texture.pattern);
        preview.style.background = patternStyle;
    } else if (texture.type === 'color') {
        preview.style.background = texture.color;
    } else if (texture.type === 'image' && texture.file) {
        preview.style.backgroundImage = `url(./textures/${texture.file})`;
    }

    const name = document.createElement('div');
    name.className = 'texture-item-name';
    name.textContent = texture.name;

    item.appendChild(preview);
    item.appendChild(name);

    item.addEventListener('click', () => this.selectTexture(texture.name, texture));

    return item;
}

           

export async function selectTexture(textureName, textureData = null) {
    try {
        this.currentTextureName = textureName;
        
        if (textureName === 'none') {
            this.currentTexture = null;
            // 即座に反映
            this.applyTextureToFrame();
            this.renderTextureGrid();
            this.saveSettings();
        } else if (textureData) {
            if (textureData.type === 'image' && textureData.file) {
                // 外部画像ファイルを読み込み
                const img = new Image();
                img.onload = () => {
                    this.currentTexture = img;
                    // 即座に反映
                    this.applyTextureToFrame();
                    this.renderTextureGrid();
                    this.saveSettings();
                    this.updateInfoWindowContent();  // 追加
                    this.updateStatusBar();           // 追加
                };
                img.onerror = () => {
                    console.error('テクスチャ画像の読み込みに失敗:', textureData.file);
                };
                
                // テストモードの場合はダミーデータを使用
                if (this.testMode && textureData.data) {
                    img.src = textureData.data;
                } else {
                    img.src = `./textures/${textureData.file}`;
                }
                return; // 非同期処理のためここで返る
            } else {
                // パターンまたは色
                this.currentTexture = textureData;
                // 即座に反映
                this.applyTextureToFrame();
                this.renderTextureGrid();
                this.saveSettings();
            }
        }
    } catch (error) {
        console.error('テクスチャ選択エラー:', error);
    }
}

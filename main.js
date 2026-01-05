// main.js - アプリケーション初期化

import { FaceMeasurementApp } from './FaceMeasurementApp.js';
import { makeDraggable } from './utils.js';

// アプリインスタンス（グローバルに保持）
let app;

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    app = new FaceMeasurementApp();
    
    // ウィンドウをドラッグ可能にする
    makeDraggable(document.getElementById('color-window'));
    makeDraggable(document.getElementById('info-window'));
    makeDraggable(document.getElementById('texture-window'));
    makeDraggable(document.getElementById('magnifier'));
    
    // グローバルからアクセス可能にする（utils.jsのmakeDraggableから参照される）
    window.app = app;
});

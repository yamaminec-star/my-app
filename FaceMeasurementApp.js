// FaceMeasurementApp - メインアプリケーションクラス
// 各機能モジュールをimportして統合

import * as ColorWindow from './ColorWindow.js';
import * as InfoWindow from './InfoWindow.js';
import * as MenuManager from './MenuManager.js';
import * as FileManager from './FileManager.js';
import * as Magnifier from './Magnifier.js';
import * as DummyData from './DummyData.js';
import * as ImageLoader from './ImageLoader.js';
import * as Canvas from './Canvas.js';
import * as FrameProcessor from './FrameProcessor.js';
import * as Measurement from './Measurement.js';

import * as FrameSelector from './FrameSelector.js';
import * as FilterManager from './FilterManager.js';
import * as TextureManager from './TextureManager.js';
import * as UIUpdater from './UIUpdater.js';
import * as Helpers from './Helpers.js';
import * as ResetManager from './ResetManager.js';



export class FaceMeasurementApp {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 拡大鏡
        this.magnifier = document.getElementById('magnifier');
        this.magnifierCanvas = document.getElementById('magnifier-canvas');
        this.magnifierCtx = this.magnifierCanvas.getContext('2d');
        this.magnifierZoom = 3; // 3倍拡大
        
        // ファイル入力要素への参照
        this.faceInput = document.getElementById('face-input');
        this.frameInput = document.getElementById('frame-input');
        
        // 状態変数
        this.baseImage = null;
        this.frameImage = null;
        this.originalFrameImage = null;
        this.frameImageData = null;
        this.baseImageName = '';
        this.frameImageName = '';
        this.baseRealSize = 60; // 顔写真の実寸（初期値60mm）
        this.frameRealSize = 160;
        this.mode = 'adjust'; // 'measure' or 'adjust'
        this.testMode = false; // テストモード
        this.menuPage = 0; // メニューページ（0 or 1）
        this.currentScale = 1.0; // 現在の表示スケール
        
        // フォルダパス
        this.faceFolder = '';
        this.frameFolder = '';
        this.lastFaceFile = '';
        this.lastFrameFile = '';
        
        // 測定関連
        this.measurementPoints = [];
        this.pixelDistance = 0;
        this.realDistance = 0;
        this.scaleRatio = 0;
        this.draggingPointIndex = -1;
        
        // フレーム位置
        this.frameOffset = {x: 100, y: 100};
        this.frameSize = {width: 0, height: 0};
        this.originalFrameSize = {width: 0, height: 0};
        this.dragging = false;
        this.dragStart = {x: 0, y: 0};
        
        // カラー設定
        this.hue = 0;
        this.saturation = 100;
        this.brightness = 0;
        this.opacity = 100; // 黒部分の透明度（初期値100 = 不透明）
        
        // サブカラー設定（白部分用）
        this.subHue = 0;
        this.subSaturation = 100;
        this.subBrightness = 100;
        this.subOpacity = 0;
        
        // 新UI用の状態
        this.colorWindowVisible = false;
        this.infoWindowVisible = false;
        this.currentColorTab = 'black';
        this.colorPickerDragging = false;
        this.hueSliderDragging = false;
        this.opacitySliderDragging = false;
        
        // フレーム選択関連
        this.availableFrames = [];
        this.filteredFrames = [];
        this.frameFilters = {
            series: [],
            pd: [],
            ow: []
        };
        this.selectedFilters = {
            series: [],
            pd: [],
            ow: []
        };
        this.filterVisible = false;
        this.pdRange = { min: 58, max: 80 };
        this.owRange = { min: 124, max: 160 };
        this.pdAvailableRange = { min: 58, max: 80 };
        this.owAvailableRange = { min: 124, max: 160 };
        
        // グリッド列数（デフォルト5列、localStorageから読み込み）
        this.gridColumns = parseInt(localStorage.getItem('gridColumns')) || 5;
        
        // テクスチャ関連
        this.availableTextures = [];
        this.currentTexture = null;
        this.currentTextureName = 'none';
        // 備考
        this.notes = '';
        
        // ウィンドウ位置保存
        this.windowPositions = {};
        
        // 初期化フラグ
        this.initialized = false;
        
        // モジュールメソッドをバインド（他のメソッド呼び出しより前に実行）
        this.bindModuleMethods();
        
        // 設定を読み込み
        this.loadSettings();
        
        // イベントリスナー設定
        this.setupEventListeners();
        
        // キャンバスサイズ設定
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 初期ステータスバー更新
        this.updateStatusBar();
        
        // 初期モードボタンの状態を設定
        this.updateModeButton();
        
        // 初期顔画像を生成
        this.createInitialFaceImage();
    }
    
    // モジュールメソッドをthisにバインド
    bindModuleMethods() {
        // ColorWindow
        this.setupColorPicker = ColorWindow.setupColorPicker.bind(this);
        this.updateColorPickerBackground = ColorWindow.updateColorPickerBackground.bind(this);
        this.updateColorPickerUI = ColorWindow.updateColorPickerUI.bind(this);
        this.updateRGBDisplay = ColorWindow.updateRGBDisplay.bind(this);
        this.switchColorTab = ColorWindow.switchColorTab.bind(this);
        this.toggleColorWindow = ColorWindow.toggleColorWindow.bind(this);
        this.hsvToRgb = ColorWindow.hsvToRgb.bind(this);
        this.applyColorChange = ColorWindow.applyColorChange.bind(this);
        this.performColorUpdate = ColorWindow.performColorUpdate.bind(this);
        
        // InfoWindow
        this.toggleInfoWindow = InfoWindow.toggleInfoWindow.bind(this);
        this.updateInfoWindowContent = InfoWindow.updateInfoWindowContent.bind(this);
        
        // MenuManager
        this.toggleMode = MenuManager.toggleMode.bind(this);
        this.setMeasureMode = MenuManager.setMeasureMode.bind(this);
        this.setAdjustMode = MenuManager.setAdjustMode.bind(this);
        this.updateModeButton = MenuManager.updateModeButton.bind(this);
        this.toggleTestMode = MenuManager.toggleTestMode.bind(this);
        this.updateMenuDisplay = MenuManager.updateMenuDisplay.bind(this);
        
        // FileManager
        this.saveImage = FileManager.saveImage.bind(this);
        this.loadSettings = FileManager.loadSettings.bind(this);
        this.saveSettings = FileManager.saveSettings.bind(this);
        this.applySettingsToUI = FileManager.applySettingsToUI.bind(this);
        this.saveWindowPosition = FileManager.saveWindowPosition.bind(this);
        this.restoreWindowPositions = FileManager.restoreWindowPositions.bind(this);
        
        // Magnifier
        this.updateMagnifier = Magnifier.updateMagnifier.bind(this);
        
        // DummyData
        this.generateDummyFrames = DummyData.generateDummyFrames.bind(this);
        this.generateDummyTextures = DummyData.generateDummyTextures.bind(this);
        
        // ImageLoader
        this.openFaceImage = ImageLoader.openFaceImage.bind(this);
        this.loadFaceImage = ImageLoader.loadFaceImage.bind(this);
        this.openFrameImage = ImageLoader.openFrameImage.bind(this);
        this.loadFrameImage = ImageLoader.loadFrameImage.bind(this);
        this.reloadFrame = ImageLoader.reloadFrame.bind(this);
        
        // Canvas
        this.updateProductName = Canvas.updateProductName.bind(this);
        this.resizeCanvas = Canvas.resizeCanvas.bind(this);
        this.redraw = Canvas.redraw.bind(this);
        
        // FrameProcessor
        this.applyColorAndResize = FrameProcessor.applyColorAndResize.bind(this);
        this.applyColorToFrame = FrameProcessor.applyColorToFrame.bind(this);
        this.updateFrameSize = FrameProcessor.updateFrameSize.bind(this);
        this.applyTextureToFrame = FrameProcessor.applyTextureToFrame.bind(this);
        this.applyTextureAndResize = FrameProcessor.applyTextureAndResize.bind(this);
        
        // Measurement
        this.onMouseDown = Measurement.onMouseDown.bind(this);
        this.onMouseMove = Measurement.onMouseMove.bind(this);
        this.onMouseUp = Measurement.onMouseUp.bind(this);
        this.onTouchStart = Measurement.onTouchStart.bind(this);
        this.onTouchMove = Measurement.onTouchMove.bind(this);
        this.onTouchEnd = Measurement.onTouchEnd.bind(this);
        this.calculateDistance = Measurement.calculateDistance.bind(this);
        this.updateRatio = Measurement.updateRatio.bind(this);
        
        // FrameSelector
        this.openFrameSelector = FrameSelector.openFrameSelector.bind(this);
        this.closeFrameSelector = FrameSelector.closeFrameSelector.bind(this);
        this.toggleFrameFilter = FrameSelector.toggleFrameFilter.bind(this);
        this.forceReloadFrameList = FrameSelector.forceReloadFrameList.bind(this);
        this.setupFrameFilters = FrameSelector.setupFrameFilters.bind(this);
        this.parseFrameFilename = FrameSelector.parseFrameFilename.bind(this);
        this.renderFrameGrid = FrameSelector.renderFrameGrid.bind(this);
        this.createFrameItem = FrameSelector.createFrameItem.bind(this);
        this.selectFrame = FrameSelector.selectFrame.bind(this);
        this.loadFrameList = FrameSelector.loadFrameList.bind(this);
        
        // FilterManager
        this.setGridColumns = FilterManager.setGridColumns.bind(this);
        this.setupRangeSliders = FilterManager.setupRangeSliders.bind(this);
        this.updateRangeValues = FilterManager.updateRangeValues.bind(this);
        this.createFilterUI = FilterManager.createFilterUI.bind(this);
        this.saveFilterSelection = FilterManager.saveFilterSelection.bind(this);
        this.clearFilterSelection = FilterManager.clearFilterSelection.bind(this);
        this.updateFrameFilters = FilterManager.updateFrameFilters.bind(this);
        this.getSelectedFilterValues = FilterManager.getSelectedFilterValues.bind(this);
        
        // TextureManager
        this.forceReloadTextureList = TextureManager.forceReloadTextureList.bind(this);
        this.toggleTextureWindow = TextureManager.toggleTextureWindow.bind(this);
        this.loadTextureList = TextureManager.loadTextureList.bind(this);
        this.filenameToDisplayName = TextureManager.filenameToDisplayName.bind(this);
        this.getDefaultTextures = TextureManager.getDefaultTextures.bind(this);
        this.renderTextureGrid = TextureManager.renderTextureGrid.bind(this);
        this.createTextureItem = TextureManager.createTextureItem.bind(this);
        this.selectTexture = TextureManager.selectTexture.bind(this);
        
        // UIUpdater
        this.updateStatusBar = UIUpdater.updateStatusBar.bind(this);
        this.updateGridLayout = UIUpdater.updateGridLayout.bind(this);
        this.updateAllFrameItemSizes = UIUpdater.updateAllFrameItemSizes.bind(this);
        
        // Helpers
        this.hexToRgb = Helpers.hexToRgb.bind(this);
        this.updateScaleLink = Helpers.updateScaleLink.bind(this);
        
        // ResetManager
        this.resetAll = ResetManager.resetAll.bind(this);
        this.resetSettings = ResetManager.resetSettings.bind(this);
    }

    // 初期顔画像を生成
    createInitialFaceImage() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 2000;
        tempCanvas.height = 2000;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 白背景
        tempCtx.fillStyle = '#b1b2b8ff';
        tempCtx.fillRect(0, 0, 2000, 2000);
        tempCtx.filter = 'contrast(100%) brightness(100%) url(#noise)'; 

        tempCtx.fillRect(0, 0, 2000, 2000);
        tempCtx.filter = 'none';
        // テキスト設定
        tempCtx.fillStyle = '#fff';
        tempCtx.font = '300px "Franklin Gothic", "Arial Narrow", sans-serif';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        
        // テキスト描画
        tempCtx.fillText('JUS4U', 1000, 1000);
        
        // Imageオブジェクトに変換
        const img = new Image();
        img.onload = () => {
            this.baseImage = img;
            this.baseImageName = 'JUS4U (初期画像)';
            this.redraw();
            this.updateStatusBar();
            this.updateInfoWindowContent();
        };
        img.src = tempCanvas.toDataURL();
    }

    setupEventListeners() {
        // ファイル入力のイベントリスナー
        if (this.faceInput) this.faceInput.addEventListener('change', (e) => this.loadFaceImage(e));
        if (this.frameInput) this.frameInput.addEventListener('change', (e) => this.loadFrameImage(e));
        
        // マウスイベント
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
            if (this.mode === 'measure' && this.baseImage) {
                this.updateMagnifier(e.clientX, e.clientY);
            }
        });
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // タッチイベント
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), {passive: false});
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), {passive: false});
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), {passive: false});
        
        // メニューバーボタン
        const openFaceBtn = document.getElementById('open-face-btn');
        if (openFaceBtn) openFaceBtn.addEventListener('click', () => this.openFaceImage());
        
        const topModeBtn = document.getElementById('top-mode-button');
        if (topModeBtn) topModeBtn.addEventListener('click', () => this.toggleMode());
        
        const openFrameBtn = document.getElementById('open-frame-btn');
        if (openFrameBtn) openFrameBtn.addEventListener('click', () => {
            this.setAdjustMode();
            this.openFrameSelector();
        });
        
        const textureBtn = document.getElementById('texture-btn');
        if (textureBtn) textureBtn.addEventListener('click', () => {
            this.toggleTextureWindow();
        });
        
        const colorWindowBtn = document.getElementById('color-window-btn');
        if (colorWindowBtn) colorWindowBtn.addEventListener('click', () => {
            this.setAdjustMode();
            this.toggleColorWindow();
        });
        
        const reloadFrameBtn = document.getElementById('reload-frame-btn');
        if (reloadFrameBtn) reloadFrameBtn.addEventListener('click', () => {
            this.setAdjustMode();
            this.resetSettings();
        });
        
        const testModeBtn = document.getElementById('test-mode-btn');
        if (testModeBtn) testModeBtn.addEventListener('click', () => {
            this.toggleTestMode();
        });
        
        const exportTextBtn = document.getElementById('export-text-btn');
        if (exportTextBtn) exportTextBtn.addEventListener('click', () => {
            this.exportDataToText();
        });

        const infoWindowBtn = document.getElementById('info-window-btn');
        if (infoWindowBtn) infoWindowBtn.addEventListener('click', () => this.toggleInfoWindow());
        
        const saveImageBtn = document.getElementById('save-image-btn');
        if (saveImageBtn) saveImageBtn.addEventListener('click', () => {
            this.setAdjustMode();
            this.saveImage();
        });
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => {
             this.toggleFullscreen();
        });
        // PD値入力
        const topRealSizeInput = document.getElementById('top-real-size');
        if (topRealSizeInput) {
            topRealSizeInput.addEventListener('change', () => {
                this.baseRealSize = parseFloat(topRealSizeInput.value) || 60;
                this.updateRatio();
                
                // PD値変更時にフレームを自動更新
                if (this.originalFrameImage) {
                    this.applyColorAndResize();
                    this.redraw();
                }
                
                this.saveSettings();
                topRealSizeInput.blur();  // 追加：キーボードを閉じる
            });
        }
        
        // フレーム実寸入力
        const frameRealSizeInput = document.getElementById('frame-real-size-window');
        if (frameRealSizeInput) {
            frameRealSizeInput.addEventListener('change', () => {
                this.frameRealSize = parseFloat(frameRealSizeInput.value) || 160;
                this.updateFrameSize();
                
                // フレーム実寸変更時にフレームを自動更新
                if (this.originalFrameImage) {
                    this.applyColorAndResize();
                    this.redraw();
                }
                
                this.saveSettings();
                frameRealSizeInput.blur();  // 追加：キーボードを閉じる
            });
        }
        //　拡大鏡ウインドウ閉じる
        const magnifierWindowClose = document.getElementById('magnifier-window-close');
        if (magnifierWindowClose) magnifierWindowClose.addEventListener('click', () =>           this.toggleMode());
        // 測定点リセット
        const magnifierReset = document.getElementById('magnifier-reset');
        if (magnifierReset) magnifierReset.addEventListener('click', () =>
        { 
        this.measurementPoints = [];
        this.pixelDistance = 0;
        this.realDistance = 0;
        this.scaleRatio = 0;
        this.draggingPointIndex = -1;
        this.redraw();
        this.updateInfoWindowContent();  // 追加
        this.updateStatusBar();           // 追加
        });
        //

        // カラーウィンドウのタブ切り替え
        const tabBtnBlack = document.getElementById('tab-btn-black');
        const tabBtnWhite = document.getElementById('tab-btn-white');
        
        if (tabBtnBlack) tabBtnBlack.addEventListener('click', () => this.switchColorTab('black'));
        if (tabBtnWhite) tabBtnWhite.addEventListener('click', () => this.switchColorTab('white'));
        
        // カラーウィンドウ閉じる
        const colorWindowClose = document.getElementById('color-window-close');
        if (colorWindowClose) colorWindowClose.addEventListener('click', () => this.toggleColorWindow());
        
        // 情報ウィンドウ閉じる
        const infoWindowClose = document.getElementById('info-window-close');
        if (infoWindowClose) infoWindowClose.addEventListener('click', () => this.toggleInfoWindow());
        
        // テクスチャウィンドウ閉じる
        const textureWindowClose = document.getElementById('texture-window-close');
        if (textureWindowClose) textureWindowClose.addEventListener('click', () => this.toggleTextureWindow());
        
        // カラーピッカーのイベント（黒部分）
        this.setupColorPicker('black');
        
        // カラーピッカーのイベント（白部分）
        this.setupColorPicker('white');
        
        // キーボードイベント（リセット機能）
        document.addEventListener('keydown', (e) => {
            // Shift + C でリセット
            if (e.shiftKey && e.key === 'C') {
                e.preventDefault();
                this.resetAll();
            }
        });
        
        // スケール設定のイベントリスナー
        const scaleInput = document.getElementById('scale-input');
        const scaleLink = document.getElementById('scale-link');
        if (scaleInput && scaleLink) {
            // URLパラメータから現在のスケールを取得
            const urlParams = new URLSearchParams(window.location.search);
            const scaleParam = urlParams.get('scale');
            if (scaleParam) {
                const scale = parseFloat(scaleParam);
                this.currentScale = Math.max(0.1, Math.min(3.0, scale));
            }
            scaleInput.value = this.currentScale.toFixed(1);
            
            // リンクを更新
            this.updateScaleLink();
            
            // 入力時にリアルタイム更新
            scaleInput.addEventListener('input', () => {
                const value = parseFloat(scaleInput.value);
                if (!isNaN(value) && value >= 0.1 && value <= 3.0) {
                    this.currentScale = value;
                    this.updateScaleLink();
                }
            });

            // Enterキー押下でキーボードを閉じる
            scaleInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    scaleInput.blur();
                }
        });
    }   

         // 備考欄の変更イベント
        const notesTextarea = document.getElementById('notes-textarea');
        if (notesTextarea) {
            notesTextarea.addEventListener('input', () => {
                this.notes = notesTextarea.value;
                this.saveSettings();
            });

             // Enterキー押下でキーボードを閉じる（改行なしの場合）
            notesTextarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    notesTextarea.blur();
                }
            });
        }
        // メニューページネーションのイベントリスナー
        const toggleBtn = document.getElementById('menu-page-toggle-btn');
        const toggleIcon = document.getElementById('menu-page-toggle-icon');
        if (toggleBtn && toggleIcon) {
            toggleBtn.addEventListener('click', () => {
                this.menuPage = this.menuPage === 0 ? 1 : 0;
                // アイコンを変更
                toggleIcon.textContent = this.menuPage === 0 ? 'chevron_right' : 'chevron_left';
                this.updateMenuDisplay();
            });

        
            
            // リサイズ時にメニュー表示を更新
            window.addEventListener('resize', () => this.updateMenuDisplay());
            this.updateMenuDisplay();
        }
    }


     toggleFullscreen() {
        const btn = document.getElementById('fullscreen-btn');
        const icon = btn ? btn.querySelector('span') : null;
        
        if (!document.fullscreenElement) {
            // 全画面化
            document.documentElement.requestFullscreen().then(() => {
                if (icon) icon.textContent = 'fullscreen_exit';
            }).catch(err => {
                console.error('全画面表示に失敗:', err);
            });
        } else {
            // 全画面解除
            document.exitFullscreen().then(() => {
                if (icon) icon.textContent = 'fullscreen';
            }).catch(err => {
                console.error('全画面解除に失敗:', err);
            });
        }
    }
    




     exportDataToText() {
        const now = new Date();
        const dateStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        
    const blackRgbaText = document.getElementById('color-black-window').textContent;
    const whiteRgbaText = document.getElementById('color-white-window').textContent;
    
    const data = [
        `日時: ${dateStr}`,
        `フレームファイル名: ${this.frameImageName || '未選択'}`,
        `テクスチャファイル名: ${this.currentTextureName || 'なし'}`,
        `PD値: ${this.baseRealSize}mm`,
        `顔画像ファイル名: ${this.baseImageName || '未選択'}`,
        `黒部分RGBA: ${blackRgbaText}`,
        `白部分RGBA: ${whiteRgbaText}`,
        `比率(px/mm): ${this.scaleRatio.toFixed(4)}`,
        `備考: ${this.notes || 'なし'}`
    ].join('\n');

        
        const blob = new Blob(['\uFEFF' + data], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

}
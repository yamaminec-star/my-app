// FilterManager.js - フィルター機能管理

export function setGridColumns(columns) {
    this.gridColumns = columns;
    localStorage.setItem('gridColumns', columns);
    
    // ボタンのactiveクラスを更新
    document.querySelectorAll('.column-selector button').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === columns) {
            btn.classList.add('active');
        }
    });
    
    // グリッドを更新
    this.updateGridLayout();
}


export function setupRangeSliders() {
    // PDスライダーの設定
    const pdMin = document.getElementById('pd-min');
    const pdMax = document.getElementById('pd-max');
    const pdValues = document.getElementById('pd-values');
    
    pdMin.min = this.pdAvailableRange.min;
    pdMin.max = this.pdAvailableRange.max;
    pdMax.min = this.pdAvailableRange.min;
    pdMax.max = this.pdAvailableRange.max;
    
    // 保存された値を復元、なければ全範囲
    pdMin.value = this.pdRange.min || this.pdAvailableRange.min;
    pdMax.value = this.pdRange.max || this.pdAvailableRange.max;
    
    this.updateRangeValues('pd');
    
    // OWスライダーの設定
    const owMin = document.getElementById('ow-min');
    const owMax = document.getElementById('ow-max');
    const owValues = document.getElementById('ow-values');
    
    owMin.min = this.owAvailableRange.min;
    owMin.max = this.owAvailableRange.max;
    owMax.min = this.owAvailableRange.min;
    owMax.max = this.owAvailableRange.max;
    
    // 保存された値を復元、なければ全範囲
    owMin.value = this.owRange.min || this.owAvailableRange.min;
    owMax.value = this.owRange.max || this.owAvailableRange.max;
    
    this.updateRangeValues('ow');
    
    // イベントリスナーの設定
    pdMin.addEventListener('input', () => {
        if (parseInt(pdMin.value) > parseInt(pdMax.value)) {
            pdMin.value = pdMax.value;
        }
        this.updateRangeValues('pd');
    });
    
    pdMax.addEventListener('input', () => {
        if (parseInt(pdMax.value) < parseInt(pdMin.value)) {
            pdMax.value = pdMin.value;
        }
        this.updateRangeValues('pd');
    });
    
    owMin.addEventListener('input', () => {
        if (parseInt(owMin.value) > parseInt(owMax.value)) {
            owMin.value = owMax.value;
        }
        this.updateRangeValues('ow');
    });
    
    owMax.addEventListener('input', () => {
        if (parseInt(owMax.value) < parseInt(owMin.value)) {
            owMax.value = owMin.value;
        }
        this.updateRangeValues('ow');
    });
}


export function updateRangeValues(type) {
    if (type === 'pd') {
        const pdMin = document.getElementById('pd-min');
        const pdMax = document.getElementById('pd-max');
        const pdValues = document.getElementById('pd-values');
        pdValues.textContent = `${pdMin.value} - ${pdMax.value}`;
        this.pdRange.min = parseInt(pdMin.value);
        this.pdRange.max = parseInt(pdMax.value);
    } else if (type === 'ow') {
        const owMin = document.getElementById('ow-min');
        const owMax = document.getElementById('ow-max');
        const owValues = document.getElementById('ow-values');
        owValues.textContent = `${owMin.value} - ${owMax.value}`;
        this.owRange.min = parseInt(owMin.value);
        this.owRange.max = parseInt(owMax.value);
    }
}


export function createFilterUI(containerId, values) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filterType = containerId.replace('-filters', '');
    const savedSelection = this.selectedFilters[filterType] || [];

    container.innerHTML = '';
    values.forEach(value => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${containerId}-${value}`;
        checkbox.value = value;
        
        // 保存されている選択状態を復元（型を文字列に統一）
        if (savedSelection.includes(String(value))) {
            checkbox.checked = true;
        }
        
        // チェック状態が変更されたら保存
        checkbox.addEventListener('change', () => {
            this.saveFilterSelection(filterType);
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = value;

        container.appendChild(checkbox);
        container.appendChild(label);
    });
}


export function saveFilterSelection(filterType) {
    const containerId = filterType + '-filters';
    const values = this.getSelectedFilterValues(containerId);
    this.selectedFilters[filterType] = values;
}


export function clearFilterSelection() {
    // すべてのチェックボックスを外す
    const seriesContainer = document.getElementById('series-filters');
    if (seriesContainer) {
        const checkboxes = seriesContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }
    
    // レンジスライダーを全範囲に戻す
    const pdMin = document.getElementById('pd-min');
    const pdMax = document.getElementById('pd-max');
    const owMin = document.getElementById('ow-min');
    const owMax = document.getElementById('ow-max');
    
    if (pdMin && pdMax) {
        pdMin.value = this.pdAvailableRange.min;
        pdMax.value = this.pdAvailableRange.max;
        this.updateRangeValues('pd');
    }
    
    if (owMin && owMax) {
        owMin.value = this.owAvailableRange.min;
        owMax.value = this.owAvailableRange.max;
        this.updateRangeValues('ow');
    }
    
    // 保存状態もクリア
    this.selectedFilters = {
        series: [],
        pd: [],
        ow: []
    };
    
    // フィルターを更新（すべて表示）
    this.updateFrameFilters();
}


export function updateFrameFilters() {
    // 選択されたフィルターを取得
    const selectedSeries = this.getSelectedFilterValues('series-filters');

    // 選択状態を保存
    this.selectedFilters.series = selectedSeries;

    // フィルタリング
    this.filteredFrames = this.availableFrames.filter(frame => {
        const filename = typeof frame === 'string' ? frame : frame.filename;
        const parsed = this.parseFrameFilename(filename);
        
        if (!parsed) return false;

        const seriesMatch = selectedSeries.length === 0 || selectedSeries.includes(parsed.series);
        const pdMatch = parsed.pd >= this.pdRange.min && parsed.pd <= this.pdRange.max;
        const owMatch = parsed.ow >= this.owRange.min && parsed.ow <= this.owRange.max;

        return seriesMatch && pdMatch && owMatch;
    });

    this.renderFrameGrid();
    
    // グリッドレイアウトを更新（画像サイズ再計算）
    setTimeout(() => this.updateGridLayout(), 100);
}


export function getSelectedFilterValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}


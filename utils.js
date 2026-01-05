// ウィンドウドラッグ機能（汎用）
export function makeDraggable(windowElement) {
    const dragBar = windowElement.querySelector('.window-drag-bar, .magnifier-drag-bar');
    if (!dragBar) return;
    
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

    // マウスイベント
    dragBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    // タッチイベント
    dragBar.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        dragStart({clientX: touch.clientX, clientY: touch.clientY});
    }, {passive: false});
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            drag({clientX: touch.clientX, clientY: touch.clientY});
        }
    }, {passive: false});
    
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault && e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, windowElement);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        
        // ウィンドウ位置を保存
        if (window.app && windowElement.id) {
            window.app.saveWindowPosition(windowElement.id);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

import { appState } from '../states/appState.js';
import { handleError } from '../utils/errorHandler.js';

let fabricCanvas = null;

// DOM Elements
const canvasEl = document.getElementById('fabricCanvas');
const penColorInput = document.getElementById('penColor');
const penSizeInput = document.getElementById('penSize');
const penModeBtn = document.getElementById('penMode');
const eraserModeBtn = document.getElementById('eraserMode');
const saveCanvasBtn = document.getElementById('saveCanvasBtn');
const resetCanvasBtn = document.getElementById('resetCanvasBtn');
const refImageInput = document.getElementById('refImageInput');
const layerListEl = document.getElementById('layerList');
const moveUpBtn = document.getElementById('moveUpBtn');
const moveDownBtn = document.getElementById('moveDownBtn');
const layerOpacityInput = document.getElementById('layerOpacity');
const savedCanvasList = document.getElementById('savedCanvasList');

export function initCanvasService() {
    try {
        if (!canvasEl) throw new Error('Elemen fabricCanvas tidak ditemukan!');
        
        fabricCanvas = new fabric.Canvas(canvasEl, {
            backgroundColor: '#0a0a0a',
            isDrawingMode: true
        });
        
        // Set initial size
        fabricCanvas.setDimensions({ 
            width: canvasEl.clientWidth || 300, 
            height: canvasEl.clientWidth || 300 
        });

        setupDrawingMode();
        renderLayerList();

        // Attach Events
        attachCanvasEvents();
        attachLayerEvents();
        attachToolEvents();
        attachSaveResetEvents();
        attachRefImageEvent();

    } catch (error) {
        handleError(error, 'CanvasService - Init');
    }
}

export function getFabricCanvas() {
    return fabricCanvas;
}

// --- Tool Logic ---
function setupDrawingMode() {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = penColorInput.value;
    fabricCanvas.freeDrawingBrush.width = parseInt(penSizeInput.value, 10);
    fabricCanvas.freeDrawingBrush.globalCompositeOperation = 'source-over';
    penModeBtn.classList.add('active');
    eraserModeBtn.classList.remove('active');
}

function setupEraserMode() {
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = '#000000';
    fabricCanvas.freeDrawingBrush.width = parseInt(penSizeInput.value, 10) * 3;
    fabricCanvas.freeDrawingBrush.globalCompositeOperation = 'destination-out';
    penModeBtn.classList.remove('active');
    eraserModeBtn.classList.add('active');
}

function attachToolEvents() {
    penModeBtn.addEventListener('click', setupDrawingMode);
    eraserModeBtn.addEventListener('click', setupEraserMode);

    penColorInput.addEventListener('input', (e) => {
        if (fabricCanvas?.freeDrawingBrush && !eraserModeBtn.classList.contains('active')) {
            fabricCanvas.freeDrawingBrush.color = e.target.value;
        }
    });

    penSizeInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (fabricCanvas?.freeDrawingBrush) {
            fabricCanvas.freeDrawingBrush.width = eraserModeBtn.classList.contains('active') ? val * 3 : val;
        }
    });
}

// --- Layer Logic ---
function renderLayerList() {
    try {
        const objects = fabricCanvas?.getObjects() || [];
        if (objects.length === 0) {
            layerListEl.innerHTML = `<div style="font-size:11px; color:#555; text-align:center; padding:10px 0;">Belum ada layer</div>`;
            return;
        }
        
        layerListEl.innerHTML = '';
        objects.slice().reverse().forEach((obj, index) => {
            const li = document.createElement('div');
            li.className = 'layer-item';
            let icon = '<i class="fas fa-shape"></i>';
            if (obj.type === 'image') icon = '<i class="fas fa-image"></i>';
            if (obj.type === 'path') icon = '<i class="fas fa-pen"></i>';

            li.innerHTML = `<div><span class="layer-icon">${icon}</span> Layer ${objects.length - index}</div>`;
            
            if (obj === fabricCanvas.getActiveObject()) {
                li.classList.add('active');
                layerOpacityInput.value = Math.round(obj.opacity * 100);
            }

            // Drag & Drop Logic
            li.setAttribute('draggable', 'true');
            li.dataset.index = objects.length - 1 - index;

            li.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', li.dataset.index);
                li.style.opacity = '0.5';
            });
            li.addEventListener('dragend', (e) => { li.style.opacity = '1'; });
            li.addEventListener('dragover', (e) => { e.preventDefault(); });
            li.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const toIndex = parseInt(li.dataset.index, 10);
                if (fromIndex !== toIndex && fabricCanvas) {
                    const obj = fabricCanvas.getObjects()[fromIndex];
                    fabricCanvas.moveTo(obj, toIndex);
                    fabricCanvas.renderAll();
                    renderLayerList();
                }
            });

            li.addEventListener('click', () => {
                const obj = fabricCanvas.getObjects()[parseInt(li.dataset.index, 10)];
                fabricCanvas.setActiveObject(obj);
                renderLayerList();
            });
            layerListEl.appendChild(li);
        });
    } catch (error) {
        handleError(error, 'CanvasService - Render Layer List');
    }
}

function attachLayerEvents() {
    layerOpacityInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) / 100;
        const active = fabricCanvas?.getActiveObject();
        if (active) {
            active.set('opacity', val);
            fabricCanvas.renderAll();
        }
    });

    moveUpBtn.addEventListener('click', () => {
        const active = fabricCanvas?.getActiveObject();
        if (active) { fabricCanvas.bringForward(active); renderLayerList(); }
    });

    moveDownBtn.addEventListener('click', () => {
        const active = fabricCanvas?.getActiveObject();
        if (active) { fabricCanvas.sendBackwards(active); renderLayerList(); }
    });
    
    // Sync Layer List pada event Fabric
    if(fabricCanvas) {
        fabricCanvas.on('object:added', renderLayerList);
        fabricCanvas.on('object:removed', renderLayerList);
        fabricCanvas.on('object:selected', renderLayerList);
        fabricCanvas.on('object:modified', renderLayerList);
    }
}

// --- Save & Reset Logic ---
function attachSaveResetEvents() {
    resetCanvasBtn.addEventListener('click', () => {
        try {
            if(!fabricCanvas) return;
            fabricCanvas.clear();
            fabricCanvas.backgroundColor = '#0a0a0a';
            fabricCanvas.renderAll();
            renderLayerList();
            setupDrawingMode();
        } catch (error) {
            handleError(error, 'CanvasService - Reset Canvas');
        }
    });

    saveCanvasBtn.addEventListener('click', () => {
        try {
            if(!fabricCanvas) return;
            const svgString = fabricCanvas.toSVG();
            const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            
            appState.savedImages.push(url);
            renderSavedImages();
        } catch (error) {
            handleError(error, 'CanvasService - Save SVG');
        }
    });
}

function renderSavedImages() {
    savedCanvasList.innerHTML = '';
    if (appState.savedImages.length === 0) {
        savedCanvasList.innerHTML = `<div style="font-size:11px; color:#555; text-align:center; padding:20px 0; grid-column: 1/-1;">Belum ada gambar disimpan</div>`;
        return;
    }
    appState.savedImages.forEach((blobUrl) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'saved-canvas-item';
        const img = document.createElement('img');
        img.src = blobUrl;
        wrapper.appendChild(img);
        savedCanvasList.appendChild(wrapper);
    });
}

// --- Upload Referensi Image ---
function attachRefImageEvent() {
    refImageInput.addEventListener('change', (e) => {
        try {
            const file = e.target.files[0];
            if(file && fabricCanvas) {
                const url = URL.createObjectURL(file);
                fabric.Image.fromURL(url, (img) => {
                    const canvasWidth = fabricCanvas.getWidth();
                    const scale = canvasWidth / img.width * 0.6; 
                    img.scale(scale);
                    img.set({
                        left: (canvasWidth - img.width * scale) / 2,
                        top: (canvasWidth - img.height * scale) / 2
                    });
                    fabricCanvas.add(img);
                    fabricCanvas.setActiveObject(img);
                    renderLayerList();
                });
            }
        } catch (error) {
            handleError(error, 'CanvasService - Upload Reference Image');
        }
    });
}
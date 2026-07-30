import { appState } from '../states/appState.js';
import { getActiveAssets } from './assetService.js';
import { handleError } from '../utils/errorHandler.js';

let previewCanvas = null;
const previewContainer = document.getElementById('preview-area');
const svgCache = {};

export function initPatternGeneratorService() {
    try {
        if (!previewContainer) throw new Error('Elemen preview-area tidak ditemukan!');
        
        previewContainer.innerHTML = ''; 
        previewCanvas = new fabric.Canvas(previewContainer, {
            backgroundColor: '#1e1e1e',
            selection: false
        });
        
        setTimeout(() => { 
            previewCanvas.setWidth(previewContainer.clientWidth || 400);
            previewCanvas.setHeight(previewContainer.clientWidth || 400);
            generatePreviewPattern(); 
        }, 100);

        window.addEventListener('resize', () => {
            if(previewCanvas) {
                previewCanvas.setWidth(previewContainer.clientWidth || 400);
                previewCanvas.setHeight(previewContainer.clientWidth || 400);
                generatePreviewPattern();
            }
        });

    } catch (error) {
        handleError(error, 'PatternGeneratorService - Init');
    }
}

export async function generatePreviewPattern() {
    try {
        if (!previewCanvas) return;

        const activeAssets = getActiveAssets();
        if (activeAssets.length === 0) {
            previewCanvas.clear();
            previewCanvas.backgroundColor = '#1e1e1e';
            previewCanvas.renderAll();
            return; 
        }

        const preset = appState.activePreset;
        const objectSize = appState.objectSize;
        const variation = appState.variation / 100;

        previewCanvas.clear();
        previewCanvas.backgroundColor = '#1e1e1e';

        const width = previewCanvas.getWidth();
        const height = previewCanvas.getHeight();

        const layoutFunctions = {
            'Scatter': generateScatter,
            'Grid': generateGrid,
            'Staggered': generateStaggered,
            'Diagonal': generateDiagonal,
            'Cluster': generateCluster,
            'Radial': generateRadial,
            'Spiral': generateSpiral,
            'Wave': generateWave,
            'Zigzag': generateZigzag,
            'Concentric': generateConcentric
        };

        if (layoutFunctions[preset]) {
            await layoutFunctions[preset](previewCanvas, activeAssets, width, height, objectSize, variation);
        } else {
            await generateGrid(previewCanvas, activeAssets, width, height, objectSize, variation); 
        }

        previewCanvas.renderAll();

    } catch (error) {
        handleError(error, 'PatternGeneratorService - Generate Pattern');
    }
}

// HELPER: Load, Cache, Clone, dan Warnai SVG 
async function loadSVG(url) {
    if (svgCache[url]) return svgCache[url];
    
    return new Promise((resolve, reject) => {
        fabric.loadSVGFromURL(url, (objects, options) => {
            const group = fabric.util.groupSVGElements(objects, options);
            svgCache[url] = group;
            resolve(group);
        }, reject);
    });
}

async function createFabricSVG(asset, x, y, size) {
    try {
        // 1. Ambil template dari cache
        const templateGroup = await loadSVG(asset.iconUrl);
        
        // 2. Clone dalam (Deep Clone)
        const cloneGroup = fabric.util.object.clone(templateGroup);
        
        // 3. Terapkan Skala & Posisi
        // Pastikan tidak membagi dengan nol jika width/height 0
        const maxDim = Math.max(cloneGroup.width, cloneGroup.height) || 1;
        const scale = size / maxDim;
        cloneGroup.scale(scale);
        cloneGroup.set({ 
            left: x, 
            top: y, 
            originX: 'center', 
            originY: 'center' 
        });

        // 4. Warnai Ulang Seluruh Elemen Path di dalam Group
        // Catatan: SVG FontAwesome menggunakan "currentColor" atau hitam. 
        // Kita perlu mengisi ulang semua path.
        cloneGroup.forEachObject((obj) => {
            if (obj.type === 'path' || obj.type === 'circle' || obj.type === 'rect') {
                obj.set({ fill: asset.color });
                // Hapus stroke agar warnanya solid
                obj.set({ stroke: '' }); 
            }
        });

        return cloneGroup;
    } catch (error) {
        handleError(error, `createFabricSVG - Gagal memuat ${asset.iconUrl}`);
        return null; 
    }
}

// --- LOGIKA PRESET (DIUBAH MENJADI ASYNC) ---
async function generateScatter(canvas, assets, w, h, size, variation) {
    const total = assets.length * 10; 
    const promises = [];
    for(let i=0; i<total; i++) {
        const asset = assets[i % assets.length];
        const x = Math.random() * w;
        const y = Math.random() * h;
        const scale = 0.5 + (Math.random() * 0.8); 
        promises.push(createFabricSVG(asset, x, y, size * scale));
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateGrid(canvas, assets, w, h, size, variation) {
    const cols = Math.floor(w / (size * 1.8));
    const rows = Math.floor(h / (size * 1.8));
    const spacingX = w / (cols + 1);
    const spacingY = h / (rows + 1);
    
    let idx = 0;
    const promises = [];
    for(let r=1; r<=rows; r++) {
        for(let c=1; c<=cols; c++) {
            const asset = assets[idx % assets.length];
            const x = c * spacingX;
            const y = r * spacingY;
            promises.push(createFabricSVG(asset, x, y, size));
            idx++;
        }
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateStaggered(canvas, assets, w, h, size, variation) {
    const cols = Math.floor(w / (size * 1.8));
    const rows = Math.floor(h / (size * 1.8));
    const spacingX = w / (cols + 1);
    const spacingY = h / (rows + 1);
    
    let idx = 0;
    const promises = [];
    for(let r=1; r<=rows; r++) {
        let offsetX = 0;
        if(r % 2 === 0) offsetX = spacingX / 2;
        
        for(let c=1; c<=cols; c++) {
            const asset = assets[idx % assets.length];
            const x = (c * spacingX) + offsetX;
            const y = r * spacingY;
            promises.push(createFabricSVG(asset, x, y, size));
            idx++;
        }
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

// ... (Fungsi preset lain: generateDiagonal, generateCluster, dll. Ikuti pola yang sama: buat array promises, await Promise.all, lalu add ke canvas) ...
// (Untuk menghemat token, saya tulis sisanya di bawah ini mengikuti pola yang sama)

async function generateDiagonal(canvas, assets, w, h, size, variation) {
    const step = size * 1.5;
    let idx = 0;
    const promises = [];
    for(let i=0; i<Math.max(w,h); i+=step) {
        const asset = assets[idx % assets.length];
        const x = i;
        const y = i;
        promises.push(createFabricSVG(asset, x, y, size));
        idx++;
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateCluster(canvas, assets, w, h, size, variation) {
    const centers = [
        {x: w*0.25, y: h*0.25}, {x: w*0.75, y: h*0.25},
        {x: w*0.25, y: h*0.75}, {x: w*0.75, y: h*0.75},
        {x: w*0.5, y: h*0.5}
    ];
    let idx = 0;
    const promises = [];
    centers.forEach(center => {
        const clusterSize = 2 + Math.floor(Math.random() * 5);
        for(let i=0; i<clusterSize; i++) {
            const asset = assets[idx % assets.length];
            const offsetX = (Math.random() - 0.5) * (size * 2.5);
            const offsetY = (Math.random() - 0.5) * (size * 2.5);
            promises.push(createFabricSVG(asset, center.x + offsetX, center.y + offsetY, size * 0.8));
            idx++;
        }
    });
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateRadial(canvas, assets, w, h, size, variation) {
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.35;
    const total = assets.length * 6;
    const promises = [];
    for(let i=0; i<total; i++) {
        const angle = (i / total) * Math.PI * 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        const asset = assets[i % assets.length];
        promises.push(createFabricSVG(asset, x, y, size));
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateSpiral(canvas, assets, w, h, size, variation) {
    const cx = w / 2, cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.45;
    let radius = 0;
    let angle = 0;
    let idx = 0;
    const promises = [];
    while(radius < maxRadius) {
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        const asset = assets[idx % assets.length];
        promises.push(createFabricSVG(asset, x, y, size));
        radius += size * 0.3;
        angle += 0.8;
        idx++;
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateWave(canvas, assets, w, h, size, variation) {
    const cols = Math.floor(w / (size * 1.2));
    const spacingX = w / (cols + 1);
    const amplitude = size * 2;
    let idx = 0;
    const promises = [];
    for(let x=spacingX; x<w; x+=spacingX) {
        const y = h/2 + amplitude * Math.sin(x / (w/(Math.PI*2 * (1 + variation))));
        const asset = assets[idx % assets.length];
        promises.push(createFabricSVG(asset, x, y, size));
        idx++;
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateZigzag(canvas, assets, w, h, size, variation) {
    const cols = Math.floor(w / (size * 1.2));
    const spacingX = w / (cols + 1);
    const amplitude = size * 2.5;
    let idx = 0;
    const promises = [];
    for(let i=0; i<cols; i++) {
        const x = (i+1) * spacingX;
        const y = h/2 + (i % 2 === 0 ? -amplitude : amplitude);
        const asset = assets[idx % assets.length];
        promises.push(createFabricSVG(asset, x, y, size));
        idx++;
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}

async function generateConcentric(canvas, assets, w, h, size, variation) {
    const cx = w / 2, cy = h / 2;
    let radius = size;
    let idx = 0;
    const promises = [];
    while(radius < Math.min(w,h)/2) {
        const total = Math.floor(2 * Math.PI * radius / (size * 1.2));
        for(let i=0; i<total; i++) {
            const angle = (i / total) * Math.PI * 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            const asset = assets[idx % assets.length];
            promises.push(createFabricSVG(asset, x, y, size * 0.7));
            idx++;
        }
        radius += size * 1.2;
    }
    const results = await Promise.all(promises);
    results.forEach(obj => { if(obj) canvas.add(obj); });
}
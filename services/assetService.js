import { allAssets } from '../data/assetData.js';
import { appState, updateState } from '../states/appState.js';
import { handleError } from '../utils/errorHandler.js';
import { generatePreviewPattern } from './patternGeneratorService.js';

const categoryContainer = document.getElementById('categoryContainer');
const shapesGrid = document.getElementById('shapes-grid');

export function initAssetService() {
    try {
        renderCategories();
        renderAssets(appState.currentCategory);
    } catch (error) {
        handleError(error, 'AssetService - Init');
    }
}

// --- LOGIKA KATEGORI ---
export function renderCategories() {
    try {
        // Ambil semua kategori unik dari data aset
        const categories = ['Semua', ...new Set(allAssets.map(asset => asset.category))];
        categoryContainer.innerHTML = '';
        
        categories.forEach(cat => {
            const pill = document.createElement('div');
            // Hitung jumlah aset per kategori
            const count = cat === 'Semua' ? allAssets.length : allAssets.filter(a => a.category === cat).length;
            
            pill.className = 'category-pill' + (cat === appState.currentCategory ? ' active' : '');
            pill.innerHTML = `${cat} <span>(${count})</span>`;
            
            pill.addEventListener('click', () => {
                try {
                    // Update state global
                    updateState('currentCategory', cat);
                    
                    // Update tampilan UI kelas aktif
                    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    
                    // Render ulang grid aset sesuai kategori yang dipilih
                    renderAssets(cat);
                } catch (error) {
                    handleError(error, 'AssetService - Category Click');
                }
            });
            categoryContainer.appendChild(pill);
        });
    } catch (error) {
        handleError(error, 'AssetService - Render Categories');
    }
}

// --- LOGIKA GRID ASET (SVG) ---
export function renderAssets(category) {
    try {
        // Filter data aset berdasarkan kategori
        const filtered = category === 'Semua' ? allAssets : allAssets.filter(a => a.category === category);
        shapesGrid.innerHTML = '';
        
        if (filtered.length === 0) {
            shapesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#555; padding:20px; font-size:12px;">Tidak ada aset untuk kategori ini.</div>`;
            return;
        }

        // Loop untuk membuat elemen grid
        filtered.forEach(asset => {
            const box = document.createElement('div');
            // Terapkan warna background sesuai data aset
            box.className = `shape-icon`;
            box.style.backgroundColor = asset.color || '#333'; 
            box.style.padding = '6px';
            box.style.borderRadius = '6px';
            box.style.cursor = 'pointer';
            
            // Tampilkan SVG via tag img (pastikan path SVG valid)
            // Filter invert(1) membuat SVG putih di background gelap
            box.innerHTML = `<img src="${asset.iconUrl}" style="width:20px; height:20px; display:block; margin:auto; filter: invert(1); pointer-events: none;">`;
            
            // Event Listener: Toggle seleksi aset & trigger Preview
            box.addEventListener('click', () => {
                // Toggle class active (border kuning)
                box.classList.toggle('active'); 
                
                // Panggil Pattern Generator untuk merender ulang preview
                generatePreviewPattern(); 
            });
            
            shapesGrid.appendChild(box);
        });
    } catch (error) {
        handleError(error, 'AssetService - Render Assets');
    }
}

// --- LOGIKA PENGAMBILAN ASET AKTIF ---
export function getActiveAssets() {
    try {
        // Ambil semua elemen kotak aset yang memiliki class 'active'
        const activeElements = document.querySelectorAll('#shapes-grid .shape-icon.active');
        
        // Konversi NodeList menjadi Array data yang siap diproses oleh mesin pola
        return Array.from(activeElements).map(el => {
            const img = el.querySelector('img');
            const iconUrl = img ? img.src : '';
            // Ambil warna background dari elemen kotak
            const bgColor = el.style.backgroundColor;
            
            return {
                iconUrl: iconUrl,
                color: bgColor || '#f4b41a' // Fallback warna jika background tidak terbaca
            };
        });
    } catch (error) {
        handleError(error, 'AssetService - Get Active Assets');
        return [];
    }
}

import { allAssets } from '../data/assetData.js';
import { appState, updateState } from '../states/appState.js';
import { handleError } from '../utils/errorHandler.js';

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

export function renderCategories() {
    try {
        const categories = ['Semua', ...new Set(allAssets.map(asset => asset.category))];
        categoryContainer.innerHTML = '';
        
        categories.forEach(cat => {
            const pill = document.createElement('div');
            const count = cat === 'Semua' ? allAssets.length : allAssets.filter(a => a.category === cat).length;
            
            pill.className = 'category-pill' + (cat === appState.currentCategory ? ' active' : '');
            pill.innerHTML = `${cat} <span>(${count})</span>`;
            
            pill.addEventListener('click', () => {
                try {
                    updateState('currentCategory', cat);
                    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
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

export function renderAssets(category) {
    try {
        const filtered = category === 'Semua' ? allAssets : allAssets.filter(a => a.category === category);
        shapesGrid.innerHTML = '';
        
        if (filtered.length === 0) {
            shapesGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:#555; padding:20px; font-size:12px;">Tidak ada aset untuk kategori ini.</div>`;
            return;
        }

        filtered.forEach(asset => {
            const box = document.createElement('div');
            box.className = `shape-icon ${asset.color || 'grey'}`;
            box.innerHTML = `<i class="fas ${asset.icon}"></i>`;
            box.addEventListener('click', () => {
                box.classList.toggle('active'); // Simulasi select asset
            });
            shapesGrid.appendChild(box);
        });
    } catch (error) {
        handleError(error, 'AssetService - Render Assets');
    }
}
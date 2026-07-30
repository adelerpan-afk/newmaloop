import { initAssetService } from './services/assetService.js';
import { initInputAssetService } from './services/inputAssetService.js';
import { initCanvasService, getFabricCanvas } from './services/canvasService.js';
import { handleError } from './utils/errorHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        // 1. Inisialisasi Services
        initAssetService();
        initInputAssetService();
        initCanvasService();

        // 2. Logic Tab Switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    btn.classList.add('active');
                    document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
                    
                    // Resize canvas saat tab manual dibuka
                    const canvas = getFabricCanvas();
                    if(btn.getAttribute('data-tab') === 'tab-manual' && canvas) {
                        canvas.setDimensions({ 
                            width: canvas.wrapperEl.clientWidth, 
                            height: canvas.wrapperEl.clientWidth 
                        });
                    }
                } catch (error) {
                    handleError(error, 'Tab Switching Logic');
                }
            });
        });

        console.log('✅ Aplikasi Pattern Generator berhasil diinisialisasi.');

    } catch (error) {
        handleError(error, 'Main Application Initialization');
    }
});
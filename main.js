import { initAssetService } from './services/assetService.js';
import { initInputAssetService } from './services/inputAssetService.js';
import { initCanvasService, getFabricCanvas } from './services/canvasService.js';
import { initPatternGeneratorService, generatePreviewPattern } from './services/patternGeneratorService.js';
import { handleError } from './utils/errorHandler.js';
import { updateState } from './states/appState.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        // 1. Inisialisasi Semua Services
        initAssetService();
        initInputAssetService();
        initCanvasService();
        initPatternGeneratorService(); // Inisialisasi Preview

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

        // 3. Logic Preset & Slider (Update Live Preview)
        const presetItems = document.querySelectorAll('.preset-item');
        presetItems.forEach(item => {
            item.addEventListener('click', () => {
                // Hapus active class dari semua preset
                presetItems.forEach(p => p.classList.remove('active'));
                // Tambah active ke yang diklik
                item.classList.add('active');
                
                // Update State
                const presetName = item.textContent.trim().replace(/[^a-zA-Z]/g, '');
                updateState('activePreset', presetName);
                
                // Generate ulang pattern
                generatePreviewPattern();
            });
        });

        // Slider Ukuran & Variasi
        const sizeInput = document.querySelector('.param-item input[type="range"]');
        const variationInput = document.querySelectorAll('.param-item input[type="range"]')[1];
        
        const handleSliderChange = () => {
            updateState('objectSize', parseInt(sizeInput.value, 10));
            updateState('variation', parseInt(variationInput.value, 10));
            generatePreviewPattern();
        };

        sizeInput.addEventListener('input', handleSliderChange);
        variationInput.addEventListener('input', handleSliderChange);

        console.log('✅ Aplikasi Pattern Generator berhasil diinisialisasi.');

    } catch (error) {
        handleError(error, 'Main Application Initialization');
    }
});

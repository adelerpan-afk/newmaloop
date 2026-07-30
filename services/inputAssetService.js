import { appState } from '../states/appState.js';
import { handleError } from '../utils/errorHandler.js';

const fileInput = document.getElementById('fileUploadInput');
const uploadedAssetList = document.getElementById('uploadedAssetList');

export function initInputAssetService() {
    try {
        // Ubah atribut HTML menjadi hanya menerima SVG
        fileInput.setAttribute('accept', '.svg');
        fileInput.removeEventListener('change', handleFileChange);
        fileInput.addEventListener('change', handleFileChange);
        renderUploadedFiles();
    } catch (error) {
        handleError(error, 'InputAssetService - Init');
    }
}

function handleFileChange(e) {
    try {
        const files = Array.from(e.target.files);
        const validFiles = [];

        files.forEach(file => {
            // Validasi apakah file adalah SVG asli
            if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
                if (!appState.uploadedFiles.find(f => f.name === file.name)) {
                    validFiles.push(file);
                }
            } else {
                alert(`File "${file.name}" ditolak. Hanya file .svg yang diizinkan sebagai aset vektor!`);
            }
        });

        if (validFiles.length > 0) {
            appState.uploadedFiles.push(...validFiles);
            renderUploadedFiles();
        }
        e.target.value = '';
    } catch (error) {
        handleError(error, 'InputAssetService - Handle File Change');
    }
}

export function renderUploadedFiles() {
    try {
        uploadedAssetList.innerHTML = '';
        if (appState.uploadedFiles.length === 0) {
            uploadedAssetList.innerHTML = `<div style="font-size:11px; color:#555; text-align:center; padding:20px 0;">Belum ada aset .svg diunggah</div>`;
            return;
        }

        appState.uploadedFiles.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <input type="checkbox" id="file-${index}" checked>
                <img src="${url}" class="file-thumb" alt="Thumbnail" style="border:1px solid #555;">
                <span class="file-name">${file.name.length > 12 ? file.name.substring(0, 10)+'...' : file.name}</span>
                <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
            `;
            uploadedAssetList.appendChild(item);
        });
    } catch (error) {
        handleError(error, 'InputAssetService - Render Uploaded Files');
    }
}

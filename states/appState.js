export const appState = {
    currentCategory: 'Semua',
    uploadedFiles: [],
    savedImages: [],
    
    // --- State Baru untuk Live Preview ---
    activePreset: 'Grid', // Default preset
    objectSize: 45,       // Ambil dari slider "Ukuran Objek"
    variation: 50         // Ambil dari slider "Variasi"
};

export function updateState(key, value) {
    if (key in appState) {
        appState[key] = value;
    } else {
        console.warn(`State key "${key}" tidak ditemukan.`);
    }
}

export const appState = {
    currentCategory: 'Semua',
    uploadedFiles: [],
    savedImages: []
};

// Fungsi utilitas untuk update state agar lebih terkontrol
export function updateState(key, value) {
    if (key in appState) {
        appState[key] = value;
    } else {
        console.warn(`State key "${key}" tidak ditemukan.`);
    }
}
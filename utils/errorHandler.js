export function handleError(error, context = 'Unknown Context') {
    console.error(`❌ Error pada "${context}":`, error);
    
    // Handle specific errors
    if (error instanceof TypeError) {
        console.warn('⚠️ Type Error: Periksa kembali tipe data yang diproses.');
    } else if (error instanceof DOMException) {
        console.warn('⚠️ DOM Exception: Kemungkinan gagal mengambil elemen HTML.');
    }

    // Notifikasi ke user (Opsional: Bisa diganti Toast UI yang lebih cantik)
    alert(`Terjadi kesalahan pada modul "${context}". Lihat konsol (F12) untuk detail.`);
}
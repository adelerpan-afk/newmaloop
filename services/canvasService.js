// ... Potong bagian atas, fokus pada perubahan di `attachRefImageEvent` ...
const refImageInput = document.getElementById('refImageInput');

export function initCanvasService() {
    // ... (Kode awal tetap sama) ...
    refImageInput.setAttribute('accept', '.svg'); // Ubah accept
    // ...
}

function attachRefImageEvent() {
    refImageInput.addEventListener('change', (e) => {
        try {
            const file = e.target.files[0];
            if(file) {
                // Validasi
                if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
                    alert('Hanya file .svg yang diizinkan untuk gambar referensi agar output tetap vektor!');
                    e.target.value = '';
                    return;
                }

                if(fabricCanvas) {
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
            }
        } catch (error) {
            handleError(error, 'CanvasService - Upload Reference Image');
        }
    });
}

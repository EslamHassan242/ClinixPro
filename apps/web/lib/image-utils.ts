/**
 * Compresses an image file using the Canvas API.
 * Reduces dimensions if too large and lowers quality to save storage.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.6): Promise<File> {
    // Only compress images
    if (!file.type.startsWith('image/')) return file;

    // Don't compress small images or GIFs
    if (file.size < 200 * 1024 || file.type === 'image/gif') return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);

            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not available'));

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Canvas toBlob failed'));

                // Create a new File object from the blob
                const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });

                console.log(`Image compressed: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB`);
                resolve(compressedFile);
            }, 'image/jpeg', quality);
        };

        img.onerror = (err) => reject(err);
    });
}

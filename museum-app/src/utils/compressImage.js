/**
 * Client-side image compression using Canvas API.
 * Zero dependencies — pure browser APIs.
 *
 * @param {File} file        — Original image file
 * @param {Object} options   — Compression options
 * @param {number} options.maxWidth   — Max width in px (default 1600)
 * @param {number} options.maxHeight  — Max height in px (default 1600)
 * @param {number} options.quality    — JPEG quality 0-1 (default 0.82)
 * @param {string} options.mimeType   — Output MIME type (default 'image/jpeg')
 * @returns {Promise<{ file: File, savedPercent: number }>}
 */
export async function compressImage(file, options = {}) {
    const {
        maxWidth = 2000,
        maxHeight = 2000,
        quality = 0.95,
        mimeType = 'image/jpeg'
    } = options;

    // Skip non-image files
    if (!file.type.startsWith('image/')) return { file, savedPercent: 0 };

    // Skip GIFs (animation would be lost)
    if (file.type === 'image/gif') return { file, savedPercent: 0 };

    // Skip already-small files (< 200KB)
    if (file.size < 200 * 1024) return { file, savedPercent: 0 };

    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate new dimensions maintaining aspect ratio
            let { width, height } = img;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Draw to canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');

            // Enable high-quality downscaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob || blob.size >= file.size) {
                        // Compression made it bigger — return original
                        resolve({ file, savedPercent: 0 });
                        return;
                    }

                    const ext = mimeType === 'image/webp' ? '.webp' : '.jpg';
                    const name = file.name.replace(/\.[^.]+$/, '') + ext;
                    const compressed = new File([blob], name, { type: mimeType });

                    const savedPercent = Math.round((1 - compressed.size / file.size) * 100);
                    resolve({ file: compressed, savedPercent });
                },
                mimeType,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve({ file, savedPercent: 0 }); // Fallback to original
        };

        img.src = url;
    });
}

/** Format bytes to human readable string */
export function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

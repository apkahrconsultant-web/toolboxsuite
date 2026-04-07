import { removeBackground } from '@imgly/background-removal';
import { setupDropZone } from './main.js';

/**
 * Force-download a blob by creating a temporary anchor in the DOM.
 * This is the most reliable cross-browser method and always triggers
 * the browser's native "Save As" dialog → Downloads folder.
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // small delay before cleanup so the browser can start the download
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 150);
}

export function initBackgroundRemover() {
    const uploadZone = document.getElementById('bg-upload-zone');
    const fileInput = document.getElementById('bg-file-input');
    const browseBtn = document.getElementById('bg-browse-btn');
    const resultArea = document.getElementById('bg-result');
    const progressArea = document.getElementById('bg-progress');
    const progressText = document.getElementById('bg-progress-text');
    const originalImg = document.getElementById('bg-original');
    const processedImg = document.getElementById('bg-processed');
    const downloadBtn = document.getElementById('bg-download-btn');
    const resetBtn = document.getElementById('bg-reset-btn');

    let processedBlob = null;
    let processedBlobUrl = null;
    let originalFileName = 'image';

    setupDropZone(uploadZone, fileInput);

    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;

        // Remember name for download
        originalFileName = file.name.replace(/\.[^.]+$/, '');

        // Show original
        const originalUrl = URL.createObjectURL(file);
        originalImg.src = originalUrl;

        // Show progress, hide everything else
        uploadZone.style.display = 'none';
        resultArea.style.display = 'none';
        progressArea.style.display = 'flex';
        progressText.textContent = 'Loading AI model… This may take a moment on first run.';

        try {
            const blob = await removeBackground(file, {
                progress: (key, current, total) => {
                    if (key === 'compute:inference') {
                        progressText.textContent = 'Removing background…';
                    }
                },
            });

            // Store the actual blob for download
            processedBlob = blob;
            processedBlobUrl = URL.createObjectURL(blob);
            processedImg.src = processedBlobUrl;

            progressArea.style.display = 'none';
            resultArea.style.display = 'block';
        } catch (err) {
            console.error('Background removal failed:', err);
            progressText.textContent = `Error: ${err.message}. Please try again.`;
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (!processedBlob) return;
        downloadBlob(processedBlob, `${originalFileName}-no-bg.png`);
    });

    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        resultArea.style.display = 'none';
        uploadZone.style.display = '';
        processedBlob = null;
        if (processedBlobUrl) {
            URL.revokeObjectURL(processedBlobUrl);
            processedBlobUrl = null;
        }
    });
}

import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import { setupDropZone } from './main.js';

export function initWordToPdf() {
    const uploadZone = document.getElementById('w2p-upload-zone');
    const fileInput = document.getElementById('w2p-file-input');
    const browseBtn = document.getElementById('w2p-browse-btn');
    const fileInfo = document.getElementById('w2p-file-info');
    const fileName_ = document.getElementById('w2p-file-name');
    const actions = document.getElementById('w2p-actions');
    const convertBtn = document.getElementById('w2p-convert-btn');
    const resetBtn = document.getElementById('w2p-reset-btn');
    const progressArea = document.getElementById('w2p-progress');
    const progressText = document.getElementById('w2p-progress-text');
    const successArea = document.getElementById('w2p-success');
    const newBtn = document.getElementById('w2p-new-btn');

    let selectedFile = null;

    setupDropZone(uploadZone, fileInput);

    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        selectedFile = file;
        fileName_.textContent = `📝 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        uploadZone.style.display = 'none';
        fileInfo.style.display = 'flex';
        actions.style.display = 'flex';
        successArea.style.display = 'none';
    });

    resetBtn.addEventListener('click', () => resetState());

    function resetState() {
        fileInput.value = '';
        selectedFile = null;
        uploadZone.style.display = '';
        fileInfo.style.display = 'none';
        actions.style.display = 'none';
        progressArea.style.display = 'none';
        successArea.style.display = 'none';
    }

    convertBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        actions.style.display = 'none';
        fileInfo.style.display = 'none';
        progressArea.style.display = 'flex';
        progressText.textContent = 'Reading Word document…';

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();

            progressText.textContent = 'Converting to HTML…';
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;

            progressText.textContent = 'Generating PDF…';

            // Create a styled container for the HTML
            const container = document.createElement('div');
            container.innerHTML = html;
            container.style.cssText = `
        font-family: 'Inter', Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #1a1a1a;
        padding: 0;
      `;

            const baseName = selectedFile.name.replace(/\.docx?$/i, '');

            const opt = {
                margin: [15, 15, 15, 15],
                filename: `${baseName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            };

            await html2pdf().set(opt).from(container).save();

            progressArea.style.display = 'none';
            successArea.style.display = 'block';
        } catch (err) {
            console.error('Word to PDF conversion failed:', err);
            progressText.textContent = `Error: ${err.message}`;
        }
    });

    newBtn.addEventListener('click', () => resetState());
}

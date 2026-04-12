import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, PageBreak } from 'docx';
import { saveAs } from 'file-saver';
import { setupDropZone } from './main.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

export function initPdfToWord() {
    const uploadZone = document.getElementById('p2w-upload-zone');
    const fileInput = document.getElementById('p2w-file-input');
    const browseBtn = document.getElementById('p2w-browse-btn');
    const fileInfo = document.getElementById('p2w-file-info');
    const fileName = document.getElementById('p2w-file-name');
    const actions = document.getElementById('p2w-actions');
    const convertBtn = document.getElementById('p2w-convert-btn');
    const resetBtn = document.getElementById('p2w-reset-btn');
    const progressArea = document.getElementById('p2w-progress');
    const progressText = document.getElementById('p2w-progress-text');
    const successArea = document.getElementById('p2w-success');
    const newBtn = document.getElementById('p2w-new-btn');

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
        fileName.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
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
        progressText.textContent = 'Reading PDF…';

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;

            const paragraphs = [];

            for (let i = 1; i <= numPages; i++) {
                progressText.textContent = `Extracting page ${i} of ${numPages}…`;
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Group text items into lines by Y position
                const lines = {};
                textContent.items.forEach((item) => {
                    const y = Math.round(item.transform[5]);
                    if (!lines[y]) lines[y] = [];
                    lines[y].push(item.str);
                });

                // Sort by Y (descending = top to bottom) and join
                const sortedYs = Object.keys(lines)
                    .map(Number)
                    .sort((a, b) => b - a);

                sortedYs.forEach((y) => {
                    const lineText = lines[y].join(' ').trim();
                    if (lineText) {
                        paragraphs.push(
                            new Paragraph({
                                children: [new TextRun({ text: lineText, size: 24 })],
                            })
                        );
                    }
                });

                // Add page break between pages (except last)
                if (i < numPages) {
                    paragraphs.push(
                        new Paragraph({
                            children: [new PageBreak()],
                        })
                    );
                }
            }

            progressText.textContent = 'Building Word document…';

            const doc = new Document({
                sections: [{ children: paragraphs }],
            });

            const blob = await Packer.toBlob(doc);
            const baseName = selectedFile.name.replace(/\.pdf$/i, '');
            saveAs(blob, `${baseName}.docx`);

            progressArea.style.display = 'none';
            successArea.style.display = 'block';
        } catch (err) {
            console.error('PDF to Word conversion failed:', err);
            progressText.textContent = `Error: ${err.message}`;
        }
    });

    newBtn.addEventListener('click', () => resetState());
}

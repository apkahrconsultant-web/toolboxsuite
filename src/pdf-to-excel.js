import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { setupDropZone } from './main.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

export function initPdfToExcel() {
    const uploadZone = document.getElementById('p2e-upload-zone');
    const fileInput = document.getElementById('p2e-file-input');
    const browseBtn = document.getElementById('p2e-browse-btn');
    const fileInfo = document.getElementById('p2e-file-info');
    const fileName_ = document.getElementById('p2e-file-name');
    const actions = document.getElementById('p2e-actions');
    const convertBtn = document.getElementById('p2e-convert-btn');
    const resetBtn = document.getElementById('p2e-reset-btn');
    const progressArea = document.getElementById('p2e-progress');
    const progressText = document.getElementById('p2e-progress-text');
    const successArea = document.getElementById('p2e-success');
    const newBtn = document.getElementById('p2e-new-btn');

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
        fileName_.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
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

            const allRows = [];

            for (let i = 1; i <= numPages; i++) {
                progressText.textContent = `Extracting page ${i} of ${numPages}…`;
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();

                // Group text items into rows by Y position
                const lines = {};
                textContent.items.forEach((item) => {
                    const y = Math.round(item.transform[5]);
                    if (!lines[y]) lines[y] = [];
                    lines[y].push({ x: item.transform[4], text: item.str });
                });

                // Sort each line by X position and then by Y (descending = top to bottom)
                const sortedYs = Object.keys(lines)
                    .map(Number)
                    .sort((a, b) => b - a);

                sortedYs.forEach((y) => {
                    const lineItems = lines[y].sort((a, b) => a.x - b.x);
                    // Try to split into columns based on spacing
                    const row = [];
                    let lastX = -1;
                    lineItems.forEach((item) => {
                        if (lastX !== -1 && item.x - lastX > 30) {
                            // Gap detected — new column
                            row.push(item.text.trim());
                        } else if (row.length === 0) {
                            row.push(item.text.trim());
                        } else {
                            row[row.length - 1] += ' ' + item.text.trim();
                        }
                        lastX = item.x + (item.text.length * 5); // rough char width estimate
                    });

                    if (row.some((cell) => cell.length > 0)) {
                        allRows.push(row);
                    }
                });

                // Add empty row between pages
                if (i < numPages) allRows.push([]);
            }

            progressText.textContent = 'Building Excel file…';

            const ws = XLSX.utils.aoa_to_sheet(allRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const baseName = selectedFile.name.replace(/\.pdf$/i, '');
            saveAs(blob, `${baseName}.xlsx`);

            progressArea.style.display = 'none';
            successArea.style.display = 'block';
        } catch (err) {
            console.error('PDF to Excel conversion failed:', err);
            progressText.textContent = `Error: ${err.message}`;
        }
    });

    newBtn.addEventListener('click', () => resetState());
}

import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { setupDropZone } from './main.js';

export function initExcelToPdf() {
    const uploadZone = document.getElementById('e2p-upload-zone');
    const fileInput = document.getElementById('e2p-file-input');
    const browseBtn = document.getElementById('e2p-browse-btn');
    const fileInfo = document.getElementById('e2p-file-info');
    const fileName_ = document.getElementById('e2p-file-name');
    const actions = document.getElementById('e2p-actions');
    const convertBtn = document.getElementById('e2p-convert-btn');
    const resetBtn = document.getElementById('e2p-reset-btn');
    const progressArea = document.getElementById('e2p-progress');
    const progressText = document.getElementById('e2p-progress-text');
    const successArea = document.getElementById('e2p-success');
    const newBtn = document.getElementById('e2p-new-btn');

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
        fileName_.textContent = `📊 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
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
        progressText.textContent = 'Reading Excel file…';

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            progressText.textContent = 'Building PDF…';

            // Build HTML tables for each sheet
            let htmlContent = '';
            workbook.SheetNames.forEach((sheetName, idx) => {
                const sheet = workbook.Sheets[sheetName];
                const htmlTable = XLSX.utils.sheet_to_html(sheet, { editable: false });

                if (idx > 0) htmlContent += '<div style="page-break-before: always;"></div>';
                htmlContent += `
          <div style="margin-bottom: 20px;">
            <h2 style="font-family: Inter, Arial, sans-serif; color: #333; margin-bottom: 10px; font-size: 16pt;">
              ${sheetName}
            </h2>
            <div style="font-family: Inter, Arial, sans-serif; font-size: 10pt;">
              ${htmlTable}
            </div>
          </div>
        `;
            });

            // Style the tables
            const container = document.createElement('div');
            container.innerHTML = htmlContent;
            container.style.cssText = 'padding: 0; color: #1a1a1a;';

            // Style all tables inside the container
            container.querySelectorAll('table').forEach((table) => {
                table.style.cssText =
                    'border-collapse: collapse; width: 100%; margin-top: 8px;';
            });
            container.querySelectorAll('td, th').forEach((cell) => {
                cell.style.cssText =
                    'border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 9pt;';
            });
            container.querySelectorAll('th').forEach((th) => {
                th.style.cssText +=
                    'background: #f0f0f0; font-weight: 600;';
            });

            const baseName = selectedFile.name.replace(/\.(xlsx?|csv)$/i, '');

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `${baseName}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            };

            await html2pdf().set(opt).from(container).save();

            progressArea.style.display = 'none';
            successArea.style.display = 'block';
        } catch (err) {
            console.error('Excel to PDF conversion failed:', err);
            progressText.textContent = `Error: ${err.message}`;
        }
    });

    newBtn.addEventListener('click', () => resetState());
}

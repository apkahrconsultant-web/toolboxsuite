import './style.css';
import { initBackgroundRemover } from './background-remover.js';
import { initPdfToWord } from './pdf-to-word.js';
import { initWordToPdf } from './word-to-pdf.js';
import { initExcelToPdf } from './excel-to-pdf.js';
import { initPdfToExcel } from './pdf-to-excel.js';
import { initImageCompressor } from './image-compressor.js';
import { initPdfMerger } from './pdf-merger.js';
import { initImageResizer } from './image-resizer.js';
import { initJpgToPng } from './jpg-to-png.js';

/* ─── Tab Switching ─── */
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    panels.forEach((p) => p.classList.remove('active'));
    document.getElementById(`panel-${target}`).classList.add('active');
  });
});

/* ─── Drag & Drop helpers ─── */
function setupDropZone(zoneEl, fileInput) {
  zoneEl.addEventListener('click', (e) => {
    if (e.target.closest('.link-btn') || e.target === zoneEl || e.target.closest('.upload-placeholder')) {
      fileInput.click();
    }
  });

  zoneEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    zoneEl.classList.add('drag-over');
  });

  zoneEl.addEventListener('dragleave', () => {
    zoneEl.classList.remove('drag-over');
  });

  zoneEl.addEventListener('drop', (e) => {
    e.preventDefault();
    zoneEl.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event('change'));
    }
  });
}

export { setupDropZone };

/* ─── Init features ─── */
initBackgroundRemover();
initPdfToWord();
initWordToPdf();
initExcelToPdf();
initPdfToExcel();
initImageCompressor();
initPdfMerger();
initImageResizer();
initJpgToPng();

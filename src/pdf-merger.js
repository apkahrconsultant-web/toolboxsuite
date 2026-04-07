import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export function initPdfMerger() {
  const uploadZone = document.getElementById('pm-upload-zone');
  const fileInput = document.getElementById('pm-file-input');
  const browseBtn = document.getElementById('pm-browse-btn');
  const fileList = document.getElementById('pm-file-list');
  const fileListContainer = document.getElementById('pm-file-list-container');
  const mergeBtn = document.getElementById('pm-merge-btn');
  const actionsArea = document.getElementById('pm-actions');
  const progressArea = document.getElementById('pm-progress');
  const successArea = document.getElementById('pm-success');
  const resetBtn = document.getElementById('pm-reset-btn');
  const newBtn = document.getElementById('pm-new-btn');

  let pdfFiles = [];

  // Click to browse
  uploadZone.addEventListener('click', (e) => {
    if (e.target.closest('.link-btn') || e.target === uploadZone || e.target.closest('.upload-placeholder')) {
      fileInput.click();
    }
  });

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  // Drag & drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const files = [...e.dataTransfer.files].filter((f) => f.type === 'application/pdf');
    if (files.length) addFiles(files);
  });

  fileInput.addEventListener('change', () => {
    const files = [...fileInput.files];
    if (files.length) addFiles(files);
    fileInput.value = '';
  });

  function addFiles(files) {
    pdfFiles.push(...files);
    renderFileList();
  }

  function renderFileList() {
    fileList.innerHTML = '';
    pdfFiles.forEach((file, index) => {
      const li = document.createElement('li');
      li.className = 'pm-file-item';
      li.innerHTML = `
        <span class="pm-file-num">${index + 1}</span>
        <span class="pm-file-name">${file.name}</span>
        <span class="pm-file-size">${formatSize(file.size)}</span>
        <button class="btn secondary small pm-remove-btn" data-index="${index}">✕</button>
      `;
      fileList.appendChild(li);
    });

    fileListContainer.style.display = pdfFiles.length ? 'block' : 'none';
    actionsArea.style.display = pdfFiles.length >= 2 ? 'flex' : 'none';
    successArea.style.display = 'none';
  }

  fileList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.pm-remove-btn');
    if (removeBtn) {
      const idx = parseInt(removeBtn.dataset.index);
      pdfFiles.splice(idx, 1);
      renderFileList();
    }
  });

  mergeBtn.addEventListener('click', async () => {
    if (pdfFiles.length < 2) return;
    progressArea.style.display = 'flex';
    actionsArea.style.display = 'none';

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      saveAs(blob, 'merged.pdf');

      progressArea.style.display = 'none';
      successArea.style.display = 'block';
    } catch (err) {
      console.error('PDF merge failed:', err);
      progressArea.style.display = 'none';
      actionsArea.style.display = 'flex';
      alert('Failed to merge PDFs: ' + err.message);
    }
  });

  resetBtn.addEventListener('click', resetAll);
  newBtn.addEventListener('click', resetAll);

  function resetAll() {
    pdfFiles = [];
    fileInput.value = '';
    fileListContainer.style.display = 'none';
    actionsArea.style.display = 'none';
    successArea.style.display = 'none';
    fileList.innerHTML = '';
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

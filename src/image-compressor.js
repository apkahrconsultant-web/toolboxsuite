import { setupDropZone } from './main.js';
import { saveAs } from 'file-saver';

export function initImageCompressor() {
  const uploadZone = document.getElementById('ic-upload-zone');
  const fileInput = document.getElementById('ic-file-input');
  const browseBtn = document.getElementById('ic-browse-btn');
  const resultArea = document.getElementById('ic-result');
  const progressArea = document.getElementById('ic-progress');
  const qualitySlider = document.getElementById('ic-quality');
  const qualityValue = document.getElementById('ic-quality-value');
  const originalPreview = document.getElementById('ic-original');
  const compressedPreview = document.getElementById('ic-compressed');
  const originalSize = document.getElementById('ic-original-size');
  const compressedSize = document.getElementById('ic-compressed-size');
  const savingsEl = document.getElementById('ic-savings');
  const downloadBtn = document.getElementById('ic-download-btn');
  const resetBtn = document.getElementById('ic-reset-btn');

  let currentFile = null;
  let compressedBlob = null;

  setupDropZone(uploadZone, fileInput);

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = `${qualitySlider.value}%`;
    if (currentFile) compressImage();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    currentFile = file;
    originalSize.textContent = formatSize(file.size);
    const url = URL.createObjectURL(file);
    originalPreview.src = url;
    uploadZone.style.display = 'none';
    progressArea.style.display = 'flex';
    compressImage();
  });

  function compressImage() {
    const quality = qualitySlider.value / 100;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          compressedBlob = blob;
          compressedPreview.src = URL.createObjectURL(blob);
          compressedSize.textContent = formatSize(blob.size);
          const saved = ((1 - blob.size / currentFile.size) * 100).toFixed(1);
          savingsEl.textContent = saved > 0 ? `${saved}% smaller` : 'No reduction';
          savingsEl.style.color = saved > 0 ? 'var(--success)' : 'var(--danger)';
          progressArea.style.display = 'none';
          resultArea.style.display = 'block';
        },
        'image/jpeg',
        quality
      );
    };
    img.src = URL.createObjectURL(currentFile);
  }

  downloadBtn.addEventListener('click', () => {
    if (!compressedBlob) return;
    const name = currentFile.name.replace(/\.[^.]+$/, '');
    saveAs(compressedBlob, `${name}-compressed.jpg`);
  });

  resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    currentFile = null;
    compressedBlob = null;
    resultArea.style.display = 'none';
    uploadZone.style.display = '';
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

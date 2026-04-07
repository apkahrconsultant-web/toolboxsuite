import { setupDropZone } from './main.js';
import { saveAs } from 'file-saver';

export function initJpgToPng() {
  const uploadZone = document.getElementById('j2p-upload-zone');
  const fileInput = document.getElementById('j2p-file-input');
  const browseBtn = document.getElementById('j2p-browse-btn');
  const fileInfo = document.getElementById('j2p-file-info');
  const fileName = document.getElementById('j2p-file-name');
  const convertBtn = document.getElementById('j2p-convert-btn');
  const actionsArea = document.getElementById('j2p-actions');
  const progressArea = document.getElementById('j2p-progress');
  const successArea = document.getElementById('j2p-success');
  const resetBtn = document.getElementById('j2p-reset-btn');
  const newBtn = document.getElementById('j2p-new-btn');

  let currentFile = null;

  setupDropZone(uploadZone, fileInput);

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    currentFile = file;
    fileName.textContent = file.name;
    uploadZone.style.display = 'none';
    fileInfo.style.display = 'flex';
    actionsArea.style.display = 'flex';
    successArea.style.display = 'none';
  });

  convertBtn.addEventListener('click', () => {
    if (!currentFile) return;
    actionsArea.style.display = 'none';
    progressArea.style.display = 'flex';

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const name = currentFile.name.replace(/\.[^.]+$/, '');
        saveAs(blob, `${name}.png`);
        progressArea.style.display = 'none';
        successArea.style.display = 'block';
      }, 'image/png');
    };
    img.onerror = () => {
      progressArea.style.display = 'none';
      actionsArea.style.display = 'flex';
      alert('Failed to load the image. Please try a different file.');
    };
    img.src = URL.createObjectURL(currentFile);
  });

  resetBtn.addEventListener('click', resetAll);
  newBtn.addEventListener('click', resetAll);

  function resetAll() {
    fileInput.value = '';
    currentFile = null;
    fileInfo.style.display = 'none';
    actionsArea.style.display = 'none';
    successArea.style.display = 'none';
    uploadZone.style.display = '';
  }
}

import { setupDropZone } from './main.js';
import { saveAs } from 'file-saver';

export function initImageResizer() {
  const uploadZone = document.getElementById('ir-upload-zone');
  const fileInput = document.getElementById('ir-file-input');
  const browseBtn = document.getElementById('ir-browse-btn');
  const editorArea = document.getElementById('ir-editor');
  const preview = document.getElementById('ir-preview');
  const widthInput = document.getElementById('ir-width');
  const heightInput = document.getElementById('ir-height');
  const lockAspect = document.getElementById('ir-lock-aspect');
  const originalDims = document.getElementById('ir-original-dims');
  const resizeBtn = document.getElementById('ir-resize-btn');
  const resetBtn = document.getElementById('ir-reset-btn');
  const progressArea = document.getElementById('ir-progress');
  const successArea = document.getElementById('ir-success');
  const newBtn = document.getElementById('ir-new-btn');

  let currentFile = null;
  let naturalW = 0;
  let naturalH = 0;
  let aspectRatio = 1;

  setupDropZone(uploadZone, fileInput);

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    currentFile = file;

    const img = new Image();
    img.onload = () => {
      naturalW = img.naturalWidth;
      naturalH = img.naturalHeight;
      aspectRatio = naturalW / naturalH;
      widthInput.value = naturalW;
      heightInput.value = naturalH;
      originalDims.textContent = `Original: ${naturalW} × ${naturalH}`;
      preview.src = URL.createObjectURL(file);
      uploadZone.style.display = 'none';
      editorArea.style.display = 'block';
    };
    img.src = URL.createObjectURL(file);
  });

  widthInput.addEventListener('input', () => {
    if (lockAspect.checked && widthInput.value) {
      heightInput.value = Math.round(parseInt(widthInput.value) / aspectRatio);
    }
  });

  heightInput.addEventListener('input', () => {
    if (lockAspect.checked && heightInput.value) {
      widthInput.value = Math.round(parseInt(heightInput.value) * aspectRatio);
    }
  });

  resizeBtn.addEventListener('click', () => {
    if (!currentFile) return;
    const w = parseInt(widthInput.value);
    const h = parseInt(heightInput.value);
    if (!w || !h || w <= 0 || h <= 0) return;

    editorArea.style.display = 'none';
    progressArea.style.display = 'flex';

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      // Determine output format from original file
      const isPng = currentFile.type === 'image/png';
      const mimeType = isPng ? 'image/png' : 'image/jpeg';
      const ext = isPng ? 'png' : 'jpg';

      canvas.toBlob(
        (blob) => {
          const name = currentFile.name.replace(/\.[^.]+$/, '');
          saveAs(blob, `${name}-${w}x${h}.${ext}`);
          progressArea.style.display = 'none';
          successArea.style.display = 'block';
        },
        mimeType,
        isPng ? undefined : 0.92
      );
    };
    img.src = URL.createObjectURL(currentFile);
  });

  resetBtn.addEventListener('click', resetAll);
  newBtn.addEventListener('click', resetAll);

  function resetAll() {
    fileInput.value = '';
    currentFile = null;
    editorArea.style.display = 'none';
    successArea.style.display = 'none';
    uploadZone.style.display = '';
  }
}

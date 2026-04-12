// ToolBoxSuite — main.js
// Mobile menu toggle
document.getElementById('menuToggle')?.addEventListener('click', () => {
  document.getElementById('mainNav')?.classList.toggle('open');
});

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// Generic drag-and-drop highlight
document.querySelectorAll('.drop-zone').forEach(zone => {
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) triggerFileInput(file);
  });
  zone.addEventListener('click', () => document.getElementById('fileInput')?.click());
});

function triggerFileInput(file) {
  const input = document.getElementById('fileInput');
  if (!input) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

// File input → show chosen file
document.getElementById('fileInput')?.addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  const chosenEl = document.getElementById('fileChosen');
  const nameEl = document.getElementById('fileName');
  const convertBtn = document.getElementById('convertBtn');
  if (chosenEl && nameEl) { nameEl.textContent = file.name; chosenEl.style.display = 'flex'; }
  if (convertBtn) convertBtn.style.display = 'block';
});

document.getElementById('clearFile')?.addEventListener('click', () => {
  document.getElementById('fileInput').value = '';
  document.getElementById('fileChosen').style.display = 'none';
  document.getElementById('convertBtn').style.display = 'none';
});

// Reset buttons
document.querySelectorAll('#resetBtn, #resetBtn2').forEach(btn => {
  btn?.addEventListener('click', () => location.reload());
});

// Image compressor quality slider
const slider = document.getElementById('qualitySlider');
const qualVal = document.getElementById('qualityVal');
if (slider && qualVal) {
  slider.addEventListener('input', () => { qualVal.textContent = slider.value; });
}

// Aspect ratio lock for resizer
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const lockAspect = document.getElementById('lockAspect');
let aspectRatio = null;
if (widthInput && heightInput && lockAspect) {
  widthInput.addEventListener('input', () => {
    if (lockAspect.checked && aspectRatio) heightInput.value = Math.round(widthInput.value / aspectRatio);
  });
  heightInput.addEventListener('input', () => {
    if (lockAspect.checked && aspectRatio) widthInput.value = Math.round(heightInput.value * aspectRatio);
  });
}

// PDF merger file list
const pdfFileInput = document.getElementById('fileInput');
const fileListEl = document.getElementById('fileList');
const mergeActions = document.getElementById('mergeActions');
let mergeFiles = [];
if (fileListEl) {
  pdfFileInput?.addEventListener('change', function() {
    Array.from(this.files).forEach(f => mergeFiles.push(f));
    renderFileList();
  });
  document.getElementById('clearBtn')?.addEventListener('click', () => {
    mergeFiles = [];
    renderFileList();
  });
}

function renderFileList() {
  if (!fileListEl) return;
  fileListEl.innerHTML = mergeFiles.length ? '<p style="font-size:.85rem;font-weight:500;margin-bottom:.5rem">Files to merge:</p>' : '';
  mergeFiles.forEach((f, i) => {
    const div = document.createElement('div');
    div.className = 'file-item';
    div.innerHTML = `<span>${i+1}. ${f.name} <span style="color:#9ca3af">(${(f.size/1024).toFixed(0)} KB)</span></span>`;
    fileListEl.appendChild(div);
  });
  if (mergeActions) mergeActions.style.display = mergeFiles.length >= 2 ? 'flex' : 'none';
}
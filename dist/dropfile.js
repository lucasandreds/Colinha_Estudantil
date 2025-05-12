const dropzone = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

dropzone.addEventListener('dragover', () => {
  dropzone.style.backgroundColor = 'var(--pico-muted-color)';
});
dropzone.addEventListener('dragleave', () => {
  dropzone.style.backgroundColor = '';
});
dropzone.addEventListener('drop', e => {
  dropzone.style.backgroundColor = '';
  
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    const event = new Event('change', { bubbles: true });
    fileInput.dispatchEvent(event);
  }
});
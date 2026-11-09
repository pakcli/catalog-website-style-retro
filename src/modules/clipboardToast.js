/**
 * Pure Business Logic: 1-Tap Copy To Clipboard & Toast Notification
 */
export function copyToClipboard(text, label = 'Copied to clipboard!') {
  if (!navigator.clipboard) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(label);
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast(label);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

export function showToast(message) {
  let toast = document.getElementById('retroToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'retroToast';
    toast.className = 'retro-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = `[ 📋 ${message} ]`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

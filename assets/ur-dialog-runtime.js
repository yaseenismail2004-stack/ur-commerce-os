(function installUrDialogRuntime() {
  'use strict';

  let returnFocus = null;

  const visibleDialog = () => {
    const dialogs = Array.from(document.querySelectorAll('.ur-ops-dialog[role="dialog"], .drawer-panel[role="dialog"]'));
    return dialogs.reverse().find((dialog) => {
      const style = window.getComputedStyle(dialog);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }) || null;
  };

  const focusable = (dialog) => Array.from(dialog.querySelectorAll([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(','))).filter((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });

  const focusDialog = (dialog) => {
    if (!dialog || dialog.dataset.urFocusReady === 'true') return;
    dialog.dataset.urFocusReady = 'true';
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const target = dialog.querySelector('[autofocus]') || focusable(dialog)[0] || dialog;
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    requestAnimationFrame(() => target.focus({ preventScroll: true }));
  };

  const observer = new MutationObserver(() => {
    const dialog = visibleDialog();
    if (dialog) focusDialog(dialog);
    else if (returnFocus && document.contains(returnFocus)) {
      returnFocus.focus({ preventScroll: true });
      returnFocus = null;
    }
  });

  const start = () => {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const initialDialog = visibleDialog();
    if (initialDialog) focusDialog(initialDialog);
  };

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      const trigger = document.querySelector('[data-command-palette-trigger]');
      if (trigger) {
        event.preventDefault();
        trigger.click();
      }
      return;
    }

    const dialog = visibleDialog();
    if (!dialog) return;

    if (event.key === 'Escape') {
      const close = dialog.querySelector('.ur-ops-close, [data-dialog-close], [aria-label="إغلاق"], [aria-label="Close"]');
      if (close) {
        event.preventDefault();
        close.click();
      }
      return;
    }

    if (event.key !== 'Tab') return;
    const controls = focusable(dialog);
    if (!controls.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

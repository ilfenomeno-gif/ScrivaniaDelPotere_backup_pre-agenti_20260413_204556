/* ============================================
   CONFIRM ACTION — Reusable Danger Confirmation
   ============================================ */

(function (root) {
    'use strict';

    const ConfirmAction = {
        ask(config) {
            const cfg = config || {};
            const title = cfg.title || 'Conferma azione';
            const body = cfg.body || 'Questa azione potrebbe avere effetti permanenti.';
            const acceptLabel = cfg.acceptLabel || 'Conferma';
            const cancelLabel = cfg.cancelLabel || 'Annulla';
            const onAccept = typeof cfg.onAccept === 'function' ? cfg.onAccept : function () {};
            const onCancel = typeof cfg.onCancel === 'function' ? cfg.onCancel : function () {};

            // Memorize trigger element to restore focus on close
            const _triggerEl = document.activeElement;

            let overlay = document.getElementById('urgent-choice-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'urgent-choice-overlay';
                overlay.className = 'urgent-choice-overlay';
                document.body.appendChild(overlay);
            }

            const headingId = 'confirm-heading-' + Date.now();
            overlay.innerHTML = `
                <div class="urgent-choice-modal mafia-modal" role="dialog" aria-modal="true" aria-labelledby="${headingId}">
                    <div id="${headingId}" class="urgent-choice-header mafia-header">⚠️ ${root.Game ? root.Game.esc(title) : title}</div>
                    <div class="urgent-choice-body">${root.Game ? root.Game.esc(body) : body}</div>
                    <div class="urgent-choice-buttons">
                        <button class="urgent-btn urgent-btn-accept mafia-btn-accept" data-choice="accept">${acceptLabel}</button>
                        <button class="urgent-btn urgent-btn-refuse" data-choice="cancel">${cancelLabel}</button>
                    </div>
                </div>
            `;
            overlay.classList.remove('hidden');

            // Screen reader: trap focus inside modal, announce context
            const modalEl = overlay.querySelector('[role="dialog"]');
            if (window.SR) SR.openModal(modalEl, title, body);

            overlay.querySelectorAll('.urgent-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const choice = btn.dataset.choice;
                    overlay.classList.add('hidden');
                    // Release focus trap and return to trigger
                    if (window.SR) SR.closeModal(_triggerEl, choice === 'accept' ? 'Azione confermata.' : 'Azione annullata.');
                    if (choice === 'accept') onAccept();
                    else onCancel();
                }, { once: true });
            });
        },
    };

    root.ConfirmAction = ConfirmAction;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ConfirmAction;
    }
})(typeof window !== 'undefined' ? window : globalThis);

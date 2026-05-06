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

            let overlay = document.getElementById('urgent-choice-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'urgent-choice-overlay';
                overlay.className = 'urgent-choice-overlay';
                document.body.appendChild(overlay);
            }

            overlay.innerHTML = `
                <div class="urgent-choice-modal mafia-modal">
                    <div class="urgent-choice-header mafia-header">⚠️ ${root.Game ? root.Game.esc(title) : title}</div>
                    <div class="urgent-choice-body">${root.Game ? root.Game.esc(body) : body}</div>
                    <div class="urgent-choice-buttons">
                        <button class="urgent-btn urgent-btn-accept mafia-btn-accept" data-choice="accept">${acceptLabel}</button>
                        <button class="urgent-btn urgent-btn-refuse" data-choice="cancel">${cancelLabel}</button>
                    </div>
                </div>
            `;
            overlay.classList.remove('hidden');

            overlay.querySelectorAll('.urgent-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const choice = btn.dataset.choice;
                    overlay.classList.add('hidden');
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

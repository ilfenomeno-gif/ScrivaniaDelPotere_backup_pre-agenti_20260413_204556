/* ============================================
   UI-EVENTS — Event Bus per UI e Screen Reader
   ============================================
   Disaccoppia logica di gioco, UI visiva e screen reader.
   Ogni layer ascolta gli stessi eventi semantici.
   ============================================ */

const UiEvents = (() => {
    'use strict';

    const _listeners = {};

    /**
     * Registra un handler per un tipo di evento UI.
     * @param {string} type - Tipo evento (es. "VIEW_CHANGED", "FOCUS_CHANGED", "GAME_EVENT")
     * @param {Function} handler - Callback con payload
     * @returns {Function} Funzione di unsubscribe
     */
    function on(type, handler) {
        if (!_listeners[type]) _listeners[type] = [];
        _listeners[type].push(handler);
        return () => off(type, handler);
    }

    /**
     * Rimuove un handler per un tipo di evento.
     */
    function off(type, handler) {
        if (!_listeners[type]) return;
        _listeners[type] = _listeners[type].filter(h => h !== handler);
    }

    /**
     * Emette un evento UI a tutti i listener registrati.
     * @param {string} type - Tipo evento
     * @param {Object} payload - Dati dell'evento
     */
    function emit(type, payload) {
        const handlers = _listeners[type];
        if (!handlers || handlers.length === 0) return;
        handlers.forEach(h => {
            try {
                h(payload);
            } catch (e) {
                console.warn(`[UiEvents] Errore handler per "${type}":`, e);
            }
        });
    }

    /**
     * Registra un handler che si attiva una sola volta.
     */
    function once(type, handler) {
        const wrapper = (payload) => {
            off(type, wrapper);
            handler(payload);
        };
        on(type, wrapper);
    }

    /**
     * Rimuove tutti i listener (utile per cleanup / test).
     */
    function clearAll() {
        Object.keys(_listeners).forEach(k => delete _listeners[k]);
    }

    /**
     * Debug: conta i listener registrati.
     */
    function stats() {
        const out = {};
        Object.entries(_listeners).forEach(([type, handlers]) => {
            out[type] = handlers.length;
        });
        return out;
    }

    return { on, off, emit, once, clearAll, stats };
})();

if (typeof window !== 'undefined') window.UiEvents = UiEvents;

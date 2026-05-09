/* ============================================
   UI-STATE — Stato UI Centralizzato
   ============================================ */

const UiState = (() => {
    'use strict';

    const VIEWS = {
        DESK: 'DESK', MAP: 'MAP', PHONE: 'PHONE',
        STATS: 'STATS', TASKS: 'TASKS', HOUSE: 'HOUSE',
        BUDGET: 'BUDGET', CHARACTER: 'CHARACTER',
    };

    const PHONE_TABS = {
        POLITICA: 'POLITICA', LAVORO: 'LAVORO',
        RELAZIONI: 'RELAZIONI', MESSAGGI: 'MESSAGGI',
        SOCIAL: 'SOCIAL', NOTIFICHE: 'NOTIFICHE',
    };

    const _state = {
        currentView: VIEWS.DESK,
        previousView: null,
        focusPath: [],
        phoneTab: null,
        modalStack: [],
        explorationMode: true,
    };

    function setView(viewId) {
        if (_state.currentView === viewId) return;
        _state.previousView = _state.currentView;
        _state.currentView = viewId;
        _state.focusPath = [viewId];
        _state.phoneTab = null;
        if (typeof UiEvents !== 'undefined') {
            UiEvents.emit('VIEW_CHANGED', { viewId, previousView: _state.previousView });
        }
    }

    function setFocus(path) {
        _state.focusPath = Array.isArray(path) ? path : [path];
        if (typeof UiEvents !== 'undefined') {
            UiEvents.emit('FOCUS_CHANGED', { path: _state.focusPath });
        }
    }

    function setPhoneTab(tabId) {
        _state.phoneTab = tabId;
        _state.focusPath = [VIEWS.PHONE, tabId];
        if (typeof UiEvents !== 'undefined') {
            UiEvents.emit('PHONE_TAB_CHANGED', { tabId });
        }
    }

    function pushModal(modalId) {
        _state.modalStack.push(modalId);
        if (typeof UiEvents !== 'undefined') {
            UiEvents.emit('MODAL_OPENED', { modalId });
        }
    }

    function popModal() {
        const closed = _state.modalStack.pop();
        if (typeof UiEvents !== 'undefined') {
            UiEvents.emit('MODAL_CLOSED', { modalId: closed });
        }
        return closed;
    }

    function hasOpenModal() { return _state.modalStack.length > 0; }
    function setExplorationMode(v) { _state.explorationMode = !!v; }
    function goBack() { if (_state.previousView) setView(_state.previousView); }
    function getState() { return { ..._state }; }
    function getCurrentView() { return _state.currentView; }
    function getFocusPath() { return [..._state.focusPath]; }
    function getPhoneTab() { return _state.phoneTab; }
    function isExplorationMode() { return _state.explorationMode; }

    return {
        VIEWS, PHONE_TABS,
        setView, setFocus, setPhoneTab,
        pushModal, popModal, hasOpenModal,
        setExplorationMode, goBack,
        getState, getCurrentView, getFocusPath, getPhoneTab, isExplorationMode,
    };
})();

if (typeof window !== 'undefined') window.UiState = UiState;

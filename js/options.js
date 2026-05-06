/* ============================================
   OPTIONS MENU — ESC Settings & Save
   ============================================ */

const Options = {
    _visible: false,
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        // Close button
        const closeBtn = document.getElementById('options-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

        // Action buttons
        const saveBtn = document.getElementById('opt-save');
        const settingsBtn = document.getElementById('opt-settings-toggle');
        const restartBtn = document.getElementById('opt-restart');
        const exitBtn = document.getElementById('opt-exit');
        const timelineBtn = document.getElementById('opt-timeline');

        if (saveBtn) saveBtn.addEventListener('click', () => {
            Desk.saveGame();
            this.hide();
        });
        if (restartBtn) restartBtn.addEventListener('click', () => {
            if (confirm('Sei sicuro? Perderai i progressi non salvati.')) {
                location.reload();
            }
        });
        if (exitBtn) exitBtn.addEventListener('click', () => this.hide());
        if (timelineBtn) {
            timelineBtn.addEventListener('click', () => {
                if (typeof Timeline !== 'undefined') Timeline.show();
                this.hide();
            });
        }

        // Settings toggles
        this._initToggles();

        // ESC also closes options if open
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this._visible) {
                e.stopImmediatePropagation();
                this.hide();
            }
        });
    },

    _initToggles() {
        // Ensure options state exists
        if (!Game.state.options) {
            Game.state.options = {
                advisorEnabled: true,
                tickerEnabled: true,
            };
        }

        const advisorToggle = document.getElementById('toggle-advisor');
        const tickerToggle = document.getElementById('toggle-ticker');

        if (advisorToggle) {
            advisorToggle.checked = Game.state.options.advisorEnabled !== false;
            advisorToggle.addEventListener('change', (e) => {
                Game.state.options.advisorEnabled = e.target.checked;
                if (typeof Advisor !== 'undefined') Advisor.toggle(e.target.checked);
            });
        }
        if (tickerToggle) {
            tickerToggle.checked = Game.state.options.tickerEnabled !== false;
            tickerToggle.addEventListener('change', (e) => {
                Game.state.options.tickerEnabled = e.target.checked;
                if (typeof Ticker !== 'undefined') Ticker.toggle(e.target.checked);
            });
        }
    },

    show() {
        const overlay = document.getElementById('options-overlay');
        if (!overlay) return;

        // Sync toggles with current state
        const advisorToggle = document.getElementById('toggle-advisor');
        const tickerToggle = document.getElementById('toggle-ticker');
        if (advisorToggle) advisorToggle.checked = Game.state.options.advisorEnabled !== false;
        if (tickerToggle) tickerToggle.checked = Game.state.options.tickerEnabled !== false;

        overlay.classList.remove('hidden');
        this._visible = true;
    },

    hide() {
        const overlay = document.getElementById('options-overlay');
        if (overlay) overlay.classList.add('hidden');
        this._visible = false;
    },

    isVisible() {
        return this._visible;
    },
};

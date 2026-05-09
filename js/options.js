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
                colorblind: false,
                reduceMotion: false,
                fontScale: 'normal',
            };
        }
        // Backfill missing keys for saved games
        const opts = Game.state.options;
        if (opts.colorblind === undefined) opts.colorblind = false;
        if (opts.reduceMotion === undefined) opts.reduceMotion = false;
        if (opts.fontScale === undefined) opts.fontScale = 'normal';

        const advisorToggle = document.getElementById('toggle-advisor');
        const tickerToggle = document.getElementById('toggle-ticker');
        const colorblindToggle = document.getElementById('toggle-colorblind');
        const reduceMotionToggle = document.getElementById('toggle-reduce-motion');
        const fontSizeSelect = document.getElementById('select-font-size');

        if (advisorToggle) {
            advisorToggle.checked = opts.advisorEnabled !== false;
            advisorToggle.addEventListener('change', (e) => {
                opts.advisorEnabled = e.target.checked;
                if (typeof Advisor !== 'undefined') Advisor.toggle(e.target.checked);
            });
        }
        if (tickerToggle) {
            tickerToggle.checked = opts.tickerEnabled !== false;
            tickerToggle.addEventListener('change', (e) => {
                opts.tickerEnabled = e.target.checked;
                if (typeof Ticker !== 'undefined') Ticker.toggle(e.target.checked);
            });
        }
        if (colorblindToggle) {
            colorblindToggle.checked = !!opts.colorblind;
            this._applyColorblind(opts.colorblind);
            colorblindToggle.addEventListener('change', (e) => {
                opts.colorblind = e.target.checked;
                this._applyColorblind(e.target.checked);
            });
        }
        if (reduceMotionToggle) {
            reduceMotionToggle.checked = !!opts.reduceMotion;
            this._applyReduceMotion(opts.reduceMotion);
            reduceMotionToggle.addEventListener('change', (e) => {
                opts.reduceMotion = e.target.checked;
                this._applyReduceMotion(e.target.checked);
            });
        }
        if (fontSizeSelect) {
            fontSizeSelect.value = opts.fontScale || 'normal';
            this._applyFontScale(opts.fontScale || 'normal');
            fontSizeSelect.addEventListener('change', (e) => {
                opts.fontScale = e.target.value;
                this._applyFontScale(e.target.value);
            });
        }
    },

    _applyColorblind(enabled) {
        document.documentElement.classList.toggle('colorblind-mode', !!enabled);
    },

    _applyReduceMotion(enabled) {
        document.documentElement.classList.toggle('reduce-motion', !!enabled);
    },

    _applyFontScale(scale) {
        document.documentElement.classList.remove('font-large', 'font-xlarge');
        if (scale === 'large') document.documentElement.classList.add('font-large');
        else if (scale === 'xlarge') document.documentElement.classList.add('font-xlarge');
    },

    show() {
        const overlay = document.getElementById('options-overlay');
        if (!overlay) return;

        // Sync toggles with current state
        const opts = Game.state.options || {};
        const advisorToggle = document.getElementById('toggle-advisor');
        const tickerToggle = document.getElementById('toggle-ticker');
        const colorblindToggle = document.getElementById('toggle-colorblind');
        const reduceMotionToggle = document.getElementById('toggle-reduce-motion');
        const fontSizeSelect = document.getElementById('select-font-size');
        if (advisorToggle) advisorToggle.checked = opts.advisorEnabled !== false;
        if (tickerToggle) tickerToggle.checked = opts.tickerEnabled !== false;
        if (colorblindToggle) colorblindToggle.checked = !!opts.colorblind;
        if (reduceMotionToggle) reduceMotionToggle.checked = !!opts.reduceMotion;
        if (fontSizeSelect) fontSizeSelect.value = opts.fontScale || 'normal';

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

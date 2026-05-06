/* ============================================
   SCHEDULER — Centralized Async Timer Manager
   ============================================ */

(function (root) {
    'use strict';

    const isFn = (value) => typeof value === 'function';

    const Scheduler = {
        _timers: new Map(),

        _register(id, meta) {
            this._timers.set(id, meta);
            return id;
        },

        _cleanup(id) {
            this._timers.delete(id);
        },

        timeout(callback, delay, opts) {
            const options = opts || {};
            const group = options.group || 'default';
            const label = options.label || 'timeout';
            let timerId = null;
            timerId = setTimeout(() => {
                this._cleanup(timerId);
                if (isFn(callback)) callback();
            }, delay);
            return this._register(timerId, { type: 'timeout', group, label });
        },

        interval(callback, delay, opts) {
            const options = opts || {};
            const group = options.group || 'default';
            const label = options.label || 'interval';
            const timerId = setInterval(() => {
                if (isFn(callback)) callback();
            }, delay);
            return this._register(timerId, { type: 'interval', group, label });
        },

        clear(id) {
            if (!this._timers.has(id)) return false;
            const meta = this._timers.get(id);
            if (meta.type === 'interval') {
                clearInterval(id);
            } else {
                clearTimeout(id);
            }
            this._cleanup(id);
            return true;
        },

        clearGroup(group) {
            const ids = [];
            this._timers.forEach((meta, id) => {
                if (meta.group === group) ids.push(id);
            });
            ids.forEach(id => this.clear(id));
            return ids.length;
        },

        clearAll() {
            const ids = Array.from(this._timers.keys());
            ids.forEach(id => this.clear(id));
            return ids.length;
        },

        stats() {
            const out = { total: 0, timeout: 0, interval: 0, groups: {} };
            this._timers.forEach(meta => {
                out.total += 1;
                out[meta.type] += 1;
                out.groups[meta.group] = (out.groups[meta.group] || 0) + 1;
            });
            return out;
        },
    };

    root.Scheduler = Scheduler;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Scheduler;
    }
})(typeof window !== 'undefined' ? window : globalThis);

// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-

const Lang = imports.lang;
const Gvc = imports.gi.Gvc;
const Signals = imports.signals;

const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;

const PA_INVALID_INDEX = 0xffffffff; // ((uint32_t) -1)

let indicator = null;
let patcher = null;

function Patcher(indicator) {
    this._init(indicator);
}

Patcher.prototype = {
    _init: function(indicator) {
        this._indicator = indicator;
        this._addOutputId = indicator._control.connect('stream-added', 
                                                       Lang.bind(this, this._maybeAddOutput));
        this._removeOutputId = indicator._control.connect('stream-removed', 
                                                          Lang.bind(this, this._maybeRemoveOutput));
        this._defaultChangeId = indicator._control.connect('default-sink-changed', 
                                                           Lang.bind(this, this._setDefault));
        this._outputId = PA_INVALID_INDEX;
        this._outputMenus = {};
        this._outputCount = 0;
        if (this._indicator._control.get_state() == Gvc.MixerControlState.READY) {
            let defaultOutput = this._indicator._control.get_default_sink();
            if (defaultOutput)
                this._outputId = defaultOutput.id;
            let sinks = this._indicator._control.get_sinks();
            for (let i = 0; i < sinks.length; i++) {
                this._maybeAddOutput(indicator._control, sinks[i].id);
            }
        }
    },

    _maybeAddOutput: function(control, id) {
        if (id in this._outputMenus)
            return;
        let stream = control.lookup_stream_id(id);
        if (stream instanceof Gvc.MixerSink) {
            let menu = new PopupMenu.PopupMenuItem(stream.description);
            menu.connect('activate', Lang.bind(this, function (menuItem, event) {
                if (stream.id != this._outputId)
                    control.set_default_sink(stream);
            }));
            let outputOffset = 2;
            this._indicator.menu.addMenuItem(menu, outputOffset + this._outputCount);
            if (this._outputCount == 1) {
                for (let k in this._outputMenus) {
                    this._outputMenus[k].actor.show();
                }
            }
            this._outputMenus[id] = menu;
            this._outputCount++;
            if (this._outputId == stream.id)
                menu.setShowDot(true);
            if (this._outputCount == 1)
                menu.actor.hide();
        }
    },

    _maybeRemoveOutput: function(control, id) {
        if (id in this._outputMenus) {
            this._outputMenus[id].destroy();
            delete this._outputMenus[id];
            this._outputCount--;
            if (this._outputCount == 1) {
                for (let k in this._outputMenus) {
                    this._outputMenus[k].actor.hide();
                }
            }
        }
    },

    _setDefault: function(control, id) {
        if (this._outputId != id) {
            this._setMenuDots(this._outputId, false);
            this._setMenuDots(id, true);
            this._outputId = id;
        }
    },

    _setMenuDots: function(id, value) {
        if (id in this._outputMenus)
            this._outputMenus[id].setShowDot(value);
    },

    destroy: function() {
        for (let k in this._outputMenus)
            this._outputMenus[k].destroy();
        this._outputMenus = {};
        this._outputCount = 0;
        this._indicator._control.disconnect(this._addOutputId);
        this._indicator._control.disconnect(this._removeOutputId);
        this._indicator._control.disconnect(this._defaultChangeId);
        this.emit('destroy');
    }
};

Signals.addSignalMethods(Patcher.prototype);

function init() {
}

function main() {
}

function enable() {
    if (Main.panel._statusArea['volume'] && !patcher)
        patcher = new Patcher(Main.panel._statusArea['volume']);
}

function disable() {
    if (patcher) {
        patcher.destroy();
        patcher = null;
    }
}

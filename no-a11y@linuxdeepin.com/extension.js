const Main = imports.ui.main;
const Panel = imports.ui.panel;

let a11y_actor = null;

function init(extensionMeta) {
	a11y_actor = Main.panel._statusArea['a11y'].actor;
}

function enable() {
	a11y_actor.hide();
}

function disable() {
    a11y_actor.show();
}

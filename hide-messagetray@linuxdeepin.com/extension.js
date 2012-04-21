const Lang = imports.lang;
const Main = imports.ui.main;

let messageTrayActor;

function init() {
	messageTrayActor = Main.messageTray.actor;
}

function enable() {
	messageTrayActor.hide();
}

function disable() {
	messageTrayActor.show();
}

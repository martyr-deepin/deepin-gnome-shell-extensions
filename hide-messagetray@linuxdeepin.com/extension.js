const Lang = imports.lang;
const Main = imports.ui.main;

let messageTrayActor;
let viewSelectorActor;
let viewSelectorActorWidth;
let viewSelectorActorHeight;

function init() {
	messageTrayActor = Main.messageTray.actor;
}

function enable() {
	viewSelectorActor = Main.overview._group.get_children()[0];
	[viewSelectorActorWidth, viewSelectorActorHeight] = viewSelectorActor.get_size();
	viewSelectorActor.set_size(viewSelectorActorWidth, viewSelectorActorHeight + 10);
	
	messageTrayActor.hide();
}

function disable() {
	viewSelectorActor.set_size(viewSelectorActorWidth, viewSelectorActorHeight);
	
	messageTrayActor.show();
}

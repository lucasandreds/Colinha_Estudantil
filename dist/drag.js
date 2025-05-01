let dragged;

function handleDragStart(e) {
dragged = e.currentTarget;
e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
e.preventDefault();
e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
e.preventDefault();
if (dragged !== e.currentTarget) {
    const list = e.currentTarget.parentNode;
    const current = e.currentTarget;
    list.insertBefore(dragged, current);
}
}
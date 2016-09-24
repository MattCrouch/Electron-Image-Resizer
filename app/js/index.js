(function() {
    const electron = require("electron");
    const ipcRenderer = electron.ipcRenderer;
    const remote = electron.remote;
    const alertHandler = require("../js/alert-handler");

    const dropTarget = document.querySelector(".drop-target");

    //Verify drop item is valid
    function checkCanDrop(transfer) {
        if(transfer.files.length !== 1) {
            //Only one file at a time
            return false;
        }

        let file = transfer.files[0];
        let allowedTypes = ["image/jpeg", "image/png"];

        if(allowedTypes.indexOf(file.type) === -1) {
            //Not allowed type
            return false;
        }

        return true;
    }

    //Functions to apply appropriate styles to drop target
    function applyCanDropStyle(target) {
        clearDropStyles(target);
        target.classList.add("droppable");
    }

    function applyCannotDropStyle(target) {
        clearDropStyles(target);
        target.classList.add("not-droppable");
    }

    function clearDropStyles(target) {
        target.classList.remove("droppable", "not-droppable");
    }

    //Listen for files dragging onto application
    dropTarget.addEventListener("dragenter", e => {
        if(checkCanDrop(e.dataTransfer)) {
            e.preventDefault();
            applyCanDropStyle(dropTarget);
        } else {
            applyCannotDropStyle(dropTarget);        
        }
    });

    //Listen for file drag leaving the application
    dropTarget.addEventListener("dragleave", e => clearDropStyles(dropTarget));

    //Listen for file drop
    dropTarget.addEventListener("drop", e => {
        e.preventDefault();
        clearDropStyles(dropTarget);

        if(checkCanDrop(e.dataTransfer)) {
            let file = e.dataTransfer.files[0];
            let url = URL.createObjectURL(file);
            let img = new Image;

            img.onload = () => {
                localStorage.setItem("path", file.path);
                localStorage.setItem("name", file.name);
                localStorage.setItem("height", img.height);
                localStorage.setItem("width", img.width);

                ipcRenderer.send("loadPage", "html/process.html");
            };

            img.src = url;
        } else {
            alertHandler("Only drop one image file at a time");
        }
    });
})();
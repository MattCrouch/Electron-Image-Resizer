(function() {
    const electron = require("electron");
    const ipcRenderer = electron.ipcRenderer;
    const clipboard = electron.clipboard;
    const alertHandler = require("../js/alert-handler");

    const srcsetHolder = document.getElementById("srcset");
    const restart = document.getElementById("restart");

    //Set the text area value to the srcset
    srcsetHolder.value = `<img src="${localStorage.getItem("name")}" srcset="${localStorage.getItem("name")} ${localStorage.getItem("width")}w, ${localStorage.getItem("srcsetValues")}">`;

    //Listen for click to copy value to clipboard
    srcsetHolder.addEventListener("click", e => {
        clipboard.writeText(srcsetHolder.value);

        alertHandler("Copied to clipboard", "notice");
    });

    //Listen for restart, 
    restart.addEventListener("click", e => {
        ipcRenderer.send("loadPage", "html/index.html");
    });
})();
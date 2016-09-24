(function() {
    //Don't redirect window to drop file
    document.addEventListener("dragover", e => e.preventDefault());
    document.addEventListener("drop", e => e.preventDefault());
})();
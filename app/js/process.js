(function() {
    const electron = require("electron");
    const ipcRenderer = electron.ipcRenderer;
    const remote = electron.remote;
    const clipboard = electron.clipboard;
    const sharp = require("sharp");
    const path = require("path");
    const alertHandler = require("../js/alert-handler");

    const preview = document.querySelector(".preview");
    const imagePreview = preview.querySelector("img");
    const metadata = preview.querySelector("ul");
    const cancel = document.getElementById("cancel");
    const resize = document.getElementById("resize");
    const sizeList = document.querySelector(".sizes ul");
    const addNew = document.getElementById("add");

    //Set the location of the preview image
    imagePreview.src = `file://${localStorage.getItem("path")}`;

    //Show metadata
    metadata.querySelector("#name").innerText = localStorage.getItem("name");
    metadata.querySelector("#width").innerText = localStorage.getItem("width");
    metadata.querySelector("#height").innerText = localStorage.getItem("height");

    //Pre-populate the first list item
    addListItem();

    //Listen for cancel and return to start screen
    cancel.addEventListener("click", e => {
        ipcRenderer.send("loadPage", "html/index.html");
    });

    //Listen for resize and start processing
    resize.addEventListener("click", e => {
        //Check no sizes exceed limits
        if(!sizesValid()) {
            return;
        }

        //Show UI for visual processing
        resize.disabled = true;
        alertHandler("Processing...", "notice");

        //Get name, extension etc from file
        let fileValues = path.parse(localStorage.getItem("path")); 

        //Initialise resize process
        let resizer = sharp(localStorage.getItem("path"));

        //Store results for complete screen
        let results = [];
        let srcsetValues = [];

        //Loop over each size...
        [...sizeList.querySelectorAll("input")].forEach(input => {
            //Compute file name from size value
            let size = parseInt(input.value,10);
            let fileName = `${fileValues.name}-${size}px${fileValues.ext}`;

            //Save string values for complete screen
            srcsetValues.push(`${fileName} ${size}w`);

            //Save returned promise for later
            results.push(resizer.resize(size)
                .toFile(`${fileValues.dir}/${fileName}`));
        });
        
        //Once all promises resolve, forward to complete screen
        Promise.all(results).then(() => {
            localStorage.setItem("srcsetValues", srcsetValues.join(", "));
            ipcRenderer.send("loadPage", "html/complete.html");
        }).catch(error => {
            resize.disabled = false;        
            alertHandler("There was an error processing the images");
        });
    });

    //Listen for add new width
    addNew.addEventListener("click", addListItem);

    //Add an item to the width list
    function addListItem() {
        let li = document.createElement("li");

        li.innerHTML = `<input type="number" value="${parseInt(localStorage.getItem("width") / 2, 10)}" min="1" max="${parseInt(localStorage.getItem("width"), 10)}">
                <span>px</span>
                <button type="button" class="cancel remove" title="Remove">X</button>`;
        
        li.querySelector(".remove").addEventListener("click", removeListItem);

        sizeList.appendChild(li);
    }

    //Remove width from the list
    function removeListItem(e) {
        let li = e.target.parentElement;
        li.parentElement.removeChild(li);
    }

    //Validate size values
    function sizesValid() {
        let sizeInputs = sizeList.querySelectorAll("input");
        
        if(sizeInputs.length == 0) {
            alertHandler("You must supply at least one size");
            return false;
        }

        for(let i = 0; i < sizeInputs.length; i++) {
            if(!sizeInputs[i].validity.valid) {
                sizeInputs[i].focus();
                alertHandler("Make sure all sizes are valid");
                return false;
            }
        }

        return true;
    }
})();
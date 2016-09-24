module.exports = function(message, type = "error") {
    let alert = document.createElement("div");
    alert.className = "alert " + type;

    alert.innerText = message;

    document.body.appendChild(alert);

    setTimeout(() => alert.parentElement.removeChild(alert), 3000);
}
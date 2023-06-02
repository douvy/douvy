var normalImage = "assets/img/pfp.jpg";
var blinkingImage = "assets/img/pfp-blink.jpg";
var imgElement = document.getElementById("pfp");
var durations = [150, 200, 300]; // blink durations to choose from

setInterval(function() {
    if (imgElement.src.endsWith(normalImage)) {
        var duration = durations[Math.floor(Math.random() * durations.length)]; // randomly select a blink duration
        imgElement.src = blinkingImage;
        setTimeout(function() {
            imgElement.src = normalImage;
        }, duration);
    } 
}, 4000); // blink interval

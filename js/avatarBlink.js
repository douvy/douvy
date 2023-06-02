var normalImage = "assets/img/pfp.jpg";
var blinkingImage = "assets/img/pfp-blink.jpg";
var bloodshotImage = "assets/img/pfp-bloodshot.jpg";
var imgElement = document.getElementById("pfp");
var durations = [150, 200, 250];
var isBloodshot = false;
var startTime = Date.now();

setInterval(function() {
    var currentTime = Date.now();
    var elapsedSeconds = (currentTime - startTime) / 1000;

    if (elapsedSeconds >= 30 && !isBloodshot) {
        imgElement.src = bloodshotImage;
        isBloodshot = true;
    } else {
        var duration = durations[Math.floor(Math.random() * durations.length)];
        
        if (isBloodshot) {
            imgElement.src = blinkingImage;
            setTimeout(function() {
                imgElement.src = bloodshotImage;
            }, duration);
        } else {
            imgElement.src = blinkingImage;
            setTimeout(function() {
                imgElement.src = normalImage;
            }, duration);
        }
    }
}, 4000);

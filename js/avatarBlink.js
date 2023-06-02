    var normalImage = "assets/img/pfp.jpg";
    var blinkingImage = "assets/img/pfp-blink.jpg";
    var imgElement = document.getElementById("pfp");
    var blinkCount = 0;

    setInterval(function() {
        if (imgElement.src.endsWith(normalImage)) {
            if (blinkCount === 0) {
                imgElement.src = blinkingImage;
                setTimeout(function() {
                    imgElement.src = normalImage;
                }, 200); // 200 milliseconds
            } else if (blinkCount === 1) {
                imgElement.src = blinkingImage;
                setTimeout(function() {
                    imgElement.src = normalImage;
                }, 150); // 150 milliseconds
            } else if (blinkCount === 2) {
                imgElement.src = blinkingImage;
                setTimeout(function() {
                    imgElement.src = normalImage;
                }, 200); // 200 milliseconds
            } else if (blinkCount === 3) {
                imgElement.src = blinkingImage;
                setTimeout(function() {
                    imgElement.src = normalImage;
                }, 300); // 300 milliseconds
                blinkCount = -1; // reset blinkCount to -1 to start over
            }
            blinkCount++;
        } else {
            imgElement.src = normalImage;
        }
    }, 4000); // 5000 milliseconds = 5 seconds
 // Simple helpers
        function randByte() {
            return Math.floor(Math.random() * 256);
        }
        
         function rgbToHex(r,g,b) {
         // convert each to two-digit hex
              return "#" + [r,g,b].map(function(n){
              var s = n.toString(16);
              return s.length === 1 ? "0" + s : s;
            }).join("").toUpperCase();
    }

    //WCAG-like luminance check for readable foreground
    function luminance(r,g,b) {
        // convert to linearized sRGB
        var srgb = [r,g,b].map(function(v){ v = v/255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);});
        return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2]; 
    }

    function pickForegroundColor(r,g,b) {
        var L = luminance(r,g,b);
        //contrast: pick black if background is light (L > 0.179)
        return L > 0.179 ? "#111111" : "#FFFFFF";
    }

    //main logic
    var btn =document.getElementById("change");
    var display = document.getElementById("colorDisplay");
    var body = document.body;
    var app = document.getElementById("app");

    function setRandomBackground() {
        var r = randByte(), g = randByte(), b = randByte();
        var hex = rgbToHex(r,g,b);
        document.documentElement.style.setProperty('--bg', hex);
        var fg = pickForegroundColor(r,g,b);
        document.documentElement.style.setProperty('--fg', fg);
        display.textContent = hex;

        //Toggle a class for card styling if bg is dark
        var lum = luminance(r,g,b);
        if (lum <= 0.2) app.classList.add("dark");
        else app.classList.remove("dark");
    }

    // Wire up events
    btn.addEventListener("click", setRandomBackground);

    // Space Triggers change (avoid interfering with typing)
    window.addEventListener("keydown", function(e){
        if (e.code === "Space" && document.activeElement !== document.body && document.activeElement !==btn) return;
        if (e.code === "Space") {
            e.preventDefault();
            setRandomBackground();
        }
    });

    // Start with a pleasant pastel color
    (function initialColor(){
        // gentle pastle by averaging with 200
        var r = Math.floor((randByte() + 200)/2);
        var g = Math.floor((randByte() + 200)/2);
        var b = Math.floor((randByte() + 200)/2);
        var hex = rgbToHex(r,g,b);
        document.documentElement.style.setProperty('--bg', hex);
        document.documentElement.style.setProperty('--fg', pickForegroundColor(r,g,b));
        display.textContent = hex;
        if (luminance(r,g,b) <= 0.2) app.classList.add("dark");
    })();

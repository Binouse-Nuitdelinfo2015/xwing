//@TODO Resolve the problem of infinite particles array

// Set the variable to path_to_directory (here "./js/rsc")
var scriptSrc = "js/rsc";

//framerate 120fps
var frameRate = 120.0;
var frameDelay = 1000.0 / frameRate;

// activation state
var isKonamiActivated = false; // by default not already activated

// canvas and its context
var canvas;
var context2D;

//Konami code : Haut, haut, bas, bas, gauche, droite, gauche, droite, B, A
var k = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

// current user sequence position
var n = 0;

/*
 * Keyboard event sniffer
 */
$(document).keydown(function (e) {
    // good key code
    if (e.keyCode === k[n++]) {
        // konami code completed
        if (n === k.length) {
            // reset sequence
            konami();

            // reset sequence
            n = 0;
        }
    } else {
        // reset sequence
        n = 0;
    }
});

/*
 * Canvas and 2D context initialization
 */
function init_canvas() {
    // canvas creation
    canvas = document.createElement("canvas");

    // canvas position
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.zIndex = "1000";

    // canvas size
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    // other canvas properties
    canvas.style.backgroundColor = "#000000";

    // adding this canvas to the document body
    document.body.innerHTML = "";
    document.body.appendChild(canvas);
}

/*
 * This is the function called when the konami code is done
 */
function konami() {
    // Prevent the konami code to be done 2 times
    if (!isKonamiActivated) {
        // konami code activated
        isKonamiActivated = true;

        // create and init the canvas
        init_canvas();

        // resizing support
        window.addEventListener("resize", function() {
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
        });

        // get canvas context
        context2D = canvas.getContext("2d");

        // create a xwing
        xwing = new XWing();

        // click support
        document.addEventListener("click", function(evt) {
            // click == xwing fire
            xwing.fire();
        });

        // cursor move support
        document.addEventListener("mousemove", function(evt) {
            // move cursor on mouse cursor movement
            xwing.mouseX = evt.clientX - document.body.clientWidth / 2;
            xwing.mouseY = evt.clientY - document.body.clientHeight / 2;
        });

        // adding music
        var music = document.createElement("audio");
        music.src = scriptSrc + "/starwars.mp3";
        music.play();

        // infinite loop music
        music.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);

        // framerate delay
        setInterval(function() {
            update(frameDelay);
        }, frameDelay);
    }
}

/*
 * XWing constructor
 */
function XWing() {

    // Mouse position
    this.mouseX = 0,
    this.mouseY = 0;

    // XWing aim cursor position
    this.cursorX = 0,
    this.cursorY = 0;

    // If it is high, the cursor will be slower
    this.cursorCoef = 5;

    // Size of the XWing aim cursor
    this.cursorRadius = 15;

    // Color of the XWing aim cursor
    this.cursorColor = "#00FF00";

    // XWing source image
    this.img = document.createElement("img");
    this.img.src = scriptSrc + "/xwing.png";

    // XWing source image scaling
    this.scale = 0.5;

    // XWing fire sound
    this.sound = document.createElement("audio");
    this.sound.src = scriptSrc + "/xwing.mp3";
    document.body.appendChild(this.sound);
    this.soundTimeout;

    // Score
    this.score = 0;

    // Ennemy radius
    this.ennemyRadius = this.cursorRadius * 2;

    // Ennemy source picture
    this.ennemyImg = document.createElement("img");
    this.ennemyImg.src = scriptSrc + "/deathstar.png";

    // Function to move the cursor to the direction of the mouse
    this.moveCursor = function () {
        this.cursorX = (this.cursorX * this.cursorCoef + this.mouseX) / (this.cursorCoef + 1);
        this.cursorY = (this.cursorY * this.cursorCoef + this.mouseY) / (this.cursorCoef + 1);
    }

    // Function to draw the XWing and its cursor
    this.draw = function (context2D) {
        // Changing context2D
        context2D.save();

        // XWing at canvas center
        context2D.translate(document.body.clientWidth / 2, document.body.clientHeight / 2);

        // Color the cursor
        context2D.strokeStyle = this.cursorColor;
        context2D.lineWidth = 3;

        // Draw the current ennemy
        context2D.drawImage(this.ennemyImg, this.ennemyX - this.ennemyRadius, this.ennemyY - this.ennemyRadius);

        // Draw the outline cursor
        context2D.beginPath();
        context2D.arc(this.cursorX, this.cursorY, this.cursorRadius, 0, Math.PI * 2, true);
        context2D.closePath();
        context2D.stroke();

        // Draw the point cursor
        context2D.beginPath();
        context2D.arc(this.cursorX, this.cursorY, 1, 0, Math.PI * 2, true);
        context2D.closePath();
        context2D.stroke();

        // Draw Score text
        context2D.rotate(Math.PI * this.cursorX / document.body.clientWidth);
        context2D.font = "30px Verdana";
        context2D.textAlign = "center";
        context2D.fillStyle = this.cursorColor;
        context2D.fillText("Score: " + this.score, 0, this.img.height / 2);

        // Draw the XWing
        context2D.scale(this.scale, this.scale);
        context2D.drawImage(this.img, - this.img.width / 2, - this.img.height / 2);

        // Restore the saved context2D
        context2D.restore();
    };

    // play XWing fire sound
    this.playFireSound = function () {
        // remove sound stop timeout
        clearTimeout(this.soundTimeout);

        // play fire sound
        this.sound.play();

        // stop sound after 500ms
        this.soundTimeout = setTimeout(function () {
            xwing.sound.pause();
            xwing.sound.currentTime = 0;
        }, 500);
    }

    // method called by a mouse click
    this.fire = function () {
        /*
        var x = document.body.clientWidth / 2 + xwing.cursorX;
        var y = document.body.clientHeight / 2 + xwing.cursorY;
        createExplosion(x, y, "#525252");
        createExplosion(x, y, "#FFA318");
        */

        // play a sound
        xwing.playFireSound();

        // it kill an ennemy
        if ( this.cursorX <= this.ennemyX + this.ennemyRadius
            && this.cursorX >= this.ennemyX - this.ennemyRadius
            && this.cursorY <= this.ennemyY + this.ennemyRadius
            && this.cursorY >= this.ennemyY - this.ennemyRadius ) {
            // increase the score
            xwing.score++;

            // spawn a new ennemy
            xwing.newEnnemy();
        }
    }

    // Spawn a new ennemy at a random location
    this.newEnnemy = function () {
        this.ennemyX = randomFloat(this.cursorRadius- canvas.width / 2, canvas.width / 2 - this.cursorRadius);
        this.ennemyY = randomFloat(this.cursorRadius - canvas.height / 2, canvas.height / 2 - this.cursorRadius);
    }

    // spawn an ennemy at startup
    this.newEnnemy();
}

function randomFloat(min, max) {
    return min + Math.random()*(max-min);
}

//var particles = [];

/*
 * A single explosion particle
 */
 /*
function Particle () {
    this.scale = 1.0;
    this.x = 0;
    this.y = 0;
    this.radius = 20;
    this.color = "#000";
    this.velocityX = 0;
    this.velocityY = 0;
    this.scaleSpeed = 0.5;
    this.update = function(ms) {
        // shrinking
        this.scale -= this.scaleSpeed * ms / 1000.0;
        if (this.scale <= 0){
            this.scale = 0;
        }
        // moving away from explosion center
        this.x += this.velocityX * ms/1000.0;
        this.y += this.velocityY * ms/1000.0;
    };
    this.draw = function(context2D) {
        // translating the 2D context to the particle coordinates
        context2D.save();
        context2D.translate(this.x, this.y);
        context2D.scale(this.scale, this.scale);
        // drawing a filled circle in the particle's local space
        context2D.beginPath();
        context2D.arc(0, 0, this.radius, 0, Math.PI*2, true);
        context2D.closePath();
        context2D.fillStyle = this.color;
        context2D.fill();
        context2D.restore();
    };
}
*/
/*
 * Basic Explosion, all particles move and shrink at the same speed.
 *
 * Parameter : explosion center
 */
 /*
function createBasicExplosion(x, y) {
    // creating 4 particles that scatter at 0, 90, 180 and 270 degrees
    for (var angle=0; angle<360; angle+=90) {
        var particle = new Particle();
        // particle will start at explosion center
        particle.x = x;
        particle.y = y;
        particle.color = "#FF0000";
        var speed = 50.0;
        // velocity is rotated by "angle"
        particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
        particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);
        // adding the newly created particle to the "particles" array
        particles.push(particle);
    }
}
*/
/*
 * Advanced Explosion effect
 * Each particle has a different size, move speed and scale speed.
 *
 * Parameters:
 *  x, y - explosion center
 *  color - particles' color
 */
 /*
function createExplosion(x, y, color) {
    var minSize = 10;
    var maxSize = 30;
    var count = 10;
    var minSpeed = 60.0;
    var maxSpeed = 200.0;
    var minScaleSpeed = 1.0;
    var maxScaleSpeed = 4.0;
    for (var angle=0; angle<360; angle += Math.round(360/count)) {
        var particle = new Particle();
        particle.x = x;
        particle.y = y;
        particle.radius = randomFloat(minSize, maxSize);
        particle.color = color;
        particle.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);
        var speed = randomFloat(minSpeed, maxSpeed);
        particle.velocityX = speed * Math.cos(angle * Math.PI / 180.0);
        particle.velocityY = speed * Math.sin(angle * Math.PI / 180.0);
        particles.push(particle);
    }
}
*/

function update (frameDelay) {
    // Clear the canvas
    context2D.clearRect(0, 0, context2D.canvas.width, context2D.canvas.height);

    /*
    // Update and draw particles
    for (var i=0; i<particles.length; i++)
    {
        var particle = particles[i];
        particle.update(frameDelay);
        particle.draw(context2D);
    }
    */

    // Draw the canvas
    xwing.draw(context2D);

    // Draw the cursor
    xwing.moveCursor();
}

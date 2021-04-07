const canvas = document.getElementById('canvas1');

const ctx = canvas.getContext('2d');

// sets canvas to be full browser window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// adjust these values to determine where text begins on window
let adjustX = canvas.width/200;
let adjustY = canvas.height/200;

// contains all particle objects, all information about particles (size, color, coordinates),
// pull information from this array to draw particles on canvas 
let particleArray = [];

// handles mouse interactions
let mouse = {
    x: null,     // current position of mouse on x-axis
    y: null,     // current position of mouse on y-axis
    radius: 150, // radius of circle around mouse in which particles react to mouse
}

// event listener takes 2 attributes: 
// 1. type of event to listen for,
// 2. callback function to run every time that event occurs
//      Here we listen to the mousemove event then assign x and y coordinates
//      dynamically every time the mouse moves in mouse object
window.addEventListener('mousemove', function(event) {
    mouse.x = event.x + canvas.clientLeft/2;
	    mouse.y = event.y + canvas.clientTop/2;
    //console.log(mouse.x, mouse.y);  //just to prove mouse location is being tracked
});

ctx.fillStyle = 'white';
ctx.font = 'bold 30px Verdana';

// Allows you to change text that appears
ctx.fillText('Jacob', 0, 30);

const textCoordinates = ctx.getImageData(0,0, 100, 100);

class Particle {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.size = 1;  // size of the particle 'dots'
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;  // each particle will move at slightly different speeds, changing density changes speed of particles
    }
    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;  // slows particles down the further away from the mouse they are
        // if we went below zero, set it to zero.
        if (force < 0) force = 0;
        let directionX = (forceDirectionX * force * this.density);  // adding density to the equation gives each particle a slightly different speed
        let directionY = (forceDirectionY * force * this.density);

        if (distance < mouse.radius + this.size) {
            this.x -= directionX;  // a plus(+) draws particles towards it, a minus(-) pushes particles away
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx/10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy/10;
            }
        }
    }
}

function init() {
    particleArray = [];

    // analyze each pixel in each row
    for (let y=0, y2= textCoordinates.height; y < y2; y++) {
        for (let x=0, x2 = textCoordinates.width; x < x2; x++) {
            // simply: cycling through 40,000 elements which are the 10,000 pixels
            // and their 4 values (red, green, blue, OPACITY)
            // and checking every FOURTH VALUE (OPACITY VALUE)
            // filters out pixels with no opacity
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {  // any pixel with more than roughly 50% opacity will be added to the array
                let positionX = x + adjustX;
                let positionY = y + adjustY;
                particleArray.push(new Particle(positionX * 15, positionY * 15));  // numeric values determine how spread out particles are, the higher the more spread
            }
        }
    }

    // This was the original implementation, spreading the particles randomly across the window
    // for (let i=0; i < 1000; i++) {
    //     let x = Math.random() * canvas.width;
    //     let y = Math.random() * canvas.height;
    //     particleArray.push(new Particle(x, y));
    // }

}

console.log(particleArray);

function animate() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    connect();
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
    }
    requestAnimationFrame(animate);  // recursive, animate loops 
}

init();

animate();

window.addEventListener('resize',
function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    adjustX = -60 + canvas.width/30;
    adjustY = -32 + canvas.height/30;
    init();
});

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particleArray.length; a++) {
        for (let b = a; b < particleArray.length; b++) {
            let distance = (( particleArray[a].x - particleArray[b].x) * (particleArray[a].x - particleArray[b].x))
            + ((particleArray[a].y - particleArray[b].y) * (particleArray[a].y - particleArray[b].y));
            
            if (distance < 2600) {
                opacityValue = 1 - (distance/2600);
                let dx = mouse.x - particleArray[a].x;
                let dy = mouse.y - particleArray[a].y;
                let mouseDistance = Math.sqrt(dx*dx+dy*dy);
                if (mouseDistance < mouse.radius / 2) {
                  ctx.strokeStyle='rgba(255,255,0,' + opacityValue + ')';
                } else if (mouseDistance < mouse.radius - 50) {
                  ctx.strokeStyle='rgba(5,255,115,' + opacityValue + ')';
                } else if (mouseDistance < mouse.radius + 20) {
                  ctx.strokeStyle='rgba(255,255,210,' + opacityValue + ')';
                } else  {
                ctx.strokeStyle='rgba(255,255,255,' + opacityValue + ')';
                }
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particleArray[a].x, particleArray[a].y);
                ctx.lineTo(particleArray[b].x, particleArray[b].y);
                ctx.stroke();
        }
    }
}
}

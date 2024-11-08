let cirs = []; // Used to store 4 types of dynamic circle ring
let stars = []; // Used to store stars
let meteors = []; // Used to store meteors
let scaleFactor = 1; // Scale factor for resizing content

let img; // Declare a variable to store the image

// New variables to facilitate animation and effects based on user input
let selectedCircle = null; // Checks to see if circle is selected by user
let userCircleStyle = null; // Gets input value from the user (1-4)
let pulseStartTime = null; // Circle apperance animation time
let isPulsing = false; // Checks if animation is active
let pulsingCircle = null; // Checks which circle has animation
let isDragging = false; // Checks if mouse is dragging
let fadingCircles = []; // Arrary to append circles that needs to be removed

function preload() {
  // Preload the image of the hologram circle
  img = loadImage("https://png.pngtree.com/png-vector/20240601/ourmid/pngtree-circle-gradient-holographic-sphere-button-png-image_12588776.png");
// This image is from https://pngtree.com/so/holographic-circle.
}

function setup() {

  createCanvas(900, 900);
  angleMode(DEGREES);


  for (let i = 0; i < 500; i++) {
    // Add 500 stationary stars
    stars.push(new Star());
  }
}

function draw() {

    // Calculate the scale factor and apply it to the content.
    scale(scaleFactor);

   // Create a gradient background from dark blue to dark purple.
   let topColor = color(1, 17, 92); // dark blue
   let bottomColor = color(60, 6, 102); // dark purple
 
   // Generate a color gradient between dark blue and black using `lerpColor()`.
   // This technique is from https://p5js.org/reference/p5/lerpColor/
   for (let y = 0; y < height / scaleFactor; y++) {
     let inter = map(y, 0, height / scaleFactor, 0, 1);
     let c = lerpColor(topColor, bottomColor, inter);
     stroke(c);
     line(0, y, width / scaleFactor, y);
   }

   // Start creating the meteor section:
  if (random(1) < 0.1) {
    // There is a 10% chance to add a new meteor on each frame.
    meteors.push(new Meteor());
  }
  for (let i = 0; i < stars.length; i++) {
    // Draw 500 static stars.
    stars[i].display();
  }
  for (let i = 0; i < meteors.length; i++) {
    // Draw the meteors.
    meteors[i].update();
    meteors[i].display();
  }
  for (let i = meteors.length - 1; i >= 0; i--) {
    // Clear the meteor when it reaches the bottom of the canvas.
    if (meteors[i].y > height / scaleFactor + 100)
      meteors.splice(i, 1);
  }


    // Draw a transparent gradient white circle under each dynamic circle ring.
  for (let i = 0; i < cirs.length; i++) {
    let baseX = cirs[i].x;
    let baseY = cirs[i].y;
    let baseSize = cirs[i].cirSize * 0.5;

    // Overlay multiple semi-transparent concentric circles to create a feathering effect visually
    for (let j = 0; j < 5; j++) { // Adjust the loop count to control the degree of feathering
      let alpha = map(j, 0, 10, 50, 0); // Gradually decrease opacity from the center outward
      let size = baseSize + j * 40; // The size of the circle gradually increases
      
      fill(255, alpha);
      noStroke();
      ellipse(baseX, baseY, size);
    }
  }

  // Draw all dynamic circle rings 
  for (let i = 0; i < cirs.length; i++) {
    cirs[i].display();
    
    drawWhiteCircle(cirs[i]); // Draw a white circular border around each dynamic ring
    drawImagesAroundCircle(cirs[i]); // Draw the hologram circle images around the circle rings
  }

  // Pulse animation for circle appearance based on user input (in prompt and click)
  if (isPulsing && pulsingCircle) {
    let elapsed = millis() - pulseStartTime; //millis() keeps track of how long a sketch has been runing in miliseconds
    let pulseDuration = 3000; // 3 seconds of pulsing
    let pulseSize = map(elapsed, 0, pulseDuration, pulsingCircle.originalSize, pulsingCircle.originalSize * 1.5);
    pulsingCircle.cirSize = pulseSize;

    // Stops the pulsing animation after duration
    if (elapsed > pulseDuration) {
      isPulsing = false;
      pulsingCircle = null;
    }
  }

  // Applies fade out effect on each circle appended in the fadingCircle array  
  for (let i = fadingCircles.length - 1; i >= 0; i--) {
    fadingCircles[i].fadeOut();
    if (fadingCircles[i].isFaded()) fadingCircles.splice(i, 1); // This technique from: https://p5js.org/reference/p5/splice/
  }
}

// Checks if user have pressed their mouse
function mousePressed() {
  for (let i = 0; i < cirs.length; i++) {
    let d = dist(mouseX, mouseY, cirs[i].x, cirs[i].y);
    if (d < cirs[i].cirSize) {
      selectedCircle = cirs[i];
      isDragging = true;
      break;
    }
  }
  // A prompt would appear after mouse press is detected and it will appends a new circle based on the input style
  if (!selectedCircle) {
    userCircleStyle = prompt('Create your memory circle by selecting a style between 1 to 4):');
    if (userCircleStyle >= 1 && userCircleStyle <= 4) {
      let newCircle = new Circle(mouseX, mouseY, userCircleStyle, 100, color(random(255), random(255), random(255)));
      cirs.push(newCircle);

      // Trigger pulse animation for the newly added circle
      pulsingCircle = newCircle;
      pulsingCircle.originalSize = newCircle.cirSize;
      pulseStartTime = millis();
      isPulsing = true;
    } else {
      alert('Invalid circle style! Please select a number between 1 to 4.');
    }
  }
}

// Using the mousePressed() function, it resizes the circle if it has been dragged 
function mouseDragged() {
  if (isDragging && selectedCircle) {
    let newSize = dist(mouseX, mouseY, selectedCircle.x, selectedCircle.y) * 2;
    selectedCircle.cirSize = newSize;
  }
}

// This checks if user is still pressing the mouse
function mouseReleased() {
  isDragging = false;
  selectedCircle = null;
}

// Space bar press to clear all circles so the user can start again
function keyPressed() {
  if (keyCode === 32) { // Space bar pressed
    // Iterates array in reverse order (order to fade-out) and applies fading circle effects to every circle in cirs array
    for (let i = cirs.length - 1; i >= 0; i--) {
      fadingCircles.push(new FadingCircle(cirs[i]));
      cirs.pop();
    }
  }
}

// Function to draw white circular borders around the dynamic circle rings
function drawWhiteCircle(circle) {
  stroke(255, 50); // White in 50% opacity
  strokeWeight(10); // Bold border
  noFill();
  ellipse(circle.x, circle.y, circle.cirSize * 2.05);
}

// Function to draw the hologram circle images around the circle rings
function drawImagesAroundCircle(circle) {
  let numImages = 15; // Set the number of images.
  for (let j = 0; j < numImages; j++) {
    let angle = map(j, 0, numImages, 366, TWO_PI); // Calculate the angle for each image
    let x = circle.x + cos(angle) * (circle.cirSize); // The x-coordinate of the image
    let y = circle.y + sin(angle) * (circle.cirSize); // The y-coordinate of the image
    image(img, x-8, y-8, 15, 15); // Draw the image with a width and height of 15x15
  }
}

// Class that removes the circle on canvas by decreasing opacaity and giving the effect of fading away when space bar is pressed
class FadingCircle {
  constructor(circle) {
    this.circle = circle;
    this.fadeStep = 2; // How fast the circle fades away. Big number = fade faster, small number = fade slower
    this.alpha = 255; // Initial opacity
  }

  // Gradually fades out the circle over time 
  fadeOut() {
    this.circle.cirSize -= this.fadeStep;
    this.alpha -= this.fadeStep * 2;
    this.circle.display(this.alpha);
  }

  // Checks if circle has faded away by checking it's size and opacity (alpha)
  isFaded() {
    return this.circle.cirSize <= 0 || this.alpha <= 0;
  }
  
  display() {
    this.circle.display(this.alpha); // Pass alpha to the display method of Circle
    // Update particles' display with the alpha value
    for (let i = 0; i < this.circle.parts.length; i++) {
      this.circle.parts[i].display(this.alpha);
    }
    // Determiuns how particle 2 is fading out 
    if (this.circle.parts2) {
      for (let i = 0; i < this.circle.parts2.length; i++) {
        this.circle.parts2[i].display(this.alpha); // Display Particle 2 with fading alpha (opacity)
      }
    } 
  }
}

// Class representing the static stars with properties
class Star {
  constructor() {
    // Generate a random position for the star within the canvas bounds
    this.x = random(width);
    this.y = random(height);

    // Assign a random color to each star with a certain probability
    if (random(1) < 0.5) {
      this.col = color(200, 161, 192);
    } else {
      this.col = color(255);
    }
  }
  display() {
    // Draw the static stars
    stroke(this.col);
    strokeWeight(2);
    point(this.x, this.y); // This technique is from https://p5js.org/reference/p5/point/
  }
}

// Class representing the meteors with properties
class Meteor {
  constructor() {
    // Generate meteors at random positions at the top of the screen
    this.x = random(-width, width);
    this.y = 0;
    this.vx = 4;
    this.vy = 4;
  }
  display() {
    // Draw the meteor and its tail
    fill(255);
    stroke(255, 150);
    ellipse(this.x, this.y, random(4, 7));
    line(this.x, this.y, - this.vx * 10 + this.x, - this.vy * 10 + this.y)
  }
  update() {
    // Make the meteor move.
    this.x += this.vx;
    this.y += this.vy;
  }
}

// Class representing the dynamic circle rings with properties
class Circle {
  constructor(x, y, s, size, col) {
    // Initialize dynamic circle ring
    this.x = x;
    this.y = y;
    this.style = s; //The type of the circle rings
    this.cirSize = size;
    this.parts = [];
    this.angle = 0;
    this.col = col;
    // Control the rotation direction
    this.rotateDir = 1;
    if (random(1) < 0.5) {
      this.rotateDir = -1;
    }
    this.init();
  }

  init() {
    // Add different types of particles at different positions based on the type of dynamic circle ring 
    if (this.style == 1) {
      this.layer = 8; // Number of circle ring layers
      for (let l = 0; l < this.layer; l += 1) {
        for (let i = 0; i < 4; i++) {
          for (let n = 0; n < 90; n += 2) {
            // Calculate the position, rotation angle, opacity, and size data for each circle ring 
            let r = map(l, 0, this.layer, this.cirSize * 0.1, this.cirSize);
            let angle = map(i, 0, 4, 0, 360) + this.angle + n;
            let x = cos(angle) * r;
            let y = sin(angle) * r;
            let alp = map(n, 0, 90, 255, 0);
            this.parts.push(new Particle1(x, y, alp, this.col));
          }
        }
      }
    }
    else if (this.style == 2) {
      this.layer = 15; // Number of circle ring layers
      for (let l = 0; l < this.layer; l += 1) {
        for (let i = 0; i < 2; i++) {
          for (let n = 0; n < 90; n += 2) {
             // Calculate the position, rotation angle, opacity, and size data for each circle ring 
            let r = map(l, 0, this.layer, this.cirSize * 0.2, this.cirSize);
            let angle = map(i, 0, 2, 0, 360) + l * 45 + n;
            let x = cos(angle) * r;
            let y = sin(angle) * r;
            let alp = map(n, 0, 100, 255, 0);
            this.parts.push(new Particle1(x, y, alp, this.col));
          }
        }
      }
    }
    else if (this.style == 3) {
      this.layer = 10; // Number of circle ring layers
      for (let l = 0; l < this.layer; l += 1) {
        for (let i = 0; i < 3; i++) {
          for (let n = 0; n < l + 2; n++) {
            // Calculate the position, rotation angle, opacity, and size data for each circle ring 
            let r = map(l, 0, this.layer, this.cirSize * 0.2, this.cirSize);
            let angle = map(i, 0, 3, 0, 360) + n * 12 + l * 20;
            let x = cos(angle) * r;
            let y = sin(angle) * r;
            let sw = map(n, 0, this.layer, 8, 1);
            this.parts.push(new Particle2(x, y, sw, this.col));
          }
        }
      }
    }

    else if (this.style == 4) {
      this.layer = 6; // Number of circle ring layers
      for (let l = 0; l < this.layer; l += 1) {
        for (let i = 0; i < 3; i++) {
          for (let n = 0; n < l * 4 + 12; n++) {
            // Calculate the position, rotation angle, opacity, and size data for each circle ring 
            let r = map(l, 0, this.layer, this.cirSize * 0.2, this.cirSize);
            let angle = map(n, 0, l * 4 + 12, 0, 360) + l * 180;
            let x = cos(angle) * r;
            let y = sin(angle) * r;
            let sw = map(abs(n - (l * 4 + 12) / 2), 0, (l * 4 + 12) / 2, 12, -1);
            this.parts.push(new Particle2(x, y, sw, this.col));
          }
        }
      }
    }
  }

  display(alpha = 255) {
    for (let i = 0; i < this.parts.length; i++) {
      // Draw particles inside the dynamic circle ring
      push();
      translate(this.x, this.y);
      rotate(this.angle);
      this.parts[i].display(alpha);
      pop();
    }
    this.angle += this.rotateDir * 1; // Make the circle ring rotate.
  
}}

// Two types of particles
class Particle1 {
  constructor(x, y, alp, col) {
    this.x = x;
    this.y = y;
    this.alp = alp;
    this.sw = 4; // Set the size

    this.r = red(col);
    this.g = green(col);
    this.b = blue(col);
  }
  display(alpha) {
    strokeWeight(this.sw);
    stroke(this.r, this.g, this.b, alpha);
    point(this.x, this.y);
  }
}
class Particle2 {
  constructor(x, y, sw, col) {
    this.x = x;
    this.y = y;
    this.sw = sw;
    this.col = col;
  }
  display(alpha) {
    strokeWeight(this.sw);
    stroke(this.col, alpha);
    point(this.x, this.y);
  }
}

// Function to make the canvas and content scale proportionally when the window size changes
function windowResized() {
  let aspectRatio = 900 / 900; // The aspect ratio of the original canvas.
  let newWidth = windowWidth;
  let newHeight = windowWidth / aspectRatio;

  if (newHeight > windowHeight) {
    newHeight = windowHeight;
    newWidth = newHeight * aspectRatio;
  }

  resizeCanvas(newWidth, newHeight); // This technique is from https://p5js.org/reference/p5/resizeCanvas/
  scaleFactor = newWidth / 900; // Update the scaling factor
}

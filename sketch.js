function setup() {
  createCanvas(600, 600);
  noLoop();
}

function draw(){
  background(240, 240, 235);
  drawWing();
}

function mousePressed() {
  redraw();
}
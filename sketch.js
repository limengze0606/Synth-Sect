function setup() {
  createCanvas(600, 600);
  noLoop();
}

function draw(){
  background(240, 240, 235);
  let mySeed = floor(random(100000));

  push();
  translate(width * 0.5, height * 0.5);
  drawWing(mySeed);
  pop();

  push();
  translate(width * 0.5, height * 0.5);
  scale(-1, 1);
  drawWing(mySeed);
  pop();
}

function mousePressed() {
  redraw();
}
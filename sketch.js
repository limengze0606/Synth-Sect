let pg; // 宣告離屏畫布變數

function setup() {
  createCanvas(600, 600);
  // 1. 建立一個和畫布一樣大的 PGraphics
  pg = createGraphics(600, 600);
  noLoop();
}

function draw() {
  // 所有的繪製邏輯現在都發生在 pg 上
  pg.background(240, 240, 235);

  ocean(pg); // 繪製海洋
  sky(pg);   // 繪製天空
  
  let mySeed = floor(random(100000));
  let centerX = pg.width * 0.5 + random(-30, 30);
  let centerY = pg.height * 0.5 + random(-30, 30);
  let bodyRotation = random(-PI / 12, PI / 12);
  let flapAngle = random(-PI / 4, PI / 4);
  let globalScale = random(0.8, 1.1);

  pg.push();
  pg.translate(centerX, centerY);
  pg.rotate(bodyRotation);
  pg.scale(globalScale);

  // 傳遞 pg 進去，確保子函式也是畫在同一張「紙」上
  drawWingPair(pg, mySeed + 1, 10, flapAngle + PI/6, 0.85);
  drawWingPair(pg, mySeed, 0, flapAngle, 1.0);

  pg.pop();

  applyNoise(0.1); // 應用雜訊效果

  // 最後一步：將畫好的 pg 一次性貼到畫布上
  image(pg, 0, 0);
}

/**
 * 修改後的函式：新增第一個參數 g，代表要畫在哪個畫布上
 */
function drawWingPair(g, seed, yOff, rot, s) {
  let bodyHalfWidth = 5;

  // 右翅膀
  g.push();
  g.translate(bodyHalfWidth, yOff);
  g.rotate(rot);
  g.scale(s);
  drawWing(g, seed);
  g.pop();

  // 左翅膀 (鏡像)
  g.push();
  g.translate(-bodyHalfWidth, yOff);
  g.rotate(-rot);
  g.scale(-s, s); 
  drawWing(g, seed);
  g.pop();
}

function mousePressed() {
  redraw();
}
let pg; 

function setup() {
  createCanvas(600, 600);
  pg = createGraphics(600, 600);
  noLoop();
}

function draw() {
  pg.background(240, 240, 235);
  drawBackground(pg);
  
  let mySeed = floor(random(100000));
  let fillStyle = floor(random(4));
  let hasSecondPair = floor(random(2));
  let forceColorType = floor(random(2));
  let ColorSet = floor(random(2));
  let isRandomMode = floor(random(2));

  // --- 【修改部分】位置與角度的切換邏輯 ---
  let centerX, centerY, bodyRotation, flapAngle, globalScale;

  if (isRandomMode) {
    // 模式 A：原本的隨機狀態
    centerX = pg.width * 0.5 + random(-30, 30);
    centerY = pg.height * 0.5 + random(-30, 30);
    bodyRotation = random(-PI / 12, PI / 12);
    flapAngle = random(-PI / 4, PI / 4);
    globalScale = random(0.8, 1.1);
  } else {
    // 模式 B：畫布正中央且無旋轉
    centerX = pg.width * 0.5;
    centerY = pg.height * 0.5;
    bodyRotation = 0;   // 無旋轉
    flapAngle = 0;      // 翅膀拍打角度歸零（或設為固定值）
    globalScale = 1.0;  // 標準比例
  }
  // ------------------------------------

  pg.push();
  pg.translate(centerX, centerY);
  pg.rotate(bodyRotation);
  pg.scale(globalScale);

  if (hasSecondPair == 1){
    drawWingPair(pg, mySeed + 1, 10, flapAngle + PI/8, 0.65, forceColorType, ColorSet, fillStyle);
  }
  drawWingPair(pg, mySeed, 0, flapAngle, 1.0, forceColorType, ColorSet, fillStyle);

  pg.pop();

  applyNoise(0.1); 
  image(pg, 0, 0);
  
  // 可以在畫面上印出當前模式（選配）
  fill(0);
  noStroke();
}

/**
 * 修改後的函式：新增第一個參數 g，代表要畫在哪個畫布上
 */
function drawWingPair(g, seed, yOff, rot, s, forceColorType, ColorSet, fillStyle) {
  let bodyHalfWidth = 5;

  // 右翅膀
  g.push();
  g.translate(bodyHalfWidth, yOff);
  g.rotate(rot);
  g.scale(s);
  drawWing(g, seed, forceColorType, ColorSet, fillStyle);
  g.pop();

  // 左翅膀 (鏡像)
  g.push();
  g.translate(-bodyHalfWidth, yOff);
  g.rotate(-rot);
  g.scale(-s, s); 
  drawWing(g, seed, forceColorType, ColorSet, fillStyle);
  g.pop();
}

function mousePressed() {
  redraw();
}
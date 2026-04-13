let pg; 
let rotX = 0;
let rotY = 0;
let zoom = 500;

function setup() {
  createCanvas(600, 600, WEBGL);
  pg = createGraphics(600, 600);
  drawCard();
  //noLoop();
}

function draw() {
  background(220);
  push();
  translate(0, 0, -1000);

  // 1. 只有在滑鼠按住時才更新旋轉角度
  if (mouseIsPressed) {
    // 左右滑動滑鼠 (movedX) 改變繞 Y 軸的旋轉
    rotY += movedX * 0.01;
    // 上下滑動滑鼠 (movedY) 改變繞 X 軸的旋轉
    rotX -= movedY * 0.01;
  }

  // 2. 限制旋轉範圍 (例如：上下旋轉不超過 90 度，避免翻轉過頭)
  rotX = constrain(rotX, -QUARTER_PI, QUARTER_PI);
  // 如果你想限制左右旋轉範圍，也可以對 rotY 做 constrain
  rotY = constrain(rotY, -QUARTER_PI, QUARTER_PI);

  // 3. 設定攝影機與變換
  // 我們將 zoom 應用在 Z 軸位移上
  translate(0, 0, zoom); 
  
  rotateX(rotX);
  rotateY(rotY);

  texture(pg);
  plane(600, 600);
  pop();
}

function drawCard() {
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
  drawCard();
}

// 監聽滾輪來改變 zoom 值
function mouseWheel(event) {
  // event.delta 在不同瀏覽器可能正負相反，通常向下滾是正值
  zoom -= event.delta; 
  // 限制縮放，防止穿過平面或飛太遠
  zoom = constrain(zoom, -1000, 400);
  
  // 回傳 false 避免捲動網頁
  return false; 
}
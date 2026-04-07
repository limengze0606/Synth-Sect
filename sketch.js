function setup() {
  createCanvas(600, 600);
  noLoop();
}

function draw() {
  background(240, 240, 235);
  
  // 1. 基礎隨機種子 (決定花紋與翅膀形狀)
  let mySeed = floor(random(100000));
  
  // 2. 姿態隨機參數 (決定身體在畫布上的「自然感」)
  let centerX = width * 0.5 + random(-30, 30);   // 身體中心微調
  let centerY = height * 0.5 + random(-30, 30);
  let bodyRotation = random(-PI / 12, PI / 12); // 身體整體的傾斜度
  let flapAngle = random(-PI / 4, PI / 4);     // 翅膀拍打的張開角度
  let globalScale = random(0.8, 1.1);           // 整體大小縮放

  push();
  translate(centerX, centerY);
  rotate(bodyRotation);
  scale(globalScale);

  // --- 繪製順序：先畫後翅，再畫前翅 (符合生物重疊邏輯) ---

  // 【後翅 Hindwings】
  // 使用 mySeed + 1 區隔花紋，稍微縮小並往下位移
  drawWingPair(mySeed + 1, 10, flapAngle + PI/6, 0.85);

  // 【前翅 Forewings】
  // 使用原始 mySeed，位置較靠上
  drawWingPair(mySeed, 0, flapAngle, 1.0);

  pop();
}

/**
 * 繪製成對翅膀的輔助函式
 * @param {number} seed - 隨機種子
 * @param {number} yOff - 垂直位移 (相對於身體中心)
 * @param {number} rot - 旋轉角度
 * @param {number} s - 縮放比例
 */
function drawWingPair(seed, yOff, rot, s) {
  let bodyHalfWidth = 5;

  // 右翅膀
  push();
  translate(bodyHalfWidth, yOff);
  rotate(rot);
  scale(s);
  drawWing(seed);
  pop();

  // 左翅膀 (鏡像)
  push();
  translate(-bodyHalfWidth, yOff);
  rotate(-rot);
  scale(-s, s); // X軸負值達成鏡像
  drawWing(seed);
  pop();
}

function mousePressed() {
  redraw();
}
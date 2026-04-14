let pg; 
let picPg; // 【新增】專門用來繪製卡面圖片的畫布
let currentRarity = 'Normal'; // 預設稀有度為普通卡
let rotX = 0;
let rotY = 0;
let zoom = 500;
let cardWidth = 500;
let cardHeight = 700;
let pictureWidth = 500; // 測試時可以改成 300 看看效果
let pictureHeight = 700; // 測試時可以改成 400 看看效果

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pg = createGraphics(cardWidth, cardHeight);
  // 【新增】初始化圖片畫布
  picPg = createGraphics(pictureWidth, pictureHeight); 
  drawPicture();
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
  rect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, cardWidth * 0.05); // 加入圓角
  pop();
}

function drawPicture() {
  // === 【新增】抽卡機率設定 ===
  // random() 會產生一個 0.0 到 1.0 之間的小數
  // 這裡設定 0.2 代表有 20% 的機率抽中全圖卡，80% 機率是普通卡
  let gachaRoll = random(); 
  
  if (gachaRoll < 0.2) { 
    // 20% 中獎：全圖卡
    pictureWidth = Rarity.FullArt.pictureWidth;
    pictureHeight = Rarity.FullArt.pictureHeight;
    currentRarity = 'FullArt';
  } else {
    // 80% 槓龜：普通卡
    pictureWidth = Rarity.Normal.pictureWidth;
    pictureHeight = Rarity.Normal.pictureHeight;
    currentRarity = 'Normal';
  }
  // ==========================

  // 【新增】檢查 picPg 的尺寸是否需要更新 (為了支援 settings.js 切換 Rarity 時動態改變大小)
  if (!picPg || picPg.width !== pictureWidth || picPg.height !== pictureHeight) {
    if (picPg) picPg.remove();
    picPg = createGraphics(pictureWidth, pictureHeight);
  }

  // 1. 先為整張卡片 (pg) 畫上底板顏色 (例如卡片白邊/黑邊)
  pg.background(255); // 卡底色，可依喜好更改

  // 2. 開始在圖框畫布 (picPg) 上繪製
  picPg.background(240, 240, 235);
  drawBackground(picPg); // 傳入 picPg，背景會自動適應 pictureWidth/Height
  
  let mySeed = floor(random(100000));
  let fillStyle = floor(random(4));
  let hasSecondPair = floor(random(2));
  let forceColorType = floor(random(2));
  let ColorSet = floor(random(2));
  let isRandomMode = floor(random(2));

  let centerX, centerY, bodyRotation, flapAngle, globalScale;

  if (isRandomMode) {
    // 【修改】將 pg.width / pg.height 改為 picPg.width / picPg.height
    centerX = picPg.width * 0.5 + random(-30, 30);
    centerY = picPg.height * 0.5 + random(-30, 30);
    bodyRotation = random(-PI / 12, PI / 12);
    flapAngle = random(-PI / 4, PI / 4);
    globalScale = random(0.8, 1.1);
  } else {
    // 【修改】同樣將 pg 改為 picPg
    centerX = picPg.width * 0.5;
    centerY = picPg.height * 0.5;
    bodyRotation = 0;   
    flapAngle = 0;      
    globalScale = 1.0;  
  }

  picPg.push();
  picPg.translate(centerX, centerY);
  picPg.rotate(bodyRotation);
  picPg.scale(globalScale);

  // 【修改】把畫布參數從 pg 改成 picPg
  if (hasSecondPair == 1){
    drawWingPair(picPg, mySeed + 1, 10, flapAngle + PI/8, 0.65, forceColorType, ColorSet, fillStyle);
  }
  drawWingPair(picPg, mySeed, 0, flapAngle, 1.0, forceColorType, ColorSet, fillStyle);

  picPg.pop();

  applyNoise(picPg, 0.1);

  // 先在外面宣告變數
  let picX, picY;

  if (currentRarity === 'FullArt') {
    // 裡面只做賦值 (不要加 let)
    picX = (cardWidth - pictureWidth) / 2;
    picY = (cardHeight - pictureHeight) / 2; 
  } 
  else {
    // 裡面只做賦值 (不要加 let)
    picX = (cardWidth - pictureWidth) / 2;
    // 註: 如果你要讓普通卡圖片往上移，應該是減 50；如果要往下移，應該是加 50 喔！
    picY = (cardHeight - pictureHeight) / 2 - 150; 
  }
  
  // 現在這裡就能順利抓到 picX 和 picY 的值了
  pg.image(picPg, picX, picY);
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

//function mousePressed() {
//  drawCard();
//}

// 監聽滾輪來改變 zoom 值
function mouseWheel(event) {
  // event.delta 在不同瀏覽器可能正負相反，通常向下滾是正值
  zoom -= event.delta; 
  // 限制縮放，防止穿過平面或飛太遠
  zoom = constrain(zoom, -1000, 400);
  
  // 回傳 false 避免捲動網頁
  return false; 
}

function keyPressed() {
  // 按下 'r' 重新生成隨機內容
  if (key === 'r' || key === 'R') {
    drawPicture();
  }
}
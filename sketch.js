let pg; 
let picPg; // 卡面圖片的畫布
let maskPg; // 遮罩的畫布
let maskMap; // 儲存遮罩圖像的像素資料
let currentRarity = 'Normal'; // 預設稀有度為普通卡
let rotX = 0;
let rotY = 0;
let zoom = 500;
let cardWidth = 500;
let cardHeight = 700;
let pictureWidth = 500; 
let pictureHeight = 700;
let myShader;
let matcapImg;

function preload() {
  matcapImg = loadImage('Assets/polishedGold.png');
  myShader = loadShader('Shaders/basic.vert', 'Shaders/basic.frag');
}

function gachaRoll(raritiesObj) {
  let totalWeight = 0;
  // 取得物件所有的 key，例如 ['Normal', 'Rare', 'FullArt']
  let keys = Object.keys(raritiesObj); 

  // 1. 計算總權重
  for (let key of keys) {
    totalWeight += raritiesObj[key].weight;
  }

  // 2. 在總權重範圍內取一個隨機數
  let r = random(totalWeight);

  // 3. 判斷落在哪個區間
  for (let key of keys) {
    if (r < raritiesObj[key].weight) {
      return key; // 直接回傳 'Normal', 'Rare' 或 'FullArt'
    }
    r -= raritiesObj[key].weight;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pg = createGraphics(cardWidth, cardHeight);
  // 【新增】初始化圖片畫布
  picPg = createGraphics(pictureWidth, pictureHeight); 
  maskMap = createGraphics(cardWidth, cardHeight);
  drawCard();
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

  switch (currentRarity) {
    case 'Normal': {
      texture(pg);
      break;
    }
    case 'Rare':
    case 'FullArt': {
      shader(myShader);
      myShader.setUniform('u_baseMap', pg);
      myShader.setUniform('u_maskMap', maskMap);
      myShader.setUniform('u_matcapMap', matcapImg);
      break;
    }
  }
  
  rect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, cardWidth * 0.05); // 加入圓角
  //image(maskMap, 300, 0); // 顯示遮罩畫布以供調試
  pop();
}

function drawCard() {
  // 1. === 抽卡機制 ===
  let rolledRarity = gachaRoll(Rarity); 
  switch (rolledRarity) {
    case 'Normal': {
      currentRarity = 'Normal';
      pictureWidth = Rarity.Normal.pictureWidth;
      pictureHeight = Rarity.Normal.pictureHeight;
      break;
    }
    case 'Rare': {
      currentRarity = 'Rare';
      pictureWidth = Rarity.Rare.pictureWidth;
      pictureHeight = Rarity.Rare.pictureHeight;
      break;
    }
    case 'FullArt': {
      currentRarity = 'FullArt';
      pictureWidth = Rarity.FullArt.pictureWidth;
      pictureHeight = Rarity.FullArt.pictureHeight;
      break;
    }
  }

  // 2. === 計算圖片位置 ===
  let picX = (cardWidth - pictureWidth) / 2;
  let picY = (currentRarity === 'FullArt') 
             ? (cardHeight - pictureHeight) / 2 
             : (cardHeight - pictureHeight) / 2 - 150; 
  
  // 【修正 1】變數改成 currentRarity
  switch (currentRarity) {
    case 'Normal':
    case 'Rare': {
      drawCardFrame(pg, currentRarity, picX, picY, pictureWidth, pictureHeight);
      // 【修正 2】將算好的 picX, picY 傳入 drawPicture
      drawPicture(picX, picY); 
      break;
    }
    case 'FullArt': {
      drawPicture(picX, picY);
      drawCardFrame(pg, currentRarity, picX, picY, pictureWidth, pictureHeight);
      break;
    }
  }
}

// 【修正 2】加上參數 px, py 來接收座標
function drawPicture(px, py) {
  // === 同步處理 picPg 與 maskPg 的尺寸與初始化 ===
  if (!picPg || picPg.width !== pictureWidth || picPg.height !== pictureHeight) {
    if (picPg) picPg.remove();
    if (maskPg) maskPg.remove(); // 確保舊的遮罩也移除
    picPg = createGraphics(pictureWidth, pictureHeight);
    maskPg = createGraphics(pictureWidth, pictureHeight); // 實例化遮罩畫布
  }

  picPg.background(240, 240, 235);
  maskPg.background(0); // 每次重畫時，遮罩畫布必須塗黑清空
  maskMap.background(0); // 同步清空 maskMap
  
  // 假設 drawBackground 存在於其他檔案
  if(typeof drawBackground === 'function') drawBackground(picPg);
  
  let mySeed = floor(random(100000));
  let fillStyle = floor(random(4));
  let hasSecondPair = floor(random(2));
  let forceColorType = floor(random(2));
  let ColorSet = floor(random(2));
  let isRandomMode = floor(random(2));

  let centerX = isRandomMode ? picPg.width * 0.5 + random(-30, 30) : picPg.width * 0.5;
  let centerY = isRandomMode ? picPg.height * 0.5 + random(-30, 30) : picPg.height * 0.5;
  let bodyRotation = isRandomMode ? random(-PI / 12, PI / 12) : 0;
  let flapAngle = isRandomMode ? random(-PI / 4, PI / 4) : 0;
  let globalScale = isRandomMode ? random(0.8, 1.1) : 1.0;

  // === 關鍵：主畫布與遮罩畫布必須同步變換 ===
  picPg.push(); maskPg.push();
  
  picPg.translate(centerX, centerY); maskPg.translate(centerX, centerY);
  picPg.rotate(bodyRotation);        maskPg.rotate(bodyRotation);
  picPg.scale(globalScale);          maskPg.scale(globalScale);

  if (hasSecondPair == 1){
    drawWingPair(picPg, maskPg, mySeed + 1, 10, flapAngle + PI/8, 0.65, forceColorType, ColorSet, fillStyle);
  }
  drawWingPair(picPg, maskPg, mySeed, 0, flapAngle, 1.0, forceColorType, ColorSet, fillStyle);

  picPg.pop(); maskPg.pop();

  if(typeof applyNoise === 'function') applyNoise(picPg, 0.1);
  pg.image(picPg, px, py);
  maskMap.image(maskPg, px, py);
}

/**
 * 專門繪製卡片底圖、外框、裝飾與文字框的模組
 * @param {p5.Graphics} targetPg - 目標畫布 (整張卡片 pg)
 * @param {string} rarity - 稀有度
 * @param {number} px - 圖片的 X 座標
 * @param {number} py - 圖片的 Y 座標
 * @param {number} pw - 圖片的寬度
 * @param {number} ph - 圖片的高度
 */
function drawCardFrame(targetPg, rarity, px, py, pw, ph) {
  // 從 settings.js 取得一組隨機卡片配色
  let palette = random(cardBackgroundPalettes);
  let mainColor = targetPg.color(palette[0]);
  let darkColor = targetPg.color(palette[1]);

  targetPg.push();
  
  switch (rarity) {
    case 'Normal': 
    case 'Rare': {
      // 【修正 3】把塗滿底色的動作移到這裡，避免全圖卡被蓋掉
      targetPg.background(mainColor);

      // --- A. 繪製圖片的外框 ---
      targetPg.fill(darkColor);
      targetPg.noStroke();
      targetPg.rect(px - 8, py - 8, pw + 16, ph + 16);

      // --- B. 繪製卡片的內邊框裝飾 ---
      targetPg.stroke(darkColor);
      targetPg.strokeWeight(4);
      targetPg.noFill();
      targetPg.rect(15, 15, targetPg.width - 30, targetPg.height - 30, 8); // 帶有一點圓角的框

      // --- C. 繪製下方的文字說明區塊底板 ---
      let textY = py + ph + 25; 
      let textH = targetPg.height - textY - 25; 
      
      targetPg.fill(255, 255, 255, 180); 
      targetPg.strokeWeight(2);
      targetPg.rect(px, textY, pw, textH, 5); 

      targetPg.fill(10, 10, 10);          // 設定文字顏色為深灰色
      targetPg.noStroke();                // 文字不需要邊框
      targetPg.textSize(24);              // 設定文字大小
      targetPg.textAlign(CENTER, CENTER); // 設定對齊方式為置中
      // 在底板的 X 與 Y 的正中心畫出文字
      let textContent;
      switch (rarity) {
        case 'Normal': textContent = "普通"; break;
        case 'Rare': textContent = "稀有"; break;
        default: textContent = "Rarity: " + rarity; // 預防萬一有其他稀有度
      }
      targetPg.text(textContent, px + (pw / 2), textY + (textH / 2));

      break;
    }
    case 'FullArt': {
      // 全圖卡通常不需要複雜的外框，但可以加個很細的描邊收尾
      targetPg.stroke(darkColor);
      targetPg.strokeWeight(8);
      targetPg.noFill();
      targetPg.rect(0, 0, targetPg.width, targetPg.height, targetPg.width * 0.05);

      // === 新增：全圖卡的右下角小文字框 ===
      let boxW = 140;  // 文字框寬度
      let boxH = 80;  // 文字框高度
      let margin = 40; // 距離卡片邊緣的距離

      // 計算文字框的 X 與 Y 座標 (右下角)
      let boxX = targetPg.width - boxW - margin;
      let boxY = targetPg.height - boxH - margin;

      // 繪製文字框底板
      targetPg.fill(255, 255, 255); // 稍微半透明的白色底
      targetPg.stroke(darkColor);        // 外框顏色跟隨主題色
      targetPg.strokeWeight(4);
      targetPg.rect(boxX, boxY, boxW, boxH); // 加上圓角(8)

      // 繪製文字
      targetPg.fill(10, 10, 10);          // 深灰色文字
      targetPg.noStroke();                // 文字不需要外框
      targetPg.textSize(20);              // 設定文字大小
      targetPg.textAlign(CENTER, CENTER); // 置中對齊
      targetPg.text("全圖", boxX + (boxW / 2), boxY + (boxH / 2));

      break;
    }
  }

  targetPg.pop();
}

/**
 * 修改後的函式：新增第一個參數 g，代表要畫在哪個畫布上
 */
function drawWingPair(g, maskPg, seed, yOff, rot, s, forceColorType, ColorSet, fillStyle) {
  let bodyHalfWidth = 5;

  // 右翅膀 (同步變換)
  g.push(); maskPg.push();
  g.translate(bodyHalfWidth, yOff); maskPg.translate(bodyHalfWidth, yOff);
  g.rotate(rot);                    maskPg.rotate(rot);
  g.scale(s);                       maskPg.scale(s);
  drawWing(g, maskPg, seed, forceColorType, ColorSet, fillStyle);
  g.pop(); maskPg.pop();

  // 左翅膀 (鏡像，同步變換)
  g.push(); maskPg.push();
  g.translate(-bodyHalfWidth, yOff); maskPg.translate(-bodyHalfWidth, yOff);
  g.rotate(-rot);                    maskPg.rotate(-rot);
  g.scale(-s, s);                    maskPg.scale(-s, s); 
  drawWing(g, maskPg, seed, forceColorType, ColorSet, fillStyle);
  g.pop(); maskPg.pop();
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
    drawCard();
  }
}
/**
 * 繪製昆蟲的身體模組
 * @param {p5.Graphics} g - 主要畫布
 * @param {p5.Graphics} maskPg - 遮罩畫布
 * @param {number} bodyType - 身體種類
 * @param {number} seedValue - 隨機種子
 */
function drawInsectBody(g, maskPg, bodyType, seedValue) {
  if (seedValue !== undefined) {
    g.randomSeed(seedValue);
    g.noiseSeed(seedValue);
  }

  g.push();
  if (maskPg) maskPg.push();

  switch (bodyType) {
    case 0:
      drawButterflyBody(g, maskPg);
      break;
    case 1:
      drawDragonflyBody(g, maskPg);
      break;
    case 2:
      drawMothBody(g, maskPg);
      break;
    default:
      drawButterflyBody(g, maskPg);
      break;
  }

  g.pop();
  if (maskPg) maskPg.pop();
}

/**
 * 實作第一種身體：蝴蝶 (Butterfly Body)
 */
function drawButterflyBody(g, maskPg) {
  let bodyColor = g.color(30, 30, 32);      
  let highlightColor = g.color(80, 80, 85, 150); 
  let segmentColor = g.color(50, 50, 55);   

  let thoraxW = 18;
  let thoraxH = 35;
  drawPart(g, maskPg, 0, 0, thoraxW, thoraxH, bodyColor, highlightColor);

  let headSize = 14;
  let headY = -thoraxH * 0.6;
  drawPart(g, maskPg, 0, headY, headSize, headSize * 1.1, bodyColor, highlightColor);

  drawAntennae(g, maskPg, 0, headY - 5);

  let abdomenW = 14;
  let abdomenH = 80;
  let abdomenY = thoraxH * 0.4 + abdomenH * 0.5;
  drawPart(g, maskPg, 0, abdomenY, abdomenW, abdomenH, bodyColor, highlightColor);

  drawSegments(g, maskPg, 0, abdomenY, abdomenW, abdomenH, 7, segmentColor);
}

/**
 * 實作第二種身體：蜻蜓 (Dragonfly Body)
 */
function drawDragonflyBody(g, maskPg) {
  // 設定蜻蜓的顏色 (通常可以帶一點金屬感或更深的色調)
  let bodyColor = g.color(20, 25, 30);      
  let highlightColor = g.color(70, 90, 100, 160); 
  let segmentColor = g.color(40, 50, 60);   

  // 1. 繪製胸部 (Thorax) - 蜻蜓的胸部比較厚實且略呈卵形
  let thoraxW = 20;
  let thoraxH = 30;
  drawPart(g, maskPg, 0, 0, thoraxW, thoraxH, bodyColor, highlightColor);

  // 2. 繪製頭部 (Head) - 蜻蜓頭部特徵是寬度大於長度 (大複眼)
  let headW = 25;
  let headH = 16;
  let headY = -thoraxH * 0.6;
  drawPart(g, maskPg, 0, headY, headW, headH, bodyColor, highlightColor);

  // 3. 繪製腹部 (Abdomen) - 蜻蜓的腹部非常細長
  let abdomenW = 10;
  let abdomenH = 140; // 長度顯著增加
  let abdomenY = thoraxH * 0.05 + abdomenH * 0.5;
  drawPart(g, maskPg, 0, abdomenY, abdomenW, abdomenH, bodyColor, highlightColor);

  // 4. 繪製腹部節理 - 蜻蜓腹部節理非常明顯且細密
  // 增加 count 到 10，讓它看起來更像蜻蜓的長尾巴
  drawSegments(g, maskPg, 0, abdomenY, abdomenW, abdomenH, 10, segmentColor);
  
  // 蜻蜓的觸角通常極短且不明顯，所以這裡不呼叫 drawAntennae，
  // 或者你可以呼叫一個極小參數的版本：
  // drawAntennae(g, maskPg, 0, headY - 4, 5, 10); 
}

/**
 * 實作第三種身體：蛾 (Moth Body)
 */
function drawMothBody(g, maskPg) {
  // 蛾的顏色通常比較偏向大地色系、棕灰色，這裡調暖一點點
  let bodyColor = g.color(45, 40, 38);      
  let highlightColor = g.color(90, 85, 80, 150); 
  let segmentColor = g.color(30, 25, 25);   

  // 1. 繪製胸部 (Thorax) - 蛾的胸部非常寬大且毛茸茸
  let thoraxW = 26;
  let thoraxH = 36;
  drawPart(g, maskPg, 0, 0, thoraxW, thoraxH, bodyColor, highlightColor);

  // 2. 繪製頭部 (Head) - 頭部相對較小，常被胸部的毛遮住一半
  let headSize = 12;
  let headY = -thoraxH * 0.55;
  drawPart(g, maskPg, 0, headY, headSize, headSize, bodyColor, highlightColor);

  // 3. 繪製觸角 - 蛾的專屬羽狀觸角
  drawMothAntennae(g, maskPg, 0, headY - 4, 22, 35);

  // 4. 繪製腹部 (Abdomen) - 蛾的腹部短而粗胖
  let abdomenW = 22;
  let abdomenH = 45;
  let abdomenY = thoraxH * 0.4 + abdomenH * 0.5;
  drawPart(g, maskPg, 0, abdomenY, abdomenW, abdomenH, bodyColor, highlightColor);

  // 5. 繪製腹部節理 - 因為毛多，節理不需要像蜻蜓那麼密集
  drawSegments(g, maskPg, 0, abdomenY, abdomenW, abdomenH, 6, segmentColor);
}

/**
 * 輔助函式：同步繪製部位到主畫布與遮罩
 */
function drawPart(g, maskPg, x, y, w, h, col) {
  g.noStroke();
  g.fill(col);
  g.ellipse(x, y, w, h);
  
  //if (maskPg) {
  //  maskPg.noStroke();
  //  maskPg.fill(255); // 遮罩填滿純白
  //  maskPg.ellipse(x, y, w, h);
  //}
}

/**
 * 繪製腹部節理
 */
function drawSegments(g, maskPg, x, y, w, h, count) {
  g.stroke(60, 60, 65, 150);
  g.strokeWeight(1.5);
  g.noFill();
  
  let startY = y - h * 0.4;
  let endY = y + h * 0.4;
  
  for (let i = 1; i < count; i++) {
    let segmentY = g.map(i, 0, count, startY, endY);
    // 繪製稍微彎曲的節理線
    g.arc(x, segmentY, w * 0.9, 5, 0, g.PI);
    
    if (maskPg) {
      maskPg.stroke(255);
      maskPg.strokeWeight(1);
      maskPg.noFill();
      maskPg.arc(x, segmentY, w * 0.9, 5, 0, g.PI);
    }
  }
}

/**
 * 繪製觸角
 * @param {number} spread - 觸角向外展開的寬度 (預設 15)
 * @param {number} len - 觸角的長度/高度 (預設 30)
 */
function drawAntennae(g, maskPg, x, y, spread = 15, len = 30) {
  g.stroke(30, 30, 32);
  g.strokeWeight(1.2);
  g.noFill();

  // 根據展開寬度與長度，自動計算控制點的弧度
  let ctrl1X = spread * 0.4; // 稍微往外擴展
  let ctrl1Y = len * 0.4;    // 高度的一半不到
  let ctrl2X = spread * 0.8; // 更靠近末端
  let ctrl2Y = len * 0.6;    

  // === 右觸角 ===
  g.bezier(x, y, x + ctrl1X, y - ctrl1Y, x + ctrl2X, y - ctrl2Y, x + spread, y - len);
  g.fill(30, 30, 32); // 小球填滿顏色
  g.ellipse(x + spread, y - len - 1, 3, 3); // 觸角末端小球
  g.noFill(); // 畫完小球記得取消填滿，以免影響其他線條
  
  // === 左觸角 (左右對稱，只要把 X 相關的加號變減號) ===
  g.bezier(x, y, x - ctrl1X, y - ctrl1Y, x - ctrl2X, y - ctrl2Y, x - spread, y - len);
  g.fill(30, 30, 32);
  g.ellipse(x - spread, y - len - 1, 3, 3);
  g.noFill();

  // === 遮罩特效同步 ===
  if (maskPg) {
    maskPg.stroke(255);
    maskPg.strokeWeight(1);
    maskPg.noFill();
    maskPg.bezier(x, y, x + ctrl1X, y - ctrl1Y, x + ctrl2X, y - ctrl2Y, x + spread, y - len);
    maskPg.bezier(x, y, x - ctrl1X, y - ctrl1Y, x - ctrl2X, y - ctrl2Y, x - spread, y - len);
  }
}

/**
 * 繪製羽毛狀觸角 (專屬於蛾)
 */
function drawMothAntennae(g, maskPg, x, y, spread = 22, len = 35) {
  g.stroke(45, 40, 38);
  g.strokeWeight(1.5);
  g.noFill();

  // 控制點計算
  let ctrl1X = spread * 0.4; 
  let ctrl1Y = len * 0.3;    
  let ctrl2X = spread * 0.8; 
  let ctrl2Y = len * 0.7;    

  // === 畫主幹 ===
  // 右觸角主幹
  g.bezier(x, y, x + ctrl1X, y - ctrl1Y, x + ctrl2X, y - ctrl2Y, x + spread, y - len);
  // 左觸角主幹
  g.bezier(x, y, x - ctrl1X, y - ctrl1Y, x - ctrl2X, y - ctrl2Y, x - spread, y - len);

  if (maskPg) {
    maskPg.stroke(255);
    maskPg.strokeWeight(1.5);
    maskPg.noFill();
    maskPg.bezier(x, y, x + ctrl1X, y - ctrl1Y, x + ctrl2X, y - ctrl2Y, x + spread, y - len);
    maskPg.bezier(x, y, x - ctrl1X, y - ctrl1Y, x - ctrl2X, y - ctrl2Y, x - spread, y - len);
  }

  // === 畫羽毛分支 (櫛齒) ===
  let steps = 7; // 決定羽毛分支的密集度
  g.strokeWeight(1);
  if (maskPg) maskPg.strokeWeight(1);

  for (let i = 1; i <= steps; i++) {
    let t = i / (steps + 1); // 取得貝茲曲線上的進度 (0~1)
    
    // 利用 bezierPoint 取得曲線上特定點的座標
    let pxR = g.bezierPoint(x, x + ctrl1X, x + ctrl2X, x + spread, t);
    let pyR = g.bezierPoint(y, y - ctrl1Y, y - ctrl2Y, y - len, t);
    
    let pxL = g.bezierPoint(x, x - ctrl1X, x - ctrl2X, x - spread, t);
    let pyL = g.bezierPoint(y, y - ctrl1Y, y - ctrl2Y, y - len, t);

    // 畫出向外生長的小分支
    let branchLen = 6;
    g.line(pxR, pyR, pxR + branchLen, pyR + branchLen * 0.3);
    g.line(pxL, pyL, pxL - branchLen, pyL + branchLen * 0.3);

    if (maskPg) {
      maskPg.line(pxR, pyR, pxR + branchLen, pyR + branchLen * 0.3);
      maskPg.line(pxL, pyL, pxL - branchLen, pyL + branchLen * 0.3);
    }
  }
}
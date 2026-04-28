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
      // 蝴蝶類型的身體
      drawButterflyBody(g, maskPg);
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
  // 設定身體的基本比例
  let bodyColor = g.color(30, 30, 32);      // 深色主體
  let highlightColor = g.color(80, 80, 85); // 邊緣受光色
  let segmentColor = g.color(50, 50, 55);   // 節理顏色

  // 1. 繪製胸部 (Thorax) - 翅膀連接處
  let thoraxW = 18;
  let thoraxH = 35;
  drawPart(g, maskPg, 0, 0, thoraxW, thoraxH, bodyColor);

  // 2. 繪製頭部 (Head)
  let headSize = 14;
  let headY = -thoraxH * 0.6;
  drawPart(g, maskPg, 0, headY, headSize, headSize * 1.1, bodyColor);

  // 3. 繪製觸角 (Antennae)
  drawAntennae(g, maskPg, 0, headY - 5);

  // 4. 繪製長腹部 (Abdomen)
  let abdomenW = 14;
  let abdomenH = 80;
  let abdomenY = thoraxH * 0.4 + abdomenH * 0.5;
  drawPart(g, maskPg, 0, abdomenY, abdomenW, abdomenH, bodyColor);

  // 5. 繪製腹部節理 (Abdomen Segments)
  drawSegments(g, maskPg, 0, abdomenY, abdomenW, abdomenH, 7);
}

/**
 * 輔助函式：同步繪製部位到主畫布與遮罩
 */
function drawPart(g, maskPg, x, y, w, h, col) {
  g.noStroke();
  g.fill(col);
  g.ellipse(x, y, w, h);
  
  if (maskPg) {
    maskPg.noStroke();
    maskPg.fill(255); // 遮罩填滿純白
    maskPg.ellipse(x, y, w, h);
  }
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
 */
function drawAntennae(g, maskPg, x, y) {
  g.stroke(30, 30, 32);
  g.strokeWeight(1.2);
  g.noFill();

  // 右觸角
  g.bezier(x, y, x + 10, y - 20, x + 20, y - 30, x + 25, y - 50);
  g.ellipse(x + 25, y - 51, 3, 3); // 觸角末端小球
  
  // 左觸角
  g.bezier(x, y, x - 10, y - 20, x - 20, y - 30, x - 25, y - 50);
  g.ellipse(x - 25, y - 51, 3, 3);

  if (maskPg) {
    maskPg.stroke(255);
    maskPg.strokeWeight(1);
    maskPg.bezier(x, y, x + 10, y - 20, x + 20, y - 30, x + 25, y - 50);
    maskPg.bezier(x, y, x - 10, y - 20, x - 20, y - 30, x - 25, y - 50);
  }
}
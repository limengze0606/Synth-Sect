let wingOutline = [];

// 【新增】輔助函式：判斷點是否在多邊形內
function isPointInPolygon(px, py, poly) {
  let isInside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    let p1 = poly[i];
    let p2 = poly[j];
    let intersect = ((p1.y > py) !== (p2.y > py)) &&
                    (px < (p2.x - p1.x) * (py - p1.y) / (p2.y - p1.y) + p1.x);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}

function drawWing(seedValue){
  if (seedValue !== undefined) {
    randomSeed(seedValue);
    noiseSeed(seedValue);
  }

  // let wLength = random(250, 450);
  // let wWidth = random(80, 250);
  // let tipYOffset = random(-80, 100);
  let wLength = random(width * 0.25, height * 0.5);
  let wWidth = random(width * 0.13, height * 0.5);
  let tipYOffset = random(-width * 0.13, height * 0.15);
  let noiseStrength = random(2, 10);
  let wingStyle = floor(random(2));

  // 1. 取得翅膀輪廓頂點 (儲存在全域變數 wingOutline)
  wingOutline = generateWingOutline(wLength, wWidth, tipYOffset, noiseStrength, wingStyle);

  // 2. 開啟裁切，畫出作為裁切範圍的翅膀底色
  drawingContext.save(); 
  fill(250, 250, 250, 200); 
  noStroke();
  beginShape();
  for (let p of wingOutline) vertex(p.x, p.y);
  endShape(CLOSE);
  drawingContext.clip(); 

  // === 3. 隨機決定要繪製哪一種花紋 ===
  // 假設目前規劃 3 種花紋，隨機選 0, 1, 或 2
  // let patternType = floor(random(3)); 
  let patternType = 0;
  
  if (patternType === 0) {
    // 傳入邊界參數供 Voronoi 撒點使用
    drawVoronoiPattern(wLength, wWidth, tipYOffset);
  } else if (patternType === 1) {
    // 預留：未來的第二種花紋 (例如：平行線、波浪)
    // drawLinesPattern(wLength, wWidth);
  } else {
    // 預留：未來的第三種花紋 (例如：純色漸層或留白)
    // drawGradientPattern();
  }

  // 4. 解除裁切狀態，回到正常的畫布
  drawingContext.restore(); 

  // 5. 補上最外層的深灰色清晰輪廓
  stroke(30, 30, 40);       
  strokeWeight(2);
  noFill();
  beginShape();
  for (let p of wingOutline) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
}

/**
 * 繪製 Voronoi 翅脈網格
 * @param {number} wLength - 翅膀長度，用於計算撒點邊界
 * @param {number} wWidth - 翅膀寬度，用於計算撒點邊界
 * @param {number} tipYOffset - 翅尖偏移，用於計算撒點邊界
 */
function drawVoronoiPattern(wLength, wWidth, tipYOffset) {
  let seedPoints = [];
  let numPoints = 800; // 撒點數量，也可以改成依翅膀大小決定 (如 wLength * 2)
  
  // 1. 收集落在翅膀內部的隨機種子點
  for (let i = 0; i < numPoints; i++) {
    let px = random(0, wLength + 50); 
    let py = random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    
    if (isPointInPolygon(px, py, wingOutline)) {
      seedPoints.push([px, py]); 
    }
  }

  // 2. 使用 d3-delaunay 生成細胞
  if (seedPoints.length > 0) {
    const delaunay = d3.Delaunay.from(seedPoints);
    const voronoi = delaunay.voronoi([0, -wWidth * 2, wLength + 50, wWidth * 2]);

    stroke(150, 160, 170, 180); 
    strokeWeight(1);

    // 3. 畫出每一個細胞
    for (let i = 0; i < seedPoints.length; i++) {
      let polygon = voronoi.cellPolygon(i);
      if (polygon) {
        // 給每個細胞一點隨機的白色透明度，創造膜的質感
        fill(255, 255, 255, random(10, 40)); 
        
        beginShape();
        for (let pt of polygon) {
          vertex(pt[0], pt[1]); 
        }
        endShape(CLOSE);
      }
    }
  }
}

/**
 * 單片翅膀輪廓生成器
 * @param {number} len - 翅膀總長度
 * @param {number} wid - 翅膀最大寬度(向下的幅度)
 * @param {number} tipY - 翅尖的 Y 軸偏移量
 * @param {number} noiseMax - 邊緣不規則擾動的最大值
 * @param {number} wingStyle - 【新增】0 代表蝴蝶(銳利尖端)，1 代表蜻蜓(圓潤尖端)
 * @returns {p5.Vector[]} 包含輪廓座標的陣列
 */
function generateWingOutline(len, wid, tipY, noiseMax, wingStyle = 0) {
  let points = [];
  let resolution = 150; 

  // 宣告控制點變數
  let l_x1, l_y1, l_cx1, l_cy1, l_cx2, l_cy2, l_x2, l_y2;
  let t_x1, t_y1, t_cx1, t_cy1, t_cx2, t_cy2, t_x2, t_y2;

  // 使用 switch 根據 wingStyle 決定控制點的配置
  switch (wingStyle) {
    case 0: // === 風格 0：蝴蝶 (銳利尖端、後緣寬大) ===
      // --- 前緣 ---
      l_x1 = 0;           l_y1 = 0;              
      l_cx1 = len * 0.3;  l_cy1 = -wid * 0.15;   
      l_cx2 = len * 0.7;  l_cy2 = tipY - wid * 0.1; 
      l_x2 = len;         l_y2 = tipY;           
      // --- 後緣 ---
      t_x1 = len;         t_y1 = tipY;           
      t_cx1 = len * 0.8;  t_cy1 = wid * 0.8;     
      t_cx2 = len * 0.3;  t_cy2 = wid * 1.2;     
      t_x2 = 0;           t_y2 = 0;              
      break;

    case 1: // === 風格 1：蜻蜓 (圓潤尖端、修長平滑) ===
      // 秘訣：讓 l_cx2 和 t_cx1 的 X 座標都退後一點(例如 0.95)，
      // 並在 Y 軸上對稱展開，就能畫出完美的圓角翅尖！
      // --- 前緣 ---
      l_x1 = 0;           l_y1 = 0;              
      l_cx1 = len * 0.4;  l_cy1 = -wid * 0.05;      // 前緣較為平坦 
      l_cx2 = len * 0.95; l_cy2 = tipY - wid * 0.25; // 控制點往上拉 
      l_x2 = len;         l_y2 = tipY;           
      // --- 後緣 ---
      t_x1 = len;         t_y1 = tipY;           
      t_cx1 = len * 0.95; t_cy1 = tipY + wid * 0.25; // 控制點往下拉 (與前緣形成平滑切線)
      t_cx2 = len * 0.5;  t_cy2 = wid * 0.5;         // 後緣較為平緩收斂
      t_x2 = 0;           t_y2 = 0;              
      break;
  }

  // --- A. 繪製前緣 (Leading Edge) ---
  for (let i = 0; i <= resolution; i++) {
    let t = i / resolution;
    let x = bezierPoint(l_x1, l_cx1, l_cx2, l_x2, t);
    let y = bezierPoint(l_y1, l_cy1, l_cy2, l_y2, t);

    let fade = sin(t * PI); 
    // 蜻蜓的前緣通常比較平滑，我們可以在 style 1 時降低一點雜訊
    let currentNoiseMax = (wingStyle === 1) ? noiseMax * 0.3 : noiseMax;
    let n = map(noise(x * 0.01, y * 0.01), 0, 1, -currentNoiseMax * 0.5, currentNoiseMax * 0.5) * fade;
    points.push(createVector(x, y + n));
  }

  // --- B. 繪製後緣 (Trailing Edge) ---
  for (let i = 1; i < resolution; i++) { 
    let t = i / resolution;
    let x = bezierPoint(t_x1, t_cx1, t_cx2, t_x2, t);
    let y = bezierPoint(t_y1, t_cy1, t_cy2, t_y2, t);

    let fade = sin(t * PI);
    let currentNoiseMax = (wingStyle === 1) ? noiseMax * 0.8 : noiseMax;
    let n = map(noise(x * 0.03, y * 0.03 + 1000), 0, 1, -currentNoiseMax * 2, currentNoiseMax * 1.5) * fade;
    points.push(createVector(x + n * 0.5, y + n)); 
  }

  return points;
}
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

  // 1. 隨機決定要使用哪一種撒點策略 (0, 1, 或 2)
  let strategyType = floor(random(3));
  // let strategyType = 1;

  // 根據策略取得種子點陣列
  switch (strategyType) {
    case 0:
      seedPoints = scatterUniform(wLength, wWidth, tipYOffset);
      break;
    case 1:
      seedPoints = scatterSineDensity(wLength, wWidth, tipYOffset);
      break;
    case 2:
      seedPoints = scatterJitteredGrid(wLength, wWidth, tipYOffset);
      break;
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

/**
 * 策略 0：均勻隨機分布 (基礎款)
 */
function scatterUniform(wLength, wWidth, tipYOffset) {
  let pts = [];
  let numPoints = wLength * 1.5; // 撒點數量，也可以改成依翅膀大小決定
  for (let i = 0; i < numPoints; i++) {
    let px = random(0, wLength + 50); 
    let py = random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    
    if (isPointInPolygon(px, py, wingOutline)) {
      pts.push([px, py]); 
    }
  }
  return pts;
}

/**
 * 策略 1：正弦波疏密漸層 (加入豐富的隨機變化)
 */
function scatterSineDensity(wLength, wWidth, tipYOffset) {
  let pts = [];
  
  // 【變化 1：總撒點數】
  // 決定細胞的整體大小。點越多細胞越小，點越少細胞越大。
  let numPointsToTry = floor(random(500, 3000)); 

  // 【變化 2：波長與頻率】
  // 數值小 = 寬大的粗條紋；數值大 = 密集的細條紋
  let frequency = random(0.01, 0.08);

  // 【變化 3：相位偏移】
  // 隨機推移正弦波的起點 (0 到 2π)，讓條紋位置每次都不同
  let phaseOffset = random(0, TWO_PI);

  // 【變化 4：疏密對比度】
  // minProb 越接近 0，波谷會越空曠；maxProb 越接近 1，波峰會越密集
  let minProb = random(0.0, 0.15); 
  let maxProb = random(0.6, 1.0);  

  // 【變化 5：波紋方向】(隨機決定要垂直條紋還是同心圓)
  // 0: 垂直條紋 (依 X 軸變化)
  // 1: 同心圓波浪 (依距離變化，像樹木年輪或生長紋)
  let waveType = floor(random(2));

  for (let i = 0; i < numPointsToTry; i++) {
    let px = random(0, wLength + 50); 
    let py = random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    
    if (isPointInPolygon(px, py, wingOutline)) {
      
      let waveValue = 0;
      
      if (waveType === 0) {
        // 垂直條紋：只看 X 座標
        waveValue = sin(px * frequency + phaseOffset); 
      } else {
        // 同心圓生長紋：計算點到根部 (0,0) 的距離
        let d = dist(0, 0, px, py);
        // 距離產生的波浪通常需要稍微小一點的頻率才好看
        waveValue = sin(d * frequency * 0.8 + phaseOffset); 
      }
      
      // 將波的值 (-1 到 1) 映射到我們設定的機率範圍
      let keepProbability = map(waveValue, -1, 1, minProb, maxProb); 
      
      if (random() < keepProbability) {
        pts.push([px, py]); 
      }
    }
  }
  return pts;
}

/**
 * 策略 2：方向性網格加雜訊 (順應翅膀"基部到尖端"的實際向量)
 */
function scatterJitteredGrid(wLength, wWidth, tipYOffset) {
  let pts = [];
  
  // 【關鍵修改 1：拉大比例差距】
  let uStep = 10;  // u：順著翅膀生長方向 (擠得非常密，這樣邊界才會被往前後拉長)
  let vStep = 40; // v：垂直方向的間距 (拉得非常寬)
  
  let angle = atan2(tipYOffset, wLength);
  let totalLength = dist(0, 0, wLength, tipYOffset);
  
  for (let u = -50; u < totalLength + 50; u += uStep) {
    for (let v = -wWidth * 2; v < wWidth * 2; v += vStep) {
      
      // 【關鍵修改 2：限制垂直方向的雜訊】
      // 長度方向(U)可以亂一點沒關係，但寬度方向(V)要盡量保持直線，才能擠出細長的平行細胞
      let jitterU = random(-uStep * 0.3, uStep * 0.3); 
      let jitterV = random(-vStep * 0.4, vStep * 0.4);
      
      let finalU = u + jitterU;
      let finalV = v + jitterV;

      // 旋轉矩陣
      let finalX = finalU * cos(angle) - finalV * sin(angle);
      let finalY = finalU * sin(angle) + finalV * cos(angle);

      if (isPointInPolygon(finalX, finalY, wingOutline)) {
        pts.push([finalX, finalY]); 
      }
    }
  }
  return pts;
}
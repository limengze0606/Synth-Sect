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

function drawWings(){
  translate(width * 0.3, height * 0.5);

  let wLength = random(250, 450); 
  let wWidth = random(80, 250);   
  let tipYOffset = random(-80, 100); 
  let noiseStrength = random(2, 10); 

  // 1. 取得翅膀輪廓頂點
  wingOutline = generateWingOutline(wLength, wWidth, tipYOffset, noiseStrength);

  // === 【重點開始】Voronoi 與遮罩處理 ===
  
  // 啟動畫布狀態儲存與裁切
  drawingContext.save(); 
  
  // 畫出作為裁切範圍的翅膀底色
  fill(250, 250, 250, 200); 
  noStroke();
  beginShape();
  for (let p of wingOutline) vertex(p.x, p.y);
  endShape(CLOSE);
  
  // 開啟裁切：接下來畫的 Voronoi 都會被限制在這個形狀內
  drawingContext.clip(); 

  // 2. 收集翅膀內部的隨機種子點
  let seedPoints = [];
  let numPoints = 800; // 撒下 800 個點測試
  
  for (let i = 0; i < numPoints; i++) {
    // 設定撒點的隨機範圍 (根據翅膀的長寬做個粗略的包圍盒)
    let px = random(0, wLength + 50); 
    let py = random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    
    // 只保留真的落在輪廓內的點
    // d3-delaunay 預設接受 [x, y] 的陣列格式
    if (isPointInPolygon(px, py, wingOutline)) {
      seedPoints.push([px, py]); 
    }
  }

  // 3. 使用 d3-delaunay 生成 Voronoi 細胞
  if (seedPoints.length > 0) {
    const delaunay = d3.Delaunay.from(seedPoints);
    // 設定 Voronoi 的邊界框 [minX, minY, maxX, maxY]
    const voronoi = delaunay.voronoi([0, -wWidth * 2, wLength + 50, wWidth * 2]);

    // 設定翅脈(細胞邊緣)的樣式
    stroke(150, 160, 170, 180); 
    strokeWeight(1);
    noFill(); 

    // 畫出每一個細胞
    for (let i = 0; i < seedPoints.length; i++) {
      let polygon = voronoi.cellPolygon(i);
      if (polygon) {
        beginShape();
        for (let pt of polygon) {
          vertex(pt[0], pt[1]); // pt[0] 是 x, pt[1] 是 y
        }
        endShape(CLOSE);
      }
    }
  }

  // 解除裁切狀態，回到正常的畫布
  drawingContext.restore(); 

  // === 【重點結束】 ===

  // 4. 最後，補上最外層的深灰色清晰輪廓
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
 * 單片翅膀輪廓生成器
 * @param {number} len - 翅膀總長度
 * @param {number} wid - 翅膀最大寬度(向下的幅度)
 * @param {number} tipY - 翅尖的 Y 軸偏移量
 * @param {number} noiseMax - 邊緣不規則擾動的最大值
 * @returns {p5.Vector[]} 包含輪廓座標的陣列
 */
function generateWingOutline(len, wid, tipY, noiseMax) {
  let points = [];
  let resolution = 150; 

  // --- A. 前緣 (Leading Edge) ---
  let l_x1 = 0,           l_y1 = 0;              
  let l_cx1 = len * 0.3,  l_cy1 = -wid * 0.15;   
  let l_cx2 = len * 0.7,  l_cy2 = tipY - wid * 0.1; 
  let l_x2 = len,         l_y2 = tipY;           

  for (let i = 0; i <= resolution; i++) {
    let t = i / resolution;
    let x = bezierPoint(l_x1, l_cx1, l_cx2, l_x2, t);
    let y = bezierPoint(l_y1, l_cy1, l_cy2, l_y2, t);

    // 【新增】計算衰減值，讓兩端的 Noise 為 0
    let fade = sin(t * PI); 
    
    // 將算出的 noise 乘上 fade
    let n = map(noise(x * 0.01, y * 0.01), 0, 1, -noiseMax * 0.5, noiseMax * 0.5) * fade;
    points.push(createVector(x, y + n));
  }

  // --- B. 後緣 (Trailing Edge) ---
  let t_x1 = len,         t_y1 = tipY;           
  let t_cx1 = len * 0.8,  t_cy1 = wid * 0.8;     
  let t_cx2 = len * 0.3,  t_cy2 = wid * 1.2;     
  let t_x2 = 0,           t_y2 = 0;              

  // 【修改】i 到 resolution - 1 停止，因為最後一個點(基部原點)讓 endShape(CLOSE) 自動接合就好
  for (let i = 1; i < resolution; i++) { 
    let t = i / resolution;
    let x = bezierPoint(t_x1, t_cx1, t_cx2, t_x2, t);
    let y = bezierPoint(t_y1, t_cy1, t_cy2, t_y2, t);

    // 【新增】後緣也套用衰減值
    let fade = sin(t * PI);
    
    let n = map(noise(x * 0.03, y * 0.03 + 1000), 0, 1, -noiseMax * 2, noiseMax * 1.5) * fade;
    points.push(createVector(x + n * 0.5, y + n)); 
  }

  return points;
}
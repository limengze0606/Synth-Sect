let wingOutline = [];

function drawWings(){
  // 將座標原點移至畫面偏左，讓翅膀有空間向右伸展
  translate(width * 0.3, height * 0.5);

  // === 1. 隨機生成翅膀基因參數 ===
  // 長度 (Aspect Ratio)
  let wLength = random(250, 450); 
  // 寬度 (Max Width)
  let wWidth = random(80, 250);   
  // 翅尖上下偏移位置 (Apex Offset)
  let tipYOffset = random(-80, 100); 
  // 邊緣有機擾動強度 (Noise Strength)
  let noiseStrength = random(2, 10); 

  // === 2. 呼叫生成器，取得輪廓點陣列 ===
  wingOutline = generateWingOutline(wLength, wWidth, tipYOffset, noiseStrength);

  // === 3. 繪製輪廓 ===
  fill(255, 255, 255, 150); // 半透明白色
  stroke(30, 30, 40);       // 深灰色邊線
  strokeWeight(2);

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
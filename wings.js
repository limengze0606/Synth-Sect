// 【移除】已刪除頂部的 let wingOutline = []; 全域變數

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

function drawWing(g, maskPg, seedValue, forceColorType, ColorSet, fillStyle){
  if (seedValue !== undefined) {
    g.randomSeed(seedValue);
    g.noiseSeed(seedValue);
  }

  let wLength = g.random(g.width * 0.25, g.width * 0.5);
  let wWidth = g.random(g.width * 0.13, g.height * 0.5);
  let tipYOffset = g.random(-g.width * 0.13, g.height * 0.15);
  let noiseStrength = g.random(2, 10);
  let wingStyle = g.floor(g.random(2));

  let outline = generateWingOutline(wLength, wWidth, tipYOffset, noiseStrength, wingStyle);

  // === 【修正關鍵】：改用 p5 的 push/pop 來管理裁切狀態 ===
  // 這樣能確保 p5.js 的色彩記憶與原生畫布同步
  g.push(); 
  if (maskPg) maskPg.push();

  // 1. 主畫布設定裁切
  g.fill(250, 250, 250, 200); 
  g.noStroke();
  g.beginShape();
  for (let p of outline) g.vertex(p.x, p.y);
  g.endShape(g.CLOSE);
  g.drawingContext.clip();

  // 2. 遮罩畫布設定裁切 (原生路徑寫法最穩定)
  if (maskPg) {
    maskPg.drawingContext.beginPath();
    maskPg.drawingContext.moveTo(outline[0].x, outline[0].y);
    for (let i = 1; i < outline.length; i++) {
      maskPg.drawingContext.lineTo(outline[i].x, outline[i].y);
    }
    maskPg.drawingContext.closePath();
    maskPg.drawingContext.clip(); 
  }

  // 3. 繪製花紋
  let patternType = 0;
  if (patternType === 0) {
    drawVoronoiPattern(g, maskPg, wLength, wWidth, tipYOffset, forceColorType, ColorSet, fillStyle, outline);
  } 

  // === 【修正關鍵】：使用 pop() 解除裁切，並重置色彩記憶 ===
  g.pop(); 
  if (maskPg) maskPg.pop();

  // 4. 補上最外層的漸變/粗細輪廓
  // 現在 p5.js 的色彩緩存已被重置，這裡的純白線條能 100% 被畫出來了
  drawGradualStroke(g, maskPg, outline, forceColorType, ColorSet);
}

/**
 * 繪製 Voronoi 翅脈網格 (新增 outline 參數接收)
 */
function drawVoronoiPattern(g, maskPg, wLength, wWidth, tipYOffset, forceColorType, ColorSet, fillStyle, outline) {
  let seedPoints = [];
  let strategyType = floor(g.random(3));

  // 將 outline 傳給所有 scatter 策略
  switch (strategyType) {
    case 0: seedPoints = scatterUniform(g, wLength, wWidth, tipYOffset, outline); break;
    case 1: seedPoints = scatterSineDensity(g, wLength, wWidth, tipYOffset, outline); break;
    case 2: seedPoints = scatterJitteredGrid(g, wLength, wWidth, tipYOffset, outline); break;
  }

  if (seedPoints.length > 0) {
    const delaunay = d3.Delaunay.from(seedPoints);
    const voronoi = delaunay.voronoi([0, -wWidth * 2, wLength + 50, wWidth * 2]);

    g.strokeWeight(1);

    if (maskPg) {
      maskPg.stroke(255); 
      maskPg.strokeWeight(1); 
      maskPg.noFill();    
    }

    for (let i = 0; i < seedPoints.length; i++) {
      let polygon = voronoi.cellPolygon(i);
      if (polygon) {
        let cellX = seedPoints[i][0];
        let cellY = seedPoints[i][1];
        let progress = g.constrain(cellX / wLength, 0, 1); 

        let fillCol = getVoronoiFillColor(g, progress, fillStyle, cellX, cellY);

        switch (forceColorType) {
          case 0: applySimpleVoronoiStyle(g, progress, fillCol); break;
          case 1: applyNMMVoronoiStyle(g, progress, ColorSet, fillCol); break;
        }

        g.strokeWeight(1); 
        g.beginShape();
        for (let pt of polygon) g.vertex(pt[0], pt[1]); 
        g.endShape(g.CLOSE);

        if (maskPg) {
          maskPg.beginShape();
          for (let pt of polygon) maskPg.vertex(pt[0], pt[1]); 
          maskPg.endShape(maskPg.CLOSE);
        }
      }
    }
  }
}

function generateWingOutline(len, wid, tipY, noiseMax, wingStyle = 0) {
  let points = [];
  let resolution = 150; 
  let l_x1, l_y1, l_cx1, l_cy1, l_cx2, l_cy2, l_x2, l_y2;
  let t_x1, t_y1, t_cx1, t_cy1, t_cx2, t_cy2, t_x2, t_y2;

  switch (wingStyle) {
    case 0: 
      l_x1 = 0;           l_y1 = 0;              
      l_cx1 = len * 0.3;  l_cy1 = -wid * 0.15;   
      l_cx2 = len * 0.7;  l_cy2 = tipY - wid * 0.1; 
      l_x2 = len;         l_y2 = tipY;           
      t_x1 = len;         t_y1 = tipY;           
      t_cx1 = len * 0.8;  t_cy1 = wid * 0.8;     
      t_cx2 = len * 0.3;  t_cy2 = wid * 1.2;     
      t_x2 = 0;           t_y2 = 0;              
      break;
    case 1: 
      l_x1 = 0;           l_y1 = 0;              
      l_cx1 = len * 0.4;  l_cy1 = -wid * 0.05;      
      l_cx2 = len * 0.95; l_cy2 = tipY - wid * 0.25; 
      l_x2 = len;         l_y2 = tipY;           
      t_x1 = len;         t_y1 = tipY;           
      t_cx1 = len * 0.95; t_cy1 = tipY + wid * 0.25; 
      t_cx2 = len * 0.5;  t_cy2 = wid * 0.5;         
      t_x2 = 0;           t_y2 = 0;              
      break;
  }

  for (let i = 0; i <= resolution; i++) {
    let t = i / resolution;
    let x = bezierPoint(l_x1, l_cx1, l_cx2, l_x2, t);
    let y = bezierPoint(l_y1, l_cy1, l_cy2, l_y2, t);
    let fade = sin(t * PI); 
    let currentNoiseMax = (wingStyle === 1) ? noiseMax * 0.3 : noiseMax;
    let n = map(noise(x * 0.01, y * 0.01), 0, 1, -currentNoiseMax * 0.5, currentNoiseMax * 0.5) * fade;
    points.push(createVector(x, y + n));
  }

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

// === 以下三個策略函式皆新增 outline 參數並替換內部判定 ===
function scatterUniform(g, wLength, wWidth, tipYOffset, outline) {
  let pts = [];
  let numPoints = wLength * 1.5; 
  for (let i = 0; i < numPoints; i++) {
    let px = g.random(0, wLength + 50); 
    let py = g.random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    if (isPointInPolygon(px, py, outline)) pts.push([px, py]); 
  }
  return pts;
}

function scatterSineDensity(g, wLength, wWidth, tipYOffset, outline) {
  let pts = [];
  let numPointsToTry = floor(g.random(500, 3000)); 
  let frequency = g.random(0.01, 0.08);
  let phaseOffset = g.random(0, TWO_PI);
  let minProb = g.random(0.0, 0.15); 
  let maxProb = g.random(0.6, 1.0);  
  let waveType = floor(g.random(2));

  for (let i = 0; i < numPointsToTry; i++) {
    let px = g.random(0, wLength + 50); 
    let py = g.random(-wWidth * 1.5, tipYOffset + wWidth * 1.5);
    if (isPointInPolygon(px, py, outline)) {
      let waveValue = 0;
      if (waveType === 0) waveValue = sin(px * frequency + phaseOffset); 
      else waveValue = sin(dist(0, 0, px, py) * frequency * 0.8 + phaseOffset); 
      
      if (g.random() < map(waveValue, -1, 1, minProb, maxProb)) pts.push([px, py]); 
    }
  }
  return pts;
}

function scatterJitteredGrid(g, wLength, wWidth, tipYOffset, outline) {
  let pts = [];
  let uStep = 10;  
  let vStep = 40; 
  let angle = atan2(tipYOffset, wLength);
  let totalLength = dist(0, 0, wLength, tipYOffset);
  
  for (let u = -50; u < totalLength + 50; u += uStep) {
    for (let v = -wWidth * 2; v < wWidth * 2; v += vStep) {
      let finalU = u + g.random(-uStep * 0.3, uStep * 0.3);
      let finalV = v + g.random(-vStep * 0.4, vStep * 0.4);
      let finalX = finalU * cos(angle) - finalV * sin(angle);
      let finalY = finalU * sin(angle) + finalV * cos(angle);

      if (isPointInPolygon(finalX, finalY, outline)) pts.push([finalX, finalY]); 
    }
  }
  return pts;
}

// 已經正確接收 maskPg，現在有了正確的 outline，粗細輪廓就會正常顯示了
function drawGradualStroke(g, maskPg, outline, forceColorType, ColorSet) {
  let colorType = forceColorType !== undefined ? forceColorType : g.floor(g.random(2));
  let firstPoint = outline[0];
  let lastPoint = outline[outline.length - 1];
  let firstColor, lastColor, firstSW, lastSW;

  for (let i = 0; i < outline.length - 1; i++) {
    let p1 = outline[i];
    let p2 = outline[i + 1];
    let rawProgress = i / outline.length;
    let strokeCol;

    if (colorType === 0) strokeCol = getSimpleLerpColor(g, rawProgress, "#281E50", "#cae9f9");
    else strokeCol = getNMMColor(g, rawProgress, ColorSet);

    let weightPivot = 0.95;
    let wProgress = (rawProgress < weightPivot) ? g.map(rawProgress, 0, weightPivot, 0, 1) : g.map(rawProgress, weightPivot, 1, 1, 0);
    let sw = g.map(wProgress, 0, 1, 3, 0.7);

    if (i === 0) { firstColor = strokeCol; firstSW = sw; }
    if (i === outline.length - 2) { lastColor = strokeCol; lastSW = sw; }

    g.stroke(strokeCol);
    g.strokeWeight(sw);
    g.line(p1.x, p1.y, p2.x, p2.y);

    if (maskPg) {
      maskPg.stroke(255);
      maskPg.strokeWeight(sw); 
      maskPg.line(p1.x, p1.y, p2.x, p2.y);
    }
  }

  let bridgeColor = g.lerpColor(lastColor, firstColor, 0.5);
  let bridgeSW = (lastSW + firstSW) / 2;

  g.stroke(bridgeColor);
  g.strokeWeight(bridgeSW);
  g.line(lastPoint.x, lastPoint.y, firstPoint.x, firstPoint.y);

  if (maskPg) {
    maskPg.stroke(255);
    maskPg.strokeWeight(bridgeSW);
    maskPg.line(lastPoint.x, lastPoint.y, firstPoint.x, firstPoint.y);
  }
}

function getSimpleLerpColor(g, p, c1, c2) {
  let colorPivot = 0.7;  
  let n = g.noise(p * 10) * 0.3;
  let cProgress = (p < colorPivot) ? g.map(p, 0, colorPivot, 0, 1) : g.map(p, colorPivot, 1, 1, 0);
  return g.lerpColor(g.color(c1), g.color(c2), g.constrain(cProgress + n, 0, 1));
}

function getNMMColor(g, p, nmmColorSet) {
  let baseColor, midColor, highlightColor; 
  let peakHighlight = g.color("#FFFFFF"); 

  switch (nmmColorSet){
    case 0:
      baseColor = g.color("#222423"); midColor = g.color("#6D6F6E"); highlightColor = g.color("#C7C7C7"); break;
    case 1:
      baseColor = g.color("#6c5626"); midColor = g.color("#bd9b50"); highlightColor = g.color("#F2DFBA"); break;
  }

  let noiseVal = g.noise(p * 20); 
  let shineFactor = g.pow(noiseVal, 2);
  let finalC;
  let peakThreshold = 0.85; 

  if (shineFactor < 0.3) {
    finalC = g.lerpColor(baseColor, midColor, shineFactor * 2);
  } else if (shineFactor < peakThreshold) {
    finalC = g.lerpColor(midColor, highlightColor, g.map(shineFactor, 0.3, peakThreshold, 0, 1));
  } else {
    finalC = g.lerpColor(highlightColor, peakHighlight, g.map(shineFactor, peakThreshold, 1.0, 0, 1));
  }
  return finalC;
}

function applySimpleVoronoiStyle(g, progress, fillCol) {
  let strokeCol = getSimpleLerpColor(g, progress, "#281E50", "#80a9be");
  strokeCol.setAlpha(180); 
  g.stroke(strokeCol); g.fill(fillCol);
}

function applyNMMVoronoiStyle(g, progress, colorSet, fillCol) {
  let strokeCol = getNMMColor(g, progress, colorSet);
  strokeCol.setAlpha(200); 
  g.stroke(strokeCol); g.fill(fillCol);
}

function getVoronoiFillColor(g, progress, fillStyle, cellX, cellY) {
  let c;
  switch (fillStyle) {
    case 0: 
      let n = g.noise(cellX * 0.015, cellY * 0.015);
      let pink = g.color("#FFBEDC"); pink.setAlpha(130); 
      let cyan = g.color("#b4f0ff"); cyan.setAlpha(130);
      c = g.lerpColor(pink, cyan, n);
      break;
    case 1: 
      let coreEnergy = g.color("#00e5fe"); coreEnergy.setAlpha(180);
      let fadeEnergy = g.color("#0f0064"); fadeEnergy.setAlpha(200);
      c = g.lerpColor(fadeEnergy, coreEnergy, 1.0 - g.pow(progress, 0.6));
      break;
    case 2: 
      let amber = g.color("#d4a373"); amber.setAlpha(220);
      let transparent = g.color("#ffffff"); transparent.setAlpha(0);
      c = g.lerpColor(amber, transparent, progress * 1.5); 
      break;
    case 3: 
      let frostNoise = g.noise(cellX * 0.04, cellY * 0.04 + 1000);
      if (frostNoise > 0.55) c = g.color(230, 230, 230, 255);
      else if (frostNoise < 0.35) c = g.color(200, 200, 200, 15);
      else c = g.color(255, 255, 255, 60);
      break;
  }
  return c;
}
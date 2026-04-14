function drawBackground(pg) {
  // 1. 極簡化：陣列中只存放兩個 Hex 色碼，無須 name、bg 或 line 標籤
  const palettes = [
    ["#d6b6a0", "#afb1b4"],
    ["#58676e", "#d2d7dc"],
    ["#A6A279", "#8290ac"],
    ["#8f7783", "#d7b08a"],
    ["#283741", "#788ca0"]
  ];

  // 2. 隨機選出一組顏色
  let chosenColors = random(palettes);

  // 3. 隨機打亂位置：一半的機率會對調背景與線條的顏色
  let isReversed = random([true, false]);
  let currentPalette = {
    bg: isReversed ? chosenColors[1] : chosenColors[0],
    line: isReversed ? chosenColors[0] : chosenColors[1]
  };

  let backgroundType = floor(random(4)); 
  //let backgroundType = 1; 
  
  // 將處理好的 currentPalette 傳給各個背景函式
  switch (backgroundType) {
    case 0:
      ocean(pg, currentPalette);
      break;
    case 1:
      sky(pg, currentPalette);
      break;
    case 2:
      concentricArcs(pg, currentPalette);
      break;
    case 3:
      diagonalWind(pg, currentPalette);
      break;
  }
  drawSpanningRects(pg);
}

// ---------------------------------------------------------
// 各個背景函式更新
// ---------------------------------------------------------

function ocean(pg, palette) {
  pg.push();
  pg.translate(pg.width / 2, pg.height / 2); 
  
  // 背景可以直接吃 Hex 字串
  pg.fill(palette.bg);
  pg.noStroke();
  pg.rect(-pg.width / 2, -pg.height / 2, pg.width, pg.height); 
  
  pg.strokeWeight(pg.height * 0.001);
  
  // 【效能關鍵】在迴圈外先解析 Hex 色碼並提取 RGB
  let cLine = color(palette.line);
  let r = red(cLine);
  let g = green(cLine);
  let b = blue(cLine);

  for (let i = 0; i < 16000; i++) {
    let px = (random(1) - 0.5) * pg.width;
    let distribution = pow(random(1), 4); 
    let py = (distribution * pg.height) - (pg.height / 2);
    
    let sz = random(pg.width * 0.15, pg.width * 0.4); 
    let alpha = random(1) * 100; 
    
    // 將提取出的 RGB 與隨機透明度結合
    pg.stroke(r, g, b, alpha);
    pg.line(px - sz / 2, py, px + sz / 2, py);
  }
  
  pg.pop();
}

function sky(pg, palette) {
  pg.push();
  pg.translate(pg.width / 2, pg.height / 2); 
  
  pg.strokeWeight(pg.height * 0.0003);
  
  // 在迴圈外先解析 Hex 色碼並提取 RGB
  let cLine = color(palette.line);
  let r = red(cLine);
  let g = green(cLine);
  let b = blue(cLine);
  
  for (let i = 0; i < 50000; i++) {
    let px = (random(1) - 0.5) * pg.width;
    let distribution = pow(random(1), 4) - 1; 
    let py = (distribution * pg.height) + (pg.height / 2);
    
    let sz = random(20, 40); 
    let brightOffset = random(-20, 20); 
    
    pg.stroke(
      constrain(r + brightOffset, 0, 255),
      constrain(g + brightOffset, 0, 255),
      constrain(b + brightOffset, 0, 255)
    );
    
    pg.line(px - sz / 2, py, px + sz / 2, py);
  }
  
  pg.pop();
}

function concentricArcs(pg, palette) {
  pg.push();
  pg.translate(pg.width / 2, pg.height / 2); 
  
  pg.fill(palette.bg);
  pg.noStroke();
  pg.rect(-pg.width / 2, -pg.height / 2, pg.width, pg.height);
  
  pg.strokeWeight(pg.height * 0.0006);
  pg.noFill(); 
  
  let numCenters = floor(random(1, 4));
  let centers = [];
  for (let i = 0; i < numCenters; i++) {
    centers.push({
      x: (random(1) - 0.5) * pg.width,
      y: (random(1) - 0.5) * pg.height
    });
  }
  
  // 在迴圈外先解析 Hex 色碼並提取 RGB
  let cLine = color(palette.line);
  let r = red(cLine);
  let g = green(cLine);
  let b = blue(cLine);
  
  for (let i = 0; i < 15000; i++) {
    let center = random(centers);
    let radius = random(10, pg.width * 0.7); 
    let startAngle = random(TWO_PI);
    let arcLength = random(0.02, 0.15); 
    let endAngle = startAngle + arcLength;
    
    let brightOffset = random(-20, 30);
    let alpha = random(30, 120); 
    
    pg.stroke(
      constrain(r + brightOffset, 0, 255), 
      constrain(g + brightOffset, 0, 255), 
      constrain(b + brightOffset, 0, 255), 
      alpha
    );
    
    pg.arc(center.x, center.y, radius * 2, radius * 2, startAngle, endAngle);
  }
  
  pg.pop();
}

function diagonalWind(pg, palette) {
  pg.push();
  pg.translate(pg.width / 2, pg.height / 2);
  
  pg.fill(palette.bg);
  pg.noStroke();
  pg.rect(-pg.width / 2, -pg.height / 2, pg.width, pg.height);
  
  pg.strokeWeight(pg.height * 0.0004);
  
  let windAngle = PI / 4; 
  
  // 在迴圈外先解析 Hex 色碼並提取 RGB
  let cLine = color(palette.line);
  let r = red(cLine);
  let g = green(cLine);
  let b = blue(cLine);
  
  for (let i = 0; i < 40000; i++) {
    let px = (random(1.5) - 0.75) * pg.width;
    let py = (random(1.5) - 0.75) * pg.height;
    let sz = random(30, 80); 
    let alpha = random(10, 80); 
    
    let dx = cos(windAngle) * sz;
    let dy = sin(windAngle) * sz;
    
    pg.stroke(r, g, b, alpha);
    pg.line(px, py, px + dx, py + dy);
  }
  
  pg.pop();
}

// ---------------------------------------------------------
// 新增：繪製細長貫穿矩形
// ---------------------------------------------------------
function drawSpanningRects(pg) {
  pg.push();
  pg.noStroke(); // 矩形不需要邊框
  
  // 隨機決定數量 (0 到 3 條)
  let numRects = floor(random(0, 4)); 
  
  for (let i = 0; i < numRects; i++) {
    // 另外隨機決定顏色
    let grayValue = random(255); 
    let alphaValue = random(120, 200); // 保持半透明，讓底色透上來
    
    // 填入 (灰階, 透明度)
    pg.fill(grayValue, alphaValue);
    
    // 決定要垂直還是水平 (各 50% 機率)
    let isVertical = random([true, false]);
    
    // 讓粗細有隨機變化，但也配合畫布比例 (限制在 2px 到 畫布寬度的 1.5% 之間)
    let thickness = random(2, pg.width * 0.07); 
    
    if (isVertical) {
      // 垂直矩形：x 座標隨機，y 從 0 開始，寬度為 thickness，高度貫穿畫布
      let px = random(pg.width);
      pg.rect(px, 0, thickness, pg.height);
    } else {
      // 水平矩形：x 從 0 開始，y 座標隨機，寬度貫穿畫布，高度為 thickness
      let py = random(pg.height);
      pg.rect(0, py, pg.width, thickness);
    }
  }
  
  pg.pop();
}

// 加入 targetPg 參數，讓它可以針對特定畫布處理
function applyNoise(targetPg, noiseStrength) {
  targetPg.loadPixels();
  
  // 針對傳進來的畫布計算像素陣列大小
  let d = targetPg.pixelDensity(); 
  let fullSize = 4 * (targetPg.width * d) * (targetPg.height * d);
  
  for (let i = 0; i < fullSize; i += 4) {
    let noiseValue = random(-noiseStrength * 255, noiseStrength * 255);
    
    targetPg.pixels[i] = constrain(targetPg.pixels[i] + noiseValue, 0, 255);     
    targetPg.pixels[i + 1] = constrain(targetPg.pixels[i + 1] + noiseValue, 0, 255); 
    targetPg.pixels[i + 2] = constrain(targetPg.pixels[i + 2] + noiseValue, 0, 255); 
  }
  targetPg.updatePixels();
}
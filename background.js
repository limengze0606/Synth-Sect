function drawBackground(pg) {
  // 1. 極簡化：陣列中只存放兩個 Hex 色碼，無須 name、bg 或 line 標籤
  const palettes = [
    ["#d6b6a0", "#afb1b4"],
    ["#58676e", "#d2d7dc"],
    ["#efe9a5", "#8290ac"],
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
  //let backgroundType = 3; 
  
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

// applyNoise 函數維持不變即可

// noise 函數維持不變
function applyNoise(noiseStrength) {
  pg.loadPixels();
  let d = pixelDensity();
  let fullSize = 4 * (pg.width * d) * (pg.height * d);
  
  for (let i = 0; i < fullSize; i += 4) {
    let noiseValue = random(-noiseStrength * 255, noiseStrength * 255);
    
    pg.pixels[i] = constrain(pg.pixels[i] + noiseValue, 0, 255);     
    pg.pixels[i + 1] = constrain(pg.pixels[i + 1] + noiseValue, 0, 255); 
    pg.pixels[i + 2] = constrain(pg.pixels[i + 2] + noiseValue, 0, 255); 
  }
  pg.updatePixels();
}
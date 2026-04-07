function ocean(pg) {
  pg.push();
  pg.translate(pg.width / 2, pg.height / 2); // 將原點移到畫布中心
  
  // 設定背景顏色
  pg.fill(214, 182, 160);
  pg.noStroke();
  pg.rect(-pg.width / 2, -pg.height / 2, pg.width, pg.height); // 繪製背景矩形
  
  // 設定線條粗細
  pg.strokeWeight(pg.height * 0.001);
  
  // 繪製線條模擬波紋
  for (let i = 0; i < 8000; i++) {
    let px = (random(1) - 0.5) * pg.width;
    // 計算 y 座標，集中在畫布下方
    let py = floor((1 - pow(random(1), 0.25)) * pg.height / 3.5);
    py = constrain(py, 0, pg.height); // 確保 y 座標在範圍內
    
    let sz = random(100, 180); // 隨機線條長度
    let bright = random(1) * 100; // 隨機亮度
    
    pg.stroke(175, 177, 180, bright);
    pg.line(px - sz / 2, py, px + sz / 2, py);
  }
  
  pg.pop();
}

function sky(pg) {
  pg.push();
  pg.translate(pg.width / 2, pg.height / 2); // 將原點移到畫布中心
  
  pg.strokeWeight(pg.height * 0.0003);
  
  let varietySky = [193, 188, 183]; // R, G, B
  
  // 繪製天空的線條
  for (let i = 0; i < 50000; i++) {
    let px = (random(1) - 0.5) * pg.width;
    // 計算 y 座標，集中在畫布上方
    let py = floor((1 - pow(random(1), 0.25)) * pg.height / 2) * -1;
    py = constrain(py, -pg.height, 0); // 確保 y 座標在範圍內
    
    let sz = random(20, 40); // 隨機線條長度
    let bright = random(-20, 20) + varietySky[2];
    bright = constrain(bright, 0, 255); // 確保亮度在 0-255 範圍內
    
    pg.stroke(varietySky[0], varietySky[1], bright);
    pg.line(px - sz / 2, py, px + sz / 2, py);
  }
  
  pg.pop();
}

function applyNoise(noiseStrength) {
  pg.loadPixels();
  let d = pixelDensity();
  // p5.js pixels 陣列長度受 pixelDensity 影響
  let fullSize = 4 * (pg.width * d) * (pg.height * d);
  
  for (let i = 0; i < fullSize; i += 4) {
    let noiseValue = random(-noiseStrength * 255, noiseStrength * 255);
    
    pg.pixels[i] = constrain(pg.pixels[i] + noiseValue, 0, 255);     // R
    pg.pixels[i + 1] = constrain(pg.pixels[i + 1] + noiseValue, 0, 255); // G
    pg.pixels[i + 2] = constrain(pg.pixels[i + 2] + noiseValue, 0, 255); // B
    // pg.pixels[i + 3] 是 Alpha 頻道，這裡保持不變
  }
  pg.updatePixels();
}
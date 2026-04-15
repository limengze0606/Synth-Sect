// --- basic.frag (片段著色器) ---
precision mediump float;

// 從 p5.js 傳過來的變數
uniform sampler2D u_baseMap;   // 你的 pg
uniform sampler2D u_maskMap;   // 你的 maskMap
uniform sampler2D u_matcapMap; // 你找的金屬球圖片

// 從 Vertex Shader 傳過來的變數
varying vec2 vTexCoord; // 貼圖座標
varying vec3 vNormal;   // 已經轉換到攝影機空間的法線

void main() {
  // 1. 讀取底色與遮罩值
  vec4 baseColor = texture2D(u_baseMap, vTexCoord);
  float maskValue = texture2D(u_maskMap, vTexCoord).r; // 讀取遮罩的紅頻（0.0 或 1.0）

  // 2. 計算 MatCap 的 UV 座標
  // 將法線的 x, y (範圍 -1 到 1) 映射到貼圖 UV (範圍 0 到 1)
  vec2 matcapUV = vNormal.xy * 0.5 + 0.5; 
  
  // 讀取 MatCap 的顏色
  vec4 matcapColor = texture2D(u_matcapMap, matcapUV);

  // 3. 混合顏色
  // 如果想讓金屬光保留一點原本卡牌的底色，可以用相乘 (baseColor * matcapColor)
  // 如果 maskValue 是 0 (黑色背景)，就用 baseColor
  // 如果 maskValue 是 1 (白色輪廓)，就疊加 MatCap 效果
  
  vec3 finalColor = mix(baseColor.rgb, matcapColor.rgb, maskValue);

  gl_FragColor = vec4(finalColor, baseColor.a);
}
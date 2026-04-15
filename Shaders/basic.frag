// --- basic.frag ---
precision mediump float;

uniform sampler2D u_baseMap;
uniform sampler2D u_maskMap;
uniform sampler2D u_matcapMap;

varying vec2 vTexCoord;
varying vec3 vNormal; // 從 Vertex Shader 傳過來，已套用旋轉的法線

// 產生偽亂數的雜訊函數 (用來模擬金屬亮片)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec4 baseColor = texture2D(u_baseMap, vTexCoord);
  float maskValue = texture2D(u_maskMap, vTexCoord).r;

  // 複製一份法線來準備進行「擾動」
  vec3 finalNormal = vNormal;

  // ==========================================
  // 🪄 魔法 1：偽造微凸的弧面 (Fake Curvature)
  // 讓卡牌不再是死平的，而是像放大鏡一樣有微小的弧度
  // ==========================================
  // 將 UV 座標 (0.0 ~ 1.0) 映射到中心為原點的座標 (-1.0 ~ 1.0)
  vec2 centerUV = vTexCoord * 2.0 - 1.0;
  
  // 根據像素距離中心的遠近，強行彎曲法線
  // 0.3 是「凸起強度」，數字越大看起來越圓，你可以自由微調這個數值
  finalNormal.x += centerUV.x * 0.3;
  // 注意 Y 軸在某些環境下可能需要反向，如果反光怪怪的可以改成 += 
  finalNormal.y -= centerUV.y * 0.3; 

  // ==========================================
  // 🪄 魔法 2：微觀金屬雜訊 (Metallic Flakes) - 可選
  // 讓反光邊緣有一點閃爍的顆粒感，更像真實的燙金
  // ==========================================
  // 如果覺得不需要顆粒感，可以把下面這兩行註解掉
  float noise = (random(vTexCoord * 150.0) - 0.5) * 0.08; 
  finalNormal.xy += noise;

  // 經過擾動後，重新把法線長度歸一化 (保持為 1)
  finalNormal = normalize(finalNormal);

  // ------------------------------------------

  // 計算最終 MatCap 的 UV 座標
  vec2 matcapUV = finalNormal.xy * 0.5 + 0.5; 
  vec4 matcapColor = texture2D(u_matcapMap, matcapUV);

  // 【優化反光視覺效果】
  // 與其直接替換顏色，金屬反光用「疊加 (Add)」的方式會更有發光的質感
  // 這裡我們把底圖的顏色加上 MatCap 的反光
  vec3 highlightColor = baseColor.rgb + (matcapColor.rgb * 1.2); 

  // 用遮罩來決定：遮罩為 0 (黑) 顯示原本底色，為 1 (白) 顯示加上反光的顏色
  vec3 finalColor = mix(baseColor.rgb, highlightColor, maskValue);

  gl_FragColor = vec4(finalColor, baseColor.a);
}
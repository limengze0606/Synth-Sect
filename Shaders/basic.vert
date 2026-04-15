// --- basic.vert (頂點著色器) ---
precision mediump float;

// 1. Attributes (屬性)：從 p5.js 幾何體 (你的 rect) 讀取進來的原始資料
attribute vec3 aPosition; // 頂點的原始 3D 座標
attribute vec2 aTexCoord; // 頂點的 UV 貼圖座標
attribute vec3 aNormal;   // 頂點的原始法線方向 (對於平面的 rect 來說，通常都是朝向 Z 軸)

// 2. Uniforms (全域變數)：從 p5.js 自動傳入的攝影機與變換矩陣
uniform mat4 uModelViewMatrix;  // 模型視圖矩陣 (包含你的 translate, rotateX, rotateY)
uniform mat4 uProjectionMatrix; // 投影矩陣 (包含攝影機的透視設定)
uniform mat3 uNormalMatrix;     // 法線矩陣 (專門用來計算旋轉後的法線)

// 3. Varyings (變數)：準備傳遞給 Fragment Shader 的資料
varying vec2 vTexCoord;
varying vec3 vNormal;

void main() {
  // --- 步驟 A：傳遞 UV 座標 ---
  // p5.js 的 y 軸座標與 WebGL 預設有時是反向的，
  // 大部分情況下直接傳遞即可，如果發現貼圖上下顛倒，可以改成 vec2(aTexCoord.x, 1.0 - aTexCoord.y)
  vTexCoord = aTexCoord;

  // --- 步驟 B：計算並傳遞旋轉後的法線 (🌟 MatCap 的關鍵 🌟) ---
  // 把原本直直朝上的法線，乘上法線矩陣。
  // 這樣當你用滑鼠拖曳 (rotateX, rotateY) 時，法線也會跟著轉動，
  // Fragment Shader 裡的 MatCap 才會知道角度變了，反光才會跟著滑動！
  vNormal = normalize(uNormalMatrix * aNormal);

  // --- 步驟 C：計算頂點的最終螢幕位置 ---
  // 將 3D 座標擴充為 4D 向量 (x, y, z, w)，w 預設為 1.0
  vec4 positionVec4 = vec4(aPosition, 1.0);
  
  // 順序很重要：投影矩陣 * 模型視圖矩陣 * 頂點座標
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}
precision highp float;

varying vec2 fragCoord;
uniform sampler2D texture;
uniform float textureStyle;

void main() { 
    if (textureStyle == 1.0) {
        // Draw checkerboard
        vec2 pos = floor(fragCoord * 25.0);
        float patternMask = mod(pos.x + mod(pos.y, 2.0), 2.0) > 0.5 ? 0.9 : 0.5;
        gl_FragColor = vec4(patternMask, patternMask, patternMask, 1.0);
    } else if (textureStyle == 2.0) {
        // No Texture
    } else {
        // Draw Texture
        if (fragCoord.x < 0.0 || fragCoord.x > 1.0 ||
        fragCoord.y < 0.0 || fragCoord.y > 1.0) {
           discard;
        }
        gl_FragColor = texture2D(texture, fragCoord);
    }
}
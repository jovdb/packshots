precision highp float;

varying vec2 fragCoord;
uniform sampler2D texture;
uniform float textureStyle;

void main() { 
    if (textureStyle == 1.0) {
        // Gradient
        // Convert range from -1 -> 1 to 0 -> 1
        vec2 normCoord = fragCoord.xy * 0.5 + 0.5; 

        vec4 tl = vec4(0.0, 0.0, 1.0, 1.0); // blue
        vec4 tr = vec4(1.0, 1.0, 0.0, 1.0); // yellow
        vec4 br = vec4(0.0, 1.0, 0.0, 1.0); // green
        vec4 bl = vec4(1.0, 0.0, 0.0, 1.0); // red

        gl_FragColor = mix(
            mix(bl, br, normCoord.x),
            mix(tl, tr, normCoord.x),
            normCoord.y
        );
    } else if (textureStyle == 2.0) {
        // No Texture
    } else {
        // Draw Texture
        if (
            fragCoord.x < 0.0
            || fragCoord.x > 1.0
            || fragCoord.y < 0.0
            || fragCoord.y > 1.0
        ) {
           discard;
        }
        gl_FragColor = texture2D(texture, fragCoord);
    }
}
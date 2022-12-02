attribute vec4 position;

uniform mat4 matrix;
uniform mat4 textureMatrix;

varying vec2 fragCoord;

void main () {
    gl_Position = matrix * position;
    fragCoord = (textureMatrix * position).xy;
}
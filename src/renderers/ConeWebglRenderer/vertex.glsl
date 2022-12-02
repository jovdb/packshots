attribute vec4 position;

varying vec2 texcoord;

void main () {
    gl_Position = position;
    texcoord = (position.xy + 1.0) / 2.0;
}

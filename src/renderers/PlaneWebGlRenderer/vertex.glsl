// Attribute:
// passed by the program (only accessible to vertex shaders)
// Vertex position
attribute vec4 position;

// Uniform:
// passed by the program (accessible to all shaders)
// Projection matrix
uniform mat4 projectionMatrix;

// Texture matrix
uniform mat4 textureMatrix;

// Varying:
// passed vertex info to the fragment shader

// Pass frag coordinate to fragment shader
varying vec2 fragCoord;

void main () {
    // Position of the vertices
    gl_Position = projectionMatrix * position;
    fragCoord = (textureMatrix * position).xy;
}
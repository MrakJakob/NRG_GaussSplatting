// Uniforms
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform float scale;

// Varyings
varying vec3 vPosition;
varying vec4 vColor;
varying float vScale;

attribute vec3 position;
attribute vec4 color;


void main() {
    vColor = color;
    vPosition = position;

    // MVP
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    
    // vScale = scale;
    gl_PointSize = scale / gl_Position.z;
}
precision mediump float;

// Uniforms
uniform vec3 center;
uniform float sigma;
uniform float opacity;

// Varyings
varying vec3 vPosition;
varying vec4 vColor;
varying float vScale;

void main() {
    gl_FragColor = vec4(vColor);
}
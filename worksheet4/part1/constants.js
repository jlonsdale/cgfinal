const subdivides = {
  min: 1,
  max: 5,
};

const va = vec4(0.0, 0.0, 1.0, 1.0);
const vb = vec4(0.0, 0.942809, -0.333333, 1.0);
const vc = vec4(-0.816497, -0.471405, -0.333333, 1.0);
const vd = vec4(0.816497, -0.471405, -0.333333, 1.0);

const initWebGL = (canvasId) => {
  let canvas = document.getElementById(canvasId);
  let gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  return gl;
};

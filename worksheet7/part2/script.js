let canvas;
let gl;
let vBuffer;

const numTimesToSubdivide = 7;

let index = 0;

const pointsArray = [];

let theta = 0.0;
let phi = 0.0;

let program;

let selectedWrapMode = "REPEAT";
let selectedTexMode = "LINEAR_MIPMAP_LINEAR";

let ctm;

let modelViewMatrix, projectionMatrix, mtex;
let modelViewMatrixLoc, projectionMatrixLoc, mtexLoc, isReflectiveLoc, eyeLoc;

let eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

window.onload = async function init() {
  canvas = document.getElementById("c");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.1, 1.0); // space color

  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");
  mtexLoc = gl.getUniformLocation(program, "u_mtex");

  await initTexture(gl);
  render();
};

async function render() {
  theta += 0.01;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = calculateEyeVector(radius, theta, phi);
  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = ortho(left, right, bottom, ytop, -10, 10);

  let invertedModelViewMatrix = inverse4(modelViewMatrix);
  let invertedProjectionMatrix = inverse4(projectionMatrix);

  invertedModelViewMatrix[0][3] = 0.0;
  invertedModelViewMatrix[1][3] = 0.0;
  invertedModelViewMatrix[2][3] = 0.0;
  invertedModelViewMatrix[3] = [0.0, 0.0, 0.0, 0.0];

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(identityMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(identityMatrix));
  gl.uniformMatrix4fv(mtexLoc, false, flatten(invertedModelViewMatrix));

  // background

  await new Promise((resolve) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(quadVertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    resolve();
  });

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  gl.uniformMatrix4fv(mtexLoc, false, flatten(identityMatrix));

  // ball

  await new Promise((resolve) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    for (let i = 0; i < index; i += 3) {
      gl.drawArrays(gl.TRIANGLES, i, 3);
    }
    resolve();
    requestAnimationFrame(render);
  });
}

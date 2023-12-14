let canvas, gl, program, nBuffer, vBuffer, eye;

const numTimesToSubdivide = 7;

let index = 0;

const pointsArray = [];
const normalsArray = [];

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

let theta = 0.0;
let phi = 0.0;

const selectedWrapMode = "REPEAT";
const selectedTexMode = "LINEAR_MIPMAP_LINEAR";

let modelViewMatrix, projectionMatrix, mtex;
let modelViewMatrixLoc,
  projectionMatrixLoc,
  mtexLoc,
  isReflectiveLoc,
  eyeLoc,
  normalMatrixLoc;

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

  nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  const vNormal = gl.getAttribLocation(program, "a_normal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");
  mtexLoc = gl.getUniformLocation(program, "u_mtex");
  isReflectiveLoc = gl.getUniformLocation(program, "u_isReflective");
  eyeLoc = gl.getUniformLocation(program, "u_eyePos");
  normalMatrixLoc = gl.getUniformLocation(program, "u_normalMatrix");

  await initTexture(gl);
  await initNormalMap(gl);

  render();
};

async function render() {
  theta += 0.01;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = calculateEyeVector(radius, theta, phi);
  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = ortho(left, right, bottom, ytop, -10, 10);

  let invertedModelViewMatrix = inverse4(modelViewMatrix);

  invertedModelViewMatrix[0][3] = 0.0;
  invertedModelViewMatrix[1][3] = 0.0;
  invertedModelViewMatrix[2][3] = 0.0;
  invertedModelViewMatrix[3] = [0.0, 0.0, 0.0, 0.0];

  gl.uniform3fv(eyeLoc, flatten(eye));
  gl.uniform1i(isReflectiveLoc, false);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(identityMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(identityMatrix));
  gl.uniformMatrix4fv(mtexLoc, false, flatten(invertedModelViewMatrix));
  normalMatrix = [
    vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
    vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
    vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2]),
  ];

  gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

  // background

  await new Promise((resolve) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(quadVertices), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    resolve();
  });

  gl.uniform1i(isReflectiveLoc, true);
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

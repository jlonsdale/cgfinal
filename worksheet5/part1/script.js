window.onload = function () {
  main();
};

let index = 0;
let points = [];
let normals = [];
let indices = [];

let modelViewMatrix, projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;
let vBuffer, nBuffer, iBuffer;

let theta = 0.0;
let phi = 0.0;

let program;
let canvas, gl;
let eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const near = -100;
const far = 100;
const radius = 1.5;
const dr = (5.0 * Math.PI) / 180.0;

const left = -50.0;
const right = 50.0;
const ytop = 50.0;
const bottom = -50.0;

const main = async () => {
  let response = await fetch("../../common/Cat.obj");
  let objtext = await response.text();
  let objects = await readObj(objtext);

  points = objects[0].v;
  normals = objects[0].n;
  indices = objects[0].f;

  canvas = document.getElementById("c");
  gl = WebGLUtils.setupWebGL(canvas);

  let ext = gl.getExtension("OES_element_index_uint");
  if (!ext) {
    console.log("Warning: Unable to use an extension");
  }

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Create WebGL buffers
  vBuffer = gl.createBuffer();
  nBuffer = gl.createBuffer();
  iBuffer = gl.createBuffer();

  // Bind the normal buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

  // Bind the index buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, flatten(indices), gl.STATIC_DRAW);

  // Bind the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  vPosition = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  projectionMatrix = ortho(left, right, bottom, ytop, near, far);
  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "u_projectionMatrix"),
    false,
    flatten(projectionMatrix)
  );
  render();
};

let render = function () {
  theta += 0.01;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = vec3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta)
  );

  modelViewMatrix = lookAt(eye, at, up);

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, "u_modelViewMatrix"),
    false,
    flatten(modelViewMatrix)
  );

  gl.drawArrays(gl.TRIANGLES, 0, points.length);
  requestAnimationFrame(render);
};

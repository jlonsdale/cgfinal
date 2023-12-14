let canvas;
let gl;

const numTimesToSubdivide = 7;

let index = 0;

const pointsArray = [];

const near = -10;
const far = 10;
const radius = 1.5;
let theta = 0.0;
let phi = 0.0;
const dr = (5.0 * Math.PI) / 180.0;

const left = -3.0;
const right = 3.0;
const ytop = 3.0;
const bottom = -3.0;

const va = vec4(0.0, 0.0, -1.0, 1);
const vb = vec4(0.0, 0.942809, 0.333333, 1);
const vc = vec4(-0.816497, -0.471405, 0.333333, 1);
const vd = vec4(0.816497, -0.471405, 0.333333, 1);

let program;

let selectedWrapMode = "REPEAT";
let selectedTexMode = "LINEAR_MIPMAP_LINEAR";

let ctm;

let modelViewMatrix, projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;

let eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {
  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);

  index += 3;
}

function divideTriangle(a, b, c, count) {
  if (count > 0) {
    let ab = mix(a, b, 0.5);
    let ac = mix(a, c, 0.5);
    let bc = mix(b, c, 0.5);
    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);
    divideTriangle(a, ab, ac, count - 1);
    divideTriangle(ab, b, bc, count - 1);
    divideTriangle(bc, c, ac, count - 1);
    divideTriangle(ab, bc, ac, count - 1);
  } else {
    triangle(a, b, c);
  }
}

function tetrahedron(a, b, c, d, n) {
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

window.onload = function init() {
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

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");

  initTexture(gl);
  render();
};

async function initTexture(gl) {
  let g_tex_ready = 1;
  const cubemap = [
    "../assets/cm_left.png", // POSITIVE_X
    "../assets/cm_right.png", // NEGATIVE_X
    "../assets/cm_top.png", // POSITIVE_Y
    "../assets/cm_bottom.png", // NEGATIVE_Y
    "../assets/cm_back.png", // POSITIVE_Z
    "../assets/cm_front.png", // NEGATIVE_Z
  ];
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  for (let i = 0; i < 6; ++i) {
    const image = document.createElement("img");
    image.crossOrigin = "anonymous";
    image.texTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;

    await new Promise(function (resolve, reject) {
      image.onload = function (event) {
        const image = event.target;
        gl.activeTexture(gl.TEXTURE0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          image.texTarget,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          image
        );
        ++g_tex_ready;
        resolve();
      };

      image.onerror = function (event) {
        reject(new Error("Failed to load texture: " + cubemap[i]));
      };

      image.src = cubemap[i];
    });
  }
  if (g_tex_ready == 6) {
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
  }
}

function render() {
  theta += 0.01;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = vec3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta)
  );

  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = ortho(left, right, bottom, ytop, near, far);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  for (let i = 0; i < index; i += 3) gl.drawArrays(gl.TRIANGLES, i, 3);

  window.requestAnimFrame(render);
}

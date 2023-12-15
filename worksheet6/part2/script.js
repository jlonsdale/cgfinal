let canvas;
let gl;
let texture1;
let program;

let numVertices = 6;
let texSize = 64;
let numChecks = 32;

let near = 0;
let far = 25;
let fovy = 90.0;
let aspect = 1.0;

texture1 = new Uint8Array(4 * texSize * texSize);

for (let i = 0; i < texSize; i++) {
  let c;
  for (let j = 0; j < texSize; j++) {
    let patchx = Math.floor(i / (texSize / numChecks));
    let patchy = Math.floor(j / (texSize / numChecks));
    if (patchx % 2 ^ patchy % 2) c = 255;
    else c = 0;
    texture1[4 * i * texSize + 4 * j] = c;
    texture1[4 * i * texSize + 4 * j + 1] = c;
    texture1[4 * i * texSize + 4 * j + 2] = c;
    texture1[4 * i * texSize + 4 * j + 3] = 255;
  }
}

let pointsArray = [];
let texCoordsArray = [];

let texCoord = [
  vec2(-1.5, 10.0),
  vec2(-1.5, 0.0),
  vec2(2.5, 0.0),
  vec2(2.5, 10.0),
];

let vertices = [
  vec4(-4.0, -1.0, -21.0, 1.0),
  vec4(-4.0, -1.0, -1.0, 1.0),
  vec4(4.0, -1.0, -1.0, 1.0),
  vec4(4.0, -1.0, -21.0, 1.0),
];

let projectionMatrix;
let projectionMatrixLoc;
let selectedWrapMode = "REPEAT";
let selectedTexMode = "NEAREST";

function configureTexture(image, gl) {
  texture1 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    texSize,
    texSize,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[selectedTexMode]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[selectedTexMode]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[selectedWrapMode]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[selectedWrapMode]);
}

function init() {
  canvas = document.getElementById("c");

  gl = WebGLUtils.setupWebGL(canvas);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  //VERTEX

  pointsArray.push(vertices[1]);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(vertices[0]);
  texCoordsArray.push(texCoord[0]);

  pointsArray.push(vertices[3]);
  texCoordsArray.push(texCoord[3]);

  pointsArray.push(vertices[1]);
  texCoordsArray.push(texCoord[1]);

  pointsArray.push(vertices[3]);
  texCoordsArray.push(texCoord[3]);

  pointsArray.push(vertices[2]);
  texCoordsArray.push(texCoord[2]);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    flatten(
      Array.from({ length: pointsArray.length }, () => vec4(1.0, 0.0, 0.5, 1.0)) //  make it PINK instead of white
    ),
    gl.STATIC_DRAW
  );
  let vColor = gl.getAttribLocation(program, "a_color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
  let vPosition = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
  let vTexCoord = gl.getAttribLocation(program, "a_tex_coord");
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vTexCoord);

  configureTexture(texture1, gl);
  gl.clear(gl.COLOR_BUFFER_BIT);

  projectionMatrixLoc = gl.getUniformLocation(program, "u_projection_matrix");

  projectionMatrix = perspective(fovy, aspect, near, far);

  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

  gl.drawArrays(gl.TRIANGLES, 0, numVertices);

  // Get references to the select elements
  const wrapModeSelect = document.getElementById("wrapMode");
  const filterModeSelect = document.getElementById("filterMode");

  // Add event listeners to the select elements
  wrapModeSelect.addEventListener("change", function () {
    selectedWrapMode = wrapModeSelect.value;
    render(gl);
  });

  filterModeSelect.addEventListener("change", function () {
    selectedTexMode = filterModeSelect.value;
    render(gl);
  });
}

window.onload = init;
var render = function (gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);

  projectionMatrix = perspective(fovy, aspect, near, far);

  gl.bindTexture(gl.TEXTURE_2D, texture1);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[selectedTexMode]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[selectedTexMode]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[selectedWrapMode]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[selectedWrapMode]);

  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
  gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
};

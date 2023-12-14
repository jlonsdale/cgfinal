let canvas;
let gl;
let numTimesToSubdivide;
let pointsArray = [];

let index = 0;
let phi = 0;
let theta = 0;
let far = 10;
let near = 0.01;

let modelViewMatrix, projectionMatrix;
let modelViewMatrixLoc, projectionMatrixLoc;

let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);

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

window.onload = function main() {
  if (!numTimesToSubdivide) {
    numTimesToSubdivide = subdivides.min;
  }

  gl = initWebGL("c");
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  document.getElementById("makeSphere").onclick = function () {
    let { max, _ } = subdivides;
    if (numTimesToSubdivide < max) {
      numTimesToSubdivide++;
      pointsArray = [];
      normalsArray = [];
    }
    index = 0;
    main();
  };
  document.getElementById("makeSquare").onclick = function () {
    let { _, min } = subdivides;

    if (numTimesToSubdivide > min) {
      numTimesToSubdivide--;
      pointsArray = [];
      normalsArray = [];
    }
    index = 0;
    main();
  };

  gl.clear(gl.COLOR_BUFFER_BIT);

  eye = vec3(
    (near + 5) * Math.sin(theta) * Math.cos(phi),
    (near + 5) * Math.sin(theta) * Math.sin(phi),
    (near + 5) * Math.cos(theta)
  );

  let V = lookAt(eye, at, up);
  let P = perspective(45, 1, near, far);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(V));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));

  for (let i = 0; i < index; i += 3) gl.drawArrays(gl.TRIANGLES, i, 3);
};

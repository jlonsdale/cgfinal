let canvas;
let gl;
let numTimesToSubdivide;
let pointsArray = [];
let normalsArray = [];

let index = 0;
let phi = 0;
let theta = 0;
let dtheta = 0.05;
let far = 14;
let near = 0.01;

var light = vec4(0.1, 0.1, 0.1, 1.0);

var materialAmbient = 0.2;
var materialDiffuse = 1.0;
var materialSpecular = 1.0;
var materialShininess = 10.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

let V, P, N;
let modelViewMatrixLoc, projectionMatrixLoc;

let eye;
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let animationRequestId;

function triangle(a, b, c) {
  const vertices = [a, b, c];

  vertices.forEach((v) => {
    pointsArray.push([...v]);
    normalsArray.push(v[0], v[1], v[2], 0.0);
  });

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
    numTimesToSubdivide = subdivides.max;
  }

  gl = initWebGL("c");
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.enable(gl.DEPTH_TEST);

  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  let vNormal = gl.getAttribLocation(program, "a_Normal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  gl.cullFace(gl.BACK);

  modelViewMatrixLoc = gl.getUniformLocation(program, "u_modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");

  document.getElementById("makeSphere").onclick = function () {
    let { max, _ } = subdivides;

    if (numTimesToSubdivide < max) {
      numTimesToSubdivide++;
      pointsArray = [];
      normalsArray = [];
    }
    index = 0;
    theta = 0;
    // Stop the current animation loop
    cancelAnimationFrame(animationRequestId);
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
    theta = 0;
    // Stop the current animation loop
    cancelAnimationFrame(animationRequestId);
    main();
  };

  document.getElementById("stop").onclick = function () {
    if (dtheta == 0) {
      dtheta = 0.1;
    } else {
      dtheta = 0.0;
    }
    cancelAnimationFrame(animationRequestId);
    main();
  };

  renderScene();
};

const renderScene = () => {
  theta += dtheta;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  eye = vec3(
    (near + 5) * Math.sin(theta) * Math.cos(phi),
    (near + 5) * Math.sin(theta) * Math.sin(phi),
    (near + 5) * Math.cos(theta)
  );

  V = lookAt(eye, at, up);
  P = perspective(45, 1, near, far);

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(V));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(P));

  for (let i = 0; i < index; i += 3) {
    gl.drawArrays(gl.TRIANGLES, i, 3);
  }
  animationRequestId = requestAnimationFrame(renderScene);
};

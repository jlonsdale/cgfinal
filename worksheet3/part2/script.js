const main = async () => {
  // Set up the configuration
  const canvas = document.getElementById("c");
  const gl = WebGLUtils.setupWebGL(canvas);

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  var ext = gl.getExtension("OES_element_index_uint");
  if (!ext) {
    console.log("o oh");
  }
  gl.useProgram(program);

  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(wire_indices),
    gl.STATIC_DRAW
  );

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Render the cube with one-point perspective
  //const eye = vec3(0.0, 0.0, 1.0);
  //const at = vec3(0.0, 0.0, 0.0);
  //const up = vec3(0.0, 1.0, 0.0);

  // Render the cube with two-point perspective
  let eye = vec3(0.0, 0.0, 1.0);
  const at = vec3(0.0, 0.0, 0.0);
  const up = vec3(0.0, 1.0, 0.0);
  let theta = -0.785398; //45 in rads
  let phi = 0;
  let far = 10;

  eye = vec3(
    far * Math.sin(theta) * Math.cos(phi),
    far * Math.sin(theta) * Math.sin(phi),
    far * Math.cos(theta)
  );

  let V = lookAt(eye, at, up);
  let P = perspective(45, 1, 0, far);

  const uModelViewMatrix_onePoint = gl.getUniformLocation(
    program,
    "u_ModelViewMatrix"
  );
  gl.uniformMatrix4fv(
    uModelViewMatrix_onePoint,
    false,
    flatten(mult(V, translate(-1.0, -0.5, 0)))
  );
  const uProjectionMatrix_onePoint = gl.getUniformLocation(
    program,
    "u_ProjectionMatrix"
  );
  gl.uniformMatrix4fv(uProjectionMatrix_onePoint, false, flatten(P));
  gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);
};

window.onload = function init() {
  main();
};

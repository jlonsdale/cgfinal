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

  let far = 10;
  let at = vec3(0.5, 0.5, 0.0);
  let up = vec3(0.0, 1.0, 0.0);
  let eye = vec3(0.5, 0.5, far);

  let V = lookAt(eye, at, up);
  let P = perspective(45, 1, 0, far);

  console.log(V);

  let translateMatrix = translate(-0.5, 0.5, 0);

  let uModelViewMatrix = gl.getUniformLocation(program, "u_ModelViewMatrix");
  let uProjectionMatrix = gl.getUniformLocation(program, "u_ProjectionMatrix");
  let uTranslateMatrix = gl.getUniformLocation(program, "u_TranslateMatrix");

  gl.uniformMatrix4fv(uModelViewMatrix, false, flatten(V));
  gl.uniformMatrix4fv(uProjectionMatrix, false, flatten(P));
  gl.uniformMatrix4fv(uTranslateMatrix, false, flatten(translateMatrix));

  gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);

  eye = vec3(0.0, 0.0, 1.0);

  let theta = -0.785398; //45 in rads
  let phi = 0;

  eye = vec3(
    far * Math.sin(theta) * Math.cos(phi),
    far * Math.sin(theta) * Math.sin(phi),
    far * Math.cos(theta)
  );

  V = lookAt(eye, at, up);

  console.log(V);

  translateMatrix = translate(0, 0, 0);

  gl.uniformMatrix4fv(uModelViewMatrix, false, flatten(V));
  gl.uniformMatrix4fv(uTranslateMatrix, false, flatten(translateMatrix));

  gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);

  theta = -0.785398; //45 in rads
  phi = -0.785398;

  eye = vec3(
    far * Math.sin(theta) * Math.cos(phi),
    far * Math.sin(theta) * Math.sin(phi),
    far * Math.cos(theta)
  );

  V = lookAt(eye, at, up);

  console.log(V);

  translateMatrix = translate(0.5, -0.5, 0);

  gl.uniformMatrix4fv(uModelViewMatrix, false, flatten(V));
  gl.uniformMatrix4fv(uTranslateMatrix, false, flatten(translateMatrix));

  gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);
};

window.onload = function init() {
  main();
};

const main = async () => {
  const canvas = document.getElementById("c");
  const gl = WebGLUtils.setupWebGL(canvas);

  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const vertices = [
    vec2(-0.5, -0.5),
    vec2(0.5, -0.5),
    vec2(0.5, 0.5),
    vec2(0.5, 0.5),
    vec2(-0.5, 0.5),
    vec2(-0.5, -0.5),
  ];

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  const vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    flatten(
      Array.from({ length: vertices.length }, () => vec4(1.0, 0.0, 0.5, 0.5)) //  make it PINK
    ),
    gl.STATIC_DRAW
  );

  const vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  let rotationAngle = 0; // initial rotation angle

  const render = () => {
    rotationAngle += 0.05; // increase rotation angle

    // rotation matrix
    const rotationMatrix = mat2(
      Math.cos(rotationAngle),
      -Math.sin(rotationAngle),
      Math.sin(rotationAngle),
      Math.cos(rotationAngle)
    );

    // matrix multiplication to each vertex to get rotated vertices
    const rotatedVertices = vertices.map((vertex) =>
      mult(rotationMatrix, vertex)
    );

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Update vertex buffer with rotated vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(rotatedVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.drawArrays(gl.TRIANGLES, 0, rotatedVertices.length);

    requestAnimationFrame(render);
  };

  // start the rendering loop
  render();
};

window.onload = function init() {
  main();
};

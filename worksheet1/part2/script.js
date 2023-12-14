const main = async () => {
  //set up the configuration
  const canvas = document.getElementById("c");
  const gl = WebGLUtils.setupWebGL(canvas);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vertices = [vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0, 0)];
  var vBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");

  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Set the red color for the dots
  var dotColor = vec4(0.0, 0.0, 0.0, 1.0);
  var vColor = gl.getUniformLocation(program, "u_Color");

  gl.uniform4fv(vColor, dotColor);
  gl.drawArrays(vertices, 0, 3);
};

window.onload = function init() {
  main();
};

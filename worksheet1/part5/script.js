const main = async () => {
  const canvas = document.getElementById("c");
  const gl = WebGLUtils.setupWebGL(canvas);

  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const radius = 0.5;
  const segments = 100;
  const vertices = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    flatten(
      Array.from({ length: vertices.length }, () => vec4(1.0, 0.0, 0.5, 1.0))
    ),
    gl.STATIC_DRAW
  );

  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  let yVelocity = 0.05;
  let yPos = 0;

  const render = () => {
    yPos += yVelocity;

    if (yPos + radius > 1.0 || yPos - radius < -1.0) {
      yVelocity *= -1;
      gl.bufferData(
        gl.ARRAY_BUFFER,
        flatten(
          Array.from(
            { length: vertices.length },
            () => vec4(1.0, 0.0, 0.5, 1.0) //  generate a random color after each bounce - just for fun
          )
        ),
        gl.STATIC_DRAW
      );
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    const translatedVertices = vertices.map((coord, index) => {
      if (index % 2 === 1) {
        return coord + yPos;
      }

      return coord;
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(translatedVertices),
      gl.STATIC_DRAW
    );

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);

    requestAnimationFrame(render);
  };

  render();
};

window.onload = function init() {
  main();
};

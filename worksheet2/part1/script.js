const MAX_VERTS = 1000;
const colorMap = {
  red: [1.0, 0.0, 0.0],
  green: [0.0, 0.5, 0.0],
  blue: [0.0, 0.0, 1.0],
  yellow: [1.0, 1.0, 0.0],
  orange: [1.0, 0.647, 0.0],
  purple: [0.502, 0.0, 0.502],
  pink: [1.0, 0.753, 0.796],
  brown: [0.647, 0.165, 0.165],
  gray: [0.502, 0.502, 0.502],
  black: [0.0, 0.0, 0.0],
  white: [1.0, 1.0, 1.0],
};
const drawModeMap = {
  dot: "POINTS",
  circle: "CIRCLE",
  triangle: "TRIANGLE",
};

let index = 0;
let indexTriangles = 0;
let size = 0.1;

let currentColor = colorMap["red"];
let currentDrawMode = drawModeMap["dot"];

let vertices = [];
let vcolors = [];

let triangles = [];
let tcolors = [];

let circles = [];
let ccolors = [];
let currentCircle = null;

let bufferslist = [];

const main = async () => {
  const canvas = await document.getElementById("c");
  const gl = WebGLUtils.setupWebGL(canvas);
  const deleteButton = document.getElementById("delete");
  const colorDropdown = document.getElementById("colorDropdown");
  const drawModeDropdown = document.getElementById("drawmodeDropdown");
  const sizeSlider = document.getElementById("sizeslider");

  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const program = initShaders(gl, "vertex-shader", "fragment-shader");

  gl.useProgram(program);

  deleteButton.addEventListener("click", function () {
    onDelete(gl);
  });

  colorDropdown.addEventListener("change", function () {
    currentColor = colorMap[colorDropdown.value];
  });

  drawModeDropdown.addEventListener("change", function () {
    currentDrawMode = drawModeMap[drawModeDropdown.value];
  });

  sizeSlider.addEventListener("input", () => {
    size = sizeSlider.value;
  });

  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    MAX_VERTS * 2 * Float32Array.BYTES_PER_ELEMENT,
    gl.STATIC_DRAW
  );
  bufferslist.push(vBuffer);

  const tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    MAX_VERTS * 2 * Float32Array.BYTES_PER_ELEMENT,
    gl.STATIC_DRAW
  );
  bufferslist.push(tBuffer);

  const vcBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vcBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    MAX_VERTS * 4 * Float32Array.BYTES_PER_ELEMENT,
    gl.STATIC_DRAW
  );
  bufferslist.push(vcBuffer);

  const tcBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tcBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    MAX_VERTS * 4 * Float32Array.BYTES_PER_ELEMENT,
    gl.STATIC_DRAW
  );
  bufferslist.push(tcBuffer);

  const circBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    MAX_VERTS * 100 * 2 * Float32Array.BYTES_PER_ELEMENT,
    gl.STATIC_DRAW
  );
  bufferslist.push(circBuffer);

  const circColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, circColorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    MAX_VERTS * 100 * 4 * Float32Array.BYTES_PER_ELEMENT,
    gl.STATIC_DRAW
  );
  bufferslist.push(circColorBuffer);

  const vPosition = gl.getAttribLocation(program, "a_Position");
  const vColor = gl.getAttribLocation(program, "a_Color");

  canvas.addEventListener("click", (e) => {
    onClick(e, gl, canvas, bufferslist, vColor, vPosition);
  });
};

const addToVertices = (vertices, new_vert) => {
  if (vertices.length >= MAX_VERTS) {
    vertices.shift();
  }
  vertices.push(new_vert);
};

const addToTriangles = (triangles, new_vert) => {
  if (vertices.length >= MAX_VERTS) {
    triangles.shift();
  }
  triangles.push(new_vert);
};

const addToCircles = (circles, new_vert) => {
  if (vertices.length >= MAX_VERTS) {
    circles.shift();
  }
  circles.push(new_vert);
};

const addToColors = (colors, new_color) => {
  if (colors.length >= MAX_VERTS) {
    colors.shift();
  }
  colors.push(new_color);
};

const drawTriangle = (array, buffer, gl, vpos, cBuffer, vColor, colors) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(array));
  gl.vertexAttribPointer(vpos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vpos);

  gl.drawArrays(gl.TRIANGLES, 0, array.length);
};

const drawCircle = (array, buffer, gl, vpos, cBuffer, vColor, colors) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colors));
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(array));
  gl.vertexAttribPointer(vpos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vpos);

  const numberOfCircles = array.length / 100;

  for (let i = 0; i < numberOfCircles; i++) {
    const offset = i * 100;
    gl.drawArrays(gl.TRIANGLE_FAN, offset, 100); // Assuming you're using TRIANGLE_FAN for circle rendering
  }
};

const onClick = (e, gl, canvas, bufferslist, vColor, vPosition) => {
  console.log("current draw mode", currentDrawMode);
  console.log("current index", index);
  console.log("current color", currentColor);

  const bbox = canvas.getBoundingClientRect();
  const [vBuffer, tBuffer, vcBuffer, vtBuffer, circBuffer, circColorBuffer] =
    bufferslist;

  const new_vert = vec2(
    (2 * (e.clientX - bbox.left)) / canvas.width - 1,
    (2 * (canvas.height - e.clientY + bbox.top - 1)) / canvas.height - 1
  );

  const newDot = getSquareCoordinates(new_vert[0], new_vert[1], size);

  const new_color = vec4(
    currentColor[0],
    currentColor[1],
    currentColor[2],
    1.0
  );

  if (currentDrawMode === "TRIANGLE") {
    addToTriangles(triangles, new_vert);
    addToColors(tcolors, new_color);
  }

  if (currentDrawMode === "POINTS") {
    const points = [
      newDot[0],
      newDot[2],
      newDot[3],
      newDot[3],
      newDot[1],
      newDot[0],
    ];
    points.forEach((d) => {
      addToVertices(vertices, d);
      addToColors(vcolors, new_color);
    });
  }
  if (currentDrawMode === "CIRCLE") {
    if (!currentCircle) {
      currentCircle = new_vert;
    } else {
      const r = distanceBetweenVec2(currentCircle, new_vert);
      circlePoints = createCircle(currentCircle[0], currentCircle[1], r);
      circlePoints.forEach((d) => {
        addToCircles(circles, d);
        addToColors(ccolors, new_color);
      });
      currentCircle = null;
    }
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  drawCircle(
    circles,
    circBuffer,
    gl,
    vPosition,
    circColorBuffer,
    vColor,
    ccolors
  );
  drawTriangle(triangles, tBuffer, gl, vPosition, vtBuffer, vColor, tcolors);
  drawTriangle(vertices, vBuffer, gl, vPosition, vcBuffer, vColor, vcolors);

  index += 1;
};

const onDelete = (gl) => {
  index = 0;
  vertices = [];
  currentColor =
    vcolors[vcolors.length - 1] ||
    tcolors[tcolors.length - 1] ||
    ccolors[ccolors.length - 1] ||
    colorMap["red"];

  vcolors = [];
  tcolors = [];
  ccolors = [];

  triangles = [];
  circles = [];

  gl.clear(gl.COLOR_BUFFER_BIT);
};

window.onload = function init() {
  main();
};

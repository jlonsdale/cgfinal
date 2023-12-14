// Create a cube
// v5----- v6
// /| /|
// v1------v2|
// | | | |
// | |v4---|-|v7
// |/ |/
// v0------v3
var vertices = [
  vec3(0.0, 0.0, 1.0),
  vec3(0.0, 1.0, 1.0),
  vec3(1.0, 1.0, 1.0),
  vec3(1.0, 0.0, 1.0),
  vec3(0.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(1.0, 1.0, 0.0),
  vec3(1.0, 1.0, 0.0),
];

vertices = [
  vec3(0.0, 0.0, 0.0), // Vertex 0
  vec3(1.0, 0.0, 0.0), // Vertex 1
  vec3(1.0, 1.0, 0.0), // Vertex 2
  vec3(0.0, 1.0, 0.0), // Vertex 3
  vec3(0.0, 0.0, 1.0), // Vertex 4
  vec3(1.0, 0.0, 1.0), // Vertex 5
  vec3(1.0, 1.0, 1.0), // Vertex 6
  vec3(0.0, 1.0, 1.0), // Vertex 7
];
// Wireframe indices
var wire_indices = new Uint32Array([
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  0, // front
  2,
  3,
  3,
  7,
  7,
  6,
  6,
  2, // right
  0,
  3,
  3,
  7,
  7,
  4,
  4,
  0, // down
  1,
  2,
  2,
  6,
  6,
  5,
  5,
  1, // up
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  4, // back
  0,
  1,
  1,
  5,
  5,
  4,
  4,
  0, // left
]);
// Triangle mesh indices
var indices = new Uint32Array([
  1,
  0,
  3,
  3,
  2,
  1, // front
  2,
  3,
  7,
  7,
  6,
  2, // right
  3,
  0,
  4,
  4,
  7,
  3, // down
  6,
  5,
  1,
  1,
  2,
  6, // up
  4,
  5,
  6,
  6,
  7,
  4, // back
  5,
  4,
  0,
  0,
  1,
  5, // left
]);

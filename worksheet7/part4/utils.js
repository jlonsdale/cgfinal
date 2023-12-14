const initTexture = async (gl) => {
  let g_tex_ready = 1;
  const cubemap = [
    "../assets/cm_left.png", // POSITIVE_X
    "../assets/cm_right.png", // NEGATIVE_X
    "../assets/cm_top.png", // POSITIVE_Y
    "../assets/cm_bottom.png", // NEGATIVE_Y
    "../assets/cm_back.png", // POSITIVE_Z
    "../assets/cm_front.png", // NEGATIVE_Z
  ];
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  for (let i = 0; i < 6; ++i) {
    const image = document.createElement("img");
    image.crossOrigin = "anonymous";
    image.texTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
    await new Promise(function (resolve, reject) {
      image.onload = function (event) {
        const image = event.target;
        gl.activeTexture(gl.TEXTURE0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          image.texTarget,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          image
        );
        ++g_tex_ready;
        resolve();
      };

      image.onerror = function (event) {
        reject(new Error("Failed to load texture: " + cubemap[i]));
      };

      image.src = cubemap[i];
    });
  }
  if (g_tex_ready == 6) {
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    return texture;
  }
};
const initNormalMap = async (gl) => {
  const path = "../assets/normalmap.png";
  const image = new Image();
  image.src = path;

  const loadImage = () => {
    return new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
    });
  };

  await loadImage();

  gl.activeTexture(gl.TEXTURE1);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.uniform1i(gl.getUniformLocation(program, "normalMap"), 1);
};

const degToRad = (d) => {
  return (d * Math.PI) / 180;
};

function triangle(a, b, c) {
  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);

  normalsArray.push(a[0], a[1], a[2], 0.0);
  normalsArray.push(b[0], b[1], b[2], 0.0);
  normalsArray.push(c[0], c[1], c[2], 0.0);

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

const va = vec4(0.0, 0.0, -1.0, 1);
const vb = vec4(0.0, 0.942809, 0.333333, 1);
const vc = vec4(-0.816497, -0.471405, 0.333333, 1);
const vd = vec4(0.816497, -0.471405, 0.333333, 1);

const quadVertices = [
  vec4(-3, -3, 0.999, 1),
  vec4(3, -3, 0.999, 1),
  vec4(3, 3, 0.999, 1),
  vec4(-3, 3, 0.999, 1),
];

const identityMatrix = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

const near = -10;
const far = 10;
const radius = 1.5;

const left = -3.0;
const right = 3.0;
const ytop = 3.0;
const bottom = -3.0;

function calculateEyeVector(radius, theta, phi) {
  const x = radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(theta);

  return vec3(x, y, z);
}

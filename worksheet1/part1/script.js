const main = async () => {
  //set up the configuration
  const canvas = document.getElementById("c");

  //create context of canvas using webgl utils code provided
  const gl = WebGLUtils.setupWebGL(canvas);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
};

window.onload = function init() {
  main();
};

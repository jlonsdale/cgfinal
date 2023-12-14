window.onload = function () {
  main();
};

const main = async () => {
  let response = await fetch("../Cat.obj");
  let objtext = await response.text();
  let objects = readObj(objtext);

  let { middle } = processObjFile(objects);

  const canvas = document.getElementById("c");

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");

  const presentationSize = [
    canvas.width, //* 1,
    canvas.height,
  ]; //* 1  ];
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  let translateMat = mat4.create();
  let rotateXMat = mat4.create();
  let rotateYMat = mat4.create();
  let rotateZMat = mat4.create();
  let scaleMat = mat4.create();

  const projectionMatrix = mat4.create();
  const viewMatrix = mat4.create();
  const modelMatrix = mat4.create();
  const viewProjectionMatrix = mat4.create();
  const modelRotation = mat4.create();
  const rotation = [0, 0, 0];

  const uniformBuffer = device.createBuffer({
    size: 192, // 3 x mat4x4 = 3x64 = 192
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  function updateMatrices() {
    mat4.perspective(
      projectionMatrix,
      Math.PI / 2,
      canvas.width / canvas.height,
      0.001,
      1500.0
    );
    mat4.lookAt(viewMatrix, [-100, 0, 0.5], [0, 0, 0], [0, 1, 0]);
    mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

    device.queue.writeBuffer(uniformBuffer, 64, viewProjectionMatrix);
  }
  updateMatrices();

  const sceneUniformBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const sceneUniformBindGroup = device.createBindGroup({
    layout: sceneUniformBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });

  context.configure({
    device: device,
    compositingAlphaMode: "opaque",
    format: presentationFormat,
    size: presentationSize,
  });

  let positions = null;
  let normals = null;
  let indices = null;

  var positionBuffer = null;
  var normalBuffer = null;
  var indexBuffer = null;

  function createBuffers() {
    positions = new Float32Array(objects[0].v);
    normals = new Float32Array(objects[0].n);
    indices = new Uint32Array(objects[0].f);

    if (objects[0].n.length == 0) normals = new Float32Array(objects[0].v);

    positionBuffer = device.createBuffer({
      size: (positions.byteLength + 3) & ~3,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    normalBuffer = device.createBuffer({
      size: (normals.byteLength + 3) & ~3,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    indexBuffer = device.createBuffer({
      size: (indices.byteLength + 3) & ~3,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    device.queue.writeBuffer(positionBuffer, 0, positions);
    device.queue.writeBuffer(normalBuffer, 0, normals);
    device.queue.writeBuffer(indexBuffer, 0, indices);
  }

  createBuffers();

  const wgsl = device.createShaderModule({
    code: document.getElementById("wgsl").text,
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [sceneUniformBindGroupLayout],
    }),
    vertex: {
      module: wgsl,
      entryPoint: "main_vs",
      buffers: [
        {
          arrayStride: 12,
          attributes: [{ shaderLocation: 0, format: "float32x3", offset: 0 }],
        },
        {
          arrayStride: 12,
          attributes: [{ shaderLocation: 1, format: "float32x3", offset: 0 }],
        },
      ],
    },
    fragment: {
      module: wgsl,

      entryPoint: "main_fs",
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      topology: "triangle-list",
      frontFace: "ccw",
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const renderPassDescription = {
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: [0.0, 0.8, 0.8, 1], // clear screen
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthLoadOp: "clear",
      depthClearValue: 1,
      depthStoreOp: "store",
    },
  };
  function frame() {
    function xformMatrix(xform, translate, rotate, scale, xrot) {
      translate = translate || [0, 0, 0];
      rotate = rotate || [0, 0, 0];
      scale = scale || [1, 1, 1];

      mat4.fromTranslation(translateMat, translate);
      mat4.fromXRotation(rotateXMat, rotate[0]);
      mat4.fromYRotation(rotateYMat, rotate[1]);
      mat4.fromZRotation(rotateZMat, rotate[2]);
      //mat4.fromScaling(scaleMat, scale);

      mat4.multiply(xform, translateMat, scaleMat);
      mat4.multiply(xform, rotateXMat, xform);
      mat4.multiply(xform, rotateYMat, xform);
      mat4.multiply(xform, rotateZMat, xform);

      mat4.multiply(xrot, rotateXMat, scaleMat);
      mat4.multiply(xrot, rotateYMat, xrot);
      mat4.multiply(xrot, rotateZMat, xrot);
    }

    rotation[1] += 0.005;
    let translate = [-middle.x, -middle.y, -middle.z];

    xformMatrix(modelMatrix, translate, rotation, null, modelRotation);
    device.queue.writeBuffer(uniformBuffer, 0, modelMatrix);
    device.queue.writeBuffer(uniformBuffer, 128, modelRotation);

    //  ---------------------

    renderPassDescription.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass(renderPassDescription);

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, positionBuffer);
    renderPass.setVertexBuffer(1, normalBuffer);
    renderPass.setIndexBuffer(indexBuffer, "uint32");
    renderPass.setBindGroup(0, sceneUniformBindGroup);
    renderPass.drawIndexed(objects[0].f.length, 1);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame);
  }
  frame();
};

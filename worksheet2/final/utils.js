const getSquareCoordinates = (centerX, centerY, size) => {
  return [
    { x: centerX - size / 2, y: centerY - size / 2 }, //tl
    { x: centerX + size / 2, y: centerY - size / 2 }, //tr
    { x: centerX - size / 2, y: centerY + size / 2 }, //bl
    { x: centerX + size / 2, y: centerY + size / 2 }, //br
  ].map((coord) => vec2(parseFloat(coord.x), parseFloat(coord.y)));
};

const createCircle = (centerX, centerY, radius) => {
  const vertices = [];
  for (let i = 0; i < 100; i++) {
    const angle = (i / 100) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    vertices.push(vec2(parseFloat(x), parseFloat(y)));
  }

  return vertices;
};

const distanceBetweenVec2 = (vec1, vec2) => {
  const dx = vec2[0] - vec1[0];
  const dy = vec2[1] - vec1[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance;
};

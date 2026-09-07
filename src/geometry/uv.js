// uv.js — make BoxGeometry faces carry UVs in meters so tiled textures do not stretch.
export function boxUVMeters(geo, sx, sy, sz, swap = false) {
  const uv = geo.attributes.uv;
  const faceScale = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]]; // +x -x +y -y +z -z
  for (let f = 0; f < 6; f++) {
    const [su, sv] = faceScale[f];
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      let u = uv.getX(i) * su, w = uv.getY(i) * sv;
      if (swap) [u, w] = [w, u];
      uv.setXY(i, u, w);
    }
  }
  uv.needsUpdate = true;
  return geo;
}

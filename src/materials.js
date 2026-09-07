// materials.js — one shared material set for the whole world.
import * as THREE from 'three';
import {
  makeTimberTextures, makeCorrugatedTextures, makeGravelTextures,
  makeConcreteTextures, makeSteelTextures,
} from './textures.js';

let cache = null;

export function getMaterials() {
  if (cache) return cache;

  const timberTex = makeTimberTextures();
  const corrTex = makeCorrugatedTextures();
  const gravelTex = makeGravelTextures();
  const concreteTex = makeConcreteTextures();
  const steelTex = makeSteelTextures(512, [0.55, 0.5, 0.46], 0.7);
  const doorTex = makeSteelTextures(512, [0.6, 0.62, 0.66], 0.25);
  const stainlessTex = makeSteelTextures(512, [0.72, 0.74, 0.76], 0.15);

  const timber = new THREE.MeshStandardMaterial({
    map: timberTex.map, normalMap: timberTex.normalMap,
    color: 0xffffff, roughness: 0.42, metalness: 0.0,
  });
  // Ceiling timbers run across the tunnel; rotate the grain by reusing the same texture with swapped repeat.
  const timberCeiling = timber.clone();

  const corrugated = new THREE.MeshStandardMaterial({
    map: corrTex.map, normalMap: corrTex.normalMap,
    color: 0x8e8e93, roughness: 0.58, metalness: 0.5,
    side: THREE.BackSide, // the arch is seen from inside
  });

  const blackSteel = new THREE.MeshStandardMaterial({ // bituminous-coated ribs, wales
    color: 0x111114, roughness: 0.66, metalness: 0.3,
  });

  const gravel = new THREE.MeshStandardMaterial({
    map: gravelTex.map, normalMap: gravelTex.normalMap,
    color: 0x8d8a84, roughness: 0.95, metalness: 0.0,
  });

  const concrete = new THREE.MeshStandardMaterial({
    map: concreteTex.map, normalMap: concreteTex.normalMap,
    color: 0x9a978f, roughness: 0.92, metalness: 0.0,
  });

  const rail = new THREE.MeshStandardMaterial({ color: 0x4a3a30, roughness: 0.55, metalness: 0.7 });
  const tie = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.9, metalness: 0.0 });

  const carSteel = new THREE.MeshStandardMaterial({
    map: steelTex.map, normalMap: steelTex.normalMap, color: 0x6e6862, roughness: 0.7, metalness: 0.5,
  });
  const stainless = new THREE.MeshStandardMaterial({
    map: stainlessTex.map, normalMap: stainlessTex.normalMap, color: 0x9da2a6, roughness: 0.42, metalness: 0.9,
  });
  const doorSteel = new THREE.MeshStandardMaterial({
    map: doorTex.map, normalMap: doorTex.normalMap, color: 0x33363c, roughness: 0.5, metalness: 0.85,
  });
  const wheel = new THREE.MeshStandardMaterial({ color: 0x2a2624, roughness: 0.6, metalness: 0.6 });
  const concreteBox = new THREE.MeshStandardMaterial({
    map: concreteTex.map, normalMap: concreteTex.normalMap, color: 0xb9b5ac, roughness: 0.9,
  });
  const placard = new THREE.MeshBasicMaterial({ color: 0xe9e6dd });
  const doorSeam = new THREE.MeshStandardMaterial({ color: 0x3c3f45, roughness: 0.5, metalness: 0.8 });

  cache = {
    timber, timberCeiling, corrugated, blackSteel, gravel, concrete, rail, tie,
    carSteel, stainless, doorSteel, doorSeam, wheel, concreteBox, placard,
    textures: { timberTex, corrTex, gravelTex, concreteTex, steelTex, stainlessTex },
  };
  return cache;
}

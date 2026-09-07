// world.js — assemble the scene and expose the walk model.
import * as THREE from 'three';
import { layoutCars, makeWalkModel, doorList, L } from './layout.js';
import { buildJunction } from './junction.js';
import { buildTunnel1 } from './tunnel1.js';
import { buildTunnel2 } from './tunnel2.js';
import { buildCars } from './cars.js';

export function buildWorld(scene) {
  const cars = layoutCars();
  scene.add(buildJunction());
  scene.add(buildTunnel1());
  scene.add(buildTunnel2());
  scene.add(buildCars(cars));
  const walk = makeWalkModel(cars);
  const doors = doorList();
  return { cars, walk, doors, L };
}

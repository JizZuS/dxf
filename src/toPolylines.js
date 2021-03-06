import { Box2 } from 'vecks'

import colors, { colorToInt } from './util/colors'
import denormalise from './denormalise'
import entityToPolyline from './entityToPolyline'
import applyTransforms from './applyTransforms'
import logger from './util/logger'

export default (parsed) => {
  const entities = denormalise(parsed);

  const layers = [];

  for (let layer in parsed.tables.layers) {
    if (parsed.tables.layers.hasOwnProperty(layer)) {
      if (parsed.tables.layers[layer].type !== "LAYER") {
        continue;
      }

      let color = 0;

      if (colors[parsed.tables.layers[layer].colorNumber] !== undefined) {
        if (parsed.tables.layers[layer].colorNumber < 0) {
            continue;
        }

        color = colorToInt(colors[parsed.tables.layers[layer].colorNumber]);
      }

      layers.push({
        name: parsed.tables.layers[layer].name,
        type: parsed.tables.layers[layer].lineTypeName.toLowerCase() === "continuous" ? "continuous" : "dashdot",
        color: color
      });
    }
  }

  for (let i = 0; i < entities.length; i++) {
    entities[i] = { layer: entities[i].layer, vertices: applyTransforms(entityToPolyline(entities[i]), entities[i].transforms) };
  }

  const box = new Box2();

  for (const entity of entities) {
    for (const vertex of entity.vertices) {
        box.expandByPoint({ x: vertex[0], y: vertex[1] });
    }
  }

  let smallDifference;
  let difference;
  let min;

  if (Math.abs(box.max.x - box.min.x) > Math.abs(box.max.y - box.min.y)) {
    difference = Math.abs(box.max.x - box.min.x);
    min = box.min.x;
    smallDifference = Math.abs(box.max.y - box.min.y);
  } else {
    difference = Math.abs(box.max.y - box.min.y);
    min = box.min.y;
    smallDifference = Math.abs(box.max.x - box.min.x);
  }

  smallDifference = ((smallDifference - min) / difference) / 2;

  for (const entity of entities) {
    for (const vertex of entity.vertices) {
      vertex[0] = (vertex[0] - min) / difference;
      vertex[1] = ((vertex[1] - min) / difference) - smallDifference;
    }
  }

  return { layers, box, polylines: entities };
}

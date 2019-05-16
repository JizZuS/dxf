import { Box2 } from 'vecks'

import colors from './util/colors'
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

      layers.push({
        name: parsed.tables.layers[layer].name,
        type: parsed.tables.layers[layer].lineTypeName.toLowerCase(),
        color: colors[parsed.tables.layers[layer].colorNumber]
      });
    }
  }

  const polylines = entities.map(entity => {
    return { layer: entity.layer, vertices: applyTransforms(entityToPolyline(entity), entity.transforms) };
  });

  const bbox = new Box2();

  polylines.forEach(polyline => {
    polyline.vertices.forEach(vertex => {
      bbox.expandByPoint({ x: vertex[0], y: vertex[1] });
    });
  });

  return { layers, bbox, polylines };
}

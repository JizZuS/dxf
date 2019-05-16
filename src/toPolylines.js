import { Box2 } from 'vecks'

import colors from './util/colors'
import denormalise from './denormalise'
import entityToPolyline from './entityToPolyline'
import applyTransforms from './applyTransforms'
import logger from './util/logger'

export default (parsed) => {
  const entities = denormalise(parsed)
  const polylines = entities.map(entity => {
    return { layer: entity.layer, vertices: applyTransforms(entityToPolyline(entity), entity.transforms) }
  })

  const bbox = new Box2()
  polylines.forEach(polyline => {
    polyline.vertices.forEach(vertex => {
      bbox.expandByPoint({ x: vertex[0], y: vertex[1] })
    })
  })

  return { layerTable: parsed.tables.layers, bbox, polylines }
}

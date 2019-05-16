"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vecks = require("vecks");

var _colors = _interopRequireDefault(require("./util/colors"));

var _denormalise = _interopRequireDefault(require("./denormalise"));

var _entityToPolyline = _interopRequireDefault(require("./entityToPolyline"));

var _applyTransforms = _interopRequireDefault(require("./applyTransforms"));

var _logger = _interopRequireDefault(require("./util/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(parsed) {
  var entities = (0, _denormalise.default)(parsed);
  var layers = [];

  for (var layer in parsed.tables.layers) {
    if (parsed.tables.layers.hasOwnProperty(layer)) {
      if (parsed.tables.layers[layer].type !== "LAYER") {
        continue;
      }

      layers.push({
        name: parsed.tables.layers[layer].name,
        type: parsed.tables.layers[layer].lineTypeName.toLowerCase(),
        color: _colors.default[parsed.tables.layers[layer].colorNumber]
      });
    }
  }

  var polylines = entities.map(function (entity) {
    return {
      layer: entity.layer,
      vertices: (0, _applyTransforms.default)((0, _entityToPolyline.default)(entity), entity.transforms)
    };
  });
  var bbox = new _vecks.Box2();
  polylines.forEach(function (polyline) {
    polyline.vertices.forEach(function (vertex) {
      bbox.expandByPoint({
        x: vertex[0],
        y: vertex[1]
      });
    });
  });
  return {
    layers: layers,
    bbox: bbox,
    polylines: polylines
  };
};

exports.default = _default;
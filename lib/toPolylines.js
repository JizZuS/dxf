"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _vecks = require("vecks");

var _colors = _interopRequireWildcard(require("./util/colors"));

var _denormalise = _interopRequireDefault(require("./denormalise"));

var _entityToPolyline = _interopRequireDefault(require("./entityToPolyline"));

var _applyTransforms = _interopRequireDefault(require("./applyTransforms"));

var _logger = _interopRequireDefault(require("./util/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var _default = function _default(parsed) {
  var entities = (0, _denormalise.default)(parsed);
  var layers = [];

  for (var layer in parsed.tables.layers) {
    if (parsed.tables.layers.hasOwnProperty(layer)) {
      if (parsed.tables.layers[layer].type !== "LAYER") {
        continue;
      }

      var color = 0;

      if (_colors.default[parsed.tables.layers[layer].colorNumber] !== undefined) {
        color = (0, _colors.colorToInt)(_colors.default[parsed.tables.layers[layer].colorNumber]);
      }

      layers.push({
        name: parsed.tables.layers[layer].name,
        type: parsed.tables.layers[layer].lineTypeName.toLowerCase(),
        color: color
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
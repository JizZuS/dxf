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
    layerTable: parsed.tables.layers,
    bbox: bbox,
    polylines: polylines
  };
};

exports.default = _default;
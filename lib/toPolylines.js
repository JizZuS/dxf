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
        if (parsed.tables.layers[layer].colorNumber < 0) {
          continue;
        }

        color = (0, _colors.colorToInt)(_colors.default[parsed.tables.layers[layer].colorNumber]);
      }

      layers.push({
        name: parsed.tables.layers[layer].name,
        type: parsed.tables.layers[layer].lineTypeName.toLowerCase() === "continuous" ? "continuous" : "dashdot",
        color: color
      });
    }
  }

  for (var i = 0; i < entities.length; i++) {
    entities[i] = {
      layer: entities[i].layer,
      vertices: (0, _applyTransforms.default)((0, _entityToPolyline.default)(entities[i]), entities[i].transforms)
    };
  }

  var box = new _vecks.Box2();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entity = _step.value;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = entity.vertices[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var vertex = _step3.value;
          box.expandByPoint({
            x: vertex[0],
            y: vertex[1]
          });
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var smallDifference;
  var difference;
  var min;

  if (Math.abs(box.max.x - box.min.x) > Math.abs(box.max.y - box.min.y)) {
    difference = Math.abs(box.max.x - box.min.x);
    min = box.min.x;
    smallDifference = Math.abs(box.max.y - box.min.y);
  } else {
    difference = Math.abs(box.max.y - box.min.y);
    min = box.min.y;
    smallDifference = Math.abs(box.max.x - box.min.x);
  }

  smallDifference = (smallDifference - min) / difference / 2;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = entities[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _entity = _step2.value;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _entity.vertices[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _vertex = _step4.value;
          _vertex[0] = (_vertex[0] - min) / difference;
          _vertex[1] = (_vertex[1] - min) / difference - smallDifference;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return {
    layers: layers,
    box: box,
    polylines: entities
  };
};

exports.default = _default;
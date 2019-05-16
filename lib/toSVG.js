"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _prettyData = require("pretty-data");

var _vecks = require("vecks");

var _entityToPolyline = _interopRequireDefault(require("./entityToPolyline"));

var _denormalise = _interopRequireDefault(require("./denormalise"));

var _getRGBForEntity = _interopRequireDefault(require("./getRGBForEntity"));

var _logger = _interopRequireDefault(require("./util/logger"));

var _rotate = _interopRequireDefault(require("./util/rotate"));

var _rgbToColorAttribute = _interopRequireDefault(require("./util/rgbToColorAttribute"));

var _transformBoundingBoxAndElement = _interopRequireDefault(require("./transformBoundingBoxAndElement"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Create a <path /> element. Interpolates curved entities.
 */
var polyline = function polyline(entity) {
  var vertices = (0, _entityToPolyline.default)(entity);
  var bbox = vertices.reduce(function (acc, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        x = _ref2[0],
        y = _ref2[1];

    return acc.expandByPoint({
      x: x,
      y: y
    });
  }, new _vecks.Box2());
  var d = vertices.reduce(function (acc, point, i) {
    acc += i === 0 ? 'M' : 'L';
    acc += point[0] + ',' + point[1];
    return acc;
  }, '');
  var element = "<path d=\"".concat(d, "\" />");
  return (0, _transformBoundingBoxAndElement.default)(bbox, element, entity.transforms);
};
/**
 * Create a <circle /> element for the CIRCLE entity.
 */


var circle = function circle(entity) {
  var bbox = new _vecks.Box2().expandByPoint({
    x: entity.x + entity.r,
    y: entity.y + entity.r
  }).expandByPoint({
    x: entity.x - entity.r,
    y: entity.y - entity.r
  });
  var element = "<circle cx=\"".concat(entity.x, "\" cy=\"").concat(entity.y, "\" r=\"").concat(entity.r, "\" />");
  return (0, _transformBoundingBoxAndElement.default)(bbox, element, entity.transforms);
};
/**
 * Create a a <path d="A..." /> or <ellipse /> element for the ARC or ELLIPSE
 * DXF entity (<ellipse /> if start and end point are the same).
 */


var ellipseOrArc = function ellipseOrArc(cx, cy, rx, ry, startAngle, endAngle, rotationAngle) {
  var bbox = [{
    x: rx,
    y: ry
  }, {
    x: rx,
    y: ry
  }, {
    x: -rx,
    y: -ry
  }, {
    x: -rx,
    y: ry
  }].reduce(function (acc, p) {
    var rotated = (0, _rotate.default)(p, rotationAngle);
    acc.expandByPoint({
      x: cx + rotated.x,
      y: cy + rotated.y
    });
    return acc;
  }, new _vecks.Box2());

  if (Math.abs(startAngle - endAngle) < 1e-9 || Math.abs(startAngle - endAngle + Math.PI * 2) < 1e-9) {
    // Use a native <ellipse> when start and end angles are the same, and
    // arc paths with same start and end points don't render (at least on Safari)
    var element = "<g transform=\"rotate(".concat(rotationAngle / Math.PI * 180, " ").concat(cx, ", ").concat(cy, ")\">\n      <ellipse cx=\"").concat(cx, "\" cy=\"").concat(cy, "\" rx=\"").concat(rx, "\" ry=\"").concat(ry, "\" />\n    </g>");
    return {
      bbox: bbox,
      element: element
    };
  } else {
    var startOffset = (0, _rotate.default)({
      x: Math.cos(startAngle) * rx,
      y: Math.sin(startAngle) * ry
    }, rotationAngle);
    var startPoint = {
      x: cx + startOffset.x,
      y: cy + startOffset.y
    };
    var endOffset = (0, _rotate.default)({
      x: Math.cos(endAngle) * rx,
      y: Math.sin(endAngle) * ry
    }, rotationAngle);
    var endPoint = {
      x: cx + endOffset.x,
      y: cy + endOffset.y
    };
    var adjustedEndAngle = endAngle < startAngle ? endAngle + Math.PI * 2 : endAngle;
    var largeArcFlag = adjustedEndAngle - startAngle < Math.PI ? 0 : 1;
    var d = "M ".concat(startPoint.x, " ").concat(startPoint.y, " A ").concat(rx, " ").concat(ry, " ").concat(rotationAngle / Math.PI * 180, " ").concat(largeArcFlag, " 1 ").concat(endPoint.x, " ").concat(endPoint.y);

    var _element = "<path d=\"".concat(d, "\" />");

    return {
      bbox: bbox,
      element: _element
    };
  }
};
/**
 * An ELLIPSE is defined by the major axis, convert to X and Y radius with
 * a rotation angle
 */


var ellipse = function ellipse(entity) {
  var rx = Math.sqrt(entity.majorX * entity.majorX + entity.majorY * entity.majorY);
  var ry = entity.axisRatio * rx;
  var majorAxisRotation = -Math.atan2(-entity.majorY, entity.majorX);

  var _ellipseOrArc = ellipseOrArc(entity.x, entity.y, rx, ry, entity.startAngle, entity.endAngle, majorAxisRotation),
      bbox = _ellipseOrArc.bbox,
      element = _ellipseOrArc.element;

  return (0, _transformBoundingBoxAndElement.default)(bbox, element, entity.transforms);
};
/**
 * An ARC is an ellipse with equal radii
 */


var arc = function arc(entity) {
  var _ellipseOrArc2 = ellipseOrArc(entity.x, entity.y, entity.r, entity.r, entity.startAngle, entity.endAngle, 0),
      bbox = _ellipseOrArc2.bbox,
      element = _ellipseOrArc2.element;

  return (0, _transformBoundingBoxAndElement.default)(bbox, element, entity.transforms);
};
/**
 * Switcth the appropriate function on entity type. CIRCLE, ARC and ELLIPSE
 * produce native SVG elements, the rest produce interpolated polylines.
 */


var entityToBoundsAndElement = function entityToBoundsAndElement(entity) {
  switch (entity.type) {
    case 'CIRCLE':
      return circle(entity);

    case 'ELLIPSE':
      return ellipse(entity);

    case 'ARC':
      return arc(entity);

    case 'LINE':
    case 'LWPOLYLINE':
    case 'SPLINE':
    case 'POLYLINE':
      {
        return polyline(entity);
      }

    default:
      _logger.default.warn('entity type not supported in SVG rendering:', entity.type);

      return null;
  }
};

var _default = function _default(parsed) {
  var entities = (0, _denormalise.default)(parsed);

  var _entities$reduce = entities.reduce(function (acc, entity) {
    var rgb = (0, _getRGBForEntity.default)(parsed.tables.layers, entity);
    var boundsAndElement = entityToBoundsAndElement(entity); // Ignore entities like MTEXT that don't produce SVG elements

    if (boundsAndElement) {
      var _bbox = boundsAndElement.bbox,
          element = boundsAndElement.element;
      acc.bbox.expandByPoint(_bbox.min);
      acc.bbox.expandByPoint(_bbox.max);
      acc.elements.push("<g stroke=\"".concat((0, _rgbToColorAttribute.default)(rgb), "\">").concat(element, "</g>"));
    }

    return acc;
  }, {
    bbox: new _vecks.Box2(),
    elements: []
  }),
      bbox = _entities$reduce.bbox,
      elements = _entities$reduce.elements;

  var viewBox = bbox.min.x === Infinity ? {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  } : {
    x: bbox.min.x,
    y: -bbox.max.y,
    width: bbox.max.x - bbox.min.x,
    height: bbox.max.y - bbox.min.y
  };
  return "<?xml version=\"1.0\"?>\n<svg\n  xmlns=\"http://www.w3.org/2000/svg\"\n  xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\"\n  preserveAspectRatio=\"xMinYMin meet\"\n  viewBox=\"".concat(viewBox.x, " ").concat(viewBox.y, " ").concat(viewBox.width, " ").concat(viewBox.height, "\"\n  width=\"100%\" height=\"100%\"\n>\n  <g stroke=\"#000000\" stroke-width=\"0.1%\" fill=\"none\" transform=\"matrix(1,0,0,-1,0,0)\">\n    ").concat(_prettyData.pd.xml(elements.join('\n')), "\n  </g>\n</svg>");
};

exports.default = _default;
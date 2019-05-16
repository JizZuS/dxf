"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash.clonedeep"));

var _logger = _interopRequireDefault(require("./util/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = function _default(parseResult) {
  var blocksByName = parseResult.blocks.reduce(function (acc, b) {
    acc[b.name] = b;
    return acc;
  }, {});

  var gatherEntities = function gatherEntities(entities, transforms) {
    var current = [];
    entities.forEach(function (e) {
      if (e.type === 'INSERT') {
        var insert = e;
        var block = blocksByName[insert.block];

        if (!block) {
          _logger.default.error('no block found for insert. block:', insert.block);

          return;
        }

        var t = {
          x: -block.x + insert.x,
          y: -block.y + insert.y,
          scaleX: insert.scaleX,
          scaleY: insert.scaleY,
          scaleZ: insert.scaleZ,
          extrusionX: insert.extrusionX,
          extrusionY: insert.extrusionY,
          extrusionZ: insert.extrusionZ,
          rotation: insert.rotation // Add the insert transform and recursively add entities

        };
        var transforms2 = transforms.slice(0);
        transforms2.push(t); // Use the insert layer

        var blockEntities = block.entities.map(function (be) {
          var be2 = (0, _lodash.default)(be);
          be2.layer = insert.layer;
          return be2;
        });
        current = current.concat(gatherEntities(blockEntities, transforms2));
      } else {
        // Top-level entity. Clone and add the transforms
        // The transforms are reversed so they occur in
        // order of application - i.e. the transform of the
        // top-level insert is applied last
        var e2 = (0, _lodash.default)(e);
        e2.transforms = transforms.slice().reverse();
        current.push(e2);
      }
    });
    return current;
  };

  return gatherEntities(parseResult.entities, []);
};

exports.default = _default;
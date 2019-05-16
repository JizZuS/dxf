"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _header = _interopRequireDefault(require("./handlers/header"));

var _tables = _interopRequireDefault(require("./handlers/tables"));

var _blocks = _interopRequireDefault(require("./handlers/blocks"));

var _entities = _interopRequireDefault(require("./handlers/entities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Parse the value into the native representation
var parseValue = function parseValue(type, value) {
  if (type >= 10 && type < 60) {
    return parseFloat(value, 10);
  } else if (type >= 210 && type < 240) {
    return parseFloat(value, 10);
  } else if (type >= 60 && type < 100) {
    return parseInt(value, 10);
  } else {
    return value;
  }
}; // Content lines are alternate lines of type and value


var convertToTypesAndValues = function convertToTypesAndValues(contentLines) {
  var state = 'type';
  var type;
  var typesAndValues = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = contentLines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;

      if (state === 'type') {
        type = parseInt(line, 10);
        state = 'value';
      } else {
        typesAndValues.push([type, parseValue(type, line)]);
        state = 'type';
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

  return typesAndValues;
};

var separateSections = function separateSections(tuples) {
  var sectionTuples;
  return tuples.reduce(function (sections, tuple) {
    if (tuple[0] === 0 && tuple[1] === 'SECTION') {
      sectionTuples = [];
    } else if (tuple[0] === 0 && tuple[1] === 'ENDSEC') {
      sections.push(sectionTuples);
      sectionTuples = undefined;
    } else if (sectionTuples !== undefined) {
      sectionTuples.push(tuple);
    }

    return sections;
  }, []);
}; // Each section start with the type tuple, then proceeds
// with the contents of the section


var reduceSection = function reduceSection(acc, section) {
  var sectionType = section[0][1];
  var contentTuples = section.slice(1);

  switch (sectionType) {
    case 'HEADER':
      acc.header = (0, _header.default)(contentTuples);
      break;

    case 'TABLES':
      acc.tables = (0, _tables.default)(contentTuples);
      break;

    case 'BLOCKS':
      acc.blocks = (0, _blocks.default)(contentTuples);
      break;

    case 'ENTITIES':
      acc.entities = (0, _entities.default)(contentTuples);
      break;

    default:
  }

  return acc;
};

var _default = function _default(string) {
  var lines = string.split(/\r\n|\r|\n/g);
  var tuples = convertToTypesAndValues(lines);
  var sections = separateSections(tuples);
  var result = sections.reduce(reduceSection, {
    // Start with empty defaults in the event of empty sections
    header: {},
    blocks: [],
    entities: [],
    tables: {
      layers: {},
      styles: {}
    }
  });
  return result;
};

exports.default = _default;
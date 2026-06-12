/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
const CLONE_DEEP_FLAG = 1;
const CLONE_FLAT_FLAG = 2;
const CLONE_SYMBOLS_FLAG = 4;

const argsTag = '[object Arguments]';
const arrayTag = '[object Array]';
const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const funcTag = '[object Function]';
const mapTag = '[object Map]';
const numberTag = '[object Number]';
const objectTag = '[object Object]';
const regexpTag = '[object RegExp]';
const setTag = '[object Set]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const weakMapTag = '[object WeakMap]';

const arrayBufferTag = '[object ArrayBuffer]';
const dataViewTag = '[object DataView]';
const float32Tag = '[object Float32Array]';
const float64Tag = '[object Float64Array]';
const int8Tag = '[object Int8Array]';
const int16Tag = '[object Int16Array]';
const int32Tag = '[object Int32Array]';
const uint8Tag = '[object Uint8Array]';
const uint8ClampedTag = '[object Uint8ClampedArray]';
const uint16Tag = '[object Uint16Array]';
const uint32Tag = '[object Uint32Array]';

const cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

const objectProto = Object.prototype;
const hasOwnProperty = objectProto.hasOwnProperty;
const propertyIsEnumerable = objectProto.propertyIsEnumerable;
const nativeObjectToString = objectProto.toString;
const nativeGetSymbols = Object.getOwnPropertySymbols;
const getPrototype = Object.getPrototypeOf;
const objectCreate = Object.create;
const defineProperty = Object.defineProperty;
const allocUnsafe = Buffer.allocUnsafe;
const symbolProto = typeof Symbol === "undefined" ? undefined : Symbol.prototype;
const symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
const reFlags = /\w*$/;

function stubArray() {
  return [];
}

function arrayFilter(array, predicate) {
  var index = -1;
  var length = array == null ? 0 : array.length;
  var resIndex = 0;
  var result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

function arrayPush(array, values) {
  var index = -1;
  var length = values.length;
  var offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

function arrayEach(array, iteratee) {
  var index = -1;
  var length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

const getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

const getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  let result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

function baseAssignValue(object, key, value) {
  if (key == "__proto__" && defineProperty) {
    defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: true
    });
  } else {
    object[key] = value;
  }
}

function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

function keys(object) {
  return object == null ? [] : Object.keys(Object(object));
}

function keysIn(object) {
  if (object == null) {
    return [];
  }
  var result = [];
  for (var key in Object(object)) {
    result.push(key);
  }
  return result;
}

function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

function isObjectLike(value) {
  return value != null && typeof value == "object";
}

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? "[object Undefined]" : "[object Null]";
  }
  return nativeObjectToString.call(value);
}

function getTag(value) {
  return baseGetTag(value);
}

function isPrototype(value) {
  var Ctor = value && value.constructor;
  var proto = (typeof Ctor == "function" && Ctor.prototype) || objectProto;
  return value === proto;
}

function baseCreate(proto) {
  if (!isObject(proto)) {
    return {};
  }
  return objectCreate(proto);
}

function initCloneArray(array) {
  var length = array.length;
  var result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

function copyArray(source, array) {
  var index = -1;
  var length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length;
  var result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return cloneSymbol(object);
    default:
      return {};
  }
}

function isMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

function isSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return Array.isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

function Stack(entries) {
  this.__data__ = new Map(entries || []);
}

Stack.prototype.get = function get(key) {
  return this.__data__.get(key);
};

Stack.prototype.set = function set(key, value) {
  this.__data__.set(key, value);
  return this;
};

Stack.prototype.delete = function del(key) {
  return this.__data__.delete(key);
};

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  return getTag(value) == funcTag;
}

function isArguments(value) {
  return isObjectLike(value) && getTag(value) == argsTag;
}

function isTypedArray(value) {
  return value != null && ArrayBuffer.isView(value) && !(value instanceof DataView);
}

function isArrayLike(value) {
  return value != null && typeof value.length == "number" && value.length >= 0;
}

function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

function isPlainObject(value) {
  if (!isObjectLike(value) || getTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor;
}

function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

function safeGet(object, key) {
  if (key === "__proto__") {
    return undefined;
  }
  return object[key];
}

function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

function baseFor(object, iteratee, keysFunc) {
  var index = -1;
  var iterable = Object(object);
  var props = keysFunc(object);
  var length = props.length;

  while (++index < length) {
    var key = props[index];
    if (iteratee(iterable[key], key, iterable) === false) {
      break;
    }
  }
  return object;
}

function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key);
  var srcValue = safeGet(source, key);
  var stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ""), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;
  if (isCommon) {
    var isArr = Array.isArray(srcValue);
    var isBuff = !isArr && Buffer.isBuffer(srcValue);
    var isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (Array.isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }

  if (isCommon) {
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack.delete(srcValue);
  }
  assignMergeValue(object, key, newValue);
}

function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack);
    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ""), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

function createAssigner(assigner) {
  return function(object) {
    var sources = Array.prototype.slice.call(arguments, 1);
    var index = -1;
    var length = sources.length;

    object = object == null ? {} : Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source != null) {
        assigner(object, source, index);
      }
    }
    return object;
  };
}

function baseClone(value, bitmask, customizer, key, object, stack) {
  let result;
  const isDeep = bitmask & CLONE_DEEP_FLAG;
  const isFlat = bitmask & CLONE_FLAT_FLAG;
  const isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  const isArr = Array.isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    const tag = getTag(value);
    const isFunc = tag === funcTag;

    if (Buffer.isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }

  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, mapKey) {
      result.set(mapKey, baseClone(subValue, bitmask, customizer, mapKey, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, itemKey) {
    let keyToUse = itemKey;
    let valueToUse = subValue;

    if (props) {
      keyToUse = subValue;
      valueToUse = value[keyToUse];
    }

    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, keyToUse, baseClone(valueToUse, bitmask, customizer, keyToUse, value, stack));
  });
  return result;
}

/**
 * Creates a shallow clone of `value`.
 *
 * @param {*} value The value to clone.
 * @returns {*} Returns the cloned value.
 */
function clone(value) {
  return baseClone(value, CLONE_SYMBOLS_FLAG);
}

/**
 * This method is like `clone` except that it recursively clones `value`.
 *
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 */
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

/**
 * Recursively merges enumerable own and inherited string-keyed properties
 * from source objects into the destination object.
 *
 * Merge semantics follow lodash `merge` behavior:
 * - arrays and plain objects are merged recursively
 * - source `undefined` does not overwrite an existing destination value
 * - sources are applied left-to-right, later sources win
 * - destination object is mutated and returned
 *
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns the mutated destination object.
 */
const merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

module.exports = {
  clone,
  cloneDeep,
  merge
};

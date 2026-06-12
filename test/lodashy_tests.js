const {describe, it} = require("test");
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const lodashy = require("../index.js");

describe("lodashy helpers", () => {
  describe("clone()", () => {
    it("returns primitive values unchanged", () => {
      assert.equal(lodashy.clone(7), 7);
      assert.equal(lodashy.clone("value"), "value");
      assert.equal(lodashy.clone(null), null);
      assert.equal(lodashy.clone(undefined), undefined);
      assert.equal(lodashy.clone(true), true);
    });

    it("creates a shallow clone for plain objects", () => {
      const nested = {enabled: true};
      const source = {
        id: "abc",
        nested
      };

      const cloned = lodashy.clone(source);

      assert.notEqual(cloned, source);
      assert.equal(cloned.id, "abc");
      assert.equal(cloned.nested, nested);
    });

    it("creates a shallow clone for arrays", () => {
      const nested = {value: 10};
      const source = [1, nested, 3];

      const cloned = lodashy.clone(source);

      assert.notEqual(cloned, source);
      assert.deepEqual(cloned, source);
      assert.equal(cloned[1], nested);
    });

    it("clones enumerable symbol properties", () => {
      const symbolKey = Symbol("status");
      const source = {
        [symbolKey]: "active",
        name: "seatmap"
      };

      const cloned = lodashy.clone(source);

      assert.equal(cloned[symbolKey], "active");
      assert.equal(cloned.name, "seatmap");
    });

    it("clones maps and keeps nested references shallow", () => {
      const mapValue = {meta: {origin: "api"}};
      const source = new Map([["value", mapValue]]);

      const cloned = lodashy.clone(source);
      const clonedValue = cloned.get("value");

      assert.notEqual(cloned, source);
      assert.notEqual(clonedValue, mapValue);
      assert.equal(clonedValue.meta, mapValue.meta);
    });
  });

  describe("cloneDeep()", () => {
    it("returns primitive values unchanged", () => {
      assert.equal(lodashy.cloneDeep(7), 7);
      assert.equal(lodashy.cloneDeep("value"), "value");
      assert.equal(lodashy.cloneDeep(null), null);
      assert.equal(lodashy.cloneDeep(undefined), undefined);
      assert.equal(lodashy.cloneDeep(false), false);
    });

    it("recursively clones nested plain objects and arrays", () => {
      const source = {
        nested: {
          items: [{id: 1}, {id: 2}]
        }
      };

      const cloned = lodashy.cloneDeep(source);

      assert.notEqual(cloned, source);
      assert.notEqual(cloned.nested, source.nested);
      assert.notEqual(cloned.nested.items, source.nested.items);
      assert.notEqual(cloned.nested.items[0], source.nested.items[0]);
      assert.deepEqual(cloned, source);
    });

    it("clones date and regexp instances", () => {
      const source = {
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        matcher: /abc/gi
      };

      const cloned = lodashy.cloneDeep(source);

      assert.notEqual(cloned.createdAt, source.createdAt);
      assert.equal(cloned.createdAt.getTime(), source.createdAt.getTime());
      assert.notEqual(cloned.matcher, source.matcher);
      assert.equal(cloned.matcher.source, source.matcher.source);
      assert.equal(cloned.matcher.flags, source.matcher.flags);
    });

    it("deeply clones map and set entries", () => {
      const mapValue = {nested: {key: "value"}};
      const setValue = {id: 10};
      const source = {
        map: new Map([["data", mapValue]]),
        set: new Set([setValue])
      };

      const cloned = lodashy.cloneDeep(source);
      const clonedMapValue = cloned.map.get("data");
      const clonedSetValue = [...cloned.set][0];

      assert.notEqual(cloned.map, source.map);
      assert.notEqual(cloned.set, source.set);
      assert.notEqual(clonedMapValue, mapValue);
      assert.notEqual(clonedMapValue.nested, mapValue.nested);
      assert.notEqual(clonedSetValue, setValue);
      assert.deepEqual(clonedMapValue, mapValue);
      assert.deepEqual(clonedSetValue, setValue);
    });

    it("clones circular references while preserving the cycle", () => {
      const source = {name: "loop"};
      source.self = source;
      source.list = [source];

      const cloned = lodashy.cloneDeep(source);

      assert.notEqual(cloned, source);
      assert.equal(cloned.self, cloned);
      assert.equal(cloned.list[0], cloned);
    });

    it("deeply clones enumerable symbol properties", () => {
      const symbolKey = Symbol("secret");
      const symbolValue = {permissions: ["read"]};
      const source = {
        [symbolKey]: symbolValue
      };

      const cloned = lodashy.cloneDeep(source);

      assert.notEqual(cloned[symbolKey], symbolValue);
      assert.deepEqual(cloned[symbolKey], symbolValue);
    });

    it("loads in contexts without global Buffer", () => {
      const modulePath = path.resolve(__dirname, "../lodashy.js");
      const source = fs.readFileSync(modulePath, "utf8");
      const sandbox = {
        module: {exports: {}},
        exports: {},
        require,
        globalThis: {},
        Object,
        Symbol,
        Map,
        Set,
        Array,
        DataView,
        ArrayBuffer,
        Uint8Array,
        Uint8ClampedArray,
        Uint16Array,
        Uint32Array,
        Int8Array,
        Int16Array,
        Int32Array,
        Float32Array,
        Float64Array,
        Date,
        RegExp
      };

      vm.runInNewContext(source, sandbox, {filename: modulePath});

      const cloned = sandbox.module.exports.cloneDeep({nested: {id: 1}});

      assert.deepEqual(cloned, {nested: {id: 1}});
    });
  });

  describe("merge()", () => {
    it("mutates and returns the destination object", () => {
      const target = {a: 1};
      const source = {b: 2};

      const result = lodashy.merge(target, source);

      assert.equal(result, target);
      assert.deepEqual(target, {a: 1, b: 2});
    });

    it("deep merges nested plain objects", () => {
      const target = {
        profile: {
          name: "Jane",
          tags: ["vip"]
        }
      };
      const source = {
        profile: {
          city: "MTL"
        }
      };

      const result = lodashy.merge(target, source);

      assert.deepEqual(result, {
        profile: {
          name: "Jane",
          tags: ["vip"],
          city: "MTL"
        }
      });
      assert.notEqual(result.profile, source.profile);
    });

    it("merges arrays recursively by index", () => {
      const target = {
        items: [{a: 1}, {b: 2}]
      };
      const source = {
        items: [{c: 3}, {d: 4}, {e: 5}]
      };

      const result = lodashy.merge(target, source);

      assert.deepEqual(result, {
        items: [{a: 1, c: 3}, {b: 2, d: 4}, {e: 5}]
      });
    });

    it("does not overwrite existing values with undefined", () => {
      const target = {
        keep: 10,
        nested: {
          keep: 20
        }
      };
      const source = {
        keep: undefined,
        nested: {
          keep: undefined
        }
      };

      const result = lodashy.merge(target, source);

      assert.deepEqual(result, {
        keep: 10,
        nested: {
          keep: 20
        }
      });
    });

    it("includes inherited enumerable properties from source", () => {
      function Source() {
        this.own = "own";
      }
      Source.prototype.inherited = "inherited";

      const result = lodashy.merge({}, new Source());

      assert.equal(result.own, "own");
      assert.equal(result.inherited, "inherited");
    });

    it("applies multiple sources from left to right", () => {
      const target = {a: 1, nested: {x: 1}};
      const sourceA = {a: 2, nested: {y: 2}};
      const sourceB = {a: 3, nested: {z: 3}};

      const result = lodashy.merge(target, sourceA, sourceB);

      assert.deepEqual(result, {
        a: 3,
        nested: {
          x: 1,
          y: 2,
          z: 3
        }
      });
    });

    it("handles circular references", () => {
      const target = {};
      target.self = target;

      const source = {};
      source.self = source;
      source.meta = {ok: true};

      const result = lodashy.merge(target, source);

      assert.equal(result.self, result);
      assert.deepEqual(result.meta, {ok: true});
    });
  });
});

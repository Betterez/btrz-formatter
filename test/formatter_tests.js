const assert = require("node:assert/strict");
const {beforeEach, describe, it} = require("node:test");
const Formatter = require("../index");

describe("Formatter", function () {
  describe("replaceFrom", function () {
    var values;
    beforeEach(function () {
      values = [
        {key: "one_time", value: "One-time Voucher"},
        {key: "gift_cert", value: "Gift Certificate"}
      ];
    });

    it("should return the value for matching key of the object", function () {
      assert.strictEqual(Formatter.replaceFrom("gift_cert", values), "Gift Certificate");
    });

    it("should return the key if not in the objects in the array", function () {
      assert.strictEqual(Formatter.replaceFrom("not_in_there", values), "not_in_there");
    });

    it("should return the key if values not an array", function () {
      assert.strictEqual(Formatter.replaceFrom("not_in_there", {}), "not_in_there");
    });

    it("should return the key if values null", function () {
      assert.strictEqual(Formatter.replaceFrom("not_in_there"), "not_in_there");
    });

    describe("non standard keys", function () {
      beforeEach(function () {
        values = [
          {name: "one_time", txt: "One-time Voucher"},
          {name: "gift_cert", txt: "Gift Certificate"}
        ];
      });

      it("should return the the value of the key using the options if non standard key", function () {
        var options = {key: "name", value: "txt"};
        assert.strictEqual(Formatter.replaceFrom("one_time", values, options), "One-time Voucher");
      });

      it("should return the key if not found using invalid options", function () {
        var options = {key: "oop", value: "no-name"};
        assert.strictEqual(Formatter.replaceFrom("one_time", values, options), "one_time");
      });

      it("should map key-values into another object", function () {
        var options = {
          key: "name",
          value: "txt",
          property: "type"
        };
        var obj = [
          {type: "one_time"},
          {type: "gift_cert"}
        ];
        assert.strictEqual(Formatter.replaceFrom(obj, values, options), "One-time Voucher, Gift Certificate");
      });
    });
  });

  describe("bzDate", function () {
    var BzDate = require("bz-date").BzDate;

    it("should return the bzDate date as string with the passed dateformat", function () {
      var bzDate = new BzDate();
      var date = (bzDate).toLiteral();
      var dateFormat = "mm/dd/yyyy";
      assert.strictEqual(Formatter.bzDate(date, dateFormat), bzDate.toString(dateFormat));
    });

    it("should return the bzDate date as string with the passed datetime format", function () {
      var bzDate = new BzDate();
      var date = (bzDate).toLiteral();
      var dateFormat = "mm/dd/yyyy HH:MM";
      assert.strictEqual(Formatter.bzDate(date, dateFormat), bzDate.toString(dateFormat));
    });
  });

  describe("timeFormat", function () {
    it("should return 12 hours format", function () {
      assert.strictEqual(Formatter.timeFormat("16:35", "h:MM TT"), "4:35 PM");
    });

    it("should return 24 hours format", function () {
      assert.strictEqual(Formatter.timeFormat("16:35", "HH:MM"), "16:35");
    });
  });

  describe("asValueType", function () {
    it("should return money format if type is '$'", function () {
      assert.strictEqual(Formatter.asValueType(2000000, "$"), "$ 20.00");
    });

    it("should return money format if type is '$' with the given symbol", function () {
      assert.strictEqual(Formatter.asValueType(2000000, "$", "€"), "€ 20.00");
    });

    it("should format as percentage if type '%'", function () {
      assert.strictEqual(Formatter.asValueType(10000, "%"), "10 %");
    });

    it("should return money format if type is 'dollar' and symbol", function () {
      assert.strictEqual(Formatter.asValueType(2000000, "dollar", "€"), "€ 20.00");
    });

    it("should format as percentage if type 'percentage'", function () {
      assert.strictEqual(Formatter.asValueType(10000, "percentage"), "10 %");
    });
  });

  describe("titleCase", function () {
    it("should capitalize all worlds", function () {
      assert.strictEqual(Formatter.titleCase("tickets report"), "Tickets Report");
    });

    it("should not capitalize articles unless they start the phrase", function () {
      assert.strictEqual(Formatter.titleCase("the bride and the lion"), "The Bride and the Lion");
    });

    it("should not capitalize conjunctions unless starting a phrase", function () {
      assert.strictEqual(Formatter.titleCase("and we where rich and poor"), "And We Where Rich and Poor");
    });

    it("should not capitalize prepositions unless starting a phrase", function () {
      assert.strictEqual(Formatter.titleCase("by the sword and by the hammer"), "By the Sword and by the Hammer");
    });

    it("should not capitalize 'to' and 'as' unless starting a phrase", function () {
      assert.strictEqual(Formatter.titleCase("to space as a bullet"), "To Space as a Bullet");
    });
  });

  describe("diffTimeSpan", function () {
    it("should return a time span properly formatted", function () {
      assert.strictEqual(Formatter.diffTimeSpan("11:21", "10:01"), "01:20:00");
    });
  });

  describe("timeSpan", function () {
    it("should return the time span part of an object", function () {
      var d = new Date(Date.UTC(2015, 2, 1, 6, 24, 12));
      assert.strictEqual(Formatter.timeSpan(d), "06:24:12");
    });

    it("should return a one hour time span", function () {
      assert.strictEqual(Formatter.timeSpan("1"), "01:00:00");
    });

    it("should return a one hour a one minute time span", function () {
      assert.strictEqual(Formatter.timeSpan("1:1"), "01:01:00");
    });

    it("should return a one hour a one minute time span", function () {
      assert.strictEqual(Formatter.timeSpan("11:10"), "11:10:00");
    });
  });

  describe("moneyToNumber", function () {
    it("should convert money to original value for 100.00 ", function () {
      const expectedValue = 10000000;
      const money = Formatter.money(expectedValue);
      assert.strictEqual(money, "100.00");
      assert.strictEqual(Formatter.moneyToNumber(money), expectedValue);
    });

    it("should convert money to original value for 0.10", function () {
      const expectedValue = 10000;
      const money = Formatter.money(expectedValue);
      assert.strictEqual(money, "0.10");
      assert.strictEqual(Formatter.moneyToNumber(money), expectedValue);
    });
  });

  describe("money", function () {
    it("should format to two decimal", function () {
      assert.strictEqual(Formatter.money(10000000), "100.00");
    });

    it("should format '.1 to 0.10", function () {
      assert.strictEqual(Formatter.money(10000), "0.10");
    });
  });

  describe("moneyOrBlank", function () {
    it("should not modify the input value", function () {
      assert.strictEqual(Formatter.moneyOrBlank("$ 1.00"), "$ 1.00");
    });

    it("should return an empty string", function () {
      assert.strictEqual(Formatter.moneyOrBlank("$ 0.00"), "");
    });
  });

  describe("truncate", function () {
    it("should return the string", function () {
      assert.strictEqual(Formatter.truncate("valid string", 50), "valid string");
    });

    it("should short the string even if is one single long word", function () {
      assert.strictEqual(Formatter.truncate("valid_string_is_coming_to_town", 20), "valid_string_is_comi...");
    });

    it("should truncate the string in between word", function () {
      assert.strictEqual(Formatter.truncate("valid string is coming to towm", 20), "valid string is ...");
    });
  });

  describe("itemIdLink", function () {
    it("should render the link for a ticket", function () {
      assert.strictEqual(Formatter.itemIdLink("XDFGHTY", "true", "ticket", "54e89f661fd39fa22f0005fb"), "<a href=\"/tickets/54e89f661fd39fa22f0005fb\">XDFGHTY</a>");
    });

    it("should not render the ticket link if _id is missing", function () {
      assert.strictEqual(Formatter.itemIdLink("XDFGHTY", "true", "ticket", "undefined"), "XDFGHTY");
      assert.strictEqual(Formatter.itemIdLink("XDFGHTY", "true", "ticket", "null"), "XDFGHTY");
      assert.strictEqual(Formatter.itemIdLink("XDFGHTY", "true", "ticket", ""), "XDFGHTY");
      assert.strictEqual(Formatter.itemIdLink("XDFGHTY", "true", "ticket"), "XDFGHTY");
    });

    it("should render the link for a redeemable item", function () {
      assert.strictEqual(Formatter.itemIdLink("RI-1234-5678-9010", "true", "R-Item", "54e89f661fd39fa22f0005fb"), "<a href=\"/tickets/redeemableItems/54e89f661fd39fa22f0005fb\">RI-1234-5678-9010</a>");
    });

    it("should render the link for a refund", function () {
      assert.strictEqual(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", "54e89f661fd39fa22f0005fb"), "<a href=\"/tickets/refunds/54e89f661fd39fa22f0005fb\">R-XDFGHTY</a>");
    });

    it("should not render the ticket link if _id is missing", function () {
      assert.strictEqual(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", "undefined"), "R-XDFGHTY");
      assert.strictEqual(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", "null"), "R-XDFGHTY");
      assert.strictEqual(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", ""), "R-XDFGHTY");
      assert.strictEqual(Formatter.itemIdLink("R-XDFGHTY", "true", "refund"), "R-XDFGHTY");
    });

    it("should render the link for a parcel", function () {
      var _id = "54e89f661fd39fa22f0005fb";
      var displayId = "PA-54e8-9f66-1fd3-9fa2-2f00-05fb";
      assert.strictEqual(Formatter.itemIdLink(displayId, "true", "parcel", _id), "<a href=\"/parcels/54e89f661fd39fa22f0005fb\">PA-54e8-9f66-1fd3-9fa2-2f00-05fb</a>");
    });

    it("should render the link for a flexpass", function () {
      assert.strictEqual(Formatter.itemIdLink("XDFGHTY", "true", "flexpass", "54e89f661fd39fa22f0005fb"), "<a href=\"/tickets/54e89f661fd39fa22f0005fb\">XDFGHTY</a>");
    });
  });
});


describe("Formatter", function () {
  const Formatter = require("../index");
  const expect = require("chai").expect;

  describe("replaceFrom", function () {
    var values;
    beforeEach(function () {
      values = [
          {key: "one_time", value: "One-time Voucher"},
          {key: "gift_cert", value: "Gift Certificate"}
        ];
    });

    it("should return the value for matching key of the object", function () {
      expect(Formatter.replaceFrom("gift_cert", values)).to.be.eql("Gift Certificate");
    });

    it("should return the key if not in the objects in the array", function () {
      expect(Formatter.replaceFrom("not_in_there", values)).to.be.eql("not_in_there");
    });

    it("should return the key if values not an array", function () {
      expect(Formatter.replaceFrom("not_in_there", {})).to.be.eql("not_in_there");
    });

    it("should return the key if values null", function () {
      expect(Formatter.replaceFrom("not_in_there")).to.be.eql("not_in_there");
    });

    describe("non standard keys", function () {

      beforeEach(function () {
        values = [
          {name: "one_time", txt: "One-time Voucher"},
          {name: "gift_cert", txt: "Gift Certificate"}
        ];
      });

      it("should return the the value of the key using the options if non standard key", function () {
        var options = {key: 'name', value: 'txt'};
        expect(Formatter.replaceFrom("one_time", values, options)).to.be.eql("One-time Voucher");
      });

      it("should return the key if not found using invalid options", function () {
        var options = {key: 'oop', value: 'no-name'};
        expect(Formatter.replaceFrom("one_time", values, options)).to.be.eql("one_time");
      });

      it("should map key-values into another object", function () {
        var options = {
            key: 'name',
            value: 'txt',
            property: "type"
          };
        var obj = [
            {type: "one_time"},
            {type: "gift_cert"}
          ];
        expect(Formatter.replaceFrom(obj, values, options)).to.be.eql("One-time Voucher, Gift Certificate");
      });
    });

  });

  describe("bzDate", function () {
    var BzDate = require("bz-date").BzDate;

    it("should return the bzDate date as string with the passed dateformat", function () {
      var bzDate = new BzDate();
      var date = (bzDate).toLiteral();
      var dateFormat = "mm/dd/yyyy";
      expect(Formatter.bzDate(date, dateFormat)).to.be.eql(bzDate.toString(dateFormat))
    });

    it("should return the bzDate date as string with the passed datetime format", function () {
      var bzDate = new BzDate();
      var date = (bzDate).toLiteral();
      var dateFormat = "mm/dd/yyyy HH:MM";
      expect(Formatter.bzDate(date, dateFormat)).to.be.eql(bzDate.toString(dateFormat))
    });
  });

  describe("timeFormat", function () {
    it("should return 12 hours format", function () {
      expect(Formatter.timeFormat("16:35", "h:MM TT")).to.be.eql("4:35 PM")
    });

    it("should return 24 hours format", function () {
      expect(Formatter.timeFormat("16:35", "HH:MM")).to.be.eql("16:35")
    });
  });

  describe("asValueType", function () {

    it("should return money format if type is '$'", function () {
      expect(Formatter.asValueType(2000000, "$")).to.be.eql("$ 20.00");
    })

    it("should return money format if type is '$' with the given symbol", function () {
      expect(Formatter.asValueType(2000000, "$", "€")).to.be.eql("€ 20.00");
    })

    it("should format as percentage if type '%'", function () {
      expect(Formatter.asValueType(10000, "%")).to.be.eql("10 %");
    });

    it("should return money format if type is 'dollar' and symbol", function () {
      expect(Formatter.asValueType(2000000, "dollar", "€")).to.be.eql("€ 20.00");
    })

    it("should format as percentage if type 'percentage'", function () {
      expect(Formatter.asValueType(10000, "percentage")).to.be.eql("10 %");
    });
  });

  describe("titleCase", function () {

    it("should capitalize all worlds", function () {
      expect(Formatter.titleCase("tickets report")).to.be.eql("Tickets Report");
    });

    it("should not capitalize articles unless they start the phrase", function () {
      expect(Formatter.titleCase("the bride and the lion")).to.be.eql("The Bride and the Lion");
    });

    it("should not capitalize conjunctions unless starting a phrase", function () {
      expect(Formatter.titleCase("and we where rich and poor")).to.be.eql("And We Where Rich and Poor");
    });

    it("should not capitalize prepositions unless starting a phrase", function () {
      expect(Formatter.titleCase("by the sword and by the hammer")).to.be.eql("By the Sword and by the Hammer");
    });

    it("should not capitalize 'to' and 'as' unless starting a phrase", function () {
      expect(Formatter.titleCase("to space as a bullet")).to.be.eql("To Space as a Bullet");
    });
  });

  describe("diffTimeSpan", function () {

    it("should return a time span properly formatted", function () {
      expect(Formatter.diffTimeSpan("11:21", "10:01")).to.be.eql("01:20:00");
    });
  });

  describe("timeSpan", function () {

    it("should return the time span part of an object", function () {
      var d = new Date(Date.UTC(2015, 2, 1, 6, 24, 12));
      expect(Formatter.timeSpan(d)).to.be.eql("06:24:12");
    });

    it("should return a one hour time span", function () {
      expect(Formatter.timeSpan("1")).to.be.eql("01:00:00");
    });

    it("should return a one hour a one minute time span", function () {
      expect(Formatter.timeSpan("1:1")).to.be.eql("01:01:00");
    });

    it("should return a one hour a one minute time span", function () {
      expect(Formatter.timeSpan("11:10")).to.be.eql("11:10:00");
    });
  });

  describe("money", function () {

    it("should format to two decimal", function () {
      expect(Formatter.money(10000000)).to.be.eql("100.00");
    });

    it("should format '.1 to 0.10", function () {
      expect(Formatter.money(10000)).to.be.eql("0.10");
    });

  });

  describe("moneyOrBlank", function () {
    it("should not modify the input value", function () {
      expect(Formatter.moneyOrBlank("$ 1.00")).to.be.eql("$ 1.00");
    });

    it("should return an empty string", function () {
      expect(Formatter.moneyOrBlank("$ 0.00")).to.be.eql("");
    });
  });

  describe("truncate", function () {

    it("should return the string", function () {
      expect(Formatter.truncate("valid string", 50)).to.be.eql("valid string");
    });

    it("should short the string even if is one single long word", function () {
      expect(Formatter.truncate("valid_string_is_coming_to_town", 20)).to.be.eql("valid_string_is_comi...");
    });

    it("should truncate the string in between word", function () {
      expect(Formatter.truncate("valid string is coming to towm", 20)).to.be.eql("valid string is ...");
    });
  });

  describe("itemIdLink", function () {

    it("should render the link for a ticket", function () {
      expect(Formatter.itemIdLink("XDFGHTY", "true", "ticket", "54e89f661fd39fa22f0005fb")).to.be.eql("<a href=\"/tickets/54e89f661fd39fa22f0005fb\">XDFGHTY</a>");
    });

    it("should not render the ticket link if _id is missing", function () {
      expect(Formatter.itemIdLink("XDFGHTY", "true", "ticket", "undefined")).to.be.eql("XDFGHTY");
      expect(Formatter.itemIdLink("XDFGHTY", "true", "ticket", "null")).to.be.eql("XDFGHTY");
      expect(Formatter.itemIdLink("XDFGHTY", "true", "ticket", "")).to.be.eql("XDFGHTY");
      expect(Formatter.itemIdLink("XDFGHTY", "true", "ticket")).to.be.eql("XDFGHTY");
    });

    it("should render the link for a redeemable item", function () {
      expect(Formatter.itemIdLink("RI-1234-5678-9010", "true", "R-Item", "54e89f661fd39fa22f0005fb")).to.be.eql("<a href=\"/tickets/redeemableItems/54e89f661fd39fa22f0005fb\">RI-1234-5678-9010</a>");
    });

    it("should render the link for a refund", function () {
      expect(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", "54e89f661fd39fa22f0005fb")).to.be.eql("<a href=\"/tickets/refunds/54e89f661fd39fa22f0005fb\">R-XDFGHTY</a>");
    });

    it("should not render the ticket link if _id is missing", function () {
      expect(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", "undefined")).to.be.eql("R-XDFGHTY");
      expect(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", "null")).to.be.eql("R-XDFGHTY");
      expect(Formatter.itemIdLink("R-XDFGHTY", "true", "refund", "")).to.be.eql("R-XDFGHTY");
      expect(Formatter.itemIdLink("R-XDFGHTY", "true", "refund")).to.be.eql("R-XDFGHTY");
    });

    it("should render the link for a parcel", function () {
      var _id = "54e89f661fd39fa22f0005fb";
      var displayId = "PA-54e8-9f66-1fd3-9fa2-2f00-05fb";
      expect(Formatter.itemIdLink(displayId, "true", "parcel", _id)).to.be.eql("<a href=\"/parcels/54e89f661fd39fa22f0005fb\">PA-54e8-9f66-1fd3-9fa2-2f00-05fb</a>");
    });

    it("should render the link for a flexpass", function () {
      expect(Formatter.itemIdLink("XDFGHTY", "true", "flexpass", "54e89f661fd39fa22f0005fb")).to.be.eql("<a href=\"/tickets/54e89f661fd39fa22f0005fb\">XDFGHTY</a>");
    });
  });
});


/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var _dateFormat = function () {
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZW]|"[^"]*"|'[^']*'/g,
      timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
      timezoneClip = /[^-+\dA-Z]/g,
      pad = function pad(val, len) {
    val = String(val);
    len = len || 2;

    while (val.length < len) {
      val = "0" + val;
    }

    return val;
  },

  /**
   * Get the ISO 8601 week number
   * Based on comments from
   * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
   */
  getWeek = function getWeek(date) {
    // Remove time components of date
    var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Change date to Thursday same week

    targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3); // Take January 4th as it is always in week 1 (see ISO 8601)

    var firstThursday = new Date(targetThursday.getFullYear(), 0, 4); // Change date to Thursday same week

    firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3); // Check if daylight-saving-time-switch occured and correct for it

    var ds = targetThursday.getTimezoneOffset() / firstThursday.getTimezoneOffset() - 1;
    targetThursday.setHours(targetThursday.getHours() + ds); // Number of weeks between target Thursday and first Thursday

    var weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
    return 1 + weekDiff;
  }; // Regexes and supporting functions are cached through closure


  return function (dateArg, mask, utc, lang) {
    var dF = _dateFormat; // You can't provide utc if you skip other args (use the "UTC:" mask prefix)

    if (arguments.length === 1 && Object.prototype.toString.call(dateArg) === "[object String]" && !/\d/.test(dateArg)) {
      mask = dateArg;
      dateArg = undefined;
    }

    var date = dateArg || new Date();

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    if (isNaN(date)) {
      throw TypeError("Invalid date: " + dateArg + ' : ' + mask + ' : ' + utc + ' : ');
    }

    mask = String(dF.masks[mask] || mask || dF.masks["default"]); // Allow setting the utc argument via the mask

    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }

    var _ = utc ? "getUTC" : "get",
        language = lang ? lang : "en",
        d = date[_ + "Date"](),
        D = date[_ + "Day"](),
        m = date[_ + "Month"](),
        y = date[_ + "FullYear"](),
        H = date[_ + "Hours"](),
        M = date[_ + "Minutes"](),
        s = date[_ + "Seconds"](),
        L = date[_ + "Milliseconds"](),
        o = utc ? 0 : date.getTimezoneOffset(),
        W = getWeek(date),
        flags = {
      d: d,
      dd: pad(d),
      ddd: dF.i18n[language].dayNames[D],
      dddd: dF.i18n[language].longDayNames[D],
      m: m + 1,
      mm: pad(m + 1),
      mmm: dF.i18n[language].monthNames[m],
      mmmm: dF.i18n[language].longMonthNames[m],
      yy: String(y).slice(2),
      yyyy: y,
      h: H % 12 || 12,
      hh: pad(H % 12 || 12),
      H: H,
      HH: pad(H),
      M: M,
      MM: pad(M),
      s: s,
      ss: pad(s),
      l: pad(L, 3),
      L: pad(L > 99 ? Math.round(L / 10) : L),
      t: H < 12 ? "a" : "p",
      tt: H < 12 ? "am" : "pm",
      T: H < 12 ? "A" : "P",
      TT: H < 12 ? "AM" : "PM",
      Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
      o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
      S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
      W: W
    };

    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}(); // Some common format strings


_dateFormat.masks = {
  "default": "ddd mmm dd yyyy HH:MM:ss",
  shortDate: "m/d/yy",
  mediumDate: "mmm d, yyyy",
  longDate: "mmmm d, yyyy",
  fullDate: "dddd, mmmm d, yyyy",
  shortTime: "h:MM TT",
  mediumTime: "h:MM:ss TT",
  longTime: "h:MM:ss TT Z",
  isoDate: "yyyy-mm-dd",
  isoTime: "HH:MM:ss",
  isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
}; // Internationalization strings

_dateFormat.i18n = {
  en: {
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    longDayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    longMonthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },
  es: {
    dayNames: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    longDayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    monthNames: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    longMonthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  },
  fr: {
    dayNames: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    longDayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    monthNames: ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aou", "Sep", "Oct", "Nov", "Dec"],
    longMonthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
  },
  de: {
    dayNames: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
    longDayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    monthNames: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
    longMonthNames: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
  },
  nl: {
    dayNames: ["Zon", "Maandag", "Din", "Woe", "Don", "Vri", "Zat"],
    longDayNames: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"],
    monthNames: ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
    longMonthNames: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"]
  }
};

var Formatter = function () {
  return {
    asValueType: function asValueType(value, type, symbol) {
      symbol = symbol || type;

      if (type === '%' || type === 'percentage') {
        return this.percentage(value) + ' %';
      }

      if (type === 'override') {
        return 'abs ' + symbol + ' ' + this.money(value);
      }

      if (type === '$' || type === 'dollar' || type) {
        return symbol + ' ' + this.money(value);
      }

      return this.money(value);
    },
    boolToString: function boolToString(bool) {
      if (bool || bool === 'on') {
        return 'yes';
      } else {
        return 'no';
      }
    },
    capitalize: function capitalize(str, checkFirstLetter) {
      if (str) {
        str = str + '';
        var capStr = str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();

        if (checkFirstLetter) {
          return str.charAt(0) === str.charAt(0).toUpperCase() ? str : capStr;
        } else {
          return capStr;
        }
      }

      return str;
    },
    bzDate: function bzDate(dateObj, dateFormat) {
      var BzDate = require("bz-date").BzDate;

      return new BzDate(dateObj, dateFormat).toString(dateFormat);
    },
    dateFormat: function dateFormat(date, format, utc, lang) {
      return _dateFormat(date, format, utc, lang);
    },
    diffTimeSpan: function diffTimeSpan(later, sooner) {
      var max = new Date('1/1/1970 ' + later);
      var min = new Date('1/1/1970 ' + sooner);
      return Formatter.timeSpan(new Date(max.getTime() - min.getTime()));
    },
    displayTime: function displayTime(date, minutesToOffset) {
      if (!date.getDate) {
        minutesToOffset = date;
        date = new Date(Date.UTC(0, 0, 0, 0, 0, 0, 0));
      }

      if (!isNaN(minutesToOffset)) {
        date.setUTCMinutes(date.getUTCMinutes() + minutesToOffset);
      }

      var hour = this.padLeftWith(date.getUTCHours() || '', 0, 2);
      var min = this.padLeftWith(date.getUTCMinutes() || '', 0, 2);
      return hour + ":" + min;
    },
    isValid24hTime: function isValid24hTime(value) {
      var parts = value.split(':');

      if (parts.length !== 2 || parts[0] === '' || parts[1] === '' || isNaN(parts[0]) || isNaN(parts[1]) || parts[0].length !== 2 || parts[1].length !== 2 || parts[0] * 1 > 23 || parts[0] * 1 < 0 || parts[1] * 1 > 59 || parts[1] * 1 < 0) {
        return false;
      }

      return true;
    },
    moneyToNumber: function moneyToNumber(_money) {
      var float = parseFloat(_money);
      return float * 100 * 1000;
    },
    money: function money(_money) {
      _money = Math.round(_money / 1000) / 100;
      var parts = String(_money).split('.');
      var whole = parts[0] || '0';
      var dec = this.padRightWith(parts[1] || '', 0, 2);
      return whole + '.' + dec;
    },
    moneyOrBlank: function moneyOrBlank(money) {
      //removes the currency symbol if money is zero
      var exp = "[0-9]{1,}([,.][0-9]{1,2})?$"; // extract only the money

      var moneyValue = money.match(exp);

      if (!moneyValue || moneyValue[0] === "0.00") {
        moneyValue = "";
      } else {
        moneyValue = money;
      }

      return moneyValue;
    },
    msAsDaysHoursMinutes: function msAsDaysHoursMinutes(ms) {
      var msInMin = 1000 * 60;
      var msInHour = msInMin * 60;
      var msInDay = msInHour * 24;
      var remainder = ms;
      var days = Math.floor(remainder / msInDay);
      remainder %= msInDay;
      var hours = Math.floor(remainder / msInHour);
      remainder %= msInHour;
      var minutes = Math.floor(remainder / msInMin);

      if (minutes) {
        var str = '';

        if (days) {
          str += days + 'd ';
        }

        if (hours) {
          str += this.padLeftWith(hours, 0, 2) + 'h ';
        }

        str += this.padLeftWith(minutes, 0, 2) + 'm';
        return str;
      } else {
        return '---';
      }
    },
    minAsHoursMinutes: function minAsHoursMinutes(min) {
      if (min) {
        var minInHour = 60;
        var remainder = min;
        var hours = Math.floor(remainder / minInHour);
        remainder %= minInHour;
        var str = '';

        if (hours) {
          str += hours + 'h ';
        }

        str += this.padLeftWith(remainder, 0, 2) + 'm';
        return str;
      } else {
        return '---';
      }
    },
    padLeftWith: function padLeftWith(origStr, padStr, maxLength) {
      return _padWith(origStr, padStr, maxLength, true);
    },
    padRightWith: function padRightWith(origStr, padStr, maxLength) {
      return _padWith(origStr, padStr, maxLength, false);
    },
    percentage: function percentage(number) {
      number = number / 1000;
      return number.toString();
    },
    relativeTime: function relativeTime(date) {
      var diff = new Date() - date;
      var minutes = Math.floor(diff / 60000);

      if (minutes === 0) {
        return 'less than a minute ago';
      }

      if (minutes === 1) {
        return 'one minute ago';
      }

      if (minutes < 15) {
        return minutes + ' minutes ago';
      }

      if (minutes < 60) {
        return 'less than an hour ago';
      }

      if (minutes < 75 && minutes > 60) {
        return 'an hour ago';
      }

      if (minutes < 120 && minutes > 75) {
        return 'less than two hours ago';
      }

      if (minutes < 60 * 24) {
        return Math.floor(minutes / 60) + ' hours ago';
      }

      if (minutes > 60 * 24 && minutes < 60 * 48) {
        return 'yesterday';
      }

      return Math.floor(minutes / (60 * 24)) + ' days ago';
    },
    replaceFrom: function replaceFrom(key, values, options) {
      var i = 0,
          result = '',
          prop = null,
          a = 0;

      if (!values) {
        return key;
      }

      var keyName = 'key';
      var valueName = 'value';

      if (options && options.key) {
        keyName = options.key;
      }

      if (options && options.value) {
        valueName = options.value;
      }

      if (options && options.property) {
        prop = options.property;
      }

      if (Array.isArray(key)) {
        for (a = 0; a < key.length; a += 1) {
          result += getString(key[a], prop);

          if (a < key.length - 1) {
            result += ", ";
          }
        }
      } else {
        result = getString(key, prop);
      }

      return result || key;

      function getString(k, prop) {
        if (prop) {
          k = k[prop];
        }

        for (i = 0; i < values.length; i += 1) {
          var val = values[i];

          if (String(val[keyName]) === String(k)) {
            return val[valueName];
          }
        }

        return "";
      }
    },
    reportDate: function reportDate(date) {
      if (!date) {
        return '';
      }

      if (!date.toUTCString) {
        date = _parseStrToDate(date);
      }

      if (!date.toUTCString) {
        return date;
      }

      return date.getUTCFullYear() + '-' + this.padLeftWith(date.getUTCMonth() + 1, '0', 2) + "-" + this.padLeftWith(date.getUTCDate(), '0', 2);
    },
    timeFormat: function timeFormat(str, mask) {
      var timeParts = str.split(':');
      var d = new Date(Date.UTC(0, 0, 0, timeParts[0], timeParts[1]));
      return _dateFormat(d, mask, true);
    },
    timeSpan: function timeSpan(val) {
      if (!val) {
        return '';
      }

      if (!val.toUTCString) {
        //If not a date should convert to one.
        val = _parseStrToDate(val);
      }

      if (val.toUTCString) {
        //Make sure that I have a date now.
        return this.timeSpanFromDate(val);
      }

      var parts = val.split(':');
      var result = '';
      var hr = this.padLeftWith(parts[0] || '', '0', 2);
      var min = this.padLeftWith(parts[1] || '', '0', 2);
      var sec = this.padLeftWith(parts[2] || '', '0', 2);
      sec = ':' + sec;
      return hr + ':' + min + sec;
    },
    timeSpanFromDate: function timeSpanFromDate(date) {
      var val = this.padLeftWith(date.getUTCHours(), '0', 2) + ':' + this.padLeftWith(date.getUTCMinutes(), '0', 2) + ':' + this.padLeftWith(date.getUTCSeconds(), '0', 2);
      return this.timeSpan(val);
    },
    titleCase: function titleCase(string) {
      if (!string) {
        return '';
      }

      var tokens = string.split(' ');
      var phrase = this.capitalize(tokens[0]);
      var t = 1;

      function inException(tok) {
        var exceptions = '||a||abaft||aboard||about||above||absent||across||afore||against||along||alongside||amid||amidst||among||amongst||an||and||apropos||around||as||aside||astride||at||athwart||atop||barring||before||behind||below||beneath||beside||besides||between||betwixt||beyond||but||by||circa||concerning||despite||down||during||except||excluding||failing||following||for||from||given||in||including||inside||into||lest||like||mid||midst||minus||modulo||near||next||not||notwithstanding||of||off||on||onto||opposite||or||out||outside||over||pace||past||per||plus||pro||qua||regarding||round||sans||save||since||so||than||the||through||thru||throughout||thruout||till||times||to||toward||towards||under||underneath||unlike||until||unto||up||upon||versus||vs||via||vice||with||within||without||worth||yet||';
        return exceptions.indexOf('||' + tok + '||') !== -1;
      }

      for (; t < tokens.length; t += 1) {
        var token = tokens[t];

        if (inException(token)) {
          phrase += ' ' + token;
        } else {
          phrase += ' ' + this.capitalize(token);
        }
      }

      return phrase;
    },
    truncate: function truncate(str, limit, backtrack) {
      if (str.length <= limit) {
        return str;
      }

      if (backtrack) {
        limit -= backtrack;
      }

      if (str.indexOf(' ') !== -1) {
        var words = str.split(' ');
        var newPhrase = '';
        var curSize = 0;

        for (var i = 0; i < words.length; i += 1) {
          curSize += words[i].length + 1;

          if (curSize <= limit) {
            newPhrase += words[i] + ' ';
          } else {
            if (newPhrase === '') {
              return str.substring(0, limit) + '...';
            }

            return newPhrase + '...';
          }
        }
      } else {
        return str.substring(0, limit) + '...';
      }
    },
    getMinutes: function getMinutes(time) {
      var minutes = 0;

      if (time) {
        var parts = time.split(':');

        if (parts.length === 2) {
          minutes = Number(parts[1]) + parts[0] * 60;
        }
      }

      return minutes;
    },
    itemIdLink: function itemIdLink(itemId, showItemIdLink, type, _id) {
      if (showItemIdLink == "true" && _id && _id.length === 24) {
        if (type === "ticket" || type === "flexpass") {
          return "<a href=\"/tickets/" + _id + "\">" + itemId + "</a>";
        }

        if (type === "refund") {
          return "<a href=\"/tickets/refunds/" + _id + "\">" + itemId + "</a>";
        }

        if (type === "R-Item") {
          return "<a href=\"/tickets/redeemableItems/" + _id + "\">" + itemId + "</a>";
        }

        if (type === "item") {
          return "<a href=\"/tickets/solditem/" + _id + "\">" + itemId + "</a>";
        }

        if (type === "parcel") {
          return "<a href=\"/parcels/" + _id + "\">" + itemId + "</a>";
        }

        if (type === "insurance") {
          return "<a>" + itemId + "</a>";
        }
      }

      return itemId;
    },
    parseHtml: function parseHtml(str) {
      if (str && (typeof str == 'string' || str instanceof String)) {
        return str.replace(/\&amp;/g, '&').replace(/\&lt;/g, '<');
      } else {
        return '';
      }
    },
    anonymizeEmail: function anonymizeEmail(anEmail) {
      var splited = anEmail.split("@");
      return "".concat(splited[0].substring(0, 3), "***@***").concat(splited[1].slice(-6));
    }
  };

  function _padWith(origStr, padStr, maxLength, leftNotRight) {
    // If numbers are passed in, convert them
    origStr += '';
    padStr += '';
    var size = origStr.length;
    var diff = maxLength - size;
    var totalPad = '';
    var i = 0;

    for (i = 0; i < diff; i += 1) {
      totalPad += padStr;
    }

    if (leftNotRight) {
      return totalPad + origStr;
    } else {
      return origStr + totalPad;
    }
  }

  function _parseStrToDate(str) {
    var dateParts;
    var ds;
    var dh;

    if (typeof str !== 'string') {
      return '';
    }

    if (str.indexOf('T') > -1) {
      dateParts = str.split('T');
      ds = dateParts[0].split('-');
      hs = dateParts[1].split(".")[0].split(':');
      return new Date(Date.UTC(ds[0], ds[1] - 1, ds[2], hs[0], hs[1], hs[2]));
    }

    if (str.indexOf('-') > -1) {
      dateParts = str.split('-');
      return new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
    }

    return str;
  }
}();

module.exports = Formatter;
/* MIT https://github.com/kenwheeler/cash */
(function(){
"use strict";

var doc = document,
    win = window,
    _a = Array.prototype,
    filter = _a.filter,
    indexOf = _a.indexOf,
    map = _a.map,
    push = _a.push,
    reverse = _a.reverse,
    slice = _a.slice,
    splice = _a.splice;
var idRe = /^#[\w-]*$/,
    classRe = /^\.[\w-]*$/,
    htmlRe = /<.+>/,
    tagRe = /^\w+$/; // @require ./variables.ts

function find(selector, context) {
  if (context === void 0) {
    context = doc;
  }

  return classRe.test(selector) ? context.getElementsByClassName(selector.slice(1)) : tagRe.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
} // @require ./find.ts
// @require ./variables.ts


var Cash =
/** @class */
function () {
  function Cash(selector, context) {
    if (context === void 0) {
      context = doc;
    }

    if (!selector) return;
    if (isCash(selector)) return selector;
    var eles = selector;

    if (isString(selector)) {
      var ctx = isCash(context) ? context[0] : context;
      eles = idRe.test(selector) ? ctx.getElementById(selector.slice(1)) : htmlRe.test(selector) ? parseHTML(selector) : find(selector, ctx);
      if (!eles) return;
    } else if (isFunction(selector)) {
      return this.ready(selector); //FIXME: `fn.ready` is not included in `core`, but it's actually a core functionality
    }

    if (eles.nodeType || eles === win) eles = [eles];
    this.length = eles.length;

    for (var i = 0, l = this.length; i < l; i++) {
      this[i] = eles[i];
    }
  }

  Cash.prototype.init = function (selector, context) {
    return new Cash(selector, context);
  };

  return Cash;
}();

var cash = Cash.prototype.init;
cash.fn = cash.prototype = Cash.prototype; // Ensuring that `cash () instanceof cash`

Cash.prototype.length = 0;
Cash.prototype.splice = splice; // Ensuring a cash collection gets printed as array-like in Chrome

Cash.prototype.get = function (index) {
  if (index === undefined) return slice.call(this);
  return this[index < 0 ? index + this.length : index];
};

Cash.prototype.eq = function (index) {
  return cash(this.get(index));
};

Cash.prototype.first = function () {
  return this.eq(0);
};

Cash.prototype.last = function () {
  return this.eq(-1);
};

Cash.prototype.map = function (callback) {
  return cash(map.call(this, function (ele, i) {
    return callback.call(ele, i, ele);
  }));
};

Cash.prototype.slice = function () {
  return cash(slice.apply(this, arguments));
}; // @require ./cash.ts


var camelCaseRe = /(?:^\w|[A-Z]|\b\w)/g,
    camelCaseWhitespaceRe = /[\s-_]+/g;

function camelCase(str) {
  return str.replace(camelCaseRe, function (letter, index) {
    return letter[!index ? 'toLowerCase' : 'toUpperCase']();
  }).replace(camelCaseWhitespaceRe, '');
}

;
cash.camelCase = camelCase; // @require ./cash.ts

function each(arr, callback) {
  for (var i = 0, l = arr.length; i < l; i++) {
    if (callback.call(arr[i], arr[i], i, arr) === false) break;
  }
}

cash.each = each;

Cash.prototype.each = function (callback) {
  each(this, function (ele, i) {
    return callback.call(ele, i, ele);
  });
  return this;
};

Cash.prototype.removeProp = function (prop) {
  return this.each(function (i, ele) {
    delete ele[prop];
  });
}; // @require ./cash.ts


function extend(target) {
  if (target === void 0) {
    target = this;
  }

  var args = arguments,
      length = args.length;

  for (var i = length < 2 ? 0 : 1; i < length; i++) {
    for (var key in args[i]) {
      target[key] = args[i][key];
    }
  }

  return target;
}

Cash.prototype.extend = cash.extend = extend; // @require ./cash.ts

var guid = 1;
cash.guid = guid; // @require ./cash.ts

function matches(ele, selector) {
  var matches = ele && (ele.matches || ele['webkitMatchesSelector'] || ele['mozMatchesSelector'] || ele['msMatchesSelector'] || ele['oMatchesSelector']);
  return !!matches && matches.call(ele, selector);
}

cash.matches = matches; // @require ./cash.ts

function isCash(x) {
  return x instanceof Cash;
}

function isFunction(x) {
  return typeof x === 'function';
}

function isString(x) {
  return typeof x === 'string';
}

function isNumeric(x) {
  return !isNaN(parseFloat(x)) && isFinite(x);
}

var isArray = Array.isArray;
cash.isFunction = isFunction;
cash.isString = isString;
cash.isNumeric = isNumeric;
cash.isArray = isArray;

Cash.prototype.prop = function (prop, value) {
  if (!prop) return;

  if (isString(prop)) {
    if (arguments.length < 2) return this[0] && this[0][prop];
    return this.each(function (i, ele) {
      ele[prop] = value;
    });
  }

  for (var key in prop) {
    this.prop(key, prop[key]);
  }

  return this;
}; // @require ./matches.ts
// @require ./type_checking.ts


function getCompareFunction(comparator) {
  return isString(comparator) ? function (i, ele) {
    return matches(ele, comparator);
  } : isFunction(comparator) ? comparator : isCash(comparator) ? function (i, ele) {
    return comparator.is(ele);
  } : function (i, ele) {
    return ele === comparator;
  };
}

Cash.prototype.filter = function (comparator) {
  if (!comparator) return cash();
  var compare = getCompareFunction(comparator);
  return cash(filter.call(this, function (ele, i) {
    return compare.call(ele, i, ele);
  }));
}; // @require ./type_checking.ts


var splitValuesRe = /\S+/g;

function getSplitValues(str) {
  return isString(str) ? str.match(splitValuesRe) || [] : [];
}

Cash.prototype.hasClass = function (cls) {
  var classes = getSplitValues(cls);
  var check = false;

  if (classes.length) {
    this.each(function (i, ele) {
      check = ele.classList.contains(classes[0]);
      return !check;
    });
  }

  return check;
};

Cash.prototype.removeAttr = function (attr) {
  var attrs = getSplitValues(attr);
  if (!attrs.length) return this;
  return this.each(function (i, ele) {
    each(attrs, function (a) {
      ele.removeAttribute(a);
    });
  });
};

function attr(attr, value) {
  if (!attr) return;

  if (isString(attr)) {
    if (arguments.length < 2) {
      if (!this[0]) return;
      var value_1 = this[0].getAttribute(attr);
      return value_1 === null ? undefined : value_1;
    }

    if (value === null) return this.removeAttr(attr);
    return this.each(function (i, ele) {
      ele.setAttribute(attr, value);
    });
  }

  for (var key in attr) {
    this.attr(key, attr[key]);
  }

  return this;
}

Cash.prototype.attr = attr;

Cash.prototype.toggleClass = function (cls, force) {
  var classes = getSplitValues(cls),
      isForce = force !== undefined;
  if (!classes.length) return this;
  return this.each(function (i, ele) {
    each(classes, function (c) {
      if (isForce) {
        force ? ele.classList.add(c) : ele.classList.remove(c);
      } else {
        ele.classList.toggle(c);
      }
    });
  });
};

Cash.prototype.addClass = function (cls) {
  return this.toggleClass(cls, true);
};

Cash.prototype.removeClass = function (cls) {
  return !arguments.length ? this.attr('class', '') : this.toggleClass(cls, false);
}; // @optional ./add_class.ts
// @optional ./attr.ts
// @optional ./has_class.ts
// @optional ./prop.ts
// @optional ./remove_attr.ts
// @optional ./remove_class.ts
// @optional ./remove_prop.ts
// @optional ./toggle_class.ts
// @require ./cash.ts


function unique(arr) {
  return arr.filter(function (item, index, self) {
    return self.indexOf(item) === index;
  });
}

cash.unique = unique;

Cash.prototype.add = function (selector, context) {
  return cash(unique(this.get().concat(cash(selector, context).get())));
}; // @require core/variables.ts


function computeStyle(ele, prop, isVariable) {
  if (ele.nodeType !== 1) return;
  var style = win.getComputedStyle(ele, null);
  return prop ? isVariable ? style.getPropertyValue(prop) : style[prop] : style;
} // @require ./compute_style.ts


function computeStyleInt(ele, prop) {
  return parseInt(computeStyle(ele, prop), 10) || 0;
}

var cssVariableRe = /^--/; // @require ./variables.ts

function isCSSVariable(prop) {
  return cssVariableRe.test(prop);
} // @require core/camel_case.ts
// @require core/cash.ts
// @require core/each.ts
// @require core/variables.ts
// @require ./is_css_variable.ts


var prefixedProps = {},
    style = doc.createElement('div').style,
    vendorsPrefixes = ['webkit', 'moz', 'ms', 'o'];

function getPrefixedProp(prop, isVariable) {
  if (isVariable === void 0) {
    isVariable = isCSSVariable(prop);
  }

  if (isVariable) return prop;

  if (!prefixedProps[prop]) {
    var propCC = camelCase(prop),
        propUC = "" + propCC.charAt(0).toUpperCase() + propCC.slice(1),
        props = (propCC + " " + vendorsPrefixes.join(propUC + " ") + propUC).split(' ');
    each(props, function (p) {
      if (p in style) {
        prefixedProps[prop] = p;
        return false;
      }
    });
  }

  return prefixedProps[prop];
}

;
cash.prefixedProp = getPrefixedProp; // @require core/type_checking.ts
// @require ./is_css_variable.ts

var numericProps = {
  animationIterationCount: true,
  columnCount: true,
  flexGrow: true,
  flexShrink: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  widows: true,
  zIndex: true
};

function getSuffixedValue(prop, value, isVariable) {
  if (isVariable === void 0) {
    isVariable = isCSSVariable(prop);
  }

  return !isVariable && !numericProps[prop] && isNumeric(value) ? value + "px" : value;
}

function css(prop, value) {
  if (isString(prop)) {
    var isVariable_1 = isCSSVariable(prop);
    prop = getPrefixedProp(prop, isVariable_1);
    if (arguments.length < 2) return this[0] && computeStyle(this[0], prop, isVariable_1);
    if (!prop) return this;
    value = getSuffixedValue(prop, value, isVariable_1);
    return this.each(function (i, ele) {
      if (ele.nodeType !== 1) return;

      if (isVariable_1) {
        ele.style.setProperty(prop, value);
      } else {
        ele.style[prop] = value; //TSC
      }
    });
  }

  for (var key in prop) {
    this.css(key, prop[key]);
  }

  return this;
}

;
Cash.prototype.css = css; // @optional ./css.ts

var dataNamespace = '__cashData',
    dataAttributeRe = /^data-(.*)/; // @require core/cash.ts
// @require ./helpers/variables.ts

function hasData(ele) {
  return dataNamespace in ele;
}

cash.hasData = hasData; // @require ./variables.ts

function getDataCache(ele) {
  return ele[dataNamespace] = ele[dataNamespace] || {};
} // @require attributes/attr.ts
// @require ./get_data_cache.ts


function getData(ele, key) {
  var cache = getDataCache(ele);

  if (key) {
    if (!(key in cache)) {
      var value = ele.dataset ? ele.dataset[key] || ele.dataset[camelCase(key)] : cash(ele).attr("data-" + key);

      if (value !== undefined) {
        try {
          value = JSON.parse(value);
        } catch (e) {}

        cache[key] = value;
      }
    }

    return cache[key];
  }

  return cache;
} // @require ./variables.ts
// @require ./get_data_cache.ts


function removeData(ele, key) {
  if (key === undefined) {
    delete ele[dataNamespace];
  } else {
    delete getDataCache(ele)[key];
  }
} // @require ./get_data_cache.ts


function setData(ele, key, value) {
  getDataCache(ele)[key] = value;
}

function data(name, value) {
  var _this = this;

  if (!name) {
    if (!this[0]) return;
    each(this[0].attributes, function (attr) {
      var match = attr.name.match(dataAttributeRe);
      if (!match) return;

      _this.data(match[1]);
    });
    return getData(this[0]);
  }

  if (isString(name)) {
    if (value === undefined) return this[0] && getData(this[0], name);
    return this.each(function (i, ele) {
      return setData(ele, name, value);
    });
  }

  for (var key in name) {
    this.data(key, name[key]);
  }

  return this;
}

Cash.prototype.data = data;

Cash.prototype.removeData = function (key) {
  return this.each(function (i, ele) {
    return removeData(ele, key);
  });
}; // @optional ./data.ts
// @optional ./remove_data.ts
// @require css/helpers/compute_style_int.ts


function getExtraSpace(ele, xAxis) {
  return computeStyleInt(ele, "border" + (xAxis ? 'Left' : 'Top') + "Width") + computeStyleInt(ele, "padding" + (xAxis ? 'Left' : 'Top')) + computeStyleInt(ele, "padding" + (xAxis ? 'Right' : 'Bottom')) + computeStyleInt(ele, "border" + (xAxis ? 'Right' : 'Bottom') + "Width");
}

each(['Width', 'Height'], function (prop) {
  Cash.prototype["inner" + prop] = function () {
    if (!this[0]) return;
    if (this[0] === win) return win["inner" + prop];
    return this[0]["client" + prop];
  };
});
each(['width', 'height'], function (prop, index) {
  Cash.prototype[prop] = function (value) {
    if (!this[0]) return value === undefined ? undefined : this;

    if (!arguments.length) {
      if (this[0] === win) return this[0][camelCase("outer-" + prop)];
      return this[0].getBoundingClientRect()[prop] - getExtraSpace(this[0], !index);
    }

    var valueNumber = parseInt(value, 10);
    return this.each(function (i, ele) {
      if (ele.nodeType !== 1) return;
      var boxSizing = computeStyle(ele, 'boxSizing');
      ele.style[prop] = getSuffixedValue(prop, valueNumber + (boxSizing === 'border-box' ? getExtraSpace(ele, !index) : 0));
    });
  };
});
each(['Width', 'Height'], function (prop, index) {
  Cash.prototype["outer" + prop] = function (includeMargins) {
    if (!this[0]) return;
    if (this[0] === win) return win["outer" + prop];
    return this[0]["offset" + prop] + (includeMargins ? computeStyleInt(this[0], "margin" + (!index ? 'Left' : 'Top')) + computeStyleInt(this[0], "margin" + (!index ? 'Right' : 'Bottom')) : 0);
  };
}); // @optional ./inner.ts
// @optional ./normal.ts
// @optional ./outer.ts

function hasNamespaces(ns1, ns2) {
  for (var i = 0, l = ns2.length; i < l; i++) {
    if (ns1.indexOf(ns2[i]) < 0) return false;
  }

  return true;
} // @require core/each.ts


function removeEventListeners(cache, ele, name) {
  each(cache[name], function (_a) {
    var namespaces = _a[0],
        callback = _a[1];
    ele.removeEventListener(name, callback);
  });
  delete cache[name];
}

var eventsNamespace = '__cashEvents',
    eventsNamespacesSeparator = '.'; // @require ./variables.ts

function getEventsCache(ele) {
  return ele[eventsNamespace] = ele[eventsNamespace] || {};
} // @require core/guid.ts
// @require events/helpers/get_events_cache.ts


function addEvent(ele, name, namespaces, callback) {
  callback['guid'] = callback['guid'] || guid++;
  var eventCache = getEventsCache(ele);
  eventCache[name] = eventCache[name] || [];
  eventCache[name].push([namespaces, callback]);
  ele.addEventListener(name, callback); //TSC
} // @require ./variables.ts


function parseEventName(eventName) {
  var parts = eventName.split(eventsNamespacesSeparator);
  return [parts[0], parts.slice(1).sort()]; // [name, namespace[]]
} // @require core/guid.ts
// @require ./get_events_cache.ts
// @require ./has_namespaces.ts
// @require ./parse_event_name.ts
// @require ./remove_event_listeners.ts


function removeEvent(ele, name, namespaces, callback) {
  var cache = getEventsCache(ele);

  if (!name) {
    if (!namespaces || !namespaces.length) {
      for (name in cache) {
        removeEventListeners(cache, ele, name);
      }
    } else {
      for (name in cache) {
        removeEvent(ele, name, namespaces, callback);
      }
    }
  } else {
    var eventCache = cache[name];
    if (!eventCache) return;
    if (callback) callback['guid'] = callback['guid'] || guid++;
    cache[name] = eventCache.filter(function (_a) {
      var ns = _a[0],
          cb = _a[1];
      if (callback && cb['guid'] !== callback['guid'] || !hasNamespaces(ns, namespaces)) return true;
      ele.removeEventListener(name, cb);
    });
  }
}

Cash.prototype.off = function (eventFullName, callback) {
  var _this = this;

  if (eventFullName === undefined) {
    this.each(function (i, ele) {
      return removeEvent(ele);
    });
  } else {
    each(getSplitValues(eventFullName), function (eventFullName) {
      var _a = parseEventName(eventFullName),
          name = _a[0],
          namespaces = _a[1];

      _this.each(function (i, ele) {
        return removeEvent(ele, name, namespaces, callback);
      });
    });
  }

  return this;
};

function on(eventFullName, selector, callback, _one) {
  var _this = this;

  if (!isString(eventFullName)) {
    for (var key in eventFullName) {
      this.on(key, selector, eventFullName[key]);
    }

    return this;
  }

  if (isFunction(selector)) {
    callback = selector;
    selector = '';
  }

  each(getSplitValues(eventFullName), function (eventFullName) {
    var _a = parseEventName(eventFullName),
        name = _a[0],
        namespaces = _a[1];

    _this.each(function (i, ele) {
      var finalCallback = function finalCallback(event) {
        if (event.namespace && !hasNamespaces(namespaces, event.namespace.split(eventsNamespacesSeparator))) return;
        var thisArg = ele;

        if (selector) {
          var target = event.target;

          while (!matches(target, selector)) {
            //TSC
            if (target === ele) return;
            target = target.parentNode;
            if (!target) return;
          }

          thisArg = target;
        }

        event.namespace = event.namespace || '';
        var returnValue = callback.call(thisArg, event, event.data); //TSC

        if (_one) {
          removeEvent(ele, name, namespaces, finalCallback);
        }

        if (returnValue === false) {
          event.preventDefault();
          event.stopPropagation();
        }
      };

      finalCallback['guid'] = callback['guid'] = callback['guid'] || guid++;
      addEvent(ele, name, namespaces, finalCallback);
    });
  });
  return this;
}

Cash.prototype.on = on;

function one(eventFullName, selector, callback) {
  return this.on(eventFullName, selector, callback, true); //TSC
}

;
Cash.prototype.one = one;

Cash.prototype.ready = function (callback) {
  var finalCallback = function finalCallback() {
    return callback(cash);
  };

  if (doc.readyState !== 'loading') {
    setTimeout(finalCallback);
  } else {
    doc.addEventListener('DOMContentLoaded', finalCallback);
  }

  return this;
};

Cash.prototype.trigger = function (eventFullName, data) {
  var evt = eventFullName;

  if (isString(eventFullName)) {
    var _a = parseEventName(eventFullName),
        name_1 = _a[0],
        namespaces = _a[1];

    evt = doc.createEvent('HTMLEvents');
    evt.initEvent(name_1, true, true);
    evt['namespace'] = namespaces.join(eventsNamespacesSeparator);
  }

  evt['data'] = data;
  return this.each(function (i, ele) {
    ele.dispatchEvent(evt);
  });
}; // @optional ./off.ts
// @optional ./on.ts
// @optional ./one.ts
// @optional ./ready.ts
// @optional ./trigger.ts
// @require core/each.ts


function getValueSelectMultiple(ele) {
  var values = [];
  each(ele.options, function (option) {
    if (option.selected && !option.disabled && !option.parentNode.disabled) {
      values.push(option.value);
    }
  });
  return values;
}

function getValueSelectSingle(ele) {
  return ele.selectedIndex < 0 ? null : ele.options[ele.selectedIndex].value;
} // @require ./get_value_select_single.ts
// @require ./get_value_select_multiple.ts


var selectOneRe = /select-one/i,
    selectMultipleRe = /select-multiple/i;

function getValue(ele) {
  var type = ele['type'];
  if (selectOneRe.test(type)) return getValueSelectSingle(ele);
  if (selectMultipleRe.test(type)) return getValueSelectMultiple(ele);
  return ele['value'] || '';
}

var queryEncodeSpaceRe = /%20/g;

function queryEncode(prop, value) {
  return "&" + encodeURIComponent(prop) + "=" + encodeURIComponent(value).replace(queryEncodeSpaceRe, '+');
} // @require core/cash.ts
// @require core/each.ts
// @require core/type_checking.ts
// @require ./helpers/get_value.ts
// @require ./helpers/query_encode.ts


var skippableRe = /file|reset|submit|button|image/i,
    checkableRe = /radio|checkbox/i;

Cash.prototype.serialize = function () {
  var query = '';
  this.each(function (i, ele) {
    each(ele.elements || [ele], function (ele) {
      if (ele.disabled || !ele.name || ele.tagName === 'FIELDSET') return;
      if (skippableRe.test(ele.type)) return;
      if (checkableRe.test(ele.type) && !ele.checked) return;
      var value = getValue(ele);
      if (value === undefined) return;
      var values = isArray(value) ? value : [value];
      each(values, function (value) {
        query += queryEncode(ele.name, value);
      });
    });
  });
  return query.substr(1);
};

function val(value) {
  if (value === undefined) return this[0] && getValue(this[0]);
  return this.each(function (i, ele) {
    var isMultiple = selectMultipleRe.test(ele.type),
        eleValue = value === null ? isMultiple ? [] : '' : value;

    if (isMultiple && isArray(eleValue)) {
      each(ele.options, function (option) {
        option.selected = eleValue.indexOf(option.value) >= 0;
      });
    } else {
      ele.value = eleValue;
    }
  });
}

Cash.prototype.val = val;

Cash.prototype.clone = function () {
  return this.map(function (i, ele) {
    return ele.cloneNode(true);
  });
};

Cash.prototype.detach = function () {
  return this.each(function (i, ele) {
    if (ele.parentNode) {
      ele.parentNode.removeChild(ele);
    }
  });
}; // @require ./cash.ts
// @require ./variables.ts
// @require ./type_checking.ts
// @require collection/get.ts
// @require manipulation/detach.ts


var fragmentRe = /^\s*<(\w+)[^>]*>/,
    singleTagRe = /^\s*<(\w+)\s*\/?>(?:<\/\1>)?\s*$/;
var containers;

function initContainers() {
  if (containers) return;
  var table = doc.createElement('table'),
      tr = doc.createElement('tr');
  containers = {
    '*': doc.createElement('div'),
    tr: doc.createElement('tbody'),
    td: tr,
    th: tr,
    thead: table,
    tbody: table,
    tfoot: table
  };
}

function parseHTML(html) {
  initContainers();
  if (!isString(html)) return [];
  if (singleTagRe.test(html)) return [doc.createElement(RegExp.$1)];
  var fragment = fragmentRe.test(html) && RegExp.$1,
      container = containers[fragment] || containers['*'];
  container.innerHTML = html;
  return cash(container.childNodes).detach().get();
}

cash.parseHTML = parseHTML;

Cash.prototype.empty = function () {
  var ele = this[0];

  if (ele) {
    while (ele.firstChild) {
      ele.removeChild(ele.firstChild);
    }
  }

  return this;
};

function insertElement(ele, child, prepend) {
  if (prepend) {
    ele.insertBefore(child, ele.childNodes[0]);
  } else {
    ele.appendChild(child);
  }
} // @require core/each.ts
// @require core/type_checking.ts
// @require ./insert_element.ts


function insertContent(parent, child, prepend) {
  each(parent, function (parentEle, index) {
    each(child, function (childEle) {
      insertElement(parentEle, !index ? childEle : childEle.cloneNode(true), prepend);
    });
  });
}

Cash.prototype.append = function () {
  var _this = this;

  each(arguments, function (selector) {
    insertContent(_this, cash(selector));
  });
  return this;
};

Cash.prototype.appendTo = function (selector) {
  insertContent(cash(selector), this);
  return this;
};

function html(html) {
  if (html === undefined) return this[0] && this[0].innerHTML;
  return this.each(function (i, ele) {
    ele.innerHTML = html;
  });
}

Cash.prototype.html = html;

Cash.prototype.insertAfter = function (selector) {
  var _this = this;

  cash(selector).each(function (index, ele) {
    var parent = ele.parentNode;

    if (parent) {
      _this.each(function (i, e) {
        parent.insertBefore(!index ? e : e.cloneNode(true), ele.nextSibling);
      });
    }
  });
  return this;
};

Cash.prototype.after = function () {
  var _this = this;

  each(reverse.apply(arguments), function (selector) {
    reverse.apply(cash(selector).slice()).insertAfter(_this);
  });
  return this;
};

Cash.prototype.insertBefore = function (selector) {
  var _this = this;

  cash(selector).each(function (index, ele) {
    var parent = ele.parentNode;

    if (parent) {
      _this.each(function (i, e) {
        parent.insertBefore(!index ? e : e.cloneNode(true), ele);
      });
    }
  });
  return this;
};

Cash.prototype.before = function () {
  var _this = this;

  each(arguments, function (selector) {
    cash(selector).insertBefore(_this);
  });
  return this;
};

Cash.prototype.prepend = function () {
  var _this = this;

  each(arguments, function (selector) {
    insertContent(_this, cash(selector), true);
  });
  return this;
};

Cash.prototype.prependTo = function (selector) {
  insertContent(cash(selector), reverse.apply(this.slice()), true);
  return this;
};

Cash.prototype.remove = function () {
  return this.detach().off();
};

Cash.prototype.replaceWith = function (selector) {
  var _this = this;

  return this.each(function (i, ele) {
    var parent = ele.parentNode;
    if (!parent) return;
    var $eles = i ? cash(selector).clone() : cash(selector);

    if (!$eles[0]) {
      _this.remove();

      return false;
    }

    parent.replaceChild($eles[0], ele);
    cash($eles[0]).after($eles.slice(1));
  });
};

Cash.prototype.replaceAll = function (selector) {
  cash(selector).replaceWith(this);
  return this;
};

function text(text) {
  if (text === undefined) return this[0] ? this[0].textContent : '';
  return this.each(function (i, ele) {
    ele.textContent = text;
  });
}

;
Cash.prototype.text = text; // @optional ./after.ts
// @optional ./append.ts
// @optional ./append_to.ts
// @optional ./before.ts
// @optional ./clone.ts
// @optional ./detach.ts
// @optional ./empty.ts
// @optional ./html.ts
// @optional ./insert_after.ts
// @optional ./insert_before.ts
// @optional ./prepend.ts
// @optional ./prepend_to.ts
// @optional ./remove.ts
// @optional ./replace_all.ts
// @optional ./replace_with.ts
// @optional ./text.ts
// @require core/cash.ts
// @require core/variables.ts

var docEle = doc.documentElement;

Cash.prototype.offset = function () {
  var ele = this[0];
  if (!ele) return;
  var rect = ele.getBoundingClientRect();
  return {
    top: rect.top + win.pageYOffset - docEle.clientTop,
    left: rect.left + win.pageXOffset - docEle.clientLeft
  };
};

Cash.prototype.offsetParent = function () {
  return cash(this[0] && this[0].offsetParent);
};

Cash.prototype.position = function () {
  var ele = this[0];
  if (!ele) return;
  return {
    left: ele.offsetLeft,
    top: ele.offsetTop
  };
};

Cash.prototype.children = function (selector) {
  var result = [];
  this.each(function (i, ele) {
    push.apply(result, ele.children);
  });
  result = cash(unique(result));
  if (!selector) return result;
  return result.filter(selector);
};

Cash.prototype.contents = function () {
  var result = [];
  this.each(function (i, ele) {
    push.apply(result, ele.tagName === 'IFRAME' ? [ele.contentDocument] : ele.childNodes);
  });
  return cash(result.length && unique(result));
};

Cash.prototype.find = function (selector) {
  var result = [];

  for (var i = 0, l = this.length; i < l; i++) {
    var found = find(selector, this[i]);

    if (found.length) {
      push.apply(result, found);
    }
  }

  return cash(result.length && unique(result));
};

Cash.prototype.has = function (selector) {
  var comparator = isString(selector) ? function (i, ele) {
    return !!find(selector, ele).length;
  } : function (i, ele) {
    return ele.contains(selector);
  };
  return this.filter(comparator);
};

Cash.prototype.is = function (comparator) {
  if (!comparator || !this[0]) return false;
  var compare = getCompareFunction(comparator);
  var check = false;
  this.each(function (i, ele) {
    check = compare.call(ele, i, ele);
    return !check;
  });
  return check;
};

Cash.prototype.next = function () {
  return cash(this[0] && this[0].nextElementSibling);
};

Cash.prototype.not = function (comparator) {
  if (!comparator || !this[0]) return this;
  var compare = getCompareFunction(comparator);
  return this.filter(function (i, ele) {
    return !compare.call(ele, i, ele);
  });
};

Cash.prototype.parent = function () {
  var result = [];
  this.each(function (i, ele) {
    if (ele && ele.parentNode) {
      result.push(ele.parentNode);
    }
  });
  return cash(unique(result));
};

Cash.prototype.index = function (selector) {
  var child = selector ? cash(selector)[0] : this[0],
      collection = selector ? this : cash(child).parent().children();
  return indexOf.call(collection, child);
};

Cash.prototype.closest = function (selector) {
  if (!selector || !this[0]) return cash();
  if (this.is(selector)) return this.filter(selector);
  return this.parent().closest(selector);
};

Cash.prototype.parents = function (selector) {
  var result = [];
  var last;
  this.each(function (i, ele) {
    last = ele;

    while (last && last.parentNode && last !== doc.body.parentNode) {
      last = last.parentNode;

      if (!selector || selector && matches(last, selector)) {
        result.push(last);
      }
    }
  });
  return cash(unique(result));
};

Cash.prototype.prev = function () {
  return cash(this[0] && this[0].previousElementSibling);
};

Cash.prototype.siblings = function () {
  var ele = this[0];
  return this.parent().children().filter(function (i, child) {
    return child !== ele;
  });
}; // @optional ./children.ts
// @optional ./closest.ts
// @optional ./contents.ts
// @optional ./find.ts
// @optional ./has.ts
// @optional ./is.ts
// @optional ./next.ts
// @optional ./not.ts
// @optional ./parent.ts
// @optional ./parents.ts
// @optional ./prev.ts
// @optional ./siblings.ts
// @optional attributes/index.ts
// @optional collection/index.ts
// @optional css/index.ts
// @optional data/index.ts
// @optional dimensions/index.ts
// @optional events/index.ts
// @optional forms/index.ts
// @optional manipulation/index.ts
// @optional offset/index.ts
// @optional traversal/index.ts
// @require core/index.ts
// @priority -100
// @require ./cash.ts
// @require ./variables.ts


if (typeof exports !== 'undefined') {
  // Node.js
  module.exports = cash;
} else {
  // Browser
  win['cash'] = win['$'] = cash;
}
})();
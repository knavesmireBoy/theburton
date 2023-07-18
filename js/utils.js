/*jslint nomen: true */
/* eslint-disable indent */
/*global theBurton: false */
if (!window.theBurton) {
  window.theBurton = {};
}

(function (window) {
  "use strict";
  let lastTime = 0,
    prefixes = "webkit moz ms o".split(" "),
    requestAnimationFrame = window.requestAnimationFrame, //get unprefixed rAF and cAF, if present
    cancelAnimationFrame = window.cancelAnimationFrame,
    prefix,
    i;
  // loop through vendor prefixes and get prefixed rAF and cAF
  for (i = 0; i < prefixes.length; i++) {
    if (requestAnimationFrame && cancelAnimationFrame) {
      break;
    }
    prefix = prefixes[i];
    requestAnimationFrame =
      requestAnimationFrame || window[prefix + "RequestAnimationFrame"];
    cancelAnimationFrame =
      cancelAnimationFrame ||
      window[prefix + "CancelAnimationFrame"] ||
      window[prefix + "CancelRequestAnimationFrame"];
  }

  // fallback to setTimeout and clearTimeout if either request/cancel is not supported
  if (!requestAnimationFrame || !cancelAnimationFrame) {
    requestAnimationFrame = function (callback, element) {
      let currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    cancelAnimationFrame = function (id) {
      window.clearTimeout(id);
    };
  }
  // put in global namespace
  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;
})(window);

if (typeof Function.prototype.method === "undefined") {
  Function.prototype.method = function (name, func) {
    "use strict";
    this.prototype[name] = func;
    return this;
  };
}

function payment(total, rate, pay, fixed = 0) {
  var count = 0;
  while (total > 0) {
    //interest
    total *= rate;
    //monthly payment
    total -= pay;
    //fixed charges (before or after rate applied?)
    total += fixed;
    //duration
    count++;
  }
  return [total, count];
}

function getNextElement(node, type = 1) {
  if (node && node.nodeType === type) {
    return node;
  }
  if (node && node.nextSibling) {
    return getNextElement(node.nextSibling);
  }
  return null;
}

function getPrevElement(node, type = 1) {
  if (node && node.nodeType === type) {
    return node;
  }
  if (node && node.previousSibling) {
    return getPrevElement(node.previousSibling);
  }
  return null;
}

function getTargetNode(node, reg, dir = "firstChild") {
  if (!node) {
    return null;
  }
  let mynode = node.nodeType === 1 ? node : getNextElement(node),
    res = mynode && mynode.nodeName.match(reg);
  if (!res) {
    mynode = mynode && getNextElement(mynode[dir]);
    return mynode && getTargetNode(mynode, reg, dir);
  }
  return mynode;
}

function applyClass(kls, el, flag = false) {
  var meta = theBurton.meta,
    alt = meta.doAlternate(),
    invoke = (f) => f(),
    isFunction = meta.tagTester("Function"),
    getRes = function (arg) {
      if (isFunction(arg)) {
        return arg();
      }
      return arg;
    },
    curry22 = meta.curryRight(2, true),
    pApply = meta.pApply,
    best = (coll, fun) => () => coll.reduce((a, b) => (fun(a, b) ? a : b)),
    bestLate = (coll) => (fun) => coll.reduce((a, b) => (fun ? a : b)),
    displayClass = meta.pApply(meta.invokeMethod, getRes(el).classList),
    exec = displayClass("add"),
    undo = displayClass("remove"),
    enter = curry22(meta.invoke)(kls)(exec),
    exit = curry22(meta.invoke)(kls)(undo),
    noOp = () => undefined,
    state = flag ? exit : enter,
    query = compose(bestLate([enter, exit])),
    defer = best([noOp, state], meta.$$Q("." + kls));
  return {
    exec: enter,
    undo: exit,
    apply: meta.compose(invoke, defer),
    query: meta.compose(invoke, query),
    toggle: alt([enter, exit]),
  };
}

theBurton.utils = (function () {
  const meta = theBurton.meta,
    tagTester = meta.tagTester,
    isFunction = tagTester("Function"),
    getRes = function (arg) {
      if (isFunction(arg)) {
        return arg();
      }
      return arg;
    },
    invokeMethod = meta.invokeMethod,
    invokeMethodBridge = meta.invokeMethodBridge,
    invokeMethodBridgeCB = meta.invokeMethodBridgeCB,
    ptL = meta.doPartial(),
    compose = meta.compose,
    pass = meta.pass,
    getter = (o, p) => getRes(o)[p],
    curry2 = meta.curryRight(2),
    curry3 = meta.curryRight(3),
    curryL3 = meta.curryLeft(3),
    curryL33 = meta.curryLeft(3, true),
    getTarget = curry2(getter)("target"),
    getParent = curry2(getter)("parentNode"),
    getClassList = curry2(getter)("classList"),
    doTextNow = ptL(invokeMethod, document, "createTextNode"),
    setAttribute = ptL(meta.lazyVal, "setAttribute"),
    setLink = curry2(setAttribute("href")),
    getImgSrc = curryL3(invokeMethodBridge)("getAttribute")("src"),
    addKlas = ptL(invokeMethodBridge, "add"),
    remKlas = ptL(invokeMethodBridge, "remove"),
    undoActive = compose(remKlas("active"), getClassList).wrap(pass),
    doEach = curryL3(invokeMethodBridgeCB(getRes))("forEach"),
    getZero = curry2(getter)("0"),
    getLength = curry2(getter)("length"),
    getKey = compose(getZero, curryL3(invokeMethod)(window.Object)("keys")),
    modulo = (n, i) => i % n,
    increment = (i) => i + 1,
    doInc = (n) => compose(ptL(modulo, n), increment),
    append = ptL(invokeMethodBridgeCB(getRes), "appendChild"),
    prepAttrs = (keys, vals) => curryL33(meta.zip)("map")(keys)(vals),
    removeElement = (node) => {
      return node && node.parentNode.removeChild(getRes(node));
    },
    prep2Append = (doEl, doAttrs) =>
      compose(
        append,
        curry2(meta.invoke)(doEl),
        ptL(meta.invokeEach, "forEach"),
        doAttrs
      )();

  return {
    applyClass: applyClass,
    addLoadEvent: (func) => {
      var oldonload = window.onload;
      if (typeof window.onload != "function") {
        window.onload = func;
      } else {
        window.onload = function () {
          oldonload();
          func();
        };
      }
    },
    removeElement: removeElement,
    removeChildNodes: (node) => {
      while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
      }
    },
    prep2Append: prep2Append,
    prepAttrs: prepAttrs,
    getNextElement: getNextElement,
    getPrevElement: getPrevElement,
    getTargetNode: getTargetNode,
    getElementHeight: (el) => {
      return el.getBoundingClientRect().height || el.offsetHeight;
    },
    getNaturalDims: (DOMelement) => {
      var img = new Image();
      img.src = DOMelement.src;
      return { width: img.width, height: img.height };
    },
    getTarget: getTarget,
    getRes: getRes,
    getParent: getParent,
    getParent2: compose(getParent, getParent),
    getText: curry2(getter)("innerHTML"),
    doMakeDefer: curryL33(invokeMethod)(document)("createElement"),
    doMake: curryL3(invokeMethod)(document)("createElement"),
    //doText: deferPTL(invokeMethod, document, "createTextNode"),
    doText: curryL33(invokeMethod)(document)("createTextNode"),
    doTextCBNow: curryL3(invokeMethod)(document)("createTextNode"),
    prepend: curry2(ptL(invokeMethodBridgeCB(getRes), "appendChild")),
    append: append,
    appendAlt: ptL(meta.mittelFactory()(invokeMethod, "appendChild")),
    appendCB: curryL3(invokeMethodBridgeCB(getRes))("appendChild"),
    getAttrs: curryL3(invokeMethodBridge)("getAttribute"),
    matchLink: compose(
      curry3(invokeMethod)(/^a$/i)("match"),
      curry2(getter)("nodeName"),
      getTarget
    ),
    matchPath: compose(
      curry3(invokeMethod)(/jpe?g/i)("match"),
      curryL3(invokeMethodBridge)("getAttribute")("href")
    ),
    getImgPath: compose(getImgSrc, getTarget),
    setId: curry2(setAttribute("id")),
    setKlas: curry2(setAttribute("class")),
    setSrc: curry2(setAttribute("src")),
    setAlt: curry2(setAttribute("alt")),
    setVal: curry2(setAttribute("value")),
    setMin: curry2(setAttribute("min")),
    setMax: curry2(setAttribute("max")),
    setType: curry2(setAttribute("type")),
    setTitle: curry2(setAttribute("title")),
    setHyper: curry2(setAttribute("href")),
    addKlas: addKlas,
    remKlas: remKlas,
    getClassList: getClassList,
    applyClassList: (partial, o) => {
      partial(o.classList);
      //console.log(o, 7);
      return o;
    },
    setInnerHTML: meta.mittelFactory()(meta.setter, "innerHTML"),
    clearInnerHTML: curry3(meta.setter)("")("innerHTML"),
    setNavId: curry2(setAttribute("id"))("navigation").wrap(pass),
    setHref: setLink(".").wrap(pass),
    doActive: compose(addKlas("active"), getClassList).wrap(pass),
    undoActive: undoActive,
    undoActiveCB: doEach(undoActive),
    getKeys: compose(doTextNow, getKey),
    doTextNow: doTextNow,
    getLast: (array) => array[array.length - 1],
    getZero: getZero,
    incrementer: compose(doInc, getLength),
    applyPortrait: curry3((m, o, v) => o.classList[m](v))("portrait"),
    insertNeu: (el, after) => {
      let p = el.parentNode,
        get = getNextElement,
        first = get(p.firstChild),
        node = after ? get(first.nextSibling) : first;
      return p.insertBefore(el, node);
    },
    displayLoading: function (element) {
      var doLink = utils.doMakeDefer("a"),
        doImg = utils.doMakeDefer("img"),
        setLink = prep2Append(
          doLink,
          utils.prepAttrs([utils.setId], ["progress"])
        ),
        keys = [utils.setAlt, utils.setSrc, utils.setKlas],
        values = ["loading...", "assets/progressbar.gif", "loading"],
        setImg = prep2Append(doImg, utils.prepAttrs(keys, values));
      return compose(setImg, setLink)(element);
    },
    fadeUp: function (element, red, green, blue) {
      let doFade = (col) => col + Math.ceil((255 - col) / 10);
      if (element.fade) {
        clearTimeout(element.fade);
      }
      element.style.backgroundColor =
        "rgb(" + red + "," + green + "," + blue + ")";
      if (red == 255 && green == 255 && blue == 255) {
        return;
      }
      var r = doFade(red),
        g = doFade(green),
        b = doFade(blue),
        that = this;
      repeat = function () {
        that.fadeUp(element, r, g, b);
      };
      element.fade = setTimeout(repeat, 100);
    },
    doTest: function (x) {
      console.log(x);
      return x;
    },
    log: (v) => console.log(v),
    getHTTPObject: () => {
      var xmlhttp = false;
      if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        try {
          xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
          try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (e) {
            xmlhttp = false;
          }
        }
      }
      return xmlhttp;
    },
    displayError: (element, errortext) => {
      var para = document.createElement("div"),
        message = document.createTextNode(errortext);
      para.id = "error";
      para.appendChild(message);
      element.insertBefore(para, meta.$("hollywood"));
      utils.fadeUp(para, 204, 51, 102);
    },
    doAppend: (canvas, request) => {
      // canvas.innerHTML = request.responseText;
      var frag = document.createDocumentFragment(),
        n = document.createElement("div");
      n.innerHTML = request.responseText;
      while (n.firstChild) {
        frag.appendChild(n.firstChild);
      }
      canvas.appendChild(frag);
    },
    getComputedStyle: function (element, property) {
      const toCamelCase = function (variable) {
        return variable.replace(/-([a-z])/g, function (str, letter) {
          return letter.toUpperCase();
        });
      };
      element = getRes(element);
      if (!element || !property) {
        return null;
      }
      let computedStyle = null,
        def = document.defaultView || window;
      if (typeof element.currentStyle !== "undefined") {
        computedStyle = element.currentStyle;
      } else if (
        def &&
        def.getComputedStyle &&
        isFunction(def.getComputedStyle)
      ) {
        computedStyle = def.getComputedStyle(element, null);
      }
      if (computedStyle) {
        try {
          return (
            computedStyle.getPropertyValue(property) ||
            computedStyle.getPropertyValue(toCamelCase(property))
          );
        } catch (e) {
          return (
            computedStyle[property] ||
            computedStyle[toCamelCase(property)]
          );
        }
      }
    },
    payment: payment,
    deleteAllCookies: () => {
      const cookies = document.cookie.split(";");

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i],
          eqPos = cookie.indexOf("="),
          name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },
    setCookie: (cname, cvalue, exdays = 1) => {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    getCookie: (cname) => {
      let name = cname + "=",
        decodedCookie = decodeURIComponent(document.cookie),
        ca = decodedCookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
  };
})();

const tagTester = (name) => {
    const tag = "[object " + name + "]";
    return function (obj) {
      return toString.call(obj) === tag;
    };
  },
  isFunction = tagTester("Function"),
  getRes = function (arg) {
    if (isFunction(arg)) {
      return arg();
    }
    return arg;
  };

function doGetComputedStyle(element, property) {
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
  } else if (def && def.getComputedStyle && isFunction(def.getComputedStyle)) {
    computedStyle = def.getComputedStyle(element, null);
  }
  if (computedStyle) {
    try {
      return (
        computedStyle.getPropertyValue(property) ||
        computedStyle.getPropertyValue(toCamelCase(property))
      );
    } catch (e) {
      return computedStyle[property] || computedStyle[toCamelCase(property)];
    }
  }
}

const always = (x) => () => x,
  negate = (x) => () => !x,
  doPartial = (flag) => {
    return function p(f, ...args) {
      if (f.length === args.length) {
        return flag ? () => f(...args) : f(...args);
      }
      return (...rest) => p(f, ...args, ...rest);
    };
  },
  doWhenPred = (pred, action) => {
    return function (a, b) {
      if (pred(a, b)) {
        return action();
      }
    };
  },
  ptL = doPartial(),
  defer = doPartial(true),
  pass = (f) => (o) => {
    f(o);
    return o;
  },
  comp = (...fns) =>
  fns.reduce(
    (f, g) =>
      (...vs) =>
        f(g(...vs))
  ),
  curry2 = (f) => (b) => (a) => f(a, b),
  curry3 = (f) => (c) => (b) => (a) => f(a, b, c),
  curry4 = (f) => (d) => (c) => (b) => (a) => f(a, b, c, d),
  isArray = tagTester("Array"),
  F = (o) => isFunction(o) ? o() : o,
  getProp = (o, p) => o[p],
  invokeMethod = (o, m, v) => F(o)[m](v),
  invokeMethodPair = (o, m, p, v) => getRes(o)[m](p, v),
  invokeSub = (o, m, k, v) => o[m][k](v),
  $ = (id) => document.getElementById(id),
  $$ = (id) => () => document.getElementById(id),
  slice = Array.prototype.slice,
  mittel = (m) => (o) => ptL(invokeMethod, o, m),
  mittelRev = (m) => (v) => curry3(invokeMethod)(v)(m),
  mittelPair = (m, p) => (v) => curry4(invokeMethodPair)(v)(p)(m),
  mittelSub = (m, p) => (v) => curry4(invokeSub)(v)(p)(m),
  con = (x) => {
    console.log(x);
    return x;
  },
  lead_slide = document.querySelector("#slides a"),
  $article = document.querySelector('main > article'),
  parent = curry2(getProp)("parentNode"),
  appendChild = ptL(invokeMethod, $article, 'appendChild'),
  doMake = ptL(invokeMethod, document, "createElement"),
  doMakeDefer = defer(invokeMethod, document, "createElement"),
  andAppend = comp(appendChild, doMake),
  setId = pass(mittelPair("setAttribute", "id")),
  setAlt = pass(mittelPair("setAttribute", "alt")("preview pic")),
  setSrc = pass(mittelPair("setAttribute", "src")(lead_slide.getAttribute('href'))),
  doControlKlas = mittelSub('classList', 'add')('control'),
  doPreviewKlas = mittelSub('classList', 'add')('prev'),

  doPic = comp(setId, setAlt, setSrc, doMakeDefer('img')),

  setFore = comp(doControlKlas, setId('forward')),
  setAft = comp(doControlKlas, setId('back')),
  factor = 4,
  extent = document.querySelectorAll("#slides img").length,
  fraction = extent / factor,
  slides = $("slides"),
  all_slides = slice.call(document.querySelectorAll("#slides a")),
  $viewer = $("viewer"),
  forward = $("forward"),
  back = $("back"),
  doViewKlas = ptL(invokeSub, $viewer, "classList"),
  doViewKlasDefer = defer(invokeSub, $viewer, "classList");
  
comp(doPreviewKlas, andAppend)('a');
con(doPic())
doPreviewKlas($article);


//let px = getOffset();
/*
back.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateButton(e.target)) {
    let [inc] = getInc();
    doHide("end");
    px -= inc;
    px = Math.max(0, Math.ceil(px));
    doShowStart(px);
    apply(px * -1);
  }
});

forward.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateButton(e.target)) {
    let [inc, limit] = getInc(),
      mayAdvance = mayAdvanceDefer(inc)(limit),
      doGetNext = doGetNextDefer(inc)(limit);
    //https://stackoverflow.com/questions/11160227/translate-x-and-y-percentage-values-based-on-elements-height-and-width
    //https://stackoverflow.com/questions/43065579/how-to-convert-css-transform-matrix-back-to-its-component-properties
    px = getOffset();
    if (mayAdvance(px)) {
      doHide("start");
      px += inc;
      let pix = doGetNext(Math.ceil(px));
      doShowEnd(px, pix);
      px = pix;
      apply(px * -1);
    }
  }
});
*/
slides.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target.nodeName === "IMG") {
    let src = e.target.getAttribute("src");
    $("preview").setAttribute("src", src);
  }
});

let rtime,
  timeout = false,
  delta = 200,
  win = 0;

function resizeend() {
  if (new Date() - rtime < delta) {
    setTimeout(resizeend, delta);
  } else {
    timeout = false;
    let w = window.viewportSize.getWidth() / win;
    //  px *= w;
  }
}

window.addEventListener("resize", () => {
  rtime = new Date();
  if (timeout === false) {
    win = window.viewportSize.getWidth();
    timeout = true;
    setTimeout(resizeend, delta);
  }
});

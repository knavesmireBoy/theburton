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
  curry3 = (fn) => (c) => (b) => (a) => fn(a, b, c),
  invokeSub = (o, m, k, v) => o[m][k](v),
  $ = (id) => document.getElementById(id),
  slice = Array.prototype.slice,
  factor = 4,
  extent = document.querySelectorAll("#slides img").length,
  fraction = extent / factor,
  slides = $("slides"),
  lead_slide = document.querySelector("#slides a"),
  all_slides = slice.call(document.querySelectorAll("#slides a")),
  viewer = $("viewer"),
  forward = $("forward"),
  back = $("back"),
  doKlas = ptL(invokeSub, viewer, "classList"),
  doKlasDefer = defer(invokeSub, viewer, "classList"),
  doShow = doKlas("add"),
  doShowStart = doWhenPred((x) => !x, doKlasDefer("add")("start")),
  doShowEnd = doWhenPred((a, b) => a !== b, doKlasDefer("add")("end")),
  doHide = doKlas("remove"),
  apply = (pix, flag = false) => {
    //bit of a bodge
    let i = 0,
    inc = 1;
    if(window.viewportSize.getWidth() < 1140){
      i = (1280 / window.viewportSize.getWidth()) * 1.1;
    }
    let p = Math.ceil(pix) * (400 + i) / slides.clientWidth;
    all_slides.forEach((element) => {
      element.style.transform = `translateX(${Math.ceil(p)}%)`;
      if (!flag) element.classList.add("foo");
    });
  },
  doAdvance = (pix, lmt, incr) => pix !== lmt - incr,
  getNext = (pix, lmt, incr) => (pix + incr > lmt ? lmt - incr : pix),
  mayAdvanceDefer = curry3(doAdvance),
  doGetNextDefer = curry3(getNext),
  validateButton = (tgt) => {
    return tgt.classList.contains("control");
  },
  getInc = () => {
    let item = document.querySelector("#slides img").clientWidth,
      inc = item * factor,
      limit = inc * fraction;
    return [inc, limit];
  },
  getOffset = () => {
    let style = window.getComputedStyle(lead_slide, null),
      values = style.transform.match(/-?\d+\.?\d*/g);
    return values ? Math.abs(Math.ceil(values[4])) : 0;
  };

let px = getOffset();

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

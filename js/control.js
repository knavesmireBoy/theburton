
const  tagTester = (name) => {
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


function doGetComputedStyle (element, property) {
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
    computedStyle = def.getComputedStyle(element, property);
    console.log(computedStyle);
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
  apply = (pix) => {
    all_slides.forEach((element) => {
      element.style.transform = `translateX(${pix}px)`;
      element.classList.add("foo");
    });
  },
  doAdvance = (px, limit, inc) => px !== limit - inc,
  getNext = (px, limit, inc) => (px + inc > limit ? limit - inc : px),
  mayAdvanceDefer = curry3(doAdvance),
  doGetNextDefer = curry3(getNext),
  validateButton = (tgt) => {
    return tgt.classList.contains("control");
  },
  getInc = () => {
    let item = document.querySelector("#slides img").offsetWidth,
    inc = item * factor,
    limit = inc * fraction;
    return [inc, limit];
  };
let px = 0;
//viewer.style.width = inc + "px";

back.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateButton(e.target)) {
    let item = document.querySelector("#slides img").offsetWidth,
    inc = item * factor,
    limit = inc * fraction;
    doHide("end");
    px -= inc;
    px = Math.max(0, px);
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
    console.log(inc, limit);
    if (mayAdvance(px)) {
      doHide("start");
      px += inc;
      let pix = doGetNext(px);
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

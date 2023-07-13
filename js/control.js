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
  slides = $("slides"),
  lead_slide = document.querySelector("#slides a"),
  viewer = $("viewer"),
  forward = $("forward"),
  back = $("back"),
  control = document.querySelector(".control a"),
  item = document.querySelector("#slides img").offsetWidth,
  extent = document.querySelectorAll("#slides img").length,
  doKlas = ptL(invokeSub, viewer, "classList"),
  doKlasDefer = defer(invokeSub, viewer, "classList"),
  doShow = doKlas("add"),
  doShowStart = doWhenPred((x) => !x, doKlasDefer("add")("start")),
  doShowEnd = doWhenPred((a, b) => a !== b, doKlasDefer("add")("end")),
  doHide = doKlas("remove"),
  factor = 4,
  fraction = extent / factor,
  inc = item * factor,
  limit = inc * fraction,
  apply = (pix) => {
    slides.classList.add("foo");
    console.log(3, pix);
    //slides.style.transform = `translate(${pix}px,0)`;
    lead_slide.style.marginLeft = `${pix}px`;
  },
  doAdvance = (px, limit, inc) => px !== limit - inc,
  mayAdvance = curry3(doAdvance)(inc)(limit),
  getNext = (px, limit, inc) => (px + inc > limit ? limit - inc : px),
  doGetNext = curry3(getNext)(inc)(limit),
  validateButton = (tgt) => {
    return tgt.classList.contains('control');
  };
let px = 0;
//viewer.style.width = inc + "px";
/*
back.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateButton(e.target)) {
    doHide("end");
    px -= inc;
    px = Math.max(0, px);
    doShowStart(px);
    apply(px * -1);
  }
});
*/
forward.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(e.target);
  if (validateButton(e.target)) {
    //if (mayAdvance(px)) {
      //doHide("start");
      px += inc;
      let pix = doGetNext(px);
     // doShowEnd(px, pix);
      px = pix;
      apply(px * -1);
    //}
    

  }
});

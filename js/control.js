function controllerFactory(factor, extent, item, px = 0, state = false) {
  let fraction = extent / factor,
    Controller = function () {
      this.inc = item * factor;
      this.limit = this.inc * (extent / factor);
    };
}

const control = document.querySelector(".control a"),
  slides = document.getElementById("slides"),
  extent = document.querySelectorAll(".slide").length,
  viewer = document.getElementById("viewer"),
  forward = document.getElementById("forward"),
  back = document.getElementById("back"),
  always = (x) => () => x,
  curry3 = (fn) => (c) => (b) => (a) => fn(a, b, c),
  best = (fun, coll, ...rest) => {
    return coll.reduce((champ, contender) =>
      fun(champ(...rest), contender(...rest)) ? champ : contender
    );
  };
let px = 0,
  factor = 4,
  fraction = extent / factor,
  item = document.querySelector(".slide").offsetWidth,
  inc = item * factor,
  limit = inc * fraction,
  last,
  state = false,
  apply = (pix) => {
    slides.classList.add("foo");
    slides.style.transform = `translate(${pix}px,0)`;
  },
  doAdvance = (px, limit, inc) => px !== limit - inc,
  mayAdvance = curry3(doAdvance)(inc)(limit),
  getNext = (px, limit, inc) => (px + inc > limit ? limit - inc : px),
  doGetNext = curry3(getNext)(inc)(limit),
  validateButton = (tgt) => {
    return tgt.nodeName === "A";
  };
viewer.style.width = inc + "px";
back.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateButton(e.target)) {
    px -= inc;
    px = Math.max(0, px);
    apply(px * -1);
  }
});

forward.addEventListener("click", (e) => {
  e.preventDefault();
  if (validateButton(e.target)) {
    if (doAdvance(px, limit, inc)) {
      px += inc;
      px = getNext(px, limit, inc);
      apply(px * -1);
    }
  }
});

function insertAlready(el, ref) {
  ref.parentNode.insertBefore(el, ref);
  return el;
}

const $ = (id) => document.getElementById(id),
  main = document.querySelector("main"),
  lookup = ["one", "two", "three"],
  evCB = (e) => {
    let el = e.target;
    e.preventDefault();
    if (el.nodeName === "A") {
      let i = el.innerHTML - 1;
      main.className = lookup[i];
    }
  },
  tagTester = (name) => {
    const tag = "[object " + name + "]";
    return function (obj) {
      return toString.call(obj) === tag;
    };
  },
  isFunction = tagTester("Function"),
  isArray = tagTester("Array"),
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
  F = (o) => (isFunction(o) ? o() : o),
  curry2 = (f) => (b) => (a) => f(a, b),
  curry3 = (f) => (c) => (b) => (a) => f(a, b, c),
  curry4 = (f) => (d) => (c) => (b) => (a) => f(a, b, c, d),
  doPartial = (flag) => {
    return function p(f, ...args) {
      if (f.length === args.length) {
        return flag ? () => f(...args) : f(...args);
      }
      return (...rest) => p(f, ...args, ...rest);
    };
  },
  ptL = doPartial(),
  invokeMethod = (o, m, v) => F(o)[m](v),
  invokeMethodPair = (o, m, p, v) => F(o)[m](p, v),
  invoke = (f) => f(),
  getProp = (o, p) => o[p],
  mittel = (m) => (o) => ptL(invokeMethod, o, m),
  mittelRev = (m) => (v) => curry3(invokeMethod)(v)(m),
  mittelPair = (m, p) => (v) => curry4(invokeMethodPair)(v)(p)(m),
  con = (x) => {
    console.log(x);
    return x;
  },
  parent = curry2(getProp)("parentNode"),
  appendChild = mittel("appendChild"),
  doTextNow = ptL(invokeMethod, document, "createTextNode"),
  doMake = ptL(invokeMethod, document, "createElement"),
  andAppend = comp(appendChild, doMake),
  setHref = pass(mittelPair("setAttribute", "href")("#")),
  setId = pass(mittelPair("setAttribute", "id")("pagination")),
  myNav = comp(setId, andAppend("nav")),
  nodes = lookup.map(comp(doTextNow, (el, i) => i + 1)),
  links = nodes.map((txtnode) => {
    let f = andAppend("a");
    return comp(setHref, parent, f)(txtnode);
  }),
  lists = links.map((a) => {
    let f = andAppend("li");
    return comp(parent, f)(a);
  }),
  paginate = mittelPair("addEventListener", "click")(evCB),
  doKids = (str, gang) => {
    let el = null,
      cb = comp(parent, andAppend(str)),
      group = isArray(gang) ? gang : [gang];
    group.forEach((node) => {
      if (!el) {
        el = cb(node);
      } else {
        appendChild(el)(node);
      }
    });
    return el;
  },
  $nav = comp(
    paginate,
    curry2(insertAlready)($("curl")),
    setId,
    ptL(doKids, "nav")
  )(doKids("ul", lists));

//trigger
evCB({ target: links[0], preventDefault: () => null });

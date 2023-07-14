const  $ = (id) => document.getElementById(id),
main = document.querySelector('main'),
pag = $('pagination'),
lookup = ['one', 'two', 'three'];

pag.addEventListener( 'click', e => {
    let el = e.target;
    e.preventDefault();
    if(el.nodeName === 'A'){
        let i = el.innerHTML - 1;
        main.className = lookup[i];
    }
});
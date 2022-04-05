let obj = { info: { name: 123, age: 456 }, test: 'qqq' };

let proxy = new Proxy(obj, {
    get(target, property, value, receiver) {
        console.log('get', target, property);
        return Reflect.get(target, property, value, receiver);
    },
    set(target, property, value, receiver) {
        console.log('set', target);
        console.log('set', property);
        console.log('set', value);
        console.log('set', receiver);
        return Reflect.set(target, property, value, receiver);
    },
});
// proxy.info = 0;
proxy.info.name = 9;

// console.log(proxy.info.age);

function compile(el, data) {
    let fragment = document.createDocumentFragment();
    while ((child = el.firstChild)) {
        fragment.appendChild(child);
    }
    return fragment;
}

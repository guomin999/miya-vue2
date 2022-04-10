const bailRE = /[^\w.$]/;
// 如何收集依赖？收集的依赖存放在哪里？
function defineReactive(data, key, val) {
    if (typeof val === 'object') {
        new Observe(val);
    }

    let dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get() {
            // 收集依赖
            console.log('get', key);
            dep.depend();
            return val;
        },
        set(newVal) {
            if (newVal === val) {
                return;
            }
            console.log('set', key);
            val = newVal;
            // 数据更新，通知依赖更新
            dep.notify();
        },
    });
}

class Dep {
    constructor() {
        this.subs = [];
    }
    // 添加
    addSub(sub) {
        this.subs.push(sub);
    }
    // 移除
    removeSub(sub) {
        remove(this.subs, sub);
    }

    depend() {
        // 新增依赖，那么依赖又是什么呢？(数据变化后通知谁去更新呢？模板、watch)===> Watcher
        if (Dep.target) {
            this.addSub(Dep.target);
        }
    }

    notify() {
        this.subs.forEach(item => item.update());
    }
}

function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(inex, 1);
        }
    }
}

class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        // 读取data.a.b.c的内容
        this.getter = parsePath(expOrFn);
        this.cb = cb;
        this.value = this.get();
    }

    get() {
        window.target = this;
        let value = this.getter.call(this.vm, this.vm);
        window.target = undefined;
        return value;
    }

    update() {
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, oldValue);
    }
}

function parsePath(path) {
    if (bailRE.test(path)) {
        return;
    }
    const segements = path.split('.');
    return function (obj) {
        for (let i = 0; i < segements.length; i++) {
            if (!obj) return;
            obj = obj[segements[i]];
        }
        return obj;
    };
}

const arrayProto = Array.prototype;
const arrayMethod = Object.create(arrayProto);

// __proto__属于部分浏览器支持的非标准属性，对于不支持的浏览器，直接将arrayMethods上的方法设置到被侦测的数组上
const haseProto = '__proto__' in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethod);

[('push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse')].forEach(function (method) {
    const original = arrayProto;
    Object.defineProperty(arrayMethod, method, {
        value: function mutator(...args) {
            return original.call(this, args);
        },
        enumerable: false,
        writable: true,
        configurable: true,
    });
});

function protoAugment(target, src, keys) {
    target.__proto__ = src;
}

function copyAugment(target, src, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        def(target, key, src[key]);
    }
}

function def(obj, key, value, enumerable) {
    Object.defineProperty(obj, key, {
        value,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    });
}

class Observe {
    constructor(value) {
        this.value = value;

        if (Array.isArray(value)) {
            // 拦截操作只针对那些被监听的数据
            const argment = haseProto ? protoAugment : copyAugment;
            argment(value, arrayMethod, arrayKeys);
        } else {
            this.walk(value);
        }
    }

    walk(obj) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]]);
        }
    }
}
let a = {
    b: 1,
    c: [1, 2, 3, 4],
};
new Observe(a);
// // a.c[0] = 5;
// a.b = 4;
// console.log(a.c[0], a.b);

# vue3.0分享

## 项目构建
- npm构建 (可以使用nrm管理)
- 全局安装vue/cli 需要版本v4.5.1 以上 (注意node版本)
```
npm install -g @vue/cli@next
vue create vue3_demo
```
- 可以使用非全局cli,使用npx构建,不与全局vue/cli冲突
```
npm install @vue/cli@next
vue create vue3_demo
```
-vue3官方文档地址：https://v3.vue.js.org

## 整体配置
```js
// Before
Vue.prototype.$http = () => {}

// After
const app = Vue.createApp({})
app.config.globalProperties.$http = () => {}

// 更多配置见官方文档
app.config = {
    devtools: true,
    errorHandle: (err, vm, info) = {},
    warnHandle: (msg, vm, trace) = {},
    ...
}
```

## 与vue2对比
#### 优点：
1. 相比于vue2有1.3~2倍的性能优势,SSR有2~3倍的速度提高
2. options API & composition API
    - 开发部分内部API,提供更灵活的代码组织方式与逻辑复用能力
    - 提供TS支持,提供基于IDE的代码补全与类型信息功能
3. Object.defineProperty -> Proxy
 - 基于ES6 proxy将原本对对象属性的操作变为对整个对象的操作,性能极大提高
4. 构建Block Tree 优化Virtual Dom树
5. 调整大部分Global API 及内部helpers 以及 ES modules导出,支持tree-sharing

#### 缺点：
1. 只支持IE11及以上 (Proxy不支持ie,ie11的支持等官方)
2. 对于习惯了Vue2.0开发模式的开发者来说,增加了心智负担,对开发者代码组织能力有考研

## 组合式API\
#### 核心 setup 函数
- setup 函数是一个新的组件选项。作为在组件内部使用 Composition API 的入口点
- 创建组件实例,然后初始化 props , 紧接着就调用setup 函数。从生命周期钩子的角度来看,它会在beforeCreate 钩子之前被调用

```js
import { h, ref, reactive, onMounted} from 'vue'

export default {
    // this 在setup()不可使用
    setup(props, { attrs, emit, slots}) {
        // props不能解构,解构会失去响应式,context可以解构
        const count = ref(0)
        const object = reactive({ foo: 'bar' })

        onMounted(() => {
            console.log('onMounted');
        });

        // 暴露给模版
        return {
            count,
            object
        }

        // 或者返回函数,渲染函数 /jsx 中使用
        return () => h('div', [count.value, object.foo])
    }
}
```
#### 响应式API
- ref 
 - 接受一个参数值并返回一个响应式且可改变的 ref 对象。 ref 对象拥有一个指向内部值的单一属性 .value
- reactive
 - 等同于vue2的Vue.obserable(), 基于 ES2015 的 Proxy 实现
- computed
 - 传入一个 getter 函数,返回一个默认不可手动修改的 ref 对象
 - 或者传入一个拥有 get 和 set 函数的对象,创建一个可手动修改的计算状态
- readonly
 - 传入一个对象或 ref,返回一个原始对象的只读代理。一个只读的代理是'深层的',对象内部任何嵌套的属性也都是只读的。
- watchEffect
 - 立即执行传入的一个函数,并响应式追踪其以来,并在其依赖变更时重新运行该函数
- watch
 - watch API 完全等效于2.x this.$watch

#### reactive简化实现
```js
// 基于es6: Proxy、Map
const proxyMap = new WeakMap(); // 代理对象存储
function isObject(target) {
    return typrof target === 'object' && target !== null;
}
function hasOwn(target, key) {
    return Object.prototype.hasOwnProperty.call(target, key);
}
function reactive(target) {
    return createReactiveObject(target);
}
// 创建响应式对象
function createReactiveObject(target) {
    if(!isObject(target)) {
        return target;
    }
    const  existingProxy = proxyMap.get(target);
    if(existingProxy) {
        console.log('already proxy!')
        return existingProxy
    }
    const handlers = {
        get(target, key, receiver) {
            console.log('get==>', key);
            const res = Reflect.get(target, key, receiver);
            // 依赖收集
            console.log('track==>', 'get', key);
            // 懒代理
            return isObject(res) ? reactive(res) : res
        },
        set(target, key, value, receiver) {
            console.log('set==>', key, value)
            const oldValue = target[key];
            const hadKey = hasOwn(target, key);
            const result = Reflect.set(target, key, value, receiver);
            if(!hadKey) {
                console.log('trigger==>', 'add', key, value);
                // 添加属性触发
            } else if (value !== oldValue) {
                console.log('trigger==>', 'set', key, value);
                // 添加属性触发
            }
            return result;
        },
        deleteProperty(target, key) {
            console.log('deleteProperty', key);
            const hadKey = hasOwn(target, key);
            const oldValue = target[key];
            const result = Reflect.deleteProperty(target, key);
            if(result && hadKey) {
                console.log('trigger==>', 'delete', key);
                // 删除属性触发
            } 
            return result;
        }
    };
    const proxy = new Proxy(target, handlers);
    proxyMap.set(target, proxy);
    return proxy;
}
// egg
var obj ={a: 1, b: 2, c: 3};
var proxy1 = reactive(obj);
var proxy2 = reactive(obj);
proxy1.a 
proxy2.b = 22
delete proxy1.c

var arr = [1,2,3]
var proxy3 = reactive(arr)
proxy3.push(4)
```

#### 与2.x 版本生命周期相对应的组合式 API
- beforeCreate -> 使用 setup()
- created -> 使用 setup()
- beforeMount -> onBeforeMount
- mounted -> onMounted
- beforeUpdate -> onBeforeUpdate
- updated -> onUpdated
- beforeDestroy -> onBeforeUnmount
- destroyed -> onUnmounted
- errorCaptured -> onErrorCaptured

#### 新增的钩子
除了和2.x 生命周期等效项之外，组合式API 还提供了以下调试钩子函数

- onRenderTracked
- onRenderTriggered
- 两个钩子函数都接受一个 DebuggerEvent
- 与 watchEffect 参数选项中的 onTrack 和 onTrigger 类似

#### demo
- demo使用vue + ts + less 构建
- about路由为vue3基础应用





<template>
  <div class="about">
    <button @click="countPlusOne">点我+1</button>
    <button @click="countSubtractOne">点我-1</button>
    <button @click="stopHandle">stopWatchEffect</button>
    <div ref="countRef">ref => {{ count }}</div>
    <div>computed => {{ countPow2 }}</div>
    <div>readonly => {{ copyCount }}</div>
    <div>watch => {{ watchCount }}</div>
    <div>reactive => {{ object }}</div>
    <div>watchEffect => {{ watchEffectObj }}</div>
    <div>parent <input type="text" v-model="inputModel"></div>
    <br>
    <about-child ::count="count" v-model="inputModel"></about-child>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  toRef,
  reactive,
  computed,
  readonly,
  watchEffect,
  watch,
  InjectionKey,
  provide,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onRenderTracked,
  onRenderTriggered
} from "vue";
import AboutChild from "@/components/AboutChild.vue";

interface DefaultObj {
  foo: number;
}

function countService() {
  const count = ref<number>(1);
  const countPow2 = computed(() => count.value ** 2);
  const copyCount = readonly(count);
  const watchCount = ref<number>(1);
  const inputModel = ref("input");
  watch(count, val => {
    watchCount.value = val;
  });

  return {
    count,
    countPow2,
    copyCount,
    watchCount,
    inputModel
  };
}
export default defineComponent({
  name: "About",
  components: {
    AboutChild
  },
  setup() {
    // 外部传入
    const {
      count,
      countPow2,
      copyCount,
      watchCount,
      inputModel
    } = countService();
    const countRef: Ref = ref(null);

    const object = reactive<DefaultObj>({ foo: 1 });
    const watchEffectObj: DefaultObj = reactive({ foo: 1 });
    const stopWatchEffect = watchEffect(
      onInvalidate => {
        watchEffectObj.foo = object.foo;

        // 清理失效回调
        onInvalidate(() => {
          console.log("onInvalidate");
        });
      },
      {
        flush: "post",
        onTrack(e) {
          // 开发者模式生效
          console.log("onTrack =>", e);
        },
        onTrigger(e) {
          // 开发者模式生效
          console.log("onTrigger =>", e);
        }
      }
    );

    // provide
    const key: InjectionKey<Ref<number>> = Symbol.for("aboutProvideObject");
    provide(key, toRef(object, "foo"));

    // method
    const countPlusOne = () => {
      count.value += 1;
      object.foo += 1;
    };

    const countSubtractOne = () => {
      count.value -= 1;
      object.foo -= 1;
    };

    const stopHandle = () => {
      console.log("stopWatchEffect");
      stopWatchEffect();
    };

    // 生命周期钩子
    onBeforeMount(() => {
      console.log("onBeforeMount");
    });

    onMounted(() => {
      console.log("onMounted");
      // 渲染完成 ref 赋予 dom
      countRef.value.style.color = "red";
    });

    onBeforeUpdate(() => {
      console.log("onBeforeUpdate");
    });

    onUpdated(() => {
      console.log("onUpdated");
    });

    onBeforeUnmount(() => {
      console.log("onBeforeUnmount");
    });

    onUnmounted(() => {
      console.log("onUnmounted");
    });

    onErrorCaptured(() => {
      console.log("onErrorCaptured");
    });

    onRenderTracked(() => {
      console.log("onRenderTracked");
    });

    onRenderTriggered(() => {
      console.log("onRenderTriggered");
    });

    return {
      count,
      countPow2,
      copyCount,
      watchCount,
      inputModel,
      countRef,
      object,
      watchEffectObj,
      countPlusOne,
      countSubtractOne,
      stopHandle
    };
  }
});
</script>
<style lang="less">
button {
  padding: 5px 10px;
  background-color: lightblue;
  &:not(:first-of-type) {
    margin-left: 10px;
  }
}
</style>

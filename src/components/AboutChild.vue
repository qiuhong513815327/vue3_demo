<template>
  <div class="about-child">
    <div>--------AboutChildComponent----------</div>
    <div>inject => {{ injectFoo }}</div>
    <div>props => {{ count }}</div>
    <div>
      v-model => <input type="text" @input="inputHandle" :value="modelValue" />
    </div>
    <div v-bg-color="bgColorVal" v-font-size="fontSizeVal">directives</div>
    <div>globalProperties => {{ rootCount }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, ref, unref, inject } from "vue";
import { bgColor, fontSize } from "../directives/About";

export default defineComponent({
  name: "AboutChild",
  components: {},
  directives: {
    bgColor,
    fontSize
  },
  props: {
    count: Number,
    modelValue: String
  },
  setup(props, { attrs, emit }) {
    // inject
    const injectFoo = inject(Symbol.for("aboutProvideObject"), ref(0));

    // method
    const inputHandle = (e: InputEvent) => {
      const target = e.target as HTMLInputElement;
      emit("update:modelValue", target.value);
    };

    const bgColorVal = ref("lightBlue");
    const fontSizeVal = ref("22px");

    // 获取ComponentInternalInstance
    const { ctx } = getCurrentInstance() as { [k: string]: any };
    const rootCount = unref(ctx.rootCount);

    setTimeout(() => {
      bgColorVal.value = "lightgreen";
      fontSizeVal.value = "30px";
    }, 3000);

    return {
      injectFoo,
      inputHandle,
      bgColorVal,
      fontSizeVal,
      rootCount
    };
  }
});
</script>
<style lang="less"></style>

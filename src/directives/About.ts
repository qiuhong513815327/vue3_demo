import { ObjectDirective, FunctionDirective } from "vue";

export const bgColor: ObjectDirective = {
  mounted(el: HTMLElement, binding, vnode) {
    const { style } = el;
    style.backgroundColor = binding.value;
  },
  updated(el: HTMLElement, binding, vnode, preVnode) {
    const { style } = el;
    style.backgroundColor = binding.value;
  }
};

export const fontSize: FunctionDirective = (el, binding) => {
  const { style } = el;
  style.fontSize = binding.value;
};

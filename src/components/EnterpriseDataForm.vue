<script>
export default {
  props: {
    data: {
      default: () => ({
        dataName: "",
        dataValue: "",
        dataAnnotation: "",
      }),
    },
  },
};
</script>

<template>
  <div class="field col">
    <label for="name">{{ data.dataName }}</label>
    <InputText
      id="name"
      type="text"
      v-model="data.dataValue"
      aria-describedby="username-help"
    />
    <small id="username-help">{{ data.dataAnnotation }}</small>
  </div>
</template>

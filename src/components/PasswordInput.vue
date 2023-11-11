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
    <Password id="name" type="text" v-model="data.dataValue" toggleMask>
      <template #content>
        <h6 class="pb-0 mb-0">{{ data.dataAnnotation }}</h6>
      </template>
    </Password>
  </div>
</template>

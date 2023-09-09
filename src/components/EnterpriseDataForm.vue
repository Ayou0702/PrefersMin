<template>
    <div class="field col">
      <label for="name">{{ data.dataName }}</label>
      <InputText id="name" type="text" v-model="data.dataValue">
        <template #header>
          <h6>Pick a password</h6>
        </template>
      </InputText>
    </div>
</template>

<script>

export default {
  props: {
    data: {
      default : () => ({
        dataName: '',
        dataValue : '',
        dataAnnotation : '',
      })
    }
  },
};
</script>

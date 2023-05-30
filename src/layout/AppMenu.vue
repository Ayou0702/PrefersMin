<script setup>
import { ref } from "vue";

import AppMenuItem from "./AppMenuItem.vue";

const model = ref([
  {
    label: "主控",
    items: [{ label: "仪表盘", icon: "pi pi-fw pi-home", to: "/" }],
  },
  {
    label: "数据",
    items: [
      {
        label: "课程数据",
        icon: "pi pi-fw pi-table",
        to: "/data/courseData",
      },
      {
        label: "教师数据",
        icon: "pi pi-fw pi-table",
        to: "/data/teacherData",
      },
    ],
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item
        v-if="!item.separator"
        :item="item"
        :index="i"
      ></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>

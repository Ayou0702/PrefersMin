<script setup>
import { ref } from "vue";

import AppMenuItem from "./AppMenuItem.vue";

const model = ref([
  {
    label: "主控",
    items: [{ label: "仪表盘", icon: "pi pi-fw pi-home", to: "/" }],
  },
  {
    label: "管理",
    items: [
      {
        label: "权限管理",
        icon: "pi pi-fw pi-images",
        to: "/controller/permission",
      },
    ],
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
      {
        label: "课表数据",
        icon: "pi pi-fw pi-table",
        to: "/data/scheduleData",
      },
    ],
  },
  {
    label: "工具",
    items: [
      {
        label: "月下图库",
        icon: "pi pi-fw pi-images",
        to: "/util/moonPhoto",
      },
      {
        label: "云图库",
        icon: "pi pi-fw pi-images",
        to: "/util/cloudPhoto",
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

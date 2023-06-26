<script setup>
import { onMounted, ref } from "vue";
import request from "@/service/request";

const treeTableValue = ref([]);
const temp = ref([]);
const temp2 = ref([]);

onMounted(() => {
  request({
    url: "/permission/all",
    method: "GET"
  })
    .then(res => {
      treeTableValue.value = [update(...res.data.data.Menu)]
      console.log(treeTableValue.value);
    });
});

function update(data) {
  console.log(data);
  if (data.children.length > 0) {
    data.children.forEach(item => {
      update(item);
    });
  }
  return {
    data: {
      id: data.id,
      pid: data.pid,
      name: data.name,
      type: data.type,
      orderNum: data.orderNum,
      permissionValue: data.permissionValue,
      path: data.path,
      component: data.component,
      icon: data.icon,
      status: data.status,
      gmtCreate: data.gmtCreate,
      gmtModified: data.gmtModified,
      level: data.level,
      select: data.select
    }, children: data.children.map(child => {
      return {
        data: {
          id: child.id,
          pid: child.pid,
          name: child.name,
          type: child.type,
          orderNum: child.orderNum,
          permissionValue: child.permissionValue,
          path: child.path,
          component: child.component,
          icon: child.icon,
          status: child.status,
          gmtCreate: child.gmtCreate,
          gmtModified: child.gmtModified,
          level: child.level,
          select: child.select
        }, children: child.children
      };
    })
  };
}
</script>

<template>
  <div class="card">
    <h5>TreeTable</h5>
    <TreeTable :value="treeTableValue">
      <Column :expander="true" field="name" header="名称"></Column>
      <Column field="icon" header="图标">

      </Column>
      <Column field="orderNum" header="排序"></Column>
      <Column field="type" header="菜单类型"></Column>
      <Column field="path" header="访问路径"></Column>
      <Column headerStyle="width: 10rem">
        <template #body>
          <div class="flex flex-wrap gap-2">
            <Button icon="pi pi-pencil" rounded severity="success" type="button" />
            <Button icon="pi pi-search" rounded type="button" />
          </div>
        </template>
      </Column>
    </TreeTable>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import request from "@/service/request";

const treeTableValue = ref([]);
const productDialog = ref(false);
const product = ref({});
const editProduct = (editProduct) => {
  product.value = { ...editProduct };
  console.log(product.value);
  productDialog.value = true;
};

onMounted(() => {
  request({
    url: "/permission/all",
    method: "GET"
  })
    .then(res => {
      treeTableValue.value = [update(...res.data.data.Menu)];
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

function saveProduct() {
  console.log(product.value);
}
const selectButtonValues1 = ref([{ name: '导航',value:0 }, { name: '目录',value: 1 }, { name: '菜单',value: 2 }]);
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
        <template #body="slotProps">
          <div class="flex flex-wrap gap-2">
            <Button icon="pi pi-pencil" rounded severity="success" type="button"
                    @click="editProduct(slotProps.node.data)" />
            <Button icon="pi pi-search" rounded type="button" />
          </div>
        </template>
      </Column>
    </TreeTable>

    <Dialog
      v-model:visible="productDialog"
      class="p-fluid w-3"
      modal
    >
      <template #header>
        <div v-if="product.id" class="p-dialog-title">
          修改菜单数据
        </div>
        <div v-else class="p-dialog-title">新增菜单数据</div>
      </template>

      <div class="formgrid grid">
        <div class="field col">
          <label>父节点</label>
          <Dropdown
            id="courseName"
            v-model="product.pid"
            :options="treeTableValue"
            optionLabel="data.name"
            optionValue="data.id"
            placeholder="无父节点请置空"
            showClear
          >
            <template #option="slotProp">
              <div class="ml-5">{{ slotProp.option.data.name }}</div>
            </template>
          </Dropdown>
        </div>
        <div class="field col">
          <label>显示排序</label>
          <div class="p-inputgroup">
            <Button label="-" @click="product.orderNum--" />
            <InputText v-model="product.orderNum" />
            <Button label="+" @click="product.orderNum++" />
          </div>
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label>名称</label>
          <InputText
            id="courseVenue"
            v-model="product.name"
          />
        </div>
        <div class="field col">
          <label>课程类别</label>
          <SelectButton v-model="product.type" :options="selectButtonValues1" optionLabel="name" optionValue="value"/>
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label>访问路径</label>
          <InputText
            id="path"
            v-model="product.path"
          />
        </div>
        <div class="field col">
          <label>组件路径</label>
          <InputText
            id="component"
            v-model="product.component"
          />
        </div>
      </div>

      <div class="formgrid grid">
        <div class="field col">
          <label>权限名称</label>
          <InputText
            id="quantity"
            v-model="product.permissionValue"
          />
        </div>
        <div class="field col">
          <label>图标</label>
          <InputText
            v-model="product.icon"
          />
        </div>
        <div class="field col">
          <label>菜单状态</label>
          <ToggleButton
            v-model="product.status"
            offLabel="正常"
            onLabel="停用"
          />
        </div>
      </div>
      <template #footer>
        <Button
          class="p-button-text"
          icon="pi pi-times"
          label="返回"
          @click="hideDialog"
        />
        <Button
          class="p-button-text"
          icon="pi pi-check"
          label="保存修改"
          @click="saveProduct"
        />
      </template>
    </Dialog>
  </div>


</template>

<script setup>
import { FilterMatchMode } from "primevue/api";
import { ref, onBeforeMount } from "vue";
import request from "@/service/request";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const dt = ref(null);
const selectedProducts = ref(null);
const loading = ref(true);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const filters = ref({});

let courseData = ref([]);
let avatarList = ref([]);

// 通过Vue的生命周期函数获取数据库中的线性课表数据
onBeforeMount(() => {
  initFilters();
  getCourseData().then((response) => {
    if (response.data.code === 200) {
      toast.add({
        severity: "success",
        summary: "成功",
        detail: response.data.message,
        life: 3000,
      });
    }
  });
});

function getCourseData() {
  loading.value = true;
  return request({
    url: "/getCourseData",
    method: "GET",
  })
    .then((response) => {
      if (response.data.code !== 200) {
        toast.add({
          severity: "error",
          summary: "错误",
          detail: response.data.message,
          life: 3000,
        });
        return Promise.reject({
          response: { data: { code: -1, message: response.data.message } },
        });
      }

      courseData.value = response.data.data;

      courseData.value.forEach((courseData) => {
        request({
          url: "/getAvatar",
          method: "POST",
          data: {
            avatarType: "courseAvatar",
            avatarId: courseData.courseId,
          },
        }).then((response) => {
          avatarList.value[courseData.courseId - 1] = response.data;
        });
      });

      loading.value = false;
      return response;
    })
    .catch((error) => {
      toast.add({
        severity: "error",
        summary: "错误",
        detail: error.message,
        life: 3000,
      });
      // 失败情况下返回约定错误格式（例如 code 字段为 -1）
      return Promise.reject({
        response: { data: { code: -1, message: error.message } },
      });
    });
}

const addCurriculumData = () => {
  product.value = {};
  productDialog.value = true;
};

const hideDialog = () => {
  productDialog.value = false;
};

const saveProduct = () => {
  if (
    product.value.courseName &&
    product.value.courseName.trim() &&
    product.value.courseVenue
  ) {
    if (product.value.curriculumId) {
      request({
        url: "/updateCurriculumData",
        method: "POST",
        data: product.value,
      }).then((response) => {
        if (response.data.code === 200) {
          getCourseData();
          // curriculumData.value[curriculumData.value.findIndex(item => item.curriculumId === product.value.curriculumId)] = product.value;
          toast.add({
            severity: "success",
            summary: "修改成功",
            detail: response.data.message,
            life: 3000,
          });
        } else {
          toast.add({
            severity: "error",
            summary: "错误",
            detail: response.data.message,
            life: 3000,
          });
        }
      });
    } else {
      request({
        url: "/addCurriculumData",
        method: "POST",
        data: product.value,
      }).then((response) => {
        if (response.data.code === 200) {
          toast.add({
            severity: "success",
            summary: "新增成功",
            detail: response.data.message,
            life: 3000,
          });
          getCourseData();
        } else {
          toast.add({
            severity: "error",
            summary: "错误",
            detail: response.data.message,
            life: 3000,
          });
        }
      });
    }
    productDialog.value = false;
    product.value = {};
  }
};

const editProduct = (editProduct) => {
  product.value = { ...editProduct };
  productDialog.value = true;
};

const confirmDeleteProduct = (editProduct) => {
  product.value = editProduct;
  deleteProductDialog.value = true;
};

const deleteProduct = () => {
  request({
    url: "/deleteCurriculumData",
    method: "POST",
    data: [product.value.curriculumId],
  }).then((response) => {
    if (response.data.code === 200) {
      getCourseData();
      toast.add({
        severity: "success",
        summary: "删除成功",
        detail: response.data.message,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "错误",
        detail: response.data.message,
        life: 3000,
      });
    }
  });
  deleteProductDialog.value = false;
  product.value = {};
};

const exportCSV = () => {
  dt.value.exportCSV();
};

const deleteSelectedProducts = () => {
  request({
    url: "/deleteCurriculumData",
    method: "POST",
    data: [
      ...selectedProducts.value.map(
        (selectedProduct) => selectedProduct.curriculumId
      ),
    ],
  }).then((response) => {
    if (response.data.code === 200) {
      getCourseData();
      toast.add({
        severity: "success",
        summary: "删除成功",
        detail: response.data.message,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "错误",
        detail: response.data.message,
        life: 3000,
      });
    }
  });
  deleteProductsDialog.value = false;
  selectedProducts.value = null;
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card p-0 pt-5 pl-5 pr-5 pb-2">
        <Toast />
        <Toolbar class="mb-4">
          <template v-slot:start>
            <div
              class="flex flex-column md:flex-row md:justify-content-between md:align-items-center"
            >
              <div class="font-bold text-2xl">课程数据</div>
              <span class="block mt-2 md:mt-0 ml-4 p-input-icon-left">
                <i class="pi pi-search" />
                <InputText
                  v-model="filters['global'].value"
                  placeholder="搜索..."
                />
              </span>
            </div>
          </template>

          <template v-slot:end>
            <Button
              class="p-button-success mr-2"
              icon="pi pi-plus"
              label="新增课程数据"
              @click="addCurriculumData"
            />
            <Button
              :disabled="!selectedProducts || !selectedProducts.length"
              class="p-button-danger mr-2"
              icon="pi pi-trash"
              label="删除课程数据"
              @click="deleteProductsDialog = true"
            />
            <Button
              class="p-button-help mr-2"
              icon="pi pi-upload"
              label="导出课程数据"
              @click="exportCSV"
            />
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          v-model:selection="selectedProducts"
          :filters="filters"
          :loading="loading"
          :paginator="true"
          :rows="10"
          :rowsPerPageOptions="[10, 15, 20]"
          :value="courseData"
          currentPageReportTemplate="正在展示第 {first} 至 {last} 条记录，共 {totalRecords} 条记录"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          responsiveLayout="scroll"
        >
          <Column headerStyle="width: 3rem" selectionMode="multiple"></Column>
          <Column
            :sortable="true"
            class="vertical-align-middle"
            field="courseId"
            header="课程ID"
            headerStyle="width:5%; min-width:10rem;"
          >
            <template #body="slotProps">
              <div class="font-bold text-lg text-center">
                #{{ slotProps.data.courseId }}
              </div>
            </template>
          </Column>
          <Column
            class="vertical-align-middle"
            field="courseName"
            header="课程名称"
            headerStyle="width:30%; min-width:10rem;"
          >
            <template #body="slotProps">
              <div class="font-bold text-lg text-center">
                {{ slotProps.data.courseName }}
              </div>
            </template>
          </Column>
          <Column
            field="courseVenue"
            header="上课地点"
            headerStyle="width:30%; min-width:8rem;"
          >
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.courseVenue }}
              </div>
            </template>
          </Column>
          <Column header="课程头像" headerStyle="width:15%; min-width:10rem;">
            <template #body="slotProps">
              <div class="flex ml-5 flex-row justify-content-center">
                <Avatar
                  :image="avatarList[slotProps.data.courseId - 1]"
                  shape="circle"
                  size="xlarge"
                />
              </div>
            </template>
          </Column>
          <Column
            :sortable="true"
            header="专业"
            headerStyle="width:10%; min-width:10rem;"
          >
            <template #body="slotProps">
              <div class="flex justify-content-center">
                <Tag
                  :icon="
                    slotProps.data.courseSpecialized
                      ? 'pi pi-check'
                      : 'pi pi-times'
                  "
                  :severity="
                    slotProps.data.courseSpecialized ? 'success' : 'danger'
                  "
                  :value="
                    slotProps.data.courseSpecialized ? '专业课' : '公共课'
                  "
                  rounded
                ></Tag>
              </div>
            </template>
          </Column>
          <Column
            field="teacherName"
            header="编辑"
            headerStyle="width:10%;min-width:10rem;"
          >
            <template #body="slotProps">
              <div class="flex justify-content-center">
                <Button
                  aria-label="Filter"
                  icon="pi pi-pencil"
                  rounded
                  text
                  @click="editProduct(slotProps.data)"
                />
                <Button
                  aria-label="Cancel"
                  icon="pi pi-times"
                  rounded
                  severity="danger"
                  text
                  @click="confirmDeleteProduct(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <Dialog
          v-model:visible="productDialog"
          :modal="true"
          class="p-fluid w-3"
        >
          <template #header>
            <div v-if="product.curriculumId" class="p-dialog-title">
              修改课程推送队列数据
            </div>
            <div v-else class="p-dialog-title">新增课程推送队列数据</div>
          </template>
          <img
            v-if="product.curriculumId"
            :alt="product.image"
            :src="avatarList[product.courseId - 1]"
            class="mt-0 mx-auto mb-5 block shadow-2"
            width="150"
          />
          <h5>{{ product.value }}</h5>

          <div class="field">
            <label for="name">课程名称</label>
            <Dropdown
              id="courseName"
              v-model="product.courseName"
              :options="courseData"
              optionLabel="courseName"
              optionValue="courseName"
              placeholder="选择课程名称"
            ></Dropdown>
          </div>
          <div class="field">
            <label for="name">教师名称</label>
            <Dropdown
              id="teacherName"
              v-model="product.teacherName"
              :options="teacherData"
              optionLabel="teacherName"
              optionValue="teacherName"
              placeholder="选择教师名称"
            ></Dropdown>
          </div>

          <div class="formgrid grid">
            <div class="field col">
              <label for="quantity">上课地点</label>
              <InputText
                id="courseVenue"
                v-model="product.courseVenue"
                integeronly
              />
            </div>
            <div class="field col">
              <label for="quantity">专业</label>
              <ToggleButton
                v-model="product.courseSpecialized"
                offLabel="False"
                onLabel="True"
              />
            </div>
          </div>

          <div class="formgrid grid">
            <div class="field col">
              <label for="quantity">课程周期</label>
              <InputNumber
                id="quantity"
                v-model="product.curriculumPeriod"
                integeronly
              />
            </div>
            <div class="field col">
              <label for="quantity">课程星期</label>
              <InputNumber
                id="quantity"
                v-model="product.curriculumWeek"
                integeronly
              />
            </div>
            <div class="field col">
              <label for="quantity">课程节次</label>
              <InputNumber
                id="quantity"
                v-model="product.curriculumSection"
                integeronly
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

        <Dialog
          v-model:visible="deleteProductDialog"
          :modal="true"
          class="w-auto"
          header="确认删除吗?"
        >
          <div class="flex align-items-center justify-content-left mt-3">
            <i class="pi pi-exclamation-triangle mr-3 text-3xl" />
            <span v-if="product"
              >确认要删除课程名称为
              <b>{{ product.courseName }} </b> 的课程推送队列数据吗?</span
            >
          </div>
          <template #footer>
            <Button
              class="p-button-text"
              icon="pi pi-times"
              label="没有"
              @click="deleteProductDialog = false"
            />
            <Button
              class="p-button-text"
              icon="pi pi-check"
              label="是的"
              @click="deleteProduct"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteProductsDialog"
          :modal="true"
          class="w-3"
        >
          <template #header>
            <div
              v-if="selectedProducts.length === curriculumData.length"
              class="p-dialog-title"
            >
              你正在执行很危险的操作！
            </div>
            <div v-else class="p-dialog-title">
              你确认要删除这些课程推送队列数据吗?
            </div>
          </template>
          <div class="flex align-items-center justify-content-left mt-3">
            <i class="pi pi-exclamation-triangle mr-3 text-3xl" />
            <span v-if="selectedProducts.length === curriculumData.length"
              >你确认要删除
              <b>全部(共{{ selectedProducts.length }}条记录)</b>
              的课程推送队列数据吗?</span
            >
            <span v-else
              >你选中了
              <b>{{ selectedProducts.length }}</b>
              条记录<br />确认要删除这些课程推送队列数据吗?</span
            >
          </div>
          <template #footer>
            <Button
              class="p-button-text"
              icon="pi pi-times"
              label="没有"
              @click="deleteProductsDialog = false"
            />
            <Button
              class="p-button-text"
              icon="pi pi-check"
              label="是的"
              @click="deleteSelectedProducts"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/badges";

//表格表头居中
:deep(.p-column-header-content) {
  justify-content: center;
}
</style>

<script setup>
import { FilterMatchMode } from "primevue/api";
import { ref, onBeforeMount } from "vue";
import request from "@/service/request";
import { useToast } from "primevue/usetoast";
import { getAvatar } from "@/service/globalFunctions";

const toast = useToast();
const dt = ref(null);
const selectedProducts = ref(null);
const loading = ref(true);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const deleteProductsDialogFailed = ref(false);
const product = ref({});
const filters = ref({});

let courseDataList = ref([]);
let avatarList = ref([]);
let deleteProductsDialogFailedMessage = ref([]);

onBeforeMount(() => {
  initFilters();
  getCourseData().then((response) => {
    if (response.data.code === 200) {
      toast.add({
        severity: "success",
        summary: "数据加载成功",
        detail: response.data.message,
        life: 3000
      });
    }
  });

});

function getCourseData() {
  loading.value = true;
  return request({
    url: "/getCourseData",
    method: "GET"
  })
    .then(async (response) => {
      if (response.data.code !== 200) {
        toast.add({
          severity: "error",
          summary: "数据加载失败",
          detail: response.data.message,
          life: 3000
        });
        return Promise.reject({
          response: { data: { code: -1, message: response.data.message } }
        });
      }

      courseDataList.value = response.data.data.courseDataList;

      for (const courseData of courseDataList.value) {
        await getAvatar(courseData.courseId, "courseAvatar")
          .then(response => {
            if (response.data.code === 200) {
              avatarList.value[courseData.courseId - 1] = response.data.data.avatar;
            }
          })
          .catch(error => {
            toast.add({
              severity: "error",
              summary: "网络错误",
              detail: error.message,
              life: 3000
            })
          });
      }

      loading.value = false;
      return response;
    })
    .catch((error) => {
      toast.add({
        severity: "error",
        summary: "网络异常",
        detail: error.message,
        life: 3000
      });
      // 失败情况下返回约定错误格式（例如 code 字段为 -1）
      return Promise.reject({
        response: { data: { code: -1, message: error.message } }
      });
    });
}

const addCourseData = () => {
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
    if (product.value.courseId) {
      request({
        url: "/updateCourseData",
        method: "POST",
        data: product.value
      }).then((response) => {
        if (response.data.code === 200) {
          getCourseData();
          toast.add({
            severity: "success",
            summary: response.data.message,
            detail: response.data.description,
            life: 3000
          });
        } else {
          toast.add({
            severity: "error",
            summary: response.data.message,
            detail: response.data.description,
            life: 3000
          });
        }
      });
    } else {
      request({
        url: "/addCourseData",
        method: "POST",
        data: product.value
      }).then((response) => {
        if (response.data.code === 200) {
          toast.add({
            severity: "success",
            summary: response.data.message,
            detail: response.data.description,
            life: 3000
          });
          getCourseData();
        } else {
          toast.add({
            severity: "error",
            summary: response.data.message,
            detail: response.data.description,
            life: 3000
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

const exportCSV = () => {
  dt.value.exportCSV();
  toast.add({
    severity: "info",
    summary: "已将数据导出，请查看下载列表",
    detail: "若输出导出失败，请更换浏览器重试",
    life: 3000
  });
};

const deleteSelectedProducts = (courseId) => {
  request({
    url: "/deleteCourseData",
    method: "POST",
    data: courseId
  }).then((response) => {
    if (response.data.code === 200) {
      getCourseData();
      toast.add({
        severity: "success",
        summary: response.data.message,
        detail: response.data.description,
        life: 3000
      });
    } else {
      deleteProductsDialogFailed.value = true;
      deleteProductsDialogFailedMessage.value = response.data.data;
    }
  });
  deleteProductsDialog.value = false;
  deleteProductDialog.value = false;
  selectedProducts.value = null;
  product.value = {};
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  };
};

function uploadAvatar(event) {

  const formData = new FormData();

  formData.append("file", event.files[0]);
  formData.append("avatarId", product.value.courseId);
  formData.append("avatarType", "courseAvatar");

  request({
    url: "/uploadAvatar",
    method: "POST",
    data: formData
  })
    .then(response => {
      hideDialog();
      if (response.data.code === 200) {
        getCourseData();
        toast.add({
          severity: "success",
          summary: response.data.message,
          detail: response.data.description,
          life: 3000
        });
      } else {
        toast.add({
          severity: "error",
          summary: response.data.message,
          detail: response.data.description,
          life: 3000
        });
      }
    });

}
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
              @click="addCourseData"
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
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 15, 20]"
          :value="courseDataList"
          currentPageReportTemplate="正在展示第 {first} 至 {last} 条记录，共 {totalRecords} 条记录"
          loadingIcon="pi pi-spin pi-cog"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          responsiveLayout="scroll"
        >
          <Column headerStyle="width: 3rem" selectionMode="multiple"></Column>
          <Column
            sortable
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
                  v-if="avatarList[slotProps.data.courseId - 1]"
                  :image="avatarList[slotProps.data.courseId - 1]"
                  shape="circle"
                  size="xlarge"
                />
                <Avatar v-else :label="slotProps.data.courseName.charAt(0)" class="mr-2" shape="circle"
                        size="xlarge"></Avatar>
              </div>
            </template>
          </Column>
          <Column
            sortable
            field="courseSpecialized"
            header="课程类别"
            headerStyle="width:10%; min-width:10rem;"
          >
            <template #body="slotProps">
              <div class="flex justify-content-center">
                <Tag
                  :icon="
                    slotProps.data.courseSpecialized
                      ? 'pi pi-star'
                      : 'pi pi-send'
                  "
                  :severity="
                    slotProps.data.courseSpecialized ? 'info' : 'success'
                  "
                  :value="
                    slotProps.data.courseSpecialized ? '专业课程' : '公共课程'
                  "
                  rounded
                ></Tag>
              </div>
            </template>
          </Column>
          <Column
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
          modal
          class="p-fluid w-3"
        >
          <template #header>
            <div v-if="product.courseId" class="p-dialog-title">
              修改课程数据
            </div>
            <div v-else class="p-dialog-title">新增课程数据</div>
          </template>
          <img
            v-if="product.courseId&&avatarList[product.courseId - 1]"
            :alt="product.image"
            :src="avatarList[product.courseId - 1]"
            class="mt-0 mx-auto mb-5 block shadow-2"
            width="150"
          />
          <div class="field">
            <label>课程名称</label>
            <InputText
              id="courseVenue"
              v-model="product.courseName"
              integeronly
            />
          </div>

          <div class="formgrid grid">
            <div class="field col">
              <label>上课地点</label>
              <InputText
                id="courseVenue"
                v-model="product.courseVenue"
                integeronly
              />
            </div>
            <div class="field col">
              <label>课程类别</label>
              <ToggleButton
                v-model="product.courseSpecialized"
                offLabel="公共课程"
                onLabel="专业课程"
              />
            </div>
          </div>
          <template #footer>
            <div class="flex">
              <div v-if="product.courseId" class="flex justify-content-start">
                <FileUpload accept="image/*" auto chooseLabel="上传头像" class="p-button-text"
                            customUpload mode="basic" @uploader="uploadAvatar($event)" />
              </div>
              <div class="flex ml-auto justify-content-end">
                <Button
                  class="p-button-text"
                  icon="pi pi-times"
                  label="返回"
                  @click="hideDialog"
                />
                <Button
                  class="p-button-text m-0"
                  icon="pi pi-check"
                  label="保存修改"
                  @click="saveProduct"
                />
              </div>
            </div>
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteProductDialog"
          modal
          class="w-auto"
          header="确认删除吗?"
        >
          <div class="flex align-items-center justify-content-left mt-3">
            <i class="pi pi-exclamation-triangle mr-3 text-3xl" />
            <span v-if="product"
            >确认要删除课程名称为
              <b>{{ product.courseName }} </b> 的课程数据吗?</span
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
              @click="deleteSelectedProducts([product.courseId])"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteProductsDialog"
          modal
          class="w-3"
        >
          <template #header>
            <div
              v-if="selectedProducts.length === courseDataList.length"
              class="p-dialog-title"
            >
              你正在执行很危险的操作！
            </div>
            <div v-else class="p-dialog-title">
              你确认要删除这些课程数据吗?
            </div>
          </template>
          <div class="flex align-items-center justify-content-left mt-3">
            <i class="pi pi-exclamation-triangle mr-3 text-3xl" />
            <span v-if="selectedProducts.length === courseDataList.length"
            >你确认要删除
              <b>全部(共{{ selectedProducts.length }}条记录)</b>
              的课程数据吗?</span
            >
            <span v-else
            >你选中了
              <b>{{ selectedProducts.length }}</b>
              条记录<br />确认要删除这些课程数据吗?</span
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
              @click="deleteSelectedProducts(selectedProducts.map(
        (selectedProduct) => selectedProduct.courseId
      ))"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="deleteProductsDialogFailed"
          modal
          class="w-auto"
          header="课程数据删除失败"
        >
          <div class="flex justify-content-left mt-3 mr-5 ml-5">
            <i class="pi pi-exclamation-triangle text-3xl mr-6 mt-0" />
            <div>
              <div v-for="message in deleteProductsDialogFailedMessage" class="font-bold text-lg text-center text-left">
                {{ message }}<br><br></div>
            </div>
          </div>

          <template #footer>
            <Button
              class="p-button-text"
              icon="pi pi-check"
              label="我已了解"
              @click="deleteProductsDialogFailed = false"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/badges";
</style>

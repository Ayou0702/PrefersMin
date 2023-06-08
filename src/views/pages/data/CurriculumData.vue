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
const resetCurriculumDataDialog = ref(false);
const product = ref({});
const filters = ref({});

let curriculumDataList = ref([]);
let courseData = ref([]);
let courseNameGroup = ref([]);
let teacherData = ref([]);
let teacherNameGroup = ref([]);
let avatarList = ref([]);

onBeforeMount(async () => {
  initFilters();
  await getCurriculumData().then((response) => {
    if (response.data.code === 200) {
      toast.add({
        severity: "success",
        summary: "数据加载成功",
        detail: response.data.message,
        life: 3000
      });
    }
  });
  await getCourseData();
  await getTeacherData();
});

const getCourseData = () => {
  request({
    url: "/getCourseData",
    method: "GET"
  }).then((response) => {
    if (response.data.code !== 200) {
      toast.add({
        severity: "error",
        summary: "数据加载失败",
        detail: response.data.message,
        life: 3000
      });
    }
    courseData.value = response.data.data;
    courseNameGroup.value.push({
      label: "专业课程",
      items: courseData.value.filter(item => item.courseSpecialized === true)
    });
    courseNameGroup.value.push({
      label: "公共课程",
      items: courseData.value.filter(item => item.courseSpecialized === false)
    });
  });
};

const getTeacherData = () => {
  request({
    url: "/getTeacherData",
    method: "GET"
  }).then((response) => {
    if (response.data.code !== 200) {
      toast.add({
        severity: "error",
        summary: "数据加载失败",
        detail: response.data.message,
        life: 3000
      });
    }
    teacherData.value = response.data.data;
    teacherNameGroup.value.push({
      label: "专业教师",
      items: teacherData.value.filter(item => item.teacherSpecialized === true)
    });
    teacherNameGroup.value.push({
      label: "公共教师",
      items: teacherData.value.filter(item => item.teacherSpecialized === false)
    });
  });
};

function getCurriculumData() {
  loading.value = true;
  return request({
    url: "/getAllNowCurriculumData",
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

      curriculumDataList.value = response.data.data;

      const courseIdList = [
        ...new Set(curriculumDataList.value.map((item) => item.courseId))
      ];

      for (const courseId of courseIdList) {
        await getAvatar(courseId, "courseAvatar")
          .then(response => {
            if (response.data.code === 200) {
              avatarList.value[courseId - 1] = response.data.data;
            } else {
              toast.add({
                severity: "warn",
                summary: response.data.message,
                detail: response.data.data,
                life: 3000
              });
            }
          })
          .catch(error => {
            toast.add({
              severity: "error",
              summary: "网络错误",
              detail: error.message,
              life: 3000
            });
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
        data: product.value
      }).then((response) => {
        if (response.data.code === 200) {
          getCurriculumData();
          toast.add({
            severity: "success",
            summary: "修改成功",
            detail: response.data.message,
            life: 3000
          });
        } else {
          toast.add({
            severity: "error",
            summary: "错误",
            detail: response.data.message,
            life: 3000
          });
        }
      });
    } else {
      request({
        url: "/addCurriculumData",
        method: "POST",
        data: product.value
      }).then((response) => {
        if (response.data.code === 200) {
          toast.add({
            severity: "success",
            summary: response.data.message,
            detail: response.data.data,
            life: 3000
          });
          getCurriculumData();
        } else {
          toast.add({
            severity: "error",
            summary: response.data.message,
            detail: response.data.data,
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

const deleteSelectedProducts = (curriculumId) => {
  request({
    url: "/deleteCurriculumData",
    method: "POST",
    data: curriculumId
  }).then((response) => {
    if (response.data.code === 200) {
      getCurriculumData();
      toast.add({
        severity: "success",
        summary: response.data.message,
        detail: response.data.data,
        life: 3000
      });
    } else {
      toast.add({
        severity: "error",
        summary: response.data.message,
        detail: response.data.data,
        life: 3000
      });
    }
  });
  deleteProductsDialog.value = false;
  deleteProductDialog.value = false;
  selectedProducts.value = null;
  product.value = {};
};

const resetCurriculumData = () => {
  request({
    url: "/resetCurriculumData",
    method: "GET"
  }).then((response) => {
    if (response.data.code === 200) {
      toast.add({
        severity: "success",
        summary: response.data.message,
        detail: response.data.data,
        life: 3000
      });
      getCurriculumData();
    } else {
      toast.add({
        severity: "error",
        summary: "重置失败",
        detail: response.data.message,
        life: 3000
      });
    }
  });
  resetCurriculumDataDialog.value = false;
};
const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
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
              <div class="font-bold text-2xl">课程推送队列</div>
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
              label="新增课程推送队列"
              @click="addCurriculumData"
            />
            <Button
              :disabled="!selectedProducts || !selectedProducts.length"
              class="p-button-danger mr-2"
              icon="pi pi-trash"
              label="删除课程推送队列"
              @click="deleteProductsDialog = true"
            />
            <Button
              class="mr-2 inline-block mr-2"
              icon="pi pi-replay"
              label="重置课程推送队列"
              @click="resetCurriculumDataDialog = true"
            />
            <Button
              class="p-button-help mr-2"
              icon="pi pi-upload"
              label="导出课程推送队列"
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
          :rows="5"
          :rowsPerPageOptions="[5, 10, 15, 20]"
          :value="curriculumDataList"
          currentPageReportTemplate="正在展示第 {first} 至 {last} 条记录，共 {totalRecords} 条记录"
          loadingIcon="pi pi-spin pi-cog"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          responsiveLayout="scroll"
        >
          <Column headerStyle="width: 3rem" selectionMode="multiple"></Column>
          <Column
            sortable
            class="vertical-align-middle"
            field="curriculumId"
            header="序列ID"
            headerStyle="width:3%; min-width:10rem;"
          >
            <template #body="slotProps">
              <div class="font-bold text-lg text-center">
                #{{ slotProps.data.curriculumId }}
              </div>
            </template>
          </Column>
          <Column
            field="courseName"
            header="课程详情"
            headerStyle="width:25%; min-width:10rem;"
          >
            <template #body="slotProps">
              <div class="flex ml-5 flex-row">
                <Avatar
                  :image="avatarList[slotProps.data.courseId - 1]"
                  shape="circle"
                  size="xlarge"
                />
                <div
                  class="ml-1 text-left pl-3 justify-content-center flex-column flex"
                >
                  <div class="font-bold text-lg text-center">
                    {{ slotProps.data.courseName }}
                  </div>
                  <div class="font-sans font-bold text-base mt-1 ml-1">
                    <text>{{ slotProps.data.teacherName }}</text>
                  </div>
                </div>
              </div>
            </template>
          </Column>
          <Column
            field="courseVenue"
            header="上课地点"
            headerStyle="width:14%; min-width:8rem;"
          >
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.courseVenue }}
              </div>
            </template>
          </Column>
          <Column
            field="curriculumPeriod"
            header="课程周期"
            headerStyle="width:10%; min-width:8rem;"
          >
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.curriculumPeriod }}
              </div>
            </template>
          </Column>
          <Column header="课程星期" headerStyle="width:10%; min-width:8rem;">
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.curriculumWeek }}
              </div>
            </template>
          </Column>
          <Column header="课程节次" headerStyle="width:10%; min-width:8rem;">
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.curriculumSection }}
              </div>
            </template>
          </Column>
          <Column
            sortable
            field="courseSpecialized"
            header="课程类别"
            headerStyle="width:8%; min-width:10rem;"
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
            field="teacherName"
            header="编辑"
            headerStyle="min-width:10rem;"
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
          <div class="field">
            <label>课程名称</label>
            <Dropdown
              id="courseName"
              v-model="product.courseName"
              :options="courseNameGroup"
              editable
              optionGroupChildren="items"
              optionGroupLabel="label"
              optionLabel="courseName"
              optionValue="courseName"
              placeholder="选择课程名称"
            >
              <template #optiongroup="slotProps">
                <div class="flex align-items-center">
                  <Tag
                    :icon="
                    slotProps.option.label === '专业课程'
                      ? 'pi pi-star'
                      : 'pi pi-send'
                  "
                    :severity="
                    slotProps.option.label === '专业课程' ? 'info' : 'success'
                  "
                    :value="
                    slotProps.option.label === '专业课程' ? '专业课程' : '公共课程'
                  "
                    rounded
                  ></Tag>
                </div>
              </template>
              <template #option="slotProp">
                <div class="ml-5">{{ slotProp.option.courseName }}</div>
              </template>
            </Dropdown>
          </div>
          <div class="field">
            <label>教师名称</label>
            <Dropdown
              id="teacherName"
              v-model="product.teacherName"
              :options="teacherNameGroup"
              editable
              optionGroupChildren="items"
              optionGroupLabel="label"
              optionLabel="teacherName"
              optionValue="teacherName"
              placeholder="选择教师名称"
            >
              <template #optiongroup="slotProps">
                <div class="flex align-items-center">
                  <Tag
                    :icon="
                    slotProps.option.label === '专业教师'
                      ? 'pi pi-star'
                      : 'pi pi-send'
                  "
                    :severity="
                    slotProps.option.label === '专业教师' ? 'info' : 'success'
                  "
                    :value="
                    slotProps.option.label === '专业教师' ? '专业教师' : '公共教师'
                  "
                    rounded
                  ></Tag>
                </div>
              </template>
              <template #option="slotProp">
                <div class="ml-5">{{ slotProp.option.teacherName }}</div>
              </template>
            </Dropdown>
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

          <div class="formgrid grid">
            <div class="field col">
              <label>课程周期</label>
              <InputNumber
                id="quantity"
                v-model="product.curriculumPeriod"
                integeronly
              />
            </div>
            <div class="field col">
              <label>课程星期</label>
              <InputNumber
                v-model="product.curriculumWeek"
                integeronly
              />
            </div>
            <div class="field col">
              <label>课程节次</label>
              <InputNumber
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
          modal
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
              @click="deleteSelectedProducts([product.curriculumId])"
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
              v-if="selectedProducts.length === curriculumDataList.length"
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
            <span v-if="selectedProducts.length === curriculumDataList.length"
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
              @click="deleteSelectedProducts(selectedProducts.map(
        (selectedProduct) => selectedProduct.curriculumId
      ))"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="resetCurriculumDataDialog"
          modal
          class="w-3"
          header="重置课程推送队列"
        >
          <div class="flex align-items-center justify-content-left mt-3">
            <i class="pi pi-exclamation-triangle mr-3 text-3xl" />
            <span>你确认要 <b>重置课程推送队列</b> 吗?</span>
          </div>
          <template #footer>
            <Button
              class="p-button-text"
              icon="pi pi-times"
              label="没有"
              @click="resetCurriculumDataDialog = false"
            />
            <Button
              class="p-button-text"
              icon="pi pi-check"
              label="是的"
              @click="resetCurriculumData"
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

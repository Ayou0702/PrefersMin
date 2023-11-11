<script setup>
import { computed, onBeforeMount, ref } from "vue";
import request from "@/service/request";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const selectedProducts = ref(null);
const loading = ref(true);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const search = ref("");

let scheduleDataList = ref([]);
let courseData = ref([]);
let courseNameGroup = ref([]);
let teacherData = ref([]);
let teacherNameGroup = ref([]);

onBeforeMount(async () => {
  const [scheduleResponse, courseResponse, teacherResponse] = await Promise.all(
    [await getScheduleData(), await getCourseData(), await getTeacherData()]
  );

  if (scheduleResponse.data.code === 200) {
    toast.add({
      severity: "success",
      summary: "数据加载成功",
      detail: scheduleResponse.data.message,
      life: 3000,
    });
  }

  if (courseResponse.data.code !== 200) {
    toast.add({
      severity: "error",
      summary: "数据加载失败",
      detail: courseResponse.data.message,
      life: 3000,
    });
  } else {
    courseData.value = courseResponse.data.data.courseDataList;
    courseNameGroup.value.push({
      label: "专业课程",
      items: courseData.value.filter((item) => item.courseSpecialized === true),
    });
    courseNameGroup.value.push({
      label: "公共课程",
      items: courseData.value.filter(
        (item) => item.courseSpecialized === false
      ),
    });
  }

  if (teacherResponse.data.code !== 200) {
    toast.add({
      severity: "error",
      summary: "数据加载失败",
      detail: teacherResponse.data.message,
      life: 3000,
    });
  } else {
    teacherData.value = teacherResponse.data.data.teacherDataList;
    teacherNameGroup.value.push({
      label: "专业教师",
      items: teacherData.value.filter(
        (item) => item.teacherSpecialized === true
      ),
    });
    teacherNameGroup.value.push({
      label: "公共教师",
      items: teacherData.value.filter(
        (item) => item.teacherSpecialized === false
      ),
    });
  }
});

function getCourseData() {
  return request({
    url: "/getCourseData",
    method: "GET",
  });
}

function getTeacherData() {
  return request({
    url: "/getTeacherData",
    method: "GET",
  });
}

function getScheduleData() {
  loading.value = true;
  return request({
    url: "/getScheduleData",
    method: "GET",
  })
    .then(async (response) => {
      if (response.data.code !== 200) {
        toast.add({
          severity: "error",
          summary: "数据加载失败",
          detail: response.data.message,
          life: 3000,
        });
        return Promise.reject({
          response: { data: { code: -1, message: response.data.message } },
        });
      }

      scheduleDataList.value = response.data.data.scheduleDataList;

      loading.value = false;
      return response;
    })
    .catch((error) => {
      toast.add({
        severity: "error",
        summary: "网络异常",
        detail: error.message,
        life: 3000,
      });
      // 失败情况下返回约定错误格式（例如 code 字段为 -1）
      return Promise.reject({
        response: { data: { code: -1, message: error.message } },
      });
    });
}

// 使用computed对课表信息进行过滤
const filterScheduleData = computed(() => {
  const searchText = search.value.toLowerCase();
  const filteredCourse = courseData.value.filter((data) => {
    return !searchText || data.courseName.toLowerCase().includes(searchText);
  });
  const filteredTeacher = teacherData.value.filter((data) => {
    return !searchText || data.teacherName.toLowerCase().includes(searchText);
  });
  return scheduleDataList.value.filter((scheduleData) => {
    return (
      filteredCourse.some(
        (course) => course.courseId === scheduleData.courseId
      ) ||
      filteredTeacher.some(
        (teacher) => teacher.teacherId === scheduleData.teacherId
      )
    );
  });
});

const addScheduleData = () => {
  product.value = {};
  productDialog.value = true;
};

const hideDialog = () => {
  productDialog.value = false;
};

const saveProduct = () => {
  if (
    product.value.schedulePeriod &&
    product.value.scheduleWeek &&
    product.value.scheduleSection
  ) {
    if (product.value.scheduleId) {
      request({
        url: "/updateScheduleData",
        method: "POST",
        data: product.value,
      }).then((response) => {
        if (response.data.code === 200) {
          getScheduleData();
          toast.add({
            severity: "success",
            summary: response.data.message,
            detail: response.data.description,
            life: 3000,
          });
        } else {
          toast.add({
            severity: "error",
            summary: response.data.message,
            detail: response.data.description,
            life: 3000,
          });
        }
      });
    } else {
      request({
        url: "/addScheduleData",
        method: "POST",
        data: product.value,
      }).then((response) => {
        if (response.data.code === 200) {
          toast.add({
            severity: "success",
            summary: response.data.message,
            detail: response.data.description,
            life: 3000,
          });
          getScheduleData();
        } else {
          toast.add({
            severity: "error",
            summary: response.data.message,
            detail: response.data.description,
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

const deleteSelectedProducts = (scheduleId) => {
  request({
    url: "/deleteScheduleData",
    method: "POST",
    data: scheduleId,
  }).then((response) => {
    if (response.data.code === 200) {
      getScheduleData();
      toast.add({
        severity: "success",
        summary: response.data.message,
        detail: response.data.description,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: response.data.message,
        detail: response.data.description,
        life: 3000,
      });
    }
  });
  deleteProductsDialog.value = false;
  deleteProductDialog.value = false;
  selectedProducts.value = null;
  product.value = {};
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
              <div class="font-bold text-2xl">课表数据</div>
              <span class="block mt-2 md:mt-0 ml-4 p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="search" placeholder="搜索..." />
              </span>
            </div>
          </template>

          <template v-slot:end>
            <Button
              class="p-button-success mr-2"
              icon="pi pi-plus"
              label="新增课表"
              @click="addScheduleData"
            />
            <Button
              :disabled="!selectedProducts || !selectedProducts.length"
              class="p-button-danger mr-2"
              icon="pi pi-trash"
              label="删除课表"
              @click="deleteProductsDialog = true"
            />
          </template>
        </Toolbar>

        <DataTable
          v-model:selection="selectedProducts"
          :loading="loading"
          :rows="10"
          :rowsPerPageOptions="[10, 15, 20]"
          :value="filterScheduleData"
          currentPageReportTemplate="正在展示第 {first} 至 {last} 条记录，共 {totalRecords} 条记录"
          loadingIcon="pi pi-spin pi-cog"
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          responsiveLayout="scroll"
        >
          <Column headerStyle="width: 3rem" selectionMode="multiple"></Column>
          <Column
            field="scheduleId"
            class="vertical-align-middle"
            header="课表ID"
            headerStyle="width:3%; min-width:10rem;"
            sortable
          >
            <template #body="slotProps">
              <div class="font-bold text-lg text-center">
                #{{ slotProps.data.scheduleId }}
              </div>
            </template>
          </Column>
          <Column header="课程名称" headerStyle="width:25%; min-width:8rem;">
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{
                  courseData.find(
                    (item) => item.courseId === slotProps.data.courseId
                  )?.courseName
                }}
              </div>
            </template>
          </Column>
          <Column header="教师名称" headerStyle="width:15%; min-width:8rem;">
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{
                  teacherData.find(
                    (item) => item.teacherId === slotProps.data.teacherId
                  )?.teacherName
                }}
              </div>
            </template>
          </Column>
          <Column header="课程周期" headerStyle="width:15%; min-width:8rem;">
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.schedulePeriod }}
              </div>
            </template>
          </Column>
          <Column header="课程星期" headerStyle="width:10%; min-width:8rem;">
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.scheduleWeek }}
              </div>
            </template>
          </Column>
          <Column header="课程节次" headerStyle="width:15%; min-width:8rem;">
            <template #body="slotProps">
              <div class="font-bold text-base text-center">
                {{ slotProps.data.scheduleSection }}
              </div>
            </template>
          </Column>
          <Column header="编辑" headerStyle="min-width:10rem;">
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

        <Dialog v-model:visible="productDialog" class="p-fluid w-3" modal>
          <template #header>
            <div v-if="product.scheduleId" class="p-dialog-title">
              修改课表数据
            </div>
            <div v-else class="p-dialog-title">新增课表数据</div>
          </template>
          <div class="field">
            <label>课程名称</label>
            <Dropdown
              id="courseName"
              v-model="product.courseId"
              :options="courseNameGroup"
              optionGroupChildren="items"
              optionGroupLabel="label"
              optionLabel="courseName"
              optionValue="courseId"
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
                      slotProps.option.label === '专业课程'
                        ? '专业课程'
                        : '公共课程'
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
              v-model="product.teacherId"
              :options="teacherNameGroup"
              optionGroupChildren="items"
              optionGroupLabel="label"
              optionLabel="teacherName"
              optionValue="teacherId"
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
                      slotProps.option.label === '专业教师'
                        ? '专业教师'
                        : '公共教师'
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
              <label>课程周期</label>
              <InputText id="quantity" v-model="product.schedulePeriod" />
            </div>
            <div class="field col">
              <label>课程星期</label>
              <InputNumber v-model="product.scheduleWeek" integeronly />
            </div>
            <div class="field col">
              <label>课程节次</label>
              <InputText v-model="product.scheduleSection" />
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
          class="w-auto"
          header="确认删除吗?"
          modal
        >
          <div class="flex align-items-center justify-content-left mt-3">
            <i class="pi pi-exclamation-triangle mr-3 text-3xl" />
            <span v-if="product"
              >确认要删除课程名称为
              <b
                >{{
                  courseData.find((item) => item.courseId === product.courseId)
                    ?.courseName
                }}
              </b>
              的课表数据吗?</span
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
              @click="deleteSelectedProducts([product.scheduleId])"
            />
          </template>
        </Dialog>

        <Dialog v-model:visible="deleteProductsDialog" class="w-3" modal>
          <template #header>
            <div
              v-if="selectedProducts.length === scheduleDataList.length"
              class="p-dialog-title"
            >
              你正在执行很危险的操作！
            </div>
            <div v-else class="p-dialog-title">你确认要删除这些课表数据吗?</div>
          </template>
          <div class="flex align-items-center justify-content-left mt-3">
            <i class="pi pi-exclamation-triangle mr-3 text-3xl" />
            <span v-if="selectedProducts.length === scheduleDataList.length"
              >你确认要删除
              <b>全部(共{{ selectedProducts.length }}条记录)</b>
              的课表数据吗?</span
            >
            <span v-else
              >你选中了
              <b>{{ selectedProducts.length }}</b>
              条记录<br />确认要删除这些课表数据吗?</span
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
              @click="
                deleteSelectedProducts(
                  selectedProducts.map(
                    (selectedProduct) => selectedProduct.scheduleId
                  )
                )
              "
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

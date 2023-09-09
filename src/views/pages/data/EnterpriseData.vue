<script setup>
import { onBeforeMount, ref } from "vue";
import request from "@/service/request";
import { useToast } from "primevue/usetoast";
import enterpriseDataForm from "@/components/EnterpriseDataForm.vue";
import passwordInput from "@/components/PasswordInput.vue";

const toast = useToast();

let enterpriseDataList = ref([]);

onBeforeMount(() => {
  getEnterpriseData().then((response) => {
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

function getEnterpriseData() {
  return request({
    url: "/getEnterpriseData",
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

      enterpriseDataList.value = response.data.data;

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

function update() {
  request({
    url: "/updateEnterpriseData",
    method: "POST",
    data: enterpriseDataList.value
  }).then((response) => {
    if (response.data.code === 200) {
      getEnterpriseData();
      toast.add({
        severity: "success",
        detail: response.data.message,
        summary: "修改成功",
        life: 3000
      });
    } else {
      toast.add({
        severity: "error",
        detail: response.data.message,
        summary: "修改失败",
        life: 3000
      });
    }
  });
}
</script>

<template>
  <div class="grid">
    <div class="col-12 md:col-6">
      <Toast />
      <div class="card p-fluid">
        <h5>API配置</h5>
        <div class="formgrid grid">
          <passwordInput :data="enterpriseDataList.find(data => data.dataName === 'tianApiKey')" />
        </div>
        <div class="formgrid grid">
          <passwordInput :data="enterpriseDataList.find(data => data.dataName === 'amapKey')" />
        </div>
      </div>

      <div class="card p-fluid">
        <h5>调试数据</h5>
        <div class="formgrid grid">
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'debugPeriod')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'debugWeek')" />
        </div>
        <div class="formgrid grid">
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'debugPushMode')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'debugUser')" />
        </div>
      </div>

      <div class="card p-fluid">
        <h5>推送数据</h5>
        <div class="formgrid grid">
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'departmentId')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'weatherValue')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'pushMode')" />
        </div>
        <div class="formgrid grid">
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'url')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'imgUrl')" />
        </div>
      </div>
    </div>

    <div class="col-12 md:col-6">

      <div class="card p-fluid">
        <h5>企业微信</h5>
        <div class="formgrid grid">
          <passwordInput :data="enterpriseDataList.find(data => data.dataName === 'corpId')" />
        </div>
        <div class="formgrid grid">
          <passwordInput :data="enterpriseDataList.find(data => data.dataName === 'agentId')" />
        </div>
        <div class="formgrid grid">
          <passwordInput :data="enterpriseDataList.find(data => data.dataName === 'secret')" />
        </div>
      </div>

      <div class="card p-fluid">
        <h5>统计数据</h5>
        <div class="formgrid grid">
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'morningClassDays')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'nightClassDays')" />
        </div>
        <div class="formgrid grid">
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'totalClassTimes')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'totalSpecializedClassTimes')" />
        </div>
        <div class="formgrid grid">
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'dateStarting')" />
          <enterpriseDataForm :data="enterpriseDataList.find(data => data.dataName === 'dateEnding')" />
        </div>
      </div>

      <div class="card  p-fluid flex justify-content-center">

        <Button
          class="p-button-danger mr-2"
          icon="pi pi-trash"
          label="清空所有"
        />
        <Button
          class="p-button-info mr-2"
          icon="pi pi-download"
          label="通过CSV导入"
        />
        <Button
          class="p-button-help mr-2"
          icon="pi pi-upload"
          label="导出到CSV"
        />
        <Button
          class="p-button-success mr-2"
          icon="pi pi-check"
          label="确认修改"
          @click="update"
        />
      </div>

    </div>
  </div>
</template>

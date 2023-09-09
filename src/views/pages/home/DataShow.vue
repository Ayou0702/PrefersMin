<script setup>
import { onBeforeMount, ref } from "vue";
import request from "@/service/request";
import { useToast } from "primevue/usetoast";

const toast = useToast();
let statisticalDataList = ref([]);
const a = ref("");

onBeforeMount(() => {
  getStatisticalData().then((response) => {
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

function getStatisticalData() {
  return request({
    url: "/getStatisticalData",
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

      statisticalDataList.value = response.data.data;

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

</script>

<template>
  <div class="grid">
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-semibold mb-3">什么也没做就已经开学这么久了</span>
            <div class="text-800 text-lg font-bold">今天是第 {{ statisticalDataList.dateStarting }} 天上课</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-blue-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-calendar text-blue-500 text-xl"></i>
          </div>
        </div>
        <span class="text-500 font-bold">还有 </span>
        <span class="text-green-500 font-medium">{{ statisticalDataList.dateEnding }} 天</span>
        <span class="text-500 font-bold">就能放假咯</span>
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-semibold mb-3">作业不知道还有多少</span>
            <div class="text-800 text-lg font-bold">已经上了 {{ statisticalDataList.classDays }} 天的课了</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-green-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-check-circle text-green-500 text-xl"></i>
          </div>
        </div>
        <span class="text-500 font-bold">其中有 </span>
        <span class="text-green-500 font-medium">{{ statisticalDataList.morningClassDays }} 天</span>
        <span class="text-500 font-bold">的早课、 </span>
        <span class="text-green-500 font-medium">{{ statisticalDataList.nightClassDays }} 天</span>
        <span class="text-500 font-bold">的晚课</span>
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-semibold mb-3">好想回家啊</span>
            <div class="text-800 text-lg font-bold">已经上了 {{ statisticalDataList.totalClassTimes }} 节课了</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-cyan-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-bolt text-cyan-500 text-xl"></i>
          </div>
        </div>
        <span class="text-500 font-bold">其中有 </span>
        <span class="text-green-500 font-medium">{{ statisticalDataList.totalSpecializedClassTimes }} 节</span>
        <span class="text-500 font-bold">的专业课</span>
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card mb-0">
        <div class="flex justify-content-between mb-3">
          <div>
            <span class="block text-500 font-semibold mb-3">{{ statisticalDataList?.weather?.state ? '明天':'今天' }}可以出去玩吗</span>
            <div class="text-800 text-lg font-bold">
              {{ statisticalDataList?.weather?.area}}{{ statisticalDataList?.weather?.state ? '明天':'今天' }}的天气是：{{ statisticalDataList?.weather?.weather }}</div>
          </div>
          <div class="flex align-items-center justify-content-center bg-purple-100 border-round"
               style="width: 2.5rem; height: 2.5rem">
            <i class="pi pi-cloud text-purple-500 text-xl"></i>
          </div>
        </div>
        <span class="text-500 font-bold">最高温度 </span>
        <span class="text-green-500 font-medium">{{ statisticalDataList?.weather?.highest }}</span>
        <span class="text-500 font-bold">、最低温度 </span>
        <span class="text-green-500 font-medium">{{ statisticalDataList?.weather?.lowest }} </span>
      </div>
    </div>
  </div>
</template>

<style>

</style>

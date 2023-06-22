<script setup>
import { ref } from "vue";
import request from "@/service/request";

const fileInfos = ref([]);
const layout = ref("grid");
const shibboleth = ref("");

function download() {

  fileInfos.value.length = 0;
  request({
    url: "https://xt.guxitk.com/api/merchant/authorByCode",
    method: "GET",
    params: {
      code: shibboleth.value
    },
    headers: {
      "businessid": "1"
    }
  })
    .then(response => {

      const author_id = response.data.data.codeInfo.author_id;
      const user_id = response.data.data.codeInfo.user_id;
      const merchant_id = response.data.data.codeInfo.merchant_id;

      request({
        url: "https://xt.guxitk.com/api/merchant/authorInfoById",
        method: "GET",
        params: {
          "merchant_id": merchant_id,
          "user_id": user_id,
          "id": author_id,
          "code": shibboleth.value
        },
        headers: {
          "businessid": "1"
        }
      })
        .then(response => {

          const artworksType = ref([]);

          artworksType.value = response.data.data.artworksType;

          artworksType.value.forEach(artworksType => {

            request({
              // url: "https://xt.guxitk.com/api/artworks/albumListByAuthorId",
              url: "https://xt.guxitk.com/api/artworks/artworksListByAuthorId",
              method: "GET",
              params: {
                "merchant_id": merchant_id,
                "user_id": user_id,
                "author_id": author_id,
                "pageNum": "1",
                "pageSize": "999",
                "sort_type": "1",
                "type": artworksType.id
              },
              headers: {
                "businessid": "1"
              }
            })
              .then(response => {

                const records = ref([]);

                records.value = response.data.data.records;

                const coverUrlList = records.value.map((record) => record.cover_url);

                updatePreviews(coverUrlList);
              });

          });

        });

    });

}

const updatePreviews = async (coverUrlList) => {
  coverUrlList.map(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    fileInfos.value[coverUrlList.indexOf(url)] = ({
      name: url.substring(url.lastIndexOf("-") + 1),
      size: `${img.width}x${img.height}`,
      suffix: url.substring(url.lastIndexOf(".") + 1).toUpperCase(),
      link: url,
      previewEnabled: img
    });
  });
  console.log(fileInfos.value);
};

function downloadPic(link, name) {
  console.log(link)
  // 创建 XMLHttpRequest 对象
  const xhr = new XMLHttpRequest();

  // 设置请求方法和请求地址
  xhr.open('GET', link);

  // 设置 responseType 属性为 blob 对象
  xhr.responseType = 'blob';

  // 请求成功后触发的事件
  xhr.onload = () => {
    // 创建 blob 对象
    const blob = new Blob([xhr.response], {type: "application/octet-stream"});

    // 创建 <a> 标签用于下载文件
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = name || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }
  // 发送请求
  xhr.send();
}
</script>

<template>
  <div class="card">
    <div class="grid grid-nogutter">
      <div class="col-6 text-left flex flex-row">
        <div class="p-inputgroup w-8 mr-3">
          <InputText
            v-model="shibboleth"
            placeholder="输入你要批量下载的作者口令" />
          <Button label="检索" @click="download" />
        </div>
        <Button label="全部保存" @click="" />
      </div>
      <div class="col-6 text-right">
        <DataViewLayoutOptions v-model="layout" />
      </div>
    </div>
    <Divider />
    <DataView :layout="layout" :rows="fileInfos.length" :value="fileInfos">
      <template #list="slotProps">
        <div class="col-12">
          <div class="flex flex-column md:flex-row align-items-center p-3 w-full">
            <img :alt="slotProps.data.name" :src="slotProps.data.link"
                 class="my-4 md:my-0 w-9 md:w-10rem shadow-2 mr-5" />
            <div class="flex-1 text-center md:text-left">
              <div class="font-bold text-2xl">{{ slotProps.data.name }}</div>
              <div class="mb-3">{{ slotProps.data.description }}</div>
              <div class="flex align-items-center">
                <i class="pi pi-tag mr-2"/>
                <span class="font-semibold">{{ slotProps.data.suffix }}</span>
              </div>
            </div>
            <div
              class="flex flex-row md:flex-column justify-content-between w-full md:w-auto align-items-center md:align-items-end mt-5 md:mt-0">
              <span class="text-2xl font-semibold mb-2 align-self-center md:align-self-end">{{ slotProps.data.size }}</span>
              <Button class="mb-2"
                      icon="pi pi-download" label="Add to Cart"></Button>
              <span class="product-badge">{{ slotProps.data.inventoryStatus }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #grid="slotProps">
        <div class="col-12 md:col-3">
          <div class="card m-3 border-1 surface-border">
            <div class="flex align-items-center justify-content-between">
              <div class="flex align-items-center">
                <i class="pi pi-bookmark mr-2"/>
                <span class="font-semibold">{{ slotProps.data.suffix }}</span>
              </div>
              <span :class="'product-badge status-' + slotProps.data">{{ slotProps.data.size }}</span>
            </div>
            <div class="text-center">
              <img :alt="slotProps.data.name" :src="slotProps.data.link" class="w-full shadow-2 my-3 mx-0" />
            </div>
            <div class="flex align-items-center justify-content-between">
              <div class="sf">
                <i class="pi pi-tag mr-2"/>
                <span class="text-xl font-bold">{{ slotProps.data.name }}</span>
              </div>
              <Button icon="pi pi-download" @click=downloadPic(slotProps.data.link,slotProps.data.name)></Button>
            </div>
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>

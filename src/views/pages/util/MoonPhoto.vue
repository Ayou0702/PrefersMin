<script setup>
import { computed, ref } from "vue";
import request from "@/service/request";
import PhotoView from "@/components/PhotoView.vue";

const shibboleth = ref("");
const urlList = ref([]);

function download() {

  urlList.value.length = 0;
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

                urlList.value.push(...coverUrlList);
              });

          });

        });

    });

}

const show = ref(true);
const waterfallWrapper = ref(null);
const wrapperWidth = computed(() => {
  return waterfallWrapper.value.offsetWidth;
});
const wrapperHeight = ref(0);
// 间隙
const gutter = ref(20);
// 单列宽
const colWidth = ref(350);
// 列数
const cols = computed(() => {
  return Math.floor((wrapperWidth.value - gutter.value) / (colWidth.value + gutter.value));
});
// x偏移
const offsetX = computed(() => {
  const contextWidth = cols.value * (colWidth.value + gutter.value) + gutter.value;
  return (wrapperWidth.value - contextWidth) / 2;
});

function layout() {
  // 初始化 y 集合
  const posY = new Array(cols.value).fill(gutter.value);
  // 节点
  const items = document.querySelectorAll(".waterfall-item");
  // 遍历
  for (let i = 0; i < items.length; i++) {
    const curItem = items[i];
    // 最小的y值
    const minY = Math.min.apply(null, posY);
    // 最小y的下标
    const minYIndex = posY.indexOf(minY);
    // 当前下标对应的x
    const curX = gutter.value * (minYIndex + 1) + colWidth.value * minYIndex + offsetX.value;
    // 设置偏移
    curItem.style.transform = `translate3d(${curX}px,${minY}px, 0)`;
    curItem.style.width = `${colWidth.value}px`;
    // 更新当前index的y值
    const height = curItem.offsetHeight;
    posY[minYIndex] += height + gutter.value;
  }

  // 设置容器高度
  wrapperHeight.value = Math.max.apply(null, posY);

}

const imageLoad = () => {
  layout();
};
</script>

<template>
  <div class="card">
    <div class="grid grid-nogutter">
      <div class="w-5 col-6 text-left flex flex-row">
        <div class="p-inputgroup w-8 mr-3">
          <InputText
            v-model="shibboleth"
            placeholder="输入你要批量下载的作者口令" />
          <Button label="检索" @click="download" />
        </div>
        <Button label="全部保存" @click="" />
      </div>
    </div>
    <Divider />

    <perfect-scrollbar :disabled="show">
      <div ref="waterfallWrapper" :style="{ height: `${wrapperHeight}px` }" style="position: relative;">
        <keep-alive>
          <div v-for="item in urlList" class="waterfall-item absolute">
            <PhotoView :url="item" @load="imageLoad" />
          </div>
        </keep-alive>
      </div>
    </perfect-scrollbar>
  </div>
</template>

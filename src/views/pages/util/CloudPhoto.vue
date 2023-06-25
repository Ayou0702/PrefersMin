<script setup>
import { computed, onMounted, ref } from "vue";
import request from "@/service/request";
import PhotoView from "@/components/PhotoView.vue";

const shibboleth = ref("");
const urlList = ref({
  wallpaper: [],
  avatar: [],
  liveWallpaper: [],
  backgroundImage: [],
  toolPlay: [],
  ai: []
});
const typeN = ref("wallpaper");
const wrapperWidth = ref(0);
const wrapperHeight = ref(0);
const gutter = ref(20);
const colWidth = ref(350);
const offsetX = computed(() => {
  const contextWidth = cols.value * (colWidth.value + gutter.value) + gutter.value;
  return (wrapperWidth.value - contextWidth) / 2;
});

const cols = computed(() => Math.floor((wrapperWidth.value - gutter.value) / (colWidth.value + gutter.value)));
const show = ref(true);
const waterfallWrapper = ref(null);

function layout() {
  const posY = new Array(cols.value).fill(gutter.value);
  const items = document.querySelectorAll(".waterfall-item");
  items.forEach((curItem) => {
    const minY = Math.min(...posY);
    const minYIndex = posY.indexOf(minY);
    const curX = gutter.value * (minYIndex + 1) + colWidth.value * minYIndex + offsetX.value;
    curItem.style.transform = `translate3d(${curX}px,${minY}px, 0)`;
    curItem.style.width = `${colWidth.value}px`;
    const height = curItem.offsetHeight;
    posY[minYIndex] += height + gutter.value;
  });

  wrapperHeight.value = Math.max(...posY);
}

const imageLoad = () => {
  layout();
};

async function download() {
  urlList.value = {
    wallpaper: [],
    avatar: [],
    liveWallpaper: [],
    backgroundImage: [],
    toolPlay: [],
    ai: []
  };
  const { data } = await request({
    url: "/getCloudPhoto",
    method: "POST",
    params: {
      code: shibboleth.value
    }
  });
  Object.keys(data.data).forEach((type) => {
    urlList.value[type].push(...data.data[type]);
  });
}

onMounted(() => {
  wrapperWidth.value = waterfallWrapper.value.offsetWidth;
});

function updateUrlList(type) {
  typeN.value = type;
}

</script>

<template>
  <div class="card">
    <div class="flex">
      <div class="w-5 flex justify-content-start">
        <div class="p-inputgroup w-8 mr-3">
          <InputText v-model="shibboleth" placeholder="输入你要批量下载的作者口令" />
          <Button label="检索" @click="download" />
        </div>
        <Button label="全部保存" @click="" />
      </div>
      <div class="flex ml-auto justify-content-end">
        <div class="p-inputgroup">
          <Button type="button" v-if="urlList['wallpaper'].length > 0" label="壁纸" @click="updateUrlList('wallpaper')" />
          <Button type="button" v-if="urlList['avatar'].length > 0" label="头像" @click="updateUrlList('avatar')" />
          <Button type="button" v-if="urlList['liveWallpaper'].length > 0" label="动态壁纸" @click="updateUrlList('liveWallpaper')" />
          <Button type="button" v-if="urlList['backgroundImage'].length > 0" label="背景图"
                  @click="updateUrlList('backgroundImage')" />
          <Button type="button" v-if="urlList['toolPlay'].length > 0" label="工具玩法" @click="updateUrlList('toolPlay')" />
          <Button type="button" v-if="urlList['ai'].length > 0" label="AI玩法" @click="updateUrlList('ai')" />
        </div>
      </div>
    </div>

    <Divider />

    <perfect-scrollbar :disabled="show">
      <div ref="waterfallWrapper" :style="{ height: `${wrapperHeight}px` }" style="position: relative;">
        <keep-alive>
          <div v-for="item in urlList[typeN]" :key="item" class="waterfall-item absolute">
            <PhotoView :url="item" @load="imageLoad" />
          </div>
        </keep-alive>
      </div>
    </perfect-scrollbar>
  </div>
</template>

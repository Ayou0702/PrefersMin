<template>
  <div class="card m-3 border-1 surface-border">
    <div class="flex align-items-center justify-content-between">
      <div class="flex align-items-center">
        <i class="pi pi-bookmark mr-2" />
        <span class="font-semibold">{{ type }}</span>
      </div>
      <span class="product-badge">{{ width }}x{{ height }}</span>
    </div>
    <div class="text-center">
      <img ref="image" :alt="name" :src="url" class="w-full shadow-2 my-3 mx-0" @load="$emit('load')" />
    </div>
    <div class="flex align-items-center justify-content-between">
      <div class="sf">
        <i class="pi pi-tag mr-2" />
        <span class="text-xl font-bold">{{ displayName }}</span>
      </div>
      <Button icon="pi pi-download" @click="downloadPic(url, name)" />
    </div>
  </div>
</template>

<script>
import request from "@/service/request";

export default {
  props: {
    url: String
  },
  data() {
    return {
      name: "",
      type: "",
      width: "",
      height: ""
    };
  },
  mounted() {
    const img = new Image();
    img.onload = () => {
      this.width = img.width;
      this.height = img.height;

    };
    img.src = this.url;
    this.name = this.url.substring(this.url.lastIndexOf("-") + 1);
    this.type = this.url.substring(this.url.lastIndexOf(".") + 1).toUpperCase();
  },
  methods: {
    downloadPic(link, name) {
      request({
        method: "GET",
        url: link,
        responseType: "blob"
      })
        .then((res) => {
          const blob = new Blob([res.data], { type: "application/octet-stream" });
          const link = document.createElement("a");
          const objectUrl = URL.createObjectURL(blob);
          link.href = objectUrl;
          link.download = name || "download";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
        });
    }
  },
  computed: {
    displayName() {
      const maxLength = 16; // 设置最大显示字符数
      return this.name.length > maxLength ? this.name.slice(0, maxLength) + "..." : this.name;
    }
  }
};
</script>

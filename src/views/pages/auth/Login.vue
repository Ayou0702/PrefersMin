<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import request from "@/service/request";
import cookie from "js-cookie";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";

// 路由实例
const router = useRouter();
const route = useRoute();
const toast = useToast();
const username = ref("");
const password = ref("");
const checked = ref(false);
const yiyan = ref("你好");
let timer = reactive({});

// 创建计时器
onMounted(() => {
  // 检查是否存在状态码
  if ("code" in route.query) {
    // Toast提示
    toast.add({
      severity: "error",
      summary: route.query.description,
      detail: route.query.message,
      life: 3000,
    });

    // 清空route.query
    router.replace({ query: {} });
  }

  // 初始化一言
  updateYiyan();

  // 定时执行
  timer = setInterval(() => {
    updateYiyan();
  }, 10000);
});

// 销毁计时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});

// 一言更新，使用递归确保一言不会过长影响页面显示
function updateYiyan() {
  // 渐隐
  const span = document.querySelector(".ayou");
  span.style.opacity = "0";
  // 获取一言
  request({
    method: "GET",
    url: "https://api.vvhan.com/api/ian",
  })
    .then((res) => {
      // 过长则重新请求
      if (res.data.length > 35) {
        return updateYiyan();
      }
      yiyan.value = res.data;
      span.style.opacity = "1";
    })
    // 备用api
    .catch(() => {
      request({
        method: "GET",
        url: "https://v.api.aa1.cn/api/yiyan/index.php",
      }).then((res) => {
        if (res.data.length > 35) {
          return updateYiyan();
        }
        yiyan.value = res.data.substring(3, res.data.length - 4);
        span.style.opacity = "1";
      });
    });
}

let login = async function () {
  await request({
    method: "POST",
    url: "/auth/login",
    data: {
      userName: username.value,
      passWord: password.value,
    },
  }).then((res) => {
    if (res.data.code === 200 && res.data.data.tokenValue != null) {
      // 1.token存入cookie
      cookie.set("tokenValue", res.data.data.tokenValue);
      // 页面跳转
      router.push({
        path: "/",
      });
    } else if (res.data.code === 200) {
      // 访问成功但是返回值为空（用户名或密码错误）
      toast.add({
        severity: "error",
        summary: "登陆失败",
        detail: "用户名或密码错误",
        life: 3000,
      });
    }
  });
};

function register() {
  router.push({
    path: "/auth/register",
  });
}
</script>

<template>
  <div
    class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden"
  >
    <div class="flex flex-column align-items-center justify-content-center">
      <Toast />
      <div
        style="
          border-radius: 56px;
          padding: 0.3rem;
          background: linear-gradient(
            180deg,
            var(--primary-color) 10%,
            rgba(33, 150, 243, 0) 30%
          );
        "
      >
        <div
          class="w-full surface-card py-8 px-5 sm:px-8"
          style="border-radius: 53px"
        >
          <div class="text-center mb-5">
            <img
              alt="Image"
              class="mb-3"
              height="50"
              src="/../public/layout/images/logo.svg"
            />
            <div class="text-900 text-3xl font-bold mb-3">PrefersMin</div>
            <div style="width: 330px; height: 20px">
              <span
                class="text-600 font-bold ayou"
                style="transition: opacity 0.5s"
                >{{ yiyan }}</span
              >
            </div>
          </div>

          <div class="pt-3">
            <span class="p-float-label mb-5">
              <InputText id="username" v-model="username" class="w-full p-3" />
              <label class="text-600 font-bold ml-1" for="username"
                >Account ID</label
              >
            </span>

            <span class="p-float-label mb-4">
              <Password
                id="password"
                v-model="password"
                :feedback="false"
                :toggleMask="true"
                class="w-full"
                inputClass="w-full p-3 font-bold"
              ></Password>
              <label class="text-600 font-bold ml-1" for="password"
                >Password</label
              >
            </span>

            <div
              class="flex align-items-center justify-content-between pt-3 mb-3 gap-5"
            >
              <div class="flex align-items-center">
                <Checkbox
                  id="remember"
                  v-model="checked"
                  binary
                  class="mr-2"
                ></Checkbox>
                <label for="remember">记住我</label>
              </div>
              <a
                class="font-medium no-underline ml-2 text-right cursor-pointer"
                style="color: var(--primary-color)"
                >游客访问</a
              >
            </div>
            <Button
              class="w-full p-3 text-xl"
              label="登录"
              @click="login"
            ></Button>
            <div
              class="flex align-items-center justify-content-between pt-3 mt-0 gap-5"
            >
              <a
                class="font-medium no-underline ml-2 text-right cursor-pointer"
                style="color: var(--primary-color)"
                >忘记密码</a
              >
              <a
                class="font-medium no-underline ml-2 text-right cursor-pointer"
                style="color: var(--primary-color)"
                @click="register"
                >注册账号</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

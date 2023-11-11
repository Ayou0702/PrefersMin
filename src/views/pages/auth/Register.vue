<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import request from "@/service/request";
import { responseToastConfig } from "@/service/globalFunctions";
import { SHA256 } from "crypto-js";

// 路由实例
const router = useRouter();
const toast = useToast();
const username = ref("");
const password = ref("");
const rePassword = ref("");
const nickname = ref("");
const phone = ref("");
const smsCode = ref("");
const checked = ref(false);
const agreed = ref(false);

const usernameRegex = /[a-zA-Z0-9]{5,15}$/;
const nicknameRegex = /^.{1,10}$/;
const passwordRegex = /^.{5,20}$/;
const phoneRegex = /^1[0-9]{10}$/;

function comeback() {
  router.push({
    path: "/auth/login",
  });
}

function addClassById(id, className) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
    }, 3000); // 延时5秒
  }
}

function errorToast(summary, detail) {
  toast.add({
    severity: "error",
    summary: summary,
    detail: detail,
    life: 3000,
  });
  checked.value = false;
}

function checkRegisterAccountInfo() {
  checked.value = true;

  if (username.value === "") {
    errorToast("注册信息不合规", "账号不能为空");
    addClassById("username", "p-invalid");
  } else if (!usernameRegex.test(username.value)) {
    errorToast("账号不合规", "最短5位，最长15位，只允许使用大小写字母与数字");
    addClassById("username", "p-invalid");
  }

  if (password.value === "") {
    errorToast("注册信息不合规", "密码不能为空");
    addClassById("password", "p-invalid");
  } else if (!passwordRegex.test(password.value)) {
    errorToast("密码不合规", "最短5位，最长20位");
    addClassById("password", "p-invalid");
  }

  if (rePassword.value === "") {
    errorToast("注册信息不合规", "确认不能为空");
    addClassById("rePassword", "p-invalid");
  } else if (password.value !== rePassword.value) {
    errorToast("密码不合规", "两次输入的密码不一致");
    addClassById("rePassword", "p-invalid");
  }

  if (nickname.value === "") {
    errorToast("注册信息不合规", "用户名不能为空");
    addClassById("nickname", "p-invalid");
  } else if (!nicknameRegex.test(nickname.value)) {
    errorToast("用户名不合规", "最短1位，最长10位");
    addClassById("nickname", "p-invalid");
  }

  checkPhone();

  if (smsCode.value === "") {
    errorToast("注册信息不合规", "验证码不能为空");
    addClassById("smsCode", "p-invalid");
  } else if (smsCode.value.length !== 6) {
    errorToast("验证码错误", "请检查验证码是否正确");
    addClassById("smsCode", "p-invalid");
  }

  if (!agreed.value) {
    errorToast("未同意用户协议", "请阅读并同意用户协议");
  }
}

function registerAccount() {
  checkRegisterAccountInfo();
  if (!checked.value) {
    return;
  }

  toast.add({
    severity: "info",
    summary: "校验通过",
    detail: "注册信息合规",
    life: 3000,
  });

  request({
    method: "POST",
    url: "/auth/register",
    data: {
      adminData: {
        adminAccountId: username.value,
        adminAccountPassword: btoa(SHA256(password.value).toString()),
        adminNickName: nickname.value,
        adminPhoneNumber: phone.value,
      },
      code: smsCode.value,
    },
  }).then((response) => {
    toast.add(responseToastConfig(response));
  });
}

function checkPhone() {
  if (phone.value === "") {
    errorToast("注册信息不合规", "手机号不能为空");
    addClassById("phone", "p-invalid");
  } else if (!phoneRegex.test(phone.value)) {
    errorToast("手机号不合规", "仅支持中国大陆(+86)，请检查手机号是否正确");
    addClassById("phone", "p-invalid");
  } else {
    return true;
  }

  return false;
}

function getSMSCode() {
  if (!checkPhone) {
    return;
  }
  request({
    method: "POST",
    url: "/auth/generateSmsCode",
    params: {
      phone: phone.value,
    },
  }).then((response) => {
    toast.add(responseToastConfig(response));
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
            <div
              class="flex justify-content-center w-full"
              style="height: 20px"
            >
              <span class="text-600 font-bold">欢迎使用PrefersMin推送系统</span>
            </div>
          </div>

          <div class="grid">
            <div class="col-12 sm:col-6">
              <span class="p-float-label mb-5">
                <InputText
                  id="username"
                  v-model="username"
                  class="w-full p-3"
                />
                <label class="text-600 font-bold ml-1">账号</label>
              </span>

              <span class="p-float-label mb-5">
                <Password
                  id="password"
                  v-model="password"
                  :toggleMask="true"
                  class="w-full"
                  inputClass="w-full p-3 font-bold"
                  promptLabel="输入您的密码"
                  weakLabel="过于简单"
                  mediumLabel="适中"
                  strongLabel="安全"
                >
                  <template #header>
                    <label class="text-600 font-bold pb-2"
                      >我们不会存储您的明文密码</label
                    >
                    <br />
                    <label class="text-600 font-bold"
                      >您的密码将在本地经过SHA-256加密与Base64编码后上传</label
                    >
                  </template>
                  <template #footer>
                    <Divider />
                    <p class="mt-2">密码建议</p>
                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                      <li>至少一个小写字母</li>
                      <li>至少一个大写字母</li>
                      <li>至少一个数字</li>
                      <li>最小8个字符</li>
                    </ul>
                  </template>
                </Password>
                <label class="text-600 font-bold ml-1">密码</label>
              </span>

              <span class="p-float-label mb-2">
                <Password
                  id="rePassword"
                  v-model="rePassword"
                  :feedback="false"
                  :toggleMask="true"
                  class="w-full"
                  inputClass="w-full p-3 font-bold"
                ></Password>
                <label class="text-600 font-bold ml-1" for="password"
                  >确认密码</label
                >
              </span>
            </div>

            <div class="col-12 sm:col-6">
              <span class="p-float-label mb-5">
                <InputText
                  id="nickname"
                  v-model="nickname"
                  class="w-full p-3"
                />
                <label class="text-600 font-bold ml-1">用户名</label>
              </span>

              <span class="p-float-label mb-5">
                <InputText id="phone" v-model="phone" class="w-full p-3" />
                <label class="text-600 font-bold ml-1">手机号</label>
              </span>

              <div class="flex">
                <span class="w-full p-float-label mb-2">
                  <InputText
                    id="smsCode"
                    v-model="smsCode"
                    class="w-full p-3"
                  />
                  <label class="text-600 font-bold ml-1">验证码</label>
                </span>
                <Button
                  class="w-full text-sm mb-2"
                  label="获取验证码"
                  @click="getSMSCode"
                ></Button>
              </div>
            </div>
          </div>

          <div
            class="flex align-items-center justify-content-between pt-3 mb-3 gap-5"
          >
            <div class="flex align-items-center">
              <Checkbox
                id="agreed"
                v-model="agreed"
                binary
                class="mr-2"
              ></Checkbox>
              <label>同意用户协议</label>
            </div>
            <a
              class="font-medium no-underline ml-2 text-right cursor-pointer"
              style="color: var(--primary-color)"
              @click="comeback()"
              >返回登录</a
            >
          </div>

          <Button
            class="w-full p-3 text-xl"
            label="注册"
            @click="registerAccount"
          ></Button>
        </div>
      </div>
    </div>
  </div>
</template>

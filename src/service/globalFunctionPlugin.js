import { getAvatar, responseToastConfig } from "@/service/globalFunctions";

const globalFunctionPlugin = {
  install(app) {
    app.config.globalProperties.$getAvatar = getAvatar;
    app.config.globalProperties.$responseToastConfig = responseToastConfig;
  },
};

export default globalFunctionPlugin;

import { getAvatar } from "@/service/globalFunctions";

const globalFunctionPlugin = {
  install(app) {
    app.config.globalProperties.$getAvatar = getAvatar;
  }
};

export default globalFunctionPlugin;

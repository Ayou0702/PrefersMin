import request from "@/service/request";

export const getAvatar = (avatarId, avatarType) => {
  return request({
    url: "/getAvatar",
    method: "POST",
    data: {
      avatarType: avatarType,
      avatarId: avatarId,
    },
  }).then((response) => {
    return response;
  });
};

export const responseToastConfig = (response) => {
  if (response.data.code === 200) {
    return {
      severity: "success",
      summary: response.data.message,
      detail: response.data.description,
      life: 3000,
    };
  } else if (response.data.code === 400) {
    return {
      severity: "error",
      summary: response.data.message,
      detail: response.data.description,
      life: 3000,
    };
  }
};

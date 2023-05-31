import request from "@/service/request";

export const getAvatar = (avatarId,avatarType) => {
  return request({
    url: "/getAvatar",
    method: "POST",
    data: {
      avatarType: avatarType,
      avatarId: avatarId
    }
  }).then((response) => {
      return response;
  });
}


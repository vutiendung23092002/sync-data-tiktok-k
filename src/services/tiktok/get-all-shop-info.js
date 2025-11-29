import { getAuthorizedShops, getOrdersList } from "../../core/tiktok-api.js";
import { API_PATHS } from "../../config/constants.js";
import * as utils from "../../utils/index.js";

export async function getTiktokShopInfo(appKey, appSecret, accessToken) {
  const timestamp = Math.floor(Date.now() / 1000);
  const path = API_PATHS.TIKTOK_GET_SHOP;
  const params = {
    app_key: appKey,
    timestamp,
  };

  const sign = utils.generateTikTokSignSmart({
    appSecret,
    path,
    params,
    method: "GET",
  });

  if (sign) params.sign = sign;

  const headers = {
    "x-tts-access-token": accessToken,
  };

  const resShop = await getAuthorizedShops(headers, params, path);
  
  const shops = resShop?.data?.shops;

  return shops;
}

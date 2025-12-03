import { getAuthorizedShops, getOrdersList } from "../../core/tiktok-api.js";
import { API_PATHS_TIKTOK } from "../../config/constants.js";
import * as utils from "../../utils/index.js";

export async function getAllOrdersTiktok(
  appKey,
  appSecret,
  accessToken,
  from,
  to,
  shops
) {
  let allOrders = [];
  let nextPageToken = null;
  const path = API_PATHS_TIKTOK.TIKTOK_ORDER_SEARCH;

  for (const shop of shops) {
    do {
      const timestamp = Math.floor(Date.now() / 1000);

      const params = {
        app_key: appKey,
        timestamp,
        page_size: 100,
        sort_order: "DESC",
        sort_field: "create_time",
        shop_cipher: shop.cipher,
      };

      if (nextPageToken) params.page_token = nextPageToken;

      const headers = {
        "x-tts-access-token": accessToken,
        "Content-Type": "application/json",
      };

      const body = {
        create_time_ge: from,
        create_time_lt: to,
      };

      const sign = utils.generateTikTokSignSmart({
        appSecret,
        path,
        params,
        body,
        method: "POST",
      });

      if (sign) params.sign = sign;

      const resOrders = await getOrdersList(path, params, headers, body);

      const ordersWithShopName = resOrders?.data?.orders.map((o) => ({
        ...o,
        shop_id: shop.id,
        shop_name: shop.name,
      }));
      allOrders.push(...ordersWithShopName);
      nextPageToken = resOrders?.data?.next_page_token || null;
    } while (nextPageToken);
  }

  return allOrders;
}

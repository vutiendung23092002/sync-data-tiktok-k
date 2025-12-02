import { env } from "../../config/env.js";
import { getAccessTokenEnvCloud } from "./get-access-token.js";
import { fetchAllProducts } from "./fetch-all-products.js";
import * as utils from "../../utils/index.js";

export async function getAllCostMap() {
  async function fetchCostMap(client_id, client_secret, retailer) {
    const accessToken = await utils.callWithRetry(() =>
      getAccessTokenEnvCloud(client_id, client_secret)
    );

    const products = await utils.callWithRetry(() =>
      fetchAllProducts(accessToken, { includeInventory: true }, 100, retailer)
    );

    const map = {};
    for (const p of products) {
      if (p.code && p.inventories?.length > 0) {
        map[p.code] = p.inventories[0].cost ?? 0;
      }
    }

    return map;
  }

  // lấy 2 map
  const newMap = await fetchCostMap(
    env.KIOT.kiot_new.client_id,
    env.KIOT.kiot_new.client_secret,
    env.KIOT.kiot_new.retailer
  );

  const oldMap = await fetchCostMap(
    env.KIOT.kiot_old.client_id,
    env.KIOT.kiot_old.client_secret,
    env.KIOT.kiot_old.retailer
  );

  // merge: ưu tiên new
  const merged = { ...newMap };
  for (const [sku, cost] of Object.entries(oldMap)) {
    if (!merged[sku]) merged[sku] = cost;
  }

  // sort
  const sorted = Object.fromEntries(Object.entries(merged).sort());

  return { newMap, oldMap, merged: sorted };
}

import { checkAndRefreshAllTokens } from "./src/services/tiktok/refresh-access-token.js";
import { env } from "./src/config/env.js";
import { getTiktokShopInfo } from "./src/services/tiktok/get-all-shop-info.js";

async function main() {
  const access_token = await checkAndRefreshAllTokens(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    "envCloud", // Tên bảng lưu thông tin token trên supabase
    2
  );

  const test = await getTiktokShopInfo(
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    access_token
  );

  console.log(test)
}

main();

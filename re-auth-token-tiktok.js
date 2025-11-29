import { reAuthTokenTiktok } from "./src/services/tiktok/re-auth-tiktok.js";
import { env } from "./src/config/env.js";

async function main() {
  const asccess_token = await reAuthTokenTiktok(
    "ROW_vBlvbwAAAABElhAgiVEDK4XnWnfR8g2TLYNMx_QR7hvfkkRNbuiuTDfLGVHmfvWha2FSfqnq-yqGtvAiRnFz2xnhFGbT6-1c",
    env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
    env.TIKTOK.shop_han_korea_7561567100864644872.id_env_cloud,
    env.TIKTOK.shop_han_korea_7561567100864644872.app_name,
    env.TIKTOK.shop_han_korea_7561567100864644872.web
  );
}

main();
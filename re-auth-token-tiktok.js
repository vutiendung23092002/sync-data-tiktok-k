import { reAuthTokenTiktok } from "./src/services/tiktok/re-auth-tiktok.js";
import { env } from "./src/config/env.js";

async function reAuthTiktok(authCode, choice) {
  if (choice == "1") {
    console.log("Re-auth cho app K");
    await reAuthTokenTiktok(
      authCode,
      env.TIKTOK.shop_k_lady_care_7527154834987157254.app_key,
      env.TIKTOK.shop_k_lady_care_7527154834987157254.app_secret,
      env.TIKTOK.shop_k_lady_care_7527154834987157254.id_env_cloud,
      env.TIKTOK.shop_k_lady_care_7527154834987157254.app_name,
      env.TIKTOK.shop_k_lady_care_7527154834987157254.web
    );
  } else if (choice == "2") {
    console.log("Re-auth cho app Han");
    await reAuthTokenTiktok(
      authCode,
      env.TIKTOK.shop_han_korea_7561567100864644872.app_key,
      env.TIKTOK.shop_han_korea_7561567100864644872.app_secret,
      env.TIKTOK.shop_han_korea_7561567100864644872.id_env_cloud,
      env.TIKTOK.shop_han_korea_7561567100864644872.app_name,
      env.TIKTOK.shop_han_korea_7561567100864644872.web
    );
  }
}

const authCode = process.env.AUTH_CODE;
const choice = process.env.CHOICE;
reAuthTiktok(authCode, choice);

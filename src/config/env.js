import dotenv from "dotenv";
dotenv.config();

export const env = {
  TIKTOK: {
    shop_han_korea_7561567100864644872: {
      app_key: process.env.TIKTOK_PARTNER_APP_KEY_7561567100864644872,
      app_secret: process.env.TIKTOK_PARTNER_APP_SECRET_7561567100864644872,
      id_env_cloud: 2,
      app_name: "Shop Hân Korea - 7561567100864644872",
      web: "https://partner.tiktokshop.com/",
    },
    shop_k_lady_care_7527154834987157254: {
      app_key: process.env.TIKTOK_PARTNER_APP_KEY_7527154834987157254,
      app_secret: process.env.TIKTOK_PARTNER_APP_SECRET_7527154834987157254,
      id_env_cloud: 3,
      app_name: "Shop K Lady Care- 7527154834987157254",
      web: "https://partner.tiktokshop.com/",
    },
  },

  KIOT: {
    kiot_new: {
      retailer: process.env.KIOTVIET_RETAILER,
      client_id: process.env.KIOT_CLIENT_ID,
      client_secret: process.env.KIOT_SECRET,
    },
    kiot_old: {
      retailer: process.env.KIOTVIET_RETAILER_OLD,
      client_id: process.env.KIOT_CLIENT_ID_OLD,
      client_secret: process.env.KIOT_SECRET_OLD,
    }
  },

  LARK: {
    tiktok_k_orders_items:{
      app_id: process.env.LARK_TIKTOK_K_ORDER_ITEMS_APP_ID,
      app_secret: process.env.LARK_TIKTOK_K_ORDER_ITEMS_APP_SECRET
    },
    tittok_k_finance: {
      // chưa có gì hẹ hẹ
    }
  },

  SUPABASE: {
    SERVICE_KEY: process.env.DATABASE_SERVICE_KEY,
  },

  AES_256_CBC: {
    APP_SECRET_KEY: process.env.AES_256_CBC_APP_SECRET_KEY,
  },
};

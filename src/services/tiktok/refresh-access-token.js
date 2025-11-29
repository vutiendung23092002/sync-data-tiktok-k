import { refreshTikTokAccessToken } from "../../core/tiktok-api.js";
import { supabase } from "../../core/supabase-client.js";
import * as utils from "../../utils/index.js";

export async function checkAndRefreshAllTokens(appKey, appSecret, dbName, id) {
  // Lấy thông tin token lưu trên supabase
  let { data: resSeclect, error: errSeclect } = await supabase
    .from(dbName)
    .select()
    .eq("id", id)
    .single();

  const now = Math.floor(Date.now() / 1000);

  if (
    resSeclect?.access_token_expire_in &&
    Number(resSeclect?.access_token_expire_in) - now > 300
  ) {
    console.log("[Access token vẫn còn sống, bỏ qua.]");
    return utils.decrypt(resSeclect.access_token);
  }

  if (
    resSeclect?.refresh_token_expire_in &&
    Number(resSeclect?.refresh_token_expire_in) - now < 0
  ) {
    console.error(
      `[Refresh token của ${resSeclect.app_name} đã hết hạn — cần re-auth.]`
    );
    return;
  }

  const params = {
    app_key: appKey,
    app_secret: appSecret,
    refresh_token: utils.decrypt(data?.refresh_token),
    grant_type: "refresh_token",
  };

  const result = await refreshTikTokAccessToken(params);

  const { data: resUpsert, error: errUpsert } = await supabase
    .from("envCloud")
    .upsert(
      {
        id: id,
        access_token: utils.encrypt(result?.data?.access_token || ""),
        access_token_expire_in: result?.data?.access_token_expire_in || "",
        refresh_token: utils.encrypt(result?.data?.refresh_token || ""),
        refresh_token_expire_in: result?.data?.refresh_token_expire_in || "",
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  return utils.decrypt(resUpsert.access_token);
}

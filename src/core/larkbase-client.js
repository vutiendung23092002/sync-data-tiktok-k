import * as lark from '@larksuiteoapi/node-sdk';
import { env } from "../config/env.js";

/**
 * Lark OpenAPI Client tổng quát dùng để gọi:
 * - Lark Base (Bitable)
 * - Lark Drive
 * - Lark Docs
 * - Lark User API
 * - Bất kỳ API nào thuộc hệ sinh thái Lark Suite
 *
 * Client này sẽ tự động:
 * - Lấy app access token bằng appId & appSecret
 * - Cache token (disableTokenCache = false)
 * - Ký request theo chuẩn Lark OpenAPI
 *
 * Cách dùng:
 *   larkClient.bitable.appTable.create({...})
 *   larkClient.bitable.record.list({...})
 *   larkClient.drive.file.upload({...})
 *
 * @type {lark.Client}
 */
export const larkClient = new lark.Client({
    appId: env.LARK_APP_ID,
    appSecret: env.LARK_APP_SECRET,
    disableTokenCache: false,
});

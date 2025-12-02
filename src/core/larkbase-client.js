import * as lark from "@larksuiteoapi/node-sdk";

export async function createLarkClient(appId, appSecret) {
  const larkClient = new lark.Client({
    appId: appId,
    appSecret: appSecret,
    disableTokenCache: false,
  });

  return larkClient;
}

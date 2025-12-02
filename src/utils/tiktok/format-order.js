// import { utcToVNTime } from "./timeHelper.js";
// import { generateHash } from "../utils/generateHash.js";
import * as utils from "../index.js";

/**
 * Định dạng lại dữ liệu đơn hàng TikTok
 * @param {Object} order - Dữ liệu đơn hàng TikTok raw
 * @param {string} [shopId] - ID của shop (tùy chọn)
 * @param {string} [shopName] - Tên shop (tùy chọn)
 * @returns {Object} formatted order
 */
export function formatTikTokOrder(order = {}) {
  const formatted = {
    id: `${order.id || ""}${order.shop_id ? "_" + order.shop_id : ""}`,
    order_id: order.id || "",
    tracking_number: order.tracking_number || "",
    create_time: order.create_time
      ? utils.utcToVNTime(order.create_time)
      : null,
    paid_time: order.paid_time ? utils.utcToVNTime(order.paid_time) : null,
    status: order.status || order.status || "",
    total_amount: order.payment?.total_amount ?? 0,
    sub_total: order.payment?.sub_total ?? 0,
    platform_discount: order.payment?.platform_discount ?? 0,
    seller_discount: order.payment?.seller_discount ?? 0,
    original_total_product_price:
      order.payment?.original_total_product_price ?? 0,
    shipping_fee: order.payment?.shipping_fee ?? 0,
    cancel_reason: order.cancel_reason || "",
    tax: order.payment?.tax ?? 0,
    product_tax: order.payment?.product_tax ?? 0,
    shop_name: order.shop_name || "",
    handling_fee: order.payment?.handling_fee ?? 0,
    fulfillment_type: order.fulfillment_type || "",
    cancel_order_sla_time: order.cancel_order_sla_time
      ? utils.utcToVNTime(order.cancel_order_sla_time)
      : null,
    cancellation_initiator: order.cancellation_initiator || "",
    packages: order.packages || [],
    cancel_time: order.cancel_time
      ? utils.utcToVNTime(order.cancel_time)
      : null,
    delivery_due_time: order.delivery_due_time
      ? utils.utcToVNTime(order.delivery_due_time)
      : null,
    delivery_time: order.delivery_time
      ? utils.utcToVNTime(order.delivery_time)
      : null,
    commerce_platform: order.commerce_platform || "",
  };

  const orderHash = utils.generateHash(formatted);

  return {
    ...formatted,
    hash: orderHash,
  };
}

/**
 * Định dạng từng item trong order TikTok
 * @param {Object} item - Sản phẩm trong đơn hàng
 * @param {Object} order - Dữ liệu đơn hàng cha
 * @param {string} shopId - ID của shop
 * @param {string} shopName - Tên shop
 * @returns {Object} formatted item
 */
export function formatTikTokOrderItem(item = {}, order = {}, productCostMap) {
  const formattedItem = {
    id: `${item.id || ""}${order.shop_id ? "_" + order.shop_id : ""}`,
    item_id: item.id || "",
    order_id: order.id || "",
    tracking_number: item.tracking_number || "",
    create_time: order.create_time
      ? utils.utcToVNTime(order.create_time)
      : null,
    sku_id: item.sku_id || "",
    seller_sku: item.seller_sku || "",
    product_name: item.product_name || "",
    is_gift: !!item.is_gift,
    status: item.display_status || "",
    shop_name: order.shop_name || "",
    original_price: Number(item.original_price || 0),
    sale_price: Number(item.sale_price || 0),
    platform_discount: Number(item.platform_discount || 0),
    seller_discount: Number(item.seller_discount || 0),
    gift_retail_price: Number(item.gift_retail_price || 0),
  };

  const cost = productCostMap?.[item?.seller_sku] ?? null;

  const itemHash = utils.generateHash(formattedItem);

  return {
    ...formattedItem,
    cost: cost,
    hash: itemHash,
  };
}

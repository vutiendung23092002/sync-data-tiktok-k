import * as utils from "../index.js";

export function formatTikTokReturnOrder(r = {}) {
  const formatted = {
    id: `${r.return_id || ""}${r.shop_id ? "_" + r.shop_id : ""}`,
    return_id: r.return_id || "",
    order_id: r.order_id || "",
    combined_return_id: r.combined_return_id || "",
    is_combined_return: !!r.is_combined_return,

    // Time
    create_time: r.create_time ? utils.utcTimestampToVnMutilTimezone(r.create_time) : null,
    update_time: r.update_time ? utils.utcTimestampToVnMutilTimezone(r.update_time) : null,

    // Return Info
    return_type: r.return_type || "",
    return_method: r.return_method || "",
    return_status: r.return_status || "",
    // return_reason: r.return_reason || "",
    return_reason_text: r.return_reason_text || "",
    return_tracking_number: r.return_tracking_number || "",
    handover_method: r.handover_method || "",
    role: r.role || "",
    shipment_type: r.shipment_type || "",

    // Provider info
    return_provider_id: r.return_provider_id || "",
    return_provider_name: r.return_provider_name || "",

    // Address
    return_warehouse_address: r.return_warehouse_address?.full_address || "",

    // Shop info
    shop_id: r.shop_id || "",
    shop_name: r.shop_name || "",

    // Refund amounts
    refund_shipping_fee: Number(r.refund_amount?.refund_shipping_fee ?? 0),
    refund_subtotal: Number(r.refund_amount?.refund_subtotal ?? 0),
    refund_tax: Number(r.refund_amount?.refund_tax ?? 0),
    refund_total: Number(r.refund_amount?.refund_total ?? 0),

    // Discount array (lấy item đầu tiên)
    product_platform_discount: Number(r.discount_amount?.[0]?.product_platform_discount ?? 0),
    product_seller_discount: Number(r.discount_amount?.[0]?.product_seller_discount ?? 0),
    shipping_fee_platform_discount: Number(r.discount_amount?.[0]?.shipping_fee_platform_discount ?? 0),
    shipping_fee_seller_discount: Number(r.discount_amount?.[0]?.shipping_fee_seller_discount ?? 0),

    // Shipping fee array
    buyer_paid_return_shipping_fee: Number(r.shipping_fee_amount?.[0]?.buyer_paid_return_shipping_fee ?? 0),
    platform_paid_return_shipping_fee: Number(r.shipping_fee_amount?.[0]?.platform_paid_return_shipping_fee ?? 0),
    seller_paid_return_shipping_fee: Number(r.shipping_fee_amount?.[0]?.seller_paid_return_shipping_fee ?? 0),

    // raw arrays (giữ lại nếu ông muốn ghi file)
    return_line_items: r.return_line_items || [],
    discount_amount_raw: r.discount_amount || [],
    shipping_fee_amount_raw: r.shipping_fee_amount || [],
  };

  const hash = utils.generateHash(formatted);

  return {
    ...formatted,
    hash,
  };
}

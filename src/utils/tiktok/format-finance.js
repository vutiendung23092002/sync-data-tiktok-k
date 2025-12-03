import * as utils from "../index.js";

/**
 * Flatten toàn bộ dữ liệu transaction TikTok (không bỏ sót bất kỳ field nào)
 * → dùng để lưu Supabase, sync Lark, hoặc export Excel
 * @param {Object} trx - Raw TikTok transaction object
 * @param {string} [shopId]
 * @param {string} [shopName]
 * @returns {Object} Flattened transaction
 */
export function formatTikTokTransactionFull(trx = {}) {
  const fee = trx?.fee_tax_breakdown?.fee || {};
  const tax = trx?.fee_tax_breakdown?.tax || {};
  const shipping = trx?.shipping_cost_breakdown || {};
  const supplementaryShip = shipping?.supplementary_component || {};
  const supplementary = trx?.supplementary_component || {};
  const revenue = trx?.revenue_breakdown || {};

  const formatted = {
    // ===== META =====
    id: `${trx.id || ""}${trx.shop_id ? "_" + trx.shop_id : ""}`,
    adjustment_id: trx.adjustment_id || "",
    transaction_id: trx.id || "",
    order_id: trx.order_id ? trx.order_id : trx.adjustment_order_id || null,
    order_create_time: trx.order_create_time
      ? utils.utcTimestampToVn(trx.order_create_time)
      : null,
    type: trx.type || "",
    shop_id: trx.shop_id || "",
    shop_name: trx.shop_name || "",

    // ===== SUPPLEMENTARY COMPONENT =====
    customer_payment_amount: Number(supplementary.customer_payment_amount || 0),
    customer_refund_amount: Number(supplementary.customer_refund_amount || 0),
    platform_cofunded_discount_amount: Number(
      supplementary.platform_cofunded_discount_amount || 0
    ),
    platform_cofunded_discount_refund_amount: Number(
      supplementary.platform_cofunded_discount_refund_amount || 0
    ),
    platform_discount_amount: Number(
      supplementary.platform_discount_amount || 0
    ),
    platform_discount_refund_amount: Number(
      supplementary.platform_discount_refund_amount || 0
    ),
    retail_delivery_fee_amount: Number(
      supplementary.retail_delivery_fee_amount || 0
    ),
    retail_delivery_fee_payment_amount: Number(
      supplementary.retail_delivery_fee_payment_amount || 0
    ),
    retail_delivery_fee_refund_amount: Number(
      supplementary.retail_delivery_fee_refund_amount || 0
    ),
    sales_tax_amount: Number(supplementary.sales_tax_amount || 0),
    sales_tax_payment_amount: Number(
      supplementary.sales_tax_payment_amount || 0
    ),
    sales_tax_refund_amount: Number(supplementary.sales_tax_refund_amount || 0),
    seller_cofunded_discount_amount: Number(
      supplementary.seller_cofunded_discount_amount || 0
    ),
    seller_cofunded_discount_refund_amount: Number(
      supplementary.seller_cofunded_discount_refund_amount || 0
    ),

    // ===== Overview =====
    revenue_amount: Number(trx.revenue_amount || 0),
    fee_tax_amount: Number(trx.fee_tax_amount || 0),
    settlement_amount: Number(trx.settlement_amount || 0), // = revenue_amount - fee_tax_amount

    // ===== REVENUE BREAKDOWN =====
    subtotal_before_discount_amount: Number(
      revenue.subtotal_before_discount_amount || 0
    ),
    refund_subtotal_before_discount_amount: Number(
      revenue.refund_subtotal_before_discount_amount || 0
    ),
    seller_discount_amount: Number(revenue.seller_discount_amount || 0),
    seller_discount_refund_amount: Number(
      revenue.seller_discount_refund_amount || 0
    ),

    // ===== FEE BREAKDOWN =====
    affiliate_ads_commission_amount: Number(
      fee.affiliate_ads_commission_amount || 0
    ),
    affiliate_commission_amount: Number(fee.affiliate_commission_amount || 0),
    affiliate_commission_amount_before_pit: Number(
      fee.affiliate_commission_amount_before_pit || 0
    ),
    affiliate_partner_commission_amount: Number(
      fee.affiliate_partner_commission_amount || 0
    ),
    live_specials_fee_amount: Number(fee.live_specials_fee_amount || 0),
    platform_commission_amount: Number(fee.platform_commission_amount || 0),
    pre_order_service_fee_amount: Number(fee.pre_order_service_fee_amount || 0),
    transaction_fee_amount: Number(fee.transaction_fee_amount || 0),
    vn_fix_infrastructure_fee: Number(fee.vn_fix_infrastructure_fee || 0),
    voucher_xtra_service_fee_amount: Number(
      fee.voucher_xtra_service_fee_amount || 0
    ),

    // ===== TAX BREAKDOWN =====
    pit_amount: Number(tax.pit_amount || 0),
    vat_amount: Number(tax.vat_amount || 0),

    // ===== SHIPPING BREAKDOWN =====
    actual_shipping_fee_amount: Number(
      shipping.actual_shipping_fee_amount || 0
    ),
    shipping_fee_discount_amount: Number(
      shipping.shipping_fee_discount_amount || 0
    ),
    shipping_cost_amount: Number(trx.shipping_cost_amount) || 0,

    statement_id: trx.statement_id || "",
    statement_time: trx.statement_time
      ? utils.utcTimestampToVn(trx.statement_time)
      : null,

    // ===== SHIPPING.SUPPLEMENTARY =====
    platform_shipping_fee_discount_amount: Number(
      supplementaryShip.platform_shipping_fee_discount_amount || 0
    ),

    adjustment_amount: Number(trx.adjustment_amount) || 0,
  };

  const hash = utils.generateHash(formatted);
  return { ...formatted, hash };
}

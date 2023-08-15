const db = require("../connection");

const getOrder = async (user_id) => {
  try {
    const query =
      await db`SELECT * FROM product_order WHERE user_id = ${user_id}`;
    return query;
  } catch (error) {
    return error;
  }
};

const getOrderStatus = async (user_id) => {
  try {
    const query =
      await db`SELECT * FROM product_order WHERE user_id = ${user_id} AND status = 'order_created' `;
    return query;
  } catch (error) {
    return error;
  }
};

const getPrice = async (user_id) => {
  try {
    const query =
      await db`SELECT SUM(CAST(product_order.total_price AS NUMERIC)) as total_price_sum
        FROM product_order WHERE user_id = ${user_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const addOrder = async (payload) => {
  try {
    const query = await db`INSERT INTO product_order ${db(
      payload,
      "product_id",
      "total_product",
      "user_id",
      "seller_id",
      "product_size",
      "product_color",
      "total_price",
      "shipping_price",
      "status"
    )} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const getOrderByOrderId = async (order_id, user_id) => {
  try {
    const query =
      await db`SELECT * FROM product_order WHERE order_id = ${order_id} AND user_id = ${user_id} `;
    return query;
  } catch (error) {
    return error;
  }
};
const getOrderWithAddress = async (user_id) => {
  try {
    const query = await db`
      SELECT product_order.*, address.* 
      FROM product_order
      JOIN address ON product_order.address_id = CAST(address.address_id AS character varying)
      JOIN product ON product_order.product_id = product.product_id
      WHERE product_order.user_id = ${user_id}
    `;
    return query;
  } catch (error) {
    return error;
  }
};
const checkOrder = async (order_id, user_id) => {
  try {
    const query =
      await db`SELECT * FROM product_order WHERE order_id = ${order_id} AND user_id = ${user_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const editOrder = async (payload, order_id) => {
  try {
    const query = await db`UPDATE product_order SET ${db(
      payload,
      "product_size",
      "product_color",
      "total_product"
    )} WHERE order_id = ${order_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const deleteOrder = async (order_id, user_id) => {
  try {
    const query =
      await db`DELETE FROM product_order WHERE order_id = ${order_id} AND user_id = ${user_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const insertPayment = async (payload) => {
  try {
    const query = await db`INSERT INTO payment ${db(
      payload,
      "user_id",
      "total_payment",
      "order_id"
    )} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const getPaymentId = async (user_id) => {
  try {
    const query =
      await db`SELECT payment.payment_id FROM payment WHERE user_id= ${user_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const updatePaymentToken = async (payload, user_id) => {
  try {
    const query = await db`UPDATE payment SET ${db(
      payload,
      "transaction_token"
    )} WHERE user_id = ${user_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const checkStatus = async (payloadStatus, orderId) => {
  try {
    const query = await db`UPDATE payment SET ${db(
      payloadStatus,
      "status"
    )} WHERE order_id = ${orderId} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const updateOrderToken = async (payload, user_id, product_id) => {
  try {
    const query = await db`UPDATE product_order 
      SET ${db(
        payload,
        "transaction_token",
        "order_id_payment"
      )} WHERE user_id = ${user_id} 
      AND product_id = ${product_id}
      RETURNING *`;
    return query;
  } catch (error) {
    return error;
  }
};

module.exports = {
  getOrder,
  getPrice,
  addOrder,
  getOrderWithAddress,
  checkOrder,
  editOrder,
  deleteOrder,
  getOrderByOrderId,
  insertPayment,
  getPaymentId,
  updatePaymentToken,
  checkStatus,
  getOrderStatus,
  updateOrderToken,
};

const db = require("../connection");
const axios = require("axios");
const model = require("../models/product.models");
const modelAddress = require("../models/address.models");
const modelOrder = require("../models/order.models");
const modelUser = require("../models/users.models");
const modelProduct = require("../models/product.models");

const jwt = require("jsonwebtoken");
const midtransClient = require("midtrans-client");
const { get } = require("../routes/order.routes");

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );
  return token;
}

async function createOrder(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;

    // const { product_id, product_size, product_color, total_product, adds_id } =
    //   req.body;
    const { product_id, product_size, product_color, total_product } = req.body;

    if (
      !product_id ||
      !product_size ||
      !product_color ||
      !total_product
      // !adds_id
    ) {
      return res.status(400).json({
        status: false,
        message: "All field must be filled",
      });
    }

    const getProduct = await model.getProductByProductId(product_id);
    console.log(getProduct);

    if (!getProduct.length) {
      return res.status(400).json({
        status: false,
        message: "Product not availabe",
      });
    }

    if (!getProduct[0].product_size.split(", ").includes(product_size)) {
      return res.status(400).json({
        status: false,
        message: "Product size not availabe",
      });
    }

    const productColor = getProduct[0].product_color.toLowerCase();
    if (!productColor.includes(product_color.toLowerCase())) {
      return res.status(400).json({
        status: false,
        message: "Product color not available",
      });
    }

    if (total_product < 0) {
      return res.status(400).json({
        status: false,
        message: "Total product must be greater than 0",
      });
    }

    // const get_address = await modelAddress.getAddressById(adds_id);
    // console.log(get_address);

    // if (!get_address.length) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Address not found",
    //   });
    // }

    // if (get_address[0].user_id !== user_id) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "You are not allowed to use this address",
    //   });
    // }

    const seller_id = getProduct[0].seller_id;
    const productPrice = getProduct[0].product_price;
    const shipping_price = 20000;
    const totalPrice = productPrice * total_product + shipping_price;

    const payload = {
      product_id: getProduct[0].product_id,
      product_size: product_size,
      product_color: product_color,
      user_id: user_id,
      total_product: total_product,
      shipping_price: shipping_price,
      seller_id: seller_id,
      // address_id: adds_id,
      total_price: totalPrice,
    };

    data = await modelOrder.addOrder(payload);

    fulldata = [[...getProduct, ...data]];

    res.json({
      status: true,
      message: "Get data success",
      data: fulldata,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function getAllOrder(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;
    const query = await modelOrder.getOrder(user_id);
    // const query = await modelOrder.getOrderWithAddress(user_id);

    const product_order_data = [];
    for (const product of query) {
      const product_id = product.product_id;
      const photo_data = await modelProduct.getPhotoProduct(product_id);
      const product_data = await modelProduct.getProductById(product_id);
      const order_data = {
        ...product,
        path: photo_data,
        product: product_data,
      };
      product_order_data.push(order_data);
    }

    res.json({
      status: true,
      message: "Get data success",
      data: product_order_data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function editOrder(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;

    const { order_id, product_size, product_color, total_product } = req.body;

    if (!order_id) {
      return res.status(400).json({
        status: false,
        message: "All field must be filled",
      });
    }

    const checkOrder = await modelOrder.getOrderByOrderId(order_id, user_id);
    if (!checkOrder.length) {
      return res.status(400).json({
        status: false,
        message: "Order not found",
      });
    }

    const product_id = checkOrder[0].product_id;

    const checkProduct = await modelProduct.getProductByProductId(product_id);

    if (!checkProduct.length) {
      return res.status(400).json({
        status: false,
        message: "Product not found",
      });
    }

    if (
      product_size &&
      !checkProduct[0].product_size.split(", ").includes(product_size)
    ) {
      return res.status(400).json({
        status: false,
        message: "Product size not availabe",
      });
    }

    const productColor = checkProduct[0].product_color.toLowerCase();
    if (product_color && !productColor.includes(product_color.toLowerCase())) {
      return res.status(400).json({
        status: false,
        message: "Product color not available",
      });
    }

    if (total_product < 0) {
      return res.status(400).json({
        status: false,
        message: "Total product must be greater than 0",
      });
    }
    console.log(checkOrder[0].product_color);

    const payload = {
      product_size:
        product_size !== "" ? product_size : checkOrder[0].product_size,
      product_color:
        product_color !== "" ? product_color : checkOrder[0].product_color,
      total_product:
        total_product !== "" ? total_product : checkOrder[0].total_product,
    };

    console.log(payload);

    const data = await modelOrder.editOrder(payload, order_id);

    res.json({
      status: true,
      message: "Get data success",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function deleteOrder(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;
    const order_id = req.body.order_id;

    if (!order_id) {
      return res.status(400).json({
        status: false,
        message: "All field must be filled",
      });
    }

    const checkOrder = await modelOrder.checkOrder(order_id, user_id);

    if (!checkOrder.length) {
      return res.status(400).json({
        status: false,
        message: "Order not found",
      });
    }

    if (checkOrder[0].user_id !== user_id) {
      return res.status(400).json({
        status: false,
        message: "You are not allowed to delete this order",
      });
    }

    await modelOrder.deleteOrder(order_id, user_id);

    res.json({
      status: true,
      message: "Delete order success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function createPayment(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;

    const get_customer = await modelUser.getProfileById(user_id);

    const get_order = await modelOrder.getOrder(user_id);

    if (!get_order.length) {
      return res.status(400).json({
        status: false,
        message: "Order not found",
      });
    }

    const get_price = await modelOrder.getPrice(user_id);

    totalPayment = get_price[0].total_price_sum;

    const payload = {
      user_id: user_id,
      total_payment: totalPayment,
    };

    const data = await modelOrder.insertPayment(payload);

    const get_payment_id = await modelOrder.getPaymentId(user_id);
    const getPaymentId = get_payment_id[0].payment_id;

    const { v4: uuidv4 } = require("uuid");
    const orderId = uuidv4();

    let snap = new midtransClient.Snap({
      // Set to true if you want Production Environment (accept real transaction).
      isProduction: false,
      serverKey: process.env.SERVER_KEY,
    });
    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalPayment,
      },
      customer_details: {
        first_name: get_customer[0].user_name,
        email: get_customer[0].user_email,
        phone: get_customer[0].user_phonenumber,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    const transactionToken = transaction.token;

    const payloadUpdate = {
      transaction_token: transactionToken,
    };
    const updateData = await modelOrder.updatePaymentToken(payloadUpdate);

    const url = `https://api.sandbox.midtrans.com/v2/${getPaymentId}/status`;
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.SERVER_KEY + ":"
        ).toString("base64")}`,
      },
    });
    const payment_status = response.data.status_message;

    const payloadStatus = {
      status: payment_status,
    };

    // const checkStatusPayment = await modelOrder.checkStatus(payloadStatus);
    await modelOrder.checkStatus(payloadStatus);
    res.send({
      status: true,
      message: "Success Create payment",
      data: {
        payment_id: getPaymentId,
        payment_status: payment_status,
        transactionToken: transactionToken,
      },
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else {
      console.log(error);
    }
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function checkStatus(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;
    paymentId = await modelOrder.getPaymentId(user_id);
    payment_id = paymentId[0].payment_id;
    const url = `https://api.sandbox.midtrans.com/v2/${payment_id}/status`;
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.SERVER_KEY + ":"
        ).toString("base64")}`,
      },
    });

    const payment_status = response.data.status_message;

    const payloadStatus = {
      status: payment_status,
    };

    const data = await modelOrder.checkStatus(payloadStatus);

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  getAllOrder,
  createOrder,
  createPayment,
  checkStatus,
  deleteOrder,
  editOrder,
};

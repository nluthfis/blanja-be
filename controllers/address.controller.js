const { query } = require("express");
const db = require("../connection");
const jwt = require("jsonwebtoken");
const model = require("../models/users.models");
const modelAddress = require("../models/address.models");

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );
  return token;
}

async function getAddressJwt(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;

    const data = await modelAddress.getAddress(user_id);
    res.send({
      status: true,
      message: "Success get data",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

async function insertAddress(req, res) {
  try {
    const { user_id } = req.user;

    const {
      address_name,
      recipient_name,
      recipient_phone_number,
      address_data,
      postal_code,
      city,
    } = req.body;

    if (
      !(
        address_name &&
        recipient_name &&
        recipient_phone_number &&
        address_data &&
        postal_code &&
        city
      )
    ) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      });
      return;
    }

    if (address_name.length < 3 || address_name.length > 50) {
      res.status(400).json({
        status: false,
        message: "Address name must be 3-50 characters",
      });
      return;
    }

    if (recipient_name.length < 3 || recipient_name.length > 50) {
      res.status(400).json({
        status: false,
        message: "Recipient name must be 3-50 characters",
      });
      return;
    }

    if (address_data.length < 3 || address_data.length > 50) {
      res.status(400).json({
        status: false,
        message: "Address data must be 3-50 characters",
      });
      return;
    }

    if (isNaN(recipient_phone_number)) {
      res.status(400).json({
        status: false,
        message: "Phone number must be number",
      });
      return;
    }

    if (
      recipient_phone_number.length < 8 ||
      recipient_phone_number.length > 18
    ) {
      res.status(400).json({
        status: false,
        message: "Phone number must be 8-18 digits",
      });
      return;
    }

    if (isNaN(postal_code)) {
      res.status(400).json({
        status: false,
        message: "Postal code must be number",
      });
      return;
    }

    if (postal_code.length < 5 || postal_code.length > 10) {
      res.status(400).json({
        status: false,
        message: "Postal code must be 5-10 digits",
      });
      return;
    }

    const payload = {
      address_name,
      recipient_name,
      recipient_phone_number,
      address_data,
      postal_code,
      city,
      user_id: user_id,
    };

    data = await modelAddress.insertAddress(payload);

    res.json({
      status: true,
      message: "Success insert data",
      // data: query,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function editAddress(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;
    const adds_id = Number(req.body.adds_id);
    const {
      address_name,
      recipient_name,
      phone_number,
      address_data,
      postal_code,
      city,
    } = req?.body;

    // validasi input
    if (address_name && (address_name.length < 3 || address_name.length > 50)) {
      res.status(400).json({
        status: false,
        message: "Address name must be 3-50 characters",
      });
      return;
    }

    if (
      recipient_name &&
      (recipient_name.length < 3 || recipient_name.length > 50)
    ) {
      res.status(400).json({
        status: false,
        message: "Recipient name must be 3-50 characters",
      });
      return;
    }

    if (address_data && (address_data.length < 3 || address_data.length > 50)) {
      res.status(400).json({
        status: false,
        message: "Address data must be 3-50 characters",
      });
      return;
    }

    if (phone_number) {
      if (isNaN(phone_number)) {
        res.status(400).json({
          status: false,
          message: "Phone number must be a number",
        });
        return;
      } else if (phone_number.length < 10 || phone_number.length > 13) {
        res.status(400).json({
          status: false,
          message: "Phone number must be 10-13 digits",
        });
        return;
      }
    }

    if (postal_code && (postal_code.length < 5 || postal_code.length > 10)) {
      res.status(400).json({
        status: false,
        message: "Postal code must be 5-10 digits",
      });
      return;
    }

    const data = await modelAddress.getAddress(user_id);

    if (!data.length) {
      res.status(404).json({
        status: false,
        message: "Address not found",
      });
      return;
    }

    const addressIds = data.map((row) => row.address_id);
    // console.log(addressIds);

    if (!addressIds.includes(adds_id)) {
      res.status(400).json({
        status: false,
        message: "Address ID not found",
      });
      return;
    }

    const dataAddress = await modelAddress.getAddressById(adds_id);

    const payload = {
      address_name: address_name || dataAddress[0].address_name,
      recipient_name: recipient_name || dataAddress[0].recipient_name,
      recipient_phone_number:
        phone_number || dataAddress[0].recipient_phone_number,
      address_data: address_data || dataAddress[0].address_data,
      postal_code: postal_code || dataAddress[0].postal_code,
      city: city || dataAddress[0].city,
    };

    const query = await modelAddress.editAddress(payload, adds_id, user_id);

    res.json({
      status: true,
      message: "Success Edit data",
      data: query,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

async function deleteAddress(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;
    const adds_id = Number(req.body.adds_id);

    const data = await modelAddress.getAddress(user_id, adds_id);
    if (!data.length) {
      res.status(404).json({
        status: false,
        message: "Address not found",
      });
      return;
    }
    const addressIds = data.map((row) => row.address_id);
    if (!addressIds.includes(adds_id)) {
      res.status(400).json({
        status: false,
        message: "Address ID not found",
      });
      return;
    }

    const query = await modelAddress.deleteAddress(adds_id, user_id);

    res.send({
      status: true,
      message: "Success delete data",
      data: query,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}
module.exports = {
  getAddressJwt,
  insertAddress,
  editAddress,
  deleteAddress,
};

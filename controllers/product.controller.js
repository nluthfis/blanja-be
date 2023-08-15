const model = require("../models/product.models");
const db = require("../connection");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );
  return token;
}

async function getProduct(req, res) {
  try {
    let query;
    let keyword = `%${req?.query?.keyword}%`;
    let category = `%${req?.query?.category}%`;
    let by = `${req?.query?.by}`;

    let sort = db`DESC`;
    let isPaginate =
      req?.query?.page &&
      !isNaN(req?.query?.page) &&
      parseInt(req?.query?.page) >= 1;

    if (req?.query?.sortType?.toLowerCase() === "asc") {
      if (isPaginate) {
        sort = db`ASC LIMIT 10 OFFSET ${10 * (parseInt(req?.query?.page) - 1)}`;
      } else {
        sort = db`ASC`;
      }
    }

    if (isPaginate && !req?.query?.sortType) {
      sort = db`DESC LIMIT 10 OFFSET ${10 * (parseInt(req?.query?.page) - 1)}`;
    }

    // ketika memasukkan keyword dan category
    if (req?.query?.keyword && req?.query?.category) {
      query = await model.getProductByKeywordCategory(keyword, category, sort);
      // ketika memasukkan category
    } else if (req?.query?.category) {
      query = await model.getProductByCategory(category, sort);
      // ketika memasukkan keyword dan kategory maka data yang muncul adalah dari keyword dan category
    } else if (req?.query?.keyword) {
      query = await model.getProductByKeyword(keyword);
      // ketika memasukkan by dengan review
    } else if (by === "review") {
      query = await model.getProductByReview(sort);
    } else {
      query = await model.getProductBySort(sort);
    }

    const product_with_photo = [];

    for (const product of query) {
      const product_id = product.product_id;
      const photo_data = await model.getPhotoProduct(product_id);
      const product_with_photos = {
        ...product,
        path: photo_data,
      };
      product_with_photo.push(product_with_photos);
    }

    res.json({
      status: product_with_photo?.length ? true : false,
      message: product_with_photo?.length
        ? "Get data success"
        : "Data not found",
      total: product_with_photo?.length ?? 0,
      pages: isPaginate
        ? {
            current: parseInt(req?.query?.page),
            total: product_with_photo?.[0]?.full_count
              ? Math.ceil(parseInt(product_with_photo?.[0]?.full_count) / 10)
              : 0,
          }
        : null,
      data: product_with_photo?.map((item) => {
        delete item.full_count;
        return item;
      }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function getProductByJwt(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const id = decoded.user_id;
    console.log(id);

    const data = await model.getProductBySellerId(id);
    console.log(data);

    const product_with_photo = [];

    for (const product of data) {
      const product_id = product.product_id;
      const photo_data = await model.getPhotoProduct(product_id);
      const product_with_photos = {
        ...product,
        path: photo_data,
      };
      product_with_photo.push(product_with_photos);
    }

    res.json({
      status: true,
      message: "Get data success",
      data: product_with_photo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function getProductById(req, res) {
  try {
    const {
      params: { id },
    } = req;

    if (isNaN(id)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      });
      return;
    }
    const data = await model.getProductById(id);

    if (!data.length) {
      res.status(404).json({
        status: false,
        message: "Data not found",
      });
      return;
    }

    const product_with_photo = [];

    for (const product of data) {
      const id = product.product_id;
      const photo_data = await model.getPhotoById(id);
      const product_with_photos = {
        ...product,
        path: photo_data,
      };
      product_with_photo.push(product_with_photos);
    }

    res.json({
      status: true,
      message: "Get data success",
      data: product_with_photo,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function getCategory(req, res) {
  try {
    const data = await model.getCategory();

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

async function insertProduct(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const id = decoded.user_id;
    const role_id = decoded.roles_id;

    if (role_id != 2) {
      res.status(400).json({
        status: false,
        message: "auth seller invalid",
      });
      return;
    }

    const {
      product_name,
      product_category,
      product_price,
      product_color,
      product_size,
      product_condition,
      product_description,
    } = req.body;

    const { photo } = req.files;

    console.log(photo);

    if (
      !(
        product_name &&
        product_category &&
        product_price &&
        product_color &&
        product_size &&
        product_condition &&
        photo &&
        product_description
      )
    ) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all of fields",
      });
      return;
    }

    const payload = {
      product_name,
      product_category,
      product_price,
      product_color,
      product_size,
      product_condition,
      product_description,
      seller_id: id,
    };

    data = await model.insertProductData(payload);
    console.log(data);

    const product_id = data[0].product_id;
    console.log(product_id);

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLODUNARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    for (let i = 0; i < photo.length; i++) {
      const photoFile = photo[i];
      console.log(photoFile.name);
      const upload = cloudinary.uploader.upload(photoFile.tempFilePath, {
        public_id: new Date().toISOString(),
      });
      upload.then(async (data) => {
        console.log(product_id);
        const payload = {
          photo_path: data?.secure_url,
          product_id: product_id,
        };
        console.log(payload);

        photo_data = await model.insertProductPhoto(payload);
      });
    }

    res.json({
      status: true,
      message: "Success insert data",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

async function editProduct(req, res) {
  try {
    let product_id = `${req?.query?.product_id}`;
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;

    const {
      product_name,
      product_category,
      product_price,
      product_color,
      product_size,
      product_condition,
      product_description,
    } = req.body;

    console.log(product_description);

    if (isNaN(user_id)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      });
      return;
    }

    checkData = await model.getProductByProductId(product_id);
    console.log(checkData);

    if (!checkData.length) {
      res.status(404).json({
        status: false,
        message: "Data not found",
      });
      return;
    }

    checkId = await model.checkProduct(product_id);
    if (checkId[0].seller_id != user_id) {
      res.status(404).json({
        status: false,
        message: "not your product",
      });
      return;
    }

    const payload = {
      product_name: product_name ?? checkData[0].product_name,
      product_category: product_category ?? checkData[0].product_category,
      product_price: product_price ?? checkData[0].product_price,
      product_color: product_color ?? checkData[0].product_color,
      product_size: product_size ?? checkData[0].product_size,
      product_condition: product_condition ?? checkData[0].product_condition,
      product_description:
        product_description ?? checkData[0].product_description,
      seller_id: user_id,
    };

    const query = await model.editProduct(payload, product_id);
    res.send({
      status: true,
      message: "Success edit data",
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

async function deleteProduct(req, res) {
  try {
    let product_id = `${req?.query?.product_id}`;
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const user_id = decoded.user_id;

    if (isNaN(user_id)) {
      res.status(400).json({
        status: false,
        message: "ID must be integer",
      });
      return;
    }

    checkId = await model.checkProduct(product_id);
    console.log(checkId[0].seller_id);
    console.log(user_id);
    if (checkId[0].seller_id != user_id) {
      res.status(404).json({
        status: false,
        message: "not your product",
      });
      return;
    }

    checkData = await model.checkProduct(product_id);

    if (!checkData) {
      res.status(404).json({
        status: false,
        message: "data not found",
      });
    }

    const query = await model.deleteProduct(product_id);

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
  getProduct,
  getProductById,
  getCategory,
  insertProduct,
  getProductByJwt,
  editProduct,
  deleteProduct,
};

const db = require("../connection");

const getAllProduct = async () => {
  try {
    const query = await db`SELECT * FROM product`;
    return query;
  } catch (error) {
    return error;
  }
};
const getProductByKeyword = async (keyword) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM product WHERE LOWER(product.product_name) ILIKE LOWER(${keyword}) ORDER BY "date_created" DESC`;
    return query;
  } catch (error) {
    return error;
  }
};
const getProductByReview = async (sort) => {
  try {
    const query =
      await db`SELECT COALESCE(ROUND(AVG(product_review.review_score),1),0) AS score, product.*, count(*) OVER() as full_count
      FROM product LEFT JOIN product_review ON product_review.product_id = product.product_id 
      GROUP BY product.product_id ORDER BY score ${sort}`;
    return query;
  } catch (error) {
    return error;
  }
};

const getProductByCategory = async (category, sort) => {
  try {
    const query =
      await db`SELECT *, count(*) OVER() as full_count FROM product WHERE LOWER(product.product_category) ILIKE LOWER(${category}) ORDER BY "date_created" `;
    return query;
  } catch (error) {
    return error;
  }
};
const getProductByKeywordCategory = async (keyword, category, sort) => {
  try {
    const query = await db`SELECT *, count(*) OVER() as full_count FROM product 
      WHERE LOWER(product.product_name) ILIKE LOWER(${keyword}) AND 
      LOWER(product.product_category) LIKE LOWER(${category}) 
      ORDER BY "date_created" ${sort}`;
    return query;
  } catch (error) {
    return error;
  }
};
const getProductBySort = async (sort) => {
  try {
    const query =
      await db`SELECT COALESCE(ROUND(AVG(product_review.review_score),1),0) AS score, product.*, count(*) OVER() as full_count
      FROM product LEFT JOIN product_review ON product_review.product_id = product.product_id 
      GROUP BY product.product_id ORDER BY date_created ${sort}`;
    return query;
  } catch (error) {
    return error;
  }
};

const getProductById = async (id) => {
  try {
    const query =
      await db`SELECT COALESCE(ROUND(AVG(product_review.review_score),1),0) AS score, product.* 
      FROM product LEFT JOIN product_review ON product_review.product_id = product.product_id WHERE product.product_id = ${id}
      GROUP BY product.product_id`;
    return query;
  } catch (error) {
    return error;
  }
};

const getProductByProductId = async (product_id) => {
  try {
    const query =
      await db`SELECT * FROM product WHERE product_id = ${product_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const checkProduct = async (product_id) => {
  try {
    const query =
      await db`SELECT product.seller_id FROM product WHERE product_id = ${product_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const getPhotoById = async (id) => {
  try {
    const query =
      await db`SELECT product_photo.photo_path FROM product_photo WHERE product_id = ${id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const getCategory = async () => {
  try {
    const query = await db`SELECT DISTINCT product_category FROM product`;
    return query;
  } catch (error) {
    return error;
  }
};
const getPhotoProduct = async (product_id) => {
  try {
    const query =
      await db`SELECT product_photo.photo_path FROM product_photo WHERE product_id = ${product_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const getProductBySellerId = async (id) => {
  try {
    const query = await db`SELECT * FROM product
    WHERE seller_id = ${id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const insertProductData = async (payload) => {
  try {
    const query = await db`INSERT INTO product ${db(
      payload,
      "product_name",
      "product_category",
      "product_price",
      "product_color",
      "product_size",
      "product_condition",
      "product_description",
      "seller_id"
    )} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const insertProductPhoto = async (payload) => {
  try {
    const query = await db`INSERT INTO product_photo ${db(
      payload,
      "photo_path",
      "product_id"
    )} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const editProduct = async (payload, product_id) => {
  try {
    const query = await db`UPDATE product SET ${db(
      payload,
      "product_name",
      "product_category",
      "product_price",
      "product_color",
      "product_size",
      "product_condition",
      "product_description",
      "seller_id"
    )} WHERE product_id = ${product_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const deleteProduct = async (product_id) => {
  try {
    const query =
      await db`DELETE FROM product WHERE product_id = ${product_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};

module.exports = {
  getAllProduct,
  checkProduct,
  getProductByKeyword,
  getProductByKeywordCategory,
  getProductByReview,
  getProductBySort,
  getProductByCategory,
  getProductById,
  getProductByProductId,
  getCategory,
  getPhotoProduct,
  getProductBySellerId,
  getPhotoById,
  insertProductData,
  insertProductPhoto,
  editProduct,
  deleteProduct,
};

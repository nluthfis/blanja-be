const db = require("../connection");

const getAllUser = async () => {
  try {
    const query = db`SELECT * FROM users`;
    return query;
  } catch (error) {
    return error;
  }
};
const getProfileById = async (id) => {
  try {
    const query = await db`SELECT * FROM users WHERE user_id = ${id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const getProfileByEmail = async (user_email) => {
  try {
    const query =
      await db`SELECT * FROM users WHERE LOWER(user_email) = LOWER(${user_email})`;
    console.log(query);
    return query;
  } catch (error) {
    return error;
  }
};
const insertProfile = async (payload) => {
  try {
    const query = await db`INSERT INTO users ${db(
      payload,
      "user_name",
      "user_password",
      "user_email",
      "user_phonenumber",
      "roles_id",
      "name_store"
    )} returning *`;

    console.log(query);
    return query;
  } catch (error) {
    return error;
  }
};

const insertProfileUserss = async (payload) => {
  try {
    const query = await db`INSERT INTO userss ${db(
      payload,
      "user_id",
      "user_name"
    )} returning *`;

    console.log(query);
    return query;
  } catch (error) {
    return error;
  }
};

const editCustomer = async (payload, user_id) => {
  try {
    const query = await db`UPDATE users SET ${db(
      payload,
      "user_name",
      "user_password",
      "user_email",
      "user_phonenumber",
      "gender",
      "date_of_birth"
    )} WHERE user_id = ${user_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const editSeller = async (payload, user_id) => {
  try {
    const query = await db`UPDATE users SET ${db(
      payload,
      "user_name",
      "user_password",
      "user_email",
      "user_phonenumber",
      "name_store",
      "store_description"
    )} WHERE user_id = ${user_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};
const deleteProfile = async (user_id) => {
  try {
    const query = await db`DELETE FROM users WHERE user_id = ${user_id}`;
    return query;
  } catch (error) {
    return error;
  }
};
const editUsersPhoto = async (payload, user_id) => {
  try {
    const query = await db`UPDATE users set ${db(
      payload,
      "user_photo"
    )} WHERE user_id = ${user_id} returning *`;
    return query;
  } catch (error) {
    return error;
  }
};

module.exports = {
  getAllUser,
  getProfileById,
  getProfileByEmail,
  insertProfile,
  editSeller,
  editCustomer,
  deleteProfile,
  editUsersPhoto,
};

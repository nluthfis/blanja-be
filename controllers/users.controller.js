const db = require("../connection");
const model = require("../models/users.models");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const cloudinary = require("cloudinary").v2;

function getToken(req) {
  const token = req?.headers?.authorization?.slice(
    7,
    req?.headers?.authorization?.length
  );
  return token;
}

async function getUsers(req, res) {
  try {
    const token = getToken(req);
    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    const id = decoded.user_id;

    const data = await model.getProfileById(id);

    // Check if the user is a customer or a seller based on the roles_id
    const user_type =
      data[0].roles_id === 1
        ? "customer"
        : data[0].roles_id === 2
        ? "seller"
        : "unknown";

    res.send({
      status: true,
      message: "Success get data",
      data: {
        ...data[0], // Access the nested user data object
        user_type, // Add the user_type field to the response
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

// async function getProfileById(req, res) {
//   try {
//     const {
//       params: { id },
//     } = req;

//     if (isNaN(id)) {
//       res.status(400).json({
//         status: false,
//         message: "ID must be integer",
//       });
//       return;
//     }

//     const data = await model.getProfileById(id);

//     if (!data.length) {
//       res.status(404).json({
//         status: false,
//         message: "Data not found",
//       });
//       return;
//     }

//     res.json({
//       status: true,
//       message: "Get data success",
//       data: data,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: false,
//       message: "Error not found",
//     });
//   }
// }

async function getProfileByEmail(req, res) {
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

    const query = await model.getProfileByEmail(email);

    if (!query.length) {
      res.status(404).json({
        status: false,
        message: "Data not found",
      });
      return;
    }

    res.json({
      status: true,
      message: "Get data success",
      data: query,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Error not found",
    });
  }
}

async function registerUser(req, res, role, name_store = null) {
  try {
    const { user_name, user_password, user_email, user_phonenumber } = req.body;

    // Validate input
    if (!(user_name && user_password && user_email && user_phonenumber)) {
      res.status(400).json({
        status: false,
        message: "Bad input, please complete all fields",
      });
      return;
    }

    // Check if email already exists in the database
    const emailExists = await model.getProfileByEmail(user_email);

    if (emailExists.length > 0) {
      res.status(400).json({
        status: false,
        message: "Email already exists",
      });
      return;
    }

    const payload = {
      user_name,
      user_password,
      user_email,
      user_phonenumber,
      roles_id: role,
      name_store,
    };

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(user_password, salt);

    // Store the hashed password in the payload
    payload.user_password = hash;

    // Insert the user into the database
    const query = await model.insertProfile(payload);

    res.json({
      status: true,
      message: "Success insert data",
      data: query,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}
async function registerCustomer(req, res) {
  await registerUser(req, res, 1);
}
async function registerSeller(req, res) {
  const { name_store } = req.body;
  if (!name_store) {
    res.status(400).json({
      status: false,
      message: "Bad input, please provide a name_store",
    });
    return;
  }
  await registerUser(req, res, 2, name_store);
}
async function editCustomer(req, res) {
  {
    try {
      jwt.verify(
        getToken(req),
        process.env.PRIVATE_KEY,
        async function (err, { user_id }) {
          console.log(user_id);
          const {
            body: {
              user_name,
              user_password,
              user_email,
              user_phonenumber,
              gender,
              date_of_birth,
            },
          } = req;

          if (isNaN(user_id)) {
            res.status(400).json({
              status: false,
              message: "ID must be integer",
            });
            return;
          }

          const checkData = await model.getProfileById(user_id);

          if (!checkData.length) {
            res.status(404).json({
              status: false,
              message: "ID not found",
            });
            return;
          }

          const emailExists = await model.getProfileByEmail(user_email);

          if (emailExists.length > 0) {
            res.status(400).json({
              status: false,
              message: "Email still the same or already exists",
            });
            return;
          }

          const payload = {
            user_name:
              user_name !== undefined ? user_name : checkData[0].user_name,
            user_password:
              user_password !== undefined
                ? user_password
                : checkData[0].user_password,
            user_email:
              user_email !== undefined ? user_email : checkData[0].user_email,
            user_phonenumber:
              user_phonenumber !== undefined
                ? user_phonenumber
                : checkData[0].user_phonenumber,
            gender: gender !== undefined ? gender : checkData[0].gender,
            date_of_birth:
              date_of_birth !== undefined
                ? date_of_birth
                : checkData[0].date_of_birth,
          };

          let query;
          if (user_password) {
            try {
              const salt = await bcrypt.genSalt(saltRounds);
              const hash = await bcrypt.hash(user_password, salt);
              query = await model.editCustomer(
                { ...payload, user_password: hash },
                user_id
              );
            } catch (err) {
              console.log(err);
            }
          } else {
            query = await model.editCustomer(payload, user_id);
          }

          res.send({
            status: true,
            message: "Success edit data",
            data: query,
          });
        }
      );
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}
async function editSeller(req, res) {
  {
    try {
      jwt.verify(
        getToken(req),
        process.env.PRIVATE_KEY,
        async function (err, { user_id }) {
          const {
            body: {
              user_name,
              user_password,
              user_email,
              user_phonenumber,
              name_store,
              store_description,
            },
          } = req;

          if (isNaN(user_id)) {
            res.status(400).json({
              status: false,
              message: "ID must be integer",
            });
            return;
          }

          const checkData = await model.getProfileById(user_id);

          if (!checkData.length) {
            res.status(404).json({
              status: false,
              message: "ID not found",
            });
            return;
          }

          const payload = {
            user_name:
              user_name !== undefined ? user_name : checkData[0].user_name,
            user_password:
              user_password !== undefined
                ? user_password
                : checkData[0].user_password,
            user_email:
              user_email !== undefined ? user_email : checkData[0].user_email,
            user_phonenumber:
              user_phonenumber !== undefined
                ? user_phonenumber
                : checkData[0].user_phonenumber,
            name_store:
              name_store !== undefined ? name_store : checkData[0].name_store,
            store_description:
              store_description !== undefined
                ? store_description
                : checkData[0].store_description,
          };

          console.log(payload);

          let query;
          if (user_password) {
            bcrypt.genSalt(
              saltRounds,
              await function (err, salt) {
                bcrypt.hash(user_password, salt, async function (err, hash) {
                  query = await model.editSeller(
                    { ...payload, user_password: hash },
                    user_id
                  );
                });
              }
            );
          } else {
            query = await model.editSeller(payload, user_id);
          }
          res.send({
            status: true,
            message: "Success edit data",
            data: query,
          });
        }
      );
    } catch (error) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  }
}
async function deleteUsers(req, res) {
  try {
    jwt.verify(
      getToken(req),
      process.env.PRIVATE_KEY,
      async function (err, { user_id }) {
        if (isNaN(user_id)) {
          res.status(400).json({
            status: false,
            message: "ID must be integer",
          });
          return;
        }
        const checkData = await model.getProfileById(user_id);

        if (!checkData.length) {
          res.status(404).json({
            status: false,
            message: "ID not found",
          });

          return;
        }

        const query = await model.deleteProfile(user_id);

        res.send({
          status: true,
          message: "Success delete data",
          data: query,
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}
async function editUsersPhoto(req, res) {
  try {
    jwt.verify(
      getToken(req),
      process.env.PRIVATE_KEY,
      async (err, { user_id }) => {
        const { user_photo } = req?.files ?? {};

        if (!user_photo) {
          res.status(400).send({
            status: false,
            message: "Photo is required",
          });
        }

        let mimeType = user_photo.mimetype.split("/")[1];
        let allowFile = ["jpeg", "jpg", "png", "webp"];
        if (!allowFile?.find((item) => item === mimeType)) {
          res.status(400).send({
            status: false,
            message: "Only accept jpeg, jpg, png, webp",
          });
          return;
        }

        // validate size image
        if (user_photo.size > 2000000) {
          res.status(400).send({
            status: false,
            message: "File to big, max size 2MB",
          });
          return;
        }

        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLODUNARY_KEY,
          api_secret: process.env.CLOUDINARY_SECRET,
        });

        const upload = cloudinary.uploader.upload(user_photo.tempFilePath, {
          public_id: new Date().toISOString(),
        });

        upload
          .then(async (data) => {
            const payload = {
              user_photo: data?.secure_url,
            };
            await model.editUsersPhoto(payload, user_id);

            res.status(200).send({
              status: true,
              message: "Success upload",
              data: payload,
            });
          })
          .catch((err) => {
            res.status(400).send({
              status: false,
              message: err,
            });
          });
      }
    );
  } catch (error) {
    console.log(error);

    res.status(500).send({
      status: false,
      message: "Error on server",
    });
  }
}

module.exports = {
  getUsers,
  // getProfileById,
  getProfileByEmail,
  registerCustomer,
  registerSeller,
  editCustomer,
  editSeller,
  deleteUsers,
  editUsersPhoto,
};

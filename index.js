const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const fileUpload = require("express-fileupload");

const usersRoutes = require("./routes/users.routes");
const authUser = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const addressRoutes = require("./routes/address.routes");
const orderRoutes = require("./routes/order.routes");

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(usersRoutes);
app.use(authUser);
app.use(productRoutes);
app.use(addressRoutes);
app.use(orderRoutes);

app.get("/", function (req, res) {
  res.send("Api is running Well!");
});
app.listen(process.env.PORT || 4000, () => {
  console.log("App running in port 4000");
});

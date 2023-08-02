# Blanja Backend

# This Repository is about Blanja Backend build with Express.js, PostgreSQL and Midtrans for the transaction

Blanja is a platform for buying and selling fashion products.

## Introduction

Blanja is an e-commerce platform that allows users to buy and sell products online. This repository contains the backend code that handles various operations, including user authentication, product management, order processing, and more.

# Features

- Login/Register ( Customer / Seller )
- Get User Data
- Edit Customer Data
- Edit Seller Data
- Upload User Photo
- delete User Data
- Get Product
- Insert Product
- Edit Product
- Delete Product
- Get Address User
- Insert Address User
- Edit Address User
- Delete Address User
- Create Order
- Get Order
- Edit Order
- Delete Order
- Create Payment
- Check Status Payment

# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
Prerequisites

- Node.js
- Postgresql

# Installing:

- Clone the repository
- git clone https://github.com/nluthfis/blanja-be.git

# Install dependencies:

- npm install
- Start the server
- npm start
- The API will be running on port 4000.

# The API endpoints are:

### User Route

- `GET /users` - Get all users.
- `POST /register/customer` - Register a new customer.
- `POST /register/seller` - Register a new seller.
- `PATCH /edit/customer` - Edit customer data.
- `PATCH /edit/seller` - Edit seller data.
- `DELETE /users` - Delete users.
- `PATCH /users/photo` - Edit user photo.

### Auth Route

- `POST /customer/login` - Login for customers.
- `POST /seller/login` - Login for sellers.

### Product Route

- `GET /product` - Get all products.
- `GET /product/:id` - Get a product by ID.
- `GET /category` - Get all product categories.
- `POST /product` - Insert a new product.
- `GET /seller/product` - Get products by seller (using JWT).
- `PATCH /product` - Edit a product.
- `DELETE /product` - Delete a product.

### Address Route

- `GET /address` - Get addresses using JWT.
- `POST /customer/address` - Insert a new address for a customer.
- `PATCH /address/edit_address` - Edit address.
- `DELETE /address/delete_address` - Delete address.

### Order Route

- `GET /order` - Get all orders.
- `POST /product/createOrder` - Create a new order.
- `PATCH /editorder` - Edit an order.
- `DELETE /order/delete-order` - Delete an order.

### Payment Route

- `POST /create-payment` - Create a new payment.
- `GET /check-status` - Check payment status.

Feel free to explore the API endpoints to understand how to interact with the Blanja backend.

[ Api Deploy ] : https://rich-teal-camel-tutu.cyclic.app

## Endpoint List Postman

[![Run in Postman](https://run.pstmn.io/button.svg)](https://elements.getpostman.com/redirect?entityId=26602283-18309b59-06d3-4af9-a33e-a95d7c6a0f1a&entityType=collection)

## Related Project

- [Blanja ](https://github.com/nluthfis/blanja-fe)
- [Blanja Demo](https://blanja-fe-theta.vercel.app)

## Authors

Contributors names and contact info:

1. Naufal Luthfi Saputra

- [Linkedin](https://www.linkedin.com/in/naufal-luthfi-saputra/)

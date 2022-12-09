const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ["maquillaje", "ropa", "cuidado-de-la-piel", "estilo-de-vida"],
    },
    supplier: [
      {
        type: Schema.Types.ObjectId,
        ref: "Supplier",
      },
    ],
    administrador: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    image: String
},

  {
    timestamps: true,
  }
);

const Product = model("Product", productSchema);

module.exports = Product;
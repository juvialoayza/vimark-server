const { Schema, model } = require("mongoose");

const supplierSchema = new Schema(
  {
    name: {
      type: String,
    },
    location: {
      type: String,
    },
    administrador: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },

  {
    timestamps: true,
  }
);

const Supplier = model("Supplier", supplierSchema);

module.exports = Supplier;
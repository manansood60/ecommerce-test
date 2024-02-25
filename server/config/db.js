const mongoose = require("mongoose");
try {
  mongoose.connect("mongodb+srv://manansood60:NFjTIg5eUckcV3xQ@cluster0.8sxla8l.mongodb.net/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  console.log("Database Connected Successfully");
} catch (err) {
  console.log("Database Not Connected");
}

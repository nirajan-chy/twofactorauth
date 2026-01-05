const zod = require("zod");

const userValidator = zod.object({
  name: zod.string().min(3, "Must be at least 3 characters"),
  email: zod.string().email("Invalid email address"),
  password: zod.string().min(8, "Must be at least 8 characters"),
});
module.exports = userValidator;

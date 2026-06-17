const z = require("zod");

const signUpSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

module.exports = {
  signUpSchema,
};

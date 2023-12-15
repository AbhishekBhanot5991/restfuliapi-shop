const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});


// userSchema.methods.generateHash = async function (password) {
//     return await bcrypt.hash(password, bcrypt.genSaltSync(8), null);
//   };

  userSchema.methods.generateHash = async function (password) {
    const saltRounds = 8;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        this.password = hashedPassword; // Set the hashed password in the document
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Internal server error');
    }
};

userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

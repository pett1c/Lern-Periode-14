const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'organizer', 'admin'],
      default: 'user',
      index: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
      index: true,
    },
    providerId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function preSave() {
  if (!this.isModified('password')) {
    return;
  }

  if (!this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

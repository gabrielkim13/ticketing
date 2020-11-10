import mongoose from 'mongoose';

import { Password } from '../services/password';

interface UserAttrs {
  email: string;
  password: string;
}

interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttrs): UserDocument;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;

      delete ret.password;
    },
    versionKey: false,
  }
});

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashedPassword = await Password.toHash(this.get('password'));
    this.set('password', hashedPassword);
  }

  done();
})

userSchema.statics.build = (attrs: UserAttrs) => new User(attrs);

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export { User };

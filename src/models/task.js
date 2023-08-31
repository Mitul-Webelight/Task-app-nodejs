import mongoose from 'mongoose';

const taskschema = mongoose.Schema(
  {
    description: {
      type: String,
      // required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
export default mongoose.model('Task', taskschema);

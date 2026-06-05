const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    text: { type: String, required: true },
    author: { type: String, default: 'Matchmaker' },
  },
  { timestamps: true }
)

noteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

module.exports = mongoose.model('Note', noteSchema)

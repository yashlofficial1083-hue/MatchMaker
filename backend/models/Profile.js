const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    heightCm: { type: Number, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    undergraduateCollege: { type: String, required: true },
    degree: { type: String, required: true },
    income: { type: Number, required: true },
    currentCompany: { type: String, required: true },
    designation: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    languagesKnown: [{ type: String }],
    siblings: { type: String },
    caste: { type: String },
    religion: { type: String },
    wantKids: { type: String },
    openToRelocate: { type: String },
    openToPets: { type: String },
  },
  { timestamps: true }
)

profileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

module.exports = mongoose.model('Profile', profileSchema)

const Customer = require('../models/Customer')
const Note = require('../models/Note')

async function listCustomers(req, res) {
  const matchmakerId = req.query.matchmakerId
  const filter = matchmakerId ? { matchmakerId } : {}
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)
  const skip = (page - 1) * limit

  const [total, customers] = await Promise.all([
    Customer.countDocuments(filter),
    Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ])

  res.json({
    data: customers.map((customer) => ({ ...customer, id: customer._id })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  })
}

async function getCustomer(req, res) {
  const customer = await Customer.findById(req.params.id).lean()
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' })
  }
  res.json({ ...customer, id: customer._id })
}

async function getNotes(req, res) {
  const customer = await Customer.findById(req.params.id).lean()
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' })
  }

  const notes = await Note.find({ customerId: customer._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  res.json(notes.map((note) => ({ ...note, id: note._id })))
}

async function addNote(req, res) {
  const customer = await Customer.findById(req.params.id).lean()
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' })
  }

  const text = (req.body?.text || '').trim()
  if (!text) {
    return res.status(400).json({ message: 'Note text is required' })
  }

  const note = await Note.create({
    customerId: customer._id,
    text,
    author: req.body?.author || 'Matchmaker',
  })

  res.status(201).json({ ...note.toJSON(), id: note._id })
}

module.exports = {
  listCustomers,
  getCustomer,
  getNotes,
  addNote,
}

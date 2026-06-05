const express = require('express')
const {
  listCustomers,
  getCustomer,
  getNotes,
  addNote,
} = require('../controllers/customerController')
const { getMatches } = require('../controllers/matchController')

const router = express.Router()

router.get('/', listCustomers)
router.get('/:id', getCustomer)
router.get('/:id/notes', getNotes)
router.post('/:id/notes', addNote)
router.get('/:id/matches', getMatches)

module.exports = router

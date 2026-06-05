const express = require('express')
const { sendMatch } = require('../controllers/matchController')

const router = express.Router()

router.post('/send', sendMatch)

module.exports = router

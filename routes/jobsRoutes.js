const express = require('express')
const router = express.Router()
const { postJob } = require('../controllers/jobsController')

router.post("/post", postJob)


module.exports = router
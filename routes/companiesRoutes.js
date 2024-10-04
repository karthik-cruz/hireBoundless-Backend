const express = require('express')
const router = express.Router()
const { companyCreate, getCompany, updateCompany } = require('../controllers/companiesController')

// create company ----
router.post("/create", companyCreate)

// update company ----
router.put("/update/:id", updateCompany)

// delete company
// router.delete("/delete", deleteCompany)

// get company
router.get("/get/:id", getCompany)



module.exports = router
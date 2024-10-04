const express = require('express')
const router = express.Router()
const {
    signupUser,
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getUser,
    profileCreate,
    updateUser,
    updatePassword,
    updateAvatar
} = require('../controllers/usersController')


// Signup new user -----
router.post("/signup", signupUser);

// login a user ------
router.post("/login", loginUser)

//forgot password ------
router.post("/forgot-password", forgotPassword)

//verifyOtp ------
router.post("/verify-otp", verifyOtp)

//resetPassword -----------
router.post("/reset-password", resetPassword)

//profile Create -------------
router.put("/profile/create/:id", profileCreate)

//updateAvatar -------------
router.put("/update-avatar/:id", updateAvatar)


// get user --------------
router.get("/get-user/:id", getUser)


//put user ----------------
router.put("/update-user/:id", updateUser)


//put user ----------------
router.put("/update-password/:id", updatePassword)



module.exports = router
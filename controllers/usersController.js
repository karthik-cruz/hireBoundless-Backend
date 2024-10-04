const usersModel = require('../models/usersSchema');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET; // your JWT secret
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const PASSWORD = process.env.PASSWORD
const EMAIL = process.env.EMAIL
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const signupUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        //check if the user already exists -------
        const existingUser = await usersModel.findOne({ email });
        if (existingUser) {
            return res.status(201).json({ message: 'User already exists', success: false });
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create a new user
        const user = new usersModel({ name, email, password: hashedPassword, role });
        await user.save();
        //generate jwt token 
        const token = JWT.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        res.status(200).json({ message: 'User created successfully', user, token, success: true });

    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //check if the user exists
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(201).json({ message: 'User does not exist', success: false });
        } else {
            //check if the password is correct
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(201).json({ message: 'Incorrect password', success: false });
            }
        }

        //generate jwt token
        const token = JWT.sign({ userId: user._id, role: user.role }, JWT_SECRET);

        res.status(200).json({ message: 'User logged in successfully', user, token, success: true });


    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};




//forgotPasswordController ---
const forgotPassword = async (req, res) => {
    try {
        //check if email is provided
        const { email } = req.body;
        if (!email) {
            return res.status(201).json({ error: "All fields are required" });
        }

        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(201).json({ message: "User not found", success: false });
        }

        //Generate 6 Digit otp 
        const otp = crypto.randomInt(100000, 999999);
        //otp expiry in 15 min
        const otpExpiry = Date.now() + 15 * 60 * 1000;
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        //send otp via email with nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        });
        const mailOptions = {
            from: EMAIL,
            to: email,
            subject: 'OTP for forgot password',
            text: `Your OTP is ${otp} valid for 15 minutes`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).json({ error: "Internal server error" });
            } else {
                console.log('Email sent:' + info.response);
                res.status(200).json({ message: "OTP sent to your email", success: true });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

// verify otp controller ----------------------------
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the user by email
        const user = await usersModel.findOne({ email });
        if (!user) {
            return res.status(201).json({ message: 'User not found', success: false });
        }
        // console.log(user)

        // Check if OTP matches and if it is still valid
        console.log(user?.otp, parseInt(otp), user?.otpExpiry, Date.now())
        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(201).json({ message: 'Invalid or expired OTP', success: false });
        }

        // Clear OTP and expiry after verification
        await usersModel.updateOne(
            { email: user.email },
            { $unset: { otp: "", otpExpiry: "" } }
        );

        res.status(200).json({ message: 'OTP verified successfully', success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};



//Reset password controller -----------------------
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usersModel.findOne({ email });

        if (!user) {
            return res.status(201).json({ message: 'User not found', success: false });
        }
        // Update the user's password and hashed the password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully', success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


//get user controller

const getUser = async (req, res) => {
    try {
        const user = await usersModel.findById(req.params.id);
        //check if user exists
        if (!user) {
            return res.status(201).json({ message: 'User not found', success: false });
        }
        res.status(200).json({ user, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
}



// Ensure directory exists before handling uploads ------
const resumeDirectory = path.join(__dirname, '..', 'uploads', 'resumes');

if (!fs.existsSync(resumeDirectory)) {
    fs.mkdirSync(resumeDirectory, { recursive: true });
}

//uploadResume --------
// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.slice(0, -path.extname(file.originalname).length) + path.extname(file.originalname));
    }
});

// Set up multer middleware
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'));
        }
    }
});

// Controller to handle resume upload and user profile update
const profileCreate = async (req, res) => {
    upload.single('resume')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { id } = req.params;
            // Fetch user by ID
            const user = await usersModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found', success: false });
            }


            // if the user has an existing resume, delete the old file 
            if (user.profile.resume) {
                // before deleting the old file, we need to check if it exists
                if (fs.existsSync(path.join(__dirname, '..', 'uploads', 'resumes', user.profile.resume))) {
                    const oldResumePath = path.join(__dirname, '..', 'uploads', 'resumes', user.profile.resume);
                    fs.unlinkSync(oldResumePath); //delete the old avatar file
                }
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Please provide a resume file', success: false });
            }

            // Update user's profile with resume path and experience
            user.profile.resume = req.file.filename;

            await user.save();

            res.json({
                success: true,
                message: 'Resume Added successfully!',
                user
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
};


const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.slice(0, -path.extname(file.originalname).length) + path.extname(file.originalname));
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: (req, file, cb) => {
        //allowedTypes only jpg ,jpeg , png
        const allowedTypes = ['.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only jpg and jpeg/png are allowed.'));
        }
    }
});

const updateAvatar = async (req, res) => {
    uploadAvatar.single('avatar')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            const { id } = req.params;
            // Fetch user by ID
            const user = await usersModel.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found', success: false });
            }

            // if the user has an existing avatar, delete the old file 
            if (user.profile.avatar) {
                // before deleting the old file, we need to check if it exists
                if (fs.existsSync(path.join(__dirname, '..', 'uploads', 'avatars', user.profile.avatar))) {
                    const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', user.profile.avatar);
                    fs.unlinkSync(oldAvatarPath); //delete the old avatar file
                }
            }

            if (!req.file) {
                return res.status(400).json({ message: 'Please provide a valid image', success: false });
            }

            // Update user's profile with avatar path
            user.profile.avatar = req.file.filename;

            await user.save();

            res.json({
                success: true,
                message: 'Avatar updated successfully!',
                user
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    });
};




const updateUser = async (req, res) => {
    try {

        const { id } = req.params;
        const { username } = req.body;
        const user = await usersModel.findById(id);
        if (!user) {
            return res.status(201).json({ message: 'User not found', success: false });
        }
        user.name = username;
        await user.save();
        res.status(200).json({ message: 'User updated successfully', success: true, user });

    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
}



const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, newPassword } = req.body;
        const user = await usersModel.findById(id);

        if (!user) {
            return res.status(201).json({ message: 'User not found', success: false });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(201).json({ message: 'Incorrect password', success: false });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
}




module.exports = {
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
}
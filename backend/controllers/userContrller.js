const asyncHandler = require("express-async-handler")
const User = require('../models/userModel.js')
const jwt = require('jsonwebtoken')
const bcrypt = require("bcryptjs")
const Token = require('../models/tokenModel.js')
const crypto = require('crypto')
const sendEmail = require("../utils/sendEmail.js")

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' })

}

//Register User

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //validation

    if (!name || !email || !password) {
        res.status(400)
        throw new Error('Please fill all required details')
    }

    if (password.length < 8) {
        res.status(400)
        throw new Error('Password must be atleast 8 character')
    }

    //cheak if user email already exist

    const userExist = await User.findOne({ email })

    if (userExist) {
        res.status(404)
        throw new Error('Email already been registered')
    }

    //create new user

    const user = await User.create({
        name,
        email,
        password
    })
    //generate token

    const token = generateToken(user._id)  //using user._id as a uniquie identity

    //send HTTP only cookie to the frontend

    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),  //1 day
        sameSite: 'none',
        secure: true
    });



    if (user) {
        const { _id, name, email, photo, bio, phone } = user
        res.status(200).json({
            _id, name, email, photo, bio, phone, token

        })
    }
    else {
        res.status(400)
        throw new Error("invalid user data")
    }


})

//login user

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    //validate request

    if (!email || !password) {
        res.status(400)
        throw new Error('Please fill email and password')
    }

    //cheak if user exist 

    const user = await User.findOne({ email })
    if (!email || !password) {
        res.status(400)
        throw new Error('user not found please log in correctly')

    }

    //cheak if password is correct using bcrypt

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    //generate token

    const token = generateToken(user._id)  //using user._id as a uniquie identity

    //send HTTP only cookie to the frontend

    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),  //1 day
        sameSite: 'none',
        secure: true
    });


    if (user && passwordIsCorrect) {
        const { _id, name, email, photo, bio, phone } = user
        res.status(200).json({
            _id, name, email, photo, bio, phone, token

        })
    }
    else {
        res.status(400)
        throw new Error("invalid email or password")
    }
})

//logout user

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),  //0 second
        sameSite: 'none',
        secure: true
    });
    return res.status(200).json({ message: 'logged out sucessfully' })
})

// Get User Data

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
        });
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});


const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;

    // Log the token for debugging
    // console.log("Token from cookies:", token);

    // Check if token exists and is a string
    if (!token || typeof token !== 'string') {
        return res.json(false);
    }

    try {
        // Verify Token
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        if (verified) {
            return res.json(true);
        }
    } catch (error) {
        console.error("JWT Verification Error:", error); // Log the verification error
    }

    return res.json(false);
});

//update user

const updateUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    if (user) {
        const { name, email, photo, phone, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();

        //retuning updated information back to database

        res.status(200).json({

            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//change password

const changePassword = asyncHandler(async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(400).json({ message: 'User not found, please sign up' });
        }

        const { oldPassword, password } = req.body;

        if (!oldPassword || !password) {
            return res.status(400).json({ message: 'Please fill in both old and new passwords' });
        }

        const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

        if (!passwordIsCorrect) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        user.password = password;
        await user.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error); // Passes the error to the error handler middleware
    }
});

//forgetPassword

const forgetPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404)
        res.send('user not found')
    }

    //delete token if already exsist

    let token = await Token.findOne({ userId: user._id })
    if (token) {
        await token.deleteOne()
    }

    //create reset token

    const resetToken = crypto.randomBytes(32).toString('hex') + user._id

    //hash token before save it to the database

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //save token to db

    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000) //30min
    }).save()

    //construct reset url

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

    //consrust reset email

    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>  
    <p>This reset link is valid for only 30minutes.</p>

    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

    <p>Regards...</p>
    <p>Pinvent Team</p>
  `;
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from)
        res.status(200).json({ success: true, message: "reset mail sent" })
    } catch (error) {
        res.status(500)
        throw new Error('Email not sent,Plese try again')
    }
})


// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;
  
    // Hash token, then compare to Token in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    // fIND tOKEN in DB
    const userToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });
  
    if (!userToken) {
      res.status(404);
      throw new Error("Invalid or Expired Token");
    }
  
    // Find user
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
      message: "Password Reset Successful, Please Login",
    });

})
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgetPassword,
    resetPassword
}



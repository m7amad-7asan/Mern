const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/Http-Error');
const User = require('../models/UserModel');

const signup = async (req, res, next) =>
{
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
    {
        return next(
            new HttpError('Invalid Inputs Passed, Check Your Credentials', 422)
        )
    }
    
    const { name, email, password } = req.body;
    
    let existingUser;
    try
    {
        existingUser = await User.findOne({ email: email })
    }
    catch(err)
    {
        const error = new HttpError('Signing Up Failed, Please Try Again', 500);
        return next(error);
    }

    if(existingUser)
    {
        const error = new HttpError('User Already Exists, Please Choose Another Email Address', 422);
        return next(error);
    }

    let hashedPassword;
    try
    {
        hashedPassword = await bcrypt.hash(password, 12)
    }
    catch(err)
    {
        const error = new HttpError('Signing Up Failed, Please Try Again', 422);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        image: '',
        password: hashedPassword,
        posts: []
    })

    try
    {
        await createdUser.save()
    }
    catch(err)
    {
        const error = new HttpError('Signing Up Failed, Please Try Again', 500);
        return next(error);
    }

    let token;
    try
    {
        token = jwt.sign({ userId: createdUser.id, email: createdUser.email }, 'Senior_Project_Fashion', { expiresIn: '7d' })
    }
    catch(err)
    {
        const error = new HttpError('Signing Up Failed, Please Try Again', 500);
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, token: token })
}

const login = async (req, res, next) =>
{
    let { email, password } = req.body;
    
    email = email.toLowerCase()
    
    let existingUser;

    try 
    {
        existingUser = await User.findOne({ email: email });
    }
    catch (err) 
    {
        const error = new HttpError('Loggin in failed, please try again later.',500);
        return next(error);
    }

    if (!existingUser) 
    {
        const error = new HttpError('Email Doesn\'t Exist, could not log you in.',403);
        return next(error);
    }

    let isValidPassword = false;
    try
    {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    }
    catch(err)
    {
        const error = new HttpError('Loggin in failed, please try again later.',500);
        return next(error);
    }

    if(!isValidPassword)
    {
        const error = new HttpError('Password Not Correct, could not log you in.',403);
        return next(error);
    }

    let token;
    try
    {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email }, 'Senior_Project_Fashion', { expiresIn: '7d' })
    }
    catch(err)
    {
        const error = new HttpError('Loggin in failed, please try again later.',500);
        return next(error);
    }

    res.status(201).json({ userId: existingUser.id, token: token })
}

const getProfile = async (req, res, next) =>
{
    const requestedProfileId = req.params.profileId;
    const userId = req.userData.userId;
    
    let profile;
    try
    {
        profile = await User.findById(requestedProfileId, '-password -email -id');
    }
    catch(err)
    {
        const error = new HttpError('Something Went Wrong, Couldn\'t Find The Profile', 500);
        return next(error);
    }
    
    if(!profile)
    {
        const error = new HttpError('Couldn\'t Load This Profile', 404);
        return next(error)
    }
    
    res.json({ profile: profile.toObject({ getters: true })  })
}

const updateProfile = async (req, res, next) =>
{  
    const errors = validationResult(req);
    
    if(!errors.isEmpty())
    {
        return next(
            new HttpError('Invalid Inputs Passed, Check Your Credentials', 422)
        )
    }
    
    const userId = req.userData.userId;
    
    let profile;
    try
    {
        profile = await User.findById(userId, '-email -id')    
    }
    catch(err)
    {
        const error = new HttpError('Something Went Wrong, Couldn\'t Update Your Profile', 500);
        return next(error);
    }
    
    if(!profile)
    {
        const error = new HttpError('Couldn\'t Update This Profile', 404);
        return next(error)
    }
    
    const { name, currentPassword, newPassword, bio } = req.body;
    
    profile.name = name;
    
    let isValidPassword = false;
    try
    {
        isValidPassword = await bcrypt.compare(currentPassword, profile.password);
    }
    catch(err)
    {
        const error = new HttpError('Update Profile failed, please try again later.',500);
        return next(error);
    }
    if(!isValidPassword)
    {
        const error = new HttpError('Password Not Correct, please try again later.',500);
        return next(error);
    }
    profle.password = newPassword;
    
    if(req.file.path)
    {
        profile.image = req.file.path;
    }
    
    profile.bio = bio;
    
    try
    {
        await profile.save()
    }
    catch(err)
    {
        const error = new HttpError('Something Went Wrong, Couldn\'t Update Your Profile', 500);
        return next(error);
    }
    
    res.status(200).json({ profile: profile.toObject({ getters: true }) })
}

exports.signup = signup;
exports.login = login;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
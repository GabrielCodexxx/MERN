const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


// @desc Get All Users
// @route GET /users
// @Access private

const getAllUsers = asyncHandler(async (req,res) =>{
    const users = await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({ message: 'No Users Found'})
    }
    res.json(users)
})

// @desc create new user
// @route POST /users
// @Access private

const createNewUser = asyncHandler(async (req,res) =>{
     const {username, password, roles} = req.body
     // Confirm Data
     if (!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({ message: 'All fields are required' })
     }
     // check for duplicates
     const duplicate = await User.findOne({username}).lean().exec()

     if (duplicate){
        return res.status(400).json({ message: 'Duplicate Username' })
     }
     // hash password
    const hashPwd = await bcrypt.hash(password, 10)// salt rounds
    const userObject = {username, "password": hashPwd, roles}
    // create anbd store new user
    const user = await User.create(userObject);
    if (user) {
        res.status(201).json({ message: `New User ${user.username} created` }); 
    } else {
        res.status(400).json({ message: 'Invalid User data received' }); 
    }
})

// @desc UPDATE user
// @route PATCH /users
// @Access private

const updateUser = asyncHandler(async (req,res) =>{
    console.log(req.body); // Check the request body in the logs
    const {id,username,roles,active,password} = req.body
    

    // confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' });
    }
    

    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({ message: 'User not found'})
    }
    // check for duplicate
    const duplicate = await User.findOne({username}).lean().exec()
    //allow updates to the orig user
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({ message: 'Duplicate username'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    //hash pass 
    if (password){
        user.password = await bcrypt.hash(password, 10)
    }
    const updateUser = await user.save()

    res.json({ message: `${updateUser.username} updated` });
})


// @desc DELETE new user
// @route DELETE /users
// @Access private

const deleteUser = asyncHandler(async (req,res) =>{
    const {id} = req.body

    if(!id){
        return res.status(400).json({ message: 'User ID required'})
    }

    const note = await Note.findOne({ user: id}).lean().exec()
    if (note){
        return res.status(400).json({ message: 'User has assigned notes'})
    } 
    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({ message: 'User not found'})
    }

    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result._id} deleted`; 
    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}
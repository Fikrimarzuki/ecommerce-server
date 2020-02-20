const { User } = require('../models')
const { JwtHelper, BcryptHelper } = require('../helpers/index')

class UserController {
   static register (req, res, next) {
      let { name, email, password, RoleId } = req.body
      let input = { name, email, password, RoleId }
      User.create(input, { returning : true })
         .then(user => {
            const token = JwtHelper.generateToken({ id: user.id, email})
            // localStorage.token = token
            res.status(201).json({
               access_token : token,
               msg : 'success register'
            })
         })
         .catch(err => {
            next({
               error : err,
               msg: 'fail register user'
            })
         })
   }

   static login (req, res, next) {
      let { email, password } = req.body
      User.findOne({
         where : {
            email
         }
      })
         .then(user => {
            if(user) {
               console.log('then login user')
               let valid = BcryptHelper.decryptPass(password, user.password)
               if(valid) {
                  console.log('then valid login')
                  const token = JwtHelper.generateToken({ id: user.id, email, RoleId: user.RoleId})
                  // localStorage.token = token
                  res.status(200).json({
                     access_token : token,
                     msg : 'login success'
                  })
               } else {
                  next({
                     error : {
                        name : 'Bad request'
                     },
                     status : 400,
                     msg : 'wrong username/password'
                  })
               }
            } else {
               next({
                  error : {
                     name : 'Bad request'
                  },
                  status : 400,
                  msg : 'wrong username/password'
               })
            }
         })
         .catch(err => {
            next({
               error: err,
               msg: 'wrong username/password'
            })
         })
   }
}


module.exports = UserController
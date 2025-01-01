import { compareSync } from 'bcrypt'
import {
  AuthenticatedUser,
  ChangeUserPasswordRequest,
  RegisterUserRequest,
  ResendCodeResponse,
  User,
  UserJwtPayload,
  UserLoginRequest,
  UserToken,
} from '../@types/user.types'
import { getRandomNumber, hashPassword } from '../utils/hash-password'
import { HttpBadRequest } from '../errors/http-bad-request.error'
import { sign } from 'jsonwebtoken'
import userModel from '../models/user.model'
import configProvider from '../utils/config'
import nodeMailerInstance from '../utils/nodemailer-singleton'
import { HttpForbidden } from '../errors/http-forbidden.error'
import { HttpNotFound } from '../errors/http-not-found.error'
import companyModel from '../models/company.model'
import * as fs from 'fs'
import Handlebars from 'handlebars'
import accountModel from '../models/account.model'
import path from 'path'
import { AccountTypes } from '../@types/account.types'
import { HttpDataConflict } from '../errors/http-data-data-conflict'
import { createAccount, createUser, userExist } from './user.service'
const generateToken = (payload: UserJwtPayload) => {
  return sign({ ...payload, isTemp: false }, configProvider.secretKey, {
    expiresIn: '24h',
  })
}
const generateTempToken = (payload: UserJwtPayload) => {
  return sign({ _id: payload._id, isTemp: true }, configProvider.secretKey, {
    expiresIn: '24h',
  })
}

export const registerUser = async (
  payload: RegisterUserRequest,
): Promise<AuthenticatedUser> => {
  const { email } = payload
  const userExists = await userExist(email)
  if (userExists) {
    throw new HttpDataConflict(
      'This email adress is already associated with an existing account.',
      'email-exists',
    )
  }
  const account = await createAccount({ type: AccountTypes.BASIC })
  const user = await createUser(payload, account)
  if (!user || !user.verificationCode) {
    throw new HttpForbidden('Forbidden')
  }
  await sendVerificationCode(
    user.email,
    user.verificationCode,
    'Votre code d’authentification à usage unique ',
    user.name.split(' ')[0],
  )

  const tokenPayload: UserJwtPayload = {
    _id: user._id,
    accountType: account.type,
    email: user.email,
    name: user.name,
    role: user.role,
  }
  const token = generateTempToken(tokenPayload)
  return {
    token: token,
    _id: user._id,
    active: user.active,
    createdBy: user.createdBy,
    email: user.email,
    name: user.name,
    role: user.role,
    accountType: account.type,
    hasCompany: false,
  }
}

export const authenticateUser = async (
  payload: UserLoginRequest,
): Promise<AuthenticatedUser> => {
  const { email, password } = payload
  const user = await userModel.findOne({
    email,
  })

  if (!user) {
    throw new HttpBadRequest('Your email and/or password are incorrect')
  }

  const isPasswordValid = compareSync(password, user.password)

  if (!isPasswordValid) {
    throw new HttpBadRequest('Your email and/or password are incorrect')
  }
  const account = await accountModel.findById(user.account)
  if (!account) {
    throw new HttpNotFound('User Account Not Found')
  }

  const token = generateToken({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountType: account.type,
  })
  const company = await companyModel.find({ createdBy: user._id })
  return {
    token,
    _id: user._id,
    active: user.active,
    createdBy: user.createdBy,
    email: user.email,
    name: user.name,
    role: user.role,
    accountType: account.type,
    hasCompany: company.length > 0,
  }
}

export const sendVerificationCode = async (
  recieverEmail: string,
  verificationCode: string,
  subject: string,
  name: string,
) => {
  const emailTemplateSource = fs.readFileSync(
    `${path.join(__dirname, '../../public/privates')}/emailTemplate.html`,
    'utf8',
  )
  const template = Handlebars.compile(emailTemplateSource)
  const emailContent = template({
    verificationCode: verificationCode.split(''),
    name,
    email: recieverEmail,
  })

  const mailOptions = {
    from: `Sporkoo <${process.env.SMTP_USERNAME}>`,
    to: recieverEmail,
    subject: subject,
    html: emailContent,
  }
  const transport = nodeMailerInstance.getTransport()

  return new Promise((resolve, reject) => {
    transport.sendMail({ ...mailOptions }, (error, info) => {
      if (error) {
        reject({
          done: false,
          data: error,
        })
      }
      if (info) {
        resolve({
          done: true,
          data: info,
        })
      }
    })
  })
}

export const verifyUser = async (
  id: string,
  code: string,
): Promise<UserToken> => {
  const user = await userModel.findById(id)
  if (!user) {
    throw new HttpNotFound('User not found')
  }
  if (user.verificationCode !== code) {
    throw new HttpForbidden('Code is invalid')
  }
  user.verificationCode = ''
  user.active = true
  await user.save()
  const account = await accountModel.findById(user.account)
  if (!account) {
    throw new HttpNotFound('User Account Not Found')
  }

  return {
    token: generateToken({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountType: account.type,
    }),
  }
}

export const forgetPassword = async (
  email: string,
): Promise<AuthenticatedUser> => {
  const user = await userModel.findOne({ email: email })
  if (!user) {
    throw new HttpNotFound('This email adress does not exist!')
  }
  const code = getRandomNumber(1000, 9999).toString()
  await sendVerificationCode(
    user.email,
    code,
    'This is the Code for changing password',
    user.name.split(' ')[0],
  )
  user.verificationCode = code
  await user.save()
  const userAccount = await accountModel.findById(user.account)
  if (!userAccount) {
    throw new HttpNotFound('User Account Not Found')
  }
  const tokenPayload: UserJwtPayload = {
    _id: user._id,
    accountType: userAccount.type,
    email: user.email,
    name: user.name,
    role: user.role,
  }
  const token = generateTempToken(tokenPayload)
  return {
    token: token,
    _id: user._id,
    active: user.active,
    createdBy: user.createdBy,
    email: user.email,
    name: user.name,
    role: user.role,
    accountType: userAccount.type,
    hasCompany: false,
  }
}

export const changeUserPassword = async (
  payload: ChangeUserPasswordRequest,
  userId: string,
): Promise<User> => {
  const user = await userModel.findById(userId)
  if (!user) {
    throw new HttpNotFound('User not found')
  }
  const hashedPassword = await hashPassword(payload.password)
  user.password = hashedPassword
  const updatedUser = user.save()
  return updatedUser
}

export const resendCode = async (
  userId: string,
): Promise<ResendCodeResponse> => {
  const user = await userModel.findById(userId)
  if (!user) {
    throw new HttpNotFound('user not found')
  }
  if (!user.verificationCode) {
    throw new HttpForbidden('User already verified')
  }
  await sendVerificationCode(
    user.email,
    user.verificationCode,
    'Votre code d’authentification à usage unique ',
    user.name.split(' ')[0],
  )
  return { message: 'Code sent, check your email.' }
}

export const authenticateRegisteredUser = async (
  userId: string,
): Promise<AuthenticatedUser> => {
  const user = await userModel.findById(userId)
  if (!user) {
    throw new HttpNotFound('User not found')
  }
  const account = await accountModel.findById(user.account)
  if (!account) {
    throw new HttpNotFound('User Account Not Found')
  }

  const token = generateToken({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountType: account.type,
  })
  const company = await companyModel.find({ createdBy: user._id })
  return {
    token,
    _id: user._id,
    active: user.active,
    createdBy: user.createdBy,
    email: user.email,
    name: user.name,
    role: user.role,
    accountType: account.type,
    hasCompany: company.length > 0,
  }
}

import {
  Account,
  AccountTypes,
  CreateUserAccountRequest,
} from '../@types/account.types'
import {
  CreateManager,
  RegisterUserRequest,
  UpdateManager,
  User,
} from '../@types/user.types'
import { HttpBadRequest } from '../errors/http-bad-request.error'
import { HttpForbidden } from '../errors/http-forbidden.error'
import { HttpNotFound } from '../errors/http-not-found.error'
import accountModel from '../models/account.model'
import userModel from '../models/user.model'
import { getRandomNumber, hashPassword } from '../utils/hash-password'

export const createManager = async (payload: CreateManager): Promise<User> => {
  const { email } = payload
  const userExists = await userExist(email)
  if (userExists) {
    throw new HttpBadRequest(
      'This email adress is already associated with an existing account.',
    )
  }
  const account = await createAccount({ type: AccountTypes.BASIC })
  return createUser(payload, account)
}

export const getUsers = async (id: string): Promise<User[]> => {
  return await userModel.find({ createdBy: id })
}

export const updateManager = async (
  payload: UpdateManager,
  id: string,
): Promise<User> => {
  const updateManagerResponse = await userModel.findByIdAndUpdate(id, payload)
  if (!updateManagerResponse) {
    throw new HttpNotFound('Manager Not Found')
  }
  return updateManagerResponse
}

export const deleteManager = async (id: string) => {
  const response = await userModel.deleteOne({ _id: id })
  if (!response || response.deletedCount === 0) {
    throw new HttpNotFound('Company Not Found')
  }

  return response
}

export const getManagers = async (id: string) => {
  return userModel.find({ createdBy: id, role: 'manager' })
}

export const getUserById = async (id: string): Promise<User> => {
  const user = await userModel.findById(id)
  if (!user) {
    throw new HttpNotFound('User Not Found')
  }
  return user
}

export const checkUserIsOwner = async (_id: string) => {
  const user = await userModel.findById(_id)
  if (!user) {
    throw new HttpNotFound('Manager not found')
  }
  if (user.role !== 'owner') {
    throw new HttpForbidden('Forbidden')
  }
}
export const getUsersForSuperAdmin = async (): Promise<User[]> => {
  return await userModel.find()
}

export const userExist = async (email: string): Promise<boolean> => {
  const user = await userModel.findOne({
    email,
  })
  if (!user) {
    return false
  }
  return true
}

export const createAccount = async (
  payload: CreateUserAccountRequest,
): Promise<Account> => {
  const account = await accountModel.create({ type: payload.type })
  if (!account) {
    throw new HttpBadRequest('Account not created')
  }
  return account
}

export const createUser = async (
  payload: RegisterUserRequest | CreateManager,
  account: Account,
): Promise<User> => {
  const hashedPassword = await hashPassword(payload.password)
  const verificationCode = getRandomNumber(1000, 9999)
  const user = await userModel.create({
    ...payload,
    password: hashedPassword,
    verificationCode,
    account,
  })

  return user
}

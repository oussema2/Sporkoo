import { ObjectId } from 'mongodb'
import { Branch } from '../@types/branch.types'
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../@types/company.types'
import { HttpNotFound } from '../errors/http-not-found.error'
import accountModel from '../models/account.model'
import companyModel from '../models/company.model'
import userModel from '../models/user.model'
import { getBranchesByCompany } from './branch.service'

export const createCompany = async (
  payload: CreateCompanyRequest,
  userId: string,
) => {
  const user = await userModel.findById(userId)
  if (!user) {
    throw new HttpNotFound('User not found')
  }
  const account = await accountModel.findById(user.account)
  if (!account) {
    throw new HttpNotFound('Account not found')
  }
  return await companyModel.create({
    ...payload,
    createdBy: user._id,
    account: user.account,
  })
}

export const getCompany = async (id: string) => {
  const company = await companyModel.findById(id).lean()
  if (!company) {
    throw new HttpNotFound('Company not found')
  }
  return company
}

export const getCompanies = async (userId: ObjectId) => {
  const user = await userModel.findById(userId)
  if (!user) {
    throw new HttpNotFound('User Not found')
  }
  const companies = await companyModel.find({ createdBy: user._id }).lean()
  const companiesWithBranches = []
  for (let i = 0; i < companies.length; i++) {
    const company: Company = companies[i]
    const branches = await getBranchesByCompany(company._id.toString())
    companiesWithBranches.push({
      ...company,
      branches: branches,
    })
  }

  return companiesWithBranches
}

export const getCompayByIdWithBranches = async (
  companyId: string,
): Promise<Company & { branches: Branch[] }> => {
  const company = await companyModel.findById(companyId).lean()
  if (!company) {
    throw new HttpNotFound('Company not found')
  }
  const branches = await getBranchesByCompany(company._id.toString())
  return { ...company, branches: branches }
}

export const updateCompany = async (
  payload: UpdateCompanyRequest,
  id: string,
) => {
  const updateResponse = await companyModel.findByIdAndUpdate(id, payload, {
    new: true,
  })
  if (!updateResponse) {
    throw new HttpNotFound('Company not found')
  }
  return updateResponse
}

export const deleteCompany = async (id: string) => {
  const response = await companyModel.findOneAndDelete({ _id: id })
  if (!response) {
    throw new HttpNotFound('Company not found')
  }

  return response
}

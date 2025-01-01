import { DeleteResult, ObjectId } from 'mongodb'
import {
  Branch,
  CreateBranchRequest,
  CreateWifiRequest,
  UpdateBranchRequest,
} from '../@types/branch.types'
import { HttpNotFound } from '../errors/http-not-found.error'
import branchModel from '../models/branch.model'
import { HttpForbidden } from '../errors/http-forbidden.error'
import companyModel from '../models/company.model'
import userModel from '../models/user.model'
import { Company } from '../@types/company.types'

export function isCompany(value: ObjectId | Company): value is Company {
  return value && typeof value === 'object' && 'user' in value
}

export const checkUserIsRelatedToBranch = async (
  userId: string,
  branchId: string,
): Promise<void> => {
  const branch = await branchModel.findById(branchId).populate('company')
  if (!branch) {
    throw new HttpNotFound('branch not found')
  }

  if (!isCompany(branch.company)) {
    throw new Error('Cannot retrieve company')
  }

  const managers = branch.managers
  const company = branch.company
  const isManager = managers.includes(new ObjectId(userId))
  const isOwner = userId === company.createdBy.toString()
  if (!isManager && !isOwner) {
    throw new HttpForbidden('Forbidden')
  }
}

export const createBranch = async (payload: CreateBranchRequest) => {
  await checkCompanyExist(payload.company.toString())
  return await branchModel.create(payload)
}
export const updateBranch = async (
  branchId: string,
  payload: UpdateBranchRequest,
  userId: string,
): Promise<Branch> => {
  await checkBranchOwner(userId, branchId)
  const updateResponse = await branchModel.findByIdAndUpdate(
    branchId,
    payload,
    { new: true },
  )
  if (!updateResponse) {
    throw new HttpNotFound('Branch not found')
  }
  return updateResponse
}

export const deleteBranch = async (
  id: string,
  userId: string,
): Promise<DeleteResult> => {
  await checkBranchOwner(userId, id)
  const response = await branchModel.deleteOne({ _id: id })
  if (!response || response.deletedCount === 0) {
    throw new HttpNotFound('Branch not found')
  }
  return response
}
export const getBranchById = async (
  id: string,
  userId: string,
): Promise<Branch> => {
  await checkBranchOwner(userId, id)
  const branch = await branchModel.findOne({ _id: id }).populate('company')
  if (!branch) {
    throw new HttpNotFound('Branch not found')
  }
  return branch
}

export const addManager = async (
  branchId: string,
  managerId: string,
  userId: string,
): Promise<Branch> => {
  await checkBranchOwner(userId, branchId)
  await checkUserIsManager(managerId)
  const addManagerResponse = await branchModel.findByIdAndUpdate(
    branchId,
    {
      $push: { managers: managerId },
    },
    { new: true },
  )
  if (!addManagerResponse) {
    throw new HttpNotFound('Branch not found')
  }
  return addManagerResponse
}
export const checkBranchOwner = async (
  userId: string,
  branchId: string,
): Promise<void> => {
  const branch = await branchModel
    .findById({ _id: branchId })
    .populate('company')
  if (!branch) {
    throw new HttpNotFound('Branch Not Found')
  }
  if (branch.company instanceof ObjectId) {
    throw new HttpForbidden('Forbidden')
  }
  if (branch.company.createdBy.toString() !== userId) {
    throw new HttpForbidden('Forbidden')
  }
}
export const checkCompanyExist = async (_id: string) => {
  const company = await companyModel.findById(_id)
  if (!company) {
    throw new HttpNotFound('Company not found')
  }
}

export const checkUserIsManager = async (_id: string) => {
  const user = await userModel.findById(_id)
  if (!user) {
    throw new HttpNotFound('Manager not found')
  }
  if (user.role !== 'manager') {
    throw new HttpForbidden('Forbidden')
  }
}

export const addWifiToBranch = async (
  branchId: string,
  payload: CreateWifiRequest,
): Promise<Branch> => {
  const addWifiResponse = await branchModel.findByIdAndUpdate(
    branchId,
    {
      $push: { wifis: payload },
    },
    { new: true },
  )
  if (!addWifiResponse) {
    throw new HttpNotFound('Branch not found')
  }
  return addWifiResponse
}

export const getBranchesByCompany = async (
  companyId: string,
): Promise<Branch[]> => {
  return await branchModel.find({ company: companyId })
}

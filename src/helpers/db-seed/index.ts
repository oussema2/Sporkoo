import { registerUser } from '../../services/auth.service'
import { addManager, createBranch } from '../../services/branch.service'
import { createCompany } from '../../services/company.service'
import { createManager } from '../../services/user.service'

export default async function dbSeed() {
  const admin = await registerUser({
    name: 'super admin',
    email: 'admin@esperoo.fr',
    password: '12345678',
  })

  const company = await createCompany(
    {
      name: 'Esperoo',
      adress: 'Random Street 7',
    },
    admin._id.toString(),
  )

  const branch = await createBranch({
    name: 'Esperoo Tunis',
    company: company._id,
    adress: 'Random Street 7',
    phone: '123456789',
  })

  const manager = await createManager({
    name: 'super manager',
    email: 'manager@esperoo.fr',
    password: '12345678',
    createdBy: admin._id,
  })

  await addManager(
    branch._id.toString(),
    manager._id.toString(),
    admin._id.toString(),
  )
}

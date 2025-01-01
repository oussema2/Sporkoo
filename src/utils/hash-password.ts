import { genSalt, hash } from 'bcrypt'

export const hashPassword = async (pass: string): Promise<string> => {
  const salt = await genSalt(10)
  return await hash(pass, salt)
}

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

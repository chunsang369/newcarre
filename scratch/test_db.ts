import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const brands = await prisma.brand.count()
    console.log('Successfully connected to DB. Brand count:', brands)
    const cars = await prisma.car.count()
    console.log('Car count:', cars)
  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

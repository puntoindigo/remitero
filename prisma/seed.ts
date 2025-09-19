import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Crear SUPERADMIN
  const hashedPassword = await bcrypt.hash("daedae123", 12)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@remitero.com" },
    update: {},
    create: {
      email: "admin@remitero.com",
      password: hashedPassword,
      name: "Administrador",
      role: "SUPERADMIN",
      address: "Dirección del administrador",
      phone: "+54 11 1234-5678"
    }
  })

  console.log("SuperAdmin creado:", superAdmin.email)

  // Crear empresa demo
  const company = await prisma.company.upsert({
    where: { name: "Empresa Demo" },
    update: {},
    create: {
      name: "Empresa Demo"
    }
  })

  console.log("Empresa creada:", company.name)

  // Crear ADMIN para la empresa demo
  const adminPassword = await bcrypt.hash("admin123", 12)
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@empresademo.com" },
    update: {},
    create: {
      email: "admin@empresademo.com",
      password: adminPassword,
      name: "Admin Empresa Demo",
      role: "ADMIN",
      companyId: company.id,
      address: "Dirección de la empresa",
      phone: "+54 11 9876-5432"
    }
  })

  console.log("Admin de empresa creado:", admin.email)

  // Crear categorías de ejemplo
  const categorias = [
    { name: "Bebidas" },
    { name: "Alimentos" },
    { name: "Limpieza" },
    { name: "Oficina" }
  ]

  for (const cat of categorias) {
    await prisma.category.upsert({
      where: { 
        companyId_name: { 
          companyId: company.id, 
          name: cat.name 
        } 
      },
      update: {},
      create: {
        name: cat.name,
        companyId: company.id
      }
    })
  }

  console.log("Categorías creadas")

  // Crear productos de ejemplo
  const bebidas = await prisma.category.findFirst({
    where: { name: "Bebidas", companyId: company.id }
  })

  const productos = [
    { name: "Coca Cola 500ml", description: "Bebida gaseosa", price: 800, categoryId: bebidas?.id },
    { name: "Agua Mineral 500ml", description: "Agua mineral natural", price: 500, categoryId: bebidas?.id },
    { name: "Café Instantáneo", description: "Café soluble", price: 1200, categoryId: null },
    { name: "Azúcar 1kg", description: "Azúcar refinada", price: 600, categoryId: null }
  ]

  for (const prod of productos) {
    await prisma.product.upsert({
      where: { 
        companyId_name: { 
          companyId: company.id, 
          name: prod.name 
        } 
      },
      update: {},
      create: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        companyId: company.id,
        categoryId: prod.categoryId
      }
    })
  }

  console.log("Productos creados")

  // Crear clientes de ejemplo
  const clientes = [
    { name: "Cliente A", address: "Av. Corrientes 1234", phone: "+54 11 1111-1111", email: "clientea@email.com" },
    { name: "Cliente B", address: "Av. Santa Fe 5678", phone: "+54 11 2222-2222", email: "clienteb@email.com" },
    { name: "Cliente C", address: "Av. Rivadavia 9012", phone: "+54 11 3333-3333", email: "clientec@email.com" }
  ]

  for (const cli of clientes) {
    await prisma.client.upsert({
      where: { 
        companyId_name: { 
          companyId: company.id, 
          name: cli.name 
        } 
      },
      update: {},
      create: {
        name: cli.name,
        address: cli.address,
        phone: cli.phone,
        email: cli.email,
        companyId: company.id
      }
    })
  }

  console.log("Clientes creados")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

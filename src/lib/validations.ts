import { z } from "zod"

export const userSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "USER"]),
  address: z.string().optional(),
  phone: z.string().optional(),
  companyId: z.string().optional()
})

export const companySchema = z.object({
  name: z.string().min(1, "Nombre de empresa requerido")
})

export const categorySchema = z.object({
  name: z.string().min(1, "Nombre de categoría requerido")
})

export const productSchema = z.object({
  name: z.string().min(1, "Nombre de producto requerido"),
  description: z.string().optional(),
  price: z.number().min(0, "Precio debe ser mayor a 0"),
  categoryId: z.string().optional()
})

export const clientSchema = z.object({
  name: z.string().min(1, "Nombre de cliente requerido"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional()
})

export const remitoSchema = z.object({
  clientId: z.string().min(1, "Cliente requerido"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().optional(),
    productName: z.string().min(1, "Nombre de producto requerido"),
    productDesc: z.string().optional(),
    quantity: z.number().min(1, "Cantidad debe ser mayor a 0"),
    unitPrice: z.number().min(0, "Precio unitario debe ser mayor a 0"),
    lineTotal: z.number().min(0, "Total de línea debe ser mayor a 0")
  })).min(1, "Debe agregar al menos un producto")
}).strict()

export const statusChangeSchema = z.object({
  status: z.enum(["PENDIENTE", "PREPARADO", "ENTREGADO"])
})

export type UserForm = z.infer<typeof userSchema>
export type CompanyForm = z.infer<typeof companySchema>
export type CategoryForm = z.infer<typeof categorySchema>
export type ProductForm = z.infer<typeof productSchema>
export type ClientForm = z.infer<typeof clientSchema>
export type RemitoForm = z.infer<typeof remitoSchema>
export type StatusChangeForm = z.infer<typeof statusChangeSchema>

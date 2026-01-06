import { z } from "zod"

export const userSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password debe tener al menos 6 caracteres").optional().or(z.literal("")),
  role: z.enum(["SUPERADMIN", "ADMIN", "USER"]),
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
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Precio requerido"),
  categoryId: z.string().min(1, "Categoría requerida"),
  stock: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
  imageUrl: z.string().url("URL de imagen inválida").optional().or(z.literal(""))
})

export const clientSchema = z.object({
  name: z.string().min(1, "Nombre de cliente requerido"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional()
})

export const remitoSchema = z.object({
  clientId: z.string().min(1, "Cliente requerido"),
  status: z.string().min(1, "Estado requerido"),
  notes: z.string().optional().or(z.literal("")),
  shippingCost: z.number().min(0).optional().default(0),
  previousBalance: z.number().min(0).optional().default(0),
  accountPayment: z.number().min(0).optional().default(0)
  // items se maneja separadamente en el estado del componente
})

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

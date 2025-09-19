import { ProductForm } from "@/lib/validations"

export class ProductService {
  static async getProducts(companyId: string) {
    const response = await fetch("/api/products")
    if (!response.ok) {
      throw new Error("Error al cargar los productos")
    }
    return await response.json()
  }

  static async createProduct(data: ProductForm & { companyId: string }) {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al crear el producto")
    }
    
    return await response.json()
  }

  static async updateProduct(id: string, data: ProductForm, companyId: string) {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar el producto")
    }
    
    return await response.json()
  }

  static async deleteProduct(id: string, companyId: string) {
    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE"
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al eliminar el producto")
    }
    
    return await response.json()
  }

  static async getProductById(id: string, companyId: string) {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) {
      throw new Error("Error al cargar el producto")
    }
    return await response.json()
  }
}

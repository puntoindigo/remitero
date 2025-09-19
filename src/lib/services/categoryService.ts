import { CategoryForm } from "@/lib/validations"

export class CategoryService {
  static async getCategories(companyId: string) {
    const response = await fetch("/api/categories")
    if (!response.ok) {
      throw new Error("Error al cargar las categorías")
    }
    return await response.json()
  }

  static async createCategory(data: CategoryForm & { companyId: string }) {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al crear la categoría")
    }
    
    return await response.json()
  }

  static async updateCategory(id: string, data: CategoryForm, companyId: string) {
    const response = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar la categoría")
    }
    
    return await response.json()
  }

  static async deleteCategory(id: string, companyId: string) {
    const response = await fetch(`/api/categories/${id}`, {
      method: "DELETE"
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al eliminar la categoría")
    }
    
    return await response.json()
  }
}

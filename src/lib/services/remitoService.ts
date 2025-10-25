import { RemitoForm } from "@/lib/validations"

export class RemitoService {
  static async getRemitos(companyId: string) {
    const response = await fetch("/api/remitos").catch(error => {
            console.error('Network error:', error);
            throw new Error("Error de conexión de red");
        })
    if (!response.ok) {
      throw new Error("Error al cargar los remitos")
    }
    return await response.json()
  }

  static async createRemito(data: RemitoForm & { companyId: string, createdById: string }) {
    const response = await fetch("/api/remitos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error("Error de conexión de red");
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al crear el remito")
    }
    
    return await response.json()
  }

  static async getRemitoById(id: string, companyId: string) {
    const response = await fetch(`/api/remitos/${id}`).catch(error => {
            console.error('Network error:', error);
            throw new Error("Error de conexión de red");
        })
    if (!response.ok) {
      throw new Error("Error al cargar el remito")
    }
    return await response.json()
  }

  static async updateRemitoStatus(
    id: string, 
    status: "PENDIENTE" | "PREPARADO" | "ENTREGADO", 
    companyId: string,
    byUserId: string
  ) {
    const response = await fetch(`/api/remitos/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    }).catch(error => {
      console.error('Network error:', error);
      throw new Error("Error de conexión de red");
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al actualizar el estado del remito")
    }
    
    return await response.json()
  }

  static async deleteRemito(id: string, companyId: string) {
    const response = await fetch(`/api/remitos/${id}`, {
      method: "DELETE"
    }).catch(error => {
            console.error('Network error:', error);
            throw new Error("Error de conexión de red");
        })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al eliminar el remito")
    }
    
    return await response.json()
  }
}

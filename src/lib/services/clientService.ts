import { ClientForm } from "@/lib/validations"

export class ClientService {
  static async getClients(companyId: string) {
    const response = await fetch("/api/clients").catch(error => {
            console.error('Network error:', error);
            throw new Error("Error de conexión de red");
        })
    if (!response.ok) {
      throw new Error("Error al cargar los clientes")
    }
    return await response.json()
  }

  static async createClient(data: ClientForm & { companyId: string }) {
    const response = await fetch("/api/clients", {
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
      throw new Error(error.error || "Error al crear el cliente")
    }
    
    return await response.json()
  }

  static async updateClient(id: string, data: ClientForm, companyId: string) {
    const response = await fetch(`/api/clients/${id}`, {
      method: "PUT",
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
      throw new Error(error.error || "Error al actualizar el cliente")
    }
    
    return await response.json()
  }

  static async deleteClient(id: string, companyId: string) {
    const response = await fetch(`/api/clients/${id}`, {
      method: "DELETE"
    }).catch(error => {
            console.error('Network error:', error);
            throw new Error("Error de conexión de red");
        })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al eliminar el cliente")
    }
    
    return await response.json()
  }

  static async getClientById(id: string, companyId: string) {
    const response = await fetch(`/api/clients/${id}`).catch(error => {
            console.error('Network error:', error);
            throw new Error("Error de conexión de red");
        })
    if (!response.ok) {
      throw new Error("Error al cargar el cliente")
    }
    return await response.json()
  }
}

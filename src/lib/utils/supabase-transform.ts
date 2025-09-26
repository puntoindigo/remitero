// Utility functions to transform Supabase data to frontend format

export function transformUser(user: any) {
  if (!user) return null;
  
  return {
    ...user,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    companyId: user.company_id,
    company: user.companies
  };
}

export function transformProduct(product: any) {
  if (!product) return null;
  
  return {
    ...product,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    companyId: product.company_id,
    categoryId: product.category_id,
    category: product.categories
  };
}

export function transformCategory(category: any) {
  if (!category) return null;
  
  return {
    ...category,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
    companyId: category.company_id,
    company: category.companies,
    _count: {
      products: category.products?.length || 0
    }
  };
}

export function transformClient(client: any) {
  if (!client) return null;
  
  return {
    ...client,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
    companyId: client.company_id,
    company: client.companies,
    remitos: client.remitos || []
  };
}

export function transformCompany(company: any) {
  if (!company) return null;
  
  return {
    ...company,
    createdAt: company.created_at,
    updatedAt: company.updated_at
  };
}

export function transformRemito(remito: any) {
  if (!remito) return null;
  
  // Calcular el total de manera segura
  let total = 0;
  if (remito.remito_items && Array.isArray(remito.remito_items)) {
    total = remito.remito_items.reduce((sum: number, item: any) => {
      return sum + (item.line_total || 0);
    }, 0);
  }
  
  return {
    ...remito,
    createdAt: remito.created_at,
    updatedAt: remito.updated_at,
    companyId: remito.company_id,
    clientId: remito.client_id,
    createdById: remito.created_by_id,
    statusAt: remito.status_at,
    client: remito.clients,
    user: remito.users,
    total: total,
    remitoItems: remito.remito_items || [],
    statusHistory: remito.status_history || []
  };
}

// Transform arrays of data
export function transformUsers(users: any[]) {
  return users.map(transformUser).filter(Boolean);
}

export function transformProducts(products: any[]) {
  return products.map(transformProduct).filter(Boolean);
}

export function transformCategories(categories: any[]) {
  return categories.map(transformCategory).filter(Boolean);
}

export function transformClients(clients: any[]) {
  return clients.map(transformClient).filter(Boolean);
}

export function transformCompanies(companies: any[]) {
  return companies.map(transformCompany).filter(Boolean);
}

export function transformRemitos(remitos: any[]) {
  return remitos.map(transformRemito).filter(Boolean);
}

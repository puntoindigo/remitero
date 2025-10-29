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
  
  // Usar _productsCount si está disponible (optimizado), sino calcular de products array
  const productsCount = category._productsCount !== undefined 
    ? category._productsCount 
    : (category.products?.length || 0);
  
  return {
    ...category,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
    companyId: category.company_id,
    company: category.companies,
    _count: {
      products: productsCount
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
      const lineTotal = item.line_total || item.lineTotal || 0;
      return sum + (typeof lineTotal === 'number' ? lineTotal : 0);
    }, 0);
  }
  
  // Asegurar que los items tengan product_id
  const remitoItems = (remito.remito_items || []).map((item: any) => ({
    ...item,
    product_id: item.product_id || item.products?.id || null
  }));

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
    status: remito.estados_remitos, // Ahora es un objeto con los datos del estado
    total: total,
    remitoItems: remitoItems,
    items: remitoItems, // También como 'items' para compatibilidad
    statusHistory: [] // Ya no existe status_history
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
  if (!Array.isArray(remitos)) {
    console.warn('transformRemitos: remitos is not an array:', remitos);
    return [];
  }
  return remitos.map(transformRemito).filter(Boolean);
}

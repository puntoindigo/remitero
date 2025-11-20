import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { transformCompany } from "@/lib/utils/supabase-transform";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user) {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "Sesión no encontrada. Por favor, inicia sesión." 
      }, { status: 401 });
    }

    // Solo SUPERADMIN puede duplicar empresas
    if (session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ 
        error: "No autorizado", 
        message: "No tienes permisos para duplicar empresas." 
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, estados, categorias, productos, clientes, remitos, usuarios } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Nombre requerido", 
        message: "El nombre de la empresa es requerido." 
      }, { status: 400 });
    }

    // Obtener la empresa original
    const { data: originalCompany, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (companyError || !originalCompany) {
      return NextResponse.json({ 
        error: "Empresa no encontrada", 
        message: "La empresa a duplicar no existe." 
      }, { status: 404 });
    }

    // Verificar que no exista una empresa con el mismo nombre
    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existingCompany) {
      return NextResponse.json({ 
        error: "Empresa duplicada", 
        message: "Ya existe una empresa con ese nombre." 
      }, { status: 400 });
    }

    // Crear la nueva empresa
    const { data: newCompany, error: createError } = await supabaseAdmin
      .from('companies')
      .insert([{
        name: name.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError || !newCompany) {
      console.error('Error creating company:', createError);
      return NextResponse.json({ 
        error: "Error interno del servidor",
        message: "No se pudo crear la empresa."
      }, { status: 500 });
    }

    const newCompanyId = newCompany.id;

    // Duplicar estados si está seleccionado
    if (estados) {
      const { data: originalEstados } = await supabaseAdmin
        .from('estados_remitos')
        .select('*')
        .eq('company_id', id);

      if (originalEstados && originalEstados.length > 0) {
        const estadosToInsert = originalEstados.map(estado => ({
          company_id: newCompanyId,
          name: estado.name,
          description: estado.description,
          color: estado.color,
          icon: estado.icon,
          is_active: estado.is_active,
          is_default: estado.is_default,
          sort_order: estado.sort_order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabaseAdmin
          .from('estados_remitos')
          .insert(estadosToInsert);
      }
    } else {
      // Si no se duplican estados, crear los estados por defecto
      const defaultEstados = [
        {
          name: 'Pendiente',
          description: 'Remito creado, esperando procesamiento',
          color: '#f59e0b',
          icon: '⏰',
          is_active: true,
          is_default: true,
          sort_order: 1
        },
        {
          name: 'Preparado',
          description: 'Remito preparado para entrega',
          color: '#10b981',
          icon: '✅',
          is_active: true,
          is_default: false,
          sort_order: 2
        },
        {
          name: 'Entregado',
          description: 'Remito entregado al cliente',
          color: '#3b82f6',
          icon: '🚚',
          is_active: true,
          is_default: false,
          sort_order: 3
        },
        {
          name: 'Cancelado',
          description: 'Remito cancelado',
          color: '#ef4444',
          icon: '❌',
          is_active: true,
          is_default: false,
          sort_order: 4
        }
      ];

      const estadosToInsert = defaultEstados.map(estado => ({
        company_id: newCompanyId,
        name: estado.name,
        description: estado.description,
        color: estado.color,
        icon: estado.icon,
        is_active: estado.is_active,
        is_default: estado.is_default,
        sort_order: estado.sort_order
      }));

      await supabaseAdmin
        .from('estados_remitos')
        .insert(estadosToInsert);
    }

    // Duplicar categorías si está seleccionado
    if (categorias) {
      const { data: originalCategorias } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('company_id', id);

      if (originalCategorias && originalCategorias.length > 0) {
        const categoriasToInsert = originalCategorias.map(categoria => ({
          company_id: newCompanyId,
          name: categoria.name,
          description: categoria.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabaseAdmin
          .from('categories')
          .insert(categoriasToInsert);
      }
    }

    // Duplicar productos si está seleccionado
    if (productos) {
      const { data: originalProductos } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('company_id', id);

      if (originalProductos && originalProductos.length > 0) {
        // Primero necesitamos mapear las categorías si también se duplicaron
        const categoryMap = new Map<string, string>();
        if (categorias) {
          const { data: originalCategorias } = await supabaseAdmin
            .from('categories')
            .select('id, name')
            .eq('company_id', id);
          const { data: newCategorias } = await supabaseAdmin
            .from('categories')
            .select('id, name')
            .eq('company_id', newCompanyId);

          if (originalCategorias && newCategorias) {
            originalCategorias.forEach((orig, index) => {
              if (newCategorias[index]) {
                categoryMap.set(orig.id, newCategorias[index].id);
              }
            });
          }
        }

        const productosToInsert = originalProductos.map(producto => ({
          company_id: newCompanyId,
          name: producto.name,
          description: producto.description,
          price: producto.price,
          stock: producto.stock,
          category_id: categorias ? categoryMap.get(producto.category_id) || null : producto.category_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabaseAdmin
          .from('products')
          .insert(productosToInsert);
      }
    }

    // Duplicar clientes si está seleccionado
    if (clientes) {
      const { data: originalClientes } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('company_id', id);

      if (originalClientes && originalClientes.length > 0) {
        const clientesToInsert = originalClientes.map(cliente => ({
          company_id: newCompanyId,
          name: cliente.name,
          email: cliente.email,
          phone: cliente.phone,
          address: cliente.address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabaseAdmin
          .from('clients')
          .insert(clientesToInsert);
      }
    }

    // Duplicar remitos si está seleccionado
    if (remitos) {
      const { data: originalRemitos } = await supabaseAdmin
        .from('remitos')
        .select('*')
        .eq('company_id', id);

      if (originalRemitos && originalRemitos.length > 0) {
        // Mapear clientes si también se duplicaron
        const clientMap = new Map<string, string>();
        if (clientes) {
          const { data: originalClientes } = await supabaseAdmin
            .from('clients')
            .select('id, name')
            .eq('company_id', id);
          const { data: newClientes } = await supabaseAdmin
            .from('clients')
            .select('id, name')
            .eq('company_id', newCompanyId);

          if (originalClientes && newClientes) {
            originalClientes.forEach((orig, index) => {
              if (newClientes[index]) {
                clientMap.set(orig.id, newClientes[index].id);
              }
            });
          }
        }

        // Mapear estados
        const estadoMap = new Map<string, string>();
        const { data: originalEstados } = await supabaseAdmin
          .from('estados_remitos')
          .select('id, name')
          .eq('company_id', id);
        const { data: newEstados } = await supabaseAdmin
          .from('estados_remitos')
          .select('id, name')
          .eq('company_id', newCompanyId);

        if (originalEstados && newEstados) {
          originalEstados.forEach((orig) => {
            const matching = newEstados.find(n => n.name === orig.name);
            if (matching) {
              estadoMap.set(orig.id, matching.id);
            }
          });
        }

        const remitosToInsert = originalRemitos.map(remito => ({
          company_id: newCompanyId,
          number: remito.number,
          client_id: clientes ? (clientMap.get(remito.client_id) || null) : remito.client_id,
          status: estadoMap.get(remito.status) || remito.status,
          notes: remito.notes,
          created_by_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { data: newRemitos } = await supabaseAdmin
          .from('remitos')
          .insert(remitosToInsert)
          .select('id');

        // Duplicar items de remitos
        if (newRemitos && newRemitos.length > 0) {
          const remitoMap = new Map<string, string>();
          originalRemitos.forEach((orig, index) => {
            if (newRemitos[index]) {
              remitoMap.set(orig.id, newRemitos[index].id);
            }
          });

          // Obtener todos los items de los remitos originales
          const { data: originalItems } = await supabaseAdmin
            .from('remito_items')
            .select('*')
            .in('remito_id', originalRemitos.map(r => r.id));

          if (originalItems && originalItems.length > 0) {
            // Mapear productos si también se duplicaron
            const productMap = new Map<string, string>();
            if (productos) {
              const { data: originalProductos } = await supabaseAdmin
                .from('products')
                .select('id, name')
                .eq('company_id', id);
              const { data: newProductos } = await supabaseAdmin
                .from('products')
                .select('id, name')
                .eq('company_id', newCompanyId);

              if (originalProductos && newProductos) {
                originalProductos.forEach((orig, index) => {
                  if (newProductos[index]) {
                    productMap.set(orig.id, newProductos[index].id);
                  }
                });
              }
            }

            const itemsToInsert = originalItems.map(item => ({
              remito_id: remitoMap.get(item.remito_id) || null,
              product_id: productos ? (productMap.get(item.product_id) || null) : item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              line_total: item.line_total,
              product_name: item.product_name,
              product_desc: item.product_desc,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));

            await supabaseAdmin
              .from('remito_items')
              .insert(itemsToInsert);
          }
        }
      }
    }

    // Duplicar usuarios si está seleccionado
    if (usuarios) {
      const { data: originalUsers } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('company_id', id);

      if (originalUsers && originalUsers.length > 0) {
        const usersToInsert = originalUsers.map(user => ({
          name: user.name,
          email: user.email,
          role: user.role,
          company_id: newCompanyId,
          phone: user.phone,
          address: user.address,
          password: null, // No copiar contraseñas
          has_temporary_password: true,
          is_active: user.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabaseAdmin
          .from('users')
          .insert(usersToInsert);
      }
    }

    return NextResponse.json(transformCompany(newCompany), { status: 201 });
  } catch (error: any) {
    console.error('Error duplicating company:', error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      message: error.message || "Ocurrió un error al duplicar la empresa."
    }, { status: 500 });
  }
}


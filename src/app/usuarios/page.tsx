import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { formatDate } from "@/lib/utils/formatters";

const prisma = new PrismaClient();

export default async function UsuariosPage({ searchParams }: { searchParams?: { companyId?: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    redirect("/auth/login");
  }

  const filterCompanyId = searchParams?.companyId;

  const users = await prisma.user.findMany({
    where: {
      companyId: filterCompanyId || (session.user.role === "ADMIN" ? session.user.companyId : undefined),
    },
    include: {
      company: true,
    },
    orderBy: { name: "asc" },
  });

  const companies = session.user.role === "SUPERADMIN"
    ? await prisma.company.findMany({ orderBy: { name: "asc" } })
    : [];

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Usuarios</h2>
        {filterCompanyId && (
          <p>Mostrando usuarios de la empresa seleccionada</p>
        )}
        
        <div className="form-section">
          <h3>Crear Nuevo Usuario</h3>
          <form>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" placeholder="Nombre del usuario" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="email@ejemplo.com" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contraseña</label>
                <input type="password" placeholder="Contraseña" />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select>
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                  {session.user.role === "SUPERADMIN" && <option value="SUPERADMIN">Super Admin</option>}
                </select>
              </div>
            </div>
            {session.user.role === "SUPERADMIN" && (
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <select defaultValue={filterCompanyId || ""}>
                    <option value="">Seleccionar Empresa</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="form-actions">
              <button type="submit">Crear Usuario</button>
            </div>
          </form>
        </div>

        <div className="form-section">
          <h3>Lista de Usuarios</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Empresa</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.company?.name || "N/A"}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <button className="small">Editar</button>
                    <button className="small danger">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

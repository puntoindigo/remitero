import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { formatDate } from "@/lib/utils/formatters";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function EmpresasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="main-content">
      <section className="form-section">
        <h2>Gestión de Empresas</h2>
        
        <div className="form-section">
          <h3>Crear Nueva Empresa</h3>
          <form>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Empresa</label>
                <input type="text" placeholder="Nombre de la empresa" />
              </div>
              <button type="submit">Crear Empresa</button>
            </div>
          </form>
        </div>

        <div className="form-section">
          <h3>Lista de Empresas</h3>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{formatDate(company.createdAt)}</td>
                  <td>
                    <button className="small">Editar</button>
                    <button className="small danger">Eliminar</button>
                    <Link href={`/usuarios?companyId=${company.id}`} className="small">
                      Ver Usuarios
                    </Link>
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

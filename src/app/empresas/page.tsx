import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EmpresasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPERADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Gestión de Empresas</h1>
        <nav className="main-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/remitos">Remitos</a>
          <a href="/productos">Productos</a>
          <a href="/clientes">Clientes</a>
          <a href="/categorias">Categorías</a>
          <a href="/usuarios">Usuarios</a>
          <a href="/empresas" className="active">Empresas</a>
        </nav>
      </header>
      <main className="main-content">
        <section className="form-section">
          <h2>Bienvenido, SuperAdmin</h2>
          <p>Esta es la página de gestión de empresas. ¡Pronto estará lista!</p>
          
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
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Empresa Demo</td>
                  <td>2024-09-19</td>
                  <td>
                    <button className="small">Editar</button>
                    <button className="small danger">Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    redirect("/auth/login");
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Gestión de Usuarios</h1>
        <nav className="main-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/remitos">Remitos</a>
          <a href="/productos">Productos</a>
          <a href="/clientes">Clientes</a>
          <a href="/categorias">Categorías</a>
          <a href="/usuarios" className="active">Usuarios</a>
          {session.user.role === "SUPERADMIN" && <a href="/empresas">Empresas</a>}
        </nav>
      </header>
      <main className="main-content">
        <section className="form-section">
          <h2>Bienvenido, {session.user.name}</h2>
          <p>Esta es la página de gestión de usuarios.</p>
          
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
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Empresa</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Administrador</td>
                  <td>admin@remitero.com</td>
                  <td>SUPERADMIN</td>
                  <td>-</td>
                  <td>
                    <button className="small">Editar</button>
                    <button className="small danger">Eliminar</button>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Admin Empresa Demo</td>
                  <td>admin@empresademo.com</td>
                  <td>ADMIN</td>
                  <td>Empresa Demo</td>
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

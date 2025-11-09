# 🔄 Flujo de Trabajo

Guía de Git, branches, commits y mejores prácticas de desarrollo.

## 📋 Resumen del Flujo

```
develop (desarrollo) → main (producción)
     ↓                      ↓
  Preview              Production
```

## 🔄 Proceso Paso a Paso

### 1. Verificar que `develop` está listo

```bash
# Asegurarse de estar en develop
git checkout develop

# Verificar que no hay cambios sin commitear
git status

# Ver los últimos commits
git log --oneline -5

# Asegurarse de que develop está actualizado en GitHub
git push origin develop
```

### 2. Cambiar a `main` y actualizarla

```bash
# Cambiar a la rama main
git checkout main

# Actualizar main desde GitHub (por si hay cambios remotos)
git pull origin main
```

### 3. Hacer merge de `develop` a `main`

```bash
# Hacer merge con mensaje descriptivo
git merge develop --no-ff -m "Merge develop into main - Release v1.x"

# El flag --no-ff crea un commit de merge explícito, lo cual es mejor para el historial
```

**Alternativa con Pull Request (Recomendado para equipos):**
- Crear un Pull Request en GitHub desde `develop` hacia `main`
- Revisar los cambios
- Aprobar y hacer merge desde la interfaz de GitHub

### 4. Push de `main` a GitHub

```bash
# Subir los cambios a GitHub
git push origin main
```

### 5. Deploy a Producción

Vercel automáticamente detecta cambios en `main` y despliega a producción si tienes configurado el auto-deploy.

### 6. Volver a `develop` para continuar trabajando

```bash
# Volver a develop
git checkout develop

# Continuar con el desarrollo normal
```

## 🎯 Buenas Prácticas

### Antes de hacer merge a `main`:

1. ✅ **Probar en Preview**: Asegurarse de que todo funciona en `develop` (Preview)
2. ✅ **Sin errores de linter**: `npm run lint` (si está configurado)
3. ✅ **Build exitoso**: Verificar que el build funciona correctamente
4. ✅ **Testing manual**: Probar las funcionalidades principales
5. ✅ **Documentación**: Actualizar documentación si es necesario

### Mensajes de commit descriptivos:

```bash
# Buen ejemplo
git commit -m "feat: agregar sistema de paginación en remitos

- Implementar paginación en listado de remitos
- Agregar controles de navegación
- Actualizar tests"

# Mal ejemplo
git commit -m "cambios"
```

## 🔀 Estrategias de Merge

### Merge con `--no-ff` (Recomendado)
```bash
git merge develop --no-ff -m "Merge develop into main"
```
- Crea un commit de merge explícito
- Mantiene el historial claro
- Facilita revertir el merge completo si es necesario

### Merge Fast-Forward (Solo si main no tiene cambios)
```bash
git merge develop
```
- Solo si `main` no tiene commits que `develop` no tenga
- No crea commit de merge adicional

## 🚨 Si algo sale mal

### Revertir el merge (antes de push)
```bash
git merge --abort
```

### Revertir el merge (después de push)
```bash
# Revertir el commit de merge
git revert -m 1 <commit-hash-del-merge>

# Push del revert
git push origin main
```

## 📊 Comandos Útiles

### Ver diferencias entre develop y main
```bash
git diff main..develop
```

### Ver commits en develop que no están en main
```bash
git log main..develop --oneline
```

### Ver el estado actual
```bash
git status
git branch -a  # Ver todas las ramas
```

## 📝 Checklist Pre-Merge

- [ ] Todos los cambios están commiteados en `develop`
- [ ] `develop` está actualizado en GitHub
- [ ] Preview funciona correctamente
- [ ] No hay errores de build
- [ ] Testing manual completado
- [ ] Documentación actualizada (si aplica)
- [ ] Variables de entorno configuradas en Vercel para producción

---

**Siguiente paso**: [Despliegue](../05-despliegue/flujo-despliegue.md)


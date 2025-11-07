# Flujo de Despliegue: Develop → Main (Producción)

Este documento explica el proceso correcto para mover cambios de la rama `develop` a `main` (producción).

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

```bash
# Deploy a producción en Vercel
vercel --prod
```

**Nota:** Vercel automáticamente detecta cambios en `main` y despliega a producción si tienes configurado el auto-deploy.

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
git merge develop --no-ff -m "Merge develop into main - Release v1.2.0
- Sistema de paginación de remitos
- Mejoras en UI/UX
- Corrección de bugs críticos"

# Mal ejemplo
git merge develop --no-ff -m "merge"
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

## 🔄 Flujo Continuo

Una vez que `main` está en producción:

1. **Continuar trabajando en `develop`**:
   ```bash
   git checkout develop
   # Hacer cambios, commits, etc.
   git push origin develop
   vercel --target preview  # Deploy a preview
   ```

2. **Cuando esté listo para producción**:
   - Repetir el proceso desde el paso 1

## 📝 Checklist Pre-Merge

- [ ] Todos los cambios están commiteados en `develop`
- [ ] `develop` está actualizado en GitHub
- [ ] Preview funciona correctamente
- [ ] No hay errores de build
- [ ] Testing manual completado
- [ ] Documentación actualizada (si aplica)
- [ ] Variables de entorno configuradas en Vercel para producción

## 🎉 Resultado Final

Después de completar el proceso:

- ✅ `main` contiene todos los cambios de `develop`
- ✅ Producción está actualizada
- ✅ `develop` sigue disponible para nuevas mejoras
- ✅ Historial de Git está limpio y organizado

---

**Última actualización:** Noviembre 2025


# Endpoints de Autenticación para Docentes

## Nuevos Endpoints Agregados

### 1. Login por Email
**POST** `/api/docentes/login/email`

Autentica un docente usando su email y contraseña.

**Body:**
```json
{
    "email": "docente@universidad.edu",
    "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Autenticación exitosa",
    "data": {
        "id": 1,
        "nombre": "Juan",
        "apellido_paterno": "Pérez",
        "apellido_materno": "García",
        "email": "docente@universidad.edu",
        "estatus": "Activo"
    }
}
```

**Respuesta de error (401):**
```json
{
    "success": false,
    "message": "Credenciales inválidas"
}
```

### 2. Login por Número de Empleado
**POST** `/api/docentes/login/num-empleado`

Autentica un docente usando su número de empleado y contraseña.

**Body:**
```json
{
    "numEmpleado": "EMP001",
    "password": "contraseña123"
}
```

**Respuesta:** Igual que el login por email.

### 3. Crear Docente con Contraseña
**POST** `/api/docentes/with-password`

Crea un nuevo docente con contraseña cifrada.

**Body:**
```json
{
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "email": "docente@universidad.edu",
    "num_empleado": "EMP001",
    "especialidad": "Ingeniería de Software",
    "password": "contraseña123"
}
```

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "message": "Docente creado exitosamente",
    "data": {
        "id": 1,
        "nombre": "Juan",
        "apellido_paterno": "Pérez",
        "apellido_materno": "García",
        "email": "docente@universidad.edu",
        "num_empleado": "EMP001",
        "especialidad": "Ingeniería de Software",
        "estatus": "Activo"
    }
}
```

### 4. Actualizar Contraseña
**PUT** `/api/docentes/:id/password`

Actualiza la contraseña de un docente existente.

**Body:**
```json
{
    "newPassword": "nueva_contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Contraseña actualizada exitosamente"
}
```

## Seguridad

- Las contraseñas se cifran usando **bcrypt** con 12 rounds de salt
- Las contraseñas nunca se devuelven en las respuestas de la API
- Solo docentes con estatus "Activo" pueden autenticarse
- Las contraseñas se almacenan como hash en la base de datos

## Scripts de Base de Datos

Para agregar la columna de contraseña a la tabla docentes:

```bash
npm run update-db
```

Este script:
1. Agrega la columna `contraseña` a la tabla `docentes`
2. Crea un índice para mejorar el rendimiento
3. Verifica que los cambios se apliquen correctamente

## Ejemplo de Uso

```javascript
// Crear un docente con contraseña
const response = await fetch('/api/docentes/with-password', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        nombre: 'Dr. Carlos',
        apellido_paterno: 'López',
        email: 'carlos@universidad.edu',
        num_empleado: 'EMP002',
        especialidad: 'Base de Datos',
        password: 'mi_contraseña_segura'
    })
});

// Autenticar docente
const loginResponse = await fetch('/api/docentes/login/email', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'carlos@universidad.edu',
        password: 'mi_contraseña_segura'
    })
});
```

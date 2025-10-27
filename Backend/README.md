# Sistema de Gestión Académica ITT TASD - Backend

## Descripción
Backend del Sistema de Gestión Académica para el Instituto Tecnológico de Tijuana (ITT TASD). Este sistema permite gestionar estudiantes, docentes, materias, grupos, calificaciones y factores de riesgo académico.

## Características
- ✅ API REST completa
- ✅ Base de datos SQL Server
- ✅ Autenticación JWT
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Documentación automática
- ✅ CORS configurado
- ✅ Logging y monitoreo

## Tecnologías Utilizadas
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQL Server** - Base de datos
- **JWT** - Autenticación
- **Express Validator** - Validación de datos
- **Helmet** - Seguridad
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logging

## Estructura del Proyecto
```
Backend/
├── config/
│   └── database.js          # Configuración de base de datos
├── controllers/
│   ├── BaseController.js    # Controlador base
│   ├── CarreraController.js # Controlador de carreras
│   ├── EstudianteController.js # Controlador de estudiantes
│   ├── DocenteController.js # Controlador de docentes
│   ├── MateriaController.js # Controlador de materias
│   ├── GrupoController.js   # Controlador de grupos
│   ├── CalificacionParcialController.js # Controlador de calificaciones
│   └── FactorController.js  # Controlador de factores
├── middleware/
│   ├── auth.js              # Middleware de autenticación
│   ├── validation.js        # Middleware de validación
│   ├── errorHandler.js      # Manejo de errores
│   └── cors.js              # Configuración CORS
├── models/
│   ├── BaseModel.js         # Modelo base
│   ├── Carrera.js           # Modelo de carreras
│   ├── Estudiante.js        # Modelo de estudiantes
│   ├── Docente.js           # Modelo de docentes
│   ├── Materia.js           # Modelo de materias
│   ├── Grupo.js             # Modelo de grupos
│   ├── CalificacionParcial.js # Modelo de calificaciones
│   └── Factor.js            # Modelo de factores
├── routes/
│   ├── index.js             # Rutas principales
│   ├── carreras.js          # Rutas de carreras
│   ├── estudiantes.js       # Rutas de estudiantes
│   ├── docentes.js          # Rutas de docentes
│   ├── materias.js          # Rutas de materias
│   ├── grupos.js            # Rutas de grupos
│   ├── calificaciones.js    # Rutas de calificaciones
│   └── factores.js          # Rutas de factores
├── package.json             # Dependencias del proyecto
├── server.js               # Archivo principal del servidor
└── README.md               # Este archivo
```

## Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- SQL Server (versión 2016 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   # Configuración de la Base de Datos
   DB_SERVER=localhost
   DB_DATABASE=ITT_TASD
   DB_USER=app_user
   DB_PASSWORD=En el wsp
   DB_PORT=1433
   DB_ENCRYPT=true
   DB_TRUST_SERVER_CERTIFICATE=true

   # Configuración del Servidor
   PORT=3000
   NODE_ENV=development

   # JWT Secret
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
   JWT_EXPIRES_IN=24h

   # CORS
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Configurar la base de datos**
   - Ejecutar el script `BDD.sql` en SQL Server
   - Verificar que la base de datos `ITT_TASD` esté creada
   - Ajustar las credenciales en el archivo `.env`

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

## Uso de la API

### Endpoints Principales

#### Carreras
- `GET /api/carreras` - Obtener todas las carreras
- `GET /api/carreras/active` - Obtener carreras activas
- `GET /api/carreras/stats` - Estadísticas de carreras
- `GET /api/carreras/:id` - Obtener carrera por ID
- `POST /api/carreras` - Crear nueva carrera
- `PUT /api/carreras/:id` - Actualizar carrera
- `DELETE /api/carreras/:id` - Eliminar carrera

#### Estudiantes
- `GET /api/estudiantes` - Obtener todos los estudiantes
- `GET /api/estudiantes/active` - Obtener estudiantes activos
- `GET /api/estudiantes/:id/calificaciones` - Calificaciones del estudiante
- `GET /api/estudiantes/:id/factores` - Factores de riesgo del estudiante
- `POST /api/estudiantes` - Crear nuevo estudiante
- `PUT /api/estudiantes/:id` - Actualizar estudiante

#### Docentes
- `GET /api/docentes` - Obtener todos los docentes
- `GET /api/docentes/active` - Obtener docentes activos
- `GET /api/docentes/:id/grupos` - Grupos del docente
- `GET /api/docentes/:id/calificaciones` - Calificaciones registradas
- `POST /api/docentes` - Crear nuevo docente

#### Materias
- `GET /api/materias` - Obtener todas las materias
- `GET /api/materias/active` - Obtener materias activas
- `GET /api/materias/search?nombre=nombre` - Buscar materias
- `POST /api/materias` - Crear nueva materia

#### Grupos
- `GET /api/grupos` - Obtener todos los grupos
- `GET /api/grupos/docente/:id` - Grupos por docente
- `GET /api/grupos/estudiante/:id` - Grupos por estudiante
- `POST /api/grupos` - Crear nuevo grupo

#### Calificaciones
- `GET /api/calificaciones` - Obtener todas las calificaciones
- `GET /api/calificaciones/estudiante/:id` - Calificaciones por estudiante
- `GET /api/calificaciones/grupo/:id` - Calificaciones por grupo
- `POST /api/calificaciones` - Crear nueva calificación

#### Factores de Riesgo
- `GET /api/factores` - Obtener todos los factores
- `GET /api/factores/active` - Obtener factores activos
- `GET /api/factores/estudiante/:id` - Factores por estudiante
- `GET /api/factores/tipos` - Tipos de factores disponibles
- `POST /api/factores` - Crear nuevo factor

### Ejemplos de Uso

#### Crear un estudiante
```bash
curl -X POST http://localhost:3000/api/estudiantes \
  -H "Content-Type: application/json" \
  -d '{
    "num_control": "2024001",
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "García",
    "genero": "M",
    "fecha_nacimiento": "2000-01-15",
    "email": "juan.perez@email.com",
    "id_carrera": 1,
    "semestre_actual": 1,
    "fecha_ingreso": "2024-01-15"
  }'
```

#### Obtener estudiantes activos
```bash
curl http://localhost:3000/api/estudiantes/active
```

#### Crear una calificación
```bash
curl -X POST http://localhost:3000/api/calificaciones \
  -H "Content-Type: application/json" \
  -d '{
    "id_grupo": 1,
    "num_unidad": 1,
    "calificacion": 85.5,
    "asistencia": 95.0,
    "fecha_evaluacion": "2024-10-15",
    "id_docente_registro": 1
  }'
```

## Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo producción
npm start

# Ejecutar pruebas
npm test
```

## Configuración de Base de Datos

### Requisitos
- SQL Server 2016 o superior
- Base de datos `ITT_TASD` creada
- Usuario con permisos de lectura/escritura

### Estructura de la Base de Datos
El sistema utiliza las siguientes tablas principales:
- `carreras` - Información de carreras
- `estudiantes` - Datos de estudiantes
- `docentes` - Información de docentes
- `materias` - Catálogo de materias
- `grupos` - Grupos de estudiantes
- `calificaciones_parciales` - Calificaciones por unidad
- `factores` - Factores de riesgo académico

## Seguridad

### Autenticación
- JWT (JSON Web Tokens)
- Tokens con expiración configurable
- Middleware de autenticación en rutas protegidas

### Validación
- Validación de datos de entrada
- Sanitización de inputs
- Manejo de errores estructurado

### CORS
- Configuración de orígenes permitidos
- Headers de seguridad
- Credenciales controladas

## Monitoreo y Logging

### Logs
- Morgan para logging de requests
- Logs de errores estructurados
- Timestamps en todos los logs

### Health Checks
- Endpoint `/api/health` para verificar estado
- Verificación de conexión a base de datos
- Información del sistema

## Desarrollo

### Estructura de Código
- Patrón MVC (Model-View-Controller)
- Separación de responsabilidades
- Código modular y reutilizable

### Mejores Prácticas
- Validación de datos en middleware
- Manejo de errores centralizado
- Documentación de API
- Código limpio y comentado

## Contribución

1. Fork del repositorio
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

---

**Desarrollado para el Instituto Tecnológico de Tijuana (ITT TASD)**

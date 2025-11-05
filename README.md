# 📊 Sistema de Dashboard Estudiantil - Vue.js

Un sistema completo de dashboard para análisis de datos estudiantiles construido con Vue.js 3, diseñado para monitorear métricas académicas, gestionar estudiantes, analizar factores de riesgo y generar visualizaciones de datos.

## 🚀 Tecnologías Utilizadas

- **Vue.js 3** - Framework progresivo con Composition API
- **Vite** - Herramienta de construcción rápida y moderna
- **Vue Router** - Enrutamiento del lado del cliente con guards de autenticación
- **Pinia** - Gestión de estado global
- **Axios** - Cliente HTTP para peticiones API
- **VueUse** - Colección de utilidades para Vue
- **Chart.js** - Librería de gráficos interactivos
- **Vue Chart.js** - Integración de Chart.js con Vue
- **ApexCharts** - Gráficos avanzados y responsivos
- **Vue3-ApexCharts** - Integración de ApexCharts con Vue 3
- **ExcelJS** - Generación y lectura de archivos Excel
- **jsPDF** - Generación de documentos PDF
- **html2canvas** - Captura de pantalla para exportación
- **file-saver** - Descarga de archivos en el cliente
- **Heroicons** - Iconografía moderna
- **CSS3/Sass** - Estilos modernos con Grid y Flexbox
- **ESLint & Prettier** - Linting y formateo de código
- **Syncfusion Diagrams** - Diagramas y visualizaciones avanzadas
- **JointJS** - Diagramas interactivos
- **Mermaid** - Generación de diagramas desde texto

## 📦 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

4. **Previsualizar build de producción:**
   ```bash
   npm run preview
   ```

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta ESLint para verificar el código
- `npm run format` - Formatea el código con Prettier

## 🏗️ Arquitectura del Proyecto

### Estructura Modular Organizada

```
src/
├── components/                    # Componentes reutilizables
│   ├── charts/                   # Componentes de gráficos
│   │   ├── BarChart.vue         # Gráfico de barras
│   │   └── ChartsSection.vue    # Sección de gráficos y filtros
│   ├── layout/                   # Componentes de layout
│   │   ├── DashboardSidebar.vue # Sidebar de navegación
│   │   └── Sidebar.vue          # Sidebar base
│   ├── modals/                   # Modales del sistema
│   │   ├── BaseModal.vue        # Modal base reutilizable
│   │   ├── StudentRegisterModal.vue # Modal de registro de estudiantes
│   │   ├── RiskFactorsModal.vue # Modal de factores de riesgo
│   │   └── ExportDataModal.vue  # Modal de exportación de datos
│   └── ui/                       # Componentes de interfaz
│       ├── DarkModeToggle.vue   # Toggle de modo oscuro
│       ├── ExportSection.vue    # Sección de exportación
│       ├── MetricCard.vue       # Tarjeta individual de métrica
│       ├── MetricsGrid.vue      # Grid de métricas principales
│       ├── NotificationContainer.vue # Contenedor de notificaciones
│       └── NotificationToast.vue # Toast de notificaciones
├── views/                        # Vistas/páginas principales
│   ├── Dashboard.vue            # Dashboard principal
│   ├── Login.vue               # Página de inicio de sesión
├── composables/                  # Lógica reutilizable
│   ├── modals/                  # Composables para modales
│   │   ├── useExportData.js    # Lógica de exportación
│   │   ├── useRiskFactors.js   # Lógica de factores de riesgo
│   │   └── useStudentRegister.js # Lógica de registro de estudiantes
│   ├── useDarkMode.js          # Gestión del modo oscuro
│   ├── useDashboardData.js     # Datos del dashboard
│   └── useNotifications.js     # Sistema de notificaciones
├── stores/                       # Stores de Pinia
│   ├── auth.js                 # Store de autenticación
│   ├── app.js                  # Store de aplicación
│   └── dashboard.js            # Store de datos del dashboard
├── services/                     # Servicios para API
│   └── api.js                  # Configuración de Axios
├── router/                       # Configuración de rutas
│   └── index.js                # Definición de rutas con guards
├── styles/                       # Estilos organizados
│   ├── modals/                  # Estilos de modales
│   │   ├── BaseModal.css       # Estilos del modal base
│   │   ├── ExportDataModal.css # Estilos del modal de exportación
│   │   ├── RiskFactorsModal.css # Estilos del modal de factores
│   │   └── StudentRegisterModal.css # Estilos del modal de registro
│   ├── dashboard.css           # Estilos del layout principal
│   └── components.css          # Estilos de componentes
├── App.vue                      # Componente raíz
└── main.js                     # Punto de entrada
```

## 🎯 Funcionalidades del Sistema

### 🔐 Sistema de Autenticación
- **Login Seguro**: Autenticación JWT con validación de credenciales
- **Guards de Rutas**: Protección automática de rutas sensibles
- **Gestión de Sesión**: Manejo de tokens JWT y estado de autenticación
- **Persistencia**: Tokens almacenados en localStorage
- **Credenciales Demo**: 
  - Usuario: `mguerrero@tec.com` / Contraseña: `password123`

### 📊 Dashboard Principal
- **Métricas en Tiempo Real**: Total de estudiantes, tasas de aprobación/reprobación
- **Visualizaciones Interactivas**: Gráficos de barras, dispersión, pastel y líneas
- **Sistema de Filtros**: Por período académico, mes y fechas específicas
- **Navegación Intuitiva**: Sidebar colapsible con estados activos

### 👥 Gestión de Estudiantes
- **Registro de Estudiantes**: Modal completo con formulario de validación
- **Datos Personales**: Nombre, matrícula, correo, teléfono
- **Información Académica**: Carrera, semestre, calificaciones
- **Validación en Tiempo Real**: Verificación de campos obligatorios

### ⚠️ Análisis de Factores de Riesgo
- **Identificación Automática**: Algoritmos para detectar estudiantes en riesgo
- **Métricas de Riesgo**: Asistencia, calificaciones, comportamiento
- **Alertas Tempranas**: Notificaciones para intervención oportuna
- **Reportes Detallados**: Análisis individual y grupal

### 📤 Exportación de Datos
- **Múltiples Formatos**: Excel (.xlsx), CSV, PDF
- **Filtros Personalizables**: Selección de datos específicos
- **Exportación de Gráficos**: Captura de visualizaciones como imágenes
- **Plantillas Predefinidas**: Formatos estándar para diferentes usos
- **Descarga Directa**: Generación y descarga de archivos en el cliente

### 📥 Importación de Datos
- **Importación Masiva**: Carga de estudiantes desde archivos Excel/CSV
- **Validación de Datos**: Verificación en tiempo real durante importación
- **Plantillas Descargables**: Plantillas Excel y CSV disponibles
- **Manejo de Errores**: Reporte detallado de errores de importación
- **Procesamiento Asíncrono**: Soporte para archivos grandes

### 🌙 Modo Oscuro/Claro
- **Toggle Intuitivo**: Cambio fácil entre temas
- **Persistencia**: Preferencias guardadas en localStorage
- **Detección Automática**: Respeta preferencias del sistema
- **Transiciones Suaves**: Animaciones fluidas entre temas

### 🔔 Sistema de Notificaciones
- **Notificaciones Toast**: Alertas no intrusivas
- **Múltiples Tipos**: Éxito, error, advertencia, información
- **Auto-cierre**: Desaparición automática configurable
- **Gestión Centralizada**: Control global de notificaciones

## 🔧 Arquitectura de Componentes

### Principios de Diseño Aplicados

1. **Separación de Responsabilidades**
   - Componentes organizados por funcionalidad (charts, layout, modals, ui)
   - Lógica separada en composables especializados
   - Modales reutilizables con composables específicos

2. **Composición sobre Herencia**
   - Uso extensivo de Composition API de Vue 3
   - Composables modulares para funcionalidades específicas
   - Lógica compartida centralizada

3. **Componentes Pequeños y Enfocados**
   - Cada componente tiene una responsabilidad única
   - Fácil mantenimiento y testing
   - Reutilización en diferentes contextos

### Componentes Principales

#### **Layout Components**
- **`DashboardSidebar.vue`**: Navegación lateral con expansión automática
- **`Sidebar.vue`**: Componente base reutilizable para sidebars

#### **UI Components**
- **`DarkModeToggle.vue`**: Toggle de modo oscuro con persistencia
- **`MetricsGrid.vue`**: Grid responsivo de métricas principales
- **`MetricCard.vue`**: Tarjeta individual de métrica
- **`NotificationContainer.vue`**: Contenedor global de notificaciones
- **`NotificationToast.vue`**: Toast individual de notificación

#### **Chart Components**
- **`ChartsSection.vue`**: Sección principal de visualizaciones
- **`BarChart.vue`**: Gráfico de barras interactivo

#### **Modal Components**
- **`BaseModal.vue`**: Modal base reutilizable
- **`StudentRegisterModal.vue`**: Registro completo de estudiantes
- **`RiskFactorsModal.vue`**: Análisis de factores de riesgo
- **`ExportDataModal.vue`**: Exportación de datos

#### **Composables Especializados**
- **`useDarkMode.js`**: Gestión del modo oscuro con persistencia
- **`useNotifications.js`**: Sistema de notificaciones global
- **`useDashboardData.js`**: Datos y lógica del dashboard
- **`useStudentRegister.js`**: Lógica de registro de estudiantes
- **`useRiskFactors.js`**: Análisis de factores de riesgo
- **`useExportData.js`**: Funcionalidades de exportación

## 🎨 Sistema de Estilos

### Organización CSS Modular
- **`dashboard.css`**: Estilos del layout principal
- **`components.css`**: Estilos de componentes reutilizables
- **`modals/`**: Estilos específicos para cada modal
  - `BaseModal.css`: Estilos base del modal
  - `StudentRegisterModal.css`: Estilos del modal de registro
  - `RiskFactorsModal.css`: Estilos del modal de factores de riesgo
  - `ExportDataModal.css`: Estilos del modal de exportación
- **Estilos Scoped**: Cada componente mantiene sus estilos específicos

### Características de Diseño
- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Modo Oscuro/Claro**: Temas completos con transiciones suaves
- **Gradientes Modernos**: Efectos visuales atractivos
- **Transiciones Suaves**: Animaciones fluidas entre estados
- **Paleta de Colores**: Azules profesionales con acentos
- **Notificaciones Toast**: Estilos modernos para alertas

## 🔄 Gestión de Estado

### Stores de Pinia

#### `auth.js`
- **Autenticación de usuarios**: Login, logout, verificación de sesión
- **Guards de rutas**: Protección automática de rutas sensibles
- **Credenciales demo**: Usuario y contraseña predeterminados
- **Persistencia de sesión**: Manejo de tokens y estado

#### `dashboard.js`
- **Datos del dashboard**: Estudiantes, métricas y visualizaciones
- **Métricas en tiempo real**: Cálculos automáticos de tasas
- **Filtros de datos**: Gestión de filtros por período y fecha

#### `app.js`
- **Configuración global**: Temas, preferencias y configuración
- **Estado de la aplicación**: Variables globales del sistema

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

### Adaptaciones Móviles
- Sidebar colapsado en móviles
- Grid de métricas en columna única
- Modales optimizados para pantallas pequeñas
- Controles de filtro apilados verticalmente

## 🚀 Instrucciones de Uso

### 1. Inicio de Sesión
- **Credenciales demo**: 
  - `mguerrero@tec.com` / `Tasd123!`
  - `docente@tec.com` / `Tasd123!`
- **Validación en tiempo real**: Verificación de formato de email
- **Redirección automática**: Al dashboard tras login exitoso
- **Persistencia de sesión**: Tokens JWT almacenados en localStorage

### 2. Navegación del Dashboard
- **Sidebar expandible**: Hover para expandir automáticamente
- **Modales integrados**: Click en opciones del menú abre modales
- **Toggle de modo oscuro**: Disponible en todas las vistas

### 3. Gestión de Estudiantes
- **Registro completo**: Formulario con validación en tiempo real
- **Datos personales y académicos**: Campos obligatorios y opcionales
- **Validación de email**: Formato correcto requerido

### 4. Análisis y Exportación
- **Factores de riesgo**: Identificación automática de estudiantes en riesgo
- **Exportación de datos**: Múltiples formatos disponibles (Excel, CSV, PDF)
- **Filtros personalizables**: Selección específica de datos
- **Análisis de Pareto**: Generación de reportes de análisis Pareto

### 5. Importación de Datos
- **Descargar plantilla**: Acceder a plantillas Excel/CSV desde el sistema
- **Cargar archivo**: Seleccionar archivo con datos de estudiantes
- **Validación**: El sistema valida automáticamente los datos
- **Confirmación**: Revisar resultados de importación antes de confirmar

## 🧪 Desarrollo

### Comandos Disponibles
```bash
# Desarrollo con hot reload (puerto 5173)
npm run dev

# Linting del código
npm run lint

# Formateo automático
npm run format

# Build de producción
npm run build

# Preview del build de producción
npm run preview
```

### Requisitos del Backend
- El backend debe estar ejecutándose en `http://localhost:3001`
- El backend debe tener CORS configurado para permitir el origen del frontend
- Se requiere autenticación JWT para la mayoría de endpoints

### Configuración del Proyecto
- **Vite**: Herramienta de construcción moderna
- **ESLint**: Linting automático con reglas de Vue
- **Prettier**: Formateo consistente del código
- **Auto-imports**: Importación automática de composables de Vue

## 🔧 Configuración para Backend

### Proxy de Desarrollo
- Las peticiones a `/api` se redirigen al backend en puerto 3001
- Configurado en `vite.config.js`
- Cambio automático de origen para desarrollo

### Servicios HTTP
- Axios configurado con interceptores
- Manejo global de errores (401, 403, 500, etc.)
- Inyección automática de tokens JWT en headers
- Redirección automática a login en caso de token expirado
- Base URL configurada para el proxy de desarrollo

## 🤝 Contribución

### Estándares de Código
- **ESLint**: Configuración estricta para calidad de código
- **Prettier**: Formateo consistente y automático
- **Conventional Commits**: Mensajes de commit estandarizados
- **Arquitectura Modular**: Componentes organizados por funcionalidad

### Flujo de Desarrollo
1. Crear rama feature para nueva funcionalidad
2. Desarrollar con validación automática
3. Code review obligatorio
4. Merge a main tras aprobación

## 📄 Licencia

Este proyecto es parte del curso de Temas Avanzados de Desarrollo de Software.

---

**Desarrollado con ❤️ usando Vue.js 3, Composition API y las mejores prácticas de desarrollo frontend moderno.**

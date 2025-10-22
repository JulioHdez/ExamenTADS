# 📊 Sistema de Dashboard Estudiantil - Vue.js

Un sistema completo de dashboard para análisis de datos estudiantiles construido con Vue.js 3, diseñado para monitorear métricas académicas, factores de riesgo y generar visualizaciones de datos.

## 🚀 Tecnologías Utilizadas

- **Vue.js 3** - Framework progresivo con Composition API
- **Vite** - Herramienta de construcción rápida y moderna
- **Vue Router** - Enrutamiento del lado del cliente
- **Pinia** - Gestión de estado global
- **Axios** - Cliente HTTP para peticiones API
- **VueUse** - Colección de utilidades para Vue
- **CSS3** - Estilos modernos con Grid y Flexbox
- **ESLint & Prettier** - Linting y formateo de código

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

### Estructura Modular Refactorizada

```
src/
├── components/              # Componentes reutilizables
│   ├── DashboardSidebar.vue # Sidebar de navegación
│   ├── MetricsGrid.vue     # Tarjetas de métricas principales
│   ├── ChartsSection.vue   # Sección de gráficos y filtros
│   ├── BarChart.vue        # Componente de gráfico de barras
│   ├── MetricCard.vue      # Tarjeta individual de métrica
│   └── ExportSection.vue   # Sección de exportación
├── views/                   # Vistas/páginas principales
│   ├── Dashboard.vue       # Dashboard principal (refactorizado)
│   ├── Home.vue            # Página de inicio
│   ├── About.vue           # Página acerca de
│   └── Test.vue            # Página de pruebas
├── composables/             # Lógica reutilizable
│   └── useDashboardData.js # Composable para datos del dashboard
├── stores/                  # Stores de Pinia
│   ├── auth.js             # Store de autenticación
│   ├── app.js              # Store de aplicación
│   └── dashboard.js        # Store de datos del dashboard
├── services/                # Servicios para API
│   └── api.js              # Configuración de Axios
├── router/                  # Configuración de rutas
│   └── index.js            # Definición de rutas
├── styles/                  # Estilos organizados
│   ├── dashboard.css       # Estilos del layout principal
│   └── components.css       # Estilos de componentes
├── App.vue                  # Componente raíz
└── main.js                  # Punto de entrada
```

## 🎯 Funcionalidades del Dashboard

### 📊 Métricas Principales
- **Total de Estudiantes**: Contador de estudiantes registrados
- **Tasa de Reprobación**: Porcentaje de estudiantes reprobados
- **Tasa de Deserción**: Estudiantes en riesgo de abandono
- **Tasa de Aprobación**: Porcentaje de estudiantes aprobados

### 📈 Visualizaciones de Datos
- **Gráfico de Barras**: Distribución por período académico
- **Gráfico de Dispersión**: Correlación entre variables académicas
- **Gráfico de Pastel**: Distribución por estado académico
- **Gráfico de Líneas**: Tendencias de rendimiento temporal

### 🔍 Sistema de Filtros
- **Filtro por Período**: Agosto-Diciembre, Enero-Mayo
- **Filtro por Mes**: Análisis mensual específico
- **Filtro por Fecha**: Selección de fechas específicas

### 🧭 Navegación
- **Sidebar Colapsible**: Navegación lateral con expansión automática
- **Menú de Opciones**: Acceso a diferentes módulos del sistema
- **Estados Activos**: Indicación visual del módulo actual

## 🔧 Arquitectura de Componentes

### Principios de Diseño Aplicados

1. **Separación de Responsabilidades**
   - Cada componente tiene una función específica
   - Lógica separada en composables reutilizables

2. **Composición sobre Herencia**
   - Uso de Composition API de Vue 3
   - Composables para lógica compartida

3. **Componentes Pequeños y Enfocados**
   - Fácil mantenimiento y testing
   - Reutilización en diferentes contextos

### Componentes Principales

#### `DashboardSidebar.vue`
- **Propósito**: Navegación lateral del sistema
- **Características**: 
  - Expansión automática al hover
  - Transiciones suaves
  - Estados activos
- **Líneas de código**: ~176 líneas

#### `MetricsGrid.vue`
- **Propósito**: Mostrar métricas principales
- **Características**:
  - Tarjetas responsivas
  - Animaciones hover
  - Datos reactivos
- **Líneas de código**: ~120 líneas

#### `ChartsSection.vue`
- **Propósito**: Visualizaciones y filtros de datos
- **Características**:
  - 4 tipos de gráficos diferentes
  - Sistema de filtros avanzado
  - Datos dinámicos
- **Líneas de código**: ~400 líneas

#### `useDashboardData.js`
- **Propósito**: Lógica de datos centralizada
- **Características**:
  - Computed properties para gráficos
  - Filtros reactivos
  - Transformación de datos
- **Líneas de código**: ~231 líneas

## 🎨 Sistema de Estilos

### Organización CSS
- **`dashboard.css`**: Estilos del layout principal
- **`components.css`**: Estilos de componentes reutilizables
- **Estilos Scoped**: Cada componente mantiene sus estilos específicos

### Características de Diseño
- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Gradientes Modernos**: Efectos visuales atractivos
- **Transiciones Suaves**: Animaciones fluidas
- **Paleta de Colores**: Azules profesionales con acentos

## 🔄 Gestión de Estado

### Stores de Pinia

#### `dashboard.js`
```javascript
// Estado centralizado para datos del dashboard
export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    students: [],
    metrics: {
      totalStudents: 0,
      failureRate: 0,
      dropoutRate: 0,
      approvalRate: 0
    }
  }),
  actions: {
    fetchStudents() { /* ... */ },
    updateMetrics() { /* ... */ }
  }
})
```

#### `auth.js`
- Manejo de autenticación de usuarios
- Tokens JWT
- Estado de sesión

#### `app.js`
- Configuración global de la aplicación
- Temas y preferencias

## 📱 Responsive Design

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

### Adaptaciones Móviles
- Sidebar colapsado en móviles
- Grid de métricas en columna única
- Gráficos optimizados para pantallas pequeñas
- Controles de filtro apilados verticalmente

## 🔐 Autenticación y Seguridad

### Características de Seguridad
- Protección de rutas sensibles
- Interceptores de Axios para tokens
- Manejo seguro de sesiones
- Validación de datos del cliente

## 🚀 Instrucciones de Uso

### 1. Navegación del Dashboard
- **Hover sobre el sidebar**: Se expande automáticamente
- **Click en elementos del menú**: Cambia el estado activo
- **Scroll en contenido**: Navegación fluida

### 2. Filtros de Datos
- **Seleccionar tipo de filtro**: Por período o por mes
- **Elegir período específico**: Dropdown con opciones
- **Filtrar por mes**: Selección mensual con fecha opcional

### 3. Visualización de Gráficos
- **Gráfico de Barras**: Muestra distribución por período
- **Gráfico de Dispersión**: Correlación entre variables
- **Gráfico de Pastel**: Estados académicos con leyenda
- **Gráfico de Líneas**: Tendencias temporales

## 🧪 Testing y Desarrollo

### Comandos de Desarrollo
```bash
# Desarrollo con hot reload
npm run dev

# Linting del código
npm run lint

# Formateo automático
npm run format

# Build de producción
npm run build
```

### Estructura de Testing (Preparada)
- Tests unitarios por componente
- Tests de integración para composables
- Tests E2E para flujos completos

## 🔧 Configuración para Backend

### Proxy de Desarrollo
- Las peticiones a `/api` se redirigen al backend en puerto 8000
- Configurado en `vite.config.js`

### Servicios HTTP
- Axios configurado con interceptores
- Manejo global de errores
- Base URL configurada para el proxy

## 📈 Próximas Funcionalidades

### Módulos Planificados
- **Registro de Estudiantes**: Formulario de alta
- **Factores de Riesgo**: Identificación de estudiantes en riesgo
- **Análisis Pareto**: Identificación de problemas principales
- **Diagrama Ishikawa**: Análisis de causas raíz
- **Histogramas**: Distribución de calificaciones
- **Importación/Exportación**: Manejo de datos masivos

### Mejoras Técnicas
- **Testing Completo**: Cobertura de tests unitarios y E2E
- **PWA**: Aplicación web progresiva
- **Internacionalización**: Soporte multiidioma
- **Temas**: Modo oscuro/claro
- **Notificaciones**: Sistema de alertas en tiempo real

## 🤝 Contribución

### Estándares de Código
- **ESLint**: Configuración estricta para calidad
- **Prettier**: Formateo consistente
- **Conventional Commits**: Mensajes de commit estandarizados
- **Componentes Modulares**: Arquitectura limpia y mantenible

### Flujo de Desarrollo
1. Crear rama feature para nueva funcionalidad
2. Desarrollar con tests incluidos
3. Code review obligatorio
4. Merge a main tras aprobación

## 📄 Licencia

Este proyecto es parte del curso de Temas Avanzados de Desarrollo de Software.

---

**Desarrollado con ❤️ usando Vue.js 3 y las mejores prácticas de desarrollo frontend moderno.**

# 🚀 Instrucciones para Ejecutar el Dashboard

## 📋 Pasos para Iniciar el Proyecto

### 1. **Instalar Dependencias**
```bash
npm install
```

### 2. **Ejecutar en Modo Desarrollo**
```bash
npm run dev
```

### 3. **Abrir en el Navegador**
El proyecto se abrirá automáticamente en: `http://localhost:3000`

## 🎯 Características Implementadas

### ✅ **Sidebar Expandible**
- **Color azul marino** como solicitaste
- **Solo iconos** cuando está colapsada
- **Se expande al hacer hover** mostrando iconos + texto
- **Navegación completa** con todas las secciones del mockup

### ✅ **Dashboard Principal**
- **Tarjetas de métricas** con datos reales:
  - Total Estudiantes
  - Reprobación Promedio
  - Deserción Estimada
  - Aprobación Promedio
- **Gráfico de barras** interactivo con Chart.js
- **Formulario de registro** de estudiantes
- **Sección de exportación** de datos

### ✅ **Funcionalidades**
- **Datos dinámicos** desde el store de Pinia
- **Formularios funcionales** con validación
- **Gráficos interactivos** con Chart.js
- **Diseño responsive** para móviles y tablets
- **Preparado para backend** con Axios y proxy configurado

## 🎨 Diseño Implementado

### **Sidebar (Azul Marino)**
- Gradiente azul marino (#1e3a8a a #1e40af)
- Iconos de Heroicons
- Expansión suave al hover
- Navegación activa resaltada

### **Dashboard**
- Layout moderno y limpio
- Tarjetas con sombras y efectos hover
- Colores consistentes con el tema
- Tipografía clara y legible

## 🔧 Estructura de Archivos

```
src/
├── components/
│   ├── Sidebar.vue          # Sidebar expandible
│   ├── MetricCard.vue       # Tarjetas de métricas
│   ├── BarChart.vue         # Gráfico de barras
│   └── ExportSection.vue    # Sección de exportación
├── views/
│   └── Dashboard.vue        # Vista principal del dashboard
├── stores/
│   └── dashboard.js         # Store para datos del dashboard
└── services/
    └── api.js              # Configuración de Axios
```

## 📊 Datos de Ejemplo

El dashboard incluye datos de ejemplo para desarrollo:
- 8 estudiantes de prueba
- Métricas calculadas automáticamente
- Gráfico con distribución por semestre
- Formulario funcional de registro

## 🚀 Próximos Pasos

1. **Conectar con Backend**: El proxy está configurado para puerto 8000
2. **Agregar más gráficos**: Pareto, Ishikawa, Histogramas, Dispersión
3. **Implementar autenticación**: Sistema de login/logout
4. **Agregar más funcionalidades**: Filtros, búsquedas, etc.

## 🎯 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build
npm run preview

# Linting
npm run lint

# Formatear código
npm run format
```

¡El dashboard está listo y funcional! 🎉

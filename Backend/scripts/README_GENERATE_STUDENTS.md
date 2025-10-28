# Generador de Estudiantes Aleatorios

Este script genera y registra estudiantes aleatorios en la base de datos para pruebas del sistema.

## 📋 Características

- Genera estudiantes con datos aleatorios y realistas
- Asigna carreras aleatorias de las disponibles en la base de datos
- Genera nombres, apellidos, direcciones, emails y teléfonos aleatorios
- Crea diferentes semestres y estatus de estudiantes
- Genera números de control únicos
- Calcula promedios aleatorios entre 60 y 100
- **Crea grupos automáticamente** (1-3 grupos por estudiante)
- **Crea factores de riesgo aleatorios** (1-4 factores por estudiante)
- **Crea calificaciones automáticamente** (2-3 unidades por grupo)
- **Genera estudiantes reprobados** (30% probabilidad con calificaciones 40-69)
- Asigna materias y docentes aleatorios a los grupos
- Genera horarios y aulas aleatorios
- Maneja duplicados y errores automáticamente

## 🚀 Uso

### Opción 1: Ejecutar con cantidad por defecto (200 estudiantes)

```bash
npm run generate-students
```

### Opción 2: Ejecutar con cantidad específica

```bash
npm run generate-students:50    # Genera 50 estudiantes
npm run generate-students:100   # Genera 100 estudiantes
npm run generate-students:500   # Genera 500 estudiantes
```

### Opción 3: Ejecutar con cantidad personalizada

```bash
npm run generate-students 75    # Genera 75 estudiantes
node scripts/generate-random-students.js 200  # Genera 200 estudiantes
```

### Opción 4: Eliminar estudiantes previos y generar nuevos

```bash
# Eliminar todos los estudiantes y generar 100 nuevos
npm run generate-students:clean

# Eliminar todos y generar 50 nuevos
npm run generate-students:clean:50

# Usando comandos directos
node scripts/generate-random-students.js 100 --clean  # Elimina y genera 100
node scripts/generate-random-students.js 50 -c        # Elimina y genera 50
```

### Opción 5: Agregar más estudiantes sin eliminar

```bash
# Si ya tienes 100 estudiantes, este comando generará 100 más
npm run generate-students:100

# El script detecta automáticamente el último número de control y continúa secuencialmente
```

## 📊 Datos Generados

El script genera los siguientes datos aleatorios:

### Información Personal
- **Nombres**: Masculinos y femeninos en español
- **Apellidos**: Aleatorios de lista común
- **Género**: M o F (50% probabilidad cada uno)
- **Fecha de nacimiento**: Entre 1995 y 2006
- **Email**: Formato `nombre.apellido@student.tec.com` (único)
- **Teléfono**: Formato `664XXXXXXXX`
- **Dirección**: Calles comunes de Tijuana

### Información Académica
- **Número de control**: Formato `24XXXXXX` (único)
- **Carrera**: Aleatoria de las carreras activas en la base de datos
- **Semestre actual**: Entre 1 y la duración de la carrera (máx 12)
- **Fecha de ingreso**: Entre 2019 y 2024
- **Estatus**: Activo (mayoría), Baja temporal, Egresado
- **Promedio general**: Entre 60 y 100 (aleatorio)

### Grupos de Estudiante
- **Cantidad**: 1-3 grupos por estudiante
- **Materia**: Aleatoria de las materias disponibles
- **Docente**: Aleatorio de los docentes activos
- **Clave de grupo**: Generada automáticamente
- **Semestre**: Coincide con el semestre actual del estudiante
- **Año**: 2024
- **Período**: 1 o 2 (aleatorio)
- **Horario**: Aleatorio de horarios predefinidos
- **Aula**: Aleatoria de aulas predefinidas

### Factores de Riesgo
- **Cantidad**: 1-4 factores por estudiante
- **Tipos disponibles**: Académico, Motivacional, Económico, Social, Familiar, Transporte, Salud, Trabajo
- **Descripción**: Generada automáticamente para cada factor
- **Observaciones**: Incluidas para cada factor

### Calificaciones
- **Cantidad**: 2-3 unidades por grupo
- **Rango de calificaciones**: 
  - **Aprobados (70%)**: 70-100
  - **Reprobados (30%)**: 40-69
- **Asistencia**: 70-100%
- **Fecha de evaluación**: Fecha actual
- **Comentarios**: Incluidos para cada unidad

## 🔄 Modos de Operación

### Modo Normal (Agregar estudiantes)
- **Comportamiento**: Genera nuevos estudiantes sin eliminar los existentes
- **Uso**: `npm run generate-students:200`
- **Ventaja**: Permite acumular estudiantes progresivamente
- **Ejemplo**: Si ya tienes 200 estudiantes, genera 200 más (total: 400)

### Modo Clean (Limpiar y regenerar)
- **Comportamiento**: Elimina todos los estudiantes existentes y genera nuevos
- **Uso**: `npm run generate-students:clean`
- **Ventaja**: Base de datos limpia siempre comienza desde cero
- **Ejemplo**: Elimina 100 estudiantes previos y genera 100 nuevos (total: 100)

## 🔄 Manejo Automático de Duplicados

El script es **inteligente** y maneja duplicados automáticamente:

1. **Verifica si existe el número de control**: Antes de insertar, verifica si ya existe
2. **Genera nuevo número**: Si está duplicado, incrementa automáticamente el contador
3. **Intentos**: Realiza hasta 10 intentos para encontrar un número único
4. **Reporta duplicados**: Muestra en el resumen si hubo que generar números alternativos

## ⚠️ Requisitos Previos

Antes de ejecutar este script, asegúrate de que:

1. **La base de datos esté configurada** y la conexión funcione
2. **Existan carreras en la base de datos** (al menos una carrera activa)
3. **Existan materias en la base de datos** (al menos una materia activa)
4. **Exista al menos un docente activo** en la base de datos
5. **Las credenciales de la base de datos** estén correctas en `config/connection.js`

### Verificar carreras

Si no tienes carreras, ejecuta primero:

```bash
# Ejecutar el script SQL de carreras
sqlcmd -S localhost -U sa -P tu_password -d ITT_TASD -i scripts/insert_carreras.sql
```

O usa el endpoint del API:

```bash
curl -X POST http://localhost:3000/api/estudiantes/initialize-carreras
```

## 📝 Ejemplo de Salida

```
🚀 Iniciando generación de estudiantes aleatorios...
📊 Cantidad de estudiantes a generar: 200
📚 Obteniendo carreras disponibles...
✅ Se encontraron 7 carreras disponibles

💾 Insertando estudiantes en la base de datos...
📊 Progreso: 10/200 estudiantes, 15 grupos, 20 factores, 32 calificaciones
📊 Progreso: 20/200 estudiantes, 32 grupos, 41 factores, 68 calificaciones
📊 Progreso: 30/200 estudiantes, 48 grupos, 63 factores, 105 calificaciones
...

============================================================
✅ PROCESO COMPLETADO
============================================================
📊 Resumen:
   ✓ Estudiantes insertados: 200
   📚 Grupos creados: 385
   ⚠️  Factores de riesgo creados: 587
   📝 Calificaciones creadas: 872
   ⚠️  Duplicados omitidos: 0
   ❌ Errores: 0
============================================================

📋 Ejemplos de estudiantes generados:
   - Juan López García (24000001)
   - María Martínez Rodríguez (24000002)
   - Carlos González Pérez (24000003)
```

## 🔧 Solución de Problemas

### Error: "No hay carreras disponibles"
**Solución**: Ejecuta el script de carreras primero:
```bash
sqlcmd -S localhost -U sa -P tu_password -d ITT_TASD -i scripts/insert_carreras.sql
```

### Error: "Número de control duplicado"
**Solución**: El script maneja automáticamente duplicados intentando generar un nuevo número de control.

### Error: "No hay materias disponibles"
**Solución**: Ejecuta el endpoint para inicializar materias:
```bash
curl -X POST http://localhost:3000/api/estudiantes/initialize-materias
```

### Error: "No hay docentes disponibles"
**Solución**: Crea al menos un docente antes de generar estudiantes. Puedes usar el script:
```bash
node Backend/scripts/create-docente.js
```

### Error de conexión a la base de datos
**Solución**: Verifica la configuración en `config/connection.js` y ejecuta:
```bash
npm run diagnose
```

## 📦 Archivos Relacionados

- `Backend/scripts/generate-random-students.js` - Script principal
- `Backend/scripts/insert_carreras.sql` - Script SQL para carreras
- `Backend/models/Estudiante.js` - Modelo de estudiante
- `Backend/config/connection.js` - Configuración de conexión

## 🎯 Notas

- El script verifica automáticamente si un número de control ya existe antes de insertarlo
- Los emails se generan de forma única usando el índice del contador
- Los promedios se generan con decimales (ej: 85.67)
- El script respeta las restricciones de la base de datos (semestre entre 1-12, promedio 0-100)


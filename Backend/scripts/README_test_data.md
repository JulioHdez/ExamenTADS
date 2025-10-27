# Scripts de Datos de Prueba - Sistema ITT TASD

Este directorio contiene scripts SQL para insertar datos de prueba completos en el sistema de gestión académica.

## 📁 Archivos Incluidos

### Scripts Individuales
- `insert_docentes_test.sql` - Docentes de prueba con contraseñas
- `insert_estudiantes_test.sql` - Estudiantes de prueba de diferentes carreras
- `insert_grupos_test.sql` - Grupos relacionados con estudiantes y docentes
- `insert_calificaciones_test.sql` - Calificaciones parciales por unidad
- `insert_factores_test.sql` - Factores de riesgo académico

### Script Maestro
- `insert_all_test_data.sql` - Ejecuta todos los scripts en orden

## 🚀 Instrucciones de Uso

### Opción 1: Ejecutar Scripts Individuales
```sql
-- Ejecutar en este orden:
1. insert_docentes_test.sql
2. insert_estudiantes_test.sql
3. insert_grupos_test.sql
4. insert_calificaciones_test.sql
5. insert_factores_test.sql
```

### Opción 2: Ejecutar Script Maestro
```sql
-- Ejecutar solo este archivo:
insert_all_test_data.sql
```

## 👥 Datos de Prueba Incluidos

### Docentes (5)
| Empleado | Nombre | Especialidad | Contraseña |
|----------|--------|--------------|------------|
| TEST001 | Carlos García López | Desarrollo de Software | password123 |
| TEST002 | Ana Martínez Rodríguez | Matemáticas Aplicadas | matematica456 |
| TEST003 | Michael Johnson Smith | Lenguas Extranjeras | english789 |
| TEST004 | Patricia Hernández González | Administración Empresarial | admin2024 |
| TEST005 | Roberto Ramírez Vega | Psicología Clínica | psicologia123 |

### Estudiantes (5)
| Control | Nombre | Carrera | Semestre | Promedio |
|---------|--------|---------|----------|----------|
| TEST001 | Juan Carlos López García | Ingeniería en Sistemas | 5 | 85.5 |
| TEST002 | María Fernanda Martínez Rodríguez | Administración | 6 | 92.3 |
| TEST003 | Alejandro Hernández Vega | Psicología | 3 | 78.9 |
| TEST004 | Sofía González Morales | Ingeniería Industrial | 4 | 88.7 |
| TEST005 | Diego Ramírez Castro | Contabilidad | 7 | 91.2 |

### Grupos (5)
- Cada estudiante tiene un grupo asignado
- Relacionados con docentes y materias apropiadas
- Con horarios y aulas específicas

### Calificaciones (15 total)
- 3 calificaciones por estudiante (unidades 1, 2, 3)
- Calificaciones realistas según el promedio del estudiante

### Factores de Riesgo (8 total)
- Diferentes tipos de factores asignados
- Observaciones específicas para cada caso

## ⚠️ Consideraciones Importantes

### Prerequisitos
- La base de datos debe estar creada
- Las tablas deben existir
- Deben existir carreras y materias básicas

### Contraseñas
- Las contraseñas se muestran en texto plano en los comentarios
- Serán encriptadas automáticamente al hacer login
- **NO usar estas contraseñas en producción**

### Verificación
- Los scripts verifican si los datos ya existen antes de insertar
- Pueden ejecutarse múltiples veces sin duplicar datos
- Incluyen consultas de verificación al final

## 🔧 Solución de Problemas

### Error: "Tabla no existe"
- Ejecutar primero el script de creación de base de datos
- Verificar que todas las tablas estén creadas

### Error: "No hay carreras/materias"
- Ejecutar primero los scripts de carreras y materias
- Verificar que existan datos básicos

### Datos duplicados
- Los scripts verifican existencia antes de insertar
- Si hay duplicados, eliminar manualmente antes de ejecutar

## 📊 Verificación de Datos

Después de ejecutar los scripts, puede verificar los datos con:

```sql
-- Verificar docentes
SELECT * FROM docentes WHERE num_empleado LIKE 'TEST%'

-- Verificar estudiantes
SELECT e.*, c.nombre_carrera 
FROM estudiantes e 
INNER JOIN carreras c ON e.id_carrera = c.id_carrera 
WHERE e.num_control LIKE 'TEST%'

-- Verificar grupos
SELECT g.*, e.nombre, d.nombre, m.nombre_materia
FROM grupos g
INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
INNER JOIN docentes d ON g.id_docente = d.id_docente
INNER JOIN materias m ON g.id_materia = m.id_materia
WHERE g.clave_grupo LIKE 'TEST%'
```

## 🎯 Uso Recomendado

1. **Desarrollo**: Usar estos datos para probar funcionalidades
2. **Testing**: Verificar que el sistema maneje correctamente los datos
3. **Demostración**: Mostrar el sistema con datos realistas
4. **Respaldo**: Restaurar datos en caso de pérdida

---

**Nota**: Estos scripts están diseñados para entornos de desarrollo y testing. No usar en producción.

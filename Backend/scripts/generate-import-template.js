const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

async function main() {
  const root = path.join(__dirname, '..', '..');
  const outDir = path.join(root, 'EXCEL');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const expectedHeaders = [
    'num_control',
    'nombre',
    'apellido_paterno',
    'apellido_materno',
    'genero',
    'fecha_nacimiento',
    'email',
    'telefono',
    'direccion',
    'id_carrera',
    'semestre_actual',
    'fecha_ingreso',
    'estatus',
    'promedio_general'
  ];

  // Excel
  const wb = new ExcelJS.Workbook();
  // Hoja 1: Estudiantes
  const wsEst = wb.addWorksheet('Estudiantes');
  wsEst.addRow(expectedHeaders);
  wsEst.addRow(['S23001234', 'Juan', 'Perez', 'López', 'M', '2002-05-10', 'juan@example.com', '5551234567', 'Av. Siempre Viva 123', 2, 3, '2021-08-15', 'Activo']);
  wsEst.addRow(['S23005678', 'María', 'Gómez', 'Hernández', 'F', '2003-11-22', 'maria@example.com', '5557654321', 'Calle 2 #456', 3, 5, '2020-08-20', 'Activo']);

  // Hoja 2: Grupos
  const wsGrp = wb.addWorksheet('Grupos');
  const headersGrp = ['num_control', 'clave_grupo', 'id_materia', 'id_docente', 'semestre', 'anio', 'periodo', 'horario', 'aula'];
  wsGrp.addRow(headersGrp);
  wsGrp.addRow(['S23001234', 'GRP-IS-301', '', '', 3, 2024, '1', 'Lun 08:00-10:00', 'A-101']);
  wsGrp.addRow(['S23005678', 'GRP-II-501', '', '', 5, 2024, '2', 'Mar 10:00-12:00', 'B-202']);

  // Hoja 3: Calificaciones
  const wsCal = wb.addWorksheet('Calificaciones');
  const headersCal = ['num_control', 'clave_grupo', 'num_unidad', 'calificacion', 'asistencia', 'fecha_evaluacion', 'id_docente_registro', 'comentarios'];
  wsCal.addRow(headersCal);
  wsCal.addRow(['S23001234', 'GRP-IS-301', 1, 85, 100, '2024-03-10', 9, '']);
  wsCal.addRow(['S23001234', 'GRP-IS-301', 2, 92, 95, '2024-04-15', 9, '']);
  wsCal.addRow(['S23005678', 'GRP-II-501', 1, 88, 100, '2024-03-12', 9, '']);

  // Hoja 4: Factores
  const wsFac = wb.addWorksheet('Factores');
  const headersFac = ['num_control', 'nombre_factor', 'descripcion', 'fecha_asignacion', 'activo'];
  wsFac.addRow(headersFac);
  wsFac.addRow(['S23001234', 'Académico', 'Bajo rendimiento en matemáticas', '2024-02-20', 1]);
  wsFac.addRow(['S23001234', 'Económico', 'Dificultades para adquirir materiales', '2024-03-05', 1]);
  wsFac.addRow(['S23005678', 'Salud', 'Tratamiento médico temporal', '2024-03-01', 1]);

  // Hoja 5: Observaciones
  const wsObs = wb.addWorksheet('Observaciones');
  const headersObs = ['num_control', 'observaciones'];
  wsObs.addRow(headersObs);
  wsObs.addRow(['S23001234', 'Requiere tutorías en álgebra y seguimiento mensual.']);
  wsObs.addRow(['S23005678', 'Buen desempeño; monitorear asistencia.']);
  const xlsxPath = path.join(outDir, 'plantilla_import_estudiantes.xlsx');
  await wb.xlsx.writeFile(xlsxPath);

  // CSV
  const csvPath = path.join(outDir, 'plantilla_import_estudiantes.csv');
  const csvRows = [
    expectedHeaders.join(','),
    'S23001234,Juan,Perez,López,M,2002-05-10,juan@example.com,5551234567,"Av. Siempre Viva 123",2,3,2021-08-15,Activo,88.5',
    'S23005678,María,Gómez,Hernández,F,2003-11-22,maria@example.com,5557654321,"Calle 2 #456",3,5,2020-08-20,Activo,89.0'
  ];
  fs.writeFileSync(csvPath, csvRows.join('\n'));

  // Ejemplo completo con más registros
  const examplesDir = path.join(outDir, 'Ejemplos');
  if (!fs.existsSync(examplesDir)) fs.mkdirSync(examplesDir);
  const wbEx = new ExcelJS.Workbook();
  const exEst = wbEx.addWorksheet('Estudiantes');
  exEst.addRow(expectedHeaders);
  exEst.addRow(['S23001234', 'Juan', 'Perez', 'López', 'M', '2002-05-10', 'juan@example.com', '5551234567', 'Av. Siempre Viva 123', 2, 3, '2021-08-15', 'Activo', 88.5]);
  exEst.addRow(['S23005678', 'María', 'Gómez', 'Hernández', 'F', '2003-11-22', 'maria@example.com', '5557654321', 'Calle 2 #456', 3, 5, '2020-08-20', 'Activo', 89.0]);
  exEst.addRow(['S23007890', 'Carlos', 'Ramírez', 'Santos', 'M', '2001-01-30', 'carlos@example.com', '5551112233', 'Calle 3 #789', 2, 7, '2019-08-20', 'Activo', 77.5]);

  const exGrp = wbEx.addWorksheet('Grupos');
  const headersGrpEx = ['num_control', 'clave_grupo', 'id_materia', 'id_docente', 'semestre', 'anio', 'periodo', 'horario', 'aula'];
  exGrp.addRow(headersGrpEx);
  exGrp.addRow(['S23001234', 'GRP-IS-301', '', '', 3, 2024, '1', 'Lun 08:00-10:00', 'A-101']);
  exGrp.addRow(['S23005678', 'GRP-II-501', '', '', 5, 2024, '2', 'Mar 10:00-12:00', 'B-202']);
  exGrp.addRow(['S23007890', 'GRP-IS-701', '', '', 7, 2024, '1', 'Mie 12:00-14:00', 'C-303']);

  const exCal = wbEx.addWorksheet('Calificaciones');
  const headersCalEx = ['num_control', 'clave_grupo', 'num_unidad', 'calificacion', 'asistencia', 'fecha_evaluacion', 'id_docente_registro', 'comentarios'];
  exCal.addRow(headersCalEx);
  exCal.addRow(['S23001234', 'GRP-IS-301', 1, 85, 100, '2024-03-10', 9, '']);
  exCal.addRow(['S23001234', 'GRP-IS-301', 2, 92, 95, '2024-04-15', 9, '']);
  exCal.addRow(['S23005678', 'GRP-II-501', 1, 88, 100, '2024-03-12', 9, '']);
  exCal.addRow(['S23005678', 'GRP-II-501', 2, 90, 90, '2024-04-16', 9, '']);
  exCal.addRow(['S23007890', 'GRP-IS-701', 1, 75, 100, '2024-03-08', 9, '']);
  exCal.addRow(['S23007890', 'GRP-IS-701', 2, 80, 85, '2024-04-12', 9, '']);

  const exFac = wbEx.addWorksheet('Factores');
  const headersFacEx = ['num_control', 'nombre_factor', 'descripcion', 'fecha_asignacion', 'activo'];
  exFac.addRow(headersFacEx);
  exFac.addRow(['S23001234', 'Académico', 'Bajo rendimiento en matemáticas', '2024-02-20', 1]);
  exFac.addRow(['S23001234', 'Económico', 'Dificultades para adquirir materiales', '2024-03-05', 1]);
  exFac.addRow(['S23005678', 'Salud', 'Tratamiento médico temporal', '2024-03-01', 1]);

  const exObs = wbEx.addWorksheet('Observaciones');
  const headersObsEx = ['num_control', 'observaciones'];
  exObs.addRow(headersObsEx);
  exObs.addRow(['S23001234', 'Requiere tutorías en álgebra y seguimiento mensual.']);
  exObs.addRow(['S23005678', 'Buen desempeño; monitorear asistencia.']);

  const exPath = path.join(examplesDir, 'ejemplo_import_completo.xlsx');
  await wbEx.xlsx.writeFile(exPath);

  console.log('Plantillas generadas en:', outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



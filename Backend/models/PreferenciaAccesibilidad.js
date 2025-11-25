const { getConnection, mssql } = require('../config/connection');
const BaseModel = require('./BaseModel');

class PreferenciaAccesibilidad extends BaseModel {
    constructor() {
        super('preferencias_accesibilidad');
    }

    // Obtener preferencias por usuario
    async findByUsuario(idUsuario, tipoUsuario) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id_usuario', mssql.Int, idUsuario)
                .input('tipo_usuario', mssql.VarChar(20), tipoUsuario)
                .query(`
                    SELECT * FROM ${this.tableName}
                    WHERE id_usuario = @id_usuario AND tipo_usuario = @tipo_usuario
                `);

            return result.recordset[0] || null;
        } catch (error) {
            console.error('Error al buscar preferencias:', error);
            throw error;
        }
    }

    // Crear o actualizar preferencias
    async saveOrUpdate(preferencias) {
        try {
            const pool = await getConnection();
            const {
                id_usuario,
                tipo_usuario,
                dark_mode,
                zoom_level,
                grey_mode,
                color_blindness_type,
                cursor_size,
                text_highlight,
                parkinson_mode,
                voice_reader,
                menu_position_x,
                menu_position_y
            } = preferencias;

            // Verificar si ya existen preferencias para este usuario
            const existentes = await this.findByUsuario(id_usuario, tipo_usuario);

            if (existentes) {
                // Actualizar
                const result = await pool.request()
                    .input('id_usuario', mssql.Int, id_usuario)
                    .input('tipo_usuario', mssql.VarChar(20), tipo_usuario)
                    .input('dark_mode', mssql.Bit, dark_mode ?? existentes.dark_mode)
                    .input('zoom_level', mssql.Int, zoom_level ?? existentes.zoom_level)
                    .input('grey_mode', mssql.Bit, grey_mode ?? existentes.grey_mode)
                    .input('color_blindness_type', mssql.VarChar(50), color_blindness_type ?? existentes.color_blindness_type)
                    .input('cursor_size', mssql.Int, cursor_size ?? existentes.cursor_size)
                    .input('text_highlight', mssql.Bit, text_highlight ?? existentes.text_highlight)
                    .input('parkinson_mode', mssql.Bit, parkinson_mode ?? existentes.parkinson_mode)
                    .input('voice_reader', mssql.Bit, voice_reader ?? existentes.voice_reader)
                    .input('menu_position_x', mssql.Int, menu_position_x ?? existentes.menu_position_x)
                    .input('menu_position_y', mssql.Int, menu_position_y ?? existentes.menu_position_y)
                    .query(`
                        UPDATE ${this.tableName}
                        SET 
                            dark_mode = @dark_mode,
                            zoom_level = @zoom_level,
                            grey_mode = @grey_mode,
                            color_blindness_type = @color_blindness_type,
                            cursor_size = @cursor_size,
                            text_highlight = @text_highlight,
                            parkinson_mode = @parkinson_mode,
                            voice_reader = @voice_reader,
                            menu_position_x = @menu_position_x,
                            menu_position_y = @menu_position_y,
                            fecha_actualizacion = GETDATE()
                        WHERE id_usuario = @id_usuario AND tipo_usuario = @tipo_usuario
                        
                        SELECT * FROM ${this.tableName}
                        WHERE id_usuario = @id_usuario AND tipo_usuario = @tipo_usuario
                    `);

                return result.recordset[0];
            } else {
                // Crear nuevo
                const result = await pool.request()
                    .input('id_usuario', mssql.Int, id_usuario)
                    .input('tipo_usuario', mssql.VarChar(20), tipo_usuario)
                    .input('dark_mode', mssql.Bit, dark_mode ?? 0)
                    .input('zoom_level', mssql.Int, zoom_level ?? 100)
                    .input('grey_mode', mssql.Bit, grey_mode ?? 0)
                    .input('color_blindness_type', mssql.VarChar(50), color_blindness_type ?? 'none')
                    .input('cursor_size', mssql.Int, cursor_size ?? 100)
                    .input('text_highlight', mssql.Bit, text_highlight ?? 0)
                    .input('parkinson_mode', mssql.Bit, parkinson_mode ?? 0)
                    .input('voice_reader', mssql.Bit, voice_reader ?? 0)
                    .input('menu_position_x', mssql.Int, menu_position_x)
                    .input('menu_position_y', mssql.Int, menu_position_y)
                    .query(`
                        INSERT INTO ${this.tableName} 
                        (id_usuario, tipo_usuario, dark_mode, zoom_level, grey_mode, 
                         color_blindness_type, cursor_size, text_highlight, parkinson_mode, 
                         voice_reader, menu_position_x, menu_position_y)
                        VALUES 
                        (@id_usuario, @tipo_usuario, @dark_mode, @zoom_level, @grey_mode,
                         @color_blindness_type, @cursor_size, @text_highlight, @parkinson_mode,
                         @voice_reader, @menu_position_x, @menu_position_y)
                        
                        SELECT * FROM ${this.tableName}
                        WHERE id_preferencia = SCOPE_IDENTITY()
                    `);

                return result.recordset[0];
            }
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            throw error;
        }
    }

    // Actualizar solo una preferencia específica
    async updatePreferencia(idUsuario, tipoUsuario, campo, valor) {
        try {
            const pool = await getConnection();
            
            // Mapeo de campos permitidos
            const camposPermitidos = {
                'dark_mode': mssql.Bit,
                'zoom_level': mssql.Int,
                'grey_mode': mssql.Bit,
                'color_blindness_type': mssql.VarChar(50),
                'cursor_size': mssql.Int,
                'text_highlight': mssql.Bit,
                'parkinson_mode': mssql.Bit,
                'voice_reader': mssql.Bit,
                'menu_position_x': mssql.Int,
                'menu_position_y': mssql.Int
            };

            if (!camposPermitidos[campo]) {
                throw new Error(`Campo no permitido: ${campo}`);
            }

            const tipoValor = camposPermitidos[campo];
            let valorConvertido = valor;

            // Convertir valor según el tipo
            if (tipoValor === mssql.Bit) {
                valorConvertido = valor === 'true' || valor === true || valor === 1 || valor === '1';
            } else if (tipoValor === mssql.Int) {
                valorConvertido = parseInt(valor);
            }

            // Verificar si existe el registro
            const existentes = await this.findByUsuario(idUsuario, tipoUsuario);
            
            if (!existentes) {
                // Crear nuevo registro con valores por defecto
                const defaultValues = {
                    id_usuario: idUsuario,
                    tipo_usuario: tipoUsuario,
                    dark_mode: false,
                    zoom_level: 100,
                    grey_mode: false,
                    color_blindness_type: 'none',
                    cursor_size: 100,
                    text_highlight: false,
                    parkinson_mode: false,
                    voice_reader: false,
                    menu_position_x: null,
                    menu_position_y: null
                };
                defaultValues[campo] = valorConvertido;
                return await this.saveOrUpdate(defaultValues);
            }

            // Actualizar el campo específico
            const result = await pool.request()
                .input('id_usuario', mssql.Int, idUsuario)
                .input('tipo_usuario', mssql.VarChar(20), tipoUsuario)
                .input('valor', tipoValor, valorConvertido)
                .query(`
                    UPDATE ${this.tableName}
                    SET ${campo} = @valor, fecha_actualizacion = GETDATE()
                    WHERE id_usuario = @id_usuario AND tipo_usuario = @tipo_usuario
                    
                    SELECT * FROM ${this.tableName}
                    WHERE id_usuario = @id_usuario AND tipo_usuario = @tipo_usuario
                `);

            return result.recordset[0];
        } catch (error) {
            console.error('Error al actualizar preferencia:', error);
            throw error;
        }
    }
}

module.exports = PreferenciaAccesibilidad;


-- Tabla para guardar las preferencias de accesibilidad por usuario
CREATE TABLE [dbo].[preferencias_accesibilidad](
    [id_preferencia] [int] IDENTITY(1,1) NOT NULL,
    [id_usuario] [int] NOT NULL,
    [tipo_usuario] [varchar](20) NOT NULL, -- 'docente' o 'profesor'
    [dark_mode] [bit] NULL DEFAULT 0,
    [zoom_level] [int] NULL DEFAULT 100,
    [grey_mode] [bit] NULL DEFAULT 0,
    [color_blindness_type] [varchar](50) NULL DEFAULT 'none',
    [cursor_size] [int] NULL DEFAULT 100,
    [text_highlight] [bit] NULL DEFAULT 0,
    [parkinson_mode] [bit] NULL DEFAULT 0,
    [voice_reader] [bit] NULL DEFAULT 0,
    [dyslexia_mode] [bit] NULL DEFAULT 0,
    [dyslexia_letter_spacing] [decimal](5,2) NULL DEFAULT 0.03,
    [dyslexia_word_spacing] [decimal](5,2) NULL DEFAULT 0.08,
    [dyslexia_line_height] [decimal](5,2) NULL DEFAULT 1.50,
    [menu_position_x] [int] NULL,
    [menu_position_y] [int] NULL,
    [fecha_creacion] [datetime] NULL DEFAULT (getdate()),
    [fecha_actualizacion] [datetime] NULL DEFAULT (getdate()),
    CONSTRAINT [PK_preferencias_accesibilidad] PRIMARY KEY CLUSTERED ([id_preferencia] ASC),
    CONSTRAINT [UQ_preferencias_usuario] UNIQUE NONCLUSTERED ([id_usuario], [tipo_usuario])
) ON [PRIMARY];
GO

-- Índice para búsquedas rápidas por usuario
CREATE NONCLUSTERED INDEX [IX_preferencias_usuario] 
ON [dbo].[preferencias_accesibilidad] ([id_usuario], [tipo_usuario]);
GO


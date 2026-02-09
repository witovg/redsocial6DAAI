

-- Módulo Core y Usuarios (Grupos 2 y 7)
-- Base del sistema: Identidad, seguridad y configuración.

-- Tabla principal de Usuarios
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hash_contrasena VARCHAR(255) NOT NULL, -- Contraseña encriptada
    nombre_completo VARCHAR(100),
    url_avatar VARCHAR(255), -- Foto de perfil
    url_portada VARCHAR(255), -- Foto de portada
    biografia TEXT,
    frase_estado VARCHAR(100), -- "Tagline" o frase corta
    pais VARCHAR(50),
    ciudad VARCHAR(50),
    profesion VARCHAR(100),
    estado_disponibilidad ENUM('en_linea', 'desconectado', 'ausente', 'ocupado') DEFAULT 'desconectado',
    rol ENUM('usuario', 'admin', 'moderador') DEFAULT 'usuario',
    cuenta_verificada BOOLEAN DEFAULT FALSE,
    saldo_monedero DECIMAL(10, 2) DEFAULT 0.00, -- Saldo para la tienda
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Redes Sociales vinculadas
CREATE TABLE redes_sociales_usuario (
    id_enlace INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    nombre_plataforma VARCHAR(50), -- Facebook, Twitter, etc.
    url_perfil VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Configuración de Privacidad y Cuenta
CREATE TABLE configuracion_usuario (
    id_usuario INT PRIMARY KEY,
    visibilidad_perfil ENUM('publico', 'amigos', 'privado') DEFAULT 'publico',
    notificaciones_email BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Módulo Social y Conexiones (Grupos 2 y 4)
-- Manejo de amistades.

-- Sistema de Amistades
CREATE TABLE amistades (
    id_amistad INT PRIMARY KEY AUTO_INCREMENT,
    id_solicitante INT, -- Quien envía la solicitud
    id_receptor INT, -- Quien la recibe
    estado ENUM('pendiente', 'aceptado', 'bloqueado') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_receptor) REFERENCES usuarios(id_usuario)
);

-- Módulo Gamificación (Grupo 4)
-- Niveles, insignias y misiones.

-- Experiencia y Nivel
CREATE TABLE gamificacion_usuario (
    id_usuario INT PRIMARY KEY,
    nivel_actual INT DEFAULT 1,
    experiencia_actual INT DEFAULT 0,
    experiencia_siguiente_nivel INT DEFAULT 100,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Catálogo de Insignias (Badges)
CREATE TABLE insignias (
    id_insignia INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50),
    descripcion TEXT,
    url_icono VARCHAR(255),
    recompensa_exp INT -- Puntos de experiencia que otorga
);

-- Insignias ganadas por usuarios
CREATE TABLE insignias_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_insignia INT,
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_insignia) REFERENCES insignias(id_insignia)
);

-- Misiones (Quests)
CREATE TABLE misiones (
    id_mision INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100),
    descripcion TEXT,
    pasos_requeridos INT, -- Ej: Comentar 50 veces
    recompensa_exp INT,
    recompensa_monedas DECIMAL(10,2)
);

-- Progreso de Misiones
CREATE TABLE progreso_misiones_usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_mision INT,
    pasos_completados INT DEFAULT 0,
    esta_completada BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_mision) REFERENCES misiones(id_mision)
);

-- Módulo Newsfeed y Contenido (Grupo 1)
-- Publicaciones y reacciones.

-- Publicaciones (El Muro)
CREATE TABLE publicaciones (
    id_publicacion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_grupo INT NULL, -- NULL si es personal, ID si es de un grupo
    contenido TEXT,
    tipo_publicacion ENUM('estandar', 'video', 'audio', 'galeria') DEFAULT 'estandar',
    visibilidad ENUM('publico', 'amigos', 'privado') DEFAULT 'publico',
    contador_reacciones INT DEFAULT 0,
    contador_comentarios INT DEFAULT 0,
    contador_compartidos INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Archivos adjuntos (Fotos/Videos)
CREATE TABLE adjuntos_publicacion (
    id_adjunto INT PRIMARY KEY AUTO_INCREMENT,
    id_publicacion INT,
    url_archivo VARCHAR(255),
    tipo_archivo ENUM('imagen', 'video', 'audio', 'archivo'),
    FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE
);

-- Reacciones
CREATE TABLE reacciones (
    id_reaccion INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_publicacion INT NULL,
    id_comentario INT NULL,
    tipo_reaccion ENUM('me_gusta', 'me_encanta', 'divertido', 'sorprendido', 'triste', 'enojado'),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion)
);

-- Comentarios
CREATE TABLE comentarios (
    id_comentario INT PRIMARY KEY AUTO_INCREMENT,
    id_publicacion INT,
    id_usuario INT,
    id_comentario_padre INT NULL, -- Para respuestas a otros comentarios
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Módulo de Grupos (Grupo 3)
-- Comunidades.

-- Grupos
CREATE TABLE grupos_comunidad (
    id_grupo INT PRIMARY KEY AUTO_INCREMENT,
    id_creador INT,
    nombre VARCHAR(100),
    descripcion TEXT,
    url_avatar VARCHAR(255),
    url_portada VARCHAR(255),
    tipo_grupo ENUM('publico', 'privado', 'secreto') DEFAULT 'publico',
    categoria VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario)
);

-- Miembros del Grupo
CREATE TABLE miembros_grupo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_grupo INT,
    id_usuario INT,
    rol ENUM('admin', 'moderador', 'miembro') DEFAULT 'miembro',
    estado ENUM('activo', 'baneado', 'pendiente') DEFAULT 'activo',
    fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_grupo) REFERENCES grupos_comunidad(id_grupo),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Módulo Eventos (Grupo 1 y 3)
-- Agenda.

CREATE TABLE eventos (
    id_evento INT PRIMARY KEY AUTO_INCREMENT,
    id_creador INT,
    id_grupo INT NULL,
    titulo VARCHAR(150),
    descripcion TEXT,
    ubicacion VARCHAR(200),
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    imagen_portada VARCHAR(255),
    FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario)
);

-- Participantes en Eventos
CREATE TABLE participantes_evento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_evento INT,
    id_usuario INT,
    estado ENUM('asistire', 'interesado', 'no_asistire') DEFAULT 'interesado',
    FOREIGN KEY (id_evento) REFERENCES eventos(id_evento),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Módulo Marketplace (Grupo 5)
-- Tienda y economía.

-- Productos
CREATE TABLE productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    id_vendedor INT,
    nombre VARCHAR(150),
    descripcion TEXT,
    precio DECIMAL(10, 2),
    categoria VARCHAR(50),
    url_imagen VARCHAR(255),
    url_descarga VARCHAR(255), -- Para productos digitales
    stock INT DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id_usuario)
);

-- Carrito de Compras
CREATE TABLE items_carrito (
    id_carrito INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    id_producto INT,
    cantidad INT DEFAULT 1,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Pedidos / Órdenes
CREATE TABLE pedidos (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_comprador INT,
    monto_total DECIMAL(10, 2),
    estado ENUM('completado', 'pendiente', 'cancelado'),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_comprador) REFERENCES usuarios(id_usuario)
);

-- Detalles del Pedido
CREATE TABLE detalles_pedido (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT,
    id_producto INT,
    precio_compra DECIMAL(10, 2), -- Precio al momento de comprar
    cantidad INT,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

-- Módulo Chat (Grupo 4)
-- Mensajería.

-- Salas de Chat
CREATE TABLE salas_chat (
    id_sala INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('privado', 'grupal') DEFAULT 'privado',
    nombre_sala VARCHAR(100) NULL
);

-- Participantes de Sala
CREATE TABLE participantes_chat (
    id_sala INT,
    id_usuario INT,
    PRIMARY KEY (id_sala, id_usuario),
    FOREIGN KEY (id_sala) REFERENCES salas_chat(id_sala),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Mensajes
CREATE TABLE mensajes (
    id_mensaje BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_sala INT,
    id_emisor INT,
    contenido TEXT,
    es_leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sala) REFERENCES salas_chat(id_sala),
    FOREIGN KEY (id_emisor) REFERENCES usuarios(id_usuario)
);

-- Módulo Foros y Blog (Grupo 6)
-- Discusión y Artículos.

-- Categorías Foro
CREATE TABLE categorias_foro (
    id_categoria INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100),
    descripcion TEXT,
    icono VARCHAR(50)
);

-- Temas (Threads)
CREATE TABLE temas_foro (
    id_tema INT PRIMARY KEY AUTO_INCREMENT,
    id_categoria INT,
    id_creador INT,
    titulo VARCHAR(200),
    es_fijo BOOLEAN DEFAULT FALSE, -- Sticky post
    esta_cerrado BOOLEAN DEFAULT FALSE,
    contador_vistas INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias_foro(id_categoria),
    FOREIGN KEY (id_creador) REFERENCES usuarios(id_usuario)
);

-- Respuestas
CREATE TABLE respuestas_foro (
    id_respuesta INT PRIMARY KEY AUTO_INCREMENT,
    id_tema INT,
    id_usuario INT,
    contenido TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tema) REFERENCES temas_foro(id_tema),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Blog
CREATE TABLE articulos_blog (
    id_articulo INT PRIMARY KEY AUTO_INCREMENT,
    id_autor INT,
    titulo VARCHAR(200),
    contenido LONGTEXT,
    url_miniatura VARCHAR(255),
    etiquetas VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_autor) REFERENCES usuarios(id_usuario)
);

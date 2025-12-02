/**
 * Servidor personalizado para manejar autenticación
 * Ejecutar con: node server.js
 */

const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Configuración
const JWT_SECRET = 'tu-secret-key-super-seguro'; // ⚠️ CAMBIAR en producción
const TOKEN_EXPIRY = '24h';

// Middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

/**
 * POST /auth/login
 * Valida credenciales y retorna token JWT
 */
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validar entrada
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y password son requeridos',
    });
  }

  // Leer la BD
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));

  // Buscar usuario
  const user = db.auth.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas',
    });
  }

  // Generar JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Retornar usuario sin password
  const { password: _, ...userWithoutPassword } = user;

  return res.status(200).json({
    success: true,
    token,
    user: userWithoutPassword,
  });
});

/**
 * POST /auth/signup
 * Registra un nuevo usuario
 */
server.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body;

  // Validar entrada
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nombre, email y password son requeridos',
    });
  }

  // Leer la BD
  const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));

  // Verificar si el email ya existe
  const existingUser = db.auth.users.find((u) => u.email === email);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'El email ya está registrado',
    });
  }

  // Crear nuevo usuario
  const newUser = {
    id: String(Math.max(...db.auth.users.map((u) => parseInt(u.id))) + 1),
    name,
    email,
    password, // ⚠️ En producción SIEMPRE hashear las contraseñas
    role: 'cliente',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Agregar a la BD
  db.auth.users.push(newUser);
  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2));

  // Generar JWT
  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Retornar usuario sin password
  const { password: _, ...userWithoutPassword } = newUser;

  return res.status(201).json({
    success: true,
    token,
    user: userWithoutPassword,
  });
});

/**
 * GET /auth/me
 * Valida el token y retorna el usuario actual
 */
server.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
    });
  }

  const token = authHeader.slice(7); // Remover "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Leer la BD para obtener datos actualizados del usuario
    const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8'));
    const user = db.auth.users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Retornar usuario sin password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
});

/**
 * Usar las rutas por defecto de json-server
 * para los otros recursos (services, appointments, etc.)
 */
server.use(router);

// Iniciar servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Servidor autenticación corriendo en http://localhost:${PORT}`);
  console.log(`📚 DB watchers habilitado en db.json`);
});

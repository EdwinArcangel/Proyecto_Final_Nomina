
# E -Nomina
Sistema de gestión de nómina desarrollado con Node.js + Express + MySQL en el backend y React + Vite en el frontend.
Incluye módulos de empleados, usuarios, novedades, pagos y reportes, con autenticación mediante JWT.
Proyecto Final Nómina

---------------------------------------------------------------------------------------------------------------------------------
# 🚀 Tecnologías usadas

* Backend
* Node.js
* Express
* MySQL2
* Bcrypt
* JSON Web Token (JWT)
  
 * ORS
  
  * Dotenv
  
  * Nodemon (dev)

* Frontend
  
 * React
  
 * React Router DOM 
  
  * Axios
  
  * React Toastify
  
 * Recharts

  * Vite

---------------------------------------------------------------------------------------------------------------------------------

Proyecto_Final_Nomina/
│
├── backend/ # Lógica del servidor (Node.js + Express)
│ ├── config/
│ │ └── db.js # Conexión a MySQL y creación automática de tablas
│ │
│ ├── routes/ # Rutas del backend (APIs REST)
│ │ ├── auth.js # Login con JWT
│ │ ├── empleados.js # CRUD de empleados
│ │ ├── usuarios.js # CRUD de usuarios
│ │ ├── novedades.js # CRUD de novedades
│ │ ├── pagos.js # CRUD de pagos
│ │ ├── cargos.js # CRUD de cargos
│ │ └── dashboard.js # Datos para el panel de control
│ │
│ └── server.js # Punto de entrada del backend
│
├── frontend/ # Aplicación cliente (React + Vite)
│ └── src/
│ ├── home/ # Dashboard principal
│ ├── employees/ # Gestión de empleados
│ ├── users/ # Gestión de usuarios
│ ├── novedades/ # Gestión de novedades
│ ├── payments/ # Gestión de pagos
│ ├── reportes/ # Reportes en Excel/PDF
│ ├── utils/ # Configuración de API (axios, helpers, etc.)
│ ├── App.jsx # Rutas protegidas con React Router
│ └── index.html
│
└── README.md # Documentación del proyecto
---------------------------------------------------------------------------------------------------------------------------------
# ⚙️ Instalación y Configuración

1️⃣ Clonar el repositorio

git clone https://github.com/EdwinArcangel/Proyecto_Final_Nomina.git


2️⃣ Backend

* Ir a la carpeta backend/:

* ejecutar comando:
  cd backend npm install

# Dependencias Backend:

* npm install express mysql2 bcrypt jsonwebtoken cors dotenv

* npm install --save-dev nodemon

* Variables de entorno (.env)

# Crear archivo .env en backend/:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD= '' password configurado 
DB_NAME=nomina_db

* Ejecutar servidor backend

⚠️ Antes de iniciar, asegúrate de levantar MySQL:

# Windows
* net start mysql

# Linux/Mac
* sudo service mysql start


Luego ejecutar:
 node server.js



* Servidor disponible en: http://localhost:3000

3️⃣ Frontend

* Ir a la carpeta frontend/:

* Ejecutar frontend: npm run dev

 Frontend disponible en:
 http://localhost:5173
---------------------------------------------------------------------------------------------------------------------------------
📊 Módulos principales

* Login y Autenticación

* Dashboard con métricas de empleados, usuarios, pagos y novedades

* Gestión de Empleados  (CRUD con cargos relacionados)

* Gestión de Usuarios 

* Gestión de Novedades 

* Gestión de Pagos 

* Reportes  exportables a Excel

# 🛠️ Scripts disponibles
# Backend
* npm run dev:  Levanta el servidor con nodemon

# Frontend
* npm run dev: Levanta el frontend con Vite

# 👨‍💻 Autor

# Video de Funcionamiento
https://vimeo.com/1114750546

## 🧪 Pruebas con Postman

archivo de coleccion en carpeta collection

[text](../../Downloads/collection.json)

Edwin Arcangel
📌 Proyecto académico / Sistema de nómina

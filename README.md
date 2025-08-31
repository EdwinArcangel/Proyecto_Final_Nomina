
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

* DB_HOST=localhost

* B_USER=root

* DB_PASSWORD= '' password configurado 

* DB_NAME=nomina_db

* JWT_SECRET=mi_secreto

* Ejecutar servidor backend

⚠️ Antes de iniciar, asegúrate de levantar MySQL:

# Windows
* net start mysql

# Linux/Mac
* sudo service mysql start


Luego ejecutar:

* npm run dev


* Servidor disponible en: http://localhost:3000

3️⃣ Frontend

* Ir a la carpeta frontend/:

* npm install

# Dependencias Frontend
* npm install react react-dom react-router-dom axios react-toastify recharts
* npm install --save-dev vite @vitejs/plugin-react

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



Edwin Arcangel
📌 Proyecto académico / Sistema de nómina

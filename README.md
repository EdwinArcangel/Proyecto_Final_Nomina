📌 E-Nómina

<<<<<<< HEAD
Presentado por:
✦ Edwin Arcangel

Aplicación web con frontend y backend separados, diseñada para gestionar el proceso de nómina en una empresa.
Incluye autenticación, panel de administración, gestión de empleados, usuarios, novedades, pagos y reportes exportables.

🌐 Proyecto desplegado en la nube

🖥️ Backend + Frontend:
👉 (Aquí puedes poner el link de Render/Netlify si ya lo tienes desplegado)

📽️ Video de funcionamiento

👉 Ver en Vimeo
=======
***********************PROYECTO FINAL DE SOFTWARE***********************

E- NOMINA

presentado por:

Edwin Escobar Bran

Aplicación web con frontend y backend separados, diseñada para gestionar el proceso de nómina en una empresa.
Incluye autenticación, panel de administración, gestión de empleados, usuarios, novedades, pagos y reportes exportables.

----------------------------NOTA----------------------------------------------

EL SIGUIENTE ES EL LINK DEL PROYECTO DESPLEGADO EN LA NUBE:
    
---------------------------------------------------------------------------------------------------------------------------------
Importante

Ver el video del funcionamiento de software primero:

    https://vimeo.com/1114750546
---------------------------------------------------------------------------------------------------------------------------------
🚀 Características principales
Autenticación de usuarios con validación en backend
Panel de administración para gestión de datos
Interfaz web en HTML, CSS y JavaScript
API REST desarrollada en Node.js con Express
Conexión a base de datos MySQL
Middleware de autenticación para proteger rutas
---------------------------------------------------------------------------------------------------------------------------------
📂 Estructura del proyecto

>>>>>>> 908090341e049994de55d43d8fa78a7e55a021ef

🚀 Características principales

🔐 Autenticación de usuarios con JWT

📊 Panel de control con métricas (empleados, pagos, novedades, usuarios)

👥 Gestión de Empleados (CRUD con cargos/departamentos relacionados)

🧑‍💻 Gestión de Usuarios

📌 Registro y gestión de Novedades (vacaciones, incapacidades, bonificaciones, etc.)

💰 Gestión de Pagos por periodos de nómina

📑 Generación de reportes exportables

📂 Estructura del proyecto
Proyecto_Final_Nomina/
│
├── backend/                                  # Lógica y API del servidor
│   ├── server.js                             # Punto de entrada
│   ├── config/db.js                          # Conexión a la base de datos + migraciones
│   ├── routes/                               # Rutas del backend
│   │   ├── auth.js                           # Autenticación
│   │   ├── empleados.js                      # Gestión empleados
│   │   ├── usuarios.js                       # Gestión usuarios
│   │   ├── novedades.js                      # Gestión novedades
│   │   ├── pagos.js                          # Gestión pagos
│   │   ├── cargos.js                         # Gestión cargos
│   │   └── dashboard.js                      # Datos para panel
│   └── package.json                          # Dependencias backend
│
├── frontend/                                 # Aplicación cliente (React + Vite)
│   ├── src/
│   │   ├── home/                             # Dashboard
│   │   ├── employees/                        # Módulo empleados
│   │   ├── users/                            # Módulo usuarios
│   │   ├── novedades/                        # Módulo novedades
│   │   ├── payments/                         # Módulo pagos
│   │   ├── reportes/                         # Exportación de reportes
│   │   ├── utils/                            # Config API (axios, helpers)
│   │   ├── App.jsx                           # Rutas protegidas
│   │   └── index.html
│   └── package.json                          # Dependencias frontend
│
<<<<<<< HEAD
└── README.md                                 # Documentación
=======
└── README.md # Documentación del proyecto
---------------------------------------------------------------------------------------------------------------------------------
>>>>>>> 908090341e049994de55d43d8fa78a7e55a021ef

🛠 Tecnologías utilizadas

Backend:

<<<<<<< HEAD
Node.js + Express.js

MySQL (MySQL2)

JWT (Autenticación)

Bcrypt (Hash de contraseñas)

Dotenv (Variables de entorno)

Cors

Nodemon (dev)

Frontend:

React + Vite

React Router DOM

Axios

React Toastify

Recharts

Otros:

Git y GitHub (control de versiones)

Railway (Base de datos en la nube)

Render / Netlify (Despliegue)

📋 Requisitos previos

Antes de instalar el proyecto, asegúrate de tener:

Node.js >= 18 (LTS) 👉 descargar aquí

NPM (incluido en Node.js)

MySQL >= 5.7 o MariaDB >= 10.2
=======
Node.js
Express.js
MySQL (mysql2 o similar)
dotenv (variables de entorno)
Frontend:

HTML5
CSS3
Boostrap
JavaScript
Otros:

Git y GitHub para control de versiones
VS Code / IntelliJ IDEA como entornos recomendados

---------------------------------------------------------------------------------------------------------------------------------

📋 Requisitos previos

Antes de instalar el proyecto, asegúrate de tener instalado:

Requiere Node.js >= 22 (LTS) puede obtenerse fácilmente desde la página oficial https://nodejs.org/en
Requiere el gestor de paquetes NPM que también puede ser obtenido desde la página oficial de Node.
Requiere Base de Datos MariaDB >= 10.2 o MySQL >= 5.7
---------------------------------------------------------------------------------------------------------------------------------
------------------------## ⚙️ Instalación y configuración----------------------------------------------

1. Clonar el repositorio

2. Desde la terminal ejecutar estos pasos
    - 1 cd files
    - 2 cd backend (ASEGURATE DE ESTAR EN LA CARPETA BACKEND PARA REALIZAR LOS SIGUIENTES PASOS)
    - 3 npm install
   
    Configurar el backend
    Crea el archivo .env con el siguiente contenido:

 - DB_HOST=localhost
 - DB_USER=root
 - DB_PASSWORD=tu_password
 - DB_NAME=db.nomina

3. Iniciar el servidor

 - Ejecutar el comando node server.js
 - Al iniciar el servidor se crea automáticamente la base de datos nomina_db si no existe.
 - También se generan tablas iniciales y registros de prueba (empleados y usuario).

4. Abrir el frontend

- Abre  la url http://localhost:5173/ en tu navegador.
- El frontend se comunicará con el backend

------------------------------------- VIDEO EXPLICATIVO DE INSTALACIÓN Y FUNCIONAMIENTO DEL SOFTWARE-----------------------------------------------------------------


     https://vimeo.com/1114750546
---------------------------------------------------------------------------------------------------------------------------------     
🧑‍💻 Herramientas recomendadas para versionamiento y desarrollo

Git: Control de versiones

GitHub: Repositorio remoto y colaboración

Visual Studio Code: Editor ligero con integración Git

IntelliJ IDEA: IDE con soporte completo para Node.js, Express y Git

---------------------------------------------------------------------------------------------------------------------------------

## 🧪Coleccion Apis Postman

abrir el archivo  collection.json e importar en postman 

---------------------------------------------------------------------------------------------------------------------------------
Edwin Arcangel
📌 Proyecto académico / Sistema de nómina
>>>>>>> 908090341e049994de55d43d8fa78a7e55a021ef

📌 E-Nómina

Presentado por:
✦ Edwin Arcangel

Aplicación web con frontend y backend separados, diseñada para gestionar el proceso de nómina en una empresa.
Incluye autenticación, panel de administración, gestión de empleados, usuarios, novedades, pagos y reportes exportables.

🌐 Proyecto desplegado en la nube

🖥️ Backend + Frontend:
👉 (Aquí puedes poner el link de Render/Netlify si ya lo tienes desplegado)

📽️ Video de funcionamiento

👉 Ver en Vimeo

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
└── README.md                                 # Documentación

🛠 Tecnologías utilizadas

Backend:

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

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

🛠 Tecnologías utilizadas

Backend:

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

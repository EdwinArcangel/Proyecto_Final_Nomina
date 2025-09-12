***********************PROYECTO FINAL DE SOFTWARE***********************

E- NOMINA

presentado por:

Edwin Escobar Bran

Aplicación web con frontend y backend separados, diseñada para gestionar el proceso de nómina en una empresa.
Incluye autenticación, panel de administración, gestión de empleados, usuarios, novedades, pagos y reportes exportables.

----------------------------NOTA----------------------------------------------

EL SIGUIENTE ES EL LINK DEL PROYECTO DESPLEGADO EN LA NUBE:
    https://e-nomina.vercel.app/
    
---------------------------------------------------------------------------------------------------------------------------------
🚀 Características principales 

- Autenticación de usuarios con validación en backend
- Panel de administración para gestión de datos
- Interfaz web en HTML, CSS y JavaScript
- API REST desarrollada en Node.js con Express
- Conexión a base de datos MySQL
- Middleware de autenticación para proteger rutas

---------------------------------------------------------------------------------------------------------------------------------
🚀 Características principales
- Autenticación de usuarios con JWT
- Panel de control con métricas (empleados, pagos, novedades, usuarios)
- Gestión de Empleados (CRUD con cargos/departamentos relacionados)
- Gestión de Usuarios
- Registro y gestión de Novedades (vacaciones, incapacidades, bonificaciones, etc.)
- Gestión de Pagos por periodos de nómina
- Generación de reportes exportables
-------------------------------------------------------------------------------------------
## 📂 Estructura del proyecto
<p class="has-line-data" data-line-start="0" data-line-end="26">Proyecto_Final_Nomina/<br>
├── backend/<br>
│ ├── server.js<br>
│ ├── config/<br>
│ │ └── db.js<br>
│ └── routes/<br>
│ ├── auth.js<br>
│ ├── empleados.js<br>
│ ├── usuarios.js<br>
│ ├── novedades.js<br>
│ ├── pagos.js<br>
│ └── cargos.js<br>
├── frontend/<br>
│ ├── package.json<br>
│ └── src/<br>
│ ├── home/<br>
│ ├── employees/<br>
│ ├── users/<br>
│ ├── novedades/<br>
│ ├── payments/<br>
│ ├── reportes/<br>
│ ├── utils/<br>
│ ├── App.jsx<br>
│ └── index.html<br>
├── package.json<br>
└── <a href="http://README.md">README.md</a></p>
-------------------------------------------------------------------------------------------
🛠 Tecnologías utilizadas

Backend:
- Node.js + Express.js
- MySQL (MySQL2)
- JWT (Autenticación)
- Bcrypt (Hash de contraseñas)
- Dotenv (Variables de entorno)
- Cors
- Nodemon (dev)

Frontend:
- React + Vite
- React Router DOM
- Axios
- React Toastify
- Recharts

Otros:
- Git y GitHub (control de versiones)
- Railway (Base de datos en la nube)
- Render / Netlify (Despliegue)
-------------------------------------------------------------------------------------------
📋 Requisitos previos

- Requiere Node.js >= 22 (LTS) puede obtenerse fácilmente desde la página oficial https://nodejs.org/en
- Requiere el gestor de paquetes NPM que también puede ser obtenido desde la página oficial de Node.
- Requiere Base de Datos MariaDB >= 10.2 o MySQL >= 5.7

-------------------------------------------------------------------------------------------

------------------## ⚙️ Instalación y configuración----------------------------------------------

1. Clonar el repositorio
- https://github.com/EdwinArcangel/Proyecto_Final_Nomina

2. Desde la terminal ejecutar estos pasos
    - 1: cd backend
    - 2: npm install
   
    Configurar el backend
    Crea el archivo .env con el siguiente contenido:
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_password
    DB_NAME=db.nomina

3. Iniciar el servidor
   - Ejecutar el comando node server.js
   - Al iniciar el servidor se crea automáticamente la base de datos nomina_db si no existe.
   - También se generan tablas iniciales y registros de prueba (usuario de prueba: admin@nomina.com password: admin123).
   

4. Abrir el frontend
   - 1: cd frontend
   - 2: npm install
   - 3: npm run dev
   - Abre  la url http://localhost:5173/ en tu navegador.
   - El frontend se comunicará con el backend

------------------------------------- VIDEO EXPLICATIVO DE INSTALACIÓN Y FUNCIONAMIENTO DEL SOFTWARE--------------------------

  - Video 
     https://vimeo.com/1114750546
--------------------------------------------------------------------------------------------------------------------------------   
🧑‍💻 Herramientas recomendadas para versionamiento y desarrollo

Git: Control de versiones

GitHub: Repositorio remoto y colaboración

Visual Studio Code: Editor ligero con integración Git

IntelliJ IDEA: IDE con soporte completo para Node.js, Express y Git

---------------------------------------------------------------------------------------------------------------------------------

## 🧪 Coleccion de Apis en Postman

abrir el archivo  collection.json e importar en postman 

---------------------------------------------------------------------------------------------------------------------------------
Autor: Edwin Arcangel
- Proyecto académico / Sistema de nómina

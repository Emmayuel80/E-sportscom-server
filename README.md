# E-sportscom-server

API para la creacion y gestion de torneos de esports (League of Legends y TeamFight Tactics) dentro de la comunidad de ESCOM

## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._

### Pre-requisitos 📋

_Que cosas necesitas para instalar el software_

```
Node v14
MySQL Server
```

### Instalación 🔧

_Instala los modulos del proyecto_

```
$ npm install
```

_Configura tu archivo .env_

```
JWT_SECRET= -> Secreto para la generacion de JWT
DB_HOST= -> Host de la base de datos
DB_USER= -> Usuario de la base de datos
DB_PASS= -> Password de la base de datos
DB_NAME= -> Nombre de la base de datos
MAILER_ACC= -> Cuenta de correo para el envio de correos con nodemailer
MAILER_PASS= -> Contraseña del correo
HTTP= -> Protocolo (HTTP/HTTPS)
HOST= -> Dominio web
PORT= -> Puerto
SSL_KEY= -> Ubicacion de la llave SSL
SSL_CERTIFICATE= -> Ubicacion del certificado SSL
LEAGUE_API_KEY= -> Llave de la API de League
```

## Ejecutando las pruebas ⚙️

Las pruebas unitarias se corren con Jest

```
$ npm test
```

## Construido con 🛠️

- [NodeJS](https://nodejs.org/en/) - Entorno de javascript
- [Express](https://expressjs.com) - Fast, unopinionated, minimalist web framework for Node.js
- [Jest](https://jestjs.io) - Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
- [nodemailer](https://nodemailer.com/about/) - Nodemailer is a module for Node.js applications to allow easy as cake email sending.

## Autores ✒️

- **Silvestre Emmanuel** - _Desarrollador_ - [Emmayuel80](https://github.com/Emmayuel80)
- **Eduardo Cedillo** - _Desarrollador_ - [EduardoCedillo](https://github.com/EduardoCedillo)
- **Jose Manuel** - _Desarrollador_ - [JomaDm](https://github.com/JomaDm)

También puedes mirar la lista de todos los [contribuyentes](https://github.com/E-sportscom-server/contributors) quíenes han participado en este proyecto.

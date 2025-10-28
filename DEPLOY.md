# Guía de Despliegue y Mantenimiento

Esta guía describe los pasos para desplegar y mantener la aplicación.

## Prerrequisitos

Antes de desplegar la aplicación, asegúrate de tener instalado Docker y Docker Compose.

También, debes crear un archivo `.env` en la raíz del proyecto. Puedes usar el archivo `.env.example` como plantilla.

## Despliegue

Para desplegar la aplicación, sigue estos pasos:

1.  **Construir la imagen de Docker:**

    ```bash
    docker-compose build
    ```

2.  **Iniciar los contenedores:**

    ```bash
    docker-compose up -d
    ```

Esto iniciará la aplicación en modo detached. La aplicación estará disponible en `http://localhost:3001` y la base de datos en el puerto `3305`.

### Sin Docker

Si no deseas utilizar Docker, puedes ejecutar la aplicación de la siguiente manera:

**Development**

Para ejecutar la aplicación en un entorno de desarrollo, ejecuta:

```bash
npm run dev
```

**Production**

Para compilar y ejecutar la aplicación en un entorno de producción, ejecuta:

```bash
npm run build
npm start
```

## Mantenimiento

A continuación se describen los comandos para el mantenimiento de la aplicación.

### Verificar el estado de la aplicación

Para verificar el estado de los contenedores, ejecuta:

```bash
docker-compose ps
```

### Ver los logs

Para ver los logs de la aplicación en tiempo real, ejecuta:

```bash
docker-compose logs -f
```

### Detener la aplicación

Para detener la aplicación, ejecuta:

```bash
docker-compose down
```

## Tecnologías

Este proyecto está construido con las siguientes tecnologías:

*   **Node.js**
*   **Express**
*   **TypeScript**
*   **MariaDB**
*   **Docker**

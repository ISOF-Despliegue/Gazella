# Gazella #

Cliente para el sistema de publicación y voluntariado para la conservación de la biodiversidad Gazella

## Descripción ##

**Gazella** es un sistema dedicado a la promoción de la conservación de la biodiversidad, proporcionando un repositorio de articulos provistos por los usuarios y un sistema para la organización de misiones de voluntariado para la restauración del ecosistema.  

## Integrantes ##

* Hernández Yong Abel
* Ortega Teoba Leonardo Daniel
* Castillo Barradas Carlos

## Tecnologías ##

* Electron
* TypeScript
* Vite
* Tailwind CSS
* React Router DOM

## Instalación ##

Clonar el repositorio:

```bash
git clone <https://github.com/ISOF-Despliegue/Gazella>
cd <NOMBRE_DEL_PROYECTO>
```

Instalar dependencias:

```bash
npm install
```

## Ejecución ##

```bash
npm run dev
```

## Scripts principales ##

```bash
npm run build
npm run electron:dev
npm run release:win
npm run cap:sync
npm run apk:debug
```

## Aplicacion de escritorio ##

El proyecto usa Electron para generar la version de Windows. El instalador se genera con:

```bash
npm run release:win
```

Para generar ejecutables para Linux, puede usar:

```bash
npm run release:linux
```

Los archivos resultantes apareceran en `release/`.

## Android ##

El proyecto usa Capacitor para generar Android. Para compilar el APK de depuracion:

```bash
npm run apk:debug
```

El APK queda en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

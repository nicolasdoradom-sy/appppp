# SpeedMoto

Catálogo móvil de motos deportivas creado con JavaScript vanilla, Vite y Capacitor.

Incluye búsqueda, filtros por marca y cilindrada, ordenamiento, fichas técnicas, favoritos persistentes y comparación de dos modelos. Las ilustraciones de las tarjetas y el icono se generan localmente.

## Ejecutar en navegador

```bash
npm install
npm run dev
```

## Generar el APK de Android

```bash
npm run generate:icons
npm run build
npx cap sync android
```

Abre la carpeta `android` en Android Studio y usa **Build → Generate App Bundle(s) / APK → Generate APK**. El APK de depuración suele quedar en `android/app/build/outputs/apk/debug/app-debug.apk`.
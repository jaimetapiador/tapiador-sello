# Imagen para compartir (Open Graph)

`og.svg` es el origen de `public/og.png` (1200×630). Se genera una vez y se versiona el PNG.

Para regenerarla hacen falta `sharp` (está en tapiador-web) y las fuentes en TTF, que no se versionan aquí:
Newsreader, Newsreader Italic, Instrument Sans y Geist Mono del repositorio google/fonts (licencia OFL).
Se registran con un `fonts.conf` de fontconfig que apunte a la carpeta de los TTF y se convierte con:

```js
// FONTCONFIG_FILE=/ruta/fonts.conf node og.mjs og/og.svg public/og.png
await sharp("og/og.svg", { density: 72 }).png({ compressionLevel: 9 }).toFile("public/og.png");
```

librsvg no lee WOFF2, por eso no sirven las fuentes de @fontsource.

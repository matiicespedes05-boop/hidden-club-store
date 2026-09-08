# Hidden Club Store — cómo dejar los pagos funcionando de verdad

Este proyecto tiene dos partes:

- `/` (raíz): el sitio (frontend) — lo que ve la gente. Se despliega en **Vercel** o **Netlify**.
- `/server`: el backend nuevo — habla con Mercado Pago y te manda el mail cuando te pagan. Se despliega en **Render** o **Railway** (necesita quedar prendido 24hs, a diferencia del frontend).

Ahora mismo, si arrancás el sitio así nomás, Mercado Pago va a fallar porque le faltan tus credenciales. Seguí estos pasos en orden.

## 1. Conseguir tus credenciales de Mercado Pago

1. Entrá a https://www.mercadopago.com.ar/developers/panel con tu cuenta.
2. Creá una aplicación (o usá una existente) → "Credenciales de producción" y "Credenciales de prueba".
3. Copiá el **Access Token** (empieza con `TEST-` para pruebas o `APP_USR-` para producción). Ese va en el backend.

**Importante:** primero probá todo con las credenciales de `TEST-...`. Mercado Pago te da tarjetas de prueba en la misma página de developers para simular compras sin gastar plata real. Recién cuando funcione todo, cambiás al Access Token de producción (`APP_USR-...`).

## 2. Configurar y deployar el backend (`/server`)

1. Entrá a `/server`, copiá `.env.example` como `.env` y completá:
   - `MP_ACCESS_TOKEN`: el que sacaste en el paso 1.
   - `EMAIL_USER` / `EMAIL_PASS`: para que te llegue el mail. Usá una "contraseña de aplicación" de Gmail (no tu contraseña normal): activá la verificación en 2 pasos en tu cuenta de Google y generá una en https://myaccount.google.com/apppasswords
   - `NOTIFY_EMAIL`: a dónde llega el aviso (podés dejar `hidenclubba@gmail.com`).
   - `FRONTEND_URL` y `BACKEND_URL`: las vas a completar recién cuando tengas las URLs finales del deploy (podés dejarlas con localhost mientras probás local).
2. Subí la carpeta `/server` a un repositorio de GitHub (separado o el mismo repo, como prefieras).
3. Andá a https://render.com (o Railway), creá un "Web Service" nuevo apuntando a esa carpeta, con:
   - Build command: `npm install`
   - Start command: `npm start`
   - Cargá ahí las mismas variables de entorno del `.env` (Render tiene una sección "Environment" para esto — nunca subas el `.env` al repo).
4. Una vez deployado, Render te da una URL tipo `https://hidden-club-backend.onrender.com`. Actualizá `BACKEND_URL` en las variables de entorno del propio Render con esa URL.

## 3. Configurar y deployar el frontend

1. En la raíz del proyecto, copiá `.env.example` como `.env` y poné `VITE_API_URL` con la URL del backend que te dio Render.
2. Subí el proyecto a Vercel o Netlify (conectando el repo de GitHub). Configurá ahí la misma variable de entorno `VITE_API_URL`.
3. Una vez deployado te va a dar una URL tipo `https://hidden-club-store.vercel.app`. Volvé a Render y actualizá `FRONTEND_URL` en el backend con esa URL (así Mercado Pago sabe a dónde redirigir después del pago).

## 4. Probar

1. Entrá a tu tienda deployada, agregá algo al carrito y andá a "Finalizar pedido".
2. Elegí "Tarjeta y Mercado Pago" y completá el formulario.
3. Te va a redirigir al checkout real de Mercado Pago (en modo prueba). Pagá con una tarjeta de prueba.
4. Deberías: volver a tu sitio en `/checkout/resultado`, ver "Pago aprobado" y ser redirigido automáticamente a WhatsApp para mandar el comprobante — y te tiene que llegar el mail a `hidenclubba@gmail.com`.

Cuando todo funcione con las credenciales de prueba, cambiá `MP_ACCESS_TOKEN` en Render por el de producción (`APP_USR-...`) y listo, ya cobrás de verdad.

## Sobre transferencia y efectivo

Esas dos opciones siguen funcionando como antes (reserva el pedido y te muestra los datos para transferir, o coordina el retiro) — no pasan por Mercado Pago porque son pagos manuales.

## Sobre AstroPay, criptomonedas y PayPal

No están incluidos todavía. Son integraciones separadas (cada una con su propia cuenta de comercio y su propio proceso de aprobación) — si más adelante los necesitás, se agregan de a uno del mismo modo que se hizo con Mercado Pago.

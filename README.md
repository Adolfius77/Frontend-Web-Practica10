# Práctica 10 — Preguntas y respuestas

### 1. ¿Por qué el filtro atrapa la clase base y no cada error por separado?

Porque al atrapar ErrorDeDominio también atrapa a todas sus hijas. Así no tengo que ir agregando cada error nuevo al filtro. Si mañana creo otro error que herede de la base, el filtro ya lo agarra solo. Si los pusiera uno por uno sería muy fácil que se me olvidara alguno.

### 2. ¿Qué pasa si se comenta next()?

La petición se queda cargando para siempre y nunca llega una respuesta. Lo raro es que tampoco sale ningún error en la consola. Pasa porque next() es lo que deja que la petición siga su camino, y sin él nadie más la atiende.

### 3. ¿Por qué este middleware no podría decidir si un usuario tiene permiso para una ruta?

Porque el middleware corre antes de que Nest sepa a qué controller y a qué método va la petición. No puede ver decoradores como @Publico(), entonces no sabe si la ruta es pública o qué permisos pide. Eso lo puede hacer un guard, porque el guard ya sabe a qué método va.

### 4. ¿Por qué la petición que responde 409 no aparece en el registro del LoggingInterceptor?

Porque el tap() del interceptor solo se ejecuta cuando todo sale bien. Cuando hay un error como el 409, la petición se brinca el tap() y se va directo al filtro. Por eso en la consola solo aparece el aviso del filtro y no la línea con el tiempo.

### 5. ¿Por qué el SobreInterceptor rompe a cualquier cliente que ya estuviera usando la API?

Porque cambia la forma de todas las respuestas. Antes GET /clases regresaba la lista directo y ahora la regresa dentro de data. Si un frontend hacía res[0].nombre, ahora le sale undefined y tendría que cambiar a res.data[0].nombre. Por eso conviene decidirlo ahora, antes de que el frontend de React empiece a usar la API.

### 6. Si el servidor respondió en los dos casos, ¿quién bloquea y a quién protege?

El que bloquea es el navegador, no el servidor. El servidor responde igual a los dos orígenes, la diferencia es que a localhost:5173 le agrega el encabezado Access-Control-Allow-Origin y a localhost:4000 no. Cuando el navegador no ve ese encabezado, no deja que la página lea la respuesta. Esto protege al usuario, para que una página de otro sitio no pueda usar su sesión para sacar datos de nuestra API.

### 7. ¿Por qué el campo se llama passwordHash y no password?

Porque lo que se guarda no es la contraseña, es el hash que genera bcrypt. Con ese nombre es más difícil equivocarse y guardar la contraseña tal cual. Además, quien vea el código o la tabla entiende de inmediato que ahí no hay contraseñas en texto normal.

### 8. ¿Por qué los dos errores del inicio de sesión dicen exactamente lo mismo?

Para no dar pistas. Si en un caso el mensaje dijera que el correo no existe y en el otro que la contraseña está mal, cualquiera podría ir probando correos hasta saber cuáles tienen cuenta. Con el mismo mensaje en los dos casos no se puede saber si falló el correo o la contraseña.

### 9. ¿Qué se lee en jwt.io sin conocer el secreto?

Se lee casi todo. En el header sale el algoritmo (HS256) y en el payload salen el id del usuario (sub), su correo, su rol, su miembroId y las fechas de cuándo se creó y cuándo vence el token. Lo único que jwt.io no puede hacer es confirmar que la firma sea válida, porque para eso necesita el secreto.

### 10. Si el contenido se puede leer, ¿qué es lo que protege la firma?

La firma no sirve para esconder los datos, sirve para que nadie los pueda cambiar. Si alguien edita el token, por ejemplo para ponerse rol: admin, la firma ya no coincide y el servidor lo rechaza con 401. Para hacer una firma nueva que sí coincida necesitaría el JWT_SECRET, y ese solo lo tiene el servidor. Por eso en el token no se pone nada secreto.

### 11. ¿Por qué es más seguro proteger todo y abrir a mano, que al revés?

Porque si se me olvida algo, el error es seguro. Si olvido poner @Publico() en una ruta, esa ruta da 401, alguien se queja y lo arreglo rápido. En cambio, si tuviera que proteger cada ruta a mano y se me olvida una, esa ruta queda abierta para cualquiera y nadie se da cuenta porque todo parece funcionar bien.

### 12. ¿Cuál es la diferencia entre un 401 y un 403?

El 401 significa que el servidor no sabe quién eres. Pasa cuando no mandas token o el token no sirve, y se arregla iniciando sesión. El 403 significa que el servidor sí sabe quién eres, pero no tienes permiso para lo que intentas hacer. Por ejemplo, Karla tiene sesión pero no puede inscribir a Sofía. Ahí volver a iniciar sesión no arregla nada.

### 13. ¿Cuántas líneas del AuthService tuvieron que cambiar para pasar de memoria a MySQL? ¿Por qué?

Ninguna. El AuthService no sabe dónde se guardan los usuarios, solo usa la interfaz UsuarioRepository con sus métodos buscarPorCorreo() y guardar(). Lo único que cambió fue una línea en auth.module.ts, donde se dice qué repositorio usar. Se cambió el de memoria por el de Prisma y el servicio siguió igual.

### 14. ¿Por qué es importante tomar al usuario de los claims del token y no de un parámetro de la URL o del cuerpo?

Porque la URL y el cuerpo los escribe el cliente, y puede poner lo que quiera. El token, en cambio, lo firmó el servidor.

Por ejemplo, si existiera GET /miembros/3/inscripciones y la API confiara en ese 3, Karla (que es el miembro 1) podría cambiar el número a 3 y ver las inscripciones de Sofía. Cambiando el número podría ver las de todos. Lo mismo pasaba antes en POST /inscripciones. Si la API solo leía el miembroId del cuerpo, Karla podía mandar el 3 e inscribir a Sofía sin que ella supiera.

Por eso se usa el claim miembroId que viene dentro del token. En el controller se compara con el miembroId del cuerpo y si no coinciden responde 403. Karla no puede falsificarlo porque si cambia su miembroId dentro del token la firma deja de coincidir y el servidor responde 401. Para hacer una firma válida necesitaría el JWT_SECRET, y ese nunca sale del servidor.

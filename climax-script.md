# Script de clímax

Un script describe la pose del objeto a lo largo del clímax. El reproductor lo llama muchas veces con el tiempo `t` (de `0` al inicio a `1` al final) y con `half` (la mitad de la altura del objeto). Cada llamada parte de la pose inicial y aplica las frases que corresponden a ese `t`.

Si en un `t` el script no asigna ningún canal, se conserva la pose del último instante anterior que sí asignó. Un bloque que termina antes de `t = 1` deja el objeto quieto en esa pose hasta el final del reloj. Los canales que un instante no menciona, mientras ese instante asigna algún otro canal, vuelven a la pose inicial.

La duración en milisegundos no la pone el script. La elige la acción base del anuncio (`drop` 3600, `turn` 4400, `torch` y `torch-front` 4000, `drive` y `drive-plain` 3000, `ball` 4000, `toy` 3800, `star` y `cheer` 5800, `space` 7600). `t = 1` es el final de ese reloj.

La galería sigue usando los clímax nativos en las fichas originales. Al guardar un script en la ruta **Clímax**, ese perfil gana una ficha con el nombre del script. Reproducirla usa el texto guardado. La duración la sigue marcando la acción base con la que se escribió.

## Pose de partida

Si una línea no asigna un canal, queda este valor:

| Canal | Valor inicial | Qué mueve |
| --- | --- | --- |
| `x` `y` `z` | `0`, `half`, `0` | Posición. `y = half` deja el objeto apoyado en el suelo. |
| `rx` `ry` `rz` | `0`, `0.28`, `0` | Rotación en radianes. |
| `sx` `sy` `sz` | `1` | Escala. |
| `camA` | `0` | Giro extra de la cámara alrededor del objeto. |
| `camR` | `1` | Radio de la cámara. `1` es la distancia de la ficha. |
| `punch` | `0` | Acerca la cámara y la inclina un poco. |
| `star` | `0` | Tamaño del trofeo, solo en la acción estrella. |
| `starSpin` | `0` | Giro de ese trofeo. |

## Frases

Una frase por línea. Las líneas en blanco se ignoran. Un `#` comenta hasta el final de la línea.

Asignar un canal de la pose:

```
y = half
ry = 0.28
```

Cualquier otro nombre es una variable local de esa llamada. Sirve para no repetir un cálculo. No se conserva de un fotograma al siguiente.

```
k = span(t, 0.16, 0.4)
y = lerp(1.68, half, k)
```

`when` ejecuta el bloque solo si la condición es verdadera y se cierra con `end`. La condición va sola en su línea.

```
when t < 0.16
  y = 1.68
  rx = 0.1
end
```

`done` termina el script en ese instante. Lo que queda debajo no se evalúa. Dentro de un `when` sirve para que las fases no se pisen.

```
when t < 0.16
  y = 1.68
  done
end
y = half
```

`if` admite `else`. Los dos se cierran con un solo `end`.

```
if t >= 0.38 && t < 0.86
  rx = -0.08 * sin(span(t, 0.38, 0.86) * pi)
else
  rx = 0
end
```

`when` e `if` pueden anidarse. `done` sale del script entero, también si está dentro de un bloque.

## Expresiones

Números, nombres, paréntesis y el menos unario.

Aritmética: `+` `-` `*` `/`.

Comparaciones: `<` `>` `<=` `>=` `==` `!=`.

Lógica: `&&` y `||`. Si la izquierda ya decide, la derecha no se evalúa.

Condicional: `cond ? si : no`.

Leer un campo de un resultado: `flight.squash`. No se puede asignar a un campo (`flight.y = 1` no es una frase válida).

Nombres siempre disponibles: `t`, `half`, `pi`.

## Funciones

`span(t, a, b)` convierte el tramo de `a` a `b` en un avance de `0` a `1`. Fuera del tramo queda en `0` o en `1`.

`lerp(a, b, k)` mezcla de `a` hacia `b`. `k` no se recorta: `0` es `a`, `1` es `b`.

`easeOut(k)` frena al final. `easeIn(k)` y `easeIn(k, potencia)` arrancan despacio (`potencia` por defecto `3`). `easeInOut(k)` frena en los dos extremos. Las tres recortan `k` a `0…1`.

`sin` `cos` `atan2` `min` `max` `sqrt` `abs` son las de matemáticas. Los ángulos van en radianes.

`ballFlight(tiempo, altura, gravedad, rebote)` simula una caída y hasta seis rebotes. Devuelve un objeto con `y` (altura sobre el suelo), `squash` (aplastamiento en el contacto) y `spin` (giro acumulado). La copia de la pelota la usa así:

```
r = half * 0.92
flight = ballFlight((t - 0.1) * 3.55, 1.72 - r, 16.5, 0.58)
y = r * (1 - flight.squash) + flight.y
rx = flight.spin
```

## Copias

En **Clímax**, la lista Traídos abre el texto de siete clímax ya escritos: Caída, Giro, Antorcha, Antorcha de frente, Recorrido, Recorrido con cámara y Pelota. Esas copias siguen el mismo movimiento que el clímax nativo del mismo nombre. Guardar crea una copia en el perfil; no reescribe la traída.

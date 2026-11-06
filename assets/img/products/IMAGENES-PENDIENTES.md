# Imágenes pendientes — productos nuevos (inventario noviembre 2025)

Los productos y colores nuevos ya están publicados en el catálogo, pero
todavía **no tienen foto propia**: apuntan provisionalmente a la imagen
genérica `shared/principal-filamento.jpg` (o `shared/principal-resina.jpg`).

Se usó un placeholder y no se dejó el campo vacío a propósito: en
`assets/producto.js` la galería de la ficha se arma con

```js
const variantsHavePhotos = hasVariants && product.variants.every(v => v.image);
```

así que **una sola variante sin `image` hace desaparecer la galería
completa** de ese producto.

## Cómo reemplazarlas

1. Guardar cada foto con el nombre exacto de la tabla, en formato `.jpg`,
   cuadrada (1:1) y de alrededor de 1024×1024 px.
2. En `assets/products.js`, cambiar la ruta del placeholder por la ruta
   definitiva. Cada línea ya tiene el destino anotado en un comentario
   `// -> assets/img/products/...`.
3. Borrar el comentario, y borrar este archivo cuando no quede ninguna
   pendiente.

> Peso de archivo: varias de las fotos actuales pesan más de 5 MB
> (`petg/blanco.jpg` son 5.2 MB), lo que hace lenta la tienda en celular.
> Conviene guardar las nuevas por debajo de ~300 KB.

## Lista

### PLA 1kg — colores nuevos (`sunlu-pla-1kg`)
| Archivo | Color |
|---|---|
| `pla/gris.jpg` | Gris |
| `pla/blanco-matte.jpg` | Blanco Matte |
| `pla/verde.jpg` | Verde |
| `pla/cafe.jpg` | Café |
| `pla/purpura-lavanda.jpg` | Purpura Lavanda |

### PLA 250g — producto nuevo (`sunlu-pla-250g`)
| Archivo | Color |
|---|---|
| `pla-250g/negro.jpg` | Negro |
| `pla-250g/blanco.jpg` | Blanco |
| `pla-250g/gris.jpg` | Gris |
| `pla-250g/transparente.jpg` | Transparente |
| `pla-250g/azul-klein.jpg` | Azul Klein |
| `pla-250g/rojo.jpg` | Rojo |
| `pla-250g/naranja-soleado.jpg` | Naranja Soleado |
| `pla-250g/verde.jpg` | Verde |

### PETG — color nuevo (`sunlu-petg-1kg`)
| Archivo | Color |
|---|---|
| `petg/negro.jpg` | Negro |

### ABS — categoría nueva (`sunlu-abs-1kg`)
| Archivo | Color |
|---|---|
| `abs/blanco.jpg` | Blanco |

### TPU — categoría nueva (`sunlu-tpu-1kg`)
| Archivo | Color |
|---|---|
| `tpu/negro.jpg` | Negro |

### Silk PLA (`sunlu-silk-pla-1kg`)
| Archivo | Color |
|---|---|
| `silk/dorado.jpg` | Dorado |
| `silk/verde.jpg` | Verde |
| `silk/rojo.jpg` | Rojo |

### PLA Especiales — categoría nueva (productos sin variantes)
| Archivo | Producto |
|---|---|
| `pla-especiales/wood.jpg` | SUNLU Filamento Wood PLA 1kg |
| `pla-especiales/transparente.jpg` | SUNLU Filamento PLA Transparente 1kg |
| `pla-especiales/glow.jpg` | SUNLU Filamento PLA Brilla en la Oscuridad 1kg |
| `pla-especiales/galaxia.jpg` | SUNLU Filamento PLA Galaxia 1kg |

### Resina (`sunlu-resina-transparente-1kg`)
| Archivo | Producto |
|---|---|
| `resina/transparente.jpg` | Resina Transparente SUNLU 1000g |

## Sobre derechos de autor

Editar o retocar una foto bajada de internet **no evita el problema**: la
imagen modificada sigue siendo una obra derivada de la original. Las
opciones seguras son dos:

- **Fotos propias** del producto que ya está en bodega.
- **Fotos oficiales de SUNLU**, que es la práctica habitual y aceptada
  para un revendedor de producto genuino (es lo que usan las imágenes
  que ya están en el sitio).

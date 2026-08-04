/* =========================================================
   PRODUCTS DATA — catálogo completo de LUNATECH3D
   Cada producto puede tener variantes (color o tamaño).
   Para agregar un producto nuevo, copiá un bloque y ajustá
   los campos. Si no tiene variantes, simplemente omití
   "variantLabel", "variantType" y "variants".
   ========================================================= */
const PRODUCTS = {

  /* ---------- FILAMENTOS ---------- */
  'sunlu-pla-1kg': {
    id: 'sunlu-pla-1kg',
    name: 'SUNLU Filamento PLA 1kg 1.75mm',
    categoryLabel: 'Filamento',
    category: 'filamentos',
    price: 9000,
    spec: '1.75mm · 1kg',
    description: 'El PLA de SUNLU está pensado para el uso diario: fácil de imprimir, con alta compatibilidad y resultados consistentes desde el primer rollo. Es de origen vegetal y biodegradable, con un encogimiento muy bajo (0.3–0.5%), así que no se agrieta ni se deforma durante la impresión. Al ser tan estable, es una excelente opción si estás iniciando en la impresión 3D y querés buenos resultados sin ajustes complicados.',
    specs: [
      ['Diámetro', '1.75 ± 0.02mm'],
      ['Temp. de impresión', '200–210°C a 50–100mm/s, o 210–240°C a 100–200mm/s'],
      ['Cama caliente', 'No es necesaria con pegamento · 50–60°C si no usás pegamento'],
      ['Peso neto', '1kg por rollo'],
      ['Peso bruto', '1.3kg por rollo'],
      ['Longitud aproximada', '330m por kg']
    ],
    variantLabel: 'Color',
    variantType: 'color',
    mainImage: 'assets/img/products/shared/principal-filamento.jpg',
    variants: [
      { name: 'Blanco',          hex: '#F5F5F5', available: true, image: 'assets/img/products/pla/blanco.jpg' },
      { name: 'Negro',           hex: '#1A1A1A', available: true, image: 'assets/img/products/pla/negro.jpg' },
      { name: 'Azul',            hex: '#2E6FDB', available: true, image: 'assets/img/products/pla/azul.jpg' },
      { name: 'Amarillo',        hex: '#FFC300', available: true, image: 'assets/img/products/pla/amarillo.jpg' },
      { name: 'Naranja Intenso', hex: '#E85D04', available: true, image: 'assets/img/products/pla/naranja-intenso.jpg' },
      { name: 'Azul Cielo',      hex: '#6EC1E4', available: true, image: 'assets/img/products/pla/azul-cielo.jpg' },
      { name: 'Verde Oliva',     hex: '#6B8E23', available: true, image: 'assets/img/products/pla/verde-oliva.jpg' },
      { name: 'Rojo Cereza',     hex: '#9E1B32', available: true, image: 'assets/img/products/pla/rojo-cereza.jpg' }
    ]
  },

  'sunlu-petg-1kg': {
    id: 'sunlu-petg-1kg',
    name: 'SUNLU Filamento PETG 1kg 1.75mm',
    categoryLabel: 'Filamento',
    category: 'filamentos',
    price: 9800,
    spec: '1.75mm · 1kg',
    description: 'El PETG de SUNLU se destaca por su excelente adhesión entre capas, lo que reduce el riesgo de deformación y da como resultado piezas sólidas y estructuralmente resistentes. Es un material de alta tenacidad, resistente a impactos y a ácidos y álcalis, con colores intensos y buena transparencia para piezas que además de funcionales, se ven bien.',
    specs: [
      ['Diámetro', '1.75 ± 0.02mm'],
      ['Temp. de impresión', '240–260°C · hasta 300mm/s'],
      ['Cama caliente', 'No es necesaria con pegamento · 60–70°C si no usás pegamento'],
      ['Peso neto', '1kg por rollo'],
      ['Peso bruto', '1.3kg por rollo'],
      ['Longitud aproximada', '320m por kg']
    ],
    variantLabel: 'Color',
    variantType: 'color',
    mainImage: 'assets/img/products/shared/principal-filamento.jpg',
    variants: [
      { name: 'Blanco',         hex: '#F5F5F5', available: true, image: 'assets/img/products/petg/blanco.jpg' },
      { name: 'Marrón Castaño', hex: '#6B4226', available: true, image: 'assets/img/products/petg/marron-castano.jpg' }
    ]
  },

  /* ---------- RESINAS ---------- */
  'sunlu-resina-estandar-1kg': {
    id: 'sunlu-resina-estandar-1kg',
    name: 'Resina Estándar Lavable en Agua SUNLU 1000g',
    categoryLabel: 'Resina',
    category: 'resinas',
    price: 13500,
    spec: '405nm · lavable en agua',
    description: 'La resina estándar de SUNLU se lava con agua corriente en vez de alcohol isopropílico (IPA), así que te ahorrás esa compra y el proceso de limpieza es más simple. Cura rápido y fluye muy bien durante la impresión, con alta precisión y bajo encogimiento para piezas con buen nivel de detalle.',
    specs: [
      ['Longitud de onda', '405nm'],
      ['Contenido', '1000g'],
      ['Limpieza', 'Con agua, sin necesidad de IPA'],
      ['Curado', 'Rápido, con buena fluidez'],
      ['Almacenamiento', '15°C – 35°C · lugar seco, ventilado y sin luz directa'],
      ['Precaución', 'Mantener fuera del alcance de los niños'],
      ['Uso recomendado', 'Impresoras de resina (LCD/DLP)']
    ],
    variantLabel: 'Color',
    variantType: 'color',
    mainImage: 'assets/img/products/shared/principal-resina.jpg',
    variants: [
      { name: 'Negro',  hex: '#1A1A1A', available: true, image: 'assets/img/products/resina/negro.jpg' },
      { name: 'Blanco', hex: '#F5F5F5', available: true, image: 'assets/img/products/resina/blanco.jpg' }
    ]
  },

  /* ---------- REPUESTOS Y ACCESORIOS ---------- */
  'alicate-corte-precision': {
    id: 'alicate-corte-precision',
    name: 'Alicate de Corte Diagonal de Precisión',
    categoryLabel: 'Herramienta',
    category: 'repuestos',
    price: 5500,
    spec: 'Corte diagonal · uso general',
    description: 'Corte limpio y preciso de soportes, rebabas y filamento sobrante sin dañar la pieza. Mango ergonómico antideslizante, ideal para tener siempre junto a la impresora.',
    images: [
      'assets/img/products/alicate/principal.jpg',
      'assets/img/products/alicate/dimensiones.jpg',
      'assets/img/products/alicate/detalle.jpg'
    ],
    specs: [
      ['Longitud', '12.5cm'],
      ['Material', 'Acero al carbono'],
      ['Uso', 'Corte de soportes y filamento']
    ]
  },

  'bolsas-vacio-filamento': {
    id: 'bolsas-vacio-filamento',
    name: 'Bolsas al Vacío para Almacenamiento de Filamento (Pack)',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 6500,
    spec: '26 piezas · 11 bolsas + bomba + clips + desecante',
    description: 'Kit completo para guardar tus rollos de filamento al vacío y protegerlos de la humedad ambiental. Incluye bolsas grandes y medianas, una bomba manual para extraer el aire, clips selladores y paquetes de gel de sílice para mantener todo bien seco.',
    images: [
      'assets/img/products/bolsas/principal.jpg',
      'assets/img/products/bolsas/detalle.jpg'
    ],
    specs: [
      ['Contenido', '11 bolsas + 1 bomba manual + 4 clips + 12 paquetes de desecante'],
      ['Tamaño de bolsa', 'Hasta 34 × 30cm'],
      ['Cierre', 'Zip hermético reutilizable'],
      ['Etiqueta', 'Con espacio para fecha y nota']
    ]
  },

  'funda-protectora-impresora': {
    id: 'funda-protectora-impresora',
    name: 'Funda Protectora para Impresoras 3D',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 15000,
    spec: '42×46×43cm · tela oxford',
    description: 'Cubre tu impresora cuando no está en uso, evitando que el polvo se acumule en rieles, boquilla y placa. Tela resistente y fácil de quitar para imprimir en cualquier momento.',
    images: [
      'assets/img/products/funda/principal.jpg',
      'assets/img/products/funda/dimensiones.jpg'
    ],
    specs: [
      ['Material', 'Tela oxford'],
      ['Alto', '42cm'],
      ['Ancho', '46cm'],
      ['Fondo', '43cm'],
      ['Ajuste', 'Cordón elástico en la base']
    ]
  },

  'creality-clog-poke': {
    id: 'creality-clog-poke',
    name: 'Creality Clog Poke – Herramienta para Destapar Boquillas',
    categoryLabel: 'Herramienta',
    category: 'repuestos',
    price: 4000,
    spec: '29cm · acero inoxidable',
    description: 'Herramienta delgada de acero para destapar boquillas obstruidas sin necesidad de desarmar el hotend. Rápida, reutilizable y con mango ergonómico para mayor control.',
    images: [
      'assets/img/products/clog-poke/principal.jpg',
      'assets/img/products/clog-poke/detalle.jpg'
    ],
    specs: [
      ['Longitud', '29cm'],
      ['Material', 'Acero inoxidable'],
      ['Mango', 'Ergonómico antideslizante'],
      ['Marca', 'Creality']
    ]
  },

  'etiquetas-nfc': {
    id: 'etiquetas-nfc',
    name: 'Etiquetas NFC Programables',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 8000,
    spec: '1.1 × 2.1cm · NTAG213',
    description: 'Etiquetas NFC en blanco que podés programar con información del filamento, notas de impresión o enlaces — perfectas para identificar rollos, piezas o kits.',
    images: [
      'assets/img/products/nfc/principal.jpg',
      'assets/img/products/nfc/dimensiones.jpg'
    ],
    specs: [
      ['Cantidad', 'Pack de 5'],
      ['Chip', 'NTAG213'],
      ['Tamaño', '1.1 × 2.1cm'],
      ['Compatibilidad', 'Android e iPhone con NFC']
    ]
  },

  'imanes-neodimio': {
    id: 'imanes-neodimio',
    name: 'Imanes de Neodimio (Pack de 20)',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 7000,
    spec: 'Neodimio N35 · pack de 20',
    description: 'Imanes de neodimio de alta potencia para insertar en piezas impresas: cierres magnéticos, soportes desmontables o conexiones rápidas. Elegí el tamaño según tu proyecto.',
    images: [
      'assets/img/products/imanes/principal.jpg',
      'assets/img/products/imanes/tamanos.jpg'
    ],
    specs: [
      ['Material', 'Neodimio N35'],
      ['Cantidad', '20 unidades por pack'],
      ['Forma', 'Cilíndricos']
    ],
    variantLabel: 'Tamaño',
    variantType: 'size',
    variants: [
      { name: '3×1mm',  available: true },
      { name: '3×2mm',  available: true },
      { name: '4×2mm',  available: true },
      { name: '5×1mm',  available: true },
      { name: '5×2mm',  available: true },
      { name: '8×1mm',  available: true },
      { name: '10×1mm', available: true },
      { name: '12×1mm', available: true },
      { name: '15×1mm', available: true }
    ]
  },

  'switches-blue': {
    id: 'switches-blue',
    name: 'Switches Mecánicos Azules para Teclado (Blue Switches)',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 9000,
    spec: '1.8 × 1.5cm · tipo clicky',
    description: 'Switches mecánicos tipo clicky, populares para quienes arman sus propios teclados con carcasas impresas en 3D. Tacto firme y sonido característico en cada pulsación.',
    images: [
      'assets/img/products/switches/principal.jpg',
      'assets/img/products/switches/detalle.jpg'
    ],
    specs: [
      ['Tipo', 'Clicky'],
      ['Alto', '1.8cm'],
      ['Ancho', '1.5cm'],
      ['Cantidad', 'Pack de 10'],
      ['Uso recomendado', 'Teclados mecánicos personalizados']
    ]
  },

  'lampara-led-usb': {
    id: 'lampara-led-usb',
    name: 'Lámpara LED USB para Proyectos de Impresión 3D',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 6000,
    spec: 'Ø60mm · USB · ultra-delgada',
    description: 'Lámpara circular ultra-delgada de aleación de aluminio con conexión USB, ideal para iluminar la cama de impresión o el área de trabajo al hacer ajustes finos o revisar la primera capa. Incluye interruptor en el cable.',
    images: [
      'assets/img/products/lampara-led/principal.jpg',
      'assets/img/products/lampara-led/detalle.jpg'
    ],
    specs: [
      ['Material', 'Aleación de aluminio + máscara de PC'],
      ['Diámetro', '60mm'],
      ['Espesor', '6mm'],
      ['Conexión', 'USB, con interruptor'],
      ['Potencia', '2V']
    ]
  },

  'insertos-roscados-laton': {
    id: 'insertos-roscados-laton',
    name: 'Insertos Roscados de Latón para Impresión 3D',
    categoryLabel: 'Repuesto',
    category: 'repuestos',
    price: 5000,
    spec: 'M3 · pack de 50',
    description: 'Insertos de latón que se instalan con calor en piezas impresas para crear roscas resistentes y reutilizables — mucho más duraderas que roscar directo en el plástico.',
    images: [
      'assets/img/products/roscas-laton/principal.jpg',
      'assets/img/products/roscas-laton/especificaciones.jpg'
    ],
    specs: [
      ['Material', 'Latón'],
      ['Rosca interna', 'M3 × 0.5mm'],
      ['Diámetro exterior', '5.0mm'],
      ['Diámetro rosca', '2.5mm'],
      ['Altura total', '4.0mm'],
      ['Cantidad', 'Pack de 50'],
      ['Instalación', 'Con soldador o herramienta de calor']
    ]
  },

  'kit-corte-posprocesado': {
    id: 'kit-corte-posprocesado',
    name: 'Kit de Corte para Posprocesado de Impresiones 3D',
    categoryLabel: 'Herramienta',
    category: 'repuestos',
    price: 9500,
    spec: 'Desbarbador 5 cuchillas + alicate',
    description: 'Set para dejar tus piezas con un acabado limpio: una herramienta de desbarbado con 5 cuchillas intercambiables para quitar rebabas y líneas de las capas, más un alicate de corte para retirar soportes. Todo lo necesario para pasar de "recién impreso" a "terminado".',
    images: [
      'assets/img/products/kit-corte/principal.jpg',
      'assets/img/products/kit-corte/dimensiones.jpg'
    ],
    specs: [
      ['Contenido', 'Desbarbador + 5 cuchillas + alicate de corte'],
      ['Desbarbador', '14.7cm'],
      ['Alicate', '13cm'],
      ['Uso', 'Posprocesado y acabado']
    ]
  },

  'kit-limpieza-boquillas': {
    id: 'kit-limpieza-boquillas',
    name: 'Kit de Limpieza de Boquillas para Impresora 3D',
    categoryLabel: 'Herramienta',
    category: 'repuestos',
    price: 4500,
    spec: '2 tubos · agujas finas',
    description: 'Agujas finas de limpieza para mantener las boquillas libres de residuos y asegurar un flujo de filamento constante. Vienen organizadas en tubos plásticos fáciles de guardar junto a la impresora.',
    images: [
      'assets/img/products/kit-limpieza/principal.jpg'
    ],
    specs: [
      ['Contenido', '2 tubos con agujas de limpieza'],
      ['Tubo', '10.8 × 1.2cm'],
      ['Aguja', '8cm de largo'],
      ['Material', 'Acero endurecido']
    ]
  },

  'grasa-termica-creality': {
    id: 'grasa-termica-creality',
    name: 'Creality Grasa Térmica para Impresora 3D',
    categoryLabel: 'Insumo',
    category: 'repuestos',
    price: 5500,
    spec: '10g · 1.2W/m·K',
    description: 'Grasa térmica de Creality para mejorar la transferencia de calor entre el bloque calefactor y el disipador, ayudando a mantener temperaturas estables durante la impresión.',
    images: [
      'assets/img/products/grasa-termica/principal.jpg',
      'assets/img/products/grasa-termica/detalle.jpg'
    ],
    specs: [
      ['Contenido', '10g'],
      ['Conductividad térmica', '1.2W/m·K'],
      ['Tamaño de empaque', '98 × 30 × 19mm'],
      ['Marca', 'Creality']
    ]
  },

  'calcetin-silicona-a1': {
    id: 'calcetin-silicona-a1',
    name: 'Funda de Silicona para Hotend – Bambu Lab A1 / A1 mini',
    categoryLabel: 'Repuesto',
    category: 'repuestos',
    price: 4500,
    spec: 'Silicona · Bambu Lab A1 / A1 mini',
    description: 'Funda térmica de silicona que cubre el hotend y ayuda a mantener el calor, además de proteger el bloque calefactor del polvo y del filamento derretido que pudiera gotear. Diseño específico para Bambu Lab A1 y A1 mini.',
    images: [
      'assets/img/products/calcetin-silicona/principal.jpg',
      'assets/img/products/calcetin-silicona/dimensiones.jpg'
    ],
    specs: [
      ['Compatibilidad', 'Bambu Lab A1 y A1 mini'],
      ['Material', 'Silicona resistente al calor'],
      ['Alto', '25mm'],
      ['Ancho', '18–23mm'],
      ['Base', '15mm']
    ]
  }

};


/* =========================================================
   PRODUCTS DATA — catálogo completo de LunarLab
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
    spec: '0.4mm · acero inoxidable',
    description: 'Herramienta delgada de acero para destapar boquillas obstruidas sin necesidad de desarmar el hotend. Rápida, reutilizable y del tamaño justo para no dañar el orificio.',
    specs: [
      ['Diámetro', '0.4mm'],
      ['Material', 'Acero inoxidable'],
      ['Marca', 'Creality']
    ]
  },

  'etiquetas-nfc': {
    id: 'etiquetas-nfc',
    name: 'Etiquetas NFC Programables',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 8000,
    spec: 'Pack de 5 · NTAG213',
    description: 'Etiquetas NFC en blanco que podés programar con información del filamento, notas de impresión o enlaces — perfectas para identificar rollos, piezas o kits.',
    specs: [
      ['Cantidad', 'Pack de 5'],
      ['Chip', 'NTAG213'],
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
    specs: [
      ['Material', 'Neodimio N35'],
      ['Cantidad', '20 unidades por pack'],
      ['Forma', 'Cilíndricos']
    ],
    variantLabel: 'Tamaño',
    variantType: 'size',
    variants: [
      { name: '3×2mm', available: true },
      { name: '4×2mm', available: true },
      { name: '5×2mm', available: true }
    ]
  },

  'switches-blue': {
    id: 'switches-blue',
    name: 'Switches Mecánicos Azules para Teclado (Blue Switches)',
    categoryLabel: 'Accesorio',
    category: 'repuestos',
    price: 9000,
    spec: 'Tipo clicky · pack de 10',
    description: 'Switches mecánicos tipo clicky, populares para quienes arman sus propios teclados con carcasas impresas en 3D. Tacto firme y sonido característico en cada pulsación.',
    specs: [
      ['Tipo', 'Clicky'],
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
    spec: 'USB · brazo flexible',
    description: 'Lámpara flexible con conexión USB, ideal para iluminar la cama de impresión o el área de trabajo al hacer ajustes finos o revisar la primera capa.',
    specs: [
      ['Conexión', 'USB'],
      ['Brillo', 'Ajustable'],
      ['Brazo', 'Flexible, se adapta a la impresora']
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
    specs: [
      ['Material', 'Latón'],
      ['Rosca', 'M3'],
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
    spec: '5 herramientas · estuche incluido',
    description: 'Set de herramientas para retirar soportes, lijar y afinar el acabado de tus piezas después de imprimir. Todo lo necesario para pasar de "recién impreso" a "terminado".',
    specs: [
      ['Piezas incluidas', '5 herramientas'],
      ['Estuche', 'Incluido'],
      ['Uso', 'Posprocesado y acabado']
    ]
  },

  'kit-limpieza-boquillas': {
    id: 'kit-limpieza-boquillas',
    name: 'Kit de Limpieza de Boquillas para Impresora 3D',
    categoryLabel: 'Herramienta',
    category: 'repuestos',
    price: 4500,
    spec: 'Agujas 0.2mm – 0.6mm',
    description: 'Agujas de distintos calibres y accesorios para mantener las boquillas libres de residuos y asegurar un flujo de filamento constante.',
    specs: [
      ['Calibres incluidos', '0.2mm – 0.6mm'],
      ['Material', 'Acero endurecido'],
      ['Compatibilidad', 'Boquillas estándar MK8']
    ]
  },

  'grasa-termica-creality': {
    id: 'grasa-termica-creality',
    name: 'Creality Grasa Térmica para Impresora 3D',
    categoryLabel: 'Insumo',
    category: 'repuestos',
    price: 5500,
    spec: '5g · no conductiva',
    description: 'Grasa térmica para mejorar la transferencia de calor en el hotend o el disipador, ayudando a mantener temperaturas estables durante la impresión.',
    specs: [
      ['Contenido', '5g'],
      ['Tipo', 'Térmica, no conductiva'],
      ['Marca', 'Creality']
    ]
  }

};

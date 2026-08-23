/* =========================================================
   CATEGORY TAXONOMY — grupos y categorías de LUNATECH3D
   "comingSoon: true" = categoría real de catálogo, pero sin
   SKUs propios todavía. Se muestra en tienda con estado
   "Próximamente" en vez de inventar productos.
   ========================================================= */
const CATEGORY_GROUPS = [
  { id: 'filamentos', label: 'Filamentos' },
  { id: 'resina', label: 'Resina' },
  { id: 'accesorios', label: 'Accesorios' }
];

const CATEGORIES = [
  { id: 'pla',               label: 'PLA',               group: 'filamentos' },
  { id: 'petg',              label: 'PETG',              group: 'filamentos' },
  { id: 'asa',               label: 'ASA',               group: 'filamentos', comingSoon: true },
  { id: 'abs',               label: 'ABS',               group: 'filamentos', comingSoon: true },
  { id: 'tpu',               label: 'TPU',               group: 'filamentos', comingSoon: true },
  { id: 'silk-pla',          label: 'Silk PLA',          group: 'filamentos', comingSoon: true },
  { id: 'resina',            label: 'Resina',            group: 'resina' },
  { id: 'herramientas',      label: 'Herramientas',      group: 'accesorios' },
  { id: 'boquillas',         label: 'Boquillas',         group: 'accesorios', comingSoon: true },
  { id: 'placas-pei',        label: 'Placas PEI',        group: 'accesorios', comingSoon: true },
  { id: 'imanes',            label: 'Imanes',            group: 'accesorios' },
  { id: 'insertos-termicos', label: 'Insertos térmicos', group: 'accesorios' },
  { id: 'rodamientos',       label: 'Rodamientos',       group: 'accesorios', comingSoon: true },
  { id: 'repuestos',         label: 'Repuestos',         group: 'accesorios' },
  { id: 'electronica',       label: 'Electrónica',       group: 'accesorios' },
  { id: 'tarjetas-regalo',   label: 'Tarjetas de regalo', group: 'accesorios', comingSoon: true }
];

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
    category: 'pla',
    brand: 'SUNLU',
    sku: 'LT-FIL-PLA-01',
    material: 'PLA',
    diameterMM: 1.75,
    weightG: 1000,
    availability: true,
    featured: true,
    price: 10500,
    spec: '1.75mm · 1kg',
    description: 'El PLA de SUNLU está pensado para el uso diario: fácil de imprimir, con alta compatibilidad y resultados consistentes desde el primer rollo. Es de origen vegetal y biodegradable, con un encogimiento bajo (0.3–0.5% según ficha del fabricante), lo que reduce el riesgo de que se agriete o deforme durante la impresión frente a otros plásticos. Al ser un material estable, es una buena opción si estás iniciando en la impresión 3D y querés buenos resultados sin ajustes complicados.',
    specs: [
      ['Marca', 'SUNLU'],
      ['SKU', 'LT-FIL-PLA-01'],
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
      { name: 'Blanco',          hex: '#F5F5F5', available: true, price: 10500, image: 'assets/img/products/pla/blanco.jpg' },
      { name: 'Negro',           hex: '#1A1A1A', available: true, price: 10500, image: 'assets/img/products/pla/negro.jpg' },
      { name: 'Azul',            hex: '#2E6FDB', available: true, price: 11500, image: 'assets/img/products/pla/azul.jpg' },
      { name: 'Amarillo',        hex: '#FFC300', available: true, price: 11500, image: 'assets/img/products/pla/amarillo.jpg' },
      { name: 'Naranja Intenso', hex: '#E85D04', available: true, price: 11500, image: 'assets/img/products/pla/naranja-intenso.jpg' },
      { name: 'Azul Cielo',      hex: '#6EC1E4', available: true, price: 11500, image: 'assets/img/products/pla/azul-cielo.jpg' },
      { name: 'Verde Oliva',     hex: '#6B8E23', available: true, price: 12000, image: 'assets/img/products/pla/verde-oliva.jpg' },
      { name: 'Rojo Cereza',     hex: '#9E1B32', available: true, price: 12000, image: 'assets/img/products/pla/rojo-cereza.jpg' }
    ]
  },

  'sunlu-petg-1kg': {
    id: 'sunlu-petg-1kg',
    name: 'SUNLU Filamento PETG 1kg 1.75mm',
    categoryLabel: 'Filamento',
    category: 'petg',
    brand: 'SUNLU',
    sku: 'LT-FIL-PETG-01',
    material: 'PETG',
    diameterMM: 1.75,
    weightG: 1000,
    availability: true,
    featured: true,
    price: 10500,
    spec: '1.75mm · 1kg',
    description: 'El PETG de SUNLU se destaca por su excelente adhesión entre capas, lo que reduce el riesgo de deformación y da como resultado piezas sólidas y estructuralmente resistentes. Es un material de alta tenacidad, resistente a impactos y a ácidos y álcalis, con colores intensos y buena transparencia para piezas que además de funcionales, se ven bien.',
    specs: [
      ['Marca', 'SUNLU'],
      ['SKU', 'LT-FIL-PETG-01'],
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
      { name: 'Blanco',         hex: '#F5F5F5', available: true, price: 10500, image: 'assets/img/products/petg/blanco.jpg' },
      { name: 'Marrón Castaño', hex: '#6B4226', available: true, price: 11500, image: 'assets/img/products/petg/marron-castano.jpg' }
    ]
  },

  /* ---------- RESINA ---------- */
  'sunlu-resina-estandar-1kg': {
    id: 'sunlu-resina-estandar-1kg',
    name: 'Resina Estándar Lavable en Agua SUNLU 1000g',
    categoryLabel: 'Resina',
    category: 'resina',
    brand: 'SUNLU',
    sku: 'LT-RES-STD-01',
    material: 'Resina estándar',
    weightG: 1000,
    availability: true,
    featured: true,
    price: 16000,
    spec: '405nm · lavable en agua',
    description: 'La resina estándar de SUNLU se lava con agua corriente en vez de alcohol isopropílico (IPA), así que te ahorrás esa compra y el proceso de limpieza es más simple. Cura rápido y fluye muy bien durante la impresión, con alta precisión y bajo encogimiento para piezas con buen nivel de detalle.',
    specs: [
      ['Marca', 'SUNLU'],
      ['SKU', 'LT-RES-STD-01'],
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

  /* ---------- ACCESORIOS ---------- */
  'alicate-corte-precision': {
    id: 'alicate-corte-precision',
    name: 'Alicate de Corte Diagonal de Precisión',
    categoryLabel: 'Herramienta',
    category: 'herramientas',
    brand: 'Genérico',
    sku: 'LT-HER-001',
    availability: true,
    featured: true,
    price: 2000,
    spec: 'Corte diagonal · uso general',
    description: 'Corte limpio y preciso de soportes, rebabas y filamento sobrante sin dañar la pieza. Mango ergonómico antideslizante, ideal para tener siempre junto a la impresora.',
    images: [
      'assets/img/products/alicate/principal.jpg',
      'assets/img/products/alicate/dimensiones.jpg',
      'assets/img/products/alicate/detalle.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-HER-001'],
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
    brand: 'Genérico',
    sku: 'LT-REP-001',
    availability: true,
    price: 11000,
    spec: '26 piezas · 11 bolsas + bomba + clips + desecante',
    description: 'Kit completo para guardar tus rollos de filamento al vacío y protegerlos de la humedad ambiental. Incluye bolsas grandes y medianas, una bomba manual para extraer el aire, clips selladores y paquetes de gel de sílice para mantener todo bien seco.',
    images: [
      'assets/img/products/bolsas/principal.jpg',
      'assets/img/products/bolsas/detalle.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-REP-001'],
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
    brand: 'Genérico',
    sku: 'LT-REP-002',
    availability: true,
    price: 6000,
    spec: '42×46×43cm · tela oxford',
    description: 'Cubre tu impresora cuando no está en uso, evitando que el polvo se acumule en rieles, boquilla y placa. Tela resistente y fácil de quitar para imprimir en cualquier momento.',
    images: [
      'assets/img/products/funda/principal.jpg',
      'assets/img/products/funda/dimensiones.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-REP-002'],
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
    category: 'herramientas',
    brand: 'Creality',
    sku: 'LT-HER-002',
    availability: true,
    price: 8000,
    spec: '29cm · acero inoxidable',
    description: 'Herramienta delgada de acero para destapar boquillas obstruidas sin necesidad de desarmar el hotend. Rápida, reutilizable y con mango ergonómico para mayor control.',
    images: [
      'assets/img/products/clog-poke/principal.jpg',
      'assets/img/products/clog-poke/detalle.jpg'
    ],
    specs: [
      ['Marca', 'Creality'],
      ['SKU', 'LT-HER-002'],
      ['Longitud', '29cm'],
      ['Material', 'Acero inoxidable'],
      ['Mango', 'Ergonómico antideslizante']
    ]
  },

  'etiquetas-nfc': {
    id: 'etiquetas-nfc',
    name: 'Etiquetas NFC Programables',
    categoryLabel: 'Accesorio',
    category: 'electronica',
    brand: 'Genérico',
    sku: 'LT-ELE-001',
    availability: true,
    price: 1000,
    spec: '1.1 × 2.1cm · NTAG213',
    description: 'Etiquetas NFC en blanco que podés programar con información del filamento, notas de impresión o enlaces — perfectas para identificar rollos, piezas o kits.',
    images: [
      'assets/img/products/nfc/principal.jpg',
      'assets/img/products/nfc/dimensiones.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-ELE-001'],
      ['Cantidad', 'Pack de 10'],
      ['Chip', 'NTAG213'],
      ['Tamaño', '1.1 × 2.1cm'],
      ['Compatibilidad', 'Android e iPhone con NFC']
    ]
  },

  'imanes-neodimio': {
    id: 'imanes-neodimio',
    name: 'Imanes de Neodimio (Pack de 10)',
    categoryLabel: 'Accesorio',
    category: 'imanes',
    brand: 'Genérico',
    sku: 'LT-IMA-001',
    availability: true,
    featured: true,
    price: 500,
    spec: 'Neodimio N35 · pack de 10',
    description: 'Imanes de neodimio de alta potencia para insertar en piezas impresas: cierres magnéticos, soportes desmontables o conexiones rápidas. Elegí el tamaño según tu proyecto.',
    images: [
      'assets/img/products/imanes/principal.jpg',
      'assets/img/products/imanes/tamanos.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-IMA-001'],
      ['Material', 'Neodimio N35'],
      ['Cantidad', '10 unidades por pack'],
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
    category: 'electronica',
    brand: 'Genérico',
    sku: 'LT-ELE-002',
    availability: true,
    price: 1000,
    spec: '1.8 × 1.5cm · tipo clicky',
    description: 'Switches mecánicos tipo clicky, populares para quienes arman sus propios teclados con carcasas impresas en 3D. Tacto firme y sonido característico en cada pulsación.',
    images: [
      'assets/img/products/switches/principal.jpg',
      'assets/img/products/switches/detalle.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-ELE-002'],
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
    category: 'electronica',
    brand: 'Genérico',
    sku: 'LT-ELE-003',
    availability: true,
    price: 5500,
    spec: 'Ø60mm · USB · ultra-delgada',
    description: 'Lámpara circular ultra-delgada de aleación de aluminio con conexión USB, ideal para iluminar la cama de impresión o el área de trabajo al hacer ajustes finos o revisar la primera capa. Incluye interruptor en el cable.',
    images: [
      'assets/img/products/lampara-led/principal.jpg',
      'assets/img/products/lampara-led/detalle.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-ELE-003'],
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
    category: 'insertos-termicos',
    brand: 'Genérico',
    sku: 'LT-INS-001',
    availability: true,
    price: 1000,
    spec: 'M3 · pack de 20',
    description: 'Insertos de latón que se instalan con calor en piezas impresas para crear roscas resistentes y reutilizables — mucho más duraderas que roscar directo en el plástico.',
    images: [
      'assets/img/products/roscas-laton/principal.jpg',
      'assets/img/products/roscas-laton/especificaciones.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-INS-001'],
      ['Material', 'Latón'],
      ['Rosca interna', 'M3 × 0.5mm'],
      ['Diámetro exterior', '5.0mm'],
      ['Diámetro rosca', '2.5mm'],
      ['Altura total', '4.0mm'],
      ['Cantidad', 'Pack de 20'],
      ['Instalación', 'Con soldador o herramienta de calor']
    ]
  },

  'kit-corte-posprocesado': {
    id: 'kit-corte-posprocesado',
    name: 'Kit de Corte para Posprocesado de Impresiones 3D',
    categoryLabel: 'Herramienta',
    category: 'herramientas',
    brand: 'Genérico',
    sku: 'LT-HER-003',
    availability: true,
    price: 5500,
    spec: 'Desbarbador 5 cuchillas + alicate',
    description: 'Set para dejar tus piezas con un acabado limpio: una herramienta de desbarbado con 5 cuchillas intercambiables para quitar rebabas y líneas de las capas, más un alicate de corte para retirar soportes. Todo lo necesario para pasar de "recién impreso" a "terminado".',
    images: [
      'assets/img/products/kit-corte/principal.jpg',
      'assets/img/products/kit-corte/dimensiones.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-HER-003'],
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
    category: 'herramientas',
    brand: 'Genérico',
    sku: 'LT-HER-004',
    availability: true,
    featured: true,
    price: 1500,
    spec: '2 tubos · agujas finas',
    description: 'Agujas finas de limpieza para mantener las boquillas libres de residuos y asegurar un flujo de filamento constante. Vienen organizadas en tubos plásticos fáciles de guardar junto a la impresora.',
    images: [
      'assets/img/products/kit-limpieza/principal.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-HER-004'],
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
    brand: 'Creality',
    sku: 'LT-REP-003',
    availability: true,
    price: 4000,
    spec: '10g · 1.2W/m·K',
    description: 'Grasa térmica de Creality para mejorar la transferencia de calor entre el bloque calefactor y el disipador, ayudando a mantener temperaturas estables durante la impresión.',
    images: [
      'assets/img/products/grasa-termica/principal.jpg',
      'assets/img/products/grasa-termica/detalle.jpg'
    ],
    specs: [
      ['Marca', 'Creality'],
      ['SKU', 'LT-REP-003'],
      ['Contenido', '10g'],
      ['Conductividad térmica', '1.2W/m·K'],
      ['Tamaño de empaque', '98 × 30 × 19mm']
    ]
  },

  'calcetin-silicona-a1': {
    id: 'calcetin-silicona-a1',
    name: 'Funda de Silicona para Hotend – Bambu Lab A1 / A1 mini',
    categoryLabel: 'Repuesto',
    category: 'repuestos',
    brand: 'Genérico',
    sku: 'LT-REP-004',
    availability: true,
    price: 1000,
    spec: 'Silicona · Bambu Lab A1 / A1 mini',
    description: 'Funda térmica de silicona que cubre el hotend y ayuda a mantener el calor, además de proteger el bloque calefactor del polvo y del filamento derretido que pudiera gotear. Diseño específico para Bambu Lab A1 y A1 mini.',
    images: [
      'assets/img/products/calcetin-silicona/principal.jpg',
      'assets/img/products/calcetin-silicona/dimensiones.jpg'
    ],
    specs: [
      ['Marca', 'Genérico'],
      ['SKU', 'LT-REP-004'],
      ['Compatibilidad', 'Bambu Lab A1 y A1 mini'],
      ['Material', 'Silicona resistente al calor'],
      ['Alto', '25mm'],
      ['Ancho', '18–23mm'],
      ['Base', '15mm']
    ]
  }

};

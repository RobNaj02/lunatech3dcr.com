-- =========================================================
-- SINCRONIZACIÓN DE STOCK — generado desde
-- Control_Financiero_Lunarlab_Lunatech.xlsx, hoja
-- "Productos Lunatech", columna "Stock actual".
--
-- Qué hace: deja product_stock igual al Excel. Inserta las
-- filas de los productos nuevos (sin ellas, checkout_cart()
-- rechaza la compra porque v_available viene null) y corrige
-- las cantidades de los que ya existían.
--
-- Cómo correrlo: Supabase Dashboard -> SQL Editor -> pegar y
-- ejecutar. Es idempotente: se puede volver a correr.
-- =========================================================
insert into public.product_stock (product_id, variant_name, quantity) values
  ('sunlu-pla-1kg', 'Blanco', 2),  -- LT-FIL-PLA-01-01 · SUNLU Filamento PLA 1kg 1.75mm – Blanco
  ('sunlu-pla-1kg', 'Negro', 2),  -- LT-FIL-PLA-01-02 · SUNLU Filamento PLA 1kg 1.75mm – Negro
  ('sunlu-pla-1kg', 'Azul', 0),  -- LT-FIL-PLA-01-03 · SUNLU Filamento PLA 1kg 1.75mm – Azul
  ('sunlu-pla-1kg', 'Amarillo', 3),  -- LT-FIL-PLA-01-04 · SUNLU Filamento PLA 1kg 1.75mm – Amarillo
  ('sunlu-pla-1kg', 'Naranja Intenso', 3),  -- LT-FIL-PLA-01-05 · SUNLU Filamento PLA 1kg 1.75mm – Naranja Intenso
  ('sunlu-pla-1kg', 'Azul Cielo', 6),  -- LT-FIL-PLA-01-06 · SUNLU Filamento PLA 1kg 1.75mm – Azul Cielo
  ('sunlu-pla-1kg', 'Verde Oliva', 3),  -- LT-FIL-PLA-01-07 · SUNLU Filamento PLA 1kg 1.75mm – Verde Oliva
  ('sunlu-pla-1kg', 'Rojo Cereza', 4),  -- LT-FIL-PLA-01-08 · SUNLU Filamento PLA 1kg 1.75mm – Rojo Cereza
  ('sunlu-petg-1kg', 'Blanco', 5),  -- LT-FIL-PETG-01-01 · SUNLU Filamento PETG 1kg 1.75mm – Blanco
  ('sunlu-petg-1kg', 'Marrón Castaño', 3),  -- LT-FIL-PETG-01-02 · SUNLU Filamento PETG 1kg 1.75mm – Marrón Castaño
  ('sunlu-resina-estandar-1kg', 'Negro', 1),  -- LT-RES-STD-01-01 · Resina Estándar Lavable en Agua SUNLU 1000g – Negro
  ('sunlu-resina-estandar-1kg', 'Blanco', 8),  -- LT-RES-STD-01-02 · Resina Estándar Lavable en Agua SUNLU 1000g – Blanco
  ('alicate-corte-precision', '', 10),  -- LT-HER-001 · Alicate de Corte Diagonal de Precisión
  ('bolsas-vacio-filamento', '', 1),  -- LT-REP-001 · Bolsas al Vacío para Almacenamiento de Filamento (Pack)
  ('funda-protectora-impresora', '', 1),  -- LT-REP-002 · Funda Protectora para Impresoras 3D
  ('creality-clog-poke', '', 1),  -- LT-HER-002 · Creality Clog Poke – Herramienta para Destapar Boquillas
  ('etiquetas-nfc', '', 13),  -- LT-ELE-001 · Etiquetas NFC Programables (Pack de 10)
  ('imanes-neodimio', '3×1mm', 3),  -- LT-IMA-001-01 · Imanes de Neodimio (Pack de 10) – 3×1mm
  ('imanes-neodimio', '3×2mm', 10),  -- LT-IMA-001-02 · Imanes de Neodimio (Pack de 10) – 3×2mm
  ('imanes-neodimio', '4×2mm', 0),  -- LT-IMA-001-03 · Imanes de Neodimio (Pack de 10) – 4×2mm
  ('imanes-neodimio', '5×1mm', 5),  -- LT-IMA-001-04 · Imanes de Neodimio (Pack de 10) – 5×1mm
  ('imanes-neodimio', '5×2mm', 7),  -- LT-IMA-001-05 · Imanes de Neodimio (Pack de 10) – 5×2mm
  ('imanes-neodimio', '8×1mm', 4),  -- LT-IMA-001-06 · Imanes de Neodimio (Pack de 10) – 8×1mm
  ('imanes-neodimio', '10×1mm', 4),  -- LT-IMA-001-07 · Imanes de Neodimio (Pack de 10) – 10×1mm
  ('imanes-neodimio', '12×1mm', 5),  -- LT-IMA-001-08 · Imanes de Neodimio (Pack de 10) – 12×1mm
  ('imanes-neodimio', '15×1mm', 5),  -- LT-IMA-001-09 · Imanes de Neodimio (Pack de 10) – 15×1mm
  ('switches-blue', '', 6),  -- LT-ELE-002 · Switches Mecánicos Azules para Teclado (Blue Switches, Pack de 10)
  ('lampara-led-usb', '', 2),  -- LT-ELE-003 · Lámpara LED USB para Proyectos de Impresión 3D
  ('insertos-roscados-laton', '', 8),  -- LT-INS-001 · Insertos Roscados de Latón para Impresión 3D (Pack de 20)
  ('kit-corte-posprocesado', '', 2),  -- LT-HER-003 · Kit de Corte para Posprocesado de Impresiones 3D
  ('kit-limpieza-boquillas', '', 5),  -- LT-HER-004 · Kit de Limpieza de Boquillas para Impresora 3D
  ('grasa-termica-creality', '', 4),  -- LT-REP-003 · Creality Grasa Térmica para Impresora 3D
  ('calcetin-silicona-a1', '', 8),  -- LT-REP-004 · Funda de Silicona para Hotend – Bambu Lab A1 / A1 mini
  ('sunlu-pla-glow-1kg', '', 3),  -- LT-FIL-PLA-01-09 · SUNLU Filamento PLA 1kg 1.75mm – Brilla en la oscuridad (Luminoso)
  ('sunlu-pla-galaxia-1kg', '', 3),  -- LT-FIL-PLA-01-10 · SUNLU Filamento PLA 1kg 1.75mm – Starlit Flow
  ('sunlu-pla-1kg', 'Blanco Matte', 3),  -- LT-FIL-PLA-01-11 · SUNLU Filamento PLA 1kg 1.75mm – Blanco Matte
  ('sunlu-pla-1kg', 'Purpura Lavanda', 3),  -- LT-FIL-PLA-01-12 · SUNLU Filamento PLA 1kg 1.75mm – Purpura Lavanda
  ('sunlu-silk-pla-1kg', 'Dorado', 3),  -- LT-FIL-SILK-01-01 · SUNLU Filamento SILK PLA+ 1kg 1.75mm – Dorado
  ('sunlu-silk-pla-1kg', 'Verde', 3),  -- LT-FIL-SILK-01-02 · SUNLU Filamento SILK PLA+ 1kg 1.75mm – Verde
  ('sunlu-silk-pla-1kg', 'Rojo', 3),  -- LT-FIL-SILK-01-03 · SUNLU Filamento SILK PLA+ 1kg 1.75mm – Rojo
  ('sunlu-tpu-1kg', 'Negro', 3),  -- LT-FIL-TPU-01-01 · SUNLU Filamento TPU 90A 1kg 1.75mm – Negro
  ('sunlu-pla-transparente-1kg', '', 2),  -- LT-FIL-PLA-01-13 · SUNLU Filamento PLA 1kg 1.75mm – Transparente
  ('sunlu-petg-1kg', 'Negro', 3),  -- LT-FIL-PETG-01-03 · SUNLU Filamento PETG 1kg 1.75mm – Negro
  ('sunlu-pla-wood-1kg', '', 3),  -- LT-FIL-WOOD-01-01 · SUNLU Filamento Wood PLA 1kg 1.75mm – Madera
  ('sunlu-pla-1kg', 'Café', 3),  -- LT-FIL-PLA-01-14 · SUNLU Filamento PLA 1kg 1.75mm – Café
  ('sunlu-pla-1kg', 'Gris', 3),  -- LT-FIL-PLA-01-15 · SUNLU Filamento PLA 1kg 1.75mm – Gris
  ('sunlu-resina-transparente-1kg', '', 3),  -- LT-RES-TRA-01-01 · Resina Transparente SUNLU 1000g – Transparente
  ('sunlu-pla-1kg', 'Verde', 3),  -- LT-FIL-PLA-01-16 · SUNLU Filamento PLA 1kg 1.75mm – Verde
  ('sunlu-abs-1kg', 'Blanco', 3),  -- LT-FIL-ABS-01-01 · SUNLU Filamento ABS 1kg 1.75mm – Blanco
  ('sunlu-pla-250g', 'Negro', 1),  -- LT-FIL-PLA-02-01 · SUNLU Filamento PLA 250g 1.75mm – Negro
  ('sunlu-pla-250g', 'Blanco', 1),  -- LT-FIL-PLA-02-02 · SUNLU Filamento PLA 250g 1.75mm – Blanco
  ('sunlu-pla-250g', 'Gris', 1),  -- LT-FIL-PLA-02-03 · SUNLU Filamento PLA 250g 1.75mm – Gris
  ('sunlu-pla-250g', 'Transparente', 1),  -- LT-FIL-PLA-02-04 · SUNLU Filamento PLA 250g 1.75mm – Transparente
  ('sunlu-pla-250g', 'Azul Klein', 1),  -- LT-FIL-PLA-02-05 · SUNLU Filamento PLA 250g 1.75mm – Azul Klein
  ('sunlu-pla-250g', 'Rojo', 1),  -- LT-FIL-PLA-02-06 · SUNLU Filamento PLA 250g 1.75mm – Rojo
  ('sunlu-pla-250g', 'Naranja Soleado', 1),  -- LT-FIL-PLA-02-07 · SUNLU Filamento PLA 250g 1.75mm – Naranja Soleado
  ('sunlu-pla-250g', 'Verde', 1)  -- LT-FIL-PLA-02-08 · SUNLU Filamento PLA 250g 1.75mm – Verde
on conflict (product_id, variant_name)
  do update set quantity = excluded.quantity, updated_at = now();

-- NOTA:
--   LT-IMA-001-03 (Imanes de Neodimio (Pack de 10) – 4×2mm) venía en -2 en el Excel; se carga como 0 porque la tabla no admite negativos.

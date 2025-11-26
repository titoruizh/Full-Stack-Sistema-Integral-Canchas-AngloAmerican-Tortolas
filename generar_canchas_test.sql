-- Script para generar canchas de prueba con variedad de estados, muros, sectores y nombres
-- Ejecutar en Supabase SQL Editor

-- Las coordenadas están en formato [longitud, latitud] (WGS84)
-- Coordenadas transformadas desde los polígonos reales de cada muro en EPSG:32719

-- IMPORTANTE: Primero EJECUTAR fix_estados_finalizada.sql para corregir los estados
-- Estados finales: 1:Creada, 2:En Proceso, 4:Validada, 6:Cerrada, 7:En Espera, 8:Rechazada en Espera

-- Limpiar canchas de prueba anteriores (OPCIONAL - comentar si quieres mantener las existentes)
-- DELETE FROM canchas WHERE nombre LIKE '%PLATAFORMA%' OR nombre LIKE '%CORONAMIENTO%' OR nombre LIKE '%TALUD%' OR nombre LIKE '%QUIEBRE%';

-- Generar canchas para MURO MP (Sectores S1-S7)
-- Polígono real MP_S1: ~337815-338024 E, ~6334671-6335131 N
-- Transformado aprox: -70.7356 a -70.7335 W, -33.1203 a -33.1244 S

-- Estado: Creada (1)
INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  ('MP_S1_PLATAFORMA 1', 'MP', 'S1', 'PLATAFORMA 1', 1, 1, 1, 5001, '2025-06-15 10:30:00', '[[-70.7345, -33.1210], [-70.7340, -33.1210], [-70.7340, -33.1215], [-70.7345, -33.1215], [-70.7345, -33.1210]]'),
  ('MP_S2_PLATAFORMA 2', 'MP', 'S2', 'PLATAFORMA 2', 1, 1, 1, 5002, '2025-06-20 14:15:00', '[[-70.7365, -33.1195], [-70.7360, -33.1195], [-70.7360, -33.1200], [-70.7365, -33.1200], [-70.7365, -33.1195]]'),
  ('MP_S3_CORONAMIENTO', 'MP', 'S3', 'CORONAMIENTO', 1, 1, 1, 5003, '2025-07-01 09:00:00', '[[-70.7385, -33.1175], [-70.7380, -33.1175], [-70.7380, -33.1180], [-70.7385, -33.1180], [-70.7385, -33.1175]]');

-- Estado: En Espera (7) - Asignadas a diferentes empresas
INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  ('MP_S4_PLATAFORMA 3', 'MP', 'S4', 'PLATAFORMA 3', 7, 2, 1, 5004, '2025-07-10 11:20:00', '[[-70.7405, -33.1160], [-70.7400, -33.1160], [-70.7400, -33.1165], [-70.7405, -33.1165], [-70.7405, -33.1160]]'),
  ('MP_S5_PLATAFORMA 4', 'MP', 'S5', 'PLATAFORMA 4', 7, 3, 1, 5005, '2025-07-18 16:45:00', '[[-70.7428, -33.1148], [-70.7423, -33.1148], [-70.7423, -33.1153], [-70.7428, -33.1153], [-70.7428, -33.1148]]'),
  ('MP_S6_TALUD', 'MP', 'S6', 'TALUD', 7, 4, 1, 5006, '2025-08-05 08:30:00', '[[-70.7448, -33.1135], [-70.7443, -33.1135], [-70.7443, -33.1140], [-70.7448, -33.1140], [-70.7448, -33.1135]]');

-- Estado: En Proceso (2) - Trabajando activamente - CAMBIADO DE 3 A 2
INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  ('MP_S7_PLATAFORMA 5', 'MP', 'S7', 'PLATAFORMA 5', 2, 2, 1, 5007, '2025-08-12 13:00:00', '[[-70.7468, -33.1122], [-70.7463, -33.1122], [-70.7463, -33.1127], [-70.7468, -33.1127], [-70.7468, -33.1122]]'),
  ('MP_S1_PLATAFORMA 6', 'MP', 'S1', 'PLATAFORMA 6', 2, 3, 1, 5008, '2025-08-20 10:15:00', '[[-70.7342, -33.1220], [-70.7337, -33.1220], [-70.7337, -33.1225], [-70.7342, -33.1225], [-70.7342, -33.1220]]'),
  ('MP_S2_QUIEBRE MURO', 'MP', 'S2', 'QUIEBRE MURO', 2, 4, 1, 5009, '2025-09-01 15:30:00', '[[-70.7362, -33.1203], [-70.7357, -33.1203], [-70.7357, -33.1208], [-70.7362, -33.1208], [-70.7362, -33.1203]]');

-- Estado: Validada (4) - Esperando siguiente paso
INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  ('MP_S3_PLATAFORMA 7', 'MP', 'S3', 'PLATAFORMA 7', 4, 1, 1, 5010, '2025-09-10 09:45:00', '[[-70.7383, -33.1183], [-70.7378, -33.1183], [-70.7378, -33.1188], [-70.7383, -33.1188], [-70.7383, -33.1183]]'),
  ('MP_S4_PLATAFORMA 8', 'MP', 'S4', 'PLATAFORMA 8', 4, 1, 1, 5011, '2025-09-18 14:00:00', '[[-70.7403, -33.1168], [-70.7398, -33.1168], [-70.7398, -33.1173], [-70.7403, -33.1173], [-70.7403, -33.1168]]');

-- Estado: Rechazada, en Espera (8) - Necesita corrección
INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  ('MP_S5_CORONAMIENTO', 'MP', 'S5', 'CORONAMIENTO', 8, 2, 1, 5012, '2025-10-01 11:30:00', '[[-70.7425, -33.1155], [-70.7420, -33.1155], [-70.7420, -33.1160], [-70.7425, -33.1160], [-70.7425, -33.1155]]'),
  ('MP_S6_PLATAFORMA 9', 'MP', 'S6', 'PLATAFORMA 9', 8, 2, 1, 5013, '2025-10-10 16:20:00', '[[-70.7445, -33.1142], [-70.7440, -33.1142], [-70.7440, -33.1147], [-70.7445, -33.1147], [-70.7445, -33.1142]]');

-- Estado: Cerrada (6) - Completadas
INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  ('MP_S7_PLATAFORMA 10', 'MP', 'S7', 'PLATAFORMA 10', 6, 1, 1, 5014, '2025-10-20 10:00:00', '[[-70.7465, -33.1130], [-70.7460, -33.1130], [-70.7460, -33.1135], [-70.7465, -33.1135], [-70.7465, -33.1130]]'),
  ('MP_S1_TALUD', 'MP', 'S1', 'TALUD', 6, 1, 1, 5015, '2025-11-01 13:15:00', '[[-70.7348, -33.1228], [-70.7343, -33.1228], [-70.7343, -33.1233], [-70.7348, -33.1233], [-70.7348, -33.1228]]');

-- Generar canchas para MURO MO (Sectores S1-S3)
-- Polígono real MO: ~335975-336340 E, ~6332544-6333197 N
-- Transformado aprox: -70.7530 a -70.7485 W, -33.1270 a -33.1329 S

INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  -- Creada
  ('MO_S1_PLATAFORMA 11', 'MO', 'S1', 'PLATAFORMA 11', 1, 1, 1, 5016, '2025-06-25 09:30:00', '[[-70.7510, -33.1285], [-70.7505, -33.1285], [-70.7505, -33.1290], [-70.7510, -33.1290], [-70.7510, -33.1285]]'),
  ('MO_S2_QUIEBRE MURO', 'MO', 'S2', 'QUIEBRE MURO', 1, 1, 1, 5017, '2025-07-05 14:45:00', '[[-70.7505, -33.1300], [-70.7500, -33.1300], [-70.7500, -33.1305], [-70.7505, -33.1305], [-70.7505, -33.1300]]'),
  -- En Espera
  ('MO_S3_CORONAMIENTO', 'MO', 'S3', 'CORONAMIENTO', 7, 2, 1, 5018, '2025-07-20 11:00:00', '[[-70.7500, -33.1315], [-70.7495, -33.1315], [-70.7495, -33.1320], [-70.7500, -33.1320], [-70.7500, -33.1315]]'),
  -- En Proceso (ID 2)
  ('MO_S1_PLATAFORMA 12', 'MO', 'S1', 'PLATAFORMA 12', 2, 3, 1, 5019, '2025-08-08 15:30:00', '[[-70.7512, -33.1293], [-70.7507, -33.1293], [-70.7507, -33.1298], [-70.7512, -33.1298], [-70.7512, -33.1293]]'),
  ('MO_S2_TALUD', 'MO', 'S2', 'TALUD', 2, 4, 1, 5020, '2025-08-25 10:15:00', '[[-70.7503, -33.1308], [-70.7498, -33.1308], [-70.7498, -33.1313], [-70.7503, -33.1313], [-70.7503, -33.1308]]'),
  -- Validada
  ('MO_S3_PLATAFORMA 13', 'MO', 'S3', 'PLATAFORMA 13', 4, 1, 1, 5021, '2025-09-15 13:00:00', '[[-70.7498, -33.1323], [-70.7493, -33.1323], [-70.7493, -33.1328], [-70.7498, -33.1328], [-70.7498, -33.1323]]'),
  -- Rechazada en Espera
  ('MO_S1_CORONAMIENTO', 'MO', 'S1', 'CORONAMIENTO', 8, 2, 1, 5022, '2025-10-05 16:45:00', '[[-70.7515, -33.1278], [-70.7510, -33.1278], [-70.7510, -33.1283], [-70.7515, -33.1283], [-70.7515, -33.1278]]'),
  -- Cerrada
  ('MO_S2_PLATAFORMA 1', 'MO', 'S2', 'PLATAFORMA 1', 6, 1, 1, 5023, '2025-11-10 09:00:00', '[[-70.7507, -33.1295], [-70.7502, -33.1295], [-70.7502, -33.1300], [-70.7507, -33.1300], [-70.7507, -33.1295]]');

-- Generar canchas para MURO ME (Sectores S1-S3)
-- Polígono real ME: ~339773-340223 E, ~6333660-6334245 N
-- Transformado aprox: -70.7170 a -70.7120 W, -33.1230 a -33.1283 S

INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  -- Creada
  ('ME_S1_PLATAFORMA 2', 'ME', 'S1', 'PLATAFORMA 2', 1, 1, 1, 5100, '2025-07-12 10:30:00', '[[-70.7155, -33.1250], [-70.7150, -33.1250], [-70.7150, -33.1255], [-70.7155, -33.1255], [-70.7155, -33.1250]]'),
  ('ME_S2_TALUD', 'ME', 'S2', 'TALUD', 1, 1, 1, 5101, '2025-07-28 15:00:00', '[[-70.7148, -33.1260], [-70.7143, -33.1260], [-70.7143, -33.1265], [-70.7148, -33.1265], [-70.7148, -33.1260]]'),
  -- En Espera
  ('ME_S3_QUIEBRE MURO', 'ME', 'S3', 'QUIEBRE MURO', 7, 2, 1, 5102, '2025-08-15 11:45:00', '[[-70.7140, -33.1245], [-70.7135, -33.1245], [-70.7135, -33.1250], [-70.7140, -33.1250], [-70.7140, -33.1245]]'),
  ('ME_S1_CORONAMIENTO', 'ME', 'S1', 'CORONAMIENTO', 7, 3, 1, 5103, '2025-09-02 14:20:00', '[[-70.7152, -33.1258], [-70.7147, -33.1258], [-70.7147, -33.1263], [-70.7152, -33.1263], [-70.7152, -33.1258]]'),
  -- En Proceso (ID 2)
  ('ME_S2_PLATAFORMA 3', 'ME', 'S2', 'PLATAFORMA 3', 2, 2, 1, 5104, '2025-09-20 09:30:00', '[[-70.7145, -33.1268], [-70.7140, -33.1268], [-70.7140, -33.1273], [-70.7145, -33.1273], [-70.7145, -33.1268]]'),
  ('ME_S3_PLATAFORMA 4', 'ME', 'S3', 'PLATAFORMA 4', 2, 4, 1, 5105, '2025-10-08 13:15:00', '[[-70.7138, -33.1253], [-70.7133, -33.1253], [-70.7133, -33.1258], [-70.7138, -33.1258], [-70.7138, -33.1253]]'),
  -- Validada
  ('ME_S1_PLATAFORMA 5', 'ME', 'S1', 'PLATAFORMA 5', 4, 1, 1, 5106, '2025-10-22 16:00:00', '[[-70.7157, -33.1243], [-70.7152, -33.1243], [-70.7152, -33.1248], [-70.7157, -33.1248], [-70.7157, -33.1243]]'),
  -- Rechazada en Espera
  ('ME_S2_CORONAMIENTO', 'ME', 'S2', 'CORONAMIENTO', 8, 2, 1, 5107, '2025-11-05 10:45:00', '[[-70.7150, -33.1270], [-70.7145, -33.1270], [-70.7145, -33.1275], [-70.7150, -33.1275], [-70.7150, -33.1270]]'),
  -- Cerrada
  ('ME_S3_TALUD', 'ME', 'S3', 'TALUD', 6, 1, 1, 5108, '2025-11-15 14:30:00', '[[-70.7142, -33.1240], [-70.7137, -33.1240], [-70.7137, -33.1245], [-70.7142, -33.1245], [-70.7142, -33.1240]]');

-- Más canchas variadas para tener un buen universo de pruebas
INSERT INTO canchas (nombre, muro, sector, nombre_detalle, estado_actual_id, empresa_actual_id, created_by, numero_informe, created_at, poligono_coordenadas)
VALUES 
  ('MP_S2_PLATAFORMA 11', 'MP', 'S2', 'PLATAFORMA 11', 1, 1, 1, 5200, '2025-06-10 08:00:00', '[[-70.7368, -33.1198], [-70.7363, -33.1198], [-70.7363, -33.1203], [-70.7368, -33.1203], [-70.7368, -33.1198]]'),
  ('MP_S3_PLATAFORMA 12', 'MP', 'S3', 'PLATAFORMA 12', 7, 2, 1, 5201, '2025-08-03 12:30:00', '[[-70.7387, -33.1178], [-70.7382, -33.1178], [-70.7382, -33.1183], [-70.7387, -33.1183], [-70.7387, -33.1178]]'),
  ('MP_S4_TALUD', 'MP', 'S4', 'TALUD', 2, 3, 1, 5202, '2025-09-12 15:45:00', '[[-70.7407, -33.1163], [-70.7402, -33.1163], [-70.7402, -33.1168], [-70.7407, -33.1168], [-70.7407, -33.1163]]'),
  ('MP_S5_QUIEBRE MURO', 'MP', 'S5', 'QUIEBRE MURO', 4, 1, 1, 5203, '2025-10-18 10:20:00', '[[-70.7430, -33.1150], [-70.7425, -33.1150], [-70.7425, -33.1155], [-70.7430, -33.1155], [-70.7430, -33.1150]]'),
  ('MO_S3_PLATAFORMA 2', 'MO', 'S3', 'PLATAFORMA 2', 8, 2, 1, 5204, '2025-11-08 09:15:00', '[[-70.7496, -33.1318], [-70.7491, -33.1318], [-70.7491, -33.1323], [-70.7496, -33.1323], [-70.7496, -33.1318]]'),
  ('ME_S1_PLATAFORMA 6', 'ME', 'S1', 'PLATAFORMA 6', 6, 1, 1, 5205, '2025-11-20 13:40:00', '[[-70.7160, -33.1246], [-70.7155, -33.1246], [-70.7155, -33.1251], [-70.7160, -33.1251], [-70.7160, -33.1246]]');

-- Verificar las canchas creadas
SELECT 
    nombre,
    muro,
    sector,
    estado_actual_id,
    empresa_actual_id,
    DATE(created_at) as fecha_creacion
FROM canchas 
WHERE nombre LIKE '%PLATAFORMA%' 
   OR nombre LIKE '%CORONAMIENTO%' 
   OR nombre LIKE '%TALUD%' 
   OR nombre LIKE '%QUIEBRE%'
ORDER BY muro, sector, created_at;

-- Ver resumen por estado
SELECT 
    ec.nombre as estado,
    COUNT(*) as cantidad
FROM canchas c
JOIN estados_cancha ec ON c.estado_actual_id = ec.id
WHERE c.nombre LIKE '%PLATAFORMA%' 
   OR c.nombre LIKE '%CORONAMIENTO%' 
   OR c.nombre LIKE '%TALUD%' 
   OR c.nombre LIKE '%QUIEBRE%'
GROUP BY ec.nombre, ec.id
ORDER BY ec.id;

-- Ver resumen por muro
SELECT 
    muro,
    COUNT(*) as cantidad
FROM canchas 
WHERE nombre LIKE '%PLATAFORMA%' 
   OR nombre LIKE '%CORONAMIENTO%' 
   OR nombre LIKE '%TALUD%' 
   OR nombre LIKE '%QUIEBRE%'
GROUP BY muro
ORDER BY muro;

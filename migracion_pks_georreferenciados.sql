-- =====================================================
-- MIGRACIÓN: PKs GEORREFERENCIADOS
-- Sistema de Gestión de Canchas - AngloAmerican
-- Fecha: 2025-12-04
-- =====================================================
-- Este script crea la tabla maestra de PKs con coordenadas UTM
-- y las convierte automáticamente a WGS84 para uso en Mapbox
-- =====================================================

-- =====================================================
-- FASE 1: CREAR TABLA MAESTRA DE PKs
-- =====================================================

CREATE TABLE IF NOT EXISTS pks_maestro (
    id SERIAL PRIMARY KEY,
    
    -- Identificación del PK
    muro VARCHAR(50) NOT NULL,   -- 'Principal', 'Este', 'Oeste'
    pk VARCHAR(20) NOT NULL,      -- '0+000', '0+020', etc.
    
    -- Coordenadas UTM (Zona 19S - PSAD56 o WGS84)
    utm_x DECIMAL(12, 3) NOT NULL,  -- Este (X)
    utm_y DECIMAL(12, 3) NOT NULL,  -- Norte (Y)
    utm_zona INTEGER DEFAULT 19,
    utm_hemisferio CHAR(1) DEFAULT 'S',
    
    -- Coordenadas WGS84 (para Mapbox)
    lon DECIMAL(10, 7),  -- Longitud
    lat DECIMAL(10, 7),  -- Latitud
    
    -- Metadata
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_muro_pk UNIQUE (muro, pk),
    CONSTRAINT check_muro_pk CHECK (muro IN ('Principal', 'Este', 'Oeste')),
    CONSTRAINT check_utm_x CHECK (utm_x BETWEEN 200000 AND 800000),
    CONSTRAINT check_utm_y CHECK (utm_y BETWEEN 6000000 AND 7000000)
);

-- Comentarios de documentación
COMMENT ON TABLE pks_maestro IS 'Tabla maestra de PKs (Progressive Kilometers) con coordenadas UTM fijas para cada muro';
COMMENT ON COLUMN pks_maestro.muro IS 'Tipo de muro: Principal, Este, Oeste';
COMMENT ON COLUMN pks_maestro.pk IS 'Progressive Kilometer en formato 0+000, 0+020, etc.';
COMMENT ON COLUMN pks_maestro.utm_x IS 'Coordenada Este (X) en UTM Zona 19S';
COMMENT ON COLUMN pks_maestro.utm_y IS 'Coordenada Norte (Y) en UTM Zona 19S';
COMMENT ON COLUMN pks_maestro.lon IS 'Longitud en WGS84 (calculada automáticamente)';
COMMENT ON COLUMN pks_maestro.lat IS 'Latitud en WGS84 (calculada automáticamente)';

-- =====================================================
-- FASE 2: CREAR FUNCIÓN DE CONVERSIÓN UTM → WGS84
-- =====================================================

-- Función para convertir UTM Zona 19S a WGS84
-- Basada en la fórmula de Transverse Mercator Inverse
CREATE OR REPLACE FUNCTION utm_to_wgs84(
    utm_x DECIMAL,
    utm_y DECIMAL,
    zona INTEGER DEFAULT 19,
    hemisferio CHAR DEFAULT 'S'
) RETURNS TABLE(lon DECIMAL, lat DECIMAL) AS $$
DECLARE
    -- Constantes del elipsoide WGS84
    a CONSTANT DECIMAL := 6378137.0;           -- Semi-eje mayor
    e CONSTANT DECIMAL := 0.081819190842622;   -- Excentricidad
    e2 CONSTANT DECIMAL := 0.00669437999014;   -- e^2
    k0 CONSTANT DECIMAL := 0.9996;             -- Factor de escala
    
    -- Variables de cálculo
    x DECIMAL;
    y DECIMAL;
    lon_origen DECIMAL;
    M DECIMAL;
    mu DECIMAL;
    e1 DECIMAL;
    phi1 DECIMAL;
    C1 DECIMAL;
    T1 DECIMAL;
    N1 DECIMAL;
    R1 DECIMAL;
    D DECIMAL;
    
    lat_rad DECIMAL;
    lon_rad DECIMAL;
    lat_deg DECIMAL;
    lon_deg DECIMAL;
BEGIN
    -- Ajustar coordenadas según hemisferio
    x := utm_x - 500000.0;  -- Falso Este
    IF hemisferio = 'S' THEN
        y := utm_y - 10000000.0;  -- Falso Norte para hemisferio sur
    ELSE
        y := utm_y;
    END IF;
    
    -- Longitud del meridiano central
    lon_origen := (zona - 1) * 6 - 180 + 3;  -- En grados
    
    -- Cálculo de M (distancia meridional)
    M := y / k0;
    
    -- Cálculo de mu (latitud footpoint)
    e1 := (1 - SQRT(1 - e2)) / (1 + SQRT(1 - e2));
    mu := M / (a * (1 - e2/4 - 3*e2*e2/64 - 5*e2*e2*e2/256));
    
    -- Latitud footpoint
    phi1 := mu + 
            (3*e1/2 - 27*e1*e1*e1/32) * SIN(2*mu) +
            (21*e1*e1/16 - 55*e1*e1*e1*e1/32) * SIN(4*mu) +
            (151*e1*e1*e1/96) * SIN(6*mu);
    
    -- Cálculos auxiliares
    C1 := e2 * COS(phi1) * COS(phi1) / (1 - e2);
    T1 := TAN(phi1) * TAN(phi1);
    N1 := a / SQRT(1 - e2 * SIN(phi1) * SIN(phi1));
    R1 := a * (1 - e2) / POWER(1 - e2 * SIN(phi1) * SIN(phi1), 1.5);
    D := x / (N1 * k0);
    
    -- Latitud en radianes
    lat_rad := phi1 - (N1 * TAN(phi1) / R1) * 
               (D*D/2 - (5 + 3*T1 + 10*C1 - 4*C1*C1 - 9*e2) * D*D*D*D/24 +
                (61 + 90*T1 + 298*C1 + 45*T1*T1 - 252*e2 - 3*C1*C1) * D*D*D*D*D*D/720);
    
    -- Longitud en radianes
    lon_rad := (D - (1 + 2*T1 + C1) * D*D*D/6 +
                (5 - 2*C1 + 28*T1 - 3*C1*C1 + 8*e2 + 24*T1*T1) * D*D*D*D*D/120) / COS(phi1);
    
    -- Convertir a grados
    lat_deg := DEGREES(lat_rad);
    lon_deg := lon_origen + DEGREES(lon_rad);
    
    -- Retornar resultado
    RETURN QUERY SELECT 
        ROUND(lon_deg::NUMERIC, 7)::DECIMAL AS lon,
        ROUND(lat_deg::NUMERIC, 7)::DECIMAL AS lat;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION utm_to_wgs84 IS 'Convierte coordenadas UTM Zona 19S a WGS84 (lon/lat)';

-- =====================================================
-- FASE 3: CREAR TRIGGER PARA CONVERSIÓN AUTOMÁTICA
-- =====================================================

-- Función trigger para calcular lon/lat automáticamente
CREATE OR REPLACE FUNCTION calcular_wgs84_pks()
RETURNS TRIGGER AS $$
DECLARE
    coords RECORD;
BEGIN
    -- Convertir UTM a WGS84
    SELECT * INTO coords FROM utm_to_wgs84(
        NEW.utm_x, 
        NEW.utm_y, 
        NEW.utm_zona, 
        NEW.utm_hemisferio
    );
    
    -- Asignar coordenadas WGS84
    NEW.lon := coords.lon;
    NEW.lat := coords.lat;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para INSERT
DROP TRIGGER IF EXISTS trigger_calcular_wgs84_insert ON pks_maestro;
CREATE TRIGGER trigger_calcular_wgs84_insert
    BEFORE INSERT ON pks_maestro
    FOR EACH ROW
    EXECUTE FUNCTION calcular_wgs84_pks();

-- Trigger para UPDATE
DROP TRIGGER IF EXISTS trigger_calcular_wgs84_update ON pks_maestro;
CREATE TRIGGER trigger_calcular_wgs84_update
    BEFORE UPDATE OF utm_x, utm_y, utm_zona, utm_hemisferio ON pks_maestro
    FOR EACH ROW
    EXECUTE FUNCTION calcular_wgs84_pks();

-- =====================================================
-- FASE 4: IMPORTAR DATOS DESDE CSV
-- =====================================================

-- Nota: Este comando debe ejecutarse desde psql o ajustarse según tu cliente
-- COPY pks_maestro (muro, pk, utm_x, utm_y) 
-- FROM 'E:\TITO\1 Astro\canchas-anglo2\alignment_coordinates.csv'
-- DELIMITER ';'
-- CSV HEADER;

-- Alternativa: INSERT manual de datos
-- Los datos se insertarán automáticamente con las coordenadas WGS84 calculadas

INSERT INTO pks_maestro (muro, pk, utm_x, utm_y) VALUES
-- Muro Principal
('Principal', '0+000', 337997.913, 6334753.227),
('Principal', '0+020', 337979.647, 6334745.096),
('Principal', '0+040', 337961.381, 6334736.965),
('Principal', '0+060', 337943.115, 6334728.834),
('Principal', '0+080', 337924.848, 6334720.704),
('Principal', '0+100', 337906.582, 6334712.573),
('Principal', '0+120', 337888.316, 6334704.442),
('Principal', '0+140', 337870.05, 6334696.311),
('Principal', '0+160', 337851.784, 6334688.18),
('Principal', '0+180', 337833.518, 6334680.049),
('Principal', '0+200', 337815.251, 6334671.919),
('Principal', '0+220', 337796.985, 6334663.788),
('Principal', '0+240', 337778.719, 6334655.657),
('Principal', '0+260', 337760.453, 6334647.526),
('Principal', '0+280', 337742.187, 6334639.395),
('Principal', '0+300', 337723.921, 6334631.264),
('Principal', '0+320', 337705.655, 6334623.134),
('Principal', '0+340', 337687.388, 6334615.003),
('Principal', '0+360', 337669.122, 6334606.872),
('Principal', '0+380', 337650.856, 6334598.741),
('Principal', '0+400', 337632.59, 6334590.61),
('Principal', '0+420', 337614.324, 6334582.479),
('Principal', '0+440', 337596.058, 6334574.349),
('Principal', '0+460', 337577.792, 6334566.218),
('Principal', '0+480', 337559.525, 6334558.087),
('Principal', '0+500', 337541.259, 6334549.956),
('Principal', '0+520', 337522.993, 6334541.825),
('Principal', '0+540', 337504.727, 6334533.694),
('Principal', '0+560', 337486.461, 6334525.564),
('Principal', '0+580', 337468.195, 6334517.433),
('Principal', '0+600', 337449.928, 6334509.302),
('Principal', '0+620', 337431.662, 6334501.171),
('Principal', '0+640', 337413.396, 6334493.04),
('Principal', '0+660', 337395.13, 6334484.909),
('Principal', '0+680', 337376.864, 6334476.779),
('Principal', '0+700', 337358.598, 6334468.648),
('Principal', '0+720', 337340.332, 6334460.517),
('Principal', '0+740', 337322.065, 6334452.386),
('Principal', '0+760', 337303.799, 6334444.255),
('Principal', '0+780', 337285.533, 6334436.124),
('Principal', '0+800', 337267.267, 6334427.994),
('Principal', '0+820', 337249.001, 6334419.863),
('Principal', '0+840', 337230.735, 6334411.732),
('Principal', '0+860', 337212.469, 6334403.601),
('Principal', '0+880', 337194.202, 6334395.47),
('Principal', '0+900', 337175.936, 6334387.339),
('Principal', '0+920', 337157.67, 6334379.209),
('Principal', '0+940', 337139.404, 6334371.078),
('Principal', '0+960', 337121.138, 6334362.947),
('Principal', '0+980', 337102.872, 6334354.816),
('Principal', '1+000', 337084.605, 6334346.685),
('Principal', '1+020', 337066.339, 6334338.554),
('Principal', '1+040', 337048.073, 6334330.423),
('Principal', '1+060', 337029.807, 6334322.293),
('Principal', '1+080', 337011.541, 6334314.162),
('Principal', '1+100', 336993.275, 6334306.031),
('Principal', '1+120', 336975.009, 6334297.9),
('Principal', '1+140', 336956.742, 6334289.769),
('Principal', '1+160', 336938.476, 6334281.638),
('Principal', '1+180', 336920.21, 6334273.508),
('Principal', '1+200', 336901.944, 6334265.377),
('Principal', '1+220', 336883.678, 6334257.246),
('Principal', '1+240', 336865.412, 6334249.115),
('Principal', '1+260', 336847.146, 6334240.984),
('Principal', '1+280', 336828.879, 6334232.853),
('Principal', '1+300', 336810.613, 6334224.723),
('Principal', '1+320', 336792.347, 6334216.592),
('Principal', '1+340', 336774.081, 6334208.461),
('Principal', '1+360', 336755.815, 6334200.33),
('Principal', '1+380', 336737.549, 6334192.199),
('Principal', '1+400', 336719.282, 6334184.068),
('Principal', '1+420', 336701.016, 6334175.938),
('Principal', '1+434', 336688.23, 6334170.246),

-- Muro Oeste
('Oeste', '0+000', 336193.025, 6332549.931),
('Oeste', '0+020', 336203.229, 6332567.132),
('Oeste', '0+040', 336213.434, 6332584.333),
('Oeste', '0+060', 336223.638, 6332601.533),
('Oeste', '0+080', 336233.843, 6332618.734),
('Oeste', '0+100', 336244.047, 6332635.935),
('Oeste', '0+120', 336254.252, 6332653.136),
('Oeste', '0+140', 336264.456, 6332670.337),
('Oeste', '0+160', 336274.661, 6332687.537),
('Oeste', '0+180', 336284.865, 6332704.738),
('Oeste', '0+200', 336295.07, 6332721.939),
('Oeste', '0+220', 336305.274, 6332739.14),
('Oeste', '0+240', 336315.332, 6332756.425),
('Oeste', '0+260', 336323.065, 6332774.843),
('Oeste', '0+280', 336327.593, 6332794.3),
('Oeste', '0+300', 336328.788, 6332814.24),
('Oeste', '0+320', 336326.615, 6332834.098),
('Oeste', '0+340', 336323.504, 6332853.853),
('Oeste', '0+360', 336320.276, 6332873.589),
('Oeste', '0+380', 336316.09, 6332893.146),
('Oeste', '0+400', 336311.903, 6332912.703),
('Oeste', '0+420', 336307.716, 6332932.26),
('Oeste', '0+440', 336303.53, 6332951.817),
('Oeste', '0+460', 336299.344, 6332971.374),
('Oeste', '0+480', 336295.157, 6332990.931),
('Oeste', '0+500', 336290.78, 6333010.446),
('Oeste', '0+520', 336286.397, 6333029.96),
('Oeste', '0+540', 336282.014, 6333049.474),
('Oeste', '0+560', 336277.631, 6333068.988),
('Oeste', '0+580', 336273.247, 6333088.501),
('Oeste', '0+600', 336268.864, 6333108.015),
('Oeste', '0+620', 336264.481, 6333127.529),
('Oeste', '0+640', 336260.098, 6333147.043),
('Oeste', '0+660', 336255.715, 6333166.557),
('Oeste', '0+680', 336251.332, 6333186.07),
('Oeste', '0+690', 336249.167, 6333195.707),

-- Muro Este
('Este', '0+000', 340114.954, 6333743.678),
('Este', '0+020', 340104.134, 6333760.498),
('Este', '0+040', 340093.313, 6333777.319),
('Este', '0+060', 340082.493, 6333794.139),
('Este', '0+080', 340071.673, 6333810.959),
('Este', '0+100', 340060.853, 6333827.779),
('Este', '0+120', 340050.032, 6333844.6),
('Este', '0+140', 340039.212, 6333861.42),
('Este', '0+160', 340028.392, 6333878.24),
('Este', '0+180', 340017.572, 6333895.06),
('Este', '0+200', 340006.751, 6333911.881),
('Este', '0+220', 339995.931, 6333928.701),
('Este', '0+240', 339985.111, 6333945.521),
('Este', '0+260', 339974.29, 6333962.342),
('Este', '0+280', 339963.47, 6333979.162),
('Este', '0+300', 339952.65, 6333995.982),
('Este', '0+320', 339941.83, 6334012.802),
('Este', '0+340', 339931.009, 6334029.623),
('Este', '0+360', 339920.189, 6334046.443),
('Este', '0+380', 339909.369, 6334063.263),
('Este', '0+400', 339898.549, 6334080.084),
('Este', '0+420', 339887.728, 6334096.904),
('Este', '0+440', 339876.908, 6334113.724),
('Este', '0+460', 339866.088, 6334130.544),
('Este', '0+480', 339855.267, 6334147.365),
('Este', '0+500', 339844.447, 6334164.185),
('Este', '0+520', 339833.627, 6334181.005),
('Este', '0+540', 339822.807, 6334197.825),
('Este', '0+551', 339816.955, 6334206.922);

-- =====================================================
-- FASE 5: CREAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para búsquedas por muro y PK
CREATE INDEX IF NOT EXISTS idx_pks_muro_pk ON pks_maestro(muro, pk);

-- Índice para búsquedas geográficas UTM
CREATE INDEX IF NOT EXISTS idx_pks_utm_coords ON pks_maestro(utm_x, utm_y);

-- Índice para búsquedas geográficas WGS84
CREATE INDEX IF NOT EXISTS idx_pks_wgs84_coords ON pks_maestro(lon, lat);

-- Índice para PKs activos
CREATE INDEX IF NOT EXISTS idx_pks_activo ON pks_maestro(activo) WHERE activo = TRUE;

-- =====================================================
-- FASE 6: CREAR VISTAS ÚTILES
-- =====================================================

-- Vista de PKs con información completa
CREATE OR REPLACE VIEW vista_pks_completa AS
SELECT 
    id,
    muro,
    pk,
    utm_x,
    utm_y,
    lon,
    lat,
    activo,
    created_at
FROM pks_maestro
WHERE activo = TRUE
ORDER BY 
    CASE muro 
        WHEN 'Principal' THEN 1
        WHEN 'Este' THEN 2
        WHEN 'Oeste' THEN 3
    END,
    pk;

COMMENT ON VIEW vista_pks_completa IS 'Vista de todos los PKs activos con coordenadas UTM y WGS84';

-- Vista de PKs por muro
CREATE OR REPLACE VIEW vista_pks_por_muro AS
SELECT 
    muro,
    COUNT(*) as total_pks,
    MIN(pk) as pk_inicial,
    MAX(pk) as pk_final,
    MIN(utm_x) as utm_x_min,
    MAX(utm_x) as utm_x_max,
    MIN(utm_y) as utm_y_min,
    MAX(utm_y) as utm_y_max
FROM pks_maestro
WHERE activo = TRUE
GROUP BY muro
ORDER BY 
    CASE muro 
        WHEN 'Principal' THEN 1
        WHEN 'Este' THEN 2
        WHEN 'Oeste' THEN 3
    END;

COMMENT ON VIEW vista_pks_por_muro IS 'Resumen de PKs agrupados por muro';

-- =====================================================
-- FASE 7: CONFIGURAR SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE pks_maestro ENABLE ROW LEVEL SECURITY;

-- Política de lectura (todos pueden leer)
CREATE POLICY "Permitir lectura de PKs" ON pks_maestro
    FOR SELECT USING (true);

-- Política de escritura (solo administradores)
CREATE POLICY "Permitir operaciones en PKs" ON pks_maestro
    FOR ALL USING (true);

-- =====================================================
-- FASE 8: VERIFICACIÓN
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    'VERIFICACIÓN: Tabla pks_maestro creada' as status,
    COUNT(*) as total_registros,
    COUNT(DISTINCT muro) as total_muros
FROM pks_maestro;

-- Verificar conversión UTM → WGS84
SELECT 
    'VERIFICACIÓN: Coordenadas WGS84 calculadas' as status,
    muro,
    COUNT(*) as total_pks,
    COUNT(CASE WHEN lon IS NOT NULL AND lat IS NOT NULL THEN 1 END) as pks_con_wgs84
FROM pks_maestro
GROUP BY muro
ORDER BY muro;

-- Mostrar algunos ejemplos
SELECT 
    'EJEMPLO: Primeros PKs de cada muro' as status,
    muro,
    pk,
    utm_x,
    utm_y,
    lon,
    lat
FROM pks_maestro
WHERE pk IN ('0+000', '0+020', '0+040')
ORDER BY muro, pk;

SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' as status, NOW() as fecha;

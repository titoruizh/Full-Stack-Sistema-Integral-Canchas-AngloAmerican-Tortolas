-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.canchas (
  id integer NOT NULL DEFAULT nextval('canchas_id_seq1'::regclass),
  nombre character varying NOT NULL UNIQUE,
  muro character varying NOT NULL,
  sector character varying NOT NULL,
  nombre_detalle character varying NOT NULL,
  estado_actual_id integer DEFAULT 1,
  empresa_actual_id integer DEFAULT 1,
  created_by integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  numero_informe integer UNIQUE,
  CONSTRAINT canchas_pkey PRIMARY KEY (id),
  CONSTRAINT canchas_estado_actual_id_fkey FOREIGN KEY (estado_actual_id) REFERENCES public.estados_cancha(id),
  CONSTRAINT canchas_empresa_actual_id_fkey FOREIGN KEY (empresa_actual_id) REFERENCES public.empresas(id),
  CONSTRAINT canchas_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.empresas(id)
);
CREATE TABLE public.contador_informes (
  id integer NOT NULL DEFAULT nextval('contador_informes_id_seq'::regclass),
  ultimo_numero integer NOT NULL DEFAULT 5000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contador_informes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.empresas (
  id integer NOT NULL DEFAULT nextval('empresas_id_seq1'::regclass),
  nombre character varying NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT empresas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.estados_cancha (
  id integer NOT NULL DEFAULT nextval('estados_cancha_id_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT estados_cancha_pkey PRIMARY KEY (id)
);
CREATE TABLE public.historial_cancha (
  id integer NOT NULL DEFAULT nextval('historial_cancha_id_seq'::regclass),
  cancha_id integer,
  estado_anterior_id integer,
  estado_nuevo_id integer,
  empresa_anterior_id integer,
  empresa_nueva_id integer,
  accion character varying NOT NULL,
  observaciones text,
  created_by integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT historial_cancha_pkey PRIMARY KEY (id),
  CONSTRAINT historial_cancha_cancha_id_fkey FOREIGN KEY (cancha_id) REFERENCES public.canchas(id),
  CONSTRAINT historial_cancha_estado_anterior_id_fkey FOREIGN KEY (estado_anterior_id) REFERENCES public.estados_cancha(id),
  CONSTRAINT historial_cancha_estado_nuevo_id_fkey FOREIGN KEY (estado_nuevo_id) REFERENCES public.estados_cancha(id),
  CONSTRAINT historial_cancha_empresa_anterior_id_fkey FOREIGN KEY (empresa_anterior_id) REFERENCES public.empresas(id),
  CONSTRAINT historial_cancha_empresa_nueva_id_fkey FOREIGN KEY (empresa_nueva_id) REFERENCES public.empresas(id),
  CONSTRAINT historial_cancha_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.empresas(id)
);
CREATE TABLE public.validaciones (
  id integer NOT NULL DEFAULT nextval('validaciones_id_seq'::regclass),
  cancha_id integer,
  empresa_validadora_id integer,
  tipo_validacion character varying NOT NULL,
  resultado character varying NOT NULL,
  observaciones text,
  mediciones jsonb,
  created_at timestamp with time zone DEFAULT now(),
  is_revalidacion boolean DEFAULT false,
  CONSTRAINT validaciones_pkey PRIMARY KEY (id),
  CONSTRAINT validaciones_cancha_id_fkey FOREIGN KEY (cancha_id) REFERENCES public.canchas(id),
  CONSTRAINT validaciones_empresa_validadora_id_fkey FOREIGN KEY (empresa_validadora_id) REFERENCES public.empresas(id)
);
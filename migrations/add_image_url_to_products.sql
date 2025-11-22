-- migrations/add_image_url_to_products.sql

-- Agregar campo image_url a la tabla products si no existe
-- Este campo almacenará la URL de la imagen del producto en Supabase Storage

DO $$
BEGIN
    -- Para el schema public (producción)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.products
        ADD COLUMN image_url TEXT;
        
        COMMENT ON COLUMN public.products.image_url IS 'URL de la imagen del producto almacenada en Supabase Storage';
        
        RAISE NOTICE 'Columna image_url agregada exitosamente a la tabla public.products';
    ELSE
        RAISE NOTICE 'La columna image_url ya existe en la tabla public.products';
    END IF;

    -- Para el schema dev (desarrollo)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'dev' 
        AND table_name = 'products' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE dev.products
        ADD COLUMN image_url TEXT;
        
        COMMENT ON COLUMN dev.products.image_url IS 'URL de la imagen del producto almacenada en Supabase Storage';
        
        RAISE NOTICE 'Columna image_url agregada exitosamente a la tabla dev.products';
    ELSE
        RAISE NOTICE 'La columna image_url ya existe en la tabla dev.products';
    END IF;
END
$$;


-- Script SQL para insertar productos en la empresa con ID: 01646687-9c07-463c-b71c-af96de397138
-- Todos los productos se insertan con stock IN_STOCK

INSERT INTO products (name, description, price, stock, company_id, category_id, created_at, updated_at)
VALUES
  ('Cacao Toddy', 'Cacao en polvo', 1915.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Arroz APOSTOLES', 'Arroz', 1200.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Maple de huevos', 'Huevos', 6000.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Arroz San Javier', 'Arroz', 700.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Dulce de leche TONADITA', 'Dulce de leche', 3500.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Fideo tirabuzón SAN REMO', 'Pasta seca tirabuzón', 850.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Condimento para pizza ALICANTE', 'Condimento para pizza', 1500.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Condimento para arroz ALICANTE', 'Condimento para arroz', 1400.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Té TARAGÜI', 'Té en saquitos', 1100.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Dulce de leche El Quebrachal', 'Dulce de leche', 2100.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Mermelada Durazno NOEL', 'Mermelada de durazno', 2600.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Mermelada Ciruela DULCOR', 'Mermelada de ciruela', 2600.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Paté de Foie SWIFT', 'Paté de foie', 1100.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Picadillo de carne SWIFT', 'Picadillo de carne', 1100.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Bizcochuelo Vainilla MAIZENA', 'Mezcla para bizcochuelo sabor vainilla', 3100.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Jardinera INALPA', 'Verduras en conserva', 1000.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Sabor en polvo ALICANTE', 'Condimento sabor en polvo', 400.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW()),
  ('Hellmann''s Picante', 'Salsa picante', 2100.00, 'IN_STOCK', '01646687-9c07-463c-b71c-af96de397138', NULL, NOW(), NOW());


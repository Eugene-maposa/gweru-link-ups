-- Update profiles locations from Bulawayo suburbs to Gweru suburbs
UPDATE profiles SET location = 'mkoba' WHERE location IN ('entumbane', 'nkulumane', 'emakhandeni', 'magwegwe', 'njube');
UPDATE profiles SET location = 'senga' WHERE location IN ('suburbs', 'hillside', 'matsheumhlope');
UPDATE profiles SET location = 'city-center' WHERE location IN ('city-center', 'bulawayo-central');
UPDATE profiles SET location = 'mambo' WHERE location IN ('pumula', 'pelandaba');
UPDATE profiles SET location = 'mtapa' WHERE location IN ('cowdray-park', 'luveve');
UPDATE profiles SET location = 'ascot' WHERE location IN ('burnside', 'waterford', 'kumalo');
UPDATE profiles SET location = 'southdowns' WHERE location IN ('selborne-park', 'morningside');

-- Update jobs locations from Bulawayo suburbs to Gweru suburbs
UPDATE jobs SET location = 'mkoba' WHERE location IN ('entumbane', 'nkulumane', 'emakhandeni', 'magwegwe', 'njube');
UPDATE jobs SET location = 'senga' WHERE location IN ('suburbs', 'hillside', 'matsheumhlope');
UPDATE jobs SET location = 'city-center' WHERE location IN ('city-center', 'bulawayo-central');
UPDATE jobs SET location = 'mambo' WHERE location IN ('pumula', 'pelandaba');
UPDATE jobs SET location = 'mtapa' WHERE location IN ('cowdray-park', 'luveve');
UPDATE jobs SET location = 'ascot' WHERE location IN ('burnside', 'waterford', 'kumalo');
UPDATE jobs SET location = 'southdowns' WHERE location IN ('selborne-park', 'morningside');
#!/usr/bin/env python3
import os
import joblib

# Probar cargar el modelo desde la ruta absoluta
model_path = r'C:\Users\josue\OneDrive\Escritorio\pisa-job-application\scripts\PisaModel.pkl'

print(f"Verificando si existe el archivo: {model_path}")
print(f"Existe: {os.path.exists(model_path)}")

if os.path.exists(model_path):
    try:
        model = joblib.load(model_path)
        print("✅ Modelo cargado exitosamente!")
        print(f"Tipo de modelo: {type(model)}")
        if hasattr(model, 'predict'):
            print("✅ El modelo tiene método predict")
        if hasattr(model, 'predict_proba'):
            print("✅ El modelo tiene método predict_proba")
    except Exception as e:
        print(f"❌ Error al cargar el modelo: {e}")
else:
    print("❌ El archivo no existe en la ruta especificada")

# También probar rutas relativas
print("\n--- Probando rutas relativas ---")
print(f"Directorio actual: {os.getcwd()}")

relative_paths = [
    'scripts/PisaModel.pkl',
    './scripts/PisaModel.pkl',
    'PisaModel.pkl'
]

for path in relative_paths:
    exists = os.path.exists(path)
    print(f"{path}: {'✅ Existe' if exists else '❌ No existe'}")

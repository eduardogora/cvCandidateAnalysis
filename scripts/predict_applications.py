#!/usr/bin/env python3
import sys
import json
import random  # Just for demonstration
import re
import unicodedata
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import joblib

app = FastAPI(
    title="PISA Job Application Predictor",
    description="API to predict job application scores",
    version="1.0.1"
)

# Cargar el modelo de embeddings una sola vez al iniciar
try:
    model = SentenceTransformer('intfloat/multilingual-e5-base')
    print("Modelo de embeddings cargado exitosamente")
except Exception as e:
    print(f"Error al cargar el modelo de embeddings: {e}")
    model = None

# Cargar el modelo de predicción con múltiples rutas posibles
try:
    # Intentar diferentes rutas para el modelo
    model_paths = [
        'scripts/PisaModel.pkl',
        './scripts/PisaModel.pkl',
        'PisaModel.pkl',
        os.path.join(os.path.dirname(__file__), 'PisaModel.pkl'),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'PisaModel.pkl')
    ]
    
    predictModel = None
    for path in model_paths:
        try:
            if os.path.exists(path):
                predictModel = joblib.load(path)
                print(f"Modelo de predicción cargado exitosamente desde: {path}")
                break
        except Exception as e:
            print(f"Error al cargar modelo desde {path}: {e}")
            continue
    
    if predictModel is None:
        print("No se pudo cargar el modelo de predicción desde ninguna ruta")
        print(f"Directorio actual: {os.getcwd()}")
        print(f"Directorio del script: {os.path.dirname(__file__)}")
        if os.path.exists('.'):
            print(f"Archivos en directorio actual: {os.listdir('.')}")
        if os.path.exists('scripts'):
            print(f"Archivos en scripts/: {os.listdir('scripts')}")
except Exception as e:
    print(f"Error general al cargar el modelo de predicción: {e}")
    predictModel = None

class Education(BaseModel):
    highestLevel: str
    field: Optional[str] = None
    

class Experience(BaseModel):
    totalYears: str
    currentPosition: Optional[str] = None
    achievements: Optional[List[str]] = None

class Skills(BaseModel):
    skills: List[str]
    
class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]

class Job(BaseModel):
    requirements: str
    responsibilities: str
    
class ApplicationData(BaseModel):
    applicationId: str
    skills: List[str]
    education: Education
    experience: Experience
    projects: List[Project]
    Job: Job

def calcular_score_fusionado(row):
    # Penalización si la experiencia del trabajo excede la del candidato
    penalizacion = 0.85 if row["JobYears"] > row["XpYears"] else 1

    # Ponderación: más peso a sim_xp_job
    score = (
        row["sim_xp_job"] * 0.5 +
        row["sim_major_job"] * 0.3 +
        row["sim_cert_job"] * 0.2
    )

    # Penalización aplicada
    return score * penalizacion

def extract_job_years(text):
    if pd.isna(text):
        return 0
    
    regex_job_years = re.compile(
    r"(?:(\d+)\s*(año|años|year|years))|(?:(año|años|year|years)\s*(\d+))",
    re.IGNORECASE
    )
    
    matches = regex_job_years.findall(text)

    # Recolectar todos los números encontrados
    years = []
    for match in matches:
        if match[0]:
            years.append(int(match[0]))
        elif match[3]:
            years.append(int(match[3]))

    if not years:
        return 0

    # Si el primer valor es mayor a 10, buscar otro que no lo sea
    if years[0] > 10:
        for y in years[1:]:
            if y <= 10:
                return y
        return 0  # No se encontró ninguno menor o igual a 10
    else:
        return years[0]
    
def clean_text(text):
    if not isinstance(text, str):
        return ""
    
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i',
        'ó': 'o', 'ú': 'u', 'Á': 'a', 'É': 'e',
        'Í': 'i', 'Ó': 'o', 'Ú': 'u'
    }
    
    for original, replacement in replacements.items():
        text = text.replace(original, replacement)

    # Normalizar espacios y eliminar caracteres no deseados
    text = re.sub(r'[^\w\s,.:-ñÑ]', '', text)
    text = re.sub(r'\s+', ' ', text)

    return text.strip().lower()

def clean_job_description(raw_text):
    raw_text=clean_text(raw_text)

    lines = raw_text.split('\n') if '\n' in raw_text else raw_text.split('.')
    lines = [l.strip() for l in lines if l.strip() != ""]

    #quedarse con líneas que tengan ciertas palabras clave
    key_lines = [l for l in lines if (
        any(kw in l.lower() for kw in [
            'responsab', 'requisito', 'experienc', 'conocimiento','educaci','rol','labor'
            'nivel educativo', 'puesto', 'habilidad', 'actividades', 'funciones', 'años', 'mínimo'
        ])
        or re.search(r'\d+\s*(años|year)', l.lower())
    )]

    if not key_lines:
        key_lines = lines[-5:]  

    return '. '.join(key_lines)


def get_embedding(text, model):
    return model.encode(text)

def cosine_sim(a, b):
    return cosine_similarity([a], [b])[0][0]

def embedding_to_columns(vector, prefix):
    return pd.DataFrame([vector], columns=[f"{prefix}_{i}" for i in range(len(vector))])

def getFinalResult(pred_vector, prob_vector):
    
    labels = {
    0: 34,
    1: 67,
    2: 100
    }
    
    """
    # Lógica para determinar la clase final basada en las probabilidades pero recientemente funciona mejor con la clase predicha directamente
    if pred_vector[0] == 0 and (prob_vector[0][2]+0.05 >= prob_vector[0][0]):
        print(prob_vector[0],"probs")
        pred_class = 2
    else:
        pred_class = pred_vector[0]
    """  
    pred_class = pred_vector[0]    
    pred_prob = prob_vector[0][pred_class]
    if pred_class == 0:
        return labels[0] * pred_prob  # no hay clase anterior, escala normal

    # Clase previa y actual
    base_current = labels[pred_class]
    base_prev = labels[pred_class - 1]

    # Interpolación: cuanto más baja la probabilidad, más cerca del valor anterior
    resultado = base_prev + (base_current - base_prev) * pred_prob
    print(f"Clase: {pred_class}, Prob: {pred_prob:.3f}, Resultado: {resultado:.2f}")
    return resultado

def getYearsFromString(years_str):
    """
    Extrae el número de años de experiencia de un string.
    Maneja casos como: "1-3 years", "5+ years", "10 years", etc.
    """
    if not years_str or not isinstance(years_str, str):
        return 0
    
    label = years_str.lower().strip()
    
    # Caso "10+ years" o "10+"
    if "+" in label:
        match = re.search(r"(\d+)\+", label)
        return float(match.group(1)) if match else 0

    # Caso "1-3 years" - tomar el valor máximo del rango
    range_match = re.search(r"(\d+)\s*-\s*(\d+)", label)
    if range_match:
        return float(range_match.group(2))  # el mayor valor del rango
    
    # Caso simple "5 years" o "5"
    simple_match = re.search(r"(\d+)", label)
    if simple_match:
        return float(simple_match.group(1))
    
    return 0

def predict_application_score(application_data: ApplicationData):
    """
    Función para predecir la puntuación de una aplicación.
    
    Parameters:
    
    application_data (ApplicationData): Los datos de la aplicación
    
    Returns:
    dict: Los resultados de la predicción con la puntuación
    """
    # Verificar que los modelos estén cargados
    if predictModel is None:
        raise Exception("El modelo de predicción no está cargado. Verifica que el archivo PisaModel.pkl exista y sea accesible.")
    
    if model is None:
        raise Exception("El modelo de embeddings no está cargado.")
    
    try:
        Years = getYearsFromString(application_data.experience.totalYears)
        Major = (application_data.education.field or "") + " " + application_data.education.highestLevel
        
        # Concatenar todos los proyectos
        projects_text = ""
        for project in application_data.projects:
            project_info = project.name + " " + project.description + " " + " ".join(project.technologies)
            projects_text += project_info + " "
        
        # Concatenar todas las habilidades
        skills_text = " ".join(application_data.skills)
        
        Certifications = projects_text + "ademas " + skills_text
        
        # Concatenar logros si existen
        achievements_text = ""
        if application_data.experience.achievements:
            achievements_text = " ".join(application_data.experience.achievements)
        
        current_position = application_data.experience.currentPosition or ""
        Experiencia = current_position + (" logrando " + achievements_text if achievements_text else "")
        
        Jobtext = clean_job_description(application_data.Job.requirements + " " + application_data.Job.responsibilities)
        JobYears = extract_job_years(Jobtext)
        
        if Experiencia.strip() == "":
            Experiencia = 'Sin experiencia laboral relevante'
        if Years == 0:  # Cambiado de Years.strip() == "" porque ahora Years es un número
            Years = 0
            
        if Experiencia != 'Sin experiencia laboral relevante':
            Experiencia = str(Years) + ' años de experiencia trabajando de ' + Experiencia

        vec_edu = get_embedding(Major, model)
        vec_exp = get_embedding(Experiencia, model)
        vec_certs = get_embedding(Certifications, model)
        vec_job = get_embedding(Jobtext, model)
        
        # Obtener las similitudes
        sim_cert_job = cosine_sim(vec_certs, vec_job)
        sim_major_job = cosine_sim(vec_edu, vec_job)
        sim_xp_job = cosine_sim(vec_exp, vec_job)

        df_sim = pd.DataFrame([{
            'XpYears' : Years,
            'JobYears' : JobYears,
            "sim_cert_job": sim_cert_job,
            "sim_major_job": sim_major_job,
            "sim_xp_job": sim_xp_job,
        }])
        
        df_sim['score_combinado'] = calcular_score_fusionado(df_sim.iloc[0])
        
        df_edu = embedding_to_columns(vec_edu, "major__emb")
        df_exp = embedding_to_columns(vec_exp, "xp__emb")
        df_certs = embedding_to_columns(vec_certs, "cert__emb")
        df_job = embedding_to_columns(vec_job, "job__emb")
        
        # Concatenar todo
        df_sim = pd.concat([df_sim, df_job, df_certs, df_edu, df_exp], axis=1)
        probs = predictModel.predict_proba(df_sim)
        pred = predictModel.predict(df_sim)#
        return {
            "applicationId": application_data.applicationId,
            "score": round(getFinalResult(pred,probs)),
            "": probs.tolist(),
        }
    except Exception as e:
        raise Exception(f"Error en la predicción: {str(e)}")

@app.post("/predict")
async def predict(application_data: ApplicationData):
    try:
        score = predict_application_score(application_data)
        return {"success": True, "result": score, }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "embeddings_model_loaded": model is not None,
        "prediction_model_loaded": predictModel is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

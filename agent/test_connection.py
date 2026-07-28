import requests

# URL de nuestra API local
URL = "http://localhost:3000/api/v1/telemetry"

# Token de prueba que creamos en el Paso 1
DEVICE_KEY = "TEST-KEY-12345"

headers = {
    "Authorization": f"Bearer {DEVICE_KEY}",
    "Content-Type": "application/json"
}

# Simulación de métricas reales capturadas del hardware
payload = {
    "hostname": "DESKTOP-7G3H2K",
    "os_system": "Windows 11 Home 64-bit",
    "metrics": {
        "cpu_percent": 34.0,
        "ram_percent": 62.0,
        "disk_percent": 87.0,
        "cpu_temp": 59.0
    }
}

print("Enviando reporte de telemetría a PC Sentinel Cloud...")

try:
    response = requests.post(URL, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Respuesta del Servidor: {response.json()}")
except Exception as e:
    print(f"Error de conexión: {e}")
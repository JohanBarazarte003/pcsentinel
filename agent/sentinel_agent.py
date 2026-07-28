import os
import sys
import re
import time
import shutil
import winreg
import logging
import platform
import ctypes
import subprocess
import psutil
import requests
import unicodedata  # Requerido por PyInstaller

# 1. Crear directorio constante en AppData/Local/PCSentinel
APPDATA_DIR = os.path.join(os.getenv('LOCALAPPDATA', os.path.expanduser('~/AppData/Local')), "PCSentinel")
os.makedirs(APPDATA_DIR, exist_ok=True)

# 2. Guardar archivo de registro (Log) en AppData para depuración
LOG_FILE = os.path.join(APPDATA_DIR, "pcsentinel.log")
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - [PC SENTINEL] - %(levelname)s - %(message)s'
)

API_URL = "http://localhost:3000/api/v1/telemetry"
AGENT_VERSION = "1.0.0"

def show_popup(msg, title="PC Sentinel"):
    """Muestra un mensaje de confirmación flotante en Windows"""
    try:
        ctypes.windll.user32.MessageBoxW(0, msg, title, 0x40)
    except Exception:
        pass

def get_or_save_device_key():
    """Obtiene la clave dando prioridad SIEMPRE al nombre del instalador descargado"""
    config_file = os.path.join(APPDATA_DIR, "config.ini")
    
    # 1. Si el archivo actual es un instalador descargado con STN-XXXX, sobrescribir config.ini
    exe_name = os.path.basename(sys.argv[0])
    match = re.search(r'STN-[A-Z0-9]+', exe_name, re.IGNORECASE)
    
    if match:
        key = match.group(0).upper()
        try:
            with open(config_file, "w", encoding="utf-8") as f:
                f.write(f"device_key = {key}\n")
            logging.info(f"Clave extraída del instalador y actualizada en config.ini: {key}")
        except Exception as e:
            logging.error(f"Error escribiendo config.ini: {e}")
        return key

    # 2. Si es la ejecución habitual en segundo plano desde AppData, leer config.ini
    if os.path.exists(config_file):
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                for line in f:
                    if "device_key" in line:
                        key = line.split("=")[1].strip()
                        if key:
                            return key
        except Exception as e:
            logging.error(f"Error leyendo config.ini: {e}")

    return "TEST-KEY-12345"

def install_and_handoff():
    """Maneja la instalación silenciosa y ejecuta el proceso definitivo"""
    target_exe = os.path.join(APPDATA_DIR, "PCSentinelAgent.exe")
    current_exe = os.path.abspath(sys.argv[0])

    # Si el usuario ejecuta el instalador desde la carpeta Downloads o Escritorio
    if os.path.abspath(current_exe) != os.path.abspath(target_exe):
        logging.info(f"Instalando desde {current_exe} hacia {target_exe}")
        
        # Guardar clave
        device_key = get_or_save_device_key()

        # Copiar ejecutable
        try:
            shutil.copy2(current_exe, target_exe)
        except Exception as e:
            logging.error(f"Error copiando ejecutable: {e}")

        # Registrar en inicio automático de Windows Registry
        try:
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Run",
                0,
                winreg.KEY_SET_VALUE
            )
            winreg.SetValueEx(key, "PCSentinelAgent", 0, winreg.REG_SZ, f'"{target_exe}"')
            winreg.CloseKey(key)
        except Exception as e:
            logging.error(f"Error en Registro de Windows: {e}")

        # Iniciar el ejecutable instalado en AppData en segundo plano independiente
        try:
            subprocess.Popen([target_exe], creationflags=subprocess.CREATE_NO_WINDOW)
        except Exception as e:
            logging.error(f"Error ejecutando proceso instalado: {e}")

        # Mostrar cartel de confirmación y salir del instalador
        show_popup("¡PC Sentinel se ha instalado con éxito!\n\nTu equipo ya está enviando métricas en vivo a tu Dashboard.", "PC Sentinel Instalado")
        sys.exit(0)

def collect_hardware_metrics():
    """Recolecta el rendimiento de CPU, RAM y Disco con alta precisión"""
    try:
        # Tomar un promedio rápido de 3 muestras para igualar el refresco de Windows
        psutil.cpu_percent(interval=None) # Primera lectura de referencia
        time.sleep(0.1)
        cpu_samples = [psutil.cpu_percent(interval=0.3) for _ in range(3)]
        cpu_usage = sum(cpu_samples) / len(cpu_samples)

        ram_info = psutil.virtual_memory()
        disk_info = psutil.disk_usage('C:\\' if platform.system() == 'Windows' else '/')

        return {
            "hostname": platform.node(),
            "os_system": f"{platform.system()} {platform.release()}",
            "metrics": {
                "cpu_percent": round(cpu_usage, 1),
                "ram_percent": round(ram_info.percent, 1),
                "disk_percent": round(disk_info.percent, 1),
                "cpu_temp": None
            }
        }
    except Exception as e:
        logging.error(f"Error capturando hardware: {e}")
        return None

def main():
    # 1. Si venimos del archivo en Descargas, instalar y ceder el control
    install_and_handoff()

    # 2. Si ya estamos corriendo desde AppData, iniciar el bucle continuo
    device_key = get_or_save_device_key()
    logging.info(f"Servicio activo en AppData. Device Key: {device_key}")

    headers = {
        "Authorization": f"Bearer {device_key}",
        "Content-Type": "application/json",
        "User-Agent": f"PCSentinelAgent/{AGENT_VERSION}"
    }

    while True:
        try:
            payload = collect_hardware_metrics()
            if payload:
                res = requests.post(API_URL, json=payload, headers=headers, timeout=10)
                logging.info(f"Respuesta Servidor ({res.status_code}): {res.text}")
        except Exception as e:
            logging.error(f"Error enviando telemetría: {e}")

        time.sleep(15)

if __name__ == "__main__":
    main()
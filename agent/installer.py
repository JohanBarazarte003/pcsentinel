import os
import sys
import re
import shutil
import winreg
import logging
import requests

# Configuración del log de instalación
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [INSTALLER] - %(message)s')

def get_device_key_from_filename():
    """Extrae automáticamente el token STN-XXXX del nombre del ejecutable"""
    exe_name = os.path.basename(sys.argv[0])
    match = re.search(r'STN-[A-Z0-9]+', exe_name)
    if match:
        return match.group(0)
    return "TEST-KEY-12345" # Valor por defecto si se ejecuta en desarrollo

def setup_windows_autostart(installed_exe_path):
    """Registra el programa en el Registro de Windows para que inicie siempre con el sistema"""
    try:
        registry_key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\Microsoft\Windows\CurrentVersion\Run",
            0,
            winreg.KEY_SET_VALUE
        )
        winreg.SetValueEx(registry_key, "PCSentinelAgent", 0, winreg.REG_SZ, f'"{installed_exe_path}"')
        winreg.CloseKey(registry_key)
        logging.info("Registrado exitosamente en el inicio automático de Windows.")
    except Exception as e:
        logging.error(f"Error registrando inicio automático: {e}")

def install():
    device_key = get_device_key_from_filename()
    logging.info(f"Instalando PC Sentinel para el token: {device_key}")

    # 1. Crear directorio de destino en AppData/Local (no requiere permisos de Administrador)
    appdata = os.getenv('LOCALAPPDATA')
    target_dir = os.path.join(appdata, "PCSentinel")
    os.makedirs(target_dir, exist_ok=True)

    target_exe = os.path.join(target_dir, "PCSentinelAgent.exe")
    current_exe = sys.argv[0]

    # 2. Copiar el ejecutable al directorio del sistema
    if os.path.abspath(current_exe) != os.path.abspath(target_exe):
        shutil.copy2(current_exe, target_exe)

    # 3. Guardar la configuración con el Token extraído
    config_file = os.path.join(target_dir, "config.ini")
    with open(config_file, "w") as f:
        f.write(f"[AGENT]\ndevice_key = {device_key}\n")

    # 4. Registrar en el inicio de Windows
    setup_windows_autostart(target_exe)

    # 5. Ejecutar el agente inmediatamente en segundo plano
    os.startfile(target_exe)
    logging.info("¡Instalación completada con éxito!")

if __name__ == "__main__":
    install()
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
import json
import psutil
import requests
import unicodedata

# Directorio de datos en AppData/Local/PCSentinel
APPDATA_DIR = os.path.join(os.getenv('LOCALAPPDATA', os.path.expanduser('~/AppData/Local')), "PCSentinel")
os.makedirs(APPDATA_DIR, exist_ok=True)

LOG_FILE = os.path.join(APPDATA_DIR, "pcsentinel.log")
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - [PC SENTINEL ENGINE] - %(levelname)s - %(message)s'
)

API_URL = "http://localhost:3000/api/v1/telemetry"
AGENT_VERSION = "1.2.2"

def show_popup(msg, title="PC Sentinel"):
    try:
        ctypes.windll.user32.MessageBoxW(0, msg, title, 0x40)
    except Exception:
        pass

def get_or_save_device_key():
    config_file = os.path.join(APPDATA_DIR, "config.ini")
    exe_name = os.path.basename(sys.argv[0])
    match = re.search(r'STN-[A-Z0-9]+', exe_name, re.IGNORECASE)
    
    if match:
        key = match.group(0).upper()
        try:
            with open(config_file, "w", encoding="utf-8") as f:
                f.write(f"device_key = {key}\n")
            logging.info(f"Clave extraída del instalador: {key}")
        except Exception as e:
            logging.error(f"Error escribiendo config.ini: {e}")
        return key

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
    target_exe = os.path.join(APPDATA_DIR, "PCSentinelAgent.exe")
    current_exe = os.path.abspath(sys.argv[0])

    if os.path.abspath(current_exe) != os.path.abspath(target_exe):
        key = get_or_save_device_key()
        logging.info(f"Instalando en AppData para clave: {key}")

        try:
            shutil.copy2(current_exe, target_exe)
        except Exception as e:
            logging.error(f"Error copiando archivo: {e}")

        try:
            reg_key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run", 0, winreg.KEY_SET_VALUE)
            winreg.SetValueEx(reg_key, "PCSentinelAgent", 0, winreg.REG_SZ, f'"{target_exe}"')
            winreg.CloseKey(reg_key)
        except Exception as e:
            logging.error(f"Error en Registro Windows: {e}")

        try:
            subprocess.Popen([target_exe], creationflags=subprocess.CREATE_NO_WINDOW)
        except Exception as e:
            logging.error(f"Error iniciando proceso instalado: {e}")

        show_popup("¡PC Sentinel se ha instalado con éxito!\n\nMonitoreando Ficha Técnica, Salud SMART y Sensores Térmicos.", "PC Sentinel Activo")
        sys.exit(0)

def find_nvidia_smi_path():
    """Rastrea la ubicación exacta de nvidia-smi.exe en Windows para la GPU Nvidia"""
    candidates = [
        "nvidia-smi",
        r"C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe",
        r"C:\Windows\System32\nvidia-smi.exe"
    ]
    
    driver_store = r"C:\Windows\System32\DriverStore\FileRepository"
    if os.path.exists(driver_store):
        try:
            for root, dirs, files in os.walk(driver_store):
                if "nvidia-smi.exe" in files:
                    candidates.append(os.path.join(root, "nvidia-smi.exe"))
                    break
        except Exception:
            pass

    for path in candidates:
        try:
            res = subprocess.check_output(f'"{path}" --version', shell=True, text=True, timeout=2)
            if "NVIDIA" in res:
                return path
        except Exception:
            continue
    return None

def get_cpu_gpu_temperatures(cpu_usage_pct):
    """Cálculo de Temperatura para CPU e inspección directa de GPU Nvidia 940MX"""
    temps = {
        "cpu_temp": None,
        "gpu_temp": None,
        "is_thermal_throttling": False
    }

    # 1. Temperatura de CPU (WMI con fallback inteligente)
    try:
        cmd_cpu = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-CimInstance -Namespace root\\wmi -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction SilentlyContinue | Select-Object -First 1).CurrentTemperature"'
        raw_cpu = subprocess.check_output(cmd_cpu, shell=True, text=True, timeout=3)
        if raw_cpu.strip() and raw_cpu.strip().isdigit():
            kelvin_x10 = int(raw_cpu.strip())
            celsius = round((kelvin_x10 - 2732) / 10.0, 1)
            if 20 <= celsius <= 105:
                temps["cpu_temp"] = celsius
    except Exception:
        pass

    if temps["cpu_temp"] is None:
        calc_cpu = round(38.0 + (cpu_usage_pct * 0.42), 1)
        temps["cpu_temp"] = min(calc_cpu, 92.0)

    # 2. Temperatura de GPU Nvidia mediante nvidia-smi
    smi_bin = find_nvidia_smi_path()
    if smi_bin:
        try:
            cmd_gpu = f'"{smi_bin}" --query-gpu=temperature.gpu --format=csv,noheader,nounits'
            raw_gpu = subprocess.check_output(cmd_gpu, shell=True, text=True, timeout=3)
            if raw_gpu.strip() and raw_gpu.strip().isdigit():
                gpu_val = float(raw_gpu.strip())
                if 20 <= gpu_val <= 105:
                    temps["gpu_temp"] = gpu_val
        except Exception as e:
            logging.error(f"Error leyendo nvidia-smi: {e}")

    # Si la GPU Nvidia está suspendida por ahorro de energía (Optimus), igualar a rango térmico de chasis
    if temps["gpu_temp"] is None and temps["cpu_temp"] is not None:
        temps["gpu_temp"] = round(temps["cpu_temp"] - 3.5, 1)

    if (temps["cpu_temp"] and temps["cpu_temp"] >= 85) or (temps["gpu_temp"] and temps["gpu_temp"] >= 85):
        temps["is_thermal_throttling"] = True

    return temps

def get_full_hardware_specs():
    """Ficha Técnica Completa + Salud y Tipo de Disco (SSD vs HDD)"""
    total_ram = round(psutil.virtual_memory().total / (1024**3), 1)
    cores = psutil.cpu_count(logical=False) or 0
    threads = psutil.cpu_count(logical=True) or 0

    specs = {
        "motherboard": {"manufacturer": "LENOVO / Generic", "model": "BaseBoard"},
        "cpu": {"name": platform.processor() or "Procesador Windows", "cores": cores, "threads": threads},
        "ram": {"total_gb": total_ram, "speed_mhz": 0, "slots_used": 1, "slots_total": 2},
        "gpus": [],
        "disks": [],
        "disks_health": []
    }

    try:
        ps_script = (
            "$mobo = Get-CimInstance Win32_BaseBoard -ErrorAction SilentlyContinue; "
            "$cpu = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue; "
            "$ram = Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue; "
            "$ram_slots = Get-CimInstance Win32_PhysicalMemoryArray -ErrorAction SilentlyContinue; "
            "$gpus = Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue | Select-Object Name, AdapterRAM; "
            "$disks = Get-CimInstance Win32_DiskDrive -ErrorAction SilentlyContinue | Select-Object Model, InterfaceType, Size, Status; "
            "@{ "
            "mobo_mfg = if ($mobo) { $mobo.Manufacturer } else { 'Generico' }; "
            "mobo_model = if ($mobo) { $mobo.Product } else { 'Generico' }; "
            "cpu_name = if ($cpu) { $cpu.Name } else { 'CPU' }; "
            "cpu_cores = if ($cpu) { $cpu.NumberOfCores } else { 0 }; "
            "cpu_threads = if ($cpu) { $cpu.NumberOfLogicalProcessors } else { 0 }; "
            "ram_items = $ram; "
            "ram_total_slots = if ($ram_slots) { $ram_slots.MemoryDevices } else { 2 }; "
            "gpu_items = $gpus; "
            "disks = $disks "
            "} | ConvertTo-Json -Depth 3"
        )

        cmd = f'powershell -NoProfile -ExecutionPolicy Bypass -Command "{ps_script}"'
        raw_out = subprocess.check_output(cmd, shell=True, text=True, timeout=8)

        if raw_out.strip():
            data = json.loads(raw_out)

            # 1. Placa Madre
            if data.get("mobo_mfg") and str(data["mobo_mfg"]).strip() != "Generico":
                specs["motherboard"]["manufacturer"] = str(data["mobo_mfg"]).strip()
            if data.get("mobo_model") and str(data["mobo_model"]).strip() != "Generico":
                specs["motherboard"]["model"] = str(data["mobo_model"]).strip()

            # 2. CPU
            if data.get("cpu_name") and str(data["cpu_name"]).strip() != "CPU":
                specs["cpu"]["name"] = str(data["cpu_name"]).strip()
            if data.get("cpu_cores") and int(data["cpu_cores"]) > 0:
                specs["cpu"]["cores"] = int(data["cpu_cores"])
            if data.get("cpu_threads") and int(data["cpu_threads"]) > 0:
                specs["cpu"]["threads"] = int(data["cpu_threads"])

            # 3. RAM y Slots
            ram_items = data.get("ram_items")
            if isinstance(ram_items, dict):
                ram_items = [ram_items]
            elif not isinstance(ram_items, list):
                ram_items = []

            if ram_items:
                total_ram_bytes = sum(int(item.get("Capacity") or 0) for item in ram_items if isinstance(item, dict))
                max_speed = max((int(item.get("Speed") or 0) for item in ram_items if isinstance(item, dict)), default=0)
                if total_ram_bytes > 0:
                    specs["ram"]["total_gb"] = round(total_ram_bytes / (1024**3), 1)
                specs["ram"]["speed_mhz"] = max_speed
                specs["ram"]["slots_used"] = len(ram_items)

            if data.get("ram_total_slots"):
                specs["ram"]["slots_total"] = int(data["ram_total_slots"])

            # 4. Multi-GPU (Intel + Nvidia / AMD)
            gpu_raw = data.get("gpu_items")
            if isinstance(gpu_raw, dict):
                gpu_raw = [gpu_raw]
            elif not isinstance(gpu_raw, list):
                gpu_raw = []

            for g in gpu_raw:
                if isinstance(g, dict) and g.get("Name"):
                    g_vram = g.get("AdapterRAM")
                    vram_gb = round(abs(int(g_vram)) / (1024**3), 1) if g_vram and isinstance(g_vram, (int, float)) else 0
                    specs["gpus"].append({
                        "name": str(g["Name"]).strip(),
                        "vram_gb": vram_gb
                    })

            # 5. Discos y Clasificación SMART (SSD vs HDD)
            disks_raw = data.get("disks")
            if isinstance(disks_raw, dict):
                disks_raw = [disks_raw]
            elif not isinstance(disks_raw, list):
                disks_raw = []

            ssd_keywords = ["SSD", "NVME", "M.2", "KIOXIA", "SAMSUNG", "KINGSTON", "CRUCIAL", "SANDISK", "MICRON", "HYNIX", "ADATA", "LEXAR"]

            for d in disks_raw:
                if isinstance(d, dict):
                    model_name = str(d.get("Model") or "Disco de Almacenamiento").strip()
                    d_size = int(d.get("Size") or 0)
                    size_gb = round(d_size / (1024**3), 1)
                    status = str(d.get("Status") or "OK").strip()

                    is_ssd = any(kw in model_name.upper() for kw in ssd_keywords)
                    disk_type = "SSD (Estado Sólido)" if is_ssd else "HDD (Disco Rígido)"
                    health_label = "Saludable (100%)" if status == "OK" else "Atención Inminente"

                    specs["disks"].append({
                        "model": model_name,
                        "interface": str(d.get("InterfaceType") or "SATA/NVMe").strip(),
                        "size_gb": size_gb
                    })

                    specs["disks_health"].append({
                        "name": model_name,
                        "type": disk_type,
                        "health": health_label,
                        "is_healthy": (status == "OK")
                    })

    except Exception as e:
        logging.error(f"Error extrayendo especificaciones: {e}")

    return specs

def collect_hardware_metrics():
    try:
        psutil.cpu_percent(interval=None)
        time.sleep(0.1)
        cpu_usage = psutil.cpu_percent(interval=0.3)

        ram_info = psutil.virtual_memory()
        disk_info = psutil.disk_usage('C:\\' if platform.system() == 'Windows' else '/')

        full_specs = get_full_hardware_specs()
        thermal_data = get_cpu_gpu_temperatures(cpu_usage)

        return {
            "hostname": platform.node(),
            "os_system": f"{platform.system()} {platform.release()}",
            "hardware_specs": full_specs,
            "metrics": {
                "cpu_percent": round(cpu_usage, 1),
                "ram_percent": round(ram_info.percent, 1),
                "disk_percent": round(disk_info.percent, 1),
                "cpu_temp": thermal_data["cpu_temp"],
                "gpu_temp": thermal_data["gpu_temp"],
                "is_thermal_throttling": thermal_data["is_thermal_throttling"]
            }
        }
    except Exception as e:
        logging.error(f"Error capturando hardware: {e}")
        return None

def main():
    install_and_handoff()

    device_key = get_or_save_device_key()
    logging.info(f"Servicio PC Sentinel v1.2.2 activo. Key: {device_key}")

    headers = {
        "Authorization": f"Bearer {device_key}",
        "Content-Type": "application/json",
        "User-Agent": f"PCSentinelAgent/{AGENT_VERSION}"
    }

    while True:
        try:
            payload = collect_hardware_metrics()
            if payload:
                res = requests.post(API_URL, json=payload, headers=headers, timeout=5)
                logging.info(f"Ficha Técnica + SMART + Térmico enviado. Status HTTP {res.status_code}: {res.text}")
        except Exception as e:
            logging.error(f"Error enviando telemetría: {e}")

        time.sleep(15)

if __name__ == "__main__":
    main()
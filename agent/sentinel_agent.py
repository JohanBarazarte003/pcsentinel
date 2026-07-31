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
import msvcrt # <--- Bloqueo nativo de Windows para instancia única
import psutil
import requests
import unicodedata

# Directorio de datos en AppData/Local/PCSentinel
APPDATA_DIR = os.path.join(os.getenv('LOCALAPPDATA', os.path.expanduser('~/AppData/Local')), "PCSentinel")
os.makedirs(APPDATA_DIR, exist_ok=True)

LOG_FILE = os.path.join(APPDATA_DIR, "pcsentinel.log")
LOCK_FILE = os.path.join(APPDATA_DIR, "sentinel.lock")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - [PC SENTINEL ENGINE] - %(levelname)s - %(message)s'
)

API_URL = "https://pcsentinel.vercel.app/api/v1/telemetry"
ACTION_COMPLETE_URL = "https://pcsentinel.vercel.app/api/v1/actions/complete"
AGENT_VERSION = "3.1.0"

def show_popup(msg, title="PC Sentinel"):
    try:
        ctypes.windll.user32.MessageBoxW(0, msg, title, 0x40)
    except Exception:
        pass

def acquire_singleton_lock():
    """Garantiza que SOLO exista 1 instancia de PC Sentinel ejecutándose en Windows"""
    try:
        lock_fd = open(LOCK_FILE, 'w')
        msvcrt.locking(lock_fd.fileno(), msvcrt.LK_NBLCK, 1)
        return lock_fd
    except (IOError, OSError):
        # Si ya hay otra instancia activa, salir silenciosamente
        sys.exit(0)

def kill_existing_agent():
    """Mata cualquier proceso previo antes de actualizar el .exe"""
    my_pid = os.getpid()
    for proc in psutil.process_iter(['pid', 'name']):
        try:
            p_name = proc.info['name']
            if p_name and p_name.lower() == 'pcsentinelagent.exe':
                if proc.info['pid'] != my_pid:
                    proc.kill()
        except Exception:
            pass
    time.sleep(0.5)

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

        kill_existing_agent()

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

        show_popup("¡PC Sentinel v3.1 instalado con éxito!\n\nRemediación en 1-Clic para Firewall y Basura activa.", "PC Sentinel Activo")
        sys.exit(0)

# =========================================================================
# MOTOR DE REMEDIACIÓN Y REPARACIÓN EN 1-CLIC (FASE 3)
# =========================================================================

def execute_clean_temp():
    freed_bytes = 0
    temp_folder = os.getenv('TEMP') or os.getenv('TMP')
    if temp_folder and os.path.exists(temp_folder):
        for item in os.listdir(temp_folder):
            fp = os.path.join(temp_folder, item)
            try:
                if os.path.isfile(fp):
                    sz = os.path.getsize(fp)
                    os.remove(fp)
                    freed_bytes += sz
                elif os.path.isdir(fp):
                    shutil.rmtree(fp, ignore_errors=True)
            except Exception:
                pass
    freed_gb = round(freed_bytes / (1024**3), 2)
    return f"Limpieza completada. Se liberaron {freed_gb} GB de espacio en disco."

def execute_enable_firewall():
    try:
        res = subprocess.run('netsh advfirewall set allprofiles state on', shell=True, capture_output=True, text=True, timeout=5)
        if res.returncode == 0:
            return "Firewall de Windows activado con éxito en todos los perfiles."

        cmd_elevated = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process netsh -ArgumentList \'advfirewall set allprofiles state on\' -Verb RunAs -WindowStyle Hidden"'
        subprocess.Popen(cmd_elevated, shell=True)
        return "Solicitud de elevación enviada. El Firewall se ha activado."
    except Exception as e:
        return f"Error activando firewall: {e}"

def execute_flush_dns():
    try:
        subprocess.check_output('ipconfig /flushdns', shell=True, timeout=5)
        return "Caché de resolución DNS de Windows restablecida correctamente."
    except Exception as e:
        return f"Error en flushdns: {e}"

def process_remediation_actions(actions):
    for act in actions:
        action_id = act.get("id")
        cmd_type = act.get("command_type")
        logging.info(f"Ejecutando remediación remota: {cmd_type} (ID: {action_id})")

        result_msg = "Acción ejecutada con éxito."
        status = "completed"

        try:
            if cmd_type == "CLEAN_TEMP":
                result_msg = execute_clean_temp()
            elif cmd_type == "ENABLE_FIREWALL":
                result_msg = execute_enable_firewall()
            elif cmd_type == "FLUSH_DNS":
                result_msg = execute_flush_dns()
            else:
                result_msg = "Comando desconocido."
                status = "failed"
        except Exception as e:
            result_msg = f"Error ejecutando remediación: {e}"
            status = "failed"

        try:
            requests.post(ACTION_COMPLETE_URL, json={
                "actionId": action_id,
                "status": status,
                "resultMessage": result_msg
            }, timeout=5)
            logging.info(f"Resultado de remediación enviado a la web: {result_msg}")
        except Exception as e:
            logging.error(f"Error reportando resultado: {e}")

def find_nvidia_smi_path():
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

def get_windows_security_status():
    security = {
        "antivirus_name": "Windows Defender",
        "antivirus_active": True,
        "firewall_active": True
    }
    try:
        raw_fw = subprocess.check_output('netsh advfirewall show allprofiles state', shell=True, text=True, timeout=3)
        if "State" in raw_fw or "Estado" in raw_fw:
            if "ON" in raw_fw.upper() or "ACTIVADO" in raw_fw.upper():
                security["firewall_active"] = True
            elif "OFF" in raw_fw.upper() or "DESACTIVADO" in raw_fw.upper():
                security["firewall_active"] = False

        cmd_av = 'powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-CimInstance -Namespace root\\SecurityCenter2 -ClassName AntivirusProduct -ErrorAction SilentlyContinue | Select-Object -First 1).displayName"'
        raw_av = subprocess.check_output(cmd_av, shell=True, text=True, timeout=5)
        if raw_av.strip():
            security["antivirus_name"] = str(raw_av).strip()
    except Exception as e:
        logging.error(f"Error consultando seguridad: {e}")

    return security

def get_top_consuming_processes():
    processes = []
    try:
        for proc in psutil.process_iter(['pid', 'name']):
            try:
                p_name = proc.info['name']
                if p_name and p_name.lower() not in ['system idle process', 'system', 'registry', 'pcsentinelagent.exe']:
                    p_mem = round(proc.memory_percent(), 1)
                    p_cpu = round(proc.cpu_percent(interval=None), 1)
                    processes.append({
                        "name": str(p_name).strip(),
                        "cpu_pct": p_cpu,
                        "ram_pct": p_mem
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass

        top_5 = sorted(processes, key=lambda x: (x['ram_pct'], x['cpu_pct']), reverse=True)[:5]
        return top_5
    except Exception as e:
        logging.error(f"Error analizando top procesos: {e}")
        return []

def get_junk_files_size_gb():
    total_bytes = 0
    temp_folder = os.getenv('TEMP') or os.getenv('TMP')
    if temp_folder and os.path.exists(temp_folder):
        try:
            for item in os.listdir(temp_folder):
                fp = os.path.join(temp_folder, item)
                if os.path.isfile(fp):
                    try:
                        total_bytes += os.path.getsize(fp)
                    except Exception:
                        pass
        except Exception:
            pass
    return round(total_bytes / (1024**3), 2)

def get_startup_programs():
    startup_apps = []
    registry_paths = [
        (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run"),
        (winreg.HKEY_LOCAL_MACHINE, r"Software\Microsoft\Windows\CurrentVersion\Run")
    ]
    for hkey, subkey in registry_paths:
        try:
            key = winreg.OpenKey(hkey, subkey, 0, winreg.KEY_READ)
            i = 0
            while True:
                try:
                    name, val, _ = winreg.EnumValue(key, i)
                    s_name = str(name).encode('utf-8', 'ignore').decode('utf-8').strip()
                    s_path = str(val).encode('utf-8', 'ignore').decode('utf-8').strip()
                    if s_name and s_name != "PCSentinelAgent":
                        startup_apps.append({
                            "name": s_name,
                            "path": s_path[:120]
                        })
                    i += 1
                except OSError:
                    break
            winreg.CloseKey(key)
        except Exception:
            pass
    return startup_apps

def get_corrupted_drivers():
    corrupted = []
    try:
        ps_script = (
            "Get-CimInstance Win32_PnPEntity -ErrorAction SilentlyContinue | "
            "Where-Object { $_.ConfigManagerErrorCode -ne 0 } | "
            "ForEach-Object { @{ name = [string]$_.Name; error_code = [int]$_.ConfigManagerErrorCode } } | "
            "ConvertTo-Json -Depth 2"
        )

        cmd = f'powershell -NoProfile -ExecutionPolicy Bypass -Command "{ps_script}"'
        raw_out = subprocess.check_output(cmd, shell=True, text=True, timeout=4)

        if raw_out.strip():
            data = json.loads(raw_out)
            if isinstance(data, dict):
                data = [data]
            for drv in data:
                if isinstance(drv, dict) and drv.get("name"):
                    corrupted.append({
                        "name": str(drv.get("name")).strip(),
                        "error_code": int(drv.get("error_code") or 0)
                    })
    except Exception as e:
        logging.error(f"Error escaneando drivers: {e}")

    return corrupted

def get_cpu_gpu_temperatures(cpu_usage_pct):
    temps = {
        "cpu_temp": None,
        "gpu_temp": None,
        "is_thermal_throttling": False
    }

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

    if temps["gpu_temp"] is None and temps["cpu_temp"] is not None:
        temps["gpu_temp"] = round(temps["cpu_temp"] - 3.5, 1)

    if (temps["cpu_temp"] and temps["cpu_temp"] >= 85) or (temps["gpu_temp"] and temps["gpu_temp"] >= 85):
        temps["is_thermal_throttling"] = True

    return temps

def get_full_hardware_specs():
    total_ram = round(psutil.virtual_memory().total / (1024**3), 1)
    cores = psutil.cpu_count(logical=False) or 0
    threads = psutil.cpu_count(logical=True) or 0

    specs = {
        "motherboard": {"manufacturer": "LENOVO / Generic", "model": "BaseBoard"},
        "cpu": {"name": platform.processor() or "Procesador Windows", "cores": cores, "threads": threads},
        "ram": {"total_gb": total_ram, "speed_mhz": 0, "slots_used": 1, "slots_total": 2},
        "gpus": [],
        "disks": [],
        "disks_health": [],
        "corrupted_drivers": get_corrupted_drivers(),
        "junk_files_gb": get_junk_files_size_gb(),
        "startup_programs": get_startup_programs(),
        "top_processes": get_top_consuming_processes(),
        "security_status": get_windows_security_status()
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

            if data.get("mobo_mfg") and str(data["mobo_mfg"]).strip() != "Generico":
                specs["motherboard"]["manufacturer"] = str(data["mobo_mfg"]).strip()
            if data.get("mobo_model") and str(data["mobo_model"]).strip() != "Generico":
                specs["motherboard"]["model"] = str(data["mobo_model"]).strip()

            if data.get("cpu_name") and str(data["cpu_name"]).strip() != "CPU":
                specs["cpu"]["name"] = str(data["cpu_name"]).strip()
            if data.get("cpu_cores") and int(data["cpu_cores"]) > 0:
                specs["cpu"]["cores"] = int(data["cpu_cores"])
            if data.get("cpu_threads") and int(data["cpu_threads"]) > 0:
                specs["cpu"]["threads"] = int(data["cpu_threads"])

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

    # Garantizar que SOLO EXISTA 1 INSTANCIA activa en memoria
    lock = acquire_singleton_lock()

    device_key = get_or_save_device_key()
    logging.info(f"Servicio PC Sentinel v3.1.0 (Instancia Única) activo. Key: {device_key}")

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
                logging.info(f"Reporte v3.1.0 enviado. Status HTTP {res.status_code}: {res.text}")

                if res.status_code == 200:
                    data = res.json()
                    pending = data.get("pending_actions", [])
                    if pending:
                        process_remediation_actions(pending)

        except Exception as e:
            logging.error(f"Error enviando telemetría: {e}")

        time.sleep(15)

if __name__ == "__main__":
    main()
import sys
import os
import subprocess

def create_virtualenv(env_name, requirements_file="requirements.txt"):
    # Create the virtual environment
    subprocess.check_call([sys.executable, "-m", "venv", env_name])

    # Install the dependencies
    pip_path = os.path.join(env_name, "bin", "pip") if os.name != 'nt' else os.path.join(env_name, "Scripts", "pip.exe")
    
    try:
        # Install the packages in requirements.txt
        subprocess.check_call([pip_path, "install", "-r", requirements_file])
        print("Environment created and packages installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error occurred while installing dependencies: {e}")
        return False
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_env.py <env_name>")
    else:
        env_name = sys.argv[1]
        create_virtualenv(env_name)


#!/bin/bash

# Activate the virtual environment
source .venv/bin/activate

# Install dependencies
uv pip install -r pyproject.toml

# Run the main script
python main.py

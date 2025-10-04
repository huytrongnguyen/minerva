import json

def load_from_file(file_path: str) -> dict[str, any]:
    data = {}
    with open(file_path, 'r') as json_file:
        data = json.load(json_file)
    return data
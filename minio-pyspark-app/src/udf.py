import json

from typing import Any
from xml.etree import ElementTree

def deserialize_xml(xml_string) -> str:
  try:
    xml_dict = xmlstring_to_dict(xml_string)
    return json.dumps(xml_dict) if xml_dict is not None else None
  except:
    return None
  
def xmlstring_to_dict(xml_string: str) -> dict[str, Any]:
  root = ElementTree.fromstring(xml_string)
  return xmlelement_to_dict(root)
  
def xmlelement_to_dict(node) -> dict[str, Any]:
  try:
    result = {}
    for child in node:
      field_name = child.tag

      if len(child) > 0:
        if field_name not in result: result[field_name] = []
        result[field_name].append(xmlelement_to_dict(child))
      else:
        if field_name not in result:
          result[field_name] = child.text.strip() if child.text is not None else None
        else:
          result[field_name] = [result[field_name]]
          result[field_name].append(child.text.strip() if child.text is not None else None)
    return result
  except:
    return None
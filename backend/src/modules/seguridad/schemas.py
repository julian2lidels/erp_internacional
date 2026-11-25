from pydantic import BaseModel, Field
from typing import List

class ModuloCreate(BaseModel):
    nombre: str = Field(..., max_length=50)

class AsignarModulosRequest(BaseModel):
    id_rol: int
    modulos_ids: List[int]

class UsuarioCreate(BaseModel):
    nombre: str = Field(..., max_length=100)
    email: str = Field(..., max_length=120)
    password: str = Field(..., min_length=6)
    id_rol: int
    id_sucursal: int
    idioma: str = Field(default="es", max_length=2)

class UsuarioUpdateEstado(BaseModel):
    activo: bool

class LoginRequest(BaseModel):
    email: str
    password: str

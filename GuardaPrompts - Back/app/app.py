from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import conectar_bd

class CajaConPrompts(BaseModel):
    nombre: str
    prompts: list[str]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/prompts")
def guardar_prompt(datos: CajaConPrompts):
    conexion = conectar_bd()
    cursor = conexion.cursor()

    try: 
        consultar_caja = "INSERT INTO Cajas (nombre) VALUES (%s)"
        cursor.execute(consultar_caja, (datos.nombre,))

        id_caja = cursor.lastrowid

        for prompt in datos.prompts:
            consultar_prompt = """
                INSERT INTO Prompts (prompt, id_caja)
                VALUES(%s, %s)
            """
            cursor.execute(consultar_prompt, (prompt, id_caja))
        conexion.commit()

        return {
            "mensaje": "Caja y prompts guardados correctamente",
            "id_caja": id_caja,
            "cantidad_prompts": len(datos.prompts)
        }
    except Exception: 
        conexion.rollback()
        raise

    finally: 
        cursor.close()
        conexion.close()

@app.get("/cajas")
def obtener_cajas():
    conexion = conectar_bd()
    cursor = conexion.cursor(dictionary=True)

    try:
        consulta = """SELECT Cajas.id_caja, Cajas.nombre, Prompts.id_prompt, Prompts.prompt FROM Cajas LEFT JOIN Prompts ON Cajas.id_caja = Prompts.id_caja
        ORDER BY Cajas.id_caja, Prompts.id_prompt
        """

        cursor.execute(consulta)
        resultados = cursor.fetchall()

        cajas = {}

        for fila in resultados:
            id_caja = fila["id_caja"]

            if id_caja not in cajas:
                cajas[id_caja] = {
                    "id_caja": id_caja,
                    "nombre": fila["nombre"],
                    "prompts": []
                }

            if fila["id_prompt"] is not None:
                cajas[id_caja]["prompts"].append({
                    "id_prompt": fila["id_prompt"],
                    "prompt": fila["prompt"]
                })

        return {
            "cantidad_cajas": len(cajas),
            "cajas": list(cajas.values())
        }

    finally:
        cursor.close()
        conexion.close()

@app.delete("/prompts/{id_prompt}")
def eliminar_prompt(id_prompt: int):
    conexion = conectar_bd()
    cursor = conexion.cursor()

    try:
        consulta = """
            DELETE FROM Prompts
            WHERE id_prompt = %s
        """

        cursor.execute(consulta, (id_prompt,))

        if cursor.rowcount == 0:
            return {
                "mensaje": "No se encontró el prompt",
                "id_prompt": id_prompt
            }

        conexion.commit()

        return {
            "mensaje": "Prompt eliminado correctamente",
            "id_prompt": id_prompt
        }

    except Exception:
        conexion.rollback()
        raise

    finally:
        cursor.close()
        conexion.close()

@app.delete("/cajas/{id_caja}")
def eliminar_caja(id_caja: int):
    conexion = conectar_bd()
    cursor = conexion.cursor()

    try:
        consulta_verificar = """
            SELECT id_caja
            FROM Cajas
            WHERE id_caja = %s
        """
        cursor.execute(consulta_verificar, (id_caja,))
        caja = cursor.fetchone()

        if caja is None:
            return {
                "mensaje": "No se encontró la caja",
                "id_caja": id_caja
            }

        consulta_prompts = """
            DELETE FROM Prompts
            WHERE id_caja = %s
        """
        cursor.execute(consulta_prompts, (id_caja,))

        consulta_caja = """
            DELETE FROM Cajas
            WHERE id_caja = %s
        """
        cursor.execute(consulta_caja, (id_caja,))

        conexion.commit()

        return {
            "mensaje": "Caja y sus prompts eliminados correctamente",
            "id_caja": id_caja
        }

    except Exception:
        conexion.rollback()
        raise

    finally:
        cursor.close()
        conexion.close()

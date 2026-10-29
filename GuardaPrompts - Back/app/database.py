import mysql.connector

def conectar_bd():
    conexion =  mysql.connector.connect(
        host="",
        user="root",
        password="",
        database="guardaprompts"
    )
    return conexion

def probar_conexion():
    conexion = conectar_bd()

    if conexion.is_connected():
        print("Conexion a guardaprompts exitosa")

    conexion.close()
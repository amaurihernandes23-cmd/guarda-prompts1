import { useState } from 'react';

function FormularioDatos({ caja, setcaja}) {
    const [Datos, setDatos] = useState({
        datostemporales: [],
    });

    const [nuevoDato, setNuevoDato] = useState('');
    const [nombreCaja, setNombreCaja] = useState('');

    const agregarDato = () => {
        if (nuevoDato.trim() === '') {
            alert('Debes ingresar un dato');
            return;
        }

        setDatos({
            ...Datos,
            datostemporales: [
                ...Datos.datostemporales,
                nuevoDato.trim(),
            ],
        });

        setNuevoDato('');
    };

    const eliminarCaja = async (indiceEliminar) => {
        const cajaSeleccionada = caja.datos[indiceEliminar];

        if (!cajaSeleccionada.id_caja) {
            alert('No se encontró el identificador de la caja');
            return;
        }
    
        const confirmar = window.confirm(
            `¿Estás seguro de que deseas eliminar la caja "${cajaSeleccionada.nombre}" y todos sus prompts?`
        );
    
        if (!confirmar) {
            return;
        }
    
        try {
            const respuesta = await fetch(
                `http://127.0.0.1:8000/cajas/${cajaSeleccionada.id_caja}`,
                {
                    method: 'DELETE',
                }
            );
    
            const resultado = await respuesta.json();
    
            if (!respuesta.ok) {
                throw new Error(
                    resultado.detail || 'No se pudo eliminar la caja'
                );
            }
    
            setcaja({
                ...caja,
                datos: caja.datos.filter(
                    (_, indice) => indice !== indiceEliminar
                ),
            });
    
            alert('Caja eliminada correctamente');
    
        } catch (error) {
            console.error('Error al eliminar la caja:', error);
            alert('No se pudo eliminar la caja. Inténtalo nuevamente.');
        }
    };

    
    const guardarDatos = async () => {
        if (nombreCaja.trim() === '') {
            alert('Debes ingresar un nombre para la caja');
            return;
        }
    
        if (Datos.datostemporales.length === 0) {
            alert('Debes agregar al menos un prompt');
            return;
        }
    
        try {
            const respuesta = await fetch('http://127.0.0.1:8000/prompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: nombreCaja.trim(),
                    prompts: Datos.datostemporales,
                }),
            });
    
            const resultado = await respuesta.json();
    
            if (!respuesta.ok) {
                throw new Error(
                    resultado.detail || 'No se pudo guardar la caja'
                );
            }
    
            setcaja({
                ...caja,
                datos: [
                    ...caja.datos,
                    {
                        id_caja: resultado.id_caja,
                        nombre: nombreCaja.trim(),
                        datostemporales: [...Datos.datostemporales],
                    },
                ],
            });
    
            setDatos({
                datostemporales: [],
            });
    
            setNombreCaja('');
    
            alert('Caja y prompts guardados correctamente');
    
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('No se pudo conectar con el servidor o guardar los datos');
        }
    };


    return (
        <>
            <section>
                <div className="contenedor">
                    <div className="titulo">
                        <h1 className="textoTitulo">Guarda Prompts</h1>
                    </div>

                    <div className="datos">
                        <form>
                            <div className="input">
                                <div className="NuevaCaja">
                                    <input
                                        type="text"
                                        placeholder="Nombre de la nueva caja"
                                        value={nombreCaja}
                                        onChange={(e) => setNombreCaja(e.target.value)}
                                    />
                                    <button type="button" onClick={guardarDatos}>
                                        Nueva caja
                                    </button>
                                </div>

                                <h3>Dato</h3>
                                <div>
                                    <div className="lista">
                                        {[...Datos.datostemporales]
                                            .sort((a, b) =>
                                                a.localeCompare(b, 'es', {
                                                    numeric: true,
                                                    sensitivity: 'base',
                                                })
                                            )
                                            .map((dato, indice) => (
                                                <div className="curso" key={indice}>
                                                    <span>{dato}</span>
                                                </div>
                                            ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ingrese el dato a registrar"
                                        value={nuevoDato}
                                        onChange={(e) => setNuevoDato(e.target.value)}
                                    />
    
                                    <button type="button" onClick={agregarDato}>
                                        Guardar dato
                                    </button>
                                </div>
                            </div>

                            <div className="ListaCajas">
                                <h3>Cajas de datos</h3>

                                {caja.datos?.length > 0 ? (
                                    caja.datos.map((dato, indice) => (
                                        <div
                                            key={indice}
                                            className="experiencia"
                                        >
                                            <div className="encabezadoCaja">
                                                <h3>Caja {indice + 1}</h3>
                                    
                                                <button
                                                    type="button"
                                                    className="botonEliminar"
                                                    onClick={() => eliminarCaja(indice)}
                                                >
                                                    ELIMINAR
                                                </button>
                                            </div>
                                            <p>Datos:</p>
                                            <div>

                                                <ul>
                                                    {[...dato.datostemporales]
                                                        .sort((a, b) =>
                                                            a.localeCompare(b, 'es', {
                                                                numeric: true,
                                                                sensitivity: 'base',
                                                            })
                                                        )
                                                        .map((datoAgregado, i) => (
                                                            <li key={i}>
                                                                {datoAgregado}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay cajas con datos guardados</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default FormularioDatos;
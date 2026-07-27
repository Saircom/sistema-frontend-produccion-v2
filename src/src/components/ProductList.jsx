import React from 'react'
import { stock } from '../pages/Data'

function ProductList() {




    const dibujarModal = () => {
        return (
            <div className="row  row-cols-xxl-5 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1 g-4">
                {stock.map(item =>
                    <div className="col" key={item.id}>
                        <div className="card h-100">
                        <img src={
                              item.imagen
                                } className="card-img-top" alt="..." />
                            <div className="card-body">
                                <h3 className="card-title">{item.nombre}</h3>
                                <h6 className="card-title">{item.categoria}</h6>
                                <p>{item.descripcion}</p>
                                <p className="card-text">S/ {
                                    Number(item.precio).toFixed(2)

                                } </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {dibujarModal()}
        </>

    )
}

export default ProductList
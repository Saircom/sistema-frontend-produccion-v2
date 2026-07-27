import React from 'react';

function Accessdenied() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-danger">
                <i className="bi bi-lock-fill"></i> Acceso Denegado
              </h2>
              <p className="card-text">
                Lo siento, no tienes permisos para acceder a esta página.
              </p>
              <a href="/login" className="btn btn-primary">Ir al Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accessdenied;

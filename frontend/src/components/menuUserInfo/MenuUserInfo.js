import React, { useEffect, useRef } from "react";
import "./MenuUserInfo.css"

function MenuUserInfo() {

    const navRef = useRef(null);

    useEffect(() => {
        const nav = navRef.current;
        const abrir = document.querySelector("#abrir");
        const cerrar = document.querySelector("#cerrar");

        abrir.addEventListener("click", () => {
            nav.classList.add("visible");
        })

        cerrar.addEventListener("click", () => {
            nav.classList.remove("visible");
        })

        // Close the dropdown if the user clicks outside of it
        window.onclick = function (event) {
            if (!event.target.matches('.abrir-menu')) {
                nav.classList.remove('visible');
            }
        }
    }, []);

    return (
        <>
            <header>
                <button id="abrir" className="abrir-menu"><i className="bi bi-list"></i></button>
                <nav className="nav" id="nav" ref={navRef}>
                    <button className="cerrar-menu" id="cerrar"><i className="bi bi-x"></i></button>
                    <ul className="nav-list">
                        <li><a href="#">Inicio</a></li>
                        <li><a href="#">Quiénes somos</a></li>
                        <li><a href="#">Servicios</a></li>
                        <li><a href="#">Qué hacemos</a></li>
                        <li><a href="#">Contacto</a></li>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default MenuUserInfo

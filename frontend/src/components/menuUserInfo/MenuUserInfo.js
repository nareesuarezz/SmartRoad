import "./MenuUserInfo.css"

function MenuUserInfo() {

    function myFunction() {
        document.getElementById("myDropdown").classList.toggle("show");
    }

    // Close the dropdown if the user clicks outside of it
    window.onclick = function (event) {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }

    return (
        <>
            <div class="hamburger-menu">
                <input type="checkbox" id="menu__toggle" />
                <label for="menu__toggle" class="menu__icon">
                    <span></span>
                </label>
                <div class="menu__right">
                    <ul>
                        <li><a href="#">Inicio</a></li>
                        <li><a href="#">Acerca de</a></li>
                        <li><a href="#">Contacto</a></li>
                    </ul>
                </div>
            </div>

        </>
    )
}

export default MenuUserInfo
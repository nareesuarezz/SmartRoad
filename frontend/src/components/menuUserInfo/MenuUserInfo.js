import "./MenuUserInfo.css"
import { slide as Menu } from 'react-burger-menu';

function MenuUserInfo() {

    return (
        <>
            <Menu right>
                <a href="/">Home</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
            </Menu>

        </>
    )
}

export default MenuUserInfo
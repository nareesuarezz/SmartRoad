import { MenuFoldOutlined } from "@ant-design/icons"
import ProfilePicture from "../../components/profilePicture/profilePicture"
import MenuUserInfo from "../../components/menuUserInfo/MenuUserInfo.js"

function userProfile() {
    return (
        <>
            <header>
                <ProfilePicture></ProfilePicture>
                <MenuUserInfo></MenuUserInfo>
            </header>
            <body>
                <h1>USERNAME</h1>
                <p>Car Time = </p>
                <p>Bicycle Time = </p>
                <p>Car Km = </p>
                <p>Bicycle Km = </p>
                <p>Total Km = </p>
            </body>
        </>
    )
}

export default userProfile
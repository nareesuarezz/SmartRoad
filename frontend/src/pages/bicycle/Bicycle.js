import logoBicycle from '../../img/bike.png';
import './Bicycle.css'
import { ArrowLeftOutlined } from '@ant-design/icons';

function Bicycle() {

    const goBack = () => {
        window.location.href = "/home";
    }
    return (
        <>
            <div className='arrow' onClick={() => goBack()}><ArrowLeftOutlined /></div>
            <div className="bike-title">
                <h1>SmartRoad</h1>
            </div>
            <div className="logged">
                <h2>You are now logged as a...</h2>
            </div>

            <div className="bicycle-container">
                <div className="vehicle-box bicycle-box">
                    <img src={logoBicycle} alt="Logo de bicicleta" />
                </div>
                <p className='bicycle'>Bicycle</p>

                <h3 className='warn'>Now every car user will be warned in case that they are near you.</h3>
            </div>
        </>
    )
}

export default Bicycle;
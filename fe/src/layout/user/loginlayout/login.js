import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../header/header'

function loginForm({children}){

    return(
        <div>
            <Header/>
            {children}
        </div>
        
    );
}
export default loginForm;
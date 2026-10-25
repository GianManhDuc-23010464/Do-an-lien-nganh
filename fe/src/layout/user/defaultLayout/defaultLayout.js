import Headers from "../header/header";
import Footer from "../footer/footer"
import Chat from "../chat/chat"

function DefaultLayout({children}){
    return (
        <>
            <Headers/>
            {children}
            <Footer/>
            <Chat/>
        </>
    );
}

export default DefaultLayout;
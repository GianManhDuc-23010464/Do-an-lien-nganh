import {formatMoney} from '../../../services/money'
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useState, useEffect } from 'react'
import {getMethod, postMethod, postMethodPayload, uploadSingleFile, urlGlobal} from '../../../services/request';




var token = localStorage.getItem("token");
function Chat(){
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [client, setClient] = useState(null);
    const [itemChat, setItemChat] = useState([]);
  
    useEffect(() => {
        if(token == null){
            return;
        }
        const getMess= async() =>{
            var response = await getMethod('/api/chat/user/my-chat');
            if(response.status > 300){
                return;
            }
            var result = await response.json();
            
            setItemChat(result)
        };
        getMess();
          
        var userlc = localStorage.getItem("user")
        if(token == null){
            return;
        }
        var email = JSON.parse(userlc).email
        console.log("email connect: "+email);
        
        var url = urlGlobal();
        const sock = new SockJS(url+'/hello');
        const stompClient = new Client({
        webSocketFactory: () => sock,
        onConnect: () => {
            console.log("WebSocket connected successfully!");
            stompClient.subscribe('/users/queue/messages', (msg) => {
                appendRecivers(msg.body)
            });
        },
        connectHeaders: {
            username: email
        }
        });
        stompClient.activate();
        setClient(stompClient);
    
        return () => {
            stompClient.deactivate();
        };
      }, []);

    function toggleChat() {
        var chatBox = document.getElementById("chat-box");
        var btnopenchat = document.getElementById("btnopenchat");
        if (chatBox.style.display === "none" || chatBox.style.display === "") {
            chatBox.style.display = "block";
            chatBox.style.bottom = "20px";
            btnopenchat.style.display = 'none'
        }
        else {
            chatBox.style.display = "none";
            btnopenchat.style.display = ''
        }
    }

    function appendRecivers (message) {
        var cont = `<p class="adminchat">${message}</p>`
        document.getElementById('listchat').innerHTML += cont;
        var scroll_to_bottom = document.getElementById('scroll-to-bottom');
        scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
    }

    function append() {
        var tinhan = `<p class="mychat">${document.getElementById("contentmess").value}</p>`
        document.getElementById('listchat').innerHTML += tinhan;
        var scroll_to_bottom = document.getElementById('scroll-to-bottom');
        scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
        document.getElementById("contentmess").value = ''
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            var uls = new URL(document.URL)
          client.publish({
            destination: '/app/hello/',
            body: document.getElementById("contentmess").value,
          });
          append();
        }
    };
    

    return(
        <>
        {token &&(
            <div class="chat-container" id="btnchatbottom">
            <button class="chat-button" id="btnopenchat" onClick={()=>toggleChat()}><i class="fa fa-comment"></i> Chat với chúng tôi</button>
            <div id="chat-box" class="chat-box">
                <div class="chat-header">
                    <h3>Xin chào bạn!</h3>
                    <button class="close-btn" onClick={()=>toggleChat()}>X</button>
                </div>
                <div class="chat-body" id="scroll-to-bottom">
                    <div id="listchat">
                    {itemChat.map((item=>{
                        if(item.sender.authorities.name == "ROLE_USER"){
                            return <p class="mychat">{item.content}</p>
                        }
                        else{
                            return <p class="adminchat">{item.content}</p>
                        }
                    }))}
                    </div>
                </div>
                <div class="chat-footer">
                    <input onKeyDown={handleKeyDown} type="text" id="contentmess" placeholder="Nhập tin nhắn..." />
                    <button id="sendmess">Gửi</button>
                </div>
            </div>
        </div>
        )}
        </>
    );
}

export default Chat;
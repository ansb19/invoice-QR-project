import { CHAT_DAO } from "./chat_dao";
import { CHAT } from "../dtos/chat";

export class CHAT_SERVICE{
    constructor(){
        this.chat = new CHAT();
        this.chatdao = new CHAT_DAO();
    }

    //채팅방 만들기 - 송장 생성 시 초대와 함께 송장 생김이라는 메시지를 배달원이 보내는 것으로 시작
    async create_chatroom(Invoice_number, Sender_name, Receiver_name, Delivery_name){
        await this.chatdao.create_chatroom(Invoice_number, Sender_name, Receiver_name, Delivery_name);   
    }

    //채팅방 리스트 불러오기
    async load_chatroomlist(){
        // 세션에 저장된 name을 불러와서 db값과 비교하여 불러오기

    }

    //채팅방 입장
    async enter_chatroom(id){
        //1. 채팅방 유저와 세션 유저 이름이 같은지 비교
        //2. 채빙방 유저의 이름과 관련된 대화들 다 가져옴
    }

    //채팅 입력
    async send_message(){

    }

    //채팅 내역 불러오기
    async reload_message(Invoice_number, user_name, message, time){
        await this.chatdao.store_message(Invoice_number, user_name, message, time);
    }

    //채팅방 만들기, 채팅방 리스트 불러오기, 채팅방 입장, 채팅 입력, 채팅 불러오기

}

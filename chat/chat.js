export class CHAT{
    #invoice_number;
    #user_name;
    #message;
    #time;

    get invoice_number(){
        return this.#invoice_number;
    }

    set invoice_number(invoice_number){
        this.#invoice_number = invoice_number;
    }

    get user_name(){
        return this.#user_name;
    }

    set user_name(user_name){
        this.#user_name = user_name;
    }

    get message(){
        return this.#message;
    }

    set message(message){
        this.#message = message;
    }

    get time(){
        return this.#time;
    }

    set time(time){
        this.#time = time;
    }
}
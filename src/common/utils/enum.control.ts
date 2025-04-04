export enum UserType {
    KAKAO = "kakao",
    GOOGLE = "google",
}

export enum TTL_Time {
    LOGIN_WEB_TTL = 1000 * 60 * 30, //30분
    LOGIN_APP_TTL = 1000 * 60 * 60 * 24 * 30, //30분
    EMAIL_CERT_TTL = 1000 * 60 * 10,
    SMS_CERT_TTL = 1000 * 60 * 5,
    //세션 관련만 1000을 더 곱셈 해주어야함

    CACHE_TTL = 60 * 5, // 5분
    CHATBOT_TTL = 60 * 30, // 30분 
    Invoice_TTL = 60 * 60 * 24, // 1일
}

export enum Routers {
    invoice = "/invoice"
}

export interface Delivery_Driver {
    delivery_driver_name: string,
    delivery_driver_phone: string,
}


export enum Delivery_Status {
    ORDER = "주문 및 결제 완료", //결제만 완료된 상태 송장 취소가능,
    PREPARE = "준비 중", // 준비 중 ->> 이 부분 부터 송장 삭제 불가능,
    START = "배달 기사 배치 완료", // 배달 기사 배치
    DOING = "배달 중",
    COMPLETE = "배달 완료",
}

export enum Charge_Type {
    PREPAYMENT = "선불",
    AFTERPAYMENT = "착불",
}

export enum Invoice_User {
    DEIVERY = "배달기사",
    SENDER = "보내는사람",
    RECEIVER = "받는사람"

}
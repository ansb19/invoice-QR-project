export enum UserType {
    KAKAO = "kakao",
    GOOGLE = "google",
}

export enum TTL_Time {
    LOGIN_TTL = 1000 * 60 * 30,
    EMAIL_CERT_TTL = 1000 * 60 * 10,
    SMS_CERT_TTL = 1000 * 60 * 5,
}

export enum Routers {
    invoice = "/invoice"
}

export interface Delivery_Driver {
    delivery_driver_name: string,
    delivery_driver_phone: string,
}


export enum Delivery_Status {
    CHARGE = "결제 완료", //결제만 완료된 상태 송장 취소가능,
    PREPARE = "준비 중", // 준비 중 ->> 이 부분 부터 송장 삭제 불가능,
    BATCH = "배달 기사 배치 완료",
    START = "배달 시작 ", // 배달 기사 배치 포함 시켜버림
    DOING = "배달 중",
    COMPLETE = "배달 완료",
}

export enum Charge_Type {
    PREPAYMENT = "선불",
    AFTERPAYMENT = "착불",
}
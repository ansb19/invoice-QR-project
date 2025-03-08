// https://trace.cjlogistics.com/next/tracking.html?wblNo=363026391211
import axios, { AxiosInstance } from "axios";
import qs from "querystring";
import { Service } from "typedi";

// https://trace.cjlogistics.com/next/tracking.html?wblNo=363026391211

// 받는 데이터 정보
export interface DeliveryInfo {
    crgStDcd: string;
    empno: string;
    patnBranCd: string;
    branCd: string;
    rcvrClphno: string;
    wblNo: string; //송장 번호
    workHms: string; //처리 시각
    acprRlpDcd: string;
    repGoodsNm: string; //품목
    workDt: string; //처리일자
    procBranTelNo: string; // 처리점소 전화 번호
    sndrAddr: string; // 송화인 주소
    patnBranTelNo: string;
    rcvrAddr: string; // 수화인 주소
    acprNm: string; //인수자명 ??
    crgStDnm: string; //상품 상태
    sndrNm: string; //송화인 이름
    branNm: string; //처리점소
    sndrClphno: string;
    qty: string; // 수량
    crgStDcdVal: string; //상세
    goodsDtlNm: string;
    acprRlpDnm: string; //기타
    rcvrNm: string;
    patnBranNm: string; // 상대점소소
    empynm: string;
    latitude?: string;
    longitude?: string;
  }


const cjlogistics_api: AxiosInstance = axios.create({
    baseURL: "https://trace.cjlogistics.com",
    timeout: 5000,
    withCredentials: true,
})

@Service()
export class CJ_Delivery_Tracker {
    private headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async invoice_info(invoice_number: string): Promise<DeliveryInfo> {
        const data = qs.stringify({ wblNo: invoice_number });
        const response = await cjlogistics_api.post("/next/rest/selectTrackingWaybil.do", data, { headers: this.headers });

        return response.data.data;
    }

    async tracker_info(invoice_number: string): Promise<DeliveryInfo[]> {
        const data = qs.stringify({ wblNo: invoice_number });
        const response = await cjlogistics_api.post("/next/rest/selectTrackingDetailList.do", data, { headers: this.headers });

        return response.data.data.svcOutList;
    }

}

// const test = new CJ_Delivery_Tracker();


// test.invoice_info('595320445933').then( (result) => {console.log(result)});
// test.tracker_info('595320445933').then( (result) => {console.log(result)});
//595320445933
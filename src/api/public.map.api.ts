import { ExternalApiError } from "@/common/exceptions/app.error";
import { EnvConfig } from "@/config/env.config";
import axios, { AxiosInstance } from "axios";
import { Inject, Service } from "typedi";

const axiosPmap: AxiosInstance = axios.create({
    baseURL: "https://api.vworld.kr/req/address",
    timeout: 5000,
    withCredentials: true,
})

@Service()
export class PublicMapApi {
    private readonly api_key: string;

    constructor(@Inject(() => EnvConfig) private config: EnvConfig) {
        this.api_key = this.config.PUBLIC_MAP_API_KEY;

    }
    public async change_address_to_coordinate(address: string) {
        try {
            const response = await axiosPmap.get('', {
                params: {
                    service: "address",
                    request: "GetCoord",
                    version: "2.0",
                    crs: "EPSG:4326",
                    type: "ROAD",
                    address: address,
                    format: "json",
                    errorformat: "json",
                    key: `${this.api_key}`,
                }
            })

            return response.data;
        } catch (error) {
            throw new ExternalApiError("공공 데이터 맵맵 주소-> 좌표 변환 중 오류 발생");
        }
    }
}

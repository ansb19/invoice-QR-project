import { CJ_Delivery_Tracker, DeliveryInfo } from "@/api/cj_delivery_tracker";
import { Inject, Service } from "typedi";
import { CJ_TerminalRepository } from "../repository/cj_terminal.repository";
import { CJ_Terminal } from "../entities/cj_terminal.entity";
import { NotFoundError, ValidationError } from "@/common/exceptions/app.error";

import { PublicMapApi } from "@/api/public.map.api";
import QRCode from 'qrcode';
import { AWS_S3 } from "@/api/aws_s3";
import { AddressService } from "@/domains/user/services/address.service";
import { Invoice_TTL, Redis_Geo } from "./redis_geo.service";
import { Redis } from "@/common/services/redis.service";

/**
 * Description placeholder
 *
 * @export
 * @interface Coord
 * @typedef {Coord}
 */
export interface Coord {
    /**
 * Description placeholder
 *
 * @type {number}
 */
    latitude: number;
    /**
 * Description placeholder
 *
 * @type {number}
 */
    longitude: number;
    /**
 * Description placeholder
 *
 * @type {string}
 */
    address: string;
}



/**
 * Description placeholder
 *
 * @export
 * @class Delivery_Tracker
 * @typedef {Delivery_Tracker}
 */
@Service()
export class Delivery_Tracker {
    private CACHE_KEY = (user_id: number) => { return `cache:user:${user_id}:invoices` };
    private MAX_CACHE_SIZE = 10;
    /**
 * Creates an instance of Delivery_Tracker.
 *
 * @constructor
 * @param {CJ_Delivery_Tracker} cj_delivery 
 * @param {PublicMapApi} public_map 
 * @param {CJ_TerminalRepository} cj_terminal_repo 
 * @param {Redis_Geo} redis_geo 
 * @param {AWS_S3} aws_s3 
 * @param {AddressService} address_service 
 */
    constructor(@Inject(() => CJ_Delivery_Tracker) private cj_delivery: CJ_Delivery_Tracker,
        // @Inject(() => SmartDelivery) private smart_delivery: SmartDelivery,
        // @Inject(() => DeliveryTrackerApi) private delivery_tracker: DeliveryTrackerApi,
        @Inject(() => PublicMapApi) private public_map: PublicMapApi,
        @Inject(() => CJ_TerminalRepository) private cj_terminal_repo: CJ_TerminalRepository,
        @Inject(() => Redis_Geo) private redis_geo: Redis_Geo,
        @Inject(() => AWS_S3) private aws_s3: AWS_S3,
        @Inject(() => Redis) private redis: Redis,
    ) {

    }


    /**
     * Description placeholder
     * * CJ 송장의 정보를 가져옴
     * @async
     * @param {string} invoice_number 
     * @returns {Promise<DeliveryInfo>} 
     */
    async find_invoice(invoice_number: string): Promise<DeliveryInfo> {
        const cj_invoice = await this.cj_delivery.invoice_info(invoice_number);

        if (!cj_invoice) {
            throw new NotFoundError("유효하지 않은 송장 번호입니다");
        }
        return cj_invoice;
    }


    /**
     * Description placeholder
     * *CJ 송장의 추적 정보를 가져옴.
     * @async
     * @param {string} invoice_number 
     * @returns {Promise<DeliveryInfo[]>} 
     */
    async track_invoice(invoice_number: string): Promise<DeliveryInfo[]> {
        try {
            const cj_tracks = await this.cj_delivery.tracker_info(invoice_number);

            return cj_tracks;
        } catch (error) {
            throw new ValidationError(" qr코드 중 에러 발생");
        }
    }


    /**
       * * 주소 or 주소들을 좌표 or 좌표들로 변환
       * @param addresses 
       * @returns 
       */
    async trans_Coord(address: string | string[]): Promise<Coord | Coord[]> {

        const checked_address = Array.isArray(address) ? address : [address];

        const coords = await Promise.all(
            checked_address.map(async (address) => {
                const address_data = await this.public_map.change_address_to_coordinate(address);

                const coord = { latitude: address_data.response.result.point.y, longitude: address_data.response.result.point.x, address: address }

                return coord;
            })
        )
        return Array.isArray(address) ? coords : coords[0];
    }

    /**
     * Description placeholder
     * *CJ 주소를 터미널 주소를 DB로 얻어옴
     * @async
     * @param {string} terminal_code 
     * @returns {Promise<CJ_Terminal | null>} 
     */
    async get_cj_terminal_address(terminal_code: string): Promise<CJ_Terminal | null> {

        const address = await this.cj_terminal_repo.get_terminal(terminal_code);

        if (!address) {
            return null;
        }
        return address;
    }


    // //! 내 주소와 송장 주소가 100m 이상으로 크게 나서 폐기..
    // async save_my_invoice(partial_name: string, address: string, user_id: string) {

    //     // 송장 정보에서 부분적임 이름, 주소를 가져옴.
    //     // 송장주소를 좌표로 변환, 저장된 주소도 좌표로 변환
    //     // 첫글짜 이름이 포함되어 있고, 송장 주소와 저장된 주소의 좌표 사이가 1km이하이면 같은걸로

    //     const similiar_addresses = await this.address_service.find_similar_address(parseInt(user_id), partial_name);
    //     //유저 주소에서 유저아이디와 수신자 이름을 통해 이름이 비슷한 주소들을 가져옴.

    //     const extract_addresses = similiar_addresses.map(address => address.base_address);

    //     const user_Coord: Coord[] = await Promise.all(
    //         extract_addresses.map(async (address) => {
    //             return await this.change_address_to_Coord(address);
    //         }))
    //     // 유저의 주소들을 좌표로 변환

    //     const invoice_coord: Coord = await this.change_address_to_Coord(address);
    //     // 송장의 주소를 좌표로 변환


    //     // 유저의 주소 좌표들을 redis에 저장
    //     await this.redis_geo.store_redis_map(user_Coord, user_id, Invoice_TTL.user);

    //     //저장한 좌표들을 비교
    //     const search_radius = await this.redis_geo.search_places(invoice_coord, user_id, 100, 'm');

    //     if (search_radius?.length !== 0) { // 100m이내에 있으면
    //         search_radius?.length
    //     }

    //     // 저장한 좌표들을 비교 및 계산

    //     //similiar_address.map((address))

    // }


    /**
    * Description placeholder
    * * 출발지와 도착지 주소 추출
    * @async
    * @param {string} invoice_number 
    * @returns {Promise<string[]>} 
    */
    async get_depart_and_arrival_addresses(invoice_number: string): Promise<string[]> {
        // 1. 출발지와 도착지 주소 추출
        const cj_invoice = await this.find_invoice(invoice_number);

        const start_address = cj_invoice.sndrAddr.replace(/\*+/g, '');  // 출발지 주소
        const end_address = cj_invoice.rcvrAddr.replace(/\*+/g, '');

        const addresses = [start_address, end_address];
        return addresses;;
    }


    /**
 * Description placeholder
 * * 추적현황 추출 및 터미널 주소들 추출
 * @async
 * @param {string} invoice_number 
 * @returns {Promise<string[]>} 
 */
    async get_tracker_addresses(invoice_number: string): Promise<string[]> {
        // 2. 현재 추적현황 추출
        const cj_tracks = await this.track_invoice(invoice_number); // 추적 현황들 조회

        const terminal_code: string[] = cj_tracks.map((track) => track.branNm); //그 중에서 터미널 코드 추출

        const distinct_terminal_code = [...new Set(terminal_code)]; // 중복된 터미널 제거

        // 3. 추적 현황의 터미널 주소들 추출
        const terminal_addresses = await Promise.all( // 터미널 코드를 주소로 변환
            distinct_terminal_code.map(async (branNm) => {
                const result = await this.get_cj_terminal_address(branNm);
                return result?.address ? result.address : null; // 해당 주소가 없는 거는 전부 null로 바꿈
            })
        )
        const filtered_addresses = terminal_addresses.filter(address => address !== null);

        return filtered_addresses;
    }


    /**
     * Description placeholder
     * * 마커에 표시할 좌표들 정보 얻기
     * @async
     * @param {string} invoice_number 
     * @returns {Promise<Coord[]>} 
     */
    async get_coord(invoice_number: string): Promise<Coord | Coord[]> {

        // 1. 출발지와 도착지 주소 추출
        const d_and_a_address = await this.get_depart_and_arrival_addresses(invoice_number);

        // 2. 현재 추적현황 추출 
        // 3. 추적 현황의 터미널 주소들 추출
        const tracker_addresses = await this.get_tracker_addresses(invoice_number);

        // 4. 경로 완성
        const total_addresses: string[] = [d_and_a_address[0], ...tracker_addresses, d_and_a_address[d_and_a_address.length - 1]];

        // filtered_addresses.unshift(start_address); // 배열 제일 앞에 추가
        // filtered_addresses.push(end_address); // 배열 제일 뒤에 추가

        const coords: Coord | Coord[] = await this.trans_Coord(total_addresses);

        await this.redis_geo.store_redis_map(coords, invoice_number);

        return coords;
    }

    /**
     * Description placeholder
     * * qrcode를 만들고 s3에 업로드
     * @async
     * @param {string} invoice_numer 
     * @param {string} url 
     * @returns {Promise<string | null>} 
     */
    async get_qrcode_and_s3(url: string): Promise<string | null> {

        //파일을 조회 시 있으면 있던거 가져오고 없으면 업로드
        const file_name = `${url}.png`
        const qr_code_buffer = await QRCode.toBuffer(url, { type: 'png' });


        const old_etag = await this.aws_s3.get_s3_etag(file_name);

        if (old_etag) { // etag가 존재하면
            const result = await this.aws_s3.get_file_url(file_name);
            return result;
        }
        else { // etag가 존재하지 않으면
            await this.aws_s3.upload_file(file_name, qr_code_buffer);
            const result = this.aws_s3.get_file_url(file_name);
            return result;
        }
    }


    async create_my_invoice(user_id: number, invoice_number: string) {

        const key = this.CACHE_KEY(user_id);

        await this.redis.getClient().lRem(key, 0, invoice_number);
        // 중복 된 값이 있으면 제거하여 최신순으로 다시  넣기 위해

        await this.redis.getClient().lPush(key, invoice_number);
        // 왼쪽 부터 채워넣음 오래된게 오른쪽으로 밀려남

        await this.redis.getClient().lTrim(key, 0, this.MAX_CACHE_SIZE - 1);
        // 0(최신꺼 부터) 9(10개까지의) 인덱스만 남김

        await this.redis.getClient().expire(key, Invoice_TTL.my_invoice);
    }

    async find_my_invoice_list(user_id: number): Promise<string[]> {

        const key = this.CACHE_KEY(user_id);
        const cached_invoice_list = await this.redis.getClient().lRange(key, 0, -1);
        await this.redis.getClient().expire(key, Invoice_TTL.my_invoice);
        return cached_invoice_list;
    }
}

// async function tests(): Promise<void> {

//     const env = new EnvConfig();
//     const redis = new Redis(env);
//     await redis.initialize();
//     const a = new CJ_Delivery_Tracker();
//     const b = new PublicMapApi(env);
//     const db_options = new DatabaseConfig(env);

//     const db = new Database(db_options);
//     await db.initialize();
//     const c = new CJ_TerminalRepository(db);
//     const d = new AddressRepository(db);


//     console.log(await d.read_one({ id: 11 }));

//     const test = new Delivery_Tracker(a, b, c, redis);
//     console.log(await test.tracker_coord('595320445933'));
//     console.log(await test.track_invoice('595320445933'));
// }

//tests();


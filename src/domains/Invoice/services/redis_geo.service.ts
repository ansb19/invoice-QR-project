import { Redis } from "@/common/services/redis.service";
import { Inject, Service } from "typedi";
import { Coord } from "./delivery_tracker.service";
import { GeoReplyWith, } from "redis";
import { EnvConfig } from "@/config/env.config";
import "reflect-metadata";
import { TTL_Time } from "@/common/utils/enum.control";

export type GeoUnits = 'm' | 'km' | 'mi' | 'ft';



@Service()
export class Redis_Geo {
    constructor(@Inject(() => Redis) private redis: Redis,
    ) { }

    /**
     * 좌표 데이터 저장 
     * @param coords 좌표 및 주소 (member)
     * @param keyword // 그룹화 시킬 키워드 (key)
     * @param TTL 유효 시간 설정 // 기본값 1일
     */
    async store_redis_map(coords: Coord[] | Coord, keyword: string, TTL: TTL_Time = TTL_Time.Invoice_TTL): Promise<void> {

        const coords_array = Array.isArray(coords) ? coords : [coords];

        await Promise.all(
            coords_array.map(async (address) => {
                await this.redis.getClient().geoAdd(keyword, {
                    longitude: address.longitude,
                    latitude: address.latitude,
                    member: address.address!,
                })

            })

        )
        await this.redis.getClient().expire(keyword, TTL);

        //const JsonfromString = JSON.stringify(coords);;
        //await this.redis.set(keyword, JsonfromString, TTL);
        //30일 동안 주소 데이터 저장
    }



    /**
     * Description placeholder
     * 두 지점 사이 거리 계산
     * @async
     * @param {string} member_a 
     * @param {string} member_b 
     * @param {string} key 
     * @param {string} [scale='km']  km, m, ft, mi
     * @returns {*} 
     */
    async compare_a_and_b(member_a: string, member_b: string, key: string, unit: GeoUnits = 'km') {

        const distance = await this.redis.getClient().geoDist(key, member_a, member_b, unit);

        return distance;
    }


    /**
     * Description placeholder
     * 한 좌표(멤버) 주변으로 해당 key의 주변들 조회
     * @async
     * @param {string} coords 
     * @param {string} keyword 
     * @returns {unknown} 
     */
    async search_places(coord: Coord, keyword: string, radius: number, unit: GeoUnits = 'km') {

        try {
            const find_places = await this.redis.getClient().geoSearchWith(
                keyword,
                coord.address!, // 좌표 방식 { longitude: coord.longitude, latitude: coord.latitude }   / 멤버 방식 member(string) 으로 해도됨  
                {
                    radius: radius,
                    unit: unit,
                },
                [GeoReplyWith.DISTANCE, GeoReplyWith.COORDINATES],
                { SORT: 'DESC' }

            )

            return find_places;
        } catch (error) {
            console.error("redis geo 조회 오류", error);
        }

    }
}

// async function test() {
//     const env = new EnvConfig();
//     const redis = new Redis(env);
//     await redis.initialize();
//     const redis_geo = new Redis_Geo(redis);

//     const coords: Coord[] = [
//         { longitude: 126.561859969497, latitude: 35.9631736996083, address: '전북특별자치도 군산시 오식도동' },
//         { longitude: 127.407882024969, latitude: 36.4493221444408, address: '대전 대덕구 대덕대로1447번길 39' },
//         { longitude: 129.015383356684, latitude: 35.3090309496062, address: '경상남도 양산시 제방로 225' },
//         { longitude: 129.094393211891, latitude: 35.2310657179788, address: '부산광역시 금정구 부곡로168번길' },
//     ]

//     const coord: Coord = { longitude: 129.093316942845, latitude: 35.2306487291897, address: '부산 금정구 부곡동 264-26 (관운사)' };



//     await redis_geo.store_redis_map(coords, '595320445933');


//     const place = await redis_geo.search_places(coord, "595320445933", 300, 'm');

//     if (place?.length !== 0)
//         console.log(place);
//     else {
//         console.log("빈값");
//     }
// }

// test();

// 가까운순으로 배열
// [
//     {
//       member: '전북특별자치도 군산시 오식도동',
//       distance: '0.0000',
//       coordinates: {
//         longitude: '126.56185895204544067',
//         latitude: '35.96317257583203997'
//       }
//     }
//   ]
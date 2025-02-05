import { BaseRepository } from "@/common/abstract/base.repository";
import { Inject, Service } from "typedi";
import { DeliveryItem } from "../entities/delivery_item.entity";
import { Database } from "@/config/database/Database";


@Service()
export class DeliveryItemRepository extends BaseRepository<DeliveryItem> {
    constructor(@Inject(() => Database) readonly database: Database) {
        super(DeliveryItem, database);
    }

    
}
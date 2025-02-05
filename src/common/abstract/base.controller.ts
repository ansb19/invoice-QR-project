import { Post } from "routing-controllers";


export abstract class BaseController<T>{
    private items: T[] = [];

    @Post()
}
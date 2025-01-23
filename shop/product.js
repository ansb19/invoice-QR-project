export class PRODUCT {
    #product_number; //제품 번호 pk
    #product_name; // 제품 이름
    #product_stock; //제품 재고 갯수
    #product_price; // 제품 가격
    #product_type; //제품 타입
    #product_manufacturer; // 제품 제조사 fk
    
    get product_number() {
        return this.#product_number;
      }
    
      set product_number(value) {
        this.#product_number = value;
      }
    
      get product_name() {
        return this.#product_name;
      }
    
      set product_name(value) {
        this.#product_name = value;
      }
    
      get product_stock() {
        return this.#product_stock;
      }
    
      set product_stock(value) {
        this.#product_stock = value;
      }
    
      get product_price() {
        return this.#product_price;
      }
    
      set product_price(value) {
        this.#product_price = value;
      }
    
      get product_type() {
        return this.#product_type;
      }
    
      set product_type(value) {
        this.#product_type = value;
      }
    
      get product_manufacturer() {
        return this.#product_manufacturer;
      }
    
      set product_manufacturer(value) {
        this.#product_manufacturer = value;
      }
}
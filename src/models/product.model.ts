export interface Complement{
    id: string;
    abreviatura: string;
    valor: number;
}
export default interface Product {
    // class Product {
        id: string;
        nombre: string;
        categoria: string;
        valor: number;
        abreviatura?: string;
        complementos?: Complement [];
        complemento?: boolean;
        favorito?: boolean;
        cantidad?: number;
        llevar?: boolean;
}

export interface ProductBill{
    id: string;
    cantidad: number;
    productoId: string;
    complementos?: string [];
    llevar?: boolean;
    billId?: string;
}
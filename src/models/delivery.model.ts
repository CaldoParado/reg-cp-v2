import type Bill from "./bill.model";

export default interface Delivery extends Bill{
    envio: number;
    domiciliario: string | null;
    direccion: string | null;
    estado: string;
    created: string;
}
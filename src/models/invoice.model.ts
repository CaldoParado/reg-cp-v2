import type Bill from "./bill.model";

export default interface Invoice extends Bill{
    mesero: string | null;
    mesa: string | null;
    estado: string;
}
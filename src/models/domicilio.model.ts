export default interface Domicilio {
    id: string;
    valor: number;
    domiciliario: string;
    cajero: string | null;
    estado: string;
    created: string;
    metodo_pago: string;
    envio: number;
}
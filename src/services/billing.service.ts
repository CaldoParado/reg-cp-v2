import pb from "./pb.service";

import type Product from "../models/product.model";
import type Employee from "../models/employee.model";
import type Bill from "../models/bill.model";
import { collections } from "./db.service";
import type Delivery from "../models/delivery.model";
import type { ProductBill } from "../models/product.model";
import type Invoice from "../models/invoice.model";

// export async function getBillById(collection: string, id: string): Promise<Bill> {
export async function getBillById(id: string): Promise<Bill> {
    let tid = id.replace("\'", '-');
    return pb.collection(collections.cuenta).getOne<Bill>(tid);
}

export async function getDeliveryById(id: string): Promise<Delivery> {
    let tid = id.replace("\'", '-');
    return pb.collection(collections.domicilio).getOne<Delivery>(tid, { $autoCancel: false });
}

export async function getInvoiceById(id: string): Promise<Invoice> {
    let tid = id.replace("\'", '-');
    return pb.collection(collections.cuenta).getOne<Invoice>(tid, { $autoCancel: false });
}

export async function getProdsByBillId(billId: string): Promise<ProductBill[]> {
    let tid = billId.replace("\'", '-');
    // return pb.collection('producto_factura').getFullList<ProductBill>(100, {
    return pb.collection(collections.prods_factura).getFullList<ProductBill>(100, {
        filter: `facturaId='${billId}'`,
        //  'facturaId="' + billId + '"',
        $autoCancel: false
    });
}
export async function getDeliveryProdsByBillId(billId: string): Promise<ProductBill[]> {
    let tid = billId.replace("\'", '-');
    // return pb.collection('producto_factura').getFullList<ProductBill>(100, {
    return pb.collection(collections.prods_domicilio).getFullList<ProductBill>(100, {
        filter: `domicilioId='${billId}'`,
        //  'facturaId="' + billId + '"',
        $autoCancel: false
    });
}

export async function getInvoiceProdsByBillId(billId: string): Promise<ProductBill[]> {
    let tid = billId.replace("\'", '-');
    // return pb.collection('producto_factura').getFullList<ProductBill>(100, {
    return pb.collection(collections.prods_cuenta).getFullList<ProductBill>(100, {
        filter: `cuentaId='${billId}'`,
        //  'facturaId="' + billId + '"',
        $autoCancel: false
    });
}
export async function payDom(id: string, domiciliario: string): Promise<void> {
    return pb.collection(collections.domicilio).update(id, {
        domiciliario: domiciliario,
        estado:'cerrado',
    });
}

export async function payBill(bill: Product[], total: number, metodo_pago: string, cashier: Employee, date: number): Promise<Record<any, any>> {
    const data = {
        "id": "f-" + date.toString(),
        "cajero": cashier.id,
        "valor": total,
        "metodo_pago": metodo_pago,
    };

    const mp = (id: string, p: Product)=>{
        return {
            "facturaId": id,
            "productoId": p.id,
            "cantidad": p.cantidad,
            "complementos": p.complementos?.map(c => c.id),
            "llevar": p.llevar
        }
    }
    return addInvoiceProds(collections.factura, collections.prods_factura, data, mp, bill);
}

export async function addDelivery(bill: Product[], total: number, domiciliario: string, cashier: Employee, metodo_pago: string, date: number) {
    const data = {
        "id": "d-" + date.toString(),
        "ubicacion": "",
        "domiciliario": domiciliario,
        "valor": total,
        "estado": "abierto",
        "cajero": cashier.id,
        "telefono": 0,
        "envio": bill[0].valor,
        "metodo_pago": metodo_pago,
    };
    const mp = (id: string, p: Product)=>{
        return {
            "domicilioId": id,
            "productoId": p.id,
            "cantidad": p.cantidad,
            "complementos": p.complementos?.map(c => c.id),
            "llevar": p.llevar,
        }
    }
    return addInvoiceProds(collections.domicilio, collections.prods_domicilio, data, mp, bill);
}

export async function assign_dom(id: string, domiciliario: string): Promise<void> {
    return pb.collection(collections.domicilio).update(id, {
        domiciliario: domiciliario,
    });
}

async function addInvoiceProds(collection: string, subcoll: string, data: object, prodMapper: Function, bill: Product[]){
    return pb.collection(collection).create(data).then(rec => {
        bill.forEach((p: Product) => {
            if (p.categoria !== "envio")
                pb.collection(subcoll)
                    .create(prodMapper(rec.id, p), { "$autoCancel": false });
        });
        return rec;
    });
}
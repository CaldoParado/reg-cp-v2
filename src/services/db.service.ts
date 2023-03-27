import pb from "./pb.service";

import type Product from "../models/product.model";
import { employees, products } from "./stores.service";
import type Employee from "../models/employee.model";

export const collections = {
    empleado: 'empleado',
    producto: 'producto',
    domicilio: 'domicilio',
    cuenta: 'cuenta',
    factura: 'factura',
    prods_domicilio: 'producto_domicilio',
    prods_cuenta: 'producto_cuenta',
    prods_factura: 'producto_factura'
}

export function loadEmployees(){
    pb.collection("empleado")
    .getFullList<Employee>(200 /* batch size */, {
        sort: "-created",
        filter: "activo = True",
    })
    .then((recs) => {
        employees.set(recs);
    });
}

export async function getProducts(): Promise<Product[]> {
    return pb.collection('producto').getFullList<Product>(100 /* batch size */, {
        sort: 'codigo',
    }).then(prods => {
        try {
            products.set(prods);
            return prods;
        } catch {
            return [];
        }
    });
}
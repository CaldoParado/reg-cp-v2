import type Bill from "../models/bill.model";
import type Delivery from "../models/delivery.model";
import { collections } from "./db.service";
import pb from "./pb.service";


export async function loadBalance(d1: string, d2: string): Promise<Bill[]> {
    // let f = `created >= "${d1.toISOString().replace("T", " ").replace("Z", "")}" && created <= "${d2.toISOString().replace("T", " ").replace("Z", "")}"`;
    let f = `created >= "${d1}" && created <= "${d2}"`;
    return pb.collection(collections.factura)
        .getFullList<Bill>(1500 /* batch size */, {
            filter: f,
            $autoCancel: false,
            sort: "-created",
        });
}

export function loadBalanceDoms(d1: string, d2: string): Promise<Delivery[]> {
    // let date: string = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-1).toISOString();
    // let f = `created >= "${d1.toISOString().replace("T", " ").replace("Z", "")}" && created <= "${d2.toISOString().replace("T", " ").replace("Z", "")}"`;
    let f = `created >= "${d1}" && created <= "${d2}"`;

    return pb.collection(collections.domicilio)
        .getFullList<Delivery>(1500 /* batch size */, {
            // filter: `created >= '${date}'`,
            // filter: `created >= "${date.replace("T", " ").replace("Z", "")}"`,
            filter: f,
            $autoCancel: false,
            sort: "-created",
        });
}

// export async function loadPendingBalanceDoms(d1: Date): Promise<number> {
//     // let date: string = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()-1).toISOString();
//     let total = pb.collection(collections.domicilio)
//         .getFullList(100 /* batch size */, {
//             // filter: `created >= '${date}'`,
//             filter: `created >= "${d1.toISOString().replace("T", " ").replace("Z", "")}" && estado = "abierto" && envio > 0`,
//             $autoCancel: false,
//             sort: "-created",
//         }).then((bs) => {
//             console.log(bs);
//             let total = 0;
//             bs.forEach((b) => {
//                 total += b.valor;
//             });
//             return total;
//         });
//     return total;
// }
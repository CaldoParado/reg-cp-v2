
import pb from "./pb.service";
import type Delivery from "../models/delivery.model";

export async function getActiveDoms() {
    return (await pb.collection('domicilio').getList<Delivery>(1, 20, { filter: "estado!='cerrado'", })).items;
}
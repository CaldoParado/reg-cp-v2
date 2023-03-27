import {writable} from 'svelte/store';
import type Employee from '../models/employee.model';
import type Product from '../models/product.model';

// export const auth = writable({} as any);
export const authUser = writable({} as any);

export const loadedDom = writable("");
export const loadedInv = writable("");

export const products = writable([] as Product[]);
export const employees = writable([] as Employee[]);

export const bill = writable([] as Product[]);
export let cantidad = writable(0);
export let valor = writable(0);

export let domiciliario = writable({
    id: "",
    activo: true,
    nombre: "Domiciliario",
    apellido: "",
    cargos: [],
} as Employee);

export const cashier = writable({
    nombre: 'Cajero',
} as Employee);

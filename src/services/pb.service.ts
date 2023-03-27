import PocketBase from "pocketbase";

const URI =
    // 'http://192.168.0.4';
'http://127.0.0.1:8090';
// 'http://192.168.10.157';

const  pb = new PocketBase(URI);

export default pb;
import boschClient from "./boschClient";

async function main() {
    const services = await boschClient.fetchServices();
    console.log(services)
}
main()
import boschClient from "./boschClient";

async function main() {
  const services = await boschClient.fetchServices();
  console.log(services.filter(s => s.id === 'TemperatureLevel'))
}

main().catch((err: any) => {
  console.error(err)
  process.exit(1)
})
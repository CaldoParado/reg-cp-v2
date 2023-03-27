

export function formatValue(value: number): string {
  return Intl.NumberFormat('co-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 1, minimumFractionDigits: 0, currencyDisplay: 'narrowSymbol' }).format(value);
}

export function showModal(id: string) {
  document.getElementById(id)?.classList.add("is-visible");
}
export function hideModal(id: string) {
  document.getElementById(id)?.classList.remove("is-visible");
}

export function lrslide(a: any) {
  return {
    duration: 120,
    css: (t: any, u: any) => `transform: translateX(${u * -75}%)`
  };
}
export function rlslide(a: any) {
  return {
    duration: 120,
    css: (t: any, u: any) => `transform: translateX(${u * 75}%)`
  };
}

export function formatDate(time: Date): string {

  let options: Object = {
    // year: 'numeric', 
    month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
    // second: 'numeric',
    hour12: true,
    // timeZone: 'America/New_York'
  };

  return Intl.DateTimeFormat('es-CO', options).format(time);
}

export function formatTime(time: Date): string {

  let options: Object = {
    // year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
    //  second: 'numeric',
    // hour12: true,
    // timeZone: 'America/New_York'
  };

  return Intl.DateTimeFormat('de-DE', options).format(time);
}

export function showTime(): void {

  let date: Date = new Date();

  let time: string = formatTime(date);
  if (document.getElementById("clock") !== null) {
    document.getElementById("clock")!.innerText = time;
    document.getElementById("clock")!.textContent = time;
  }
  setTimeout(showTime, 30000);
}

export function stringToColour(str: string): string {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + 1 + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}
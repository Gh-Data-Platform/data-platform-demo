
const haltungDatenPrint = document.querySelector("#haltungDatenblattPrintId");
console.log(haltungDatenPrint);
haltungDatenPrint.addEventListener("click", ()=>{
    window.print();
})
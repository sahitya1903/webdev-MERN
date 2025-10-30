console.log("Hello World!");
console.log("Apna College");

let a=5;
let b=10;
console.log("Sum is:",(a+b));


let pencilPrice=10;
let eraserPrice=6;
// let output="Total Price:"+(pencilPrice+eraserPrice)+ " Rupees."
let output=`Total Price: ${pencilPrice+eraserPrice} rupees.` //Template literal : $
console.log(output);

let c=10;
console.log(c++); //10
console.log(++c); //12

let name="Sahitya";
let age=21;
if(age>=21){
    console.log(`Welcome, ${name}.`);
    console.log("You can marry and vote")
}
else if(age>=18){
    console.log(`Welcome, ${name}.`);
    console.log("You can vote, but can't marry.")
}
else{
    console.log(`Welcome, ${name}.`);
    console.log("You can't vote or marry")
}
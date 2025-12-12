//JS Basics

console.log("Hello World!");
console.log("Apna College");

let a = 5;
let b = 10;
console.log("Sum is:", (a + b));


let pencilPrice = 10;
let eraserPrice = 6;
// let output="Total Price:"+(pencilPrice+eraserPrice)+ " Rupees."
let output = `Total Price: ${pencilPrice + eraserPrice} rupees.` //Template literal : $
console.log(output);

let c = 10;
console.log(c++); //10
console.log(++c); //12

let name = "Sahitya";
let age = 21;
if (age >= 21) {
    console.log(`Welcome, ${name}.`);
    console.log("You can marry and vote")
}
else if (age >= 18 && age < 21) {
    console.log(`Welcome, ${name}.`);
    console.log("You can vote, but can't marry.")
}
else {
    console.log(`Welcome, ${name}.`);
    console.log("You can't vote or marry")
}


let str = "apple";
if (str.length > 3 && str[0] === "a") {
    console.log("Good String")
} else {
    console.log("Bad String")
}


let color = "red";
switch (color) {
    case "red":
        console.log("Stop");
        break;
    case "yellow":
        console.log("Wait");
        break;
    case "green":
        console.log("Go");
        break;
    default:
        break;
}


let day = 2;
switch (day) {
    case 1:
        console.log("Monday");
        break;
    case 2:
        console.log("Tuesday");
        break;
    case 3:
        console.log("Wednesday");
        break;
    case 4:
        console.log("Thursday");
        break;
    case 5:
        console.log("Friday");
        break;
    case 6:
        console.log("Saturday");
        break;
    case 7:
        console.log("Sunday");
        break;
    default:
        console.log("Invalid choice");
}


console.log("Normal Message");
console.error("Error Message");
console.warn("Warning Message");

// alert("Danger");

// let fname= prompt("Enter your Name:");
// console.log(fname);
// alert(`Welcome, ${fname}!`);


let msg = "     Sahitya    ";
let s = "IloveCoding";
console.log(msg.trim());
console.log(msg.toLowerCase());
console.log(msg.toUpperCase());
console.log(msg.trim().toUpperCase());
console.log(s.indexOf("a"));
console.log(s.indexOf("ov"));
console.log(s.slice(5));
console.log(s.slice(1, 5));
console.log(s.slice(-5, -1));

console.log(s.replace("o", "O"));
console.log(s.replace("love", "LOVE"));
console.log(s.repeat(2));


let n = "ApnaCollege";
let o= n.slice(4).replace("l", "t").replace("l", "t");
console.log(o);